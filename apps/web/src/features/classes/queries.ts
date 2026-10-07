import "server-only";

import type { SchoolClass } from "@/features/classes/types";
import { ApiError, apiFetch, type Page } from "@/shared/lib/api-client";

export const CLASSES_PAGE_SIZE = 9; // three rows of three cards

export async function listClasses({
  query,
  page,
  size = CLASSES_PAGE_SIZE,
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
  return apiFetch<Page<SchoolClass>>(`/api/v1/classes?${params}`);
}

/** The class, or `null` if it does not exist (or the id is not valid). */
export async function getClass(id: string): Promise<SchoolClass | null> {
  try {
    return await apiFetch<SchoolClass>(
      `/api/v1/classes/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && [404, 422].includes(error.problem.status))
      return null;
    throw error;
  }
}
