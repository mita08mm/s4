from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from s4.shared.config import get_settings


@lru_cache
def get_engine() -> AsyncEngine:
    return create_async_engine(str(get_settings().database_url), pool_pre_ping=True)


@lru_cache
def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(get_engine(), expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    """One session per request; rolled back automatically if the request fails."""
    async with get_sessionmaker()() as session:
        yield session
