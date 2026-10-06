# ADR 0006 — Todo corre en Docker

**Estado:** Aceptada

## Contexto

El enunciado pide Dockerfile(s) y Docker Compose para que otra persona levante la solución siguiendo el README. Además, se busca no instalar Python, Node ni Postgres en la máquina de desarrollo.

## Decisión

El host solo necesita **Docker** y **make**. Todo (ejecutar, testear, formatear, migrar) corre en contenedores.

- **Un Dockerfile multi-stage por aplicación**, con un stage `dev` (dependencias de desarrollo y recarga en caliente) y uno `runtime` (imagen mínima, usuario sin privilegios).
- **`compose.yml`:** el sistema completo con imágenes de producción. Orden: `db` (healthy) → `migrate` (termina bien) → `api` (healthy) → `web`.
- **`compose.dev.yml`:** overrides de desarrollo: stage `dev`, puerto de Postgres expuesto y **Compose Watch** (sincroniza el código y reconstruye si cambian las dependencias).
- **Servicio `migrate`:** las migraciones corren una vez antes del API, no dentro de su arranque, para que varias réplicas del API no compitan migrando.
- **`Makefile`:** comandos cortos para todas las tareas (`make up`, `make dev`, `make check`...).
- Los Dockerfiles no usan funciones exclusivas de BuildKit (`--mount=type=cache`), para que funcionen con cualquier instalación de Docker.

## Alternativas consideradas

- **Solo la base de datos en Docker y el código en el host:** recarga más rápida y mejor integración con el editor, pero exige instalar Python, uv, Node y pnpm.
- **Bind mounts en lugar de Compose Watch:** problemas de permisos y de rendimiento con `node_modules` y entornos virtuales.
- **Dev Containers:** posible mejora futura para tener autocompletado en el editor sin instalar nada en el host.

## Consecuencias

- Levantar el proyecto en otra máquina es `make up`.
- El editor no tiene las dependencias instaladas localmente: el autocompletado de librerías es limitado sin Dev Containers.
- Los archivos generados dentro de un contenedor (migraciones, formateo) se escriben montando la carpeta y usando el UID del usuario del host, para no dejar archivos de root.
