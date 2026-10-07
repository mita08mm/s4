from collections.abc import Iterable
from datetime import UTC, datetime
from uuid import UUID, uuid7

import pytest

from s4.modules.enrollments.application.enroll_student_in_classes import EnrollStudentInClasses
from s4.modules.enrollments.application.unenroll import Unenroll
from s4.modules.enrollments.domain.enrollment import EnrolledClass, EnrolledStudent
from s4.shared.errors import NotFoundError
from tests.unit.classes.fakes import InMemoryClassRepository, make_class
from tests.unit.students.fakes import FakeUnitOfWork, InMemoryStudentRepository, make_student


class InMemoryEnrollmentRepository:
    def __init__(self, classes: InMemoryClassRepository) -> None:
        self.pairs: dict[tuple[UUID, UUID], datetime] = {}
        self._classes = classes

    async def add_many(self, pairs: Iterable[tuple[UUID, UUID]]) -> None:
        for pair in pairs:
            self.pairs.setdefault(pair, datetime.now(UTC))

    async def remove(self, student_id: UUID, class_id: UUID) -> bool:
        return self.pairs.pop((student_id, class_id), None) is not None

    async def classes_of(self, student_id: UUID) -> list[EnrolledClass]:
        return [
            EnrolledClass(self._classes.classes[class_id], enrolled_at)
            for (owner, class_id), enrolled_at in self.pairs.items()
            if owner == student_id
        ]

    async def students_of(self, class_id: UUID) -> list[EnrolledStudent]:
        return []


async def test_enrolls_in_several_classes_and_ignores_repeats() -> None:
    student = make_student()
    math, physics = make_class("MAT-101"), make_class("FIS-101")
    classes = InMemoryClassRepository([math, physics])
    enrollments = InMemoryEnrollmentRepository(classes)
    use_case = EnrollStudentInClasses(
        InMemoryStudentRepository([student]), classes, enrollments, FakeUnitOfWork()
    )

    await use_case.execute(student.id, [math.id])
    result = await use_case.execute(student.id, [math.id, physics.id])

    assert {item.school_class.code for item in result} == {"MAT-101", "FIS-101"}
    assert len(enrollments.pairs) == 2


async def test_is_all_or_nothing_when_a_class_is_missing() -> None:
    student, math = make_student(), make_class("MAT-101")
    classes = InMemoryClassRepository([math])
    enrollments, uow = InMemoryEnrollmentRepository(classes), FakeUnitOfWork()
    students = InMemoryStudentRepository([student])
    use_case = EnrollStudentInClasses(students, classes, enrollments, uow)

    with pytest.raises(NotFoundError) as error:
        await use_case.execute(student.id, [math.id, uuid7()])

    assert error.value.field == "class_ids"
    assert enrollments.pairs == {}
    assert uow.commits == 0


async def test_unknown_student_raises_not_found() -> None:
    classes = InMemoryClassRepository([make_class()])
    enrollments = InMemoryEnrollmentRepository(classes)
    use_case = EnrollStudentInClasses(
        InMemoryStudentRepository(), classes, enrollments, FakeUnitOfWork()
    )

    with pytest.raises(NotFoundError, match="estudiante"):
        await use_case.execute(uuid7(), [next(iter(classes.classes))])


async def test_unenrolling_a_missing_enrollment_raises_not_found() -> None:
    enrollments = InMemoryEnrollmentRepository(InMemoryClassRepository())

    with pytest.raises(NotFoundError):
        await Unenroll(enrollments, FakeUnitOfWork()).execute(uuid7(), uuid7())
