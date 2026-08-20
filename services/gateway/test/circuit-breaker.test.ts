import assert from 'node:assert/strict';
import test from 'node:test';
import { CircuitBreaker, CircuitOpenError } from '../src/lib/circuit-breaker.ts';

test('opens after the configured failure threshold', async () => {
  const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 60_000 });
  const failing = async (): Promise<never> => { throw new Error('upstream failed'); };

  await assert.rejects(() => breaker.execute(failing), /upstream failed/);
  await assert.rejects(() => breaker.execute(failing), /upstream failed/);
  assert.equal(breaker.state, 'OPEN');
  await assert.rejects(() => breaker.execute(async () => 'ok'), CircuitOpenError);
});

test('resets failures after a successful call', async () => {
  const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 60_000 });
  await assert.rejects(() => breaker.execute(async () => { throw new Error('failed once'); }));
  assert.equal(await breaker.execute(async () => 'ok'), 'ok');
  assert.equal(breaker.state, 'CLOSED');
});

