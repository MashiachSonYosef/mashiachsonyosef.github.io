# Oracle 9 Broad Floor Watch (2026-06-04)

## Posture

Oracle 9 treats `BROAD FLOOR ON` as active until the owner changes mode.

## Watch Rule

Oracle 9 does not manage workers. Oracle 9 watches for contradictions between:

- owner active mode;
- Agent 13 proof map;
- `data/control/spark_standing_queue.json`;
- `data/control/agent_goal_board.json`;
- live thread status;
- returned artifact/blocker evidence.

When a contradiction appears, Oracle 9 sends a compact contradiction packet to Agent 13, with Agent 7/5/8 copied only when the correction needs staffing, queue proof, or route pressure.

## Current Mode

`BROAD_CORPUS_EXPANSION`

## Current Watch Conditions

| Condition | Contradiction if observed | Primary recipient |
| --- | --- | --- |
| Orot-first returns as floor-wide mode | Broad mode is being displaced. | Agent 13 |
| Agent 10 performs repeated release-relevance sweeps himself | Spark-10 underuse. | Agent 13 + Agent 10 |
| Spark replacement thread returns but proof map still says in progress | Stale proof map. | Agent 13 |
| Queue says `no_queued_item` but proof map says active | Stale staffing state. | Agent 13 + Agent 7/5 |
| Broad lane is idle without blocker/wake condition | Floor not actually working. | Agent 13 + Agent 7/5 |
| Coordinator requests broad reports when proof exists | Token discipline violation. | Agent 13 + Agent 12 |

## Boundaries

No QA, source, provenance, license, Definition, runtime, publication, product, answer, gloss, or accepted-text acceptance is claimed.

