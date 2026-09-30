# Spec Delta

## Purpose

Publish editable Mermaid diagrams as readable static SVG in posts and feeds, preserving Japanese content and making rendering failures stop publication.

## ADDED Requirements

### Requirement: Source remains authoritative and output is static
The system SHALL use Mermaid blocks in Markdown as the sole editable diagram source and publish inline SVG without client-side diagram rendering or checked-in generated SVG.

#### Scenario: Publishing article diagrams
- **WHEN** an article containing a valid Mermaid diagram is built
- **THEN** its diagram is present as inline SVG in the published document and feed rendering without requiring Mermaid JavaScript at viewing time

### Requirement: Valid article diagrams preserve their content
The system SHALL render valid diagrams from the current Markdown content with their participant display names, messages, directed arrows, and notes, without rejecting valid syntax through a separate local grammar allowlist. Regression expectations SHALL be based on fixed, article-independent Mermaid source fixtures, not specific article IDs, wording, or message counts.

#### Scenario: Fixed fixture with aliases and a note
- **WHEN** a fixed test fixture containing Japanese participant aliases, messages, directed arrows, and a spanning note is rendered
- **THEN** the expected fixture elements are present in the static SVG

#### Scenario: Editing an article diagram
- **WHEN** an author changes a valid article diagram, including its wording or message count
- **THEN** the build renders the updated source without failing assertions tied to the previous article content

### Requirement: Rendering failures stop publication
The system SHALL propagate diagram parse or render failures as a nonzero build exit identifying the article and diagram index, rather than substituting raw code, an error graphic, or an omitted diagram.

#### Scenario: Malformed diagram
- **WHEN** a diagram has invalid syntax or rendering throws an error
- **THEN** the build exits nonzero and reports the article and diagram index

### Requirement: Japanese diagrams remain readable
The system SHALL render Japanese text using the site's Noto Sans JP font with 13px text, dark text on a light background, distinguishable lines and arrowheads, and diagram-local styling. Japanese labels in the fixed regression fixtures SHALL NOT be clipped or overflow participant boxes. Diagrams SHALL NOT introduce an additional external font fetch.

#### Scenario: Inspecting Japanese regression fixtures
- **WHEN** their rendered SVG is displayed with the site font loaded
- **THEN** Japanese participant names, notes, and messages remain readable and unclipped, and diagram styling does not affect unrelated content

### Requirement: Build-time browser dependency is explicit
The deployment build SHALL provision the browser required for diagram rendering while published pages remain static.

#### Scenario: Clean deployment environment
- **WHEN** dependencies and the configured browser are installed in a clean deployment environment
- **THEN** diagrams from the current article content render successfully during the static build
