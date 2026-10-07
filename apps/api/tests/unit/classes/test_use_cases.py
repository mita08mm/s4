from uuid import uuid7

import pytest

from s4.modules.classes.application.create_class import CreateClass
from s4.modules.classes.application.delete_class import DeleteClass
from s4.modules.classes.application.update_class import UpdateClass
from s4.modules.classes.domain.school_class import NewSchoolClass, SchoolClassChanges
from s4.shared.errors import ConflictError, NotFoundError
from tests.unit.classes.fakes import InMemoryClassRepository, make_class
from tests.unit.students.fakes import FakeUnitOfWork


async def test_create_normalizes_code_and_blank_description() -> None:
    uow = FakeUnitOfWork()
    data = NewSchoolClass(code=" mat-101 ", title=" Matemáticas I ", description="   ")

    created = await CreateClass(InMemoryClassRepository(), uow).execute(data)

    assert (created.code, created.title, created.description) == ("MAT-101", "Matemáticas I", None)
    assert uow.commits == 1


async def test_create_rejects_duplicated_code() -> None:
    repository = InMemoryClassRepository([make_class(code="MAT-101")])

    with pytest.raises(ConflictError) as error:
        await CreateClass(repository, FakeUnitOfWork()).execute(
            NewSchoolClass(code="Mat-101", title="Otra")
        )
    assert error.value.field == "code"


async def test_update_without_description_keeps_it() -> None:
    existing = make_class(description="Álgebra")
    repository = InMemoryClassRepository([existing])

    updated = await UpdateClass(repository, FakeUnitOfWork()).execute(
        existing.id, SchoolClassChanges(title="Matemáticas Básicas")
    )

    assert (updated.title, updated.description) == ("Matemáticas Básicas", "Álgebra")


async def test_update_with_none_description_clears_it() -> None:
    existing = make_class(description="Álgebra")
    repository = InMemoryClassRepository([existing])

    updated = await UpdateClass(repository, FakeUnitOfWork()).execute(
        existing.id, SchoolClassChanges(description=None)
    )

    assert updated.description is None


async def test_delete_unknown_class_raises_not_found() -> None:
    with pytest.raises(NotFoundError):
        await DeleteClass(InMemoryClassRepository(), FakeUnitOfWork()).execute(uuid7())
