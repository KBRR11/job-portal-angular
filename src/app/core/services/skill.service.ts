import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError,map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import tap and catchError
import { Skill, SkillsResult } from '../models/skill.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = `${environment.apiUrl}/jobs/skills/`; // Corrected API endpoint

  constructor(private http: HttpClient) { }

  getSkills(): Observable<Skill[]> {
  console.log('SkillService: Solicitando habilidades desde:', this.apiUrl);
  return this.http.get<SkillsResult>(this.apiUrl).pipe(
    map((response: SkillsResult) => response.results),
    catchError(error => {
      console.error('SkillService: Error al obtener habilidades:', error);
      return throwError(() => error);
    })
  );
}

  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.apiUrl}${id}/`);
  }

  createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, skill);
  }

  updateSkill(id: number, skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}${id}/`, skill);
  }

  deleteSkill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
