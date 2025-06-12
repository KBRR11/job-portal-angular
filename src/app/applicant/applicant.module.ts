import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicantRoutingModule } from './applicant-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApplicationsComponent } from './applications/applications.component';
import { ProfileComponent } from './profile/profile.component';
import { JobDetailComponent } from './job-detail/job-detail.component'; // Import JobDetailComponent
import { SharedModule } from '../shared/shared.module'; // Importar SharedModule

// PrimeNG Modules específicos para el aplicante
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast'; // Para MessageService
import { MessageService } from 'primeng/api'; // Para MessageService
import { AutoCompleteModule } from 'primeng/autocomplete'; // Para ProfileComponent
import { TimelineModule } from 'primeng/timeline'; // Importar TimelineModule
import { ApplicationDetailComponent } from './application-detail/application-detail.component'; // Import ApplicationDetailComponent

@NgModule({
  declarations: [
    DashboardComponent,
    ApplicationsComponent,
    ProfileComponent,
    JobDetailComponent,
    ApplicationDetailComponent // Declarar ApplicationDetailComponent
  ],
  imports: [
    CommonModule,
    ApplicantRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TagModule,
    DividerModule,
    ChipModule,
    InputTextareaModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    AutoCompleteModule,
    TimelineModule // Importar TimelineModule
  ],
  providers: [
    MessageService
  ]
})
export class ApplicantModule { }
