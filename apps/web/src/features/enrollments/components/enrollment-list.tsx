"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Link from "next/link";

import type { EnrollmentItem } from "@/features/enrollments/types";
import { Button } from "@/shared/ui/button";

const DATE = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type EnrollmentListProps = {
  items: EnrollmentItem[];
  removeLabel: (item: EnrollmentItem) => string;
  onRemove: (item: EnrollmentItem) => void;
};

export function EnrollmentList({
  items,
  removeLabel,
  onRemove,
}: EnrollmentListProps) {
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                delay: index * 0.03,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              opacity: 0,
              x: 24,
              filter: "blur(4px)",
              transition: { duration: 0.2 },
            }}
            className="group relative flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:border-foreground/20"
          >
            <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
              {item.code}
            </span>
            <Link
              href={item.href}
              className="flex min-w-0 flex-1 flex-col outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
            >
              <span className="truncate font-medium">{item.title}</span>
              {item.subtitle && (
                <span className="truncate text-sm text-muted-foreground">
                  {item.subtitle}
                </span>
              )}
            </Link>
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              desde {DATE.format(new Date(item.enrolledAt))}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={removeLabel(item)}
              onClick={() => onRemove(item)}
              className="relative z-10 shrink-0 opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive"
            >
              <XIcon />
            </Button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
