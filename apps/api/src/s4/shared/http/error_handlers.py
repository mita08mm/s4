"""Translate exceptions into Problem Details responses.

This is the only place that knows how domain errors map to HTTP status codes.
"""

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException

from s4.shared.errors import ConflictError, DomainError, NotFoundError
from s4.shared.http.problem_details import problem_response

logger = structlog.get_logger()

DOMAIN_ERROR_STATUS: dict[type[DomainError], int] = {
    NotFoundError: 404,
    ConflictError: 409,
}

UNIQUE_VIOLATION = "23505"


async def handle_domain_error(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, DomainError)
    status = DOMAIN_ERROR_STATUS.get(type(exc), 400)
    return problem_response(request, status, exc.detail)


async def handle_validation_error(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    errors = [
        {"field": ".".join(str(part) for part in error["loc"]), "message": error["msg"]}
        for error in exc.errors()
    ]
    return problem_response(request, 422, "The request contains invalid data.", errors=errors)


async def handle_http_exception(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, HTTPException)
    return problem_response(request, exc.status_code, str(exc.detail))


async def handle_integrity_error(request: Request, exc: Exception) -> JSONResponse:
    # Safety net for race conditions: the database constraint is the final guarantee.
    assert isinstance(exc, IntegrityError)
    if getattr(exc.orig, "sqlstate", None) == UNIQUE_VIOLATION:
        return problem_response(request, 409, "The resource already exists.")
    return await handle_unexpected_error(request, exc)


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error", path=request.url.path)
    return problem_response(request, 500, "An unexpected error occurred.")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(DomainError, handle_domain_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(HTTPException, handle_http_exception)
    app.add_exception_handler(IntegrityError, handle_integrity_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
