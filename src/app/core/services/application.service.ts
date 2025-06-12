import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Application, ApplicationsResult, ApplicationStatus } from '../models/application.model';
import { JobPost } from '../models/job-post.model';
import { User } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Necesario para obtener el rol del usuario
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`; // URL del backend Django

  constructor(private http: HttpClient, private authService: AuthService) { }

  getApplications(): Observable<Application[]> {
    // Este método podría ser llamado por un admin para ver todas las aplicaciones
    // o por un solicitante para ver sus propias aplicaciones.
    // La lógica de ruteo en el backend ya maneja esto.
    return this.http.get<Application[]>(`${this.apiUrl}/admin/`) // Asumiendo que el admin usa este endpoint
      .pipe(
        map(apps => apps.map(app => ({
          ...app,
          submission_date: app.submission_date // Ya es un string
        }))),
        catchError(this.handleError)
      );
  }

  getApplicationsByApplicant(applicantId: number): Observable<Application[]> {
    // El backend de Django ya filtra por el usuario autenticado en 'my-applications/'
    // Por lo tanto, el applicantId no es estrictamente necesario en la URL para el usuario logueado.
    // Sin embargo, si un admin necesita ver las aplicaciones de un solicitante específico,
    // se necesitaría un endpoint diferente o un parámetro de consulta.
    // Por ahora, asumimos que este método es para el usuario logueado.
    return this.http.get<ApplicationsResult>(`${this.apiUrl}/my-applications/`)
      .pipe(
        map(apps => apps.results.map(app => ({
          ...app,
          submission_date: app.submission_date 
        }))),
        catchError(this.handleError)
      );
  }

  getApplicationsByJobPost(jobPostId: number): Observable<Application[]> {
    // Este endpoint es para que un admin vea las aplicaciones a una oferta específica
    // Se ha corregido el parámetro de consulta de 'job_post' a 'job' para que coincida con el filtro del backend.
    return this.http.get<ApplicationsResult>(`${this.apiUrl}/admin/?job=${jobPostId}`)
      .pipe(
        map(apps => apps.results.map(app => ({
          ...app,
          submission_date: app.submission_date 
        }))),
        catchError(this.handleError)
      );
  }

  createApplication(applicationData: any): Observable<any> {
    // El backend espera job_id, cover_letter, resume_link, etc.
    // El user_id se añade automáticamente en el backend.
    return this.http.post<any>(`${this.apiUrl}/apply/`, applicationData)
      .pipe(
        catchError(this.handleError)
      );
  }

  checkIfApplied(jobId: number, userId: number): Observable<boolean> {
    // Este endpoint debería verificar si el usuario ya aplicó a este trabajo.
    // Asumimos que el backend tiene un endpoint para esto o que podemos filtrar las aplicaciones existentes.
    // Por ahora, simularemos la verificación en el frontend o usaremos un endpoint existente si es posible.
    // Si el backend no tiene un endpoint específico para esto, podríamos obtener todas las aplicaciones del usuario
    // y verificar en el frontend, pero eso no es eficiente.
    // La mejor práctica es que el backend provea un endpoint como: /api/applications/check-applied/?job_id=X&user_id=Y
    // O que la vista de detalle de la oferta de empleo incluya si el usuario actual ya aplicó.

    // Por ahora, haremos una llamada a 'my-applications' y filtraremos en el frontend.
    // Esto no es ideal para la eficiencia, pero funciona si no hay un endpoint específico.
    return this.getApplicationsByApplicant(userId).pipe(
      map(applications => applications.some(app => app.job.id === jobId)),
      catchError(this.handleError)
    );
  }

  updateApplicationStatus(appId: number, payload: { status: ApplicationStatus; review_notes?: string }): Observable<Application> {
    return this.http.patch<Application>(`${this.apiUrl}/admin/${appId}/`, payload) // Usar PATCH para actualizar parcialmente
      .pipe(
        map(app => ({
          ...app,
          submission_date: app.submission_date // Ya es un string
        })),
        catchError(this.handleError)
      );
  }

  getApplicationById(id: number): Observable<Application> {
    // Este endpoint es para que el aplicante vea el detalle de su propia aplicación
    // El backend ya filtra por el usuario autenticado en 'my-applications/<id>/'
    return this.http.get<Application>(`${this.apiUrl}/my-applications/${id}/`)
      .pipe(
        map(app => ({
          ...app,
          submission_date: app.submission_date // Ya es un string
        })),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      console.error(`Código de error del backend: ${error.status}, ` + `Cuerpo: ${JSON.stringify(error.error)}`);
      if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión de nuevo.';
      } else if (error.status === 400 && error.error) {
        errorMessage = `Error de validación: ${JSON.stringify(error.error)}`;
      } else {
        errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }
    return throwError(errorMessage);
  }
}
