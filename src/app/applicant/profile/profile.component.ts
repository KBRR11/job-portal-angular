import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Skill } from '../../core/models/skill.model'; // Import Skill
import { SkillService } from '../../core/services/skill.service'; // Import SkillService
import { Subject, takeUntil, forkJoin } from 'rxjs'; // Import forkJoin

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup; // Remove ! and initialize in constructor
  currentUser: User | null = null;
  availableSkills: Skill[] = [];
  filteredSkills: Skill[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private skillService: SkillService // Inyectar SkillService
  ) {
    // Initialize profileForm in the constructor to prevent NG01052 error
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      first_name: [''],
      last_name: [''],
      phone: [''],
      address: [''],
      skills: [[]]
    });
  }

  ngOnInit(): void {
    // Load current user data
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('ProfileComponent: currentUser cargado:', this.currentUser);
        this.profileForm.patchValue({
          username: this.currentUser?.username || '',
          email: this.currentUser?.email || '',
          first_name: this.currentUser?.first_name || '',
          last_name: this.currentUser?.last_name || '',
          phone: this.currentUser?.profile?.phone || '',
          address: this.currentUser?.profile?.address || '',
          skills: this.currentUser?.profile?.skills || []
        });
        console.log('ProfileComponent: Formulario parcheado con valores:', this.profileForm.value);
        console.log('ProfileComponent: Estado del formulario (válido/inválido):', this.profileForm.valid);
        console.log('ProfileComponent: Errores del formulario:', this.profileForm.errors);
      },
      error: (err) => {
        console.error('ProfileComponent: Error al cargar currentUser:', err);
      }
    });

    // Load all available skills
    this.skillService.getSkills().pipe(takeUntil(this.destroy$)).subscribe({
      next: (skills) => {
        this.availableSkills = skills || []; // Asegurarse de que siempre sea un array
        console.log('ProfileComponent: Habilidades disponibles cargadas:', this.availableSkills);
      },
      error: (err) => {
        console.error('ProfileComponent: Error al cargar habilidades disponibles:', err);
        this.availableSkills = []; // En caso de error, inicializar como array vacío
      }
    });
  }

  filterSkills(event: any): void {
    const query = event.query;
    const currentSkills: Skill[] = this.profileForm.get('skills')?.value || [];
    const currentSkillIds = new Set(currentSkills.map(s => s.id));
    // Asegurarse de que availableSkills sea un array antes de intentar filtrar
    if (Array.isArray(this.availableSkills)) {
      this.filteredSkills = this.availableSkills.filter(skill =>
        skill.name.toLowerCase().includes(query.toLowerCase()) &&
        !currentSkillIds.has(skill.id)
      );
    } else {
      this.filteredSkills = []; // Si no es un array, no hay habilidades para filtrar
      console.warn('ProfileComponent: availableSkills no es un array, no se pueden filtrar las habilidades.');
    }
  }

  addSkill(event: any): void {
    const currentSkills: Skill[] = this.profileForm.get('skills')?.value || [];
    const selectedSkill: Skill = event.value;
    if (selectedSkill && !currentSkills.some(s => s.id === selectedSkill.id)) {
      this.profileForm.get('skills')?.setValue([...currentSkills, selectedSkill]);
    }
  }

  removeSkill(skillToRemove: Skill): void {
    const currentSkills: Skill[] = this.profileForm.get('skills')?.value || [];
    const updatedSkills = currentSkills.filter((skill: Skill) => skill.id !== skillToRemove.id);
    this.profileForm.get('skills')?.setValue(updatedSkills);
  }

  // No longer needed as p-autoComplete with field="name" handles display
  // getSkillName(skillId: number): string {
  //   const skill = this.availableSkills.find(s => s.id === skillId);
  //   return skill ? skill.name : '';
  // }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      const formValue = this.profileForm.value;
      const updatedUserPayload = {
        username: formValue.username,
        first_name: formValue.first_name,
        last_name: formValue.last_name,
        profile: {
          phone: formValue.phone,
          address: formValue.address,
          skills: formValue.skills.map((s: Skill) => s.id) // Send only skill IDs to backend
        }
      };

      this.userService.updateUser(updatedUserPayload) // Send payload to service
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (responseUser) => {
            // Actualizar el currentUser en AuthService para reflejar los cambios
            this.authService.updateCurrentUser(responseUser); // Usar el nuevo método público
            console.log('Perfil actualizado con éxito:', responseUser);
            // Aquí se podría mostrar un toast de éxito
          },
          error: (err) => {
            console.error('Error al actualizar el perfil:', err);
            // Aquí se podría mostrar un toast de error
          }
        });
    } else {
      console.log('Formulario inválido');
      this.profileForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
