import type { Metadata } from "next";

import { StudentsView } from "@/features/students/components/students-view";
import { listStudents } from "@/features/students/queries";

export const metadata: Metadata = { title: "Estudiantes · S4" };

export default async function StudentsPage({
  searchParams,
}: PageProps<"/students">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listStudents({ query, page });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-32 pb-24 sm:pt-36">
      <StudentsView result={result} query={query} />
    </main>
  );
}
