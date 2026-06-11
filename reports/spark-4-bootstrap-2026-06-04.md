# Spark bootstrap communication index (2026-06-04)

## Found sparks / identities

- `reports/spark-1-state.md` -> `spark-1`, Agent 1 mimic.
- `reports/spark-2-state.md` -> `spark-2`, communicator identity in discovery.
- `reports/spark-3-state.md` -> `spark-3`, SLEEP_UNASSIGNED discoverability identity.
- `reports/spark-4-state.md` -> `spark-4`, Agent 4 mimic.
- `reports/spark-10-state.md` -> `spark-10`, Agent 10 release-owner mimic.
- `data/control/agent_registry.json` also records `Agent 10` active under `ITer-10`.

## Bounded goal packets assigned

1) READY_FOR_AGENT_1
- Mimic: Agent 1
- Scope: Orot-only source/provenance/linkage pipeline.
- Boundaries: no full corpus audit; no source/provenance acceptance claims.
- Contact/output: `reports/spark-1-state.md`, `reports/agent5-message-from-spark-1.md`, relay surfaces above.

2) READY_FOR_AGENT_2
- Mimic: Agent 2
- Scope: Orot-only answer-eligible / reader-hint / counterpart-display pipeline.
- Boundaries: no global definition work.
- Contact/output: `reports/spark-2-state.md`, relay surfaces above.

3) READY_FOR_AGENT_4
- Mimic: Agent 4
- Scope: Orot-only validation / publication-gate pipeline.
- Boundaries: no broad validation and no acceptance claims.
- Contact/output: `reports/spark-4-state.md`, `reports/agent5-message-from-spark-4.md`, relay surfaces above.

4) READY_FOR_AGENT_10
- Mimic: Agent 10 (`ITer-10`)
- Scope: Orot release/package/public-reader pipeline.
- Boundaries: no old-HUD revival; no broad corpus publish.
- Contact/output: `reports/spark-10-state.md`, `reports/agent10-it-operations-charter-2026-06-01.md`, relay surfaces above.

## Communication rule

If blocked, each blocked spark should ping `spark-14` with:
- blocker
- needed lane
- exact file/artifact
- proposed next prompt