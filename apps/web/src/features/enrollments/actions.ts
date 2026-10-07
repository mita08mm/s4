"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { ApiError, apiFetch } from "@/shared/lib/api-client";

export type ActionResult = { ok: true } | { ok: false; message: string };

// Server Actions are public endpoints: the ids are validated before reaching the API.
const idSchema = z.uuid();
const idsSchema = z.array(z.uuid()).min(1).max(100);

async function send(path: string, init: RequestInit): Promise<ActionResult> {
  try {
    await apiFetch(path, init);
  } catch (error) {
    const message =
      error instanceof ApiError
        ? (error.problem.detail ?? error.problem.title)
        : "No se pudo conectar con el servidor.";
    return { ok: false, message };
  }
  refresh();
  return { ok: true };
}

const INVALID: ActionResult = {
  ok: false,
  message: "La selección no es válida.",
};

export async function enrollStudentInClasses(
  studentId: string,
  classIds: string[],
) {
  if (
    !idSchema.safeParse(studentId).success ||
    !idsSchema.safeParse(classIds).success
  ) {
    return INVALID;
  }
  return send(`/api/v1/students/${studentId}/classes`, {
    method: "POST",
    body: JSON.stringify({ class_ids: classIds }),
  });
}

export async function enrollStudentsInClass(
  classId: string,
  studentIds: string[],
) {
  if (
    !idSchema.safeParse(classId).success ||
    !idsSchema.safeParse(studentIds).success
  ) {
    return INVALID;
  }
  return send(`/api/v1/classes/${classId}/students`, {
    method: "POST",
    body: JSON.stringify({ student_ids: studentIds }),
  });
}

export async function unenroll(studentId: string, classId: string) {
  if (
    !idSchema.safeParse(studentId).success ||
    !idSchema.safeParse(classId).success
  ) {
    return INVALID;
  }
  return send(`/api/v1/students/${studentId}/classes/${classId}`, {
    method: "DELETE",
  });
}
