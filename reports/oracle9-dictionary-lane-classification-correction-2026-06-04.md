# Oracle 9 Dictionary Lane Classification Correction

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Role: Oracle-side owner policy preservation only.

## Correction

New and missed dictionary sources must not be presumed NC.

Old excluded dictionary rows must not be presumed truly blocked.

Every dictionary source and row subset requires source-by-source / row-subset classification by actual license and source-family evidence.

## Required Lanes

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## New / Missed Dictionary Rule

- Do not blanket-classify new dictionaries as NC.
- Only sources or rows that are actually NC enter `noncommercial_educational_candidate`.
- Commercial-clean sources remain commercial-clean when evidence supports that lane.
- Metadata/link-only and blocked/review lanes remain separate.

## Old Dictionary Re-Audit Rule

Useful workset name: `old-dictionary-excluded-row-license-lane-reaudit`

- Do not assume old excluded dictionary rows are truly blocked.
- Re-audit old dictionary sources and excluded rows for correct lane classification.
- Some old rows may belong in `noncommercial_educational_candidate`.
- Some old rows may be `commercial_clean_candidate`, `metadata_or_link_only`, or still `blocked_or_needs_review`, depending on evidence.
- Do not blanket-promote or blanket-block.

## Agent Requirements

Agent 1:
- Produce source-by-source / row-subset classification for old, new, missed, and excluded dictionary rows.
- Preserve exact evidence for why each source or row subset is commercial-clean, NC educational, metadata/link-only, or blocked/review.

## Intake Watch Result

Date: 2026-06-04 (release/package intake correction watch pass)

Source contracts reviewed:
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json`
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`

Mechanical checks run:
- Verify `license_lane` is emitted as one of:
  - `commercial_clean_candidate`
  - `noncommercial_educational_candidate`
  - `metadata_or_link_only`
  - `blocked_or_needs_review`
- Verify re-audit packet is source-family scoped and boundary-labeled.
- Verify no blanket conversion language is used in source-family lane assignment.

Findings:
- No new/missed dictionary row family was blanket-classified as `noncommercial_educational_candidate`.
  - `source_family_lanes` in the packet includes explicit mixed lanes:
    - `Jastrow Dictionary` → `commercial_clean_candidate`
    - `BDB Dictionary` → `commercial_clean_candidate`
    - `BDB Aramaic Dictionary` → `commercial_clean_candidate`
    - `Klein Dictionary` → `noncommercial_educational_candidate` (attestation required)
    - `BDB Augmented Strong` → `blocked_or_needs_review`
- No old excluded dictionary rows were blanket-marked blocked; source families were reclassified explicitly, including commercial-clean and NC candidate groups.
- No evidence of Agent 2 transform consuming rows before Agent 1 source-family classification for the reviewed packet:
  - Agent 2 readiness artifact status is `nonpublic_transform_readiness_matrix_pre_agent6_boundary`.
  - Deuteronomy transform artifacts remain pre-boundary planning posture in intake checks and contain evidence status rows, not consumed release-text outputs.

Correction posture for this watch:
- Keep lane values explicit and source/family-specific as listed above.
- Do not permit commercial export of noncommercial rows.
- Continue to route any downstream use through Agent 6 boundary review with zero-emission counters.

No acceptance claim is made in this correction pass.

Agent 2:
- Reconsider definition/reader-hint candidates only after Agent 1 reclassifies the source-family lane.
- Preserve lane flags downstream and must not recast all new dictionaries as NC.

## Export Rule

- Commercial-clean rows go to commercial-clean export.
- NC rows go to NC educational export with flags preserved.
- Metadata/link-only rows go to citation/link-only output.
- Blocked/review rows are excluded from candidate text export.

## Latest Intake Watch (2026-06-04T16:20:00Z)

Inputs and commands re-checked:
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.md`
- `scripts/build_spark10_release_package_intake.mjs`
- `scripts/validate_spark10_release_package_intake.mjs`

Mechanical findings for this watch:
- Missing-input / missing-pipeline blocker: none.
- No packet showed blanket `noncommercial_educational_candidate` assignment for new/missed dictionary rows without source/family evidence.
- No packet showed blanket `blocked_or_needs_review` assignment for old excluded dictionary rows without source/family re-audit evidence.
- No packet showed Agent 2-style transform rows before Agent 1 source-family lane evidence is present.

Required lane-form compliance remains:
- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## NC Flags Where Applicable

- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`

## Non-Acceptance Boundary

This is classification policy only. It does not claim source/license/legal acceptance, Definition authority, public/runtime mutation, accepted gloss/text, NC commercial authorization, or publication readiness.

## Spark-10 Watch Result (2026-06-04)

Artifact scanned:
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.md`
- `scripts/build_spark10_release_package_intake.mjs`
- `scripts/validate_spark10_release_package_intake.mjs`

Findings:
- No release-ready row in the current intake matrix was classified with an NC blanket on new/missed dictionary sources.
- No release-ready row in the current intake matrix was treated as blanket `blocked_or_needs_review` for old excluded dictionary rows.
- No release-ready row reclassified Agent-2 style transform material before Agent-1 source-family lane evidence existed.
- Current matrix status context:
  - `spark10-release-package-intake-matrix-current-2026-06-04.json` generated at `2026-06-04T14:04:04.253Z`
  - `missing_required_inputs: 0`
  - `release_relevant_rows: 2`
  - `agent6_handoff_candidates: 0`

Required lane form still enforced for downstream candidates:
- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

Next required packet for this watch pass:
- A changed Agent-1 source-family/lane assignment artifact that includes new, missed, and old excluded dictionary rows with exact `license_lane` and required per-row fields.
- Re-scan timestamp: 2026-06-04T15:48:15.152Z (matrix regenerated); findings unchanged: no NC-blanket on new/missed dictionary rows, no blanket blocked for old excluded dictionary rows, no Agent-2-style transform before Agent-1 lane evidence.
