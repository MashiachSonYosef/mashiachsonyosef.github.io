# Agent 7 Broad Corpus Expansion Control Repair Proof

Date: 2026-06-04

## Decision

Active mode is `BROAD_CORPUS_EXPANSION`.

The prior `OROT_FINISH_FIRST` queue posture is superseded. Orot artifacts now function as blocker evidence inside broader Agent 1-4 production lanes, not as a reason to restore Orot-first.

## Changed Files

- `data/control/spark_standing_queue.json`
- `data/control/agent_goal_board.json`

## Queue Repair

`data/control/spark_standing_queue.json` now records:

- status: `broad_corpus_expansion_control_repair_active`
- active mode: `BROAD_CORPUS_EXPANSION`
- mission: broad corpus expansion with exact-pipeline Spark queue hygiene
- current active next work: Spark-3 `169` local-route-card matrix, `2148` occurrences
- Spark-10 old thread remains blocked/not capacity
- Spark-10 usable release/package mechanics thread remains `019e925b-f976-73f2-a859-af586ac3887c`

## Broad Lane State

Agent 1 / Spark-1:

- Broad source mechanics is no longer policy-frozen.
- Exact blocker: usable Spark-1 replacement/current capacity is still needed for broad mechanics delivery proof.
- Available broad evidence: `reports/untracked-source-scope-audit.md` / `.json`, with 23 untracked source JSON files, 10,727 PD units, and 74,683 CC-BY units.

Agent 2 / Spark-2:

- Broad definition reseed is treated as active from Oracle 9 routing.
- If the broad target workset or exact broad commands are insufficient, Spark-2 should return an exact blocker.
- Current artifact: `reports/spark2-broad-definition-pipeline-mechanics-2026-06-04.md`.

Agent 3 / Spark-3:

- Broad linkage/dedupe/navigation lane is active.
- Current active work: `169` local-route-card matrix, `2148` occurrences.
- Returned broad package: `reports/agent3-production-shaped-provenance-navigation-package-2026-06-04.md` / `.json`, reporting 96/96 stable token/source/work linkage rows and 0 exact-linkage blockers.

Agent 4 / Spark-4:

- Broad validator/runtime-prereq lane is active for exact validator mechanics only.
- Returned warning packet: `reports/agent4-production-shaped-validator-result-packet-2026-06-04.md`.
- Spark artifact: `reports/spark4-broad-validator-runtime-prereq-mechanics-2026-06-04T07-49-10-final.md`.
- No public/runtime acceptance.

Agent 10 / Spark-10:

- Agent 10 is capped to release-relevant broad outputs.
- `reports/agent10-orot-current-goal-audit-2026-06-04.md` is an Orot audit/blocker map, not a request to resume Orot-first.
- Orot current anchor remains 332 rows / 6156 occurrences with zero public/runtime/output/answer/definition/accepted-text emissions.
- No further Orot append/public/runtime mutation is authorized from current evidence.

## Orot Blockers Remapped As Broad Lane Blockers

- Agent 1 then Agent 6: 13 missing lexicon linkage rows / 129 occurrences.
- Agent 2 transform lane: 100 zero-safe blocked fill-producing answer rows / 1960 occurrences.
- Agent 3 / Agent 2 mechanics: 169 local route-card dedupe rows / 2148 occurrences not transform-ready.
- Broad source-route lanes: 186 top500 no-Sefaria-hit rows / 2421 occurrences require bounded source-route work.

## Stop / Escalation

Stop broad Spark execution when a queue item lacks exact commands, input files, output path/schema, package owner, or stop condition. Return `missing_pipeline_blocker`; do not invent pipeline shape.

Escalate to Agent 7 or Agent 13 only for priority/mode conflict. Escalate to Agent 6 only with exact authority-sensitive review packets.

## Boundary

Control repair and queue hygiene only. No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text. Publication remains `blocked_no_render`.
