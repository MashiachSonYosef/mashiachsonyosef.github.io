# Agent 4 Partition Overlap Diagnostic Index Gate Proof

Target: Agent 3 old-dictionary candidate-use partition overlap diagnostic index gate.

Changed input: `reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json`.

Commands:
- `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-queue-partition-blocker-second-continuation-2026-06-06.json` with `60000ms`: passed.
- `node scripts\validate_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs --input=reports\agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json` with `60000ms`: transient pre-settle count mismatch on batch diagnostic totals.
- `node scripts\validate_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs --input=reports\agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json` with `60000ms`: passed after the file showed expected counts.

Counts:
- `65` input queue rows and `363` queue/source pairs.
- `0` queue overlap rows and `0` queue/source pair overlap rows.
- `7` source RID diagnostic overlaps.
- `9` batch ID diagnostic overlaps.
- Batch diagnostics: `117` cross references, `207` single references, `3109` cross occurrences, `3256` single occurrences.
- `0` source-family selection claims, source acceptance claims, source text rows, route writes, public runtime mutations, accepted text rows, release actions, or acceptance claims.

Result: validated Agent 3 partition-overlap diagnostic index as navigation-only evidence.

Blockers:
- `source_rid_overlap_diagnostic_only`: downstream packages must use queue_id/source_rid pairs and must not collapse source RIDs across queue partitions.
- `batch_id_overlap_diagnostic_only`: downstream packages must preserve queue/source-pair partition authority.
- `no_source_or_acceptance_authority`: no source text, source-family selection, route writes, runtime mutation, release action, or accepted text authority is present.

Handoff owner: Agent 3 for partition-overlap diagnostics; Agent 10 for release/package intake only after required boundary packets exist.

Stop condition: stop after validating and packaging the Agent3 partition overlap diagnostic index as an Agent4 gate proof.
