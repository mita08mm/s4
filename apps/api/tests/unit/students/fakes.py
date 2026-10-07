from collections.abc import Collection
from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID, uuid7

from s4.modules.students.domain.student import NewStudent, Student
from s4.shared.pagination import Page


class InMemoryStudentRepository:
    """Test double that fulfils the `StudentRepository` port without a database."""

    def __init__(self, students: list[Student] | None = None) -> None:
        self.students: dict[UUID, Student] = {s.id: s for s in students or []}

    async def get(self, student_id: UUID) -> Student | None:
        student = self.students.get(student_id)
        return replace(student) if student else None

    async def missing_ids(self, ids: Collection[UUID]) -> set[UUID]:
        return set(ids) - self.students.keys()

    async def code_exists(self, code: str, *, exclude_id: UUID | None = None) -> bool:
        return any(s.code == code and s.id != exclude_id for s in self.students.values())

    async def email_exists(self, email: str, *, exclude_id: UUID | None = None) -> bool:
        return any(s.email == email and s.id != exclude_id for s in self.students.values())

    async def add(self, data: NewStudent) -> Student:
        now = datetime.now(UTC)
        student = Student(
            id=uuid7(),
            code=data.code,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            created_at=now,
            updated_at=now,
        )
        self.students[student.id] = student
        return replace(student)

    async def update(self, student: Student) -> Student:
        self.students[student.id] = replace(student, updated_at=datetime.now(UTC))
        return replace(self.students[student.id])

    async def delete(self, student_id: UUID) -> None:
        self.students.pop(student_id, None)

    async def search(self, query: str | None, *, page: int, size: int) -> Page[Student]:
        items = list(self.students.values())
        start = (page - 1) * size
        return Page(items=items[start : start + size], total=len(items), page=page, size=size)


class FakeUnitOfWork:
    def __init__(self) -> None:
        self.commits = 0

    async def commit(self) -> None:
        self.commits += 1


def make_student(code: str = "A00001", email: str = "ana@s4.edu") -> Student:
    now = datetime.now(UTC)
    return Student(
        id=uuid7(),
        code=code,
        first_name="Ana",
        last_name="Pérez",
        email=email,
        created_at=now,
        updated_at=now,
    )
