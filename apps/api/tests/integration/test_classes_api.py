from typing import Any

from httpx import AsyncClient

URL = "/api/v1/classes"


def school_class(code: str = "MAT-101", **extra: str | None) -> dict[str, Any]:
    return {"code": code, "title": "Matemáticas I", "description": "Álgebra y funciones"} | extra


async def create(api: AsyncClient, body: dict[str, Any]) -> dict[str, Any]:
    response = await api.post(URL, json=body)
    assert response.status_code == 201, response.text
    result: dict[str, Any] = response.json()
    return result


async def test_create_returns_201_with_location(api: AsyncClient) -> None:
    response = await api.post(URL, json=school_class(code="mat-101"))

    assert response.status_code == 201
    body = response.json()
    assert body["code"] == "MAT-101"
    assert response.headers["location"] == f"{URL}/{body['id']}"


async def test_description_is_optional(api: AsyncClient) -> None:
    body = await create(api, {"code": "HIS-101", "title": "Historia"})

    assert body["description"] is None


async def test_duplicated_code_returns_409_on_the_code_field(api: AsyncClient) -> None:
    await create(api, school_class())

    response = await api.post(URL, json=school_class(code="Mat-101", title="Otra"))

    assert response.status_code == 409
    assert response.json()["errors"][0]["field"] == "code"


async def test_patch_keeps_or_clears_the_description(api: AsyncClient) -> None:
    created = await create(api, school_class())
    item_url = f"{URL}/{created['id']}"

    kept = (await api.patch(item_url, json={"title": "Matemáticas Básicas"})).json()
    assert (kept["title"], kept["description"]) == ("Matemáticas Básicas", "Álgebra y funciones")

    cleared = (await api.patch(item_url, json={"description": None})).json()
    assert cleared["description"] is None


async def test_search_includes_the_description(api: AsyncClient) -> None:
    await create(api, school_class("MAT-101"))
    await create(api, school_class("FIS-101", title="Física I", description="Mecánica clásica"))

    result = (await api.get(URL, params={"q": "mecánica"})).json()

    assert [item["code"] for item in result["items"]] == ["FIS-101"]


async def test_delete_then_get_returns_404(api: AsyncClient) -> None:
    created = await create(api, school_class())
    item_url = f"{URL}/{created['id']}"

    assert (await api.delete(item_url)).status_code == 204
    assert (await api.get(item_url)).status_code == 404
