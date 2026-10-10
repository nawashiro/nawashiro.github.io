import { test, expect } from "@playwright/test";
import { compareUpdatedDescending, parsePostTimestamp, readPostTimestamps } from "../lib/post-timestamps";
import { buildStandardDocumentRecord } from "../lib/sync-standard-site";

const location = "fixture-post.md";

test("date-only and explicit-offset timestamps describe stable instants", () => {
  expect(parsePostTimestamp("2026-09-16", location, "published").toISOString()).toBe("2026-09-16T00:00:00.000Z");
  expect(parsePostTimestamp("2026-09-16T09:00:00+09:00", location, "updated").toISOString()).toBe("2026-09-16T00:00:00.000Z");
  expect(parsePostTimestamp("2024-02-29", location, "published").toISOString()).toBe("2024-02-29T00:00:00.000Z");
});

for (const value of [undefined, null, "", "bad", "2026-02-29", "2026-04-31", "2026-13-01", "2026-01-01T24:00:00Z", "2026-01-01T00:00:00", "2026-01-01 00:00", new Date("2026-01-01T00:00:00Z")]) {
  test(`rejects missing, impossible, or timezone-less timestamp: ${String(value)}`, () => {
    expect(() => parsePostTimestamp(value, location, "updated")).toThrow(/fixture-post\.md: invalid or missing updated/);
  });
}

test("both fields are mandatory with no legacy fallback", () => {
  expect(() => readPostTimestamps({ date: "2026-01-01", updated: "2026-01-02" }, location)).toThrow(/published/);
  expect(() => readPostTimestamps({ published: "2026-01-01", date: "2026-01-02" }, location)).toThrow(/updated/);
  expect(readPostTimestamps({ published: "2026-01-01", updated: "2026-01-02" }, location)).toEqual({ published: "2026-01-01", updated: "2026-01-02" });
});

test("updating an old post moves it ahead without changing its publication date", () => {
  const posts = [
    { id: "older", published: "2025-01-01", updated: "2025-01-01" },
    { id: "newer", published: "2026-01-01", updated: "2026-01-01" },
  ];
  expect([...posts].sort(compareUpdatedDescending).map(p => p.id)).toEqual(["newer", "older"]);
  posts[0].updated = "2026-10-01";
  expect([...posts].sort(compareUpdatedDescending).map(p => p.id)).toEqual(["older", "newer"]);
  expect(posts[0].published).toBe("2025-01-01");
});

test("update order compares instants across timezones, not strings", () => {
  const posts = [
    { id: "earlier", published: "2025-01-01", updated: "2026-01-02T00:00:00+09:00" },
    { id: "later", published: "2025-01-01", updated: "2026-01-01T20:00:00Z" },
  ];
  expect(posts.sort(compareUpdatedDescending).map(p => p.id)).toEqual(["later", "earlier"]);
});

test("equal update instants use publication instants as the tiebreaker", () => {
  const posts = [
    { id: "older", published: "2026-01-02T00:00:00+09:00", updated: "2026-03-01T09:00:00+09:00" },
    { id: "newer", published: "2026-01-01T20:00:00Z", updated: "2026-03-01T00:00:00Z" },
  ];
  expect(posts.sort(compareUpdatedDescending).map(p => p.id)).toEqual(["newer", "older"]);
});

test("equal update and publication instants preserve input order", () => {
  const posts = [
    { id: "z-first", published: "2026-01-01T09:00:00+09:00", updated: "2026-03-01" },
    { id: "a-second", published: "2026-01-01T00:00:00Z", updated: "2026-03-01T09:00:00+09:00" },
  ];
  expect(compareUpdatedDescending(posts[0], posts[1])).toBe(0);
  expect(posts.sort(compareUpdatedDescending).map(p => p.id)).toEqual(["z-first", "a-second"]);
});

test("standard.site rejects invalid source timestamps before record creation", () => {
  expect(() => buildStandardDocumentRecord("site.standard.document", "https://example.test", "fixture-slug", {
    title: "Fixture", published: "2026-01-01", updated: "invalid",
  })).toThrow(/fixture-slug: invalid or missing updated/);
});
