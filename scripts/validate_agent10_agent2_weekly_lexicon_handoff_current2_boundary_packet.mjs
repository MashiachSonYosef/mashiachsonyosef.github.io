#!/usr/bin/env node
import fs from 'node:fs';

const packetPath = 'reports/agent10-agent6-ready-agent2-weekly-lexicon-handoff-current2-boundary-packet-2026-06-04.json';
const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

assert(packet.artifact_type === 'agent10_agent6_ready_agent2_weekly_lexicon_handoff_current2_boundary_packet', 'unexpected artifact_type');
assert(packet.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / controlled Spark support', 'unexpected active_mode');
assert(packet.status === 'agent6_ready_agent2_weekly_lexicon_handoff_current2_packet_not_accepted', 'unexpected status');
assert(packet.review_scope === 'current_nonpublic_definition_lemma_reader_hint_pipeline_planning_evidence_only', 'unexpected review_scope');
assert(packet.review_question?.includes('non-public definition/lemma/reader-hint pipeline planning evidence only'), 'review question must stay non-public planning only');

for (const [field, expected] of Object.entries({
  runnable_pipelines: 7,
  runnable_outputs_checked: 7,
  deuteronomy_partition_candidate_text_export_rows: 0,
  deuteronomy_partition_answer_eligible_rows: 0,
  deuteronomy_partition_public_emit_rows: 0,
  definition_workbench_1000_sample_rows: 1000,
  definition_workbench_5000_sample_rows: 5000,
  old_dictionary_lane_planning_rows: 500,
  old_dictionary_next_missed_rows: 50,
  orot_missed_dictionary_candidate_rows: 0,
  orot_counterpart_preview_approved_patch_rows: 0,
  orot_counterpart_preview_answer_rows_emitted: 0,
  orot_counterpart_preview_public_hud_rows_emitted: 0,
  orot_counterpart_preview_route_jsonl_rows_emitted: 0,
  orot_reader_hint_candidate_patch_rows: 31
})) {
  assert(packet.counts?.[field] === expected, `counts.${field} expected ${expected}`);
}

for (const [field, value] of Object.entries(packet.zero_output_counts || {})) {
  assert(value === 0, `zero_output_counts.${field} must be 0`);
}

assert(packet.blocker_read?.old_dictionary_downstream_candidate_text_use === 'still_requires_new_exact_agent6_boundary', 'old dictionary downstream use blocker missing');
assert(packet.blocker_read?.missing_joined_definition_workbench_sample_artifact_contract === true, 'joined workbench sample blocker missing');
assert(packet.blocker_read?.orot_counterpart_preview_not_promotable_without_agent6_boundary === true, 'Orot counterpart boundary blocker missing');
assert(packet.blocker_read?.no_new_agent2_exact_workset_after_deuteronomy_return === true, 'no-new-Agent2-workset blocker missing');

for (const forbidden of [
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'accepted gloss/text',
  'commercial export permission',
  'NC commercial authorization'
]) {
  assert(packet.what_must_not_be_accepted?.includes(forbidden), `missing forbidden claim ${forbidden}`);
}

console.log(JSON.stringify({
  ok: true,
  validated_packet: packetPath,
  completed_at: new Date().toISOString(),
  boundary: 'Agent 10 Agent2 current2 weekly lexicon handoff boundary packet validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.'
}, null, 2));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
