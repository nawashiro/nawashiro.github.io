import { test, expect } from "@playwright/test";
import { renderMarkdownDocument } from "../lib/posts";
import { emojiParts } from "../lib/twemoji";

test("emoji parser preserves surrounding text and pins CDN assets", () => {
  expect(emojiParts("A 😂 B 😂 C")).toEqual([
    { text: "A " },
    { text: "😂", src: "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/1f602.png" },
    { text: " B " },
    { text: "😂", src: "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/1f602.png" },
    { text: " C" },
  ]);
});

test("Markdown converts prose, but not code or attributes", async () => {
  const { contentHtml } = await renderMarkdownDocument(
    'Hello 😂 and 🧑‍💻\n\n`😂`\n\n```text\n😂\n```\n\n<span title="😂">Text</span>',
  );
  expect(contentHtml).toContain('alt="😂"');
  expect(contentHtml).toContain('alt="🧑‍💻"');
  expect(contentHtml).toContain('<code>😂</code>');
  expect(contentHtml).toContain('title="😂"');
  expect(contentHtml).not.toContain('title="<img');
  expect(contentHtml).toMatch(/<pre[^>]*><code[^>]*>😂/);
});
