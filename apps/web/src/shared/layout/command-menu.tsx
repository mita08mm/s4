"use client";

import {
  BookOpenIcon,
  HouseIcon,
  SearchIcon,
  SunMoonIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/command";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";

const PAGES = [
  { label: "Inicio", href: "/", icon: HouseIcon },
  { label: "Estudiantes", href: "/students", icon: UsersIcon },
  { label: "Clases", href: "/classes", icon: BookOpenIcon },
];

/** Global command palette, opened with ⌘K / Ctrl+K from any page. */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 text-sm text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-foreground"
      >
        <SearchIcon className="size-4" />
        <span className="hidden sm:inline">Buscar</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Buscar"
        description="Navega o ejecuta una acción"
      >
        {/* CommandDialog only provides the dialog; <Command> provides the search context. */}
        <Command>
          <CommandInput placeholder="Escribe un comando o busca…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup heading="Ir a">
              {PAGES.map(({ label, href, icon: Icon }) => (
                <CommandItem
                  key={href}
                  onSelect={() => run(() => router.push(href))}
                >
                  <Icon />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Preferencias">
              <CommandItem
                onSelect={() =>
                  run(() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark"),
                  )
                }
              >
                <SunMoonIcon />
                Cambiar tema
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
