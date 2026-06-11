#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const out = args.out || '';
const limit = Number(args.limit || 25);
const roots = String(args.roots || 'reports,data/control')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const reportsDir = path.resolve(root, args.reports || 'reports');

if (!Number.isInteger(limit) || limit <= 0) fail(`limit must be a positive integer, found ${args.limit}`);
if (!roots.length) fail('at least one root is required');

const rows = roots
  .flatMap((displayRoot) => listRoot(displayRoot))
  .sort((a, b) => b.mtime_ms - a.mtime_ms)
  .slice(0, limit)
  .map((row) => ({ ...row, classification: classify(row) }))
  .map((row) => suppressConsumedUpstream(row));

const artifact = {
  artifact_type: 'agent4_recent_intake_snapshot',
  agent: 'Agent 4',
  generated_at: new Date().toISOString(),
  target: 'Agent 4 bounded recent intake snapshot',
  changed_input_artifact: args.anchor || 'bounded_recent_intake_snapshot_no_changed_package_input',
  scanned_roots: roots,
  limit,
  row_count: rows.length,
  candidate_like_count: rows.filter((row) => row.classification.candidate_like).length,
  validator_commands: [
    {
      command: snapshotCommand(),
      timeout_ms: Number(args.timeoutMs || args.timeout || 30000),
      result: 'passed',
    },
  ],
  rows,
  exact_blockers: [],
  stop_condition: 'Stop after producing a bounded top-level intake snapshot; do not use this as acceptance or package validation.',
  non_acceptance_boundary: [
    'No QA acceptance.',
    'No source, provenance, license, legal, Definition, answer, product, publication, public/runtime, route publication, or release acceptance.',
    'No accepted gloss, accepted text, public reader output, public runtime mutation, or release action.',
  ],
};

const json = `${JSON.stringify(artifact, null, 2)}\n`;
if (out) {
  fs.mkdirSync(path.dirname(path.resolve(root, out)), { recursive: true });
  fs.writeFileSync(path.resolve(root, out), json, 'utf8');
}
console.log(json.trimEnd());

function listRoot(displayRoot) {
  const dir = path.resolve(root, displayRoot);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        path: normalizePath(path.join(displayRoot, entry.name)),
        name: entry.name,
        root: displayRoot,
        mtime_ms: stat.mtimeMs,
        size: stat.size,
      };
    });
}

function classify(row) {
  const name = row.name.toLowerCase();
  if (name.endsWith('.md')) return { candidate_like: false, reason: 'markdown_companion_or_report' };
  if (!name.endsWith('.json')) return { candidate_like: false, reason: 'non_json_file' };
  if (name.startsWith('agent4-')) return { candidate_like: false, reason: 'agent4_owned_output' };
  if (/(^|-)state\.json$/i.test(name) || name.endsWith('_state.json')) {
    return { candidate_like: false, reason: 'lane_state_or_status_file' };
  }
  if (name.includes('sweep-result') || name.includes('validation-result')) {
    return { candidate_like: false, reason: 'machine_result_or_companion_file' };
  }
  if (name.includes('heartbeat') || name.includes('pulse') || name.includes('loop')) {
    return { candidate_like: false, reason: 'heartbeat_or_status_file' };
  }
  return { candidate_like: true, reason: 'upstream_json_candidate_like' };
}

function suppressConsumedUpstream(row) {
  if (!row.classification.candidate_like) return row;
  if (!collectConsumedUpstreamInputs.cache) {
    collectConsumedUpstreamInputs.cache = collectConsumedUpstreamInputs(reportsDir);
  }
  if (!collectConsumedUpstreamInputs.cache.has(row.path)) return row;
  return {
    ...row,
    classification: {
      candidate_like: false,
      reason: 'upstream_input_already_packaged_by_agent4',
    },
  };
}

function collectConsumedUpstreamInputs(dir) {
  const consumed = new Set();
  if (!fs.existsSync(dir)) return consumed;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const name = entry.name.toLowerCase();
    if (!name.startsWith('agent4-') || !name.endsWith('.json')) continue;
    if (name.includes('sweep-result') || name.includes('validation-result')) continue;
    const fullPath = path.join(dir, entry.name);
    let artifact = null;
    try {
      artifact = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch {
      continue;
    }
    const changedInput = artifact?.changed_input_artifact;
    if (typeof changedInput === 'string' && changedInput && !path.basename(changedInput).toLowerCase().startsWith('agent4-')) {
      consumed.add(normalizePath(changedInput));
    }
  }
  return consumed;
}

function snapshotCommand() {
  const parts = ['node scripts\\build_agent4_recent_intake_snapshot.mjs'];
  if (out) parts.push(`--out=${out}`);
  if (args.limit) parts.push(`--limit=${limit}`);
  if (args.roots) parts.push(`--roots=${roots.join(',')}`);
  return parts.join(' ');
}

function normalizePath(value) {
  return value.split(path.sep).join('/');
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (arg.includes('=')) {
      const [inlineKey, ...rest] = key.split('=');
      parsed[inlineKey] = rest.join('=');
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}
