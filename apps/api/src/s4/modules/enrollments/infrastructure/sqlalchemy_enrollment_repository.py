from collections.abc import Iterable
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from s4.modules.classes.infrastructure.class_model import ClassModel
from s4.modules.enrollments.domain.enrollment import EnrolledClass, EnrolledStudent
from s4.modules.enrollments.infrastructure.enrollment_model import EnrollmentModel
from s4.modules.students.infrastructure.student_model import StudentModel


class SqlAlchemyEnrollmentRepository:
    """Implements `EnrollmentRepository` with SQLAlchemy. Never commits: see `UnitOfWork`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add_many(self, pairs: Iterable[tuple[UUID, UUID]]) -> None:
        rows = [{"student_id": student_id, "class_id": class_id} for student_id, class_id in pairs]
        if rows:
            # ON CONFLICT DO NOTHING makes enrolling idempotent.
            statement = insert(EnrollmentModel).values(rows).on_conflict_do_nothing()
            await self._session.execute(statement)

    async def remove(self, student_id: UUID, class_id: UUID) -> bool:
        removed = await self._session.scalar(
            delete(EnrollmentModel)
            .where(EnrollmentModel.student_id == student_id, EnrollmentModel.class_id == class_id)
            .returning(EnrollmentModel.student_id)
        )
        return removed is not None

    async def classes_of(self, student_id: UUID) -> list[EnrolledClass]:
        rows = await self._session.execute(
            select(ClassModel, EnrollmentModel.enrolled_at)
            .join(EnrollmentModel, EnrollmentModel.class_id == ClassModel.id)
            .where(EnrollmentModel.student_id == student_id)
            .order_by(ClassModel.code)
        )
        return [EnrolledClass(model.to_entity(), enrolled_at) for model, enrolled_at in rows]

    async def students_of(self, class_id: UUID) -> list[EnrolledStudent]:
        rows = await self._session.execute(
            select(StudentModel, EnrollmentModel.enrolled_at)
            .join(EnrollmentModel, EnrollmentModel.student_id == StudentModel.id)
            .where(EnrollmentModel.class_id == class_id)
            .order_by(StudentModel.last_name, StudentModel.first_name)
        )
        return [EnrolledStudent(model.to_entity(), enrolled_at) for model, enrolled_at in rows]
