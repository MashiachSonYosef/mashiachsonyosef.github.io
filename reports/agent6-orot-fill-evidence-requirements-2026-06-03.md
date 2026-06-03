# Agent 6 Orot Fill Evidence Requirements - 2026-06-03

Authority: Agent 6 QA gate.

Scope: minimum evidence packet required before Agent 10 may route any Orot fill package for pass/warn/block review.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.

## Inputs Reviewed

- `reports/agent10-team-release-operating-plan-2026-06-03.md`
- `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.md`
- `.codex-tmp/hud-deploy-live/reports/agent10-deuteronomy-stage-b-top6000-cap3-route-package-proof-2026-06-03.md`

## Current Orot State

Agent 10 identifies Orot Stage F as the flagship public surface:

- Existing hints: `8729`.
- Existing hinted occurrences: `40073`.
- Remaining gap tokens: `8578`.
- Remaining gap occurrences: `19733`.

Agent 2's full queue is non-promoting:

- `route_cards_without_answer_eligible`: `4337` tokens / `10340` occurrences.
- `ambiguous_answer_candidates`: `2836` tokens / `7559` occurrences.
- `no_route_cards`: `1405` tokens / `1834` occurrences.
- Emitted answer-eligible fill rows: `0`.
- Blocker: no existing transform was identified that consumes the Orot full gap audit and emits contract-safe answer-candidate route rows without new authority or manual definition invention.

## Minimum Packet Required Before Agent 6 Review

Agent 10 may not route an Orot fill package for Agent 6 pass/warn/block review until the packet includes all of the following evidence.

1. Fill-producing transform evidence

   - Path to the Agent 2 transform or dry-run transform spec.
   - Exact input artifacts and sha256 values, including the Orot full gap audit and any source/route inputs.
   - Exact output path for route-claim rows.
   - Proof that rows are pipeline-generated, not manual definitions or manual semantic selections.
   - Explicit row count and bounded pilot size, preferably top-50 or top-100 unless Agent 12 has cleared a larger scope.

2. Route-claim row schema evidence

   Every candidate answer row must carry machine-checkable fields proving:

   - token id and lookup key.
   - source surface and normalized form.
   - route candidate id or generated claim id.
   - `answer_eligible=true` only when produced by the approved transform.
   - `answer_role=answer` only when contract-safe.
   - source id, source name, source URL or citation locator, and license.
   - non-authority boundary fields showing the row is reader-HUD/workbench evidence only.
   - candidate status or confidence basis, without claiming accepted text or unique semantic truth.

3. Source/provenance blocker evidence

   - Agent 1 source blocker/exclusion map for the covered Orot rows.
   - Explicit exclusion of known incomplete curated rows unless Agent 1 separately clears them:
     - `curated|lex-aph-h639|source metadata incomplete`
     - `curated|lex-mashiach-h4899|source metadata incomplete`
     - `curated|lex-ruach-h7307|source metadata incomplete`
     - `curated|lex-yhwh-h3068|source metadata incomplete`
   - Count of included rows, excluded rows, and rows still blocked by source/license/citation gaps.
   - No source/provenance acceptance claim. Agent 6 can review whether evidence is present; Agent 1 owns custody evidence.

4. Ambiguity and semantic-boundary evidence

   - For `ambiguous_answer_candidates`, evidence that the pipeline resolves ambiguity by existing contract rules, not by manual semantic arbitration.
   - For unresolved ambiguity, the row must stay out of the fill package or be documented as a blocker.
   - For `route_cards_without_answer_eligible`, proof that evidence/form-reference cards were not flipped into answers without a new generated answer-candidate row.
   - For `no_route_cards`, proof that new route rows have source/license/citation rows attached.

5. Static audit evidence

   Required commands and results:

   ```text
   node scripts/audit_definition_route_claims.mjs
   node scripts/validate_definition_route_claim_audit.mjs
   ```

   The packet must include:

   - command lines.
   - report paths.
   - pass/fail result.
   - row counts checked.
   - exact blockers if either command fails.

6. Reader-impact evidence

   - Baseline hinted occurrences: `40073`.
   - Dry-run hinted occurrence count after the proposed fill.
   - Delta above baseline.
   - Covered token count and covered occurrence count.
   - Confirmation that the evidence is a dry run unless all later gates are present.

7. Payload and budget evidence

   - Agent 12 scope clearance or proof that the packet stays within the current bounded pilot posture.
   - Route key count, shard count, card count, total shard bytes, max shard bytes, and truncated key count.
   - Agent 4 threshold comparison for local click latency, max shard bytes, and route-card payload.
   - Any payload threshold miss must be routed as a blocker, not a warning.

8. Runtime and old-HUD evidence

   Before Agent 6 review, Agent 4 or Agent 10 must provide local Orot proof for the exact package under review:

   - old-HUD marker output scan total `0`.
   - old-path probes and results.
   - poisoned-storage probe result.
   - route manifest requested.
   - route shard requested.
   - packaged clicks tested.
   - all packaged clicks opened route cards.
   - source/license details visible after click.
   - browser console error count.
   - runtime exception count.
   - max click time.

   Live deployment proof is required only after publication. It is not a prerequisite for review of a local dry-run packet, but it is mandatory before any live acceptance language.

9. Non-acceptance wording

   The packet must state that it does not claim:

   - QA acceptance.
   - validated public/runtime acceptance.
   - source/provenance acceptance.
   - publication readiness.
   - Definition authority.
   - usage-as-definition authority.
   - accepted text.
   - translation output.

## Immediate Block Conditions

Agent 6 should block review intake, not merely warn, if any of these are present:

- The package contains manual English definitions or manual semantic selections.
- The package promotes Agent 2's current queue directly as fill-producing output.
- Evidence/form-reference rows are flipped into answers without a generated answer-candidate row.
- Known incomplete curated source rows are included without Agent 1 blocker documentation.
- `audit_definition_route_claims.mjs` or `validate_definition_route_claim_audit.mjs` fails or is omitted.
- Old-HUD marker output scan is missing or nonzero.
- Local Orot browser proof is missing for a package intended for public promotion.
- Payload/runtime thresholds are missing for a package larger than a top-50/top-100 pilot.
- The packet claims publication readiness, source custody acceptance, Definition authority, accepted text, or validated public/runtime acceptance.

## Permissible Agent 6 Review Outcomes Later

If a future packet includes the required evidence, Agent 6 may issue only a scoped pass/warn/block verdict for the evidence packet under review.

A future Agent 6 verdict still must not by itself accept:

- source/provenance custody.
- Definition authority.
- accepted translation text.
- public deployment readiness.
- live runtime acceptance unless live proof is separately included and reviewed.

## Deuteronomy Stage B Note

The Deuteronomy Stage B proof is sufficient to be routed as a future bounded review packet if Agent 7 or Agent 10 asks for that review.

Evidence present in the Agent 10 proof includes:

- package commit `b70f9204e`.
- live-proof commit `218048ed0`.
- selected token count `2621`.
- public route key count `1426`.
- shard count `973`.
- card count `4133`.
- total shard bytes `8387801`.
- max shard bytes `68645`.
- static validators reported pass.
- package old-HUD marker output scan total `0`.
- local browser proof status `pass`.
- live manifest HTTP status `200`.
- live page marker checks old-HUD hit `false` for Deuteronomy and root.
- live browser proof status `pass`.
- live proof old-HUD marker hits total `0`.
- live proof max click time `416 ms`.

Warnings to preserve in any future review:

- Builder upstream route lookup probe reported `46` missing source lookup shard probes, even though generated public Deuteronomy shards were complete.
- The proof is Agent 10 package/browser evidence only.
- It is not Agent 6 QA acceptance.
- It is not validated public/runtime acceptance.
- It is not source/provenance custody acceptance.
- It is not Definition authority, route publication support, publication readiness, accepted text, or translation output.

## Agent 10 Routing Rule

Agent 10 may route an Orot fill package to Agent 6 only after the minimum packet above exists and names all exact artifacts, commands, counts, pass/fail results, blockers, and non-acceptance boundaries.

Until then, Orot fill remains blocked for Agent 6 review intake, not rejected on merits.
