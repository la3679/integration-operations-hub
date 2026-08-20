.PHONY: up down test validate

up:
	docker compose up --build

down:
	docker compose down --volumes

test:
	python3 -m unittest discover services/transformer/tests
	node --test services/gateway/test/*.test.ts
	dotnet test services/legacy-api.Tests/LegacyApi.Tests.csproj

validate:
	python3 scripts/validate_repo.py

