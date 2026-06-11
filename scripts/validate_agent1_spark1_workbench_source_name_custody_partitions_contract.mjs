#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-workbench-source-name-custody-partitions-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-name-custody-partitions-validation-result-2026-06-04.json';

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
  const partitions = readJson(contract.outputs.json);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'unexpected contract status');
  assert(contract.target?.workset === 'workbench-source-name-custody-partitions', 'unexpected workset');
  assert(contract.target?.input_file_count === 10, 'input file count must be 10');
  assert(contract.target?.source_row_count === 105747, 'source row count must be 105747');
  assert(contract.target?.unique_work_count === 1112, 'unique work count must be 1112');
  assert(contract.target?.unique_source_id_count === 1144, 'unique source id count must be 1144');
  assert(contract.target?.source_name_partition_count === 351, 'source-name partition count must be 351');
  assert(contract.target?.top_partition_count === 100, 'top partition count must be 100');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');
  assert(contract.command_or_script?.build === 'node scripts/build_agent1_workbench_source_name_custody_partitions.mjs', 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_workbench_source_name_custody_partitions.mjs', 'unexpected output validator');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_workbench_source_name_custody_partitions_contract.mjs', 'unexpected contract validator');

  assert(partitions.artifact_type === 'agent1_workbench_source_name_custody_partitions', 'unexpected partitions artifact_type');
  assert(partitions.counts?.source_row_count === contract.target.source_row_count, 'partition source row count mismatch');
  assert(partitions.counts?.unique_work_count === contract.target.unique_work_count, 'partition unique work count mismatch');
  assert(partitions.counts?.unique_source_id_count === contract.target.unique_source_id_count, 'partition source id count mismatch');
  assert(partitions.counts?.source_name_partition_count === contract.target.source_name_partition_count, 'partition source-name count mismatch');
  assert((partitions.top_partitions || []).length === contract.target.top_partition_count, 'top partition count mismatch');

  const expected = contract.expected_classification_from_current_evidence?.commercial_clean_candidate;
  assert(expected?.source_rows === 105747, 'commercial clean source rows must be 105747');
  assert(expected?.source_name_partitions === 351, 'commercial clean partition count must be 351');
  assert(expected?.share_alike_boundary_source_rows === 5581, 'share-alike source rows must be 5581');
  assert(expected?.share_alike_boundary_partitions === 37, 'share-alike partition count must be 37');
  assert(expected?.attribution_required_source_rows === 6206, 'attribution source rows must be 6206');
  assert(contract.expected_classification_from_current_evidence?.noncommercial_educational_candidate?.source_rows === 0, 'NC source rows must be zero');

  assert(partitions.license_partition_counts?.['Public Domain']?.partition_count === 307, 'Public Domain partition count must be 307');
  assert(partitions.license_partition_counts?.['Public Domain']?.source_row_count === 99045, 'Public Domain source rows must be 99045');
  assert(partitions.license_partition_counts?.['CC-BY-SA']?.partition_count === 37, 'CC-BY-SA partition count must be 37');
  assert(partitions.license_partition_counts?.['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA source rows must be 5581');
  assert(partitions.license_partition_counts?.['CC-BY']?.partition_count === 5, 'CC-BY partition count must be 5');
  assert(partitions.license_partition_counts?.['CC-BY']?.source_row_count === 625, 'CC-BY source rows must be 625');
  assert(partitions.license_partition_counts?.CC0?.partition_count === 2, 'CC0 partition count must be 2');
  assert(partitions.license_partition_counts?.CC0?.source_row_count === 496, 'CC0 source rows must be 496');

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(contract.export_rule?.cc_by_sa_requires_share_alike_boundary === true, 'CC-BY-SA boundary flag required');
  assert(contract.export_rule?.commercial_export_allowed_now === false, 'contract must not authorize commercial export now');
  assert(contract.export_rule?.public_emit_now === false, 'contract must not authorize public emit now');
  assert(contract.export_rule?.answer_eligible_now === false, 'contract must not authorize answers now');
  assert(contract.agent6_boundary_need.includes('CC-BY-SA'), 'Agent 6 boundary must mention CC-BY-SA');
  assert((contract.what_must_not_be_accepted || []).includes('CC-BY-SA commercial export authorization'), 'CC-BY-SA export authorization must not be accepted');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    workset: contract.target.workset,
    source_row_count: contract.target.source_row_count,
    source_name_partition_count: contract.target.source_name_partition_count,
    top_partition_count: contract.target.top_partition_count,
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
