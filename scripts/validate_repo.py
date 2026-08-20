from __future__ import annotations

import ast
import json
import re
import sys
import xml.etree.ElementTree as et
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "docker-compose.yml",
    "apps/web/package.json",
    "apps/web/src/app/features/dashboard/dashboard.component.ts",
    "services/gateway/package.json",
    "services/gateway/src/routes/jobs.ts",
    "services/transformer/app/main.py",
    "services/transformer/tests/test_transform.py",
    "services/legacy-api/LegacyApi.csproj",
    "services/legacy-api/Program.cs",
    "services/legacy-api.Tests/EmployeeServiceTests.cs",
    "database/init.sql",
    "docs/api-contract.json",
    "docs/api-guide.md",
    "docs/architecture.md",
    "docs/local-development.md",
    "docs/deployment.md",
    "docs/troubleshooting.md",
    "docs/file-map.md",
    "docs/interview-guide.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/bug_report.yml",
    ".github/ISSUE_TEMPLATE/feature_request.yml",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    raise SystemExit(1)


for relative in REQUIRED:
    path = ROOT / relative
    if not path.is_file() or path.stat().st_size == 0:
        fail(f"required file missing or empty: {relative}")

for relative in ["apps/web/package.json", "services/gateway/package.json", "docs/api-contract.json"]:
    json.loads((ROOT / relative).read_text(encoding="utf-8"))

for path in (ROOT / "services/transformer").rglob("*.py"):
    ast.parse(path.read_text(encoding="utf-8"), filename=str(path))

for relative in ["services/legacy-api/LegacyApi.csproj", "services/legacy-api.Tests/LegacyApi.Tests.csproj"]:
    et.parse(ROOT / relative)

for markdown in ROOT.rglob("*.md"):
    contents = markdown.read_text(encoding="utf-8")
    for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", contents):
        if target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        relative_target = target.split("#", 1)[0]
        if not relative_target:
            continue
        resolved = (markdown.parent / relative_target).resolve()
        if ROOT.resolve() not in resolved.parents and resolved != ROOT.resolve():
            fail(f"documentation link escapes repository: {markdown.relative_to(ROOT)} -> {target}")
        if not resolved.exists():
            fail(f"broken documentation link: {markdown.relative_to(ROOT)} -> {target}")

text_suffixes = {".cs", ".css", ".html", ".json", ".md", ".py", ".sql", ".ts", ".xml", ".yml", ".yaml"}
source = "\n".join(
    path.read_text(encoding="utf-8", errors="ignore")
    for path in ROOT.rglob("*")
    if path.is_file() and (path.suffix in text_suffixes or path.name in {"Dockerfile", "Makefile"})
)
evidence = {
    "Angular reactive forms": "ReactiveFormsModule",
    "RxJS switchMap": "switchMap",
    "Node.js Express": "express",
    "circuit breaker": "CircuitBreaker",
    "FastAPI": "FastAPI",
    "Pydantic": "BaseModel",
    "ASP.NET Core": "AddControllers",
    "Entity Framework Core": "DbContext",
    "LINQ": ".Where(",
    "xUnit": "[Fact]",
    "PostgreSQL": "postgres:16-alpine",
    "Docker Compose": "services:",
}

missing = [name for name, token in evidence.items() if token not in source]
if missing:
    fail(f"technology evidence missing: {', '.join(missing)}")

unresolved_markers = ["TO" + "DO", "PLACE" + "HOLDER"]
if any(marker in source for marker in unresolved_markers):
    fail("unresolved placeholder text found")

print(f"PASS: {len(REQUIRED)} required files")
print(f"PASS: {len(evidence)} technology evidence checks")
print("PASS: JSON, Python AST, project XML, and documentation-link validation")
