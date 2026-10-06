from uuid import UUID

from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class DeleteStudent:
    """Deletes a student. Their enrollments are removed by the database (ON DELETE CASCADE)."""

    def __init__(self, repository: StudentRepository, unit_of_work: UnitOfWork) -> None:
        self._repository = repository
        self._unit_of_work = unit_of_work

    async def execute(self, student_id: UUID) -> None:
        if await self._repository.get(student_id) is None:
            raise NotFoundError("El estudiante no existe.")
        await self._repository.delete(student_id)
        await self._unit_of_work.commit()
