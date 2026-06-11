#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-full-source-name-custody-partitions-validation-result-2026-06-04.json';

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
  const rows = artifact.partition_rows || [];
  const counts = artifact.license_partition_counts || {};

  assert(artifact.artifact_type === 'agent1_workbench_full_source_name_custody_partitions', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_full_source_name_custody_partitions_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.input_file_count === 10, 'input file count must be 10');
  assert(artifact.counts?.source_row_count === 105747, 'source row count must be 105747');
  assert(artifact.counts?.source_name_partition_count === 351, 'source-name partition count must be 351');
  assert(rows.length === 351, 'partition_rows must include all 351 partitions');

  assert(counts['Public Domain']?.partition_count === 307, 'Public Domain partition count must be 307');
  assert(counts['Public Domain']?.source_row_count === 99045, 'Public Domain row count must be 99045');
  assert(counts['CC-BY-SA']?.partition_count === 37, 'CC-BY-SA partition count must be 37');
  assert(counts['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA row count must be 5581');
  assert(counts['CC-BY']?.partition_count === 5, 'CC-BY partition count must be 5');
  assert(counts['CC-BY']?.source_row_count === 625, 'CC-BY row count must be 625');
  assert(counts.CC0?.partition_count === 2, 'CC0 partition count must be 2');
  assert(counts.CC0?.source_row_count === 496, 'CC0 row count must be 496');

  const summedRows = rows.reduce((sum, row) => sum + row.source_row_count, 0);
  assert(summedRows === artifact.counts.source_row_count, 'partition source rows must sum to source row count');

  for (const row of rows) {
    assert(row.license_lane === 'commercial_clean_candidate', 'row lane must be commercial_clean_candidate');
    assert(row.derived_from_nc === false, 'row must not be NC-derived');
    assert(row.corpus_contamination === false, 'row corpus contamination must be false');
    assert(row.agent6_boundary_required === true, 'row Agent 6 boundary must be true');
    assert(row.answer_eligible === false, 'row answer eligible must be false');
    assert(row.public_emit === false, 'row public emit must be false');
    assert(row.boundary_status === 'full_source_name_partition_evidence_until_agent6_boundary', 'row boundary status mismatch');
  }

  assert(artifact.export_rule?.public_emit_now === false, 'public emit must be false now');
  assert(artifact.export_rule?.answer_eligible_now === false, 'answer eligible must be false now');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_row_count: artifact.counts.source_row_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    license_partition_counts: counts,
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
