# ADR 0003 — Clean Architecture organizada por módulos

**Estado:** Aceptada

## Contexto

El problema es pequeño (estudiantes, clases, inscripciones), pero la evaluación pondera modularidad, separación de responsabilidades y mantenibilidad, y pregunta cómo se agregaría una entidad nueva sin romper el sistema.

## Decisión

El backend usa **puertos y adaptadores** con cuatro capas por módulo (`domain`, `application`, `infrastructure`, `http`) bajo `src/s4/modules/<modulo>/`.

- Regla de dependencias: `http → application → domain ← infrastructure`. `domain` no importa FastAPI, Pydantic ni SQLAlchemy.
- Los puertos son `typing.Protocol`; los adaptadores los implementan con SQLAlchemy.
- Un caso de uso por acción (`CreateStudent`, `SearchStudents`, ...).
- Composición en un único lugar: `container.py`, con providers de `Depends`.
- Entidades de dominio, modelos ORM y schemas Pydantic son tipos distintos.

El frontend aplica la misma idea de forma liviana: carpetas por funcionalidad (`features/`) y piezas técnicas en `shared/`.

Detalle completo: [`apps/api/ARCHITECTURE.md`](../../apps/api/ARCHITECTURE.md).

## Alternativas consideradas

- **Capas globales** (`routers/`, `services/`, `models/`): más simple, pero cada entidad queda repartida en todo el proyecto.
- **Rutas que usan el ORM directamente:** menos código, pero mezcla HTTP, negocio y SQL y obliga a testear todo con base de datos.
- **Clean Architecture completa** (entidades ricas, eventos de dominio, CQRS): sobredimensionada para este problema.

## Consecuencias

- Los casos de uso se prueban con repositorios en memoria, sin base de datos.
- Agregar un módulo no modifica los existentes (solo se registra en `container.py` y `main.py`).
- Hay más archivos y algo de mapeo entre tipos; es el costo aceptado de la separación.
