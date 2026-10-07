"use client";

import { BookOpenIcon } from "lucide-react";

import {
  enrollStudentInClasses,
  unenroll,
} from "@/features/enrollments/actions";
import { EnrollmentsPanel } from "@/features/enrollments/components/enrollments-panel";
import type { EnrolledClass, PickerOption } from "@/features/enrollments/types";

type ClassOption = {
  id: string;
  code: string;
  title: string;
  description: string | null;
};

export function StudentEnrollments({
  studentId,
  enrolled,
  classes,
}: {
  studentId: string;
  enrolled: EnrolledClass[];
  classes: ClassOption[];
}) {
  const items = enrolled.map((item) => ({
    id: item.id,
    href: `/classes/${item.id}`,
    code: item.code,
    title: item.title,
    subtitle: item.description,
    enrolledAt: item.enrolled_at,
  }));
  const options: PickerOption[] = classes.map((item) => ({
    id: item.id,
    code: item.code,
    label: item.title,
    hint: item.description ?? "Sin descripción",
  }));

  return (
    <EnrollmentsPanel
      heading="Clases"
      items={items}
      options={options}
      emptyIcon={<BookOpenIcon />}
      emptyTitle="Sin clases todavía"
      emptyDescription="Inscríbelo en una o varias clases a la vez."
      addLabel="Inscribir en clases"
      picker={{
        title: "Inscribir en clases",
        description:
          "Elige una o varias. Las clases en las que ya está no aparecen.",
        searchPlaceholder: "Buscar por código o título…",
      }}
      removeLabel={(item) => `Quitar de ${item.title}`}
      onEnroll={(ids) => enrollStudentInClasses(studentId, ids)}
      onRemove={(item) => unenroll(studentId, item.id)}
    />
  );
}
