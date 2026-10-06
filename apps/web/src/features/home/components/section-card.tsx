"use client";

import { motion } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";

type SectionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
};

/** Navigation card with a light that follows the pointer. */
export function SectionCard({
  href,
  title,
  description,
  icon,
  index,
}: SectionCardProps) {
  const trackPointer = (event: PointerEvent<HTMLAnchorElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: 0.7 + index * 0.1,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={href}
        onPointerMove={trackPointer}
        className="group relative block overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-[border-color,transform] duration-300 outline-none hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.99]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--x) var(--y), color-mix(in oklch, var(--foreground) 7%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex items-start justify-between">
          <span className="grid size-10 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors duration-300 group-hover:text-foreground [&_svg]:size-5">
            {icon}
          </span>
          <ArrowUpRightIcon className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </div>
        <h2 className="relative mt-12 text-xl font-medium tracking-tight">
          {title}
        </h2>
        <p className="relative mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </Link>
    </motion.div>
  );
}
