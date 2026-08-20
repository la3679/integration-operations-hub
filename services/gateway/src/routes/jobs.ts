import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.ts';
import { CircuitBreaker } from '../lib/circuit-breaker.ts';
import { fetchJson } from '../lib/http-client.ts';
import type { IntegrationJob } from '../types.ts';

const employeeSchema = z.object({
  employeeNumber: z.string().min(2).max(20),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  department: z.string().min(1).max(80),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

const createJobSchema = z.object({
  sourceSystem: z.string().min(2).max(80),
  targetSystem: z.string().min(2).max(80),
  records: z.array(employeeSchema).min(1).max(100)
});

const transformerBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 });
const legacyBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 });
const jobs: IntegrationJob[] = [];

export const jobsRouter = Router();

jobsRouter.get('/', (request, response) => {
  const query = String(request.query.query ?? '').toLowerCase();
  const limit = Math.min(Number(request.query.limit ?? 25), 100);
  const items = jobs
    .filter((job) => !query || `${job.sourceSystem} ${job.targetSystem} ${job.status} ${job.correlationId}`.toLowerCase().includes(query))
    .slice(0, limit);
  response.json({ items, total: items.length });
});

jobsRouter.post('/', async (request, response, next) => {
  try {
    const input = createJobSchema.parse(request.body);
    const job: IntegrationJob = {
      id: randomUUID(),
      correlationId: request.correlationId,
      sourceSystem: input.sourceSystem,
      targetSystem: input.targetSystem,
      status: 'RUNNING',
      recordsReceived: input.records.length,
      recordsSucceeded: 0,
      recordsFailed: 0,
      createdAt: new Date().toISOString()
    };
    jobs.unshift(job);

    const headers = { 'Content-Type': 'application/json', 'X-Correlation-ID': request.correlationId };
    const transformed = await fetchJson<{ records: unknown[] }>(
      `${config.transformerUrl}/transform`,
      { method: 'POST', headers, body: JSON.stringify({ records: input.records }) },
      transformerBreaker,
      config.requestTimeoutMs
    );

    const results = await Promise.allSettled(transformed.records.map((record) => fetchJson<unknown>(
      `${config.legacyApiUrl}/api/employees`,
      { method: 'PUT', headers, body: JSON.stringify(record) },
      legacyBreaker,
      config.requestTimeoutMs
    )));

    job.recordsSucceeded = results.filter((result) => result.status === 'fulfilled').length;
    job.recordsFailed = results.length - job.recordsSucceeded;
    job.status = job.recordsFailed === 0 ? 'SUCCEEDED' : job.recordsSucceeded === 0 ? 'FAILED' : 'PARTIAL';
    job.completedAt = new Date().toISOString();
    if (job.recordsFailed) job.errorMessage = `${job.recordsFailed} record(s) failed upstream validation or persistence.`;

    response.status(202).json(job);
  } catch (error: unknown) {
    next(error);
  }
});
