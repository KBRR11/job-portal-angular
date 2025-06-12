import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { JobPost, JobsResult } from '../models/job-post.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model'; // Asegúrate de que User esté importado si es necesario para postedBy
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`; // URL del backend Django

  constructor(private http: HttpClient) { }

  getJobPosts(): Observable<JobPost[]> {
    return this.http.get<JobsResult>(`${this.apiUrl}/`)
      .pipe(
        map(posts => posts.results.map(post => ({
          ...post,
          created_at: post.created_at // Ya es un string
        }))),
        catchError(this.handleError)
      );
  }

  getJobPostById(id: number): Observable<JobPost> {
    return this.http.get<JobPost>(`${this.apiUrl}/${id}/`)
      .pipe(
        map(post => ({
          ...post,
          created_at: post.created_at // Ya es un string
        })),
        catchError(this.handleError)
      );
  }

  createJobPost(jobPost: JobPost): Observable<JobPost> {
    // Construir el payload con solo los campos que el backend espera para la creación
    const payload = {
      title: jobPost.title,
      description: jobPost.description,
      requirements: jobPost.requirements,
      location: jobPost.location,
      category_id: jobPost.category_id, 
      employment_type: jobPost.employment_type,
      experience_level: jobPost.experience_level,
      salary_min: jobPost.salary_min,
      salary_max: jobPost.salary_max,
      salary_currency: jobPost.salary_currency,
      status: jobPost.status,
      deadline: jobPost.deadline,
      skills: jobPost.skills ? jobPost.skills.map(s => s.id) : [], // Asegurarse de enviar los IDs de las habilidades
    };
    
    return this.http.post<JobPost>(`${this.apiUrl}/admin/`, payload)
      .pipe(
        map(post => ({
          ...post,
          created_at: post.created_at // Ya es un string
        })),
        catchError(this.handleError)
      );
  }

  updateJobPost(id: number, jobPost: JobPost): Observable<JobPost> {
    // Construir el payload con solo los campos que el backend espera para la actualización
    const payload = {
      title: jobPost.title,
      description: jobPost.description,
      requirements: jobPost.requirements,
      location: jobPost.location,
      category_id: typeof jobPost.category === 'object' && jobPost.category !== null ? jobPost.category.id : jobPost.category, // Manejar JobCategory o number
      employment_type: jobPost.employment_type,
      experience_level: jobPost.experience_level,
      salary_min: jobPost.salary_min,
      salary_max: jobPost.salary_max,
      salary_currency: jobPost.salary_currency,
      status: jobPost.status,
      deadline: jobPost.deadline,
      skills: jobPost.skills ? jobPost.skills.map(s => s.id) : [], // Asegurarse de enviar los IDs de las habilidades
    };

    return this.http.put<JobPost>(`${this.apiUrl}/admin/${id}/`, payload)
      .pipe(
        map(post => ({
          ...post,
          created_at: post.created_at // Ya es un string
        })),
        catchError(this.handleError)
      );
  }

  deleteJobPost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}/`)
      .pipe(
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
