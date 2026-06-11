# Agent 6 Orot NC/Klein Source-Family Map Boundary Verdict

Date: 2026-06-04

Disposition: WARN-ACCEPTED for row-scoped noncommercial educational planning evidence only.

## Scope Reviewed

Artifacts reviewed:

- `reports/agent10-agent6-ready-orot-nc-klein-source-family-map-boundary-packet-2026-06-04.md`
- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md`
- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`

Reviewed question: whether the Orot NC/Klein source-family map remains valid only as row-scoped noncommercial educational planning evidence preserving `derived_from_nc=true`, `commercial_export_allowed=false`, attribution-required, non-contaminating separation, and no NC definition-content storage/display/public mutation/answer emission until a later exact Agent 6 plus owner/license-policy boundary.

Not reviewed or accepted: QA acceptance beyond this docket, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, public mutation, route shard edit, runtime mutation, source mutation, token-index mutation, lexical-payload mutation, NC definition-content storage, noncommercial display authorization, commercial export authorization for NC rows, or answer eligibility.

## Validation Performed

Command run:

- `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs data/build/orot/reader-hint-placeholder-candidates.json`

Result:

- Non-public reader-hint placeholder package validation passed.

Additional check:

- `git diff --check -- reports/agent10-agent6-ready-orot-nc-klein-source-family-map-boundary-packet-2026-06-04.md reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json` returned no whitespace errors.

## Evidence Checks

Agent 1 family map:

- Family: `Klein Dictionary`.
- Observed license group: `CC_BY_NC`.
- Status: `noncommercial_educational_candidate`.
- Rows / occurrences: 17 / 259.
- All 17 rows have `derived_from_nc=true`.
- All 17 rows have `commercial_export_allowed=false`.
- All 17 rows have `noncommercial_display_allowed=false`.
- All 17 rows have `attribution_required=true`.
- All 17 rows have `corpus_contamination=false`.
- All 17 rows have storage/display/transformed reader-hint allowed now set false.
- Metadata-only and external-link-only posture is allowed by the map; NC definition-content storage is not allowed.

Current non-public Orot package:

- Placeholder rows / occurrences: 332 / 6156.
- Commercial-clean rows / occurrences: 302 / 5768.
- Noncommercial educational rows / occurrences: 17 / 259.
- TBD display-integrity rows / occurrences: 13 / 129.
- Answer rows: 0.
- Source rows: 0.
- Public HUD rows: 0.
- Route JSONL rows: 0.
- Definition-content rows: 0.
- NC definition-content rows: 0.
- Accepted-text rows: 0.

## Verdict

The Orot NC/Klein source-family map remains valid only as row-scoped noncommercial educational planning evidence.

The 17 Klein / CC BY-NC rows may remain in the non-public Orot package and supporting family map as `noncommercial_educational_candidate` planning rows with metadata-only / external-link-only posture. They may not store NC definition content, display NC-derived content, emit public reader output, become answer eligible, mutate route shards, or enter commercial export.

## Row Boundary

This verdict applies only to the 17 token IDs listed in `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`:

| token_id | occurrences | allowed posture |
| --- | ---: | --- |
| `tok-e1419d66ddac` | 33 | noncommercial educational planning evidence only |
| `tok-09a1636a29b2` | 32 | noncommercial educational planning evidence only |
| `tok-3b3b23913614` | 30 | noncommercial educational planning evidence only |
| `tok-1a6106348f82` | 29 | noncommercial educational planning evidence only |
| `tok-e3f57c129127` | 20 | noncommercial educational planning evidence only |
| `tok-24d0fe4dc457` | 17 | noncommercial educational planning evidence only |
| `tok-da3c733e62e9` | 14 | noncommercial educational planning evidence only |
| `tok-6166f1a4fa92` | 13 | noncommercial educational planning evidence only |
| `tok-dd1eea95c2a3` | 12 | noncommercial educational planning evidence only |
| `tok-292c48eab8fb` | 11 | noncommercial educational planning evidence only |
| `tok-fb9a2ed877ae` | 8 | noncommercial educational planning evidence only |
| `tok-1fb8cc9987d7` | 7 | noncommercial educational planning evidence only |
| `tok-663d95d67734` | 7 | noncommercial educational planning evidence only |
| `tok-8dc563525306` | 7 | noncommercial educational planning evidence only |
| `tok-f6281bedc002` | 7 | noncommercial educational planning evidence only |
| `tok-83eb6d219c1c` | 6 | noncommercial educational planning evidence only |
| `tok-9cf963c5483d` | 6 | noncommercial educational planning evidence only |

Cleared row count for this planning boundary: 17.

Cleared occurrence count for this planning boundary: 259.

Rows cleared for NC storage/display/public/answer behavior: 0.

## Required Controls

The NC/Klein map remains WARN-accepted only if all controls below remain true:

- `derived_from_nc=true` remains attached to each row.
- `license_group=CC_BY_NC` or equivalent NC license group remains attached to each row.
- `commercial_export_allowed=false` remains attached to each row.
- `commercial_export_prohibited=true` remains preserved at family/map level.
- `attribution_required=true` remains attached to each row.
- `corpus_contamination=false` remains attached to each row.
- NC rows remain row-scoped and do not contaminate commercial-clean candidates.
- NC rows remain non-public planning rows only.
- NC definition-content storage remains false.
- Storage/display/transformed reader-hint authorization remains false.
- Public/runtime mutation remains false.
- Answer emission and answer eligibility remain false.
- Any later NC display must include a separate owner/license-policy boundary and an Agent 6 docket naming allowed display fields, attribution text/link, noncommercial-only limits, commercial-export exclusion, and export filtering controls.

## Warning Rationale

This is WARN rather than PASS because the rows are CC BY-NC-derived and require stricter containment. Metadata-only / external-link-only planning is acceptable under this docket, but any display/storage/export behavior would create legal/provenance risk and remains blocked.

## Remains Blocked

- NC definition-content storage remains blocked.
- Noncommercial display remains blocked until a later exact Agent 6 plus owner/license-policy boundary.
- Public/runtime mutation remains blocked.
- Answer eligibility and answer emission remain blocked.
- Route-shard edits remain blocked.
- Commercial export for NC rows remains blocked.
- Source/provenance acceptance and license acceptance remain unaccepted beyond this exact row-scoped planning boundary.
- BDB Augmented Strong remains blocked pending independent custody evidence.
- Remaining no-hit/unusable rows remain blocked.
- Definition authority, accepted gloss/text, publication readiness, product/data acceptance, and public reader output remain blocked.

## Agent 8 Callback

Disposition: WARN-ACCEPTED for exact Orot NC/Klein source-family map as row-scoped noncommercial educational planning evidence only.

Docket path: `reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md`

Next executable route: Agent 10 / Agent 1 may preserve the 17 Klein / CC BY-NC rows as non-public `noncommercial_educational_candidate` planning rows with metadata-only / external-link-only posture. Any NC definition-content storage, noncommercial display, public/runtime behavior, answer use, route-shard mutation, or export behavior requires a later Agent 6 plus owner/license-policy boundary.

What must not be accepted: QA acceptance beyond this docket, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, public mutation, route shard edit, runtime mutation, source mutation, token-index mutation, lexical-payload mutation, NC definition-content storage, noncommercial display authorization, commercial export authorization for NC rows, or answer eligibility.
