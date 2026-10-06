import { BookOpenIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-36 pb-24">
      <h1 className="text-4xl font-semibold tracking-tighter">Clases</h1>
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenIcon />
          </EmptyMedia>
          <EmptyTitle>En construcción</EmptyTitle>
          <EmptyDescription>
            Esta sección se conecta cuando el API tenga sus endpoints.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
}
