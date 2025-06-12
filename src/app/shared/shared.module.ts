import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';

// PrimeNG Modules
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { CardModule } from 'primeng/card'; // Ya importado en app.module, pero útil para exportar si se usa mucho
import { InputTextModule } from 'primeng/inputtext'; // Ya importado en app.module, pero útil para exportar si se usa mucho
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TimelineModule } from 'primeng/timeline';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService, ConfirmationService } from 'primeng/api'; // Importar servicios de PrimeNG
import { TitleCasePipe } from './pipes/title-case.pipe'; // Importar TitleCasePipe

@NgModule({
  declarations: [
    MainLayoutComponent,
    TitleCasePipe // Declarar TitleCasePipe
  ],
  imports: [
    CommonModule,
    RouterModule, // Necesario para router-outlet en el layout
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    SidebarModule,
    CardModule,
    InputTextModule,
    ChipModule,
    TagModule,
    BadgeModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    TimelineModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    TooltipModule,
    ProgressBarModule,
    DividerModule,
    AutoCompleteModule
  ],
  providers: [
    MessageService, // Proveer MessageService
    ConfirmationService // Proveer ConfirmationService
  ],
  exports: [
    MainLayoutComponent,
    TitleCasePipe, // Exportar TitleCasePipe
    // Exportar módulos de PrimeNG para que estén disponibles en otros módulos que importen SharedModule
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    SidebarModule,
    CardModule,
    InputTextModule,
    ChipModule,
    TagModule,
    BadgeModule,
    TableModule,
    DropdownModule,
    MultiSelectModule,
    TimelineModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    TooltipModule,
    ProgressBarModule,
    DividerModule,
    AutoCompleteModule
  ]
})
export class SharedModule { }
