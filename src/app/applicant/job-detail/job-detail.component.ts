import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { JobPost } from '../../core/models/job-post.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { JobCategoryService } from '../../core/services/job-category.service';
import { JobCategory } from '../../core/models/job-category.model';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit, OnDestroy {
  jobId: number | null = null;
  jobPost: JobPost | null = null;
  applicationForm: FormGroup;
  currentUser: User | null = null;
  isApplying: boolean = false;
  hasApplied: boolean = false;
  availableCategories: JobCategory[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private messageService: MessageService,
    private jobCategoryService: JobCategoryService
  ) {
    this.applicationForm = this.fb.group({
      cover_letter: [''],
      resume_link: ['', Validators.pattern('https?://.+')],
      expected_salary: [null, [Validators.min(0)]],
      available_start_date: [null],
      additional_notes: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      map(params => Number(params.get('id'))),
      switchMap(id => forkJoin({
        jobPost: this.jobService.getJobPostById(id),
        categories: this.jobCategoryService.getJobCategories()
      }))
    ).subscribe({
      next: ({ jobPost, categories }) => {
        this.jobId = jobPost.id;
        this.jobPost = jobPost;
        this.availableCategories = categories;
        this.checkIfAlreadyApplied();
        console.log('Detalle de la oferta de empleo y categorías cargados:', this.jobPost);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar el detalle de la oferta de empleo o categorías:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la oferta de empleo.' });
        this.router.navigate(['/applicant/dashboard']);
      }
    });
  }

  checkIfAlreadyApplied(): void {
    if (this.currentUser && this.jobId) {
      this.applicationService.checkIfApplied(this.jobId, this.currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((applied: boolean) => {
          this.hasApplied = applied;
        });
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

  onSubmitApplication(): void {
    if (this.applicationForm.valid && this.jobId && this.currentUser) {
      this.isApplying = true;
      const formValue = this.applicationForm.value;

      if (!formValue.resume_link) {
        formValue.resume_link = `http://example.com/resumes/${this.currentUser.username}_cv_${new Date().getTime()}.pdf`;
        this.messageService.add({ severity: 'info', summary: 'CV Simulado', detail: 'Se ha generado una URL ficticia para tu CV.' });
      }
      
      const rawDate = new Date(formValue.available_start_date ?? new Date());
      const formattedDate = rawDate.toISOString().split('T')[0];

      const applicationPayload = {
        job_id: this.jobId,
        cover_letter: formValue.cover_letter,
        resume_link: formValue.resume_link,
        expected_salary: formValue.expected_salary,
        available_start_date: formattedDate,
        additional_notes: formValue.additional_notes
      };

      this.applicationService.createApplication(applicationPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.message });
            this.hasApplied = true;
            this.isApplying = false;
            this.router.navigate(['/applicant/applications']);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al enviar la aplicación:', err);
            let errorMessage = 'Error al enviar la aplicación.';
            if (err.error && typeof err.error === 'object') {
              errorMessage = Object.values(err.error).flat().join(' ');
            } else if (err.error && err.error.message) {
              errorMessage = err.error.message;
            }
            this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
            this.isApplying = false;
          }
        });
    } else {
      this.applicationForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, completa todos los campos requeridos.' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
