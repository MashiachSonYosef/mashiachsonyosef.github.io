# Agent2 A07 Approval Route Correction (2026-06-06)

## route law
`A07_APPROVED_WITH_WARNINGS` is effective as routing law only.

## owner split
- A07: approval, SOP, final validation, release gate.
- A06: evidence, validators, repo-cleaning production evidence.
- A06 outputs remain evidence-ready until A07 approves where approval is required.
- Do not ask A06 for approval.

## preservation rule
Existing validated words are preserved. Redo only changed or flagged rows.

## Agent2 boundary
- A02 transforms only after source-lane evidence exists.
- A02 transform output remains non-authoritative until A07 approval where required.
- No publication or release.
- No source/license/legal/Definition/product/answer/accepted-text acceptance.
- No repo cleanup action.
- No destructive command.

## exact blockers if misrouted
- `approval_request_misrouted_to_A06`
- `missing_A07_approval_route_for_approval_sop_final_validation_or_release_gate`
- `A06_output_is_evidence_ready_only_until_A07_approval`

## handoff owner
- A07: approval/SOP/final validation/release gate routing owner.
- A06: evidence/validator/repo-cleaning production evidence owner only.
- A02: transform lane only after source-lane evidence exists; non-authoritative until A07 approval where required.

## stop condition
Preserve this route correction in future packets and redirect approval requests to A07.
