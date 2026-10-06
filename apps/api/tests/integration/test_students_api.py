from typing import Any

from httpx import AsyncClient

URL = "/api/v1/students"


def student(code: str = "A00123", email: str = "ana.perez@s4.edu", **extra: str) -> dict[str, Any]:
    return {"code": code, "first_name": "Ana", "last_name": "Pérez", "email": email} | extra


async def create(api: AsyncClient, body: dict[str, Any]) -> dict[str, Any]:
    response = await api.post(URL, json=body)
    assert response.status_code == 201, response.text
    result: dict[str, Any] = response.json()
    return result


async def test_create_returns_201_with_location(api: AsyncClient) -> None:
    response = await api.post(URL, json=student(code="a00123"))

    assert response.status_code == 201
    body = response.json()
    assert body["code"] == "A00123"
    assert response.headers["location"] == f"{URL}/{body['id']}"


async def test_duplicated_code_returns_409_problem(api: AsyncClient) -> None:
    await create(api, student())

    response = await api.post(URL, json=student(code="a00123", email="otra@s4.edu"))

    assert response.status_code == 409
    assert response.headers["content-type"] == "application/problem+json"
    assert "A00123" in response.json()["detail"]


async def test_duplicated_email_returns_409(api: AsyncClient) -> None:
    await create(api, student())

    response = await api.post(URL, json=student(code="B00001", email="ANA.PEREZ@s4.edu"))

    assert response.status_code == 409


async def test_invalid_body_returns_422_with_field_errors(api: AsyncClient) -> None:
    response = await api.post(URL, json={"code": "a", "first_name": "", "email": "no-es-email"})

    assert response.status_code == 422
    fields = {error["field"] for error in response.json()["errors"]}
    assert {"body.code", "body.first_name", "body.last_name", "body.email"} <= fields


async def test_get_update_and_delete(api: AsyncClient) -> None:
    created = await create(api, student())
    item_url = f"{URL}/{created['id']}"

    assert (await api.get(item_url)).json()["email"] == "ana.perez@s4.edu"

    patched = await api.patch(item_url, json={"last_name": "Pérez Gómez"})
    assert patched.status_code == 200
    assert patched.json()["last_name"] == "Pérez Gómez"
    assert patched.json()["first_name"] == "Ana"

    assert (await api.delete(item_url)).status_code == 204
    assert (await api.get(item_url)).status_code == 404


async def test_unknown_or_malformed_id(api: AsyncClient) -> None:
    assert (await api.get(f"{URL}/0190b6c4-0000-7000-8000-000000000000")).status_code == 404
    assert (await api.get(f"{URL}/not-a-uuid")).status_code == 422


async def test_search_matches_every_word_across_fields(api: AsyncClient) -> None:
    await create(api, student("A001", "ana.perez@s4.edu"))
    await create(api, student("A002", "ana.rojas@s4.edu", last_name="Rojas"))
    await create(api, student("A003", "luis@s4.edu", first_name="Luis"))

    by_name = (await api.get(URL, params={"q": "ana"})).json()
    assert by_name["total"] == 2

    two_words = (await api.get(URL, params={"q": "ANA pér"})).json()
    assert [item["code"] for item in two_words["items"]] == ["A001"]

    by_email = (await api.get(URL, params={"q": "luis@"})).json()
    assert by_email["total"] == 1


async def test_search_treats_wildcards_literally(api: AsyncClient) -> None:
    await create(api, student())

    assert (await api.get(URL, params={"q": "%"})).json()["total"] == 0


async def test_pagination(api: AsyncClient) -> None:
    for number in range(5):
        await create(api, student(f"P00{number}", f"p{number}@s4.edu"))

    page = (await api.get(URL, params={"page": 2, "size": 2})).json()

    assert (page["total"], page["page"], page["size"], len(page["items"])) == (5, 2, 2, 2)
