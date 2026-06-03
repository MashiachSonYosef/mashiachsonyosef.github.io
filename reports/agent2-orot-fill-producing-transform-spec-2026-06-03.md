# Agent 2 Orot Fill-Producing Transform Spec - 2026-06-03

Status: bounded transform decision for the Orot top-50 queue plus Agent 3's recommended no-arbitration target. No pilot route-claim JSONL was emitted.

Highest permissible claim: this report identifies the existing definition-route pipeline surface and the required transform contract for a future fill-producing pilot. It does not claim accepted definitions, accepted text, translation output, Definition authority, usage-as-definition authority, source/provenance acceptance, QA acceptance, publication readiness, or public HUD/runtime changes.

## Inputs Read

- `reports/agent10-team-release-operating-plan-2026-06-03.md`
- `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json`
- `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.md`
- `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-top-gap-route-audit-2026-06-03.json`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-answer-contract-failure-audit-2026-06-03.json`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-full-reader-hint-gap-audit-2026-06-03.json`
- `scripts/build_definition_routes.mjs`
- `scripts/build_citable_paraphrase_evidence.mjs`
- `scripts/build_hud_route_store.mjs`
- `scripts/audit_definition_route_claims.mjs`
- `scripts/validate_definition_route_claim_audit.mjs`

## Top-50 Queue Snapshot

The first 50 queue rows cover `3518` Orot gap occurrences.

| Category | Tokens | Occurrences | Pilot status |
|---|---:|---:|---|
| `route_cards_without_answer_eligible` | 30 | 2233 | blocked: no answer-eligible card under current contract |
| `ambiguous_answer_candidates` | 19 | 1220 | blocked: multiple close answer candidates require disambiguation |
| `no_route_cards` | 1 | 65 | blocked: no route card to promote |

Top-50 aggregate route-audit counts from the queue:

- Candidate lookup keys: `106`
- Candidate route cards: `2447`
- Answer-eligible candidate cards: `54`
- Ambiguity count: `52`
- Dominant non-answer failures: `section_not_answer_production` on 12 rows, `explicit_answer_eligible_false` on 18 rows

## Agent 3 Target Alignment

Agent 3's recommended no-arbitration pilot target is usable as the preferred transform feasibility target:

`single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100`

Mechanical inclusion rule:

- `category=route_cards_without_answer_eligible`
- `route_card_count>0`
- `candidate_count=1`
- `answer_eligible_count=0`
- normalized token starts with a common prefix/article shape

Impact:

| Scope | Rows | Occurrences |
|---|---:|---:|
| All matching rows | 155 | 2015 |
| Top-100 pilot target | 100 | 1960 |

This subset improves the target because it avoids the ambiguous lane and avoids multi-candidate selection. It does not, by itself, make answer-row emission safe.

Observed top-100 target route-card surface from current source checkout shards:

- Target rows inspected: `100`
- Target occurrences: `1960`
- Route cards found: `1897`
- Answer cards found: `0`
- Route types: `phrase_evidence` 470, `citable_paraphrase_evidence` 1341, `form` 67, `lemma` 19
- Row type sets: `phrase_evidence` only 57 rows, `citable_paraphrase_evidence+form+phrase_evidence` 27 rows, `citable_paraphrase_evidence+form+lemma+phrase_evidence` 14 rows, `form` only 1 row, `form+lemma` 1 row
- Failure split: `section_not_answer_production` 57 rows, `explicit_answer_eligible_false` 43 rows

Feasibility result: this is a good dry-run target for a future transform, but not safe for immediate answer-claim emission. The target removes candidate arbitration; it does not prove that a route card is a definition-quality reader answer for the Orot token.

Exact blocker:

- The `section_not_answer_production` rows are phrase-evidence rows. Phrase rows are licensed usage evidence only and must not become answers.
- The citable rows are `candidate_status=accepted` as citable evidence and have complete source rows, but they are emitted by the pipeline as `answer_eligible=false`, `answer_role=evidence`.
- The citable rows do not carry enough explicit source-definition pointer fields in the route cards to prove a new answer row was mechanically copied from a specific upstream definition claim without rejoining source claim data.
- Some single-candidate exact citable rows are still context-risky or homograph-risky for Orot reader answers. For example, the target includes prefix/article tokens where the first citable evidence definition can be a lexical homograph rather than the intended prefix/article reading. A transform needs an explicit morphology/homograph safety gate, not just `candidate_count=1`.

## Existing Pipeline Surface

`scripts/build_definition_routes.mjs`

- Emits source-backed definition route claims into `.local-cache/definition-routes/kaikki-definition-claims.jsonl` and `.local-cache/definition-routes/source-layer-definition-claims.jsonl`.
- It can mark route claims `answer_eligible=true` when a claim has definition-quality meanings and safe source rows.
- It contains morphology-parse logic that can produce answer-eligible morphology parse claims, but that logic is currently used for internal samples, not as an Orot queue transform.

`scripts/build_citable_paraphrase_evidence.mjs`

- Indexes existing accepted lexical definition claims and joins them to licensed Hebrew usage evidence.
- The emitted citable rows are deliberately evidence-only for reader answers: `answer_eligible=false`, `answer_role=evidence`.
- Its own route policy says citable rows join an accepted lexical definition row to licensed non-biblical Hebrew usage evidence and do not import English source-text translations.

`scripts/build_hud_route_store.mjs`

- Phrase rows are forced evidence-only.
- Paraphrase/citable rows become answer cards only if `candidate_status=accepted`, `answer_eligible=true`, `boundary_safe` is not false, and `answer_role` is not evidence/audit/form_reference.
- This confirms Agent 10's contract: a fill-producing row must be a new source-backed answer-candidate row, not a flipped phrase/evidence/form-reference row.

`scripts/audit_definition_route_claims.mjs` and `scripts/validate_definition_route_claim_audit.mjs`

- These can audit and validate generated route-claim JSONL.
- They do not create route claims, choose among ambiguous candidates, or supply definition/source authority.

`scripts/build_definition_gap_queue.mjs`

- Builds a general phrase/citable gap queue from local phrase and citable evidence.
- It does not consume the Orot full reader-hint queue and does not emit route-store-consumable accepted answer rows.

## Pilot Decision

No `.local-cache/definition-routes/orot-agent2-pilot-answer-claims.jsonl` was emitted.

Reason: neither the original top-50 mixed queue nor Agent 3's no-arbitration top-100 subset contains a completely safe fill-producing subset under the current contracts.

- The 30 `route_cards_without_answer_eligible` rows have no answer-eligible candidate to copy as an answer row. Their dominant cards are phrase evidence, citable paraphrase evidence, strict Hebrew/form-reference rows, or evidence-only lemma rows.
- The 19 `ambiguous_answer_candidates` rows contain answer candidates only after generated lookup relations such as prefix-stripped or suffix-stripped candidates. The detailed top audit shows competing source-public lemma candidates for examples including `האומה`, `האדם`, `שהיא`, `הנשמה`, `הקודש`, and `אלהי`. Selecting one would be semantic disambiguation, not a mechanical Agent 2 transform.
- The one `no_route_cards` row, `tok-35f6d9093072` / `האידיאה`, has no route card available for the generated lookup candidates.
- Existing citable/phrase rows cannot be promoted by changing flags. The pipeline intentionally emits them as evidence-only, and the work order forbids flipping existing evidence/form-reference rows into answers.

Agent 3 target-specific blocker:

- The `single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100` subset removes candidate arbitration, but all inspected target cards remain non-answer cards.
- The target has `0` answer cards, 57 phrase-only rows, and 41 rows with citable evidence plus form/lemma/phrase support.
- `candidate_count=1` is not enough proof that a citable definition is a safe Orot reader answer. A no-arbitration transform still needs source-claim rejoin, morphology/prefix safety, and homograph/context exclusion.

Therefore a pilot answer-claim JSONL with `answer_eligible=true`, `answer_role=answer`, `candidate_status=accepted`, `boundary_safe`, and complete source/license/citation rows requires a new authorized transform. Agent 3's subset should be the first input to that transform, but it is not itself sufficient evidence to emit answer rows.

## Required Transform Contract

A future fill-producing transform should be a new dry-run local pipeline script, not a manual report edit. Proposed path:

- `scripts/build_orot_agent2_pilot_answer_claims.mjs`

Suggested arguments:

```powershell
node scripts\build_orot_agent2_pilot_answer_claims.mjs --queue=reports\agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json --agent3-buckets=reports\agent3-orot-gap-mechanical-buckets-2026-06-03.json --target=single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100 --limit=100 --output=.local-cache\definition-routes\orot-agent2-pilot-answer-claims.jsonl --report=reports\agent2-orot-pilot-answer-claims-2026-06-03.md --dry-run
```

Required inputs:

- Orot queue rows from `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json`
- Agent 3 target rows from `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json` under `recommended_highest_roi_subset.subset`
- The same lookup-candidate generator used by Agent 10's gap audit, factored into a reusable pipeline module or duplicated with tests
- Source route claims from `.local-cache/definition-routes/kaikki-definition-claims.jsonl` and `.local-cache/definition-routes/source-layer-definition-claims.jsonl`
- Existing citable/phrase evidence only as supporting evidence, never as definition authority
- Source/license rows from the underlying route claim, plus any citation rows required by the transform

Required emission rule:

Emit a row only when all of these are true:

- The token has exactly one mechanically selected source-backed answer candidate after applying the existing route-ranking and lookup-relation penalties.
- There is no competing answer candidate within the ambiguity window.
- The selected candidate is a definition-quality source route claim, not phrase evidence, form reference, or usage evidence.
- The selected candidate is rejoined to a specific upstream source claim id from `kaikki-definition-claims.jsonl` or `source-layer-definition-claims.jsonl`; a route-store citable evidence card alone is not enough.
- Prefix/article rows pass an explicit morphology safety gate that proves the emitted answer is for the clicked Orot token shape, not a homograph or unrelated exact lexical form.
- The definition/gloss text is copied from an existing pipeline route claim; no English definition text is manually written by Agent 2.
- Source rows are complete: `source_name`, `source_family`, `source_id`, `source_url`, `license`, and `license_url`.
- The row includes `boundary_safe=true`.
- The row includes `candidate_status=accepted` only as local route-candidate status, not as Definition authority, source acceptance, QA acceptance, or publication readiness.
- The row includes `answer_eligible=true`, `answer_role=answer`, and numeric `answer_score`.

Required output fields:

- `claim_id`
- `route_family`
- `route_type`
- `language`
- `surface`
- `normalized`
- `match_type`
- `confidence`
- `answer_score`
- `candidate_status`
- `meaning_quality`
- `answer_eligible`
- `answer_role`
- `definition` or `gloss`
- `source_rows`
- `boundary_safe`
- `agent2_boundary`
- `source_queue_id`
- `source_token_id`
- `source_lookup_relation`
- `source_candidate_claim_id`
- `agent3_target_name`
- `agent3_prefix_class`
- `agent3_prefix_stem_key`
- `upstream_definition_claim_id`
- `upstream_definition_claim_file`
- `morphology_safety_basis`
- `homograph_safety_basis`

Required non-authority boundary fields:

```json
{
  "agent2_boundary": {
    "status": "local_route_candidate_only",
    "not_definition_authority": true,
    "not_translation_output": true,
    "not_usage_as_definition": true,
    "not_qa_acceptance": true,
    "not_publication_readiness": true,
    "not_source_acceptance": true
  }
}
```

## Required Validators

If a future pilot JSONL is emitted, Agent 2 should run:

```powershell
node scripts\audit_definition_route_claims.mjs --route-jsonl=.local-cache\definition-routes\orot-agent2-pilot-answer-claims.jsonl --output=reports\agent2-orot-pilot-answer-claims-audit-2026-06-03.json --report=reports\agent2-orot-pilot-answer-claims-audit-2026-06-03.md
node scripts\validate_definition_route_claim_audit.mjs reports\agent2-orot-pilot-answer-claims-audit-2026-06-03.json
```

Agent 10 still owns any route-store rebuild, reader-hint dry run, public package dry run, browser proof, old-HUD scan, and promotion decision.

## Recommended Bounded Agent 2 Action

Do not emit the pilot JSONL from the current top-50 queue or from Agent 3's top-100 target yet.

Next safe Agent 2 step: implement or request authorization for the proposed dry-run transform with a strict zero-or-safe-output policy, using Agent 3's `single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100` subset as the first target. Its first run must be allowed to emit zero rows if no unique source-backed, morphology-safe, homograph-safe candidate survives the filters. If it emits any row, it must pass the route-claim audit and validation commands above before Agent 10 consumes it.

## Validation Commands Used

```powershell
Get-Content -Path reports\agent10-team-release-operating-plan-2026-06-03.md -TotalCount 220
node - <inspect reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json top50>
Get-Content -Path reports\agent3-orot-gap-mechanical-buckets-2026-06-03.md -TotalCount 220
node - <inspect reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json recommended_highest_roi_subset>
node - <inspect Agent 3 top100 target route-card makeup from data/definitions/hud-route-lookup source shards>
node - <compare top50 category, occurrence, route-card, answer-eligible, ambiguity counts>
node - <inspect data/definitions/hud-route-lookup source shards for exact top50 entries>
node - <extract .codex-tmp/hud-deploy-live/reports/agent10-orot-top-gap-route-audit-2026-06-03.json candidate summaries>
Select-String -Path scripts\build_citable_paraphrase_evidence.mjs -Pattern "answer_eligible: false|answer_role: 'evidence'|candidate_status|safeSourceRows|makeEvidenceRow" -Context 3,4
Select-String -Path scripts\build_hud_route_store.mjs -Pattern "answer_eligible|answer_role|candidate_status|boundary_safe|source_rows|accepted" -Context 2,3
Get-Content -Path scripts\audit_definition_route_claims.mjs -TotalCount 280
Get-Content -Path scripts\validate_definition_route_claim_audit.mjs -TotalCount 220
```
