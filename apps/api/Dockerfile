FROM ghcr.io/astral-sh/uv:0.12.23 AS uv

# ---------- base: Python + uv ----------
FROM python:3.14-slim AS base
COPY --from=uv /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_NO_CACHE=1 \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app

# ---------- dev: all dependencies + hot reload (source synced by `docker compose watch`) ----------
FROM base AS dev
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project
COPY . .
RUN uv sync --locked
EXPOSE 8000
CMD ["uvicorn", "s4.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "src"]

# ---------- builder: production dependencies only ----------
FROM base AS builder
ENV UV_COMPILE_BYTECODE=1
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project
COPY . .
RUN uv sync --locked --no-dev --no-editable

# ---------- runtime: minimal image, non-root user ----------
FROM python:3.14-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"
RUN useradd --system --uid 10001 --no-create-home app
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY alembic.ini ./
COPY alembic ./alembic
USER app
EXPOSE 8000
CMD ["uvicorn", "s4.main:app", "--host", "0.0.0.0", "--port", "8000"]
