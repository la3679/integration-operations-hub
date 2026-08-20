import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.ts';

export function authMiddleware(request: Request, response: Response, next: NextFunction): void {
  const token = request.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (token !== config.bearerToken) {
    response.status(401).json({ code: 'UNAUTHORIZED', message: 'A valid bearer token is required.', correlationId: request.correlationId });
    return;
  }
  next();
}
