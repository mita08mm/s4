# ADR 0013 — Librerías de UI y experiencia de usuario

**Estado:** Propuesta (base instalada; falta definir animaciones y formularios)

## Contexto

Se evalúan usabilidad, navegación, formularios, feedback y claridad. Además, se busca una interfaz minimalista y moderna, con mucha interacción y movimiento, que no parezca generada por una plantilla.

## Decisión (parcial)

| Necesidad | Elección | Estado |
|---|---|---|
| Sistema de componentes | **shadcn/ui** (base Radix, preset Nova, íconos Lucide) | Instalado |
| Unión de clases Tailwind | **cn** (paquete oficial de shadcn; reemplaza `clsx` + `tailwind-merge`) | Instalado |
| Tokens de diseño | **Tema de VengeanceUI** (`--vng-*`: colores, radios, espaciado, velocidad de transición), conectado a los tokens de shadcn | Instalado |
| Micro-interacciones | Componentes de **Skiper UI** (por ejemplo, `skiper40`: enlaces con subrayado animado) | Instalado |
| Animaciones | Motion (`framer-motion`), que usan los componentes animados de VengeanceUI | Pendiente: se instala con el primer componente que lo requiera |
| Formularios y validación | React Hook Form + Zod | Pendiente |
| Notificaciones | Sonner | Pendiente |

Reglas:

- Los componentes se copian al código del proyecto con `shadcn add`, ejecutado en Docker. Antes de agregarlos se revisa su contenido: el código pasa a ser nuestro.
- Todo componente de UI vive en `src/shared/ui/` (los alias de `components.json` apuntan ahí). Si un registro trae una ruta fija distinta, se mueve a `shared/ui/`.
- Los colores y radios se cambian en un solo lugar: las variables `--vng-*` de `globals.css`.
- Las animaciones deben respetar `prefers-reduced-motion`.

## Descartado

- **CLI de agente y servidor MCP de VengeanceUI** (`vengeanceui init`): instala un servidor MCP que se ejecuta con `npx -y` en cada sesión del asistente, sin versión fijada. No aporta al producto y suma una dependencia de ejecución no auditada. Los componentes se agregan con `shadcn add`, que es suficiente.
