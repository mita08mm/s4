from uuid import UUID

from s4.modules.students.domain.student import Student
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import NotFoundError


class GetStudent:
    def __init__(self, repository: StudentRepository) -> None:
        self._repository = repository

    async def execute(self, student_id: UUID) -> Student:
        student = await self._repository.get(student_id)
        if student is None:
            raise NotFoundError("El estudiante no existe.")
        return student
