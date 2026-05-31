#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  stamp: 'data/definitions/hud-route-release-stamp.json',
  publicManifest: 'data/definitions/hud-route-lookup/manifest.json',
  contract: 'data/definitions/hud-route-contract.json',
  sample: 'data/definitions/hud-route-lookup-sample.json',
  report: '',
};

const options = parseArgs(process.argv.slice(2));
const issues = [];
const warnings = [];

const stamp = readJson(options.stamp, 'release stamp');
const publicManifest = readJson(options.publicManifest, 'public lookup manifest');
const contract = readJson(options.contract, 'HUD route contract');
const sample = readJson(options.sample, 'HUD route lookup sample');

if (stamp.schema_version !== 1) issues.push('release stamp schema_version must be 1');
if (stamp.artifact_type !== 'hud_route_release_stamp') issues.push('release stamp artifact_type must be hud_route_release_stamp');
if (stamp.status !== 'release_candidate') issues.push(`release stamp status must be release_candidate, got ${stamp.status || 'missing'}`);
if ((stamp.issues || []).length) issues.push(`release stamp carries ${stamp.issues.length} issue(s)`);
if (stamp.reconciliation?.counts_match !== true) issues.push('release stamp reconciliation.counts_match must be true');
if (cleanPath(stamp.public_lookup?.manifest_path) !== cleanPath(options.publicManifest)) {
  issues.push(`release stamp public manifest path ${stamp.public_lookup?.manifest_path || 'missing'} does not match ${cleanPath(options.publicManifest)}`);
}
if (cleanPath(publicManifest.source_local_manifest) !== cleanPath(stamp.local_lookup?.manifest_path)) {
  issues.push('public manifest source_local_manifest does not match stamped local lookup manifest path');
}
if (publicManifest.published_at !== stamp.public_lookup?.published_at) {
  issues.push('public manifest published_at does not match release stamp public_lookup.published_at');
}

const publicManifestSummary = await fileSummary(options.publicManifest);
compareSummary(publicManifestSummary, stamp.public_lookup?.file, 'public lookup manifest');

const shardSummary = summarizePublicShards(publicManifest, options.publicManifest);
const currentReconciliation = {
  public_cards_written: Number(publicManifest.counts?.cards_written || 0),
  public_distinct_normalized_tokens: Number(publicManifest.counts?.distinct_normalized_tokens || 0),
  public_shard_count: Number(publicManifest.counts?.shard_count || 0),
  public_manifest_shards: Array.isArray(publicManifest.shards) ? publicManifest.shards.length : 0,
  public_shard_files_on_disk: shardSummary.file_count,
  public_manifest_card_sum: shardSummary.card_sum,
  public_manifest_token_sum: shardSummary.token_sum,
  public_manifest_byte_sum: shardSummary.byte_sum,
};
for (const [key, currentValue] of Object.entries(currentReconciliation)) {
  if (stamp.reconciliation?.[key] !== currentValue) {
    issues.push(`reconciliation.${key} mismatch, stamp has ${stamp.reconciliation?.[key]}, current value is ${currentValue}`);
  }
}
if (currentReconciliation.public_manifest_shards !== currentReconciliation.public_shard_count) {
  issues.push('public manifest shard list length does not match public shard_count');
}
if (currentReconciliation.public_shard_files_on_disk !== currentReconciliation.public_shard_count) {
  issues.push('public shard files on disk do not match public shard_count');
}
if (currentReconciliation.public_manifest_card_sum !== currentReconciliation.public_cards_written) {
  issues.push('public shard card sum does not match public cards_written');
}
if (currentReconciliation.public_manifest_token_sum !== currentReconciliation.public_distinct_normalized_tokens) {
  issues.push('public shard token sum does not match public distinct_normalized_tokens');
}

const allowedSections = new Set((contract.route_sections || []).map((section) => section.section_id));
for (const section of Object.keys(stamp.route_store?.counts?.route_sections || {})) {
  if (!allowedSections.has(section)) issues.push(`stamped route section ${section} is not listed in HUD route contract`);
}
for (const section of ['strict_hebrew', 'strict_aramaic', 'lemma', 'citable_paraphrase_evidence', 'phrase_evidence']) {
  if (!allowedSections.has(section)) issues.push(`HUD route contract is missing expected section ${section}`);
}

const requiredCardFields = new Set(contract.card_fields || []);
for (const field of ['answer_eligible', 'answer_role', 'source_rows', 'definition', 'display_label']) {
  if (!requiredCardFields.has(field)) issues.push(`HUD route contract card_fields is missing ${field}`);
}

validateSampleCards(sample, publicManifest, options.publicManifest);
await compareFrozenInputsToCurrentSources(stamp);

const result = {
  schema_version: 1,
  artifact_type: 'hud_route_release_gate_report',
  generated_at: new Date().toISOString(),
  status: issues.length ? 'fail' : 'pass',
  release_id: stamp.release_id || '',
  public_manifest: cleanPath(options.publicManifest),
  public_cards_written: currentReconciliation.public_cards_written,
  public_distinct_normalized_tokens: currentReconciliation.public_distinct_normalized_tokens,
  public_shard_count: currentReconciliation.public_shard_count,
  checked_sample_tokens: Array.isArray(sample.sample_tokens) ? sample.sample_tokens.length : 0,
  issues,
  warnings,
};

if (options.report) writeReport(options.report, result);

if (issues.length) {
  console.error(`HUD route release gate failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  if (warnings.length) {
    console.error(`Warnings: ${warnings.length}`);
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log(`HUD route release gate passed: ${result.release_id}; public cards ${result.public_cards_written}; public shards ${result.public_shard_count}.`);
if (warnings.length) {
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--stamp') parsed.stamp = args[++index];
    else if (arg === '--public-manifest') parsed.publicManifest = args[++index];
    else if (arg === '--contract') parsed.contract = args[++index];
    else if (arg === '--sample') parsed.sample = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_hud_route_release_gate.mjs',
      '',
      'Options:',
      '  --stamp data/definitions/hud-route-release-stamp.json',
      '  --public-manifest data/definitions/hud-route-lookup/manifest.json',
      '  --contract data/definitions/hud-route-contract.json',
      '  --sample data/definitions/hud-route-lookup-sample.json',
      '  --report reports/hud-route-release-gate.md',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath || '');
  if (!fs.existsSync(filePath)) throw new Error(`Missing ${label}: ${relativePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function fileSummary(relativePath) {
  const filePath = path.join(root, relativePath);
  return {
    path: cleanPath(relativePath),
    byte_length: fs.statSync(filePath).size,
    sha256: await sha256File(filePath),
  };
}

function compareSummary(current, stamped, label) {
  if (!stamped) {
    issues.push(`${label}: missing stamped file metadata`);
    return;
  }
  if (current.byte_length !== stamped.byte_length) {
    issues.push(`${label}: byte_length mismatch, stamp has ${stamped.byte_length}, current value is ${current.byte_length}`);
  }
  if (current.sha256 !== stamped.sha256) issues.push(`${label}: sha256 mismatch`);
}

function summarizePublicShards(manifest, manifestPath) {
  const publicDir = path.join(root, path.dirname(manifestPath));
  const shardDir = path.join(publicDir, 'shards');
  const manifestShardPaths = new Set((manifest.shards || []).map((shard) => shard.path));
  const diskShardPaths = fs.existsSync(shardDir)
    ? fs.readdirSync(shardDir).filter((file) => file.endsWith('.json')).map((file) => `shards/${file}`)
    : [];
  for (const shardPath of diskShardPaths) {
    if (!manifestShardPaths.has(shardPath)) issues.push(`stale public lookup shard not listed in manifest: ${shardPath}`);
  }
  for (const shard of manifest.shards || []) {
    const filePath = path.join(publicDir, shard.path || '');
    if (!fs.existsSync(filePath)) {
      issues.push(`missing public lookup shard: ${shard.path || 'missing path'}`);
      continue;
    }
    const actualBytes = fs.statSync(filePath).size;
    if (actualBytes !== shard.byte_length) {
      issues.push(`public lookup shard byte mismatch ${shard.path}: expected ${shard.byte_length}, got ${actualBytes}`);
    }
  }
  return {
    file_count: diskShardPaths.length,
    card_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.card_count || 0), 0),
    token_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.token_count || 0), 0),
    byte_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.byte_length || 0), 0),
  };
}

function validateSampleCards(routeSample, manifest, manifestPath) {
  if (routeSample.schema_version !== 1) issues.push('HUD route lookup sample schema_version must be 1');
  const publicDir = path.join(root, path.dirname(manifestPath));
  const manifestShardPaths = new Set((manifest.shards || []).map((shard) => shard.path));
  for (const [tokenIndex, token] of (routeSample.sample_tokens || []).entries()) {
    const context = `sample_tokens[${tokenIndex}]`;
    if (!token.normalized) issues.push(`${context}: missing normalized`);
    if (!token.shard_path) issues.push(`${context}: missing shard_path`);
    if (token.shard_path && !manifestShardPaths.has(token.shard_path)) issues.push(`${context}: shard_path is not listed in public manifest`);
    const shardPath = path.join(publicDir, token.shard_path || '');
    if (!fs.existsSync(shardPath)) {
      issues.push(`${context}: missing public shard ${token.shard_path || 'missing path'}`);
      continue;
    }
    const shard = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    const cards = shard.routes_by_normalized?.[token.normalized] || [];
    if (Number.isFinite(token.card_count) && cards.length !== token.card_count) {
      issues.push(`${context}: card_count mismatch, sample has ${token.card_count}, public shard has ${cards.length}`);
    }
    for (const [cardIndex, card] of cards.slice(0, 12).entries()) {
      validateCard(card, `${context}.cards[${cardIndex}]`);
    }
  }
}

function validateCard(card, context) {
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
  if (card.display_section !== 'audit' && card.route_type !== 'shape' && !card.definition) {
    issues.push(`${context}: missing definition`);
  }
  if (!Array.isArray(card.source_rows) || !card.source_rows.length) {
    issues.push(`${context}: missing source_rows`);
  }
  if (['biblical_paraphrase_evidence', 'citable_paraphrase_evidence'].includes(card.route_type)) {
    if (card.score_handicap !== 20) issues.push(`${context}: paraphrase score_handicap must be 20`);
    if (Number.isFinite(card.raw_score) && card.adjusted_score !== card.raw_score - 20) {
      issues.push(`${context}: paraphrase adjusted_score must equal raw_score - 20`);
    }
    if (card.boundary_safe === false && card.answer_eligible === true) {
      issues.push(`${context}: boundary-unsafe paraphrase must not be answer_eligible`);
    }
  }
}

async function compareFrozenInputsToCurrentSources(releaseStamp) {
  for (const input of releaseStamp.frozen_inputs?.files || []) {
    if (!input.source_path || !fs.existsSync(path.join(root, input.source_path))) continue;
    const current = await fileSummary(input.source_path);
    if (current.sha256 !== input.sha256 || current.byte_length !== input.byte_length) {
      warnings.push(`current route source differs from frozen release input: ${input.source_path}`);
    }
  }
}

async function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function writeReport(relativePath, result) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    '# HUD Route Release Gate',
    '',
    `Generated: ${result.generated_at}`,
    `Status: ${result.status}`,
    `Release ID: ${result.release_id}`,
    '',
    '## Public Lookup',
    '',
    `- Manifest: \`${result.public_manifest}\``,
    `- Cards: ${result.public_cards_written}`,
    `- Normalized tokens: ${result.public_distinct_normalized_tokens}`,
    `- Shards: ${result.public_shard_count}`,
    `- Sample tokens checked: ${result.checked_sample_tokens}`,
    '',
    '## Issues',
    '',
    ...(result.issues.length ? result.issues.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${warning}`) : ['- None']),
  ];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function cleanPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
