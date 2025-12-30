import { test, expect } from "@playwright/test";

test("post page renders content", async ({ page }) => {
  await page.goto("/posts/20241217-hello-world");

  await expect(
    page.getByRole("heading", { name: "ハロー・ワールド - 読書メモ" })
  ).toBeVisible();
  await expect(page.locator("article")).toBeVisible();
});
