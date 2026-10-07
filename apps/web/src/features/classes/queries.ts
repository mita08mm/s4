import "server-only";

import type { SchoolClass } from "@/features/classes/types";
import { apiFetch, type Page } from "@/shared/lib/api-client";

export const CLASSES_PAGE_SIZE = 9; // three rows of three cards

export async function listClasses({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(CLASSES_PAGE_SIZE),
  });
  if (query) params.set("q", query);
  return apiFetch<Page<SchoolClass>>(`/api/v1/classes?${params}`);
}
