# Agent 4 Agent 6 Repo-Dirt Classification Support Gate Proof - 2026-06-05

Status: `validator_authored_and_passed_blocker_preserved`.

Boundary: validator/prereq evidence only. No cleanup, staging, deletion, revert, QA acceptance, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, answer eligibility, publication readiness, accepted text, or release action.

## target

`agent6-repo-dirt-classification-support`

## files

| Path | SHA-256 | Role |
| --- | --- | --- |
| `scripts/validate_agent6_repo_dirt_classification_support.mjs` | `d7de4ad1627557a042aeca4db2d9c73328372163bbe73d4d40942c197ef18487` | New narrow validator for Agent 6 repo-dirt classification support. |
| `reports/agent6-repo-dirt-classification-support-2026-06-05.json` | `df5408aa7919de8ea2ab8f3f891c2a2cde6708ad8f2ed1ecf5d97dd556527e6f` | Agent 6 non-destructive repo-dirt classification support docket. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent6_repo_dirt_classification_support.mjs reports\agent6-repo-dirt-classification-support-2026-06-05.json` | pass: dirty records 17239; tracked deletions 12231; untracked 3496; blockers 6. |

## counts

| Metric | Count |
| --- | ---: |
| Dirty records total | 17239 |
| Tracked deletions | 12231 |
| Tracked modified | 1490 |
| Tracked added | 22 |
| Untracked | 3496 |
| `data/public-hud` records | 11937 |
| Report records | 2777 |
| Site-page records | 1541 |
| Script records | 442 |
| `data/control` records | 16 |
| Deleted `data/public-hud` records | 11937 |
| Deleted reports | 236 |
| Deleted scripts | 55 |
| Exact blockers | 6 |

## result

`target | agent6-repo-dirt-classification-support | files in packet | commands passed: new Agent6 repo-dirt classification support validator | counts: 17239 dirty records, 12231 tracked deletions, 1490 tracked modified, 22 tracked added, 3496 untracked, 11937 data/public-hud records, 2777 report records, 442 script records, 6 exact blockers | result: validator authored and passed; classification-only blocker preserved | blocker if any: public HUD package truth, provenance/recountability, control truth, runtime public claims, source provenance claims, and destructive cleanup remain blocked | next handoff: Agent10/Agent5/Agent7/Agent1/owner per blocker owner; no Agent4 cleanup action | stop condition: do not rerun unless repo-dirt classification support docket, validator, or classified dirty state changes`

## blockers

| Blocker | Evidence | Handoff owner |
| --- | --- | --- |
| `public_hud_package_truth_blocked` | 11937 tracked deletions under `data/public-hud`. | Agent 10 |
| `provenance_and_validator_recountability_blocked` | 236 deleted reports and 55 deleted scripts. | Agent 5/7 plus source worker lanes |
| `control_truth_blocked_if_untracked_files_are_relied_on` | 16 untracked `data/control` files. | Agent 5/7 |
| `runtime_public_claims_blocked` | 1541 dirty site-page records and 49 dirty tanakh records. | Agent 10 with Agent 4 proof after changed package |
| `source_provenance_claims_blocked` | Untracked or modified source/lexical/translation-memory data. | Agent 1 then Agent 6 if QA-relevant |
| `destructive_cleanup_not_authorized` | Classification only; blind cleanup forbidden. | Owner |

## next handoff

Agent 4 should not clean this state. Agent 10 owns public HUD/package truth, Agent 5/7 own provenance/control recountability, Agent 1 owns source provenance, and owner authorization is required for destructive cleanup.

## stop condition

Stop at classification-only validator/prereq evidence. Do not rerun unless the repo-dirt classification support docket, validator, or classified dirty state changes.
