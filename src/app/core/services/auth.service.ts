import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { User, UserProfile } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface AuthResponse {
  tokens:{
    access: string;
   refresh: string;
  },
  user: User; // El UserDetailSerializer devuelve el usuario con el perfil anidado
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`; // URL del backend Django

  constructor(private router: Router, private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser = this.currentUserSubject.asObservable();
    console.log('AuthService: Inicializado con currentUser:', initialUser);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public updateCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('AuthService: currentUser actualizado:', user);
  }

  private saveTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  login(credentials: { username: string, password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap(response => {
          this.saveTokens(response.tokens.access, response.tokens.refresh);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  register(userData: any): Observable<User> {
    // El backend espera 'role', 'phone', 'address' directamente en el cuerpo de registro
    // y 'first_name', 'last_name' también.
    // Asegúrate de que userData contenga todos los campos esperados por UserRegistrationSerializer
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, userData)
      .pipe(
        tap(response => {
          // Después del registro, el backend devuelve tokens y el usuario.
          // Podrías loguear al usuario automáticamente o simplemente redirigir al login.
          // Por ahora, solo guardamos el usuario y redirigimos al login.
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user); // Opcional: loguear automáticamente
          this.saveTokens(response.tokens.access, response.tokens.refresh); // Guardar tokens si el registro devuelve
        }),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  logout(): any {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      // return this.http.post(`${this.apiUrl}/logout/`, { refresh: refreshToken })
      //   .pipe(
      //     tap(() => 
            this.clearSession()
        // ),
        //   catchError(this.handleError)
        // );
    } else {
      this.clearSession();
      return new Observable(observer => observer.next(true)); // Si no hay token, simplemente limpia la sesión
    }
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken(); // Considera logueado si hay un token de acceso
  }

  isAdmin(): boolean {
    return this.currentUserValue?.profile?.role === 'admin';
  }

  isApplicant(): boolean {
    return this.currentUserValue?.profile?.role === 'applicant';
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      return this.http.post<AuthResponse>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken })
        .pipe(
          tap(response => {
            this.saveTokens(response.tokens.access, response.tokens.refresh);
          }),
          catchError(error => {
            this.clearSession(); // Si falla la renovación, limpia la sesión
            return throwError(error);
          })
        );
    }
    this.clearSession();
    return throwError('No refresh token available');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      console.error(`Código de error del backend: ${error.status}, ` + `Cuerpo: ${JSON.stringify(error.error)}`);
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas o token expirado.';
      } else if (error.status === 400 && error.error) {
        errorMessage = `Error de validación: ${JSON.stringify(error.error)}`;
      } else {
        errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }
    return throwError(errorMessage);
  }
}
