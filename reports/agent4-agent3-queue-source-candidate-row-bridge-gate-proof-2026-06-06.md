# Agent 4 Gate Proof: Agent 3 Queue/Source Candidate-Row Bridge

Target: `reports/agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.json`

Commands:

- `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-recent-intake-snapshot-harness-gap-2026-06-06.json` with timeout `60000`: passed.
- `node scripts\validate_agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge.mjs --input=reports\agent3-old-dictionary-candidate-use-queue-source-candidate-row-bridge-2026-06-06.json` with timeout `120000`: passed.

Counts:

- Candidate bridge rows: `78`
- Input candidate occurrences: `1461`
- Linked candidate rows: `65`
- Outside queue/source subchain rows: `13`
- Linked queue/source blocker rows: `363`
- Unique linked queue/source pair keys: `363`
- Source-RID rows missing from queue/source subchain: `1`
- Exact blocker rows: `2`
- Acceptance claims: `0`
- Public runtime mutation: `0`
- Accepted text rows: `0`

Process timeout recorded:

- `Get-Content scripts\validate_agent3_old_dictionary_candidate_use_queue_source_candidate_row_bridge.mjs -TotalCount 220` timed out at `30000` ms after partial source output.

Result: validated Agent 3 queue/source candidate-row bridge gate.

Exact blockers:

- `candidate_row_bridge_navigation_only`: bridge evidence is navigation only and does not supply citation, transform, answer, or release authority.
- `one_source_rid_missing_from_queue_source_subchain`: one source-RID coverage gap remains in the bridge validator result.

Handoff owner: Agent 10 for release/package intake; Agent 3 for candidate-row bridge contents; Agent 6 only for acceptance-sensitive boundary review.

Non-acceptance boundary: no QA acceptance, public/runtime acceptance, source/provenance/license/legal acceptance, Definition authority, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or release action is claimed.
