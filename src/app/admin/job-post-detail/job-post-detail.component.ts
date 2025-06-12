import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { JobPost } from '../../core/models/job-post.model';
import { Application, ApplicationStatus } from '../../core/models/application.model';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Skill } from '../../core/models/skill.model';
import { MessageService } from 'primeng/api';
import { JobCategoryService } from '../../core/services/job-category.service';
import { JobCategory } from '../../core/models/job-category.model';
import { map, filter, switchMap } from 'rxjs/operators'; // Importar operadores de RxJS

@Component({
  selector: 'app-job-post-detail',
  templateUrl: './job-post-detail.component.html',
  styleUrls: ['./job-post-detail.component.scss'],
  providers: [MessageService]
})
export class JobPostDetailComponent implements OnInit, OnDestroy {
  jobPost: JobPost | undefined;
  applicants: Application[] = [];
  applicationStatuses: ApplicationStatus[] = [
    'pending',
    'reviewing',
    'shortlisted',
    'interview_scheduled',
    'rejected',
    'accepted',
    'withdrawn'
  ];

  displayApplicationDetailModal: boolean = false;
  selectedApplication: Application | undefined;
  newApplicationStatus: ApplicationStatus | undefined;
  reviewNotes: string | undefined;
  availableCategories: JobCategory[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private messageService: MessageService,
    private jobCategoryService: JobCategoryService
  ) { }

  ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  if (isNaN(id)) {
    console.error('ID inválido en la URL');
    this.router.navigate(['/admin/dashboard']);
    return;
  }

  forkJoin({
    jobPost: this.jobService.getJobPostById(id),
    categories: this.jobCategoryService.getJobCategories()
  })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: ({ jobPost, categories }) => {
      
      this.jobPost = jobPost;
      this.availableCategories = categories;
      this.loadApplicants(this.jobPost.id);
    },
    error: (err) => {
      console.error('Error al cargar la oferta de empleo o categorías:', err);
      this.router.navigate(['/admin/dashboard']);
    }
  });
}

  loadApplicants(jobPostId: number): void {
    this.applicationService.getApplicationsByJobPost(jobPostId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(apps => {
        this.applicants = apps.map(app => {
          const affinity = this.calculateAffinity(this.jobPost?.skills || [], app.user_profile?.skills || []);
          return { ...app, affinity: affinity };
        });
      });
  }

  calculateAffinity(jobSkills: Skill[], applicantSkills: Skill[]): number {
    if (!jobSkills || jobSkills.length === 0) {
      return 100;
    }

    const jobSkillNames = new Set(jobSkills.map(s => s.name.toLowerCase()));
    const applicantSkillNames = new Set(applicantSkills.map(s => s.name.toLowerCase()));

    let matchedSkills = 0;
    jobSkillNames.forEach(skill => {
      if (applicantSkillNames.has(skill)) {
        matchedSkills++;
      }
    });

    return (matchedSkills / jobSkillNames.size) * 100;
  }

  getAffinityColor(affinity: number): string {
    if (affinity >= 85) {
      return 'success';
    } else if (affinity >= 70) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  getStatusSeverity(status: ApplicationStatus): string {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'info';
      case 'reviewing':
        return 'warning';
      case 'shortlisted':
        return 'success';
      case 'interview_scheduled':
        return 'info';
      case 'withdrawn':
        return 'secondary';
      default:
        return 'info';
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case 'pending':
        return 'pi pi-clock';
      case 'reviewing':
        return 'pi pi-search';
      case 'shortlisted':
        return 'pi pi-star';
      case 'interview_scheduled':
        return 'pi pi-calendar';
      case 'rejected':
        return 'pi pi-times-circle';
      case 'accepted':
        return 'pi pi-check-circle';
      case 'withdrawn':
        return 'pi pi-minus-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  getCategoryName(category: JobCategory | number): string {
    if (typeof category === 'object' && category !== null) {
      return category.name;
    } else if (typeof category === 'number') {
      const foundCategory = this.availableCategories.find(cat => cat.id === category);
      return foundCategory ? foundCategory.name : 'N/A';
    }
    return 'N/A';
  }

  showApplicationDetail(application: Application): void {
    this.selectedApplication = application;
    this.newApplicationStatus = application.status;
    this.reviewNotes = undefined;
    this.displayApplicationDetailModal = true;
  }

  updateApplicationStatusInModal(): void {
    if (this.selectedApplication && this.newApplicationStatus) {
      const currentApplicationId = this.selectedApplication.id;
      const payload = {
        status: this.newApplicationStatus,
        review_notes: this.reviewNotes || ''
      };

      this.applicationService.updateApplicationStatus(currentApplicationId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedApp) => {
            const index = this.applicants.findIndex(app => app.id === updatedApp.id);
            if (index !== -1) {
              this.applicants[index] = { ...updatedApp, affinity: this.applicants[index].affinity };
            }
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado de la postulación actualizado.' });
            this.displayApplicationDetailModal = false;
            this.loadApplicants(this.jobPost!.id);
          },
          error: (err) => {
            console.error('Error al actualizar el estado de la postulación:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado de la postulación.' });
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
