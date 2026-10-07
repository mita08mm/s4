from uuid import UUID

from s4.modules.classes.domain.class_repository import ClassRepository
from s4.shared.errors import NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class DeleteClass:
    """Deletes a class. Its enrollments are removed by the database (ON DELETE CASCADE)."""

    def __init__(self, repository: ClassRepository, unit_of_work: UnitOfWork) -> None:
        self._repository = repository
        self._unit_of_work = unit_of_work

    async def execute(self, class_id: UUID) -> None:
        if await self._repository.get(class_id) is None:
            raise NotFoundError("La clase no existe.")
        await self._repository.delete(class_id)
        await self._unit_of_work.commit()
