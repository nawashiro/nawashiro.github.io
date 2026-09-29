# Spec Delta

## Purpose

Provide consistent Twemoji presentation in the site's exported HTML so visitors see the intended emoji images without waiting for client-side JavaScript to replace characters.

## ADDED Requirements

### Requirement: Twemoji is present in initial HTML
The site SHALL include Twemoji image elements for eligible emoji in the exported HTML of article content and other page content currently presented with Twemoji, without requiring a client-side emoji substitution.

#### Scenario: Article with emoji
- **WHEN** an article containing emoji is exported
- **THEN** its initial HTML contains Twemoji images for eligible emoji before client-side JavaScript executes

#### Scenario: Other page with emoji
- **WHEN** a non-article page containing eligible emoji is exported
- **THEN** its initial HTML contains the corresponding Twemoji images before client-side JavaScript executes

### Requirement: Text contexts remain intact
The site SHALL preserve emoji as literal characters where they are part of code examples or other non-presentational text contexts, and SHALL not alter HTML attributes, scripts, or styles while rendering Twemoji.

#### Scenario: Literal code example
- **WHEN** a code example includes an emoji character
- **THEN** the exported code example retains that character rather than an image element

### Requirement: External images with text fallback
The site SHALL continue to reference externally delivered Twemoji images, and each generated image SHALL retain the represented emoji as alternative text.

#### Scenario: Image unavailable
- **WHEN** the external Twemoji image cannot load
- **THEN** the generated markup still contains the represented emoji as alternative text
