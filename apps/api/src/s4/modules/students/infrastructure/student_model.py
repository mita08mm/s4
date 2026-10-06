from datetime import datetime
from uuid import UUID, uuid7

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from s4.modules.students.domain.student import Student
from s4.shared.database.base import Base


class StudentModel(Base):
    __tablename__ = "students"

    # UUIDv7 is time-ordered: new rows land at the end of the primary-key index.
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(254), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def to_entity(self) -> Student:
        return Student(
            id=self.id,
            code=self.code,
            first_name=self.first_name,
            last_name=self.last_name,
            email=self.email,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
