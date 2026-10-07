import { expect, test } from "./support";

test("enroll a student in several classes and unenroll one", async ({ page, api }) => {
  const student = await api.student({ first_name: "Inés" });
  const algebra = await api.schoolClass(`Álgebra ${student.code}`);
  const physics = await api.schoolClass(`Física ${student.code}`);

  await page.goto(`/students/${student.id}`);
  await expect(page.getByText("Sin clases todavía")).toBeVisible();

  // Pick both classes in the searchable multi-select.
  await page.getByRole("button", { name: "Inscribir en clases" }).click();
  const search = page.getByPlaceholder("Buscar por código o título…");
  await search.fill(algebra.code);
  await page.getByRole("option", { name: new RegExp(algebra.title) }).click();
  await search.fill(physics.code);
  await page.getByRole("option", { name: new RegExp(physics.title) }).click();
  await page.getByRole("button", { name: "Inscribir (2)" }).click();

  const rows = page.locator("main section li");
  await expect(rows).toHaveCount(2);

  // The class sees the student too.
  await page.getByRole("link", { name: new RegExp(algebra.title) }).click();
  await expect(page.getByRole("link", { name: new RegExp(`Inés ${student.code}`) })).toBeVisible();

  // Unenroll from the class page.
  await page.getByRole("button", { name: `Quitar a Inés ${student.code}` }).click();
  await expect(page.getByText("Inscripción eliminada")).toBeVisible();
  await expect(page.getByText("Nadie inscrito todavía")).toBeVisible();

  await page.goto(`/students/${student.id}`);
  await expect(rows).toHaveCount(1);
});
