# Project State

## Scope

Integration Operations Hub demonstrates Angular, Node.js/Express, Python/FastAPI, C#/.NET 8, PostgreSQL, REST/JSON integration, Docker Compose, authentication, validation, error handling, retries, circuit breaking, observability, and tests.

## Implemented

- Angular standalone dashboard with reactive forms, RxJS search, routing, guard, interceptor, and API service.
- Node.js/Express gateway with correlation IDs, bearer-token authentication, validation, normalized errors, retry and circuit-breaker utilities.
- FastAPI transformation service with Pydantic validation and deterministic normalization.
- ASP.NET Core Web API with EF Core/PostgreSQL, LINQ queries, Swagger, health checks, Problem Details, and xUnit test project.
- PostgreSQL schema, Dockerfiles, Docker Compose, GitHub Actions, API contract, and interview guide.
- Comprehensive README, architecture/API/deployment/local-development/troubleshooting guides, file map, contribution and security policies, issue forms, and pull-request template.

## Verification

- Passed: 3/3 Python transformation tests.
- Passed: 4/4 Node.js circuit-breaker and error-normalization tests.
- Passed: repository contract validation covering 26 required files, 12 technology-evidence checks, and relative documentation links.
- Passed: Python bytecode compilation for the transformer and validation script.
- Not available in the current build environment: Angular dependency installation, .NET SDK, and Docker Compose runtime. The included CI workflow runs those builds in GitHub Actions.

## Next local commands

```bash
cp .env.example .env
docker compose up --build
dotnet test services/legacy-api.Tests/LegacyApi.Tests.csproj
```
