#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  sourceDir: '.local-cache/definition-routes',
  freezeDir: '.local-cache/definition-route-freeze/current',
  storeDir: '.local-cache/hud-route-store',
  lookupDir: '.local-cache/hud-route-lookup',
  publicDir: 'data/definitions/hud-route-lookup',
  storeSample: 'data/definitions/hud-route-store-sample.json',
  lookupSample: 'data/definitions/hud-route-lookup-sample.json',
  releaseStamp: 'data/definitions/hud-route-release-stamp.json',
  releaseReport: 'reports/hud-route-release-stamp.md',
  gateReport: 'reports/hud-route-release-gate.md',
  gateJson: 'reports/hud-route-release-gate.json',
  freezeVolumeReport: 'reports/hud-route-freeze-volume-gate.md',
  freezeVolumeJson: 'reports/hud-route-freeze-volume-gate.json',
  volumeReport: 'reports/hud-route-release-volume-gate.md',
  volumeJson: 'reports/hud-route-release-volume-gate.json',
  maxLookupCards: 1000000,
  maxPhraseEvidenceCards: 1000000,
  dryRun: false,
};
const pathOptionKeys = [
  'sourceDir',
  'freezeDir',
  'storeDir',
  'lookupDir',
  'publicDir',
  'storeSample',
  'lookupSample',
  'releaseStamp',
  'releaseReport',
  'gateReport',
  'gateJson',
  'freezeVolumeReport',
  'freezeVolumeJson',
  'volumeReport',
  'volumeJson',
];

const options = parseArgs(process.argv.slice(2));
const frozenManifest = `${options.freezeDir}/route-input-freeze.json`;
const frozenAudit = `${options.freezeDir}/definition-route-claim-audit.json`;
const frozenAuditReport = `${options.freezeDir}/definition-route-claim-audit.md`;
const storeManifest = `${options.storeDir}/manifest.json`;
const lookupManifest = `${options.lookupDir}/manifest.json`;
const publicManifest = `${options.publicDir}/manifest.json`;

const steps = [
  nodeStep('freeze route inputs', 'scripts/freeze_hud_route_inputs.mjs', [
    '--source-dir', options.sourceDir,
    '--freeze-dir', options.freezeDir,
  ]),
  nodeStep('validate frozen route input volume', 'scripts/validate_hud_route_freeze_volume.mjs', [
    '--freeze-manifest', frozenManifest,
    '--report', options.freezeVolumeReport,
    '--json', options.freezeVolumeJson,
    '--max-lookup-cards', String(options.maxLookupCards),
    '--max-phrase-evidence-cards', String(options.maxPhraseEvidenceCards),
  ]),
  nodeStep('audit frozen route claims', 'scripts/audit_definition_route_claims.mjs', [
    `--manifest=${options.freezeDir}/definition-route-manifest.json`,
    `--route-jsonl=${frozenRouteJsonl().join(',')}`,
    `--output=${frozenAudit}`,
    `--report=${frozenAuditReport}`,
  ]),
  nodeStep('validate frozen route audit', 'scripts/validate_definition_route_claim_audit.mjs', [
    frozenAudit,
  ]),
  nodeStep('validate HUD route release volume', 'scripts/validate_hud_route_release_volume.mjs', [
    '--route-audit', frozenAudit,
    '--report', options.volumeReport,
    '--json', options.volumeJson,
    '--max-lookup-cards', String(options.maxLookupCards),
    '--max-phrase-evidence-cards', String(options.maxPhraseEvidenceCards),
  ]),
  nodeStep('build HUD route store from freeze', 'scripts/build_hud_route_store.mjs', [
    '--local-dir', options.freezeDir,
    '--out-dir', options.storeDir,
    '--public-sample', options.storeSample,
  ]),
  nodeStep('validate HUD route store', 'scripts/validate_hud_route_store.mjs', []),
  nodeStep('build local HUD route lookup', 'scripts/build_hud_route_lookup.mjs', [
    '--store-dir', options.storeDir,
    '--out-dir', options.lookupDir,
    '--public-sample', options.lookupSample,
    '--max-lookup-cards', String(options.maxLookupCards),
  ]),
  nodeStep('validate local HUD route lookup', 'scripts/validate_hud_route_lookup.mjs', []),
  nodeStep('validate route answer safety contract', 'scripts/validate_route_answer_safety.mjs', []),
  nodeStep('validate HUD route publication script guards', 'scripts/validate_hud_route_publication_script_guards.mjs', []),
  nodeStep('publish public HUD route lookup', 'scripts/publish_hud_route_lookup.mjs', [
    '--local-dir', options.lookupDir,
    '--public-dir', options.publicDir,
  ]),
  nodeStep('validate public HUD route lookup structure', 'scripts/validate_public_hud_route_lookup.mjs', [
    '--skip-release-stamp',
  ]),
  nodeStep('scan public HUD route cards', 'scripts/validate_public_hud_route_cards.mjs', [
    '--manifest', publicManifest,
    '--report', 'reports/public-hud-route-card-scan.md',
  ]),
  nodeStep('validate route publication boundary', 'scripts/validate_route_publication_boundary.mjs', [
    '--manifest', publicManifest,
    '--output', 'reports/route-publication-boundary-audit.json',
    '--report', 'reports/route-publication-boundary-audit.md',
  ]),
  nodeStep('audit public HUD normalized keys', 'scripts/validate_public_hud_normalized_keys.mjs', [
    '--manifest', publicManifest,
    '--report', 'reports/public-hud-normalized-key-audit.md',
    '--json', 'reports/public-hud-normalized-key-audit.json',
    '--fail-on-issues',
  ]),
  nodeStep('stamp HUD route release', 'scripts/stamp_hud_route_release.mjs', [
    '--freeze-manifest', frozenManifest,
    '--store-manifest', storeManifest,
    '--lookup-manifest', lookupManifest,
    '--public-manifest', publicManifest,
    '--route-audit', frozenAudit,
    '--output', options.releaseStamp,
    '--report', options.releaseReport,
  ]),
  nodeStep('validate HUD route release stamp', 'scripts/validate_hud_route_release_stamp.mjs', [
    options.releaseStamp,
  ]),
  nodeStep('validate frozen route inputs against current sources', 'scripts/validate_hud_route_input_freeze.mjs', [
    '--stamp', options.releaseStamp,
    '--source-dir', options.sourceDir,
    '--report', 'reports/hud-route-input-freeze-drift.md',
    '--fail-on-drift',
  ]),
  nodeStep('validate HUD route release gate', 'scripts/validate_hud_route_release_gate.mjs', [
    '--report', options.gateReport,
    '--json', options.gateJson,
  ]),
  nodeStep('validate HUD route release gate report', 'scripts/validate_hud_route_release_gate_report.mjs', [
    '--gate-report', options.gateReport,
    '--gate-json', options.gateJson,
  ]),
  nodeStep('validate route publication boundary coherence', 'scripts/validate_route_publication_boundary_coherence.mjs', []),
];

validateReleasePlan(steps);
for (const step of steps) runStep(step);
console.log(options.dryRun
  ? `HUD route release candidate dry-run complete: ${options.releaseStamp}`
  : `HUD route release candidate sequence completed: ${options.releaseStamp}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--source-dir') parsed.sourceDir = cleanPath(args[++index]);
    else if (arg === '--freeze-dir') parsed.freezeDir = cleanPath(args[++index]);
    else if (arg === '--store-dir') parsed.storeDir = cleanPath(args[++index]);
    else if (arg === '--lookup-dir') parsed.lookupDir = cleanPath(args[++index]);
    else if (arg === '--public-dir') parsed.publicDir = cleanPath(args[++index]);
    else if (arg === '--store-sample') parsed.storeSample = cleanPath(args[++index]);
    else if (arg === '--lookup-sample') parsed.lookupSample = cleanPath(args[++index]);
    else if (arg === '--release-stamp') parsed.releaseStamp = cleanPath(args[++index]);
    else if (arg === '--release-report') parsed.releaseReport = cleanPath(args[++index]);
    else if (arg === '--gate-report') parsed.gateReport = cleanPath(args[++index]);
    else if (arg === '--gate-json') parsed.gateJson = cleanPath(args[++index]);
    else if (arg === '--freeze-volume-report') parsed.freezeVolumeReport = cleanPath(args[++index]);
    else if (arg === '--freeze-volume-json') parsed.freezeVolumeJson = cleanPath(args[++index]);
    else if (arg === '--volume-report') parsed.volumeReport = cleanPath(args[++index]);
    else if (arg === '--volume-json') parsed.volumeJson = cleanPath(args[++index]);
    else if (arg === '--max-lookup-cards') parsed.maxLookupCards = Number(args[++index]);
    else if (arg === '--max-phrase-evidence-cards') parsed.maxPhraseEvidenceCards = Number(args[++index]);
    else if (arg === '--dry-run') parsed.dryRun = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/run_hud_route_release_candidate.mjs',
      '',
      'Options:',
      '  --source-dir .local-cache/definition-routes',
      '  --freeze-dir .local-cache/definition-route-freeze/current',
      '  --store-dir .local-cache/hud-route-store',
      '  --lookup-dir .local-cache/hud-route-lookup',
      '  --public-dir data/definitions/hud-route-lookup',
      '  --store-sample data/definitions/hud-route-store-sample.json',
      '  --lookup-sample data/definitions/hud-route-lookup-sample.json',
      '  --release-stamp data/definitions/hud-route-release-stamp.json',
      '  --release-report reports/hud-route-release-stamp.md',
      '  --gate-report reports/hud-route-release-gate.md',
      '  --gate-json reports/hud-route-release-gate.json',
      '  --freeze-volume-report reports/hud-route-freeze-volume-gate.md',
      '  --freeze-volume-json reports/hud-route-freeze-volume-gate.json',
      '  --volume-report reports/hud-route-release-volume-gate.md',
      '  --volume-json reports/hud-route-release-volume-gate.json',
      '  --max-lookup-cards 1000000',
      '  --max-phrase-evidence-cards 1000000',
      '  --dry-run',
    ].join('\n'));
    process.exit(0);
  }
  if (!Number.isFinite(parsed.maxLookupCards) || parsed.maxLookupCards < 1) {
    throw new Error(`Invalid --max-lookup-cards: ${parsed.maxLookupCards}`);
  }
  if (!Number.isFinite(parsed.maxPhraseEvidenceCards) || parsed.maxPhraseEvidenceCards < 0) {
    throw new Error(`Invalid --max-phrase-evidence-cards: ${parsed.maxPhraseEvidenceCards}`);
  }
  for (const key of pathOptionKeys) parsed[key] = cleanPath(parsed[key]);
  validatePathScopes(parsed);
  return parsed;
}

function validatePathScopes(parsed) {
  assertExactPath('source-dir', parsed.sourceDir, '.local-cache/definition-routes');
  assertExactPath('freeze-dir', parsed.freezeDir, '.local-cache/definition-route-freeze/current');
  assertExactPath('store-dir', parsed.storeDir, '.local-cache/hud-route-store');
  assertExactPath('lookup-dir', parsed.lookupDir, '.local-cache/hud-route-lookup');
  assertExactPath('public-dir', parsed.publicDir, 'data/definitions/hud-route-lookup');
  assertExactPath('store-sample', parsed.storeSample, 'data/definitions/hud-route-store-sample.json');
  assertExactPath('lookup-sample', parsed.lookupSample, 'data/definitions/hud-route-lookup-sample.json');
  assertExactPath('release-stamp', parsed.releaseStamp, 'data/definitions/hud-route-release-stamp.json');
  assertExactPath('release-report', parsed.releaseReport, 'reports/hud-route-release-stamp.md');
  assertExactPath('gate-report', parsed.gateReport, 'reports/hud-route-release-gate.md');
  assertExactPath('gate-json', parsed.gateJson, 'reports/hud-route-release-gate.json');
  assertExactPath('freeze-volume-report', parsed.freezeVolumeReport, 'reports/hud-route-freeze-volume-gate.md');
  assertExactPath('freeze-volume-json', parsed.freezeVolumeJson, 'reports/hud-route-freeze-volume-gate.json');
  assertExactPath('volume-report', parsed.volumeReport, 'reports/hud-route-release-volume-gate.md');
  assertExactPath('volume-json', parsed.volumeJson, 'reports/hud-route-release-volume-gate.json');
  assertFileExtension('store-sample', parsed.storeSample, '.json');
  assertFileExtension('lookup-sample', parsed.lookupSample, '.json');
  assertFileExtension('release-stamp', parsed.releaseStamp, '.json');
  assertFileExtension('release-report', parsed.releaseReport, '.md');
  assertFileExtension('gate-report', parsed.gateReport, '.md');
  assertFileExtension('gate-json', parsed.gateJson, '.json');
  assertFileExtension('freeze-volume-report', parsed.freezeVolumeReport, '.md');
  assertFileExtension('freeze-volume-json', parsed.freezeVolumeJson, '.json');
  assertFileExtension('volume-report', parsed.volumeReport, '.md');
  assertFileExtension('volume-json', parsed.volumeJson, '.json');
}

function assertExactPath(label, value, expected) {
  if (value !== expected) {
    throw new Error(`--${label} must be ${expected}: ${value}`);
  }
}

function assertPathUnder(label, value, expectedPrefix) {
  if (value !== expectedPrefix && !value.startsWith(`${expectedPrefix}/`)) {
    throw new Error(`--${label} must stay under ${expectedPrefix}: ${value}`);
  }
}

function assertFileExtension(label, value, expectedExtension) {
  if (!value.endsWith(expectedExtension)) {
    throw new Error(`--${label} must end with ${expectedExtension}: ${value}`);
  }
}

function frozenRouteJsonl() {
  return [
    'kaikki-definition-claims.jsonl',
    'source-layer-definition-claims.jsonl',
    'source-phrase-evidence.jsonl',
    'source-citable-paraphrase-evidence.jsonl',
    'source-biblical-paraphrase-evidence.jsonl',
    'source-paraphrase-evidence.jsonl',
  ]
    .map((file) => `${options.freezeDir}/${file}`);
}

function nodeStep(label, script, args) {
  return {
    label,
    command: process.execPath,
    args: [script, ...args],
  };
}

function runStep(step) {
  const printable = [step.command, ...step.args].map((part) => (/\s/.test(part) ? `"${part}"` : part)).join(' ');
  console.log(`\n[HUD route release] ${step.label}`);
  console.log(printable);
  if (options.dryRun) return;
  const result = spawnSync(step.command, step.args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function validateReleasePlan(plannedSteps) {
  const requiredOrder = [
    'freeze route inputs',
    'validate frozen route input volume',
    'audit frozen route claims',
    'validate frozen route audit',
    'validate HUD route release volume',
    'build HUD route store from freeze',
    'validate HUD route store',
    'build local HUD route lookup',
    'validate local HUD route lookup',
    'validate route answer safety contract',
    'validate HUD route publication script guards',
    'publish public HUD route lookup',
    'validate public HUD route lookup structure',
    'scan public HUD route cards',
    'validate route publication boundary',
    'audit public HUD normalized keys',
    'stamp HUD route release',
    'validate HUD route release stamp',
    'validate frozen route inputs against current sources',
    'validate HUD route release gate',
    'validate HUD route release gate report',
    'validate route publication boundary coherence',
  ];
  for (let index = 0; index < requiredOrder.length - 1; index += 1) {
    assertBefore(plannedSteps, requiredOrder[index], requiredOrder[index + 1]);
  }
  assertStepHasArgs(plannedSteps, 'validate frozen route input volume', [
    '--max-lookup-cards',
    '--max-phrase-evidence-cards',
  ]);
  assertStepHasArgs(plannedSteps, 'validate HUD route release volume', [
    '--max-lookup-cards',
    '--max-phrase-evidence-cards',
  ]);
  assertStepHasArgs(plannedSteps, 'build local HUD route lookup', [
    '--max-lookup-cards',
  ]);
  assertStepHasArgs(plannedSteps, 'publish public HUD route lookup', [
    '--local-dir',
    '--public-dir',
  ]);
  assertStepHasArgs(plannedSteps, 'stamp HUD route release', [
    '--freeze-manifest',
    '--store-manifest',
    '--lookup-manifest',
    '--public-manifest',
    '--route-audit',
  ]);
  for (const step of plannedSteps) {
    const script = scriptPath(step);
    if (/render/i.test(step.label) || /render_site\.ps1$/i.test(script) || /upgrade_route_hud_pages\.mjs$/i.test(script)) {
      throw new Error(`HUD route release plan must not include broad render or page-upgrade step: ${step.label}`);
    }
  }
}

function assertBefore(plannedSteps, earlierLabel, laterLabel) {
  const earlierIndex = stepIndex(plannedSteps, earlierLabel);
  const laterIndex = stepIndex(plannedSteps, laterLabel);
  if (earlierIndex === -1) throw new Error(`HUD route release plan missing step: ${earlierLabel}`);
  if (laterIndex === -1) throw new Error(`HUD route release plan missing step: ${laterLabel}`);
  if (earlierIndex >= laterIndex) {
    throw new Error(`HUD route release plan requires "${earlierLabel}" before "${laterLabel}"`);
  }
}

function assertStepHasArgs(plannedSteps, label, requiredArgs) {
  const step = plannedSteps.find((candidate) => candidate.label === label);
  if (!step) throw new Error(`HUD route release plan missing step: ${label}`);
  for (const requiredArg of requiredArgs) {
    if (!step.args.includes(requiredArg)) {
      throw new Error(`HUD route release plan step "${label}" missing ${requiredArg}`);
    }
  }
}

function stepIndex(plannedSteps, label) {
  return plannedSteps.findIndex((step) => step.label === label);
}

function scriptPath(step) {
  return String(step.args?.[0] || '').replace(/\\/g, '/');
}

function cleanPath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`HUD route release path must be a relative in-repo path: ${value}`);
  }
  return normalized;
}
