# Agent 2 Orot 20-Row Transform Safety Matrix

Date: 2026-06-04

## Scope

This is a non-public Agent 2 safety matrix for the already completed Orot 20-row package. It is prepared for Agent 10 / Agent 6 review evidence only.

- Input package: `reports/agent2-orot-20-row-zero-safe-nonpublic-package-2026-06-03.json`
- Agent 6 boundary: `reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.md`
- Agent 6 fill evidence requirements preserved: `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`
- Matrix scope: `20` rows / `1033` occurrences.
- Held out unchanged: `10` Kaikki/Wiktionary external-link-only rows / `145` occurrences and `1` workspace grammar-particle metadata-only row / `24` occurrences.

Highest permissible claim: `nonpublic_20_row_transform_safety_matrix_prepared_for_agent10_agent6_review_evidence_only`.

## Deterministic Rule

Include only rows already carried forward in `reports/agent2-orot-20-row-zero-safe-nonpublic-package-2026-06-03.json`.

Exclude every external-link-only row and every metadata-only row. Do not expand to full Orot, Sefaria-family rows, public HUD output, route JSONL, route shards, source files, token indexes, lexical payloads, or runtime files.

This matrix records candidate text status, not accepted text. It does not perform manual semantic arbitration. Observed answer fields in upstream source-layer claim files are not imported into this package and do not change package answer/public flags.

## Safety Summary

- Source-claim rejoin rows: `20`.
- Source-claim rejoin failures: `0`.
- Homograph/ambiguity flagged rows from competing edges: `18`.
- Morphology/context warning rows from input candidate wording: `2`.
- Manual semantic arbitration rows: `0`.
- Rows requiring Kaikki/Wiktionary text storage/display: `0`.
- Rows requiring the metadata-only grammar-particle row: `0`.
- Stop condition triggered: `false`.

## Zero Flags

- `answer_eligible=false`
- `promote_to_answer=false`
- `approved_for_public_emit=false`
- `public_emit_ready=false`
- Public HUD rows emitted: `0`
- Route JSONL rows emitted: `0`
- Route shards written: `0`
- Runtime/source/token-index/lexical-payload edits: `0`
- Agent 4 runtime proof requested: `false`

## Row Matrix

| token_id | occ | selected claim | selected source row | license | label | text status | edges | safety flags | blocker-to-answer/public-emit |
|---|---:|---|---|---|---|---|---:|---|---|
| tok-c3c61224118a | 31 | def-layer-5ce6eace2fa9925b | openscriptures\|H3581\|CC BY 4.0 | CC BY 4.0 | counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 0 | rejoin=true; ambiguity=false; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-c00726f9c271 | 2 | def-layer-cb27e3da48974f93 | openscriptures\|H8055\|CC BY 4.0 | CC BY 4.0 | counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 0 | rejoin=true; ambiguity=false; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-20d2e105fd77 | 338 | def-layer-9f58ccb04622e5fb | workspace\|project-function-word:kol\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 1 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-2a86b3eaee9b | 204 | def-layer-9f58ccb04622e5fb | workspace\|project-function-word:kol\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 1 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-1b76a9f88fc7 | 102 | def-layer-9f58ccb04622e5fb | workspace\|project-function-word:kol\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 1 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-cf9427570b0a | 97 | def-layer-9f58ccb04622e5fb | workspace\|project-function-word:kol\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 1 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-42a5e912cd97 | 87 | def-layer-995dbb9b107163a7 | workspace\|project-function-word:et\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 4 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-e2d80b36f5bc | 55 | def-layer-190a44c9b7c94627 | workspace\|project-function-word:al\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-eed4f84c09ac | 22 | def-layer-029e9f23ed322bc9 | workspace\|project-function-word:im\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-0c8d92179033 | 19 | def-layer-1359db68389bb379 | workspace\|project-function-word:im-with\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-cceb19874253 | 16 | def-layer-1359db68389bb379 | workspace\|project-function-word:im-with\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-e2ce674d9f4b | 15 | def-layer-190a44c9b7c94627 | workspace\|project-function-word:al\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-b857d40da544 | 14 | def-layer-644a0353f1b0e2d6 | workspace\|project-function-word:el\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 7 | rejoin=true; ambiguity=true; context_warning=true; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-e26cf1bf873c | 13 | def-layer-ba6e5ad2e99aa94e | workspace\|project-function-word:mah\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-1cd255ea2c77 | 5 | def-layer-1d4979141a60733b | workspace\|project-function-word:zu\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 3 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-4385095993ec | 3 | def-layer-644a0353f1b0e2d6 | workspace\|project-function-word:el\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 7 | rejoin=true; ambiguity=true; context_warning=true; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-74486428ad56 | 3 | def-layer-029e9f23ed322bc9 | workspace\|project-function-word:im\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-bb2527ed1403 | 3 | def-layer-1276d6c8f78d8fc6 | workspace\|project-function-word:rak\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 2 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-0a3189fbf6e5 | 2 | def-layer-1d4979141a60733b | workspace\|project-function-word:zu\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 3 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |
| tok-7da0e59043bf | 2 | def-layer-63e90a63155d59df | workspace\|project-function-word:min\|project-authored / CC0 | project-authored / CC0 | project-preferred counterpart candidate | non_authoritative_candidate_display_storage_evidence_only | 1 | rejoin=true; ambiguity=true; context_warning=false; manual_arbitration=false | blocked_agent6_review_required_no_answer_or_public_emit |

## Validation

Commands planned:

```powershell
node scripts\validate_agent6_orot_dry_run_source_license_display_boundary_verdict.mjs
node -e "<custom Agent 2 transform safety matrix JSON assertions>"
git diff --check -- reports\agent2-orot-20-row-transform-safety-matrix-2026-06-04.md reports\agent2-orot-20-row-transform-safety-matrix-2026-06-04.json
<PowerShell trailing-whitespace check for both Agent 2 matrix artifacts>
```

Results will be recorded in the JSON artifact after validation.

## Not Accepted

No QA acceptance, public/runtime acceptance, route publication support, Definition authority, usage-as-definition authority, product/data acceptance, publication readiness, translation output, accepted gloss, accepted text, source/provenance acceptance, license acceptance, public HUD output, route JSONL/shard writes, Orot HTML/runtime edits, or Agent 4 runtime proof is claimed here.

## Agent 8 Callback

- status: `nonpublic_20_row_transform_safety_matrix_prepared_for_agent10_agent6_review_evidence_only`
- artifact: `reports/agent2-orot-20-row-transform-safety-matrix-2026-06-04.md`
- artifact JSON: `reports/agent2-orot-20-row-transform-safety-matrix-2026-06-04.json`
- blockers: none for the matrix; public/answer/route/runtime promotion remains blocked by boundary.
- next action needed: Agent 10, Agent 5, Agent 7, or Agent 8 may decide whether to include this evidence in an Agent 6 review packet; Agent 2 does not route itself to Agent 6.
- continue condition: Stop condition met after producing this bounded non-public matrix.
