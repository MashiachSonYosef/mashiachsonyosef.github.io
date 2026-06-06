#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-gate-proof-coverage-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of ['linkage_navigation_only', 'gate_proof_coverage_crossmatch_only', 'downstream_proof_presence_observation_only']) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'qa_acceptance',
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
const rows = artifact.coverage_rows || [];
expect(rows.length === counts.coverage_rows, 'coverage row length mismatch');
expect(counts.coverage_rows === 14, 'expected 14 coverage rows');
expect(counts.agent3_artifacts_checked === 14, 'expected 14 Agent 3 artifacts checked');
expect(counts.direct_gate_proof_rows === 5, 'expected 5 direct gate-proof rows');
expect(counts.aggregate_handoff_gate_proof_rows === 9, 'expected 9 aggregate handoff gate-proof rows');
expect(counts.rows_with_any_gate_proof === 12, 'expected 12 rows with any gate proof');
expect(counts.direct_and_aggregate_gate_proof_rows === 2, 'expected 2 direct+aggregate rows');
expect(counts.aggregate_only_gate_proof_rows === 7, 'expected 7 aggregate-only rows');
expect(counts.direct_only_gate_proof_rows === 3, 'expected 3 direct-only rows');
expect(counts.missing_gate_proof_rows === 2, 'expected 2 missing gate-proof rows');
expect(counts.exact_blocker_rows === 2, 'expected 2 exact blocker rows');
expect(counts.candidate_use_rows === 78, 'expected 78 candidate-use rows');
expect(counts.candidate_use_occurrences === 1461, 'expected 1461 candidate-use occurrences');
expect(counts.source_rid_references === 393, 'expected 393 source RID refs');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.source_citation_missing_rows === 78, 'expected 78 missing source-citation rows');
expect(counts.transform_rule_missing_rows === 78, 'expected 78 missing transform-rule rows');
expect(counts.route_recheck_required_rows === 1, 'expected 1 route recheck required row');
expect(counts.direct_gate_proof_authority_issue_rows === 0, 'expected zero direct gate-proof authority issue rows');
expect(counts.agent3_authority_issue_rows === 0, 'expected zero Agent 3 authority issue rows');
expect(counts.transform_ready_rows === 0, 'expected zero transform-ready rows');

for (const key of [
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
  'export_rows',
  'release_actions',
  'source_acceptance_claims',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const expectedMissing = new Set(['boundary_chain_crossmatch', 'source_citation_dependency_crossmatch']);
const missingRows = rows.filter((row) => row.gate_proof_status === 'missing_gate_proof_row');
expect(missingRows.length === expectedMissing.size, 'missing row count mismatch');
for (const row of missingRows) {
  expect(expectedMissing.has(row.role), `unexpected missing gate-proof role ${row.role}`);
  expect(Boolean(row.exact_blocker), `missing row ${row.role} needs exact blocker`);
}

for (const row of rows) {
  expect(row.evidence_role === 'gate_proof_coverage_navigation_only_no_acceptance_claim', `${row.role} evidence_role mismatch`);
  expect(row.agent3_authority_counter_sum === 0, `${row.role} Agent 3 authority counter must be zero`);
  expect(row.direct_gate_proof_authority_counter_sum === 0, `${row.role} direct gate-proof authority counter must be zero`);
  expect(fs.existsSync(path.resolve(root, row.agent3_artifact_path)), `${row.role} Agent 3 artifact missing`);
  if (row.direct_gate_proof_path) {
    expect(fs.existsSync(path.resolve(root, row.direct_gate_proof_path)), `${row.role} direct gate-proof artifact missing`);
  }
  if (row.aggregate_handoff_gate_proof_path) {
    expect(
      fs.existsSync(path.resolve(root, row.aggregate_handoff_gate_proof_path)),
      `${row.role} aggregate handoff gate-proof artifact missing`,
    );
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Agent 3 gate-proof coverage passed: rows=${counts.coverage_rows} any_gate=${counts.rows_with_any_gate_proof} missing=${counts.missing_gate_proof_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/validate_agent3_old_dictionary_candidate_use_gate_proof_coverage_crossmatch.mjs [--input=PATH]',
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
