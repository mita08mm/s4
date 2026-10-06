# ADR 0013 — Librerías de UI y experiencia de usuario

**Estado:** Aceptada (formularios pendientes)

## Contexto

Se evalúan usabilidad, navegación, formularios, feedback y claridad. Además, se busca una interfaz minimalista y moderna, con mucha interacción y movimiento, que no parezca generada por una plantilla.

## Decisión (parcial)

| Necesidad | Elección | Estado |
|---|---|---|
| Sistema de componentes | **shadcn/ui** (base Radix, preset Nova, íconos Lucide) | Instalado |
| Unión de clases Tailwind | **cn** (paquete oficial de shadcn; reemplaza `clsx` + `tailwind-merge`) | Instalado |
| Tokens de diseño | **Tema de VengeanceUI** (`--vng-*`: colores, radios, espaciado, velocidad de transición), conectado a los tokens de shadcn | Instalado |
| Micro-interacciones | Componentes de **Skiper UI** (por ejemplo, `skiper40`: enlaces con subrayado animado) | Instalado |
| Animaciones | **Motion** (`framer-motion`), con `MotionConfig reducedMotion="user"` global | Instalado |
| Navegación | `SpotlightNav`, adaptado de VengeanceUI *spotlight-navbar*: una luz sigue al cursor y un brillo marca la ruta activa | Instalado |
| Cambio de tema | `ThemeToggle` con revelado circular (View Transitions API), idea de Skiper UI *skiper26*; `next-themes` | Instalado |
| Bordes con desenfoque | `ProgressiveBlur`, adaptado de Skiper UI *skiper41* | Instalado |
| Paleta de comandos ⌘K | `command` de shadcn (cmdk) | Instalado |
| Números animados | `@number-flow/react` (como Skiper UI *skiper37*) | Instalado, para contadores |
| Notificaciones | Sonner (`sonner` de shadcn) | Instalado |
| Estados vacíos, tablas, paneles | `empty`, `table`, `sheet`, `dialog`, `field`, `input`, `kbd`, `badge`, `tooltip`, `skeleton` de shadcn | Instalado |
| Formularios y validación | React Hook Form + Zod | Pendiente |

Reglas:

- Los componentes se copian al código del proyecto con `shadcn add`, ejecutado en Docker. Antes de agregarlos se revisa su contenido: el código pasa a ser nuestro.
- Todo componente de UI vive en `src/shared/ui/` (los alias de `components.json` apuntan ahí). Si un registro trae una ruta fija distinta, se mueve a `shared/ui/`.
- Los colores y radios se cambian en un solo lugar: las variables `--vng-*` de `globals.css`.
- Las animaciones deben respetar `prefers-reduced-motion`.
- Los componentes de los registros son demos: se adaptan antes de usarlos (rutas de Next.js en lugar de `<a href="#">`, tokens del tema en lugar de colores fijos, sin imports a archivos inexistentes). Por ejemplo, el *notch-navbar* de VengeanceUI se descartó porque depende de archivos que no trae.
- Lenguaje de movimiento común: entradas con *fade + subida + desenfoque* y curva `cubic-bezier(0.22, 1, 0.36, 1)`; interacciones con *springs*.
- Componentes descartados por peso: los que dependen de GSAP o Three.js.

## Descartado

- **CLI de agente y servidor MCP de VengeanceUI** (`vengeanceui init`): instala un servidor MCP que se ejecuta con `npx -y` en cada sesión del asistente, sin versión fijada. No aporta al producto y suma una dependencia de ejecución no auditada. Los componentes se agregan con `shadcn add`, que es suficiente.
