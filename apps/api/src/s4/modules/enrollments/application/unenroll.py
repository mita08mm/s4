from uuid import UUID

from s4.modules.enrollments.domain.enrollment_repository import EnrollmentRepository
from s4.shared.errors import NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class Unenroll:
    def __init__(self, enrollments: EnrollmentRepository, unit_of_work: UnitOfWork) -> None:
        self._enrollments = enrollments
        self._unit_of_work = unit_of_work

    async def execute(self, student_id: UUID, class_id: UUID) -> None:
        if not await self._enrollments.remove(student_id, class_id):
            raise NotFoundError("El estudiante no está inscrito en esa clase.")
        await self._unit_of_work.commit()
