import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/auth`; // URL del backend Django

  constructor(private http: HttpClient) { }

  // Este método podría no ser necesario si el perfil se obtiene a través de AuthService
  // o si siempre se accede al perfil del usuario logueado.
  // Si se necesita obtener un usuario por ID específico, el backend debería tener un endpoint para ello.
  getUserById(id: number): Observable<User> {
    // Asumiendo que /api/auth/profile/ devuelve el perfil del usuario autenticado
    // Si se necesita un usuario específico por ID, el endpoint sería algo como /api/users/{id}/
    // Por ahora, asumimos que este método se usará para obtener el perfil del usuario actual.
    return this.http.get<User>(`${this.apiUrl}/profile/`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUser(updatedUserPayload: any): Observable<User> {
    // El backend espera los campos de User directamente y los campos de UserProfile anidados bajo 'profile'.
    // El endpoint /auth/profile/ maneja la actualización del usuario autenticado y su perfil.
    // Los campos de User (username, first_name, last_name) se actualizan directamente.
    // Los campos de UserProfile (phone, address, skills) se actualizan a través del serializador anidado.
    
    // Construir el payload para la API de perfil
    const payload: any = {};

    // Campos del modelo User
    if (updatedUserPayload.username !== undefined) payload.username = updatedUserPayload.username;
    if (updatedUserPayload.first_name !== undefined) payload.first_name = updatedUserPayload.first_name;
    if (updatedUserPayload.last_name !== undefined) payload.last_name = updatedUserPayload.last_name;
    // El email no se actualiza a través de este endpoint en el backend (es read_only en UserDetailSerializer)

    // Campos del UserProfile anidados
    if (updatedUserPayload.profile) {
      payload.profile = {};
      if (updatedUserPayload.profile.phone !== undefined) payload.profile.phone = updatedUserPayload.profile.phone;
      if (updatedUserPayload.profile.address !== undefined) payload.profile.address = updatedUserPayload.profile.address;
      if (updatedUserPayload.profile.skills !== undefined) payload.profile.skills = updatedUserPayload.profile.skills;
    }

    return this.http.patch<any>(`${this.apiUrl}/profile/`, payload) // Usar PATCH para actualizaciones parciales
      .pipe(
        map(response => response.user), // Mapear la respuesta para devolver solo el objeto 'user'
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
