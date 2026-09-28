# Tasks

## 1. Source and archival boundary

- [x] 1.1 Pull remote `main` and merge it into `dev` before transforming the archive; verify the merge contains the latest `lib/data/webmentions.json` and the working branch is `dev`.
- [x] 1.2 Normalize archived entries using an allowlist and 140-character excerpt on writes and sync; verify tests cover long text, HTML/unknown fields, metadata retention, failure atomicity, and unchanged sync.

## 2. Render and migrate

- [x] 2.1 Limit comment bodies and reaction descriptions at render time, retaining safe URL handling and `nofollow ugc`; verify render tests cover long Unicode text, legacy entries, and source link attributes.
- [x] 2.2 Convert the checked-in Webmention archive after the `main` merge using the new normalizer; verify all IDs remain, no article HTML/unknown fields remain, and every saved excerpt is within 140 characters.

## 3. Integration verification

- [ ] 3.1 Run focused tests, type checks, build, and OpenSpec validation; verify all pass and report any existing environmental blockers.
