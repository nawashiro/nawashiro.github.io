import { test, expect } from "@playwright/test";

test("header uses daisyUI navbar structure", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("header .navbar")).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
});
