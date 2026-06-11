#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-orot-third-missed-source-family-map-2026-06-05.json';
const resultPath = 'reports/agent1-orot-third-missed-source-family-pipeline-validation-result-2026-06-05.json';

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
  const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
  const rowSum = rows.length;
  const occurrenceSum = rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);

  assert(artifact.artifact_type === 'agent1_orot_third_missed_source_family_map', 'artifact_type mismatch');
  assert(artifact.target_counts?.commercial_clean_candidate_rows + artifact.target_counts?.noncommercial_educational_candidate_rows + artifact.target_counts?.metadata_or_link_only_rows + artifact.target_counts?.blocked_or_needs_review_rows === rowSum, 'lane row split must sum');
  assert(rowSum === 169, 'row count must be 169');
  assert(occurrenceSum === 2148, 'row occurrence sum must be 2148');
  assert(artifact.target_counts?.candidate_rows === 169, 'candidate_rows must be 169');
  assert(artifact.target_counts?.candidate_occurrences === 2148, 'candidate_occurrences must be 2148');
  assert(artifact.target_counts?.blocked_or_needs_review_rows >= 1, 'blocked_or_needs_review rows must be present until boundary');
  assert(Array.isArray(artifact.source_family_blockers), 'source_family_blockers must be array');
  assert(artifact.source_family_blockers.some((item) => item.lane === 'blocked_or_needs_review'), 'blocked lane blocker must remain present');
  assert(artifact.export_partition_rule?.commercial_clean_exports_exclude_nc_by_default === true, 'commercial-clean export exclusion must be true');
  assert(artifact.export_partition_rule?.nc_educational_export_separate === true, 'NC separation must be true');
  assert(artifact.export_partition_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked lane must emit no candidate text');

  for (const row of rows) {
    assert(Boolean(row.row_subset_id), 'row_subset_id required');
    assert(Boolean(row.token_id_or_row_id), 'token_id_or_row_id required');
    assert(Boolean(row.source_family), 'source_family required');
    assert(Boolean(row.source_name), 'source_name required');
    assert(Boolean(row.license_lane), 'license_lane required');
    assert(Boolean(row.license_label), 'license_label required');
    assert(typeof row.attribution_required === 'boolean', 'attribution_required must be boolean');
    assert(typeof row.derived_from_nc === 'boolean', 'derived_from_nc must be boolean');
    assert(typeof row.commercial_export_allowed === 'boolean', 'commercial_export_allowed must be boolean');
    assert(typeof row.agent6_boundary_required === 'boolean', 'agent6_boundary_required must be boolean');
    assert(typeof row.source_url_or_citation === 'string', 'source_url_or_citation must be string');
    assert(row.license_lane in {
      commercial_clean_candidate: true,
      noncommercial_educational_candidate: true,
      metadata_or_link_only: true,
      blocked_or_needs_review: true
    }, `unexpected license lane: ${row.license_lane}`);
    assert(row.answer_eligible === false, 'answer_eligible must be false by boundary');
    assert(row.public_emit === false, 'public_emit must be false by boundary');
    assert(row.rows >= 0, 'rows count invalid');
    assert(row.occurrences >= 0, 'occurrences count invalid');
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    rows: rowSum,
    occurrences: occurrenceSum,
    license_lane_counts: {
      commercial_clean_candidate: artifact.target_counts?.commercial_clean_candidate_rows || 0,
      noncommercial_educational_candidate: artifact.target_counts?.noncommercial_educational_candidate_rows || 0,
      metadata_or_link_only: artifact.target_counts?.metadata_or_link_only_rows || 0,
      blocked_or_needs_review: artifact.target_counts?.blocked_or_needs_review_rows || 0
    },
    boundary: artifact.non_acceptance_boundary
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
