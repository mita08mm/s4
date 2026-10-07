import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listClasses } from "@/features/classes/queries";
import { StudentEnrollments } from "@/features/enrollments/components/student-enrollments";
import { classesOfStudent } from "@/features/enrollments/queries";
import { StudentProfile } from "@/features/students/components/student-profile";
import { getStudent } from "@/features/students/queries";

export async function generateMetadata({
  params,
}: PageProps<"/students/[id]">): Promise<Metadata> {
  const student = await getStudent((await params).id);
  return {
    title: student ? `${student.first_name} ${student.last_name} · S4` : "S4",
  };
}

export default async function StudentPage({
  params,
}: PageProps<"/students/[id]">) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const [enrolled, classes] = await Promise.all([
    classesOfStudent(id),
    listClasses({ query: "", page: 1, size: 100 }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-4 pt-32 pb-24 sm:pt-36">
      <StudentProfile student={student} />
      <StudentEnrollments
        studentId={id}
        enrolled={enrolled}
        classes={classes.items}
      />
    </main>
  );
}
