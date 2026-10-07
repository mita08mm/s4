from uuid import UUID

from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.classes.domain.school_class import SchoolClass
from s4.shared.errors import NotFoundError


class GetClass:
    def __init__(self, repository: ClassRepository) -> None:
        self._repository = repository

    async def execute(self, class_id: UUID) -> SchoolClass:
        school_class = await self._repository.get(class_id)
        if school_class is None:
            raise NotFoundError("La clase no existe.")
        return school_class
