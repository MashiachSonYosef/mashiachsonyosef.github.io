#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-third-missed-source-family-target-or-blocker-2026-06-04.json';
const resultPath = 'reports/agent1-third-missed-source-family-target-or-blocker-validation-result-2026-06-04.json';

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
  assert(artifact.artifact_type === 'agent1_third_missed_source_family_target_or_blocker', 'unexpected artifact_type');
  assert(['missing_workset_blocker', 'candidate_workset_detected_needs_agent1_review'].includes(artifact.status), 'unexpected status');
  assert(artifact.counts_found?.local_route_card_matrix_rows === 169, 'matrix row count must be 169');
  assert(artifact.counts_found?.local_route_card_matrix_occurrences === 2148, 'matrix occurrence count must be 2148');
  assert(artifact.counts_found?.rows_with_exact_linkage_blocker === 168, 'exact linkage blocker row count must be 168');
  assert(artifact.counts_found?.occurrences_with_exact_linkage_blocker === 2117, 'exact linkage blocker occurrence count must be 2117');
  assert(artifact.zero_output_counts?.answer_rows === 0, 'answer rows must be zero');
  assert(artifact.zero_output_counts?.source_rows === 0, 'source rows must be zero');
  assert(artifact.zero_output_counts?.public_hud_rows === 0, 'public HUD rows must be zero');
  assert(artifact.zero_output_counts?.route_jsonl_rows === 0, 'route JSONL rows must be zero');
  assert(artifact.zero_output_counts?.definition_content_rows === 0, 'definition content rows must be zero');

  if (artifact.status === 'missing_workset_blocker') {
    assert(artifact.spark1_route_allowed_now === false, 'Spark-1 route must be false for missing workset');
    assert((artifact.missing_fields || []).length > 0, 'missing fields must be named for missing workset');
    assert(artifact.next_command === null, 'next command must be null for missing workset');
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    rows: artifact.counts_found.local_route_card_matrix_rows,
    occurrences: artifact.counts_found.local_route_card_matrix_occurrences,
    spark1_route_allowed_now: artifact.spark1_route_allowed_now
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
