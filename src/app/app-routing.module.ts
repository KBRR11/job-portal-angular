import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {
    path: 'applicant',
    loadChildren: () => import('./applicant/applicant.module').then(m => m.ApplicantModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'applicant' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { path: '**', redirectTo: 'login' } // Redirigir a login si la ruta no existe
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
