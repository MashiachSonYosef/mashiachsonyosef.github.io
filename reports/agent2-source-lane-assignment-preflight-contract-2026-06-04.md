# Agent 2 Source-Lane Assignment Preflight Contract

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Workset: `old-dictionary-excluded-row-license-lane-reaudit`

## Target

Provide an executable Agent 2 preflight validator for Agent 1 source-family / license-lane assignment packets before any definition/lemma/reader-hint candidate generation.

## Files

Script:

- `scripts/validate_agent2_source_lane_assignment_packet.mjs`

Policy inputs:

- `reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md`
- `reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`

Related blocker:

- `reports/agent2-old-dictionary-excluded-row-lane-reaudit-blocker-2026-06-04.md`
- `reports/agent2-old-dictionary-excluded-row-lane-reaudit-blocker-2026-06-04.json`

## Command

```powershell
node scripts/validate_agent2_source_lane_assignment_packet.mjs <agent1-lane-assignment-packet.json>
```

Current expected result until Agent 1 supplies the packet:

```text
missing_source_lane_assignment_packet
```

## Required Lanes

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## Required Row Fields

- `source_family`
- `source_name`
- `source_or_dictionary`
- `license_label`
- `license_lane`
- `source_url_or_citation`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `agent6_boundary_required`
- `agent1_classification_artifact`

NC rows also require:

- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`
- `answer_eligible=false`
- `public_emit=false`

## Candidate / Unmatched / No-Hint Counts

This preflight emits no candidate rows itself.

Current old-dictionary reaudit status:

- Agent 1 lane-assignment rows available to Agent 2: 0.
- Candidate rows produced from old excluded dictionaries: 0.
- Missing upstream workset: `old-dictionary-excluded-row-license-lane-reaudit`.

## Validator

The preflight validator checks:

- workset id is `old-dictionary-excluded-row-license-lane-reaudit`;
- rows exist under `rows`, `lane_rows`, or `classified_rows`;
- every row has required fields;
- every row uses one allowed lane;
- NC rows preserve NC educational flags;
- commercial-clean rows do not carry NC attestation;
- metadata/link-only rows do not allow definition text export;
- blocked/review rows do not allow candidate text export;
- lane counts reconcile when provided;
- forbidden authority/public/answer markers are absent.

## Missing-Field Blocker

`missing_agent1_old_dictionary_excluded_row_license_lane_assignment`

Required to unblock Agent 2 transform:

- Agent 1 packet path;
- source/dictionary names;
- row/subset counts;
- lane counts;
- required row fields;
- evidence paths;
- Agent 6 boundary question.

## Spark-1 Handoff

Spark-1 may run this validator mechanically after Agent 1 supplies a lane-assignment packet.

Spark-1 must not generate candidate rows from old excluded dictionaries if this preflight fails.

## Stop Condition

Stop after adding the preflight validator and recording the missing Agent 1 lane-assignment packet as the current blocker.

## Non-Acceptance Boundary

No Definition authority, answer acceptance, answer eligibility, accepted gloss/text, source/license/legal acceptance, public output, NC commercial authorization, publication readiness, route publication support, product/data acceptance, route-shard edit, or public/runtime mutation is claimed.
