import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { JobCategory, JobCategoryResult } from '../models/job-category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobCategoryService {
  private apiUrl = `${environment.apiUrl}/jobs/categories/`; // Corrected API endpoint

  constructor(private http: HttpClient) { }

  getJobCategories(): Observable<JobCategory[]> {
    return this.http.get<JobCategoryResult>(this.apiUrl).pipe(
      map(result => result.results.map(cat => ({
        ...cat
      }) ))
    );
  }

  getJobCategoryById(id: number): Observable<JobCategory> {
    return this.http.get<JobCategory>(`${this.apiUrl}${id}/`);
  }

  createJobCategory(category: JobCategory): Observable<JobCategory> {
    return this.http.post<JobCategory>(this.apiUrl, category);
  }

  updateJobCategory(id: number, category: JobCategory): Observable<JobCategory> {
    return this.http.put<JobCategory>(`${this.apiUrl}${id}/`, category);
  }

  deleteJobCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
