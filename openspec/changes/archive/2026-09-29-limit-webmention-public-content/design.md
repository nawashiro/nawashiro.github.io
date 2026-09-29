# Design

## Context

See proposal.md. The current archive serializes complete JF2 entries; display uses `content.text` and optional word-count truncation, while incremental sync relies on the largest `wm-id`. After merging the current `main` into `dev`, the archive has the latest received entries.

## Goals / Non-Goals

**Goals:** One deterministic, small public representation of each entry and a display-time bound even for legacy data.

**Non-Goals:** Rewrite published Git history or alter remote Webmention.io records.

## Decisions

- Normalize each entry at the archive boundary with an explicit allowlist: `wm-id`, `wm-property`, `wm-source`, `wm-target`, `wm-received`, `published`, `updated`, `url`, `rsvp`, limited `author` name/photo, and limited `content.text`. Drop `content.html`, unknown fields, and nested article payloads. Keep original target/source URLs for matching, linking and identification. Rather than a denylist, this prevents newly added upstream fields from accidentally exposing body content.
- Use a shared Unicode code-point truncator for archival excerpts and rendering. Collapse whitespace; if truncated, reserve one of 140 characters for `…`. Use display-time truncation too because an old or externally supplied archive may contain long content. Limit author display name as a text-bearing field as well; URL metadata is retained for link identity rather than considered prose.
- Normalize existing and newly fetched entries before merging and writing. Convert the checked-in JSON with the same normalization path after merging `main`, with no API call or credentials. Keep `wm-id` and existing deterministic ordering so incremental sync and deduplication still work. A failure while fetching/validating any page must not write the archive.
- Retain `rel="nofollow ugc"` on source links; no SEO-specific data migration is needed.

## Risks / Trade-offs

- [Unknown JF2 fields may previously have been preserved] → Explicitly prefer privacy over lossless archival fidelity; retain only fields used by rendering, matching and sync.
- [Truncation may split grapheme clusters such as emoji sequences] → Code-point counting avoids broken surrogate pairs; an entire grapheme is not guaranteed and can be revisited if needed.
- [Prior revisions remain available in Git] → Excluded by scope; do not claim that prior copies have disappeared.

## Migration Plan

1. Pull remote `main` and merge into `dev` before converting data (completed locally; no push).
2. Implement and test normalization plus bounded rendering; convert the current archive using the same normalization function and check the resulting data.
3. Run focused tests, type checks and build. Rollback is a normal revert of the new commit(s); no history rewrite.
