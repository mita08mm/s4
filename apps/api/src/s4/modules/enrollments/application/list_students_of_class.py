from uuid import UUID

from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.enrollments.domain.enrollment import EnrolledStudent
from s4.modules.enrollments.domain.enrollment_repository import EnrollmentRepository
from s4.shared.errors import NotFoundError


class ListStudentsOfClass:
    def __init__(self, classes: ClassRepository, enrollments: EnrollmentRepository) -> None:
        self._classes = classes
        self._enrollments = enrollments

    async def execute(self, class_id: UUID) -> list[EnrolledStudent]:
        if await self._classes.missing_ids([class_id]):
            raise NotFoundError("La clase no existe.")
        return await self._enrollments.students_of(class_id)
