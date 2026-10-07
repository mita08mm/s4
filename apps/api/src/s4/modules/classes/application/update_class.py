from uuid import UUID

from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.classes.domain.school_class import (
    SchoolClass,
    SchoolClassChanges,
    Unset,
    normalize_code,
    normalize_description,
)
from s4.shared.errors import ConflictError, NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class UpdateClass:
    def __init__(self, repository: ClassRepository, unit_of_work: UnitOfWork) -> None:
        self._repository = repository
        self._unit_of_work = unit_of_work

    async def execute(self, class_id: UUID, changes: SchoolClassChanges) -> SchoolClass:
        school_class = await self._repository.get(class_id)
        if school_class is None:
            raise NotFoundError("La clase no existe.")

        if changes.code is not None:
            code = normalize_code(changes.code)
            if await self._repository.code_exists(code, exclude_id=school_class.id):
                raise ConflictError(f"Ya existe una clase con el código {code}.", field="code")
            school_class.code = code
        if changes.title is not None:
            school_class.title = changes.title.strip()
        if not isinstance(changes.description, Unset):
            school_class.description = normalize_description(changes.description)

        updated = await self._repository.update(school_class)
        await self._unit_of_work.commit()
        return updated
