import { test, expect } from "@playwright/test";

test("Twemoji is in initial HTML without client JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("main img.twemoji[alt='👀']")).toHaveCount(1);
  await expect(page.locator("main img.twemoji[alt='🎞️']").first()).toBeVisible();
  await page.goto("/posts/categories-photo-blogs");
  await expect(page.locator("article h1 img.twemoji[alt='🎞️']")).toHaveCount(1);
  await context.close();
});

test("hydration retains Twemoji without mismatches", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|did not match/i.test(message.text())) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("main img.twemoji[alt='👀']")).toHaveCount(1);
  await page.goto("/posts/categories-photo-blogs");
  await expect(page.locator("article h1 img.twemoji[alt='🎞️']")).toHaveCount(1);
  expect(errors).toEqual([]);
});
