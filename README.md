# S4 — Super Simple Scheduling System

Sistema para administrar **estudiantes**, **clases** y sus **inscripciones**, con una API REST y una interfaz web.

| | |
|---|---|
| Backend | Python 3.14 · FastAPI · SQLAlchemy 2 · Alembic |
| Frontend | Next.js 16 · React 19 · Tailwind CSS v4 |
| Base de datos | PostgreSQL 18 |
| Infraestructura | Docker Compose |

> Estado: esqueleto inicial. La API y la interfaz se comunican de punta a punta; los módulos de estudiantes, clases e inscripciones están en desarrollo.

## Requisitos

Solo **Docker** (con Docker Compose v2) y **make**. No hace falta instalar Python ni Node: todo corre en contenedores.

## Inicio rápido

```bash
git clone <repo> s4 && cd s4
make up
```

`make up` crea `.env` a partir de `.env.example` si no existe, construye las imágenes y levanta todo.

| URL | Qué es |
|---|---|
| http://localhost:3000 | Interfaz web |
| http://localhost:8000/docs | Documentación del API (Scalar) |
| http://localhost:8000/openapi.json | Especificación OpenAPI |
| http://localhost:8000/health | Estado del API |

Sin make: `cp .env.example .env && docker compose up --build`.

## Comandos

Ejecuta `make` (o `make help`) para ver la lista completa.

| Comando | Qué hace |
|---|---|
| `make up` | Levanta el sistema con imágenes de producción |
| `make dev` | Levanta el sistema en modo desarrollo, con recarga en caliente |
| `make down` | Detiene los contenedores |
| `make clean` | Detiene todo y **borra la base de datos** |
| `make logs` / `make ps` | Logs y estado de los servicios |
| `make check` | Todos los chequeos: lint, tipos y tests de back y front |
| `make api-test` | Tests del backend |
| `make api-lint` / `make api-format` | Lint y tipos / autoformato del backend |
| `make migration m="mensaje"` | Genera una migración a partir de los modelos |
| `make migrate` | Aplica las migraciones pendientes |
| `make web-lint` / `make web-format` | Lint y tipos / autoformato del frontend |

Para correr un test puntual del backend:

```bash
docker compose -f compose.yml -f compose.dev.yml run --rm --no-deps api pytest tests/integration/test_http_basics.py::test_liveness_returns_ok
```

## Configuración

Variables en `.env` (ver `.env.example`):

| Variable | Uso | Valor por defecto |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credenciales de la base de datos | `s4` / `s4_local_only` / `s4` |
| `API_PORT` | Puerto del API en el host | `8000` |
| `WEB_PORT` | Puerto de la web en el host | `3000` |
| `DB_PORT` | Puerto de Postgres en el host (solo en `make dev`) | `55432` |

Los valores de `.env.example` son solo para uso local. No se versiona ningún secreto real.

## Documentación

- [Arquitectura general](docs/ARCHITECTURE.md)
- [Arquitectura del backend](apps/api/ARCHITECTURE.md)
- [Arquitectura del frontend](apps/web/ARCHITECTURE.md)
- [Decisiones técnicas (ADR)](docs/adr/README.md)

## Uso de asistentes de IA

Este proyecto se desarrolla con apoyo de un asistente de IA (Claude Code). Las decisiones técnicas están documentadas en los ADR y el autor es responsable de comprender y defender todo el código entregado.
