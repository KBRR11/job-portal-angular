import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Application, ApplicationStatus, ApplicationStatusHistory } from '../../core/models/application.model'; // Importar ApplicationStatusHistory
import { ApplicationService } from '../../core/services/application.service';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api'; // Importar MessageService
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
  applicationId: number | null = null;
  application: Application | null = null;
  timelineEvents: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private messageService: MessageService // Inyectar MessageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.applicationId = +id;
        this.loadApplicationDetail();
      } else {
        this.router.navigate(['/applicant/applications']); // Redirigir si no hay ID
      }
    });
  }

  loadApplicationDetail(): void {
    if (this.applicationId) {
      this.applicationService.getApplicationById(this.applicationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (app: Application) => { // Tipado 'app' como Application
            this.application = app;
            this.prepareTimelineEvents();
          },
          error: (err: HttpErrorResponse) => { // Tipado 'err' como HttpErrorResponse
            console.error('Error al cargar el detalle de la aplicación:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la aplicación.' });
            this.router.navigate(['/applicant/applications']);
          }
        });
    }
  }

  prepareTimelineEvents(): void {
    if (!this.application || !this.application.status_history) {
      this.timelineEvents = [];
      return;
    }

    // Ordenar el historial por fecha ascendente
    const sortedHistory = [...this.application.status_history].sort((a, b) => {
      return new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime();
    });

    this.timelineEvents = sortedHistory.map(history => ({
      status: history.new_status,
      date: new Date(history.changed_at),
      icon: this.getStatusIcon(history.new_status),
      color: this.getStatusColor(history.new_status),
      notes: history.notes, // Incluir notas
      changed_by_name: history.changed_by_name // Incluir nombre del que cambió
    }));
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case 'pending': return 'pi pi-inbox';
      case 'reviewing': return 'pi pi-search';
      case 'shortlisted': return 'pi pi-star';
      case 'interview_scheduled': return 'pi pi-calendar';
      case 'accepted': return 'pi pi-check-circle';
      case 'rejected': return 'pi pi-times-circle';
      case 'withdrawn': return 'pi pi-minus-circle';
      default: return 'pi pi-question-circle';
    }
  }

  getStatusColor(status: ApplicationStatus): string {
    switch (status) {
      case 'accepted': return '#28a745'; // Verde
      case 'rejected': return '#dc3545'; // Rojo
      case 'pending': return '#007bff'; // Azul
      case 'reviewing': return '#ffc107'; // Amarillo
      case 'shortlisted': return '#17a2b8'; // Cyan
      case 'interview_scheduled': return '#6f42c1'; // Púrpura
      case 'withdrawn': return '#6c757d'; // Gris
      default: return '#6c757d';
    }
  }

  // Método para obtener la severidad de la etiqueta de estado (usado en la plantilla)
  getStatusSeverity(status: ApplicationStatus): string {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'info';
      case 'reviewing': return 'warning';
      case 'shortlisted': return 'warning';
      case 'interview_scheduled': return 'warning';
      case 'withdrawn': return 'secondary';
      default: return 'info';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
