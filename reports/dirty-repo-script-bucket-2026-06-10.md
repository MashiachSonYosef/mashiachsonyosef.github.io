# Dirty Repo Script Bucket - 2026-06-10

Status: script helper bucket ready for exact-path staging.

## Scope

This packet preserves parse-clean helper and validator scripts from the dirty repo without deleting or reverting anything.

No `git add -A` was used. Two script paths remain intentionally unstaged:

- `scripts/validate_agent7_governance_control.mjs`
- `scripts/run_agent10_it_pulse_scheduled.cmd`

## Counts

- Dirty script paths before staging: 521
- Eligible script paths: 519
- Modified eligible script paths: 36
- Untracked eligible script paths: 483
- Excluded syntax blocker: 1
- Excluded manual-review command wrapper: 1

## Validators

- `node --check` over 515 dirty `.mjs` files: 514 passed, 1 failed.
- PowerShell parser over 5 dirty `.ps1` files: 5 passed.
- `git diff --check -- scripts`: passed with CRLF warnings only.

## Blockers

- `scripts/validate_agent7_governance_control.mjs`: `node --check` fails at byte-order-marker/shebang boundary.
- `scripts/run_agent10_it_pulse_scheduled.cmd`: command wrapper requires manual scheduling/side-effect review before staging.

## Boundary

This is repo hygiene/provenance preservation only. It does not validate runtime product behavior, source/license/legal status, definition authority, accepted text, publication readiness, or scheduled task activation.
