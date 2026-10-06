from s4.modules.students.domain.student import Student
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.pagination import Page


class SearchStudents:
    """Lists students, optionally filtered by a free-text query.

    Each word of the query must appear (case-insensitive, partial match) in the
    code, first name, last name or email. An empty query returns everyone.
    """

    def __init__(self, repository: StudentRepository) -> None:
        self._repository = repository

    async def execute(self, query: str | None, *, page: int, size: int) -> Page[Student]:
        normalized = query.strip() if query else None
        return await self._repository.search(normalized or None, page=page, size=size)
