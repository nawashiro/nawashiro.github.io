import { test, expect } from "@playwright/test";

test("hero and card sections use daisyUI classes", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("section.hero")).toBeVisible();
  await expect(page.locator(".card").first()).toBeVisible();
  await expect(page.locator(".btn").first()).toBeVisible();
});
