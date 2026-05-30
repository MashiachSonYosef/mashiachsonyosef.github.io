#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const manifestPath = path.join(root, '.local-cache', 'hud-route-store', 'manifest.json');
const samplePath = path.join(root, 'data', 'definitions', 'hud-route-store-sample.json');
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

async function firstCardsFromShard(shardPath, limit) {
  const cards = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(shardPath, 'utf8'),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    cards.push(JSON.parse(line));
    if (cards.length >= limit) break;
  }
  rl.close();
  return cards;
}

const issues = [];
if (!fs.existsSync(manifestPath)) issues.push(`missing local HUD route store manifest: ${manifestPath}`);
if (!fs.existsSync(samplePath)) issues.push(`missing public HUD route store sample: ${samplePath}`);

if (!issues.length) {
  const manifest = readJson(manifestPath);
  const sample = readJson(samplePath);
  if (manifest.counts?.cards_written <= 0) issues.push('route store wrote no cards');
  if (manifest.counts?.distinct_normalized_tokens <= 0) issues.push('route store has no normalized-token index');
  if (!Array.isArray(manifest.shards) || !manifest.shards.length) issues.push('route store has no shards');
  for (const section of ['strict_hebrew', 'lemma', 'phrase_evidence']) {
    if (!manifest.counts?.route_sections?.[section]) issues.push(`route store missing section count: ${section}`);
  }
  walkStrings(manifest, (text) => {
    if (forbiddenTextRe.test(text)) issues.push(`manifest forbidden text ${text.slice(0, 120)}`);
  });

  for (const [index, token] of (sample.sample_tokens || []).entries()) {
    if (!token.normalized) issues.push(`sample_tokens[${index}]: missing normalized`);
    if ((!Array.isArray(token.cards) || !token.cards.length) && !token.missing_card_reason) {
      issues.push(`sample_tokens[${index}]: missing cards without explicit reason`);
    }
    for (const [cardIndex, card] of (token.cards || []).entries()) {
      validateCard(card, `sample_tokens[${index}].cards[${cardIndex}]`, issues);
    }
  }

  for (const shard of manifest.shards.slice(0, 4)) {
    const shardPath = path.join(path.dirname(manifestPath), shard.path);
    if (!fs.existsSync(shardPath)) {
      issues.push(`missing shard file: ${shard.path}`);
      continue;
    }
    const cards = await firstCardsFromShard(shardPath, 3);
    if (!cards.length) issues.push(`empty shard file: ${shard.path}`);
    cards.forEach((card, index) => validateCard(card, `shards.${shard.shard}[${index}]`, issues));
  }
}

if (issues.length) {
  console.error(`HUD route store validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('HUD route store validation passed.');
