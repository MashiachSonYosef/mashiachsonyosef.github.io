# Agent 3 State Builder Preserved-Section Regression

Generated: 2026-06-04T18:11:45.923Z

## Status

- Lane: linkage/dedupe/navigation
- Package owner: Agent 3
- Status: local_validated_commit_blocked
- Bounded delta: locally hardened `scripts/build_agent3_usage_state.mjs` so `reports/agent3-state.md` regeneration preserves known Agent 3 observer and pulse sections.
- Boundary: no usage-as-definition authority, Definition answer selection, route publication support, QA acceptance, source/license acceptance, public/runtime mutation, accepted gloss, or accepted text.

## Inputs

- `scripts/build_agent3_usage_state.mjs`
- `reports/agent3-state.md`
- `reports/agent3-state.json`

## Preserved Sections

| section id | start found | end found |
|---|---:|---:|
| agent3_frontier_receipt_custody_boundary_observer_package | 1 | 1 |
| agent3_deuteronomy_source_license_custody_verdict_continuity | 1 | 1 |
| agent3_linkage_dedupe_generated_at_drift_audit | 1 | 1 |
| agent3_spark10_release_intake_return_observer | 1 | 1 |
| agent3_latest_linkage_pulse | 1 | 1 |

## Counts

- Preserved section pairs configured: 5
- Preserved section starts found after regeneration: 5
- Preserved section ends found after regeneration: 5
- State evidence artifacts present: 59/59
- State validators present: 31/31
- Smoke failed steps: 0

## Validation

- `node --check scripts\build_agent3_usage_state.mjs`: passed
- `node scripts\build_agent3_usage_state.mjs`: passed; state reported `pass_with_warnings`, evidence `59/59`, validators `31/31`
- `rg -n "agent3_frontier_receipt|agent3_deuteronomy_source_license|agent3_linkage_dedupe|agent3_spark10_release|agent3-latest-linkage-pulse" reports\agent3-state.md`: passed; five start markers and five end markers found
- `node scripts\validate_agent3_usage_state.mjs`: passed; evidence `59/59`, validators `31/31`, smoke failed `0`

## Commit Blocker

- Blocked: true
- Reason: `scripts/build_agent3_usage_state.mjs` and `scripts/validate_agent3_usage_state.mjs` already have large pre-existing staged Agent 3 baseline changes.
- Pre-existing staged builder stat: `1010 insertions, 1 deletion`
- Pre-existing staged validator stat: `1575 insertions, 1 deletion`
- Local unstaged preservation delta: `42 insertions, 1 deletion`
- Exact blocker: committing the local preservation delta to the builder would either absorb the pre-existing staged Agent 3 baseline or require rewriting/unstaging another agent's index state.
- Safe path: commit or clear the pre-existing Agent 3 builder/validator baseline first, then commit the preservation delta and rerun `node scripts\build_agent3_usage_state.mjs` plus `node scripts\validate_agent3_usage_state.mjs`.

## Known Risk

The preservation patch is local working-tree evidence until the pre-existing staged Agent 3 builder baseline is committed or cleared. The preservation list is explicit, so new append-only Agent 3 state sections need a marker pair added before relying on `build_agent3_usage_state.mjs` regeneration.

## Next Step

Keep the lane active. If another Agent 3 append-only state section becomes durable, add its marker pair to the preservation list before regeneration.
