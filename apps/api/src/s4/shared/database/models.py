"""Registry of every ORM model.

Alembic imports this module so autogenerate sees all tables. Add new models here.
"""

from s4.modules.classes.infrastructure.class_model import ClassModel
from s4.modules.students.infrastructure.student_model import StudentModel

__all__ = ["ClassModel", "StudentModel"]
