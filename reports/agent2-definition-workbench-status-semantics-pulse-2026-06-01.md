# Agent 2 Definition Workbench Status Semantics Pulse

Generated: 2026-06-01T10:43:36-04:00

## Scope

- Lane: Definition Workbench data semantics.
- Assignment: address Agent 6 WARN that machine-derived `verified` overclaimed reviewed lexical authority.
- Boundary: no UI assignment, no HUD rendering change, no publication claim, no accepted-definition claim.

## Disposition

The current tracked Definition Workbench sample contract already separates machine route-shape completeness from reviewed lexical authority.

- Machine route-shape status uses `single_answer_source_complete`, not `verified`.
- Machine sample rows carry `review_status=unreviewed_machine_sample`.
- `review_status=verified` is reserved for future reviewed lexical authority and is forbidden in this machine sample.
- `status=verified` is also forbidden for machine-derived sample rows.

## Contract Preservation

- `answer_role` remains part of the sample contract and answer cards require `answer_eligible=true` plus `answer_role=answer`.
- Source/license completeness remains checked from route card `source_rows`; current sample count is 200/200 complete.
- Multi-answer warnings remain visible; current sample has 96 `conflicting` rows and 96 `multi_answer=true` rows.
- The sample boundary still publishes counts, route/card IDs, and status metadata only. It publishes no definition text, no source excerpts, no translation text, and no publication readiness.

## Validator Results

- `node --check scripts\build_definition_workbench_sample.mjs`: passed.
- `node --check scripts\validate_definition_workbench_sample.mjs`: passed.
- `node --check scripts\validate_definition_workbench_usage_link_packet.mjs`: passed.
- `node --check scripts\validate_definition_workbench_usage_join_smoke.mjs`: passed.
- `node --check scripts\validate_definition_workbench_usage_agent6_packet.mjs`: passed.
- `node scripts\validate_definition_workbench_sample.mjs`: passed, 200 rows.
- `node scripts\validate_definition_workbench_usage_link_packet.mjs`: passed with 1 warning.
- `node scripts\validate_definition_workbench_usage_join_smoke.mjs`: passed.
- `node scripts\validate_definition_workbench_usage_agent6_packet.mjs`: passed.

## Known Risk

- The usage-link packet warning remains: the current 200-row Definition Workbench sample has no overlap with the selected Agent 3 usage token scope. This is a sample/coverage issue, not a reviewed-authority issue.
- `reports/agent6-definition-workbench-sample-verdict-2026-06-01.md` is stale for this specific point because it records the earlier `verified` overclaim. Treat this Agent 2 pulse and the current validators as the superseding data-contract disposition.
- Broad `git diff --check` still reports unrelated dirty-work failure in `reports/source-license-label-audit.md`; this pulse did not touch that file.

## Next Step

If Agent 5 wants a follow-up bounded task, expand or reseed the Definition Workbench sample so the usage-link packet has overlap with current Agent 3 usage tokens, while keeping the same status/review_status split.
