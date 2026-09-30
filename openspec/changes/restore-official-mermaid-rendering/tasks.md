# Tasks

## 1. Restore official rendering

- [x] 1.1 Restore compatible official Mermaid adapter dependencies and remove beautiful-mermaid; verify a clean npm installation and locked dependency resolution.
- [x] 1.2 Replace the local syntax allowlist and renderer-specific completeness checks with official browser rendering and article/index error propagation; verify fixed representative fixtures and current article diagrams render, and malformed syntax rejects without fallback or error SVG.
- [x] 1.3 Configure strict security and diagram-local theme/font settings, ensuring font readiness before measurement; verify hostile labels cannot create executable SVG and generated SVG has no additional external font import.
- [x] 1.4 Restore the deployment build's Chromium installation aligned with the rendering dependency; verify the workflow diff changes only rendering-related setup and leaves E2E policy/header behavior intact.

## 2. Regression verification

- [x] 2.1 Create fixed, article-independent Mermaid source fixtures for aliases, notes, Japanese participants/messages, and directed arrows; verify the unit suite passes without a separate local grammar implementation or assertions freezing article IDs, wording, or message counts.
- [x] 2.2 Add an end-to-end invalid-diagram build test in an isolated fixture, without editing real posts; verify nonzero exit and article/diagram context in output.
- [x] 2.3 Run typecheck, lint, and the static Next build with controlled environment, avoiding live standard.site writes; verify exported article/feed HTML contains static SVG without client-side Mermaid rendering or committed generated assets.
- [x] 2.4 Inspect fixed Japanese fixtures in a real browser with site fonts loaded and perform a one-time migration visual check of current article diagrams; verify labels and notes are unclipped, participant boxes contain their text, arrows remain clear, and save screenshots outside tracked source. Do not turn current article content into permanent test expectations. Approved corrections: fix the existing site font import/load ordering with the same Google Fonts provider and Noto Sans JP weights (no new assets/provider), and pad SVG viewBox bounds to contain every label including bottom actors. Acceptance requires rebuilt unmodified production exports loading Noto Sans JP without diagnostic injection, plus real-browser screenshots and geometry for the fixed fixture and two current articles.
- [x] 2.5 Exercise the configured deployment build path in a clean environment with external synchronization controlled; verify successful build and document any remaining environment-dependent checks before claiming deployment readiness.
