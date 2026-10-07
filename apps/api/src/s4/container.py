"""Composition root.

The only place where concrete adapters (e.g. SQLAlchemy repositories) are
instantiated and injected into use cases. Routers depend on the providers
defined here through FastAPI's `Depends`. FastAPI caches each dependency per
request, so a repository and the unit of work share the same session.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from s4.modules.classes.application.create_class import CreateClass
from s4.modules.classes.application.delete_class import DeleteClass
from s4.modules.classes.application.get_class import GetClass
from s4.modules.classes.application.search_classes import SearchClasses
from s4.modules.classes.application.update_class import UpdateClass
from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.classes.infrastructure.sqlalchemy_class_repository import (
    SqlAlchemyClassRepository,
)
from s4.modules.enrollments.application.enroll_student_in_classes import EnrollStudentInClasses
from s4.modules.enrollments.application.enroll_students_in_class import EnrollStudentsInClass
from s4.modules.enrollments.application.list_classes_of_student import ListClassesOfStudent
from s4.modules.enrollments.application.list_students_of_class import ListStudentsOfClass
from s4.modules.enrollments.application.unenroll import Unenroll
from s4.modules.enrollments.domain.enrollment_repository import EnrollmentRepository
from s4.modules.enrollments.infrastructure.sqlalchemy_enrollment_repository import (
    SqlAlchemyEnrollmentRepository,
)
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


# ---------- classes ----------
def get_class_repository(session: SessionDep) -> ClassRepository:
    return SqlAlchemyClassRepository(session)


ClassRepositoryDep = Annotated[ClassRepository, Depends(get_class_repository)]


def get_search_classes(repository: ClassRepositoryDep) -> SearchClasses:
    return SearchClasses(repository)


def get_get_class(repository: ClassRepositoryDep) -> GetClass:
    return GetClass(repository)


def get_create_class(repository: ClassRepositoryDep, uow: UnitOfWorkDep) -> CreateClass:
    return CreateClass(repository, uow)


def get_update_class(repository: ClassRepositoryDep, uow: UnitOfWorkDep) -> UpdateClass:
    return UpdateClass(repository, uow)


def get_delete_class(repository: ClassRepositoryDep, uow: UnitOfWorkDep) -> DeleteClass:
    return DeleteClass(repository, uow)


# ---------- enrollments ----------
def get_enrollment_repository(session: SessionDep) -> EnrollmentRepository:
    return SqlAlchemyEnrollmentRepository(session)


EnrollmentRepositoryDep = Annotated[EnrollmentRepository, Depends(get_enrollment_repository)]


def get_list_classes_of_student(
    students: StudentRepositoryDep, enrollments: EnrollmentRepositoryDep
) -> ListClassesOfStudent:
    return ListClassesOfStudent(students, enrollments)


def get_list_students_of_class(
    classes: ClassRepositoryDep, enrollments: EnrollmentRepositoryDep
) -> ListStudentsOfClass:
    return ListStudentsOfClass(classes, enrollments)


def get_enroll_student_in_classes(
    students: StudentRepositoryDep,
    classes: ClassRepositoryDep,
    enrollments: EnrollmentRepositoryDep,
    uow: UnitOfWorkDep,
) -> EnrollStudentInClasses:
    return EnrollStudentInClasses(students, classes, enrollments, uow)


def get_enroll_students_in_class(
    students: StudentRepositoryDep,
    classes: ClassRepositoryDep,
    enrollments: EnrollmentRepositoryDep,
    uow: UnitOfWorkDep,
) -> EnrollStudentsInClass:
    return EnrollStudentsInClass(students, classes, enrollments, uow)


def get_unenroll(enrollments: EnrollmentRepositoryDep, uow: UnitOfWorkDep) -> Unenroll:
    return Unenroll(enrollments, uow)
