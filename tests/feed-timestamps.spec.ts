import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { xml2js } from "xml-js";

type Source = { id: string; published: string; updated: string };
function checkFeeds(sources: Source[]) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "feed-timestamps-"));
  try {
    fs.mkdirSync(path.join(directory, "posts"));
    fs.mkdirSync(path.join(directory, "pages"));
    fs.copyFileSync("pages/_document.tsx", path.join(directory, "pages/_document.tsx"));
    for (const source of sources) fs.writeFileSync(path.join(directory, "posts", `${source.id}.md`),
      `---\ntitle: ${source.id}\npublished: '${source.published}'\nupdated: '${source.updated}'\n---\nFixed body 😂\n`);
    return JSON.parse(execFileSync("npx", ["--no-install", "tsx", "-e", `
      process.chdir(${JSON.stringify(directory)});
      const { generateRssFeed, getSortedPostsData } = require(${JSON.stringify(path.resolve("lib/posts.ts"))});
      const fs = require('fs');
      const OriginalDate = Date;
      (async () => {
        const runs = [];
        for (const now of ['2030-01-01T00:00:00Z', '2031-01-01T00:00:00Z']) {
          global.Date = class extends OriginalDate {
            constructor(value) { super(arguments.length ? value : now); }
          };
          await generateRssFeed();
          runs.push(Object.fromEntries(['feed.xml', 'atom.xml', 'feed.json'].map(name => [name, fs.readFileSync('public/rss/' + name, 'utf8')])));
        }
        console.log(JSON.stringify({ runs, order: getSortedPostsData().map(post => post.id) }));
      })().catch(error => { console.error(error); process.exit(1); });
    `], { env: { ...process.env, NEXT_PUBLIC_SITE_URL: "https://timestamps.example" }, encoding: "utf8", timeout: 45_000 })) as {
      runs: Record<string, string>[]; order: string[];
    };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

for (const empty of [false, true]) {
  test(`Feed whole-update timestamps are source-derived and stable; empty=${empty}`, () => {
    test.setTimeout(60_000);
    const sources = empty ? [] : [
      { id: "older", published: "2026-01-02T00:00:00+09:00", updated: "2026-03-01" },
      { id: "newer", published: "2026-01-01T20:00:00Z", updated: "2026-01-02" },
    ];
    const result = checkFeeds(sources);
    expect(result.order).toEqual(empty ? [] : ["newer", "older"]);
    const iso = empty ? "1970-01-01T00:00:00.000Z" : "2026-03-01T00:00:00.000Z";
    for (const run of result.runs) {
      const rss = xml2js(run["feed.xml"], { compact: true }) as any;
      const atom = xml2js(run["atom.xml"], { compact: true }) as any;
      expect(rss.rss.channel.lastBuildDate._text).toBe(new Date(iso).toUTCString());
      expect(atom.feed.updated._text).toBe(iso);
      const json = JSON.parse(run["feed.json"]);
      expect(json.items).toHaveLength(sources.length);
      if (!empty) {
        expect(json.items.map((item: { title: string }) => item.title)).toEqual(["newer", "older"]);
        expect(json.items[0].date_published).toBe("2026-01-01T20:00:00.000Z");
        expect(json.items[0].date_modified).toBe("2026-01-02T00:00:00.000Z");
      }
    }
  });
}
