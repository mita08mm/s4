import "server-only";

import type {
  EnrolledClass,
  EnrolledStudent,
} from "@/features/enrollments/types";
import { apiFetch } from "@/shared/lib/api-client";

export async function classesOfStudent(studentId: string) {
  return apiFetch<EnrolledClass[]>(
    `/api/v1/students/${encodeURIComponent(studentId)}/classes`,
  );
}

export async function studentsOfClass(classId: string) {
  return apiFetch<EnrolledStudent[]>(
    `/api/v1/classes/${encodeURIComponent(classId)}/students`,
  );
}
