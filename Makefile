# Every task runs inside Docker: only Docker and make are required on the host.

COMPOSE     := docker compose
COMPOSE_DEV := docker compose -f compose.yml -f compose.dev.yml
AS_USER     := -u $(shell id -u):$(shell id -g)

.DEFAULT_GOAL := help
.PHONY: help up dev down logs ps clean \
        api-test api-lint api-format api-shell migration migrate \
        web-lint web-format check

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

.env:
	cp .env.example .env

# ---------- system ----------
up: .env ## Build and start the whole system (production images)
	$(COMPOSE) up --build -d

dev: .env ## Start the whole system with hot reload (Compose Watch)
	$(COMPOSE_DEV) up --build --watch

down: ## Stop all containers
	$(COMPOSE_DEV) down

logs: ## Follow logs of all services
	$(COMPOSE) logs -f

ps: ## Show service status
	$(COMPOSE) ps

clean: ## Stop everything and delete the database volume
	$(COMPOSE_DEV) down -v --remove-orphans

# ---------- api ----------
api-test: .env ## Run backend tests (starts the database if needed)
	$(COMPOSE_DEV) up -d --wait db
	$(COMPOSE_DEV) run --rm --no-deps --build api pytest

api-lint: .env ## Lint, format check and type check the backend
	$(COMPOSE_DEV) run --rm --no-deps --build api sh -c "ruff check . && ruff format --check . && mypy src tests"

api-format: .env ## Auto-fix lint issues and format the backend
	$(COMPOSE_DEV) run --rm --no-deps $(AS_USER) -e RUFF_CACHE_DIR=/tmp/ruff -v ./apps/api:/app api sh -c "ruff check --fix . && ruff format ."

api-shell: .env ## Open a shell in the backend container
	$(COMPOSE_DEV) run --rm --no-deps api sh

migration: .env ## Create a migration from model changes: make migration m="add students"
	@test -n "$(m)" || (echo 'Usage: make migration m="message"' && exit 1)
	$(COMPOSE_DEV) up -d --wait db
	$(COMPOSE_DEV) run --rm --no-deps --build $(AS_USER) -e RUFF_CACHE_DIR=/tmp/ruff -v ./apps/api/alembic:/app/alembic api alembic revision --autogenerate -m "$(m)"

migrate: .env ## Apply pending migrations and load demo data
	$(COMPOSE_DEV) run --rm --build migrate

# ---------- web ----------
web-lint: .env ## Lint and type check the frontend
	$(COMPOSE_DEV) run --rm --no-deps --build web sh -c "pnpm lint && pnpm typecheck"

web-format: .env ## Auto-fix lint issues and format the frontend
	$(COMPOSE_DEV) run --rm --no-deps --build $(AS_USER) -v ./apps/web/src:/app/src web ./node_modules/.bin/biome check --write src

# ---------- all ----------
check: api-lint api-test web-lint ## Run every check (what CI runs)
