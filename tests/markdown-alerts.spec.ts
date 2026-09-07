import { test, expect } from "@playwright/test";
import { getPostData, renderMarkdown } from "../lib/posts";

test("renders all standard GitHub Alerts with titles and soft colors", async () => {
  const html = await renderMarkdown(`
> [!NOTE]
> Note body.

> [!TIP]
> Tip body.

> [!IMPORTANT]
> Important body.

> [!WARNING]
> Warning body.

> [!CAUTION]
> Caution body.
`);

  const alerts = [
    ["NOTE", "Note", "info", "Note body."],
    ["TIP", "Tip", "success", "Tip body."],
    ["IMPORTANT", "Important", "info", "Important body."],
    ["WARNING", "Warning", "warning", "Warning body."],
    ["CAUTION", "Caution", "error", "Caution body."],
  ] as const;

  for (const [marker, title, color, body] of alerts) {
    expect(html).toContain(
      `<div class="alert alert-${color} alert-soft">`,
    );
    expect(html).toContain(`<p class="alert-title">${title}</p>`);
    expect(html).toContain(`<p>${body}</p>`);
    expect(html).not.toContain(`[!${marker}]`);
  }

  expect(html).not.toContain('role="alert"');
});

test("preserves formatted content and renders an empty alert title", async () => {
  const html = await renderMarkdown(`
> [!NOTE]
>
> **Important** text with a [link](#details).
>
> A second paragraph.
`);
  const emptyHtml = await renderMarkdown(`
> [!WARNING]
>
`);

  expect(html).toContain("<strong>Important</strong>");
  expect(html).toContain('<a href="#details">link</a>');
  expect(html).toContain("<p>A second paragraph.</p>");
  expect(html).not.toContain("[!NOTE]");
  expect(emptyHtml).toContain('<p class="alert-title">Warning</p>');
  expect(emptyHtml).not.toContain("[!WARNING]");
});

test("keeps ordinary quotes and unknown alert markers unchanged", async () => {
  const html = await renderMarkdown(`
> An ordinary quote.

> [!DANGER]
> An unknown marker.
`);

  expect(html).toContain("<blockquote>");
  expect(html).toContain("<p>An ordinary quote.</p>");
  expect(html).toContain("[!DANGER]");
  expect(html).not.toContain('class="alert ');
});

test("keeps alert-looking text inside a code fence", async () => {
  const source = ["```text", "[!NOTE]", "```"].join("\n");
  const html = await renderMarkdown(source);

  expect(html).toContain("[!NOTE]");
  expect(html).not.toContain('class="alert ');
});

test("preserves code titles and Prism highlighting inside an alert", async () => {
  const html = await renderMarkdown(`
> [!NOTE]
>
> \`\`\`ts:example.ts
> const answer = 42;
> \`\`\`
`);

  expect(html).toContain('<div class="remark-code-container">');
  expect(html).toContain('<div class="remark-code-title">example.ts</div>');
  expect(html).toContain('<span class="token keyword">const</span>');
});

test("renders an alert already used by an existing post", async () => {
  const post = await getPostData("20250413-ecdsa-sign-learn-in-tsunndere");

  expect(post.contentHtml).toContain(
    '<div class="alert alert-warning alert-soft">',
  );
  expect(post.contentHtml).toContain('<p class="alert-title">Warning</p>');
  expect(post.contentHtml).not.toContain("[!WARNING]");
});
