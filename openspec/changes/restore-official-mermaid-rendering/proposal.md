# Proposal

## Why

Deployment #319 fails because the browserless Mermaid adapter rejects valid participant aliases and notes. Extending a local syntax allowlist duplicates Mermaid grammar, while the tested browserless alternative has Japanese text measurement problems; restore official Mermaid rendering and accept a build-time browser dependency instead.

## What Changes

- Render Mermaid through the official Mermaid library in build-time Chromium and publish static inline SVG.
- Remove the local sequence-only syntax allowlist and beautiful-mermaid dependency; propagate rendering failures with post and diagram identity so the build exits nonzero.
- Keep Markdown Mermaid blocks as the sole editable source, without committed generated SVG or client-side diagram rendering.
- Preserve Japanese readability, diagram-local styling, dark text, distinguishable lines and arrowheads, and no additional diagram font fetch.
- Restore Chromium installation for the deployment build without changing browser E2E policy or the static header behavior.
- Use fixed, article-independent Mermaid source fixtures for regression tests, including malformed syntax and Japanese layout. Build current article content as an integration check; inspect current article diagrams once during migration without freezing article wording or arrow counts.

## Capabilities

### New Capabilities

- `static-mermaid-rendering`: Official Mermaid rendered as static SVG during builds, with explicit failure propagation and readable Japanese output.

### Modified Capabilities

None. The previous browserless capability exists only in an unarchived change, not in the canonical capability inventory. This change supersedes its browser-free rendering direction without editing that historical change.

## Impact

The Markdown pipeline in lib/posts.ts, lib/mermaid.ts, Mermaid dependencies and package lock, .github/workflows/nextjs.yml, and Mermaid regression tests are affected. Build environments require Chromium. Header behavior, content source, and E2E policy remain unchanged.
