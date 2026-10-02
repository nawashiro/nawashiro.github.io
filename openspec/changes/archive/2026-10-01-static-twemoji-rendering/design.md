# Design

## Context

See proposal.md for motivation. Next.js exports static HTML. The shared layout wraps page children with `react-twemoji`, whose DOM conversion runs after mount. Article content is separately produced by a Unified Markdown-to-HTML pipeline and inserted as HTML in the post page. The current Twemoji image URLs point to an external CDN.

## Goals / Non-Goals

**Goals:** Emit Twemoji image elements in the initial HTML wherever the current content wrapper would display them, without relying on post-mount substitution. Keep server-rendered output and React hydration consistent.

**Non-Goals:** Self-host the image collection, download assets during builds, or remove unrelated client JavaScript.

## Decisions

1. Replace the client-side `react-twemoji` wrapper with render-time transformations. For Markdown, transform eligible text nodes in the HTML AST before serialization; do not run a string replacement over complete HTML. For emoji originating in React-rendered page content, use a server-compatible render-time representation shared by server and browser so hydration sees equivalent markup. Inventory actual call sites before selecting the smallest integration points. A post-export rewrite alone is rejected because it can disagree with React's hydration output.
2. Use Twemoji's parser/mapping to generate version-pinned external asset URLs and retain the existing `twemoji` CSS class and emoji `alt` text. Do not introduce a build-time image fetch. Prefer explicit pinning to the version actually tested so generated HTML does not silently drift when the upstream CDN changes.
3. Preserve intended boundaries: transform visible content text, not HTML attributes, script/style content, or literal examples in code/pre elements. Check the current behavior at representative pages and explicitly document any intentional difference.

## Risks / Trade-offs

- [Different rendering paths miss an emoji or render different markup] → Compare source-content cases and static exported HTML across article, index, and other pages; test hydration for mismatches.
- [External CDN unavailable] → Images may fail to load, as in the current design; keep emoji in `alt` text as fallback. This change does not claim offline completeness.
- [Twemoji recognizer and CDN asset versions diverge] → Pin compatible parser and asset versions together; test representative simple and compound emoji.

## Migration Plan

Implement the render-time paths, remove `react-twemoji` usage, and verify the exported HTML already contains Twemoji images before JavaScript runs. Deploy as a normal static-site update. Roll back the code change if rendering or hydration regresses; no stored data or asset migration is required.
