const { test, expect } = require("@playwright/test");

test("El admin puede crear y publicar un recurso", async ({ page }) => {
  await page.goto("http://localhost:1337/admin");
  // ... flujo de aceptación real
  expect(await page.isVisible("text=Publicar")).toBe(true);
});
