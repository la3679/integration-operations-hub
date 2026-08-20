export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitOpenError extends Error {
  constructor() {
    super('Upstream circuit is open');
    this.name = 'CircuitOpenError';
  }
}

export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private stateValue: CircuitState = 'CLOSED';
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = options;
  }

  get state(): CircuitState {
    if (this.stateValue === 'OPEN' && Date.now() - this.openedAt >= this.options.resetTimeoutMs) {
      this.stateValue = 'HALF_OPEN';
    }
    return this.stateValue;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new CircuitOpenError();
    }

    try {
      const result = await operation();
      this.failures = 0;
      this.stateValue = 'CLOSED';
      return result;
    } catch (error: unknown) {
      this.failures += 1;
      if (this.failures >= this.options.failureThreshold) {
        this.stateValue = 'OPEN';
        this.openedAt = Date.now();
      }
      throw error;
    }
  }
}
