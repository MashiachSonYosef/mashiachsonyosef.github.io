# Agent 5 Direct Agent Run Mode Proof - 2026-06-04

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`


Proof shape: `production lane | direct active goal | current artifact or exact blocker | stop condition | proof location`

| production lane | direct active goal | current artifact or exact blocker | stop condition | proof location |
| --- | --- | --- | --- | --- |
| Agent 1 | old-dictionary-excluded-row-license-lane-reaudit | new Agent 1 live thread id 019e975d-dc9f-7020-a7c8-885d083a837e recorded in agent_registry; old Agent 1 019dc487-5973-7693-aebf-fb0a75936f50 is archived and not current capacity | New Agent 1 receives Oracle 9 -> Agent 7/5 handoff for old-dictionary-excluded-row-license-lane-reaudit, or exact delivery blocker is recorded | data/control/spark_standing_queue.json; reports/agent5-broad-floor-queue-proof-2026-06-04.md |
| Agent 2 | definition/reader-hint transforms only after lane separation and changed inputs/new target | reports/agent2-spark2-pipeline-contract-orot-missed-dictionary-reader-hints-2026-06-04.md/json; missing builder/validator; current contract produced 0 candidates | Agent 2 package owner receives changed-input/new-target transform package, or exact builder/validator/input blocker | data/control/spark_standing_queue.json; reports/agent5-broad-floor-queue-proof-2026-06-04.md |
| Agent 3 | linkage/dedupe/navigation packaging; Deuteronomy phase-2 continuation contract | reports/spark3-orot-169-row-route-card-candidate-card-dedupe-contract-run-2026-06-04.md; Deuteronomy phase-2 contract missing exact fields | Agent 3 package owner receives phase-2 contract/package, or exact missing-field blocker | data/control/spark_standing_queue.json; reports/agent5-broad-floor-queue-proof-2026-06-04.md |
| Agent 4 | validator/prereq only on changed package/input | reports/agent4-changed-input-only-wake-condition-2026-06-04.md; no exact changed package/input exists | Agent 4 package owner receives changed-input validator/prereq proof, or exact changed-input blocker remains | data/control/spark_standing_queue.json; reports/agent5-broad-floor-queue-proof-2026-06-04.md |
| Agent 10 | release/package intake after lane separation and release-relevant output | reports/agent10-weekly-lexicon-pipeline-release-integration-2026-06-04.md; reports/agent10-orot-current-goal-audit-2026-06-04.md; exact blocker: no Agent 6 boundary route ready and no release mutation authorized | Agent 10 receives changed release-relevant output and prepares exact Agent 6 boundary route, or exact blocker remains | data/control/spark_standing_queue.json; reports/agent5-broad-floor-queue-proof-2026-06-04.md |

Repo-dirt blocker: material repo dirt requires classification before staging/cleanup. Guardrails: no `git add -A`, no `git reset --hard`, no blind deletion, classification before staging/cleanup. Current proof/control artifacts are untracked in this checkout and must be preserved carefully.

Source lane guardrails: no blanket NC, no blanket blocked, no commercial-clean/NC mixing, no Agent 14 override, `override_language_guardrail`. Classify each source/row subset by actual evidence.

Executive map: all queue/proof work supports four co-equal goals: Hebrew import, NC-and-safer definitions, crossmatch, and validation.

Agent 1 locator correction: new Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e` is the current source/license/custody plus Hebrew import/source-lane classification lane. Old Agent 1 `019dc487-5973-7693-aebf-fb0a75936f50` is archived for good and is not current capacity. Handoff is Oracle 9 -> Agent 7/5 -> new Agent 1; record exact delivery blocker if delivery fails.

Agent 5 executive-support adjustment:

| lane | recallable pipeline state preserved | missing field | owner | stop condition | proof location |
| --- | --- | --- | --- | --- | --- |
| Agent 1 replacement locator | New Agent 1 thread `019e975d-dc9f-7020-a7c8-885d083a837e` is current source/license/custody plus Hebrew import/source-lane classification lane | none | Agent 7/Agent 5 handoff preservation; Agent 1 execution | old-dictionary-excluded-row-license-lane-reaudit handoff delivered or exact delivery blocker recorded | data/control/agent_registry.json; data/control/spark_standing_queue.json |
| Old Agent 1 archive | Old Agent 1 `019dc487-5973-7693-aebf-fb0a75936f50` archived/do-not-use current capacity | none | Agent 5 proof hygiene | old id remains historical only and is not used as current capacity | data/control/agent_registry.json; data/control/agent_goal_board.json |
| Agent 1 -> Agent 2 source-lane gate | Agent 2 transforms only after Agent 1 row/subset source-family classification lanes exist | classified old-dictionary-excluded-row source-family lane artifact | Agent 1 source lane; Agent 2 transform lane | classification artifact exists or exact missing-field blocker remains | data/control/spark_standing_queue.json; data/control/agent_goal_board.json |
| Repo dirt classification | Non-destructive classification before staging/cleanup | lane-owned repo-dirt classification | Agents 1-4/10 direct production lanes | repo dirt classified before any staging/cleanup, or blocker remains | data/control/spark_standing_queue.json |
| Agent 10 direct release | Agent 10 current proof is direct local artifact or exact blocker; Spark artifacts historical only | changed release-relevant output and Agent 6 boundary route | Agent 10 release lane; Agent 5 mechanical release-intake preservation where useful | Agent 10 prepares exact Agent 6 boundary route or exact release blocker remains | data/control/spark_standing_queue.json; reports/agent5-broad-floor-queue-proof-2026-06-04.md |

Restore coordination posture: Agents 1/2/3/4/10 are treated as directly restored/woken on locked live thread IDs. Agent 5 coordinates only artifact-or-exact-blocker returns. Old Agent 1 `019dc487-5973-7693-aebf-fb0a75936f50` is archived/do-not-use current capacity.

| worker | locked live thread id | current return rule |
| --- | --- | --- |
| Agent 1 | `019e975d-dc9f-7020-a7c8-885d083a837e` | source/license/custody artifact or exact blocker |
| Agent 2 | `019e027b-7533-7272-9474-7abaf8712b29` | definition/reader-hint artifact or exact blocker |
| Agent 3 | `019e7b9a-4e62-7612-81ed-1f454ceff70e` | linkage/crossmatch artifact or exact blocker |
| Agent 4 | `019e7be8-19d9-79f3-b193-08b5f047ec86` | validation/prereq artifact or exact blocker |
| Agent 10 | `019e85ac-94ff-7a00-8aef-3dffdbe3c657` | release/package artifact or exact blocker |

Process timeout rule: every local command, validator, server, watcher, browser automation, repo scan, or helper must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts. Timeout report shape: `process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`. Do not retry the same hung command without changed timeout, scope, or stop condition. A still-running process is not evidence or validation.

Current Agent 7 management/control record: `reports/agent7-restore-control-process-timeout-record-2026-06-05.md`. Agent 6 callable path was verified by resume and the correction was delivered non-interrupting to `019e7f09-a04b-7f30-b36c-87aa8ecaae5d`, submission `019e9a08-6b74-7413-9561-b0632b570cf1`. Apply to Agent 6 repo-dirt classification, validation scripts, git scans, queue checks, queued-item validation, and helper processes.

Spark-10 correction: existing Spark-10-named outputs are preserved only as historical/support evidence. Current Agent 10 proof is direct Agent 10 local artifact or exact blocker; no Spark-10 queue, shadow, submission, success, or failure is current capacity proof.

## Full-TBD Render Lane Ack - 2026-06-06

Callback: `A05_FULL_TBD_RENDER_LANE_ACK | ack | ordinary corpus source pages may render with full TBD display integrity; TBD remains display-integrity placeholder only and approval occurs at the TBD -> definition layer | data/sources/daniel.json (work_id daniel, work_slug tanakh/daniel) as next safe non-Orot ordinary corpus render queue source after exact render command confirmation | blocker: pipeline_shape_proof_and_exact_non_orot_render_command_needed_before_run | coordinate with Agent 8 for queue order and duplicate-work avoidance | Agent 7 gate not needed for ordinary corpus-visible source-page render; Agent 7/Agent 10 gate needed only for featured/proved/Orot-style promotion | no publication/release/source-license/legal/Definition/product/answer/accepted-text acceptance; no Orot mutation; no repo cleanup action`

Process timeout record: `process_timeout | rg -n "TBD|source page|source-page|render|pre-HUD|default-definition|definition" . | 30s | broad scan timed out | next_safe_action: do not retry same scope; use narrowed scripts/control/report/source-catalog scans`.

No acceptance claims.
