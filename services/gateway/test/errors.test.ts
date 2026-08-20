import assert from 'node:assert/strict';
import test from 'node:test';
import { CircuitOpenError } from '../src/lib/circuit-breaker.ts';
import { normalizeError } from '../src/lib/errors.ts';
import { UpstreamError } from '../src/lib/http-client.ts';

test('normalizes upstream errors without leaking implementation details', () => {
  const result = normalizeError(new UpstreamError('upstream returned 503', 503, { reason: 'maintenance' }), 'corr-123');
  assert.equal(result.status, 502);
  assert.equal(result.body.code, 'UPSTREAM_FAILURE');
  assert.equal(result.body.correlationId, 'corr-123');
});

test('maps an open circuit to service unavailable', () => {
  const result = normalizeError(new CircuitOpenError(), 'corr-456');
  assert.equal(result.status, 503);
  assert.equal(result.body.code, 'UPSTREAM_CIRCUIT_OPEN');
});

