#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, '.local-cache', 'hud-route-lookup', 'manifest.json');
const samplePath = path.join(root, 'data', 'definitions', 'hud-route-lookup-sample.json');
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

function safeLicense(row) {
  const license = String(row?.license || '').trim();
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
  if (card.route_type !== 'shape' && card.display_section !== 'audit' && !card.definition) {
    issues.push(`${context}: missing definition text`);
  }
  if (card.route_type === 'phrase_evidence' && card.meaning_claim !== null) {
    issues.push(`${context}: phrase evidence must not force meaning_claim`);
  }
  if (card.route_type !== 'shape' && card.display_section !== 'audit' && (!Array.isArray(card.source_rows) || !card.source_rows.length)) {
    issues.push(`${context}: missing source_rows`);
  }
  for (const [index, row] of (card.source_rows || []).entries()) {
    if (!safeLicense(row)) issues.push(`${context}.source_rows[${index}]: unsafe or unclear license ${row?.license || 'missing'}`);
  }
  walkStrings(card, (text) => {
    if (forbiddenTextRe.test(text)) issues.push(`${context}: forbidden text ${text.slice(0, 120)}`);
  });
}

const issues = [];
if (!fs.existsSync(manifestPath)) issues.push(`missing local HUD route lookup manifest: ${manifestPath}`);
if (!fs.existsSync(samplePath)) issues.push(`missing public HUD route lookup sample: ${samplePath}`);

if (!issues.length) {
  const manifest = readJson(manifestPath);
  const sample = readJson(samplePath);
  if (manifest.prefix_length !== 2) issues.push(`unexpected prefix_length ${manifest.prefix_length}`);
  if (manifest.counts?.cards_written <= 0) issues.push('lookup wrote no cards');
  if (manifest.counts?.distinct_normalized_tokens <= 0) issues.push('lookup has no normalized tokens');
  if (manifest.counts?.max_shard_bytes > 10 * 1024 * 1024) {
    issues.push(`lookup max shard is too large for first public promotion: ${manifest.counts.max_shard_bytes} bytes`);
  }
  if (!Array.isArray(manifest.shards) || !manifest.shards.length) issues.push('lookup manifest has no shards');
  walkStrings(manifest, (text) => {
    if (forbiddenTextRe.test(text)) issues.push(`manifest forbidden text ${text.slice(0, 120)}`);
  });

  for (const [index, token] of (sample.sample_tokens || []).entries()) {
    if (!token.normalized || !token.shard || !token.shard_path) issues.push(`sample_tokens[${index}]: missing lookup key fields`);
    const shardPath = path.join(path.dirname(manifestPath), token.shard_path);
    if (!fs.existsSync(shardPath)) {
      issues.push(`sample_tokens[${index}]: missing shard ${token.shard_path}`);
      continue;
    }
    const shard = readJson(shardPath);
    const cards = shard.routes_by_normalized?.[token.normalized] || [];
    if (token.card_count && !cards.length) issues.push(`sample_tokens[${index}]: sample card count exists but lookup shard has no cards`);
    for (const [cardIndex, card] of cards.slice(0, 5).entries()) {
      validateCard(card, `sample_tokens[${index}].lookup_cards[${cardIndex}]`, issues);
    }
    for (const [cardIndex, card] of (token.cards || []).entries()) {
      validateCard(card, `sample_tokens[${index}].sample_cards[${cardIndex}]`, issues);
    }
  }

  for (const shardInfo of (manifest.shards || []).slice(0, 6)) {
    const shardPath = path.join(path.dirname(manifestPath), shardInfo.path);
    if (!fs.existsSync(shardPath)) {
      issues.push(`missing lookup shard: ${shardInfo.path}`);
      continue;
    }
    const shard = readJson(shardPath);
    if (!shard.routes_by_normalized || typeof shard.routes_by_normalized !== 'object') {
      issues.push(`lookup shard ${shardInfo.shard}: missing routes_by_normalized`);
    }
  }
}

if (issues.length) {
  console.error(`HUD route lookup validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('HUD route lookup validation passed.');
