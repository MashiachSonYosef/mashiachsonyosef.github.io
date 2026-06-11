#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.json';
const resultPath = 'reports/agent1-broad-workbench-token-inventory-5000-source-lane-blocker-validation-result-2026-06-04.json';

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
  assert(artifact.artifact_type === 'agent1_broad_workbench_token_inventory_5000_source_lane_blocker', 'unexpected artifact_type');
  assert(artifact.status === 'exact_source_lane_join_blocker_returned', 'unexpected status');
  assert(artifact.counts?.inventory_top_token_rows === 5000, 'top token row count must be 5000');
  assert(artifact.counts?.source_lane_complete_rows === 0, 'source-lane complete rows must be 0');
  assert(artifact.counts?.source_lane_blocker_rows === 5000, 'source-lane blocker rows must be 5000');
  assert(artifact.counts?.candidate_text_rows_now === 0, 'candidate text rows must be 0');
  assert(artifact.counts?.definition_content_rows_now === 0, 'definition content rows must be 0');
  assert(artifact.counts?.answer_eligible_rows_now === 0, 'answer eligible rows must be 0');
  assert(artifact.counts?.public_emit_rows_now === 0, 'public emit rows must be 0');
  for (const field of ['source_family', 'source_name', 'license_label', 'license_lane', 'source_url_or_citation', 'agent6_boundary_required']) {
    assert(artifact.required_source_lane_fields.includes(field), `required field missing: ${field}`);
    assert(artifact.missing_source_lane_fields_by_count[field] === 5000, `${field} missing count must be 5000`);
  }
  assert(artifact.allowed_license_lanes.includes('commercial_clean_candidate'), 'commercial clean lane missing');
  assert(artifact.allowed_license_lanes.includes('noncommercial_educational_candidate'), 'NC educational lane missing');
  assert(artifact.allowed_license_lanes.includes('metadata_or_link_only'), 'metadata/link-only lane missing');
  assert(artifact.allowed_license_lanes.includes('blocked_or_needs_review'), 'blocked/review lane missing');
  assert(artifact.required_nc_flags?.commercial_export_allowed === false, 'NC commercial export flag must be false');
  assert(artifact.exact_missing_field_blocker?.status === 'source_lane_join_missing', 'blocker status mismatch');
  assert(artifact.downstream_effect?.may_generate_candidate_text_rows === false, 'candidate text generation must be false');
  assert(artifact.downstream_effect?.may_public_emit === false, 'public emit must be false');
  for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'source/license non-acceptance missing');
  assert(artifact.non_acceptance_boundary?.no_nc_commercial_authorization === true, 'NC commercial non-authorization missing');
  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    inventory_top_token_rows: artifact.counts.inventory_top_token_rows,
    source_lane_blocker_rows: artifact.counts.source_lane_blocker_rows,
    candidate_text_rows_now: 0
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = { ok: false, validated_artifact: artifactPath, completed_at: new Date().toISOString(), error: error.message };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
