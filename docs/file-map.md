# Project File Map

This guide explains where each responsibility lives and which files to open when learning or changing the project.

## Root files

| File | Purpose |
| --- | --- |
| `README.md` | Recruiter- and developer-facing project overview, architecture, setup, API summary, testing, and design decisions. |
| `docker-compose.yml` | Defines PostgreSQL, FastAPI, ASP.NET Core, Express, and Angular containers, networking, ports, dependencies, and health checks. |
| `.env.example` | Documents local environment variables without storing real secrets. |
| `.gitignore` | Excludes dependencies, builds, caches, local secrets, test results, and generated output. |
| `.editorconfig` | Keeps basic whitespace and encoding consistent across languages. |
| `Makefile` | Short aliases for start, stop, test, and validation commands. |
| `PROJECT_STATE.md` | Records implemented scope, verified checks, unavailable runtime checks, and next commands. |
| `VERIFICATION_REPORT.md` | Separates checks that passed from checks not run in the original build workspace. |
| `CONTRIBUTING.md` | Branch, commit, test, documentation, and pull-request expectations. |
| `SECURITY.md` | Supported-version and private vulnerability-reporting policy. |
| `LICENSE` | MIT license for the repository. |

## Angular application

| File | Purpose |
| --- | --- |
| `apps/web/package.json` | Angular, Material, RxJS, TypeScript, build, test, and development dependencies/scripts. |
| `apps/web/angular.json` | Angular CLI build, serve, assets, styles, and production-budget configuration. |
| `apps/web/tsconfig.json` | Strict shared TypeScript and Angular compiler configuration. |
| `apps/web/tsconfig.app.json` | Application entry and output configuration. |
| `apps/web/Dockerfile` | Builds Angular with Node and serves static assets through NGINX. |
| `apps/web/nginx.conf` | Serves the SPA and proxies `/api` requests to the gateway container. |
| `apps/web/src/main.ts` | Bootstraps the standalone application, router, animations, HTTP client, and interceptor. |
| `apps/web/src/index.html` | Browser document metadata and application mount point. |
| `apps/web/src/styles.css` | Global font, theme, color, and box-model styles. |
| `apps/web/src/app/app.component.ts` | Minimal root component containing the router outlet. |
| `apps/web/src/app/app.routes.ts` | Lazy dashboard route, guard, and fallback route. |
| `apps/web/src/app/core/models.ts` | Typed employee, request, job, and paged-response contracts. |
| `apps/web/src/app/core/auth.guard.ts` | Initializes the demonstration session token before navigation. |
| `apps/web/src/app/core/auth.interceptor.ts` | Adds bearer and correlation headers to HTTP requests. |
| `apps/web/src/app/core/integration-api.service.ts` | Typed wrapper around gateway list and create-job endpoints. |
| `apps/web/src/app/features/dashboard/dashboard.component.ts` | Reactive form, debounced `switchMap` search, job refresh, loading, and error state. |
| `apps/web/src/app/features/dashboard/dashboard.component.html` | Operator dashboard form, metrics, job table, and status rendering. |
| `apps/web/src/app/features/dashboard/dashboard.component.css` | Responsive dashboard layout and status styling. |

## Node.js/Express gateway

| File | Purpose |
| --- | --- |
| `services/gateway/package.json` | Express, Zod, TypeScript, build, development, start, and test configuration. |
| `services/gateway/tsconfig.json` | Strict NodeNext TypeScript compilation and import rewriting. |
| `services/gateway/Dockerfile` | Multi-stage gateway build and production runtime image. |
| `services/gateway/src/server.ts` | Starts the HTTP listener. |
| `services/gateway/src/app.ts` | Composes Express middleware, health route, authenticated jobs route, and error handler. |
| `services/gateway/src/config.ts` | Reads ports, upstream URLs, bearer token, and timeout settings. |
| `services/gateway/src/types.ts` | Gateway job, employee, request, and error contracts. |
| `services/gateway/src/middleware/correlation.ts` | Accepts or generates `X-Correlation-ID` and exposes it to handlers. |
| `services/gateway/src/middleware/auth.ts` | Validates the local demonstration bearer token. |
| `services/gateway/src/middleware/error-handler.ts` | Converts Zod and application failures into standardized JSON responses. |
| `services/gateway/src/lib/circuit-breaker.ts` | Closed/open/half-open resilience state machine. |
| `services/gateway/src/lib/http-client.ts` | Fetch wrapper with deadlines, retry classification, exponential backoff, and circuit execution. |
| `services/gateway/src/lib/errors.ts` | Maps internal and upstream errors to public status codes and envelopes. |
| `services/gateway/src/routes/health.ts` | Checks gateway dependencies concurrently. |
| `services/gateway/src/routes/jobs.ts` | Validates jobs, calls transformer and legacy APIs, aggregates partial results, and filters job history. |
| `services/gateway/test/circuit-breaker.test.ts` | Verifies threshold, open-circuit, and reset behavior. |
| `services/gateway/test/errors.test.ts` | Verifies safe error normalization and correlation propagation. |

## Python/FastAPI transformer

| File | Purpose |
| --- | --- |
| `services/transformer/requirements.txt` | FastAPI, Uvicorn, Pydantic, and email-validation dependencies. |
| `services/transformer/Dockerfile` | Python runtime image and Uvicorn startup command. |
| `services/transformer/app/main.py` | FastAPI metadata, correlation middleware, validation handler, health route, and transform route. |
| `services/transformer/app/models.py` | Pydantic API models, camelCase aliases, field constraints, and error contract. |
| `services/transformer/app/transform.py` | Deterministic normalization, alias mapping, and duplicate handling. |
| `services/transformer/tests/test_transform.py` | Tests normalization, deduplication, and invalid-email rejection. |

## C#/.NET legacy API

| File | Purpose |
| --- | --- |
| `services/legacy-api/LegacyApi.csproj` | .NET 8 target and ASP.NET, EF Core, PostgreSQL, Swagger, and health-check packages. |
| `services/legacy-api/Dockerfile` | Multi-stage .NET restore, publish, and ASP.NET runtime image. |
| `services/legacy-api/Program.cs` | Dependency registration, PostgreSQL, health checks, correlation middleware, Problem Details, Swagger, and routes. |
| `services/legacy-api/appsettings.json` | Local connection string and logging defaults. |
| `services/legacy-api/Models/Employee.cs` | EF Core employee entity and field limits. |
| `services/legacy-api/Models/EmployeeUpsertRequest.cs` | Validated request and response records. |
| `services/legacy-api/Data/LegacyDbContext.cs` | Employee mapping, table name, keys, indexes, and status default. |
| `services/legacy-api/Services/EmployeeService.cs` | LINQ search, normalized idempotent upsert, persistence, and response projection. |
| `services/legacy-api/Controllers/EmployeesController.cs` | Search and upsert HTTP endpoints with response metadata. |
| `services/legacy-api.Tests/LegacyApi.Tests.csproj` | xUnit, test SDK, EF Core in-memory provider, and application reference. |
| `services/legacy-api.Tests/EmployeeServiceTests.cs` | Verifies create/update idempotency and case-insensitive LINQ filtering. |

## Database, CI, and documentation

| File | Purpose |
| --- | --- |
| `database/init.sql` | Employee, job, and event tables plus deterministic sample employees. |
| `scripts/validate_repo.py` | Validates required files, JSON, Python AST, project XML, technology evidence, and unresolved markers. |
| `.github/workflows/ci.yml` | Runs validator, service tests, TypeScript builds, Angular build, and .NET tests. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Standard review checklist for changes. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Structured reproduction and environment fields. |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Structured problem, proposal, and alternatives fields. |
| `docs/api-contract.json` | Machine-readable OpenAPI description of the gateway. |
| `docs/api-guide.md` | Human-readable endpoint, authentication, header, response, and error guide. |
| `docs/architecture.md` | Components, sequence, data model, reliability, security, scaling, and trade-offs. |
| `docs/local-development.md` | Docker and native development instructions for Windows, macOS, and Linux. |
| `docs/deployment.md` | Production topology, cloud mapping, controls, and release process. |
| `docs/troubleshooting.md` | Diagnostic commands and common failure resolutions. |
| `docs/interview-guide.md` | Concise explanations for architecture and technology interview questions. |

