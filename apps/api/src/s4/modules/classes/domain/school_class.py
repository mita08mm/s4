from dataclasses import dataclass
from datetime import datetime
from typing import Final, final
from uuid import UUID


@dataclass(slots=True)
class SchoolClass:
    """A class students can enroll in ("Class" would read confusingly in Python)."""

    id: UUID
    code: str
    title: str
    description: str | None
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True, slots=True)
class NewSchoolClass:
    code: str
    title: str
    description: str | None = None


@final
class Unset:
    """Marks a field that was not sent, as opposed to one sent as `None`."""

    def __repr__(self) -> str:
        return "UNSET"


UNSET: Final = Unset()


@dataclass(frozen=True, slots=True)
class SchoolClassChanges:
    """Partial update. `code`/`title`: `None` keeps the value.
    `description`: `UNSET` keeps it, `None` clears it."""

    code: str | None = None
    title: str | None = None
    description: str | Unset | None = UNSET


def normalize_code(code: str) -> str:
    return code.strip().upper()


def normalize_description(description: str | None) -> str | None:
    """Blank descriptions are stored as "no description"."""
    if description is None:
        return None
    return description.strip() or None
