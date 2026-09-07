import { test, expect } from "@playwright/test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WebMention from "../components/WebMention";
import type { WebMentionEntry } from "../lib/webmentions";

const target = "https://nawashiro.dev/posts/example";

const mention = (id: number, overrides: Partial<WebMentionEntry> = {}) =>
  ({
    "wm-id": id,
    "wm-property": "in-reply-to",
    "wm-target": target,
    "wm-source": `https://source.example/${id}`,
    url: `https://source.example/${id}`,
    author: { name: `Author ${id}` },
    content: { text: `comment ${id}` },
    ...overrides,
  }) satisfies WebMentionEntry;

test("static Webmention rendering includes every matching entry", () => {
  const mentions = Array.from({ length: 31 }, (_, index) => mention(index + 1));
  const markup = renderToStaticMarkup(
    React.createElement(WebMention, { mentions, pageUrl: `${target}/` }),
  );

  expect(markup).toContain("comment 31");
  expect(markup).toContain("comment 1");
  expect(markup.match(/source\.example/g)).toHaveLength(31);
});

test("static Webmention rendering never requests the remote API", () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("Webmention rendering must not fetch remotely");
  }) as typeof fetch;

  try {
    renderToStaticMarkup(
      React.createElement(WebMention, {
        mentions: [mention(1)],
        pageUrl: target,
      }),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  expect(fetchCalls).toBe(0);
});

test("archived HTML and unsafe image URLs are not rendered as executable markup", () => {
  const markup = renderToStaticMarkup(
    React.createElement(WebMention, {
      mentions: [
        mention(1, {
          author: { name: "Unsafe", photo: "javascript:alert(1)" },
          content: { text: "<script>alert(1)</script>" },
        }),
      ],
      pageUrl: target,
    }),
  );

  expect(markup).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(markup).not.toContain("javascript:alert");
  expect(markup).not.toContain("<script>alert(1)</script>");
});
