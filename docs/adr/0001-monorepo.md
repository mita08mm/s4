# ADR 0001 — Monorepo con aplicaciones independientes

**Estado:** Aceptada

## Contexto

La solución tiene un backend, un frontend, infraestructura (Docker) y documentación. El enunciado pide un único repositorio Git con historial de commits.

## Decisión

Un solo repositorio con cada aplicación en `apps/<nombre>`, cada una con su propio gestor de dependencias, `Dockerfile` y documento de arquitectura. La orquestación común vive en la raíz: `compose.yml`, `Makefile` y `docs/`.

No se usa una herramienta de monorepo (Turborepo, Nx): las aplicaciones usan lenguajes distintos y no comparten código, así que `make` + Docker Compose cubren la orquestación.

## Alternativas consideradas

- **Un repositorio por aplicación:** complica la evaluación (varios repos que clonar y versionar a la vez) y los cambios que cruzan front y back.
- **pnpm workspaces + Turborepo:** útil si ambas aplicaciones fueran TypeScript y compartieran paquetes; aquí no aporta.

## Consecuencias

- Un cambio que afecta al API y a la interfaz queda en un mismo commit o PR.
- Cada aplicación sigue siendo desplegable por separado.
