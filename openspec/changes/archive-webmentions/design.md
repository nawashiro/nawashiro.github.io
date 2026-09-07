## Context

The existing site is a Next.js static export. `components/WebMention.tsx` fetches Webmention.io from the browser for each article, so the generated HTML does not contain Webmentions and the display depends on the external service being available. The current deployment workflow builds on pushes to `main` and already supports manual dispatch.

The proposal and the `webmention-archive` specification define the required preservation, static rendering, deletion, and conditional-publication behavior.

## Goals / Non-Goals

**Goals:**

- Keep a public, version-controlled copy of complete Webmention.io entry objects.
- Make the archive the build-time source for Webmention display.
- Keep remote absence non-destructive while supporting deliberate remote-then-local deletion.
- Avoid a Next.js build when a scheduled synchronization produces no meaningful archive change.
- Preserve the existing safe text and URL rendering behavior while removing the browser-side Webmention fetch.

**Non-Goals:**

- Removing JavaScript from the rest of the site, including Ko-fi or Next.js hydration.
- Running a Webmention receiver or database on the site itself.
- Caching author avatar image bytes or source pages.
- Rewriting Git history when an entry is intentionally deleted.

## Decisions

### 1. Use a public canonical JSON archive

Store a stable JSON document in the repository containing the complete entry objects returned by Webmention.io. Keep the raw fields, including `content.html`, `wm-source`, and `wm-target`, for archival fidelity, but do not render raw HTML directly. Sort entries deterministically by stable identifier and keep volatile synchronization timestamps out of the canonical archive so an unchanged remote response does not create a false diff.

Alternatives considered:

- **Only store display fields**: rejected because it loses information that may be needed for future presentation or recovery.
- **Store data only in the deployed output**: rejected because a subsequent build could lose old data when Webmention.io changes.
- **One file per entry**: possible if the archive becomes large, but a single canonical JSON document is simpler for the initial migration and manual inspection.

### 2. Merge remote data without propagating absence

The synchronization reads the domain-wide Webmention.io feed with pagination and merges entries by `wm-id`. New entries are appended, changed entries are replaced, and entries absent from the remote response are retained. The first run performs a full backfill; later runs may use an incremental optimization only if it preserves the same add/update guarantees.

The synchronization must validate every page before replacing the archive. It writes no new archive when a page is unavailable, malformed, or contains an entry that cannot be assigned a stable identity.

### 3. Normalize only for target matching

The raw `wm-target` is preserved. A separate comparison function canonicalizes targets to the site's HTTPS form and treats HTTP/HTTPS and optional trailing-slash variants as equivalent. This avoids changing historical source data or public article URLs while allowing old URL variants to continue matching.

### 4. Render from build-time data

The article static-generation path loads the local archive, filters entries by canonical target, sorts them using the existing published/received ordering intent, and passes all matching entries to a presentational WebMention component. The component contains no Webmention fetch, effect, or state needed for loading. The archive is therefore present in the generated HTML even before hydration and remains readable without JavaScript.

Use `wm-id` as the stable rendering identity and remove the existing arbitrary 30-entry fetch limit. Keep safe URL validation and render comment text as text rather than using the archived HTML field.

### 5. Trigger publication explicitly after an archive change

The scheduled synchronization workflow has write permission for the repository and commits only when the canonical archive changes. It then explicitly dispatches the existing deployment workflow. This is required because a push made with GitHub's `GITHUB_TOKEN` does not create another workflow run through the normal `push` trigger; the existing deployment workflow's `workflow_dispatch` trigger provides the explicit handoff.

If no archive diff exists, the synchronization workflow exits without dispatching deployment. A failed deployment does not discard the already committed archive; the deployment can be retried manually.

### 6. Make deletion an explicit two-system operation

The documented manual deletion order is:

1. Delete the entry through Webmention.io's supported procedure.
2. Remove the same `wm-id` from the local JSON archive.
3. Commit the local change so the static site is regenerated.

The sync does not infer deletion from absence, so accidental provider loss cannot remove the local copy. A local deletion performed before the remote deletion may be reintroduced by a later sync and is therefore not the supported order.

## Risks / Trade-offs

- **Public personal data** -> The archive is intentionally public; render only text and safe URLs, and document the remote-then-local deletion procedure.
- **Archive and generated HTML grow over time** -> Store all entries as required, monitor build size, and revisit per-entry files or pagination only if growth becomes material.
- **A real archive change still runs the full Next.js build** -> Avoid no-op builds first; optimizing partial page generation is outside this change.
- **Remote avatar images can disappear** -> Preserve the URL and use the existing default icon fallback; binary image caching is out of scope.
- **Git history retains intentionally deleted entries** -> This is an accepted property of the public archival policy.
- **A workflow commit does not automatically trigger deployment** -> Use explicit `workflow_dispatch` after a successful archive commit and test the handoff in CI.

## Migration Plan

1. Add the Webmention.io API token as a repository secret and run a one-time full backfill.
2. Inspect the generated public archive and commit it before switching display to build-time data.
3. Change article generation and the WebMention component to consume the archive, then verify static HTML and JavaScript-disabled behavior.
4. Add the scheduled synchronization workflow and conditional deployment dispatch.
5. Run a deployment with no archive diff to verify that no static build is started, then run one with a controlled archive change to verify publication.
6. If rollback is required, disable the scheduled workflow and restore the previous browser-fetch display; retain the archive for later retry.
