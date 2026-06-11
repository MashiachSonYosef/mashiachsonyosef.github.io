#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  localDir: '.local-cache/hud-route-lookup',
  publicDir: 'data/definitions/hud-route-lookup',
  maxShardBytes: 10 * 1024 * 1024,
};

function publicLookupPublicationBoundary() {
  return {
    publication_status: 'blocked_no_render',
    validates: [
      'public_hud_route_lookup_manifest',
      'public_hud_route_lookup_shards',
    ],
    does_not_clear: [
      'translation_output',
      'source_publication',
      'public_lexical_export_reuse',
      'accepted_definition_authority',
    ],
    answer_eligible_scope: 'hud_answer_slot_only_not_translation_or_publication_readiness',
    route_lookup_scope: 'definition_route_lookup_data_not_publication_readiness',
    warning_status_blocks_publication_claim: true,
    current_route_inputs_reconciled: 'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift',
  };
}

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
  args.localDir = cleanRelativePath(args.localDir);
  args.publicDir = cleanRelativePath(args.publicDir);
  assertExactPath('--local-dir', args.localDir, '.local-cache/hud-route-lookup');
  assertExactPath('--public-dir', args.publicDir, 'data/definitions/hud-route-lookup');
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

function writeTextAtomic(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function writeJson(filePath, value) {
  writeTextAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeCompactJson(source, target) {
  const parsed = readJson(source);
  writeTextAtomic(target, `${JSON.stringify(parsed)}\n`);
}

function validateSourceManifest(manifest, args) {
  const issues = [];
  if (manifest.schema_version !== 1) issues.push('local lookup manifest schema_version must be 1');
  if (manifest.prefix_length !== 3) issues.push(`unexpected prefix_length ${manifest.prefix_length}`);
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
    const cleanShardPath = cleanManifestShardPath(shard.path || '');
    if (!cleanShardPath.startsWith('shards/')) {
      issues.push(`shard ${shard.shard || '(unknown)'} path must stay under shards/: ${shard.path || '(missing)'}`);
    }
    if (!cleanShardPath.endsWith('.json')) {
      issues.push(`shard ${shard.shard || '(unknown)'} path must end with .json: ${shard.path || '(missing)'}`);
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
    const shardPath = cleanManifestShardPath(shard.path);
    const sourcePath = path.join(localDir, shardPath);
    const targetPath = path.join(publicDir, shardPath);
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
    publication_boundary: publicLookupPublicationBoundary(),
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

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be a relative in-repo path: ${value}`);
  }
  return normalized;
}

function cleanManifestShardPath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || normalized.includes('//') || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Manifest shard path must be relative and in-repo: ${value}`);
  }
  return normalized;
}

function assertExactPath(label, value, expected) {
  if (value !== expected) throw new Error(`${label} must be ${expected}: ${value}`);
}
