from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from s4.modules.classes.domain.school_class import SchoolClass

Code = Annotated[
    str,
    Field(
        min_length=3,
        max_length=20,
        pattern=r"^[A-Za-z0-9-]+$",
        description="Código único de la clase. Se guarda en mayúsculas.",
        examples=["MAT-101"],
    ),
]
Title = Annotated[str, Field(min_length=1, max_length=150, examples=["Matemáticas I"])]
Description = Annotated[
    str,
    Field(
        max_length=1000,
        description="Opcional. Vacía equivale a sin descripción.",
        examples=["Álgebra y funciones."],
    ),
]


class ClassCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Code
    title: Title
    description: Description | None = None


class ClassUpdate(BaseModel):
    """Only the fields sent are changed. Send `"description": null` to remove it."""

    model_config = ConfigDict(str_strip_whitespace=True)

    code: Code | None = None
    title: Title | None = None
    description: Description | None = None


class ClassResponse(BaseModel):
    id: UUID
    code: str
    title: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, school_class: SchoolClass) -> ClassResponse:
        return cls(
            id=school_class.id,
            code=school_class.code,
            title=school_class.title,
            description=school_class.description,
            created_at=school_class.created_at,
            updated_at=school_class.updated_at,
        )


class ClassPage(BaseModel):
    items: list[ClassResponse]
    total: int
    page: int
    size: int
