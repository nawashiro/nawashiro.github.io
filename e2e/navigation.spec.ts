import { test, expect } from "@playwright/test";

test("navigate from home to a post", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "ハロー・ワールド - 読書メモ" })
    .first()
    .click();
  await page.waitForURL("**/posts/20241217-hello-world");
  await expect(
    page.getByRole("heading", { name: "ハロー・ワールド - 読書メモ" })
  ).toBeVisible();
});
