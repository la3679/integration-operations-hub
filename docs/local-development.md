# Local Development

## Recommended path: Docker Compose

Docker is the most reliable way to run every service with compatible networking and PostgreSQL configuration.

### Requirements

- Docker Desktop 4.x or Docker Engine 25+
- Docker Compose v2
- Git 2.40+

### Setup

```bash
git clone https://github.com/la3679/integration-operations-hub.git
cd integration-operations-hub
cp .env.example .env
docker compose up --build
```

PowerShell:

```powershell
git clone https://github.com/la3679/integration-operations-hub.git
Set-Location integration-operations-hub
Copy-Item .env.example .env
docker compose up --build
```

Wait until PostgreSQL, FastAPI, and ASP.NET Core health checks pass. Then open `http://localhost:4200`.

## Native development

Native mode is useful when changing one service and wanting faster reloads.

### Required software

- Node.js 20+
- npm 10+
- Python 3.12+
- .NET SDK 8
- PostgreSQL 16

### Start PostgreSQL only

```bash
docker compose up postgres
```

### Transformer

Linux/macOS:

```bash
cd services/transformer
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

PowerShell:

```powershell
Set-Location services/transformer
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Legacy API

```bash
cd services/legacy-api
dotnet restore
dotnet run
```

Set `ConnectionStrings__Postgres` if the database is not using the default local credentials.

### Gateway

Linux/macOS:

```bash
cd services/gateway
npm install
TRANSFORMER_URL=http://localhost:8000 \
LEGACY_API_URL=http://localhost:8080 \
DEV_BEARER_TOKEN=integration-demo-token \
npm run dev
```

PowerShell:

```powershell
Set-Location services/gateway
npm install
$env:TRANSFORMER_URL = "http://localhost:8000"
$env:LEGACY_API_URL = "http://localhost:8080"
$env:DEV_BEARER_TOKEN = "integration-demo-token"
npm run dev
```

### Angular

```bash
cd apps/web
npm install
npm start
```

The production NGINX image proxies `/api` to the gateway. For native Angular development, configure a local proxy or temporarily set the service base URL to `http://localhost:3000/api`.

## Tests

### Python

```bash
python3 -m unittest discover services/transformer/tests -v
```

### Node.js

Node.js 24 can run the pure TypeScript core tests directly:

```bash
node --test services/gateway/test/*.test.ts
```

With Node.js 20, install dependencies and run the TypeScript build first.

### .NET

```bash
dotnet test services/legacy-api.Tests/LegacyApi.Tests.csproj
```

### Repository validation

```bash
python3 scripts/validate_repo.py
```

## Development conventions

- Keep browser-facing JSON camelCase.
- Validate payloads at the gateway and service boundary.
- Never log employee payloads or bearer tokens.
- Propagate `X-Correlation-ID` to every synchronous downstream call.
- Add tests for reliability utilities and transformation rules.
- Update `docs/api-contract.json` when the public gateway contract changes.
- Update `PROJECT_STATE.md` and `VERIFICATION_REPORT.md` only with commands actually run.

## Useful commands

```bash
make validate
make test
make up
make down
docker compose logs -f gateway
docker compose ps
```

## Before opening a pull request

1. Run repository validation.
2. Run tests for every changed service.
3. Build Angular and the gateway when TypeScript changes.
4. Run .NET tests when C# or database behavior changes.
5. Confirm no `.env`, secrets, or generated artifacts are staged.
6. Update documentation for contract or architecture changes.

