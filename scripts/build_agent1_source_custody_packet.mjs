#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const packetJsonPath = path.join(repoRoot, 'reports', 'agent1-source-provenance-custody-packet.json');
const packetMdPath = path.join(repoRoot, 'reports', 'agent1-source-provenance-custody-packet.md');
const quarantineManifestJsonPath = path.join(repoRoot, 'reports', 'agent1-downstream-quarantine-manifest.json');
const quarantineManifestMdPath = path.join(repoRoot, 'reports', 'agent1-downstream-quarantine-manifest.md');
const custodyBlocklistJsonPath = path.join(repoRoot, 'reports', 'agent1-custody-blocklist.json');
const custodyBlocklistMdPath = path.join(repoRoot, 'reports', 'agent1-custody-blocklist.md');
const intakeDocketJsonPath = path.join(repoRoot, 'reports', 'agent1-agent6-custody-intake-docket.json');
const intakeDocketMdPath = path.join(repoRoot, 'reports', 'agent1-agent6-custody-intake-docket.md');

const modifiedTrackedSources = [
  'data/sources/abarbanel-on-guide-for-the-perplexed.json',
  'data/sources/crescas-on-guide-for-the-perplexed.json',
  'data/sources/efodi-on-guide-for-the-perplexed.json',
  'data/sources/narboni-on-guide-for-the-perplexed.json',
  'data/sources/shem-tov-on-guide-for-the-perplexed.json',
  'data/sources/yahel-ohr-on-zohar.json',
];

const searchRoots = [
  'data/definitions',
  'data/workbench-evidence',
  'data/translation-memory',
  'data/translation-options',
];

const rgGlobs = [
  '--glob', '!data/definitions/hud-route-lookup/shards/**',
  '--glob', '!data/lexical/**',
  '--glob', '!data/sources/**',
];

let contentHitIndexCache = null;

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
    ...options,
  });
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function splitLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function getHeadJson(relativePath) {
  return JSON.parse(git(['show', `HEAD:${relativePath}`]));
}

function countLicenses(units) {
  const counts = {};
  for (const unit of units || []) {
    const license = unit.license || '';
    counts[license] = (counts[license] || 0) + 1;
  }
  return counts;
}

function deepDiffs(current, head, pathParts = [], out = []) {
  if (JSON.stringify(current) === JSON.stringify(head)) return out;
  if (current && head && typeof current === 'object' && typeof head === 'object') {
    for (const key of new Set([...Object.keys(current), ...Object.keys(head)])) {
      deepDiffs(current[key], head[key], pathParts.concat(key), out);
    }
    return out;
  }
  out.push({ path: pathParts.join('.'), current, head });
  return out;
}

function liveUntrackedSources() {
  return git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function directArtifacts(workId, workSlug) {
  const paths = {
    overlay_json: `data/overlays/${workId}.json`,
    public_page: `${workSlug}/index.html`,
    overlay_export_csv: `${workSlug}/overlay-export.csv`,
    overlay_export_json: `${workSlug}/overlay-export.json`,
    overlay_export_md: `${workSlug}/overlay-export.md`,
    lexical_occurrences: `data/lexical/occurrences/${workId}.json`,
    lexical_manifest: `data/lexical/${workId}.manifest.json`,
    lexical_chunks_dir: `data/lexical/${workId}-chunks`,
    lexical_token_index_by_slug: `data/lexical/token-indexes/${workSlug}.json`,
    lexical_token_index_by_id: `data/lexical/token-indexes/${workId}.json`,
    public_lexical_by_work_jsonl: `data/public-lexical/by-work/${workId}.jsonl`,
    coverage_report: `data/reports/coverage/${workId}.json`,
  };
  return Object.fromEntries(Object.entries(paths).map(([kind, artifactPath]) => [
    kind,
    { path: artifactPath, exists: exists(artifactPath) },
  ]));
}

function pageEvidence(workSlug) {
  const pagePath = `${workSlug}/index.html`;
  if (!exists(pagePath)) {
    return { exists: false, visible_source_license_rows: false, sample: '' };
  }
  const html = fs.readFileSync(path.join(repoRoot, pagePath), 'utf8');
  const sample = html.match(/Hebrew version:[\s\S]{0,500}?License:\s*([^<\n]+)/i)
    || html.match(/<th>#<\/th>\s*<th>Hebrew Version<\/th>\s*<th>Version Source<\/th>\s*<th>Digitization<\/th>\s*<th>License<\/th>[\s\S]{0,500}?<\/tbody>/i)
    || html.match(/License:\s*([^<\n]+)/i);
  const hasInlineSourceNotice = /Hebrew version:|Version source:|License:/i.test(html);
  const hasFooterSourceTable = /<th>#<\/th>\s*<th>Hebrew Version<\/th>\s*<th>Version Source<\/th>\s*<th>Digitization<\/th>\s*<th>License<\/th>/i.test(html);
  return {
    exists: true,
    visible_source_license_rows: hasInlineSourceNotice || hasFooterSourceTable,
    sample: sample ? sample[0].replace(/\s+/g, ' ').slice(0, 300) : '',
  };
}

function custodyNeedles() {
  const needles = new Set();
  for (const sourcePath of liveUntrackedSources()) {
    const source = readJson(sourcePath);
    if (source.work_id) needles.add(source.work_id);
    if (source.work_slug) needles.add(source.work_slug);
  }
  for (const sourcePath of modifiedTrackedSources) {
    if (!exists(sourcePath)) continue;
    const source = readJson(sourcePath);
    if (source.work_id) needles.add(source.work_id);
    if (source.work_slug) needles.add(source.work_slug);
  }
  return [...needles].sort((a, b) => b.length - a.length || a.localeCompare(b));
}

function normalizeHitPath(hit) {
  const normalizedRepoRoot = repoRoot.replace(/\\/g, '/');
  let normalized = String(hit || '').replace(/\\/g, '/');
  if (normalized.startsWith(`${normalizedRepoRoot}/`)) {
    normalized = normalized.slice(normalizedRepoRoot.length + 1);
  }
  return normalized;
}

function contentHitIndex() {
  if (contentHitIndexCache) return contentHitIndexCache;
  const needles = custodyNeedles();
  contentHitIndexCache = new Map(needles.map((needle) => [needle, new Set()]));
  const roots = searchRoots.filter((root) => exists(root));
  if (!needles.length || !roots.length) return contentHitIndexCache;

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent1-custody-'));
  const needleFile = path.join(tempDir, 'needles.txt');
  let output = '';
  try {
    fs.writeFileSync(needleFile, `${needles.join('\n')}\n`, 'utf8');
    output = execFileSync('rg', [
      '-l',
      '--fixed-strings',
      '-f',
      needleFile,
      ...rgGlobs,
      ...roots,
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

  for (const hit of splitLines(output)) {
    const normalizedHit = normalizeHitPath(hit);
    let text = '';
    try {
      text = fs.readFileSync(path.join(repoRoot, normalizedHit), 'utf8');
    } catch {
      continue;
    }
    for (const needle of needles) {
      if (text.includes(needle)) contentHitIndexCache.get(needle).add(normalizedHit);
    }
  }
  return contentHitIndexCache;
}

function rgHits(needles) {
  const hits = new Set();
  const index = contentHitIndex();
  for (const needle of needles.filter(Boolean)) {
    for (const hit of index.get(needle) || []) {
      hits.add(normalizeHitPath(hit));
    }
  }
  return [...hits].sort((a, b) => a.localeCompare(b));
}

function directDefinitionHits(needles) {
  const hits = new Set();
  const index = contentHitIndex();
  for (const needle of needles.filter(Boolean)) {
    for (const hit of index.get(needle) || []) {
      if (hit.startsWith('data/definitions/')) hits.add(hit);
    }
  }
  return [...hits].sort((a, b) => a.localeCompare(b));
}

function publicLexicalHits(workId, workSlug) {
  const hits = new Set();
  const needles = [workId, workSlug].filter(Boolean);
  const indexPaths = [
    'data/public-lexical/sitewide/work-downloads.jsonl',
    'data/public-lexical/sitewide/work-downloads.csv',
    'data/public-lexical/sitewide/work-summary.jsonl',
    'data/public-lexical/sitewide/work-summary.csv',
  ];
  for (const indexPath of indexPaths) {
    if (!exists(indexPath)) continue;
    const text = fs.readFileSync(path.join(repoRoot, indexPath), 'utf8');
    if (needles.some((needle) => text.includes(needle))) {
      hits.add(indexPath);
    }
  }

  const byWorkDir = path.join(repoRoot, 'data/public-lexical/by-work');
  if (fs.existsSync(byWorkDir)) {
    for (const item of fs.readdirSync(byWorkDir, { withFileTypes: true })) {
      if (!item.isFile()) continue;
      if (needles.some((needle) => item.name.startsWith(needle) || item.name.includes(`${needle}-`))) {
        hits.add(`data/public-lexical/by-work/${item.name}`);
      }
    }
  }
  return [...hits].sort((a, b) => a.localeCompare(b));
}

function classifyHits(hits) {
  const normalizedHits = hits.map(normalizeHitPath);
  return {
    route_cards_or_hud_surfaces: normalizedHits.filter((hit) => hit.startsWith('data/definitions/')),
    reader_workbench_artifacts: normalizedHits.filter((hit) => hit.startsWith('data/workbench-evidence/')),
    translation_memory_paths: normalizedHits.filter((hit) => hit.startsWith('data/translation-memory/') || hit.startsWith('data/translation-options/')),
    public_lexical_exports: normalizedHits.filter((hit) => hit.startsWith('data/public-lexical/')),
    reports_or_audit_artifacts: normalizedHits.filter((hit) => hit.startsWith('reports/') || hit.startsWith('data/reports/')),
  };
}

function makeReliance(workId, workSlug) {
  const needles = [workId, workSlug];
  const hits = [...new Set([...rgHits(needles), ...directDefinitionHits(needles), ...publicLexicalHits(workId, workSlug)])];
  return {
    direct_artifacts: directArtifacts(workId, workSlug),
    page_evidence: pageEvidence(workSlug),
    content_hits: classifyHits(hits),
  };
}

function hasDirect(row, key) {
  return row.direct_artifacts?.[key]?.exists === true;
}

function hitCount(row, bucket) {
  return row.content_hits?.[bucket]?.length || 0;
}

function routeOrWorkbenchHits(row) {
  return [
    ...(row.content_hits?.route_cards_or_hud_surfaces || []),
    ...(row.content_hits?.reader_workbench_artifacts || []),
    ...(row.content_hits?.translation_memory_paths || []),
  ].length > 0;
}

function licenseText(counts) {
  return Object.entries(counts || {}).map(([license, count]) => `${license}: ${count}`).join('; ');
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function artifactSummary(row) {
  return [
    `overlay ${yesNo(hasDirect(row, 'overlay_json'))}`,
    `page ${yesNo(hasDirect(row, 'public_page'))}`,
    `visible license ${yesNo(row.page_evidence?.visible_source_license_rows)}`,
    `overlay exports ${yesNo(hasDirect(row, 'overlay_export_csv') || hasDirect(row, 'overlay_export_json') || hasDirect(row, 'overlay_export_md'))}`,
    `lexical manifest ${yesNo(hasDirect(row, 'lexical_manifest'))}`,
    `occurrence ${yesNo(hasDirect(row, 'lexical_occurrences'))}`,
    `token index ${yesNo(hasDirect(row, 'lexical_token_index_by_slug') || hasDirect(row, 'lexical_token_index_by_id'))}`,
    `route/HUD ${hitCount(row, 'route_cards_or_hud_surfaces')}`,
    `workbench ${hitCount(row, 'reader_workbench_artifacts')}`,
    `translation-memory ${hitCount(row, 'translation_memory_paths')}`,
  ].join('; ');
}

function sourceRef(row) {
  return {
    source_path: row.source_path,
    work_id: row.work_id,
    work_slug: row.work_slug,
    source_fingerprint: row.source_fingerprint,
  };
}

function directArtifactRef(row, kind) {
  const artifact = row.direct_artifacts?.[kind];
  return {
    ...sourceRef(row),
    artifact_kind: kind,
    artifact_path: artifact?.path || '',
    artifact_exists: artifact?.exists === true,
  };
}

function sourceLicenseExceptionRef(row) {
  return {
    ...sourceRef(row),
    public_page: row.direct_artifacts?.public_page?.path || '',
    page_exists: row.page_evidence?.exists === true,
    visible_source_license_rows: row.page_evidence?.visible_source_license_rows === true,
    sample: row.page_evidence?.sample || '',
  };
}

function contentHitRef(row) {
  return {
    ...sourceRef(row),
    route_cards_or_hud_surfaces: row.content_hits?.route_cards_or_hud_surfaces || [],
    reader_workbench_artifacts: row.content_hits?.reader_workbench_artifacts || [],
    translation_memory_paths: row.content_hits?.translation_memory_paths || [],
    public_lexical_exports: row.content_hits?.public_lexical_exports || [],
  };
}

function makeExceptionSummary(untrackedRows, modifiedRows) {
  return {
    source_license_survivability: {
      untracked_missing_visible_source_license_rows: untrackedRows
        .filter((row) => row.page_evidence?.visible_source_license_rows !== true)
        .map(sourceLicenseExceptionRef),
      modified_tracked_missing_visible_source_license_rows: modifiedRows
        .filter((row) => row.page_evidence?.visible_source_license_rows !== true)
        .map(sourceLicenseExceptionRef),
    },
    direct_downstream_artifacts: {
      untracked_public_pages: untrackedRows
        .filter((row) => hasDirect(row, 'public_page'))
        .map((row) => directArtifactRef(row, 'public_page')),
      untracked_overlay_json: untrackedRows
        .filter((row) => hasDirect(row, 'overlay_json'))
        .map((row) => directArtifactRef(row, 'overlay_json')),
      untracked_overlay_exports: untrackedRows
        .filter((row) => hasDirect(row, 'overlay_export_csv') || hasDirect(row, 'overlay_export_json') || hasDirect(row, 'overlay_export_md'))
        .map((row) => ({
          ...sourceRef(row),
          csv: row.direct_artifacts?.overlay_export_csv,
          json: row.direct_artifacts?.overlay_export_json,
          markdown: row.direct_artifacts?.overlay_export_md,
        })),
      untracked_missing_lexical_manifest: untrackedRows
        .filter((row) => !hasDirect(row, 'lexical_manifest'))
        .map((row) => directArtifactRef(row, 'lexical_manifest')),
      modified_tracked_public_pages: modifiedRows
        .filter((row) => hasDirect(row, 'public_page'))
        .map((row) => directArtifactRef(row, 'public_page')),
      modified_tracked_missing_lexical_manifest: modifiedRows
        .filter((row) => !hasDirect(row, 'lexical_manifest'))
        .map((row) => directArtifactRef(row, 'lexical_manifest')),
    },
    content_reference_reliance: {
      untracked_route_workbench_or_translation_memory_hits: untrackedRows
        .filter(routeOrWorkbenchHits)
        .map(contentHitRef),
      modified_tracked_route_workbench_or_translation_memory_hits: modifiedRows
        .filter(routeOrWorkbenchHits)
        .map(contentHitRef),
    },
  };
}

function sourceCustodyState(row, sourceClass) {
  if (sourceClass === 'untracked') return 'untracked_source_quarantine';
  return 'modified_tracked_source_review_block';
}

function flattenDirectArtifactRows(rows, sourceClass) {
  const out = [];
  for (const row of rows) {
    for (const [artifactKind, artifact] of Object.entries(row.direct_artifacts || {})) {
      if (!artifact?.exists) continue;
      out.push({
        source_class: sourceClass,
        custody_state: sourceCustodyState(row, sourceClass),
        source_path: row.source_path,
        work_id: row.work_id,
        work_slug: row.work_slug,
        artifact_kind: artifactKind,
        artifact_path: artifact.path,
        artifact_exists: true,
        reliance_status: 'quarantined_or_blocked_no_publication_acceptance',
      });
    }
  }
  return out;
}

function flattenMissingLexicalManifestRows(rows, sourceClass) {
  const out = [];
  for (const row of rows) {
    const artifact = row.direct_artifacts?.lexical_manifest;
    if (artifact?.exists) continue;
    out.push({
      source_class: sourceClass,
      custody_state: sourceCustodyState(row, sourceClass),
      source_path: row.source_path,
      work_id: row.work_id,
      work_slug: row.work_slug,
      missing_artifact_kind: 'lexical_manifest',
      expected_artifact_path: artifact?.path || `data/lexical/${row.work_id}.manifest.json`,
      artifact_exists: false,
      reliance_status: 'missing_artifact_gap_no_publication_acceptance',
    });
  }
  return out;
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
          custody_state: sourceCustodyState(row, sourceClass),
          source_path: row.source_path,
          work_id: row.work_id,
          work_slug: row.work_slug,
          reference_kind: bucket,
          reference_path: hit,
          reliance_status: 'quarantined_or_blocked_no_publication_acceptance',
        });
      }
    }
  }
  return out;
}

function buildDownstreamQuarantineManifest(packet) {
  const untrackedRows = packet.untracked_dispositions || [];
  const modifiedRows = packet.modified_tracked_drift || [];
  const directArtifactRows = [
    ...flattenDirectArtifactRows(untrackedRows, 'untracked'),
    ...flattenDirectArtifactRows(modifiedRows, 'modified_tracked'),
  ];
  const missingLexicalManifestRows = [
    ...flattenMissingLexicalManifestRows(untrackedRows, 'untracked'),
    ...flattenMissingLexicalManifestRows(modifiedRows, 'modified_tracked'),
  ];
  const contentReferenceRows = [
    ...flattenContentReferenceRows(untrackedRows, 'untracked'),
    ...flattenContentReferenceRows(modifiedRows, 'modified_tracked'),
  ];
  return {
    generated_at: packet.generated_at,
    artifact_type: 'agent1_downstream_quarantine_manifest',
    source_packet: path.relative(repoRoot, packetJsonPath).replace(/\\/g, '/'),
    boundary: packet.boundary,
    summary: {
      source_rows: untrackedRows.length + modifiedRows.length,
      untracked_source_rows: untrackedRows.length,
      modified_tracked_source_rows: modifiedRows.length,
      direct_artifact_rows: directArtifactRows.length,
      missing_lexical_manifest_rows: missingLexicalManifestRows.length,
      content_reference_rows: contentReferenceRows.length,
      content_reference_rows_by_kind: contentReferenceRows.reduce((acc, row) => {
        acc[row.reference_kind] = (acc[row.reference_kind] || 0) + 1;
        return acc;
      }, {}),
    },
    direct_artifacts: directArtifactRows,
    missing_lexical_manifests: missingLexicalManifestRows,
    content_references: contentReferenceRows,
    manifest_boundary_note: 'This manifest records downstream reliance that remains quarantined or blocked; it is not source/provenance acceptance or publication support.',
  };
}

function buildAgent6IntakeDocket(packet, manifest) {
  return {
    generated_at: packet.generated_at,
    artifact_type: 'agent1_agent6_custody_intake_docket',
    requested_review: 'source/provenance custody evidence intake only',
    boundary: packet.boundary,
    evidence_artifacts: {
      custody_packet_json: path.relative(repoRoot, packetJsonPath).replace(/\\/g, '/'),
      custody_packet_markdown: path.relative(repoRoot, packetMdPath).replace(/\\/g, '/'),
      downstream_quarantine_manifest_json: path.relative(repoRoot, quarantineManifestJsonPath).replace(/\\/g, '/'),
      downstream_quarantine_manifest_markdown: path.relative(repoRoot, quarantineManifestMdPath).replace(/\\/g, '/'),
      custody_blocklist_json: path.relative(repoRoot, custodyBlocklistJsonPath).replace(/\\/g, '/'),
      custody_blocklist_markdown: path.relative(repoRoot, custodyBlocklistMdPath).replace(/\\/g, '/'),
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
    },
    live_scope: {
      untracked_source_files: packet.calibration.direct_untracked_source_count,
      modified_tracked_source_files: packet.calibration.modified_tracked_source_count,
      untracked_license_unit_counts: packet.untracked_dispositions.reduce((acc, row) => {
        for (const [license, count] of Object.entries(row.license_counts || {})) {
          acc[license] = (acc[license] || 0) + count;
        }
        return acc;
      }, {}),
      direct_audit_requirement: 'reports/untracked-source-files-direct.txt and reports/untracked-source-scope-audit.json must agree 23-for-23',
    },
    packet_claims: {
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
    },
    downstream_quarantine_manifest: manifest.summary,
    commands_used_for_evidence: [
      'git ls-files --others --exclude-standard -- data/sources/*.json',
      'node scripts\\audit_untracked_source_scope.mjs --untracked-list reports\\untracked-source-files-direct.txt --json reports\\untracked-source-scope-audit.json --report reports\\untracked-source-scope-audit.md',
      'node scripts\\build_agent1_source_custody_packet.mjs',
      'node scripts\\build_agent1_source_custody_reference_diagnostics.mjs',
      'node scripts\\build_agent1_source_custody_closure_options.mjs',
      'node scripts\\build_agent1_source_custody_reconciliation_preflight.mjs',
      'node scripts\\build_agent1_agent6_source_custody_decision_packet.mjs',
      'node scripts\\build_agent1_source_custody_queue_refresh_notice.mjs',
      'node scripts\\build_agent1_source_custody_control_sync_packet.mjs',
      'node scripts\\build_agent1_source_custody_queue_intake_candidate.mjs',
      'node scripts\\validate_agent1_source_custody_packet.mjs',
    ],
    must_not_be_accepted: packet.must_not_be_accepted,
    agent6_decision_boundary: 'Agent 1 output may be treated as evidence-ready / awaiting-Agent-6 only. Agent 6 remains the sole pass/warn/block authority for this source/provenance custody docket.',
  };
}

function buildCustodyBlocklist(packet, manifest) {
  const blockedSources = [
    ...(packet.untracked_dispositions || []).map((row) => ({
      source_class: 'untracked',
      custody_state: 'untracked_source_quarantine',
      source_path: row.source_path,
      work_id: row.work_id,
      work_slug: row.work_slug,
      source_fingerprint: row.source_fingerprint,
      disposition: row.disposition,
      block_reason: 'untracked source file; do not accept source/provenance or downstream publication reliance',
    })),
    ...(packet.modified_tracked_drift || []).map((row) => ({
      source_class: 'modified_tracked',
      custody_state: 'modified_tracked_source_review_block',
      source_path: row.source_path,
      work_id: row.work_id,
      work_slug: row.work_slug,
      source_fingerprint: row.source_fingerprint,
      disposition: row.disposition,
      block_reason: 'modified tracked source file outside prior docket; do not accept until Agent 6 reviews drift',
    })),
  ];
  const blockedDirectArtifacts = (manifest.direct_artifacts || []).map((row) => ({
    source_class: row.source_class,
    custody_state: row.custody_state,
    source_path: row.source_path,
    work_id: row.work_id,
    work_slug: row.work_slug,
    artifact_kind: row.artifact_kind,
    artifact_path: row.artifact_path,
    block_reason: 'downstream artifact depends on quarantined or review-blocked source',
  }));
  const blockedContentReferences = (manifest.content_references || []).map((row) => ({
    source_class: row.source_class,
    custody_state: row.custody_state,
    source_path: row.source_path,
    work_id: row.work_id,
    work_slug: row.work_slug,
    reference_kind: row.reference_kind,
    reference_path: row.reference_path,
    block_reason: 'content reference depends on quarantined or review-blocked source',
  }));
  const missingRequiredArtifacts = (manifest.missing_lexical_manifests || []).map((row) => ({
    source_class: row.source_class,
    custody_state: row.custody_state,
    source_path: row.source_path,
    work_id: row.work_id,
    work_slug: row.work_slug,
    missing_artifact_kind: row.missing_artifact_kind,
    expected_artifact_path: row.expected_artifact_path,
    block_reason: 'required lexical manifest artifact is missing',
  }));
  return {
    generated_at: packet.generated_at,
    artifact_type: 'agent1_custody_blocklist',
    source_packet: path.relative(repoRoot, packetJsonPath).replace(/\\/g, '/'),
    source_manifest: path.relative(repoRoot, quarantineManifestJsonPath).replace(/\\/g, '/'),
    boundary: packet.boundary,
    summary: {
      blocked_source_rows: blockedSources.length,
      blocked_direct_artifact_paths: blockedDirectArtifacts.length,
      blocked_content_reference_paths: blockedContentReferences.length,
      missing_required_artifacts: missingRequiredArtifacts.length,
    },
    blocked_sources: blockedSources,
    blocked_direct_artifacts: blockedDirectArtifacts,
    blocked_content_references: blockedContentReferences,
    missing_required_artifacts: missingRequiredArtifacts,
    blocklist_boundary_note: 'This blocklist prevents accidental acceptance claims for unresolved custody rows; it does not delete files and does not claim source/provenance or publication acceptance.',
  };
}

function buildPacket() {
  const generatedAt = new Date().toISOString();
  const directUntracked = liveUntrackedSources();
  const untrackedRows = directUntracked.map((sourcePath) => {
    const source = readJson(sourcePath);
    const reliance = makeReliance(source.work_id, source.work_slug);
    return {
      source_path: sourcePath,
      work_id: source.work_id,
      work_slug: source.work_slug,
      source_fingerprint: fileFingerprint(sourcePath),
      units: (source.units || []).length,
      license_counts: countLicenses(source.units || []),
      disposition: 'quarantine',
      disposition_reason: 'untracked source file; downstream artifacts must not be accepted for source/provenance or publication reliance until tracked and Agent 6 accepted',
      ...reliance,
    };
  });

  const modifiedRows = modifiedTrackedSources.map((sourcePath) => {
    const current = readJson(sourcePath);
    const head = getHeadJson(sourcePath);
    const diffs = deepDiffs(current, head);
    const allLicenseNormalization = diffs.length > 0
      && diffs.every((diff) => diff.path.endsWith('.license') && diff.head === 'PD' && diff.current === 'Public Domain');
    const reliance = makeReliance(current.work_id, current.work_slug);
    return {
      source_path: sourcePath,
      work_id: current.work_id,
      work_slug: current.work_slug,
      source_fingerprint: fileFingerprint(sourcePath),
      units_current: (current.units || []).length,
      units_head: (head.units || []).length,
      license_counts_current: countLicenses(current.units || []),
      license_counts_head: countLicenses(head.units || []),
      diff_count: diffs.length,
      all_diffs_are_license_pd_to_public_domain: allLicenseNormalization,
      disposition: 'modified_tracked_drift_blocked_until_Agent6_review',
      drift_summary: allLicenseNormalization
        ? 'unit license labels changed from PD to Public Domain; unit counts stable; no non-license fields found by parsed JSON diff audit'
        : 'non-license parsed JSON drift detected; requires manual review',
      sample_diffs: diffs.slice(0, 5),
      ...reliance,
    };
  });
  const exceptionSummary = makeExceptionSummary(untrackedRows, modifiedRows);
  const sourceRows = [...untrackedRows, ...modifiedRows];

  return {
    generated_at: generatedAt,
    artifact_type: 'agent1_source_provenance_custody_packet',
    boundary: {
      agent1_status: 'evidence-ready / awaiting-Agent-6',
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false,
      route_publication_support_claimed: false,
      definition_authority_claimed: false,
      page_render_acceptance_claimed: false,
    },
    calibration: {
      direct_untracked_source_count: directUntracked.length,
      direct_untracked_sources: directUntracked,
      modified_tracked_source_count: modifiedRows.length,
      commands: [
        'git ls-files --others --exclude-standard -- data/sources/*.json',
        'git status --short -- data/sources',
        'git diff --name-only -- data/sources/<six tracked files>',
        'node scripts/build_agent1_source_custody_packet.mjs',
        'rg -l --fixed-strings <work id/slug> <bounded data/report roots>',
      ],
    },
    untracked_dispositions: untrackedRows,
    modified_tracked_drift: modifiedRows,
    exception_summary: exceptionSummary,
    summary: {
      source_rows: sourceRows.length,
      source_fingerprinted_rows: sourceRows.filter((row) => row.source_fingerprint?.sha256).length,
      source_fingerprint_algorithm: 'sha256',
      untracked_count: untrackedRows.length,
      untracked_with_public_pages: untrackedRows.filter((row) => hasDirect(row, 'public_page')).length,
      untracked_with_overlay_json: untrackedRows.filter((row) => hasDirect(row, 'overlay_json')).length,
      untracked_with_lexical_manifest: untrackedRows.filter((row) => hasDirect(row, 'lexical_manifest')).length,
      untracked_with_route_or_workbench_hits: untrackedRows.filter(routeOrWorkbenchHits).length,
      untracked_missing_visible_source_license_rows: exceptionSummary.source_license_survivability.untracked_missing_visible_source_license_rows.length,
      untracked_missing_lexical_manifest: exceptionSummary.direct_downstream_artifacts.untracked_missing_lexical_manifest.length,
      modified_tracked_count: modifiedRows.length,
      modified_tracked_all_license_label_only: modifiedRows.every((row) => row.all_diffs_are_license_pd_to_public_domain),
      modified_tracked_with_public_pages: modifiedRows.filter((row) => hasDirect(row, 'public_page')).length,
      modified_tracked_with_route_or_workbench_hits: modifiedRows.filter(routeOrWorkbenchHits).length,
      modified_tracked_missing_visible_source_license_rows: exceptionSummary.source_license_survivability.modified_tracked_missing_visible_source_license_rows.length,
      modified_tracked_missing_lexical_manifest: exceptionSummary.direct_downstream_artifacts.modified_tracked_missing_lexical_manifest.length,
    },
    must_not_be_accepted: [
      'source/provenance acceptance',
      'publication readiness',
      'future publication support',
      'public/runtime acceptance',
      'Definition authority',
      'route publication support',
      'product/data gate acceptance',
      'accepted translation text',
      'page/render acceptance',
      'acceptance of the six modified tracked source files',
    ],
  };
}

function renderMarkdown(packet) {
  const lines = [];
  lines.push(
    '# Agent 1 Source/Provenance Custody Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Agent 1 status: evidence-ready / awaiting-Agent-6.',
    '- Publication state: blocked_no_render.',
    '- Source/provenance acceptance: not claimed.',
    '- Public/runtime/page/render/route/definition/product-gate acceptance: not claimed.',
    '',
    '## Calibration Input',
    '',
    `- Direct untracked source count: ${packet.calibration.direct_untracked_source_count}`,
    `- Modified tracked source count: ${packet.calibration.modified_tracked_source_count}`,
    '- Recount command: `git ls-files --others --exclude-standard -- data/sources/*.json`',
    '- This packet advances beyond direct-count truth by mapping disposition and downstream reliance.',
    '',
    '## Summary Findings',
    '',
    `- Source rows covered: ${packet.summary.source_rows}`,
    `- Source rows with SHA-256 fingerprints: ${packet.summary.source_fingerprinted_rows}/${packet.summary.source_rows}`,
    `- Untracked quarantined sources with public pages present: ${packet.summary.untracked_with_public_pages}/${packet.summary.untracked_count}`,
    `- Untracked quarantined sources with overlay JSON present: ${packet.summary.untracked_with_overlay_json}/${packet.summary.untracked_count}`,
    `- Untracked quarantined sources with lexical manifests present: ${packet.summary.untracked_with_lexical_manifest}/${packet.summary.untracked_count}`,
    `- Untracked quarantined sources with route/HUD, workbench, or translation-memory hits: ${packet.summary.untracked_with_route_or_workbench_hits}/${packet.summary.untracked_count}`,
    `- Untracked quarantined sources missing visible source/license rows in public pages: ${packet.summary.untracked_missing_visible_source_license_rows}/${packet.summary.untracked_count}`,
    `- Untracked quarantined sources missing lexical manifests: ${packet.summary.untracked_missing_lexical_manifest}/${packet.summary.untracked_count}`,
    `- Six modified tracked sources are license-label-only by parsed JSON diff audit: ${yesNo(packet.summary.modified_tracked_all_license_label_only)}`,
    `- Modified tracked sources with public pages present: ${packet.summary.modified_tracked_with_public_pages}/${packet.summary.modified_tracked_count}`,
    `- Modified tracked sources with route/HUD, workbench, or translation-memory hits: ${packet.summary.modified_tracked_with_route_or_workbench_hits}/${packet.summary.modified_tracked_count}`,
    `- Modified tracked sources missing visible source/license rows in public pages: ${packet.summary.modified_tracked_missing_visible_source_license_rows}/${packet.summary.modified_tracked_count}`,
    `- Modified tracked sources missing lexical manifests: ${packet.summary.modified_tracked_missing_lexical_manifest}/${packet.summary.modified_tracked_count}`,
    '',
    '## Machine-Checked Exception Summary',
    '',
    '### Missing Visible Source/License Rows',
    '',
  );
  const missingVisible = [
    ...packet.exception_summary.source_license_survivability.untracked_missing_visible_source_license_rows,
    ...packet.exception_summary.source_license_survivability.modified_tracked_missing_visible_source_license_rows,
  ];
  if (!missingVisible.length) {
    lines.push('- None detected by page scan.');
  } else {
    for (const row of missingVisible) {
      lines.push(`- \`${row.source_path}\` -> \`${row.public_page}\` (page exists: ${yesNo(row.page_exists)}, visible source/license rows: ${yesNo(row.visible_source_license_rows)})`);
    }
  }
  lines.push(
    '',
    '### Missing Lexical Manifests',
    '',
  );
  const missingManifests = [
    ...packet.exception_summary.direct_downstream_artifacts.untracked_missing_lexical_manifest,
    ...packet.exception_summary.direct_downstream_artifacts.modified_tracked_missing_lexical_manifest,
  ];
  if (!missingManifests.length) {
    lines.push('- None detected.');
  } else {
    for (const row of missingManifests) {
      lines.push(`- \`${row.source_path}\` -> expected \`${row.artifact_path}\``);
    }
  }
  lines.push(
    '',
    '### Route/HUD, Workbench, Or Translation-Memory Reliance',
    '',
    `- Untracked quarantined sources with route/workbench/translation-memory hits: ${packet.exception_summary.content_reference_reliance.untracked_route_workbench_or_translation_memory_hits.length}`,
    `- Modified tracked sources with route/workbench/translation-memory hits: ${packet.exception_summary.content_reference_reliance.modified_tracked_route_workbench_or_translation_memory_hits.length}`,
    '',
    '## Quarantined Untracked Source Dispositions',
    '',
    '| Source file | Units | Licenses | Disposition | Downstream reliance evidence |',
    '| --- | ---: | --- | --- | --- |',
  );
  for (const row of packet.untracked_dispositions) {
    lines.push(`| \`${row.source_path}\` | ${row.units} | ${licenseText(row.license_counts)} | quarantine | ${artifactSummary(row)} |`);
  }
  lines.push(
    '',
    '## Modified Tracked Source Drift',
    '',
    '| Source file | Units | Current licenses | HEAD licenses | Drift | Downstream reliance evidence |',
    '| --- | ---: | --- | --- | --- | --- |',
  );
  for (const row of packet.modified_tracked_drift) {
    lines.push(`| \`${row.source_path}\` | ${row.units_current} | ${licenseText(row.license_counts_current)} | ${licenseText(row.license_counts_head)} | ${row.drift_summary} | ${artifactSummary(row)} |`);
  }
  lines.push('', '## Exposure Hit Details', '');
  for (const row of [...packet.untracked_dispositions, ...packet.modified_tracked_drift]) {
    const buckets = [
      'route_cards_or_hud_surfaces',
      'reader_workbench_artifacts',
      'translation_memory_paths',
      'public_lexical_exports',
    ];
    if (!buckets.some((bucket) => row.content_hits[bucket].length)) continue;
    lines.push(`### ${row.work_id}`);
    for (const bucket of buckets) {
      if (!row.content_hits[bucket].length) continue;
      lines.push(`- ${bucket}:`);
      for (const hit of row.content_hits[bucket].slice(0, 30)) {
        lines.push(`  - \`${hit}\``);
      }
      if (row.content_hits[bucket].length > 30) {
        lines.push(`  - ... ${row.content_hits[bucket].length - 30} more`);
      }
    }
    lines.push('');
  }
  lines.push(
    '## What Changed Since Last Agent 6 Ruling',
    '',
    '- Direct-23/audit-23 count truth was already WARN-accepted as report truth only.',
    '- This packet adds custody disposition and downstream reliance evidence for all 23 untracked sources.',
    '- This packet adds the six modified tracked source files outside the prior docket and identifies their drift as unit license label normalization from `PD` to `Public Domain`, pending Agent 6 review.',
    '',
    '## What Must Not Be Accepted',
    '',
  );
  for (const item of packet.must_not_be_accepted) {
    lines.push(`- ${item}`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderQuarantineManifestMarkdown(manifest) {
  const lines = [];
  lines.push(
    '# Agent 1 Downstream Quarantine Manifest',
    '',
    `Generated: ${manifest.generated_at}`,
    '',
    '## Boundary',
    '',
    '- This manifest records downstream reliance only.',
    '- Publication state remains blocked_no_render.',
    '- No source/provenance, publication, route, runtime, page/render, product-gate, Definition authority, or accepted-translation claim is made.',
    '',
    '## Summary',
    '',
    `- Source rows covered: ${manifest.summary.source_rows}`,
    `- Untracked source rows: ${manifest.summary.untracked_source_rows}`,
    `- Modified tracked source rows: ${manifest.summary.modified_tracked_source_rows}`,
    `- Existing direct downstream artifact rows: ${manifest.summary.direct_artifact_rows}`,
    `- Missing lexical manifest rows: ${manifest.summary.missing_lexical_manifest_rows}`,
    `- Content-reference reliance rows: ${manifest.summary.content_reference_rows}`,
    '',
    '## Missing Lexical Manifests',
    '',
  );
  if (!manifest.missing_lexical_manifests.length) {
    lines.push('- None detected.');
  } else {
    for (const row of manifest.missing_lexical_manifests) {
      lines.push(`- \`${row.source_path}\` -> expected \`${row.expected_artifact_path}\``);
    }
  }
  lines.push(
    '',
    '## Direct Artifact Counts By Kind',
    '',
  );
  const byArtifactKind = manifest.direct_artifacts.reduce((acc, row) => {
    acc[row.artifact_kind] = (acc[row.artifact_kind] || 0) + 1;
    return acc;
  }, {});
  for (const [kind, count] of Object.entries(byArtifactKind).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- ${kind}: ${count}`);
  }
  lines.push(
    '',
    '## Content Reference Counts By Kind',
    '',
  );
  for (const [kind, count] of Object.entries(manifest.summary.content_reference_rows_by_kind).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- ${kind}: ${count}`);
  }
  lines.push(
    '',
    '## Quarantine Status',
    '',
    '- Every listed direct artifact and content reference remains `quarantined_or_blocked_no_publication_acceptance`.',
    '- Every listed missing lexical manifest remains `missing_artifact_gap_no_publication_acceptance`.',
    '',
  );
  return lines.join('\n');
}

function renderAgent6IntakeDocketMarkdown(docket) {
  const lines = [];
  lines.push(
    '# Agent 1 -> Agent 6 Custody Intake Docket',
    '',
    `Generated: ${docket.generated_at}`,
    '',
    '## Requested Agent 6 Review',
    '',
    'Review the current source/provenance custody packet and downstream quarantine manifest for source/provenance custody disposition only.',
    '',
    'Agent 1 is not requesting publication acceptance, source/provenance acceptance, route publication support, page/render acceptance, public/runtime acceptance, Definition authority, product/data gate acceptance, or accepted translation text acceptance.',
    '',
    '## Current Evidence Artifacts',
    '',
  );
  for (const [label, artifactPath] of Object.entries(docket.evidence_artifacts)) {
    lines.push(`- ${label}: \`${artifactPath}\``);
  }
  lines.push(
    '',
    '## Current Live Scope',
    '',
    `- Live untracked \`data/sources/*.json\` files: ${docket.live_scope.untracked_source_files}.`,
    `- Modified tracked \`data/sources/*.json\` files outside prior docket: ${docket.live_scope.modified_tracked_source_files}.`,
    `- Untracked source unit counts: ${licenseText(docket.live_scope.untracked_license_unit_counts)}.`,
    `- Direct/audit requirement: ${docket.live_scope.direct_audit_requirement}.`,
    '',
    '## Packet Claims',
    '',
    `- Source rows covered: ${docket.packet_claims.source_rows}.`,
    `- Source rows with ${docket.packet_claims.source_fingerprint_algorithm.toUpperCase()} fingerprints: ${docket.packet_claims.source_fingerprinted_rows}/${docket.packet_claims.source_rows}.`,
    `- Untracked source files dispositioned as quarantine: ${docket.packet_claims.untracked_quarantined_sources}.`,
    `- Modified tracked source files blocked for Agent 6 review: ${docket.packet_claims.modified_tracked_sources_blocked_for_review}.`,
    `- Modified tracked files are license-label-only by parsed JSON diff audit: ${yesNo(docket.packet_claims.modified_tracked_all_license_label_only)}.`,
    `- Visible source/license row gaps: ${docket.packet_claims.visible_source_license_row_gaps}.`,
    `- Missing lexical manifest gaps: ${docket.packet_claims.missing_lexical_manifest_gaps}.`,
    `- Untracked sources with downstream route/HUD, workbench, or translation-memory reliance: ${docket.packet_claims.untracked_with_downstream_reliance}.`,
    `- Modified tracked sources with downstream route/HUD, workbench, or translation-memory reliance: ${docket.packet_claims.modified_tracked_with_downstream_reliance}.`,
    '',
    '## Downstream Quarantine Manifest',
    '',
    `- Source rows covered: ${docket.downstream_quarantine_manifest.source_rows}.`,
    `- Existing direct artifact rows: ${docket.downstream_quarantine_manifest.direct_artifact_rows}.`,
    `- Missing lexical manifest rows: ${docket.downstream_quarantine_manifest.missing_lexical_manifest_rows}.`,
    `- Content-reference rows: ${docket.downstream_quarantine_manifest.content_reference_rows}.`,
    '- Content-reference rows by kind:',
  );
  for (const [kind, count] of Object.entries(docket.downstream_quarantine_manifest.content_reference_rows_by_kind || {}).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`  - \`${kind}\`: ${count}.`);
  }
  lines.push(
    '',
    'Every listed direct artifact/content reference remains `quarantined_or_blocked_no_publication_acceptance`. Every listed missing lexical manifest remains `missing_artifact_gap_no_publication_acceptance`.',
    '',
    '## Commands Used For Evidence',
    '',
  );
  for (const command of docket.commands_used_for_evidence) {
    lines.push(`- \`${command}\``);
  }
  lines.push(
    '',
    '## What Must Not Be Accepted From This Packet',
    '',
  );
  for (const item of docket.must_not_be_accepted) {
    lines.push(`- ${item}`);
  }
  lines.push(
    '',
    '## Agent 6 Decision Boundary',
    '',
    docket.agent6_decision_boundary,
    '',
  );
  return lines.join('\n');
}

function renderCustodyBlocklistMarkdown(blocklist) {
  const lines = [];
  lines.push(
    '# Agent 1 Custody Blocklist',
    '',
    `Generated: ${blocklist.generated_at}`,
    '',
    '## Boundary',
    '',
    '- This is an evidence/control blocklist for unresolved source custody only.',
    '- It does not delete files.',
    '- It does not claim source/provenance acceptance, publication support, route support, runtime/page/render acceptance, Definition authority, product/data gate acceptance, or accepted translation text.',
    `- Publication state: ${blocklist.boundary.publication_state}.`,
    '',
    '## Summary',
    '',
    `- Blocked source rows: ${blocklist.summary.blocked_source_rows}`,
    `- Blocked direct artifact paths: ${blocklist.summary.blocked_direct_artifact_paths}`,
    `- Blocked content-reference paths: ${blocklist.summary.blocked_content_reference_paths}`,
    `- Missing required artifacts: ${blocklist.summary.missing_required_artifacts}`,
    '',
    '## Missing Required Artifacts',
    '',
  );
  if (!blocklist.missing_required_artifacts.length) {
    lines.push('- None detected.');
  } else {
    for (const row of blocklist.missing_required_artifacts) {
      lines.push(`- \`${row.source_path}\` -> expected \`${row.expected_artifact_path}\``);
    }
  }
  lines.push(
    '',
    '## Blocked Source Rows',
    '',
    '| Source file | Class | State | Work | Reason |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const row of blocklist.blocked_sources) {
    lines.push(`| \`${row.source_path}\` | ${row.source_class} | ${row.custody_state} | ${row.work_id} | ${row.block_reason} |`);
  }
  lines.push(
    '',
    '## Blocklist Status',
    '',
    blocklist.blocklist_boundary_note,
    '',
  );
  return lines.join('\n');
}

const packet = buildPacket();
const quarantineManifest = buildDownstreamQuarantineManifest(packet);
const custodyBlocklist = buildCustodyBlocklist(packet, quarantineManifest);
const intakeDocket = buildAgent6IntakeDocket(packet, quarantineManifest);
writeJson(path.relative(repoRoot, packetJsonPath), packet);
writeJson(path.relative(repoRoot, quarantineManifestJsonPath), quarantineManifest);
writeJson(path.relative(repoRoot, custodyBlocklistJsonPath), custodyBlocklist);
writeJson(path.relative(repoRoot, intakeDocketJsonPath), intakeDocket);
fs.writeFileSync(packetMdPath, renderMarkdown(packet), 'utf8');
fs.writeFileSync(quarantineManifestMdPath, renderQuarantineManifestMarkdown(quarantineManifest), 'utf8');
fs.writeFileSync(custodyBlocklistMdPath, renderCustodyBlocklistMarkdown(custodyBlocklist), 'utf8');
fs.writeFileSync(intakeDocketMdPath, renderAgent6IntakeDocketMarkdown(intakeDocket), 'utf8');
console.log(JSON.stringify({
  ok: true,
  packet_json: path.relative(repoRoot, packetJsonPath).replace(/\\/g, '/'),
  packet_md: path.relative(repoRoot, packetMdPath).replace(/\\/g, '/'),
  quarantine_manifest_json: path.relative(repoRoot, quarantineManifestJsonPath).replace(/\\/g, '/'),
  quarantine_manifest_md: path.relative(repoRoot, quarantineManifestMdPath).replace(/\\/g, '/'),
  custody_blocklist_json: path.relative(repoRoot, custodyBlocklistJsonPath).replace(/\\/g, '/'),
  custody_blocklist_md: path.relative(repoRoot, custodyBlocklistMdPath).replace(/\\/g, '/'),
  intake_docket_json: path.relative(repoRoot, intakeDocketJsonPath).replace(/\\/g, '/'),
  intake_docket_md: path.relative(repoRoot, intakeDocketMdPath).replace(/\\/g, '/'),
  summary: packet.summary,
  quarantine_summary: quarantineManifest.summary,
  blocklist_summary: custodyBlocklist.summary,
  intake_summary: {
    requested_review: intakeDocket.requested_review,
    live_scope: intakeDocket.live_scope,
    packet_claims: intakeDocket.packet_claims,
  },
  boundary: packet.boundary,
}, null, 2));
