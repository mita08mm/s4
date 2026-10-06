from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class Student:
    id: UUID
    code: str
    first_name: str
    last_name: str
    email: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True, slots=True)
class NewStudent:
    code: str
    first_name: str
    last_name: str
    email: str


@dataclass(frozen=True, slots=True)
class StudentChanges:
    """Partial update: `None` means "leave unchanged"."""

    code: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None


# Codes and emails are unique regardless of letter case, so they are stored normalized.
def normalize_code(code: str) -> str:
    return code.strip().upper()


def normalize_email(email: str) -> str:
    return email.strip().lower()
