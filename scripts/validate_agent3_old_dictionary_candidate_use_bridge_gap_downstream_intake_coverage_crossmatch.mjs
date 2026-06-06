#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input:
    'reports/agent3-old-dictionary-candidate-use-bridge-gap-downstream-intake-coverage-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of [
  'linkage_navigation_only',
  'downstream_intake_coverage_only',
  'approval_sop_final_validation_release_gate_owner_a07',
  'evidence_validators_repo_cleaning_production_owner_a06',
  'a06_outputs_evidence_ready_until_a07_approves',
  'do_not_ask_a06_for_approval',
  'no_row_level_agent10_overlay_consumption_claim',
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
const rows = artifact.crossmatch_rows || [];
expect(rows.length === counts.crossmatch_rows, 'crossmatch row length mismatch');
expect((artifact.downstream_workset_rows || []).length === counts.downstream_workset_summary_rows, 'workset summary length mismatch');
expect((artifact.exact_blocker_rows || []).length === counts.exact_blocker_rows, 'exact blocker row length mismatch');

expect(counts.input_overlay_rows === 14, 'expected 14 input overlay rows');
expect(counts.input_overlay_occurrences === 173, 'expected 173 input overlay occurrences');
expect(counts.input_overlay_source_rid_links === 30, 'expected 30 input source-RID links');
expect(counts.agent2_direct_contract_rows === 5, 'expected 5 Agent 2 direct contract rows');
expect(counts.agent2_direct_contract_validation_passed === 1, 'expected Agent 2 direct validation passed');
expect(counts.agent10_source_citation_workset_rows === 78, 'expected Agent 10 source-citation workset rows 78');
expect(counts.agent10_preboundary_rows === 78, 'expected Agent 10 preboundary rows 78');
expect(counts.agent10_agent6_verdict_rows === 78, 'expected Agent 10 Agent 6 verdict rows 78');
expect(counts.crossmatch_rows === 14, 'expected 14 crossmatch rows');
expect(counts.crossmatch_occurrences === 173, 'expected 173 crossmatch occurrences');
expect(counts.source_rid_links === 30, 'expected 30 source-RID links');
expect(counts.direct_overlay_rows === 5, 'expected 5 direct overlay rows');
expect(counts.direct_overlay_occurrences === 58, 'expected 58 direct overlay occurrences');
expect(counts.direct_overlay_rows_matched_agent2_contract === 5, 'expected 5 direct rows matched to Agent 2 contract');
expect(counts.direct_overlay_rows_missing_agent2_contract_match === 0, 'expected zero missing direct contract matches');
expect(counts.direct_overlay_source_rid_links === 5, 'expected 5 direct source-RID links');
expect(counts.direct_overlay_source_citation_missing_rows === 5, 'expected 5 direct citation-missing rows');
expect(counts.direct_overlay_transform_blocked_rows === 5, 'expected 5 direct transform-blocked rows');
expect(counts.a06_overlay_rows === 9, 'expected 9 A06 overlay rows');
expect(counts.a06_overlay_occurrences === 115, 'expected 115 A06 overlay occurrences');
expect(counts.a06_overlay_source_rid_links === 25, 'expected 25 A06 source-RID links');
expect(counts.a06_overlay_row_level_downstream_consumed_rows === 0, 'expected zero row-level A06 downstream consumed rows');
expect(counts.a06_overlay_row_level_downstream_missing_rows === 9, 'expected 9 row-level A06 downstream missing rows');
expect(counts.broad_agent10_source_citation_workset_context_rows === 14, 'expected broad source-citation context for all rows');
expect(counts.broad_agent10_preboundary_context_rows === 14, 'expected broad preboundary context for all rows');
expect(counts.row_level_agent10_source_citation_overlay_consumed_rows === 0, 'expected zero row-level source-citation overlay consumption rows');
expect(counts.row_level_agent10_preboundary_overlay_consumed_rows === 0, 'expected zero row-level preboundary overlay consumption rows');
expect(counts.agent10_preboundary_agent3_input_null_rows === 14, 'expected Agent 10 preboundary Agent 3 input null for all rows');
expect(counts.agent10_agent6_verdict_no_transform_authorized_rows === 14, 'expected no transform authorized for all rows');
expect(counts.a07_route_correction_present_rows === 14, 'expected A07 route correction present for all rows');
expect(counts.a07_approval_route_rows === 14, 'expected A07 route rows for all rows');
expect(counts.a06_evidence_owner_rows === 14, 'expected A06 evidence owner rows for all rows');
expect(counts.a06_approval_requested_rows === 0, 'expected zero A06 approval requests');
expect(counts.a06_evidence_ready_until_a07_rows === 14, 'expected A06 evidence-ready-until-A07 rows for all rows');
expect(counts.do_not_ask_a06_for_approval_rows === 14, 'expected do-not-ask-A06 rows for all rows');
expect(counts.exact_blocker_rows === 2, 'expected two exact blocker summaries');
expect(counts.downstream_workset_summary_rows === 2, 'expected two downstream workset summaries');

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
for (const row of rows) {
  expect(!ids.has(row.crossmatch_row_id), `duplicate crossmatch row ID ${row.crossmatch_row_id}`);
  ids.add(row.crossmatch_row_id);
  expect(!queueIds.has(row.queue_id), `duplicate queue ID ${row.queue_id}`);
  queueIds.add(row.queue_id);
  expect(row.status === 'blocked_navigation_evidence_only', `${row.queue_id} status mismatch`);
  expect(row.approval_route_owner === 'A07', `${row.queue_id} approval owner must be A07`);
  expect(row.evidence_validator_owner === 'A06', `${row.queue_id} evidence owner must be A06`);
  expect(row.a06_approval_requested === false, `${row.queue_id} must not request A06 approval`);
  expect(row.a06_evidence_ready_until_a07_approves === true, `${row.queue_id} A06 evidence-ready flag required`);
  expect(row.do_not_ask_a06_for_approval === true, `${row.queue_id} do-not-ask-A06 flag required`);
  expect(row.source_citation_required === true, `${row.queue_id} source citation required`);
  expect(row.source_citation_or_url_present === false, `${row.queue_id} source citation must be absent`);
  expect(row.transform_rule_still_blocked === true, `${row.queue_id} transform must stay blocked`);
  expect(row.agent10_source_citation_broad_workset_present === true, `${row.queue_id} broad Agent 10 source-citation context required`);
  expect(row.agent10_preboundary_broad_context_present === true, `${row.queue_id} broad Agent 10 preboundary context required`);
  expect(row.agent10_source_citation_row_level_overlay_consumed === false, `${row.queue_id} must not claim row-level source-citation overlay consumption`);
  expect(row.agent10_preboundary_row_level_overlay_consumed === false, `${row.queue_id} must not claim row-level preboundary overlay consumption`);
  expect(row.agent10_preboundary_agent3_input_null === true, `${row.queue_id} Agent 10 preboundary Agent 3 input must be null`);
  expect(row.agent10_agent6_verdict_consumed_no_transform_authorized === true, `${row.queue_id} no transform authorized required`);
  expect(row.a07_route_correction_present === true, `${row.queue_id} A07 route correction required`);
  expect(row.route_write_allowed === false, `${row.queue_id} route write must be false`);
  expect(row.candidate_text_allowed === false, `${row.queue_id} candidate text must be false`);
  expect(row.answer_selection_allowed === false, `${row.queue_id} answer selection must be false`);
  expect(row.public_mutation_allowed === false, `${row.queue_id} public mutation must be false`);
  expect(row.acceptance_claimed === false, `${row.queue_id} acceptance claim must be false`);
  if (row.downstream_workset === 'direct_source_citation_prereq_workset') {
    expect(
      row.direct_contract_match_status === 'matched_agent2_direct_source_citation_prereq_contract',
      `${row.queue_id} expected direct contract match`,
    );
    expect(row.direct_contract_queue_match === true, `${row.queue_id} expected direct queue match`);
    expect(row.direct_contract_validation_result === 'passed', `${row.queue_id} direct validation result must pass`);
    expect(
      row.exact_blocker === 'direct_source_citation_prereq_matched_but_source_citation_or_url_missing',
      `${row.queue_id} direct exact blocker mismatch`,
    );
  } else if (row.downstream_workset === 'a06_evidence_boundary_prereq_workset') {
    expect(row.direct_contract_match_status === 'not_direct_source_citation_workset', `${row.queue_id} expected non-direct status`);
    expect(
      row.exact_blocker === 'a06_evidence_boundary_overlay_not_row_level_consumed_downstream_prereqs_missing',
      `${row.queue_id} A06 exact blocker mismatch`,
    );
  } else {
    expect(false, `${row.queue_id} unexpected downstream workset ${row.downstream_workset}`);
  }
}

expect(
  rows.some((row) => row.queue_id === 'agent2-orot-gap-tok-e50370ece8ba' && row.direct_contract_row_ids.includes('E00687')),
  'expected E00687 direct contract match',
);

for (const inputPath of Object.values(artifact.inputs || {})) {
  expect(inputPath && fs.existsSync(path.resolve(root, inputPath)), `input path missing: ${inputPath}`);
}

expect(artifact.downstream_handoff?.handoff_owner?.includes('A07'), 'handoff owner must include A07');
expect(artifact.downstream_handoff?.handoff_owner?.includes('A06 evidence/validator production only'), 'handoff owner must preserve A06 evidence-only role');
expect(artifact.downstream_handoff?.next_safe_action?.includes('5 direct rows'), 'next safe action must mention 5 direct rows');
expect(artifact.downstream_handoff?.next_safe_action?.includes('9 A06-boundary rows'), 'next safe action must mention 9 A06 rows');
expect(artifact.downstream_handoff?.stop_condition?.includes('no source text read'), 'stop condition must preserve source-text boundary');
expect(artifact.downstream_handoff?.stop_condition?.includes('accepted text claim'), 'stop condition must preserve accepted-text boundary');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 bridge-gap downstream intake coverage crossmatch passed: rows=${counts.crossmatch_rows} directMatched=${counts.direct_overlay_rows_matched_agent2_contract} a06Missing=${counts.a06_overlay_row_level_downstream_missing_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_bridge_gap_downstream_intake_coverage_crossmatch.mjs [--input=PATH]',
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
