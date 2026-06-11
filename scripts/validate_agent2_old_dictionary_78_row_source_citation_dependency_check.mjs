#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(
  process.argv[2] || 'reports/agent2-old-dictionary-78-row-source-citation-dependency-check-2026-06-06.json',
);
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.artifact_type === 'agent2_old_dictionary_78_row_source_citation_dependency_check', 'artifact_type mismatch');
expect(
  artifact.target === 'Agent 2 transform-output proposal dependency check after Agent10 source-citation enrichment workset',
  'target mismatch',
);

for (const [key, value] of Object.entries(artifact.files_used || {})) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(value))), `files_used.${key} missing: ${value}`);
}
expect(fs.existsSync(path.join(root, cleanRelativePath(artifact.output_artifact_path))), 'output_artifact_path must exist');

const blocker = readJson(artifact.files_used.agent2_transform_output_blocker);
const blockerValidation = readJson(artifact.files_used.agent2_transform_output_blocker_validation);
const sourceWorkset = readJson(artifact.files_used.agent10_agent1_source_citation_workset);
const routeBlocker = readJson(artifact.files_used.agent10_agent1_source_citation_route_blocker);
const preboundary = readJson(artifact.files_used.preboundary_matrix);
const zeroText = readJson(artifact.files_used.zero_text_package_anchor);

expect(
  blocker.artifact_type === 'agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker',
  'Agent2 blocker artifact_type mismatch',
);
expect(blockerValidation.result === 'passed', 'Agent2 blocker validation must be passed');
expect(
  sourceWorkset.artifact_type === 'agent10_agent1_ready_old_dictionary_78_row_source_citation_enrichment_workset',
  'Agent10 Agent1 source-citation workset artifact_type mismatch',
);
expect(
  sourceWorkset.status === 'ready_for_agent1_source_citation_enrichment_or_exact_blocker',
  'Agent10 Agent1 source-citation workset status mismatch',
);
expect(
  routeBlocker.exact_blocker === 'stale_agent1_registry_target_current_agent1_thread_required',
  'Agent1 route blocker mismatch',
);

const counts = artifact.lane_counts_rows_consumed || {};
expect(counts.rows === 78, 'rows must be 78');
expect(counts.occurrences === 1461, 'occurrences must be 1461');
expect(counts.source_license_lane === 'commercial_clean_candidate', 'source lane mismatch');
expect(counts.relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  counts.morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'morphology status mismatch',
);
for (const key of [
  'candidate_text_rows',
  'definition_lemma_reader_hint_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_writes',
  'accepted_text_rows',
  'export_rows',
  'release_actions',
]) {
  expect(counts[key] === 0, `${key} must be 0`);
}

expect(preboundary.counts?.rows === 78, 'preboundary rows must be 78');
expect(preboundary.counts?.occurrences === 1461, 'preboundary occurrences must be 1461');
expect(zeroText.counts?.rows === 78, 'zero-text rows must be 78');
expect(zeroText.counts?.occurrences === 1461, 'zero-text occurrences must be 1461');
expect(sourceWorkset.workset?.rows === 78, 'source-citation workset rows must be 78');
expect(sourceWorkset.workset?.occurrences === 1461, 'source-citation workset occurrences must be 1461');
expect(sourceWorkset.workset?.missing_field_to_supply === 'source_citation_or_url', 'source-citation missing field mismatch');

const dependency = artifact.dependency_status || {};
expect(dependency.source_citation_or_url_dependency_is_now_agent10_agent1_workset === true, 'dependency flag must be true');
expect(
  dependency.agent10_agent1_workset_status === 'ready_for_agent1_source_citation_enrichment_or_exact_blocker',
  'dependency workset status mismatch',
);
expect(
  dependency.agent10_agent1_route_blocker === 'stale_agent1_registry_target_current_agent1_thread_required',
  'dependency route blocker mismatch',
);
expect(dependency.agent2_transform_matrix_still_blocked === true, 'Agent2 transform matrix must still be blocked');
expect(dependency.source_citation_or_url_supplied_now === false, 'source_citation_or_url must not be marked supplied');
expect(dependency.transform_rule_supplied_now === false, 'transform rule must not be marked supplied');

for (const requiredBlocker of [
  'missing_source_field::source_citation_or_url',
  'missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text',
  'stale_agent1_registry_target_current_agent1_thread_required',
  'missing_source_citation_or_url_for_78_row_subset',
]) {
  expect((artifact.exact_blockers || []).includes(requiredBlocker), `missing exact blocker: ${requiredBlocker}`);
}

for (const [owner, text] of Object.entries(artifact.handoff_owner || {})) {
  expect(typeof text === 'string' && text.length > 0, `handoff_owner.${owner} must be nonempty`);
}
expect(artifact.handoff_owner?.agent1?.includes('source_citation_or_url'), 'Agent1 owner must include source_citation_or_url');
expect(artifact.handoff_owner?.agent5_or_coordination?.includes('current Agent 1 thread'), 'Agent5 owner must mention current Agent 1 thread');
expect(artifact.handoff_owner?.agent2?.includes('blocked'), 'Agent2 owner must remain blocked');

for (const record of artifact.command_timeout_records || []) {
  expect(record.command, 'timeout record command required');
  expect(Number.isInteger(record.timeout_ms) && record.timeout_ms > 0, 'timeout record timeout required');
  expect(record.timed_out === false, 'timeout record must not be timed out');
  expect(record.partial_output_or_artifact, 'timeout record partial output/artifact required');
  expect(record.next_safe_action, 'timeout record next safe action required');
}

const stop = artifact.stop_condition || '';
for (const phrase of [
  'Stop at dependency check',
  'Do not emit transform output',
  'candidate text',
  'definition/lemma/reader-hint content',
  'answer rows',
  'public/runtime mutation',
  'route writes',
  'source-license/legal acceptance',
  'publication readiness',
  'release action',
]) {
  expect(stop.includes(phrase), `stop condition missing phrase: ${phrase}`);
}

for (const forbidden of [
  'Definition authority',
  'answer acceptance',
  'answer eligibility',
  'accepted gloss/text',
  'public/runtime mutation',
  'publication readiness',
  'commercial export authorization',
  'release action',
]) {
  expect((artifact.what_must_not_be_accepted || []).includes(forbidden), `forbidden claim missing: ${forbidden}`);
}

if (issues.length) {
  console.error(`Agent2 source-citation dependency check validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent2 source-citation dependency check validation passed. Rows: 78; occurrences: 1461; Agent1 route blocker preserved.');

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
