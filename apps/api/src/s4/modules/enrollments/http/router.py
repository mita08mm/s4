from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from s4.container import (
    get_enroll_student_in_classes,
    get_enroll_students_in_class,
    get_list_classes_of_student,
    get_list_students_of_class,
    get_unenroll,
)
from s4.modules.enrollments.application.enroll_student_in_classes import EnrollStudentInClasses
from s4.modules.enrollments.application.enroll_students_in_class import EnrollStudentsInClass
from s4.modules.enrollments.application.list_classes_of_student import ListClassesOfStudent
from s4.modules.enrollments.application.list_students_of_class import ListStudentsOfClass
from s4.modules.enrollments.application.unenroll import Unenroll
from s4.modules.enrollments.http.schemas import (
    EnrolledClassResponse,
    EnrolledStudentResponse,
    EnrollInClassesBody,
    EnrollStudentsBody,
)
from s4.shared.http.problem_details import problem_responses

router = APIRouter(tags=["enrollments"])

IDEMPOTENT = "Las inscripciones existentes se ignoran: repetir la petición no duplica nada. "
ATOMIC = "Si algún id no existe, responde 404 y no inscribe a nadie."


# ---------- from the student ----------
@router.get(
    "/students/{student_id}/classes",
    summary="Clases de un estudiante",
    responses=problem_responses(404, 422),
)
async def list_classes_of_student(
    student_id: UUID,
    use_case: Annotated[ListClassesOfStudent, Depends(get_list_classes_of_student)],
) -> list[EnrolledClassResponse]:
    enrolled = await use_case.execute(student_id)
    return [EnrolledClassResponse.from_enrolled(item) for item in enrolled]


@router.post(
    "/students/{student_id}/classes",
    summary="Inscribir a un estudiante en varias clases",
    description=IDEMPOTENT + ATOMIC + " Devuelve todas sus clases.",
    responses=problem_responses(404, 422),
)
async def enroll_student_in_classes(
    student_id: UUID,
    body: EnrollInClassesBody,
    use_case: Annotated[EnrollStudentInClasses, Depends(get_enroll_student_in_classes)],
) -> list[EnrolledClassResponse]:
    enrolled = await use_case.execute(student_id, body.class_ids)
    return [EnrolledClassResponse.from_enrolled(item) for item in enrolled]


@router.delete(
    "/students/{student_id}/classes/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Desinscribir a un estudiante de una clase",
    responses=problem_responses(404, 422),
)
async def unenroll_from_student(
    student_id: UUID,
    class_id: UUID,
    use_case: Annotated[Unenroll, Depends(get_unenroll)],
) -> None:
    await use_case.execute(student_id, class_id)


# ---------- from the class ----------
@router.get(
    "/classes/{class_id}/students",
    summary="Estudiantes de una clase",
    responses=problem_responses(404, 422),
)
async def list_students_of_class(
    class_id: UUID,
    use_case: Annotated[ListStudentsOfClass, Depends(get_list_students_of_class)],
) -> list[EnrolledStudentResponse]:
    enrolled = await use_case.execute(class_id)
    return [EnrolledStudentResponse.from_enrolled(item) for item in enrolled]


@router.post(
    "/classes/{class_id}/students",
    summary="Inscribir varios estudiantes en una clase",
    description=IDEMPOTENT + ATOMIC + " Devuelve todos sus estudiantes.",
    responses=problem_responses(404, 422),
)
async def enroll_students_in_class(
    class_id: UUID,
    body: EnrollStudentsBody,
    use_case: Annotated[EnrollStudentsInClass, Depends(get_enroll_students_in_class)],
) -> list[EnrolledStudentResponse]:
    enrolled = await use_case.execute(class_id, body.student_ids)
    return [EnrolledStudentResponse.from_enrolled(item) for item in enrolled]


@router.delete(
    "/classes/{class_id}/students/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Desinscribir a un estudiante de una clase",
    responses=problem_responses(404, 422),
)
async def unenroll_from_class(
    class_id: UUID,
    student_id: UUID,
    use_case: Annotated[Unenroll, Depends(get_unenroll)],
) -> None:
    await use_case.execute(student_id, class_id)
