# Agent 3 Production-Shaped Provenance Navigation Package - 2026-06-04

Status: evidence-ready for Agent 10 / Agent 6 review queue only. No QA, source/provenance custody, license, Definition, runtime, product, public, accepted-gloss, translation, or publication acceptance is claimed.

## Scope

This package follows `reports/agent7-agent5-production-shaped-goal-map-2026-06-04.md` and `data/control/spark_standing_queue.json`.

Package class: provenance navigation packet.

Lane: Agent 3 usage/linkage/crossmatch/provenance-navigation evidence only.

Publication state: blocked_no_render.

## Validated Source Artifacts

- `reports/agent3-state.md`
- `reports/agent3-state.json`
- `data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json`
- `reports/agent3-definition-workbench-usage-collision-work-category-index-reshit.md`
- `data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json`
- `reports/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.md`
- `data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json`
- `reports/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.md`

## Counts

- Candidate package rows with stable token/source/work linkage: 96/96.
- Candidate package rows requiring exact linkage blocker: 0.
- Unique occurrence IDs: 96/96.
- Source URLs: 96/96.
- Local work anchors: 96/96.
- Phrase/context snippets: 96/96.
- License URLs: 96/96.
- Version titles: 96/96.
- Version sources: 96/96.
- Route-ID-only linkage rows: 96/96.
- Observed-usage-only labels: 96/96.
- Distinct source refs: 49.
- Distinct works: 24.
- Distinct categories: 8.
- Distinct licenses: 2.
- Distinct version sources: 22.
- Distinct Agent 2 route IDs: 1.
- Public Domain occurrence rows: 94.
- CC-BY-SA occurrence rows: 2.

## Boundary Counts

- Reader-facing rows: 0.
- Copied route payload field hits: 0.
- Forbidden authority field hits: 0.
- Source text reads: 0.
- Broad target expansion: 0.
- Queue mutations: 0.
- Submitted to Agent 6: 0.

## Commands Run

- `node scripts/build_agent3_usage_state.mjs`: pass_with_warnings; evidence 59/59; validators 31/31.
- `node scripts/validate_agent3_usage_state.mjs`: passed; evidence artifacts 59/59; validators 31/31; smoke failed 0.
- `node scripts/build_agent3_definition_workbench_usage_collision_work_category_index.mjs`: evidence-ready; categories 8; works 24; category-license rows 8.
- `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_index.mjs`: passed; categories 8; works 24; category-license rows 8.
- `node scripts/build_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs`: evidence-ready; rows 96; anchors 96/96.
- `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs`: passed; rows 96; anchors 96/96.
- `node scripts/build_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs`: evidence-ready; rows 96; licenses 2; version sources 22.
- `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs`: passed; rows 96; licenses 2; version sources 22.

## Spark Queue Findings

`spark-oracle9-missed-dictionary-evidence-diff`

Status: missing_pipeline_blocker.

Inputs: 2/2 present.

Needed command: named existing command to diff Oracle 9 missed-dictionary evidence against current Orot candidate queues.

Needed output: missed-dictionary evidence diff.

Blocker: the required inputs exist, but none of the eight allowed Agent 3 commands produces a missed-evidence diff.

`spark5plus-continuation-dedupe`

Status: missing_pipeline_blocker.

Inputs: rules file present, 33 continuation reports found, 97 Agent 5 relay messages found.

Needed command: named existing command to dedupe spark5-plus continuation outputs and Agent 5 continuation relay messages.

Needed output: deduped continuation index.

Blocker: the named inputs exist, but none of the eight allowed Agent 3 commands produces a continuation dedupe index.

## Consumer Boundary

This packet is navigation evidence only. It links occurrence/source/work/license/version-source/context fields and Agent 2 route IDs. It does not copy Agent 2 definition payloads, rank routes, select Definition answers, accept source/provenance custody, emit translations, accept text, or make any publication claim.
