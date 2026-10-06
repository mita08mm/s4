"use client";

import { motion } from "framer-motion";

import type { ApiStatus } from "@/features/home/queries";
import { cn } from "@/shared/lib/utils";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const HEADLINE = ["Estudiantes,", "clases", "e", "inscripciones."];

/** Fade + rise + unblur, the entrance used across the page. */
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { delay, duration: 0.7, ease: EASE_OUT },
});

export function Hero({ apiStatus }: { apiStatus: ApiStatus }) {
  const online = apiStatus === "online";

  return (
    <section className="flex flex-col items-start gap-6">
      <motion.span
        {...reveal(0)}
        className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 font-mono text-xs text-muted-foreground"
      >
        <span className="relative flex size-2">
          {online && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              online ? "bg-emerald-500" : "bg-red-500",
            )}
          />
        </span>
        API {online ? "conectada" : "sin conexión"}
      </motion.span>

      <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance sm:text-7xl">
        {HEADLINE.map((word, index) => (
          <motion.span
            key={word}
            {...reveal(0.1 + index * 0.08)}
            className="mr-[0.22em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        {...reveal(0.5)}
        className="max-w-xl text-lg text-muted-foreground"
      >
        Super Simple Scheduling System. Quién toma qué clase, en un solo lugar.
      </motion.p>

      <motion.p
        {...reveal(0.6)}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        Presiona
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        para buscar o navegar.
      </motion.p>
    </section>
  );
}
