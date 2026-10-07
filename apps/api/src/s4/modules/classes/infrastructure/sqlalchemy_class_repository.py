from collections.abc import Collection
from uuid import UUID

from sqlalchemy import ColumnElement, delete, exists, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from s4.modules.classes.domain.school_class import NewSchoolClass, SchoolClass
from s4.modules.classes.infrastructure.class_model import ClassModel
from s4.shared.database.search import contains_pattern
from s4.shared.pagination import Page

SEARCHABLE_COLUMNS = (ClassModel.code, ClassModel.title, ClassModel.description)


class SqlAlchemyClassRepository:
    """Implements `ClassRepository` with SQLAlchemy. Never commits: see `UnitOfWork`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, class_id: UUID) -> SchoolClass | None:
        model = await self._session.get(ClassModel, class_id)
        return model.to_entity() if model else None

    async def missing_ids(self, ids: Collection[UUID]) -> set[UUID]:
        found = await self._session.scalars(select(ClassModel.id).where(ClassModel.id.in_(ids)))
        return set(ids) - set(found)

    async def code_exists(self, code: str, *, exclude_id: UUID | None = None) -> bool:
        condition = ClassModel.code == code
        if exclude_id is not None:
            condition = condition & (ClassModel.id != exclude_id)
        return bool(await self._session.scalar(select(exists().where(condition))))

    async def add(self, data: NewSchoolClass) -> SchoolClass:
        model = ClassModel(code=data.code, title=data.title, description=data.description)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)  # load server-generated timestamps
        return model.to_entity()

    async def update(self, school_class: SchoolClass) -> SchoolClass:
        model = await self._session.get_one(ClassModel, school_class.id)
        model.code = school_class.code
        model.title = school_class.title
        model.description = school_class.description
        await self._session.flush()
        await self._session.refresh(model)
        return model.to_entity()

    async def delete(self, class_id: UUID) -> None:
        await self._session.execute(delete(ClassModel).where(ClassModel.id == class_id))

    async def search(self, query: str | None, *, page: int, size: int) -> Page[SchoolClass]:
        # Every word must match at least one searchable column (AND of ORs).
        conditions = [_matches_any_column(term) for term in (query or "").split()]
        filtered = select(ClassModel).where(*conditions)

        total = await self._session.scalar(select(func.count()).select_from(filtered.subquery()))
        rows = await self._session.scalars(
            filtered.order_by(ClassModel.code).limit(size).offset((page - 1) * size)
        )
        return Page(items=[row.to_entity() for row in rows], total=total or 0, page=page, size=size)


def _matches_any_column(term: str) -> ColumnElement[bool]:
    pattern = contains_pattern(term)
    return or_(*(column.ilike(pattern, escape="\\") for column in SEARCHABLE_COLUMNS))
