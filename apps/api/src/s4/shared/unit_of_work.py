from typing import Protocol


class UnitOfWork(Protocol):
    """Port for the transaction boundary.

    Use cases call `commit()` once their changes are complete; if they raise
    before that, nothing is persisted.
    """

    async def commit(self) -> None: ...
