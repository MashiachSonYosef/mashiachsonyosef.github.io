# Agent 2 Old-Dictionary Excluded Row Lane Reaudit Blocker

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Workset: `old-dictionary-excluded-row-license-lane-reaudit`

## Target

Prepare Agent 2 to consume old excluded dictionary rows only after Agent 1 source-family / license-lane assignment exists.

Agent 2 must preserve actual dictionary lanes. It must not recast all new/missed dictionaries as NC and must not treat all old excluded rows as truly blocked without Agent 1 source/license/custody evidence.

## Policy Inputs

- `reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md`
- `reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`

Presence check:

- NC educational owner policy: present.
- New dictionary source lane policy: present.
- Dictionary lane classification correction: referenced by Oracle 9; Agent 2 should preserve it if present in current worktree.

## Required Agent 1 Lanes

Agent 2 may consume only rows classified by Agent 1 into one of:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

Lane preservation rules:

- `commercial_clean_candidate` rows go only to commercial-clean export/candidate lanes.
- `noncommercial_educational_candidate` rows go only to the separate NC educational export/candidate lane.
- `metadata_or_link_only` rows may produce citation/link-only planning output, no definition text.
- `blocked_or_needs_review` rows stay out of candidate text exports.

## Required Fields For Agent 2 Consumption

Each row/subset needs:

- `source_family`
- `source_name`
- `source_or_dictionary`
- `license_label`
- `license_lane`
- `source_url_or_citation`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `owner_use_attestation` when NC educational use is the basis
- `corpus_contamination=false` for NC lane
- `agent6_boundary_required`
- `agent1_classification_artifact`

NC row required flags:

- `license_lane=noncommercial_educational_candidate`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`
- `answer_eligible=false`
- `public_emit=false`

## Current Agent 2 Pipeline State

Orot missed-dictionary candidate pipeline now has a source-family lane preflight:

- Builder: `scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`
- Validator: `scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`
- Current output: `reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json`
- Current rows: 0.
- Current occurrences: 0.
- Current unmatched: 168.
- Source-family preflight required: true.
- Candidate rows checked: 0.
- Missing classified rows: 0 because no candidate rows are emitted on current inputs.
- Candidate text export blocked for unclassified non-zero rows: true by builder gate.

Current validator:

```text
Agent 2 Orot missed-dictionary reader-hint candidate validation passed for reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json. Rows: 0; occurrences: 0.
```

## Exact Blocker

`missing_agent1_old_dictionary_excluded_row_license_lane_assignment`

Agent 2 cannot transform old excluded rows into definition/reader-hint candidate text until Agent 1 supplies source-family / license-lane assignment for the exact row/subset.

Missing upstream evidence:

- source/dictionary list for old excluded rows;
- row/subset counts by source/dictionary;
- Agent 1 lane assignment artifact;
- row-level required fields listed above;
- Agent 6 row/subset boundary question.

## Needed Agent 1 Handoff

Expected Agent 1 artifact should provide:

- workset id: `old-dictionary-excluded-row-license-lane-reaudit`;
- source/dictionary names;
- row/subset counts;
- lane counts by `commercial_clean_candidate`, `noncommercial_educational_candidate`, `metadata_or_link_only`, and `blocked_or_needs_review`;
- required row fields;
- evidence paths;
- NC flags where applicable;
- statement that Agent 2 must preserve lanes without recasting.

## Spark-1 Handoff

Do not route Spark-1 to generate Agent 2 candidate rows from old excluded dictionaries until Agent 1 lane assignment exists.

Spark-1 may mechanically run the Agent 2 Orot missed-dictionary pipeline only after a classified input is supplied. If unclassified non-zero rows are encountered, the builder must stop with the source-lane blocker.

## Agent 6 Boundary

No Agent 6 acceptance is requested now.

Future Agent 6 question must be row/subset specific:

May these exact Agent-1-classified rows be used/stored/displayed within their assigned lane, preserving commercial-clean separation, NC educational flags, metadata/link-only no-text restrictions, blocked/review exclusion, zero answer eligibility, and zero public emit?

Agent 2 does not answer that question.

## Stop Condition

Stop after recording the exact Agent 1 lane-assignment blocker for old excluded dictionary rows.

## Non-Acceptance Boundary

No Definition authority, source/license/legal acceptance, answer acceptance, answer eligibility, accepted gloss/text, public output, NC commercial authorization, publication readiness, route publication support, product/data acceptance, route-shard edit, or public/runtime mutation is claimed.
