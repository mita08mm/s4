export type { EnrolledClass, EnrolledStudent } from "@/shared/api/types";

/** Something that can be picked in the enroll dialog. */
export type PickerOption = {
  id: string;
  label: string;
  hint: string;
  code: string;
};

/** A row of an enrollment list. */
export type EnrollmentItem = {
  id: string;
  href: string;
  code: string;
  title: string;
  subtitle: string | null;
  enrolledAt: string;
};
