"use client";

import { motion } from "framer-motion";
import { MailIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

import { StudentSheet } from "@/features/students/components/student-sheet";
import type { Student } from "@/features/students/types";
import { BackLink } from "@/shared/ui/back-link";
import { Button } from "@/shared/ui/button";

export function StudentProfile({ student }: { student: Student }) {
  const [editing, setEditing] = useState(false);
  const initials =
    `${student.first_name[0] ?? ""}${student.last_name[0] ?? ""}`.toUpperCase();

  return (
    <header className="flex flex-col gap-6">
      <BackLink href="/students" label="Estudiantes" />
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-center gap-5"
      >
        <motion.span
          initial={{ scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid size-16 place-items-center rounded-2xl bg-foreground text-xl font-semibold text-background"
        >
          {initials}
        </motion.span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="truncate text-4xl font-semibold tracking-tighter">
            {student.first_name} {student.last_name}
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {student.code}
            </span>
            <a
              href={`mailto:${student.email}`}
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <MailIcon className="size-3.5" />
              {student.email}
            </a>
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setEditing(true)}
        >
          <PencilIcon />
          Editar
        </Button>
      </motion.div>
      <StudentSheet
        open={editing}
        student={student}
        onOpenChange={setEditing}
      />
    </header>
  );
}
