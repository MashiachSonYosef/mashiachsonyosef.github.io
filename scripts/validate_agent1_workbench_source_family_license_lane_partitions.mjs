#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-source-family-license-lane-partitions-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-source-family-license-lane-partitions-validation-result-2026-06-04.json';

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
  const totalPartitions = rows.reduce((sum, row) => sum + row.source_name_partition_count, 0);
  const totalRows = rows.reduce((sum, row) => sum + row.source_row_count, 0);

  assert(artifact.artifact_type === 'agent1_workbench_source_family_license_lane_partitions', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_source_family_license_lane_partitions_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.counts?.source_family_license_lane_partition_count === rows.length, 'partition count mismatch');
  assert(artifact.counts?.source_family_license_lane_partition_count === 4, 'partition count must be 4');
  assert(artifact.counts?.source_family_count === 1, 'source family count must be 1');
  assert(artifact.counts?.source_name_partition_count === 351, 'source-name partition count must be 351');
  assert(artifact.counts?.source_row_count === 105747, 'source row count must be 105747');
  assert(totalPartitions === artifact.counts.source_name_partition_count, 'row partition total mismatch');
  assert(totalRows === artifact.counts.source_row_count, 'row source total mismatch');
  assert(artifact.counts.commercial_clean_source_name_partition_count === 351, 'commercial-clean source-name partition count must be 351');
  assert(artifact.counts.commercial_clean_source_row_count === 105747, 'commercial-clean source row count must be 105747');
  assert(artifact.counts.noncommercial_educational_source_name_partition_count === 0, 'NC partition count must be zero');
  assert(artifact.counts.blocked_or_needs_review_source_name_partition_count === 0, 'blocked/review partition count must be zero');

  for (const row of rows) {
    assert(row.source_family === 'hebrew_source_text', 'unexpected source family');
    assert(row.license_lane === 'commercial_clean_candidate', 'unexpected license lane');
    assert(row.agent6_boundary_required === true, 'Agent 6 boundary flag missing');
    assert(row.answer_eligible === false, 'answer eligibility must be false');
    assert(row.public_emit === false, 'public emit must be false');
    assert(row.export_authorized_now === false, 'export authorization must be false');
    assert(row.corpus_contamination === false, 'corpus contamination must be false');
  }
  const byLicense = Object.fromEntries(rows.map((row) => [row.license_label, row]));
  assert(byLicense['Public Domain']?.source_name_partition_count === 307, 'Public Domain partitions must be 307');
  assert(byLicense['Public Domain']?.source_row_count === 99045, 'Public Domain rows must be 99045');
  assert(byLicense['CC-BY-SA']?.source_name_partition_count === 37, 'CC-BY-SA partitions must be 37');
  assert(byLicense['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA rows must be 5581');
  assert(byLicense['CC-BY']?.source_name_partition_count === 5, 'CC-BY partitions must be 5');
  assert(byLicense['CC-BY']?.source_row_count === 625, 'CC-BY rows must be 625');
  assert(byLicense.CC0?.source_name_partition_count === 2, 'CC0 partitions must be 2');
  assert(byLicense.CC0?.source_row_count === 496, 'CC0 rows must be 496');
  assert(artifact.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial clean export exclusion missing');
  assert(artifact.export_rule?.all_partitions_export_authorized_now === false, 'export authorization must be false');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'source/license non-acceptance missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
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
