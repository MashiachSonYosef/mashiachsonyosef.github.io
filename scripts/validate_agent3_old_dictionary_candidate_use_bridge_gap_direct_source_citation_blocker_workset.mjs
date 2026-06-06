#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-citation-blocker-workset-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'direct_source_citation_blocker_workset_only',
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
expect(counts.input_direct_overlay_rows === 5, 'expected 5 input direct overlay rows');
expect(counts.input_direct_overlay_source_rid_links === 5, 'expected 5 input direct source-RID links');
expect(counts.workset_rows === 5, 'expected 5 workset rows');
expect(counts.workset_occurrences === 58, 'expected 58 workset occurrences');
expect(counts.source_rid_links === 5, 'expected 5 source-RID links');
expect(counts.unique_source_rids === 5, 'expected 5 unique source RIDs');
expect(counts.unique_queue_ids === 5, 'expected 5 unique queue IDs');
expect(counts.unique_token_ids === 5, 'expected 5 unique token IDs');
expect(counts.unique_lexicon_entry_ids === 5, 'expected 5 unique lexicon entry IDs');
expect(counts.agent2_direct_contract_matched_rows === 5, 'expected 5 Agent 2 direct contract matches');
expect(counts.agent2_direct_contract_queue_matched_rows === 5, 'expected 5 Agent 2 queue matches');
expect(counts.agent2_direct_contract_validation_passed_rows === 5, 'expected 5 validation-passed rows');
expect(counts.source_citation_required_rows === 5, 'expected source citation required on all rows');
expect(counts.source_citation_or_url_present_rows === 0, 'expected zero source citation present rows');
expect(counts.direct_contract_source_citation_or_url_present_rows === 0, 'expected zero direct contract source citation present rows');
expect(counts.transform_rule_still_blocked_rows === 5, 'expected transform blocked on all rows');
expect(counts.direct_contract_transform_rule_still_blocked_rows === 5, 'expected direct contract transform blocked rows');
expect(counts.broad_agent10_source_citation_context_rows === 5, 'expected broad source-citation context for all rows');
expect(counts.broad_agent10_preboundary_context_rows === 5, 'expected broad preboundary context for all rows');
expect(counts.row_level_agent10_source_citation_overlay_consumed_rows === 0, 'expected zero row-level source-citation consumed rows');
expect(counts.row_level_agent10_preboundary_overlay_consumed_rows === 0, 'expected zero row-level preboundary consumed rows');
expect(counts.a07_approval_route_rows === 5, 'expected A07 route on all rows');
expect(counts.a06_evidence_owner_rows === 5, 'expected A06 evidence owner on all rows');
expect(counts.a06_approval_requested_rows === 0, 'expected zero A06 approval requests');
expect(counts.a06_evidence_ready_until_a07_rows === 5, 'expected A06 evidence-ready rows');
expect(counts.do_not_ask_a06_for_approval_rows === 5, 'expected do-not-ask-A06 rows');
expect(counts.prefix_rows === 5, 'expected 5 prefix rows');
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
  expect(
    row.agent2_direct_contract_match_status === 'matched_agent2_direct_source_citation_prereq_contract',
    `${row.queue_id} must match Agent 2 direct contract`,
  );
  expect(row.agent2_direct_contract_queue_match === true, `${row.queue_id} Agent 2 queue match required`);
  expect(row.agent2_direct_contract_validation_result === 'passed', `${row.queue_id} direct validation must pass`);
  expect(row.source_citation_required === true, `${row.queue_id} source citation required`);
  expect(row.source_citation_or_url_present === false, `${row.queue_id} source citation must be absent`);
  expect(row.direct_contract_source_citation_or_url_present === false, `${row.queue_id} direct contract source citation must be absent`);
  expect(row.transform_rule_still_blocked === true, `${row.queue_id} transform must stay blocked`);
  expect(row.direct_contract_transform_rule_still_blocked === true, `${row.queue_id} direct contract transform must stay blocked`);
  expect(row.broad_agent10_source_citation_context_present === true, `${row.queue_id} broad source-citation context required`);
  expect(row.broad_agent10_preboundary_context_present === true, `${row.queue_id} broad preboundary context required`);
  expect(row.row_level_agent10_source_citation_overlay_consumed === false, `${row.queue_id} row-level source-citation consumed must be false`);
  expect(row.row_level_agent10_preboundary_overlay_consumed === false, `${row.queue_id} row-level preboundary consumed must be false`);
  expect(row.required_downstream_fields.length === 11, `${row.queue_id} expected 11 required downstream fields`);
  expect(row.approval_route_owner === 'A07', `${row.queue_id} approval owner must be A07`);
  expect(row.evidence_validator_owner === 'A06', `${row.queue_id} evidence owner must be A06`);
  expect(row.a06_approval_requested === false, `${row.queue_id} must not request A06 approval`);
  expect(row.a06_evidence_ready_until_a07_approves === true, `${row.queue_id} A06 evidence-ready flag required`);
  expect(row.do_not_ask_a06_for_approval === true, `${row.queue_id} do-not-ask-A06 flag required`);
  expect(row.exact_blocker === 'direct_source_citation_or_url_missing_after_agent2_intake_match', `${row.queue_id} exact blocker mismatch`);
  expect(
    row.carried_forward_blocker === 'direct_source_citation_prereq_matched_but_source_citation_or_url_missing',
    `${row.queue_id} carried blocker mismatch`,
  );
  expect(row.status === 'blocked_navigation_evidence_only', `${row.queue_id} status mismatch`);
  expect(row.route_write_allowed === false, `${row.queue_id} route write must be false`);
  expect(row.candidate_text_allowed === false, `${row.queue_id} candidate text must be false`);
  expect(row.answer_selection_allowed === false, `${row.queue_id} answer selection must be false`);
  expect(row.public_mutation_allowed === false, `${row.queue_id} public mutation must be false`);
  expect(row.acceptance_claimed === false, `${row.queue_id} acceptance claim must be false`);
  expect(row.next_safe_action.includes('source_citation_or_url'), `${row.queue_id} next safe action must mention source_citation_or_url`);
  expect(row.next_safe_action.includes('A07'), `${row.queue_id} next safe action must mention A07`);
}
expect(ridLinks === 5, 'workset rows must contain 5 source-RID links');
expect(rows.some((row) => row.queue_id === 'agent2-orot-gap-tok-e50370ece8ba' && row.source_rids.includes('E00687')), 'expected E00687 direct blocker row');

for (const inputPath of Object.values(artifact.inputs || {})) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}
expect(artifact.downstream_handoff?.handoff_owner?.includes('Agent 1/Agent 2'), 'handoff owner must include Agent 1/Agent 2');
expect(artifact.downstream_handoff?.handoff_owner?.includes('A07'), 'handoff owner must include A07');
expect(artifact.downstream_handoff?.next_safe_action?.includes('5-row / 5-source-RID'), 'next safe action must name exact 5/5 workset');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('accepted text claim'), 'stop condition must preserve accepted-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 direct source-citation blocker workset passed: rows=${counts.workset_rows} sourceRids=${counts.source_rid_links}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_direct_source_citation_blocker_workset.mjs [--input=PATH]',
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
