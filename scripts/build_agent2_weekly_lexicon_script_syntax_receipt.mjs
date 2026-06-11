#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.md';
const manifestPath = 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const bundlePath = 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json';

const manifest = readJson(manifestPath);
const bundle = readJson(bundlePath);
const scripts = [...collectScripts(manifest), ...collectEntrypointScripts(bundle)]
  .filter((script, index, values) => values.indexOf(script) === index)
  .sort();

for (const script of scripts) requirePath(script);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_weekly_lexicon_script_syntax_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  target: 'syntax-check command receipt for current Agent 2 definition/lemma/reader-hint pipeline scripts',
  inputs: {
    spark1_manifest: manifestPath,
    current_handoff_bundle: bundlePath,
  },
  counts: {
    scripts_checked: scripts.length,
    runnable_pipelines: manifest.runnable_pipelines?.length,
    validator_only_checks: manifest.validator_only_checks?.length,
  },
  scripts_checked: scripts,
  commands: scripts.map((script) => `node --check ${script}`),
  execution_note: 'Commands are listed for deterministic execution; this receipt is validated by scripts/validate_agent2_weekly_lexicon_script_syntax_receipt.mjs and current run output.',
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
    definition_content_storage: false,
    nc_commercial_authorization: false,
  },
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'NC commercial authorization',
  ],
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function collectScripts(manifest) {
  const scripts = [];
  for (const pipeline of manifest.runnable_pipelines || []) {
    scripts.push(scriptFromCommand(pipeline.build));
    scripts.push(scriptFromCommand(pipeline.validate));
  }
  for (const check of manifest.validator_only_checks || []) {
    scripts.push(scriptFromCommand(check.command));
  }
  return scripts.filter(Boolean);
}

function collectEntrypointScripts(bundle) {
  return Object.values(bundle.entrypoints || {}).filter((value) => String(value).startsWith('scripts/') && String(value).endsWith('.mjs'));
}

function scriptFromCommand(command) {
  if (typeof command !== 'string') return null;
  return command.split(/\s+/).find((part) => part.startsWith('scripts/') && part.endsWith('.mjs')) || null;
}

function assertReceipt(receipt) {
  if (receipt.counts.runnable_pipelines !== 7) throw new Error('expected 7 runnable pipelines');
  if (receipt.counts.validator_only_checks !== 24) throw new Error('expected 24 validator-only checks');
  if (receipt.counts.scripts_checked < 30) throw new Error('expected at least 30 scripts checked');
  for (const [key, value] of Object.entries(receipt.zero_boundary)) {
    if (value !== false) throw new Error(`zero_boundary.${key} must be false`);
  }
}

function requirePath(relativePath) {
  if (!fs.existsSync(path.join(root, cleanRelativePath(relativePath)))) throw new Error(`missing script ${relativePath}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(file)), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, cleanRelativePath(file)), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, receipt) {
  const lines = [
    '# Agent 2 Weekly Lexicon Script Syntax Receipt',
    '',
    'Date: 2026-06-04',
    'Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    '',
    '## Target',
    '',
    'Record deterministic syntax-check commands for the current Agent 2 definition/lemma/reader-hint pipeline script set derived from the Spark-1 manifest and current handoff bundle.',
    '',
    '## Counts',
    '',
    `- Scripts checked: ${receipt.counts.scripts_checked}.`,
    `- Runnable pipelines: ${receipt.counts.runnable_pipelines}.`,
    `- Validator-only checks: ${receipt.counts.validator_only_checks}.`,
    '',
    '## Scripts',
    '',
    ...receipt.scripts_checked.map((script) => `- \`${script}\``),
    '',
    '## Commands',
    '',
    '```powershell',
    ...receipt.commands,
    '```',
    '',
    '## Boundary',
    '',
    'This receipt records syntax-check commands only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization.',
    '',
  ];
  fs.writeFileSync(path.join(root, cleanRelativePath(file)), lines.join('\n'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
