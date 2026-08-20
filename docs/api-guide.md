# API Guide

## Public gateway contract

The Angular application calls only the Node.js gateway. The gateway contract is also available as OpenAPI JSON in [`api-contract.json`](api-contract.json).

### Authentication

All `/api/jobs` requests require:

```http
Authorization: Bearer integration-demo-token
```

The local token is for demonstration only. `/api/health` does not require authentication.

### Correlation IDs

Clients may supply:

```http
X-Correlation-ID: 38da98d2-e167-40bf-a170-8640ee56365c
```

If absent, the gateway generates a UUID. Every response returns the effective value in the same header and includes it in job or error bodies.

## `GET /api/health`

Checks the gateway and its direct dependencies.

```json
{
  "service": "gateway",
  "dependencies": [
    {"name": "transformer", "ok": true},
    {"name": "legacyApi", "ok": true}
  ]
}
```

Returns `200` when all dependencies respond successfully and `503` otherwise.

## `GET /api/jobs`

Lists recent jobs held by the gateway process.

Query parameters:

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `query` | string | empty | Matches route, status, or correlation ID. |
| `limit` | integer | 25 | Clamped to 100. |

Response:

```json
{
  "items": [],
  "total": 0
}
```

## `POST /api/jobs`

Validates, normalizes, and synchronizes between one and 100 records.

```json
{
  "sourceSystem": "HRIS",
  "targetSystem": "LEGACY_HR",
  "records": [{
    "employeeNumber": "E-2048",
    "firstName": "Riya",
    "lastName": "Shah",
    "email": "riya.shah@example.com",
    "department": "Engineering",
    "status": "ACTIVE"
  }]
}
```

The accepted response uses HTTP `202` because the operation represents an integration job even though the demonstration completes the current batch before returning.

## Error envelope

Gateway failures use one shape:

```json
{
  "code": "UPSTREAM_FAILURE",
  "message": "Upstream returned 503",
  "correlationId": "38da98d2-e167-40bf-a170-8640ee56365c",
  "details": {}
}
```

Common codes:

| Code | HTTP status | Meaning |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | Missing or invalid bearer token. |
| `VALIDATION_ERROR` | 400 | Gateway request failed Zod validation. |
| `UPSTREAM_FAILURE` | 502 | Transformer or legacy API returned a failure. |
| `UPSTREAM_TIMEOUT` | 504 | An upstream call exceeded its deadline. |
| `UPSTREAM_CIRCUIT_OPEN` | 503 | Calls are failing fast during the recovery window. |
| `INTERNAL_ERROR` | 500 | Unexpected gateway failure. |

## Internal transformer API

### `POST /transform`

Accepts the same employee record shape and returns normalized records, accepted count, and warnings. Invalid models return FastAPI/Pydantic validation details wrapped with a correlation ID.

### `GET /health`

Returns process health without checking downstream dependencies.

## Internal legacy API

### `GET /api/employees`

Searches employee number, name, and department using a case-insensitive LINQ query.

### `PUT /api/employees`

Creates or updates a record by normalized employee number. Returns `201` for a new record and `200` for an update.

### `GET /health`

Uses the configured PostgreSQL health check.

