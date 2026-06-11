#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-source-family-license-lane-release-intake-packet-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-source-family-license-lane-release-intake-packet-validation-result-2026-06-04.json';

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
  const rows = artifact.intake_rows || [];
  assert(artifact.artifact_type === 'agent1_workbench_source_family_license_lane_release_intake_packet', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_source_family_license_lane_release_intake_packet_ready_for_agent10_only', 'unexpected status');
  assert(artifact.counts?.release_intake_row_count === 4, 'release intake rows must be 4');
  assert(artifact.counts?.boundary_question_count === 4, 'boundary questions must be 4');
  assert(artifact.counts?.source_family_license_lane_partition_count === 4, 'partition count must be 4');
  assert(artifact.counts?.source_name_partition_count === 351, 'source-name partitions must be 351');
  assert(artifact.counts?.source_row_count === 105747, 'source rows must be 105747');
  assert(rows.length === artifact.counts.release_intake_row_count, 'intake row count mismatch');
  for (const row of rows) {
    assert(row.release_owner_next_action?.includes('Agent 10'), 'release owner action must name Agent 10');
    assert(row.answer_eligible === false, 'answer eligible must be false');
    assert(row.public_emit === false, 'public emit must be false');
    assert(row.export_authorized_now === false, 'export authorization must be false');
    assert(row.agent6_boundary_required === true, 'Agent 6 boundary flag missing');
  }
  assert(artifact.handoff?.handoff_owner === 'Agent 10 release/package intake', 'handoff owner mismatch');
  assert(artifact.handoff?.spark1_routable === true, 'Spark-1 routable must be true');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'source/license non-acceptance missing');
  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    release_intake_row_count: artifact.counts.release_intake_row_count,
    boundary_question_count: artifact.counts.boundary_question_count,
    source_family_license_lane_partition_count: artifact.counts.source_family_license_lane_partition_count,
    source_name_partition_count: artifact.counts.source_name_partition_count,
    source_row_count: artifact.counts.source_row_count,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = { ok: false, validated_artifact: artifactPath, completed_at: new Date().toISOString(), error: error.message };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
