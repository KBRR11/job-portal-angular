import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecase'
})
export class TitleCasePipe implements PipeTransform {

  private translations: Record<string, string> = {
    pending: 'Pendiente',
    reviewing: 'En revisión',
    shortlisted: 'Preseleccionado',
    interview_scheduled: 'Entrevista programada',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
    withdrawn: 'Retirado'
  };

  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Si existe una traducción exacta, devuélvela
    const translated = this.translations[value.toLowerCase()];
    if (translated) {
      return translated;
    }

    // De lo contrario, usar Title Case como fallback
    return value.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}
