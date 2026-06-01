#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedProvenanceMatrix: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
  selectedCollisionProvenanceAudit: '.local-cache/workbench-evidence/usage-selected-collision-provenance-audit.json',
  output: '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json',
  report: 'reports/workbench-usage-selected-occurrence-navigation-index.md',
};

const options = parseArgs(process.argv.slice(2));
const occurrenceCards = readJson(options.selectedOccurrenceCards);
const provenanceMatrix = readJson(options.selectedProvenanceMatrix);
const collisionProvenanceAudit = readJson(options.selectedCollisionProvenanceAudit);
if (occurrenceCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}
if (provenanceMatrix.artifact_type !== 'workbench_usage_selected_provenance_matrix') {
  throw new Error(`${options.selectedProvenanceMatrix} is not a selected provenance matrix artifact`);
}
if (collisionProvenanceAudit.artifact_type !== 'workbench_usage_selected_collision_provenance_audit') {
  throw new Error(`${options.selectedCollisionProvenanceAudit} is not a selected collision/provenance audit artifact`);
}

const provenanceByOccurrenceId = buildProvenanceLookup(provenanceMatrix.provenance_rows || []);
const collisionMembershipByOccurrenceId = buildCollisionMembershipLookup(collisionProvenanceAudit.collision_provenance_rows || []);
const navigationRows = (occurrenceCards.cards || []).map(buildNavigationRow).sort(compareRows);
const checks = buildChecks(navigationRows);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_occurrence_navigation_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_occurrence_navigation_index.mjs',
  policy: 'Selected occurrence navigation index for the usage-navigation/concordance lane. It exposes clickable source/work anchors, Hebrew context snippets, raw status/score, usage frames, route IDs, and provenance/license metadata only; it does not rank routes, select visible answers, translate, copy route payloads, or assert authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_provenance_matrix: options.selectedProvenanceMatrix,
    selected_collision_provenance_audit: options.selectedCollisionProvenanceAudit,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts: buildCounts(navigationRows),
  checks,
  navigation_rows: navigationRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected occurrence navigation rows ${artifact.counts.rows}; source refs ${artifact.counts.unique_source_refs}; collision-member rows ${artifact.counts.collision_member_rows}`);

function buildNavigationRow(card) {
  const provenance = provenanceByOccurrenceId.get(card.occurrence_id);
  const collisionMembership = collisionMembershipByOccurrenceId.get(card.occurrence_id) || {
    collision_ids: [],
    collision_kinds: [],
    collision_keys: [],
  };
  return {
    occurrence_id: card.occurrence_id,
    token_key: card.token_key,
    token_surface: card.token_surface,
    token_normalized: card.token_normalized,
    focus_surface: card.focus_surface,
    focus_normalized: card.focus_normalized,
    source_ref: card.source_ref,
    source_href: card.source_href,
    work_anchor_href: card.work_anchor_href,
    work_title: card.work_title,
    work_slug: card.work_slug,
    status: card.status,
    raw_score: card.raw_score,
    cluster_id: card.cluster_id,
    usage_frame_label: card.usage_frame_label,
    context_focus_marked: card.context_focus_marked,
    related_route_ids: card.route_ids || [],
    provenance_id: provenance?.provenance_id || null,
    version_title: provenance?.version_title || card.version_title,
    version_source: provenance?.version_source || card.version_source,
    license: provenance?.license || card.license,
    license_url: provenance?.license_url || card.license_url,
    collision_ids: collisionMembership.collision_ids,
    collision_kinds: collisionMembership.collision_kinds,
    collision_keys: collisionMembership.collision_keys,
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_source_link: Boolean(card.source_href),
      has_work_anchor: Boolean(card.work_anchor_href),
      has_hebrew_context: hasHebrew(card.context_focus_marked),
      has_focus_marker: String(card.context_focus_marked || '').includes('[') && String(card.context_focus_marked || '').includes(']'),
      has_provenance: Boolean(provenance),
      has_route_ids: Array.isArray(card.route_ids) && card.route_ids.length > 0,
      collision_member: collisionMembership.collision_ids.length > 0,
    },
  };
}

function buildProvenanceLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    for (const sample of row.sample_occurrences || []) {
      lookup.set(sample.occurrence_id, {
        provenance_id: row.provenance_id,
        license: row.license,
        license_url: row.license_url,
        version_title: row.version_title,
        version_source: row.version_source,
      });
    }
  }
  return lookup;
}

function buildCollisionMembershipLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    for (const sample of row.sample_occurrences || []) {
      if (!lookup.has(sample.occurrence_id)) {
        lookup.set(sample.occurrence_id, {
          collision_ids: new Set(),
          collision_kinds: new Set(),
          collision_keys: new Set(),
        });
      }
      const bucket = lookup.get(sample.occurrence_id);
      bucket.collision_ids.add(row.collision_id);
      bucket.collision_kinds.add(row.collision_kind);
      bucket.collision_keys.add(row.collision_key);
    }
  }
  return new Map([...lookup.entries()].map(([occurrenceId, bucket]) => [occurrenceId, {
    collision_ids: [...bucket.collision_ids].sort(),
    collision_kinds: [...bucket.collision_kinds].sort(),
    collision_keys: [...bucket.collision_keys].sort(),
  }]));
}

function buildCounts(rows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const sourceRefs = new Set();
  const workAnchors = new Set();
  const works = new Set();
  const frames = new Set();
  const clusters = new Set();
  const routeIds = new Set();
  const provenanceIds = new Set();
  const licenses = new Set();
  const licenseUrls = new Set();
  const versionTitles = new Set();
  const versionSources = new Set();
  let rowsWithSourceLink = 0;
  let rowsWithWorkAnchor = 0;
  let rowsWithHebrewContext = 0;
  let rowsWithFocusMarker = 0;
  let rowsWithProvenance = 0;
  let collisionMemberRows = 0;
  let collisionMemberships = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    sourceRefs.add(row.source_ref);
    workAnchors.add(row.work_anchor_href);
    works.add(row.work_slug || row.work_title);
    frames.add(row.usage_frame_label);
    clusters.add(row.cluster_id);
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    for (const routeId of row.related_route_ids || []) routeIds.add(routeId);
    if (row.provenance_id) provenanceIds.add(row.provenance_id);
    if (row.license) licenses.add(row.license);
    if (row.license_url) licenseUrls.add(row.license_url);
    if (row.version_title) versionTitles.add(row.version_title);
    if (row.version_source) versionSources.add(row.version_source);
    if (row.navigation_flags?.has_source_link) rowsWithSourceLink += 1;
    if (row.navigation_flags?.has_work_anchor) rowsWithWorkAnchor += 1;
    if (row.navigation_flags?.has_hebrew_context) rowsWithHebrewContext += 1;
    if (row.navigation_flags?.has_focus_marker) rowsWithFocusMarker += 1;
    if (row.navigation_flags?.has_provenance) rowsWithProvenance += 1;
    if (row.navigation_flags?.collision_member) collisionMemberRows += 1;
    collisionMemberships += (row.collision_ids || []).length;
    if (row.navigation_flags?.reader_facing !== false) readerFacingRows += 1;
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    rows: rows.length,
    unique_source_refs: sourceRefs.size,
    unique_work_anchors: workAnchors.size,
    unique_works: works.size,
    usage_frames: frames.size,
    cluster_ids: clusters.size,
    unique_route_ids: routeIds.size,
    provenance_buckets: provenanceIds.size,
    unique_licenses: licenses.size,
    unique_license_urls: licenseUrls.size,
    unique_version_titles: versionTitles.size,
    unique_version_sources: versionSources.size,
    status_counts: statusCounts,
    rows_with_source_link: rowsWithSourceLink,
    rows_with_work_anchor: rowsWithWorkAnchor,
    rows_with_hebrew_context: rowsWithHebrewContext,
    rows_with_focus_marker: rowsWithFocusMarker,
    rows_with_provenance: rowsWithProvenance,
    collision_member_rows: collisionMemberRows,
    collision_memberships: collisionMemberships,
    observed_usage_only_rows: rows.length,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('navigation_rows_complete', counts.rows === Number(occurrenceCards.counts?.cards || 0) ? 'passed' : 'failed', `navigation rows ${counts.rows}; occurrence cards ${occurrenceCards.counts?.cards}`),
    check('source_links_complete', counts.rows_with_source_link === counts.rows ? 'passed' : 'failed', `source links ${counts.rows_with_source_link}; rows ${counts.rows}`),
    check('work_anchors_complete', counts.rows_with_work_anchor === counts.rows ? 'passed' : 'failed', `work anchors ${counts.rows_with_work_anchor}; rows ${counts.rows}`),
    check('hebrew_context_complete', counts.rows_with_hebrew_context === counts.rows ? 'passed' : 'failed', `Hebrew context rows ${counts.rows_with_hebrew_context}; rows ${counts.rows}`),
    check('focus_markers_complete', counts.rows_with_focus_marker === counts.rows ? 'passed' : 'failed', `focus marker rows ${counts.rows_with_focus_marker}; rows ${counts.rows}`),
    check('provenance_complete', counts.rows_with_provenance === counts.rows ? 'passed' : 'failed', `provenance rows ${counts.rows_with_provenance}; rows ${counts.rows}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('license_metadata_complete', counts.unique_licenses > 0 && counts.unique_license_urls > 0 ? 'passed' : 'failed', `licenses ${counts.unique_licenses}; license URLs ${counts.unique_license_urls}`),
    check('version_metadata_complete', counts.unique_version_titles > 0 && counts.unique_version_sources > 0 ? 'passed' : 'failed', `version titles ${counts.unique_version_titles}; version sources ${counts.unique_version_sources}`),
    check('collision_memberships_visible', counts.collision_memberships === Number(collisionProvenanceAudit.counts?.collision_occurrence_rows || 0) ? 'passed' : 'failed', `collision memberships ${counts.collision_memberships}; collision rows ${collisionProvenanceAudit.counts?.collision_occurrence_rows}`),
    check('status_counts_complete', sumStatusCounts(counts.status_counts) === counts.rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; rows ${counts.rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Occurrence Navigation Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Source refs: ${artifact.counts.unique_source_refs}`,
    `- Work anchors: ${artifact.counts.unique_work_anchors}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Licenses: ${artifact.counts.unique_licenses}`,
    `- Version sources: ${artifact.counts.unique_version_sources}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Rows with source link: ${artifact.counts.rows_with_source_link}`,
    `- Rows with work anchor: ${artifact.counts.rows_with_work_anchor}`,
    `- Rows with Hebrew context: ${artifact.counts.rows_with_hebrew_context}`,
    `- Rows with focus marker: ${artifact.counts.rows_with_focus_marker}`,
    `- Rows with provenance: ${artifact.counts.rows_with_provenance}`,
    `- Collision-member rows: ${artifact.counts.collision_member_rows}`,
    `- Collision memberships: ${artifact.counts.collision_memberships}`,
    `- Observed-usage-only rows: ${artifact.counts.observed_usage_only_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index is for navigation and inspection of selected usage rows. It provides links, Hebrew snippets, raw status/score, usage frames, route IDs, and provenance/license metadata without ranking routes, selecting visible answers, translating, or asserting authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Navigation Rows',
    '',
    '| source | work anchor | status | score | frame | route IDs | provenance | context |',
    '|---|---|---|---:|---|---|---|---|',
    ...artifact.navigation_rows.map((row) => `| ${[
      mdLink(row.source_ref, row.source_href),
      mdLink(row.work_title, row.work_anchor_href),
      row.status,
      row.raw_score,
      row.usage_frame_label,
      row.related_route_ids.join('<br>'),
      row.provenance_id,
      row.context_focus_marked,
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareRows(a, b) {
  return String(a.usage_frame_label || '').localeCompare(String(b.usage_frame_label || ''))
    || Number(b.raw_score || 0) - Number(a.raw_score || 0)
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function countForbiddenKeys(value) {
  const forbidden = new Set([
    'definition',
    'definition_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'english',
    'english_text',
    'english_translation',
    'imported_translation',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_links',
  ]);
  let hits = 0;
  walk(value);
  return hits;

  function walk(current) {
    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, item] of Object.entries(current)) {
      if (forbidden.has(key)) hits += 1;
      walk(item);
    }
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-cards=')) parsed.selectedOccurrenceCards = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-provenance-matrix=')) parsed.selectedProvenanceMatrix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-collision-provenance-audit=')) parsed.selectedCollisionProvenanceAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function mdLink(label, href) {
  return `[${String(label || '').replace(/\]/g, '\\]')}](${href})`;
}
