#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { compareCards } from './build_hud_route_lookup.mjs';

const root = process.cwd();
const defaults = {
  manifest: 'data/definitions/hud-route-lookup/manifest.json',
  report: '',
  maxIssueSamples: 50,
};

const forbiddenTextRe = /\bPotential\b|potential option|low confidence|copyright unclear|all rights reserved|Non-?Commercial|\bNC\b/i;
const allowedLicensePatterns = [
  /^CC0$/i,
  /^CC BY 4\.0$/i,
  /^CC-BY$/i,
  /^CC-BY 4\.0$/i,
  /^CC BY-SA 4\.0$/i,
  /^CC-BY-SA$/i,
  /^CC-BY-SA 4\.0$/i,
  /^CC BY-SA 4\.0 \/ GFDL$/i,
  /^CC BY-SA 4\.0\/GFDL$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^project-authored \/ CC0$/i,
];

const options = parseArgs(process.argv.slice(2));
const manifestPath = path.join(root, options.manifest);
const publicDir = path.dirname(manifestPath);
const issues = [];
let issueCount = 0;

const stats = {
  shards_checked: 0,
  tokens_checked: 0,
  cards_checked: 0,
  answer_eligible_cards: 0,
  evidence_only_cards: 0,
  form_reference_cards: 0,
  boundary_blocked_cards: 0,
  cards_with_source_rows: 0,
  source_rows_checked: 0,
  authority_status_overclaim_cards: 0,
  max_cards_for_token: 0,
  max_cards_token: '',
};
const sectionCounts = new Map();
const routeTypeCounts = new Map();
const answerSectionCounts = new Map();

if (!fs.existsSync(manifestPath)) addIssue(`missing public HUD route lookup manifest: ${cleanPath(options.manifest)}`);

const manifest = issues.length ? null : readJson(manifestPath);
if (manifest) {
  if (manifest.schema_version !== 1) addIssue('public lookup manifest schema_version must be 1');
  if (manifest.prefix_length !== 3) addIssue(`unexpected prefix_length ${manifest.prefix_length}`);
  if (!Array.isArray(manifest.shards) || !manifest.shards.length) addIssue('public lookup manifest has no shards');
  validateManifestPublicationBoundary(manifest.publication_boundary);

  const manifestShardPaths = new Set((manifest.shards || []).map((shard) => shard.path));
  const shardDir = path.join(publicDir, 'shards');
  const diskShardPaths = fs.existsSync(shardDir)
    ? fs.readdirSync(shardDir).filter((file) => file.endsWith('.json')).map((file) => `shards/${file}`)
    : [];
  for (const shardPath of diskShardPaths) {
    if (!manifestShardPaths.has(shardPath)) addIssue(`stale public lookup shard not listed in manifest: ${shardPath}`);
  }

  for (const shardInfo of manifest.shards || []) {
    await validateShard(shardInfo);
  }

  if (stats.shards_checked !== Number(manifest.counts?.shard_count || 0)) {
    addIssue(`checked shard count ${stats.shards_checked} does not match manifest shard_count ${manifest.counts?.shard_count}`);
  }
  if (stats.tokens_checked !== Number(manifest.counts?.distinct_normalized_tokens || 0)) {
    addIssue(`checked token count ${stats.tokens_checked} does not match manifest distinct_normalized_tokens ${manifest.counts?.distinct_normalized_tokens}`);
  }
  if (stats.cards_checked !== Number(manifest.counts?.cards_written || 0)) {
    addIssue(`checked card count ${stats.cards_checked} does not match manifest cards_written ${manifest.counts?.cards_written}`);
  }
  if (!stats.answer_eligible_cards) addIssue('public lookup has no answer_eligible cards');
}

const result = {
  schema_version: 1,
  artifact_type: 'public_hud_route_card_scan',
  generated_at: new Date().toISOString(),
  status: issueCount ? 'fail' : 'pass',
  manifest: cleanPath(options.manifest),
  publication_boundary: manifest?.publication_boundary || null,
  counts: {
    ...stats,
    issue_count: issueCount,
  },
  display_sections: Object.fromEntries([...sectionCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  answer_sections: Object.fromEntries([...answerSectionCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  route_types: Object.fromEntries([...routeTypeCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  issue_samples: issues,
};

if (options.report) writeReport(options.report, result);

if (issueCount) {
  console.error(`Public HUD route card scan failed with ${issueCount} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Public HUD route card scan passed. Cards: ${stats.cards_checked}. Tokens: ${stats.tokens_checked}. Shards: ${stats.shards_checked}.`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--manifest') parsed.manifest = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--max-issue-samples') parsed.maxIssueSamples = Number(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxIssueSamples) || parsed.maxIssueSamples < 0) {
    throw new Error(`Invalid --max-issue-samples: ${parsed.maxIssueSamples}`);
  }
  parsed.manifest = cleanRelativePath(parsed.manifest);
  assertExactPath('--manifest', parsed.manifest, 'data/definitions/hud-route-lookup/manifest.json');
  if (parsed.report) {
    parsed.report = cleanRelativePath(parsed.report);
    assertExactPath('--report', parsed.report, 'reports/public-hud-route-card-scan.md');
    assertFileExtension('--report', parsed.report, '.md');
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_public_hud_route_cards.mjs',
      '',
      'Options:',
      '  --manifest data/definitions/hud-route-lookup/manifest.json',
      '  --report reports/public-hud-route-card-scan.md',
      '  --max-issue-samples 50',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

async function validateShard(shardInfo) {
  const manifestShardPath = cleanManifestShardPath(shardInfo.path || '');
  if (!manifestShardPath.startsWith('shards/') || !manifestShardPath.endsWith('.json')) {
    addIssue(`invalid public lookup shard path: ${shardInfo.path || 'missing path'}`);
    return;
  }
  const shardPath = path.join(publicDir, manifestShardPath);
  if (!fs.existsSync(shardPath)) {
    addIssue(`missing public lookup shard: ${shardInfo.path || 'missing path'}`);
    return;
  }
  const actualBytes = fs.statSync(shardPath).size;
  if (actualBytes !== shardInfo.byte_length) {
    addIssue(`public lookup shard byte mismatch ${shardInfo.path}: expected ${shardInfo.byte_length}, got ${actualBytes}`);
  }
  const shard = readJson(shardPath);
  stats.shards_checked += 1;
  if (shard.schema_version !== 1) addIssue(`${shardInfo.path}: schema_version must be 1`);
  if (shard.shard !== shardInfo.shard) addIssue(`${shardInfo.path}: shard id ${shard.shard || 'missing'} does not match manifest ${shardInfo.shard}`);
  if (!shard.routes_by_normalized || typeof shard.routes_by_normalized !== 'object') {
    addIssue(`${shardInfo.path}: missing routes_by_normalized`);
    return;
  }

  const entries = Object.entries(shard.routes_by_normalized);
  const cardCount = entries.reduce((sum, [, cards]) => sum + (Array.isArray(cards) ? cards.length : 0), 0);
  if (entries.length !== shardInfo.token_count) {
    addIssue(`${shardInfo.path}: token count ${entries.length} does not match manifest ${shardInfo.token_count}`);
  }
  if (cardCount !== shardInfo.card_count) {
    addIssue(`${shardInfo.path}: card count ${cardCount} does not match manifest ${shardInfo.card_count}`);
  }

  for (const [normalized, cards] of entries) {
    validateTokenCards(shardInfo.path, normalized, cards);
  }
}

function validateTokenCards(shardPath, normalized, cards) {
  stats.tokens_checked += 1;
  if (!Array.isArray(cards) || !cards.length) {
    addIssue(`${shardPath}:${normalized}: token has no cards`);
    return;
  }
  stats.cards_checked += cards.length;
  if (cards.length > stats.max_cards_for_token) {
    stats.max_cards_for_token = cards.length;
    stats.max_cards_token = normalized;
  }

  let seenEvidenceAfterAnswer = false;
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const context = `${shardPath}:${normalized}[${index}]`;
    if (index > 0 && compareCards(cards[index - 1], card) > 0) {
      addIssue(`${context}: card order does not match HUD route ranking`);
    }
    if (card?.normalized !== normalized) addIssue(`${context}: card normalized ${card?.normalized || 'missing'} does not match lookup key`);
    validateCard(card, context);
    if (card?.answer_eligible === true) {
      if (seenEvidenceAfterAnswer) addIssue(`${context}: answer card appears after evidence cards`);
    } else {
      seenEvidenceAfterAnswer = true;
    }
  }
}

function validateCard(card, context) {
  for (const field of ['card_id', 'normalized', 'route_family', 'route_type', 'display_section', 'display_label']) {
    if (!card?.[field]) addIssue(`${context}: missing ${field}`);
  }
  bump(sectionCounts, card?.display_section || 'missing');
  bump(routeTypeCounts, card?.route_type || 'missing');
  validateMachineAuthorityStatus(card, context);

  if (typeof card?.answer_eligible !== 'boolean') addIssue(`${context}: missing boolean answer_eligible`);
  if (!card?.answer_role) addIssue(`${context}: missing answer_role`);
  if (card?.answer_eligible === true) {
    stats.answer_eligible_cards += 1;
    bump(answerSectionCounts, card?.display_section || 'missing');
    if (card.answer_role !== 'answer') addIssue(`${context}: answer_eligible card must use answer_role=answer`);
    if (!Number.isFinite(card.answer_score)) addIssue(`${context}: answer_eligible card must carry numeric answer_score`);
  } else {
    stats.evidence_only_cards += 1;
    if (Number.isFinite(card?.answer_score)) addIssue(`${context}: non-answer card must not carry answer_score`);
  }

  if (card?.answer_role === 'form_reference') {
    stats.form_reference_cards += 1;
    if (card.answer_eligible !== false) addIssue(`${context}: form_reference must not be answer_eligible`);
    if (!/^form of\b/i.test(String(card.definition || ''))) {
      addIssue(`${context}: form_reference definition must display as "form of [lemma]"`);
    }
  }
  if (card?.boundary_safe === false) stats.boundary_blocked_cards += 1;
  if (card?.route_type !== 'shape' && card?.display_section !== 'audit' && !card?.definition) {
    addIssue(`${context}: missing definition text`);
  }
  if (card?.route_type === 'phrase_evidence' && card.meaning_claim !== null) {
    addIssue(`${context}: phrase evidence must not force meaning_claim`);
  }
  if (['biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(card?.route_type)) {
    if (card.score_handicap !== 20) addIssue(`${context}: paraphrase card score_handicap must be 20`);
    if (!Number.isFinite(card.raw_score) || card.raw_score < 0 || card.raw_score > 100) {
      addIssue(`${context}: paraphrase card raw_score must be 0..100`);
    }
    if (Number.isFinite(card.raw_score) && card.adjusted_score !== card.raw_score - 20) {
      addIssue(`${context}: paraphrase card adjusted_score must equal raw_score - 20`);
    }
    if (card.candidate_status !== 'accepted') addIssue(`${context}: paraphrase card must be candidate_status=accepted`);
    if (card.boundary_safe === false && card.answer_eligible === true) {
      addIssue(`${context}: boundary-unsafe paraphrase must not be answer_eligible`);
    }
  }
  if (card?.route_type !== 'shape' && card?.display_section !== 'audit' && (!Array.isArray(card?.source_rows) || !card.source_rows.length)) {
    addIssue(`${context}: missing source_rows`);
  }
  if (Array.isArray(card?.source_rows) && card.source_rows.length) {
    stats.cards_with_source_rows += 1;
    stats.source_rows_checked += card.source_rows.length;
  }
  for (const [index, row] of (card?.source_rows || []).entries()) {
    if (!safeLicense(row)) addIssue(`${context}.source_rows[${index}]: unsafe or unclear license ${row?.license || 'missing'}`);
  }
  for (const text of policyStringsForCard(card)) {
    if (forbiddenTextRe.test(text)) addIssue(`${context}: forbidden text ${text.slice(0, 120)}`);
  }
}

function validateMachineAuthorityStatus(card, context) {
  let hasOverclaim = false;
  for (const field of ['status', 'review_status', 'authority_status', 'lexical_authority_status']) {
    if (String(card?.[field] || '').trim().toLowerCase() === 'verified') {
      hasOverclaim = true;
      addIssue(`${context}: ${field}=verified is reserved for reviewed lexical authority, not machine route cards`);
    }
  }
  if (card?.reviewed_lexical_authority === true) {
    hasOverclaim = true;
    addIssue(`${context}: reviewed_lexical_authority=true is not allowed on machine route cards`);
  }
  if (hasOverclaim) stats.authority_status_overclaim_cards += 1;
}

function safeLicense(row) {
  const license = String(row?.license || '').trim();
  if (license === 'N/A - project lexical rule') {
    return row?.source_family === 'workspace'
      && String(row?.source_url || '').startsWith('local:')
      && /No external dictionary text imported/i.test(String(row?.notes || ''));
  }
  return allowedLicensePatterns.some((pattern) => pattern.test(license));
}

function walkStrings(value, visit) {
  if (typeof value === 'string') visit(value);
  else if (Array.isArray(value)) value.forEach((item) => walkStrings(item, visit));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => walkStrings(item, visit));
}

function policyStringsForCard(card) {
  const values = [
    card?.route_family,
    card?.route_type,
    card?.display_section,
    card?.display_label,
    card?.match_type,
    card?.plain_note,
    card?.meaning_quality,
    card?.answer_role,
    card?.candidate_status,
  ];
  for (const row of card?.source_rows || []) {
    values.push(row?.source_name, row?.source_family, row?.license, row?.notes);
  }
  return values.filter((value) => typeof value === 'string' && value);
}

function validateManifestPublicationBoundary(boundary) {
  if (!boundary || typeof boundary !== 'object') {
    addIssue('public lookup manifest publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    addIssue(`public lookup manifest publication_boundary.publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`);
  }
  for (const item of ['public_hud_route_lookup_manifest', 'public_hud_route_lookup_shards']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      addIssue(`public lookup manifest publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      addIssue(`public lookup manifest publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    addIssue('public lookup manifest publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (!String(boundary.route_lookup_scope || '').includes('not_publication_readiness')) {
    addIssue('public lookup manifest publication_boundary.route_lookup_scope must state not_publication_readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    addIssue('public lookup manifest publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (boundary.current_route_inputs_reconciled !== 'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift') {
    addIssue('public lookup manifest publication_boundary.current_route_inputs_reconciled must defer to release stamp and drift validation');
  }
}

function addIssue(message) {
  issueCount += 1;
  if (issues.length < options.maxIssueSamples) issues.push(message);
}

function bump(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeReport(relativePath, result) {
  const filePath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    '# Public HUD Route Card Scan',
    '',
    `Generated: ${result.generated_at}`,
    `Status: ${result.status}`,
    `Manifest: \`${result.manifest}\``,
    `Publication status: ${result.publication_boundary?.publication_status || 'missing'}`,
    '',
    '## Counts',
    '',
    `- Shards checked: ${result.counts.shards_checked}`,
    `- Tokens checked: ${result.counts.tokens_checked}`,
    `- Cards checked: ${result.counts.cards_checked}`,
    `- Answer-eligible cards: ${result.counts.answer_eligible_cards}`,
    `- Evidence-only cards: ${result.counts.evidence_only_cards}`,
    `- Form-reference cards: ${result.counts.form_reference_cards}`,
    `- Boundary-blocked cards: ${result.counts.boundary_blocked_cards}`,
    `- Source rows checked: ${result.counts.source_rows_checked}`,
    `- Max cards for token: ${result.counts.max_cards_for_token} (${asciiText(result.counts.max_cards_token)})`,
    `- Issue count: ${result.counts.issue_count}`,
    '',
    '## Answer Sections',
    '',
    ...mapTable(result.answer_sections),
    '',
    '## Display Sections',
    '',
    ...mapTable(result.display_sections),
    '',
    '## Route Types',
    '',
    ...mapTable(result.route_types),
    '',
    '## Issue Samples',
    '',
    ...(result.issue_samples.length ? result.issue_samples.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Boundary',
    '',
    `- Validates: ${(result.publication_boundary?.validates || []).join(', ') || 'missing'}`,
    `- Does not clear: ${(result.publication_boundary?.does_not_clear || []).join(', ') || 'missing'}`,
    `- Answer eligibility scope: ${result.publication_boundary?.answer_eligible_scope || 'missing'}`,
    `- Route lookup scope: ${result.publication_boundary?.route_lookup_scope || 'missing'}`,
    `- Current route inputs reconciled: ${result.publication_boundary?.current_route_inputs_reconciled || 'missing'}`,
    '- This scan validates already-published HUD route lookup cards. It does not regenerate definitions, alter source imports, create route families, create accepted translation output, or establish publication readiness.',
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
