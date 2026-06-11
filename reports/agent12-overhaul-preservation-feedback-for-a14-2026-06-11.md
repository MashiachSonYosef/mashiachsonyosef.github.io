# A12 Overhaul Preservation Feedback For A14

Generated: 2026-06-11

Status: planning/spec preservation packet for A14 oversight.

Boundary: planning/spec feedback only. No release/publication/runtime/product acceptance, no source/license/legal/Definition/answer/accepted-text acceptance, no destructive repo action, no repo mutation, and no lower-agent work order by itself.

## Decision

Use `pipeline_preservation_manifest_v1` as the umbrella artifact before the overhaul changes working paths.

The manifest should preserve the current productive methods as executable contracts, then let the redesign convert them into goal-tree pipelines.

First included contracts:

- `book_page_contract_v1`
- `route_hud_contract_v1`
- `page_output_pipeline_v1`
- `render_intake_packet_v1`
- `crossmatch_packet_v1`
- `a3_phrase_abbrev_matrix_contract_v1`
- `source_lane_contract_v1`
- `definition_transform_readiness_packet_v1`
- `repo_clean_packet_v1`

## A10 Feedback

What must be preserved:

- A10 canonical page output as product behavior, not agent memory.
- Orot flagship, Ruth same-contract proof, and one hard TBD/lemma/morphology/crossmatch page.
- `book_page_contract_v1`, `route_hud_contract_v1`, `page_output_pipeline_v1`, and embedded `render_intake_packet_v1`.
- preHUD display gate.
- source/license inspectability.
- `% match` consistency.
- crossmatches as evidence/navigation.
- quiet TBD.
- no unsafe lemma/morphology/usage preHUD.
- explicit dirty buckets/pathspecs.
- exact timeout rules.
- no broad `git add -A`, no `reset --hard`, no blind deletion.

A10 concerns:

- Overhaul may preserve agent names but lose executable output paths.
- Specs may look elegant but still require a smart agent to interpret them.
- A3 crossmatch evidence may accidentally become definition/preHUD authority.
- Old dictionary/NC/source-lane planning evidence may get mixed into active output.
- Shared CSS/JS/HUD drift may hide inside page batches.

A10 implications:

- Start from product-output contracts, then map agents to them.
- Page/render package must name target page/work, inputs, command, timeout, expected outputs, changed-file buckets, validators, proof artifacts, blocker shape, next owner, and authority boundary.
- A10 owns package truth and boundary routing.
- A5 runs repeatable mechanics only when the packet is executable without interpretation.
- A4 validates changed outputs.
- A6 reviews boundary-sensitive evidence.
- A7/owner approves activation.

A10 A3 phrase/abbrev concern:

- A3 phrase/abbrev adoption is right if it stays evidence/searchability/crossmatch first.
- It should feed A10/A14/A2 as a matrix of route/search/dedupe candidates, not directly as preHUD definitions.
- Every candidate should carry source row, source family, license lane, candidate type, relation type, token/work refs, ambiguity state, and display-gate status.

A10 minimum safe artifact:

- `page_output_pipeline_v1` schema/golden-fixture packet.
- `a3_phrase_abbrev_matrix_contract_v1`.

## A13 Feedback

What must be preserved:

- A10 book/HUD/render standard.
- A14 gap/target/prototype method.
- A3 phrase/abbreviation crossmatch method.
- A1 old/new/missed dictionary source-lane contracts.
- A2 transform-readiness after source lanes.
- A4 changed-input validators.
- A5 clean packet/churn runner shape.
- A6 repo/evidence boundary dockets.
- A7 final activation gate.
- Exact commands, inputs, timeouts, output paths, validators, dirty buckets, blocker shapes, and authority boundaries.

A13 concerns:

- Working paths may be lost by converting them into role prose or agent hierarchy.
- Prototypes may be preserved without distinguishing A10 implementation-grade output from A14 exploratory output.
- Pipelines may remain too smart-agent-dependent.
- Every generated file must be born classified or blocked.

A13 implications:

Goal-tree frame:

`target -> input_manifest -> transform/run command -> output artifact -> validator -> clean classification -> gate`

Agent/control tree stays as guardrail only.

Each preserved path needs:

- typed packet schema;
- golden examples;
- model floor;
- forbidden authority claims.

A13 A3 phrase/abbrev view:

- A3 phrase/abbrev packet is the right preservation model.
- It should become reusable `crossmatch_packet_v1` for phrase/abbrev/source-route work.
- It may feed A10/A14 render targets only after display-gate rules are explicit.

A13 minimum safe artifact:

- `pipeline_preservation_manifest_v1`.

Required included contracts:

- `book_page_contract_v1`
- `route_hud_contract_v1`
- `render_intake_packet_v1`
- `crossmatch_packet_v1`
- `source_lane_contract_v1`
- `definition_transform_readiness_packet_v1`
- `repo_clean_packet_v1`

## A12 Feedback

A12 agrees with A10 and A13, with one sequencing correction:

`pipeline_preservation_manifest_v1` should come first as the umbrella, while `page_output_pipeline_v1` and `a3_phrase_abbrev_matrix_contract_v1` should be the first two concrete preserved pipelines inside it.

Reason:

- A10 is right that visible page output needs immediate protection.
- A13 is right that the whole redesign can lose other productive paths if only render/page gets specified first.
- A14 should oversee the preservation map, not implement every pipeline.

A12 concerns:

- The overhaul could accidentally recreate the old agent/control tree with better names.
- A14 oversight could drift into implementation ownership.
- A10 could remain overloaded if render/page contracts are incomplete.
- A5 could become a churner before packets are executable.
- A6 could be asked for approval instead of evidence/repo dockets.
- A7 approval/final gate could be bypassed by "validated" evidence language.
- A3 phrase/abbrev crossmatch could become preHUD/definition authority unless `display_gate_status` and `evidence_only_reason` are required fields.
- Preservation notes could become shelfware unless each preserved path has a runnable packet schema and golden fixture.

A12 required manifest fields:

`pipeline_id | target_output | canonical_artifacts | input_manifest | commands | timeouts | expected_outputs | dirty_buckets | validators | proof_artifacts | blocker_shape | owner_slot | model_floor | next_owner | gate | forbidden_authority_claims | stop_condition`

A12 recommended first two entries:

1. `page_output_pipeline_v1`
   - includes `book_page_contract_v1`, `route_hud_contract_v1`, and `render_intake_packet_v1`.
   - protects visible output and lets A5 run render mechanics without inventing page behavior.

2. `crossmatch_packet_v1`
   - includes `a3_phrase_abbrev_matrix_contract_v1`.
   - protects the A3/A14 phrase-abbreviation method and prevents recurrence/crossmatch knowledge from being lost.

## A14 Oversight Role

A14 should oversee:

- product-output target shape;
- golden fixture selection;
- prototype-vs-production distinctions;
- missing fields in pipeline specs;
- whether the preserved pipeline is executable by A5 or a weaker model;
- whether the output remains owner-visible and useful.

A14 should not:

- implement all pipelines;
- approve release/publication;
- replace A10's implementation standard;
- bypass A1/A6/A7 boundaries;
- convert crossmatch/source evidence into definitions;
- route lower-agent work from this preservation packet alone.

## Stop Condition

Stop when A14 has a `pipeline_preservation_manifest_v1` draft that contains:

- A10/A13/A12 feedback;
- canonical working paths;
- golden fixtures;
- page/HUD contracts;
- render intake schema;
- A3 phrase-abbrev matrix schema;
- dirty bucket rules;
- validators;
- authority boundaries;
- exact blocker names;
- model floor per pipeline.

If any path cannot be written so A5 or a weaker model can run it without interpretation, mark:

`spec_incomplete`

