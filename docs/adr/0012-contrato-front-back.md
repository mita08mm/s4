# ADR 0012 — Contrato front–back con tipos generados desde OpenAPI

**Estado:** Aceptada

## Contexto

Backend (Python) y frontend (TypeScript) no pueden compartir tipos directamente. Con tipos escritos a mano en el front, si el contrato del API cambia, el error aparece en producción y no al compilar.

## Decisión

- El **OpenAPI del backend es la fuente de verdad** del contrato. `python -m s4.openapi` lo exporta sin levantar el servidor y se versiona en `docs/openapi.json`, así el evaluador puede leer el contrato sin ejecutar nada.
- **openapi-typescript** genera `apps/web/src/shared/api/schema.ts` a partir de ese archivo. Es solo un archivo de tipos: no agrega código al bundle.
- `apps/web/src/shared/api/types.ts` da nombres cortos (`Student`, `SchoolClass`, `EnrolledClass`, `ProblemDetails`...), y las features los reexportan. Ningún tipo de respuesta del API se escribe a mano.
- `make web-types` regenera el spec y los tipos, todo en Docker. `make web-types-check` falla si los archivos versionados quedaron desactualizados, y el CI lo ejecuta.
- El archivo generado se excluye de Biome y nunca se edita a mano.

## Verificación

Se renombró temporalmente `email` a `email_address` en `StudentResponse` y se regeneraron los tipos: `tsc` marcó los 7 usos en el front (tabla, perfil, formulario, panel de inscripciones) con archivo y línea. Después se revirtió el cambio.

## Alternativas consideradas

- **Cliente HTTP generado** (`@hey-api/openapi-ts`, `orval`): además de los tipos, genera funciones de llamada. Se descartó porque el front ya centraliza las llamadas en `apiFetch` y en las Server Actions; con los tipos alcanza.
- **Tipos a mano:** era la situación anterior. Sin protección ante cambios del contrato.
