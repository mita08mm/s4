"""Demo data. Idempotent: rows that already exist (same code) are skipped.

Run with `python -m s4.shared.database.seed` (the `migrate` service does it).
"""

import asyncio

import structlog
from sqlalchemy.dialects.postgresql import insert

from s4.modules.classes.infrastructure.class_model import ClassModel
from s4.modules.students.infrastructure.student_model import StudentModel
from s4.shared.database.session import get_engine, get_sessionmaker

logger = structlog.get_logger()

STUDENTS = [
    ("A00101", "Ana", "Pérez", "ana.perez@s4.edu"),
    ("A00102", "Luis", "Gómez", "luis.gomez@s4.edu"),
    ("A00103", "María", "Fernández", "maria.fernandez@s4.edu"),
    ("A00104", "Jorge", "Ramírez", "jorge.ramirez@s4.edu"),
    ("A00105", "Lucía", "Torres", "lucia.torres@s4.edu"),
    ("A00106", "Diego", "Morales", "diego.morales@s4.edu"),
    ("A00107", "Valentina", "Rojas", "valentina.rojas@s4.edu"),
    ("A00108", "Mateo", "Castro", "mateo.castro@s4.edu"),
    ("A00109", "Camila", "Vargas", "camila.vargas@s4.edu"),
    ("A00110", "Sebastián", "Herrera", "sebastian.herrera@s4.edu"),
    ("A00111", "Isabella", "Mendoza", "isabella.mendoza@s4.edu"),
    ("A00112", "Nicolás", "Silva", "nicolas.silva@s4.edu"),
]

CLASSES = [
    ("MAT-101", "Matemáticas I", "Álgebra, funciones y una introducción al cálculo."),
    ("FIS-101", "Física I", "Mecánica clásica: cinemática, dinámica y energía."),
    ("QUI-101", "Química General", "Estructura atómica, enlaces y reacciones."),
    ("PRG-101", "Programación I", "Fundamentos de programación con Python."),
    ("PRG-201", "Estructuras de Datos", "Listas, árboles, grafos y análisis de complejidad."),
    ("BDD-201", "Bases de Datos", "Modelo relacional, SQL y normalización."),
    ("HIS-101", "Historia del Arte", None),
    ("ING-101", "Inglés Técnico", "Lectura y escritura de documentación técnica."),
]


async def seed() -> None:
    async with get_sessionmaker()() as session:
        await session.execute(
            insert(StudentModel)
            .values(
                [
                    {"code": code, "first_name": first, "last_name": last, "email": email}
                    for code, first, last, email in STUDENTS
                ]
            )
            .on_conflict_do_nothing()
        )
        await session.execute(
            insert(ClassModel)
            .values(
                [
                    {"code": code, "title": title, "description": description}
                    for code, title, description in CLASSES
                ]
            )
            .on_conflict_do_nothing()
        )
        await session.commit()
    await get_engine().dispose()
    logger.info("seed_completed", students=len(STUDENTS), classes=len(CLASSES))


if __name__ == "__main__":
    asyncio.run(seed())
