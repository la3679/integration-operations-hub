import cors from 'cors';
import express from 'express';
import { authMiddleware } from './middleware/auth.ts';
import { correlationMiddleware } from './middleware/correlation.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { healthRouter } from './routes/health.ts';
import { jobsRouter } from './routes/jobs.ts';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(correlationMiddleware);
app.use((request, _response, next) => {
  console.info(JSON.stringify({ level: 'info', method: request.method, path: request.path, correlationId: request.correlationId }));
  next();
});
app.use('/api/health', healthRouter);
app.use('/api/jobs', authMiddleware, jobsRouter);
app.use(errorHandler);
