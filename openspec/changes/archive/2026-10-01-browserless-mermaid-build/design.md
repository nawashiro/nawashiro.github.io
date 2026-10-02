# Design

## Context

See `proposal.md` for motivation and `specs/browserless-mermaid-rendering/spec.md` for behavior. `renderMarkdownDocument()` in `lib/posts.ts` currently runs `remark-mermaidjs`, which delegates to `mermaid-isomorphic` and launches Playwright Chromium. The same Markdown path is used for posts and feed generation. The repository currently has one Mermaid block, a Japanese `sequenceDiagram`; the site already imports Noto Sans JP in `styles/global.css`. The build workflow installs Chromium but does not run browser E2E tests.

## Goals / Non-Goals

**Goals:** Keep Markdown as the only editable diagram source; render inline SVG at build time with no browser and no diagram-specific font fetch; fail closed for constructs that cannot be rendered faithfully.

**Non-Goals:** Change browser E2E tests, redesign sequence-label spacing, or promise full Mermaid grammar compatibility from an alternative renderer.

## Decisions

1. **Replace the Mermaid pipeline stage with a local build-time transformer using `beautiful-mermaid`.** It rendered the repository's real sequence diagram in a Node-only probe, preserving the three actors and ten Japanese messages. Keep the original fenced code in Markdown and transform its AST node to inline SVG before HTML serialization. Do not check in generated SVG. Alternative: pre-render a tracked SVG (duplicates the source) or use client-side Mermaid (adds JavaScript and visual delay).

2. **Validate before rendering and fail closed.** The alternative renderer is not the reference Mermaid implementation and may accept or silently ignore unfamiliar statements. Define a narrow, explicit allowlist of the sequence-diagram syntax actually supported and verified here, including actors and solid/dashed messages; reject unsupported diagram types or statements until they are deliberately tested and added. Wrap parse/render errors with post identity and diagram index. Verify generated SVG contains expected actor/message text and directed arrows; never replace an error with a code block or blank image. Alternative: trusting a non-throwing render result risks publishing partial diagrams.

3. **Apply site-specific presentation to the generated inline SVG.** Use a light background, text `#24292f`, line `#8495a4`, and arrow accent `#0969da`; set message and actor text to 13px and Noto Sans JP, using the existing site font import. The line color has 3.08:1 contrast against white in the probe. Remove the renderer's Google Fonts `@import` so the SVG creates no additional font request. Prefer local, per-SVG styling or attributes rather than an unscoped stylesheet that changes unrelated page content. Set an available site font weight explicitly (700) rather than relying on 600 substitution. Alternative: stock themes yielded faint text and lines; using only CSS in a standalone image would not preserve the chosen look.

4. **Remove only the browser dependency of builds.** Drop `remark-mermaidjs` and the unused `rehype-mermaidjs` with their transitive renderer dependencies, and remove the Chromium-install step from the build workflow after verifying that the build succeeds without an installed browser. Retain `@playwright/test` and its browser E2E configuration untouched. Alternative: removing Playwright entirely mixes this change with the separate E2E decision.

## Risks / Trade-offs

- **Subset compatibility** → Fail explicitly on unverified Mermaid features; add syntax only alongside a representative render test.
- **SVG style overrides can be brittle across renderer updates** → Pin or constrain the dependency and test the actual generated SVG's text, color, font, arrows, and absence of font imports.
- **Font is unavailable offline or blocked** → Keep a Japanese-capable fallback stack; browser rendering may differ without the existing web font.
- **Rendering arbitrary author text into inline SVG** → Treat SVG as generated content, preserve the existing Markdown sanitization boundary, and reject unsafe HTML or links rather than blindly injecting arbitrary raw SVG.

## Migration Plan

Replace the processor and dependency entries, remove the now-unneeded CI browser-install step, and run unit tests, typecheck, and a clean static build without a Playwright browser executable. Check the existing diagram's exported HTML and SVG. Roll back the processor/dependency/workflow changes together if validation fails; Markdown remains unchanged throughout.
