from uuid import UUID

from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.enrollments.domain.enrollment import EnrolledStudent
from s4.modules.enrollments.domain.enrollment_repository import EnrollmentRepository
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class EnrollStudentsInClass:
    """Enrolls several students in one class at once (all or nothing, idempotent)."""

    def __init__(
        self,
        students: StudentRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
        unit_of_work: UnitOfWork,
    ) -> None:
        self._students = students
        self._classes = classes
        self._enrollments = enrollments
        self._unit_of_work = unit_of_work

    async def execute(self, class_id: UUID, student_ids: list[UUID]) -> list[EnrolledStudent]:
        if await self._classes.missing_ids([class_id]):
            raise NotFoundError("La clase no existe.")
        if missing := await self._students.missing_ids(student_ids):
            raise NotFoundError(
                f"No existen {len(missing)} de los estudiantes indicados.", field="student_ids"
            )

        await self._enrollments.add_many((student_id, class_id) for student_id in student_ids)
        await self._unit_of_work.commit()
        return await self._enrollments.students_of(class_id)
