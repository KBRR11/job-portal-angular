import { Component, OnInit, OnDestroy } from '@angular/core';
import { Application, ApplicationStatus } from '../../core/models/application.model';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { JobCategoryService } from '../../core/services/job-category.service';
import { JobCategory } from '../../core/models/job-category.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  applications: Application[] = [];
  currentUser: User | null = null;
  availableCategories: JobCategory[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private router: Router,
    private jobCategoryService: JobCategoryService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (this.currentUser) {
          this.loadApplicationsAndCategories(this.currentUser.id);
        }
      });
  }

  loadApplicationsAndCategories(applicantId: number): void {
    forkJoin({
      applications: this.applicationService.getApplicationsByApplicant(applicantId),
      categories: this.jobCategoryService.getJobCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ applications, categories }) => {
        this.applications = applications;
        this.availableCategories = categories;
      },
      error: (err) => {
        console.error('Error al cargar postulaciones o categorías:', err);
      }
    });
  }

  getStatusSeverity(status: ApplicationStatus): string {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'info';
      case 'reviewing': return 'warning';
      case 'shortlisted': return 'warning';
      case 'interview_scheduled': return 'warning';
      case 'withdrawn': return 'secondary';
      default: return 'info';
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

  viewApplicationDetail(applicationId: number): void {
    this.router.navigate(['/applicant/applications', applicationId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
