from uuid import UUID

from s4.modules.enrollments.domain.enrollment import EnrolledClass
from s4.modules.enrollments.domain.enrollment_repository import EnrollmentRepository
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import NotFoundError


class ListClassesOfStudent:
    def __init__(self, students: StudentRepository, enrollments: EnrollmentRepository) -> None:
        self._students = students
        self._enrollments = enrollments

    async def execute(self, student_id: UUID) -> list[EnrolledClass]:
        if await self._students.missing_ids([student_id]):
            raise NotFoundError("El estudiante no existe.")
        return await self._enrollments.classes_of(student_id)
