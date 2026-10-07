from collections.abc import Iterable
from typing import Protocol
from uuid import UUID

from s4.modules.enrollments.domain.enrollment import EnrolledClass, EnrolledStudent


class EnrollmentRepository(Protocol):
    """Port: storage of the student-class relationship."""

    async def add_many(self, pairs: Iterable[tuple[UUID, UUID]]) -> None:
        """Enrolls each `(student_id, class_id)` pair. Existing pairs are left as they are."""
        ...

    async def remove(self, student_id: UUID, class_id: UUID) -> bool:
        """Removes the enrollment. Returns `False` if it did not exist."""
        ...

    async def classes_of(self, student_id: UUID) -> list[EnrolledClass]: ...

    async def students_of(self, class_id: UUID) -> list[EnrolledStudent]: ...
