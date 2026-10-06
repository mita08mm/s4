from uuid import uuid7

import pytest

from s4.modules.students.application.create_student import CreateStudent
from s4.modules.students.application.delete_student import DeleteStudent
from s4.modules.students.application.get_student import GetStudent
from s4.modules.students.application.update_student import UpdateStudent
from s4.modules.students.domain.student import NewStudent, StudentChanges
from s4.shared.errors import ConflictError, NotFoundError
from tests.unit.students.fakes import FakeUnitOfWork, InMemoryStudentRepository, make_student

NEW_STUDENT = NewStudent(code=" a00123 ", first_name=" Ana ", last_name="Pérez", email="Ana@S4.edu")


async def test_create_normalizes_and_commits() -> None:
    repository, uow = InMemoryStudentRepository(), FakeUnitOfWork()

    student = await CreateStudent(repository, uow).execute(NEW_STUDENT)

    assert (student.code, student.first_name, student.email) == ("A00123", "Ana", "ana@s4.edu")
    assert uow.commits == 1


async def test_create_rejects_duplicated_code_ignoring_case() -> None:
    repository = InMemoryStudentRepository([make_student(code="A00123")])
    uow = FakeUnitOfWork()

    with pytest.raises(ConflictError, match="código A00123"):
        await CreateStudent(repository, uow).execute(NEW_STUDENT)
    assert uow.commits == 0


async def test_create_rejects_duplicated_email_ignoring_case() -> None:
    repository = InMemoryStudentRepository([make_student(code="B1", email="ana@s4.edu")])

    with pytest.raises(ConflictError, match="email"):
        await CreateStudent(repository, FakeUnitOfWork()).execute(NEW_STUDENT)


async def test_get_unknown_student_raises_not_found() -> None:
    with pytest.raises(NotFoundError):
        await GetStudent(InMemoryStudentRepository()).execute(uuid7())


async def test_update_changes_only_the_given_fields() -> None:
    existing = make_student()
    repository, uow = InMemoryStudentRepository([existing]), FakeUnitOfWork()

    updated = await UpdateStudent(repository, uow).execute(
        existing.id, StudentChanges(first_name="Ana María")
    )

    assert updated.first_name == "Ana María"
    assert (updated.code, updated.email) == (existing.code, existing.email)
    assert uow.commits == 1


async def test_update_keeping_its_own_code_is_not_a_conflict() -> None:
    existing = make_student(code="A00001")
    repository = InMemoryStudentRepository([existing])

    updated = await UpdateStudent(repository, FakeUnitOfWork()).execute(
        existing.id, StudentChanges(code="a00001")
    )

    assert updated.code == "A00001"


async def test_update_rejects_a_code_used_by_another_student() -> None:
    first, second = make_student("A00001", "a@s4.edu"), make_student("A00002", "b@s4.edu")
    repository = InMemoryStudentRepository([first, second])

    with pytest.raises(ConflictError):
        await UpdateStudent(repository, FakeUnitOfWork()).execute(
            second.id, StudentChanges(code="A00001")
        )


async def test_delete_unknown_student_raises_not_found() -> None:
    uow = FakeUnitOfWork()

    with pytest.raises(NotFoundError):
        await DeleteStudent(InMemoryStudentRepository(), uow).execute(uuid7())
    assert uow.commits == 0
