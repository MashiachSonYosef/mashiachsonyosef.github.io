#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-source-family-license-lane-agent6-boundary-packet-validation-result-2026-06-04.json';

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
  const rows = artifact.boundary_rows || [];
  assert(artifact.artifact_type === 'agent1_workbench_source_family_license_lane_agent6_boundary_packet', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_source_family_license_lane_agent6_boundary_packet_prepared_for_release_intake_only', 'unexpected status');
  assert(artifact.counts?.boundary_question_count === 4, 'boundary question count must be 4');
  assert(artifact.counts?.source_family_license_lane_partition_count === 4, 'partition count must be 4');
  assert(artifact.counts?.source_family_count === 1, 'source family count must be 1');
  assert(artifact.counts?.source_name_partition_count === 351, 'source-name partition count must be 351');
  assert(artifact.counts?.source_row_count === 105747, 'source row count must be 105747');
  assert(rows.length === artifact.counts.boundary_question_count, 'boundary row count mismatch');
  for (const row of rows) {
    assert(row.agent6_boundary_required === true, 'Agent 6 boundary flag missing');
    assert(row.agent6_boundary_question?.includes('storage, display, answer use, or export'), 'Agent 6 question missing required scope');
    assert(row.answer_eligible === false, 'answer eligible must be false');
    assert(row.public_emit === false, 'public emit must be false');
    assert(row.export_authorized_now === false, 'export authorization must be false');
    assert(row.corpus_contamination === false, 'corpus contamination must be false');
  }
  assert(artifact.handoff?.release_owner === 'Agent 10', 'release owner must be Agent 10');
  assert(artifact.handoff?.spark1_routable === true, 'Spark-1 handoff must be routable');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'source/license non-acceptance missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    boundary_question_count: artifact.counts.boundary_question_count,
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
