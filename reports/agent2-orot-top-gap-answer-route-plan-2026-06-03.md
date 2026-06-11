# Agent 2 Orot Top-Gap Answer Route Plan - 2026-06-03

Status: bounded Agent 2 route-data plan from Agent 10's Orot top-gap route audit.

Highest permissible claim: this plan identifies existing pipeline files and scripts for answer-candidate route repair and disambiguation evidence. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted translation text, or translation output.

## Input

- Audit JSON: `.codex-tmp/hud-deploy-live/reports/agent10-orot-top-gap-route-audit-2026-06-03.json`
- Audit MD: `.codex-tmp/hud-deploy-live/reports/agent10-orot-top-gap-route-audit-2026-06-03.md`
- Answer-contract failure JSON: `.codex-tmp/hud-deploy-live/reports/agent10-orot-answer-contract-failure-audit-2026-06-03.json`
- Answer-contract failure MD: `.codex-tmp/hud-deploy-live/reports/agent10-orot-answer-contract-failure-audit-2026-06-03.md`

Agent 10 audit summary used:

- Audited token count: `25`
- No route cards: `1`
- Route cards exist but none are answer-eligible: `18`
- Ambiguous answer candidates: `6`
- Missing token rows: `0`
- Route loader missing shards: `0`

Interpretation: this is not mainly a broad definition-invention problem. The immediate Agent 2 target is answer-contract repair for existing route cards plus disambiguation evidence for tied answer candidates.

Second audit summary for the 18 contract-repair tokens:

- Route cards audited: `443`
- `explicit_answer_eligible_false`: `338`
- `section_not_answer_production`: `105`
- Sections: `citable_paraphrase_evidence 320`, `phrase_evidence 105`, `strict_hebrew 12`, `lemma 6`
- Answer roles: `evidence 431`, `form_reference 12`
- Meaning quality: `paraphrase_evidence 320`, `missing 105`, `form_reference 18`

Refined interpretation: the main failure is not missing source rows. The dominant issue is that existing cards are evidence/form-reference rows under the current answer contract. Agent 2 should produce answer-candidate rows or contract-safe route-data adjustments where pipeline evidence supports them. It should not simply flip `answer_eligible` on existing evidence rows.

## Existing Pipeline Path

Current route data lives under:

- `data/definitions/hud-route-lookup/manifest.json`
- `data/definitions/hud-route-lookup/shards/*.json`

Local route inputs and builders:

- `scripts/build_definition_routes.mjs`
- `scripts/build_citable_paraphrase_evidence.mjs`
- `scripts/build_definition_gap_queue.mjs`
- `scripts/build_hud_route_store.mjs`
- `scripts/build_hud_route_lookup.mjs`

Public dry-run consumers, to be run only after Agent 2 data changes:

- `.codex-tmp/hud-deploy-live/scripts/build_public_hud_route_package.mjs`
- `.codex-tmp/hud-deploy-live/scripts/build_public_hud_reader_hints.mjs`

## Answer Contract

The current reader-hint consumer selects an answer only when route cards satisfy the public answer contract:

- allowed production section: `strict_hebrew`, `strict_aramaic`, `morphology`, `lemma`, `subphrase_evidence`, `biblical_paraphrase_evidence`, or `citable_paraphrase_evidence`
- renderable `definition`, `gloss`, or `meaning_claim`
- `answer_eligible` not false
- `answer_role` allowed as `answer`, `definition`, `reader_answer`, `primary_definition`, or empty
- public source rows include `source_id`, `source_url`, `license`, and `license_url`

Important blocker: `scripts/build_hud_route_store.mjs` intentionally maps `phrase_evidence` rows to `answer_eligible: false` and `answer_role: evidence`. These rows are useful evidence, but they are not answer-slot rows.

Additional blocker from the second audit: most citable paraphrase cards already sit in an answer-production section, but they still carry `answer_role: evidence` and `answer_eligible: false`. Those rows need upstream answer-candidate status/contract repair if pipeline evidence supports it; direct shard edits or flag flips would violate the boundary.

## Token Groups

Contract repair: existing route cards are present, but no answer-eligible card is available under the current public reader-hint contract.

`tok-20d2e105fd77`, `tok-2a86b3eaee9b`, `tok-97b99c6afe4b`, `tok-1b76a9f88fc7`, `tok-cf9427570b0a`, `tok-42a5e912cd97`, `tok-6cb138a16634`, `tok-e858e9fa8bb8`, `tok-bf10df974281`, `tok-1bfe6fea9d85`, `tok-180d57091846`, `tok-3fc615d98aec`, `tok-b9470f18041a`, `tok-16b3c5cb6ffe`, `tok-7094ebe18b8f`, `tok-c3803c6fde17`, `tok-1282c4d855bc`, `tok-e2d80b36f5bc`

Ambiguous: answer-eligible cards exist, but multiple close candidate answers block selection.

`tok-f7199bc62ed1`, `tok-6f3c380a7be9`, `tok-bff9af2524d1`, `tok-dfcf4cc0af67`, `tok-35bce35c1de4`, `tok-12372a227ead`

No route cards: route rows must be generated for lookup candidates before answer selection can happen.

`tok-35f6d9093072`

## Exact Data Rows To Generate

For contract-repair tokens, Agent 2 should generate or refresh source-backed rows in:

`.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl`

Rows must be created by pipeline evidence, not manually accepted definitions. Fields needed for the existing route-store and reader-hint contracts:

- `focus_surface`
- `focus_normalized`
- `route_type`: `citable_paraphrase_evidence` or `biblical_paraphrase_evidence`
- `candidate_status`: `proposed` for disambiguation evidence; `accepted` only after pipeline evidence review and only as local route-candidate status, not Definition authority
- `answer_eligible`: `true` only for boundary-safe answer-slot candidates
- `answer_role`: `answer` or `reader_answer`
- `boundary_safe`: `true`
- `definition`, `route_definition`, or `paraphrase`: populated from pipeline source evidence, not hand-authored translation text
- `raw_score` and `adjusted_score`, or `score_handicap`
- `source_rows[]` with `source_id`, `source_url`, `license`, `license_url`

Repair classes:

- `phrase_evidence` rows: keep as evidence. Generate separate `citable_paraphrase_evidence`, `biblical_paraphrase_evidence`, lemma, or morphology answer-candidate rows only if pipeline evidence supports a reader-answer candidate.
- `citable_paraphrase_evidence` rows with `answer_role: evidence` / `answer_eligible: false`: repair upstream row status and contract only when boundary-safe source-backed evidence supports `candidate_status=accepted`, `answer_eligible=true`, and `answer_role=answer` or `reader_answer`. The word `accepted` here is local route-candidate status only, not Definition authority or accepted text.
- `strict_hebrew` / `lemma` form-reference rows: keep `form_reference` non-answer. Create a separate answer candidate if the pipeline can substantiate a lemma/morphology/definition route; do not promote the form-reference row itself.

For ambiguous tokens, Agent 2 should first emit:

`reports/agent2-orot-top-gap-disambiguation-evidence-2026-06-03.json`

That packet should compare the tied route cards from the Agent 10 audit and explain which route-card evidence or score field would separate the candidates. Do not choose the highest score as truth. If evidence cannot separate them, leave the token ambiguous.

For `tok-35f6d9093072`, Agent 2 needs new route rows keyed so the existing lookup-candidate generator can find them. If no source-backed row can be generated, the exact blocker is: no existing source-backed route row for the generated lookup candidates.

## Commands After Agent 2 Data Exists

Local route rebuild and validation:

```powershell
node scripts/build_hud_route_store.mjs
node scripts/build_hud_route_lookup.mjs
node scripts/validate_hud_route_store.mjs
node scripts/validate_hud_route_lookup.mjs
node scripts/validate_route_answer_safety.mjs
```

Agent 10 public dry-runs only after the Agent 2 route data rebuild passes:

```powershell
node .codex-tmp/hud-deploy-live/scripts/build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 10000 --source-clearance-report C:\Users\owner\Documents\translations\reports\agent1-orot-fill-source-row-evidence-2026-06-03.json --replace-existing --dry-run --report reports\agent10-orot-after-agent2-route-package-dry-run-2026-06-03.json

node .codex-tmp/hud-deploy-live/scripts/build_public_hud_reader_hints.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --source-clearance-report C:\Users\owner\Documents\translations\reports\agent1-orot-fill-source-row-evidence-2026-06-03.json --dry-run --report reports\agent10-orot-after-agent2-reader-hints-dry-run-2026-06-03.json
```

## Blockers

- No dedicated existing disambiguation writer was identified. Ambiguity repair currently has to be expressed as route-card data or score changes consumed by `build_public_hud_reader_hints.mjs`.
- `phrase_evidence` cards are intentionally non-answer evidence. They should not be relabeled into answers without new source-backed citable/definition route rows.
- The second Agent 10 audit shows `338` cards are explicitly `answer_eligible=false` and `431` cards carry `answer_role=evidence`; safe repair requires upstream answer-candidate rows or contract-safe route-data adjustments, not direct flag flips.
- Any row requiring human semantic choice rather than pipeline evidence must remain proposed/disambiguation evidence and must not become `answer_eligible`.

## Non-Acceptance Boundary

This plan does not approve route rows, public rendering, source custody, publication, Definition authority, usage-as-definition authority, accepted text, or translation output.
