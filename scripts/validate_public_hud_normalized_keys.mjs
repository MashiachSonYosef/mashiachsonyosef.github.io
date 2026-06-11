#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  manifest: 'data/definitions/hud-route-lookup/manifest.json',
  report: '',
  json: '',
  maxSamples: 40,
  failOnIssues: false,
};

const unsafeKeyRe = /[A-Za-z0-9+\\\/?;:\[\]{}<>_=*|@#$%^&~]/u;
const asciiLetterRe = /[A-Za-z]/u;
const digitRe = /[0-9]/u;
const plusRe = /\+/u;
const slashRe = /[\\\/]/u;
const annotationPunctuationRe = /[?;:\[\]{}<>_=*|@#$%^&~]/u;
const hebrewLetterRe = /[\u05D0-\u05EA]/u;

const options = parseArgs(process.argv.slice(2));
const manifestPath = path.join(root, options.manifest);
const publicDir = path.dirname(manifestPath);
const issueSamples = [];
const shapeCounts = new Map();
const routeTypeIssueCounts = new Map();
const answerRoleIssueCounts = new Map();
let issueCount = 0;

const stats = {
  shards_checked: 0,
  tokens_checked: 0,
  cards_checked: 0,
  issue_tokens: 0,
  issue_cards: 0,
  ascii_letter_tokens: 0,
  digit_tokens: 0,
  plus_tokens: 0,
  slash_tokens: 0,
  annotation_punctuation_tokens: 0,
  non_hebrew_tokens: 0,
};

let manifest = null;

if (!fs.existsSync(manifestPath)) {
  addIssue({
    shard: '',
    normalized: '',
    card_count: 0,
    reasons: [`missing public HUD route lookup manifest: ${cleanPath(options.manifest)}`],
    route_types: [],
    answer_roles: [],
  });
} else {
  manifest = readJson(manifestPath);
  validateManifestPublicationBoundary(manifest.publication_boundary);
  for (const shardInfo of manifest.shards || []) {
    validateShard(shardInfo);
  }
  if (stats.shards_checked !== Number(manifest.counts?.shard_count || 0)) {
    addIssue({
      shard: '',
      normalized: '',
      card_count: 0,
      reasons: [`checked shard count ${stats.shards_checked} does not match manifest shard_count ${manifest.counts?.shard_count}`],
      route_types: [],
      answer_roles: [],
    });
  }
  if (stats.tokens_checked !== Number(manifest.counts?.distinct_normalized_tokens || 0)) {
    addIssue({
      shard: '',
      normalized: '',
      card_count: 0,
      reasons: [`checked token count ${stats.tokens_checked} does not match manifest distinct_normalized_tokens ${manifest.counts?.distinct_normalized_tokens}`],
      route_types: [],
      answer_roles: [],
    });
  }
}

const result = {
  schema_version: 1,
  artifact_type: 'public_hud_normalized_key_audit',
  generated_at: new Date().toISOString(),
  status: issueCount ? (options.failOnIssues ? 'fail' : 'warn') : 'pass',
  manifest: cleanPath(options.manifest),
  publication_boundary: manifest?.publication_boundary || null,
  policy: 'Public HUD lookup keys must not contain English grammar annotations, digits, plus signs, slashes, or annotation punctuation. Hebrew punctuation, spaces, maqaf, geresh/gershayim, commas, periods, and parentheses are audit-visible but not failures by themselves.',
  counts: {
    ...stats,
    issue_count: issueCount,
  },
  key_shapes: Object.fromEntries([...shapeCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  issue_route_types: Object.fromEntries([...routeTypeIssueCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  issue_answer_roles: Object.fromEntries([...answerRoleIssueCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  issue_samples: issueSamples,
};

if (options.report) writeReport(options.report, result);
if (options.json) writeJson(options.json, result);

if (issueCount && options.failOnIssues) {
  console.error(`Public HUD normalized key audit failed with ${issueCount} issue token(s).`);
  for (const sample of issueSamples) {
    console.error(`- ${sample.shard}:${asciiText(sample.normalized)} (${sample.reasons.join(', ')})`);
  }
  process.exit(1);
}

console.log(`Public HUD normalized key audit ${result.status}. Tokens: ${stats.tokens_checked}. Issue tokens: ${issueCount}.`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--manifest') parsed.manifest = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--json') parsed.json = args[++index];
    else if (arg === '--max-samples') parsed.maxSamples = Number(args[++index]);
    else if (arg === '--fail-on-issues') parsed.failOnIssues = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxSamples) || parsed.maxSamples < 0) {
    throw new Error(`Invalid --max-samples: ${parsed.maxSamples}`);
  }
  parsed.manifest = cleanRelativePath(parsed.manifest);
  assertExactPath('--manifest', parsed.manifest, 'data/definitions/hud-route-lookup/manifest.json');
  if (parsed.report) {
    parsed.report = cleanRelativePath(parsed.report);
    assertExactPath('--report', parsed.report, 'reports/public-hud-normalized-key-audit.md');
    assertFileExtension('--report', parsed.report, '.md');
  }
  if (parsed.json) {
    parsed.json = cleanRelativePath(parsed.json);
    assertExactPath('--json', parsed.json, 'reports/public-hud-normalized-key-audit.json');
    assertFileExtension('--json', parsed.json, '.json');
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_public_hud_normalized_keys.mjs',
      '',
      'Options:',
      '  --manifest data/definitions/hud-route-lookup/manifest.json',
      '  --report reports/public-hud-normalized-key-audit.md',
      '  --json reports/public-hud-normalized-key-audit.json',
      '  --max-samples 40',
      '  --fail-on-issues',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function validateShard(shardInfo) {
  const manifestShardPath = cleanManifestShardPath(shardInfo.path || '');
  if (!manifestShardPath.startsWith('shards/') || !manifestShardPath.endsWith('.json')) {
    addIssue({
      shard: shardInfo.path || '',
      normalized: '',
      card_count: 0,
      reasons: ['invalid shard path'],
      route_types: [],
      answer_roles: [],
    });
    return;
  }
  const shardPath = path.join(publicDir, manifestShardPath);
  if (!fs.existsSync(shardPath)) {
    addIssue({
      shard: shardInfo.path || '',
      normalized: '',
      card_count: 0,
      reasons: ['missing shard file'],
      route_types: [],
      answer_roles: [],
    });
    return;
  }
  const shard = readJson(shardPath);
  stats.shards_checked += 1;
  for (const [normalized, cards] of Object.entries(shard.routes_by_normalized || {})) {
    const cardList = Array.isArray(cards) ? cards : [];
    stats.tokens_checked += 1;
    stats.cards_checked += cardList.length;
    bump(shapeCounts, keyShape(normalized));
    const reasons = keyIssues(normalized);
    if (!reasons.length) continue;
    stats.issue_tokens += 1;
    stats.issue_cards += cardList.length;
    const routeTypes = [...new Set(cardList.map((card) => card?.route_type || 'missing'))].sort();
    const answerRoles = [...new Set(cardList.map((card) => card?.answer_role || 'missing'))].sort();
    for (const routeType of routeTypes) bump(routeTypeIssueCounts, routeType);
    for (const answerRole of answerRoles) bump(answerRoleIssueCounts, answerRole);
    for (const reason of reasons) {
      if (reason === 'ascii_letter') stats.ascii_letter_tokens += 1;
      else if (reason === 'digit') stats.digit_tokens += 1;
      else if (reason === 'plus') stats.plus_tokens += 1;
      else if (reason === 'slash_or_backslash') stats.slash_tokens += 1;
      else if (reason === 'annotation_punctuation') stats.annotation_punctuation_tokens += 1;
      else if (reason === 'no_hebrew_letter') stats.non_hebrew_tokens += 1;
    }
    addIssue({
      shard: shardInfo.path || '',
      normalized,
      card_count: cardList.length,
      reasons,
      route_types: routeTypes,
      answer_roles: answerRoles,
    });
  }
}

function keyIssues(normalized) {
  const value = String(normalized || '');
  const reasons = [];
  if (!hebrewLetterRe.test(value)) reasons.push('no_hebrew_letter');
  if (asciiLetterRe.test(value)) reasons.push('ascii_letter');
  if (digitRe.test(value)) reasons.push('digit');
  if (plusRe.test(value)) reasons.push('plus');
  if (slashRe.test(value)) reasons.push('slash_or_backslash');
  if (annotationPunctuationRe.test(value)) reasons.push('annotation_punctuation');
  if (unsafeKeyRe.test(value) && !reasons.length) reasons.push('unsafe_key_character');
  return reasons;
}

function keyShape(normalized) {
  const value = String(normalized || '');
  const parts = [];
  if (/\s/u.test(value)) parts.push('space');
  if (/[\u05BE-]/u.test(value)) parts.push('hyphen_or_maqaf');
  if (/[(),.]/u.test(value)) parts.push('plain_punctuation');
  if (/[A-Za-z]/u.test(value)) parts.push('ascii_letter');
  if (/[\\\/+?;:\[\]{}<>_=*|@#$%^&~0-9]/u.test(value)) parts.push('unsafe_annotation');
  return parts.length ? parts.join('+') : 'hebrew_word';
}

function validateManifestPublicationBoundary(boundary) {
  if (!boundary || typeof boundary !== 'object') {
    addManifestIssue('public lookup manifest publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    addManifestIssue(`public lookup manifest publication_boundary.publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`);
  }
  for (const item of ['public_hud_route_lookup_manifest', 'public_hud_route_lookup_shards']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      addManifestIssue(`public lookup manifest publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      addManifestIssue(`public lookup manifest publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    addManifestIssue('public lookup manifest publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (!String(boundary.route_lookup_scope || '').includes('not_publication_readiness')) {
    addManifestIssue('public lookup manifest publication_boundary.route_lookup_scope must state not_publication_readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    addManifestIssue('public lookup manifest publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (boundary.current_route_inputs_reconciled !== 'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift') {
    addManifestIssue('public lookup manifest publication_boundary.current_route_inputs_reconciled must defer to release stamp and drift validation');
  }
}

function addManifestIssue(message) {
  addIssue({
    shard: '',
    normalized: '',
    card_count: 0,
    reasons: [message],
    route_types: [],
    answer_roles: [],
  });
}

function addIssue(sample) {
  issueCount += 1;
  if (issueSamples.length < options.maxSamples) {
    issueSamples.push({
      ...sample,
      normalized_ascii: asciiText(sample.normalized),
    });
  }
}

function bump(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(relativePath, value) {
  const filePath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, result) {
  const filePath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    '# Public HUD Normalized Key Audit',
    '',
    `Generated: ${result.generated_at}`,
    `Status: ${result.status}`,
    `Manifest: \`${result.manifest}\``,
    `Publication status: ${result.publication_boundary?.publication_status || 'missing'}`,
    '',
    '## Policy',
    '',
    result.policy,
    '',
    '## Counts',
    '',
    `- Shards checked: ${result.counts.shards_checked}`,
    `- Tokens checked: ${result.counts.tokens_checked}`,
    `- Cards checked: ${result.counts.cards_checked}`,
    `- Issue tokens: ${result.counts.issue_tokens}`,
    `- Issue cards: ${result.counts.issue_cards}`,
    `- ASCII-letter tokens: ${result.counts.ascii_letter_tokens}`,
    `- Digit tokens: ${result.counts.digit_tokens}`,
    `- Plus-sign tokens: ${result.counts.plus_tokens}`,
    `- Slash/backslash tokens: ${result.counts.slash_tokens}`,
    `- Annotation-punctuation tokens: ${result.counts.annotation_punctuation_tokens}`,
    `- Non-Hebrew tokens: ${result.counts.non_hebrew_tokens}`,
    '',
    '## Key Shapes',
    '',
    ...mapTable(result.key_shapes),
    '',
    '## Issue Route Types',
    '',
    ...mapTable(result.issue_route_types),
    '',
    '## Issue Answer Roles',
    '',
    ...mapTable(result.issue_answer_roles),
    '',
    '## Issue Samples',
    '',
    ...(result.issue_samples.length ? result.issue_samples.map((sample) => [
      `- ${sample.shard}: \`${sample.normalized_ascii}\``,
      `  - Cards: ${sample.card_count}`,
      `  - Reasons: ${sample.reasons.join(', ')}`,
      `  - Route types: ${sample.route_types.join(', ') || 'none'}`,
      `  - Answer roles: ${sample.answer_roles.join(', ') || 'none'}`,
    ].join('\n')) : ['- None']),
    '',
    '## Boundary',
    '',
    `- Validates: ${(result.publication_boundary?.validates || []).join(', ') || 'missing'}`,
    `- Does not clear: ${(result.publication_boundary?.does_not_clear || []).join(', ') || 'missing'}`,
    `- Answer eligibility scope: ${result.publication_boundary?.answer_eligible_scope || 'missing'}`,
    `- Route lookup scope: ${result.publication_boundary?.route_lookup_scope || 'missing'}`,
    `- Current route inputs reconciled: ${result.publication_boundary?.current_route_inputs_reconciled || 'missing'}`,
    '- This audit checks lookup-key hygiene only. It does not import definitions, rewrite source texts, infer meanings, create accepted translation output, or establish publication readiness.',
  ];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function mapTable(object) {
  const entries = Object.entries(object);
  if (!entries.length) return ['- None'];
  return [
    '| key | count |',
    '|---|---:|',
    ...entries.map(([key, count]) => `| ${mdCell(key)} | ${count} |`),
  ];
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function asciiText(value) {
  return [...String(value ?? '')].map((char) => {
    const code = char.codePointAt(0);
    return code >= 0x20 && code <= 0x7e ? char : `\\u{${code.toString(16)}}`;
  }).join('');
}

function cleanPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function cleanRelativePath(value) {
  const normalized = cleanPath(value).replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be a relative in-repo path: ${value}`);
  }
  return normalized;
}

function cleanManifestShardPath(value) {
  const normalized = cleanPath(value);
  if (!normalized || normalized.includes('//') || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Manifest shard path must be relative and in-repo: ${value}`);
  }
  return normalized;
}

function assertExactPath(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label} must be ${expected}: ${actual}`);
}

function assertPathUnder(label, actual, expectedPrefix) {
  if (actual !== expectedPrefix && !actual.startsWith(`${expectedPrefix}/`)) {
    throw new Error(`${label} must stay under ${expectedPrefix}: ${actual}`);
  }
}

function assertFileExtension(label, actual, expectedExtension) {
  if (!actual.endsWith(expectedExtension)) throw new Error(`${label} must end with ${expectedExtension}: ${actual}`);
}
