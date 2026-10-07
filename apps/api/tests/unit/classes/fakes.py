from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID, uuid7

from s4.modules.classes.domain.school_class import NewSchoolClass, SchoolClass
from s4.shared.pagination import Page


class InMemoryClassRepository:
    """Test double that fulfils the `ClassRepository` port without a database."""

    def __init__(self, classes: list[SchoolClass] | None = None) -> None:
        self.classes: dict[UUID, SchoolClass] = {c.id: c for c in classes or []}

    async def get(self, class_id: UUID) -> SchoolClass | None:
        school_class = self.classes.get(class_id)
        return replace(school_class) if school_class else None

    async def code_exists(self, code: str, *, exclude_id: UUID | None = None) -> bool:
        return any(c.code == code and c.id != exclude_id for c in self.classes.values())

    async def add(self, data: NewSchoolClass) -> SchoolClass:
        now = datetime.now(UTC)
        school_class = SchoolClass(
            id=uuid7(),
            code=data.code,
            title=data.title,
            description=data.description,
            created_at=now,
            updated_at=now,
        )
        self.classes[school_class.id] = school_class
        return replace(school_class)

    async def update(self, school_class: SchoolClass) -> SchoolClass:
        self.classes[school_class.id] = replace(school_class, updated_at=datetime.now(UTC))
        return replace(self.classes[school_class.id])

    async def delete(self, class_id: UUID) -> None:
        self.classes.pop(class_id, None)

    async def search(self, query: str | None, *, page: int, size: int) -> Page[SchoolClass]:
        items = list(self.classes.values())
        start = (page - 1) * size
        return Page(items=items[start : start + size], total=len(items), page=page, size=size)


def make_class(code: str = "MAT-101", description: str | None = "Álgebra") -> SchoolClass:
    now = datetime.now(UTC)
    return SchoolClass(
        id=uuid7(),
        code=code,
        title="Matemáticas I",
        description=description,
        created_at=now,
        updated_at=now,
    )
