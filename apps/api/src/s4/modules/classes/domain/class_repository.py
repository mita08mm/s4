from collections.abc import Collection
from typing import Protocol
from uuid import UUID

from s4.modules.classes.domain.school_class import NewSchoolClass, SchoolClass
from s4.shared.pagination import Page


class ClassRepository(Protocol):
    """Port: what the use cases need from class storage."""

    async def get(self, class_id: UUID) -> SchoolClass | None: ...

    async def missing_ids(self, ids: Collection[UUID]) -> set[UUID]:
        """The ids in `ids` that do not exist."""
        ...

    async def code_exists(self, code: str, *, exclude_id: UUID | None = None) -> bool: ...

    async def add(self, data: NewSchoolClass) -> SchoolClass: ...

    async def update(self, school_class: SchoolClass) -> SchoolClass: ...

    async def delete(self, class_id: UUID) -> None: ...

    async def search(self, query: str | None, *, page: int, size: int) -> Page[SchoolClass]: ...
