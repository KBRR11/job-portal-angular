import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { JobPostFormComponent } from './job-post-form/job-post-form.component';
import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';
import { SharedModule } from '../shared/shared.module'; // Importar SharedModule

// PrimeNG Modules específicos para el administrador
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar'; // Importar CalendarModule
import { InputNumberModule } from 'primeng/inputnumber'; // Importar InputNumberModule

@NgModule({
  declarations: [
    DashboardComponent,
    JobPostFormComponent,
    JobPostDetailComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule, // Importar SharedModule
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    ChipModule,
    TagModule,
    AvatarModule,
    ProgressBarModule,
    CardModule,
    CalendarModule, // Añadir CalendarModule
    InputNumberModule // Añadir InputNumberModule
  ]
})
export class AdminModule { }
