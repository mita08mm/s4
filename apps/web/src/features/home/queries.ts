import "server-only";

import { apiFetch } from "@/shared/lib/api-client";

export type ApiStatus = "online" | "offline";

export async function getApiStatus(): Promise<ApiStatus> {
  try {
    await apiFetch<{ status: "ok" }>("/health/ready");
    return "online";
  } catch {
    return "offline";
  }
}
