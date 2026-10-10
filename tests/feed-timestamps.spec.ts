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
          if (now.startsWith('2031')) {
            for (const file of fs.readdirSync('posts')) fs.appendFileSync('posts/' + file, '\\nBody-only edit\\n');
          }
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

function feedItems(run: Record<string, string>) {
  const rss = xml2js(run["feed.xml"], { compact: true }) as any;
  const atom = xml2js(run["atom.xml"], { compact: true }) as any;
  const json = JSON.parse(run["feed.json"]);
  const array = (value: any): any[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
  return { rss, atom, rssItems: array(rss.rss.channel.item), atomItems: array(atom.feed.entry), jsonItems: json.items as any[] };
}

function expectFeedOrder(run: Record<string, string>, ids: string[]) {
  const { rssItems, atomItems, jsonItems } = feedItems(run);
  const urls = ids.map(id => `https://timestamps.example/posts/${id}`);
  expect(rssItems.map(item => item.guid._text)).toEqual(urls);
  expect(rssItems.map(item => item.link._text)).toEqual(urls);
  expect(atomItems.map(item => item.id._text)).toEqual(urls);
  expect(atomItems.map(item => item.link._attributes.href)).toEqual(urls);
  expect(jsonItems.map(item => item.id)).toEqual(urls);
  expect(jsonItems.map(item => item.url)).toEqual(urls);
}

for (const empty of [false, true]) {
  test(`Feed whole-update timestamps are source-derived and stable; empty=${empty}`, () => {
    test.setTimeout(60_000);
    const sources = empty ? [] : [
      { id: "older", published: "2026-01-02T00:00:00+09:00", updated: "2026-03-01" },
      { id: "newer", published: "2026-01-01T20:00:00Z", updated: "2026-01-02" },
    ];
    const result = checkFeeds(sources);
    const expectedOrder = empty ? [] : ["older", "newer"];
    expect(result.order).toEqual(expectedOrder);
    const iso = empty ? "1970-01-01T00:00:00.000Z" : "2026-03-01T00:00:00.000Z";
    for (const run of result.runs) {
      const { rss, atom, rssItems, atomItems, jsonItems } = feedItems(run);
      expectFeedOrder(run, expectedOrder);
      expect(rss.rss.channel.lastBuildDate._text).toBe(new Date(iso).toUTCString());
      expect(atom.feed.updated._text).toBe(iso);
      for (const source of sources) {
        const url = `https://timestamps.example/posts/${source.id}`;
        const rssItem = rssItems.find(item => item.guid._text === url);
        const atomItem = atomItems.find(item => item.id._text === url);
        const jsonItem = jsonItems.find(item => item.id === url);
        expect(rssItem.pubDate._text).toBe(new Date(source.published).toUTCString());
        expect(atomItem.published._text).toBe(new Date(source.published).toISOString());
        expect(atomItem.updated._text).toBe(new Date(source.updated).toISOString());
        expect(jsonItem.date_published).toBe(new Date(source.published).toISOString());
        expect(jsonItem.date_modified).toBe(new Date(source.updated).toISOString());
      }
    }
  });
}

test("all Feed formats select the same newest 50 updates before truncating", () => {
  test.setTimeout(60_000);
  const sources: Source[] = Array.from({ length: 51 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 0, index + 1)).toISOString();
    return { id: `post-${String(index).padStart(2, "0")}`, published: date, updated: date };
  });
  // The oldest publication was outside the published-order top 50.
  sources[0].updated = "2026-10-01";
  const publishedOrder = [...sources].sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  expect(publishedOrder.slice(0, 50).map(source => source.id)).not.toContain("post-00");
  const expectedOrder = ["post-00", ...sources.slice(1).reverse().map(source => source.id)];
  const selected = expectedOrder.slice(0, 50);
  expect(selected).not.toContain("post-01");
  const result = checkFeeds(sources);
  expect(result.order).toEqual(expectedOrder);
  for (const run of result.runs) {
    expectFeedOrder(run, selected);
    const { rss, atom, jsonItems } = feedItems(run);
    expect(rss.rss.channel.lastBuildDate._text).toBe(new Date(sources[0].updated).toUTCString());
    expect(atom.feed.updated._text).toBe(new Date(sources[0].updated).toISOString());
    const revived = jsonItems.find(item => item.id === "https://timestamps.example/posts/post-00");
    expect(revived.date_published).toBe(sources[0].published);
    expect(revived.date_modified).toBe(new Date(sources[0].updated).toISOString());
  }
});
