# Interview Guide

## Thirty-second project explanation

Integration Operations Hub is a full-stack system-integration application. An Angular dashboard submits employee synchronization jobs to a Node.js/Express gateway. The gateway validates the request, adds a correlation ID, asks a Python/FastAPI service to normalize the payload, and upserts accepted records through a C#/.NET 8 API backed by PostgreSQL. Docker Compose runs the system locally, and every service exposes health or API documentation endpoints.

## Request flow to whiteboard

1. Angular's HTTP interceptor adds a bearer token and correlation ID.
2. Express validates the JSON contract with Zod.
3. The gateway calls FastAPI with a timeout, retry policy, and circuit breaker.
4. Pydantic validates and normalizes employee fields and deduplicates employee numbers.
5. The gateway calls ASP.NET Core for each accepted record and uses `Promise.allSettled` to preserve partial success.
6. ASP.NET Core uses dependency injection, an EF Core `DbContext`, and LINQ to upsert PostgreSQL records.
7. The normalized job result returns to Angular and refreshes the dashboard.

## Angular questions

**Why `switchMap` for the search field?** It unsubscribes from the previous HTTP observable when a newer query arrives, preventing stale responses from overwriting the latest result. `mergeMap` would allow every request to finish and can render results out of order.

**Why reactive forms?** The form model is explicit, testable, supports synchronous validation, and maps cleanly to the API request contract. It also scales better than template-driven forms for conditional enterprise workflows.

**What do the guard and interceptor do?** The guard ensures a session token exists before routing to the dashboard. The interceptor consistently attaches authentication and trace headers without repeating logic in each API call.

## Node.js questions

**Why a backend-for-frontend?** The browser integrates with one stable contract. The gateway hides upstream topology, centralizes authentication and validation, and converts different failure formats into one error envelope.

**How is partial failure handled?** `Promise.allSettled` captures each legacy-system result. The job becomes `SUCCEEDED`, `PARTIAL`, or `FAILED` based on successful records rather than discarding successful work when one record fails.

**What is the circuit-breaker behavior?** Three consecutive failures open the circuit for 30 seconds. Requests fail fast during that window. After the reset timeout, one half-open call tests recovery; success closes the circuit and resets the failure count.

## C#/.NET questions

**Where is dependency injection used?** `LegacyDbContext` and `EmployeeService` are registered in the service container and injected into controllers. The controller handles HTTP concerns while the service owns LINQ queries and upsert logic.

**Why EF Core and LINQ?** EF Core provides unit-of-work and change tracking, while LINQ keeps filtering, ordering, and projection strongly typed. The production provider is PostgreSQL; tests use the in-memory provider.

**How is an upsert made idempotent?** Employee number is normalized to uppercase and has a unique index. The service queries it first, creates when absent, and updates the existing entity otherwise.

## Reliability and observability

- Correlation IDs connect browser, gateway, FastAPI, and .NET logs.
- Timeouts stop hung calls from exhausting gateway resources.
- Exponential retries handle brief network failures; the circuit breaker prevents retry storms.
- Error responses never expose raw stack traces in production.
- Health endpoints separate process health from dependency health.

## Honest resume talking points

- Built a working portfolio system rather than claiming these technologies at a prior employer.
- Can explain each source file, run the Docker stack, call every endpoint, and modify the flow live.
- The project demonstrates transferable API-integration experience alongside professional Python/FastAPI and enterprise-system work.

