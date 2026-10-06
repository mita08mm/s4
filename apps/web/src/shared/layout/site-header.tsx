import Link from "next/link";

import { CommandMenu } from "@/shared/layout/command-menu";
import { ProgressiveBlur } from "@/shared/ui/progressive-blur";
import { SpotlightNav } from "@/shared/ui/spotlight-nav";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

const NAV_ITEMS = [
  { label: "Inicio", href: "/" },
  { label: "Estudiantes", href: "/students" },
  { label: "Clases", href: "/classes" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <ProgressiveBlur position="top" height="104px" />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-4">
        <Link
          href="/"
          className="hidden font-mono text-sm font-semibold tracking-tight sm:block"
          aria-label="S4, inicio"
        >
          S4
        </Link>
        <SpotlightNav items={NAV_ITEMS} />
        <div className="flex items-center gap-1">
          <CommandMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
