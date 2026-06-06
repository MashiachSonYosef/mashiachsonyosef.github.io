#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-a06-row-level-downstream-blocker-workset-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_workset',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'a06_row_level_downstream_blocker_workset_only',
  'approval_sop_final_validation_release_gate_owner_a07',
  'evidence_validators_repo_cleaning_production_owner_a06',
  'a06_outputs_evidence_ready_until_a07_approves',
  'do_not_ask_a06_for_approval',
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
const rows = artifact.workset_rows || [];
expect(rows.length === counts.workset_rows, 'workset row length mismatch');
expect((artifact.prefix_rows || []).length === counts.prefix_rows, 'prefix row length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_crossmatch_rows === 14, 'expected 14 input crossmatch rows');
expect(counts.input_a06_overlay_rows === 9, 'expected 9 input A06 overlay rows');
expect(counts.input_a06_overlay_source_rid_links === 25, 'expected 25 input A06 source-RID links');
expect(counts.workset_rows === 9, 'expected 9 workset rows');
expect(counts.workset_occurrences === 115, 'expected 115 workset occurrences');
expect(counts.source_rid_links === 25, 'expected 25 source-RID links');
expect(counts.unique_source_rids === 25, 'expected 25 unique source RIDs');
expect(counts.unique_queue_ids === 9, 'expected 9 unique queue IDs');
expect(counts.unique_token_ids === 9, 'expected 9 unique token IDs');
expect(counts.unique_lexicon_entry_ids === 8, 'expected 8 unique lexicon entry IDs');
expect(counts.missing_row_level_downstream_consumption_rows === 9, 'expected 9 missing row-level downstream rows');
expect(counts.broad_agent10_source_citation_context_rows === 9, 'expected broad source-citation context for all rows');
expect(counts.broad_agent10_preboundary_context_rows === 9, 'expected broad preboundary context for all rows');
expect(counts.row_level_agent10_source_citation_overlay_consumed_rows === 0, 'expected zero row-level source-citation consumed rows');
expect(counts.row_level_agent10_preboundary_overlay_consumed_rows === 0, 'expected zero row-level preboundary consumed rows');
expect(counts.agent10_preboundary_agent3_input_null_rows === 9, 'expected Agent 10 Agent 3 null rows');
expect(counts.agent10_agent6_verdict_no_transform_authorized_rows === 9, 'expected no transform authorized rows');
expect(counts.source_citation_required_rows === 9, 'expected source citation required on all rows');
expect(counts.source_citation_or_url_present_rows === 0, 'expected zero source citation present rows');
expect(counts.transform_rule_still_blocked_rows === 9, 'expected transform blocked on all rows');
expect(counts.a07_approval_route_rows === 9, 'expected A07 route on all rows');
expect(counts.a06_evidence_owner_rows === 9, 'expected A06 evidence owner on all rows');
expect(counts.a06_approval_requested_rows === 0, 'expected zero A06 approval requests');
expect(counts.a06_evidence_ready_until_a07_rows === 9, 'expected A06 evidence-ready rows');
expect(counts.do_not_ask_a06_for_approval_rows === 9, 'expected do-not-ask-A06 rows');
expect(counts.prefix_rows === 10, 'expected 10 prefix rows');
expect(counts.exact_blocker_rows === 1, 'expected one exact blocker row');

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

const ids = new Set();
const queueIds = new Set();
let ridLinks = 0;
for (const row of rows) {
  expect(!ids.has(row.workset_row_id), `duplicate workset row ID ${row.workset_row_id}`);
  ids.add(row.workset_row_id);
  expect(!queueIds.has(row.queue_id), `duplicate queue ID ${row.queue_id}`);
  queueIds.add(row.queue_id);
  ridLinks += row.source_rids.length;
  expect(row.missing_row_level_downstream_consumption === true, `${row.queue_id} must be missing row-level downstream consumption`);
  expect(row.broad_agent10_source_citation_context_present === true, `${row.queue_id} broad source-citation context required`);
  expect(row.broad_agent10_preboundary_context_present === true, `${row.queue_id} broad preboundary context required`);
  expect(row.row_level_agent10_source_citation_overlay_consumed === false, `${row.queue_id} row-level source-citation consumed must be false`);
  expect(row.row_level_agent10_preboundary_overlay_consumed === false, `${row.queue_id} row-level preboundary consumed must be false`);
  expect(row.agent10_preboundary_agent3_input_null === true, `${row.queue_id} Agent 10 Agent 3 input null required`);
  expect(row.agent10_agent6_verdict_consumed_no_transform_authorized === true, `${row.queue_id} no transform authorized required`);
  expect(row.required_downstream_fields.length === 10, `${row.queue_id} expected 10 required downstream fields`);
  expect(row.source_citation_required === true, `${row.queue_id} source citation required`);
  expect(row.source_citation_or_url_present === false, `${row.queue_id} source citation must be absent`);
  expect(row.transform_rule_still_blocked === true, `${row.queue_id} transform must remain blocked`);
  expect(row.approval_route_owner === 'A07', `${row.queue_id} approval owner must be A07`);
  expect(row.evidence_validator_owner === 'A06', `${row.queue_id} evidence owner must be A06`);
  expect(row.a06_approval_requested === false, `${row.queue_id} must not request A06 approval`);
  expect(row.a06_evidence_ready_until_a07_approves === true, `${row.queue_id} A06 evidence-ready flag required`);
  expect(row.do_not_ask_a06_for_approval === true, `${row.queue_id} do-not-ask-A06 flag required`);
  expect(row.exact_blocker === 'a06_evidence_boundary_row_level_downstream_intake_missing', `${row.queue_id} exact blocker mismatch`);
  expect(
    row.carried_forward_blocker === 'a06_evidence_boundary_overlay_not_row_level_consumed_downstream_prereqs_missing',
    `${row.queue_id} carried blocker mismatch`,
  );
  expect(row.status === 'blocked_navigation_evidence_only', `${row.queue_id} status mismatch`);
  expect(row.route_write_allowed === false, `${row.queue_id} route write must be false`);
  expect(row.candidate_text_allowed === false, `${row.queue_id} candidate text must be false`);
  expect(row.answer_selection_allowed === false, `${row.queue_id} answer selection must be false`);
  expect(row.public_mutation_allowed === false, `${row.queue_id} public mutation must be false`);
  expect(row.acceptance_claimed === false, `${row.queue_id} acceptance claim must be false`);
  expect(row.next_safe_action.includes('A07'), `${row.queue_id} next safe action must mention A07`);
}
expect(ridLinks === 25, 'workset rows must contain 25 source-RID links');
expect(rows.some((row) => row.queue_id === 'agent2-orot-gap-tok-158f1752a1df' && row.source_rids.length === 3), 'expected D-prefix 3-source row');
expect(rows.some((row) => row.queue_id === 'agent2-orot-gap-tok-c5505fd218da' && row.source_rids.length === 6), 'expected 6-source A/U row');

for (const inputPath of Object.values(artifact.inputs || {})) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.handoff_owner?.includes('A07'), 'handoff owner must include A07');
expect(artifact.downstream_handoff?.handoff_owner?.includes('A06 for evidence/validator production only'), 'handoff owner must preserve A06 role');
expect(artifact.downstream_handoff?.next_safe_action?.includes('9-row / 25-source-RID'), 'next safe action must name exact 9/25 workset');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('accepted text claim'), 'stop condition must preserve accepted-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 A06 row-level downstream blocker workset passed: rows=${counts.workset_rows} sourceRids=${counts.source_rid_links}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_a06_row_level_downstream_blocker_workset.mjs [--input=PATH]',
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
