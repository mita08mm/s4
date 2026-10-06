"use client";

// Adapted from VengeanceUI "spotlight-navbar": a soft light follows the
// pointer and a glow rests under the active route, both moved with springs.
import { animate } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PointerEvent, useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils";

export type SpotlightNavItem = { label: string; href: string };

const SPRING = { type: "spring", stiffness: 200, damping: 20 } as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Horizontal center of the item at `index`, relative to the nav. */
function itemCenter(nav: HTMLElement, index: number): number | null {
  const item = nav.querySelector<HTMLElement>(`[data-index="${index}"]`);
  if (!item) return null;
  const navRect = nav.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return itemRect.left - navRect.left + itemRect.width / 2;
}

export function SpotlightNav({
  items,
  className,
}: {
  items: SpotlightNavItem[];
  className?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const spotlightX = useRef(0);
  const ambienceX = useRef(0);
  const pathname = usePathname();
  const activeIndex = items.findIndex((item) => isActive(pathname, item.href));

  // Move the glow under the active route whenever the route changes.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const target = itemCenter(nav, activeIndex);
    nav.style.setProperty("--ambience-opacity", target === null ? "0" : "1");
    if (target === null) return;
    const controls = animate(ambienceX.current, target, {
      ...SPRING,
      onUpdate: (x) => {
        ambienceX.current = x;
        nav.style.setProperty("--ambience-x", `${x}px`);
      },
    });
    return () => controls.stop();
  }, [activeIndex]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const nav = event.currentTarget;
    const x = event.clientX - nav.getBoundingClientRect().left;
    spotlightX.current = x;
    nav.style.setProperty("--spotlight-x", `${x}px`);
    nav.style.setProperty("--spotlight-opacity", "1");
  };

  // When the pointer leaves, the light springs back to the active route.
  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    const nav = event.currentTarget;
    nav.style.setProperty("--spotlight-opacity", "0");
    const target = itemCenter(nav, activeIndex);
    if (target === null) return;
    animate(spotlightX.current, target, {
      ...SPRING,
      onUpdate: (x) => {
        spotlightX.current = x;
        nav.style.setProperty("--spotlight-x", `${x}px`);
      },
    });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Principal"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative h-11 overflow-hidden rounded-full border border-border/70 bg-background/70 shadow-sm backdrop-blur-md",
        "[--ambience-color:rgb(0_0_0/0.85)] [--spotlight-color:rgb(0_0_0/0.08)]",
        "dark:[--ambience-color:rgb(255_255_255)] dark:[--spotlight-color:rgb(255_255_255/0.14)]",
        className,
      )}
    >
      <ul className="relative z-10 flex h-full items-center px-1.5">
        {items.map((item, index) => (
          <li key={item.href} className="flex h-full items-center">
            <Link
              href={item.href}
              data-index={index}
              aria-current={index === activeIndex ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-4",
                index === activeIndex
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300"
        style={{
          opacity: "var(--spotlight-opacity, 0)",
          background:
            "radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color) 0%, transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-0.5 transition-opacity duration-300"
        style={{
          opacity: "var(--ambience-opacity, 0)",
          background:
            "radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color) 0%, transparent 100%)",
        }}
      />
    </nav>
  );
}
