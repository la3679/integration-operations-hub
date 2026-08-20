import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { normalizeError } from '../lib/errors.ts';

export function errorHandler(error: unknown, request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'The request payload is invalid.',
      correlationId: request.correlationId,
      details: error.flatten()
    });
    return;
  }

  const normalized = normalizeError(error, request.correlationId);
  console.error(JSON.stringify({ level: 'error', correlationId: request.correlationId, error: error instanceof Error ? error.message : String(error) }));
  response.status(normalized.status).json(normalized.body);
}
