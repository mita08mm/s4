# Registro de decisiones de arquitectura (ADR)

Cada ADR documenta una decisión técnica: el contexto, lo que se decidió, las alternativas y sus consecuencias. Los ADR no se reescriben: si una decisión cambia, se crea uno nuevo que reemplaza al anterior.

**Estados:** `Propuesta` (en discusión o por implementar) · `Aceptada` (vigente) · `Reemplazada por ADR-XXXX`.

| N° | Decisión | Estado |
|---|---|---|
| [0001](0001-monorepo.md) | Monorepo con aplicaciones independientes | Aceptada |
| [0002](0002-backend-python-fastapi.md) | Backend en Python con FastAPI | Aceptada |
| [0003](0003-clean-architecture-por-modulos.md) | Clean Architecture organizada por módulos | Aceptada |
| [0004](0004-persistencia-postgresql-sqlalchemy.md) | PostgreSQL + SQLAlchemy 2 async + Alembic | Aceptada |
| [0005](0005-frontend-nextjs.md) | Frontend en Next.js | Aceptada |
| [0006](0006-docker-first.md) | Todo corre en Docker | Aceptada |
| [0007](0007-errores-problem-details.md) | Errores con Problem Details (RFC 9457) | Aceptada |
| [0008](0008-herramientas-de-calidad.md) | Herramientas de calidad: uv, Ruff, mypy, Biome | Aceptada |
| [0009](0009-documentacion-del-api.md) | Documentación del API: OpenAPI + Scalar + Bruno | Aceptada |
| [0010](0010-estrategia-de-pruebas.md) | Estrategia de pruebas | Aceptada |
| [0011](0011-modelo-de-datos.md) | Modelo de datos, integridad y búsqueda | Aceptada |
| [0012](0012-contrato-front-back.md) | Contrato front–back y tipos generados | Propuesta |
| [0013](0013-ui-y-experiencia.md) | Librerías de UI y experiencia de usuario | Aceptada |
| [0014](0014-integracion-continua.md) | Integración continua con GitHub Actions | Propuesta |
