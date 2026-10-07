# S4 — Super Simple Scheduling System

[![CI](https://github.com/mita08mm/s4/actions/workflows/ci.yml/badge.svg)](https://github.com/mita08mm/s4/actions/workflows/ci.yml)

Sistema para administrar **estudiantes**, **clases** y sus **inscripciones**, con una API REST y una interfaz web.

| | |
|---|---|
| Backend | Python 3.14 · FastAPI · SQLAlchemy 2 · Alembic |
| Frontend | Next.js 16 · React 19 · Tailwind CSS v4 |
| Base de datos | PostgreSQL 18 |
| Infraestructura | Docker Compose |

> Estado: todas las funcionalidades obligatorias completas: estudiantes, clases, inscripciones y búsquedas, en la API y en la interfaz.

## Requisitos

Solo **Docker** (con Docker Compose v2) y **make**. No hace falta instalar Python ni Node: todo corre en contenedores.

## Inicio rápido

```bash
git clone https://github.com/mita08mm/s4.git && cd s4
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

## Interfaz

| Pantalla | Qué permite |
|---|---|
| Inicio `/` | Estado del API y acceso a cada sección |
| Estudiantes `/students` | Listar, buscar (la búsqueda queda en la URL), paginar, crear y editar en un panel lateral, eliminar con confirmación |
| Detalle `/students/[id]` | Datos del estudiante y sus clases; inscribirlo en varias a la vez o desinscribirlo |
| Clases `/classes` | Lo mismo para clases, en una grilla de tarjetas con código, título y descripción |
| Detalle `/classes/[id]` | Datos de la clase y sus estudiantes; inscribir varios a la vez o desinscribirlos |

Atajos: `⌘K` / `Ctrl+K` abre la paleta de comandos y `N` crea un estudiante o una clase. Los formularios validan al instante y muestran los errores del servidor (por ejemplo, un código duplicado) junto al campo. Todas las acciones confirman con un aviso. Hay modo claro y oscuro, y las animaciones respetan la preferencia de "reducir movimiento" del sistema.

## API

Base: `http://localhost:8000/api/v1`. Referencia completa e interactiva en `/docs`; la especificación también está versionada en [`docs/openapi.json`](docs/openapi.json).

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/students?q=&page=&size=` | Listar y buscar | 200, 422 |
| POST | `/students` | Crear | 201 (+ `Location`), 409, 422 |
| GET | `/students/{id}` | Obtener | 200, 404, 422 |
| PATCH | `/students/{id}` | Actualizar (solo los campos enviados) | 200, 404, 409, 422 |
| DELETE | `/students/{id}` | Eliminar (y sus inscripciones) | 204, 404, 422 |
| GET | `/classes?q=&page=&size=` | Listar y buscar | 200, 422 |
| POST | `/classes` | Crear | 201 (+ `Location`), 409, 422 |
| GET | `/classes/{id}` | Obtener | 200, 404, 422 |
| PATCH | `/classes/{id}` | Actualizar; `"description": null` la borra | 200, 404, 409, 422 |
| DELETE | `/classes/{id}` | Eliminar (y sus inscripciones) | 204, 404, 422 |
| GET | `/students/{id}/classes` | Clases de un estudiante | 200, 404, 422 |
| POST | `/students/{id}/classes` | Inscribirlo en varias clases (`{"class_ids": [...]}`) | 200, 404, 422 |
| DELETE | `/students/{id}/classes/{class_id}` | Desinscribirlo de una clase | 204, 404, 422 |
| GET | `/classes/{id}/students` | Estudiantes de una clase | 200, 404, 422 |
| POST | `/classes/{id}/students` | Inscribir varios estudiantes (`{"student_ids": [...]}`) | 200, 404, 422 |
| DELETE | `/classes/{id}/students/{student_id}` | Desinscribir a un estudiante | 204, 404, 422 |

Ejemplo:

```bash
curl -X POST localhost:8000/api/v1/students \
  -H 'content-type: application/json' \
  -d '{"code":"A00200","first_name":"Ana","last_name":"Pérez","email":"ana@s4.edu"}'
```

**Errores:** todas las respuestas de error usan [Problem Details (RFC 9457)](https://www.rfc-editor.org/rfc/rfc9457), `application/problem+json`:

```json
{ "type": "about:blank", "title": "Conflict", "status": 409,
  "detail": "Ya existe un estudiante con el código A00101.", "instance": "/api/v1/students" }
```

**Búsqueda (`q`):** el texto se divide en palabras y **cada palabra debe aparecer** en alguno de los campos (coincidencia parcial y sin distinguir mayúsculas). En estudiantes se busca en código, nombre, apellido y email (`ana pér` encuentra a "Ana Pérez"); en clases, en código, título y descripción (`mecánica` encuentra "Física I"). `%` y `_` se tratan como texto literal. No ignora tildes. Los resultados se paginan (`page` desde 1, `size` entre 1 y 100, por defecto 20) y se ordenan por apellido y nombre (estudiantes) o por código (clases).

**Unicidad:** el código y el email de un estudiante, y el código de una clase, son únicos sin distinguir mayúsculas (se guardan normalizados). Un duplicado responde 409 e indica el campo en `errors`.

**Inscripciones:** un estudiante puede tomar varias clases. Inscribir es **idempotente** (repetir no duplica: clave primaria `(student_id, class_id)` + `ON CONFLICT DO NOTHING`) y **atómico** (si algún id no existe, responde 404 y no inscribe a nadie). Al eliminar un estudiante o una clase se eliminan sus inscripciones (`ON DELETE CASCADE`), nunca la otra entidad.

**Datos de prueba:** al levantar, el servicio `migrate` aplica las migraciones y carga 12 estudiantes, 8 clases y sus inscripciones de ejemplo. Es idempotente.

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
| `make web-types` | Exporta el OpenAPI (`docs/openapi.json`) y regenera los tipos TypeScript del front |
| `make api-collection` | Colección de Bruno contra el API en ejecución |
| `make e2e` | Tests end-to-end con Playwright contra el sistema en ejecución |

Para correr un test puntual del backend:

```bash
docker compose -f compose.yml -f compose.dev.yml run --rm --no-deps api pytest tests/integration/test_http_basics.py::test_liveness_returns_ok
```

## Pruebas

| Tipo | Herramienta | Qué cubre | Comando |
|---|---|---|---|
| Unitarias | pytest | Casos de uso con repositorios en memoria: normalización, duplicados, inscripción atómica | `make api-test` |
| Integración | pytest + httpx | Cada endpoint contra PostgreSQL real (base `<db>_test`, transacción revertida por test): códigos HTTP, errores, búsqueda, paginación, cascadas | `make api-test` |
| Colección del API | [Bruno](https://www.usebruno.com/) (`bruno/`) | Recorrido completo del API con assertions; se puede abrir en la app de Bruno para probar a mano | `make api-collection` |
| End-to-end | Playwright (`e2e/`) | Flujos reales en el navegador: crear, buscar, editar, eliminar, validaciones, inscribir varias clases, desinscribir, ⌘K, tema | `make e2e` |
| Estáticas | Ruff, mypy (strict), Biome, tsc | Estilo, errores comunes y tipos en back y front | `make check` |
| Contrato | openapi-typescript | Los tipos del front se generan desde el OpenAPI del back: si el API cambia, el front deja de compilar donde corresponde | `make web-types-check` |

`make api-collection` y `make e2e` necesitan el sistema levantado (`make up`). Ambos crean sus propios datos con códigos únicos y los eliminan al terminar.

**CI:** GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) ejecuta `make check`, verifica que los tipos del front coincidan con el OpenAPI y luego levanta el sistema y corre la colección de Bruno y los tests E2E, con los mismos comandos que en local.

## Configuración

Variables en `.env` (ver `.env.example`):

| Variable | Uso | Valor por defecto |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credenciales de la base de datos | `s4` / `s4_local_only` / `s4` |
| `API_PORT` | Puerto del API en el host | `8000` |
| `WEB_PORT` | Puerto de la web en el host | `3000` |
| `DB_PORT` | Puerto de Postgres en el host (solo en `make dev`) | `55432` |

Los valores de `.env.example` son solo para uso local. No se versiona ningún secreto real.

## Estructura

```
apps/api/      Backend: FastAPI con Clean Architecture por módulos (students, classes, enrollments)
apps/web/      Frontend: Next.js organizado por features
bruno/         Colección de requests del API
e2e/           Tests end-to-end (Playwright)
docs/          Arquitectura general y decisiones (ADR)
compose.yml    Sistema completo · compose.dev.yml: desarrollo con recarga en caliente
Makefile       Todos los comandos, ejecutados en Docker
```

## Documentación

- [Arquitectura general](docs/ARCHITECTURE.md)
- [Arquitectura del backend](apps/api/ARCHITECTURE.md)
- [Arquitectura del frontend](apps/web/ARCHITECTURE.md)
- [Decisiones técnicas (ADR)](docs/adr/README.md)

## Uso de asistentes de IA

Este proyecto se desarrolla con apoyo de un asistente de IA (Claude Code). Las decisiones técnicas están documentadas en los ADR y el autor es responsable de comprender y defender todo el código entregado.
