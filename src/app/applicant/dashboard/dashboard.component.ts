import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobPost } from '../../core/models/job-post.model';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ApplicationService } from '../../core/services/application.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { JobCategoryService } from '../../core/services/job-category.service';
import { JobCategory } from '../../core/models/job-category.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  jobPosts: JobPost[] = [];
  filteredJobPosts: JobPost[] = [];
  currentUser: User | null = null;
  sortOptions: any[] = [];
  selectedSortOption: any;
  availableCategories: JobCategory[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private applicationService: ApplicationService,
    private router: Router,
    private jobCategoryService: JobCategoryService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.loadJobPostsAndCategories();
      });

    this.sortOptions = [
      { label: 'Ordenar por Afinidad', value: 'affinity' },
      { label: 'Ordenar por Fecha (más reciente)', value: 'date-desc' }
    ];
  }

  loadJobPostsAndCategories(): void {
    forkJoin({
      jobPosts: this.jobService.getJobPosts(),
      categories: this.jobCategoryService.getJobCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ jobPosts, categories }) => {
        this.jobPosts = jobPosts;
        this.availableCategories = categories;
        this.applyFilterAndSort();
      },
      error: (err) => {
        console.error('Error al cargar ofertas de empleo o categorías:', err);
      }
    });
  }

  applyFilterAndSort(): void {
    this.filteredJobPosts = [...this.jobPosts];
    if (this.selectedSortOption?.value === 'affinity' && this.currentUser?.profile?.role === 'applicant') {
      this.filteredJobPosts.sort((a, b) => {
        const affinityA = a.matching_skills_count ?? -1;
        const affinityB = b.matching_skills_count ?? -1;

        if (affinityA !== affinityB) {
          return affinityB - affinityA;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else if (this.selectedSortOption?.value === 'date-desc') {
      this.filteredJobPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }

  onSortChange(event: any): void {
    this.selectedSortOption = event.value;
    this.applyFilterAndSort();
  }

  calculateAffinity(jobPost: JobPost): number {
    if (!this.currentUser || !this.currentUser.profile || !this.currentUser.profile.skills || this.currentUser.profile.skills.length === 0) {
      return 0;
    }

    const userSkillIds = new Set(this.currentUser.profile.skills.map(s => s.id));
    const jobRequiredSkills = jobPost.skills || [];

    if (jobRequiredSkills.length === 0) {
      return 100;
    }

    let matchingSkillsCount = 0;
    for (const skill of jobRequiredSkills) {
      if (userSkillIds.has(skill.id)) {
        matchingSkillsCount++;
      }
    }

    const affinityPercentage = (matchingSkillsCount / jobRequiredSkills.length) * 100;
    return Math.round(affinityPercentage);
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

  applyForJob(jobPost: JobPost): void {
    this.router.navigate(['/applicant/jobs', jobPost.id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
