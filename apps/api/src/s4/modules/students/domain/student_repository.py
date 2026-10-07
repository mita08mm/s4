from collections.abc import Collection
from typing import Protocol
from uuid import UUID

from s4.modules.students.domain.student import NewStudent, Student
from s4.shared.pagination import Page


class StudentRepository(Protocol):
    """Port: what the use cases need from student storage."""

    async def get(self, student_id: UUID) -> Student | None: ...

    async def missing_ids(self, ids: Collection[UUID]) -> set[UUID]:
        """The ids in `ids` that do not exist."""
        ...

    async def code_exists(self, code: str, *, exclude_id: UUID | None = None) -> bool: ...

    async def email_exists(self, email: str, *, exclude_id: UUID | None = None) -> bool: ...

    async def add(self, data: NewStudent) -> Student: ...

    async def update(self, student: Student) -> Student: ...

    async def delete(self, student_id: UUID) -> None: ...

    async def search(self, query: str | None, *, page: int, size: int) -> Page[Student]: ...
