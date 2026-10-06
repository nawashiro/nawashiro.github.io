# webmention-archive Specification

## Purpose

受信済みWebmentionを外部サービスの一時的な状態から切り離して保存し、JavaScriptが利用できない環境でも記事内の会話として読めるようにする。

## Requirements

### Requirement: Webmention archive is preserved non-destructively

The system SHALL maintain a version-controlled public archive containing only the Webmention fields required to identify, match, sort, synchronize, and display entries. For each received entry, the archived text content SHALL be limited to 140 characters including any omission mark, and the archive SHALL NOT contain the received article's full HTML or other unbounded article-body fields. Synchronization SHALL add new entries and update entries with the same stable identifier, but the absence of an entry from a later remote response SHALL NOT remove it from the local archive.

#### Scenario: New Webmention is received

- **WHEN** a successful synchronization returns an entry whose `wm-id` is not in the archive
- **THEN** only the required metadata and at most 140 characters of text are added to the archive; the full HTML and unbounded article body are not saved

#### Scenario: Existing Webmention is updated

- **WHEN** a successful synchronization returns an entry whose `wm-id` is already in the archive with different data
- **THEN** the archived entry is updated with the limited representation of the returned entry

#### Scenario: Remote response no longer contains an archived entry

- **WHEN** a successful synchronization does not return an entry that is already in the archive
- **THEN** the archived entry remains available locally and is not deleted automatically

#### Scenario: Synchronization fails

- **WHEN** any required remote page cannot be fetched or validated
- **THEN** the existing archive remains unchanged and the synchronization reports failure

#### Scenario: Existing archive is migrated

- **WHEN** the current public archive contains previously saved full Webmention content
- **THEN** its current file is converted to the same limited representation without rewriting Git history

### Requirement: Webmentions are matched to canonical article targets

The system SHALL match archived Webmentions to article targets using an HTTPS-based canonical form. Equivalent `http`/`https` forms and optional trailing-slash variants of the same target SHALL match, while the original target values in the archived entries SHALL remain unchanged.

#### Scenario: HTTP and HTTPS target variants are received

- **WHEN** an archived entry targets the HTTP form and the article uses the HTTPS form
- **THEN** the entry is displayed for that article

#### Scenario: Target differs only by a trailing slash

- **WHEN** an archived entry and an article target differ only by an optional trailing slash
- **THEN** the entry is displayed for that article

### Requirement: All archived entries for an article are displayed

The system SHALL display every archived Webmention that matches the article target, without an arbitrary maximum-count limit. Each archived entry SHALL be displayed at most once per article.

#### Scenario: Article has more than thirty matching Webmentions

- **WHEN** an article has more than thirty archived matching entries
- **THEN** all matching entries are included in the rendered Webmention section

#### Scenario: An entry appears more than once in the source response

- **WHEN** the same stable Webmention identifier is encountered more than once during synchronization or loading
- **THEN** the article displays that entry only once

### Requirement: Webmentions are present in static output

The system SHALL render the archived Webmention content into each article's generated HTML during the normal static build. The rendered Webmention section SHALL remain available when browser JavaScript is disabled, and the browser SHALL NOT need to request Webmention.io to populate it.

#### Scenario: Article is generated successfully

- **WHEN** the static build processes an article with archived matching Webmentions
- **THEN** the generated HTML contains the Webmention comments and reactions for that article

#### Scenario: Browser JavaScript is disabled

- **WHEN** a reader opens a generated article with JavaScript disabled
- **THEN** the archived Webmention section is readable without a client-side fetch

### Requirement: Builds occur only for meaningful archive changes

The synchronization process SHALL compare a deterministic representation of the archive after a successful merge. It SHALL NOT start static generation or deployment when that representation is unchanged, and it SHALL start the normal static publication flow when the archive has additions, updates, or intentional local deletions.

#### Scenario: Scheduled synchronization finds no archive difference

- **WHEN** synchronization completes without changing the canonical archive data
- **THEN** no static build or deployment is started

#### Scenario: Scheduled synchronization changes the archive

- **WHEN** synchronization adds or updates at least one archived entry
- **THEN** the changed archive is committed and the static publication flow is started

#### Scenario: User intentionally deletes an entry

- **WHEN** the user deletes the entry from Webmention.io and then removes it from the local archive before committing
- **THEN** the local change is published through the normal static publication flow, while the deleted entry remains in Git history

### Requirement: External input is rendered safely

The system SHALL archive only the limited representation of received entries and SHALL render user-controlled content as text, with Webmention body excerpts limited to 140 characters including any omission mark. The system SHALL allow links and images only when they use safe HTTP or HTTPS URLs. Received HTML content SHALL NOT be inserted directly into the article DOM. Webmention source links SHALL carry `rel="nofollow ugc"`.

#### Scenario: Archived content contains HTML markup

- **WHEN** a Webmention entry includes markup in its content
- **THEN** the displayed content is treated as text and the markup is not executed

#### Scenario: Archived author image uses an unsafe scheme

- **WHEN** an author photo URL uses a non-HTTP(S) scheme or is invalid
- **THEN** the unsafe image URL is not used and the default author icon is displayed

#### Scenario: Long comment or reaction text is displayed

- **WHEN** a Webmention comment body or reaction description exceeds 140 characters, including when an older archive entry still contains long text
- **THEN** the displayed excerpt is at most 140 characters including an omission mark, without cutting a Unicode character in half

#### Scenario: Webmention source is linked

- **WHEN** a Webmention source link is rendered
- **THEN** the link carries `nofollow` and `ugc` relationship tokens

### Requirement: Webmention source links use the verified source

The system SHALL use `wm-source`, not the received entry's `url`, as the destination of comment and reaction source links. If `wm-source` is missing or is not a safe HTTP or HTTPS URL, the system SHALL use `#` without falling back to `url`. When an author name is absent, source labels SHALL be derived from `wm-source`, not `url`.

#### Scenario: Source and entry URLs differ

- **WHEN** a comment or reaction has different safe URLs in `wm-source` and `url`
- **THEN** its source link points to `wm-source` and carries `nofollow` and `ugc` relationship tokens

#### Scenario: Source URL is unavailable or unsafe

- **WHEN** a comment or reaction has a missing or unsafe `wm-source` and a safe `url`
- **THEN** its source link uses `#` and does not fall back to `url`

#### Scenario: Author name is absent

- **WHEN** a comment or reaction has no author name and its `wm-source` and `url` have different hostnames
- **THEN** its displayed author label or link title uses the hostname of `wm-source`, not `url`

### Requirement: Routine synchronization uses an archive high-water mark

The system SHALL perform scheduled synchronization incrementally after a baseline archive exists. The request to Webmention.io SHALL use the largest numeric `wm-id` in the local archive as its high-water mark, retrieve only entries with a greater identifier, and SHALL NOT traverse the complete historical feed during routine synchronization.

#### Scenario: A baseline archive has a numeric high-water mark

- **WHEN** routine synchronization starts with an archive containing Webmentions
- **THEN** the provider request uses the archive's largest numeric `wm-id` as `since_id` and the returned entries are merged into the archive

#### Scenario: No new Webmentions are available

- **WHEN** routine synchronization returns no entries newer than the high-water mark
- **THEN** the existing archive remains unchanged and no additional historical pages are requested

#### Scenario: The archive has no usable high-water mark

- **WHEN** routine synchronization starts with an empty archive or an archive whose identifiers cannot provide a numeric high-water mark
- **THEN** synchronization fails before making a full-feed request and reports that an explicit full synchronization is required

### Requirement: Full synchronization is explicit and manual

The system SHALL provide an explicit full synchronization operation for the initial complete backfill and for reconciling updates to already archived Webmentions. Scheduled synchronization SHALL NOT silently fall back to full synchronization, and a full synchronization SHALL retain the existing non-destructive merge behavior for remote omissions.

#### Scenario: Initial archive backfill is requested explicitly

- **WHEN** an operator starts the explicit full synchronization for an empty archive
- **THEN** the system retrieves the complete paginated domain feed, validates every page, and stores the resulting archive

#### Scenario: An old Webmention needs reconciliation

- **WHEN** an operator starts the explicit full synchronization after a provider-side update to an already archived identifier
- **THEN** the returned entry replaces the archived entry with the same stable identifier when its data differs

#### Scenario: A scheduled run is triggered without a baseline

- **WHEN** the scheduled synchronization is triggered before the initial full backfill has completed
- **THEN** it does not download the historical feed and instead fails with instructions to run the explicit full synchronization
