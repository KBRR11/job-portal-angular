import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // Importar HttpClientModule y HTTP_INTERCEPTORS

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor'; // Importar JwtInterceptor

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthModule } from './auth/auth.module';
import { ApplicantModule } from './applicant/applicant.module';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { SkillService } from './core/services/skill.service'; // Import SkillService
import { JobCategoryService } from './core/services/job-category.service'; // Import JobCategoryService

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Required for PrimeNG animations
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG Modules
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    AuthModule,
    ApplicantModule,
    AdminModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, // Registrar JwtInterceptor
    SkillService, // Add SkillService
    JobCategoryService // Add JobCategoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
