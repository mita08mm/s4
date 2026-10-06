from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from s4.modules.students.domain.student import Student

Code = Annotated[
    str,
    Field(
        min_length=3,
        max_length=20,
        pattern=r"^[A-Za-z0-9-]+$",
        description="Código único del estudiante. Se guarda en mayúsculas.",
        examples=["A00123"],
    ),
]
Name = Annotated[str, Field(min_length=1, max_length=100, examples=["Ana"])]
Email = Annotated[EmailStr, Field(max_length=254, examples=["ana.perez@s4.edu"])]


class StudentCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Code
    first_name: Name
    last_name: Name
    email: Email


class StudentUpdate(BaseModel):
    """Only the fields sent are changed."""

    model_config = ConfigDict(str_strip_whitespace=True)

    code: Code | None = None
    first_name: Name | None = None
    last_name: Name | None = None
    email: Email | None = None


class StudentResponse(BaseModel):
    id: UUID
    code: str
    first_name: str
    last_name: str
    email: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, student: Student) -> StudentResponse:
        return cls(
            id=student.id,
            code=student.code,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            created_at=student.created_at,
            updated_at=student.updated_at,
        )


class StudentPage(BaseModel):
    items: list[StudentResponse]
    total: int
    page: int
    size: int
