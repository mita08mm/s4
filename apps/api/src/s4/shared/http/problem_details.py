"""RFC 9457 Problem Details responses (`application/problem+json`)."""

from http import HTTPStatus
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

PROBLEM_JSON = "application/problem+json"


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
