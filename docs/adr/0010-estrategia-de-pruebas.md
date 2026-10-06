# ADR 0010 — Estrategia de pruebas

**Estado:** Aceptada (Bruno y Playwright pendientes)

## Contexto

Se evalúan pruebas de funcionalidades críticas, casos de error y evidencia de validación. Las pruebas deben correr dentro de Docker ([ADR 0006](0006-docker-first.md)).

## Propuesta

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unitario (backend) | pytest | Casos de uso con repositorios en memoria |
| Integración (backend) | pytest + httpx | Endpoints contra PostgreSQL real: códigos HTTP, duplicados, eliminaciones en cascada |
| End-to-end | Playwright | Flujos completos en el navegador |
| Colección del API | Bruno | Requests de ejemplo con assertions |

## Decisión pendiente: cómo proveer PostgreSQL a los tests de integración

| Opción | Ventajas | Desventajas |
|---|---|---|
| **A. Testcontainers** | Cada ejecución crea una base limpia y aislada | Dentro de un contenedor necesita acceso al socket de Docker del host |
| **B. Base de datos de test en Compose** (por ejemplo, `s4_test` en el servicio `db`) | Simple y sin acceso al socket de Docker | Hay que limpiar los datos entre tests (transacción revertida por test) |

## Decisión

Se adopta la **opción B** (`tests/integration/conftest.py`):

- La base `<POSTGRES_DB>_test` se crea automáticamente en el servicio `db` si no existe, y su esquema se recrea al inicio de cada ejecución.
- Cada test corre dentro de una transacción que se revierte al terminar. La sesión usa `join_transaction_mode="create_savepoint"`, así el `commit()` del caso de uso confirma solo un *savepoint* y los tests no se ven entre sí.
- La app de test reemplaza la dependencia `get_session` por esa sesión (`dependency_overrides`).
- `make api-test` levanta solo `db` y corre `pytest` en el contenedor del API.
- Los tests unitarios usan dobles en memoria (`tests/unit/students/fakes.py`) que cumplen los puertos.

El esquema de test se crea con `Base.metadata.create_all`; las migraciones se validan aparte, al aplicarse en el servicio `migrate`.
