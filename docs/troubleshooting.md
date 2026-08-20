# Troubleshooting

## Start with service state

```bash
docker compose ps
docker compose logs --tail=100 gateway transformer legacy-api postgres web
```

Use the correlation ID from a failed UI request to search gateway, transformer, and legacy API logs.

## Port already in use

Default ports are 4200, 3000, 8000, 8080, and 5432.

Windows PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 4200,3000,8000,8080,5432 -ErrorAction SilentlyContinue
```

Linux/macOS:

```bash
lsof -i :4200 -i :3000 -i :8000 -i :8080 -i :5432
```

Stop the conflicting process or change the host-side port in `docker-compose.yml`.

## Gateway returns 401

- Confirm the request has `Authorization: Bearer integration-demo-token`.
- Confirm `.env` and the gateway use the same `DEV_BEARER_TOKEN`.
- Do not include quotes around the token value in the header.

## Gateway health returns 503

Inspect dependency state:

```bash
curl http://localhost:8000/health
curl http://localhost:8080/health
docker compose logs transformer legacy-api
```

The gateway reports unhealthy when either direct dependency cannot complete its health request.

## Circuit remains open

The circuit opens after repeated failures and waits 30 seconds before allowing a half-open recovery call. Fix the upstream service, wait for the reset window, then retry once. Repeated retries during an outage are intentionally rejected.

## PostgreSQL authentication failure

- Recheck `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`.
- Ensure the .NET connection string uses the same values.
- Existing volumes retain the credentials used at first initialization.

For disposable local data only, recreate the volume:

```bash
docker compose down --volumes
docker compose up --build
```

This permanently removes local database data.

## Angular loads but API requests fail

- In Docker, confirm NGINX can resolve the `gateway` service.
- In native development, configure an Angular proxy or point the API service to `http://localhost:3000/api`.
- Inspect the browser network panel for the response correlation ID.
- Confirm CORS and bearer-token headers are present.

## FastAPI rejects a record

Review the validation details and confirm:

- Employee number contains only letters, numbers, and hyphens.
- Email has a valid shape.
- Status is `ACTIVE` or `INACTIVE`.
- Required fields are non-empty and within length limits.
- A request contains no more than 100 records.

## .NET API cannot reach PostgreSQL

- Confirm the database health check passes.
- In Docker, the host is `postgres`, not `localhost`.
- In native development, the host is normally `localhost`.
- Confirm the schema was initialized and the application user can read/write it.

## Clean rebuild

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

Use a no-cache build only when normal rebuilds do not reflect dependency or Dockerfile changes.

