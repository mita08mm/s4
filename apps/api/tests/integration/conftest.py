"""Integration tests against a real PostgreSQL test database.

The database `<name>_test` is created on first use. Each test runs inside a
transaction that is rolled back afterwards; the code under test commits to a
savepoint, so tests never see each other's data.
"""

import os
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import make_url, text
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine

from s4.main import create_app
from s4.shared.database import models  # noqa: F401  (registers every table)
from s4.shared.database.base import Base
from s4.shared.database.session import get_session


def test_db_url() -> URL:
    url = make_url(os.environ["DATABASE_URL"])
    return url.set(database=f"{url.database}_test")


async def create_database_if_missing(url: URL) -> None:
    admin = create_async_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    async with admin.connect() as connection:
        found = await connection.scalar(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": url.database}
        )
        if not found:
            await connection.execute(text(f'CREATE DATABASE "{url.database}"'))
    await admin.dispose()


@pytest.fixture(scope="session")
async def engine() -> AsyncIterator[AsyncEngine]:
    url = test_db_url()
    await create_database_if_missing(url)
    engine = create_async_engine(url)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session(engine: AsyncEngine) -> AsyncIterator[AsyncSession]:
    async with engine.connect() as connection:
        transaction = await connection.begin()
        session = AsyncSession(
            bind=connection, expire_on_commit=False, join_transaction_mode="create_savepoint"
        )
        yield session
        await session.close()
        await transaction.rollback()


@pytest.fixture
async def api(db_session: AsyncSession) -> AsyncIterator[AsyncClient]:
    """HTTP client whose requests use the test transaction."""

    async def override_session() -> AsyncIterator[AsyncSession]:
        yield db_session

    app = create_app()
    app.dependency_overrides[get_session] = override_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
