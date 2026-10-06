from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, Response, status

from s4.container import (
    get_create_student,
    get_delete_student,
    get_get_student,
    get_search_students,
    get_update_student,
)
from s4.modules.students.application.create_student import CreateStudent
from s4.modules.students.application.delete_student import DeleteStudent
from s4.modules.students.application.get_student import GetStudent
from s4.modules.students.application.search_students import SearchStudents
from s4.modules.students.application.update_student import UpdateStudent
from s4.modules.students.domain.student import NewStudent, StudentChanges
from s4.modules.students.http.schemas import (
    StudentCreate,
    StudentPage,
    StudentResponse,
    StudentUpdate,
)
from s4.shared.http.problem_details import problem_responses

router = APIRouter(prefix="/students", tags=["students"])

SEARCH_DESCRIPTION = (
    "Búsqueda parcial y sin distinguir mayúsculas sobre código, nombre, apellido y email. "
    "Con varias palabras, cada una debe aparecer en alguno de esos campos "
    '(por ejemplo, "ana pérez"). Vacío devuelve todos.'
)


@router.get(
    "",
    summary="Listar y buscar estudiantes",
    responses=problem_responses(422),
)
async def search_students(
    use_case: Annotated[SearchStudents, Depends(get_search_students)],
    q: Annotated[str | None, Query(max_length=100, description=SEARCH_DESCRIPTION)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> StudentPage:
    result = await use_case.execute(q, page=page, size=size)
    return StudentPage(
        items=[StudentResponse.from_entity(student) for student in result.items],
        total=result.total,
        page=result.page,
        size=result.size,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear un estudiante",
    responses=problem_responses(409, 422),
)
async def create_student(
    body: StudentCreate,
    request: Request,
    response: Response,
    use_case: Annotated[CreateStudent, Depends(get_create_student)],
) -> StudentResponse:
    student = await use_case.execute(NewStudent(**body.model_dump()))
    response.headers["Location"] = request.url_for("get_student", student_id=student.id).path
    return StudentResponse.from_entity(student)


@router.get(
    "/{student_id}",
    summary="Obtener un estudiante",
    responses=problem_responses(404, 422),
)
async def get_student(
    student_id: UUID,
    use_case: Annotated[GetStudent, Depends(get_get_student)],
) -> StudentResponse:
    return StudentResponse.from_entity(await use_case.execute(student_id))


@router.patch(
    "/{student_id}",
    summary="Actualizar un estudiante",
    responses=problem_responses(404, 409, 422),
)
async def update_student(
    student_id: UUID,
    body: StudentUpdate,
    use_case: Annotated[UpdateStudent, Depends(get_update_student)],
) -> StudentResponse:
    changes = StudentChanges(**body.model_dump(exclude_unset=True))
    return StudentResponse.from_entity(await use_case.execute(student_id, changes))


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un estudiante",
    description="También elimina sus inscripciones.",
    responses=problem_responses(404, 422),
)
async def delete_student(
    student_id: UUID,
    use_case: Annotated[DeleteStudent, Depends(get_delete_student)],
) -> None:
    await use_case.execute(student_id)
