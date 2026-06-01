#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedNavigationIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json',
  usageConcordance: 'data/workbench-evidence/usage-concordance.json',
  output: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  report: 'reports/definition-workbench-usage-occurrence-links.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedNavigationIndex = readJson(options.selectedNavigationIndex);
const usageConcordance = readJson(options.usageConcordance);

if (selectedNavigationIndex.artifact_type !== 'workbench_usage_selected_occurrence_navigation_index') {
  throw new Error(`${options.selectedNavigationIndex} is not a selected occurrence navigation index`);
}
if (usageConcordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.usageConcordance} is not a usage-navigation concordance`);
}

const occurrenceLinks = (selectedNavigationIndex.navigation_rows || []).map(buildOccurrenceLink);
const counts = buildCounts(occurrenceLinks);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_occurrence_links',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_occurrence_links.mjs',
  policy: 'Stable Agent 3 Definition Workbench occurrence-link packet. It promotes selected usage-navigation rows into a planning artifact with source/work links, Hebrew context, raw status/score, usage frame, route IDs, and provenance/license metadata only. It does not rank routes, choose answers, translate, copy route payloads, or make publication claims.',
  inputs: {
    selected_navigation_index: options.selectedNavigationIndex,
    usage_concordance: options.usageConcordance,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    occurrence_links_only: true,
    route_ids_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
    publication_claim: false,
  },
  audit_only_summary: {
    ambiguous_rows_available_in_concordance: Number(usageConcordance.counts?.audit_only_counts?.ambiguous || 0),
    blocked_rows_available_in_concordance: Number(usageConcordance.counts?.audit_only_counts?.blocked || 0),
    ambiguous_rows_emitted: 0,
    blocked_rows_emitted: 0,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  occurrence_links: occurrenceLinks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage occurrence links ${artifact.quality.status}; rows ${counts.occurrence_link_rows}; source refs ${counts.unique_source_refs}`);

function buildOccurrenceLink(row, index) {
  const relatedRouteIds = Array.isArray(row.related_route_ids) ? row.related_route_ids : [];
  return {
    row_id: `definition-workbench-usage-occurrence-link-${String(index + 1).padStart(3, '0')}`,
    occurrence_id: row.occurrence_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    navigation_label: relatedRouteIds.length ? 'route-linked observed usage' : 'observed usage only',
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    work_title: row.work_title,
    work_slug: row.work_slug,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    context_focus_marked: row.context_focus_marked,
    related_route_ids: relatedRouteIds,
    provenance_id: row.provenance_id,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    collision_ids: Array.isArray(row.collision_ids) ? row.collision_ids : [],
    collision_kinds: Array.isArray(row.collision_kinds) ? row.collision_kinds : [],
    collision_keys: Array.isArray(row.collision_keys) ? row.collision_keys : [],
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
  };
}

function buildCounts(rows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const sourceRefs = new Set();
  const workAnchors = new Set();
  const works = new Set();
  const clusters = new Set();
  const frames = new Set();
  const routeIds = new Set();
  const licenses = new Set();
  const licenseUrls = new Set();
  const versionTitles = new Set();
  const versionSources = new Set();
  let rowsWithSourceLink = 0;
  let rowsWithWorkAnchor = 0;
  let rowsWithHebrewContext = 0;
  let rowsWithFocusMarker = 0;
  let rowsWithLicense = 0;
  let rowsWithVersion = 0;
  let rowsWithRouteIds = 0;
  let observedUsageOnlyRows = 0;
  let readerFacingRows = 0;
  let collisionMemberRows = 0;
  let collisionMemberships = 0;
  let mojibakeRows = 0;
  let routePayloadFieldHits = 0;
  let forbiddenAuthorityFieldHits = 0;

  for (const row of rows) {
    sourceRefs.add(row.source_ref);
    workAnchors.add(row.work_anchor_href);
    works.add(row.work_slug || row.work_title);
    clusters.add(row.cluster_id);
    frames.add(row.usage_frame_label);
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    for (const routeId of row.related_route_ids || []) routeIds.add(routeId);
    if (row.license) licenses.add(row.license);
    if (row.license_url) licenseUrls.add(row.license_url);
    if (row.version_title) versionTitles.add(row.version_title);
    if (row.version_source) versionSources.add(row.version_source);
    if (row.source_href) rowsWithSourceLink += 1;
    if (row.work_anchor_href) rowsWithWorkAnchor += 1;
    if (hasHebrew(row.context_focus_marked)) rowsWithHebrewContext += 1;
    if (String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')) rowsWithFocusMarker += 1;
    if (row.license && row.license_url) rowsWithLicense += 1;
    if (row.version_title && row.version_source) rowsWithVersion += 1;
    if (Array.isArray(row.related_route_ids) && row.related_route_ids.length) rowsWithRouteIds += 1;
    if (row.usage_boundary?.observed_usage_only === true) observedUsageOnlyRows += 1;
    if (row.usage_boundary?.reader_facing !== false) readerFacingRows += 1;
    if ((row.collision_ids || []).length) collisionMemberRows += 1;
    collisionMemberships += (row.collision_ids || []).length;
    if (hasMojibake(`${row.token_key} ${row.token_surface} ${row.context_focus_marked}`)) mojibakeRows += 1;
    routePayloadFieldHits += countExactKeys(row, ['route_payload', 'route_payloads']);
    forbiddenAuthorityFieldHits += countExactKeys(row, [
      'definition',
      'definition_text',
      'meaning',
      'meaning_claim',
      'translation',
      'translation_text',
      'accepted_translation',
      'final_answer',
      'winner',
    ]);
  }

  return {
    occurrence_link_rows: rows.length,
    unique_source_refs: sourceRefs.size,
    unique_work_anchors: workAnchors.size,
    unique_works: works.size,
    cluster_ids: clusters.size,
    usage_frames: frames.size,
    unique_route_ids: routeIds.size,
    unique_licenses: licenses.size,
    unique_license_urls: licenseUrls.size,
    unique_version_titles: versionTitles.size,
    unique_version_sources: versionSources.size,
    status_counts: statusCounts,
    rows_with_source_link: rowsWithSourceLink,
    rows_with_work_anchor: rowsWithWorkAnchor,
    rows_with_hebrew_context: rowsWithHebrewContext,
    rows_with_focus_marker: rowsWithFocusMarker,
    rows_with_license: rowsWithLicense,
    rows_with_version: rowsWithVersion,
    rows_with_route_ids: rowsWithRouteIds,
    collision_member_rows: collisionMemberRows,
    collision_memberships: collisionMemberships,
    observed_usage_only_rows: observedUsageOnlyRows,
    reader_facing_rows: readerFacingRows,
    mojibake_rows: mojibakeRows,
    audit_only_ambiguous_rows_available: Number(usageConcordance.counts?.audit_only_counts?.ambiguous || 0),
    audit_only_ambiguous_rows_emitted: 0,
    route_payload_field_hits: routePayloadFieldHits,
    forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  };
}

function buildChecks(counts) {
  return [
    check('occurrence_links_present', counts.occurrence_link_rows > 0 ? 'passed' : 'failed', `rows ${counts.occurrence_link_rows}`),
    check('source_links_complete', counts.rows_with_source_link === counts.occurrence_link_rows ? 'passed' : 'failed', `${counts.rows_with_source_link}/${counts.occurrence_link_rows}`),
    check('work_anchors_complete', counts.rows_with_work_anchor === counts.occurrence_link_rows ? 'passed' : 'failed', `${counts.rows_with_work_anchor}/${counts.occurrence_link_rows}`),
    check('hebrew_context_complete', counts.rows_with_hebrew_context === counts.occurrence_link_rows && counts.rows_with_focus_marker === counts.occurrence_link_rows && counts.mojibake_rows === 0 ? 'passed' : 'failed', `context/focus/mojibake ${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}/${counts.mojibake_rows}`),
    check('source_license_version_complete', counts.rows_with_license === counts.occurrence_link_rows && counts.rows_with_version === counts.occurrence_link_rows ? 'passed' : 'failed', `license/version ${counts.rows_with_license}/${counts.rows_with_version}`),
    check('route_ids_only_present', counts.unique_route_ids > 0 && counts.rows_with_route_ids === counts.occurrence_link_rows && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}; route rows ${counts.rows_with_route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('status_counts_cover_rows', sumStatusCounts(counts.status_counts) === counts.occurrence_link_rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; rows ${counts.occurrence_link_rows}`),
    check('audit_only_ambiguous_not_emitted', counts.audit_only_ambiguous_rows_available > 0 && counts.audit_only_ambiguous_rows_emitted === 0 ? 'passed' : 'failed', `available ${counts.audit_only_ambiguous_rows_available}; emitted ${counts.audit_only_ambiguous_rows_emitted}`),
    check('usage_only_boundary', counts.observed_usage_only_rows === counts.occurrence_link_rows && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `observed ${counts.observed_usage_only_rows}; reader-facing ${counts.reader_facing_rows}`),
    check('forbidden_authority_absent', counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `forbidden hits ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Occurrence Links',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence link rows: ${artifact.counts.occurrence_link_rows}`,
    `- Source refs / work anchors / works: ${artifact.counts.unique_source_refs}/${artifact.counts.unique_work_anchors}/${artifact.counts.unique_works}`,
    `- Supported/candidate/weak rows: ${artifact.counts.status_counts.supported}/${artifact.counts.status_counts.candidate}/${artifact.counts.status_counts.weak}`,
    `- Usage frames / clusters: ${artifact.counts.usage_frames}/${artifact.counts.cluster_ids}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- License/version rows complete: ${artifact.counts.rows_with_license}/${artifact.counts.rows_with_version}`,
    `- Hebrew context/focus/mojibake rows: ${artifact.counts.rows_with_hebrew_context}/${artifact.counts.rows_with_focus_marker}/${artifact.counts.mojibake_rows}`,
    `- Audit-only ambiguous rows available/emitted: ${artifact.counts.audit_only_ambiguous_rows_available}/${artifact.counts.audit_only_ambiguous_rows_emitted}`,
    `- Observed-usage-only / reader-facing rows: ${artifact.counts.observed_usage_only_rows}/${artifact.counts.reader_facing_rows}`,
    `- Route payload / forbidden authority hits: ${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Sample Links',
    '',
    '| source | work anchor | status | score | frame | route IDs | license | context |',
    '|---|---|---|---:|---|---|---|---|',
    ...artifact.occurrence_links.slice(0, 12).map((row) => [
      `[${row.source_ref}](${row.source_href})`,
      `[${row.work_title}](${row.work_anchor_href})`,
      row.status,
      row.raw_score,
      row.usage_frame_label,
      row.related_route_ids.join(', '),
      `${row.license} (${row.version_title})`,
      row.context_focus_marked,
    ].map(mdCell).join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'Rows are observed usage/navigation links only. They are not reviewed lexical authority, semantic arbitration, route ranking, visible answer selection, publication support, or accepted translation text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function countExactKeys(value, keys) {
  const forbidden = new Set(keys);
  let count = 0;
  walk(value);
  return count;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) count += 1;
      walk(child);
    }
  }
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasMojibake(value) {
  return /[\u00d7\u00d6\ufffd]/.test(String(value || ''));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-navigation-index=')) parsed.selectedNavigationIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-concordance=')) parsed.usageConcordance = cleanRelativePath(valueAfterEquals(arg));
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
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, value, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
