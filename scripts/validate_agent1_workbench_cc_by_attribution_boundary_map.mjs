#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-cc-by-attribution-boundary-map-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-cc-by-attribution-boundary-map-validation-result-2026-06-04.json';

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
  const declared = source.license_partition_counts?.['CC-BY'];
  const rows = artifact.rows || [];

  assert(artifact.artifact_type === 'agent1_workbench_cc_by_attribution_boundary_map', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_cc_by_attribution_boundary_map_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(declared?.partition_count === 5, 'declared CC-BY partition count must be 5');
  assert(declared?.source_row_count === 625, 'declared CC-BY source row count must be 625');
  assert(artifact.counts?.declared_cc_by_partition_count === declared.partition_count, 'declared partition count mismatch');
  assert(artifact.counts?.declared_cc_by_source_row_count === declared.source_row_count, 'declared source row count mismatch');
  assert(rows.length === artifact.counts?.sampled_cc_by_partition_count, 'sampled row count mismatch');
  assert(rows.length === 1, 'expected one sampled CC-BY top partition');
  assert(rows.reduce((sum, row) => sum + row.source_row_count, 0) === artifact.counts?.sampled_cc_by_source_row_count, 'sampled source row count mismatch');

  for (const row of rows) {
    assert(row.license_label === 'CC-BY', 'row license must be CC-BY');
    assert(row.attribution_required === true, 'row attribution required must be true');
    assert(row.derived_from_nc === false, 'row must not be NC-derived');
    assert(row.commercial_export_allowed === true, 'row commercial export field remains true subject to boundary');
    assert(row.share_alike_required === false, 'row share-alike must be false');
    assert(row.corpus_contamination === false, 'row corpus contamination must be false');
    assert(row.agent6_boundary_required === true, 'row Agent 6 boundary must be true');
    assert(row.answer_eligible === false, 'row answer eligible must be false');
    assert(row.public_emit === false, 'row public emit must be false');
    assert(row.boundary_status === 'metadata_or_link_only_until_agent6_attribution_boundary', 'row boundary status mismatch');
  }

  assert(artifact.export_rule?.cc_by_requires_attribution_boundary === true, 'CC-BY attribution boundary rule missing');
  assert(artifact.export_rule?.cc_by_export_authorized_now === false, 'CC-BY export must not be authorized now');
  assert(artifact.exact_blocker?.id === 'cc_by_attribution_boundary_required', 'exact blocker id mismatch');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_cc_by_export_authorization === true, 'no CC-BY export authorization boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    declared_cc_by_partition_count: artifact.counts.declared_cc_by_partition_count,
    declared_cc_by_source_row_count: artifact.counts.declared_cc_by_source_row_count,
    sampled_cc_by_partition_count: artifact.counts.sampled_cc_by_partition_count,
    sampled_cc_by_source_row_count: artifact.counts.sampled_cc_by_source_row_count,
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
