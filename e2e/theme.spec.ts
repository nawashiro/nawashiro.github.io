import { test, expect } from "@playwright/test";

test("html element declares daisyUI theme", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "nawashiro"
  );
});
