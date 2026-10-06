# ADR 0005 — Frontend en Next.js

**Estado:** Aceptada

## Contexto

La interfaz debe permitir gestionar estudiantes, clases, inscripciones y búsquedas, con mensajes claros de éxito y error. Next.js es la tecnología de frontend que el autor domina mejor.

## Decisión

**Next.js 16** con App Router, React 19 (con React Compiler), TypeScript estricto, Tailwind CSS v4 y Biome, gestionado con pnpm.

- Las lecturas se hacen en Server Components y las escrituras con Server Actions, que llaman al API por la red interna de Docker.
- `output: "standalone"` para una imagen de producción pequeña.

Detalle: [`apps/web/ARCHITECTURE.md`](../../apps/web/ARCHITECTURE.md).

## Alternativas consideradas

- **React + Vite (SPA):** más simple, pero el navegador llamaría al API directamente (CORS, URL pública del API) y se pierde el renderizado en servidor.
- **Vue / Angular:** sin ventaja para este problema y con menos experiencia del autor.

## Consecuencias

- El navegador solo habla con Next.js; el API no necesita CORS.
- Hay que distinguir con cuidado el código de servidor y el de cliente (se usa `server-only`).
