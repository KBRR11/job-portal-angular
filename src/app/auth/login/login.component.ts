import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api'; // Importar MessageService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService] // Proveer MessageService a nivel de componente
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService, // Inyectar AuthService
    private messageService: MessageService // Inyectar MessageService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required], // Cambiado de email a username
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value; // Obtener username y password
      this.authService.login({ username, password }) // Pasar un objeto de credenciales
        .subscribe({
          next: (user) => {
            const userRole = user.profile?.role;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso' });
            if (userRole === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else if (userRole === 'applicant') {
              this.router.navigate(['/applicant/dashboard']);
            }
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
          }
        });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos requeridos.' });
      this.loginForm.markAllAsTouched();
    }
  }
}
