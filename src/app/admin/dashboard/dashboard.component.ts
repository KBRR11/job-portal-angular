import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobPost } from '../../core/models/job-post.model';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { Application } from '../../core/models/application.model';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  jobPosts: JobPost[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadJobPosts();
  }

  loadJobPosts(): void {
    this.jobService.getJobPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.jobPosts = posts;
        // La lógica de carga de aplicantes se ha movido a la vista de detalle del trabajo
        // o se manejará de otra manera si es necesario en el futuro.
      });
  }

  // Métodos relacionados con aplicantes eliminados de esta vista
  // getApplicantAvatars(jobPost: JobPost): Application[] { ... }
  // getRemainingApplicantsCount(jobPost: JobPost): number { ... }

  navigateToCreateJobPost(): void {
    this.router.navigate(['/admin/job-posts/new']);
  }

  navigateToJobPostDetail(jobId: number): void {
    this.router.navigate(['/admin/job-posts', jobId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
