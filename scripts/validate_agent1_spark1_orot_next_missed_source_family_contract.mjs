#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-validation-result-2026-06-04.json';

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
  const output = readJson(contract.outputs.json);
  const allowed = new Set([
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ]);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected contract artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'contract must be runnable validated');
  assert(contract.target?.candidate_rows === 50, 'candidate rows must be 50');
  assert(contract.target?.candidate_occurrences === 1193, 'candidate occurrences must be 1193');
  assert(contract.target?.commercial_clean_candidate_rows === 50, 'commercial-clean rows must be 50');
  assert(contract.target?.nc_candidate_rows === 0, 'NC candidate rows must be zero');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }

  assert(contract.command_or_script?.build === 'node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs', 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs', 'unexpected output validator');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs', 'unexpected contract validator');
  assert(exists('scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs'), 'missing build script');
  assert(exists('scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs'), 'missing output validator');
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');

  for (const lane of contract.required_classifications || []) {
    assert(allowed.has(lane), `unexpected lane: ${lane}`);
  }

  assert(output.artifact_type === 'agent1_orot_next_missed_source_family_map', 'unexpected output artifact type');
  assert(output.target_counts?.candidate_rows === 50, 'output candidate rows must be 50');
  assert(output.target_counts?.candidate_occurrences === 1193, 'output candidate occurrences must be 1193');
  assert(output.target_counts?.commercial_clean_candidate_rows === 50, 'output commercial-clean rows must be 50');
  assert(output.target_counts?.noncommercial_educational_candidate_rows === 0, 'output NC rows must be zero');
  assert(output.family_statuses?.metadata_or_link_only?.families?.includes('BDB Augmented Strong'), 'BDB Augmented Strong metadata/link-only family required');
  assert(output.family_statuses?.blocked_or_needs_review?.families?.includes('BDB Augmented Strong'), 'BDB Augmented Strong blocked/review family required');

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(contract.export_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked/review emits no candidate text');
  assert(contract.agent6_boundary_need.includes('Agent 6'), 'Agent 6 boundary must be named');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    rows: contract.target.candidate_rows,
    occurrences: contract.target.candidate_occurrences,
    commercial_clean_rows: contract.target.commercial_clean_candidate_rows,
    nc_rows: contract.target.nc_candidate_rows,
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
