from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.classes.domain.school_class import SchoolClass
from s4.shared.pagination import Page


class SearchClasses:
    """Lists classes, optionally filtered by a free-text query.

    Each word of the query must appear (case-insensitive, partial match) in the
    code, title or description. An empty query returns every class.
    """

    def __init__(self, repository: ClassRepository) -> None:
        self._repository = repository

    async def execute(self, query: str | None, *, page: int, size: int) -> Page[SchoolClass]:
        normalized = query.strip() if query else None
        return await self._repository.search(normalized or None, page=page, size=size)
