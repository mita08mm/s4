"use client";

import { UsersIcon } from "lucide-react";

import {
  enrollStudentsInClass,
  unenroll,
} from "@/features/enrollments/actions";
import { EnrollmentsPanel } from "@/features/enrollments/components/enrollments-panel";
import type {
  EnrolledStudent,
  PickerOption,
} from "@/features/enrollments/types";

type StudentOption = {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
};

export function ClassEnrollments({
  classId,
  enrolled,
  students,
}: {
  classId: string;
  enrolled: EnrolledStudent[];
  students: StudentOption[];
}) {
  const items = enrolled.map((item) => ({
    id: item.id,
    href: `/students/${item.id}`,
    code: item.code,
    title: `${item.first_name} ${item.last_name}`,
    subtitle: item.email,
    enrolledAt: item.enrolled_at,
  }));
  const options: PickerOption[] = students.map((item) => ({
    id: item.id,
    code: item.code,
    label: `${item.first_name} ${item.last_name}`,
    hint: item.email,
  }));

  return (
    <EnrollmentsPanel
      heading="Estudiantes"
      items={items}
      options={options}
      emptyIcon={<UsersIcon />}
      emptyTitle="Nadie inscrito todavía"
      emptyDescription="Inscribe a uno o varios estudiantes a la vez."
      addLabel="Inscribir estudiantes"
      picker={{
        title: "Inscribir estudiantes",
        description:
          "Elige uno o varios. Los que ya están inscritos no aparecen.",
        searchPlaceholder: "Buscar por nombre, código o email…",
      }}
      removeLabel={(item) => `Quitar a ${item.title}`}
      onEnroll={(ids) => enrollStudentsInClass(classId, ids)}
      onRemove={(item) => unenroll(item.id, classId)}
    />
  );
}
