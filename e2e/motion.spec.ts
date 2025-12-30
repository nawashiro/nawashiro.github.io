import { test, expect } from "@playwright/test";

test("hero title uses motion-safe animation utility", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.locator("[data-testid='hero-title'] span").first()
  ).toHaveClass(/motion-safe:animate-hero-jump/);
});
