import { test, expect } from "@playwright/test";

test("header exposes primary navigation links", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "NAWASHIRO", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Links" })).toBeVisible();
});

test("header scrolls away with the page", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(async () => header.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThan(0);
});
