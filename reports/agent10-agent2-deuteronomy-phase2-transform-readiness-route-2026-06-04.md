# Agent 10 To Agent 2 Deuteronomy Phase-2 Transform Readiness Route

Date: 2026-06-04

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE` with two primary Sparks.

## Objective

Produce a non-public Deuteronomy transform/readiness matrix, or exact blocker, over the Agent10-prepared downstream workset.

This is not an answer, definition, public HUD, route-shard, runtime, publication, or accepted-text route.

## Input Workset

Primary workset:

- `reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.md`
- `reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json`

Source matrix:

- `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md`
- `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json`

Spark-1 run/check proof:

- `reports/spark1-deuteronomy-phase2-linkage-dedupe-source-route-run-2026-06-04.md`

Agent 10 consumption:

- `reports/agent10-deuteronomy-phase2-release-intake-consumption-2026-06-04.md`

## Scope

Exact scope:

- Rows / occurrences: `1334` / `2964`
- Work: `tanakh/deuteronomy`
- Current lane count: `1334` commercial_clean_candidate rows / `2964` occurrences
- Current NC educational rows: `0` / `0`
- Current public/runtime/output/answer/definition/accepted-text emissions: `0`

Agent 2 task:

- Inspect only the exact `1334` rows / `2964` occurrences in the workset.
- Produce a non-public transform/readiness matrix or exact blocker.
- Preserve per-row source-family lane fields and evidence.
- Preserve row/subset boundaries for any future Agent 6 packet.
- Keep all public/output/answer/definition/accepted-text counters at `0`.

## Required Source-Lane Gate

Policy artifacts:

- `reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md`
- `reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`
- `reports/agent12-agent8-nc-csv-separation-cap-rule-2026-06-04.md`
- `reports/agent12-agent8-nc-educational-lane-cap-delta-2026-06-04.md`

Rules:

- New/missed dictionaries are not presumed NC.
- Old excluded dictionary rows are not presumed blocked.
- Agent 1 owns source-by-source and row-subset lane classification.
- Agent 2 must preserve source-family lanes: `commercial_clean_candidate`, `noncommercial_educational_candidate`, `metadata_or_link_only`, `blocked_or_needs_review`.
- Commercial-clean and NC educational rows must remain separate in any future CSV/export partition.
- Metadata/link-only rows do not emit definition text.
- Blocked/review rows stay out of candidate text exports.
- Spark output is evidence, not permission.

Required row fields to preserve when present:

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `owner_use_attestation`
- `corpus_contamination`
- `source_url_or_citation`
- `agent6_boundary_required`

## Expected Output

Suggested Agent 2 artifacts:

- `reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md`
- `reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json`

Required output shape:

- exact input artifact paths;
- row and occurrence counts;
- counts by source lane;
- counts by transform/readiness class;
- blocked rows and blocker reasons;
- any rows requiring morphology, source/license, or conflict review;
- zero public HUD rows;
- zero route JSONL rows;
- zero route shard writes;
- zero runtime/source/token-index/lexical payload edits;
- zero answer rows;
- zero definition-content rows;
- zero accepted-text rows;
- exact Agent 6 row/subset question only if a future packet is ready.

## Stop Condition

Stop after Agent 2 returns:

- a non-public transform/readiness matrix for this exact `1334`-row / `2964`-occurrence workset; or
- exact blocker naming missing command, input, output, schema, source/license, morphology, conflict, or source-lane requirement.

## Agent 6 Boundary

No Agent 6 route is opened by this Agent 10 route packet.

Agent 6 is required only after Agent 2 returns a row/subset package proposing transform/display/source/license/Definition/public/runtime/answer use.

## Agent 8 Callback

Status: Agent 10 prepared the exact Deuteronomy phase-2 route packet for Agent 2.

Artifact path: `reports/agent10-agent2-deuteronomy-phase2-transform-readiness-route-2026-06-04.md`

Route request: send to Agent 2 / Definer lane.

Stop condition: Agent 2 returns transform/readiness matrix or exact blocker for `1334` rows / `2964` occurrences.

Highest permissible claim: Agent 10 prepared an exact non-public Agent2 route packet over the Deuteronomy phase-2 downstream workset.

What must not be accepted: no QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, answer eligibility, definition-content storage, or NC commercial authorization.

## Not Accepted

No QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, answer eligibility, definition-content storage, or NC commercial authorization.
