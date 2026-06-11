# Agent 4 Selector Lookback Validator Hardening Proof

## Target

`scripts/validate_agent4_changed_input_candidate_selection.mjs`

## Commands

| Command | Timeout | Result |
| --- | ---: | --- |
| `node --check scripts\validate_agent4_changed_input_candidate_selection.mjs` | 30000 ms | passed |
| `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-cross-batch-queue-guard-blocker-continuation-2026-06-06.json` | 30000 ms | passed |
| `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-selector-lookback-patch-no-lookback-2026-06-06.json` | 30000 ms | passed |
| `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-lookback-after-queue-batch-crossmatch-sweep-2026-06-06.json` | 30000 ms | passed |
| `node scripts\validate_agent4_validator_prereq_packet.mjs --input=reports\agent4-changed-input-selection-after-cross-batch-queue-guard-blocker-continuation-2026-06-06.json` | 30000 ms | passed |
| `node scripts\validate_agent4_validator_prereq_packet.mjs --input=reports\agent4-changed-input-selection-after-selector-lookback-patch-no-lookback-2026-06-06.json` | 30000 ms | passed |

## Counts

| Metric | Count |
| --- | ---: |
| Selector outputs checked | 3 |
| Lookback outputs checked | 2 |
| No-lookback outputs checked | 1 |
| Candidate-selection outputs checked | 2 |
| Blocker outputs checked | 1 |
| Already-packaged upstream rows in latest blocker | 2 |
| Latest blocker rows | 28 |
| Latest blocker candidates | 0 |

## Result

The selector-result validator now enforces `lookback_ms`, `scan_start_mtime_ms`, command/lookback consistency, and safe `upstream_input_already_packaged_by_agent4` classification. Existing lookback and no-lookback selector outputs validate under the stricter contract.

## Blocker

`changed_input_required_for_next_upstream_gate`: the latest lookback selector output has `candidate_count=0`. Do not run another upstream validator or packet sweep until a new changed/candidate input appears.

## Boundary

No QA acceptance. No source, provenance, license, legal, Definition, answer, product, publication, public/runtime, route publication, release acceptance, accepted gloss, accepted text, public reader output, public runtime mutation, or release action.
