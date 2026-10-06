# ADR 0012 — Contrato front–back y tipos generados

**Estado:** Propuesta

## Contexto

Backend (Python) y frontend (TypeScript) no pueden compartir tipos directamente. Si el contrato del API cambia, el frontend debería enterarse en compilación, no en producción.

## Propuesta

- El **OpenAPI del backend es la fuente de verdad** del contrato.
- El frontend genera sus tipos (y opcionalmente un cliente) desde `openapi.json` con una herramienta como `openapi-typescript` o `@hey-api/openapi-ts`, mediante un comando `make` que corre en Docker.
- Los tipos generados se versionan para que el build del frontend no dependa de que el API esté corriendo.

## Decisiones pendientes

- Herramienta concreta de generación.
- Si el CI verifica que los tipos generados estén al día.
