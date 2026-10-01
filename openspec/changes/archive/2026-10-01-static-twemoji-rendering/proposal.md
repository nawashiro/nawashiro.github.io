# Proposal

## Why

The site exports static HTML, but `react-twemoji` replaces emoji only after client-side JavaScript mounts. This can make emoji change appearance after first paint and makes the intended Twemoji presentation depend on JavaScript.

## What Changes

- Render Twemoji image markup into the exported HTML for emoji currently covered by the page-content Twemoji wrapper, including posts and other pages.
- Remove client-side `react-twemoji` substitution; preserve the Twemoji appearance without a post-load DOM rewrite.
- Keep image delivery on the existing external CDN; do not add Git-managed emoji image assets or build-time image downloads.
- Preserve text-only contexts such as code examples instead of indiscriminately replacing characters inside HTML strings.

## Capabilities

### New Capabilities

- `static-twemoji-rendering`: Twemoji presentation is present in the generated HTML without client-side substitution.

### Modified Capabilities

- None.

## Impact

Affects the shared page layout, React-rendered page content, Markdown-to-HTML post processing, emoji dependencies, and checks of exported HTML. Twemoji image availability remains dependent on the external CDN, as before.
