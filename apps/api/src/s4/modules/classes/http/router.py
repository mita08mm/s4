from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, Response, status

from s4.container import (
    get_create_class,
    get_delete_class,
    get_get_class,
    get_search_classes,
    get_update_class,
)
from s4.modules.classes.application.create_class import CreateClass
from s4.modules.classes.application.delete_class import DeleteClass
from s4.modules.classes.application.get_class import GetClass
from s4.modules.classes.application.search_classes import SearchClasses
from s4.modules.classes.application.update_class import UpdateClass
from s4.modules.classes.domain.school_class import NewSchoolClass, SchoolClassChanges
from s4.modules.classes.http.schemas import ClassCreate, ClassPage, ClassResponse, ClassUpdate
from s4.shared.http.problem_details import problem_responses

router = APIRouter(prefix="/classes", tags=["classes"])

SEARCH_DESCRIPTION = (
    "Búsqueda parcial y sin distinguir mayúsculas sobre código, título y descripción. "
    "Con varias palabras, cada una debe aparecer en alguno de esos campos. "
    "Vacío devuelve todas."
)


@router.get("", summary="Listar y buscar clases", responses=problem_responses(422))
async def search_classes(
    use_case: Annotated[SearchClasses, Depends(get_search_classes)],
    q: Annotated[str | None, Query(max_length=100, description=SEARCH_DESCRIPTION)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ClassPage:
    result = await use_case.execute(q, page=page, size=size)
    return ClassPage(
        items=[ClassResponse.from_entity(item) for item in result.items],
        total=result.total,
        page=result.page,
        size=result.size,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Crear una clase",
    responses=problem_responses(409, 422),
)
async def create_class(
    body: ClassCreate,
    request: Request,
    response: Response,
    use_case: Annotated[CreateClass, Depends(get_create_class)],
) -> ClassResponse:
    school_class = await use_case.execute(NewSchoolClass(**body.model_dump()))
    response.headers["Location"] = request.url_for("get_class", class_id=school_class.id).path
    return ClassResponse.from_entity(school_class)


@router.get("/{class_id}", summary="Obtener una clase", responses=problem_responses(404, 422))
async def get_class(
    class_id: UUID,
    use_case: Annotated[GetClass, Depends(get_get_class)],
) -> ClassResponse:
    return ClassResponse.from_entity(await use_case.execute(class_id))


@router.patch(
    "/{class_id}",
    summary="Actualizar una clase",
    responses=problem_responses(404, 409, 422),
)
async def update_class(
    class_id: UUID,
    body: ClassUpdate,
    use_case: Annotated[UpdateClass, Depends(get_update_class)],
) -> ClassResponse:
    # exclude_unset keeps "not sent" apart from "sent as null" (which clears the description).
    changes = SchoolClassChanges(**body.model_dump(exclude_unset=True))
    return ClassResponse.from_entity(await use_case.execute(class_id, changes))


@router.delete(
    "/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar una clase",
    description="También elimina sus inscripciones.",
    responses=problem_responses(404, 422),
)
async def delete_class(
    class_id: UUID,
    use_case: Annotated[DeleteClass, Depends(get_delete_class)],
) -> None:
    await use_case.execute(class_id)
