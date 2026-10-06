import "server-only";

import { serverEnv } from "@/shared/config/server-env";

/** RFC 9457 Problem Details, as returned by the API on every error. */
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: { field: string; message: string }[];
};

/** Paginated list, as returned by every list endpoint. */
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
  }
}

/** Typed fetch against the API from Server Components and Server Actions. */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${serverEnv.apiInternalUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError((await response.json()) as ProblemDetails);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
