"use server";

import { refresh } from "next/cache";

import {
  CLASS_FIELDS,
  type ClassField,
  type ClassInput,
  classSchema,
} from "@/features/classes/schemas";
import { ApiError, apiFetch } from "@/shared/lib/api-client";

export type FieldErrors = Partial<Record<ClassField, string>>;
type ActionFailure = { ok: false; message: string; fieldErrors: FieldErrors };
export type ActionResult = { ok: true } | ActionFailure;

/** Body sent to the API: an empty description becomes `null` ("no description"). */
type ClassPayload = { code: string; title: string; description: string | null };

const BASE = "/api/v1/classes";

function isClassField(value: string): value is ClassField {
  return (CLASS_FIELDS as string[]).includes(value);
}

function toFailure(error: unknown): ActionFailure {
  if (!(error instanceof ApiError)) {
    return {
      ok: false,
      message: "No se pudo conectar con el servidor.",
      fieldErrors: {},
    };
  }
  const fieldErrors: FieldErrors = {};
  for (const { field, message } of error.problem.errors ?? []) {
    const name = field.replace(/^body\./, "");
    if (isClassField(name)) fieldErrors[name] ??= message;
  }
  return {
    ok: false,
    message: error.problem.detail ?? error.problem.title,
    fieldErrors,
  };
}

/** Validates again on the server and turns an empty description into `null` ("no description"). */
function toPayload(input: ClassInput): ClassPayload | ActionFailure {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const name = String(issue.path[0]);
      if (isClassField(name)) fieldErrors[name] ??= issue.message;
    }
    return {
      ok: false as const,
      message: "Revisa los campos marcados.",
      fieldErrors,
    };
  }
  return { ...parsed.data, description: parsed.data.description || null };
}

async function send(path: string, init: RequestInit): Promise<ActionResult> {
  try {
    await apiFetch(path, init);
  } catch (error) {
    return toFailure(error);
  }
  refresh();
  return { ok: true };
}

export async function createClass(input: ClassInput): Promise<ActionResult> {
  const payload = toPayload(input);
  if ("ok" in payload) return payload;
  return send(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateClass(
  id: string,
  input: ClassInput,
): Promise<ActionResult> {
  const payload = toPayload(input);
  if ("ok" in payload) return payload;
  return send(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteClass(id: string): Promise<ActionResult> {
  return send(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
