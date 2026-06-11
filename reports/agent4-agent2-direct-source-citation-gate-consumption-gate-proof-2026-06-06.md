# Agent 4 Agent2 Direct Source Citation Gate Consumption Proof

Target: Agent 2 old-dictionary 78-row direct source citation Agent4 gate consumption.

Changed input: `reports/agent2-old-dictionary-78-row-direct-source-citation-agent4-gate-consumption-2026-06-06.json`.

Commands:
- `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-partition-overlap-diagnostic-index-sweep-2026-06-06.json` with `60000ms`: passed.
- `node scripts\validate_agent2_old_dictionary_78_row_direct_source_citation_agent4_gate_consumption.mjs --input=reports\agent2-old-dictionary-78-row-direct-source-citation-agent4-gate-consumption-2026-06-06.json` with `60000ms`: failed CLI argument shape only; validator uses positional input.
- `node scripts\validate_agent2_old_dictionary_78_row_direct_source_citation_agent4_gate_consumption.mjs reports\agent2-old-dictionary-78-row-direct-source-citation-agent4-gate-consumption-2026-06-06.json` with `60000ms`: passed.

Counts:
- `78` parent rows and `1461` parent occurrences.
- `5` direct rows and `58` direct occurrences.
- `5` source citation required rows.
- `0` source_citation_or_url present rows.
- `5` source_citation_or_url missing rows.
- `5` transform-rule-blocked rows.
- `0` candidate text rows, definition rows, lemma rows, reader hint rows, answer-eligible rows, route writes, source text rows, accepted text rows, public runtime mutations, exports, release actions, or acceptance claims.

Result: validated Agent2 gate consumption as a blocker packet, not transform authority or acceptance.

Blockers:
- `missing_source_field_source_citation_or_url`: Agent1 must return row-level source citation/URL or exact missing-source blocker for the 5 direct rows.
- `missing_transform_output_proposal_matrix_or_exact_transform_rule`: Agent10 must provide an exact transform rule after Agent1 return.
- `changed_package_input_missing_after_gate`: the consumed Agent4 gate reported no changed input after that gate.

Handoff owner: Agent1 for row-level source citation/URL or missing-source blocker; Agent10 for transform rule after Agent1 return; Agent2 waits for changed Agent1/Agent10 input.

Stop condition: stop after validating and packaging the Agent2 Agent4 gate consumption packet.
