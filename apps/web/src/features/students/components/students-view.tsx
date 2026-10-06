"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DeleteStudentDialog } from "@/features/students/components/delete-student-dialog";
import { StudentSearch } from "@/features/students/components/student-search";
import { StudentSheet } from "@/features/students/components/student-sheet";
import { StudentsTable } from "@/features/students/components/students-table";
import type { Student } from "@/features/students/types";
import type { Page } from "@/shared/lib/api-client";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import { PaginationLinks } from "@/shared/ui/pagination-links";

type StudentsViewProps = {
  result: Page<Student>;
  query: string;
};

// The selected student is kept after closing, so the content does not
// disappear while the panel or dialog animates out.
type Selection = { open: boolean; student: Student | null };
const CLOSED: Selection = { open: false, student: null };

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function StudentsView({ result, query }: StudentsViewProps) {
  const [editor, setEditor] = useState<Selection>(CLOSED);
  const [deletion, setDeletion] = useState<Selection>(CLOSED);

  const openCreate = () => setEditor({ open: true, student: null });
  const openEdit = (student: Student) => setEditor({ open: true, student });
  const openDelete = (student: Student) => setDeletion({ open: true, student });

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
      setEditor({ open: true, student: null });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const hrefFor = (page: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    return `/students?${params}`;
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
            Estudiantes
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
          Nuevo estudiante
          <Kbd className="ml-1 bg-background/20 text-primary-foreground">N</Kbd>
        </Button>
      </motion.header>

      <StudentSearch defaultValue={query} />

      <StudentsTable
        students={result.items}
        query={query}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <PaginationLinks
        page={result.page}
        size={result.size}
        total={result.total}
        hrefFor={hrefFor}
      />

      <StudentSheet
        open={editor.open}
        student={editor.student}
        onOpenChange={(open) => setEditor((current) => ({ ...current, open }))}
      />
      <DeleteStudentDialog
        open={deletion.open}
        student={deletion.student}
        onOpenChange={(open) =>
          setDeletion((current) => ({ ...current, open }))
        }
      />
    </>
  );
}
