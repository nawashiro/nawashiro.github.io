import { test, expect } from "@playwright/test";

test("post page has a single canonical link", async ({ page }) => {
  await page.goto("/posts/20221213-individual-site");

  await expect(page.locator("link[rel='canonical']")).toHaveCount(1);
});
