from uuid import UUID

from sqlalchemy import ColumnElement, delete, exists, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from s4.modules.students.domain.student import NewStudent, Student
from s4.modules.students.infrastructure.student_model import StudentModel
from s4.shared.database.search import contains_pattern
from s4.shared.pagination import Page

SEARCHABLE_COLUMNS = (
    StudentModel.code,
    StudentModel.first_name,
    StudentModel.last_name,
    StudentModel.email,
)


class SqlAlchemyStudentRepository:
    """Implements `StudentRepository` with SQLAlchemy. Never commits: see `UnitOfWork`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, student_id: UUID) -> Student | None:
        model = await self._session.get(StudentModel, student_id)
        return model.to_entity() if model else None

    async def code_exists(self, code: str, *, exclude_id: UUID | None = None) -> bool:
        return await self._exists(StudentModel.code == code, exclude_id)

    async def email_exists(self, email: str, *, exclude_id: UUID | None = None) -> bool:
        return await self._exists(StudentModel.email == email, exclude_id)

    async def add(self, data: NewStudent) -> Student:
        model = StudentModel(
            code=data.code,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)  # load server-generated timestamps
        return model.to_entity()

    async def update(self, student: Student) -> Student:
        model = await self._session.get_one(StudentModel, student.id)
        model.code = student.code
        model.first_name = student.first_name
        model.last_name = student.last_name
        model.email = student.email
        await self._session.flush()
        await self._session.refresh(model)
        return model.to_entity()

    async def delete(self, student_id: UUID) -> None:
        await self._session.execute(delete(StudentModel).where(StudentModel.id == student_id))

    async def search(self, query: str | None, *, page: int, size: int) -> Page[Student]:
        # Every word must match at least one searchable column (AND of ORs).
        conditions = [_matches_any_column(term) for term in (query or "").split()]
        filtered = select(StudentModel).where(*conditions)

        total = await self._session.scalar(select(func.count()).select_from(filtered.subquery()))
        rows = await self._session.scalars(
            filtered.order_by(StudentModel.last_name, StudentModel.first_name, StudentModel.code)
            .limit(size)
            .offset((page - 1) * size)
        )
        return Page(items=[row.to_entity() for row in rows], total=total or 0, page=page, size=size)

    async def _exists(self, condition: ColumnElement[bool], exclude_id: UUID | None) -> bool:
        statement = select(exists().where(condition))
        if exclude_id is not None:
            statement = select(exists().where(condition, StudentModel.id != exclude_id))
        return bool(await self._session.scalar(statement))


def _matches_any_column(term: str) -> ColumnElement[bool]:
    pattern = contains_pattern(term)
    return or_(*(column.ilike(pattern, escape="\\") for column in SEARCHABLE_COLUMNS))
