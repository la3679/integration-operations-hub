# Contributing

Thank you for improving Integration Operations Hub.

## Before starting

1. Search existing issues and pull requests.
2. Open an issue for a large change before implementation.
3. Keep one pull request focused on one problem.
4. Never include credentials, employee data, or private system information.

## Development flow

1. Fork or branch from `main`.
2. Use a descriptive branch such as `feature/persist-job-events` or `fix/gateway-timeout`.
3. Make the smallest coherent change.
4. Add or update tests.
5. Update API and architecture documentation when behavior changes.
6. Run validation and relevant builds.

## Commit style

Use short imperative messages:

```text
Add durable job repository
Fix gateway timeout classification
Document OIDC deployment requirements
```

## Required checks

```bash
python3 scripts/validate_repo.py
python3 -m unittest discover services/transformer/tests
node --test services/gateway/test/*.test.ts
dotnet test services/legacy-api.Tests/LegacyApi.Tests.csproj
```

When Angular or gateway TypeScript changes:

```bash
cd apps/web && npm install && npm run build
cd ../../services/gateway && npm install && npm run build
```

## Pull requests

Include:

- The user or operational problem.
- The selected solution and important trade-offs.
- Testing commands and results.
- Contract, configuration, or migration impact.
- Screenshots for visible Angular changes.
- Follow-up work that is deliberately out of scope.

## Code expectations

- Keep TypeScript strict.
- Validate data at trust boundaries.
- Propagate correlation IDs.
- Do not log secrets or employee payloads.
- Keep controllers and route handlers thin.
- Use deterministic transformation functions.
- Prefer bounded retries and explicit timeouts.
- Document any new environment variable.

## Documentation expectations

Update the following when relevant:

- `README.md` for user-facing behavior.
- `docs/api-contract.json` and `docs/api-guide.md` for gateway changes.
- `docs/architecture.md` for service boundaries or reliability changes.
- `.env.example` for configuration changes.
- `PROJECT_STATE.md` and `VERIFICATION_REPORT.md` only with verified facts.

