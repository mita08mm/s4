def contains_pattern(term: str) -> str:
    r"""`ILIKE` pattern matching `term` anywhere, with `%` and `_` taken literally.

    Use together with `escape="\\"` in the `ilike()` call.
    """
    escaped = term.replace("\\", "\\\\").replace("%", r"\%").replace("_", r"\_")
    return f"%{escaped}%"
