#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  localDir: '.local-cache/hud-route-lookup',
  publicDir: 'data/definitions/hud-route-lookup',
  maxShardBytes: 10 * 1024 * 1024,
};

function parseArgs(argv) {
  const args = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--local-dir') args.localDir = argv[++i];
    else if (arg === '--public-dir') args.publicDir = argv[++i];
    else if (arg === '--max-shard-bytes') args.maxShardBytes = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isFinite(args.maxShardBytes) || args.maxShardBytes < 1) {
    throw new Error(`Invalid --max-shard-bytes: ${args.maxShardBytes}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/publish_hud_route_lookup.mjs',
    '',
    'Options:',
    '  --local-dir .local-cache/hud-route-lookup',
    '  --public-dir data/definitions/hud-route-lookup',
    '  --max-shard-bytes 10485760',
  ].join('\n');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeCompactJson(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const parsed = readJson(source);
  fs.writeFileSync(target, `${JSON.stringify(parsed)}\n`, 'utf8');
}

function validateSourceManifest(manifest, args) {
  const issues = [];
  if (manifest.schema_version !== 1) issues.push('local lookup manifest schema_version must be 1');
  if (manifest.prefix_length !== 2) issues.push(`unexpected prefix_length ${manifest.prefix_length}`);
  if (!Array.isArray(manifest.shards) || !manifest.shards.length) issues.push('local lookup manifest has no shards');
  if (manifest.counts?.max_shard_bytes > args.maxShardBytes) {
    issues.push(`max shard too large: ${manifest.counts.max_shard_bytes} bytes`);
  }
  for (const shard of manifest.shards || []) {
    for (const field of ['shard', 'path', 'token_count', 'card_count', 'byte_length']) {
      if (shard[field] === undefined || shard[field] === null || shard[field] === '') {
        issues.push(`shard ${shard.shard || '(unknown)'} missing ${field}`);
      }
    }
    if (shard.byte_length > args.maxShardBytes) {
      issues.push(`shard ${shard.shard} exceeds max size: ${shard.byte_length} bytes`);
    }
  }
  if (issues.length) {
    throw new Error(`Cannot publish HUD route lookup:\n- ${issues.join('\n- ')}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const localDir = path.join(root, args.localDir);
  const publicDir = path.join(root, args.publicDir);
  const localManifestPath = path.join(localDir, 'manifest.json');
  if (!fs.existsSync(localManifestPath)) {
    throw new Error(`Missing local HUD route lookup manifest: ${args.localDir}/manifest.json`);
  }

  const localManifest = readJson(localManifestPath);
  validateSourceManifest(localManifest, args);

  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(publicDir, 'shards'), { recursive: true });

  const publicShards = [];
  for (const shard of localManifest.shards) {
    const sourcePath = path.join(localDir, shard.path);
    const targetPath = path.join(publicDir, shard.path);
    if (!fs.existsSync(sourcePath)) throw new Error(`Missing local lookup shard: ${shard.path}`);
    writeCompactJson(sourcePath, targetPath);
    const actualBytes = fs.statSync(targetPath).size;
    publicShards.push({
      ...shard,
      source_byte_length: shard.byte_length,
      byte_length: actualBytes,
    });
  }
  const maxPublicShard = publicShards.reduce((max, shard) => (!max || shard.byte_length > max.byte_length ? shard : max), null);
  if (maxPublicShard?.byte_length > args.maxShardBytes) {
    throw new Error(`Public shard exceeds max size after compaction: ${maxPublicShard.path} (${maxPublicShard.byte_length} bytes)`);
  }

  const publicCounts = {
    ...localManifest.counts,
    max_shard_bytes: maxPublicShard ? maxPublicShard.byte_length : 0,
    max_shard: maxPublicShard ? maxPublicShard.shard : '',
  };

  const publicManifest = {
    schema_version: 1,
    published_at: new Date().toISOString(),
    source_local_manifest: `${args.localDir.replace(/\\/g, '/')}/manifest.json`,
    public_lookup: args.publicDir.replace(/\\/g, '/'),
    lookup_strategy: localManifest.lookup_strategy,
    prefix_length: localManifest.prefix_length,
    max_shard_bytes_policy: args.maxShardBytes,
    counts: publicCounts,
    shards: publicShards,
  };
  writeJson(path.join(publicDir, 'manifest.json'), publicManifest);

  console.log(JSON.stringify({
    published_at: publicManifest.published_at,
    public_lookup: publicManifest.public_lookup,
    shard_count: publicManifest.counts.shard_count,
    cards_written: publicManifest.counts.cards_written,
    distinct_normalized_tokens: publicManifest.counts.distinct_normalized_tokens,
    max_shard_bytes: publicManifest.counts.max_shard_bytes,
  }, null, 2));
}

main();
