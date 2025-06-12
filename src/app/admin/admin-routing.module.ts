import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../shared/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { JobPostFormComponent } from './job-post-form/job-post-form.component';
import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'job-posts/new', component: JobPostFormComponent },
      { path: 'job-posts/:id', component: JobPostDetailComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
