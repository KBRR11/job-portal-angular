import { User } from './user.model';
import { Application } from './application.model';
import { Skill } from './skill.model'; // Import Skill interface
import { JobCategory } from './job-category.model'; // Import JobCategory interface

export interface JobsResult {
  "count":number,
  "next": string,
  "previous": string | null,
  "results": JobPost[]
}

export interface JobPost {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  category: JobCategory ; // Puede ser el objeto completo o solo el ID
  category_id: number | undefined; // Puede ser el objeto completo o solo el ID
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  salary_range?: string; // Propiedad calculada en el backend
  status: 'active' | 'inactive' | 'closed';
  created_by?: number; // ID del usuario que creó la oferta
  created_by_name?: string; // Nombre del usuario que creó la oferta
  applications_count?: number; // Número de postulaciones
  created_at: string;
  updated_at?: string;
  deadline?: string | null; // Fecha límite de postulación
  skills: Skill[]; // Skills requeridas
  matching_skills_count?: number; // Propiedad para afinidad
}
