import { Skill } from './skill.model'; // Import Skill interface

export interface UserProfile {
  id: number;
  user?: User; // Hacer el campo user opcional
  role: 'applicant' | 'admin';
  phone: string | null;
  address: string | null;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
  profile: UserProfile;
}
