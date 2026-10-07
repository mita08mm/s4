import { z } from "zod";

export const DESCRIPTION_MAX = 1000;

/** Same rules as the API (`ClassCreate`); shared by the form and the Server Actions. */
export const classSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres.")
    .max(20, "Máximo 20 caracteres.")
    .regex(/^[A-Za-z0-9-]+$/, "Solo letras, números y guiones."),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(150, "Máximo 150 caracteres."),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `Máximo ${DESCRIPTION_MAX} caracteres.`),
});

export type ClassInput = z.infer<typeof classSchema>;
export type ClassField = keyof ClassInput;

export const CLASS_FIELDS = Object.keys(classSchema.shape) as ClassField[];
