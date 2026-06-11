#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-deuteronomy-source-license-custody-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-deuteronomy-source-license-custody-validation-result-2026-06-04.json';

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
  const outputRows = output.rows || [];
  const expectedLanes = new Set([
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ]);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected contract artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'contract must be runnable validated');
  assert(contract.target?.workset === 'deuteronomy-source-license-custody-map', 'unexpected workset');
  assert(contract.target?.rows === 1334, 'target rows must be 1334');
  assert(contract.target?.occurrences === 2964, 'target occurrences must be 2964');
  assert(contract.target?.commercial_clean_candidate_rows === 1334, 'commercial-clean rows must be 1334');
  assert(contract.target?.noncommercial_educational_candidate_rows === 0, 'NC rows must be zero');
  assert(contract.target?.outside_workset_blocker_rows === 6779, 'outside-workset blocker rows must be 6779');
  assert(contract.target?.outside_workset_blocker_occurrences === 9631, 'outside-workset blocker occurrences must be 9631');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }

  assert(contract.command_or_script?.build === 'node scripts/build_agent1_deuteronomy_source_license_custody_map.mjs', 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_deuteronomy_source_license_custody_map.mjs', 'unexpected output validator command');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs', 'unexpected contract validator command');
  assert(exists('scripts/build_agent1_deuteronomy_source_license_custody_map.mjs'), 'missing build script');
  assert(exists('scripts/validate_agent1_deuteronomy_source_license_custody_map.mjs'), 'missing output validator');
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');

  for (const lane of contract.required_classifications || []) {
    assert(expectedLanes.has(lane), `unexpected required classification: ${lane}`);
  }

  assert(output.artifact_type === 'agent1_deuteronomy_source_license_custody_map', 'unexpected output artifact type');
  assert(output.target === 'tanakh/deuteronomy', 'output target must be tanakh/deuteronomy');
  assert(output.source_license_counts?.row_count_covered === contract.target.rows, 'output row count mismatch');
  assert(output.source_license_counts?.occurrence_count_covered === contract.target.occurrences, 'output occurrence count mismatch');
  assert(output.source_license_counts?.commercial_clean_rows === contract.target.commercial_clean_candidate_rows, 'output commercial-clean rows mismatch');
  assert(output.source_license_counts?.noncommercial_educational_rows === 0, 'output NC rows must be zero');
  assert(outputRows.length === contract.target.rows, 'output row array length mismatch');

  for (const row of outputRows) {
    assert(row.license_lane === 'commercial_clean_candidate', 'row must be commercial-clean in current workset', row);
    assert(row.derived_from_nc === false, 'row derived_from_nc must be false', row);
    assert(row.commercial_export_allowed === false, 'commercial export must remain false until boundary', row);
    assert(row.corpus_contamination === false, 'row corpus_contamination must be false', row);
    assert(row.agent6_boundary_required === true, 'row must require Agent 6 boundary', row);
    assert(row.answer_eligible === false, 'row answer_eligible must be false', row);
    assert(row.public_emit === false, 'row public_emit must be false', row);
    assert(typeof row.source_url_or_citation === 'string' && row.source_url_or_citation.length > 0, 'row source citation required', row);
  }

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC educational export must be separate');
  assert(contract.export_rule?.commercial_export_allowed_now === false, 'commercial export must not be allowed now');
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
    rows: contract.target.rows,
    occurrences: contract.target.occurrences,
    commercial_clean_rows: contract.target.commercial_clean_candidate_rows,
    nc_rows: contract.target.noncommercial_educational_candidate_rows,
    outside_workset_blocker_rows: contract.target.outside_workset_blocker_rows,
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
