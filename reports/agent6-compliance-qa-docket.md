# Agent 6 Compliance QA Docket

Generated: 2026-05-31T13:41:42-04:00

## Purpose

This docket reframes Agent 6 QA around compliance risk. It is not legal advice. It is an engineering acceptance packet for provenance, license labeling, and publication-boundary controls.

## Hierarchy

- Real legal/regulatory exposure is above the project.
- User/product owner decides risk tolerance and publication choices.
- Agent 6 is QA/compliance acceptance authority.
- Agent 5 is program manager and relay layer to Agent 6.
- Agents 1-4 are production lanes.

## External Reference Points

Official references checked:

- U.S. Copyright Office copyright FAQ: https://www.copyright.gov/help/faq/faq-general.html
- U.S. Copyright Office circulars index: https://www.copyright.gov/circs/
- U.S. Copyright Office fair use index: https://copyright.gov/fair-use/

Control interpretation:

- Copyright can protect expression even when facts, ideas, systems, and methods are not protected.
- Fair use is fact-specific and not something this project should silently assume for release.
- Because the Copyright Office does not provide case-specific fair-use advice to individual users, this project should treat fair-use-dependent publication paths as explicit human/legal review items.

## Acceptance Boundary

Agent 6 should evaluate three separate layers:

- Private/workbench evidence display: broadest layer, but still needs source/license labels.
- Public reader HUD display: narrower; must avoid misleading source/provenance and must not imply publication rights.
- Future publishable translation text: narrowest; requires accepted decision rows, source anchors, source/license rows, and publication-safe license profile.

## Current Report-Backed Controls

- Translation memory license profiles exist and distinguish `publication_ok`, `publication_ok_with_attribution`, and `workbench_ok_publication_review`.
- Attribution manifest exists at `data/translation-memory/attribution-manifest.json`.
- Current translation-memory sample has 40 decision rows, 48 source entries, 25 attribution-required sources, and 3 publication-review sources.
- Agent 2 route release is report-backed and includes source/license rows as part of route authority.
- Agent 3 usage navigation is report-backed as observed usage/concordance, not definition authority.

## Compliance QA Questions

Agent 6 should answer:

- Can any Sefaria-derived or third-party text surface in public reader HUD without an adequate source/license label?
- Can any CC BY row become accepted translation text without an attribution bundle?
- Can any CC BY-SA/GFDL row become accepted translation text without explicit publication-review approval?
- Can workbench evidence be confused with publishable translation output?
- Are route definitions, usage snippets, source quotations, and future translation renderings visually and data-model distinct?
- Do generated reports or HUD labels imply legal clearance where the project only has provenance metadata?

## Suggested Agent 6 QA Samples

- One Agent 2 answer-eligible route card with CC BY source/license rows.
- One translation-memory row with `publication_ok_with_attribution`.
- One translation-memory row with `workbench_ok_publication_review`.
- One Agent 3 usage-navigation row that links to Sefaria and local work anchor.
- One HUD card where source/license rows are visible.

## Acceptance Rules

- Release blocker: any accepted/future translation row lacks `source_anchor`.
- Release blocker: any accepted/future translation row lacks `license_profile`.
- Release blocker: any `workbench_ok_publication_review` row can become accepted/published without review.
- Release blocker: any public HUD hides source/license rows for copied or derived evidence.
- Warning: public HUD displays third-party snippets but labels are present and non-misleading.
- Warning: workbench/publication boundary exists in reports but is not obvious in UI.
- Polish: attribution bundle wording can be improved while machine-readable source rows are correct.

## Agent 5 Relay Template From Agent 6 Findings

```text
Control call:
Finding:
Compliance severity: blocker / warning / polish
Owning lane:
Required correction:
Evidence:
Acceptance condition:
```

## Current Agent 5 Recommendation

Agent 6 should treat compliance QA as release-blocking for public publication and as warning/blocker split for public reader HUD depending on whether labels are present. Agent 5 should not declare legal clearance; Agent 5 should only maintain provenance, license profiles, attribution manifests, and escalation paths.
