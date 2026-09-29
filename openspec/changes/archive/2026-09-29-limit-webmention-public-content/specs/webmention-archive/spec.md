# Spec Delta

## MODIFIED Requirements

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
