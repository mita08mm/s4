# ADR 0010 — Estrategia de pruebas

**Estado:** Propuesta

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

Recomendación: **B**, con cada test dentro de una transacción que se revierte al terminar.

Hoy existen tests de integración del esqueleto (health, formato de errores, documentación) que no requieren base de datos.
