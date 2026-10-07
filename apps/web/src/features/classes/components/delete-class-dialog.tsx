"use client";

import { Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteClass } from "@/features/classes/actions";
import type { SchoolClass } from "@/features/classes/types";
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

type DeleteClassDialogProps = {
  open: boolean;
  schoolClass: SchoolClass | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteClassDialog({
  open,
  schoolClass,
  onOpenChange,
}: DeleteClassDialogProps) {
  const [isPending, startTransition] = useTransition();
  const title = schoolClass?.title ?? "";

  const confirm = () => {
    if (!schoolClass) return;
    startTransition(async () => {
      const result = await deleteClass(schoolClass.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Clase eliminada", { description: title });
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
          <AlertDialogTitle>¿Eliminar {title}?</AlertDialogTitle>
          <AlertDialogDescription>
            Sus estudiantes quedarán desinscritos de esta clase. Esta acción no
            se puede deshacer.
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
