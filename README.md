# Integration Operations Hub

[![CI](https://github.com/la3679/integration-operations-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/la3679/integration-operations-hub/actions/workflows/ci.yml)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)
![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi)
![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-style full-stack system-integration platform for submitting, monitoring, tracing, and troubleshooting enterprise synchronization jobs.

Integration Operations Hub demonstrates how an Angular application can integrate through a stable Node.js/Express gateway with independently deployed Python/FastAPI and C#/.NET services. The example workflow validates and synchronizes employee records into a PostgreSQL-backed legacy system while preserving traceability and partial-success information across every service boundary.

## Why this project exists

Enterprise applications rarely call one database through one API. They often coordinate several systems that use different schemas, availability guarantees, authentication mechanisms, and error formats. A useful integration platform must therefore do more than move JSON from one endpoint to another.

This project focuses on the difficult parts of integration work:

- Stable contracts between front ends and changing upstream services.
- Payload validation and transformation at trust boundaries.
- Correlation IDs that trace one request across multiple runtimes.
- Timeouts, retries, circuit breaking, and partial-failure handling.
- Idempotent updates to a simulated legacy system.
- Consistent errors that are safe for front-end consumers.
- Health checks, API documentation, automated tests, and repeatable deployment.

## Highlights

- **Angular 17 dashboard:** standalone components, lazy routing, reactive forms, RxJS `switchMap`, Angular Material, route guards, and an HTTP interceptor.
- **Node.js/Express gateway:** bearer authentication, Zod validation, correlation IDs, standardized errors, timeouts, exponential retries, and a circuit breaker.
- **Python/FastAPI transformer:** Pydantic validation, schema normalization, duplicate detection, and generated OpenAPI documentation.
- **C#/.NET 8 legacy API:** ASP.NET Core controllers, dependency injection, EF Core, LINQ, PostgreSQL, Problem Details, Swagger, and xUnit tests.
- **Operational tooling:** Docker Compose, service health checks, structured logs, GitHub Actions, repository validation, and an explicit verification report.

## Architecture

```mermaid
flowchart LR
    UI["Angular dashboard"] -->|"REST + bearer token"| GW["Node.js / Express gateway"]
    GW -->|"validate + normalize"| PY["Python / FastAPI"]
    GW -->|"upsert records"| CS["C# / ASP.NET Core API"]
    CS --> DB[(PostgreSQL)]
    GW -->|"job result + correlation ID"| UI
```

The browser integrates only with the gateway. The gateway owns the public contract and hides upstream topology, which prevents the UI from becoming coupled to multiple service-specific schemas and error formats.

### Request lifecycle

1. The Angular interceptor adds a bearer token and `X-Correlation-ID` header.
2. Express validates the request with Zod and creates an integration-job record.
3. The gateway calls FastAPI through a timeout, retry policy, and circuit breaker.
4. Pydantic validates, normalizes, and deduplicates employee records.
5. The gateway sends accepted records to ASP.NET Core and captures each result with `Promise.allSettled`.
6. EF Core performs an idempotent employee-number upsert in PostgreSQL.
7. The gateway returns `SUCCEEDED`, `PARTIAL`, or `FAILED` with record counts and the correlation ID.
8. Angular refreshes the job list; `switchMap` cancels stale filter requests.

For component boundaries, failure modes, data models, and scaling decisions, see [Architecture](docs/architecture.md).

## Technology choices

| Layer | Technology | Why it is used |
| --- | --- | --- |
| Web | Angular 17 + TypeScript | Strong structure for enterprise forms, routing, dependency injection, and typed HTTP clients. |
| UI state | RxJS | Models asynchronous workflows and cancels stale searches with `switchMap`. |
| Components | Angular Material | Accessible, consistent form and table primitives without custom widget behavior. |
| API gateway | Node.js + Express | Lightweight orchestration layer with excellent JSON and concurrent-I/O support. |
| Gateway validation | Zod | Runtime validation that stays close to TypeScript request types. |
| Transformation | Python + FastAPI | Concise data-processing service with automatic OpenAPI generation. |
| Data contracts | Pydantic | Validates and normalizes untrusted data before it reaches the legacy API. |
| Legacy API | C# + ASP.NET Core 8 | Demonstrates typed enterprise API development, DI, middleware, and Problem Details. |
| Persistence | EF Core + LINQ | Provides strongly typed query, projection, and unit-of-work behavior. |
| Database | PostgreSQL 16 | Reliable relational constraints plus JSONB support for integration events. |
| Packaging | Docker Compose | Starts the complete local topology with consistent networking and health checks. |
| CI | GitHub Actions | Repeats validation and service builds on pushes and pull requests. |

## Repository structure

```text
integration-operations-hub/
├── apps/web/                       Angular dashboard and NGINX container
├── services/gateway/               Node.js/Express API gateway
├── services/transformer/           Python/FastAPI validation service
├── services/legacy-api/            ASP.NET Core/EF Core API
├── services/legacy-api.Tests/      xUnit service tests
├── database/init.sql               PostgreSQL schema and sample records
├── docs/                           Architecture, API, setup, and deployment guides
├── scripts/validate_repo.py        Dependency-free repository quality check
├── .github/workflows/ci.yml        Continuous-integration pipeline
├── docker-compose.yml              Complete local service topology
├── Makefile                        Common development commands
└── PROJECT_STATE.md                Implementation and verification status
```

See [Project File Map](docs/file-map.md) for a file-by-file explanation.

## Quick start with Docker

### Prerequisites

- Git 2.40+
- Docker Desktop or Docker Engine with Compose v2
- Approximately 4 GB of free memory for the local stack

### Start the platform

```bash
git clone https://github.com/la3679/integration-operations-hub.git
cd integration-operations-hub
cp .env.example .env
docker compose up --build
```

On Windows PowerShell, replace the copy command with:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

### Open the services

| Service | URL | Purpose |
| --- | --- | --- |
| Angular dashboard | http://localhost:4200 | Submit and monitor integrations. |
| Gateway health | http://localhost:3000/api/health | Gateway and dependency health. |
| FastAPI Swagger | http://localhost:8000/docs | Transformer API documentation. |
| .NET Swagger | http://localhost:8080/swagger | Legacy API documentation. |
| PostgreSQL | localhost:5432 | Local persistence endpoint. |

The development bearer token is `integration-demo-token`. The Angular interceptor adds it automatically. Never use the development token in a deployed environment.

### Stop and clean up

```bash
docker compose down
```

To also remove the local database volume:

```bash
docker compose down --volumes
```

The volume-removal command permanently deletes local project data.

## Run a synchronization

Use the Angular form or call the gateway directly:

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H 'Authorization: Bearer integration-demo-token' \
  -H 'Content-Type: application/json' \
  -H 'X-Correlation-ID: 38da98d2-e167-40bf-a170-8640ee56365c' \
  -d '{
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
  }'
```

Example response:

```json
{
  "id": "70f23cea-0cc4-4ff0-99e0-69f8ff4ea7d6",
  "correlationId": "38da98d2-e167-40bf-a170-8640ee56365c",
  "sourceSystem": "HRIS",
  "targetSystem": "LEGACY_HR",
  "status": "SUCCEEDED",
  "recordsReceived": 1,
  "recordsSucceeded": 1,
  "recordsFailed": 0,
  "createdAt": "2026-08-20T18:00:00.000Z",
  "completedAt": "2026-08-20T18:00:00.410Z"
}
```

The UUIDs and timestamps above are illustrative; each request produces new values.

## API summary

| Method | Path | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | None | Returns gateway and upstream health. |
| `GET` | `/api/jobs?query=&limit=25` | Bearer token | Filters recent integration jobs. |
| `POST` | `/api/jobs` | Bearer token | Validates, transforms, and synchronizes records. |
| `GET` | Transformer `/health` | Internal | FastAPI process health. |
| `POST` | Transformer `/transform` | Internal | Validates and normalizes records. |
| `GET` | Legacy `/api/employees` | Internal | Searches employees with LINQ. |
| `PUT` | Legacy `/api/employees` | Internal | Creates or updates one employee. |

The machine-readable gateway contract is [docs/api-contract.json](docs/api-contract.json). A human-readable explanation is available in [API Guide](docs/api-guide.md).

## Configuration

Copy `.env.example` to `.env` and change values as needed.

| Variable | Default | Used by |
| --- | --- | --- |
| `POSTGRES_DB` | `integration_hub` | PostgreSQL and .NET API |
| `POSTGRES_USER` | `integration_user` | PostgreSQL and .NET API |
| `POSTGRES_PASSWORD` | `integration_password` | Local PostgreSQL only |
| `DATABASE_URL` | Compose PostgreSQL URL | Transformer/operations |
| `GATEWAY_PORT` | `3000` | Gateway |
| `TRANSFORMER_URL` | `http://transformer:8000` | Gateway |
| `LEGACY_API_URL` | `http://legacy-api:8080` | Gateway |
| `DEV_BEARER_TOKEN` | `integration-demo-token` | Angular and gateway |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Legacy API |

Do not commit `.env`. Production secrets should come from a secret manager or deployment platform, not the repository.

## Development without Docker

Each service can run independently when Node.js 20+, Python 3.12+, .NET SDK 8, and PostgreSQL 16 are installed. The complete commands and Windows notes are in [Local Development](docs/local-development.md).

Common commands:

```bash
make validate
make test
make up
make down
```

## Testing and verification

```bash
python3 -m unittest discover services/transformer/tests
node --test services/gateway/test/*.test.ts
dotnet test services/legacy-api.Tests/LegacyApi.Tests.csproj
python3 scripts/validate_repo.py
```

The repository validator checks required files, JSON documents, Python syntax, project XML, and concrete evidence for each advertised technology.

The most recent workspace verification is recorded in [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md). It distinguishes tests that passed from SDK-dependent checks that still need to run in CI or a fully provisioned development machine.

## Reliability behavior

- **Timeouts:** upstream calls are aborted instead of holding gateway resources indefinitely.
- **Retries:** transient failures use bounded exponential backoff.
- **Circuit breaking:** three consecutive failures open a circuit for 30 seconds and prevent retry storms.
- **Partial success:** `Promise.allSettled` preserves successful record updates when another record fails.
- **Idempotency:** normalized employee number is the stable upsert key and has a unique database index.
- **Traceability:** correlation IDs flow through request headers, responses, and structured logs.
- **Error consistency:** the gateway emits a single error envelope; ASP.NET Core uses RFC 7807 Problem Details.

## Security model

The included bearer token is intentionally simple for local demonstration. A production deployment should replace it with an external identity provider, short-lived JWTs, audience and issuer validation, role-based authorization, TLS between services, secret-manager integration, rate limiting, and an API gateway or web application firewall.

Please report security concerns privately using [SECURITY.md](SECURITY.md), not a public issue.

## Continuous integration

`.github/workflows/ci.yml` runs:

1. Repository validation.
2. Python transformation tests.
3. Node.js circuit-breaker and error-normalization tests.
4. Gateway dependency installation and TypeScript build.
5. Angular dependency installation and production build.
6. .NET restore, compilation, and xUnit tests.

## Deployment

Docker Compose is intended for local development. A production deployment should use managed PostgreSQL, a container registry, separate service identities, TLS, centralized logs, metrics, alerting, autoscaling, and rolling deployments.

[Deployment Guide](docs/deployment.md) maps the services to AWS, Azure, GCP, and Kubernetes-style environments and lists the required production controls.

## Important design decisions

- **Gateway instead of direct browser-to-service calls:** centralizes validation, authentication, observability, and compatibility logic.
- **Separate transformer service:** isolates schema and data-quality rules from transport and persistence concerns.
- **REST instead of a message broker for the demo:** keeps the request lifecycle observable and locally runnable; an asynchronous queue is the next step for high-volume workloads.
- **In-memory gateway job list:** keeps the sample focused. Production job state should live in PostgreSQL or a durable event store.
- **EF Core upsert service:** demonstrates a typed enterprise persistence layer while keeping PostgreSQL as the source of truth.

More detail and trade-offs are documented in [Architecture](docs/architecture.md).

## Roadmap

- Persist integration-job state and events in PostgreSQL.
- Add OpenTelemetry traces and Prometheus metrics.
- Replace the development token with OIDC/JWT validation and role-based access.
- Add a message broker for durable asynchronous jobs and dead-letter handling.
- Add Playwright end-to-end tests for the Angular workflow.
- Add database migrations instead of bootstrap-only SQL.
- Add Kubernetes manifests and infrastructure-as-code examples.
- Add screenshots after the end-to-end Docker build is verified.

## Documentation index

- [Architecture](docs/architecture.md)
- [API Guide](docs/api-guide.md)
- [Local Development](docs/local-development.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Project File Map](docs/file-map.md)
- [Interview Guide](docs/interview-guide.md)
- [Verification Report](VERIFICATION_REPORT.md)
- [Contributing](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## Contributing

Issues and pull requests are welcome. Run the validator and relevant service tests before opening a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for branch, commit, testing, and review expectations.

## License

Released under the [MIT License](LICENSE).

## Author

**Love Jayesh Ahir**

- GitHub: [@la3679](https://github.com/la3679)
- LinkedIn: [linkedin.com/in/love-ahir](https://linkedin.com/in/love-ahir)
- Portfolio: [loveahir.com](https://loveahir.com)

