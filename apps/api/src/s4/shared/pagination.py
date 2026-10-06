from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Page[T]:
    """A slice of a larger result set."""

    items: list[T]
    total: int
    page: int
    size: int
