/** A class as listed from a student (`EnrolledClassResponse`). */
export type EnrolledClass = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  enrolled_at: string;
};

/** A student as listed from a class (`EnrolledStudentResponse`). */
export type EnrolledStudent = {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  enrolled_at: string;
};

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
