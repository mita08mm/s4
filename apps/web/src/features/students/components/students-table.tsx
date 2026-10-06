"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  PencilIcon,
  SearchXIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";

import type { Student } from "@/features/students/types";
import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

const MotionRow = motion.create(TableRow);

type StudentsTableProps = {
  students: Student[];
  query: string;
  onCreate: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
};

function initials(student: Student) {
  return `${student.first_name[0] ?? ""}${student.last_name[0] ?? ""}`.toUpperCase();
}

export function StudentsTable({
  students,
  query,
  onCreate,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  if (students.length === 0) {
    return query ? (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Sin resultados para “{query}”</EmptyTitle>
          <EmptyDescription>
            Prueba con menos palabras o con parte del código o email.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlusIcon />
          </EmptyMedia>
          <EmptyTitle>Aún no hay estudiantes</EmptyTitle>
          <EmptyDescription>
            Crea el primero para empezar a inscribirlo en clases.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>Crear estudiante</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-28 pl-4">Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false} mode="popLayout">
            {students.map((student, index) => (
              <MotionRow
                key={student.id}
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
                  x: -12,
                  filter: "blur(4px)",
                  transition: { duration: 0.2 },
                }}
                className="group relative"
              >
                <TableCell className="pl-4">
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {student.code}
                  </span>
                </TableCell>
                <TableCell>
                  {/* The button covers the whole row, so any click on it opens the editor. */}
                  <button
                    type="button"
                    onClick={() => onEdit(student)}
                    className="flex items-center gap-3 text-left outline-none after:absolute after:inset-0 focus-visible:after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-medium text-background">
                      {initials(student)}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-medium">
                        {student.first_name} {student.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {student.email}
                      </span>
                    </span>
                  </button>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {student.email}
                </TableCell>
                <TableCell>
                  <div className="relative z-10 flex justify-end gap-1 pr-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar a ${student.first_name} ${student.last_name}`}
                      onClick={() => onEdit(student)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar a ${student.first_name} ${student.last_name}`}
                      onClick={() => onDelete(student)}
                      className="hover:text-destructive"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </MotionRow>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
