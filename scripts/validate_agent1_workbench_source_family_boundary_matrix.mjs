#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-source-family-boundary-matrix-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-source-family-boundary-matrix-validation-result-2026-06-04.json';

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
  const row = rows[0];

  assert(artifact.artifact_type === 'agent1_workbench_source_family_boundary_matrix', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_source_family_boundary_matrix_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.counts?.source_family_count === 1, 'source family count must be 1');
  assert(artifact.counts?.source_name_partition_count === 351, 'source-name partition count must be 351');
  assert(artifact.counts?.source_row_count === 105747, 'source row count must be 105747');
  assert(rows.length === 1, 'rows must include one source family');
  assert(row.source_family === 'hebrew_source_text', 'source family must be hebrew_source_text');
  assert(row.partition_count === 351, 'source family partition count must be 351');
  assert(row.source_row_count === 105747, 'source family source rows must be 105747');
  assert(row.license_partition_counts?.['Public Domain']?.partition_count === 307, 'Public Domain partition count must be 307');
  assert(row.license_partition_counts?.['CC-BY-SA']?.partition_count === 37, 'CC-BY-SA partition count must be 37');
  assert(row.license_partition_counts?.['CC-BY']?.partition_count === 5, 'CC-BY partition count must be 5');
  assert(row.license_partition_counts?.CC0?.partition_count === 2, 'CC0 partition count must be 2');
  assert(row.license_lane === 'commercial_clean_candidate', 'source family lane must be commercial_clean_candidate');
  assert(row.derived_from_nc === false, 'source family must not be NC-derived');
  assert(row.corpus_contamination === false, 'source family corpus contamination must be false');
  assert(row.agent6_boundary_required === true, 'source family Agent 6 boundary must be true');
  assert(row.answer_eligible === false, 'source family answer eligible must be false');
  assert(row.public_emit === false, 'source family public emit must be false');
  assert(row.export_authorized_now === false, 'source family export must not be authorized now');
  assert(artifact.export_rule?.all_source_families_export_authorized_now === false, 'all source-family export must be false now');
  assert(artifact.exact_blocker?.id === 'source_family_agent6_boundary_required', 'exact blocker id mismatch');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_export_authorization === true, 'no export authorization boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_family_count: artifact.counts.source_family_count,
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
