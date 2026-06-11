#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-license-bucket-boundary-matrix-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-license-bucket-boundary-matrix-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const artifact = readJson(artifactPath);
  const rows = artifact.rows || [];
  const byLicense = Object.fromEntries(rows.map((row) => [row.license_label, row]));

  assert(artifact.artifact_type === 'agent1_workbench_license_bucket_boundary_matrix', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_license_bucket_boundary_matrix_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.counts?.license_bucket_count === 4, 'license bucket count must be 4');
  assert(artifact.counts?.source_name_partition_count === 351, 'source-name partition count must be 351');
  assert(artifact.counts?.source_row_count === 105747, 'source row count must be 105747');
  assert(rows.length === 4, 'rows must include four license buckets');

  assert(byLicense['Public Domain']?.partition_count === 307, 'Public Domain partitions must be 307');
  assert(byLicense['Public Domain']?.source_row_count === 99045, 'Public Domain rows must be 99045');
  assert(byLicense['CC-BY-SA']?.partition_count === 37, 'CC-BY-SA partitions must be 37');
  assert(byLicense['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA rows must be 5581');
  assert(byLicense['CC-BY']?.partition_count === 5, 'CC-BY partitions must be 5');
  assert(byLicense['CC-BY']?.source_row_count === 625, 'CC-BY rows must be 625');
  assert(byLicense.CC0?.partition_count === 2, 'CC0 partitions must be 2');
  assert(byLicense.CC0?.source_row_count === 496, 'CC0 rows must be 496');

  for (const row of rows) {
    assert(row.license_lane === 'commercial_clean_candidate', 'bucket lane must be commercial_clean_candidate');
    assert(row.derived_from_nc === false, 'bucket must not be NC-derived');
    assert(row.corpus_contamination === false, 'bucket corpus contamination must be false');
    assert(row.agent6_boundary_required === true, 'bucket Agent 6 boundary must be true');
    assert(row.answer_eligible === false, 'bucket answer eligible must be false');
    assert(row.public_emit === false, 'bucket public emit must be false');
    assert(row.export_authorized_now === false, 'bucket export must not be authorized now');
  }

  assert(artifact.export_rule?.all_buckets_export_authorized_now === false, 'all bucket export must be false now');
  assert(artifact.exact_blocker?.id === 'license_bucket_agent6_boundary_required', 'exact blocker id mismatch');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_export_authorization === true, 'no export authorization boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    license_bucket_count: artifact.counts.license_bucket_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
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
