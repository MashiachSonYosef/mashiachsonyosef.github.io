#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'data', 'definitions', 'hud-route-lookup');
const manifestPath = path.join(publicDir, 'manifest.json');
const releaseStampPath = path.join(root, 'data', 'definitions', 'hud-route-release-stamp.json');
const samplePath = path.join(root, 'data', 'definitions', 'hud-route-lookup-sample.json');
const options = parseArgs(process.argv.slice(2));
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function parseArgs(args) {
  const parsed = {
    checkReleaseStamp: true,
  };
  for (const arg of args) {
    if (arg === '--skip-release-stamp') parsed.checkReleaseStamp = false;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_public_hud_route_lookup.mjs',
      '',
      'Options:',
      '  --skip-release-stamp  Validate public lookup structure before a new release stamp is written.',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
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

function validateCard(card, context, issues) {
  for (const field of ['card_id', 'normalized', 'route_family', 'route_type', 'display_section', 'display_label']) {
    if (!card?.[field]) issues.push(`${context}: missing ${field}`);
  }
  if (typeof card.answer_eligible !== 'boolean') issues.push(`${context}: missing boolean answer_eligible`);
  if (!card.answer_role) issues.push(`${context}: missing answer_role`);
  if (card.answer_eligible === true && card.answer_role !== 'answer') {
    issues.push(`${context}: answer_eligible card must use answer_role=answer`);
  }
  if (card.answer_eligible !== true && Number.isFinite(card.answer_score)) {
    issues.push(`${context}: non-answer card must not carry answer_score`);
  }
  if (card.answer_role === 'form_reference') {
    if (card.answer_eligible !== false) issues.push(`${context}: form_reference must not be answer_eligible`);
    if (!/^form of\b/i.test(String(card.definition || ''))) {
      issues.push(`${context}: form_reference definition must display as "form of [lemma]"`);
    }
  }
  if (card.route_type !== 'shape' && card.display_section !== 'audit' && !card.definition) {
    issues.push(`${context}: missing definition text`);
  }
  if (card.route_type === 'phrase_evidence' && card.meaning_claim !== null) {
    issues.push(`${context}: phrase evidence must not force meaning_claim`);
  }
  if (['biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(card.route_type)) {
    if (card.score_handicap !== 20) issues.push(`${context}: paraphrase card score_handicap must be 20`);
    if (!Number.isFinite(card.raw_score) || card.raw_score < 0 || card.raw_score > 100) issues.push(`${context}: paraphrase card raw_score must be 0..100`);
    if (Number.isFinite(card.raw_score) && card.adjusted_score !== card.raw_score - 20) {
      issues.push(`${context}: paraphrase card adjusted_score must equal raw_score - 20`);
    }
    if (card.candidate_status !== 'accepted') issues.push(`${context}: paraphrase card must be candidate_status=accepted`);
    if (card.boundary_safe === false && card.answer_eligible === true) {
      issues.push(`${context}: boundary-unsafe paraphrase must not be answer_eligible`);
    }
  }
  if (card.route_type !== 'shape' && card.display_section !== 'audit' && (!Array.isArray(card.source_rows) || !card.source_rows.length)) {
    issues.push(`${context}: missing source_rows`);
  }
  for (const [index, row] of (card.source_rows || []).entries()) {
    if (!safeLicense(row)) issues.push(`${context}.source_rows[${index}]: unsafe or unclear license ${row?.license || 'missing'}`);
  }
  for (const text of policyStringsForCard(card)) {
    if (forbiddenTextRe.test(text)) issues.push(`${context}: forbidden text ${text.slice(0, 120)}`);
  }
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

function validateReleaseStamp(manifest, issues) {
  if (!fs.existsSync(releaseStampPath)) {
    issues.push('missing HUD route release stamp: data/definitions/hud-route-release-stamp.json');
    return;
  }
  const stamp = readJson(releaseStampPath);
  if (stamp.schema_version !== 1) issues.push('release stamp schema_version must be 1');
  if (stamp.artifact_type !== 'hud_route_release_stamp') issues.push('release stamp artifact_type must be hud_route_release_stamp');
  if (stamp.status !== 'release_candidate') issues.push(`release stamp status must be release_candidate, got ${stamp.status || 'missing'}`);
  if ((stamp.issues || []).length) issues.push(`release stamp carries ${stamp.issues.length} issue(s)`);
  if (stamp.public_lookup?.manifest_path !== 'data/definitions/hud-route-lookup/manifest.json') {
    issues.push('release stamp public_lookup.manifest_path does not point at the public lookup manifest');
  }
  if (stamp.public_lookup?.published_at !== manifest.published_at) {
    issues.push('release stamp public_lookup.published_at does not match public lookup manifest');
  }
  const actualManifestBytes = fs.statSync(manifestPath).size;
  if (stamp.public_lookup?.file?.byte_length !== actualManifestBytes) {
    issues.push('release stamp public lookup manifest byte_length does not match current manifest');
  }
  if (stamp.public_lookup?.file?.sha256 !== sha256File(manifestPath)) {
    issues.push('release stamp public lookup manifest sha256 does not match current manifest');
  }
  if (stamp.reconciliation?.counts_match !== true) issues.push('release stamp reconciliation.counts_match must be true');
  const publicCounts = manifest.counts || {};
  const stampCounts = stamp.reconciliation || {};
  if (stampCounts.public_cards_written !== publicCounts.cards_written) {
    issues.push('release stamp public card count does not match public manifest');
  }
  if (stampCounts.public_distinct_normalized_tokens !== publicCounts.distinct_normalized_tokens) {
    issues.push('release stamp public normalized token count does not match public manifest');
  }
  if (stampCounts.public_shard_count !== publicCounts.shard_count) {
    issues.push('release stamp public shard count does not match public manifest');
  }
}

const issues = [];
if (!fs.existsSync(manifestPath)) issues.push(`missing public HUD route lookup manifest: ${manifestPath}`);
if (!fs.existsSync(samplePath)) issues.push(`missing HUD route lookup sample: ${samplePath}`);

if (!issues.length) {
  const manifest = readJson(manifestPath);
  const sample = readJson(samplePath);
  if (manifest.schema_version !== 1) issues.push('public lookup manifest schema_version must be 1');
  if (manifest.prefix_length !== 3) issues.push(`unexpected prefix_length ${manifest.prefix_length}`);
  if (manifest.counts?.cards_written <= 0) issues.push('public lookup wrote no cards');
  if (manifest.counts?.distinct_normalized_tokens <= 0) issues.push('public lookup has no normalized tokens');
  if (manifest.counts?.max_shard_bytes > 10 * 1024 * 1024) {
    issues.push(`public lookup max shard is too large: ${manifest.counts.max_shard_bytes} bytes`);
  }
  if (!Array.isArray(manifest.shards) || !manifest.shards.length) issues.push('public lookup manifest has no shards');
  walkStrings(manifest, (text) => {
    if (forbiddenTextRe.test(text)) issues.push(`manifest forbidden text ${text.slice(0, 120)}`);
  });
  if (options.checkReleaseStamp) validateReleaseStamp(manifest, issues);

  const manifestShardPaths = new Set((manifest.shards || []).map((shardInfo) => shardInfo.path));
  const shardDir = path.join(publicDir, 'shards');
  const diskShardPaths = fs.existsSync(shardDir)
    ? fs.readdirSync(shardDir).filter((name) => name.endsWith('.json')).map((name) => `shards/${name}`)
    : [];
  if (diskShardPaths.length !== manifestShardPaths.size) {
    issues.push(`public shard file count mismatch: manifest lists ${manifestShardPaths.size}, disk has ${diskShardPaths.length}`);
  }
  for (const shardPath of diskShardPaths) {
    if (!manifestShardPaths.has(shardPath)) issues.push(`stale public lookup shard not listed in manifest: ${shardPath}`);
  }

  let totalBytes = fs.statSync(manifestPath).size;
  for (const shardInfo of manifest.shards || []) {
    const shardPath = path.join(publicDir, shardInfo.path);
    if (!fs.existsSync(shardPath)) {
      issues.push(`missing public lookup shard: ${shardInfo.path}`);
      continue;
    }
    const actualBytes = fs.statSync(shardPath).size;
    totalBytes += actualBytes;
    if (actualBytes !== shardInfo.byte_length) {
      issues.push(`public lookup shard byte mismatch ${shardInfo.path}: expected ${shardInfo.byte_length}, got ${actualBytes}`);
    }
    if (actualBytes > 10 * 1024 * 1024) {
      issues.push(`public lookup shard too large: ${shardInfo.path}`);
    }
  }
  if (totalBytes <= 0) issues.push('public lookup byte count is empty');

  for (const [index, token] of (sample.sample_tokens || []).entries()) {
    if (!token.normalized || !token.shard_path) issues.push(`sample_tokens[${index}]: missing lookup key fields`);
    const shardPath = path.join(publicDir, token.shard_path);
    if (!fs.existsSync(shardPath)) {
      issues.push(`sample_tokens[${index}]: missing public shard ${token.shard_path}`);
      continue;
    }
    const shard = readJson(shardPath);
    const cards = shard.routes_by_normalized?.[token.normalized] || [];
    if (token.card_count && cards.length !== token.card_count) {
      issues.push(`sample_tokens[${index}]: expected ${token.card_count} cards, found ${cards.length}`);
    }
    for (const [cardIndex, card] of cards.slice(0, 8).entries()) {
      validateCard(card, `sample_tokens[${index}].public_cards[${cardIndex}]`, issues);
    }
  }
}

if (issues.length) {
  console.error(`Public HUD route lookup validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Public HUD route lookup validation passed.');
