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
const sourceDir = path.join(root, options.sourceDir);
const freezeDir = path.join(root, options.freezeDir);
const generatedAt = new Date().toISOString();
const manifest = {
  schema_version: 1,
  artifact_type: 'hud_route_input_freeze',
  release_id: options.releaseId,
  generated_at: generatedAt,
  generator: 'scripts/freeze_hud_route_inputs.mjs',
  policy: 'Freeze existing route input files for release-candidate HUD route store and public lookup generation. This script copies inputs only; it does not create route families or route claims.',
  source_dir: cleanRelativePath(options.sourceDir),
  freeze_dir: cleanRelativePath(options.freezeDir),
  files: [],
  missing_optional_files: [],
};

fs.rmSync(freezeDir, { recursive: true, force: true });
fs.mkdirSync(freezeDir, { recursive: true });

for (const input of routeInputs) {
  const sourcePath = path.join(sourceDir, input.file);
  if (!fs.existsSync(sourcePath)) {
    if (input.required) throw new Error(`Missing required route input: ${cleanRelativePath(path.relative(root, sourcePath))}`);
    manifest.missing_optional_files.push({ file: input.file, role: input.role });
    continue;
  }
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
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
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

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
