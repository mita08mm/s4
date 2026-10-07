# ADR 0009 — Documentación del API: OpenAPI + Scalar + Bruno

**Estado:** Aceptada

## Contexto

El enunciado exige documentación del API y recomienda OpenAPI/Swagger. También evalúa pruebas automatizadas o una colección de pruebas.

## Decisión

- **OpenAPI** generado por FastAPI desde el código (`/openapi.json`): la documentación no puede quedar desactualizada respecto de la implementación.
- **Scalar** como interfaz de la documentación en `/docs`, en lugar del Swagger UI por defecto: lee el mismo OpenAPI, con mejor búsqueda y ejemplos de código.
- **Bruno** para una colección de requests versionada en el repositorio (`bruno/`), con assertions, que sirve como demostración y como prueba ejecutable (`make api-collection`, CLI de Bruno en Docker). Recorre estudiantes, clases, inscripciones y sus errores; genera códigos únicos por ejecución y limpia lo que crea. Tiene entornos `local` (`localhost:8000`) y `docker` (`api:8000`).

## Alternativas consideradas

- **Swagger UI / ReDoc:** funcionan, pero Scalar ofrece una experiencia más actual sobre la misma especificación.
- **Postman:** las colecciones viven en la nube y requieren cuenta; las de Bruno son archivos de texto en Git.

## Consecuencias

- Cada endpoint debe declarar sus modelos de respuesta y códigos de error para que la documentación sea completa.
