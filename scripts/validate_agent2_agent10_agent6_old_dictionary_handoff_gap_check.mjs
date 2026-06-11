#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(
  process.argv[2] || 'reports/agent2-agent10-agent6-old-dictionary-handoff-gap-check-2026-06-05.json',
);
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_agent10_agent6_old_dictionary_handoff_gap_check', 'artifact_type mismatch');
expect(
  artifact.target === 'old-dictionary transform/readiness continuation from Agent 1 classified lanes',
  'target mismatch',
);

for (const filePath of artifact.files_used || []) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(filePath))), `referenced file missing: ${filePath}`);
}
expect((artifact.files_used || []).length === 5, 'files_used must include exactly 5 inputs');
expect(fs.existsSync(path.join(root, cleanRelativePath(artifact.output_artifact_path))), 'output artifact path must exist');

const candidateUsePacket = readJson('reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json');
expect(candidateUsePacket.exact_subset?.row_count === 78, 'Agent10 morphology candidate-use packet rows must be 78');
expect(candidateUsePacket.exact_subset?.occurrence_count === 1461, 'Agent10 morphology candidate-use packet occurrences must be 1461');
expect(candidateUsePacket.exact_subset?.license_lane === 'commercial_clean_candidate', 'Agent10 morphology lane mismatch');
expect(
  candidateUsePacket.candidate_use_request?.requested_candidate_use_scope === 'nonpublic_candidate_use_planning_input_only',
  'Agent10 candidate-use scope mismatch',
);

const transformPacket = readJson(
  'reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json',
);
expect(transformPacket.commercial_clean_scope?.source_family_count === 3, 'commercial clean packet source family count mismatch');
expect(transformPacket.commercial_clean_scope?.row_count === 500, 'commercial clean packet row count mismatch');
expect(transformPacket.commercial_clean_scope?.occurrence_count === 10940, 'commercial clean packet occurrence count mismatch');
expect(
  transformPacket.allowed_if_warn_accepted?.agent2_may_author_nonpublic_transform_candidate_package === false,
  'commercial clean packet must not allow transform package authoring now',
);

const lanes = artifact.lane_counts_rows_consumed || {};
expect(lanes.agent1_classified_source_family_rows === 5, 'classified source family rows must be 5');
expect(lanes.agent1_audited_rows === 500, 'audited rows must be 500');
expect(lanes.agent1_audited_occurrences === 8427, 'audited occurrences must be 8427');
expect(lanes.commercial_clean_candidate?.source_family_count === 3, 'commercial clean family count must be 3');
expect(lanes.commercial_clean_candidate?.transform_readiness_rows === 500, 'commercial clean readiness rows must be 500');
expect(lanes.commercial_clean_candidate?.transform_readiness_occurrences === 10940, 'commercial clean readiness occurrences must be 10940');
expect(lanes.commercial_clean_candidate?.exact_morphology_candidate_use_rows === 78, 'exact morphology rows must be 78');
expect(lanes.commercial_clean_candidate?.exact_morphology_candidate_use_occurrences === 1461, 'exact morphology occurrences must be 1461');
expect(lanes.commercial_clean_candidate?.definition_lemma_reader_hint_rows_allowed_now === 0, 'commercial clean output rows must be 0');
expect(lanes.noncommercial_educational_candidate?.rows === 214, 'NC rows must be 214');
expect(lanes.noncommercial_educational_candidate?.commercial_export_allowed === false, 'NC commercial export must be false');
expect(lanes.noncommercial_educational_candidate?.derived_from_nc === true, 'NC derived flag must be true');
expect(lanes.noncommercial_educational_candidate?.attribution_required === true, 'NC attribution flag must be true');
expect(lanes.metadata_or_link_only?.rows === 0, 'metadata/link rows must be 0');
expect(lanes.blocked_or_needs_review?.rows === 222, 'blocked/review rows must be 222');
expect(lanes.candidate_text_rows_consumed_now === 0, 'candidate text rows consumed must be 0');
expect(lanes.definition_lemma_reader_hint_rows_consumed_now === 0, 'definition/lemma/reader-hint rows consumed must be 0');
expect(lanes.answer_eligible_rows_now === 0, 'answer eligible rows must be 0');
expect(lanes.public_emit_rows_now === 0, 'public emit rows must be 0');

const gap = artifact.handoff_gap_check || {};
expect(gap.agent10_agent6_ready_morphology_candidate_use_packet_exists === true, 'morphology candidate-use packet existence must be true');
expect(gap.exact_candidate_use_subset_rows === 78, 'gap exact rows must be 78');
expect(gap.exact_candidate_use_subset_occurrences === 1461, 'gap exact occurrences must be 1461');
expect(gap.candidate_use_scope === 'nonpublic_candidate_use_planning_input_only', 'gap candidate-use scope mismatch');

for (const blocker of [
  'await_agent6_candidate_use_boundary_for_78_old_dictionary_morphology_planning_rows',
  'actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
  'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
  'missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform',
  'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis',
]) {
  expect((artifact.exact_blockers || []).includes(blocker), `missing exact blocker: ${blocker}`);
}

const owners = artifact.handoff_owner || {};
expect(owners.agent10?.includes('package/routing'), 'Agent 10 handoff owner text mismatch');
expect(owners.agent6?.includes('pass/warn/block'), 'Agent 6 handoff owner text mismatch');
expect(owners.agent1?.includes('NC lane evidence'), 'Agent 1 handoff owner text mismatch');
expect(owners.agent2?.includes('zero-output'), 'Agent 2 handoff owner text mismatch');

for (const record of artifact.command_timeout_records || []) {
  expect(record.command, 'timeout record command required');
  expect(Number.isInteger(record.timeout_ms) && record.timeout_ms > 0, 'timeout record timeout required');
  expect(record.timed_out === false, 'timeout record should not be timed out');
  expect(record.partial_output_or_artifact, 'timeout record partial artifact required');
  expect(record.next_safe_action, 'timeout record next safe action required');
}

const stop = artifact.stop_condition || '';
for (const phrase of [
  'Do not emit definition/lemma/reader-hint content',
  'candidate text',
  'answer rows',
  'public/runtime mutations',
  'route writes',
  'source-license/legal acceptance',
  'publication readiness',
  'release action',
]) {
  expect(stop.includes(phrase), `stop condition missing phrase: ${phrase}`);
}

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No definition/lemma/reader-hint content storage',
  'No publication readiness',
  'No release action',
]) {
  expect((artifact.non_acceptance_boundary || []).includes(boundary), `missing boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 Agent10/6 old-dictionary handoff gap check validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent10/6 old-dictionary handoff gap check validation passed. Exact candidate-use subset: 78 rows; transform output rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
