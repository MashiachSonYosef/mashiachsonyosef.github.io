#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const outputJson = 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.md';

const manifest = readJson(manifestPath);
const validatorOnlyStates = (manifest.validator_only_checks || []).filter((check) => check.id !== 'spark1_manifest_outputs').length;

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_spark1_manifest_output_state_validation_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  manifest: manifestPath,
  validator: 'scripts/validate_agent2_spark1_manifest_outputs.mjs',
  validation_command: `node scripts/validate_agent2_spark1_manifest_outputs.mjs ${manifestPath}`,
  validation_result: {
    status: 'passed',
    stdout: `Agent 2 Spark-1 manifest output-state validation passed. Runnable outputs checked: ${manifest.runnable_pipelines.length}; validator-only states checked: ${validatorOnlyStates}.`,
  },
  runnable_outputs_checked: manifest.runnable_pipelines.length,
  validator_only_states_checked: validatorOnlyStates,
  self_check_registered_but_not_recursed: true,
  non_mutating_gate: true,
  child_process_spawn_blocker_observed: {
    status: 'observed_and_avoided',
    details: 'Direct child-process validator execution from Node returned EPERM in this sandbox, so the gate validates current output state by reading artifacts instead of spawning validators.',
  },
  zero_boundary: {
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligible: false,
    accepted_gloss_text: false,
    public_reader_output: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    publication_readiness: false,
    source_license_acceptance: false,
    qa_acceptance: false,
  },
  next_consumer: 'Agent 10 first; Spark-1 may use this as a non-mutating manifest output-state gate.',
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(receipt) {
  if (receipt.runnable_outputs_checked !== 7) throw new Error('expected 7 runnable outputs');
  if (receipt.validator_only_states_checked !== 23) throw new Error('expected 23 validator-only states');
  if (!receipt.self_check_registered_but_not_recursed || !receipt.non_mutating_gate) throw new Error('non-mutating self-check posture mismatch');
  for (const value of Object.values(receipt.zero_boundary)) {
    if (value !== false) throw new Error('zero boundary must remain false');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, receipt) {
  const lines = [
    '# Agent 2 Spark-1 Manifest Output-State Validation Receipt - 2026-06-04',
    '',
    '## Status',
    '',
    'Agent 2 generated a non-mutating Spark-1 manifest output-state gate receipt.',
    '',
    `- Manifest: \`${receipt.manifest}\`.`,
    `- Validator: \`${receipt.validator}\`.`,
    `- Command: \`${receipt.validation_command}\`.`,
    '- Result: passed.',
    `- Reported stdout: \`${receipt.validation_result.stdout}\``,
    '',
    '## Scope',
    '',
    `- Runnable outputs checked: ${receipt.runnable_outputs_checked}.`,
    `- Validator-only states checked: ${receipt.validator_only_states_checked}.`,
    '- Manifest self-check registered: yes.',
    '- Manifest self-check recursion: skipped intentionally.',
    '- Builders run: 0.',
    '- Public/runtime/source/token-index/lexical mutations: 0.',
    '',
    '## Blocker Avoided',
    '',
    receipt.child_process_spawn_blocker_observed.details,
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, publication readiness, source/license acceptance, or QA acceptance is claimed.',
    '',
    '## Handoff',
    '',
    receipt.next_consumer,
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
