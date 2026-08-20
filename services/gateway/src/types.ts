export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'PARTIAL' | 'FAILED';

export interface EmployeeRecord {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateJobRequest {
  sourceSystem: string;
  targetSystem: string;
  records: EmployeeRecord[];
}

export interface IntegrationJob {
  id: string;
  correlationId: string;
  sourceSystem: string;
  targetSystem: string;
  status: JobStatus;
  recordsReceived: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ErrorEnvelope {
  code: string;
  message: string;
  correlationId: string;
  details?: unknown;
}

