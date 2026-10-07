from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import AfterValidator, BaseModel, Field

from s4.modules.classes.http.schemas import ClassResponse
from s4.modules.enrollments.domain.enrollment import EnrolledClass, EnrolledStudent
from s4.modules.students.http.schemas import StudentResponse


def _unique(ids: list[UUID]) -> list[UUID]:
    return list(dict.fromkeys(ids))  # drop repeated ids, keep order


Ids = Annotated[list[UUID], Field(min_length=1, max_length=100), AfterValidator(_unique)]


class EnrollInClassesBody(BaseModel):
    class_ids: Ids


class EnrollStudentsBody(BaseModel):
    student_ids: Ids


class EnrolledClassResponse(ClassResponse):
    enrolled_at: datetime

    @classmethod
    def from_enrolled(cls, item: EnrolledClass) -> EnrolledClassResponse:
        base = ClassResponse.from_entity(item.school_class)
        return cls(**base.model_dump(), enrolled_at=item.enrolled_at)


class EnrolledStudentResponse(StudentResponse):
    enrolled_at: datetime

    @classmethod
    def from_enrolled(cls, item: EnrolledStudent) -> EnrolledStudentResponse:
        base = StudentResponse.from_entity(item.student)
        return cls(**base.model_dump(), enrolled_at=item.enrolled_at)
