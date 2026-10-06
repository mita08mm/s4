"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import {
  type Control,
  Controller,
  useForm,
  useFormState,
} from "react-hook-form";
import { toast } from "sonner";

import { createStudent, updateStudent } from "@/features/students/actions";
import {
  type StudentField,
  type StudentInput,
  studentSchema,
} from "@/features/students/schemas";
import type { Student } from "@/features/students/types";
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

const EMPTY: StudentInput = {
  code: "",
  first_name: "",
  last_name: "",
  email: "",
};

function toValues(student: Student | null): StudentInput {
  if (!student) return EMPTY;
  const { code, first_name, last_name, email } = student;
  return { code, first_name, last_name, email };
}

type StudentSheetProps = {
  open: boolean;
  /** `null` creates a new student. */
  student: Student | null;
  onOpenChange: (open: boolean) => void;
};

export function StudentSheet({
  open,
  student,
  onOpenChange,
}: StudentSheetProps) {
  const isEdit = student !== null;
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: toValues(student),
  });
  const { isSubmitting } = useFormState({ control: form.control });

  // Load the selected student (or a blank form) every time the panel opens.
  useEffect(() => {
    if (open) form.reset(toValues(student));
  }, [open, student, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = isEdit
      ? await updateStudent(student.id, values)
      : await createStudent(values);

    if (!result.ok) {
      const fields = Object.entries(result.fieldErrors) as [
        StudentField,
        string,
      ][];
      for (const [field, message] of fields) form.setError(field, { message });
      if (fields.length === 0) toast.error(result.message);
      return;
    }

    toast.success(isEdit ? "Cambios guardados" : "Estudiante creado", {
      description: `${values.first_name} ${values.last_name}`,
    });
    onOpenChange(false);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="p-6">
          <SheetTitle className="text-xl tracking-tight">
            {isEdit ? "Editar estudiante" : "Nuevo estudiante"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Actualiza los datos de ${student.first_name} ${student.last_name}.`
              : "El código y el email deben ser únicos."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="student-form"
          onSubmit={onSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-2"
        >
          <FieldGroup className="gap-5">
            <TextField
              control={form.control}
              name="code"
              label="Código"
              placeholder="A00123"
              autoComplete="off"
              className="font-mono uppercase placeholder:normal-case"
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                control={form.control}
                name="first_name"
                label="Nombre"
                autoComplete="given-name"
              />
              <TextField
                control={form.control}
                name="last_name"
                label="Apellido"
                autoComplete="family-name"
              />
            </div>
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="nombre@s4.edu"
              autoComplete="email"
            />
          </FieldGroup>
        </form>

        <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
          <SheetClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </SheetClose>
          <Button
            type="submit"
            form="student-form"
            disabled={isSubmitting}
            className="min-w-36"
          >
            {isSubmitting && <Spinner />}
            {isEdit ? "Guardar cambios" : "Crear estudiante"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type TextFieldProps = {
  control: Control<StudentInput>;
  name: StudentField;
  label: string;
} & Omit<ComponentProps<typeof Input>, "name">;

/** Input bound to the form, with its error animated in and out below it. */
function TextField({
  control,
  name,
  label,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...field}
            {...inputProps}
            id={name}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.error ? `${name}-error` : undefined}
            className={cn("h-10 rounded-lg", className)}
          />
          <AnimatePresence initial={false}>
            {fieldState.error && (
              <motion.p
                id={`${name}-error`}
                role="alert"
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-destructive"
              >
                {fieldState.error.message}
              </motion.p>
            )}
          </AnimatePresence>
        </Field>
      )}
    />
  );
}
