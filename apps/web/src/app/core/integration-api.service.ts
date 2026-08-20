import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateJobRequest, IntegrationJob, PagedJobs } from './models';

@Injectable({ providedIn: 'root' })
export class IntegrationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  listJobs(query: string): Observable<PagedJobs> {
    const params = new HttpParams().set('query', query).set('limit', 25);
    return this.http.get<PagedJobs>(`${this.baseUrl}/jobs`, { params });
  }

  createJob(request: CreateJobRequest): Observable<IntegrationJob> {
    return this.http.post<IntegrationJob>(`${this.baseUrl}/jobs`, request);
  }
}

