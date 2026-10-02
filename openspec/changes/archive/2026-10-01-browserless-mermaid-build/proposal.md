# Proposal

## Why

Rendering Mermaid diagrams during the static build currently launches Chromium through `remark-mermaidjs` and `mermaid-isomorphic`. This makes an otherwise static-site build depend on a browser download and runtime even though the site's Mermaid source should remain editable in Markdown.

## What Changes

- Keep Mermaid code blocks in posts as the single editable source; render their diagrams to inline SVG during the build without a browser or client-side diagram renderer.
- Preserve readable diagram styling: a light background, dark text, subtler blue-gray lines, blue arrowheads, Noto Sans JP, and 13px text. Use the site's existing web font rather than adding a separate external font request from the SVG.
- Fail the build clearly when a Mermaid diagram cannot be rendered; do not silently publish a missing or incorrect diagram.
- Remove the build-time browser dependency associated with Mermaid rendering. Browser-based E2E tests and diagram label placement improvements are outside this change.

## Capabilities

### New Capabilities

- `browserless-mermaid-rendering`: Render Mermaid source from posts as readable inline SVG during static builds without a browser, with explicit failure for unsupported diagrams.

### Modified Capabilities

None.

## Impact

The Markdown rendering pipeline in `lib/posts.ts`, Mermaid-related dependencies, and the existing diagram's static output are affected. The shared site font styling remains the font source. E2E infrastructure is unchanged.
