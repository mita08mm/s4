import type { Metadata } from "next";

import { ClassesView } from "@/features/classes/components/classes-view";
import { listClasses } from "@/features/classes/queries";

export const metadata: Metadata = { title: "Clases · S4" };

export default async function ClassesPage({
  searchParams,
}: PageProps<"/classes">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listClasses({ query, page });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-32 pb-24 sm:pt-36">
      <ClassesView result={result} query={query} />
    </main>
  );
}
