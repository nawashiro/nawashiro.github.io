# Tasks

## 1. Browserless rendering

- [x] 1.1 Add `beautiful-mermaid` and replace the `remark-mermaidjs` stage in `lib/posts.ts` with a Markdown-AST transformer that emits inline SVG from Mermaid blocks; verify a rendering test preserves the existing post's actors and ten Japanese messages without checked-in SVG.
- [x] 1.2 Reject unsupported diagram types, unrecognized sequence statements, malformed messages, and incomplete render output with post/diagram context; verify tests fail on each case and no fallback diagram is published.

## 2. Diagram presentation

- [x] 2.1 Apply the agreed light/blue colors, 13px Noto Sans JP text, site-available font weight, and scoped SVG styling without an SVG font import; verify tests inspect text, lines, arrowheads, font properties, and absence of diagram-specific network font references.
- [x] 2.2 Verify generated SVG safely handles Markdown-supplied labels without executable markup or unsafe links; add a hostile-label regression test and confirm existing Markdown render tests still pass.

## 3. Build integration

- [x] 3.1 Remove unused Mermaid/browser-rendering packages and the Chromium-install step in the build workflow while retaining browser E2E tooling; verify the lockfile and workflow reflect that split and `npm run typecheck` plus `npm run test` pass.
- [x] 3.2 Run a clean static build without a Playwright browser executable and verify the exported post contains the complete inline SVG with no client-side Mermaid renderer; verify an unsupported Mermaid block causes a build/render failure with post context.
