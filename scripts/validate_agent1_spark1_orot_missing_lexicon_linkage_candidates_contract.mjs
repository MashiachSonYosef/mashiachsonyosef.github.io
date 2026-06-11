#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-orot-missing-lexicon-linkage-candidates-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-orot-missing-lexicon-linkage-candidates-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

try {
  const contract = readJson(contractPath);
  const artifact = readJson(contract.outputs.json);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'unexpected contract status');
  assert(contract.target?.workset === 'orot-missing-lexicon-linkage-candidates', 'unexpected workset');
  for (const input of contract.inputs || []) assert(exists(input), `missing input: ${input}`);
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');
  assert(contract.command_or_script?.build.includes('build_agent1_orot_missing_lexicon_linkage_candidates.mjs'), 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json', 'unexpected output validator');

  assert(artifact.artifact_type === 'agent1_orot_missing_lexicon_linkage_candidates', 'unexpected candidate artifact_type');
  assert(artifact.counts?.input_rows === 100, 'input rows must be 100');
  assert(artifact.counts?.missing_lexicon_linkage_rows === 13, 'missing linkage rows must be 13');
  assert(artifact.counts?.missing_lexicon_linkage_occurrences === 129, 'missing linkage occurrences must be 129');
  assert(artifact.counts?.mutation_rows_emitted === 0, 'mutation rows emitted must be 0');
  assert(artifact.counts?.source_rows_emitted === 0, 'source rows emitted must be 0');
  assert(artifact.counts?.lexicon_entry_ids_assigned === 0, 'lexicon_entry_ids_assigned must be 0');

  for (const [bucket, expected] of Object.entries(contract.expected_buckets || {})) {
    assert(artifact.counts?.bucket_counts?.[bucket] === expected.rows, `${bucket} row count mismatch`);
    assert(artifact.counts?.bucket_occurrences?.[bucket] === expected.occurrences, `${bucket} occurrence count mismatch`);
  }
  for (const row of artifact.candidates || []) {
    assert(row.mutation_allowed_here === false, `${row.queue_id} mutation_allowed_here must be false`);
    assert(row.missing_field === 'lexicon_entry_id', `${row.queue_id} missing_field must be lexicon_entry_id`);
    for (const edge of row.candidate_edges || []) {
      assert(edge.promote_to_answer === false, `${row.queue_id} edge must not promote_to_answer`);
    }
  }

  assert(contract.export_rule?.lexicon_entry_id_assignment_allowed_now === false, 'contract must not authorize lexicon_entry_id assignment');
  assert(contract.export_rule?.public_emit_now === false, 'contract must not authorize public emit');
  assert(contract.export_rule?.answer_eligible_now === false, 'contract must not authorize answers');
  assert(contract.agent6_boundary_need.includes('before any linkage assignment'), 'Agent 6 boundary must cover linkage assignment');
  assert((contract.what_must_not_be_accepted || []).includes('lexicon_entry_id assignment authorization'), 'lexicon assignment authorization must not be accepted');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    workset: contract.target.workset,
    missing_lexicon_linkage_rows: contract.target.missing_lexicon_linkage_rows,
    missing_lexicon_linkage_occurrences: contract.target.missing_lexicon_linkage_occurrences,
    spark1_routable: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
    boundary: {
      no_source_license_acceptance: true,
      no_qa_acceptance: true,
      no_public_runtime_mutation: true
    }
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
