#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'route_overlay_only',
  'approval_sop_final_validation_release_gate_owner_a07',
  'evidence_validators_repo_cleaning_production_owner_a06',
  'a06_outputs_evidence_ready_until_a07_approves',
  'do_not_ask_a06_for_approval',
  'existing_validated_words_preserved',
  'redo_only_changed_or_flagged_rows',
]) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}

for (const key of [
  'a06_approval_requested',
  'qa_acceptance',
  'agent6_acceptance',
  'agent7_acceptance',
  'source_family_selection',
  'source_provenance_acceptance',
  'source_license_acceptance',
  'source_legal_acceptance',
  'source_citation_supplied_by_agent3',
  'transform_authority',
  'source_text_read',
  'candidate_text_export',
  'definition_content_storage',
  'lemma_content_storage',
  'reader_hint_content_storage',
  'usage_as_definition_authority',
  'definition_authority',
  'answer_selection',
  'answer_eligibility',
  'route_ranking',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const rows = artifact.overlay_rows || [];
const links = rows.flatMap((row) => row.source_rid_links || []);

expect(rows.length === counts.overlay_rows, 'overlay row length mismatch');
expect(links.length === counts.source_rid_route_links, 'source-RID link length mismatch');
expect((artifact.downstream_workset_rows || []).length === counts.downstream_workset_summary_rows, 'workset summary length mismatch');
expect((artifact.prefix_rows || []).length === counts.prefix_rows, 'prefix row length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_closure_rows === 14, 'expected 14 input closure rows');
expect(counts.input_direct_prereq_rows === 5, 'expected 5 direct prereq input rows');
expect(counts.input_a06_prereq_rows === 25, 'expected 25 A06 prereq input rows');
expect(counts.overlay_rows === 14, 'expected 14 overlay rows');
expect(counts.overlay_occurrences === 173, 'expected 173 overlay occurrences');
expect(counts.source_rid_route_links === 30, 'expected 30 source-RID route links');
expect(counts.unique_source_rids === 30, 'expected 30 unique source RIDs');
expect(counts.direct_source_citation_workset_rows === 5, 'expected 5 direct workset rows');
expect(counts.direct_source_citation_workset_occurrences === 58, 'expected 58 direct workset occurrences');
expect(counts.a06_evidence_boundary_workset_rows === 9, 'expected 9 A06 evidence workset rows');
expect(counts.a06_evidence_boundary_workset_occurrences === 115, 'expected 115 A06 workset occurrences');
expect(counts.mixed_or_missing_workset_rows === 0, 'expected zero mixed/missing workset rows');
expect(counts.direct_source_citation_prereq_links === 5, 'expected 5 direct prereq links');
expect(counts.a06_evidence_boundary_prereq_links === 25, 'expected 25 A06 prereq links');
expect(counts.missing_prereq_detail_links === 0, 'expected zero missing prereq detail links');
expect(counts.source_rid_links_with_prereq_detail === 30, 'expected 30 source-RID links with prereq detail');
expect(counts.source_rid_links_missing_prereq_detail === 0, 'expected zero source-RID links missing prereq detail');
expect(counts.source_citation_required_links === 30, 'expected 30 links requiring source citation');
expect(counts.source_citation_or_url_present_links === 0, 'expected zero links with source citation present');
expect(counts.transform_rule_still_blocked_links === 30, 'expected 30 transform-blocked links');
expect(counts.source_rid_blocker_links_present === 30, 'expected 30 source-RID blocker links present');
expect(counts.queue_source_coverage_links_present === 0, 'expected zero queue/source coverage links present');
expect(counts.a07_approval_route_rows === 14, 'expected A07 route on every row');
expect(counts.a06_evidence_validator_only_rows === 14, 'expected A06 evidence-only route on every row');
expect(counts.a06_approval_requested_rows === 0, 'expected zero A06 approval requests');
expect(counts.a06_outputs_evidence_ready_until_a07_rows === 14, 'expected evidence-ready-until-A07 flag on every row');
expect(counts.do_not_ask_a06_for_approval_rows === 14, 'expected do-not-ask-A06 flag on every row');
expect(counts.existing_validated_words_preserved_rows === 14, 'expected existing-words-preserved flag on every row');
expect(counts.redo_only_changed_or_flagged_rows === 14, 'expected redo-only-changed flag on every row');
expect(counts.rows_with_current_blockers === 14, 'expected current blockers on every row');
expect(counts.current_blocker_total === 140, 'expected 140 current blockers');
expect(counts.downstream_workset_summary_rows === 2, 'expected two downstream workset summaries');
expect(counts.exact_blocker_rows === 2, 'expected two exact blocker summaries');

for (const key of [
  'source_family_selection_claims',
  'source_acceptance_claims',
  'source_license_acceptance_claims',
  'source_legal_acceptance_claims',
  'source_citation_supplied_by_agent3_rows',
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'source_text_rows',
  'accepted_text_rows',
  'public_runtime_mutation',
  'publication_or_release_claims',
  'release_actions',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const overlayIds = new Set();
const queueIds = new Set();
for (const row of rows) {
  expect(!overlayIds.has(row.overlay_row_id), `duplicate overlay row ID ${row.overlay_row_id}`);
  overlayIds.add(row.overlay_row_id);
  expect(!queueIds.has(row.queue_id), `duplicate queue ID ${row.queue_id}`);
  queueIds.add(row.queue_id);
  expect(row.approval_route_owner === 'A07', `${row.queue_id} approval owner must be A07`);
  expect(row.evidence_validator_owner === 'A06', `${row.queue_id} evidence owner must be A06`);
  expect(row.a06_approval_requested === false, `${row.queue_id} must not request A06 approval`);
  expect(row.a06_outputs_are_evidence_ready_until_a07_approves === true, `${row.queue_id} must preserve A06 evidence-ready boundary`);
  expect(row.do_not_ask_a06_for_approval === true, `${row.queue_id} must preserve do-not-ask-A06 flag`);
  expect(row.existing_validated_words_preserved === true, `${row.queue_id} must preserve existing validated words`);
  expect(row.redo_only_changed_or_flagged_rows === true, `${row.queue_id} must preserve redo-only-changed rule`);
  expect(row.status === 'blocked_navigation_evidence_only', `${row.queue_id} status mismatch`);
  expect(row.no_acceptance_claims === true, `${row.queue_id} must have no acceptance claims`);
  expect(row.no_definition_authority === true, `${row.queue_id} must have no definition authority`);
  expect(row.no_answer_selection === true, `${row.queue_id} must have no answer selection`);
  expect(row.no_publication_or_runtime_claim === true, `${row.queue_id} must have no publication/runtime claim`);
  expect(row.current_blocker_count === 10, `${row.queue_id} expected 10 current blockers`);
  expect(row.current_blocker_count === (row.current_blocker_ids || []).length, `${row.queue_id} blocker count mismatch`);
  expect(row.source_rid_link_count === (row.source_rid_links || []).length, `${row.queue_id} source-RID link count mismatch`);
  expect(row.missing_prereq_detail_link_count === 0, `${row.queue_id} missing prereq detail links must be zero`);
  expect(row.next_safe_action?.includes('A07'), `${row.queue_id} next safe action must mention A07`);
  if (row.downstream_workset === 'direct_source_citation_prereq_workset') {
    expect(row.direct_source_citation_prereq_link_count === row.source_rid_link_count, `${row.queue_id} direct link count mismatch`);
    expect(row.a06_evidence_boundary_prereq_link_count === 0, `${row.queue_id} direct row must have no A06 links`);
    expect(row.exact_blocker === 'a07_route_overlay_direct_source_citation_prereq_still_blocked', `${row.queue_id} direct blocker mismatch`);
  } else if (row.downstream_workset === 'a06_evidence_boundary_prereq_workset') {
    expect(row.a06_evidence_boundary_prereq_link_count === row.source_rid_link_count, `${row.queue_id} A06 link count mismatch`);
    expect(row.direct_source_citation_prereq_link_count === 0, `${row.queue_id} A06 row must have no direct links`);
    expect(
      row.exact_blocker === 'a07_route_overlay_a06_evidence_boundary_prereq_still_blocked_no_a06_approval',
      `${row.queue_id} A06 blocker mismatch`,
    );
  } else {
    expect(false, `${row.queue_id} unexpected downstream workset ${row.downstream_workset}`);
  }
}

for (const link of links) {
  expect(link.prereq_detail_present === true, `${link.source_rid} prereq detail must be present`);
  expect(link.source_citation_required === true, `${link.source_rid} source citation required`);
  expect(link.source_citation_or_url_present === false, `${link.source_rid} source citation must be absent`);
  expect(link.transform_rule_still_blocked === true, `${link.source_rid} transform must stay blocked`);
  expect(link.source_rid_blocker_row_present === true, `${link.source_rid} source-RID blocker row must be present`);
  expect(link.queue_source_coverage_row_present === false, `${link.source_rid} queue/source coverage must be absent`);
  expect(link.a06_approval_requested === false, `${link.source_rid} must not request A06 approval`);
  expect(link.a07_approval_route_owner === true, `${link.source_rid} must preserve A07 route`);
  expect(link.route_write_allowed === false, `${link.source_rid} route write must be false`);
  expect(link.candidate_text_allowed === false, `${link.source_rid} candidate text must be false`);
  expect(link.public_mutation_allowed === false, `${link.source_rid} public mutation must be false`);
}

expect(rows.filter((row) => row.downstream_workset === 'direct_source_citation_prereq_workset').length === 5, 'expected five direct overlay rows');
expect(rows.filter((row) => row.downstream_workset === 'a06_evidence_boundary_prereq_workset').length === 9, 'expected nine A06 overlay rows');
expect(
  links.some((link) => link.source_rid === 'E00687' && link.overlay_route === 'direct_source_citation_prereq'),
  'expected E00687 direct overlay link',
);

for (const inputPath of [
  artifact.inputs?.closure_matrix,
  artifact.inputs?.direct_prereq_matrix,
  artifact.inputs?.a06_prereq_matrix,
]) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}

expect(artifact.downstream_handoff?.handoff_owner?.includes('A07'), 'handoff owner must include A07');
expect(artifact.downstream_handoff?.handoff_owner?.includes('A06 for evidence/validator production only'), 'handoff owner must preserve A06 evidence-only role');
expect(artifact.downstream_handoff?.next_safe_action?.includes('A07'), 'next safe action must route approval to A07');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('accepted text claim'), 'stop condition must preserve accepted-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 bridge-gap A07/A06 route overlay passed: rows=${counts.overlay_rows} direct=${counts.direct_source_citation_workset_rows} a06=${counts.a06_evidence_boundary_workset_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_a07_a06_route_overlay.mjs [--input=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(arg.slice(arg.indexOf('=') + 1));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}
