# ADR 0014 — Integración continua con GitHub Actions

**Estado:** Propuesta

## Contexto

Las pruebas y los chequeos de calidad solo aportan evidencia si se ejecutan siempre, no solo en la máquina del autor.

## Propuesta

Un workflow de GitHub Actions que, en cada push y pull request, ejecute lo mismo que `make check`:

1. Lint, formato y tipos del backend (Ruff, mypy).
2. Tests del backend.
3. Lint y tipos del frontend (Biome, tsc).
4. Build de las imágenes de producción (`docker compose build`).

Como usa los mismos comandos `make` que el desarrollo local, no hay diferencias entre lo que pasa en local y en CI.
