import { test, expect } from "@playwright/test";

test("hero highlights the site intro and feed links", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("hero-title")).toContainText("Development");
  await expect(page.getByRole("link", { name: "RSS" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Atom" })).toBeVisible();
  await expect(page.getByRole("link", { name: "JSON" })).toBeVisible();
});
