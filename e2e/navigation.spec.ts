import { test, expect } from "@playwright/test";

test("navigate from home to a post", async ({ page }) => {
  await page.goto("/");
  const link = page
    .getByRole("link", { name: "ハロー・ワールド - 読書メモ" })
    .first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href).toBe("/posts/20241217-hello-world");
  await page.goto(href ?? "/posts/20241217-hello-world");
  await expect(
    page.getByRole("heading", { name: "ハロー・ワールド - 読書メモ" })
  ).toBeVisible();
});
