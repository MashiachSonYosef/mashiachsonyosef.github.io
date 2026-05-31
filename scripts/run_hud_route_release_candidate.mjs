#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

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
  dryRun: false,
};

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
  nodeStep('audit frozen route claims', 'scripts/audit_definition_route_claims.mjs', [
    `--manifest=${options.freezeDir}/definition-route-manifest.json`,
    `--route-jsonl=${frozenRouteJsonl().join(',')}`,
    `--output=${frozenAudit}`,
    `--report=${frozenAuditReport}`,
  ]),
  nodeStep('validate frozen route audit', 'scripts/validate_definition_route_claim_audit.mjs', [
    frozenAudit,
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
  ]),
  nodeStep('validate local HUD route lookup', 'scripts/validate_hud_route_lookup.mjs', []),
  nodeStep('publish public HUD route lookup', 'scripts/publish_hud_route_lookup.mjs', [
    '--local-dir', options.lookupDir,
    '--public-dir', options.publicDir,
  ]),
  nodeStep('validate public HUD route lookup structure', 'scripts/validate_public_hud_route_lookup.mjs', [
    '--skip-release-stamp',
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
  ]),
];

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
      '  --dry-run',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
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

function cleanPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
