import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, catchError, debounceTime, distinctUntilChanged, finalize, of, startWith, switchMap, tap } from 'rxjs';
import { IntegrationApiService } from '../../core/integration-api.service';
import { CreateJobRequest, IntegrationJob } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly api = inject(IntegrationApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly search = new FormControl('', { nonNullable: true });
  readonly displayedColumns = ['status', 'route', 'records', 'correlationId', 'createdAt'];
  readonly loading$ = new BehaviorSubject(false);
  readonly error$ = new BehaviorSubject('');

  readonly form = this.fb.group({
    sourceSystem: ['HRIS', Validators.required],
    targetSystem: ['LEGACY_HR', Validators.required],
    employeeNumber: ['E-2048', Validators.required],
    firstName: ['Riya', Validators.required],
    lastName: ['Shah', Validators.required],
    email: ['riya.shah@example.com', [Validators.required, Validators.email]],
    department: ['Engineering', Validators.required],
    status: ['ACTIVE' as const, Validators.required]
  });

  readonly jobs$ = this.search.valueChanges.pipe(
    startWith(this.search.value),
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((query) => this.refresh$.pipe(
      tap(() => this.loading$.next(true)),
      switchMap(() => this.api.listJobs(query)),
      tap(() => this.error$.next('')),
      catchError(() => {
        this.error$.next('Unable to load integration jobs. Use the correlation ID in the response to trace the failure.');
        return of({ items: [], total: 0 });
      }),
      finalize(() => this.loading$.next(false))
    ))
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateJobRequest = {
      sourceSystem: value.sourceSystem,
      targetSystem: value.targetSystem,
      records: [{
        employeeNumber: value.employeeNumber,
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        department: value.department,
        status: value.status
      }]
    };

    this.loading$.next(true);
    this.api.createJob(request).pipe(finalize(() => this.loading$.next(false))).subscribe({
      next: () => {
        this.error$.next('');
        this.refresh$.next();
      },
      error: () => this.error$.next('The synchronization request failed. Check service health and retry.')
    });
  }

  trackJob(_: number, job: IntegrationJob): string {
    return job.id;
  }
}

