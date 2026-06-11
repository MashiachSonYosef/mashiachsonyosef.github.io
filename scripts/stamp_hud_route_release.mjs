#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  freezeManifest: '.local-cache/definition-route-freeze/current/route-input-freeze.json',
  storeManifest: '.local-cache/hud-route-store/manifest.json',
  lookupManifest: '.local-cache/hud-route-lookup/manifest.json',
  publicManifest: 'data/definitions/hud-route-lookup/manifest.json',
  routeAudit: '.local-cache/definition-route-freeze/current/definition-route-claim-audit.json',
  output: 'data/definitions/hud-route-release-stamp.json',
  report: 'reports/hud-route-release-stamp.md',
};
const pathOptionKeys = [
  'freezeManifest',
  'storeManifest',
  'lookupManifest',
  'publicManifest',
  'routeAudit',
  'output',
  'report',
];

const options = parseArgs(process.argv.slice(2));
const freezeManifest = readJson(options.freezeManifest);
const storeManifest = readJson(options.storeManifest);
const lookupManifest = readJson(options.lookupManifest);
const publicManifest = readJson(options.publicManifest);
const routeAudit = readJson(options.routeAudit, false);
const issues = [];

const releaseId = freezeManifest.release_id || `hud-route-rc-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const inputFiles = [];
for (const input of freezeManifest.files || []) {
  const frozenPath = cleanRelativePath(input.frozen_path || '');
  const expectedFrozenPath = expectedFrozenInputPath(input.file);
  if (frozenPath !== expectedFrozenPath) {
    issues.push(`frozen input path must be ${expectedFrozenPath}: ${input.frozen_path || '(missing)'}`);
  }
  const fullPath = path.join(root, frozenPath);
  const actual = fs.existsSync(fullPath)
    ? {
      byte_length: fs.statSync(fullPath).size,
      sha256: await sha256File(fullPath),
      modified_at: fs.statSync(fullPath).mtime.toISOString(),
    }
    : null;
  if (!actual) {
    issues.push(`missing frozen input ${input.frozen_path}`);
  } else {
    if (actual.byte_length !== input.byte_length) issues.push(`frozen input byte mismatch ${input.file}`);
    if (actual.sha256 !== input.sha256) issues.push(`frozen input hash mismatch ${input.file}`);
  }
  inputFiles.push({
    file: input.file,
    role: input.role,
    required: input.required,
    frozen_path: frozenPath,
    source_path: cleanRelativePath(input.source_path || ''),
    row_count: input.row_count,
    byte_length: input.byte_length,
    sha256: input.sha256,
    source_modified_at: input.source_modified_at,
    frozen_modified_at: input.frozen_modified_at,
  });
}

const storeFile = await manifestFileSummary(options.storeManifest);
const lookupFile = await manifestFileSummary(options.lookupManifest);
const publicFile = await manifestFileSummary(options.publicManifest);
const publicShardSummary = publicShardCounts(publicManifest, options.publicManifest);
const storeCounts = storeManifest.counts || {};
const lookupCounts = lookupManifest.counts || {};
const publicCounts = publicManifest.counts || {};
const reconciliation = {
  store_cards_written: Number(storeCounts.cards_written || 0),
  lookup_cards_read: Number(lookupCounts.cards_read || 0),
  lookup_cards_written: Number(lookupCounts.cards_written || 0),
  public_cards_written: Number(publicCounts.cards_written || 0),
  store_distinct_normalized_tokens: Number(storeCounts.distinct_normalized_tokens || 0),
  lookup_distinct_normalized_tokens: Number(lookupCounts.distinct_normalized_tokens || 0),
  public_distinct_normalized_tokens: Number(publicCounts.distinct_normalized_tokens || 0),
  lookup_shard_count: Number(lookupCounts.shard_count || 0),
  public_shard_count: Number(publicCounts.shard_count || 0),
  public_manifest_shards: Array.isArray(publicManifest.shards) ? publicManifest.shards.length : 0,
  public_shard_files_on_disk: publicShardSummary.file_count,
  public_manifest_card_sum: publicShardSummary.card_sum,
  public_manifest_token_sum: publicShardSummary.token_sum,
  public_manifest_byte_sum: publicShardSummary.byte_sum,
  counts_match: false,
};

if (reconciliation.store_cards_written !== reconciliation.lookup_cards_read) {
  issues.push('store cards_written does not match lookup cards_read');
}
if (reconciliation.lookup_cards_written !== reconciliation.public_cards_written) {
  issues.push('lookup cards_written does not match public cards_written');
}
if (reconciliation.store_distinct_normalized_tokens !== reconciliation.lookup_distinct_normalized_tokens) {
  issues.push('store distinct_normalized_tokens does not match lookup distinct_normalized_tokens');
}
if (reconciliation.lookup_distinct_normalized_tokens !== reconciliation.public_distinct_normalized_tokens) {
  issues.push('lookup distinct_normalized_tokens does not match public distinct_normalized_tokens');
}
if (reconciliation.lookup_shard_count !== reconciliation.public_shard_count) {
  issues.push('lookup shard_count does not match public shard_count');
}
if (reconciliation.public_manifest_shards !== reconciliation.public_shard_count) {
  issues.push('public manifest shard list length does not match public shard_count');
}
if (reconciliation.public_shard_files_on_disk !== reconciliation.public_shard_count) {
  issues.push('public shard files on disk do not match public shard_count; stale or missing public shards exist');
}
if (reconciliation.public_manifest_card_sum !== reconciliation.public_cards_written) {
  issues.push('public manifest shard card sum does not match public cards_written');
}
if (reconciliation.public_manifest_token_sum !== reconciliation.public_distinct_normalized_tokens) {
  issues.push('public manifest shard token sum does not match public distinct_normalized_tokens');
}
if (publicManifest.source_local_manifest !== `${path.dirname(options.lookupManifest).replace(/\\/g, '/')}/manifest.json`) {
  issues.push('public manifest source_local_manifest does not point at the local lookup manifest path');
}
validatePublicLookupPublicationBoundary(publicManifest.publication_boundary, issues);

reconciliation.counts_match = issues.length === 0;

const stamp = {
  schema_version: 1,
  artifact_type: 'hud_route_release_stamp',
  release_id: releaseId,
  generated_at: new Date().toISOString(),
  generator: 'scripts/stamp_hud_route_release.mjs',
  policy: 'Release-candidate stamp for frozen route inputs, regenerated HUD route store, local lookup, and public lookup. This is route-data reconciliation only, not publication readiness. No new route family should be added until this stamp validates.',
  publication_boundary: {
    publication_status: 'blocked_no_render',
    validates: [
      'hud_route_release_stamp',
      'public_hud_route_lookup_reconciliation',
    ],
    does_not_clear: [
      'translation_output',
      'source_publication',
      'public_lexical_export_reuse',
      'accepted_definition_authority',
    ],
    answer_eligible_scope: 'hud_answer_slot_only_not_translation_or_publication_readiness',
    release_candidate_scope: 'route_data_release_candidate_not_publication_readiness',
    warning_status_blocks_publication_claim: true,
    current_route_inputs_reconciled: 'stamp_uses_frozen_inputs_validate_drift_separately',
  },
  frozen_inputs: {
    freeze_manifest: cleanRelativePath(options.freezeManifest),
    release_id: freezeManifest.release_id || '',
    generated_at: freezeManifest.generated_at || '',
    source_dir: freezeManifest.source_dir || '',
    freeze_dir: freezeManifest.freeze_dir || '',
    files: inputFiles,
    missing_optional_files: freezeManifest.missing_optional_files || [],
  },
  route_store: {
    manifest_path: cleanRelativePath(options.storeManifest),
    generated_at: storeManifest.generated_at || '',
    file: storeFile,
    counts: storeCounts,
  },
  local_lookup: {
    manifest_path: cleanRelativePath(options.lookupManifest),
    generated_at: lookupManifest.generated_at || '',
    file: lookupFile,
    counts: lookupCounts,
    prefix_length: lookupManifest.prefix_length,
  },
  public_lookup: {
    manifest_path: cleanRelativePath(options.publicManifest),
    published_at: publicManifest.published_at || '',
    publication_boundary: publicManifest.publication_boundary || null,
    file: publicFile,
    counts: publicCounts,
    prefix_length: publicManifest.prefix_length,
    public_lookup: publicManifest.public_lookup || '',
    shard_files_on_disk: publicShardSummary.file_count,
    shard_manifest_card_sum: publicShardSummary.card_sum,
    shard_manifest_token_sum: publicShardSummary.token_sum,
    shard_manifest_byte_sum: publicShardSummary.byte_sum,
  },
  route_claim_audit: routeAudit ? {
    path: cleanRelativePath(options.routeAudit),
    generated_at: routeAudit.generated_at || '',
    counts: routeAudit.counts || {},
  } : null,
  reconciliation,
  status: issues.length ? 'failed' : 'release_candidate',
  issues,
};

writeJson(path.join(root, options.output), stamp);
writeReport(path.join(root, options.report), stamp);

if (issues.length) {
  console.error(`HUD route release stamp failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  release_id: stamp.release_id,
  status: stamp.status,
  output: cleanRelativePath(options.output),
  report: cleanRelativePath(options.report),
  public_cards_written: reconciliation.public_cards_written,
  public_shard_count: reconciliation.public_shard_count,
}, null, 2));

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--freeze-manifest') parsed.freezeManifest = args[++index];
    else if (arg === '--store-manifest') parsed.storeManifest = args[++index];
    else if (arg === '--lookup-manifest') parsed.lookupManifest = args[++index];
    else if (arg === '--public-manifest') parsed.publicManifest = args[++index];
    else if (arg === '--route-audit') parsed.routeAudit = args[++index];
    else if (arg === '--output') parsed.output = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/stamp_hud_route_release.mjs',
      '',
      'Options:',
      '  --freeze-manifest .local-cache/definition-route-freeze/current/route-input-freeze.json',
      '  --store-manifest .local-cache/hud-route-store/manifest.json',
      '  --lookup-manifest .local-cache/hud-route-lookup/manifest.json',
      '  --public-manifest data/definitions/hud-route-lookup/manifest.json',
      '  --route-audit .local-cache/definition-route-freeze/current/definition-route-claim-audit.json',
      '  --output data/definitions/hud-route-release-stamp.json',
      '  --report reports/hud-route-release-stamp.md',
    ].join('\n'));
    process.exit(0);
  }
  for (const key of pathOptionKeys) parsed[key] = cleanRelativePath(parsed[key]);
  validatePathScopes(parsed);
  return parsed;
}

function validatePathScopes(parsed) {
  assertExactPath('--freeze-manifest', parsed.freezeManifest, '.local-cache/definition-route-freeze/current/route-input-freeze.json');
  assertExactPath('--store-manifest', parsed.storeManifest, '.local-cache/hud-route-store/manifest.json');
  assertExactPath('--lookup-manifest', parsed.lookupManifest, '.local-cache/hud-route-lookup/manifest.json');
  assertExactPath('--public-manifest', parsed.publicManifest, 'data/definitions/hud-route-lookup/manifest.json');
  assertExactPath('--route-audit', parsed.routeAudit, '.local-cache/definition-route-freeze/current/definition-route-claim-audit.json');
  assertExactPath('--output', parsed.output, 'data/definitions/hud-route-release-stamp.json');
  assertExactPath('--report', parsed.report, 'reports/hud-route-release-stamp.md');
  assertFileExtension('--freeze-manifest', parsed.freezeManifest, '.json');
  assertFileExtension('--store-manifest', parsed.storeManifest, '.json');
  assertFileExtension('--lookup-manifest', parsed.lookupManifest, '.json');
  assertFileExtension('--public-manifest', parsed.publicManifest, '.json');
  assertFileExtension('--route-audit', parsed.routeAudit, '.json');
  assertFileExtension('--output', parsed.output, '.json');
  assertFileExtension('--report', parsed.report, '.md');
}

function assertExactPath(label, value, expected) {
  if (value !== expected) {
    throw new Error(`${label} must be ${expected}: ${value}`);
  }
}

function expectedFrozenInputPath(fileName) {
  const cleanFileName = cleanRelativePath(fileName);
  if (cleanFileName.includes('/')) throw new Error(`frozen input file must be a basename: ${fileName}`);
  return `.local-cache/definition-route-freeze/current/${cleanFileName}`;
}

function assertFileExtension(label, value, expectedExtension) {
  if (!value.endsWith(expectedExtension)) {
    throw new Error(`${label} must end with ${expectedExtension}: ${value}`);
  }
}

function readJson(relativePath, required = true) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    if (required) throw new Error(`Missing JSON file: ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

async function manifestFileSummary(relativePath) {
  const fullPath = path.join(root, relativePath);
  return {
    path: cleanRelativePath(relativePath),
    byte_length: fs.statSync(fullPath).size,
    sha256: await sha256File(fullPath),
    modified_at: fs.statSync(fullPath).mtime.toISOString(),
  };
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
    byte_sum: (manifest.shards || []).reduce((sum, shard) => sum + Number(shard.byte_length || 0), 0),
  };
}

function validatePublicLookupPublicationBoundary(boundary, issues) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push('public manifest publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push(`public manifest publication_boundary.publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`);
  }
  for (const item of ['public_hud_route_lookup_manifest', 'public_hud_route_lookup_shards']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      issues.push(`public manifest publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      issues.push(`public manifest publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    issues.push('public manifest publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (!String(boundary.route_lookup_scope || '').includes('not_publication_readiness')) {
    issues.push('public manifest publication_boundary.route_lookup_scope must state not_publication_readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('public manifest publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (boundary.current_route_inputs_reconciled !== 'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift') {
    issues.push('public manifest publication_boundary.current_route_inputs_reconciled must defer to release stamp and drift validation');
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

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeReport(filePath, stamp) {
  const lines = [
    '# HUD Route Release Stamp',
    '',
    `Release ID: ${stamp.release_id}`,
    `Generated: ${stamp.generated_at}`,
    `Status: ${stamp.status}`,
    '',
    '## Publication Boundary',
    '',
    `- Publication status: ${stamp.publication_boundary.publication_status}`,
    `- Validates: ${stamp.publication_boundary.validates.join(', ')}`,
    `- Does not clear: ${stamp.publication_boundary.does_not_clear.join(', ')}`,
    `- Answer eligibility scope: ${stamp.publication_boundary.answer_eligible_scope}`,
    `- Release-candidate scope: ${stamp.publication_boundary.release_candidate_scope}`,
    `- Warning status blocks publication claim: ${stamp.publication_boundary.warning_status_blocks_publication_claim}`,
    `- Current route inputs reconciled: ${stamp.publication_boundary.current_route_inputs_reconciled}`,
    '',
    '## Frozen Inputs',
    '',
    `- Freeze manifest: \`${stamp.frozen_inputs.freeze_manifest}\``,
    `- Freeze dir: \`${stamp.frozen_inputs.freeze_dir}\``,
    `- Frozen files: ${stamp.frozen_inputs.files.length}`,
    `- Missing optional files: ${stamp.frozen_inputs.missing_optional_files.length}`,
    '',
    '| file | rows | bytes | sha256 |',
    '|---|---:|---:|---|',
    ...stamp.frozen_inputs.files.map((file) => `| ${mdCell(file.file)} | ${file.row_count ?? ''} | ${file.byte_length} | \`${file.sha256}\` |`),
    '',
    '## Public Lookup',
    '',
    `- Manifest: \`${stamp.public_lookup.manifest_path}\``,
    `- Published at: ${stamp.public_lookup.published_at}`,
    `- Publication status: ${stamp.public_lookup.publication_boundary?.publication_status || 'missing'}`,
    `- Cards: ${stamp.reconciliation.public_cards_written}`,
    `- Distinct normalized tokens: ${stamp.reconciliation.public_distinct_normalized_tokens}`,
    `- Shards in manifest: ${stamp.reconciliation.public_shard_count}`,
    `- Shard files on disk: ${stamp.reconciliation.public_shard_files_on_disk}`,
    `- Max shard bytes: ${stamp.public_lookup.counts.max_shard_bytes || 0}`,
    '',
    '## Reconciliation',
    '',
    `- Store cards written: ${stamp.reconciliation.store_cards_written}`,
    `- Lookup cards read: ${stamp.reconciliation.lookup_cards_read}`,
    `- Lookup cards written: ${stamp.reconciliation.lookup_cards_written}`,
    `- Public cards written: ${stamp.reconciliation.public_cards_written}`,
    `- Counts match: ${stamp.reconciliation.counts_match ? 'yes' : 'no'}`,
    '',
    '## Issues',
    '',
    ...(stamp.issues.length ? stamp.issues.map((issue) => `- ${issue}`) : ['None.']),
    '',
    '## Boundary',
    '',
    'This stamp records a release-candidate route-data generation. It does not introduce route families, source imports, English source-text translations, accepted translation output, or publication readiness.',
  ];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be a relative in-repo path: ${value}`);
  }
  return normalized;
}
