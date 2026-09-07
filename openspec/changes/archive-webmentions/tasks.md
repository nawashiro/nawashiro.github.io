## 1. Archive model and deterministic merge

- [x] 1.1 Define the public Webmention archive JSON shape and TypeScript types, preserving complete entry fields and using `wm-id` as the stable identity; verify the archive fixture can be parsed and round-tripped without losing fields
- [x] 1.2 Implement deterministic archive serialization and target canonicalization for HTTPS, HTTP/HTTPS equivalence, and optional trailing slashes; verify unit tests cover equivalent and non-equivalent targets
- [x] 1.3 Implement non-destructive merge behavior for new entries, updated entries, remote omissions, duplicate `wm-id` values, and failed validation; verify unit tests show that invalid or incomplete synchronization leaves the existing archive unchanged

## 2. Webmention synchronization

- [x] 2.1 Add a paginated Webmention.io domain-feed client using a repository secret token and validate every response page; verify mocked API tests cover pagination, malformed responses, and HTTP errors
- [x] 2.2 Add a synchronization command that reads the existing archive, merges the successfully fetched entries, and writes only a deterministic changed archive; verify an unchanged feed produces no file diff
- [ ] 2.3 Run a one-time full backfill for the production domain, inspect the public archive, and commit the initial dataset; verify the archive contains all fetched entries and no token or secret is present

## 3. Static Webmention rendering

- [x] 3.1 Refactor `WebMention` into a build-time presentational component with no Webmention API fetch or loading state, while retaining safe text and HTTP(S)-only URL rendering; verify unsafe-content tests and component tests pass
- [x] 3.2 Load the local archive during article static generation, filter by canonical target, preserve the intended ordering, and render all matching entries without the current 30-entry cap; verify generated article HTML contains more than thirty fixture entries when provided
- [ ] 3.3 Verify the generated Webmention markup remains readable with JavaScript disabled and that article loading no longer requests Webmention.io; verify with static-output inspection and a browser/network test

## 4. Conditional publication workflow

- [x] 4.1 Add a scheduled and manually dispatchable synchronization workflow with repository write permission and the Webmention.io token secret; verify the workflow can update the archive without exposing credentials
- [x] 4.2 Make the synchronization workflow commit only meaningful archive changes and explicitly dispatch the existing deployment workflow after a successful changed commit; verify a no-diff run performs no static build or deployment trigger
- [ ] 4.3 Verify a changed archive, including a manual local deletion after remote deletion, causes the normal static publication flow and leaves the deleted record available only in Git history

## 5. Documentation and regression coverage

- [x] 5.1 Document the one-way non-destructive synchronization model, canonical URL matching, full display behavior, required secret, and remote-then-local deletion procedure; verify the README and operational instructions agree with the implemented workflow
- [x] 5.2 Add regression coverage for archive merge, safe rendering, target matching, static output, and conditional build decisions; verify `npm run typecheck` and the relevant test command pass
- [ ] 5.3 Exercise the migration rollback path by disabling scheduled synchronization and confirming the archive remains intact and the site can be rebuilt manually; verify the rollback procedure is documented
