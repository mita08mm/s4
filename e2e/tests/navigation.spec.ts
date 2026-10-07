import { expect, test } from "./support";

test("home shows the API status and links to every section", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("API conectada")).toBeVisible();
  await page.getByRole("link", { name: /^Clases/ }).last().click();
  await expect(page).toHaveURL(/\/classes$/);
  await expect(page.getByRole("heading", { name: "Clases", level: 1 })).toBeVisible();
});

test("the command palette navigates with the keyboard", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("ControlOrMeta+k");
  await page.getByPlaceholder("Escribe un comando o busca…").fill("estud");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/students$/);
});

test("the theme toggle switches to dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");

  await page.getByRole("button", { name: "Cambiar tema" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("an unknown student shows the not-found page", async ({ page }) => {
  await page.goto("/students/no-existe");

  await expect(page.getByText("No encontramos esta página")).toBeVisible();
});
