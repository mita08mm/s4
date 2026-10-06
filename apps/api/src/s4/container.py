"""Composition root.

The only place where concrete adapters (e.g. SQLAlchemy repositories) are
instantiated and injected into use cases. Routers depend on the providers
defined here through FastAPI's `Depends`.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from s4.shared.database.session import get_session

SessionDep = Annotated[AsyncSession, Depends(get_session)]
