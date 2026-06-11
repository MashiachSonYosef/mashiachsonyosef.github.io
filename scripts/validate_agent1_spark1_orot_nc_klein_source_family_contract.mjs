#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-validation-result-2026-06-04.json';

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

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected contract artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'contract must be runnable validated');
  assert(contract.target?.source_family === 'Klein Dictionary', 'target source family must be Klein Dictionary');
  assert(contract.target?.classification === 'noncommercial_educational_candidate', 'target classification must be NC educational');
  assert(contract.target?.rows === 17, 'target rows must be 17');
  assert(contract.target?.occurrences === 259, 'target occurrences must be 259');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }

  assert(contract.command_or_script?.build === 'node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs', 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs', 'unexpected output validator');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs', 'unexpected contract validator');
  assert(exists('scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs'), 'missing build script');
  assert(exists('scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs'), 'missing output validator');
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');

  assert(output.artifact_type === 'agent1_orot_nc_klein_educational_source_family_map', 'unexpected output artifact type');
  assert(output.family_map?.family === 'Klein Dictionary', 'output family must be Klein Dictionary');
  assert(output.family_map?.license_lane === 'noncommercial_educational_candidate', 'output family lane must be NC educational');
  assert(output.family_map?.rows === 17, 'output rows must be 17');
  assert(output.family_map?.occurrences === 259, 'output occurrences must be 259');

  for (const field of ['derived_from_nc', 'commercial_export_allowed', 'attribution_required', 'corpus_contamination', 'answer_eligible', 'public_emit']) {
    assert(Object.hasOwn(contract.license_flags || {}, field), `contract license flag missing: ${field}`);
  }
  assert(contract.license_flags.derived_from_nc === true, 'derived_from_nc must be true');
  assert(contract.license_flags.commercial_export_allowed === false, 'commercial export must be false');
  assert(contract.license_flags.attribution_required === true, 'attribution must be required');
  assert(contract.license_flags.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'owner use attestation required');
  assert(contract.license_flags.corpus_contamination === false, 'corpus contamination must be false');
  assert(contract.license_flags.answer_eligible === false, 'answer eligibility must be false');
  assert(contract.license_flags.public_emit === false, 'public emit must be false');

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(contract.agent6_boundary_need.includes('no NC storage/display/public/answer/export authorization'), 'Agent 6 NC boundary text required');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    source_family: contract.target.source_family,
    rows: contract.target.rows,
    occurrences: contract.target.occurrences,
    license_lane: contract.license_flags.license_lane,
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
