import { CircuitBreaker } from './circuit-breaker.ts';

export class UpstreamError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(
    message: string,
    status: number,
    body?: unknown
  ) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
    this.body = body;
  }
}

const delay = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function fetchJson<T>(
  url: string,
  init: RequestInit,
  breaker: CircuitBreaker,
  timeoutMs: number,
  retries = 2
): Promise<T> {
  return breaker.execute(async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        const body = await response.json().catch(() => undefined) as unknown;
        if (!response.ok) {
          throw new UpstreamError(`Upstream returned ${response.status}`, response.status, body);
        }
        return body as T;
      } catch (error: unknown) {
        lastError = error;
        const retryable = !(error instanceof UpstreamError) || error.status >= 500;
        if (!retryable || attempt === retries) {
          throw error;
        }
        await delay(100 * 2 ** attempt);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError;
  });
}
