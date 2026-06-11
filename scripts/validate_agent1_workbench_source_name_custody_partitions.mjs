#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-source-name-custody-partitions-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
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
  const artifact = readJson(artifactPath);
  assert(artifact.artifact_type === 'agent1_workbench_source_name_custody_partitions', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_source_name_custody_partitions_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.input_file_count === 10, 'input file count must be 10');
  assert(artifact.counts?.parsed_rows === 105747, 'parsed rows must be 105747');
  assert(artifact.counts?.source_row_count === 105747, 'source rows must be 105747');
  assert(artifact.counts?.unique_source_id_count === 1144, 'unique source id count must be 1144');
  assert(artifact.counts?.unique_work_count === 1112, 'unique work count must be 1112');
  assert(artifact.counts?.source_name_partition_count > 100, 'source-name partition count must be broad');
  assert((artifact.top_partitions || []).length === 100, 'top partition sample must contain 100 rows');

  const totalLicenseRows = Object.values(artifact.license_partition_counts || {}).reduce((sum, row) => sum + row.source_row_count, 0);
  assert(totalLicenseRows === artifact.counts.source_row_count, 'license partition source rows must sum to source rows');
  assert(artifact.license_partition_counts?.['Public Domain']?.source_row_count === 99045, 'Public Domain source rows must be 99045');
  assert(artifact.license_partition_counts?.['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA source rows must be 5581');
  assert(artifact.license_partition_counts?.['CC-BY']?.source_row_count === 625, 'CC-BY source rows must be 625');
  assert(artifact.license_partition_counts?.CC0?.source_row_count === 496, 'CC0 source rows must be 496');

  for (const row of artifact.top_partitions || []) {
    assert(row.license_lane === 'commercial_clean_candidate', 'top partitions must stay commercial-clean candidates pending boundary', row);
    assert(row.derived_from_nc === false, 'top partitions must not be derived_from_nc', row);
    assert(row.corpus_contamination === false, 'corpus contamination must be false', row);
    assert(row.agent6_boundary_required === true, 'Agent 6 boundary required', row);
    assert(row.answer_eligible === false, 'answer eligibility must be false', row);
    assert(row.public_emit === false, 'public emit must be false', row);
    if (row.license_label === 'CC-BY-SA') {
      assert(row.share_alike_required === true, 'CC-BY-SA share alike required', row);
      assert(row.commercial_export_allowed === false, 'CC-BY-SA commercial export flag must be false pending boundary', row);
    }
  }

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  assert(artifact.export_rule?.cc_by_sa_requires_share_alike_boundary === true, 'CC-BY-SA boundary flag required');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_row_count: artifact.counts.source_row_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    top_partition_count: artifact.top_partitions.length
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
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
