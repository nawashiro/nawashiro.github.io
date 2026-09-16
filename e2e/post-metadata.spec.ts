import { test, expect } from "@playwright/test";

const postId = "20260916-result-iced-brewed-coffee";
const expectedDescription =
  "昨日淹れた氷出しコーヒーを飲んだ。うまいうまい。濃厚！あとなんかトロみがついている。これはどういう理屈！？";

test("post metadata uses the same p-summary description", async ({ page }) => {
  await page.goto(`/posts/${postId}`);

  const description = page.locator('meta[name="description"]');
  const ogDescription = page.locator('meta[property="og:description"]');
  const twitterDescription = page.locator('meta[name="twitter:description"]');
  const jsonLd = page.locator('script[type="application/ld+json"]');

  await expect(description).toHaveCount(1);
  await expect(ogDescription).toHaveCount(1);
  await expect(twitterDescription).toHaveCount(1);
  await expect(jsonLd).toHaveCount(1);

  const values = await Promise.all([
    description.getAttribute("content"),
    ogDescription.getAttribute("content"),
    twitterDescription.getAttribute("content"),
    jsonLd.evaluate((element) => {
      const data = JSON.parse(element.textContent ?? "{}");
      return data.description;
    }),
  ]);

  expect(values).toEqual([
    expectedDescription,
    expectedDescription,
    expectedDescription,
    expectedDescription,
  ]);
});
