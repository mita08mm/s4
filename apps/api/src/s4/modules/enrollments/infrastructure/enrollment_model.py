from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from s4.shared.database.base import Base


class EnrollmentModel(Base):
    """Join table. The composite primary key makes a duplicated enrollment impossible."""

    __tablename__ = "enrollments"

    student_id: Mapped[UUID] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), primary_key=True
    )
    # Indexed on its own: the primary key only speeds up lookups by student_id.
    class_id: Mapped[UUID] = mapped_column(
        ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
