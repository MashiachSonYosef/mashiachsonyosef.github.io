#!/usr/bin/env node
// scan-chain-v1 — read-only scanner for the "999 footsteps" additive chain head lineage.
//
// Reads the workspace at ROOT (never writes inside it), verifies the sealed chain,
// and writes a deterministic status snapshot into this repository for publication
// to GitHub (branch claude/chain-status), so a cloud agent without filesystem
// access can see the chain state and detect hash changes.
//
// Hash algorithm is a faithful reimplementation of
//   rebuild-c0-w/tools/additive-chain-head-v3/seal_common.mjs  (typedTree / bindFile)
// so recomputed roots are comparable byte-for-byte with the recorded seals.
//
// Exit codes: 0 = no change since last snapshot, 3 = state changed, 2 = INTEGRITY HOLD
// (an immutable pin or sealed tree no longer matches its recorded hash), 4 = scanner
// error — fail-closed: an ERROR heartbeat is still published so the remote can tell a
// crashed scanner from a silent one.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.resolve(TOOL_DIR, '..');
// The workspace path is the machine's own business: a literal here put the
// owner's name on a public branch. Set FOOTSTEPS_ROOT in the scanner's
// environment (e.g. `setx FOOTSTEPS_ROOT "C:\\...\\999 footsteps"`, then
// restart the shell) — the scan refuses to guess.
const ROOT = process.env.FOOTSTEPS_ROOT
  || (() => { throw new Error('FOOTSTEPS_ROOT is not set — the workspace path is named by the environment, never typed here'); })();

const POINTER_REL = 'rebuild-c0-w/control/current-additive-chain-head-v0.json';
const CONTROL_REL = 'rebuild-c0-w/control';
const PROTECTED_STATE_REL = 'rebuild-c0-w/control/current-additive-chain-head-v0-contract/payload/protected-state-before-v0.json';

// Mutable / append-only files watched by live hash only (no verdict — change is
// information, not corruption). Globs are simple prefix+suffix patterns.
const WATCH_GLOBS = [
  'rebuild-c0-w/control/current-additive-chain-head-v0.json',
  'ledgers/work/y/y-current.json',
  'ledgers/work/y/y-hebrew-navigation-seal-v*.json',
  'storage-maintenance-v1/control/ledger-retention-cleanup-g0-v1/ledger-retention-cleanup-checkpoint-*.json',
  'storage-maintenance-v1/control/ledger-retention-cleanup-g0-v1/website-dependency-manifest-v2.sha256-bytes-path.txt',
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function abs(relative) {
  const normalized = relative.replaceAll('\\', '/');
  const absolute = path.resolve(ROOT, normalized);
  const back = path.relative(ROOT, absolute);
  invariant(!back.startsWith('..') && !path.isAbsolute(back), `Path escapes root: ${relative}`);
  return absolute;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function bytewise(left, right) {
  return Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8'));
}

// Publish files via temp-plus-rename so a crash mid-write can never leave a truncated
// snapshot behind (a truncated latest.json would otherwise wedge every later run).
function writeAtomic(file, text) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

function bindFile(relative) {
  const normalized = relative.replaceAll('\\', '/');
  const bytes = fs.readFileSync(abs(normalized));
  return { path: normalized, bytes: bytes.length, sha256: sha256(bytes) };
}

function typedTree(relativeRoot) {
  const entries = [];
  function walk(relative) {
    entries.push({ type: 'directory', path: relative });
    const children = fs.readdirSync(abs(relative), { withFileTypes: true });
    children.sort((left, right) => bytewise(left.name, right.name));
    for (const child of children) {
      const childPath = `${relative}/${child.name}`;
      if (child.isDirectory()) {
        walk(childPath);
      } else if (child.isFile()) {
        entries.push({ type: 'file', ...bindFile(childPath) });
      } else {
        entries.push({ type: 'other', path: childPath });
      }
    }
  }
  walk(relativeRoot);
  entries.sort((left, right) => bytewise(left.path, right.path));
  const records = entries.map((entry) => {
    if (entry.type === 'directory') return `D\0${entry.path}\n`;
    if (entry.type === 'file') return `F\0${entry.path}\0${entry.bytes}\0${entry.sha256}\n`;
    return `O\0${entry.path}\n`;
  }).join('');
  return {
    root: relativeRoot,
    entry_count: entries.length,
    directory_count: entries.filter((e) => e.type === 'directory').length,
    file_count: entries.filter((e) => e.type === 'file').length,
    other_count: entries.filter((e) => e.type === 'other').length,
    typed_tree_sha256: sha256(Buffer.from(records, 'utf8')),
    entries,
  };
}

function isPin(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && typeof value.path === 'string'
    && typeof value.bytes === 'number'
    && typeof value.sha256 === 'string' && /^[0-9a-f]{64}$/.test(value.sha256);
}

// Collect every {path, bytes, sha256} pin reachable in a JSON document, with its
// JSON pointer location, deduplicated by path (first location wins).
function collectPins(value, location, out) {
  if (isPin(value)) {
    if (!out.has(value.path)) out.set(value.path, { location, recorded: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPins(item, `${location}/${index}`, out));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      collectPins(child, `${location}/${key}`, out);
    }
  }
}

function verifyPin(recorded) {
  // Every anomaly returns a status (all non-MATCH statuses count as holds) instead of
  // throwing — a tampered pin path or a pin turned directory is a finding, not a crash.
  let absolute;
  try {
    absolute = abs(recorded.path);
  } catch (error) {
    return { status: 'ESCAPES_ROOT', live: null, error: String(error?.message ?? error) };
  }
  try {
    if (!fs.existsSync(absolute)) {
      return { status: 'MISSING', live: null };
    }
    if (!fs.statSync(absolute).isFile()) {
      return { status: 'NOT_A_FILE', live: null };
    }
    const live = bindFile(recorded.path);
    const match = live.bytes === recorded.bytes && live.sha256 === recorded.sha256;
    return { status: match ? 'MATCH' : 'DRIFT', live: { bytes: live.bytes, sha256: live.sha256 } };
  } catch (error) {
    return { status: 'ERROR', live: null, error: String(error?.message ?? error) };
  }
}

// For a drifted tree, name the exact entries that departed from the package's
// own target seal (which enumerates every sealed file as {type, path, bytes, sha256}).
function driftVsSeal(packageRel, treeRoot, liveTree) {
  const sealRel = `${packageRel}/${packageRel.split('/').pop()}-target-seal.json`;
  if (!fs.existsSync(abs(sealRel))) return { seal: null, note: 'no target seal found' };
  let sealedEntries = null;
  try {
    const seal = JSON.parse(fs.readFileSync(abs(sealRel), 'utf8'));
    for (const value of Object.values(seal)) {
      if (value && typeof value === 'object' && value.root === treeRoot && Array.isArray(value.entries)) {
        sealedEntries = value.entries;
        break;
      }
    }
  } catch {
    return { seal: sealRel, note: 'target seal unreadable' };
  }
  if (!sealedEntries) return { seal: sealRel, note: `seal has no entry list for root ${treeRoot}` };
  const sealed = new Map(sealedEntries.filter((e) => e && e.type === 'file' && typeof e.path === 'string').map((e) => [e.path, e]));
  const live = new Map(liveTree.entries.filter((e) => e.type === 'file').map((e) => [e.path, e]));
  const missing = [...sealed.keys()].filter((p) => !live.has(p)).sort(bytewise)
    .map((p) => ({ path: p, sealed: { bytes: sealed.get(p).bytes, sha256: sealed.get(p).sha256 } }));
  const extra = [...live.keys()].filter((p) => !sealed.has(p)).sort(bytewise)
    .map((p) => ({ path: p, live: { bytes: live.get(p).bytes, sha256: live.get(p).sha256 } }));
  const changed = [...sealed.keys()].filter((p) => live.has(p)
    && (live.get(p).bytes !== sealed.get(p).bytes || live.get(p).sha256 !== sealed.get(p).sha256)).sort(bytewise)
    .map((p) => ({
      path: p,
      sealed: { bytes: sealed.get(p).bytes, sha256: sealed.get(p).sha256 },
      live: { bytes: live.get(p).bytes, sha256: live.get(p).sha256 },
    }));
  return { seal: sealRel, missing, extra, changed };
}

function expandGlob(pattern) {
  if (!pattern.includes('*')) {
    return fs.existsSync(abs(pattern)) ? [pattern] : [];
  }
  const dir = pattern.slice(0, pattern.lastIndexOf('/'));
  const name = pattern.slice(pattern.lastIndexOf('/') + 1);
  const star = name.indexOf('*');
  const prefix = name.slice(0, star);
  const suffix = name.slice(star + 1);
  if (!fs.existsSync(abs(dir))) return [];
  return fs.readdirSync(abs(dir))
    .filter((entry) => entry.startsWith(prefix) && entry.endsWith(suffix) && entry.length >= prefix.length + suffix.length)
    .map((entry) => `${dir}/${entry}`)
    .filter((rel) => {
      try {
        return fs.statSync(abs(rel)).isFile();
      } catch {
        return true; // dangling link etc. — keep it so the watch loop records the anomaly
      }
    })
    .sort(bytewise);
}

function main() {
  const startedAt = new Date();

  // ---- 1. Head pointer: hash the file itself, then parse it.
  const pointerPin = bindFile(POINTER_REL);
  const pointer = JSON.parse(fs.readFileSync(abs(POINTER_REL), 'utf8'));

  // ---- 2. Verify every immutable pin recorded inside the pointer.
  const pins = new Map();
  collectPins(pointer.effective_head, '/effective_head', pins);
  collectPins(pointer.transition, '/transition', pins);
  const pinResults = [...pins.entries()]
    .sort((a, b) => bytewise(a[0], b[0]))
    .map(([pinPath, { location, recorded }]) => {
      const { status, live } = verifyPin(recorded);
      return {
        path: pinPath,
        location,
        recorded: { bytes: recorded.bytes, sha256: recorded.sha256 },
        live,
        status,
      };
    });

  // ---- 3. Recompute typed trees for every chain package and compare where the
  //         pointer records an expected root.
  const packageRels = [];
  const linkAnomalies = [];
  const isPackageName = (name) => name.startsWith('additive-chain-head-') || name.startsWith('current-additive-chain-head-v0');
  const discover = (dirRel, filter) => {
    for (const e of fs.readdirSync(abs(dirRel), { withFileTypes: true })) {
      if (!filter(e.name)) continue;
      const rel = `${dirRel}/${e.name}`;
      if (e.isDirectory()) packageRels.push(rel);
      // A sealed package replaced by a junction/symlink is an anomaly, never hashed through.
      else if (e.isSymbolicLink()) linkAnomalies.push(rel);
    }
  };
  discover(CONTROL_REL, isPackageName);
  const auditsRel = `${CONTROL_REL}/independent-audits`;
  if (fs.existsSync(abs(auditsRel))) discover(auditsRel, () => true);
  packageRels.sort(bytewise);

  const expectedRoots = new Map();
  function recordExpected(node, label) {
    if (!node || typeof node !== 'object') return;
    if (typeof node.package === 'string') {
      if (typeof node.package_tree_sha256 === 'string') {
        expectedRoots.set(node.package, { source: label, sha256: node.package_tree_sha256 });
      }
      if (typeof node.payload_tree_sha256 === 'string') {
        expectedRoots.set(`${node.package}/payload`, { source: label, sha256: node.payload_tree_sha256 });
      }
    }
  }
  recordExpected(pointer.effective_head, 'effective_head');
  recordExpected(pointer.effective_head?.predecessor, 'predecessor');
  recordExpected(pointer.effective_head?.foreign_audit, 'foreign_audit');

  const trees = [];
  const treeError = (root, error) => trees.push({
    root,
    typed_tree_sha256: null,
    entry_count: null,
    directory_count: null,
    file_count: null,
    other_count: null,
    expected: expectedRoots.has(root) ? { source: expectedRoots.get(root).source, sha256: expectedRoots.get(root).sha256 } : null,
    status: 'ERROR',
    error: String(error?.message ?? error),
    drift_vs_seal: null,
    files: [],
  });
  for (const rel of linkAnomalies) {
    treeError(rel, new Error('sealed package path is a symlink or junction, refusing to hash through it'));
  }
  for (const rel of packageRels) {
    const roots = [];
    try {
      roots.push({ root: rel, tree: typedTree(rel) });
    } catch (error) {
      treeError(rel, error);
    }
    const payloadRel = `${rel}/payload`;
    if (fs.existsSync(abs(payloadRel)) && expectedRoots.has(payloadRel)) {
      try {
        roots.push({ root: payloadRel, tree: typedTree(payloadRel) });
      } catch (error) {
        treeError(payloadRel, error);
      }
    }
    for (const { root, tree: t } of roots) {
      const expected = expectedRoots.get(root) ?? null;
      const status = expected ? (expected.sha256 === t.typed_tree_sha256 ? 'MATCH' : 'DRIFT') : 'UNPINNED';
      trees.push({
        root,
        typed_tree_sha256: t.typed_tree_sha256,
        entry_count: t.entry_count,
        directory_count: t.directory_count,
        file_count: t.file_count,
        other_count: t.other_count,
        expected: expected ? { source: expected.source, sha256: expected.sha256 } : null,
        status,
        drift_vs_seal: status === 'DRIFT' ? (() => {
          try {
            return driftVsSeal(rel, root, t);
          } catch (error) {
            return { seal: null, note: `drift detail failed: ${String(error?.message ?? error)}` };
          }
        })() : null,
        files: t.entries.filter((e) => e.type === 'file')
          .map(({ path: p, bytes, sha256: h }) => ({ path: p, bytes, sha256: h })),
      });
    }
  }
  // Fail closed on omission: every recorded root the pointer expects MUST have been
  // compared. A package that vanished, was renamed, or stopped being a plain directory
  // otherwise produces no comparison at all — and silence must never read as PASS.
  const computedRoots = new Set(trees.map((t) => t.root));
  for (const [root, exp] of [...expectedRoots.entries()].sort((a, b) => bytewise(a[0], b[0]))) {
    if (!computedRoots.has(root)) {
      trees.push({
        root,
        typed_tree_sha256: null,
        entry_count: null,
        directory_count: null,
        file_count: null,
        other_count: null,
        expected: { source: exp.source, sha256: exp.sha256 },
        status: 'UNVERIFIED',
        error: 'expected root was never computed (package missing, renamed, or not a plain directory)',
        drift_vs_seal: null,
        files: [],
      });
    }
  }
  trees.sort((a, b) => bytewise(a.root, b.root));

  // ---- 4. Watched live files: protected-state paths + explicit watch globs.
  const watchPaths = new Set();
  const watchExtras = [];
  if (fs.existsSync(abs(PROTECTED_STATE_REL))) {
    try {
      const protectedState = JSON.parse(fs.readFileSync(abs(PROTECTED_STATE_REL), 'utf8'));
      for (const entry of protectedState.files ?? []) {
        if (typeof entry?.path === 'string') watchPaths.add(entry.path);
      }
    } catch (error) {
      watchExtras.push({ path: PROTECTED_STATE_REL, status: 'UNREADABLE', bytes: null, sha256: null, error: String(error?.message ?? error) });
    }
  }
  for (const pattern of WATCH_GLOBS) {
    for (const rel of expandGlob(pattern)) watchPaths.add(rel);
  }
  const watch = [...watchPaths].sort(bytewise).map((rel) => {
    try {
      if (!fs.existsSync(abs(rel))) return { path: rel, status: 'ABSENT', bytes: null, sha256: null };
      if (!fs.statSync(abs(rel)).isFile()) return { path: rel, status: 'NOT_A_FILE', bytes: null, sha256: null };
      const bound = bindFile(rel);
      return { path: rel, status: 'PRESENT', bytes: bound.bytes, sha256: bound.sha256 };
    } catch (error) {
      return { path: rel, status: 'ERROR', bytes: null, sha256: null, error: String(error?.message ?? error) };
    }
  }).concat(watchExtras);

  // ---- 5. Assemble the deterministic snapshot body (no timestamps inside).
  const holds = [
    ...pinResults.filter((p) => p.status !== 'MATCH'),
    ...trees.filter((t) => ['DRIFT', 'ERROR', 'UNVERIFIED'].includes(t.status)),
  ];
  const body = {
    schema: 'chain-status-snapshot-v2',
    workspace: '999 footsteps',
    chain: {
      pointer: pointerPin,
      pointer_generation: pointer.pointer_generation,
      head_id: pointer.effective_head?.head_id ?? null,
      head_role: pointer.effective_head?.role ?? null,
      predecessor_id: pointer.effective_head?.predecessor?.head_id ?? null,
      canonical_custody: pointer.canonical_custody ?? null,
      chain_geometry: pointer.chain_geometry ?? null,
    },
    integrity: {
      verdict: holds.length === 0 ? 'PASS' : 'HOLD',
      hold_count: holds.length,
      pin_match_count: pinResults.filter((p) => p.status === 'MATCH').length,
      pin_total: pinResults.length,
      tree_match_count: trees.filter((t) => t.status === 'MATCH').length,
      tree_pinned_total: trees.filter((t) => t.status !== 'UNPINNED').length,
    },
    pins: pinResults,
    trees,
    watch,
  };
  const canonical = JSON.stringify(body);
  const stateDigest = sha256(Buffer.from(canonical, 'utf8'));

  // ---- 6. Compare with previous snapshot and write outputs into the repo.
  const statusDir = path.join(REPO_DIR, 'status');
  const historyDir = path.join(statusDir, 'history');
  fs.mkdirSync(historyDir, { recursive: true });
  const latestPath = path.join(statusDir, 'latest.json');

  let previous = null;
  try {
    if (fs.existsSync(latestPath)) {
      previous = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    }
  } catch {
    previous = null; // corrupt previous snapshot: treat as first run and self-heal
  }
  const changed = !previous || previous.state_digest !== stateDigest;

  const stamp = startedAt.toISOString();
  const snapshot = {
    state_digest: stateDigest,
    scanned_at_utc: stamp,
    scan_seconds: (Date.now() - startedAt.getTime()) / 1000,
    ...body,
  };

  const diff = { since: previous ? previous.scanned_at_utc : null, added: [], removed: [], changed: [] };
  if (previous && changed) {
    const flatten = (snap) => {
      const map = new Map();
      for (const p of snap.pins ?? []) map.set(`pin:${p.path}`, JSON.stringify({ r: p.recorded, l: p.live, s: p.status }));
      for (const t of snap.trees ?? []) map.set(`tree:${t.root}`, JSON.stringify({ h: t.typed_tree_sha256, s: t.status }));
      for (const w of snap.watch ?? []) map.set(`watch:${w.path}`, JSON.stringify({ b: w.bytes, h: w.sha256, s: w.status }));
      map.set('chain:pointer', JSON.stringify(snap.chain?.pointer ?? null));
      map.set('chain:head', JSON.stringify([snap.chain?.head_id, snap.chain?.pointer_generation]));
      return map;
    };
    const before = flatten(previous);
    const after = flatten(snapshot);
    for (const key of [...after.keys()].sort(bytewise)) {
      if (!before.has(key)) diff.added.push({ key, value: JSON.parse(after.get(key)) });
      else if (before.get(key) !== after.get(key)) {
        diff.changed.push({ key, before: JSON.parse(before.get(key)), after: JSON.parse(after.get(key)) });
      }
    }
    for (const key of [...before.keys()].sort(bytewise)) {
      if (!after.has(key)) diff.removed.push({ key, value: JSON.parse(before.get(key)) });
    }
  }

  // Write order matters: latest.json is the change detector, so it goes LAST — if any
  // earlier write dies, the next run still sees the old digest and re-emits the change
  // records instead of permanently swallowing them.
  if (changed) {
    const historyName = `${stamp.replaceAll(':', '').replaceAll('-', '').replace(/\.\d+Z$/, 'Z')}.json`;
    writeAtomic(path.join(historyDir, historyName), `${JSON.stringify(snapshot, null, 2)}\n`);
    writeAtomic(path.join(statusDir, 'diff-latest.json'), `${JSON.stringify({
      scanned_at_utc: stamp, state_digest: stateDigest, ...diff,
    }, null, 2)}\n`);

    const changesPath = path.join(REPO_DIR, 'CHANGES.md');
    const header = '# Chain status change log\n\nNewest first. Each entry is one state change observed by scan-chain-v1.\n';
    const existing = fs.existsSync(changesPath)
      ? fs.readFileSync(changesPath, 'utf8').replace(header, '')
      : '';
    const lines = [`\n## ${stamp} — digest \`${stateDigest.slice(0, 16)}…\` — integrity ${body.integrity.verdict}\n`];
    if (!previous) {
      lines.push(`- Baseline snapshot: ${body.pins.length} pins verified, ${body.trees.length} trees computed, ${body.watch.length} watched files.\n`);
    } else {
      for (const c of diff.changed) lines.push(`- CHANGED ${c.key}\n`);
      for (const a of diff.added) lines.push(`- ADDED ${a.key}\n`);
      for (const r of diff.removed) lines.push(`- REMOVED ${r.key}\n`);
    }
    for (const h of holds) {
      lines.push(`- **HOLD** ${h.path ?? h.root}: ${h.status}\n`);
    }
    writeAtomic(changesPath, header + lines.join('') + existing);
  }

  writeAtomic(path.join(statusDir, 'heartbeat.json'), `${JSON.stringify({
    scanned_at_utc: stamp,
    state_digest: stateDigest,
    changed,
    integrity_verdict: body.integrity.verdict,
  }, null, 2)}\n`);
  writeAtomic(latestPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  const summary = {
    changed,
    state_digest: stateDigest,
    integrity: body.integrity,
    holds: holds.map((h) => ({ path: h.path ?? h.root, status: h.status })),
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (body.integrity.verdict === 'HOLD') process.exit(2);
  process.exit(changed ? 3 : 0);
}

try {
  main();
} catch (error) {
  // Fail closed: even a crashed scan publishes an ERROR heartbeat, so the remote agent
  // can tell "scanner broke" (verdict ERROR) from "scanner never ran" (stale timestamp).
  try {
    const statusDir = path.join(REPO_DIR, 'status');
    fs.mkdirSync(statusDir, { recursive: true });
    writeAtomic(path.join(statusDir, 'heartbeat.json'), `${JSON.stringify({
      scanned_at_utc: new Date().toISOString(),
      state_digest: null,
      changed: null,
      integrity_verdict: 'ERROR',
      error: String(error?.message ?? error),
    }, null, 2)}\n`);
  } catch {
    // nothing left to do — stderr below is the last signal
  }
  console.error(error);
  process.exit(4);
}
