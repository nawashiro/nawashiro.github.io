import { test, expect } from "@playwright/test";

test("hero title animation is suppressed for reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const firstLetter = page.locator("[data-testid='hero-title'] span").first();
  await expect(firstLetter).toHaveCSS("animation-name", "none");
});
