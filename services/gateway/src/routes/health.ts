import { Router } from 'express';
import { config } from '../config.ts';

export const healthRouter = Router();

healthRouter.get('/', async (_request, response) => {
  const targets = [
    ['transformer', `${config.transformerUrl}/health`],
    ['legacyApi', `${config.legacyApiUrl}/health`]
  ] as const;
  const checks = await Promise.allSettled(targets.map(async ([name, url]) => {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return { name, ok: upstream.ok };
  }));
  const dependencies = checks.map((check, index) => ({
    name: targets[index]?.[0],
    ok: check.status === 'fulfilled' && check.value.ok
  }));
  response.status(dependencies.every((dependency) => dependency.ok) ? 200 : 503).json({ service: 'gateway', dependencies });
});
