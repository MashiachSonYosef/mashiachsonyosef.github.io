# Agent 4 Selector A07 Boundary Contract Harness Proof

Target: `reports/agent4-changed-input-selection-continuation-4-2026-06-06.json`

Harness change:

- `scripts/select_agent4_changed_input_candidate.mjs` now emits `approval_boundary_trigger` naming A07 approval/SOP/final-validation/release-gate review.
- `scripts/validate_agent4_changed_input_candidate_selection.mjs` validates the new field while remaining compatible with older blocker artifacts.
- The selector non-acceptance boundary now also names repo cleanup action and destructive command as forbidden.

Commands:

- `node scripts\select_agent4_changed_input_candidate.mjs --after=reports\agent4-changed-input-selection-continuation-3-2026-06-06.json --lookbackMs=900000 --out=reports\agent4-changed-input-selection-continuation-4-2026-06-06.json` with timeout `60000`: passed.
- `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-continuation-4-2026-06-06.json` with timeout `60000`: passed.
- `node scripts\validate_agent4_validator_prereq_packet.mjs --input=reports\agent4-changed-input-selection-continuation-4-2026-06-06.json` with timeout `60000`: passed.

Counts:

- Candidate count: `0`
- Newer files scanned: `30`
- Rows: `30`
- Blockers: `1`
- A07 approval-boundary trigger present: `1`

Exact blockers:

- `changed_package_input_missing`
- `selector_contract_was_stale_for_approval_boundary`

Non-acceptance boundary: no QA acceptance, public/runtime acceptance, source/provenance/license/legal acceptance, Definition authority, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, repo cleanup action, destructive command, or release action is claimed.
