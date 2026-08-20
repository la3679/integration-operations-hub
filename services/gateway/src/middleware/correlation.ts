import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationMiddleware(request: Request, response: Response, next: NextFunction): void {
  request.correlationId = request.header('X-Correlation-ID') ?? randomUUID();
  response.setHeader('X-Correlation-ID', request.correlationId);
  next();
}

