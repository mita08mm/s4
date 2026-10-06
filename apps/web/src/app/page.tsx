import { BookOpenIcon, UsersIcon } from "lucide-react";
import { connection } from "next/server";

import { Hero } from "@/features/home/components/hero";
import { SectionCard } from "@/features/home/components/section-card";
import { getApiStatus } from "@/features/home/queries";

export default async function HomePage() {
  await connection(); // render per request: the API status must be live
  const apiStatus = await getApiStatus();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 pt-36 pb-24 sm:pt-44">
      <Hero apiStatus={apiStatus} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard
          index={0}
          href="/students"
          icon={<UsersIcon />}
          title="Estudiantes"
          description="Crea, edita y busca estudiantes. Mira en qué clases está cada uno."
        />
        <SectionCard
          index={1}
          href="/classes"
          icon={<BookOpenIcon />}
          title="Clases"
          description="Administra el catálogo de clases y quién está inscrito en cada una."
        />
      </div>
    </main>
  );
}
