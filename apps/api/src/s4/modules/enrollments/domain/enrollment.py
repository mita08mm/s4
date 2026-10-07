from dataclasses import dataclass
from datetime import datetime

from s4.modules.classes.domain.school_class import SchoolClass
from s4.modules.students.domain.student import Student


@dataclass(frozen=True, slots=True)
class EnrolledClass:
    """A class seen from one of its students."""

    school_class: SchoolClass
    enrolled_at: datetime


@dataclass(frozen=True, slots=True)
class EnrolledStudent:
    """A student seen from one of their classes."""

    student: Student
    enrolled_at: datetime
