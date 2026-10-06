import "server-only";

import type { Student } from "@/features/students/types";
import { apiFetch, type Page } from "@/shared/lib/api-client";

export const STUDENTS_PAGE_SIZE = 10;

export async function listStudents({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(STUDENTS_PAGE_SIZE),
  });
  if (query) params.set("q", query);
  return apiFetch<Page<Student>>(`/api/v1/students?${params}`);
}
