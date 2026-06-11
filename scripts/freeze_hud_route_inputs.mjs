#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const defaults = {
  sourceDir: '.local-cache/definition-routes',
  freezeDir: '.local-cache/definition-route-freeze/current',
  releaseId: `hud-route-rc-${new Date().toISOString().replace(/[:.]/g, '-')}`,
  spaceSafetyGb: 1,
  dryRun: false,
};

const routeInputs = [
  { file: 'kaikki-definition-claims.jsonl', required: true, role: 'wiktionary definition claims' },
  { file: 'source-layer-definition-claims.jsonl', required: true, role: 'source-layer definition claims' },
  { file: 'source-phrase-evidence.jsonl', required: true, role: 'licensed source phrase evidence' },
  { file: 'source-biblical-paraphrase-evidence.jsonl', required: false, role: 'biblical paraphrase evidence' },
  { file: 'source-citable-paraphrase-evidence.jsonl', required: false, role: 'citable paraphrase evidence' },
  { file: 'source-paraphrase-evidence.jsonl', required: false, role: 'legacy paraphrase evidence' },
  { file: 'definition-route-manifest.json', required: true, role: 'definition route input manifest' },
];

const options = parseArgs(process.argv.slice(2));
const sourceDir = resolveWorkspaceRelativePath(options.sourceDir, 'source-dir');
const freezeDir = resolveWorkspaceRelativePath(options.freezeDir, 'freeze-dir');
assertSafeFreezeTarget(sourceDir, freezeDir);
const generatedAt = new Date().toISOString();
const sourceInputs = collectSourceInputs();
const preflight = buildPreflight(sourceInputs);
const manifest = {
  schema_version: 1,
  artifact_type: 'hud_route_input_freeze',
  release_id: options.releaseId,
  generated_at: generatedAt,
  generator: 'scripts/freeze_hud_route_inputs.mjs',
  policy: 'Freeze existing route input files for release-candidate HUD route store and public lookup generation. This script copies inputs only; it does not create route families or route claims.',
  source_dir: cleanRelativePath(options.sourceDir),
  freeze_dir: cleanRelativePath(options.freezeDir),
  dry_run: options.dryRun,
  preflight,
  files: [],
  missing_optional_files: sourceInputs.missingOptionalFiles,
};

if (options.dryRun) {
  console.log(JSON.stringify({
    release_id: manifest.release_id,
    dry_run: true,
    source_dir: manifest.source_dir,
    freeze_dir: manifest.freeze_dir,
    copy_bytes: preflight.copy_bytes,
    effective_available_bytes: preflight.effective_available_bytes,
    frozen_files: sourceInputs.presentInputs.length,
    missing_optional_files: sourceInputs.missingOptionalFiles.length,
  }, null, 2));
  process.exit(0);
}

fs.rmSync(freezeDir, { recursive: true, force: true });
fs.mkdirSync(freezeDir, { recursive: true });

for (const input of sourceInputs.presentInputs) {
  const sourcePath = input.sourcePath;
  const targetPath = path.join(freezeDir, input.file);
  fs.copyFileSync(sourcePath, targetPath);
  const sourceStats = await fileStats(sourcePath, input.file.endsWith('.jsonl'));
  const frozenStats = await fileStats(targetPath, input.file.endsWith('.jsonl'));
  if (sourceStats.sha256 !== frozenStats.sha256) {
    throw new Error(`Frozen input hash mismatch after copy: ${input.file}`);
  }
  manifest.files.push({
    file: input.file,
    role: input.role,
    required: input.required,
    source_path: cleanRelativePath(path.relative(root, sourcePath)),
    frozen_path: cleanRelativePath(path.relative(root, targetPath)),
    byte_length: frozenStats.byte_length,
    row_count: frozenStats.row_count,
    sha256: frozenStats.sha256,
    source_modified_at: sourceStats.modified_at,
    frozen_modified_at: frozenStats.modified_at,
  });
}

writeJson(path.join(freezeDir, 'route-input-freeze.json'), manifest);
console.log(JSON.stringify({
  release_id: manifest.release_id,
  freeze_manifest: cleanRelativePath(path.relative(root, path.join(freezeDir, 'route-input-freeze.json'))),
  frozen_files: manifest.files.length,
  missing_optional_files: manifest.missing_optional_files.length,
}, null, 2));

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--source-dir') parsed.sourceDir = args[++index];
    else if (arg === '--freeze-dir') parsed.freezeDir = args[++index];
    else if (arg === '--release-id') parsed.releaseId = args[++index];
    else if (arg === '--space-safety-gb') parsed.spaceSafetyGb = Number(args[++index]);
    else if (arg === '--dry-run') parsed.dryRun = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/freeze_hud_route_inputs.mjs',
      '',
      'Options:',
      '  --source-dir .local-cache/definition-routes',
      '  --freeze-dir .local-cache/definition-route-freeze/current',
      '  --release-id hud-route-rc-...',
      '  --space-safety-gb 1',
      '  --dry-run',
    ].join('\n'));
    process.exit(0);
  }
  if (!Number.isFinite(parsed.spaceSafetyGb) || parsed.spaceSafetyGb < 0) {
    throw new Error(`Invalid --space-safety-gb: ${parsed.spaceSafetyGb}`);
  }
  return parsed;
}

function collectSourceInputs() {
  if (!fs.existsSync(sourceDir)) throw new Error(`Missing route source directory: ${cleanRelativePath(options.sourceDir)}`);
  const presentInputs = [];
  const missingOptionalFiles = [];
  for (const input of routeInputs) {
    const sourcePath = path.join(sourceDir, input.file);
    if (!fs.existsSync(sourcePath)) {
      if (input.required) throw new Error(`Missing required route input: ${cleanRelativePath(path.relative(root, sourcePath))}`);
      missingOptionalFiles.push({ file: input.file, role: input.role });
      continue;
    }
    presentInputs.push({
      ...input,
      sourcePath,
      byte_length: fs.statSync(sourcePath).size,
    });
  }
  return { presentInputs, missingOptionalFiles };
}

function buildPreflight(inputs) {
  const copyBytes = inputs.presentInputs.reduce((sum, input) => sum + input.byte_length, 0);
  const existingFreezeBytes = directoryBytes(freezeDir);
  const available = availableBytes(path.dirname(freezeDir));
  const safetyBytes = options.spaceSafetyGb * 1024 * 1024 * 1024;
  const effectiveAvailable = Number.isFinite(available) ? available + existingFreezeBytes : null;
  const requiredBytes = copyBytes + safetyBytes;
  const result = {
    required_inputs_checked: true,
    disk_space_checked: Number.isFinite(effectiveAvailable),
    copy_bytes: copyBytes,
    existing_freeze_bytes: existingFreezeBytes,
    available_bytes: Number.isFinite(available) ? available : null,
    effective_available_bytes: Number.isFinite(effectiveAvailable) ? effectiveAvailable : null,
    required_bytes: requiredBytes,
    safety_gb: options.spaceSafetyGb,
  };
  if (Number.isFinite(effectiveAvailable) && effectiveAvailable < requiredBytes) {
    throw new Error([
      'Insufficient disk space to freeze HUD route inputs.',
      `Route input bytes: ${copyBytes}.`,
      `Safety bytes: ${safetyBytes}.`,
      `Effective available bytes after replacing existing freeze: ${effectiveAvailable}.`,
      'Freeze directory was not removed.',
    ].join(' '));
  }
  return result;
}

function resolveWorkspaceRelativePath(value, label) {
  const clean = cleanRelativePath(value);
  const resolved = path.resolve(root, clean);
  if (!isSameOrWithin(root, resolved)) {
    throw new Error(`${label} must stay inside repo root: ${value}`);
  }
  return resolved;
}

function assertSafeFreezeTarget(sourcePath, freezePath) {
  const freezeRoot = path.resolve(root, '.local-cache/definition-route-freeze');
  if (!isSameOrWithin(freezeRoot, freezePath)) {
    throw new Error('freeze-dir must stay under .local-cache/definition-route-freeze before it can be replaced');
  }
  if (path.resolve(root) === path.resolve(freezePath)) {
    throw new Error('freeze-dir must not be the repo root');
  }
  if (isSameOrWithin(sourcePath, freezePath) || isSameOrWithin(freezePath, sourcePath)) {
    throw new Error('source-dir and freeze-dir must be disjoint before freeze-dir can be replaced');
  }
}

async function fileStats(filePath, countRows) {
  const stat = fs.statSync(filePath);
  return {
    byte_length: stat.size,
    row_count: countRows ? await countJsonlRows(filePath) : null,
    sha256: await sha256File(filePath),
    modified_at: stat.mtime.toISOString(),
  };
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

function availableBytes(dirPath) {
  if (typeof fs.statfsSync !== 'function') return null;
  const stats = fs.statfsSync(dirPath);
  return Number(stats.bavail) * Number(stats.bsize);
}

function directoryBytes(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) return stat.size;
  let total = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    total += entry.isDirectory() ? directoryBytes(entryPath) : fs.statSync(entryPath).size;
  }
  return total;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function isSameOrWithin(parentPath, childPath) {
  const parent = path.resolve(parentPath);
  const child = path.resolve(childPath);
  return child === parent || child.startsWith(`${parent}${path.sep}`);
}
