# ADR 0014 — Integración continua con GitHub Actions

**Estado:** Aceptada

## Contexto

Las pruebas y los chequeos de calidad solo aportan evidencia si se ejecutan siempre, no solo en la máquina del autor.

## Decisión

Un workflow de GitHub Actions que, en cada push y pull request, ejecute lo mismo que `make check`:

1. Lint, formato y tipos del backend (Ruff, mypy).
2. Tests del backend.
3. Lint y tipos del frontend (Biome, tsc).
4. En un segundo job: build y arranque del sistema con imágenes de producción (`make up`), colección de Bruno (`make api-collection`) y tests E2E (`make e2e`). Si algo falla, se publican los logs de los servicios y el reporte de Playwright.

Como usa los mismos comandos `make` que el desarrollo local, no hay diferencias entre lo que pasa en local y en CI.
