# ADR 0007 — Errores con Problem Details (RFC 9457)

**Estado:** Aceptada

## Contexto

El enunciado evalúa códigos de respuesta, manejo de errores y respuestas consistentes. El frontend debe poder mostrar mensajes claros a partir de los errores del API.

## Decisión

- Los casos de uso lanzan **errores de dominio** (`NotFoundError`, `ConflictError`) que no conocen HTTP.
- Un único módulo (`shared/http/error_handlers.py`) traduce cada excepción a su código HTTP: validación → 422, no encontrado → 404, conflicto → 409, error inesperado → 500 sin detalles internos.
- Una violación de `UNIQUE` en PostgreSQL (`23505`) también se traduce a 409, como red de seguridad ante condiciones de carrera.
- Todas las respuestas de error usan **Problem Details (RFC 9457)**, `application/problem+json`, con `type: "about:blank"`, `title`, `status`, `detail` e `instance`. Los errores de validación agregan `errors: [{field, message}]`.

## Alternativas consideradas

- **Formato propio** (`{ "error": "..." }`): funciona, pero cada cliente tiene que aprenderlo.
- **El formato por defecto de FastAPI** (`{ "detail": ... }`): cambia de forma según el tipo de error.

## Consecuencias

- El frontend tiene un solo formato de error que interpretar.
- Agregar un error de dominio nuevo implica registrar su código HTTP en un único mapa.
