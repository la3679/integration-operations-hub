export const config = {
  port: Number(process.env.PORT ?? 3000),
  transformerUrl: process.env.TRANSFORMER_URL ?? 'http://localhost:8000',
  legacyApiUrl: process.env.LEGACY_API_URL ?? 'http://localhost:8080',
  bearerToken: process.env.DEV_BEARER_TOKEN ?? 'integration-demo-token',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 3500)
};

