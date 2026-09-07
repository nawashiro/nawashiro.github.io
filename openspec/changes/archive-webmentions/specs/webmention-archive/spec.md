## Purpose

受信済みWebmentionを外部サービスの一時的な状態から切り離して保存し、JavaScriptが利用できない環境でも記事内の会話として読めるようにする。

## ADDED Requirements

### Requirement: Webmention archive is preserved non-destructively

The system SHALL maintain a version-controlled public archive of the complete Webmention entry data received from Webmention.io. Synchronization SHALL add new entries and update entries with the same stable identifier, but the absence of an entry from a later remote response SHALL NOT remove it from the local archive.

#### Scenario: New Webmention is received
- **WHEN** a successful synchronization returns an entry whose `wm-id` is not in the archive
- **THEN** the complete entry is added to the archive

#### Scenario: Existing Webmention is updated
- **WHEN** a successful synchronization returns an entry whose `wm-id` is already in the archive with different data
- **THEN** the archived entry is updated with the returned complete entry

#### Scenario: Remote response no longer contains an archived entry
- **WHEN** a successful synchronization does not return an entry that is already in the archive
- **THEN** the archived entry remains available locally and is not deleted automatically

#### Scenario: Synchronization fails
- **WHEN** any required remote page cannot be fetched or validated
- **THEN** the existing archive remains unchanged and the synchronization reports failure

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

The system SHALL preserve the complete received entry for archival purposes but SHALL render user-controlled content as text and SHALL allow links and images only when they use safe HTTP or HTTPS URLs. Archived HTML content SHALL NOT be inserted directly into the article DOM.

#### Scenario: Archived content contains HTML markup
- **WHEN** a Webmention entry includes markup in its content
- **THEN** the displayed content is treated as text and the markup is not executed

#### Scenario: Archived author image uses an unsafe scheme
- **WHEN** an author photo URL uses a non-HTTP(S) scheme or is invalid
- **THEN** the unsafe image URL is not used and the default author icon is displayed
