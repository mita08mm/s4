# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

S4 – Super Simple Scheduling System: evaluación técnica Full Stack (especificación en `proyecto unido.md`; la puntuación está en su §6). Hay que gestionar estudiantes, clases y su relación muchos a muchos mediante una API REST y una interfaz web. El postulante debe poder defender todo el código y declarar el uso de IA: preferir código simple y explícito antes que abstracciones ingeniosas, y mantener commits pequeños y descriptivos (el historial se evalúa).

## Cómo trabajar con el usuario

- **Nunca hacer commits, crear ramas ni hacer push.** El usuario hace todos los commits él mismo y no quiere al asistente como coautor. Se trabaja en una sola rama (`main`). Como mucho, sugerir el mensaje de commit (Conventional Commits).
- El usuario escribe en español; responder en español. Tiene experiencia en TypeScript/Next.js; en Python, explicar los conceptos propios del ecosistema (Protocol, async, `Depends`, uv).
- Quiere tecnologías modernas que impresionen, pero tiene que poder defender cada línea en la entrevista: explicar el porqué de las decisiones y avanzar por pasos.
- Interfaz: minimalista, moderna y con mucha interacción y movimiento; nada que parezca una plantilla genérica.
- No instalar nada en el host: todo corre en Docker (ver abajo).

## Estado actual y próximos pasos

Hecho:
- Esqueleto de punta a punta: health, errores Problem Details, documentación Scalar en `/docs`, Docker Compose (`db → migrate → api → web`), Makefile, README, arquitectura y 14 ADR en `docs/adr/`.
- Frontend: estructura base animada. Incluye `SpotlightNav`, `ThemeToggle` con revelado circular, paleta ⌘K, `ProgressiveBlur`, inicio con hero y tarjetas, y páginas `/students` y `/classes` como marcadores "En construcción".
- Datos decididos (`docs/adr/0011-modelo-de-datos.md`): `Student` (`code`, nombre, apellido, email obligatorio y único), `Class` (`code`, título, descripción opcional), `Enrollment` (fecha), con cascada al eliminar e inscripción idempotente. Ids UUID v7; `code` en mayúsculas y email en minúsculas.
- **Backend `students` completo** y es el molde a copiar para `classes`: dominio (dataclasses + `Protocol`), un caso de uso por archivo con `UnitOfWork.commit()` explícito, repositorio SQLAlchemy (búsqueda AND de ORs con `ILIKE` escapado), router en `/api/v1/students` con `problem_responses(...)`, providers en `container.py`, modelo registrado en `shared/database/models.py`, migración, seed idempotente (`migrate` corre `alembic upgrade head` + seed), tests unitarios con fakes en memoria y tests de integración contra `<db>_test` con rollback por test (ADR 0010).

- **Frontend `/students` completo** y es el molde para `/classes`: la página (Server Component) lee `searchParams` y llama a `features/students/queries.ts`; `StudentsView` (cliente) une la búsqueda con debounce en `?q=`, la tabla con filas animadas (`motion.create(TableRow)`), la paginación (`shared/ui/pagination-links.tsx`), el panel `StudentSheet` (React Hook Form + Zod con `Controller` y `useFormState`, compatibles con React Compiler) y el `DeleteStudentDialog`. Las escrituras son Server Actions en `features/students/actions.ts`: validan de nuevo con el mismo esquema Zod, llaman al API, traducen Problem Details a errores por campo (el 409 trae `errors[].field`) y llaman a `refresh()`. Atajo `N` para crear. `loading.tsx` y `error.tsx` (en Next 16 la prop es `retry`, no `reset`).

- **`classes` completo** (back + front). Entidad `SchoolClass`; `SchoolClassChanges.description` usa el centinela `UNSET` (omitida = conservar, `null` = borrar). En el front se muestra como grilla de tarjetas (`ClassesGrid`); el buscador es genérico (`shared/ui/url-search-input.tsx`) y el detector de escritura para atajos está en `shared/lib/keyboard.ts`. Seed: 12 estudiantes y 8 clases. 31 tests de backend.

Siguiente (en este orden):
1. `enrollments`: inscribir varias clases a la vez, consultas en ambos sentidos, y detalle de estudiante y de clase con sus inscripciones.
2. Pendientes: colección de Bruno (`bruno/`), tipos del front generados desde OpenAPI (ADR 0012), CI con GitHub Actions (ADR 0014), Playwright E2E.
3. Decisión abierta: mantener el servicio `migrate` separado (recomendado) o migrar al arrancar la API.

## Todo corre en Docker

El host solo tiene Docker y make: no ejecutar `uv`, `pnpm`, `python` ni `node` en el host. Usar los targets del `Makefile` (`make help` los lista todos):

- `make up`: sistema completo con imágenes de producción (`compose.yml`).
- `make dev`: modo desarrollo con hot reload (`compose.yml` + `compose.dev.yml`, Compose Watch).
- `make check`: lint, tipos y tests de back y front (lo mismo que correrá el CI).
- `make api-test`, `make api-lint`, `make api-format`, `make web-lint`, `make web-format`.
- `make migration m="mensaje"` genera una migración con Alembic; `make migrate` la aplica.
- Un test puntual: `docker compose -f compose.yml -f compose.dev.yml run --rm --no-deps api pytest tests/ruta/test_x.py::test_nombre`.
- Agregar una dependencia Python: editar `apps/api/pyproject.toml` y regenerar `uv.lock` en un contenedor uv (`ghcr.io/astral-sh/uv:<versión>-python3.14-trixie-slim`, montando `apps/api` con `-u $(id -u):$(id -g)`). En el front, lo mismo con `node:24-alpine` y `pnpm add`.

Los comandos que escriben archivos en el host montan la carpeta y corren con el UID del usuario, para no dejar archivos de root. En el contenedor del API el entorno virtual está en `/opt/venv`, así que montar el código en `/app` no lo oculta. El Postgres de desarrollo se expone en el puerto 55432 del host (configurable con `DB_PORT` en `.env`), para no chocar con otros Postgres locales. Docker puede no tener `buildx`: los Dockerfiles no usan funciones exclusivas de BuildKit.

Para verificar la interfaz se usa Playwright en un contenedor contra la red de Compose, por ejemplo `docker run --rm --network s4_default -v <dir>:/shots mcr.microsoft.com/playwright:v1.63.0-noble ...` apuntando a `http://web:3000`, y se revisan las capturas.

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
  - Componentes de UI: shadcn/ui (Radix, preset Nova) con el tema `--vng-*` de VengeanceUI, componentes adaptados de Skiper UI y VengeanceUI, y Motion (`framer-motion`), todos en `src/shared/ui/` (ver `docs/adr/0013-ui-y-experiencia.md`). Los de esos registros son demos: hay que adaptarlos (rutas de Next, tokens del tema, sin imports inexistentes). Lenguaje de movimiento: entradas con fade + subida + desenfoque y curva `cubic-bezier(0.22, 1, 0.36, 1)`, interacciones con springs, y `MotionConfig reducedMotion="user"`. Catálogos: `https://skiper-ui.com/registry/registry.json` y `https://raw.githubusercontent.com/Ashutoshx7/VengeanceUI/main/public/r/registry.json`.
  - `CommandDialog` de shadcn no crea el contexto de cmdk: su contenido debe ir envuelto en `<Command>`. Se agregan con `npx shadcn@<versión> add <componente>` dentro de un contenedor `node:24-alpine` (con `-e npm_config_store_dir=/tmp/pnpm-store` para no dejar la caché de pnpm en el repo, y `chown` al final). Revisar el código del componente antes de agregarlo, y mover a `src/shared/ui/` lo que llegue a otra ruta.
  - El navegador solo habla con Next.js. Server Components y Server Actions llaman al API mediante `shared/lib/api-client.ts`, con `API_INTERNAL_URL` (módulo marcado `server-only`).
  - Next.js 16 tiene cambios de API: antes de usar una API que no conozcas, consulta `node_modules/next/dist/docs/` dentro del contenedor (ver `apps/web/AGENTS.md`).

## Requisitos de la evaluación que condicionan el diseño

- CRUD de estudiantes y clases con validaciones; las clases se listan con `code`, `title` y `description`.
- Asignar estudiantes a clases y consultar la relación en ambos sentidos. La búsqueda por campos debe tener su comportamiento **documentado**.
- Definir y documentar qué pasa al eliminar entidades que tienen inscripciones y cómo se rechazan los duplicados (en la defensa lo preguntan).
- Migraciones y seed reproducibles, documentación del API (OpenAPI + Scalar en `/docs`, colección de Bruno) y pruebas.
- Ningún secreto en el repo: `.env` está ignorado y `.env.example` documenta las variables.
