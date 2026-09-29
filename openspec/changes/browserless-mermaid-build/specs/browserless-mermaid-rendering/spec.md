# Spec Delta

## Purpose

Render editable Mermaid diagrams in published posts as readable static SVG without requiring a browser during the site build or client-side rendering at view time.

## ADDED Requirements

### Requirement: Mermaid source remains authoritative
The system SHALL use Mermaid code blocks in post Markdown as the sole editable source for the corresponding published diagrams, without requiring checked-in generated SVG files.

#### Scenario: Building a post with a supported diagram
- **WHEN** a post contains a supported Mermaid code block and the site is built
- **THEN** the published HTML contains its rendered inline SVG without client-side diagram rendering

### Requirement: Diagram rendering does not require a browser
The system SHALL render Mermaid diagrams during the static build without launching or downloading a browser for diagram generation.

#### Scenario: Build without an installed browser
- **WHEN** the site is built in an environment without a Playwright browser executable
- **THEN** supported Mermaid diagrams are rendered and the build succeeds without requiring that executable

### Requirement: Diagram text remains legible
The system SHALL render diagram text at 13px using the site's Noto Sans JP font when available, with dark text on a light background, distinguishable blue-gray lines, and blue arrowheads; the diagram SHALL NOT initiate its own external font request.

#### Scenario: Displaying the existing sequence diagram
- **WHEN** the existing Mermaid sequence diagram is rendered in a post
- **THEN** its actors, Japanese message labels, and directed arrows appear in the inline SVG with the specified styling

### Requirement: Invalid or unsupported diagrams fail explicitly
The system SHALL fail the build with an actionable error identifying the offending diagram or post if a Mermaid block cannot be faithfully rendered.

#### Scenario: Unsupported Mermaid syntax
- **WHEN** a post contains a Mermaid construct unsupported by the build-time renderer
- **THEN** the build fails rather than publishing an omitted, incomplete, or raw-code substitute diagram
