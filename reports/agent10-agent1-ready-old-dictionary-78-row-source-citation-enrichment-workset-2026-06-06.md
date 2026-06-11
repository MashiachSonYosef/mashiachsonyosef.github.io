# Agent 10 -> Agent 1 Old-Dictionary 78-Row Source Citation Enrichment Workset

Generated: 2026-06-06T04:58:00Z

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Target Package

`old-dictionary-commercial-clean-78-row-source-citation-enrichment`

## Files Used

| file | role |
|---|---|
| `reports/agent10-old-dictionary-78-row-agent2-transform-output-blocker-consumption-2026-06-06.json` | Agent 10 consumed Agent 2 blocker |
| `reports/agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json` | exact missing field/rule blocker |
| `reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json` | exact 78-row anchor |
| `reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json` | row metadata and source IDs/headwords |
| `reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json` | source lane handoff |

## Workset

Agent 1 should produce row-level source citation enrichment for the exact `78` queue IDs / `1461` occurrences only.

Required output fields:

`queue_id | token_id | lexicon_entry_id | source_license_lane | source_family_hits | source_rids | source_headwords | source_citation_or_url | citation_basis | attribution_required | derived_from_nc | commercial_export_allowed | corpus_contamination | source_acceptance_claimed | agent6_boundary_required`

Required rules:

- rows exactly `78`;
- occurrences exactly `1461`;
- `source_license_lane=commercial_clean_candidate`;
- `source_citation_or_url` must be row-level and non-empty, or exact missing citation blocker per row/subset;
- `source_acceptance_claimed=false`;
- `agent6_boundary_required=true`;
- no Definition authority;
- no source/provenance or license/legal acceptance;
- no candidate text, definition text, lemma text, reader-hint text, answer, route write, public/runtime mutation, export, publication readiness, or release action.

## Exact Blocker If Unavailable

Return `missing_source_citation_or_url_for_78_row_subset` with exact row/subset counts and the missing evidence path/field.

## Next Owner

Agent 1 returns source-citation enrichment or exact blocker. Agent 10 consumes it, then returns to Agent 2 only if `source_citation_or_url` is supplied for the exact 78 rows.

## Stop Condition

Stop after source-citation enrichment or exact blocker. Do not mutate public/runtime files, route shards, source files, token indexes, lexical payloads, candidate text, definition content, accepted text, export files, publication state, or release state.

