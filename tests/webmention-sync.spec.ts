import { test, expect } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  fetchAllWebMentions,
  synchronizeWebMentionArchive,
} from "../lib/webmention-sync";
import {
  readWebMentionArchive,
  writeWebMentionArchiveIfChanged,
} from "../lib/webmention-archive";

const response = (children: unknown[], ok = true, status = 200) =>
  new Response(JSON.stringify({ children }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const entry = (id: number) => ({
  "wm-id": id,
  "wm-target": "https://nawashiro.dev/posts/example",
  "wm-property": "like-of",
  url: `https://source.example/${id}`,
});

test("fetchAllWebMentions follows paginated domain responses", async () => {
  const requests: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    const requestUrl = String(input);
    requests.push(requestUrl);
    const page = Number(new URL(requestUrl).searchParams.get("page"));
    return page === 0
      ? response([entry(1), entry(2)])
      : response([entry(3)]);
  };

  const result = await fetchAllWebMentions({
    domain: "nawashiro.dev",
    token: "test-token",
    perPage: 2,
    endpoint: "https://api.example.test/mentions.jf2",
    fetchImpl,
  });

  expect(result.map((item) => item["wm-id"])).toEqual([1, 2, 3]);
  expect(requests).toHaveLength(2);
  expect(new URL(requests[0]).searchParams.get("domain")).toBe("nawashiro.dev");
  expect(new URL(requests[0]).searchParams.get("token")).toBe("test-token");
});

test("fetchAllWebMentions fails on API errors and malformed entries", async () => {
  await expect(
    fetchAllWebMentions({
      domain: "nawashiro.dev",
      token: "test-token",
      fetchImpl: async () => response([], false, 503),
    }),
  ).rejects.toThrow("503");

  await expect(
    fetchAllWebMentions({
      domain: "nawashiro.dev",
      token: "test-token",
      fetchImpl: async () => response([{ "wm-id": "" }]),
    }),
  ).rejects.toThrow("Invalid Webmention entry");
});

test("synchronization does not rewrite an unchanged archive", async () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "webmention-sync-test-"),
  );
  const archivePath = path.join(temporaryDirectory, "webmentions.json");

  try {
    const current = { version: 1 as const, mentions: [entry(1)] };
    writeWebMentionArchiveIfChanged(current, archivePath);

    const result = await synchronizeWebMentionArchive({
      domain: "nawashiro.dev",
      token: "test-token",
      archivePath,
      fetchImpl: async () => response([entry(1)]),
    });

    expect(result.changed).toBe(false);
    expect(readWebMentionArchive(archivePath)).toEqual(current);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});
