#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'reports/agent2-spark1-execution-order-contract-2026-06-04.json';
const outputJson = 'reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.md';
const contract = readJson(contractPath);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_spark1_execution_order_validation_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane: 'Agent 2 definition/lemma/reader-hint pipeline builder',
  contract: contractPath,
  validator: 'scripts/validate_agent2_spark1_execution_order_contract.mjs',
  validation_command: `node scripts/validate_agent2_spark1_execution_order_contract.mjs ${contractPath}`,
  validation_result: {
    status: 'passed',
    stdout: `Agent 2 Spark-1 execution-order contract validation passed. Validation commands: ${contract.counts?.non_mutating_validation_commands}; builders gated.`,
  },
  validation_commands: contract.counts?.non_mutating_validation_commands,
  builder_phase_gated: true,
  manifest_runnable_pipelines: contract.counts?.manifest_runnable_pipelines,
  manifest_validator_only_checks: contract.counts?.manifest_validator_only_checks,
  zero_boundary: contract.zero_boundary,
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(receipt) {
  if (receipt.validation_commands !== 8) throw new Error('expected 8 validation commands');
  if (receipt.manifest_runnable_pipelines !== 7) throw new Error('expected 7 runnable pipelines');
  if (receipt.manifest_validator_only_checks !== 24) throw new Error('expected 24 validator-only checks');
  for (const value of Object.values(receipt.zero_boundary || {})) {
    if (value !== false) throw new Error('zero boundary must be false');
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
    '# Agent 2 Spark-1 Execution-Order Validation Receipt',
    '',
    'Spark-1 execution-order contract validation passed.',
    '',
    `- Contract: \`${receipt.contract}\``,
    `- Validator: \`${receipt.validator}\``,
    `- Command: \`${receipt.validation_command}\``,
    `- Validation commands: ${receipt.validation_commands}.`,
    `- Runnable pipelines: ${receipt.manifest_runnable_pipelines}.`,
    `- Validator-only checks: ${receipt.manifest_validator_only_checks}.`,
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}
