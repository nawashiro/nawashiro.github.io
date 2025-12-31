import { test, expect } from "@playwright/test";

test("header exposes primary navigation links", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("link", { name: "NAWASHIRO" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Links" })).toBeVisible();
});
