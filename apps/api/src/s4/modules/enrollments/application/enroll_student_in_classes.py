from uuid import UUID

from s4.modules.classes.domain.class_repository import ClassRepository
from s4.modules.enrollments.domain.enrollment import EnrolledClass
from s4.modules.enrollments.domain.enrollment_repository import EnrollmentRepository
from s4.modules.students.domain.student_repository import StudentRepository
from s4.shared.errors import NotFoundError
from s4.shared.unit_of_work import UnitOfWork


class EnrollStudentInClasses:
    """Enrolls one student in several classes at once.

    All or nothing: if any class does not exist, nobody is enrolled. Classes the
    student already takes are ignored, so repeating the request is safe.
    """

    def __init__(
        self,
        students: StudentRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
        unit_of_work: UnitOfWork,
    ) -> None:
        self._students = students
        self._classes = classes
        self._enrollments = enrollments
        self._unit_of_work = unit_of_work

    async def execute(self, student_id: UUID, class_ids: list[UUID]) -> list[EnrolledClass]:
        if await self._students.missing_ids([student_id]):
            raise NotFoundError("El estudiante no existe.")
        if missing := await self._classes.missing_ids(class_ids):
            raise NotFoundError(
                f"No existen {len(missing)} de las clases indicadas.", field="class_ids"
            )

        await self._enrollments.add_many((student_id, class_id) for class_id in class_ids)
        await self._unit_of_work.commit()
        return await self._enrollments.classes_of(student_id)
