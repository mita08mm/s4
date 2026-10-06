# ADR 0011 — Modelo de datos, integridad y búsqueda

**Estado:** Propuesta

## Contexto

Un estudiante puede tomar varias clases y una clase tiene varios estudiantes. En la defensa técnica se pregunta qué ocurre ante eliminaciones y duplicados.

## Propuesta

```
students                       classes                        enrollments
id          uuid PK            id          uuid PK            student_id  FK → students ON DELETE CASCADE
student_id  varchar UNIQUE     code        varchar UNIQUE     class_id    FK → classes  ON DELETE CASCADE
first_name  varchar            title       varchar            enrolled_at timestamptz
last_name   varchar            description text NULL          PK (student_id, class_id)
email       varchar UNIQUE     created_at, updated_at
created_at, updated_at
```

- **Campos de `Student`** (el enunciado no los define): código, nombre, apellido y **email obligatorio y único**. El email hace la búsqueda más útil y es un segundo caso de duplicado que la API debe rechazar con 409.
- **`description` de la clase es opcional.** El enunciado exige mostrar código, título y descripción, no que la descripción sea obligatoria.
- **Identificador técnico (uuid) separado del de negocio** (`student_id`, `code`): el código visible se puede editar sin romper relaciones.
- **Duplicados:** `UNIQUE` en `student_id` y `code`; clave primaria compuesta en `enrollments` para impedir inscripciones repetidas. Inscribir dos veces es idempotente (`PUT`).
- **Eliminaciones:** al borrar un estudiante o una clase se borran sus inscripciones (`ON DELETE CASCADE`), nunca la otra entidad.
- **Búsqueda:** coincidencia parcial sin distinguir mayúsculas (`ILIKE`) sobre los campos de texto, con paginación. Mejora posible: `pg_trgm` con índice GIN.

## Decisiones pendientes

- Validaciones exactas (longitudes, formato del código y del email).
- Dónde se confirma la transacción: al final de cada request (en la dependencia de sesión) o con un *Unit of Work* explícito invocado por el caso de uso.
- Datos de prueba (seed) reproducibles e idempotentes.
