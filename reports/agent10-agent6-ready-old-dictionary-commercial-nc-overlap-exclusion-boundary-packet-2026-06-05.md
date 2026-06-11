# Agent10 Agent6-Ready Boundary Packet: Commercial+NC Overlap Exclusion

Date: 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Review Scope

`nonpublic_commercial_nc_overlap_exclusion_planning_evidence_only`

Agent 6 question:

Pass/warn/block whether the exact Agent 1 commercial+NC overlap exclusion manifest may be carried as non-public overlap/exclusion planning evidence only for 197 overlap rows / 4185 occurrences, preserving NC separation and BDB Augmented Strong review blockers.

## Inputs

- `reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.md`
- `reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json`
- `reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-validation-result-2026-06-05.json`
- `reports/agent6-old-dictionary-boundary-question-packet-verdict-2026-06-05.md`
- `reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json`

Exact row payload remains in the Agent 1 manifest at:

- `commercial_nc_overlap_metadata_rows[]`
- `commercial_nc_without_bdb_augmented_strong_rows[]`
- `commercial_nc_with_bdb_augmented_strong_rows[]`
- `klein_only_excluded_rows[]`

This packet does not duplicate row payload.

## Counts

| field | value |
|---|---:|
| audited rows | 500 |
| audited occurrences | 8427 |
| commercial+NC overlap rows | 197 |
| commercial+NC overlap occurrences | 4185 |
| commercial+NC without BDB Augmented Strong rows | 57 |
| commercial+NC without BDB Augmented Strong occurrences | 818 |
| commercial+NC with BDB Augmented Strong rows | 140 |
| commercial+NC with BDB Augmented Strong occurrences | 3367 |
| Klein-only excluded rows | 17 |
| Klein-only excluded occurrences | 259 |
| pairwise Klein intersection count | 4 |
| exact Klein combination count | 7 |

## Lane Split

| lane | rows | occurrences | status |
|---|---:|---:|---|
| `commercial_clean_candidate` | 197 | 4185 | public-domain evidence exists; candidate use blocked pending source-family selection/exclusion boundary |
| `noncommercial_educational_candidate` | 197 | 4185 | Klein-bearing rows stay NC-preserved; no commercial authorization |
| `metadata_or_link_only` | 0 | 0 | not part of this packet |
| `blocked_or_needs_review` | 140 | 3367 | triple-overlap rows also carry BDB Augmented Strong review evidence |

Lane counts are overlap/presence counts and are not additive export rows.

## Exact Blockers

| blocker | owner | rows | occurrences |
|---|---|---:|---:|
| `commercial_nc_overlap_requires_agent6_source_family_selection_boundary` | Agent 6 | 197 | 4185 |
| `klein_nc_content_not_commercially_authorized` | Agent 6 | 197 | 4185 |
| `triple_overlap_also_requires_bdb_augmented_strong_source_custody_resolution_or_exclusion` | Agent 6 | 140 | 3367 |
| `metadata_only_no_definition_or_candidate_text` | Agent 1 | 197 | 4185 |

## Zero Counters

- Agent 6 delivery rows now in source artifact: `0`
- Agent 2 transform rows now: `0`
- candidate text rows now: `0`
- emitted answer rows now: `0`
- source rows emitted now: `0`
- answer eligible rows now: `0`
- queue/staging/render/release mutations: `0`

## Requested Carry

Only `carry_as_nonpublic_planning_evidence_only=true`.

Not requested and not authorized: commercial-clean selection, NC educational selection, BDB Augmented Strong exclusion acceptance, candidate use, transform, source-row emission, candidate text export, definition text storage, answer eligibility, public/runtime mutation, route-shard write, source/license/legal acceptance, commercial export, NC commercial authorization, or release action.

## Stop Condition

Stop at Agent6-ready packet unless and until Agent 6 returns an exact verdict. No source-family selection, exclusion, candidate use, transform, source-row emission, candidate text, output, public/runtime, answer, definition, export, or release step is authorized by this packet.

Highest permissible claim: Agent 10 prepared an Agent6-ready old-dictionary commercial+NC overlap exclusion boundary packet for non-public planning evidence only.

What must not be accepted: no QA/source/provenance/license/legal/source-family selection/Definition/runtime/publication/product/answer acceptance, no commercial-clean selection, no NC educational selection, no BDB Augmented Strong exclusion acceptance, no accepted gloss/text, no public reader output, no route-shard edit, no public/runtime mutation, no candidate text export, no definition-content storage, no commercial export permission, no NC commercial authorization, no release action.
