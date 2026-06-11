#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildAgent4ChangedPackageValidatorPrereqGate } from './build_agent4_changed_package_validator_prereq_gate.mjs';

const root = process.cwd();
const tmpDir = '.local-cache/agent4-gate-smoke';
const fullTmpDir = path.join(root, tmpDir);
fs.mkdirSync(fullTmpDir, { recursive: true });
const existingChangedPackage = `${tmpDir}/changed-package.json`;

const cases = [
  {
    name: 'no-input-wake',
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--out-json',
      `${tmpDir}/no-input-wake.json`,
      '--out-md',
      `${tmpDir}/no-input-wake.md`,
    ],
    expectedExit: 0,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'changed_input_only_wake_recorded_no_runnable_contract',
    expectedRouteNow: false,
  },
  {
    name: 'missing-field-blocker',
    fixture: `${tmpDir}/missing-field-input.json`,
    fixtureData: {
      changed_package_input_path: existingChangedPackage,
      package_hash_or_commit_or_mtime: 'fixture-sha256-or-mtime-001',
      exact_command_list: ['node scripts/example_validator_that_is_not_run.mjs'],
      expected_output_path_schema: 'reports/example-output.md',
      validator_gate: 'exact command list only; do not infer validators',
      package_owner: 'Agent 10',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/missing-field-input.json`,
      '--out-json',
      `${tmpDir}/missing-field-wake.json`,
      '--out-md',
      `${tmpDir}/missing-field-wake.md`,
    ],
    expectedExit: 2,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'missing_pipeline_blocker',
    expectedRouteNow: false,
    expectedMissingField: 'stop_condition',
  },
  {
    name: 'runnable-contract',
    fixture: `${tmpDir}/runnable-input.json`,
    fixtureData: {
      changed_package_input_path: existingChangedPackage,
      package_hash_or_commit_or_mtime: 'fixture-sha256-or-mtime-002',
      exact_command_list: ['node scripts/check_agent4_changed_package_validator_prereq_gate.mjs reports/agent4-changed-input-only-wake-condition-2026-06-04.json'],
      expected_output_path_schema: 'reports/agent4-example-validator-prereq-runtime-2026-06-04.md',
      validator_gate: 'exact command list only; no package validator inference',
      package_owner: 'Agent 10',
      agent6_boundary_trigger: 'not_required_for_non_public_fixture',
      stop_condition: 'Stop after one validator/prereq packet or exact blocker.',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/runnable-input.json`,
      '--out-json',
      `${tmpDir}/runnable-contract.json`,
      '--out-md',
      `${tmpDir}/runnable-contract.md`,
    ],
    expectedExit: 0,
    expectedArtifactType: 'agent4_spark1_pipeline_contract_changed_package_validator_prereq',
    expectedStatus: 'runnable_contract_authored_changed_input_present',
    expectedRouteNow: true,
  },
  {
    name: 'missing-command-blocker',
    fixture: `${tmpDir}/missing-command-input.json`,
    fixtureData: {
      changed_package_input_path: existingChangedPackage,
      package_hash_or_commit_or_mtime: 'fixture-sha256-or-mtime-003',
      exact_command_list: ['node scripts/missing_agent4_fixture_validator.mjs'],
      expected_output_path_schema: 'reports/agent4-example-validator-prereq-runtime-2026-06-04.md',
      validator_gate: 'exact command list only; no package validator inference',
      package_owner: 'Agent 10',
      stop_condition: 'Stop after one validator/prereq packet or exact blocker.',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/missing-command-input.json`,
      '--out-json',
      `${tmpDir}/missing-command-wake.json`,
      '--out-md',
      `${tmpDir}/missing-command-wake.md`,
    ],
    expectedExit: 2,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'missing_pipeline_blocker',
    expectedRouteNow: false,
    expectedMissingField: 'exact_command_list[0] missing script: scripts/missing_agent4_fixture_validator.mjs',
  },
  {
    name: 'missing-package-path-blocker',
    fixture: `${tmpDir}/missing-package-path-input.json`,
    fixtureData: {
      changed_package_input_path: `${tmpDir}/does-not-exist-package.json`,
      package_hash_or_commit_or_mtime: 'fixture-sha256-or-mtime-004',
      exact_command_list: ['node scripts/check_agent4_changed_package_validator_prereq_gate.mjs reports/agent4-changed-input-only-wake-condition-2026-06-04.json'],
      expected_output_path_schema: 'reports/agent4-example-validator-prereq-runtime-2026-06-04.md',
      validator_gate: 'exact command list only; no package validator inference',
      package_owner: 'Agent 10',
      stop_condition: 'Stop after one validator/prereq packet or exact blocker.',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/missing-package-path-input.json`,
      '--out-json',
      `${tmpDir}/missing-package-path-wake.json`,
      '--out-md',
      `${tmpDir}/missing-package-path-wake.md`,
    ],
    expectedExit: 2,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'missing_pipeline_blocker',
    expectedRouteNow: false,
    expectedMissingField: `changed_package_input_path missing: ${tmpDir}/does-not-exist-package.json`,
  },
  {
    name: 'unsafe-command-blocker',
    fixture: `${tmpDir}/unsafe-command-input.json`,
    fixtureData: {
      changed_package_input_path: existingChangedPackage,
      package_hash_or_commit_or_mtime: 'fixture-sha256-or-mtime-005',
      exact_command_list: ['node scripts/check_agent4_changed_package_validator_prereq_gate.mjs > reports/unsafe-output.txt'],
      expected_output_path_schema: 'reports/agent4-example-validator-prereq-runtime-2026-06-04.md',
      validator_gate: 'exact command list only; no shell redirection or substitution',
      package_owner: 'Agent 10',
      stop_condition: 'Stop after one validator/prereq packet or exact blocker.',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/unsafe-command-input.json`,
      '--out-json',
      `${tmpDir}/unsafe-command-wake.json`,
      '--out-md',
      `${tmpDir}/unsafe-command-wake.md`,
    ],
    expectedExit: 2,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'missing_pipeline_blocker',
    expectedRouteNow: false,
    expectedMissingField: 'exact_command_list[0] shell redirection not allowed',
  },
  {
    name: 'unsafe-output-schema-blocker',
    fixture: `${tmpDir}/unsafe-output-schema-input.json`,
    fixtureData: {
      changed_package_input_path: existingChangedPackage,
      package_hash_or_commit_or_mtime: 'fixture-sha256-or-mtime-006',
      exact_command_list: ['node scripts/check_agent4_changed_package_validator_prereq_gate.mjs reports/agent4-changed-input-only-wake-condition-2026-06-04.json'],
      expected_output_path_schema: '../agent4-output.md',
      validator_gate: 'exact command list only; output must stay under reports or local cache',
      package_owner: 'Agent 10',
      stop_condition: 'Stop after one validator/prereq packet or exact blocker.',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/unsafe-output-schema-input.json`,
      '--out-json',
      `${tmpDir}/unsafe-output-schema-wake.json`,
      '--out-md',
      `${tmpDir}/unsafe-output-schema-wake.md`,
    ],
    expectedExit: 2,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'missing_pipeline_blocker',
    expectedRouteNow: false,
    expectedMissingField: 'expected_output_path_schema must stay within repository',
  },
  {
    name: 'missing-fingerprint-blocker',
    fixture: `${tmpDir}/missing-fingerprint-input.json`,
    fixtureData: {
      changed_package_input_path: existingChangedPackage,
      exact_command_list: ['node scripts/check_agent4_changed_package_validator_prereq_gate.mjs reports/agent4-changed-input-only-wake-condition-2026-06-04.json'],
      expected_output_path_schema: 'reports/agent4-example-validator-prereq-runtime-2026-06-04.md',
      validator_gate: 'exact command list only; changed input fingerprint required',
      package_owner: 'Agent 10',
      stop_condition: 'Stop after one validator/prereq packet or exact blocker.',
    },
    args: [
      'scripts/build_agent4_changed_package_validator_prereq_gate.mjs',
      '--date',
      '2026-06-04',
      '--changed-input',
      `${tmpDir}/missing-fingerprint-input.json`,
      '--out-json',
      `${tmpDir}/missing-fingerprint-wake.json`,
      '--out-md',
      `${tmpDir}/missing-fingerprint-wake.md`,
    ],
    expectedExit: 2,
    expectedArtifactType: 'agent4_changed_input_only_wake_condition',
    expectedStatus: 'missing_pipeline_blocker',
    expectedRouteNow: false,
    expectedMissingField: 'package_hash_or_commit_or_mtime',
  },
];

const issues = [];
writeJson(existingChangedPackage, {
  artifact_type: 'agent4_gate_smoke_changed_package_fixture',
  rows: 1,
  note: 'Ignored local fixture; not a public/runtime package.',
});

for (const testCase of cases) {
  if (testCase.fixture) {
    writeJson(testCase.fixture, testCase.fixtureData);
  }
  const result = buildAgent4ChangedPackageValidatorPrereqGate(testCase.args.slice(1), { root });
  expect(result.exitCode === testCase.expectedExit, `${testCase.name}: expected exit ${testCase.expectedExit}, got ${result.exitCode}`);

  const outJson = outputJsonPath(testCase.args);
  const data = readJson(outJson);
  expect(data.artifact_type === testCase.expectedArtifactType, `${testCase.name}: unexpected artifact_type`);
  expect(data.status === testCase.expectedStatus, `${testCase.name}: unexpected status`);
  if (testCase.expectedRouteNow === true) {
    expect(data.route?.route_now === true, `${testCase.name}: runnable contract should route now`);
    expect(data.route?.target_thread_id === '019e92c1-89b1-7821-898b-2106638345cb', `${testCase.name}: Spark-1 target mismatch`);
  } else {
    expect(data.decision?.route_runnable_contract_now === false, `${testCase.name}: wake/blocker must not route`);
  }
  if (testCase.expectedMissingField) {
    expect((data.missing_fields || []).includes(testCase.expectedMissingField), `${testCase.name}: expected missing field ${testCase.expectedMissingField}`);
  }

  expectGateArtifact(outJson, data, testCase.name);
}

if (issues.length) {
  console.error(`Agent 4 gate smoke test failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 4 gate smoke test passed for ${cases.length} case(s).`);

function outputJsonPath(args) {
  const index = args.indexOf('--out-json');
  if (index === -1) throw new Error(`missing --out-json in ${args.join(' ')}`);
  return args[index + 1];
}

function writeJson(relativePath, value) {
  const full = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectGateArtifact(relativePath, data, name) {
  expect(Boolean(data.artifact_type), `${name}: artifact_type missing in ${relativePath}`);
  expect(Array.isArray(data.not_accepted), `${name}: not_accepted boundary missing`);
  expect((data.not_accepted || []).some((entry) => String(entry).includes('public/runtime acceptance')), `${name}: public/runtime non-acceptance boundary missing`);
  if (data.artifact_type === 'agent4_changed_input_only_wake_condition') {
    expect(data.decision?.runnable_contract_authored === false, `${name}: wake must not mark contract authored`);
    expect(data.decision?.route_runnable_contract_now === false, `${name}: wake must not route`);
    expect(data.wake_condition?.next_valid_action_without_changed_input === 'changed_input_only_blocker', `${name}: wake action mismatch`);
  }
  if (data.artifact_type === 'agent4_spark1_pipeline_contract_changed_package_validator_prereq') {
    expect(data.route?.route_now === true, `${name}: runnable contract must route now`);
    expect(Array.isArray(data.exact_command_list) && data.exact_command_list.length > 0, `${name}: exact commands missing`);
  }
}
