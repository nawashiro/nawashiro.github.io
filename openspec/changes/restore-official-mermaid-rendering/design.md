# Design

## Context

See proposal.md for motivation. The Markdown pipeline is shared by posts and feeds. The current adapter uses beautiful-mermaid and a narrow local sequence grammar. The earlier integration used remark-mermaidjs and mermaid-isomorphic with Chromium; the deployment workflow subsequently removed browser installation. The browserless change is unarchived, so its capability is not in canonical specs.

## Goals / Non-Goals

**Goals:** Delegate grammar and drawing to official Mermaid, keeping a thin error-context adapter and static output. Preserve current readability while accepting Chromium in builds.

**Non-Goals:** Full visual parity guarantees for arbitrary future diagrams, client-side drawing, generated SVG source control, header changes, or E2E policy changes.

## Decisions

1. Restore the official Mermaid build-time path through remark-mermaidjs/mermaid-isomorphic and Chromium, checking current APIs and compatible versions during implementation. Replace only the rendering integration, not the entire earlier commit. This avoids reimplementing grammar; alternatives are extending beautiful-mermaid's local allowlist or adopting MermaidX, whose tested Japanese layout clipped labels.
2. Remove the custom syntax allowlist and renderer-specific arrow/text completeness heuristic. Keep article/index error context, reject renderer error output, and propagate failures without fallback. Official Mermaid success is not a proof of all semantic fidelity; regression tests use fixed, article-independent Mermaid source fixtures instead of claiming universal correctness. Fixtures cover aliases, notes, Japanese labels, arrows, and malformed syntax; they are test inputs, not duplicate editable sources for published diagrams. Article IDs, wording, and message counts are not permanent expectations. The static build checks current article content, and current article diagrams receive one-time migration visual inspection.
3. Apply site-local Mermaid theme/font configuration and ensure Noto Sans JP is available and ready during Chromium text measurement. Reuse the existing site font strategy; no new committed font assets or diagram-specific external font fetch. Verify exported bounds and actual Japanese appearance, rather than merely changing SVG CSS after layout. Preserve 13px text and current contrasting text/line/arrow palette where supported by official theme configuration.
4. Restore the build's Chromium installation aligned with the rendering dependency. Keep browser E2E configuration and static header behavior unchanged. Do not invoke the build's standard.site synchronization against live credentials solely for renderer tests; use the direct Next build for initial static verification, then exercise the deployment path with controlled credentials/environment.

### Approved visual blockers (task 2.4)

Correct the existing font import ordering/load entrypoint while preserving the Google Fonts provider, Noto Sans JP weights, and font strategy. Verify rebuilt, unmodified exported pages load the font without diagnostic stylesheet injection. Increase diagram viewBox margins to contain bottom actor labels and other text with padding; preserve layout and static-source policy. Inspect the fixed fixture and two current articles using real-browser screenshots and geometry before marking 2.4 complete.

## Risks / Trade-offs

- Browser downloads and runtime overhead → Accept explicitly, use compatible locked dependencies, and verify a clean install/build.
- Font unavailable when measuring → Wait for font readiness and inspect Japanese test fixtures and current article diagrams during migration; do not accept clipped output.
- Adapter may convert errors into error SVG → Test invalid syntax end-to-end and explicitly reject error output if required by the integration.
- Inline SVG and author text → Retain official Mermaid's strict security configuration and test hostile label cases instead of reinstating a grammar allowlist.
- Existing browserless change conflicts at archive → Reconcile its superseded direction deliberately before archival; do not archive both as contradictory requirements.

## Migration Plan

Replace renderer dependencies, adapter, and CI browser setup together. Run regression tests, typecheck, lint, static build, exported HTML checks, and real browser visual checks. Confirm header and E2E policy remain unchanged. Roll back only the renderer/dependency/CI changes together if verification fails; Markdown sources remain untouched.
