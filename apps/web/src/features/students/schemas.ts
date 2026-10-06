import { z } from "zod";

/**
 * Same rules as the API (`StudentCreate`). Used by the form for instant
 * feedback and again by the Server Actions, which are public endpoints.
 */
export const studentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres.")
    .max(20, "Máximo 20 caracteres.")
    .regex(/^[A-Za-z0-9-]+$/, "Solo letras, números y guiones."),
  first_name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
  last_name: z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
  email: z
    .string()
    .trim()
    .max(254, "Máximo 254 caracteres.")
    .pipe(z.email("Email no válido.")),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type StudentField = keyof StudentInput;

export const STUDENT_FIELDS = Object.keys(
  studentSchema.shape,
) as StudentField[];
