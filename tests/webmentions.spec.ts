import { test, expect } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  readWebMentionArchive,
  writeWebMentionArchiveIfChanged,
} from "../lib/webmention-archive";
import {
  canonicalizeWebMentionTarget,
  filterWebMentionsForTargets,
  mergeWebMentionEntries,
  parseWebMentionArchive,
  serializeWebMentionArchive,
  type WebMentionEntry,
} from "../lib/webmentions";

const mention = (
  id: number,
  overrides: Partial<WebMentionEntry> = {},
): WebMentionEntry => ({
  "wm-id": id,
  "wm-property": "in-reply-to",
  "wm-target": "https://nawashiro.dev/posts/example",
  "wm-source": `https://source.example/${id}`,
  url: `https://source.example/${id}`,
  published: "2026-01-01T00:00:00Z",
  content: {
    text: `comment ${id}`,
    html: `<p>comment ${id}</p>`,
  },
  ...overrides,
});

test("Webmention archive round-trips complete entry fields", () => {
  const archive = {
    version: 1 as const,
    mentions: [mention(12, { "wm-private": false, custom: { value: true } })],
  };

  const parsed = parseWebMentionArchive(
    JSON.parse(serializeWebMentionArchive(archive)) as unknown,
  );

  expect(parsed).toEqual(archive);
});

test("target canonicalization accepts HTTPS, HTTP, and trailing slash variants", () => {
  const canonical = "https://nawashiro.dev/posts/example";

  expect(canonicalizeWebMentionTarget("http://nawashiro.dev/posts/example/")).toBe(
    canonical,
  );
  expect(canonicalizeWebMentionTarget(canonical)).toBe(canonical);
  expect(
    canonicalizeWebMentionTarget("https://nawashiro.dev/posts/other"),
  ).not.toBe(canonical);
});

test("merge adds and updates entries without deleting remote omissions", () => {
  const existing = [mention(1), mention(2)];
  const incoming = [mention(2, { content: { text: "updated" } }), mention(3)];

  expect(mergeWebMentionEntries(existing, incoming)).toEqual([
    mention(1),
    mention(2, { content: { text: "updated" } }),
    mention(3),
  ]);
});

test("merge deduplicates duplicate identifiers and rejects invalid entries", () => {
  expect(mergeWebMentionEntries([], [mention(1), mention(1, { url: "https://new.example/1" })])).toEqual([
    mention(1, { url: "https://new.example/1" }),
  ]);

  expect(() =>
    mergeWebMentionEntries([], [{ "wm-id": "" } as WebMentionEntry]),
  ).toThrow("Invalid Webmention entry");
});

test("filtering matches canonical target variants and preserves all matching entries", () => {
  const entries = [
    mention(1, { "wm-target": "http://nawashiro.dev/posts/example/" }),
    mention(2, { "wm-target": "https://nawashiro.dev/posts/example" }),
    mention(3, { "wm-target": "https://nawashiro.dev/posts/other" }),
  ];

  expect(
    filterWebMentionsForTargets(entries, [
      "https://nawashiro.dev/posts/example/",
    ]).map((entry) => entry["wm-id"]),
  ).toEqual([1, 2]);
});

test("archive writer reports no change for identical canonical data", () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "webmention-archive-test-"),
  );
  const archivePath = path.join(temporaryDirectory, "webmentions.json");
  const archive = {
    version: 1 as const,
    mentions: [mention(1)],
  };

  try {
    expect(writeWebMentionArchiveIfChanged(archive, archivePath)).toBe(true);
    expect(writeWebMentionArchiveIfChanged(archive, archivePath)).toBe(false);
    expect(readWebMentionArchive(archivePath)).toEqual(archive);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("an intentional local deletion is not restored by a remote omission", () => {
  const existing = [mention(1), mention(2)];
  const locallyDeleted = existing.filter((entry) => entry["wm-id"] !== 2);

  expect(mergeWebMentionEntries(locallyDeleted, [])).toEqual([mention(1)]);
});
