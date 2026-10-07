# ADR 0011 — Modelo de datos, integridad y búsqueda

**Estado:** Aceptada (implementado: `students`, `classes`; pendiente: `enrollments`)

## Contexto

Un estudiante puede tomar varias clases y una clase tiene varios estudiantes. En la defensa técnica se pregunta qué ocurre ante eliminaciones y duplicados.

## Decisión

```
students                       classes                        enrollments
id          uuid v7 PK         id          uuid v7 PK            student_id  FK → students ON DELETE CASCADE
code        varchar UNIQUE     code        varchar UNIQUE     class_id    FK → classes  ON DELETE CASCADE
first_name  varchar            title       varchar            enrolled_at timestamptz
last_name   varchar            description text NULL          PK (student_id, class_id)
email       varchar UNIQUE     created_at, updated_at
created_at, updated_at
```

- **Campos de `Student`** (el enunciado no los define): `code`, nombre, apellido y **email obligatorio y único**. Se usa `code` (no `student_id`) para no confundirlo con la columna `student_id` de `enrollments`, y por simetría con `classes.code`. El email hace la búsqueda más útil y es un segundo caso de duplicado que la API debe rechazar con 409.
- **Nombre interno `SchoolClass`:** en Python la entidad de clase se llama `SchoolClass` (`class Class:` se lee confuso); la tabla y la API siguen siendo `classes`.
- **`description` de la clase es opcional:** el enunciado exige mostrar código, título y descripción, no que la descripción sea obligatoria. En un `PATCH`, omitirla la conserva y enviarla como `null` la borra. El dominio distingue ambos casos con el centinela `UNSET` (`SchoolClassChanges`). Una descripción en blanco se guarda como `NULL`.
- **Validaciones de `Class`:** `code` con las mismas reglas que el de estudiante; `title` de 1 a 150 caracteres; `description` de hasta 1000.
- **Identificador técnico separado del de negocio** (`code`): el código visible se puede editar sin romper relaciones. El id es **UUID v7** (`uuid.uuid7` de Python 3.14): es ordenable por tiempo, así los registros nuevos se agregan al final del índice de la clave primaria.
- **Normalización:** `code` se guarda en mayúsculas y `email` en minúsculas, así la unicidad no distingue mayúsculas.
- **Duplicados:** `UNIQUE` en `student_id` y `code`; clave primaria compuesta en `enrollments` para impedir inscripciones repetidas. Inscribir dos veces es idempotente (`PUT`).
- **Eliminaciones:** al borrar un estudiante o una clase se borran sus inscripciones (`ON DELETE CASCADE`), nunca la otra entidad.
- **Búsqueda:** el parámetro `q` se divide en palabras y **cada palabra debe aparecer** (coincidencia parcial, sin distinguir mayúsculas, `ILIKE`) en alguno de los campos de texto; para estudiantes: código, nombre, apellido y email. `%` y `_` se tratan como texto literal. Resultados paginados (`page`, `size` ≤ 100) y ordenados por apellido, nombre y código. No ignora tildes (mejora posible: extensión `unaccent`); para grandes volúmenes, `pg_trgm` con índice GIN.
- **Transacciones:** *Unit of Work* explícito. Los repositorios nunca confirman; el caso de uso llama a `UnitOfWork.commit()` cuando termina. Si falla antes, la sesión se cierra sin confirmar.

## Validaciones de `Student`

| Campo | Regla |
|---|---|
| `code` | 3–20 caracteres, letras, números o guiones |
| `first_name`, `last_name` | 1–100 caracteres (se recortan espacios) |
| `email` | Formato de email válido, máximo 254 caracteres |

## Datos de prueba

`s4.shared.database.seed` inserta datos de demostración con `ON CONFLICT DO NOTHING`, así que se puede ejecutar varias veces. Lo corre el servicio `migrate` después de las migraciones.
