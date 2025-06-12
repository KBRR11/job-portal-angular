import { JobPost } from './job-post.model';
import { User, UserProfile } from './user.model'; // Importar UserProfile

export interface ApplicationsResult {
  count: number,
  next: string | null,
  previous: string | null,
  results: Application[]
}

export type ApplicationStatus = 
  'pending' | 
  'reviewing' | 
  'shortlisted' | 
  'interview_scheduled' | 
  'rejected' | 
  'accepted' | 
  'withdrawn';

export interface Application {
  id: number;
  job: JobPost; // Cambiado de jobPost a job para coincidir con el backend
  user: User; // Cambiado de applicant a user para coincidir con el backend
  user_profile: UserProfile; // Cambiado a UserProfile para coincidir con el backend
  status: ApplicationStatus;
  submission_date: string; // Cambiado a string para coincidir con el backend
  cover_letter?: string;
  resume?: string; // FileField en Django, puede ser una URL
  resume_link?: string;
  expected_salary?: number;
  available_start_date?: string; // DateField en Django, puede ser un string
  additional_notes?: string;
  updated_at?: string;
  reviewed_by?: number; // ID del usuario que revisó
  review_notes?: string;
  applicant_name?: string; // Propiedad de serializador
  applicant_email?: string; // Propiedad de serializador
  days_since_application?: number; // Propiedad de serializador
  status_history?: ApplicationStatusHistory[]; // Añadir historial de estado
  affinity?: number; // Añadir propiedad de afinidad calculada en el frontend
}

export interface ApplicationStatusHistory {
  id: number;
  previous_status: ApplicationStatus;
  new_status: ApplicationStatus;
  changed_by: number; // ID del usuario que cambió el estado
  changed_by_name?: string; // Nombre del usuario que cambió el estado
  changed_at: string;
  notes?: string;
}
