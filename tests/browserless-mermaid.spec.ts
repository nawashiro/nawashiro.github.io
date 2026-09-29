import { test, expect } from "@playwright/test";
import fs from "fs";
import { isCompleteMermaidSvg, renderMermaidDiagram } from "../lib/mermaid";
import { getPostData, renderMarkdownDocument } from "../lib/posts";

const postId = "20251212-i-want-to-turn-thino-into-an-indie-web-microblog";
const source = fs.readFileSync(`posts/${postId}.md`, "utf8").split("```mermaid")[1].split("```")[0].trim();

test("renders the existing Mermaid source as styled inline SVG", async () => {
  const { contentHtml } = await getPostData(postId);
  expect(contentHtml).toContain('<svg class="mermaid-diagram"');
  expect(contentHtml).toContain("永久鍵ペア作成");
  expect(contentHtml).toContain("obsidian");
  expect(contentHtml.match(/marker-end=/g)).toHaveLength(10);
  expect(contentHtml).toContain("#24292f");
  expect(contentHtml).toContain("#8495a4");
  expect(contentHtml).toContain("#0969da");
  expect(contentHtml).toContain("font-size: 13px");
  expect(contentHtml).toContain("font-weight: 700");
  expect(contentHtml).toContain("Noto Sans JP");
  expect(contentHtml).toContain("svg.mermaid-diagram");
  expect(contentHtml).not.toContain("fonts.googleapis.com");
  expect(contentHtml).not.toContain("@import");
  expect(contentHtml).not.toContain("mermaid-isomorphic");
});

test("rejects unverified syntax and identifies the post", async () => {
  for (const input of [
    "graph TD\nA-->B",
    "sequenceDiagram\nactor A\nactor B\nA->>B: hi\nNote over A: omitted",
    "sequenceDiagram\nactor A\nactor B\nA->B: wrong arrow",
    "sequenceDiagram\nactor A\nactor A\nA->>B: duplicate actor",
    "sequenceDiagram\nactor A\nactor B\nA->>B: <script>alert(1)</script>",
    "sequenceDiagram\nactor A\nactor B\nA->>B: javascript:alert(1)",
    "sequenceDiagram\nactor A\nactor B\nA->>B: &lt;script&gt;",
  ]) {
    await expect(renderMermaidDiagram(input, "post-example", 2)).rejects.toThrow(/Mermaid diagram 2 in post-example:/);
  }
});

test("Markdown pipeline fails rather than publishing an unsupported diagram", async () => {
  await expect(renderMarkdownDocument("```mermaid\nflowchart TD\nA-->B\n```", "broken-post"))
    .rejects.toThrow(/Mermaid diagram 1 in broken-post: unsupported diagram type/);
});

test("source post remains the only editable diagram artifact", async () => {
  expect(source).toContain("sequenceDiagram");
  expect(await renderMermaidDiagram(source)).toContain("<svg");
});

test("rejects incomplete renderer output", () => {
  const actors = new Set(["A", "B"]);
  expect(isCompleteMermaidSvg("<svg><text>A</text></svg>", actors, ["hello"], 1)).toBe(false);
  expect(isCompleteMermaidSvg('<svg marker-end="url(#arrow)">A B</svg>', actors, ["hello"], 1)).toBe(false);
});

test("untrusted label text cannot introduce SVG attributes or links", async () => {
  await expect(renderMermaidDiagram('sequenceDiagram\nactor A\nA->>A: hello " onload="alert(1)'))
    .rejects.toThrow(/unsafe message label/);
  await expect(renderMermaidDiagram("sequenceDiagram\nactor A\nA->>A: <a href='javascript:alert(1)'>link</a>"))
    .rejects.toThrow(/unsafe message label/);
});
