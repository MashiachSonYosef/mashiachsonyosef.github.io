#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const issues = [];
const stampPath = cleanRelativePath(process.argv[2] || 'data/definitions/hud-route-release-stamp.json');
assertExactPath('release stamp path', stampPath, 'data/definitions/hud-route-release-stamp.json');
const stamp = readJson(stampPath);

const routeStoreManifestPath = cleanRelativePath(stamp.route_store?.manifest_path);
const localLookupManifestPath = cleanRelativePath(stamp.local_lookup?.manifest_path);
const publicLookupManifestPath = cleanRelativePath(stamp.public_lookup?.manifest_path);
assertExactPath('route_store manifest path', routeStoreManifestPath, '.local-cache/hud-route-store/manifest.json');
assertExactPath('local_lookup manifest path', localLookupManifestPath, '.local-cache/hud-route-lookup/manifest.json');
assertExactPath('public_lookup manifest path', publicLookupManifestPath, 'data/definitions/hud-route-lookup/manifest.json');

if (stamp.schema_version !== 1) issues.push('schema_version must be 1');
if (stamp.artifact_type !== 'hud_route_release_stamp') issues.push('artifact_type must be hud_route_release_stamp');
if (stamp.status !== 'release_candidate') issues.push('status must be release_candidate');
validatePublicationBoundary(stamp.publication_boundary);
validatePublicLookupPublicationBoundary(stamp.public_lookup?.publication_boundary);

for (const [index, input] of (stamp.frozen_inputs?.files || []).entries()) {
  const context = `frozen_inputs.files[${index}] ${input.file || ''}`.trim();
  const frozenPath = cleanRelativePath(input.frozen_path);
  assertExactPath('frozen input path', frozenPath, expectedFrozenInputPath(input.file));
  await validateStampedFile(frozenPath, input, context);
  if (input.row_count !== null && input.row_count !== undefined) {
    const actualRows = await countJsonlRows(path.join(root, frozenPath));
    if (actualRows !== input.row_count) issues.push(`${context}: row_count mismatch, expected ${input.row_count}, got ${actualRows}`);
  }
}

await validateStampedFile(routeStoreManifestPath, stamp.route_store?.file, 'route_store manifest');
await validateStampedFile(localLookupManifestPath, stamp.local_lookup?.file, 'local_lookup manifest');
await validateStampedFile(publicLookupManifestPath, stamp.public_lookup?.file, 'public_lookup manifest');

const storeManifest = readJson(routeStoreManifestPath);
const lookupManifest = readJson(localLookupManifestPath);
const publicManifest = readJson(publicLookupManifestPath);
const publicShardSummary = publicShardCounts(publicManifest, publicLookupManifestPath);
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
  const shardRelativePath = cleanPublicShardPath(shard.path);
  const shardPath = path.join(root, path.dirname(publicLookupManifestPath), shardRelativePath);
  if (!fs.existsSync(shardPath)) {
    issues.push(`missing public shard ${shardRelativePath}`);
    continue;
  }
  const actualBytes = fs.statSync(shardPath).size;
  if (actualBytes !== shard.byte_length) {
    issues.push(`public shard byte mismatch ${shardRelativePath}: expected ${shard.byte_length}, got ${actualBytes}`);
  }
}

if (issues.length) {
  console.error(`HUD route release stamp validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`HUD route release stamp validation passed: ${stamp.release_id}.`);

function validatePublicationBoundary(boundary) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push('publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push(`publication_boundary.publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`);
  }
  for (const item of ['hud_route_release_stamp', 'public_hud_route_lookup_reconciliation']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      issues.push(`publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      issues.push(`publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    issues.push('publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (!String(boundary.release_candidate_scope || '').includes('not_publication_readiness')) {
    issues.push('publication_boundary.release_candidate_scope must state not_publication_readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (boundary.current_route_inputs_reconciled !== 'stamp_uses_frozen_inputs_validate_drift_separately') {
    issues.push('publication_boundary.current_route_inputs_reconciled must be stamp_uses_frozen_inputs_validate_drift_separately');
  }
}

function validatePublicLookupPublicationBoundary(boundary) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push('public_lookup.publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push(`public_lookup.publication_boundary.publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`);
  }
  for (const item of ['public_hud_route_lookup_manifest', 'public_hud_route_lookup_shards']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      issues.push(`public_lookup.publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      issues.push(`public_lookup.publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    issues.push('public_lookup.publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (!String(boundary.route_lookup_scope || '').includes('not_publication_readiness')) {
    issues.push('public_lookup.publication_boundary.route_lookup_scope must state not_publication_readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('public_lookup.publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (boundary.current_route_inputs_reconciled !== 'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift') {
    issues.push('public_lookup.publication_boundary.current_route_inputs_reconciled must defer to release stamp and drift validation');
  }
}

async function validateStampedFile(relativePath, expected, context) {
  if (!relativePath || !expected) {
    issues.push(`${context}: missing stamped file metadata`);
    return;
  }
  const clean = cleanRelativePath(relativePath);
  validateReleaseArtifactPath(clean, context);
  const fullPath = path.join(root, clean);
  if (!fs.existsSync(fullPath)) {
    issues.push(`${context}: missing file ${clean}`);
    return;
  }
  const byteLength = fs.statSync(fullPath).size;
  const sha256 = await sha256File(fullPath);
  if (byteLength !== expected.byte_length) issues.push(`${context}: byte_length mismatch, expected ${expected.byte_length}, got ${byteLength}`);
  if (sha256 !== expected.sha256) issues.push(`${context}: sha256 mismatch`);
}

function readJson(relativePath) {
  const clean = cleanRelativePath(relativePath);
  validateReleaseArtifactPath(clean, `readJson ${clean}`);
  const fullPath = path.join(root, clean);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${clean}`);
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
  const cleanManifestPath = cleanRelativePath(manifestPath);
  assertExactPath('public shard manifest path', cleanManifestPath, 'data/definitions/hud-route-lookup/manifest.json');
  const publicDir = path.join(root, path.dirname(cleanManifestPath));
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
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function cleanPublicShardPath(value) {
  const clean = cleanRelativePath(value);
  if (!clean.startsWith('shards/') || !clean.endsWith('.json')) {
    throw new Error(`Public shard path must stay under shards/*.json: ${value}`);
  }
  return clean;
}

function assertExactPath(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label} must be ${expected}: ${actual}`);
}

function expectedFrozenInputPath(fileName) {
  const cleanFileName = cleanRelativePath(fileName);
  if (cleanFileName.includes('/')) throw new Error(`frozen input file must be a basename: ${fileName}`);
  return `.local-cache/definition-route-freeze/current/${cleanFileName}`;
}

function validateReleaseArtifactPath(relativePath, context) {
  if (relativePath === 'data/definitions/hud-route-release-stamp.json') return;
  if (relativePath === 'data/definitions/hud-route-lookup/manifest.json') return;
  if (relativePath.startsWith('.local-cache/definition-route-freeze/current/')) return;
  if (relativePath.startsWith('.local-cache/hud-route-store/')) return;
  if (relativePath.startsWith('.local-cache/hud-route-lookup/')) return;
  issues.push(`${context}: release stamp path outside allowed route artifact scopes: ${relativePath}`);
}
