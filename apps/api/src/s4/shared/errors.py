"""Domain errors.

Use cases raise these errors to express business failures. They carry no HTTP
knowledge: the mapping to status codes lives in `s4.shared.http.error_handlers`.
"""


class DomainError(Exception):
    def __init__(self, detail: str, *, field: str | None = None) -> None:
        """`field` names the input field that caused the error, when there is one."""
        super().__init__(detail)
        self.detail = detail
        self.field = field


class NotFoundError(DomainError):
    """The requested resource does not exist."""


class ConflictError(DomainError):
    """The operation conflicts with the current state (e.g. a duplicated unique value)."""
