import { connection } from "next/server";

import { apiFetch } from "@/shared/lib/api-client";

async function getApiStatus(): Promise<"online" | "offline"> {
  try {
    await apiFetch<{ status: "ok" }>("/health/ready");
    return "online";
  } catch {
    return "offline";
  }
}

export default async function HomePage() {
  await connection(); // render per request: the API status must be live
  const apiStatus = await getApiStatus();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <p className="font-mono text-sm text-foreground/60">S4</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Super Simple Scheduling System
      </h1>
      <p className="text-lg text-foreground/70">
        Estudiantes, clases e inscripciones.
      </p>
      <p className="flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className={`size-2 rounded-full ${apiStatus === "online" ? "bg-emerald-500" : "bg-red-500"}`}
        />
        API {apiStatus === "online" ? "conectada" : "sin conexión"}
      </p>
    </main>
  );
}
