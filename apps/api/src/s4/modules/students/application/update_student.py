from uuid import UUID

from s4.modules.students.domain.student import (
    Student,
    StudentChanges,
    normalize_code,
    normalize_email,
)
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import ConflictError, NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class UpdateStudent:
    def __init__(self, repository: StudentRepository, unit_of_work: UnitOfWork) -> None:
        self._repository = repository
        self._unit_of_work = unit_of_work

    async def execute(self, student_id: UUID, changes: StudentChanges) -> Student:
        student = await self._repository.get(student_id)
        if student is None:
            raise NotFoundError("El estudiante no existe.")

        if changes.code is not None:
            code = normalize_code(changes.code)
            if await self._repository.code_exists(code, exclude_id=student.id):
                raise ConflictError(f"Ya existe un estudiante con el código {code}.")
            student.code = code
        if changes.email is not None:
            email = normalize_email(changes.email)
            if await self._repository.email_exists(email, exclude_id=student.id):
                raise ConflictError(f"Ya existe un estudiante con el email {email}.")
            student.email = email
        if changes.first_name is not None:
            student.first_name = changes.first_name.strip()
        if changes.last_name is not None:
            student.last_name = changes.last_name.strip()

        updated = await self._repository.update(student)
        await self._unit_of_work.commit()
        return updated
