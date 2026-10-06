import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { xml2js } from "xml-js";
import { renderMarkdownDocument } from "../lib/posts";

const siteUrl = "https://feed-fixture.example";
const fixtures = [
  {
    id: "emoji-summary",
    markdown: '<p class="p-summary">概要 😂 🧑‍💻</p><p>本文 😂</p>',
    summary: "概要 😂 🧑‍💻",
  },
  {
    id: "emoji-excerpt",
    markdown: '<p>本文 😂 🧑‍💻 <img src="https://example.test/authored.png" alt="著者画像"></p><p><code>😂</code></p>',
    summary: "本文 😂 🧑‍💻 😂",
  },
  {
    id: "decorated-summary",
    markdown: '<p>本文の先頭。</p>\n<p class="extra p-summary">明示 <strong>概要</strong>\n<br>と <a href="https://example.com">リンク</a> &amp; 記号。</p>',
    summary: "明示 概要 と リンク & 記号。",
  },
  {
    id: "first-non-empty-summary",
    markdown: '<p>本文の先頭。</p>\n<p class="p-summary"> \n </p>\n<p class="p-summary">最初の概要</p>\n<p class="p-summary">後続の概要</p>',
    summary: "最初の概要",
  },
  {
    id: "long-summary",
    markdown: `<p>本文の先頭。</p>\n<p class="p-summary">${"概要".repeat(110)}</p>`,
    summary: "概要".repeat(110),
  },
  {
    id: "missing-summary",
    markdown: "<p>短い <strong>本文</strong>。</p>",
    summary: "短い 本文。",
  },
  {
    id: "empty-summary",
    markdown: '<p class="p-summary">   </p>\n<p>通常の本文。</p>',
    summary: "通常の本文。",
  },
  {
    id: "boundary-excerpt",
    markdown: `<p>${"あ".repeat(200)}</p>`,
    summary: "あ".repeat(200),
  },
  {
    id: "long-excerpt",
    markdown: `<p>${"あ".repeat(201)}</p>`,
    summary: "あ".repeat(200) + "...",
  },
];

type XmlEntry = Record<string, { _text?: string; _cdata?: string }>;
type JsonEntry = { id: string; title: string; url: string; summary: string; content_html: string; date_published: string; date_modified: string };
const xmlText = (value: { _text?: string; _cdata?: string }) => value._cdata ?? value._text;
const formats = ["rss", "atom", "json"] as const;
let directory: string;
let rss: XmlEntry[];
let atom: XmlEntry[];
let json: JsonEntry[];
const expectedHtml = new Map<string, string>();

test.beforeAll(async () => {
  test.setTimeout(60_000);
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "feed-summary-"));
  fs.mkdirSync(path.join(directory, "posts"));
  fs.mkdirSync(path.join(directory, "pages"));
  // Markdown initialization reads the site's font declaration even without diagrams.
  fs.copyFileSync("pages/_document.tsx", path.join(directory, "pages/_document.tsx"));
  for (const fixture of fixtures) {
    fs.writeFileSync(
      path.join(directory, "posts", `${fixture.id}.md`),
      `---\ntitle: ${fixture.id}\npublished: '2026-01-01'\nupdated: '2026-01-03T09:00:00+09:00'\ndescription: 旧frontmatter概要\n---\n${fixture.markdown}\n`,
    );
    const rendered = await renderMarkdownDocument(fixture.markdown, fixture.id, "feed");
    expectedHtml.set(fixture.id, rendered.contentHtml);
  }
  // A separate process isolates the module-level posts directory and output.
  // --no-install reuses the existing build tool without fetching dependencies.
  execFileSync("npx", ["--no-install", "tsx", "-e", `
    process.chdir(${JSON.stringify(directory)});
    const { generateRssFeed } = require(${JSON.stringify(path.resolve("lib/posts.ts"))});
    generateRssFeed().catch(error => { console.error(error); process.exit(1); });
  `], {
    cwd: process.cwd(),
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: siteUrl },
    timeout: 45_000,
    stdio: "pipe",
  });
  const read = (name: string) => fs.readFileSync(path.join(directory, "public/rss", name), "utf8");
  const rssDocument = xml2js(read("feed.xml"), { compact: true }) as {
    rss: { channel: { item: XmlEntry[] } };
  };
  const atomDocument = xml2js(read("atom.xml"), { compact: true }) as {
    feed: { entry: XmlEntry[] };
  };
  rss = rssDocument.rss.channel.item;
  atom = atomDocument.feed.entry;
  json = JSON.parse(read("feed.json")).items;
});

test.afterAll(() => {
  if (directory) fs.rmSync(directory, { recursive: true, force: true });
});

for (const format of formats) {
  for (const fixture of fixtures) {
    test(`${format}: ${fixture.id} uses the expected summary and preserves content`, () => {
      const url = `${siteUrl}/posts/${fixture.id}`;
      let summary: string | undefined;
      let content: string | undefined;
      if (format === "json") {
        const item = json.find(item => item.id === url)!;
        expect(item).toBeDefined();
        expect(item.url).toBe(url);
        expect(item.title).toBe(fixture.id);
        summary = item.summary;
        content = item.content_html;
        expect(item.date_published).toBe("2026-01-01T00:00:00.000Z");
        expect(item.date_modified).toBe("2026-01-03T00:00:00.000Z");
      } else {
        const entries = format === "rss" ? rss : atom;
        const idKey = format === "rss" ? "guid" : "id";
        const item = entries.find(item => xmlText(item[idKey]) === url)!;
        expect(item).toBeDefined();
        expect(xmlText(item.title)).toBe(fixture.id);
        summary = xmlText(item[format === "rss" ? "description" : "summary"]);
        content = xmlText(item[format === "rss" ? "content:encoded" : "content"]);
        if (format === "rss") {
          expect(xmlText(item.pubDate)).toBe("Thu, 01 Jan 2026 00:00:00 GMT");
        } else {
          expect(xmlText(item.published)).toBe("2026-01-01T00:00:00.000Z");
          expect(xmlText(item.updated)).toBe("2026-01-03T00:00:00.000Z");
        }
      }
      expect(summary).toBe(fixture.summary);
      expect(content).toBe(expectedHtml.get(fixture.id));
      expect(content).not.toContain("cdn.jsdelivr.net/gh/jdecked/twemoji");
      if (fixture.id.startsWith("emoji-")) expect(content).toContain("😂");
      if (fixture.id === "emoji-excerpt") {
        expect(content).toContain('src="https://example.test/authored.png"');
        expect(content).toContain("<code>😂</code>");
      }
    });
  }
  test(`${format}: keeps the fixture entry count`, () => {
    expect((format === "rss" ? rss : format === "atom" ? atom : json).length).toBe(fixtures.length);
  });
}
