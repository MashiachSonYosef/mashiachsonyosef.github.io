# Agent 2 Wartime Definition/Route Self-Audit - 2026-06-02

## Delivery Proof

- Direct prompt received for Agent 2 wartime long-running goal and self-audit.
- Target thread: `019e027b-7533-7272-9474-7abaf8712b29`.
- Delivery mode cited by prompt: `non-interrupting direct_bounded_worker_prompt_delivery` under explicit user/Agent 7 wartime override.
- Output artifact: `reports/agent2-wartime-definition-route-self-audit-2026-06-02.md`.
- Highest permissible claim in this artifact: Definition/route/reader-understanding self-audit and bounded evidence prepared for candidate public reader surfaces.

## Boundary

This artifact is evidence-ready only. It does not accept QA, Definition authority, usage-as-definition authority, route publication support, source/provenance custody, public/runtime acceptance, publication readiness, product/data acceptance, translation output, accepted gloss, or accepted translation text.

Publication remains `blocked_no_render`.

## Control-State Audit

- `reports/agent2-state.md`: missing in the current checkout.
- `data/control/agent_goal_board.json`: Agent 2 goal `agent2-definition-status-semantics` is `awaiting-Agent-6`, QA-relevant, and acceptance owner is Agent 6.
- `data/control/agent_goal_board.json`: Agent 2 current boundary says the Definition Workbench sample has an Agent 6 WARN because machine-derived `verified` overclaimed reviewed authority; route data remains warning-pass only and is not publication support.
- `data/control/agent_registry.json`: Agent 2 target is `019e027b-7533-7272-9474-7abaf8712b29`, lane is `definition_route_data_and_public_lookup`, manager is Agent 10, and organization state is conditional wake-only.

## Agent 6 Boundary Audit

- `reports/agent6-definition-workbench-sample-verdict-2026-06-01.md`: machine shape passed for 200 rows, but UI/authority use was blocked because earlier `verified` meant a machine heuristic, not reviewed lexical authority.
- `reports/agent6-definition-workbench-sample-verdict-2026-06-01.md`: Agent 6 acceptance condition was to rename machine-derived `verified` to a non-review label such as `single_answer_source_complete`, or add a separate `review_status` field reserving `verified` for reviewed lexical authority.
- Current `data/definitions/definition-workbench-sample.json`: the data-contract fix is present. Counts are 200 rows, status counts `conflicting=96`, `proposed_only=49`, `single_answer_source_complete=55`, review status counts `unreviewed_machine_sample=200`, multi-answer rows `96`, and source/license complete rows `200`.
- `reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md`: Agent 3 usage/navigation evidence is WARN-accepted only as queue-ready planning evidence. It is not Definition authority, route ranking, semantic arbitration, public/runtime use, publication support, or accepted translation text. Agent 2 must not consume Agent 3 usage rows as route payloads or answer authority.

## Candidate Surface Audit

Evidence source for public-HUD candidate artifacts: `origin/main` commit `62c64fb303e13ef84e22d6cbf56e2a2c85c04499`. Current local HEAD is `28dfb9eec118dafaf744974e8b0fb4376d035600`; local HEAD does not contain `data/public-hud/**`, so this audit inspected `origin/main` objects directly without changing the worktree.

- Root navigation slice: `origin/main:index.html` contains 10 Route HUD work-card links: Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Ruth, Jonah, Amos, Zechariah, and Zephaniah. This is navigation evidence only, not Definition authority or runtime acceptance.
- `data/public-hud/genesis/**`: one bounded sentinel token, 3,858 reader hints, 48 route cards, 2 answer-eligible cards, 88 source rows, 0 missing route-card source rows, 0 missing source/license fields, page config points only to `data/public-hud/genesis/**`, and old-HUD marker scan found 0 hits.
- `data/public-hud/exodus/**`: one bounded sentinel token, 5,831 reader hints, 52 route cards, 1 answer-eligible card, 92 source rows, 0 missing route-card source rows, 0 missing source/license fields, page config points only to `data/public-hud/exodus/**`, and old-HUD marker scan found 0 hits.
- `data/public-hud/leviticus/**`: one bounded sentinel token, 3,869 reader hints, 46 route cards, 1 answer-eligible card, 86 source rows, 0 missing route-card source rows, 0 missing source/license fields, page config points only to `data/public-hud/leviticus/**`, and old-HUD marker scan found 0 hits.
- `data/public-hud/numbers/**`: one bounded sentinel token, 5,204 reader hints, 20 route cards, 1 answer-eligible card, 33 source rows, 0 missing route-card source rows, 0 missing source/license fields, page config points only to `data/public-hud/numbers/**`, and old-HUD marker scan found 0 hits.
- Reader-hint labels for all four audited surfaces are consistently non-authoritative: `publication_status=not_a_translation`, `status=reader_hint_not_translation`, and `candidate_status=candidate_not_authority`.
- Mojibake scan over parsed JSON strings for the four audited public-HUD candidate sets found 0 samples by codepoint scan. Earlier PowerShell display mojibake should be treated as terminal rendering unless byte-level or parser-level evidence says otherwise.

## Drift / Overclaim Findings

### PASS-LIMITED: machine-derived `verified` overclaim fixed in current sample contract

The current tracked Definition Workbench sample no longer emits machine-derived `status=verified` or `review_status=verified`. It uses `status=single_answer_source_complete` for the 55 single-answer/source-complete rows and `review_status=unreviewed_machine_sample` for all 200 rows.

This is not Agent 6 acceptance. The Agent 2 goal board still records the lane as `awaiting-Agent-6`.

### WARNING: citable paraphrase route cards still use `candidate_status=accepted`

The public-HUD route-card shards and local route lookup samples still contain `candidate_status=accepted` on citable paraphrase evidence cards:

- Genesis public-HUD route shard: 40 occurrences.
- Exodus public-HUD route shard: 40 occurrences.
- Leviticus public-HUD route shard: 40 occurrences.
- Numbers public-HUD route shard: 13 occurrences.
- `data/definitions/hud-route-lookup-sample.json`: 160 occurrences.
- `data/definitions/hud-route-store-sample.json`: 160 occurrences.

These cards are `answer_role=evidence` and are not answer-eligible in the inspected rows, but the word `accepted` is semantically risky in a reader/data-contract lane because it can be misread as accepted gloss, accepted translation, Definition authority, or QA acceptance.

Bounded fix proposal: rename this field/value away from acceptance language, for example from `candidate_status=accepted` to `candidate_status=citable_source_complete` or `candidate_status=citable_candidate_safe`, and reserve any `accepted` vocabulary for Agent 6-docketed acceptance only. Validators currently require `candidate_status=accepted` for citable paraphrase cards, so the validator must be updated together with the builder and regenerated bounded samples.

### WARNING: validator pass does not mean semantic acceptance

Current validators pass while preserving the `candidate_status=accepted` requirement. Therefore validator success is machine-shape evidence only. It does not clear the label-risk warning above.

## Validator Results

- `node --check scripts\validate_definition_workbench_sample.mjs`: passed.
- `node --check scripts\validate_definition_workbench_status_contract.mjs`: passed.
- `node --check scripts\validate_hud_route_lookup.mjs`: passed.
- `node --check scripts\validate_public_hud_route_lookup.mjs`: passed.
- `node scripts\validate_definition_workbench_sample.mjs`: passed, 200 rows.
- `node scripts\validate_definition_workbench_status_contract.mjs`: `pass_with_warnings`; rows 200; forbidden verified labels 0.
- `node scripts\validate_hud_route_lookup.mjs --fixtures-only`: passed.
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`: passed.

## Blockers

- `reports/agent2-state.md` is missing, so current Agent 2 state must be inferred from control files and reports.
- Agent 2 remains `awaiting-Agent-6`; this self-audit does not accept the Definition Workbench contract.
- `candidate_status=accepted` remains in route-card evidence layers and validator expectations; this should be renamed or separated before any reader-facing or authority-sensitive interpretation.
- Current local HEAD lacks `data/public-hud/**`; candidate-surface artifact checks for Genesis, Exodus, Leviticus, Numbers, and the 10-card root slice were performed against `origin/main`, not the local working tree.
- Exodus, Leviticus, and Numbers remain future/review-input surfaces unless Agent 6 dockets their bounded runtime evidence. Genesis is only WARN-accepted under its exact Agent 6 boundary.

## Next Bounded Action

Prepare a data-contract patch or proposal for the citable paraphrase `candidate_status=accepted` label:

- update route-card validators to reject acceptance-language candidate status outside Agent 6 acceptance context;
- update the route-card builder to emit a non-authority label;
- regenerate only bounded samples or a narrow fixture if full public-HUD regeneration is not permitted;
- submit as evidence-ready/awaiting-Agent-6, not acceptance.

## Agent 8 Callback

- status: self-audit artifact produced; one semantics blocker found.
- artifact: `reports/agent2-wartime-definition-route-self-audit-2026-06-02.md`
- blockers: missing `reports/agent2-state.md`; Agent 2 remains `awaiting-Agent-6`; `candidate_status=accepted` persists on citable paraphrase evidence cards and in validator expectations; local HEAD lacks `data/public-hud/**`.
- next action needed: bounded data-contract rename proposal/patch for citable paraphrase `candidate_status=accepted`, then Agent 6 queue framing.
- continue condition: continue only as evidence-ready Definition/route/reader-understanding support; do not claim QA acceptance, Definition authority, usage-as-definition authority, route publication support, public/runtime acceptance, publication readiness, accepted gloss, or accepted translation text.
