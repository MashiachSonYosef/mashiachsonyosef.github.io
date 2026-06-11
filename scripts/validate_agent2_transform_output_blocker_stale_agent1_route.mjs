#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent2-old-dictionary-78-row-transform-output-proposal-blocker-stale-agent1-route-2026-06-06.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const artifact = readJson(artifactPath);

expect(
  artifact.artifact_type === 'agent2_old_dictionary_78_row_transform_output_proposal_blocker',
  'artifact_type mismatch',
);
expect(
  artifact.target === 'old-dictionary-commercial-clean-78-row-transform-output-proposal-preboundary',
  'target mismatch',
);

for (const field of [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'occurrences',
  'source_family',
  'license_lane',
  'source_rids',
  'morphology_relation_basis',
  'agent2_morphology_relation_status',
  'candidate_use_scope',
  'derived_from_nc',
  'commercial_export_allowed',
  'attribution_required',
  'corpus_contamination',
  'answer_eligible',
  'public_emit',
  'agent6_boundary_required',
  'source_citation_or_url',
]) {
  expect(artifact.required_agent_1_fields?.[field] === true, `required_agent_1_fields.${field} must be true`);
}

expect(
  artifact.transform_action_once_classified?.includes('source_citation_or_url'),
  'transform action must name source_citation_or_url',
);
expect(
  artifact.transform_action_once_classified?.includes('proposed_candidate_text'),
  'transform action must name proposed_candidate_text',
);
expect(
  artifact.transform_action_once_classified?.includes('counters fixed to zero'),
  'transform action must keep counters fixed to zero',
);

for (const path of Object.values(artifact.files_used || {})) {
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const counts = artifact.lane_counts_rows_consumed || {};
expect(counts.rows === 78, 'rows must be 78');
expect(counts.occurrences === 1461, 'occurrences must be 1461');
expect(counts.source_license_lane === 'commercial_clean_candidate', 'source license lane mismatch');
expect(counts.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  counts.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'morphology relation status mismatch',
);
for (const field of [
  'candidate_text_rows',
  'definition_lemma_reader_hint_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'export_rows',
  'release_actions',
]) {
  expect(counts[field] === 0, `lane_counts_rows_consumed.${field} must be 0`);
}

for (const blocker of [
  'missing_source_field::source_citation_or_url',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'next_transform_output_or_candidate_text_boundary_not_supplied',
  'stale_agent1_registry_target_current_agent1_thread_required',
]) {
  expect(artifact.exact_blockers?.includes(blocker), `missing exact blocker: ${blocker}`);
}

expect(artifact.handoff_owner?.agent1?.includes('source_citation_or_url'), 'Agent1 handoff must name source_citation_or_url');
expect(artifact.handoff_owner?.agent5_coordination?.includes('current Agent 1 thread'), 'Agent5 handoff must require current Agent1 thread');
expect(artifact.handoff_owner?.agent2?.includes('do not emit matrix'), 'Agent2 handoff must block matrix emission');
expect(artifact.handoff_owner?.agent6?.includes('narrowed boundary question'), 'Agent6 handoff must stay narrowed');
expect(Array.isArray(artifact.command_timeout_log), 'command_timeout_log must be an array');
expect(artifact.stop_condition?.includes('Do not perform definition/lemma/reader-hint content storage'), 'stop condition mismatch');
expect(artifact.stop_condition?.includes('release action'), 'stop condition must block release action');

console.log(
  `Agent2 transform-output stale-Agent1-route blocker validation passed. Rows: ${counts.rows}; occurrences: ${counts.occurrences}; blockers: ${artifact.exact_blockers.length}.`,
);
