from typing import Any

from httpx import AsyncClient


async def create(api: AsyncClient, url: str, body: dict[str, Any]) -> str:
    response = await api.post(url, json=body)
    assert response.status_code == 201, response.text
    created_id: str = response.json()["id"]
    return created_id


async def student(api: AsyncClient, code: str) -> str:
    body = {"code": code, "first_name": "Ana", "last_name": code, "email": f"{code}@s4.edu"}
    return await create(api, "/api/v1/students", body)


async def school_class(api: AsyncClient, code: str) -> str:
    return await create(api, "/api/v1/classes", {"code": code, "title": f"Clase {code}"})


async def test_enroll_in_several_classes_and_query_both_ways(api: AsyncClient) -> None:
    ana = await student(api, "A001")
    math, physics = await school_class(api, "MAT-101"), await school_class(api, "FIS-101")

    response = await api.post(
        f"/api/v1/students/{ana}/classes", json={"class_ids": [math, physics]}
    )

    assert response.status_code == 200
    assert [item["code"] for item in response.json()] == ["FIS-101", "MAT-101"]
    assert "enrolled_at" in response.json()[0]
    students = (await api.get(f"/api/v1/classes/{math}/students")).json()
    assert [item["id"] for item in students] == [ana]


async def test_enrolling_twice_does_not_duplicate(api: AsyncClient) -> None:
    ana, math = await student(api, "A001"), await school_class(api, "MAT-101")
    url = f"/api/v1/students/{ana}/classes"

    await api.post(url, json={"class_ids": [math]})
    again = await api.post(url, json={"class_ids": [math, math]})

    assert again.status_code == 200
    assert len(again.json()) == 1


async def test_enroll_several_students_from_the_class(api: AsyncClient) -> None:
    math = await school_class(api, "MAT-101")
    ana, luis = await student(api, "A001"), await student(api, "A002")

    response = await api.post(f"/api/v1/classes/{math}/students", json={"student_ids": [ana, luis]})

    assert response.status_code == 200
    assert {item["id"] for item in response.json()} == {ana, luis}


async def test_unknown_class_is_404_and_enrolls_nobody(api: AsyncClient) -> None:
    ana, math = await student(api, "A001"), await school_class(api, "MAT-101")
    unknown = "0190b6c4-0000-7000-8000-000000000000"

    response = await api.post(
        f"/api/v1/students/{ana}/classes", json={"class_ids": [math, unknown]}
    )

    assert response.status_code == 404
    assert response.json()["errors"][0]["field"] == "class_ids"
    assert (await api.get(f"/api/v1/students/{ana}/classes")).json() == []


async def test_unenroll(api: AsyncClient) -> None:
    ana, math = await student(api, "A001"), await school_class(api, "MAT-101")
    await api.post(f"/api/v1/students/{ana}/classes", json={"class_ids": [math]})

    assert (await api.delete(f"/api/v1/classes/{math}/students/{ana}")).status_code == 204
    assert (await api.delete(f"/api/v1/students/{ana}/classes/{math}")).status_code == 404
    assert (await api.get(f"/api/v1/students/{ana}/classes")).json() == []


async def test_deleting_a_student_or_class_removes_its_enrollments(api: AsyncClient) -> None:
    ana, luis = await student(api, "A001"), await student(api, "A002")
    math = await school_class(api, "MAT-101")
    await api.post(f"/api/v1/classes/{math}/students", json={"student_ids": [ana, luis]})

    await api.delete(f"/api/v1/students/{ana}")
    remaining = (await api.get(f"/api/v1/classes/{math}/students")).json()
    assert [item["id"] for item in remaining] == [luis]

    await api.delete(f"/api/v1/classes/{math}")
    assert (await api.get(f"/api/v1/students/{luis}/classes")).json() == []


async def test_empty_or_invalid_body_is_422(api: AsyncClient) -> None:
    ana = await student(api, "A001")
    url = f"/api/v1/students/{ana}/classes"

    assert (await api.post(url, json={"class_ids": []})).status_code == 422
    assert (await api.post(url, json={"class_ids": ["no-es-uuid"]})).status_code == 422


async def test_relationship_of_unknown_entities_is_404(api: AsyncClient) -> None:
    unknown = "0190b6c4-0000-7000-8000-000000000000"

    assert (await api.get(f"/api/v1/students/{unknown}/classes")).status_code == 404
    assert (await api.get(f"/api/v1/classes/{unknown}/students")).status_code == 404
