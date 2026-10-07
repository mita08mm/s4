import { expect, test, uid } from "./support";

test("create, edit, search and delete a student", async ({ page, api }) => {
  const code = `E2E-${uid()}`;
  await page.goto("/students");

  // Create from the side panel (opened with the "N" shortcut).
  await page.getByRole("heading", { name: "Estudiantes" }).click();
  await page.keyboard.press("n");
  await page.getByLabel("Código").fill(code);
  await page.getByLabel("Nombre").fill("Elena");
  await page.getByLabel("Apellido").fill("Navarro");
  await page.getByLabel("Email").fill(`${code.toLowerCase()}@e2e.s4.edu`);
  await page.getByRole("button", { name: "Crear estudiante" }).click();
  await expect(page.getByText("Estudiante creado")).toBeVisible();

  const created = await api.findStudentByCode(code);
  expect(created).toBeDefined();
  if (created) api.track("students", created.id);

  // Search keeps the query in the URL.
  await page.getByLabel("Buscar estudiantes").fill(`elena ${code}`);
  await expect(page).toHaveURL(/q=elena/);
  await expect(page.locator("tbody tr")).toHaveCount(1);

  // Edit from the pencil button.
  await page.getByRole("button", { name: "Editar a Elena Navarro" }).click();
  await page.getByLabel("Apellido").fill("Navarro Ruiz");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("link", { name: /Elena Navarro Ruiz/ })).toBeVisible();

  // Delete after confirming.
  await page.getByRole("button", { name: "Eliminar a Elena Navarro Ruiz" }).click();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByText("Estudiante eliminado")).toBeVisible();
  await expect(page.getByText(/Sin resultados para/)).toBeVisible();
});

test("validation and duplicated code errors show under the field", async ({ page, api }) => {
  const existing = await api.student();
  await page.goto("/students");

  await page.getByRole("button", { name: "Nuevo estudiante" }).click();
  await page.getByRole("button", { name: "Crear estudiante" }).click();
  await expect(page.getByText("El nombre es obligatorio.")).toBeVisible();

  await page.getByLabel("Código").fill(existing.code.toLowerCase());
  await page.getByLabel("Nombre").fill("Copia");
  await page.getByLabel("Apellido").fill("Duplicada");
  await page.getByLabel("Email").fill(`copia-${uid().toLowerCase()}@e2e.s4.edu`);
  await page.getByRole("button", { name: "Crear estudiante" }).click();

  await expect(page.getByText(`Ya existe un estudiante con el código ${existing.code}.`)).toBeVisible();
});
