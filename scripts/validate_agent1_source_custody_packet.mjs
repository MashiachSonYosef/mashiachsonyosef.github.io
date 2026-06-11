#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const packetPath = path.join(repoRoot, 'reports', 'agent1-source-provenance-custody-packet.json');
const quarantineManifestPath = path.join(repoRoot, 'reports', 'agent1-downstream-quarantine-manifest.json');
const custodyBlocklistPath = path.join(repoRoot, 'reports', 'agent1-custody-blocklist.json');
const intakeDocketPath = path.join(repoRoot, 'reports', 'agent1-agent6-custody-intake-docket.json');
const referenceDiagnosticsPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reference-diagnostics.json');
const closureOptionsPath = path.join(repoRoot, 'reports', 'agent1-source-custody-closure-options.json');
const reconciliationPreflightPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reconciliation-preflight.json');
const agent6DecisionPacketPath = path.join(repoRoot, 'reports', 'agent1-agent6-source-custody-decision-packet.json');
const queueRefreshNoticePath = path.join(repoRoot, 'reports', 'agent1-source-custody-queue-refresh-notice.json');
const controlSyncPacketPath = path.join(repoRoot, 'reports', 'agent1-source-custody-control-sync-packet.json');
const queueIntakeCandidatePath = path.join(repoRoot, 'reports', 'agent1-source-custody-queue-intake-candidate.json');

const expectedModifiedTrackedSources = [
  'data/sources/abarbanel-on-guide-for-the-perplexed.json',
  'data/sources/crescas-on-guide-for-the-perplexed.json',
  'data/sources/efodi-on-guide-for-the-perplexed.json',
  'data/sources/narboni-on-guide-for-the-perplexed.json',
  'data/sources/shem-tov-on-guide-for-the-perplexed.json',
  'data/sources/yahel-ohr-on-zohar.json',
];

const expectedControlSurfacePaths = [
  'data/control/agent6_validation_queue.json',
  'data/control/agent_goal_board.json',
  'reports/agent5-agent6-handoff-index.json',
  'reports/agent5-agent6-handoff-index.md',
];

let directRouteHudIndexCache = null;

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileFingerprint(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  const bytes = fs.readFileSync(fullPath);
  return {
    path: relativePath,
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
  });
}

function normalizeHitPath(hit) {
  const normalizedRepoRoot = repoRoot.replace(/\\/g, '/');
  let normalized = String(hit || '').replace(/\\/g, '/');
  if (normalized.startsWith(`${normalizedRepoRoot}/`)) {
    normalized = normalized.slice(normalizedRepoRoot.length + 1);
  }
  return normalized;
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(a, b) {
  const aa = sorted(a);
  const bb = sorted(b);
  return aa.length === bb.length && aa.every((value, index) => value === bb[index]);
}

function diffSet(a, b) {
  const bb = new Set(b);
  return sorted(a).filter((value) => !bb.has(value));
}

function liveUntrackedSources() {
  return git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function liveModifiedTrackedSources() {
  return git(['status', '--short', '--', 'data/sources'])
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => !line.startsWith('?? '))
    .map((line) => line.slice(3).replace(/\\/g, '/'))
    .filter((line) => line.endsWith('.json'));
}

function countLicenseUnits(rows) {
  const counts = {};
  for (const row of rows) {
    for (const [license, count] of Object.entries(row.license_counts || {})) {
      counts[license] = (counts[license] || 0) + Number(count || 0);
    }
  }
  return counts;
}

function routeOrWorkbenchHits(row) {
  const hits = row.content_hits || {};
  return [
    ...(hits.route_cards_or_hud_surfaces || []),
    ...(hits.reader_workbench_artifacts || []),
    ...(hits.translation_memory_paths || []),
  ].length > 0;
}

function directRouteHudIndex(rows) {
  if (directRouteHudIndexCache) return directRouteHudIndexCache;
  const definitionsRoot = path.join(repoRoot, 'data/definitions');
  const needles = [...new Set(rows.flatMap((row) => [row.work_id, row.work_slug]).filter(Boolean))]
    .sort((a, b) => b.length - a.length || a.localeCompare(b));
  directRouteHudIndexCache = new Map(needles.map((needle) => [needle, new Set()]));
  if (!fs.existsSync(definitionsRoot) || !needles.length) return directRouteHudIndexCache;

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent1-custody-validator-'));
  const needleFile = path.join(tempDir, 'needles.txt');
  let output = '';
  try {
    fs.writeFileSync(needleFile, `${needles.join('\n')}\n`, 'utf8');
    output = execFileSync('rg', [
      '-l',
      '--fixed-strings',
      '-f',
      needleFile,
      'data/definitions',
      '--glob',
      '!data/definitions/hud-route-lookup/shards/**',
    ], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 120_000,
      maxBuffer: 1024 * 1024 * 20,
    });
  } catch (error) {
    if (error.status !== 1) throw error;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const hit = normalizeHitPath(line);
    let text = '';
    try {
      text = fs.readFileSync(path.join(repoRoot, hit), 'utf8');
    } catch {
      continue;
    }
    for (const needle of needles) {
      if (text.includes(needle)) directRouteHudIndexCache.get(needle).add(hit);
    }
  }
  return directRouteHudIndexCache;
}

function directRouteHudHits(row, rows) {
  const hits = new Set();
  const index = directRouteHudIndex(rows);
  for (const needle of [row.work_id, row.work_slug].filter(Boolean)) {
    for (const hit of index.get(needle) || []) hits.add(hit);
  }
  return [...hits].sort((a, b) => a.localeCompare(b));
}

function sourcePaths(rows) {
  return rows.map((row) => row.source_path);
}

function assertBoundary(packet) {
  const boundary = packet.boundary || {};
  const forbiddenTrueFlags = [
    'source_provenance_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'page_render_acceptance_claimed',
  ];
  for (const key of forbiddenTrueFlags) {
    if (boundary[key] !== false) {
      fail(`Packet boundary flag must be false: ${key}`, { actual: boundary[key] });
    }
  }
  if (boundary.publication_state !== 'blocked_no_render') {
    fail('Packet must keep publication_state blocked_no_render', {
      actual: boundary.publication_state,
    });
  }
}

function assertUntrackedRows(packet, liveUntracked) {
  const rows = packet.untracked_dispositions || [];
  const packetFiles = rows.map((row) => row.source_path);
  if (!sameSet(packetFiles, liveUntracked)) {
    fail('Packet untracked source rows do not match live git discovery', {
      missing_from_packet: diffSet(liveUntracked, packetFiles),
      stale_in_packet: diffSet(packetFiles, liveUntracked),
    });
  }
  for (const row of rows) {
    if (row.disposition !== 'quarantine') {
      fail('Untracked source row is not quarantined', {
        source_path: row.source_path,
        disposition: row.disposition,
      });
    }
    if (!row.work_id || !row.work_slug) {
      fail('Untracked source row lacks work id/slug', { source_path: row.source_path });
    }
    const fingerprint = fileFingerprint(row.source_path);
    if (row.source_fingerprint?.sha256 !== fingerprint.sha256 || row.source_fingerprint?.bytes !== fingerprint.bytes) {
      fail('Untracked source row fingerprint does not match live file', {
        source_path: row.source_path,
        expected: fingerprint,
        actual: row.source_fingerprint,
      });
    }
    if (!row.direct_artifacts?.overlay_json?.exists) {
      fail('Untracked source row lacks overlay JSON evidence', { source_path: row.source_path });
    }
    if (!row.direct_artifacts?.public_page?.exists) {
      fail('Untracked source row lacks public page evidence', { source_path: row.source_path });
    }
  }
}

function assertModifiedRows(packet, liveModified) {
  const rows = packet.modified_tracked_drift || [];
  const packetFiles = rows.map((row) => row.source_path);
  if (!sameSet(packetFiles, expectedModifiedTrackedSources)) {
    fail('Packet modified tracked rows do not match expected six-source docket', {
      missing_from_packet: diffSet(expectedModifiedTrackedSources, packetFiles),
      extra_in_packet: diffSet(packetFiles, expectedModifiedTrackedSources),
    });
  }
  if (!sameSet(liveModified, expectedModifiedTrackedSources)) {
    fail('Live modified tracked source set does not match expected six-source docket', {
      missing_live: diffSet(expectedModifiedTrackedSources, liveModified),
      extra_live: diffSet(liveModified, expectedModifiedTrackedSources),
    });
  }
  for (const row of rows) {
    if (row.disposition !== 'modified_tracked_drift_blocked_until_Agent6_review') {
      fail('Modified tracked source row has wrong disposition', {
        source_path: row.source_path,
        disposition: row.disposition,
      });
    }
    if (row.all_diffs_are_license_pd_to_public_domain !== true) {
      fail('Modified tracked source drift is not limited to PD -> Public Domain labels', {
        source_path: row.source_path,
      });
    }
    if (row.units_current !== row.units_head) {
      fail('Modified tracked source unit counts changed', {
        source_path: row.source_path,
        units_current: row.units_current,
        units_head: row.units_head,
      });
    }
    const fingerprint = fileFingerprint(row.source_path);
    if (row.source_fingerprint?.sha256 !== fingerprint.sha256 || row.source_fingerprint?.bytes !== fingerprint.bytes) {
      fail('Modified tracked source row fingerprint does not match live file', {
        source_path: row.source_path,
        expected: fingerprint,
        actual: row.source_fingerprint,
      });
    }
  }
}

function assertSummary(packet) {
  const summary = packet.summary || {};
  const untrackedRows = packet.untracked_dispositions || [];
  const modifiedRows = packet.modified_tracked_drift || [];
  const count = (rows, predicate) => rows.filter(predicate).length;
  const expected = {
    source_rows: untrackedRows.length + modifiedRows.length,
    source_fingerprinted_rows: count([...untrackedRows, ...modifiedRows], (row) => row.source_fingerprint?.sha256),
    source_fingerprint_algorithm: 'sha256',
    untracked_count: untrackedRows.length,
    untracked_with_public_pages: count(untrackedRows, (row) => row.direct_artifacts?.public_page?.exists),
    untracked_with_overlay_json: count(untrackedRows, (row) => row.direct_artifacts?.overlay_json?.exists),
    untracked_with_lexical_manifest: count(untrackedRows, (row) => row.direct_artifacts?.lexical_manifest?.exists),
    untracked_with_route_or_workbench_hits: count(untrackedRows, routeOrWorkbenchHits),
    untracked_missing_visible_source_license_rows: count(untrackedRows, (row) => row.page_evidence?.visible_source_license_rows !== true),
    untracked_missing_lexical_manifest: count(untrackedRows, (row) => !row.direct_artifacts?.lexical_manifest?.exists),
    modified_tracked_count: modifiedRows.length,
    modified_tracked_all_license_label_only: modifiedRows.every((row) => row.all_diffs_are_license_pd_to_public_domain === true),
    modified_tracked_with_public_pages: count(modifiedRows, (row) => row.direct_artifacts?.public_page?.exists),
    modified_tracked_with_route_or_workbench_hits: count(modifiedRows, routeOrWorkbenchHits),
    modified_tracked_missing_visible_source_license_rows: count(modifiedRows, (row) => row.page_evidence?.visible_source_license_rows !== true),
    modified_tracked_missing_lexical_manifest: count(modifiedRows, (row) => !row.direct_artifacts?.lexical_manifest?.exists),
  };
  for (const [key, value] of Object.entries(expected)) {
    if (summary[key] !== value) {
      fail(`Packet summary mismatch: ${key}`, { expected: value, actual: summary[key] });
    }
  }
}

function assertExceptionSummary(packet) {
  const exceptions = packet.exception_summary || {};
  const untrackedRows = packet.untracked_dispositions || [];
  const modifiedRows = packet.modified_tracked_drift || [];
  const sourceLicense = exceptions.source_license_survivability || {};
  const direct = exceptions.direct_downstream_artifacts || {};
  const content = exceptions.content_reference_reliance || {};

  const checks = [
    {
      key: 'untracked_missing_visible_source_license_rows',
      actual: sourcePaths(sourceLicense.untracked_missing_visible_source_license_rows || []),
      expected: sourcePaths(untrackedRows.filter((row) => row.page_evidence?.visible_source_license_rows !== true)),
    },
    {
      key: 'modified_tracked_missing_visible_source_license_rows',
      actual: sourcePaths(sourceLicense.modified_tracked_missing_visible_source_license_rows || []),
      expected: sourcePaths(modifiedRows.filter((row) => row.page_evidence?.visible_source_license_rows !== true)),
    },
    {
      key: 'untracked_missing_lexical_manifest',
      actual: sourcePaths(direct.untracked_missing_lexical_manifest || []),
      expected: sourcePaths(untrackedRows.filter((row) => !row.direct_artifacts?.lexical_manifest?.exists)),
    },
    {
      key: 'modified_tracked_missing_lexical_manifest',
      actual: sourcePaths(direct.modified_tracked_missing_lexical_manifest || []),
      expected: sourcePaths(modifiedRows.filter((row) => !row.direct_artifacts?.lexical_manifest?.exists)),
    },
    {
      key: 'untracked_route_workbench_or_translation_memory_hits',
      actual: sourcePaths(content.untracked_route_workbench_or_translation_memory_hits || []),
      expected: sourcePaths(untrackedRows.filter(routeOrWorkbenchHits)),
    },
    {
      key: 'modified_tracked_route_workbench_or_translation_memory_hits',
      actual: sourcePaths(content.modified_tracked_route_workbench_or_translation_memory_hits || []),
      expected: sourcePaths(modifiedRows.filter(routeOrWorkbenchHits)),
    },
  ];

  for (const check of checks) {
    if (!sameSet(check.actual, check.expected)) {
      fail(`Packet exception summary mismatch: ${check.key}`, {
        missing_from_exception_summary: diffSet(check.expected, check.actual),
        stale_in_exception_summary: diffSet(check.actual, check.expected),
      });
    }
  }
}

function assertRouteHudDirectProbe(packet) {
  const rows = [
    ...(packet.untracked_dispositions || []),
    ...(packet.modified_tracked_drift || []),
  ];
  for (const row of rows) {
    const actual = row.content_hits?.route_cards_or_hud_surfaces || [];
    const expected = directRouteHudHits(row, rows);
    if (!sameSet(actual, expected)) {
      fail('Packet route/HUD hit set does not match direct data/definitions probe', {
        source_path: row.source_path,
        work_id: row.work_id,
        missing_from_packet: diffSet(expected, actual),
        stale_in_packet: diffSet(actual, expected),
      });
    }
  }
}

function exceptionResult(packet) {
  const exceptions = packet.exception_summary || {};
  const sourceLicense = exceptions.source_license_survivability || {};
  const direct = exceptions.direct_downstream_artifacts || {};
  const content = exceptions.content_reference_reliance || {};
  const untrackedMissingVisible = sourceLicense.untracked_missing_visible_source_license_rows || [];
  const modifiedMissingVisible = sourceLicense.modified_tracked_missing_visible_source_license_rows || [];
  const untrackedMissingManifests = direct.untracked_missing_lexical_manifest || [];
  const modifiedMissingManifests = direct.modified_tracked_missing_lexical_manifest || [];
  const untrackedContentHits = content.untracked_route_workbench_or_translation_memory_hits || [];
  const modifiedContentHits = content.modified_tracked_route_workbench_or_translation_memory_hits || [];
  return {
    untracked_missing_visible_source_license_rows: {
      count: untrackedMissingVisible.length,
      files: sourcePaths(untrackedMissingVisible),
    },
    modified_tracked_missing_visible_source_license_rows: {
      count: modifiedMissingVisible.length,
      files: sourcePaths(modifiedMissingVisible),
    },
    untracked_missing_lexical_manifest: {
      count: untrackedMissingManifests.length,
      files: sourcePaths(untrackedMissingManifests),
    },
    modified_tracked_missing_lexical_manifest: {
      count: modifiedMissingManifests.length,
      files: sourcePaths(modifiedMissingManifests),
    },
    untracked_route_workbench_or_translation_memory_hits: {
      count: untrackedContentHits.length,
      files: sourcePaths(untrackedContentHits),
    },
    modified_tracked_route_workbench_or_translation_memory_hits: {
      count: modifiedContentHits.length,
      files: sourcePaths(modifiedContentHits),
    },
  };
}

function fingerprintResult(packet) {
  const sourceRows = [
    ...(packet.untracked_dispositions || []),
    ...(packet.modified_tracked_drift || []),
  ];
  return {
    fingerprinted_source_rows: sourceRows.filter((row) => row.source_fingerprint?.sha256).length,
    source_rows: sourceRows.length,
    algorithm: 'sha256',
  };
}

function flattenDirectArtifactRows(rows, sourceClass) {
  const out = [];
  for (const row of rows) {
    for (const [artifactKind, artifact] of Object.entries(row.direct_artifacts || {})) {
      if (!artifact?.exists) continue;
      out.push({
        source_class: sourceClass,
        source_path: row.source_path,
        artifact_kind: artifactKind,
        artifact_path: artifact.path,
      });
    }
  }
  return out;
}

function flattenMissingLexicalManifestRows(rows, sourceClass) {
  return rows
    .filter((row) => !row.direct_artifacts?.lexical_manifest?.exists)
    .map((row) => ({
      source_class: sourceClass,
      source_path: row.source_path,
      expected_artifact_path: row.direct_artifacts?.lexical_manifest?.path || `data/lexical/${row.work_id}.manifest.json`,
    }));
}

function flattenContentReferenceRows(rows, sourceClass) {
  const out = [];
  const buckets = [
    'route_cards_or_hud_surfaces',
    'reader_workbench_artifacts',
    'translation_memory_paths',
    'public_lexical_exports',
  ];
  for (const row of rows) {
    for (const bucket of buckets) {
      for (const hit of row.content_hits?.[bucket] || []) {
        out.push({
          source_class: sourceClass,
          source_path: row.source_path,
          reference_kind: bucket,
          reference_path: hit,
        });
      }
    }
  }
  return out;
}

function rowKey(row, keys) {
  return keys.map((key) => row[key]).join('\u0000');
}

function assertRowSet(label, actualRows, expectedRows, keys) {
  const actual = actualRows.map((row) => rowKey(row, keys));
  const expected = expectedRows.map((row) => rowKey(row, keys));
  if (!sameSet(actual, expected)) {
    fail(`Quarantine manifest mismatch: ${label}`, {
      missing_from_manifest: diffSet(expected, actual),
      stale_in_manifest: diffSet(actual, expected),
    });
  }
}

function assertQuarantineManifest(packet) {
  if (!fs.existsSync(quarantineManifestPath)) {
    fail(`Missing downstream quarantine manifest: ${path.relative(repoRoot, quarantineManifestPath)}`);
  }
  const manifest = readJson(quarantineManifestPath);
  const untrackedRows = packet.untracked_dispositions || [];
  const modifiedRows = packet.modified_tracked_drift || [];
  const expectedDirect = [
    ...flattenDirectArtifactRows(untrackedRows, 'untracked'),
    ...flattenDirectArtifactRows(modifiedRows, 'modified_tracked'),
  ];
  const expectedMissingManifests = [
    ...flattenMissingLexicalManifestRows(untrackedRows, 'untracked'),
    ...flattenMissingLexicalManifestRows(modifiedRows, 'modified_tracked'),
  ];
  const expectedContent = [
    ...flattenContentReferenceRows(untrackedRows, 'untracked'),
    ...flattenContentReferenceRows(modifiedRows, 'modified_tracked'),
  ];

  if (manifest.boundary?.publication_state !== 'blocked_no_render') {
    fail('Quarantine manifest must keep publication_state blocked_no_render', {
      actual: manifest.boundary?.publication_state,
    });
  }
  assertRowSet(
    'direct_artifacts',
    manifest.direct_artifacts || [],
    expectedDirect,
    ['source_class', 'source_path', 'artifact_kind', 'artifact_path'],
  );
  assertRowSet(
    'missing_lexical_manifests',
    manifest.missing_lexical_manifests || [],
    expectedMissingManifests,
    ['source_class', 'source_path', 'expected_artifact_path'],
  );
  assertRowSet(
    'content_references',
    manifest.content_references || [],
    expectedContent,
    ['source_class', 'source_path', 'reference_kind', 'reference_path'],
  );
  const expectedSummary = {
    source_rows: untrackedRows.length + modifiedRows.length,
    untracked_source_rows: untrackedRows.length,
    modified_tracked_source_rows: modifiedRows.length,
    direct_artifact_rows: expectedDirect.length,
    missing_lexical_manifest_rows: expectedMissingManifests.length,
    content_reference_rows: expectedContent.length,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    if (manifest.summary?.[key] !== expected) {
      fail(`Quarantine manifest summary mismatch: ${key}`, {
        expected,
        actual: manifest.summary?.[key],
      });
    }
  }
  return {
    path: path.relative(repoRoot, quarantineManifestPath).replace(/\\/g, '/'),
    summary: manifest.summary,
    manifest,
  };
}

function assertCustodyBlocklist(packet, quarantineManifestResult) {
  if (!fs.existsSync(custodyBlocklistPath)) {
    fail(`Missing custody blocklist: ${path.relative(repoRoot, custodyBlocklistPath)}`);
  }
  const blocklist = readJson(custodyBlocklistPath);
  const manifest = quarantineManifestResult.manifest;
  const sourceRows = [
    ...(packet.untracked_dispositions || []).map((row) => ({
      source_class: 'untracked',
      source_path: row.source_path,
    })),
    ...(packet.modified_tracked_drift || []).map((row) => ({
      source_class: 'modified_tracked',
      source_path: row.source_path,
    })),
  ];
  if (blocklist.boundary?.publication_state !== 'blocked_no_render') {
    fail('Custody blocklist must keep publication_state blocked_no_render', {
      actual: blocklist.boundary?.publication_state,
    });
  }
  assertRowSet(
    'custody_blocklist.blocked_sources',
    blocklist.blocked_sources || [],
    sourceRows,
    ['source_class', 'source_path'],
  );
  assertRowSet(
    'custody_blocklist.blocked_direct_artifacts',
    blocklist.blocked_direct_artifacts || [],
    manifest.direct_artifacts || [],
    ['source_class', 'source_path', 'artifact_kind', 'artifact_path'],
  );
  assertRowSet(
    'custody_blocklist.blocked_content_references',
    blocklist.blocked_content_references || [],
    manifest.content_references || [],
    ['source_class', 'source_path', 'reference_kind', 'reference_path'],
  );
  assertRowSet(
    'custody_blocklist.missing_required_artifacts',
    blocklist.missing_required_artifacts || [],
    manifest.missing_lexical_manifests || [],
    ['source_class', 'source_path', 'expected_artifact_path'],
  );
  const expectedSummary = {
    blocked_source_rows: sourceRows.length,
    blocked_direct_artifact_paths: (manifest.direct_artifacts || []).length,
    blocked_content_reference_paths: (manifest.content_references || []).length,
    missing_required_artifacts: (manifest.missing_lexical_manifests || []).length,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    if (blocklist.summary?.[key] !== expected) {
      fail(`Custody blocklist summary mismatch: ${key}`, {
        expected,
        actual: blocklist.summary?.[key],
      });
    }
  }
  return {
    path: path.relative(repoRoot, custodyBlocklistPath).replace(/\\/g, '/'),
    summary: blocklist.summary,
  };
}

function flattenBucketRows(rows, bucket) {
  return rows.flatMap((row) => (row.content_hits?.[bucket] || []).map((hitPath) => ({
    source_path: row.source_path,
    work_id: row.work_id,
    hit_path: hitPath,
  })));
}

function assertReferenceDiagnostics(packet, quarantineManifestResult) {
  if (!fs.existsSync(referenceDiagnosticsPath)) {
    fail(`Missing source custody reference diagnostics: ${path.relative(repoRoot, referenceDiagnosticsPath)}`);
  }
  const diagnostics = readJson(referenceDiagnosticsPath);
  assertBoundary(diagnostics);

  const rows = [
    ...(packet.untracked_dispositions || []),
    ...(packet.modified_tracked_drift || []),
  ];
  const buckets = [
    'route_cards_or_hud_surfaces',
    'reader_workbench_artifacts',
    'translation_memory_paths',
    'public_lexical_exports',
    'reports_or_audit_artifacts',
  ];
  const blockingBuckets = new Set([
    'route_cards_or_hud_surfaces',
    'reader_workbench_artifacts',
    'translation_memory_paths',
    'public_lexical_exports',
  ]);

  if (diagnostics.source_packet !== 'reports/agent1-source-provenance-custody-packet.json') {
    fail('Reference diagnostics source packet mismatch', {
      expected: 'reports/agent1-source-provenance-custody-packet.json',
      actual: diagnostics.source_packet,
    });
  }
  if (diagnostics.summary?.source_rows !== rows.length) {
    fail('Reference diagnostics source row count mismatch', {
      expected: rows.length,
      actual: diagnostics.summary?.source_rows,
    });
  }

  let expectedBlockingRows = 0;
  let expectedReportRows = 0;
  for (const bucket of buckets) {
    const expectedRows = flattenBucketRows(rows, bucket);
    const expectedUniquePaths = sorted(new Set(expectedRows.map((row) => row.hit_path)));
    const actual = diagnostics.bucket_counts?.[bucket];
    if (!actual) {
      fail('Reference diagnostics missing bucket', { bucket });
    }
    if (actual.row_hit_count !== expectedRows.length) {
      fail(`Reference diagnostics row-hit count mismatch: ${bucket}`, {
        expected: expectedRows.length,
        actual: actual.row_hit_count,
      });
    }
    if (actual.unique_path_count !== expectedUniquePaths.length) {
      fail(`Reference diagnostics unique-path count mismatch: ${bucket}`, {
        expected: expectedUniquePaths.length,
        actual: actual.unique_path_count,
      });
    }
    if (!sameSet(actual.unique_paths || [], expectedUniquePaths)) {
      fail(`Reference diagnostics unique-path set mismatch: ${bucket}`, {
        missing_from_diagnostics: diffSet(expectedUniquePaths, actual.unique_paths || []),
        stale_in_diagnostics: diffSet(actual.unique_paths || [], expectedUniquePaths),
      });
    }
    const expectedBlockingFlag = blockingBuckets.has(bucket);
    if (actual.counts_as_blocking_content_reference !== expectedBlockingFlag) {
      fail(`Reference diagnostics blocking flag mismatch: ${bucket}`, {
        expected: expectedBlockingFlag,
        actual: actual.counts_as_blocking_content_reference,
      });
    }
    if (expectedBlockingFlag) {
      expectedBlockingRows += expectedRows.length;
    } else if (bucket === 'reports_or_audit_artifacts') {
      expectedReportRows += expectedRows.length;
    }
  }

  if (diagnostics.summary?.blocking_content_reference_rows !== expectedBlockingRows) {
    fail('Reference diagnostics blocking content-reference row count mismatch', {
      expected: expectedBlockingRows,
      actual: diagnostics.summary?.blocking_content_reference_rows,
    });
  }
  if (diagnostics.summary?.report_or_audit_reference_rows !== expectedReportRows) {
    fail('Reference diagnostics report/audit row count mismatch', {
      expected: expectedReportRows,
      actual: diagnostics.summary?.report_or_audit_reference_rows,
    });
  }
  if (quarantineManifestResult.summary?.content_reference_rows !== expectedBlockingRows) {
    fail('Reference diagnostics blocking rows do not match quarantine manifest content references', {
      expected: quarantineManifestResult.summary?.content_reference_rows,
      actual: expectedBlockingRows,
    });
  }

  const mustNotBeAccepted = new Set(diagnostics.must_not_be_accepted || []);
  for (const item of packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Reference diagnostics missing must-not-accept item', { item });
    }
  }

  return {
    path: path.relative(repoRoot, referenceDiagnosticsPath).replace(/\\/g, '/'),
    summary: diagnostics.summary,
  };
}

function assertIntakeDocket(packet, quarantineManifest) {
  if (!fs.existsSync(intakeDocketPath)) {
    fail(`Missing Agent 6 intake docket: ${path.relative(repoRoot, intakeDocketPath)}`);
  }
  const docket = readJson(intakeDocketPath);
  if (docket.boundary?.publication_state !== 'blocked_no_render') {
    fail('Intake docket must keep publication_state blocked_no_render', {
      actual: docket.boundary?.publication_state,
    });
  }
  const forbiddenTrueFlags = [
    'source_provenance_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'page_render_acceptance_claimed',
  ];
  for (const key of forbiddenTrueFlags) {
    if (docket.boundary?.[key] !== false) {
      fail(`Intake docket boundary flag must be false: ${key}`, {
        actual: docket.boundary?.[key],
      });
    }
  }
  const expectedEvidenceArtifacts = {
    custody_packet_json: 'reports/agent1-source-provenance-custody-packet.json',
    custody_packet_markdown: 'reports/agent1-source-provenance-custody-packet.md',
    downstream_quarantine_manifest_json: 'reports/agent1-downstream-quarantine-manifest.json',
    downstream_quarantine_manifest_markdown: 'reports/agent1-downstream-quarantine-manifest.md',
    custody_blocklist_json: 'reports/agent1-custody-blocklist.json',
    custody_blocklist_markdown: 'reports/agent1-custody-blocklist.md',
    custody_reference_diagnostics_json: 'reports/agent1-source-custody-reference-diagnostics.json',
    custody_reference_diagnostics_markdown: 'reports/agent1-source-custody-reference-diagnostics.md',
    custody_closure_options_json: 'reports/agent1-source-custody-closure-options.json',
    custody_closure_options_markdown: 'reports/agent1-source-custody-closure-options.md',
    custody_reconciliation_preflight_json: 'reports/agent1-source-custody-reconciliation-preflight.json',
    custody_reconciliation_preflight_markdown: 'reports/agent1-source-custody-reconciliation-preflight.md',
    agent6_source_custody_decision_packet_json: 'reports/agent1-agent6-source-custody-decision-packet.json',
    agent6_source_custody_decision_packet_markdown: 'reports/agent1-agent6-source-custody-decision-packet.md',
    custody_queue_refresh_notice_json: 'reports/agent1-source-custody-queue-refresh-notice.json',
    custody_queue_refresh_notice_markdown: 'reports/agent1-source-custody-queue-refresh-notice.md',
    custody_control_sync_packet_json: 'reports/agent1-source-custody-control-sync-packet.json',
    custody_control_sync_packet_markdown: 'reports/agent1-source-custody-control-sync-packet.md',
    custody_queue_intake_candidate_json: 'reports/agent1-source-custody-queue-intake-candidate.json',
    custody_queue_intake_candidate_markdown: 'reports/agent1-source-custody-queue-intake-candidate.md',
    validator_result: 'reports/agent1-source-provenance-custody-validator-result.json',
    live_untracked_source_list: 'reports/untracked-source-files-direct.txt',
    untracked_source_audit_json: 'reports/untracked-source-scope-audit.json',
    untracked_source_audit_markdown: 'reports/untracked-source-scope-audit.md',
    agent1_state: 'reports/agent1-state.md',
    packet_builder: 'scripts/build_agent1_source_custody_packet.mjs',
    reference_diagnostics_builder: 'scripts/build_agent1_source_custody_reference_diagnostics.mjs',
    closure_options_builder: 'scripts/build_agent1_source_custody_closure_options.mjs',
    reconciliation_preflight_builder: 'scripts/build_agent1_source_custody_reconciliation_preflight.mjs',
    agent6_decision_packet_builder: 'scripts/build_agent1_agent6_source_custody_decision_packet.mjs',
    queue_refresh_notice_builder: 'scripts/build_agent1_source_custody_queue_refresh_notice.mjs',
    control_sync_packet_builder: 'scripts/build_agent1_source_custody_control_sync_packet.mjs',
    queue_intake_candidate_builder: 'scripts/build_agent1_source_custody_queue_intake_candidate.mjs',
    packet_validator: 'scripts/validate_agent1_source_custody_packet.mjs',
    refresh_driver: 'scripts/refresh_agent1_source_custody_evidence.mjs',
  };
  for (const [key, expected] of Object.entries(expectedEvidenceArtifacts)) {
    const actual = docket.evidence_artifacts?.[key];
    if (actual !== expected) {
      fail(`Intake docket evidence artifact mismatch: ${key}`, { expected, actual });
    }
    if (!fs.existsSync(path.join(repoRoot, expected))) {
      fail(`Intake docket evidence artifact is missing on disk: ${key}`, { expected });
    }
  }
  const expectedPacketClaims = {
    source_rows: packet.summary.source_rows,
    source_fingerprinted_rows: packet.summary.source_fingerprinted_rows,
    source_fingerprint_algorithm: packet.summary.source_fingerprint_algorithm,
    untracked_quarantined_sources: packet.summary.untracked_count,
    modified_tracked_sources_blocked_for_review: packet.summary.modified_tracked_count,
    modified_tracked_all_license_label_only: packet.summary.modified_tracked_all_license_label_only,
    visible_source_license_row_gaps: packet.summary.untracked_missing_visible_source_license_rows
      + packet.summary.modified_tracked_missing_visible_source_license_rows,
    missing_lexical_manifest_gaps: packet.summary.untracked_missing_lexical_manifest
      + packet.summary.modified_tracked_missing_lexical_manifest,
    untracked_with_downstream_reliance: packet.summary.untracked_with_route_or_workbench_hits,
    modified_tracked_with_downstream_reliance: packet.summary.modified_tracked_with_route_or_workbench_hits,
  };
  for (const [key, expected] of Object.entries(expectedPacketClaims)) {
    if (docket.packet_claims?.[key] !== expected) {
      fail(`Intake docket packet claim mismatch: ${key}`, {
        expected,
        actual: docket.packet_claims?.[key],
      });
    }
  }
  const expectedLiveScope = {
    untracked_source_files: packet.calibration.direct_untracked_source_count,
    modified_tracked_source_files: packet.calibration.modified_tracked_source_count,
  };
  for (const [key, expected] of Object.entries(expectedLiveScope)) {
    if (docket.live_scope?.[key] !== expected) {
      fail(`Intake docket live scope mismatch: ${key}`, {
        expected,
        actual: docket.live_scope?.[key],
      });
    }
  }
  for (const [license, expected] of Object.entries(countLicenseUnits(packet.untracked_dispositions || []))) {
    if (docket.live_scope?.untracked_license_unit_counts?.[license] !== expected) {
      fail(`Intake docket license unit count mismatch: ${license}`, {
        expected,
        actual: docket.live_scope?.untracked_license_unit_counts?.[license],
      });
    }
  }
  const manifestSummary = quarantineManifest.summary || {};
  for (const [key, expected] of Object.entries(manifestSummary)) {
    const actual = docket.downstream_quarantine_manifest?.[key];
    if (typeof expected === 'object' && expected !== null) {
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        fail(`Intake docket manifest summary mismatch: ${key}`, { expected, actual });
      }
    } else if (actual !== expected) {
      fail(`Intake docket manifest summary mismatch: ${key}`, { expected, actual });
    }
  }
  const mustNotBeAccepted = new Set(docket.must_not_be_accepted || []);
  for (const item of packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Intake docket missing must-not-accept item', { item });
    }
  }
  return {
    path: path.relative(repoRoot, intakeDocketPath).replace(/\\/g, '/'),
    requested_review: docket.requested_review,
    packet_claims: docket.packet_claims,
  };
}

function assertClosureOptions(packet) {
  if (!fs.existsSync(closureOptionsPath)) {
    fail(`Missing custody closure options packet: ${path.relative(repoRoot, closureOptionsPath)}`);
  }
  const closure = readJson(closureOptionsPath);
  assertBoundary(closure);

  const untrackedRows = packet.untracked_dispositions || [];
  const modifiedRows = packet.modified_tracked_drift || [];
  const untrackedOptions = closure.untracked_closure_options || [];
  const modifiedOptions = closure.modified_tracked_closure_options || [];

  assertRowSet(
    'closure_options.untracked_closure_options',
    untrackedOptions,
    untrackedRows.map((row) => ({ source_path: row.source_path })),
    ['source_path'],
  );
  assertRowSet(
    'closure_options.modified_tracked_closure_options',
    modifiedOptions,
    modifiedRows.map((row) => ({ source_path: row.source_path })),
    ['source_path'],
  );

  const bySource = new Map(untrackedRows.map((row) => [row.source_path, row]));
  for (const option of untrackedOptions) {
    const packetRow = bySource.get(option.source_path);
    const hasManifest = packetRow?.direct_artifacts?.lexical_manifest?.exists === true;
    const expectedBucket = hasManifest
      ? 'track_candidate_requires_agent6_source_review'
      : 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion';
    if (option.closure_bucket !== expectedBucket) {
      fail('Closure option untracked bucket mismatch', {
        source_path: option.source_path,
        expected: expectedBucket,
        actual: option.closure_bucket,
      });
    }
  }

  const modifiedBySource = new Map(modifiedRows.map((row) => [row.source_path, row]));
  for (const option of modifiedOptions) {
    const packetRow = modifiedBySource.get(option.source_path);
    const expectedBucket = packetRow?.all_diffs_are_license_pd_to_public_domain
      ? 'license_label_normalization_review_required'
      : 'non_license_drift_review_required';
    if (option.closure_bucket !== expectedBucket) {
      fail('Closure option modified bucket mismatch', {
        source_path: option.source_path,
        expected: expectedBucket,
        actual: option.closure_bucket,
      });
    }
  }

  const expectedSummary = {
    untracked_source_rows: untrackedRows.length,
    untracked_track_candidates_with_lexical_manifest: untrackedRows.filter((row) => row.direct_artifacts?.lexical_manifest?.exists).length,
    untracked_requires_missing_lexical_manifest_remediation: untrackedRows.filter((row) => !row.direct_artifacts?.lexical_manifest?.exists).length,
    modified_tracked_source_rows: modifiedRows.length,
    modified_tracked_license_label_only_rows: modifiedRows.filter((row) => row.all_diffs_are_license_pd_to_public_domain === true).length,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    if (closure.summary?.[key] !== expected) {
      fail(`Closure options summary mismatch: ${key}`, {
        expected,
        actual: closure.summary?.[key],
      });
    }
  }

  const batches = closure.reconciliation_batches || {};
  const trackCandidates = untrackedOptions.filter((row) => row.closure_bucket === 'track_candidate_requires_agent6_source_review');
  const missingManifest = untrackedOptions.filter((row) => row.closure_bucket === 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion');
  const modifiedLabelOnly = modifiedOptions.filter((row) => row.closure_bucket === 'license_label_normalization_review_required');
  const batchChecks = [
    {
      key: 'untracked_track_candidate_source_files',
      batch: batches.untracked_track_candidate_source_files || {},
      rows: trackCandidates,
    },
    {
      key: 'untracked_missing_lexical_manifest_source_files',
      batch: batches.untracked_missing_lexical_manifest_source_files || {},
      rows: missingManifest,
    },
    {
      key: 'modified_tracked_license_label_normalization_files',
      batch: batches.modified_tracked_license_label_normalization_files || {},
      rows: modifiedLabelOnly,
    },
  ];
  for (const check of batchChecks) {
    const expectedSourcePaths = check.rows.map((row) => row.source_path);
    if (check.batch.count !== expectedSourcePaths.length) {
      fail(`Closure options batch count mismatch: ${check.key}`, {
        expected: expectedSourcePaths.length,
        actual: check.batch.count,
      });
    }
    if (!sameSet(check.batch.source_paths || [], expectedSourcePaths)) {
      fail(`Closure options batch source path mismatch: ${check.key}`, {
        missing_from_batch: diffSet(expectedSourcePaths, check.batch.source_paths || []),
        stale_in_batch: diffSet(check.batch.source_paths || [], expectedSourcePaths),
      });
    }
  }
  const expectedMissingManifestPaths = missingManifest.flatMap((row) => row.required_missing_artifact_paths || []);
  const actualMissingManifestPaths = batches.untracked_missing_lexical_manifest_source_files?.expected_lexical_manifest_paths || [];
  if (!sameSet(actualMissingManifestPaths, expectedMissingManifestPaths)) {
    fail('Closure options missing lexical manifest path mismatch', {
      missing_from_batch: diffSet(expectedMissingManifestPaths, actualMissingManifestPaths),
      stale_in_batch: diffSet(actualMissingManifestPaths, expectedMissingManifestPaths),
    });
  }

  const mustNotBeAccepted = new Set(closure.must_not_be_accepted || []);
  for (const item of packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Closure options missing must-not-accept item', { item });
    }
  }

  return {
    path: path.relative(repoRoot, closureOptionsPath).replace(/\\/g, '/'),
    summary: closure.summary,
    closure,
  };
}

function preflightPathSet(bucket) {
  return (bucket?.paths || []).map((row) => row.path);
}

function assertReconciliationPreflight(closureResult) {
  if (!fs.existsSync(reconciliationPreflightPath)) {
    fail(`Missing reconciliation preflight packet: ${path.relative(repoRoot, reconciliationPreflightPath)}`);
  }
  const preflight = readJson(reconciliationPreflightPath);
  assertBoundary(preflight);

  const closure = closureResult.closure;
  const batches = closure.reconciliation_batches || {};
  const dryRun = preflight.dry_run_buckets || {};
  const expectedTrackSources = batches.untracked_track_candidate_source_files?.source_paths || [];
  const expectedMissingManifestSources = batches.untracked_missing_lexical_manifest_source_files?.source_paths || [];
  const expectedMissingManifestPaths = batches.untracked_missing_lexical_manifest_source_files?.expected_lexical_manifest_paths || [];
  const expectedModifiedSources = batches.modified_tracked_license_label_normalization_files?.source_paths || [];

  const checks = [
    {
      label: 'track_candidate_source_files_only',
      actual: preflightPathSet(dryRun.track_candidate_source_files_only),
      expected: expectedTrackSources,
    },
    {
      label: 'missing_manifest_source_files',
      actual: preflightPathSet(dryRun.missing_manifest_source_files),
      expected: expectedMissingManifestSources,
    },
    {
      label: 'missing_manifest_expected_paths',
      actual: preflightPathSet(dryRun.missing_manifest_expected_paths),
      expected: expectedMissingManifestPaths,
    },
    {
      label: 'modified_tracked_license_label_sources',
      actual: preflightPathSet(dryRun.modified_tracked_license_label_sources),
      expected: expectedModifiedSources,
    },
  ];
  for (const check of checks) {
    if (!sameSet(check.actual, check.expected)) {
      fail(`Reconciliation preflight path mismatch: ${check.label}`, {
        missing_from_preflight: diffSet(check.expected, check.actual),
        stale_in_preflight: diffSet(check.actual, check.expected),
      });
    }
  }

  const expectedSummary = {
    track_candidate_source_files: expectedTrackSources.length,
    track_candidate_downstream_direct_paths: (batches.untracked_track_candidate_source_files?.downstream_direct_artifact_paths || []).length,
    missing_manifest_source_files: expectedMissingManifestSources.length,
    missing_manifest_expected_paths: expectedMissingManifestPaths.length,
    missing_manifest_downstream_direct_paths: (batches.untracked_missing_lexical_manifest_source_files?.downstream_direct_artifact_paths || []).length,
    modified_tracked_source_files: expectedModifiedSources.length,
    modified_tracked_downstream_direct_paths: (batches.modified_tracked_license_label_normalization_files?.downstream_direct_artifact_paths || []).length,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    if (preflight.summary?.[key] !== expected) {
      fail(`Reconciliation preflight summary mismatch: ${key}`, {
        expected,
        actual: preflight.summary?.[key],
      });
    }
  }

  const mustNotBeAccepted = new Set(preflight.must_not_be_accepted || []);
  for (const item of closure.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Reconciliation preflight missing must-not-accept item', { item });
    }
  }

  return {
    path: path.relative(repoRoot, reconciliationPreflightPath).replace(/\\/g, '/'),
    summary: preflight.summary,
    preflight,
  };
}

function assertAgent6DecisionPacket(packet, quarantineManifestResult, closureResult, preflightResult) {
  if (!fs.existsSync(agent6DecisionPacketPath)) {
    fail(`Missing Agent 6 decision packet: ${path.relative(repoRoot, agent6DecisionPacketPath)}`);
  }
  const decision = readJson(agent6DecisionPacketPath);
  assertBoundary(decision);

  const closure = closureResult.closure;
  const preflight = preflightResult.preflight;
  const expectedTrackSources = preflightPathSet(preflight.dry_run_buckets?.track_candidate_source_files_only);
  const expectedMissingSources = preflightPathSet(preflight.dry_run_buckets?.missing_manifest_source_files);
  const expectedModifiedSources = preflightPathSet(preflight.dry_run_buckets?.modified_tracked_license_label_sources);
  const actualTrackSources = (decision.track_candidate_source_review || []).map((row) => row.source_path);
  const actualMissingSources = (decision.missing_manifest_review || []).map((row) => row.source_path);
  const actualModifiedSources = (decision.modified_tracked_label_review || []).map((row) => row.source_path);

  const checks = [
    ['track_candidate_source_review', actualTrackSources, expectedTrackSources],
    ['missing_manifest_review', actualMissingSources, expectedMissingSources],
    ['modified_tracked_label_review', actualModifiedSources, expectedModifiedSources],
  ];
  for (const [label, actual, expected] of checks) {
    if (!sameSet(actual, expected)) {
      fail(`Agent 6 decision packet source path mismatch: ${label}`, {
        missing_from_decision_packet: diffSet(expected, actual),
        stale_in_decision_packet: diffSet(actual, expected),
      });
    }
  }

  const expectedSummary = {
    custody_source_rows: packet.summary?.source_rows,
    track_candidate_source_files: expectedTrackSources.length,
    missing_manifest_source_files: expectedMissingSources.length,
    modified_tracked_source_files: expectedModifiedSources.length,
    blocked_downstream_direct_paths: quarantineManifestResult.summary?.direct_artifact_rows,
    blocked_downstream_content_reference_paths: quarantineManifestResult.summary?.content_reference_rows,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    if (decision.summary?.[key] !== expected) {
      fail(`Agent 6 decision packet summary mismatch: ${key}`, {
        expected,
        actual: decision.summary?.[key],
      });
    }
  }

  const expectedMissingManifestPaths = preflightPathSet(preflight.dry_run_buckets?.missing_manifest_expected_paths);
  const actualMissingManifestPaths = (decision.missing_manifest_review || []).flatMap((row) => row.required_missing_artifact_paths || []);
  if (!sameSet(actualMissingManifestPaths, expectedMissingManifestPaths)) {
    fail('Agent 6 decision packet missing-manifest path mismatch', {
      missing_from_decision_packet: diffSet(expectedMissingManifestPaths, actualMissingManifestPaths),
      stale_in_decision_packet: diffSet(actualMissingManifestPaths, expectedMissingManifestPaths),
    });
  }

  const mustNotBeAccepted = new Set(decision.must_not_be_accepted || []);
  for (const item of closure.must_not_be_accepted || packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Agent 6 decision packet missing must-not-accept item', { item });
    }
  }

  return {
    path: path.relative(repoRoot, agent6DecisionPacketPath).replace(/\\/g, '/'),
    summary: decision.summary,
  };
}

function assertQueueRefreshNotice(packet, decisionResult) {
  if (!fs.existsSync(queueRefreshNoticePath)) {
    fail(`Missing source custody queue refresh notice: ${path.relative(repoRoot, queueRefreshNoticePath)}`);
  }
  const notice = readJson(queueRefreshNoticePath);
  assertBoundary(notice);

  const expectedCurrent = {
    packet_generated_at: packet.generated_at,
    validator_ok: true,
    untracked_quarantined_sources: packet.summary?.untracked_count,
    modified_tracked_sources: packet.summary?.modified_tracked_count,
    source_rows: packet.summary?.source_rows,
    source_fingerprinted_rows: packet.summary?.source_fingerprinted_rows,
    missing_lexical_manifests: packet.summary?.untracked_missing_lexical_manifest,
    blocked_downstream_direct_paths: decisionResult.summary?.blocked_downstream_direct_paths,
    blocked_content_reference_rows: decisionResult.summary?.blocked_downstream_content_reference_paths,
  };
  for (const [key, expected] of Object.entries(expectedCurrent)) {
    if (notice.current?.[key] !== expected) {
      fail(`Queue refresh notice current-evidence mismatch: ${key}`, {
        expected,
        actual: notice.current?.[key],
      });
    }
  }
  if (!notice.current?.decision_generated_at) {
    fail('Queue refresh notice lacks decision packet timestamp');
  }
  if (!Number.isInteger(notice.current?.report_or_audit_reference_rows)) {
    fail('Queue refresh notice lacks report/audit reference row count', {
      actual: notice.current?.report_or_audit_reference_rows,
    });
  }
  const surfaces = notice.control_surface_observations || [];
  const expectedMissingCurrentMarker = `missing_current_${expectedCurrent.blocked_content_reference_rows}_content_reference_rows`;
  for (const expectedPath of [
    'data/control/agent6_validation_queue.json',
    'data/control/agent_goal_board.json',
    'reports/agent5-agent6-handoff-index.json',
    'reports/agent5-agent6-handoff-index.md',
  ]) {
    if (!surfaces.some((surface) => surface.path === expectedPath && surface.exists === true)) {
      fail('Queue refresh notice missing control-surface observation', { expectedPath });
    }
  }
  for (const surface of surfaces) {
    for (const marker of surface.stale_markers || []) {
      if (/^missing_current_\d+_content_reference_rows$/.test(marker)
        && marker !== expectedMissingCurrentMarker) {
        fail('Queue refresh notice stale marker references the wrong current content-reference count', {
          path: surface.path,
          expected: expectedMissingCurrentMarker,
          actual: marker,
        });
      }
    }
  }
  const mustNotBeAccepted = new Set(notice.must_not_be_accepted || []);
  for (const item of packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Queue refresh notice missing must-not-accept item', { item });
    }
  }
  return {
    path: path.relative(repoRoot, queueRefreshNoticePath).replace(/\\/g, '/'),
    current: notice.current,
    stale_surface_count: surfaces.filter((surface) => (surface.stale_markers || []).length > 0).length,
  };
}

function assertControlSyncPacket(packet, decisionResult, queueRefreshNoticeResult) {
  if (!fs.existsSync(controlSyncPacketPath)) {
    fail(`Missing source custody control sync packet: ${path.relative(repoRoot, controlSyncPacketPath)}`);
  }
  const syncPacket = readJson(controlSyncPacketPath);
  const decision = readJson(agent6DecisionPacketPath);
  const queueNotice = readJson(queueRefreshNoticePath);
  const referenceDiagnostics = readJson(referenceDiagnosticsPath);
  assertBoundary(syncPacket);

  const expectedCurrent = {
    packet_generated_at: packet.generated_at,
    decision_generated_at: decision.generated_at,
    validator_ok: true,
    untracked_quarantined_sources: packet.summary?.untracked_count,
    modified_tracked_sources: packet.summary?.modified_tracked_count,
    source_rows: packet.summary?.source_rows,
    source_fingerprinted_rows: packet.summary?.source_fingerprinted_rows,
    missing_lexical_manifests: packet.summary?.untracked_missing_lexical_manifest,
    blocked_downstream_direct_paths: decisionResult.summary?.blocked_downstream_direct_paths,
    blocked_content_reference_rows: decisionResult.summary?.blocked_downstream_content_reference_paths,
    route_or_hud_content_reference_rows: referenceDiagnostics.bucket_counts?.route_cards_or_hud_surfaces?.row_hit_count,
    reader_workbench_content_reference_rows: referenceDiagnostics.bucket_counts?.reader_workbench_artifacts?.row_hit_count,
    translation_memory_content_reference_rows: referenceDiagnostics.bucket_counts?.translation_memory_paths?.row_hit_count,
    public_lexical_content_reference_rows: referenceDiagnostics.bucket_counts?.public_lexical_exports?.row_hit_count,
    report_or_audit_reference_rows: queueRefreshNoticeResult.current?.report_or_audit_reference_rows,
  };
  for (const [key, expected] of Object.entries(expectedCurrent)) {
    if (syncPacket.current?.[key] !== expected) {
      fail(`Control sync packet current-evidence mismatch: ${key}`, {
        expected,
        actual: syncPacket.current?.[key],
      });
    }
  }

  const expectedSurfacePaths = expectedControlSurfacePaths;
  const observedSurfacePaths = (syncPacket.observed_control_surfaces || []).map((surface) => surface.path);
  const expectedListedSurfacePaths = (syncPacket.expected_control_surfaces || []).map((surface) => surface.path);
  if (!sameSet(observedSurfacePaths, expectedSurfacePaths)) {
    fail('Control sync packet observed control-surface paths mismatch', {
      missing_from_packet: diffSet(expectedSurfacePaths, observedSurfacePaths),
      stale_in_packet: diffSet(observedSurfacePaths, expectedSurfacePaths),
    });
  }
  if (!sameSet(expectedListedSurfacePaths, expectedSurfacePaths)) {
    fail('Control sync packet expected control-surface paths mismatch', {
      missing_from_packet: diffSet(expectedSurfacePaths, expectedListedSurfacePaths),
      stale_in_packet: diffSet(expectedListedSurfacePaths, expectedSurfacePaths),
    });
  }

  const noticeStaleSurfaces = (queueNotice.control_surface_observations || [])
    .filter((surface) => (surface.stale_markers || []).length > 0)
    .map((surface) => ({
      path: surface.path,
      stale_markers: surface.stale_markers || [],
    }));
  const syncStaleSurfaces = syncPacket.stale_control_surfaces || [];
  if (!sameSet(syncStaleSurfaces.map((surface) => surface.path), noticeStaleSurfaces.map((surface) => surface.path))) {
    fail('Control sync packet stale control-surface paths mismatch', {
      missing_from_packet: diffSet(noticeStaleSurfaces.map((surface) => surface.path), syncStaleSurfaces.map((surface) => surface.path)),
      stale_in_packet: diffSet(syncStaleSurfaces.map((surface) => surface.path), noticeStaleSurfaces.map((surface) => surface.path)),
    });
  }
  for (const noticeSurface of noticeStaleSurfaces) {
    const syncSurface = syncStaleSurfaces.find((surface) => surface.path === noticeSurface.path);
    if (!syncSurface || !sameSet(syncSurface.stale_markers || [], noticeSurface.stale_markers || [])) {
      fail('Control sync packet stale markers mismatch', {
        path: noticeSurface.path,
        expected: noticeSurface.stale_markers,
        actual: syncSurface?.stale_markers,
      });
    }
  }

  const requested = syncPacket.requested_agent5_action || {};
  if (requested.target_packet_generated_at !== packet.generated_at) {
    fail('Control sync packet Agent 5 action targets wrong packet timestamp', {
      expected: packet.generated_at,
      actual: requested.target_packet_generated_at,
    });
  }
  if (requested.target_decision_packet_generated_at !== decision.generated_at) {
    fail('Control sync packet Agent 5 action targets wrong decision timestamp', {
      expected: decision.generated_at,
      actual: requested.target_decision_packet_generated_at,
    });
  }
  if (requested.target_blocked_content_reference_rows !== decisionResult.summary?.blocked_downstream_content_reference_paths) {
    fail('Control sync packet Agent 5 action targets wrong content-reference count', {
      expected: decisionResult.summary?.blocked_downstream_content_reference_paths,
      actual: requested.target_blocked_content_reference_rows,
    });
  }
  if (!sameSet(requested.stale_control_surface_paths || [], noticeStaleSurfaces.map((surface) => surface.path))) {
    fail('Control sync packet Agent 5 action stale-surface path mismatch', {
      missing_from_request: diffSet(noticeStaleSurfaces.map((surface) => surface.path), requested.stale_control_surface_paths || []),
      stale_in_request: diffSet(requested.stale_control_surface_paths || [], noticeStaleSurfaces.map((surface) => surface.path)),
    });
  }

  const mustNotBeAccepted = new Set(syncPacket.must_not_be_accepted || []);
  for (const item of packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Control sync packet missing must-not-accept item', { item });
    }
  }
  return {
    path: path.relative(repoRoot, controlSyncPacketPath).replace(/\\/g, '/'),
    current: syncPacket.current,
    stale_surface_count: syncStaleSurfaces.length,
    requested_agent5_action: requested,
  };
}

function assertQueueIntakeCandidate(packet, decisionResult, controlSyncResult) {
  if (!fs.existsSync(queueIntakeCandidatePath)) {
    fail(`Missing source custody queue intake candidate: ${path.relative(repoRoot, queueIntakeCandidatePath)}`);
  }
  const candidatePacket = readJson(queueIntakeCandidatePath);
  const decision = readJson(agent6DecisionPacketPath);
  const referenceDiagnostics = readJson(referenceDiagnosticsPath);
  assertBoundary(candidatePacket);

  const expectedCurrent = {
    packet_generated_at: packet.generated_at,
    decision_generated_at: decision.generated_at,
    custody_source_rows: decision.summary?.custody_source_rows,
    track_candidate_source_files: decision.summary?.track_candidate_source_files,
    missing_manifest_source_files: decision.summary?.missing_manifest_source_files,
    modified_tracked_source_files: decision.summary?.modified_tracked_source_files,
    blocked_downstream_direct_paths: decision.summary?.blocked_downstream_direct_paths,
    blocked_content_reference_rows: decision.summary?.blocked_downstream_content_reference_paths,
    route_or_hud_content_reference_rows: referenceDiagnostics.bucket_counts?.route_cards_or_hud_surfaces?.row_hit_count,
    reader_workbench_content_reference_rows: referenceDiagnostics.bucket_counts?.reader_workbench_artifacts?.row_hit_count,
    translation_memory_content_reference_rows: referenceDiagnostics.bucket_counts?.translation_memory_paths?.row_hit_count,
    public_lexical_content_reference_rows: referenceDiagnostics.bucket_counts?.public_lexical_exports?.row_hit_count,
    report_or_audit_reference_rows: referenceDiagnostics.summary?.report_or_audit_reference_rows,
  };
  for (const [key, expected] of Object.entries(expectedCurrent)) {
    if (candidatePacket.current?.[key] !== expected) {
      fail(`Queue intake candidate current-evidence mismatch: ${key}`, {
        expected,
        actual: candidatePacket.current?.[key],
      });
    }
  }

  const queueItem = candidatePacket.queue_item_candidate || {};
  const requiredFields = [
    'request_id',
    'submitted_by',
    'gate',
    'scope',
    'status',
    'priority',
    'evidence_artifacts',
    'requested_verdict',
    'claimed_boundary',
    'known_risks',
    'what_changed_since_last_agent6_ruling',
    'what_must_not_be_accepted',
  ];
  for (const field of requiredFields) {
    if (queueItem[field] === undefined || queueItem[field] === null) {
      fail('Queue intake candidate missing required queue field', { field });
    }
  }
  if (queueItem.request_id !== 'agent6-agent1-source-custody-closure-decision-packet') {
    fail('Queue intake candidate request_id mismatch', { actual: queueItem.request_id });
  }
  if (queueItem.status !== 'queued_awaiting_agent6_source_custody_closure_decision') {
    fail('Queue intake candidate status mismatch', { actual: queueItem.status });
  }
  if (queueItem.priority !== 0) {
    fail('Queue intake candidate priority mismatch', { actual: queueItem.priority });
  }

  const candidateText = JSON.stringify(queueItem);
  for (const staleCount of ['61', '64']) {
    if (candidateText.includes(`${staleCount} blocked content-reference`)
      || candidateText.includes(`${staleCount} content-reference`)
      || candidateText.includes(`${staleCount} blocked downstream content-reference`)) {
      fail('Queue intake candidate proposed queue item preserves stale content-reference language', {
        staleCount,
      });
    }
  }
  if (!candidateText.includes(String(expectedCurrent.blocked_content_reference_rows))) {
    fail('Queue intake candidate proposed queue item lacks current content-reference count', {
      expected: expectedCurrent.blocked_content_reference_rows,
    });
  }
  if (!candidateText.includes(packet.generated_at)) {
    fail('Queue intake candidate proposed queue item lacks current packet timestamp', {
      expected: packet.generated_at,
    });
  }
  if (!candidateText.includes(decision.generated_at)) {
    fail('Queue intake candidate proposed queue item lacks current decision packet timestamp', {
      expected: decision.generated_at,
    });
  }

  const requiredEvidenceArtifacts = [
    'reports/agent1-agent6-source-custody-decision-packet.json',
    'reports/agent1-source-custody-queue-intake-candidate.json',
    'reports/agent1-source-custody-control-sync-packet.json',
    'reports/agent1-source-custody-queue-refresh-notice.json',
    'reports/agent1-source-custody-reference-diagnostics.json',
    'reports/agent1-source-provenance-custody-validator-result.json',
    'scripts/build_agent1_source_custody_queue_intake_candidate.mjs',
    'scripts/validate_agent1_source_custody_packet.mjs',
  ];
  const evidenceArtifacts = queueItem.evidence_artifacts || [];
  for (const artifact of requiredEvidenceArtifacts) {
    if (!evidenceArtifacts.includes(artifact)) {
      fail('Queue intake candidate missing required evidence artifact', { artifact });
    }
    if (!fs.existsSync(path.join(repoRoot, artifact))) {
      fail('Queue intake candidate evidence artifact missing on disk', { artifact });
    }
  }

  const actualStaleMarkers = candidatePacket.existing_queue_item?.stale_markers || [];
  const expectedStaleMarkers = [
    'missing_current_packet_timestamp',
    'missing_current_decision_packet_timestamp',
  ];
  const currentContentReferenceMarker = `missing_current_${expectedCurrent.blocked_content_reference_rows}_content_reference_rows`;
  if (actualStaleMarkers.some((marker) => /^missing_current_\d+_content_reference_rows$/.test(marker))) {
    expectedStaleMarkers.unshift(currentContentReferenceMarker);
  }
  for (const marker of expectedStaleMarkers) {
    if (!actualStaleMarkers.includes(marker)) {
      fail('Queue intake candidate missing expected stale queue marker', {
        marker,
        actual: actualStaleMarkers,
      });
    }
  }
  for (const marker of actualStaleMarkers) {
    if (/^missing_current_\d+_content_reference_rows$/.test(marker)
      && marker !== currentContentReferenceMarker) {
      fail('Queue intake candidate stale marker references the wrong current content-reference count', {
        expected: currentContentReferenceMarker,
        actual: marker,
      });
    }
  }

  if (candidatePacket.control_sync_packet?.stale_control_surface_count !== controlSyncResult.stale_surface_count) {
    fail('Queue intake candidate control-sync stale surface count mismatch', {
      expected: controlSyncResult.stale_surface_count,
      actual: candidatePacket.control_sync_packet?.stale_control_surface_count,
    });
  }

  const mustNotBeAccepted = new Set(queueItem.what_must_not_be_accepted || []);
  for (const item of packet.must_not_be_accepted || []) {
    if (!mustNotBeAccepted.has(item)) {
      fail('Queue intake candidate missing must-not-accept item', { item });
    }
  }
  return {
    path: path.relative(repoRoot, queueIntakeCandidatePath).replace(/\\/g, '/'),
    current: candidatePacket.current,
    existing_queue_stale_markers: actualStaleMarkers,
    queue_item_request_id: queueItem.request_id,
  };
}

function main() {
  if (!fs.existsSync(packetPath)) {
    fail(`Missing custody packet: ${path.relative(repoRoot, packetPath)}`);
  }
  const packet = readJson(packetPath);
  const liveUntracked = liveUntrackedSources();
  const liveModified = liveModifiedTrackedSources();

  assertBoundary(packet);
  assertUntrackedRows(packet, liveUntracked);
  assertModifiedRows(packet, liveModified);
  assertSummary(packet);
  assertExceptionSummary(packet);
  assertRouteHudDirectProbe(packet);
  const quarantineManifest = assertQuarantineManifest(packet);
  const custodyBlocklist = assertCustodyBlocklist(packet, quarantineManifest);
  const referenceDiagnostics = assertReferenceDiagnostics(packet, quarantineManifest);
  const intakeDocket = assertIntakeDocket(packet, quarantineManifest);
  const closureOptions = assertClosureOptions(packet);
  const reconciliationPreflight = assertReconciliationPreflight(closureOptions);
  const agent6DecisionPacket = assertAgent6DecisionPacket(packet, quarantineManifest, closureOptions, reconciliationPreflight);
  const queueRefreshNotice = assertQueueRefreshNotice(packet, agent6DecisionPacket);
  const controlSyncPacket = assertControlSyncPacket(packet, agent6DecisionPacket, queueRefreshNotice);
  const queueIntakeCandidate = assertQueueIntakeCandidate(packet, agent6DecisionPacket, controlSyncPacket);

  const result = {
    ok: true,
    packet: path.relative(repoRoot, packetPath).replace(/\\/g, '/'),
    generated_at: packet.generated_at,
    live_untracked_sources: liveUntracked.length,
    packet_untracked_sources: packet.untracked_dispositions.length,
    live_modified_tracked_sources: liveModified.length,
    packet_modified_tracked_sources: packet.modified_tracked_drift.length,
    untracked_license_unit_counts: countLicenseUnits(packet.untracked_dispositions),
    source_fingerprints: fingerprintResult(packet),
    exception_summary: exceptionResult(packet),
    downstream_quarantine_manifest: {
      path: quarantineManifest.path,
      summary: quarantineManifest.summary,
    },
    custody_blocklist: custodyBlocklist,
    custody_reference_diagnostics: referenceDiagnostics,
    agent6_intake_docket: intakeDocket,
    custody_closure_options: {
      path: closureOptions.path,
      summary: closureOptions.summary,
    },
    custody_reconciliation_preflight: {
      path: reconciliationPreflight.path,
      summary: reconciliationPreflight.summary,
    },
    agent6_source_custody_decision_packet: agent6DecisionPacket,
    custody_queue_refresh_notice: queueRefreshNotice,
    custody_control_sync_packet: controlSyncPacket,
    custody_queue_intake_candidate: queueIntakeCandidate,
    boundary: packet.boundary,
  };
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
    details: error.details || {},
  }, null, 2));
  process.exitCode = 1;
}
