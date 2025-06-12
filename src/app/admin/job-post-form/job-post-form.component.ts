import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { JobPost } from '../../core/models/job-post.model';
import { User } from '../../core/models/user.model';
import { Skill } from '../../core/models/skill.model'; // Import Skill
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { forkJoin } from 'rxjs'; // Import forkJoin
import { map } from 'rxjs/operators'; // Import map
import { SkillService } from '../../core/services/skill.service'; // Import SkillService
import { JobCategoryService } from '../../core/services/job-category.service'; // Import JobCategoryService
import { JobCategory } from '../../core/models/job-category.model'; // Import JobCategory

@Component({
  selector: 'app-job-post-form',
  templateUrl: './job-post-form.component.html',
  styleUrls: ['./job-post-form.component.scss']
})
export class JobPostFormComponent implements OnInit, OnDestroy {
  jobPostForm!: FormGroup;
  isEditMode: boolean = false;
  jobPostId: number | null = null;
  currentUser: User | null = null;
  availableSkills: Skill[] = []; // Change to Skill[]
  filteredSkills: Skill[] = []; // Change to Skill[]
  availableCategories: JobCategory[] = []; // Add availableCategories

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private skillService: SkillService, // Inject SkillService
    private jobCategoryService: JobCategoryService // Inject JobCategoryService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Initialize form immediately with default values
    this.initForm();

    // Load skills and categories
    forkJoin({
      skills: this.skillService.getSkills(),
      categories: this.jobCategoryService.getJobCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe(({ skills, categories }) => {
      this.availableSkills = skills;
      this.availableCategories = categories;
      
      const idParam = this.route.snapshot.paramMap.get('id');
      this.jobPostId = idParam ? Number(idParam) : null;
      this.isEditMode = this.jobPostId !== null;

      if (this.isEditMode && this.jobPostId !== null) {
        this.jobService.getJobPostById(this.jobPostId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (jobPost) => {
              this.jobPostForm.patchValue({
                title: jobPost.title,
                description: jobPost.description,
                requirements: jobPost.requirements,
                location: jobPost.location,
                category: (jobPost.category as JobCategory).id, // Asegurarse de que se parchee el ID
                employment_type: jobPost.employment_type,
                experience_level: jobPost.experience_level,
                salary_min: jobPost.salary_min,
                salary_max: jobPost.salary_max,
                salary_currency: jobPost.salary_currency,
                status: jobPost.status,
                deadline: jobPost.deadline ? new Date(jobPost.deadline) : null,
              });
              this.jobPostForm.get('skills')?.setValue(jobPost.skills.map(s => s.id));
            },
            error: (err) => {
              console.error('Error al cargar la oferta de empleo para editar:', err);
              this.router.navigate(['/admin/dashboard']);
            }
          });
      }
    });
  }

  initForm(): void {
    this.jobPostForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      requirements: ['', Validators.required], // Add requirements
      location: ['', Validators.required],
      category: ['', Validators.required], // Will hold category ID
      employment_type: ['full_time', Validators.required], // Add employment_type
      experience_level: ['mid', Validators.required], // Add experience_level
      salary_min: [null], // Add salary_min
      salary_max: [null], // Add salary_max
      salary_currency: ['USD'], // Add salary_currency
      status: ['active', Validators.required], // Add status
      deadline: [null], // Add deadline
      skills: [[]] // Change to skills
    });
  }

  filterSkills(event: any): void {
    const query = event.query;
    const currentSkillIds = this.jobPostForm.get('skills')?.value || [];
    this.filteredSkills = this.availableSkills.filter(skill =>
      skill.name.toLowerCase().includes(query.toLowerCase()) &&
      !currentSkillIds.includes(skill.id) // Filter out already selected skills by ID
    );
  }

  addSkill(event: any): void {
    const currentSkillIds = this.jobPostForm.get('skills')?.value || [];
    const selectedSkill = event.value; // This will be the Skill object from p-autoComplete
    if (selectedSkill && !currentSkillIds.includes(selectedSkill.id)) {
      currentSkillIds.push(selectedSkill.id);
      this.jobPostForm.get('skills')?.setValue(currentSkillIds);
    }
  }

  removeSkill(skillId: number): void { // Change parameter to skillId
    const currentSkillIds = this.jobPostForm.get('skills')?.value;
    const updatedSkillIds = currentSkillIds.filter((id: number) => id !== skillId);
    this.jobPostForm.get('skills')?.setValue(updatedSkillIds);
  }

  getSkillName(skillId: number): string {
    const skill = this.availableSkills.find(s => s.id === skillId);
    return skill ? skill.name : '';
  }

  onSubmit(): void {
    if (this.jobPostForm.valid && this.currentUser) {
      const formValue = this.jobPostForm.value;
      const jobPostPayload = {
        ...formValue,
        category_id: formValue.category, // Map category to category_id for backend
        skills: formValue.skills, // Send skill IDs
        deadline: formValue.deadline ? formValue.deadline.toISOString() : null, // Format date for backend
      };
      
      // Remove category field as backend expects category_id
      delete jobPostPayload.category;
      console.log('jobPostPayload',jobPostPayload)

      if (this.isEditMode && this.jobPostId !== null) {
        this.jobService.updateJobPost(this.jobPostId, jobPostPayload)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('Oferta de empleo actualizada con éxito.');
              this.router.navigate(['/admin/dashboard']);
            },
            error: (err) => {
              console.error('Error al actualizar la oferta de empleo:', err);
            }
          });
      } else {
        console.log('creando job')
        this.jobService.createJobPost(jobPostPayload)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('Nueva oferta de empleo creada con éxito.');
              this.router.navigate(['/admin/dashboard']);
            },
            error: (err) => {
              console.error('Error al crear la oferta de empleo:', err);
            }
          });
      }
    } else {
      console.log('Formulario inválido');
      this.jobPostForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
