import { test, expect } from "@playwright/test";
import { resolveOgImageUrl, runServerBuildTasks } from "../lib/posts";
import { safeWebmentionUrl } from "../components/WebMention";

test("resolveOgImageUrl normalizes relative paths", () => {
  expect(resolveOgImageUrl("images/og.png", "https://example.com")).toBe(
    "https://example.com/images/og.png",
  );
  expect(resolveOgImageUrl("https://cdn.example.com/og.png", "https://x")).toBe(
    "https://cdn.example.com/og.png",
  );
});

test("safeWebmentionUrl rejects unsafe schemes", () => {
  expect(safeWebmentionUrl("javascript:alert(1)")).toBeNull();
  expect(safeWebmentionUrl("https://example.com")).toBe("https://example.com");
});

test("runServerBuildTasks surfaces rss failures", async () => {
  await expect(
    runServerBuildTasks(async () => {
      throw new Error("rss failed");
    }),
  ).rejects.toThrow("rss failed");
});
