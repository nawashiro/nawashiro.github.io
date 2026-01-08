import { test, expect } from "@playwright/test";

test("home page renders key sections", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/NAWASHIRO/);
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "RSS" })).toBeVisible();
});
