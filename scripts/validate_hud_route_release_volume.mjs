#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  routeAudit: '.local-cache/definition-route-freeze/current/definition-route-claim-audit.json',
  report: 'reports/hud-route-release-volume-gate.md',
  json: 'reports/hud-route-release-volume-gate.json',
  maxLookupCards: 1000000,
  maxPhraseEvidenceCards: 1000000,
  noFailOnBlock: false,
};

const options = parseArgs(process.argv.slice(2));
const audit = readJson(options.routeAudit);
const issues = [];

if (audit.schema_version !== 1) issues.push('route audit schema_version must be 1');
if (audit.artifact_type !== 'definition_route_claim_audit') issues.push('route audit artifact_type must be definition_route_claim_audit');
if (!Number.isInteger(audit.counts?.rows) || audit.counts.rows < 1) issues.push('route audit counts.rows must be positive');
if (Number(audit.counts?.issue_count || 0) !== 0) issues.push(`route audit has ${audit.counts.issue_count} unresolved issue(s)`);

const totalRows = Number(audit.counts?.rows || 0);
const phraseEvidenceRows = Number(audit.route_families?.source_phrase_evidence || 0);
const answerEligibleRows = Number(audit.counts?.answer_eligible_rows || 0);
const nonAnswerRows = Number(audit.counts?.non_answer_rows || 0);
const blockedReasons = [];

if (totalRows > options.maxLookupCards) {
  blockedReasons.push(`route rows ${totalRows} exceed max lookup cards ${options.maxLookupCards}`);
}
if (phraseEvidenceRows > options.maxPhraseEvidenceCards) {
  blockedReasons.push(`phrase evidence rows ${phraseEvidenceRows} exceed max phrase evidence cards ${options.maxPhraseEvidenceCards}`);
}
if (issues.length) blockedReasons.push('route claim audit is not clean');

const status = blockedReasons.length ? 'blocked' : 'passed';
const result = {
  schema_version: 1,
  artifact_type: 'hud_route_release_volume_gate',
  generated_at: new Date().toISOString(),
  generator: 'scripts/validate_hud_route_release_volume.mjs',
  status,
  policy: 'Preflight gate for HUD route release candidates. It validates route volume from the frozen route-claim audit before store, lookup, public-copy, stamp, or render steps. It does not publish lookup artifacts, alter route ranking, select visible answers, or clear publication readiness.',
  inputs: {
    route_audit: options.routeAudit,
  },
  thresholds: {
    max_lookup_cards: options.maxLookupCards,
    max_phrase_evidence_cards: options.maxPhraseEvidenceCards,
  },
  counts: {
    route_rows: totalRows,
    answer_eligible_rows: answerEligibleRows,
    non_answer_rows: nonAnswerRows,
    phrase_evidence_rows: phraseEvidenceRows,
    route_audit_issue_count: Number(audit.counts?.issue_count || 0),
    route_files: Number(audit.counts?.files || 0),
    source_rows: Number(audit.counts?.source_rows || 0),
  },
  route_families: audit.route_families || {},
  route_types: audit.route_types || {},
  answer_roles: audit.answer_roles || {},
  publication_boundary: {
    boundary_status: status === 'blocked' ? 'blocked_no_render' : 'volume_gate_passed_not_publication_ready',
    reader_facing: false,
    ui_assignment: false,
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
  console.error(`HUD route release volume gate failed with ${issues.length} audit issue(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

if (status === 'blocked') {
  console.error(`HUD route release volume gate blocked: ${blockedReasons.join('; ')}.`);
  console.error('No store, lookup, public lookup, release stamp, or render step was run by this gate.');
  process.exit(options.noFailOnBlock ? 0 : 1);
}

console.log(`HUD route release volume gate passed. Route rows: ${totalRows}; phrase evidence rows: ${phraseEvidenceRows}.`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--route-audit') parsed.routeAudit = cleanPath(args[++index]);
    else if (arg === '--report') parsed.report = cleanPath(args[++index]);
    else if (arg === '--json') parsed.json = cleanPath(args[++index]);
    else if (arg === '--max-lookup-cards') parsed.maxLookupCards = Number(args[++index]);
    else if (arg === '--max-phrase-evidence-cards') parsed.maxPhraseEvidenceCards = Number(args[++index]);
    else if (arg === '--no-fail-on-block') parsed.noFailOnBlock = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  parsed.routeAudit = cleanPath(parsed.routeAudit);
  parsed.report = cleanPath(parsed.report);
  parsed.json = cleanPath(parsed.json);
  validatePathScopes(parsed);
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_hud_route_release_volume.mjs',
      '',
      'Options:',
      '  --route-audit .local-cache/definition-route-freeze/current/definition-route-claim-audit.json',
      '  --report reports/hud-route-release-volume-gate.md',
      '  --json reports/hud-route-release-volume-gate.json',
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
  assertExactPath('--route-audit', parsed.routeAudit, '.local-cache/definition-route-freeze/current/definition-route-claim-audit.json');
  assertExactPath('--report', parsed.report, 'reports/hud-route-release-volume-gate.md');
  assertExactPath('--json', parsed.json, 'reports/hud-route-release-volume-gate.json');
  assertFileExtension('--report', parsed.report, '.md');
  assertFileExtension('--json', parsed.json, '.json');
}

function writeReport(relativePath, result) {
  const lines = [
    '# HUD Route Release Volume Gate',
    '',
    `Generated: ${result.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${result.status}`,
    `- Boundary: ${result.publication_boundary.boundary_status}`,
    `- Route rows: ${result.counts.route_rows}`,
    `- Answer-eligible rows: ${result.counts.answer_eligible_rows}`,
    `- Phrase evidence rows: ${result.counts.phrase_evidence_rows}`,
    `- Max lookup cards: ${result.thresholds.max_lookup_cards}`,
    `- Max phrase evidence cards: ${result.thresholds.max_phrase_evidence_cards}`,
    '',
    '## Boundary',
    '',
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
    '## Route Families',
    '',
    ...Object.entries(result.route_families).map(([family, count]) => `- ${family}: ${count}`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function readJson(relativePath) {
  const clean = cleanPath(relativePath);
  const fullPath = path.join(root, clean);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing route audit: ${clean}`);
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
