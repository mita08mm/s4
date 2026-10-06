# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

S4 – Super Simple Scheduling System: evaluación técnica Full Stack (especificación en `proyecto unido.md`; la puntuación está en su §6). Hay que gestionar estudiantes, clases y su relación muchos a muchos mediante una API REST y una interfaz web. El postulante debe poder defender todo el código y declarar el uso de IA: preferir código simple y explícito antes que abstracciones ingeniosas, y mantener commits pequeños y descriptivos (el historial se evalúa).

Estado actual: esqueleto funcional de punta a punta (health, manejo de errores, documentación, Docker). Los módulos `students`, `classes` y `enrollments` existen como carpetas vacías, y el modelo de datos está propuesto en `docs/adr/0011-modelo-de-datos.md`.

## Todo corre en Docker

El host solo tiene Docker y make: no ejecutar `uv`, `pnpm`, `python` ni `node` en el host. Usar los targets del `Makefile` (`make help` los lista todos):

- `make up`: sistema completo con imágenes de producción (`compose.yml`).
- `make dev`: modo desarrollo con hot reload (`compose.yml` + `compose.dev.yml`, Compose Watch).
- `make check`: lint, tipos y tests de back y front (lo mismo que correrá el CI).
- `make api-test`, `make api-lint`, `make api-format`, `make web-lint`, `make web-format`.
- `make migration m="mensaje"` genera una migración con Alembic; `make migrate` la aplica.
- Un test puntual: `docker compose -f compose.yml -f compose.dev.yml run --rm --no-deps api pytest tests/ruta/test_x.py::test_nombre`.
- Agregar una dependencia Python: editar `apps/api/pyproject.toml` y regenerar `uv.lock` en un contenedor uv (`ghcr.io/astral-sh/uv:<versión>-python3.14-trixie-slim`, montando `apps/api` con `-u $(id -u):$(id -g)`). En el front, lo mismo con `node:24-alpine` y `pnpm add`.

Los comandos que escriben archivos en el host montan la carpeta y corren con el UID del usuario, para no dejar archivos de root. En el contenedor del API el entorno virtual está en `/opt/venv`, así que montar el código en `/app` no lo oculta. El Postgres de desarrollo se expone en el puerto 55432 del host, porque el 5432 lo ocupa otro proyecto del usuario.

## Arquitectura

- Vista general: `docs/ARCHITECTURE.md`. Decisiones: `docs/adr/`. Registrar las decisiones nuevas como un ADR numerado; los aceptados no se reescriben, se reemplazan con uno nuevo.
- **Backend** (`apps/api`, Python 3.14 + FastAPI + SQLAlchemy 2 async + Alembic). Detalle en `apps/api/ARCHITECTURE.md`.
  - Clean Architecture por módulos en `src/s4/modules/<modulo>/{domain,application,infrastructure,http}`.
  - Regla de dependencias: `http → application → domain ← infrastructure`. `domain` no importa FastAPI, Pydantic ni SQLAlchemy; los puertos son `typing.Protocol`.
  - Las dependencias se cablean solo en `src/s4/container.py`, mediante providers de `Depends`.
  - Los casos de uso lanzan errores de `s4.shared.errors`. `shared/http/error_handlers.py` es el único lugar que los traduce a HTTP, con formato Problem Details (RFC 9457).
  - La URL de Alembic viene de `Settings`, nunca de `alembic.ini`. Los modelos ORM deben importarse en `alembic/env.py` para que autogenerate los vea.
- **Frontend** (`apps/web`, Next.js 16 App Router + React 19 + Tailwind v4 + Biome, con pnpm). Detalle en `apps/web/ARCHITECTURE.md`.
  - `src/app` solo contiene rutas; la lógica va en `src/features/<feature>` y lo técnico en `src/shared`.
  - Componentes de UI: shadcn/ui (Radix, preset Nova) con el tema `--vng-*` de VengeanceUI y componentes de Skiper UI, todos en `src/shared/ui/` (ver `docs/adr/0013-ui-y-experiencia.md`). Se agregan con `npx shadcn@<versión> add <componente>` dentro de un contenedor `node:24-alpine` (con `-e npm_config_store_dir=/tmp/pnpm-store` para no dejar la caché de pnpm en el repo, y `chown` al final). Revisar el código del componente antes de agregarlo, y mover a `src/shared/ui/` lo que llegue a otra ruta.
  - El navegador solo habla con Next.js. Server Components y Server Actions llaman al API mediante `shared/lib/api-client.ts`, con `API_INTERNAL_URL` (módulo marcado `server-only`).
  - Next.js 16 tiene cambios de API: antes de usar una API que no conozcas, consulta `node_modules/next/dist/docs/` dentro del contenedor (ver `apps/web/AGENTS.md`).

## Requisitos de la evaluación que condicionan el diseño

- CRUD de estudiantes y clases con validaciones; las clases se listan con `code`, `title` y `description`.
- Asignar estudiantes a clases y consultar la relación en ambos sentidos. La búsqueda por campos debe tener su comportamiento **documentado**.
- Definir y documentar qué pasa al eliminar entidades que tienen inscripciones y cómo se rechazan los duplicados (en la defensa lo preguntan).
- Migraciones y seed reproducibles, documentación del API (OpenAPI + Scalar en `/docs`, colección de Bruno) y pruebas.
- Ningún secreto en el repo: `.env` está ignorado y `.env.example` documenta las variables.
