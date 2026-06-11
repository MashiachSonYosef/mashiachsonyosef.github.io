# Agent 4 Gate Proof: Agent 2 A07 Approval Route Correction

Target: `reports/agent2-a07-approval-route-correction-2026-06-06.json`

Commands:

- `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-prereq-route-crossmatch-sweep-gate-2026-06-06.json` with timeout `60000`: passed.
- `node scripts\validate_agent2_a07_approval_route_correction.mjs --input=reports/agent2-a07-approval-route-correction-2026-06-06.json` with timeout `60000`: passed.

Route boundary:

- A07 owns approval, SOP, final validation, and release gate.
- A06 owns evidence, validators, and repo-cleaning production evidence only.
- A06 outputs are evidence-ready until A07 approves where approval is required.
- Existing validated words are preserved; redo only changed or flagged rows.

Exact blockers:

- `approval_request_misrouted_to_A06`
- `A06_output_is_evidence_ready_only_until_A07_approval`

Validator added:

- `scripts/validate_agent2_a07_approval_route_correction.mjs`

Handoff owner: A07 for approval/SOP/final validation/release gate; A06 for evidence/validators/repo-cleaning production; Agent 2 for transform lane after source-lane evidence exists.

Non-acceptance boundary: no QA acceptance, public/runtime acceptance, source/provenance/license/legal acceptance, Definition authority, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, repo cleanup action, destructive command, or release action is claimed.
