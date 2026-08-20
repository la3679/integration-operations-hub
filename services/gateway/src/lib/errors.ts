import type { ErrorEnvelope } from '../types.ts';
import { CircuitOpenError } from './circuit-breaker.ts';
import { UpstreamError } from './http-client.ts';

export function normalizeError(error: unknown, correlationId: string): { status: number; body: ErrorEnvelope } {
  if (error instanceof CircuitOpenError) {
    return { status: 503, body: { code: 'UPSTREAM_CIRCUIT_OPEN', message: 'An upstream service is temporarily unavailable.', correlationId } };
  }
  if (error instanceof UpstreamError) {
    return { status: 502, body: { code: 'UPSTREAM_FAILURE', message: error.message, correlationId, details: error.body } };
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return { status: 504, body: { code: 'UPSTREAM_TIMEOUT', message: 'An upstream request timed out.', correlationId } };
  }
  return { status: 500, body: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.', correlationId } };
}
