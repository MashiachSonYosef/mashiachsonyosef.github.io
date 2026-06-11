# Agent 2 Orot Answer-Candidate / Disambiguation Packet - 2026-06-03

Status: bounded non-promoting Agent 2 packet for the current Orot fill blocker.

Highest permissible claim: this packet records answer-candidate repair requests and disambiguation blockers for top Orot gap tokens. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted translation text, or translation output.

## Inputs

- `.codex-tmp/hud-deploy-live/reports/agent10-orot-pipeline-answer-data-route-2026-06-03.md`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-top-gap-route-audit-2026-06-03.json`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-answer-contract-failure-audit-2026-06-03.json`

## Output

- `reports/agent2-orot-answer-candidate-disambiguation-packet-2026-06-03.jsonl`

Rows: `25`.

Answer-eligible rows: `0`.

Reason: the current audits do not justify a contract-safe reader-answer row. Existing route cards are evidence-only, form-reference, ambiguous, or absent. This packet is intentionally non-promoting so Agent 10 can audit the exact blocker without inheriting accepted text or public deploy changes.

## Packet Classes

- `answer_contract_repair_request`: existing route cards are present, but current cards do not satisfy the reader-answer contract.
- `disambiguation_evidence_packet`: multiple close answer candidates exist, and route data must separate them before a reader answer is selected.
- `route_row_gap_request`: no route cards exist for generated lookup candidates.

## Boundary Decision

This packet does not flip `answer_eligible` on existing `phrase_evidence`, `citable_paraphrase_evidence`, or `form_reference` rows.

Any future answer-row generation must happen through an authorized pipeline path that can provide:

- stable route/claim id
- Hebrew surface and normalized key
- answer-production route family/type
- renderable candidate text from source-backed pipeline evidence
- `candidate_status=accepted` only as local route-candidate status, not Definition authority
- `answer_eligible=true`
- `answer_role=answer`
- `boundary_safe=true`
- public source/license/citation rows

## Agent 10 Next Command

Agent 10 can audit this packet with:

```powershell
node scripts\audit_definition_route_claims.mjs --route-jsonl=reports\agent2-orot-answer-candidate-disambiguation-packet-2026-06-03.jsonl --output=reports\agent10-orot-agent2-answer-candidate-claim-audit-2026-06-03.json --report=reports\agent10-orot-agent2-answer-candidate-claim-audit-2026-06-03.md
node scripts\validate_definition_route_claim_audit.mjs reports\agent10-orot-agent2-answer-candidate-claim-audit-2026-06-03.json
```

Expected result: the claim audit should pass source/license and answer-safety shape checks, but it should report `0` answer-eligible rows. Therefore this packet alone should not increase Orot `final_hint_occurrences` above `40073`.

## Remaining Agent 2 Blocker

The next fill-producing Agent 2 step is a real pipeline generator or contract-authorized transform that emits source-backed answer rows, not this blocker packet. Without that generator, the current exact blocker remains: answer-candidate/disambiguation data is not yet present in a route-store-consumable source file.
