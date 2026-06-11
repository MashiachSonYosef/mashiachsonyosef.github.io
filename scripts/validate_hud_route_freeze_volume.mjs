#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  freezeManifest: '.local-cache/definition-route-freeze/current/route-input-freeze.json',
  report: 'reports/hud-route-freeze-volume-gate.md',
  json: 'reports/hud-route-freeze-volume-gate.json',
  maxLookupCards: 1000000,
  maxPhraseEvidenceCards: 1000000,
  noFailOnBlock: false,
};

const options = parseArgs(process.argv.slice(2));
const manifest = readJson(options.freezeManifest);
const issues = [];

if (manifest.schema_version !== 1) issues.push('freeze manifest schema_version must be 1');
if (manifest.artifact_type !== 'hud_route_input_freeze') issues.push('freeze manifest artifact_type must be hud_route_input_freeze');
if (!Array.isArray(manifest.files) || !manifest.files.length) issues.push('freeze manifest files must be a non-empty array');

const jsonlFiles = (manifest.files || []).filter((file) => String(file.file || '').endsWith('.jsonl'));
const routeRows = sumRows(jsonlFiles);
const phraseEvidenceRows = sumRows(jsonlFiles.filter((file) => file.file === 'source-phrase-evidence.jsonl'));
const citableParaphraseRows = sumRows(jsonlFiles.filter((file) => file.file === 'source-citable-paraphrase-evidence.jsonl'));
const missingRowCountFiles = jsonlFiles.filter((file) => !Number.isInteger(file.row_count));
const blockedReasons = [];

if (missingRowCountFiles.length) {
  issues.push(`jsonl files missing row_count: ${missingRowCountFiles.map((file) => file.file).join(', ')}`);
}
if (routeRows > options.maxLookupCards) {
  blockedReasons.push(`frozen route rows ${routeRows} exceed max lookup cards ${options.maxLookupCards}`);
}
if (phraseEvidenceRows > options.maxPhraseEvidenceCards) {
  blockedReasons.push(`frozen phrase evidence rows ${phraseEvidenceRows} exceed max phrase evidence cards ${options.maxPhraseEvidenceCards}`);
}
if (issues.length) blockedReasons.push('freeze manifest is not valid for volume gating');

const status = blockedReasons.length ? 'blocked' : 'passed';
const result = {
  schema_version: 1,
  artifact_type: 'hud_route_freeze_volume_gate',
  generated_at: new Date().toISOString(),
  generator: 'scripts/validate_hud_route_freeze_volume.mjs',
  status,
  policy: 'Pre-audit volume gate for frozen HUD route inputs. It reads only route-input-freeze row counts and blocks oversized route sets before route-claim audit, route-store generation, lookup generation, public publication, release stamping, or rendering.',
  inputs: {
    freeze_manifest: options.freezeManifest,
  },
  thresholds: {
    max_lookup_cards: options.maxLookupCards,
    max_phrase_evidence_cards: options.maxPhraseEvidenceCards,
  },
  counts: {
    frozen_files: manifest.files?.length || 0,
    frozen_jsonl_files: jsonlFiles.length,
    frozen_route_rows: routeRows,
    frozen_phrase_evidence_rows: phraseEvidenceRows,
    frozen_citable_paraphrase_rows: citableParaphraseRows,
    missing_optional_files: Array.isArray(manifest.missing_optional_files) ? manifest.missing_optional_files.length : 0,
    copy_bytes: Number(manifest.preflight?.copy_bytes || sumBytes(manifest.files || [])),
    issue_count: issues.length,
  },
  files: jsonlFiles.map((file) => ({
    file: file.file,
    role: file.role,
    required: file.required,
    byte_length: Number(file.byte_length || 0),
    row_count: Number.isInteger(file.row_count) ? file.row_count : null,
  })),
  publication_boundary: {
    boundary_status: status === 'blocked' ? 'blocked_no_render' : 'freeze_volume_gate_passed_not_publication_ready',
    reader_facing: false,
    ui_assignment: false,
    route_claim_audit_run: false,
    publication_claim: false,
    clears_publication_readiness: false,
    reviewed_lexical_authority: false,
    accepted_translation_output: false,
    source_publication: false,
    public_lookup_artifact: false,
    store_generated: false,
    lookup_generated: false,
    public_lookup_published: false,
    release_stamp_written: false,
    does_not_clear: [
      'route_claim_audit',
      'ui_assignment',
      'reviewed_lexical_authority',
      'accepted_translation',
      'source_publication',
      'public_lookup_publication',
      'publication_readiness',
    ],
  },
  blocked_reasons: blockedReasons,
  issues,
};

writeJson(options.json, result);
writeReport(options.report, result);

if (issues.length) {
  console.error(`HUD route freeze volume gate failed with ${issues.length} issue(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

if (status === 'blocked') {
  console.error(`HUD route freeze volume gate blocked: ${blockedReasons.join('; ')}.`);
  console.error('No route audit, store, lookup, public lookup, release stamp, or render step was run by this gate.');
  process.exit(options.noFailOnBlock ? 0 : 1);
}

console.log(`HUD route freeze volume gate passed. Frozen route rows: ${routeRows}; phrase evidence rows: ${phraseEvidenceRows}.`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--freeze-manifest') parsed.freezeManifest = cleanPath(args[++index]);
    else if (arg === '--report') parsed.report = cleanPath(args[++index]);
    else if (arg === '--json') parsed.json = cleanPath(args[++index]);
    else if (arg === '--max-lookup-cards') parsed.maxLookupCards = Number(args[++index]);
    else if (arg === '--max-phrase-evidence-cards') parsed.maxPhraseEvidenceCards = Number(args[++index]);
    else if (arg === '--no-fail-on-block') parsed.noFailOnBlock = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  parsed.freezeManifest = cleanPath(parsed.freezeManifest);
  parsed.report = cleanPath(parsed.report);
  parsed.json = cleanPath(parsed.json);
  validatePathScopes(parsed);
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_hud_route_freeze_volume.mjs',
      '',
      'Options:',
      '  --freeze-manifest .local-cache/definition-route-freeze/current/route-input-freeze.json',
      '  --report reports/hud-route-freeze-volume-gate.md',
      '  --json reports/hud-route-freeze-volume-gate.json',
      '  --max-lookup-cards 1000000',
      '  --max-phrase-evidence-cards 1000000',
      '  --no-fail-on-block',
    ].join('\n'));
    process.exit(0);
  }
  if (!Number.isFinite(parsed.maxLookupCards) || parsed.maxLookupCards < 1) {
    throw new Error(`Invalid --max-lookup-cards: ${parsed.maxLookupCards}`);
  }
  if (!Number.isFinite(parsed.maxPhraseEvidenceCards) || parsed.maxPhraseEvidenceCards < 0) {
    throw new Error(`Invalid --max-phrase-evidence-cards: ${parsed.maxPhraseEvidenceCards}`);
  }
  return parsed;
}

function validatePathScopes(parsed) {
  assertExactPath('--freeze-manifest', parsed.freezeManifest, '.local-cache/definition-route-freeze/current/route-input-freeze.json');
  assertExactPath('--report', parsed.report, 'reports/hud-route-freeze-volume-gate.md');
  assertExactPath('--json', parsed.json, 'reports/hud-route-freeze-volume-gate.json');
  assertFileExtension('--report', parsed.report, '.md');
  assertFileExtension('--json', parsed.json, '.json');
}

function writeReport(relativePath, result) {
  const lines = [
    '# HUD Route Freeze Volume Gate',
    '',
    `Generated: ${result.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${result.status}`,
    `- Boundary: ${result.publication_boundary.boundary_status}`,
    `- Frozen route rows: ${result.counts.frozen_route_rows}`,
    `- Frozen phrase evidence rows: ${result.counts.frozen_phrase_evidence_rows}`,
    `- Frozen citable paraphrase rows: ${result.counts.frozen_citable_paraphrase_rows}`,
    `- Max lookup cards: ${result.thresholds.max_lookup_cards}`,
    `- Max phrase evidence cards: ${result.thresholds.max_phrase_evidence_cards}`,
    '',
    '## Boundary',
    '',
    '- No route-claim audit was performed by this gate.',
    '- No store generation was performed by this gate.',
    '- No lookup generation was performed by this gate.',
    '- No public lookup publication was performed by this gate.',
    '- No release stamp was written by this gate.',
    '- This does not clear publication readiness.',
    '',
    '## Blocked Reasons',
    '',
    ...(result.blocked_reasons.length ? result.blocked_reasons.map((reason) => `- ${reason}`) : ['- None']),
    '',
    '## Frozen JSONL Files',
    '',
    '| file | rows | bytes | required |',
    '|---|---:|---:|---|',
    ...result.files.map((file) => `| ${mdCell(file.file)} | ${file.row_count ?? ''} | ${file.byte_length} | ${file.required === true ? 'yes' : 'no'} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function sumRows(files) {
  return files.reduce((sum, file) => sum + (Number.isInteger(file.row_count) ? file.row_count : 0), 0);
}

function sumBytes(files) {
  return files.reduce((sum, file) => sum + Number(file.byte_length || 0), 0);
}

function readJson(relativePath) {
  const clean = cleanPath(relativePath);
  const fullPath = path.join(root, clean);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing freeze manifest: ${clean}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const clean = cleanPath(relativePath);
  const fullPath = path.join(root, clean);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function cleanPath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function assertExactPath(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label} must be ${expected}, got ${actual || '(empty)'}`);
}

function assertPathUnder(label, actual, expectedPrefix) {
  if (actual !== expectedPrefix && !actual.startsWith(`${expectedPrefix}/`)) {
    throw new Error(`${label} must stay under ${expectedPrefix}, got ${actual || '(empty)'}`);
  }
}

function assertFileExtension(label, actual, expectedExtension) {
  if (!actual.endsWith(expectedExtension)) {
    throw new Error(`${label} must end with ${expectedExtension}, got ${actual || '(empty)'}`);
  }
}

function mdCell(value) {
  return String(value || '').replace(/\|/g, '\\|');
}
