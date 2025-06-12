import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api'; // Importar MessageService
import { User } from '../../core/models/user.model'; // Importar User model
import { Skill } from '../../core/models/skill.model'; // Importar Skill model
import { SkillService } from '../../core/services/skill.service'; // Importar SkillService
import { Subject, takeUntil } from 'rxjs'; // Importar Subject y takeUntil

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [MessageService] // Proveer MessageService a nivel de componente
})
export class RegisterComponent implements OnInit, OnDestroy { // Implement OnDestroy
  registerForm!: FormGroup;
  availableSkills: Skill[] = [];
  filteredSkills: Skill[] = [];

  private destroy$ = new Subject<void>(); // Add destroy$ subject

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private skillService: SkillService // Inyectar SkillService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required], // Add first_name
      last_name: ['', Validators.required],  // Add last_name
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['applicant', Validators.required], // Default role
      skills: [[]] // Add skills form control
    }, { validators: this.passwordMatchValidator });

    this.skillService.getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe(skills => {
        this.availableSkills = skills;
      });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  filterSkills(event: any): void {
    const query = event.query;
    const currentSkillIds = this.registerForm.get('skills')?.value || [];
    this.filteredSkills = this.availableSkills.filter(skill =>
      skill.name.toLowerCase().includes(query.toLowerCase()) &&
      !currentSkillIds.includes(skill.id)
    );
  }

  addSkill(event: any): void {
    const currentSkillIds = this.registerForm.get('skills')?.value || [];
    const selectedSkill = event.value;
    if (selectedSkill && !currentSkillIds.includes(selectedSkill.id)) {
      currentSkillIds.push(selectedSkill.id);
      this.registerForm.get('skills')?.setValue(currentSkillIds);
    }
  }

  removeSkill(skillId: number): void {
    const currentSkillIds = this.registerForm.get('skills')?.value;
    const updatedSkillIds = currentSkillIds.filter((id: number) => id !== skillId);
    this.registerForm.get('skills')?.setValue(updatedSkillIds);
  }

  getSkillName(skillId: number): string {
    const skill = this.availableSkills.find(s => s.id === skillId);
    return skill ? skill.name : '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { username, email, first_name, last_name, password, confirmPassword, role, skills } = this.registerForm.value; // Get all form values
      const newUser = { // Use a generic object for registration payload
        username,
        email,
        first_name,
        last_name,
        password,
        password_confirm: confirmPassword, // Map confirmPassword to password_confirm
        role,
        skills, // Pass selected skill IDs
      };
      
      this.authService.register(newUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro exitoso. Por favor, inicie sesión.' });
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Error en el registro:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en el registro. Inténtelo de nuevo.' });
          }
        });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos correctamente.' });
      this.registerForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
