# Archive disposition

This change is archived as superseded by `restore-official-mermaid-rendering`. Its completed task checklist records the earlier implementation, not the current rendering contract.

The browser-free rendering direction, `beautiful-mermaid` adapter, and local syntax allowlist were replaced by official Mermaid rendering in build-time Chromium. The current contract is `openspec/specs/static-mermaid-rendering/spec.md`.

The delta for `browserless-mermaid-rendering` is intentionally not synced to canonical specs. Keeping its browser-free requirement would contradict the current implementation and the successor specification. Original proposal, design, tasks, and delta spec are preserved as historical artifacts.
