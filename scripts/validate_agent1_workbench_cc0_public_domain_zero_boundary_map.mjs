#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-cc0-public-domain-zero-boundary-map-validation-result-2026-06-04.json';

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
  const declared = source.license_partition_counts?.CC0;
  const rows = artifact.rows || [];

  assert(artifact.artifact_type === 'agent1_workbench_cc0_public_domain_zero_boundary_map', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_cc0_public_domain_zero_boundary_map_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(declared?.partition_count === 2, 'declared CC0 partition count must be 2');
  assert(declared?.source_row_count === 496, 'declared CC0 source row count must be 496');
  assert(artifact.counts?.declared_cc0_partition_count === 2, 'artifact declared CC0 partition count must be 2');
  assert(artifact.counts?.declared_cc0_source_row_count === 496, 'artifact declared CC0 source row count must be 496');
  assert(rows.length === 1, 'expected one sampled CC0 top partition');
  assert(artifact.counts?.sampled_cc0_partition_count === 1, 'sampled CC0 partition count must be 1');
  assert(artifact.counts?.sampled_cc0_source_row_count === 267, 'sampled CC0 source row count must be 267');

  for (const row of rows) {
    assert(row.license_label === 'CC0', 'row license must be CC0');
    assert(row.license_lane === 'commercial_clean_candidate', 'row lane must be commercial_clean_candidate');
    assert(row.attribution_required === false, 'row attribution required must be false');
    assert(row.derived_from_nc === false, 'row must not be NC-derived');
    assert(row.commercial_export_allowed === true, 'row commercial export field must be true subject to boundary');
    assert(row.share_alike_required === false, 'row share-alike must be false');
    assert(row.corpus_contamination === false, 'row corpus contamination must be false');
    assert(row.agent6_boundary_required === true, 'row Agent 6 boundary must be true');
    assert(row.answer_eligible === false, 'row answer eligible must be false');
    assert(row.public_emit === false, 'row public emit must be false');
    assert(row.boundary_status === 'cc0_public_domain_zero_candidate_until_agent6_boundary', 'row boundary status mismatch');
  }

  assert(artifact.export_rule?.cc0_public_domain_zero_candidate === true, 'CC0 candidate rule missing');
  assert(artifact.export_rule?.cc0_export_authorized_now === false, 'CC0 export must not be authorized now');
  assert(artifact.exact_blocker?.id === 'cc0_agent6_boundary_required', 'exact blocker id mismatch');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_cc0_export_authorization === true, 'no CC0 export authorization boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    declared_cc0_partition_count: artifact.counts.declared_cc0_partition_count,
    declared_cc0_source_row_count: artifact.counts.declared_cc0_source_row_count,
    sampled_cc0_partition_count: artifact.counts.sampled_cc0_partition_count,
    sampled_cc0_source_row_count: artifact.counts.sampled_cc0_source_row_count,
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
