# Agent 1 Broad Source Mechanics Queue Package - 2026-06-04

Status: `agent1_broad_source_mechanics_queue_package_validated_inputs_ready_for_boundary_only`.

## Target

queue item: `spark1-broad-source-mechanics`

lane: Agent 1 / Spark-1 source/license/custody.

## Commands

```powershell
node scripts/build_agent1_orot_fill_source_row_evidence.mjs
node scripts/validate_agent1_orot_fill_source_row_evidence.mjs
node scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs
node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json
```

The fill source-row builder printed `ok=true` and wrote output, but the shell process timed out after output. The validator confirmed the artifact with `ok=true`.

## Source-Row Evidence

- artifact: `reports/agent1-orot-fill-source-row-evidence-2026-06-03.json`
- status: `pipeline_source_rows_clear`
- target rows: `4`
- chunk entries: `17`
- token occurrences: `19`
- incomplete curated rows attached: `0`
- targets with expected clean source-layer row: `4`
- route lookup shard hits: `0`

Lane classification: OpenScriptures `CC BY 4.0` and Wikidata `CC0` are recorded as `commercial_clean_candidate` evidence only, with `agent6_boundary_required=true` and `commercial_export_allowed=false` until boundary.

## Missing Linkage Evidence

- artifact: `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json`
- status: `evidence_only_candidate_buckets_no_source_mutation`
- missing linkage rows / occurrences: `13` / `129`
- bucket counts: `no_current_stem_source_candidate_found=3`, `single_stem_candidate_found_current_pipeline=6`, `project_preferred_function_word_stem_candidate_exists=3`, `multi_stem_no_project_preferred_candidate=1`
- lane: `metadata_or_link_only`
- exact blocker: no approved source/linkage rule exists here for assigning missing `lexicon_entry_id` values

## Export Rule

- commercial-clean export excludes NC rows
- NC educational export is separate
- metadata/link-only emits citation/link only
- blocked/review emits no candidate text

## Handoff

Spark-1 handoff: queue item has validated evidence outputs; no new Spark-1 run is needed until a changed source/license/custody command-backed workset exists.

Agent 6 boundary: required before any package/export/display/public/answer behavior; this packet is evidence only.

## Boundary

No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, or public/runtime mutation.
