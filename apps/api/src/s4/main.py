from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from scalar_fastapi import get_scalar_api_reference

from s4.shared.config import get_settings
from s4.shared.http import health
from s4.shared.http.error_handlers import register_error_handlers
from s4.shared.logging import configure_logging


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level, json=settings.environment == "production")

    app = FastAPI(
        title="S4 — Super Simple Scheduling System",
        version="0.1.0",
        docs_url=None,  # Swagger UI is replaced by Scalar (see /docs below)
        redoc_url=None,
    )
    register_error_handlers(app)
    app.include_router(health.router)

    @app.get("/docs", include_in_schema=False)
    async def api_reference() -> HTMLResponse:
        return get_scalar_api_reference(openapi_url=app.openapi_url, title=app.title)

    return app


app = create_app()
