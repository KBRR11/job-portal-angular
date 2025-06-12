import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const expectedRole = route.data['role'];
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.profile?.role === expectedRole) {
      return true;
    } else {
      // Rol no autorizado, redirigir a una página de acceso denegado o al dashboard
      // Por simplicidad, redirigiremos al login o a un dashboard genérico si ya está logueado
      if (currentUser) {
        if (currentUser.profile?.role === 'admin') {
          return this.router.createUrlTree(['/admin/dashboard']);
        } else if (currentUser.profile?.role === 'applicant') {
          return this.router.createUrlTree(['/applicant/dashboard']);
        }
      }
      return this.router.createUrlTree(['/login']);
    }
  }
}
