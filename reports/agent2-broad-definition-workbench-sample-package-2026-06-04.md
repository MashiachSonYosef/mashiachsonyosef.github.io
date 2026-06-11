# Agent 2 Broad Definition Workbench Sample Package - 2026-06-04

Status: `packaged_non_authoritative_route_shape_reader_planning_evidence`.
Active mode: `BROAD_CORPUS_EXPANSION`.

## Compact Route Shape

| Field | Value |
| --- | --- |
| lane | Agent 2 broad lexical / definition / lemma / reader-hint |
| returned artifact consumed | `reports/spark2-broad-definition-workbench-sample-refresh-2026-06-04.md` |
| package artifact | `reports/agent2-broad-definition-workbench-sample-package-2026-06-04.md` |
| current output artifact | `data/definitions/definition-workbench-sample.json` |
| next definition/lemma/reader-hint workset | `no_queued_item` |
| wake condition | New exact broad definition/lemma/reader-hint queue item exists with target workset, inputs, commands, output path/schema, and validator. |

## Boundary Proof

- Agent 7 delivery proof: `reports/agent7-agent6-broad-definition-workbench-sample-delivery-proof-2026-06-04.md`
- Agent 6 verdict: `reports/agent6-broad-definition-workbench-sample-boundary-verdict-2026-06-04.md`
- Agent 6 disposition observed locally: `WARN-ACCEPTED` for the exact 200-row Definition Workbench sample as non-authoritative route-shape / reader-planning evidence only.

If a relay says the verdict is still pending, that wording is stale relative to the current local artifact set: the Agent 6 verdict file is present in this workspace.

## Inputs Consumed

- `.local-cache/workbench-evidence/token-inventory.json`
- `data/definitions/hud-route-lookup/manifest.json`
- `data/definitions/definition-workbench-sample.json`
- `reports/definition-workbench-sample-report.md`
- `reports/spark2-broad-definition-workbench-sample-refresh-2026-06-04.md`
- `reports/agent7-agent6-broad-definition-workbench-sample-delivery-proof-2026-06-04.md`
- `reports/agent6-broad-definition-workbench-sample-boundary-verdict-2026-06-04.md`

## Counts

- Sample rows: 200.
- Rows with route cards: 200.
- Rows without route cards: 0.
- Rows with complete source/license rows: 200.
- Multi-answer rows: 96.
- Status counts: `conflicting=96`, `proposed_only=49`, `single_answer_source_complete=55`.
- Review status counts: `unreviewed_machine_sample=200`, `verified=0`.
- Route lookup distinct normalized tokens in input manifest: 175216.
- Route lookup cards in input manifest: 539661.
- `usage_link_count` null / not joined rows: 200.

## Validator / Gate

Command:

`node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample.json`

Result:

`Definition Workbench sample validation passed. Rows: 200.`

`missing_pipeline_blocker`: none for the returned sample refresh.

## Semantics Preserved

- `status` is machine route-shape status, not reviewed lexical authority.
- `single_answer_source_complete` is not a verified definition, answer, accepted gloss, or publication claim.
- `review_status=verified` is not emitted.
- `answer_card_ids`, `answer_card_count`, and `distinct_answer_definition_count` are evidence/card identifiers and counts only.
- `source_license_complete=true` is a completeness indicator only, not source/provenance or license acceptance.
- `conflicting` / `multi_answer=true` rows remain warnings and cannot be collapsed into hidden winners.
- `proposed_only` rows remain proposed-only.

## Stop Condition

Stop after this compact Agent 2 package because the returned 200-row sample has been consumed, packaged, and validator-confirmed.

## What Remains Blocked

- Full Definition Workbench index.
- Reviewed lexical authority.
- Answer eligibility or answer acceptance.
- Accepted gloss/text.
- Public reader output.
- Public/runtime mutation.
- Route-shard edit.
- Route publication support.
- Source/provenance/license acceptance.
- QA acceptance beyond the Agent 6 non-authoritative evidence docket.
- Publication readiness.

## Boundary

This package is non-authoritative route-shape / reader-planning evidence only. It creates no QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, no route publication support, no accepted gloss/text, no public reader output, no route-shard edit, and no public/runtime mutation.

Publication remains `blocked_no_render`.
