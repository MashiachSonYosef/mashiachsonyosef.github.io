#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifacts = process.argv.slice(2);
const issues = [];

if (artifacts.length === 0) {
  fail('usage: node scripts/check_agent4_changed_package_validator_prereq_gate.mjs <artifact.json> [...]');
}

for (const artifact of artifacts) {
  checkArtifact(artifact);
}

if (issues.length) {
  console.error(`Agent 4 gate artifact check failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 4 gate artifact check passed for ${artifacts.length} artifact(s).`);

function checkArtifact(relativePath) {
  const full = path.join(root, relativePath);
  expect(fs.existsSync(full), `${relativePath}: file must exist`);
  if (!fs.existsSync(full)) return;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    fail(`${relativePath}: invalid JSON: ${error.message}`);
    return;
  }

  if (data.artifact_type === 'agent4_changed_input_only_wake_condition') {
    checkWakeArtifact(relativePath, data);
    return;
  }
  if (
    data.artifact_type === 'agent4_spark4_pipeline_contract_changed_package_validator_prereq' ||
    data.artifact_type === 'agent4_spark1_pipeline_contract_changed_package_validator_prereq'
  ) {
    checkRunnableContract(relativePath, data);
    return;
  }
  if (data.artifact_type === 'agent4_lowmode_validator_prereq_cap_status') {
    checkLowmodeCap(relativePath, data);
    return;
  }
  fail(`${relativePath}: unsupported artifact_type ${JSON.stringify(data.artifact_type)}`);
}

function checkWakeArtifact(relativePath, data) {
  expect(data.status === 'changed_input_only_wake_recorded_no_runnable_contract' || data.status === 'missing_pipeline_blocker', `${relativePath}: unexpected wake status`);
  expect(data.decision?.runnable_contract_authored === false, `${relativePath}: wake must not mark runnable contract authored`);
  expect(data.decision?.route_runnable_contract_now === false, `${relativePath}: wake must not route runnable contract`);
  expect(String(data.active_mode || '').includes('controlled Spark support'), `${relativePath}: active_mode must use controlled Spark support`);
  expect(!/\bSpark-1\b|019e92c1-89b1-7821-898b-2106638345cb|two-primary Spark/i.test(JSON.stringify(data)), `${relativePath}: stale Spark-1/two-primary route wording must not remain`);
  expect(/Agent 4 direct|Spark-4 exact-contract/.test(String(data.decision?.runnable_contract_route_target || '')), `${relativePath}: route target must be Agent 4 direct or Spark-4 exact-contract capacity`);
  expect(data.wake_condition?.next_valid_action_without_changed_input === 'changed_input_only_blocker', `${relativePath}: missing changed_input_only_blocker wake action`);
  expect(data.wake_condition?.assistant1_spark1_route_allowed === false, `${relativePath}: assistant1/Spark-1 route must be explicitly false`);
  expect(data.wake_condition?.repeat_same_validator_runs_capped === true, `${relativePath}: repeated validator cap missing`);
  expect(data.wake_condition?.deuteronomy_baseline_repeat_capped_without_changed_target === true, `${relativePath}: Deuteronomy baseline cap missing`);
  expect(Array.isArray(data.missing_fields) && data.missing_fields.includes('exact_command_list'), `${relativePath}: exact_command_list missing field must be named`);
  expectMinFields(relativePath, data.minimum_runnable_contract_fields);
  expectEvidence(relativePath, data.evidence_inputs);
  expectNotAccepted(relativePath, data.not_accepted);
}

function checkRunnableContract(relativePath, data) {
  expect(data.status === 'runnable_contract_authored_changed_input_present', `${relativePath}: unexpected runnable contract status`);
  expect(String(data.active_mode || '').includes('controlled Spark support'), `${relativePath}: active_mode must use controlled Spark support`);
  expect(!/\bSpark-1\b|019e92c1-89b1-7821-898b-2106638345cb|two-primary Spark/i.test(JSON.stringify(data)), `${relativePath}: stale Spark-1/two-primary route wording must not remain`);
  expect(Boolean(data.changed_package_input_path), `${relativePath}: changed_package_input_path missing`);
  expect(Boolean(data.package_hash_or_commit_or_mtime), `${relativePath}: package_hash_or_commit_or_mtime missing`);
  expect(Array.isArray(data.exact_command_list) && data.exact_command_list.length > 0, `${relativePath}: exact_command_list missing`);
  expect(Boolean(data.expected_output_path_schema), `${relativePath}: expected_output_path_schema missing`);
  expect(Boolean(data.validator_gate), `${relativePath}: validator_gate missing`);
  expect(Boolean(data.package_owner), `${relativePath}: package_owner missing`);
  expect(Boolean(data.stop_condition), `${relativePath}: stop_condition missing`);
  expect(data.route?.target_spark === 'Spark-4' || data.route?.target_lane === 'Agent 4 direct validator/prereq lane', `${relativePath}: target must be Spark-4 or Agent 4 direct lane`);
  expect(data.route?.route_now === true, `${relativePath}: runnable contract must route now`);
  expectEvidence(relativePath, data.evidence_inputs);
  expectNotAccepted(relativePath, data.not_accepted);
}

function checkLowmodeCap(relativePath, data) {
  expect(data.status === 'lowmode_cap_recorded_changed_input_only', `${relativePath}: unexpected low-mode status`);
  expect(data.validator?.validators_run_for_lowmode_status === 0, `${relativePath}: low-mode validators_run must be 0`);
  expect(data.validator?.unchanged_validator_churn_capped === true, `${relativePath}: low-mode churn cap missing`);
  expect(data.blocker?.class === 'changed_input_only_blocker', `${relativePath}: blocker must be changed_input_only_blocker`);
  expect(Array.isArray(data.exact_inputs) && data.exact_inputs.length >= 2, `${relativePath}: exact_inputs missing`);
  expect(data.supporting_mechanic?.path === 'scripts/build_agent4_changed_package_validator_prereq_gate.mjs', `${relativePath}: supporting gate script path mismatch`);
  expect(data.supporting_mechanic?.syntax_check_result === 'pass', `${relativePath}: gate script syntax check must pass`);
  expect(data.counts?.validators_run === 0, `${relativePath}: counts.validators_run must be 0`);
  expect(data.counts?.runnable_contracts_routed === 0, `${relativePath}: runnable_contracts_routed must be 0`);
  expect(data.handoff?.assistant1_spark1_route_allowed === false || data.handoff?.target_spark === 'Spark-4', `${relativePath}: handoff must not require Spark-1`);
  expectNotAccepted(relativePath, data.not_accepted);
}

function expectMinFields(relativePath, fields) {
  const required = [
    'changed package/input path',
    'exact command list',
    'expected output path/schema',
    'validator/gate',
    'package owner',
    'stop condition',
  ];
  expect(Array.isArray(fields), `${relativePath}: minimum_runnable_contract_fields must be an array`);
  for (const field of required) {
    expect((fields || []).includes(field), `${relativePath}: minimum field missing: ${field}`);
  }
}

function expectEvidence(relativePath, evidence) {
  expect(Array.isArray(evidence), `${relativePath}: evidence_inputs must be an array`);
  expect((evidence || []).some((entry) => entry.path === 'data/control/spark_standing_queue.json'), `${relativePath}: standing queue evidence missing`);
  expect((evidence || []).some((entry) => entry.path === 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json'), `${relativePath}: Agent 10 intake evidence missing`);
}

function expectNotAccepted(relativePath, entries) {
  const required = [
    'QA acceptance',
    'public/runtime acceptance',
    'publication readiness',
    'accepted text',
  ];
  expect(Array.isArray(entries), `${relativePath}: not_accepted must be an array`);
  for (const fragment of required) {
    const found = (entries || []).some((entry) => String(entry).toLowerCase().includes(fragment.toLowerCase()));
    expect(found, `${relativePath}: not_accepted missing ${fragment}`);
  }
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function fail(message) {
  issues.push(message);
}
