"use client";

import { ServerCrashIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";

export default function StudentsError({
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-32 pb-24 sm:pt-36">
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ServerCrashIcon />
          </EmptyMedia>
          <EmptyTitle>No se pudieron cargar los estudiantes</EmptyTitle>
          <EmptyDescription>
            Puede que el API no esté disponible. Inténtalo de nuevo.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>Reintentar</Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
