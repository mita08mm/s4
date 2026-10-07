"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ClassSheet } from "@/features/classes/components/class-sheet";
import { ClassesGrid } from "@/features/classes/components/classes-grid";
import { DeleteClassDialog } from "@/features/classes/components/delete-class-dialog";
import type { SchoolClass } from "@/features/classes/types";
import type { Page } from "@/shared/lib/api-client";
import { isTyping } from "@/shared/lib/keyboard";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import { PaginationLinks } from "@/shared/ui/pagination-links";
import { SEARCH_HINT, UrlSearchInput } from "@/shared/ui/url-search-input";

type ClassesViewProps = {
  result: Page<SchoolClass>;
  query: string;
};

// Kept after closing so the content does not vanish during the exit animation.
type Selection = { open: boolean; schoolClass: SchoolClass | null };
const CLOSED: Selection = { open: false, schoolClass: null };

export function ClassesView({ result, query }: ClassesViewProps) {
  const [editor, setEditor] = useState<Selection>(CLOSED);
  const [deletion, setDeletion] = useState<Selection>(CLOSED);

  const openCreate = () => setEditor({ open: true, schoolClass: null });

  // "N" opens the create panel from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "n" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      setEditor({ open: true, schoolClass: null });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const hrefFor = (page: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    return `/classes?${params}`;
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">
            Clases
          </h1>
          <p className="mt-2 text-muted-foreground">
            <NumberFlow
              value={result.total}
              className="font-medium text-foreground tabular-nums"
            />{" "}
            {query
              ? result.total === 1
                ? "resultado"
                : "resultados"
              : "en total"}
          </p>
        </div>
        <Button onClick={openCreate} size="lg" className="rounded-full pr-2.5">
          <PlusIcon />
          Nueva clase
          <Kbd className="ml-1 bg-background/20 text-primary-foreground">N</Kbd>
        </Button>
      </motion.header>

      <UrlSearchInput
        defaultValue={query}
        label="Buscar clases"
        placeholder="Buscar por código, título o descripción…"
        hint={SEARCH_HINT}
      />

      <ClassesGrid
        classes={result.items}
        query={query}
        onCreate={openCreate}
        onEdit={(schoolClass) => setEditor({ open: true, schoolClass })}
        onDelete={(schoolClass) => setDeletion({ open: true, schoolClass })}
      />

      <PaginationLinks
        page={result.page}
        size={result.size}
        total={result.total}
        hrefFor={hrefFor}
      />

      <ClassSheet
        open={editor.open}
        schoolClass={editor.schoolClass}
        onOpenChange={(open) => setEditor((current) => ({ ...current, open }))}
      />
      <DeleteClassDialog
        open={deletion.open}
        schoolClass={deletion.schoolClass}
        onOpenChange={(open) =>
          setDeletion((current) => ({ ...current, open }))
        }
      />
    </>
  );
}
