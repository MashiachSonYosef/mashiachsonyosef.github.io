# Agent 4 Packet Sweep After Partition Overlap Diagnostic Index Proof

Target: Agent 4 validator/prereq packet sweep after partition overlap diagnostic index proof.

Changed input: `reports/agent4-agent3-partition-overlap-diagnostic-index-gate-proof-2026-06-06.json`.

Commands:
- `node scripts\validate_agent4_validator_prereq_packet.mjs --input=reports\agent4-agent3-partition-overlap-diagnostic-index-gate-proof-2026-06-06.json` with `60000ms`: passed.
- `node scripts\validate_agent4_validator_prereq_packet_sweep.mjs --out=reports\agent4-validator-prereq-packet-sweep-result-after-partition-overlap-diagnostic-index-2026-06-06.json` with `180000ms`: process timeout; no result artifact written.
- `node scripts\validate_agent4_validator_prereq_packet_sweep.mjs --out=reports\agent4-validator-prereq-packet-sweep-result-after-partition-overlap-diagnostic-index-2026-06-06.json` with `300000ms`: passed.
- `node scripts\validate_agent4_validator_prereq_packet_sweep_result.mjs --input=reports\agent4-validator-prereq-packet-sweep-result-after-partition-overlap-diagnostic-index-2026-06-06.json` with `60000ms`: passed.

Counts:
- `111` Agent4 packet JSON artifacts checked.
- `111` passed, `0` failed.
- Shapes: `74` proof, `34` proof_with_blocker, `3` blocker.
- Total command rows: `228`.
- Total blocker rows: `171`.

Process timeout:
- command: `node scripts\validate_agent4_validator_prereq_packet_sweep.mjs --out=reports\agent4-validator-prereq-packet-sweep-result-after-partition-overlap-diagnostic-index-2026-06-06.json`
- timeout: `180000ms`
- partial output or artifact: no result artifact was written before timeout.
- next safe action: rerun once with a larger bounded timeout; do not trust absent partial output.

Result: validated the new partition overlap diagnostic index proof and the triggered Agent4 packet sweep.

Boundary: this validates packet shape and command/blocker accounting only. It is not QA acceptance, source custody, publication, public runtime acceptance, answer authority, route publication support, accepted gloss, accepted text, or release action.

Next safe action: run changed-input selection from this sweep wrapper with lookback scanning and validate only a selected changed/candidate input if one appears.
