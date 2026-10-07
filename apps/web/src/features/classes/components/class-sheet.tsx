"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createClass, updateClass } from "@/features/classes/actions";
import {
  type ClassField,
  type ClassInput,
  classSchema,
  DESCRIPTION_MAX,
} from "@/features/classes/schemas";
import type { SchoolClass } from "@/features/classes/types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Spinner } from "@/shared/ui/spinner";
import { Textarea } from "@/shared/ui/textarea";

const EMPTY: ClassInput = { code: "", title: "", description: "" };

function toValues(schoolClass: SchoolClass | null): ClassInput {
  if (!schoolClass) return EMPTY;
  return {
    code: schoolClass.code,
    title: schoolClass.title,
    description: schoolClass.description ?? "",
  };
}

type ClassSheetProps = {
  open: boolean;
  /** `null` creates a new class. */
  schoolClass: SchoolClass | null;
  onOpenChange: (open: boolean) => void;
};

export function ClassSheet({
  open,
  schoolClass,
  onOpenChange,
}: ClassSheetProps) {
  const isEdit = schoolClass !== null;
  const form = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: toValues(schoolClass),
  });
  const { isSubmitting } = useFormState({ control: form.control });
  const description = useWatch({ control: form.control, name: "description" });

  useEffect(() => {
    if (open) form.reset(toValues(schoolClass));
  }, [open, schoolClass, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = isEdit
      ? await updateClass(schoolClass.id, values)
      : await createClass(values);

    if (!result.ok) {
      const fields = Object.entries(result.fieldErrors) as [
        ClassField,
        string,
      ][];
      for (const [field, message] of fields) form.setError(field, { message });
      if (fields.length === 0) toast.error(result.message);
      return;
    }

    toast.success(isEdit ? "Cambios guardados" : "Clase creada", {
      description: values.title,
    });
    onOpenChange(false);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="p-6">
          <SheetTitle className="text-xl tracking-tight">
            {isEdit ? "Editar clase" : "Nueva clase"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Actualiza los datos de ${schoolClass.title}.`
              : "El código debe ser único."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="class-form"
          onSubmit={onSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-2"
        >
          <FieldGroup className="gap-5">
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <FieldLabel htmlFor="code">Código</FieldLabel>
                  <Input
                    {...field}
                    id="code"
                    placeholder="MAT-101"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    className="h-10 rounded-lg font-mono uppercase placeholder:normal-case"
                  />
                  <FieldMessage message={fieldState.error?.message} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <FieldLabel htmlFor="title">Título</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Matemáticas I"
                    aria-invalid={fieldState.invalid}
                    className="h-10 rounded-lg"
                  />
                  <FieldMessage message={fieldState.error?.message} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <FieldLabel htmlFor="description">
                      Descripción{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FieldLabel>
                    <span
                      className={cn(
                        "text-xs tabular-nums text-muted-foreground",
                        description.length > DESCRIPTION_MAX &&
                          "text-destructive",
                      )}
                    >
                      {description.length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                  <Textarea
                    {...field}
                    id="description"
                    rows={5}
                    placeholder="De qué trata la clase…"
                    aria-invalid={fieldState.invalid}
                    className="resize-none rounded-lg"
                  />
                  <FieldMessage message={fieldState.error?.message} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <SheetClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </SheetClose>
          <Button
            type="submit"
            form="class-form"
            disabled={isSubmitting}
            className="min-w-36"
          >
            {isSubmitting && <Spinner />}
            {isEdit ? "Guardar cambios" : "Crear clase"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FieldMessage({ message }: { message: string | undefined }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-destructive"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
