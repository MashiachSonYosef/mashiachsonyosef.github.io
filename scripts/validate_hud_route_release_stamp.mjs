#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const stampPath = cleanRelativePath(process.argv[2] || 'data/definitions/hud-route-release-stamp.json');
const stamp = readJson(stampPath);
const issues = [];

if (stamp.schema_version !== 1) issues.push('schema_version must be 1');
if (stamp.artifact_type !== 'hud_route_release_stamp') issues.push('artifact_type must be hud_route_release_stamp');
if (stamp.status !== 'release_candidate') issues.push('status must be release_candidate');

for (const [index, input] of (stamp.frozen_inputs?.files || []).entries()) {
  const context = `frozen_inputs.files[${index}] ${input.file || ''}`.trim();
  await validateStampedFile(input.frozen_path, input, context);
  if (input.row_count !== null && input.row_count !== undefined) {
    const actualRows = await countJsonlRows(path.join(root, input.frozen_path));
    if (actualRows !== input.row_count) issues.push(`${context}: row_count mismatch, expected ${input.row_count}, got ${actualRows}`);
  }
}

await validateStampedFile(stamp.route_store?.manifest_path, stamp.route_store?.file, 'route_store manifest');
await validateStampedFile(stamp.local_lookup?.manifest_path, stamp.local_lookup?.file, 'local_lookup manifest');
await validateStampedFile(stamp.public_lookup?.manifest_path, stamp.public_lookup?.file, 'public_lookup manifest');

const storeManifest = readJson(stamp.route_store?.manifest_path);
const lookupManifest = readJson(stamp.local_lookup?.manifest_path);
const publicManifest = readJson(stamp.public_lookup?.manifest_path);
const publicShardSummary = publicShardCounts(publicManifest, stamp.public_lookup?.manifest_path);
const reconciliation = {
  store_cards_written: Number(storeManifest.counts?.cards_written || 0),
  lookup_cards_read: Number(lookupManifest.counts?.cards_read || 0),
  lookup_cards_written: Number(lookupManifest.counts?.cards_written || 0),
  public_cards_written: Number(publicManifest.counts?.cards_written || 0),
  store_distinct_normalized_tokens: Number(storeManifest.counts?.distinct_normalized_tokens || 0),
  lookup_distinct_normalized_tokens: Number(lookupManifest.counts?.distinct_normalized_tokens || 0),
  public_distinct_normalized_tokens: Number(publicManifest.counts?.distinct_normalized_tokens || 0),
  lookup_shard_count: Number(lookupManifest.counts?.shard_count || 0),
  public_shard_count: Number(publicManifest.counts?.shard_count || 0),
  public_manifest_shards: Array.isArray(publicManifest.shards) ? publicManifest.shards.length : 0,
  public_shard_files_on_disk: publicShardSummary.file_count,
  public_manifest_card_sum: publicShardSummary.card_sum,
  public_manifest_token_sum: publicShardSummary.token_sum,
};

for (const [key, value] of Object.entries(reconciliation)) {
  if (stamp.reconciliation?.[key] !== value) {
    issues.push(`reconciliation.${key} mismatch, stamp has ${stamp.reconciliation?.[key]}, current value is ${value}`);
  }
}
if (reconciliation.store_cards_written !== reconciliation.lookup_cards_read) issues.push('store cards_written does not match lookup cards_read');
if (reconciliation.lookup_cards_written !== reconciliation.public_cards_written) issues.push('lookup cards_written does not match public cards_written');
if (reconciliation.lookup_shard_count !== reconciliation.public_shard_count) issues.push('lookup shard_count does not match public shard_count');
if (reconciliation.public_manifest_shards !== reconciliation.public_shard_count) issues.push('public manifest shard list length does not match public shard_count');
if (reconciliation.public_shard_files_on_disk !== reconciliation.public_shard_count) issues.push('public shard files on disk do not match public shard_count');
if (reconciliation.public_manifest_card_sum !== reconciliation.public_cards_written) issues.push('public shard card sum does not match public cards_written');
if (reconciliation.public_manifest_token_sum !== reconciliation.public_distinct_normalized_tokens) issues.push('public shard token sum does not match public distinct_normalized_tokens');

for (const shard of publicManifest.shards || []) {
  const shardPath = path.join(root, path.dirname(stamp.public_lookup.manifest_path), shard.path);
  if (!fs.existsSync(shardPath)) {
    issues.push(`missing public shard ${shard.path}`);
    continue;
  }
  const actualBytes = fs.statSync(shardPath).size;
  if (actualBytes !== shard.byte_length) {
    issues.push(`public shard byte mismatch ${shard.path}: expected ${shard.byte_length}, got ${actualBytes}`);
  }
}

if (issues.length) {
  console.error(`HUD route release stamp validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`HUD route release stamp validation passed: ${stamp.release_id}.`);

async function validateStampedFile(relativePath, expected, context) {
  if (!relativePath || !expected) {
    issues.push(`${context}: missing stamped file metadata`);
    return;
  }
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    issues.push(`${context}: missing file ${relativePath}`);
    return;
  }
  const byteLength = fs.statSync(fullPath).size;
  const sha256 = await sha256File(fullPath);
  if (byteLength !== expected.byte_length) issues.push(`${context}: byte_length mismatch, expected ${expected.byte_length}, got ${byteLength}`);
  if (sha256 !== expected.sha256) issues.push(`${context}: sha256 mismatch`);
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath || '');
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

async function countJsonlRows(filePath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity,
  });
  let count = 0;
  for await (const line of rl) {
    if (line.trim()) count += 1;
  }
  return count;
}

function publicShardCounts(manifest, manifestPath) {
  const publicDir = path.join(root, path.dirname(manifestPath));
  const shardDir = path.join(publicDir, 'shards');
  const shardFiles = fs.existsSync(shardDir)
    ? fs.readdirSync(shardDir).filter((file) => file.endsWith('.json'))
    : [];
  return {
    file_count: shardFiles.length,
    card_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.card_count || 0), 0),
    token_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.token_count || 0), 0),
  };
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
