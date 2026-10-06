# ADR 0008 — Herramientas de calidad: uv, Ruff, mypy, Biome

**Estado:** Aceptada

## Contexto

Se evalúan dependencias declaradas y reproducibles, legibilidad y calidad del código.

## Decisión

| Ámbito | Herramienta | Motivo |
|---|---|---|
| Dependencias Python | **uv** + `uv.lock` | Rápido y reproducible; reemplaza pip, venv y Poetry |
| Lint y formato Python | **Ruff** | Reemplaza Flake8, Black e isort |
| Tipos Python | **mypy** en modo `strict` + plugin de Pydantic | Verificador estable y estándar |
| Dependencias JS | **pnpm** + `pnpm-lock.yaml`, versión fijada con Corepack | Instalación estricta y reproducible |
| Lint y formato TS | **Biome** | Reemplaza ESLint + Prettier |
| Tipos TS | `tsc` en modo `strict` (y el chequeo de `next build`) | |

Todas se ejecutan en contenedores mediante `make api-lint`, `make web-lint` y `make check`.

## Alternativas consideradas

- **ty (Astral):** verificador de tipos mucho más rápido, pero en beta y con soporte incompleto para Pydantic. Se reevaluará cuando tenga versión estable.
- **pre-commit:** requiere instalar Python en el host, lo que contradice [ADR 0006](0006-docker-first.md). Los chequeos se aplicarán en CI ([ADR 0014](0014-integracion-continua.md)).

## Consecuencias

- Las versiones exactas quedan fijadas en los lockfiles.
- Un único comando (`make check`) ejecuta lo mismo que ejecutará el CI.
