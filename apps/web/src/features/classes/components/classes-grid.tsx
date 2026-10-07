"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookPlusIcon,
  PencilIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import type { PointerEvent } from "react";

import type { SchoolClass } from "@/features/classes/types";
import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";

type ClassesGridProps = {
  classes: SchoolClass[];
  query: string;
  onCreate: () => void;
  onEdit: (schoolClass: SchoolClass) => void;
  onDelete: (schoolClass: SchoolClass) => void;
};

/** Moves the card's light to the pointer position. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--x", `${event.clientX - rect.left}px`);
  card.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

export function ClassesGrid({
  classes,
  query,
  onCreate,
  onEdit,
  onDelete,
}: ClassesGridProps) {
  if (classes.length === 0) {
    return query ? (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Sin resultados para “{query}”</EmptyTitle>
          <EmptyDescription>
            Prueba con parte del código, del título o de la descripción.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookPlusIcon />
          </EmptyMedia>
          <EmptyTitle>Aún no hay clases</EmptyTitle>
          <EmptyDescription>
            Crea la primera para poder inscribir estudiantes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>Crear clase</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence initial={false} mode="popLayout">
        {classes.map((schoolClass, index) => (
          <motion.li
            key={schoolClass.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                delay: index * 0.04,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              filter: "blur(6px)",
              transition: { duration: 0.2 },
            }}
            onPointerMove={trackPointer}
            className="group relative flex min-h-48 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-colors duration-300 hover:border-foreground/20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(260px circle at var(--x) var(--y), color-mix(in oklch, var(--foreground) 7%, transparent), transparent 70%)",
              }}
            />
            <div className="relative flex items-start justify-between gap-2">
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
                {schoolClass.code}
              </span>
              <div className="relative z-10 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${schoolClass.title}`}
                  onClick={() => onEdit(schoolClass)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${schoolClass.title}`}
                  onClick={() => onDelete(schoolClass)}
                  className="hover:text-destructive"
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>

            {/* The link covers the whole card, so any click on it opens the detail page. */}
            <Link
              href={`/classes/${schoolClass.id}`}
              className="relative mt-auto pt-8 text-left outline-none after:absolute after:inset-0 focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
            >
              <h2 className="text-lg font-medium tracking-tight">
                {schoolClass.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {schoolClass.description ?? (
                  <span className="italic">Sin descripción</span>
                )}
              </p>
            </Link>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
