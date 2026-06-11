#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-cc-by-sa-share-alike-boundary-map-validation-result-2026-06-04.json';

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
  const source = readJson(artifact.input);
  const declared = source.license_partition_counts?.['CC-BY-SA'];
  const rows = artifact.rows || [];

  assert(artifact.artifact_type === 'agent1_workbench_cc_by_sa_share_alike_boundary_map', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_cc_by_sa_share_alike_boundary_map_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(declared?.partition_count === 37, 'declared CC-BY-SA partition count must be 37');
  assert(declared?.source_row_count === 5581, 'declared CC-BY-SA source row count must be 5581');
  assert(artifact.counts?.declared_cc_by_sa_partition_count === declared.partition_count, 'declared partition count mismatch');
  assert(artifact.counts?.declared_cc_by_sa_source_row_count === declared.source_row_count, 'declared source row count mismatch');
  assert(rows.length === artifact.counts?.sampled_cc_by_sa_partition_count, 'sampled row count mismatch');
  assert(rows.length > 0, 'expected sampled CC-BY-SA rows from top partitions');

  const rowSourceCount = rows.reduce((sum, row) => sum + row.source_row_count, 0);
  assert(rowSourceCount === artifact.counts?.sampled_cc_by_sa_source_row_count, 'sampled source row count mismatch');

  for (const row of rows) {
    assert(row.license_label === 'CC-BY-SA', 'row license must be CC-BY-SA');
    assert(row.attribution_required === true, 'row attribution required must be true');
    assert(row.derived_from_nc === false, 'row must not be NC-derived');
    assert(row.commercial_export_allowed === false, 'row commercial export must be false');
    assert(row.share_alike_required === true, 'row share-alike must be true');
    assert(row.corpus_contamination === false, 'row corpus contamination must be false');
    assert(row.agent6_boundary_required === true, 'row Agent 6 boundary must be true');
    assert(row.answer_eligible === false, 'row answer eligible must be false');
    assert(row.public_emit === false, 'row public emit must be false');
    assert(row.boundary_status === 'blocked_or_needs_review_for_export_until_agent6_share_alike_boundary', 'row boundary status mismatch');
  }

  assert(artifact.export_rule?.cc_by_sa_requires_share_alike_boundary === true, 'share-alike boundary rule missing');
  assert(artifact.export_rule?.cc_by_sa_export_allowed_now === false, 'CC-BY-SA export must not be allowed now');
  assert(artifact.exact_blocker?.id === 'cc_by_sa_share_alike_boundary_required', 'exact blocker id mismatch');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_cc_by_sa_commercial_export_authorization === true, 'no CC-BY-SA export authorization boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    declared_cc_by_sa_partition_count: artifact.counts.declared_cc_by_sa_partition_count,
    declared_cc_by_sa_source_row_count: artifact.counts.declared_cc_by_sa_source_row_count,
    sampled_cc_by_sa_partition_count: artifact.counts.sampled_cc_by_sa_partition_count,
    sampled_cc_by_sa_source_row_count: artifact.counts.sampled_cc_by_sa_source_row_count,
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
