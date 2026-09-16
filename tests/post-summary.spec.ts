import { test, expect } from "@playwright/test";
import {
  getPostData,
  renderMarkdownDocument,
} from "../lib/posts";
import { resolvePostDescription } from "../lib/post-description";
import { extractPostSummary } from "../lib/post-summary";
import { buildStandardDocumentRecord } from "../lib/sync-standard-site";

test("keeps external Markdown links as ordinary links", async () => {
  const result = await renderMarkdownDocument(
    "[external](https://example.com/)",
  );

  expect(result.contentHtml).toContain(
    '<a href="https://example.com/">external</a>',
  );
  expect(result.contentHtml).not.toContain("remark-link-card");
});

test("extracts the first non-empty p-summary from the HAST", async () => {
  const result = await renderMarkdownDocument(`
<p class="p-summary">   </p>
<div class="p-summary extra-class">A <strong>short</strong>\nsummary<br>with a <a href="/post">link</a>.</div>
<p class="p-summary">This one is ignored.</p>
`);

  expect(result.pSummary).toBe("A short summary with a link.");
  expect(result.contentHtml).toContain('class="p-summary extra-class"');
});

test("extracts p-summary from an existing post", async () => {
  const post = await getPostData("20260916-result-iced-brewed-coffee");

  expect(post.pSummary).toBe(
    "昨日淹れた氷出しコーヒーを飲んだ。うまいうまい。濃厚！あとなんかトロみがついている。これはどういう理屈！？",
  );
});

test("extracts p-summary without rendering Mermaid", async () => {
  const summary = await extractPostSummary(`
<div class="p-summary">軽量 <strong>概要</strong></div>

\`\`\`mermaid
graph TD;
  A[概要] --> B[本文]
\`\`\`
`);

  expect(summary).toBe("軽量 概要");
});

test("prefers p-summary and preserves the existing page fallback", () => {
  expect(
    resolvePostDescription({
      title: "タイトル",
      pSummary: "明示した概要",
      contentHtml: "本文の自動概要",
    }),
  ).toBe("明示した概要");

  expect(
    resolvePostDescription({
      title: "タイトル",
      contentHtml: "本文の自動概要",
    }),
  ).toBe("本文の自動概要...");

  expect(
    resolvePostDescription({
      title: "タイトル",
      contentHtml: "",
    }),
  ).toBe("タイトル - Nawashiroのブログ記事");
});

test("uses p-summary for ATProto descriptions and omits absent summaries", () => {
  const withSummary = buildStandardDocumentRecord(
    "site.standard.document",
    "at://did:plc:example/site.standard.publication/pub",
    "example-post",
    { title: "記事", date: "2026-09-16", tags: ["coffee"] },
    "共有用の概要",
  );
  const withoutSummary = buildStandardDocumentRecord(
    "site.standard.document",
    "at://did:plc:example/site.standard.publication/pub",
    "example-post",
    {
      title: "記事",
      date: "2026-09-16",
      tags: ["coffee"],
      description: "旧frontmatter概要",
    } as { title: string; date: string; tags?: string[] },
  );

  expect(withSummary.description).toBe("共有用の概要");
  expect(withoutSummary).not.toHaveProperty("description");
  expect(withoutSummary.tags).toEqual(["coffee"]);
});
