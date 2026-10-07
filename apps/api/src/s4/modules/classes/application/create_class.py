from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.classes.domain.school_class import (
    NewSchoolClass,
    SchoolClass,
    normalize_code,
    normalize_description,
)
from s4.shared.errors import ConflictError
from s4.shared.unit_of_work import UnitOfWork


class CreateClass:
    def __init__(self, repository: ClassRepository, unit_of_work: UnitOfWork) -> None:
        self._repository = repository
        self._unit_of_work = unit_of_work

    async def execute(self, data: NewSchoolClass) -> SchoolClass:
        data = NewSchoolClass(
            code=normalize_code(data.code),
            title=data.title.strip(),
            description=normalize_description(data.description),
        )
        if await self._repository.code_exists(data.code):
            raise ConflictError(f"Ya existe una clase con el código {data.code}.", field="code")

        school_class = await self._repository.add(data)
        await self._unit_of_work.commit()
        return school_class
