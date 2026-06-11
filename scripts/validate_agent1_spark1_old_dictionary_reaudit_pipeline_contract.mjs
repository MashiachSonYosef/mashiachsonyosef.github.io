#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json';

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
  const buildCommand = contract.command_or_script?.build || '';
  const outputValidator = contract.validator?.command || '';
  const contractValidator = contract.validator?.contract_validator || '';
  const expectedLanes = new Set([
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ]);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected contract artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'contract must be runnable validated');
  assert(contract.target?.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');
  assert(contract.target?.audited_rows === 500, 'audited rows must be 500');
  assert(contract.target?.audited_occurrences === 8427, 'audited occurrences must be 8427');
  assert(contract.target?.source_families === 5, 'source family count must be 5');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }

  assert(buildCommand === 'node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs', 'unexpected build command');
  assert(outputValidator === 'node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs', 'unexpected output validator command');
  assert(contractValidator === 'node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs', 'unexpected contract validator command');
  assert(exists('scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs'), 'missing build script');
  assert(exists('scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs'), 'missing output validator');
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');

  for (const lane of contract.required_classifications || []) {
    assert(expectedLanes.has(lane), `unexpected required classification: ${lane}`);
  }

  assert(output.workset === contract.target.workset, 'output workset must match contract');
  assert(output.evidence_counts?.audited_rows === contract.target.audited_rows, 'output audited rows mismatch');
  assert(output.evidence_counts?.audited_occurrences === contract.target.audited_occurrences, 'output audited occurrences mismatch');
  assert((output.source_families || []).length === contract.target.source_families, 'output source family count mismatch');
  assert(output.lane_source_family_counts?.commercial_clean_candidate === 3, 'commercial clean family count mismatch');
  assert(output.lane_source_family_counts?.noncommercial_educational_candidate === 1, 'NC family count mismatch');
  assert(output.lane_source_family_counts?.blocked_or_needs_review === 1, 'blocked/review family count mismatch');

  const byFamily = Object.fromEntries(output.source_families.map((family) => [family.source_family, family]));
  assert(byFamily['Klein Dictionary']?.license_lane === 'noncommercial_educational_candidate', 'Klein must remain NC educational');
  assert(byFamily['Klein Dictionary']?.nc_flags?.commercial_export_allowed === false, 'Klein commercial_export_allowed must be false');
  assert(byFamily['Klein Dictionary']?.nc_flags?.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'Klein owner use attestation required');
  assert(byFamily['BDB Augmented Strong']?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must remain blocked/review');

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC educational export must be separate');
  assert(contract.export_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked/review must emit no candidate text');
  assert(contract.agent6_boundary_need.includes('Agent 6'), 'Agent 6 boundary need must be named');

  for (const forbidden of contract.what_must_not_be_accepted || []) {
    assert(typeof forbidden === 'string' && forbidden.length > 0, 'forbidden acceptance field must be named');
  }

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    workset: contract.target.workset,
    audited_rows: contract.target.audited_rows,
    audited_occurrences: contract.target.audited_occurrences,
    source_families: contract.target.source_families,
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
