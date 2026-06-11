#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const reportsDir = path.resolve(root, args.reports || 'reports');
const controlDir = path.resolve(root, args.control || 'data/control');
const after = args.after || args.anchor;
const out = args.out;
const limit = Number(args.limit || 50);
const lookbackMs = Number(args.lookbackMs || args.lookback || 0);

if (!after) fail('usage: node scripts/select_agent4_changed_input_candidate.mjs --after=<anchor-file> [--out=<result.json>]');
if (!Number.isInteger(limit) || limit <= 0) fail(`limit must be a positive integer, found ${args.limit}`);
if (!Number.isFinite(lookbackMs) || lookbackMs < 0) fail(`lookbackMs must be a non-negative number, found ${args.lookbackMs || args.lookback}`);

const anchorPath = path.resolve(root, after);
if (!fs.existsSync(anchorPath)) fail(`anchor file does not exist: ${after}`);
const anchorMtimeMs = fs.statSync(anchorPath).mtimeMs;
const scanStartMtimeMs = Math.max(0, anchorMtimeMs - lookbackMs);
const consumedUpstreamInputs = collectConsumedUpstreamInputs(reportsDir);

const rows = [
  ...listFiles(reportsDir, 'reports'),
  ...listFiles(controlDir, 'data/control'),
]
  .filter((row) => row.mtime_ms > scanStartMtimeMs)
  .sort((a, b) => b.mtime_ms - a.mtime_ms)
  .slice(0, limit)
  .map((row) => ({ ...row, classification: classify(row) }))
  .map((row) => {
    if (row.classification.changed_input_candidate && consumedUpstreamInputs.has(row.path)) {
      return {
        ...row,
        classification: {
          changed_input_candidate: false,
          reason: 'upstream_input_already_packaged_by_agent4',
          suggested_validator: row.classification.suggested_validator,
        },
      };
    }
    return row;
  });

const candidates = rows.filter((row) => row.classification.changed_input_candidate);
const selected = candidates[0] || null;
const artifact = {
  artifact_type: selected ? 'agent4_changed_input_candidate_selection' : 'agent4_changed_input_blocker',
  agent: 'Agent 4',
  generated_at: new Date().toISOString(),
  target: 'Agent 4 changed-input candidate selection',
  changed_input_artifact: selected ? selected.path : normalizePath(path.relative(root, anchorPath)),
  validator_commands: [
    {
      command: selectorCommand(),
      timeout_ms: Number(args.timeoutMs || args.timeout || 30000),
      result: 'passed',
    },
  ],
  anchor: normalizePath(path.relative(root, anchorPath)),
  anchor_mtime_ms: anchorMtimeMs,
  lookback_ms: lookbackMs,
  scan_start_mtime_ms: scanStartMtimeMs,
  scanned_roots: ['reports', 'data/control'],
  limit,
  newer_file_count: rows.length,
  candidate_count: candidates.length,
  selected_candidate: selected
    ? {
        path: selected.path,
        reason: selected.classification.reason,
        suggested_validator: selected.classification.suggested_validator,
      }
    : null,
  changed_input_blocker: selected
    ? null
    : {
        code: 'changed_package_input_missing',
        changed_package_path_missing: true,
        command_list_needed: 'Exact validator/prereq command for the next changed package or candidate artifact.',
        expected_output_schema:
          'Agent4 proof packet with changed_input_artifact, validator_commands including timeout_ms/result, counts, exact blockers, handoff_owner, stop_condition, and non_acceptance_boundary.',
        validator_gate:
          'Run only an existing named validator for the selected changed package/input, then validate the Agent4 packet with scripts/validate_agent4_validator_prereq_packet.mjs.',
        package_owner: 'Agent 10 release/package intake or the upstream package-producing agent for the next changed artifact.',
        approval_boundary_trigger:
          'Only after a concrete boundary-ready packet exists and A07 approval, SOP, final validation, or release-gate review is explicitly needed.',
        stop_condition: 'Stop after selecting one changed package/input or returning this exact blocker.',
      },
  exact_blockers: selected
    ? []
    : [
        {
          code: 'changed_package_input_missing',
          changed_package_path_missing: true,
          details: 'No changed package/input candidate was selected after the provided anchor.',
        },
      ],
  handoff_owner: selected
    ? 'Agent 4 runs the selected candidate validator; upstream package owner remains responsible for package contents.'
    : 'Agent 4 for changed-input-only validation discipline; Agent 10 or upstream package owner must provide the next changed package/input.',
  stop_condition: selected
    ? 'Stop after selecting one changed package/input candidate for exact validation.'
    : 'Stop after returning an exact changed-input blocker.',
  non_acceptance_boundary: [
    'No QA acceptance.',
    'No source, provenance, license, legal, Definition, answer, product, publication, public/runtime, route publication, or release acceptance.',
    'No accepted gloss, accepted text, public reader output, public runtime mutation, repo cleanup action, destructive command, or release action.',
  ],
  rows,
};

const json = `${JSON.stringify(artifact, null, 2)}\n`;
if (out) {
  fs.mkdirSync(path.dirname(path.resolve(root, out)), { recursive: true });
  fs.writeFileSync(path.resolve(root, out), json, 'utf8');
}
console.log(json.trimEnd());

function listFiles(dir, displayRoot) {
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

function classify(row) {
  const name = row.name.toLowerCase();
  const fullPath = path.resolve(root, row.path);
  const base = {
    changed_input_candidate: false,
    reason: null,
    suggested_validator: null,
  };

  if (name.endsWith('.md')) {
    return { ...base, reason: 'markdown_status_or_companion_file' };
  }
  if (name.endsWith('.html') && /preview|prehud|hud/i.test(name)) {
    return { ...base, reason: 'preview_html_not_package_input' };
  }
  if (!name.endsWith('.json')) {
    return { ...base, reason: 'non_json_file' };
  }
  if (/(^|-)state\.json$/i.test(name) || name.endsWith('_state.json')) {
    return { ...base, reason: 'lane_state_or_status_file' };
  }
  if (name.startsWith('agent4-')) {
    return { ...base, reason: 'agent4_owned_output_not_upstream_input' };
  }
  if (name.includes('heartbeat') || name.includes('pulse') || name.includes('loop')) {
    return { ...base, reason: 'heartbeat_or_status_file' };
  }
  if (name.includes('sweep-result') || name.includes('validation-result')) {
    return { ...base, reason: 'machine_result_or_companion_file' };
  }

  let artifact = null;
  try {
    artifact = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return { ...base, reason: 'json_parse_failed' };
  }

  const artifactType = String(artifact.artifact_type || '');
  const generator = String(artifact.generator || '');
  if (artifactType.startsWith('agent4_')) {
    return { ...base, reason: 'agent4_owned_output_not_upstream_input' };
  }
  if (/heartbeat|pulse|loop/i.test(artifactType) || /heartbeat|pulse|loop/i.test(generator)) {
    return { ...base, reason: 'heartbeat_or_status_file' };
  }
  if (/state|status/i.test(artifactType) && !/candidate|package|matrix|workset|handoff|boundary|prereq/i.test(artifactType)) {
    return { ...base, reason: 'lane_state_or_status_file' };
  }

  const suggestedValidator = validatorFor(row.name);
  return {
    changed_input_candidate: true,
    reason: artifactType ? `upstream_artifact_type:${artifactType}` : 'upstream_json_artifact',
    suggested_validator: suggestedValidator,
  };
}

function validatorFor(name) {
  const stem = name
    .replace(/-2026-\d\d-\d\d.*$/i, '')
    .replace(/\.json$/i, '')
    .replace(/-/g, '_');
  const candidate = `scripts/validate_${stem}.mjs`;
  return fs.existsSync(path.resolve(root, candidate)) ? candidate : null;
}

function selectorCommand() {
  const parts = ['node scripts\\select_agent4_changed_input_candidate.mjs', `--after=${after}`];
  if (out) parts.push(`--out=${out}`);
  if (args.reports) parts.push(`--reports=${args.reports}`);
  if (args.control) parts.push(`--control=${args.control}`);
  if (args.limit) parts.push(`--limit=${args.limit}`);
  if (args.lookbackMs || args.lookback) parts.push(`--lookbackMs=${lookbackMs}`);
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
  console.error(`Selection failed: ${message}`);
  process.exit(1);
}
