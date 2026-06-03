# Agent 6 Orot Display-Integrity Fallback Export Verdict - 2026-06-03

## Disposition

WARN-ACCEPTED for fallback export shape only.

Agent 6 clears the proposed fallback row shape for the 13 display-integrity rows, but does not clear public/runtime mutation from this packet. Agent 10 may prepare a changed public/runtime package for later review using only the exact bounded shape below.

This verdict does not accept QA beyond this boundary, source/provenance custody, license clearance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.

## Evidence Reviewed

- `reports/agent10-orot-display-integrity-fallback-export-packet-2026-06-03.json`
- `reports/agent10-orot-display-integrity-fallback-export-packet-2026-06-03.md`
- Prior Agent 6 blocker: `reports/agent6-orot-public-placeholder-promotion-boundary-verdict-2026-06-03.md`
- Current public reader-hints overlap check against `data/public-hud/orot/reader-hints.json`

## Validator Evidence

- `node scripts\validate_agent10_orot_display_integrity_fallback_export_packet.mjs`
- Result: passed.

Agent 6 also scanned all 13 `proposed_export_rows`. Result: 13/13 rows remove `display`, `inline_display`, and `counterpart_text`; preserve `placeholder_text=TBD`; preserve `answer_eligible=false`; preserve `promote_to_answer=false`; preserve `definition_text_stored_now=false`; preserve `nc_definition_content_stored_now=false`; preserve `definition_candidate_emit_allowed=false`; preserve `route_jsonl_emit_allowed=false`; preserve `source_rows_emitted=false`; preserve `accepted_text=false`; and have `merge_safe_no_existing_public_hint=true`.

## Cleared Subset

### Display-Integrity Pending-Review Fallback Rows

Disposition: WARN-ACCEPTED for fallback export shape only.

Rows cleared for shape: 13/13.

Occurrences represented: 129.

Cleared row IDs:

- `tok-bf10df974281`
- `tok-17ba65351831`
- `tok-6b169f83d239`
- `tok-f4684f98dd3c`
- `tok-21ae8291f6e3`
- `tok-061fb7148fbc`
- `tok-12f1b38c8e82`
- `tok-4a2aa0e83513`
- `tok-4c95bb88fb43`
- `tok-7079eb2eb5bb`
- `tok-e634000d8416`
- `tok-e7e3dabf0cb3`
- `tok-f87dd75a1506`

## Required Export Shape

The next changed package may use only these placeholder-state fields for the 13 cleared rows:

- `token_id`
- `surface`
- `occurrences`
- `placeholder_kind=reader_hint_pending_review`
- `review_state=placeholder_pending_review`
- `placeholder_text=TBD`
- `display_state=pending_reader_hint_review`
- `label_status=placeholder_pending_review`
- `label`
- `answer_eligible=false`
- `promote_to_answer=false`
- `definition_text_stored_now=false`
- `nc_definition_content_stored_now=false`
- `definition_candidate_emit_allowed=false`
- `public_placeholder_emit_requested=true`
- `route_jsonl_emit_allowed=false`
- `source_rows_emitted=false`
- `accepted_text=false`
- `merge_safe_no_existing_public_hint=true`

The next changed package must not emit these fields for the fallback rows:

- `display`
- `inline_display`
- `counterpart_text`
- `selected_source_rows`
- `source_rows`
- `definition_text`
- `answer_text`
- `translation_text`
- `accepted_gloss`
- `accepted_text`

## Acceptance Conditions

- Agent 10 may prepare a changed public/runtime package for these 13 rows only.
- The changed package must reference this docket path.
- The changed package must prove no current public reader-hints row is overwritten or duplicated.
- The changed package must keep `TBD` as pending-review placeholder state only, not as candidate definition text or accepted reader text.
- The changed package must not add answer rows, source rows, definition content rows, NC definition content rows, route JSONL rows, route shard writes, accepted text rows, or publication claims.
- If the changed package sets `public_placeholder_emit_allowed_now=true`, that field may mean only "emit pending-review placeholder state for these 13 row IDs under this docket"; it may not mean public reader-hint candidate acceptance.
- Any runtime/UI copy must visibly communicate pending review, not a missing definition, accepted gloss, or top-match candidate.

## Required Follow-Up

Agent 10 next action: prepare the changed public/runtime package for the 13 display-integrity fallback rows only, using the exact field boundary above.

Agent 4/runtime proof: required after the changed public/runtime package exists and before any public/runtime acceptance. The proof must show that the runtime renders the fallback as pending-review placeholder state, does not expose `TBD` as definition/candidate text, does not create route/source/answer rows, does not affect non-target Orot rows, and preserves no-old-HUD/no-accepted-text boundaries.

Agent 6 follow-up: required after Agent 10 produces the changed package and after runtime proof exists if public/runtime acceptance is requested.

## Blocked Scope

Still blocked from this verdict:

- Public/runtime acceptance.
- Any mutation outside the 13 listed row IDs.
- Any direct public `display`, `inline_display`, or `counterpart_text` value of `TBD`.
- Any answer eligibility.
- Any source row, selected source row, definition content row, route JSONL row, or route shard write.
- Any NC/Klein metadata display.
- Any publication readiness, route publication support, product/data acceptance, accepted gloss, or accepted text.

## Risk Classification

Warning, not blocker, because the packet corrected the prior public-promotion blocker by removing reader-facing `display`, `inline_display`, and `counterpart_text` fields and preserving zero mutation. The warning remains because the next step would create public/runtime fallback behavior, which requires changed-package review and runtime proof before public acceptance.

## Highest Permissible Claim

Agent 6 WARN-ACCEPTED the fallback export shape for the 13 display-integrity rows only. No public/runtime mutation or acceptance is cleared until a changed package and runtime proof receive a later Agent 6 docket.
