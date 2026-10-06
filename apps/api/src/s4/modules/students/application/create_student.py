from s4.modules.students.domain.student import (
    NewStudent,
    Student,
    normalize_code,
    normalize_email,
)
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import ConflictError
from s4.shared.unit_of_work import UnitOfWork


class CreateStudent:
    def __init__(self, repository: StudentRepository, unit_of_work: UnitOfWork) -> None:
        self._repository = repository
        self._unit_of_work = unit_of_work

    async def execute(self, data: NewStudent) -> Student:
        data = NewStudent(
            code=normalize_code(data.code),
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            email=normalize_email(data.email),
        )
        if await self._repository.code_exists(data.code):
            raise ConflictError(f"Ya existe un estudiante con el código {data.code}.")
        if await self._repository.email_exists(data.email):
            raise ConflictError(f"Ya existe un estudiante con el email {data.email}.")

        student = await self._repository.add(data)
        await self._unit_of_work.commit()
        return student
