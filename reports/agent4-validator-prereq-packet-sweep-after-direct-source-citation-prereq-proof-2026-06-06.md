# Agent 4 Validator/Prereq Packet Sweep After Direct Source-Citation Prereq

Generated: 2026-06-06T09:18:32.084Z

## Trigger

- New proof: `reports/agent4-agent3-direct-source-citation-prereq-matrix-gate-proof-2026-06-06.json`
- Sweep result JSON: `reports/agent4-validator-prereq-packet-sweep-result-after-direct-source-citation-prereq-2026-06-06.json`

## Commands

| command | timeout | result |
| --- | ---: | --- |
| `node scripts\validate_agent4_validator_prereq_packet_sweep.mjs --out=reports\agent4-validator-prereq-packet-sweep-result-after-direct-source-citation-prereq-2026-06-06.json` | 120000 | passed |
| `node scripts\validate_agent4_validator_prereq_packet_sweep_result.mjs --input=reports\agent4-validator-prereq-packet-sweep-result-after-direct-source-citation-prereq-2026-06-06.json` | 30000 | passed |

## Counts

- Agent4 packet count: 55.
- Passed / failed: 55 / 0.
- Shapes: proof 46, proof_with_blocker 6, blocker 3.
- Total recorded commands / blockers: 134 / 100.

## Boundary

This is validator/prereq corpus hygiene only. It is not QA acceptance, source/provenance/license/legal acceptance, Definition or answer authority, publication readiness, public/runtime acceptance, route publication support, product/data acceptance, accepted gloss, accepted text, public reader output, or release action.
