## Context

See `proposal.md` for the motivation. The repository uses the Pages Router with `output: "export"`; a production build writes extension-based files such as `out/posts/<id>.html`. Existing Playwright tests intentionally use extensionless URLs such as `/posts/<id>`. The current Playwright `webServer` command runs a full build and then `next start`, but `next start` rejects an export build. The current build also performs external link-card work because `remark-link-card` is registered before the external-fetch guard.

## Goals / Non-Goals

**Goals:**

- Run E2E against the generated static export, not a different server-side rendering mode.
- Resolve the extensionless URLs used by existing tests to the corresponding `.html` files.
- Make the build phase explicit and the server phase independently diagnosable.
- Make the existing external-fetch flag actually suppress `remark-link-card` during E2E/test builds.
- Avoid adding an unpinned static-server dependency.

**Non-Goals:**

- Changing `next.config.js` away from `output: "export"`.
- Changing production Cloudflare Pages deployment or public URL structure.
- Adding a browser-facing theme switcher or modifying site UI.
- Replacing the full static build with `next dev` for the primary E2E suite.

## Decisions

### 1. Serve `out/` with a small Node standard-library server

Add `scripts/serve-export.mjs`. The server resolves requests in this order:

1. `/` to `out/index.html`.
2. An exact existing file under `out/` for assets and generated files.
3. The requested path plus `.html`, so `/posts/example` resolves to `out/posts/example.html`.
4. A directory `index.html` fallback when present.
5. `404.html` or a 404 response when no candidate exists.

The resolver must decode the URL safely, reject paths that escape the `out/` root, and serve common static MIME types. It should listen on `PORT` with a default of `3000` and fail clearly when `out/index.html` is absent.

**Alternatives considered:**

- `next start` is rejected because it is incompatible with `output: "export"`.
- `next dev` is rejected for the primary suite because it does not validate the production static-export artifact.
- An unpinned `serve@latest` command is rejected because it adds runtime package resolution and was flagged by the local package advisory scan. A repository-local standard-library server keeps the behavior explicit and dependency-free.
- `trailingSlash: true` is rejected because it changes generated paths and would broaden the URL/canonical-link migration.

### 2. Build before Playwright starts the server

Move the build out of the Playwright `webServer.command`. The E2E package command performs the build once, then Playwright starts only `scripts/serve-export.mjs`. The server timeout therefore covers readiness, not the potentially long static generation phase. The build command uses the existing external-fetch disable flag for deterministic E2E preparation.

The configuration keeps local server reuse convenient while retaining non-reuse behavior in CI. A missing or stale export is handled by the explicit build step rather than silently falling back to an unrelated server.

### 3. Gate `remark-link-card` at registration time

Keep external link-card rendering enabled by default for normal production builds, but register `remark-link-card` only when `shouldEnableExternalFetch()` returns true. The test/E2E environment then avoids remote metadata requests while retaining the current production path. Existing external-fetch tests are extended so the guarded behavior cannot regress.

### 4. Verify the production-shaped route contract

The E2E verification must cover the home page, at least one extensionless post URL, canonical output, and the existing JavaScript-disabled Webmention case. A focused server smoke check should also verify that `/posts/<id>` returns the generated HTML and that traversal-like paths are rejected.

## Risks / Trade-offs

- [The full static build remains slow because every post is generated] -> Keep build outside `webServer` so progress and failures are visible; suppress external metadata fetches for E2E; do not add a second rendering mode.
- [A stale `out/` directory could be served when the server is invoked directly] -> The normal E2E command always builds first, and the server fails when the expected root artifact is missing.
- [The local resolver may diverge from Cloudflare Pages routing] -> Match the documented static-export lookup order (`$uri`, `$uri.html`, `$uri/`) and test extensionless post URLs explicitly.
- [The resolver could expose files outside `out/`] -> Normalize and validate the resolved path before opening it.
- [External-fetch gating could accidentally change production output] -> Keep the default predicate true outside test/explicit-disabled environments and add regression coverage for both enabled and disabled paths.

## Migration Plan

1. Add and unit-test the export server resolver.
2. Update the E2E package command and Playwright `webServer` configuration to build once and serve `out/`.
3. Fix the guarded `remark-link-card` registration and extend external-fetch regression coverage.
4. Run the static build, server smoke checks, targeted E2E, full E2E, unit tests, typecheck, lint, and OpenSpec validation.
5. If the change must be rolled back, restore the previous Playwright command and remove the helper; production deployment remains unaffected throughout.
