import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClassProfile } from "@/features/classes/components/class-profile";
import { getClass } from "@/features/classes/queries";
import { ClassEnrollments } from "@/features/enrollments/components/class-enrollments";
import { studentsOfClass } from "@/features/enrollments/queries";
import { listStudents } from "@/features/students/queries";

export async function generateMetadata({
  params,
}: PageProps<"/classes/[id]">): Promise<Metadata> {
  const schoolClass = await getClass((await params).id);
  return { title: schoolClass ? `${schoolClass.title} · S4` : "S4" };
}

export default async function ClassPage({
  params,
}: PageProps<"/classes/[id]">) {
  const { id } = await params;
  const schoolClass = await getClass(id);
  if (!schoolClass) notFound();

  const [enrolled, students] = await Promise.all([
    studentsOfClass(id),
    listStudents({ query: "", page: 1, size: 100 }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-4 pt-32 pb-24 sm:pt-36">
      <ClassProfile schoolClass={schoolClass} />
      <ClassEnrollments
        classId={id}
        enrolled={enrolled}
        students={students.items}
      />
    </main>
  );
}
