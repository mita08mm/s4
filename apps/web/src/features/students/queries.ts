import "server-only";

import type { Student } from "@/features/students/types";
import { ApiError, apiFetch, type Page } from "@/shared/lib/api-client";

export const STUDENTS_PAGE_SIZE = 10;

export async function listStudents({
  query,
  page,
  size = STUDENTS_PAGE_SIZE,
}: {
  query: string;
  page: number;
  size?: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (query) params.set("q", query);
  return apiFetch<Page<Student>>(`/api/v1/students?${params}`);
}

/** The student, or `null` if it does not exist (or the id is not valid). */
export async function getStudent(id: string): Promise<Student | null> {
  try {
    return await apiFetch<Student>(
      `/api/v1/students/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && [404, 422].includes(error.problem.status))
      return null;
    throw error;
  }
}
