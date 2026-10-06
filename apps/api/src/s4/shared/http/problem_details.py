"""RFC 9457 Problem Details responses (`application/problem+json`)."""

from http import HTTPStatus
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

PROBLEM_JSON = "application/problem+json"


class FieldError(BaseModel):
    field: str
    message: str


class ProblemDetails(BaseModel):
    """Error body shared by every endpoint (documentation model)."""

    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None
    instance: str | None = None
    errors: list[FieldError] | None = None


def problem_responses(*statuses: int) -> dict[int | str, dict[str, Any]]:
    """OpenAPI `responses` entries documenting the given error statuses."""
    return {
        status: {"description": HTTPStatus(status).phrase, "model": ProblemDetails}
        for status in statuses
    }


def problem_response(
    request: Request,
    status: int,
    detail: str | None = None,
    **extensions: Any,
) -> JSONResponse:
    body: dict[str, Any] = {
        "type": "about:blank",
        "title": HTTPStatus(status).phrase,
        "status": status,
        "instance": request.url.path,
    }
    if detail is not None:
        body["detail"] = detail
    body.update(extensions)
    return JSONResponse(status_code=status, content=body, media_type=PROBLEM_JSON)
