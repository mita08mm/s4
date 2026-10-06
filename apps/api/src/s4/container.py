"""Composition root.

The only place where concrete adapters (e.g. SQLAlchemy repositories) are
instantiated and injected into use cases. Routers depend on the providers
defined here through FastAPI's `Depends`. FastAPI caches each dependency per
request, so a repository and the unit of work share the same session.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from s4.modules.students.application.create_student import CreateStudent
from s4.modules.students.application.delete_student import DeleteStudent
from s4.modules.students.application.get_student import GetStudent
from s4.modules.students.application.search_students import SearchStudents
from s4.modules.students.application.update_student import UpdateStudent
from s4.modules.students.domain.student_repository import StudentRepository
from s4.modules.students.infrastructure.sqlalchemy_student_repository import (
    SqlAlchemyStudentRepository,
)
from s4.shared.database.session import get_session
from s4.shared.database.unit_of_work import SqlAlchemyUnitOfWork
from s4.shared.unit_of_work import UnitOfWork

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_unit_of_work(session: SessionDep) -> UnitOfWork:
    return SqlAlchemyUnitOfWork(session)


UnitOfWorkDep = Annotated[UnitOfWork, Depends(get_unit_of_work)]


# ---------- students ----------
def get_student_repository(session: SessionDep) -> StudentRepository:
    return SqlAlchemyStudentRepository(session)


StudentRepositoryDep = Annotated[StudentRepository, Depends(get_student_repository)]


def get_search_students(repository: StudentRepositoryDep) -> SearchStudents:
    return SearchStudents(repository)


def get_get_student(repository: StudentRepositoryDep) -> GetStudent:
    return GetStudent(repository)


def get_create_student(repository: StudentRepositoryDep, uow: UnitOfWorkDep) -> CreateStudent:
    return CreateStudent(repository, uow)


def get_update_student(repository: StudentRepositoryDep, uow: UnitOfWorkDep) -> UpdateStudent:
    return UpdateStudent(repository, uow)


def get_delete_student(repository: StudentRepositoryDep, uow: UnitOfWorkDep) -> DeleteStudent:
    return DeleteStudent(repository, uow)
