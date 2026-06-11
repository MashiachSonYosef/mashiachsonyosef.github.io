#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const handoffPath = process.argv[2] || 'reports/agent1-source-license-custody-aggregate-handoff-2026-06-04.json';
const resultPath = 'reports/agent1-source-license-custody-aggregate-handoff-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const handoff = readJson(handoffPath);
  const aggregate = readJson(handoff.aggregate_validation_result);
  const registry = readJson(handoff.primary_registry);
  const laneReturn = readJson(handoff.lane_return);
  const commandManifest = readJson(handoff.command_manifest);

  assert(handoff.artifact_type === 'agent1_source_license_custody_aggregate_handoff', 'unexpected artifact_type');
  assert(handoff.status === 'agent1_source_license_custody_aggregate_handoff_ready_for_discovery_only', 'unexpected handoff status');
  for (const filePath of [handoff.primary_registry, handoff.aggregate_validation_result, handoff.lane_return, handoff.command_manifest]) {
    assert(exists(filePath), `missing handoff file: ${filePath}`);
  }

  assert(aggregate.ok === true, 'aggregate validation result must be ok');
  assert(registry.status === 'agent1_source_license_custody_pipeline_registry_validated_for_discovery_only', 'registry status mismatch');
  assert((laneReturn.changed_or_current_outputs || []).length === 48, 'lane-return output count must be 48');

  assert(handoff.counts?.runnable_contract_count === aggregate.runnable_contract_count, 'runnable contract count mismatch');
  assert(handoff.counts?.supporting_packet_count === aggregate.supporting_packet_count, 'supporting packet count mismatch');
  assert(handoff.counts?.exact_blocker_count === aggregate.exact_blocker_count, 'exact blocker count mismatch');
  assert(handoff.counts?.lane_return_output_count === aggregate.lane_return_output_count, 'lane-return count mismatch');
  assert((handoff.runnable_contract_targets || []).length === 22, 'expected twenty-two runnable contract targets');
  assert(commandManifest.counts?.runnable_command_set_count === 22, 'command manifest runnable set count must be 22');
  assert(handoff.counts?.runnable_command_set_count === commandManifest.counts.runnable_command_set_count, 'handoff command set count mismatch');

  const blocker = handoff.exact_blockers?.[0];
  assert(blocker?.status === 'missing_workset_blocker', 'handoff blocker status must be missing_workset_blocker');
  assert(blocker?.rows_checked === 169, 'handoff blocker rows checked must be 169');
  assert(blocker?.spark1_routable === false, 'handoff blocker must not be Spark-1 routable');

  assert(handoff.handoff?.spark1?.includes('do not invent'), 'Spark-1 handoff must prohibit invention');
  assert(handoff.handoff?.agent6?.includes('Do not route directly'), 'Agent 6 handoff must prohibit direct route');
  assert(handoff.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(handoff.non_acceptance_boundary?.no_nc_commercial_authorization === true, 'no NC commercial authorization boundary missing');
  assert(handoff.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: handoffPath,
    completed_at: new Date().toISOString(),
    status: handoff.status,
    runnable_contract_count: handoff.counts.runnable_contract_count,
    supporting_packet_count: handoff.counts.supporting_packet_count,
    exact_blocker_count: handoff.counts.exact_blocker_count,
    lane_return_output_count: handoff.counts.lane_return_output_count
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: handoffPath,
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
