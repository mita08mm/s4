# ADR 0002 — Backend en Python con FastAPI

**Estado:** Aceptada

## Contexto

El enunciado deja libre el lenguaje y el framework, y evalúa la coherencia de la elección. El backend necesita validación, documentación del API y acceso a una base relacional.

## Decisión

Python 3.14 con **FastAPI**, Pydantic v2 para validación y `pydantic-settings` para configuración, servido con uvicorn.

- Validación declarativa: el tipo del parámetro es la validación.
- OpenAPI generado automáticamente desde el código.
- Inyección de dependencias nativa (`Depends`), que sirve como mecanismo de composición de la Clean Architecture ([ADR 0003](0003-clean-architecture-por-modulos.md)).
- Soporte async de punta a punta con SQLAlchemy 2 + asyncpg.

Se usa Python 3.14 y no 3.15: este último salió el 1 de octubre de 2026 y aún no tiene la madurez del ecosistema necesaria para producción.

## Alternativas consideradas

- **NestJS / Hono (TypeScript):** permitiría compartir tipos con el frontend, pero se prefirió mostrar dominio de un segundo ecosistema; el contrato se cubre con OpenAPI ([ADR 0012](0012-contrato-front-back.md)).
- **Django + DRF:** demasiado grande para una API de tres recursos.
- **Flask:** no trae validación ni OpenAPI; habría que sumarlos a mano.

## Consecuencias

- Dos ecosistemas en el repositorio (Python y Node); cada uno con sus herramientas dentro de su contenedor.
- Los tipos del frontend no se comparten directamente: se generan desde OpenAPI.
