import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../shared/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ProfileComponent } from './profile/profile.component';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component'; // Import ApplicationDetailComponent

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'applications', component: ApplicationsComponent },
      { path: 'applications/:id', component: ApplicationDetailComponent }, // Add new route for application detail
      { path: 'profile', component: ProfileComponent },
      { path: 'jobs/:id', component: JobDetailComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicantRoutingModule { }
