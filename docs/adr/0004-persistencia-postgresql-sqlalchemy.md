# ADR 0004 — PostgreSQL + SQLAlchemy 2 async + Alembic

**Estado:** Aceptada

## Contexto

El enunciado permite base de datos o mock, pero recomienda una base real para evaluar modelado, relaciones, integridad y reproducibilidad.

## Decisión

- **PostgreSQL 18** como base de datos.
- **SQLAlchemy 2** en modo async con el driver **asyncpg**.
- **Alembic** para migraciones versionadas, con:
  - la URL tomada de la configuración validada (nunca escrita en `alembic.ini`);
  - convención de nombres para constraints (`shared/database/base.py`), para que las migraciones sean estables;
  - archivos nombrados con fecha (`AAAAMMDD_<rev>_<slug>.py`) y formateados con Ruff al generarse.
- Las migraciones se aplican en un servicio `migrate` separado ([ADR 0006](0006-docker-first.md)).

## Alternativas consideradas

- **MySQL:** válido, pero PostgreSQL ofrece mejores herramientas para la búsqueda de texto (`ILIKE`, `pg_trgm`).
- **SQLite / mock:** no permite evaluar integridad ni despliegue real.
- **SQLModel:** une el modelo de la API con el de la tabla, lo que contradice la separación de capas ([ADR 0003](0003-clean-architecture-por-modulos.md)).
- **psycopg 3:** también soporta async; asyncpg es el más usado con SQLAlchemy async y el de mejor rendimiento.

## Consecuencias

- La integridad (claves foráneas, unicidad) la garantiza la base de datos, no solo el código.
- El modelo de tablas concreto se define en [ADR 0011](0011-modelo-de-datos.md).
