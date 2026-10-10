import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("post and category retrieval use update order and ignore body-only changes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "post-order-"));
  const sources = [
    { id: "older", published: "2025-01-01", updated: "2026-03-01" },
    { id: "newer", published: "2026-01-01", updated: "2026-02-01" },
    { id: "categories-older", published: "2025-01-01", updated: "2026-04-01T09:00:00+09:00" },
    { id: "categories-newer", published: "2026-01-01", updated: "2026-04-01T00:00:00Z" },
    { id: "categories-earlier", published: "2026-01-02", updated: "2026-04-01T00:00:00+09:00" },
  ];
  try {
    fs.mkdirSync(path.join(directory, "posts"));
    fs.mkdirSync(path.join(directory, "pages"));
    fs.copyFileSync("pages/_document.tsx", path.join(directory, "pages/_document.tsx"));
    for (const source of sources) {
      fs.writeFileSync(path.join(directory, "posts", `${source.id}.md`),
        `---\ntitle: ${source.id}\npublished: '${source.published}'\nupdated: '${source.updated}'\n---\nOriginal body\n`);
    }
    const result = JSON.parse(execFileSync("npx", ["--no-install", "tsx", "-e", `
      process.chdir(${JSON.stringify(directory)});
      const { getSortedPostsData, getIndexPagesData } = require(${JSON.stringify(path.resolve("lib/posts.ts"))});
      const fs = require('fs');
      const read = () => ({ posts: getSortedPostsData(), categories: getIndexPagesData() });
      const before = read();
      for (const file of fs.readdirSync('posts')) {
        fs.appendFileSync('posts/' + file, '\\nBody-only edit\\n');
      }
      console.log(JSON.stringify({ before, after: read() }));
    `], { encoding: "utf8", timeout: 45_000 }));
    expect(result.before.posts.map((post: { id: string }) => post.id)).toEqual([
      "categories-newer", "categories-older", "categories-earlier", "older", "newer",
    ]);
    expect(result.before.categories.map((post: { id: string }) => post.id)).toEqual([
      "categories-newer", "categories-older", "categories-earlier",
    ]);
    expect(result.after).toEqual(result.before);
    for (const source of sources) {
      expect(result.before.posts.find((post: { id: string }) => post.id === source.id)).toMatchObject(source);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
