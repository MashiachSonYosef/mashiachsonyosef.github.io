#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const outputJson = 'reports/agent2-spark1-execution-order-contract-2026-06-04.json';
const outputMd = 'reports/agent2-spark1-execution-order-contract-2026-06-04.md';
const manifest = readJson(manifestPath);

const validationCommands = [
  'node scripts/validate_agent2_spark1_runnable_command_manifest.mjs reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  'node scripts/validate_agent2_spark1_manifest_outputs.mjs reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  'node scripts/validate_agent2_spark1_manifest_output_state_validation_receipt.mjs reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json',
  'node scripts/validate_agent2_spark1_command_manifest_validation_receipt.mjs reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json',
  'node scripts/validate_agent2_weekly_lexicon_current_handoff_bundle.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
  'node scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
  'node scripts/validate_agent2_current_route_scan_receipt.mjs reports/agent2-current-route-scan-receipt-2026-06-04.json',
  'node scripts/validate_agent2_weekly_zero_boundary_audit.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
];

const contract = {
  schema_version: '1.0',
  artifact_type: 'agent2_spark1_execution_order_contract',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  manifest: manifestPath,
  status: 'nonpublic_spark1_execution_order_contract',
  execution_policy: {
    builders_allowed_only_when_input_changed_or_selected_by_agent10_or_agent7: true,
    validators_safe_without_changed_input: true,
    public_mutation_allowed: false,
    answer_emission_allowed: false,
    definition_authority_allowed: false,
  },
  phases: [
    {
      phase: 1,
      name: 'manifest_structure',
      commands: validationCommands.slice(0, 1),
      mutates_outputs: false,
    },
    {
      phase: 2,
      name: 'output_state_gate',
      commands: validationCommands.slice(1, 2),
      mutates_outputs: false,
    },
    {
      phase: 3,
      name: 'handoff_receipts_and_blockers',
      commands: validationCommands.slice(2),
      mutates_outputs: false,
    },
    {
      phase: 4,
      name: 'changed_input_builders_only',
      commands_source: `${manifestPath} runnable_pipelines[].build`,
      run_condition: 'changed exact workset/input selected by Agent 10 or Agent 7',
      mutates_outputs: true,
      public_mutation_allowed: false,
      answer_emission_allowed: false,
    },
  ],
  counts: {
    validation_phase_count: 3,
    builder_phase_count: 1,
    non_mutating_validation_commands: validationCommands.length,
    manifest_runnable_pipelines: manifest.runnable_pipelines?.length,
    manifest_validator_only_checks: manifest.validator_only_checks?.length,
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
};

assertContract(contract);
writeJson(outputJson, contract);
writeMd(outputMd, contract);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertContract(contract) {
  if (contract.counts.manifest_runnable_pipelines !== 7) throw new Error('expected 7 runnable pipelines');
  if (contract.counts.manifest_validator_only_checks !== 24) throw new Error('expected 24 validator-only checks');
  if (contract.counts.non_mutating_validation_commands !== 8) throw new Error('expected 8 validation commands');
  for (const phase of contract.phases) {
    for (const command of phase.commands || []) validateCommand(command);
  }
  for (const value of Object.values(contract.zero_boundary)) {
    if (value !== false) throw new Error('zero boundary must be false');
  }
}

function validateCommand(command) {
  const parts = command.split(/\s+/).slice(1);
  const script = parts.find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
  if (!script || !fs.existsSync(path.join(root, script))) throw new Error(`missing script in command ${command}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, contract) {
  const lines = [
    '# Agent 2 Spark-1 Execution Order Contract',
    '',
    'Date: 2026-06-04',
    '',
    'Non-public Spark-1 execution-order contract prepared for the current Agent 2 manifest. Validators are ordered before any builder phase, and builders remain gated behind changed exact inputs.',
    '',
    '## Counts',
    '',
    `- Validation commands: ${contract.counts.non_mutating_validation_commands}.`,
    `- Runnable pipelines: ${contract.counts.manifest_runnable_pipelines}.`,
    `- Validator-only checks: ${contract.counts.manifest_validator_only_checks}.`,
    '',
    '## Boundary',
    '',
    'No public mutation, answer emission, Definition authority, accepted text, route-shard edit, or publication readiness is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
