"use client";

import { Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteStudent } from "@/features/students/actions";
import type { Student } from "@/features/students/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Spinner } from "@/shared/ui/spinner";

type DeleteStudentDialogProps = {
  open: boolean;
  student: Student | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteStudentDialog({
  open,
  student,
  onOpenChange,
}: DeleteStudentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const name = student ? `${student.first_name} ${student.last_name}` : "";

  const confirm = () => {
    if (!student) return;
    startTransition(async () => {
      const result = await deleteStudent(student.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Estudiante eliminado", { description: name });
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Eliminar a {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            También se eliminarán sus inscripciones. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault(); // keep the dialog open until the request finishes
              confirm();
            }}
          >
            {isPending && <Spinner />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
