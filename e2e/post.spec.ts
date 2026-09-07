import { test, expect } from "@playwright/test";

test("post page renders content", async ({ page }) => {
  await page.goto("/posts/20241217-hello-world");

  await expect(
    page.getByRole("heading", { name: "ハロー・ワールド - 読書メモ" })
  ).toBeVisible();
  await expect(page.locator("article")).toBeVisible();
});

test("Webmentions are part of the static page and do not fetch the API", async ({
  page,
}) => {
  const webmentionApiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/mentions.jf2")) {
      webmentionApiRequests.push(request.url());
    }
  });

  await page.goto("/posts/20241217-hello-world");

  await expect(page.locator("#webmentions")).toHaveCount(1);
  expect(webmentionApiRequests).toEqual([]);
});

test("the Webmention section is available with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });

  try {
    const page = await context.newPage();
    await page.goto("/posts/20241217-hello-world");
    await expect(page.locator("#webmentions")).toHaveCount(1);
  } finally {
    await context.close();
  }
});
