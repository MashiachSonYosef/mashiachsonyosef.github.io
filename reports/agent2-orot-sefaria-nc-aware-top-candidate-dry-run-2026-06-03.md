# Agent 2 Orot/Sefaria NC-Aware Top Candidate Dry Run

## Boundary

Zero-emission, non-public planning only. No answer rows, source rows, public HUD rows, route JSONL rows, runtime edits, public mutation, or definition-content storage were produced.

## Inputs

- transform_spec: `reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.json`
- agent6_family_boundary: `reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json`
- agent1_family_boundary: `reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json`
- public_domain_preview: `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json`
- nc_measurement: `reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json`

## Summary

- Included rows: 50
- Included occurrences: 2917
- Commercial-clean rows: 33
- Commercial-clean occurrences: 2658
- NC educational rows: 17
- NC educational occurrences: 259
- Future commercial-export exclusion rows: 17
- Future commercial-export exclusion occurrences: 259

## Selected Rows

Full row detail is in the JSON artifact. This Markdown stays compact to avoid duplicating the data payload.

| Lane | Rows | Occurrences | Detail |
| --- | ---: | ---: | --- |
| commercial_clean_candidate | 33 | 2658 | Top public-domain-observed BDB/BDB Aramaic/Jastrow rows by existing audit priority. |
| noncommercial_educational_candidate | 17 | 259 | All existing Klein/CC-BY-NC rows, flagged for commercial export exclusion. |

## NC Commercial Export Exclusion

All Klein/CC-BY-NC rows in this dry-run carry `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, and `corpus_contamination=false`. No NC definition content is stored.

## Next Route Or Blocker

- Next route: Agent 6 exact review of this zero-emission dry-run if the team wants to convert it into a later non-public fill-producing candidate package.
- Blocker: Public/runtime mutation, answer eligibility, source-row emission, and definition-content storage remain blocked until exact Agent 6 package review.
- Agent 4 remains held: true

## Agent 8 Callback

Status: Agent 2-style NC-aware top candidate dry-run produced by Agent 10 release lane.
Artifact path: `reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.md`
Artifact JSON: `reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.json`
Selected rows: 50
Selected occurrences: 2917
NC rows: 17
NC occurrences: 259
Next executable route: Route this exact zero-emission dry-run to Agent 6 only if Agent 13/8 wants review for later non-public fill package planning; do not route Agent 4.
Public mutation blocked: true
Agent 4 remains held: true

## What Must Not Be Accepted

- QA acceptance
- Source/provenance acceptance
- License acceptance
- Definition authority
- Usage-as-definition authority
- Answer acceptance
- Public/runtime acceptance
- Publication readiness
- Route publication support
- Product/data acceptance
- Translation output
- Accepted gloss
- Accepted text

