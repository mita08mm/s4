"use server";

import { refresh } from "next/cache";

import {
  STUDENT_FIELDS,
  type StudentField,
  type StudentInput,
  studentSchema,
} from "@/features/students/schemas";
import { ApiError, apiFetch } from "@/shared/lib/api-client";

export type FieldErrors = Partial<Record<StudentField, string>>;
export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors: FieldErrors };

const BASE = "/api/v1/students";

function isStudentField(value: string): value is StudentField {
  return (STUDENT_FIELDS as string[]).includes(value);
}

/** Turns an API Problem Details response into messages the form can show. */
function toFailure(error: unknown): ActionResult {
  if (!(error instanceof ApiError)) {
    return {
      ok: false,
      message: "No se pudo conectar con el servidor.",
      fieldErrors: {},
    };
  }
  const fieldErrors: FieldErrors = {};
  for (const { field, message } of error.problem.errors ?? []) {
    const name = field.replace(/^body\./, ""); // 422 errors come as "body.<field>"
    if (isStudentField(name)) fieldErrors[name] ??= message;
  }
  return {
    ok: false,
    message: error.problem.detail ?? error.problem.title,
    fieldErrors,
  };
}

/** Server Actions are reachable by anyone, so the input is validated again here. */
function validate(input: StudentInput): StudentInput | ActionResult {
  const parsed = studentSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const fieldErrors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const name = String(issue.path[0]);
    if (isStudentField(name)) fieldErrors[name] ??= issue.message;
  }
  return { ok: false, message: "Revisa los campos marcados.", fieldErrors };
}

async function send(path: string, init: RequestInit): Promise<ActionResult> {
  try {
    await apiFetch(path, init);
  } catch (error) {
    return toFailure(error);
  }
  refresh(); // re-render the current page with fresh data
  return { ok: true };
}

export async function createStudent(
  input: StudentInput,
): Promise<ActionResult> {
  const data = validate(input);
  if ("ok" in data) return data;
  return send(BASE, { method: "POST", body: JSON.stringify(data) });
}

export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<ActionResult> {
  const data = validate(input);
  if ("ok" in data) return data;
  return send(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id: string): Promise<ActionResult> {
  return send(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
