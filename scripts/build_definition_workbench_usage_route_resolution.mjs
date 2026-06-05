#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  routeSource: 'data/definitions/hud-route-store-sample.json',
  output: 'data/definitions/definition-workbench-usage-route-resolution.json',
  report: 'reports/definition-workbench-usage-route-resolution.md',
};

const options = parseArgs(process.argv.slice(2));
const occurrenceLinks = readJson(options.occurrenceLinks);
const routeSource = readJson(options.routeSource);

if (occurrenceLinks.artifact_type !== 'definition_workbench_usage_occurrence_links') {
  throw new Error(`${options.occurrenceLinks} is not a Definition Workbench usage occurrence-links packet`);
}

const routeRecords = collectRouteRecords(routeSource);
const occurrenceRouteRows = [];
const routeBuckets = new Map();

for (const row of occurrenceLinks.occurrence_links || []) {
  for (const routeId of row.related_route_ids || []) {
    const record = routeRecords.get(routeId) || null;
    const resolutionStatus = record ? 'resolved' : 'unresolved';
    const occurrenceRouteRow = {
      row_id: row.row_id,
      occurrence_id: row.occurrence_id,
      route_id: routeId,
      route_source: options.routeSource,
      resolution_status: resolutionStatus,
      source_ref: row.source_ref,
      status: row.status,
      cluster_id: row.cluster_id,
      usage_frame_label: row.usage_frame_label,
      route_metadata: record ? safeRouteMetadata(record) : null,
      usage_boundary: {
        observed_usage_only: true,
        reader_facing: false,
        route_ids_only: true,
        route_payload_copied: false,
        not_definition_authority: true,
      },
    };
    occurrenceRouteRows.push(occurrenceRouteRow);
    if (!routeBuckets.has(routeId)) {
      routeBuckets.set(routeId, {
        route_id: routeId,
        route_source: options.routeSource,
        resolution_status: resolutionStatus,
        route_metadata: record ? safeRouteMetadata(record) : null,
        occurrence_link_rows: 0,
        source_refs: new Set(),
        works: new Set(),
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        cluster_counts: {},
      });
    }
    const bucket = routeBuckets.get(routeId);
    bucket.occurrence_link_rows += 1;
    bucket.source_refs.add(row.source_ref);
    bucket.works.add(row.work_slug || row.work_title);
    if (Object.hasOwn(bucket.status_counts, row.status)) bucket.status_counts[row.status] += 1;
    bucket.cluster_counts[row.cluster_id] = Number(bucket.cluster_counts[row.cluster_id] || 0) + 1;
    if (resolutionStatus === 'unresolved') bucket.resolution_status = 'unresolved';
  }
}

const routes = [...routeBuckets.values()].map((bucket) => ({
  ...bucket,
  source_refs: bucket.source_refs.size,
  works: bucket.works.size,
  cluster_counts: sortObjectByValue(bucket.cluster_counts),
})).sort((a, b) => a.route_id.localeCompare(b.route_id));
const counts = buildCounts(routes, occurrenceRouteRows);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_route_resolution',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_route_resolution.mjs',
  policy: 'Agent 3 route-ID resolution audit for Definition Workbench usage occurrence links. It proves selected occurrence links resolve to Agent 2 route IDs through local route-source files while copying only safe route metadata; it does not copy definitions, rank routes, choose visible answers, translate, or publish.',
  inputs: {
    occurrence_links: options.occurrenceLinks,
    route_source: options.routeSource,
  },
  authority_policy: {
    usage_navigation_only: true,
    route_ids_only: true,
    route_resolution_only: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    publication_claim: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  routes,
  occurrence_route_rows: occurrenceRouteRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage route resolution ${artifact.quality.status}; route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`);

function collectRouteRecords(value, records = new Map()) {
  if (Array.isArray(value)) {
    for (const item of value) collectRouteRecords(item, records);
    return records;
  }
  if (!value || typeof value !== 'object') return records;
  const id = value.route_id || value.card_id || value.claim_id || value.evidence_id || null;
  if (typeof id === 'string' && id.trim() && !records.has(id)) records.set(id, value);
  for (const item of Object.values(value)) collectRouteRecords(item, records);
  return records;
}

function safeRouteMetadata(record) {
  const sourceLicenseProfile = buildSourceLicenseProfile(record.source_rows || []);
  return {
    normalized: record.normalized || null,
    surface: record.surface || null,
    route_family: record.route_family || null,
    route_type: record.route_type || null,
    display_section: record.display_section || null,
    language: record.language || null,
    answer_eligible: record.answer_eligible === true,
    source_license_profile: sourceLicenseProfile,
    future_accepted_translation_output: {
      accepted_translation_output: false,
      publication_readiness: false,
      requires_future_translation_review: true,
      status: 'blocked_route_resolution_only',
      reason: 'Route-resolution metadata is not accepted translation text and does not clear future translation-output review.',
    },
  };
}

function buildSourceLicenseProfile(sourceRows) {
  const rows = sourceRows.map((row) => ({
    source_name: row.source_name || null,
    source_family: row.source_family || null,
    source_id: row.source_id || null,
    source_url: row.source_url || null,
    license: row.license || null,
    license_url: row.license_url || null,
    fields_used: Array.isArray(row.fields_used) ? row.fields_used : [],
    notes: row.notes || null,
  }));
  const incompleteRows = rows.filter((row) => !row.source_name || !row.source_id || !row.source_url || !row.license || !row.license_url).length;
  const forbiddenRows = rows.filter((row) => hasForbiddenLicense(row.license)).length;
  return {
    complete: rows.length > 0 && incompleteRows === 0,
    row_count: rows.length,
    incomplete_rows: incompleteRows,
    forbidden_license_detected: forbiddenRows > 0,
    forbidden_license_rows: forbiddenRows,
    license_families: [...new Set(rows.map((row) => row.license).filter(Boolean))].sort(),
    rows,
  };
}

function hasForbiddenLicense(license) {
  const normalized = String(license || '').toLowerCase();
  return !normalized
    || normalized.includes('noncommercial')
    || normalized.includes('cc-by-nc')
    || normalized.includes('cc by-nc')
    || normalized.includes('cc-by-nc')
    || normalized.includes('all rights reserved')
    || normalized.includes('unclear')
    || normalized.includes('unknown');
}

function buildCounts(routesToCount, occurrenceRows) {
  const sourceRefs = new Set(occurrenceRows.map((row) => row.source_ref).filter(Boolean));
  const clusters = new Set(occurrenceRows.map((row) => row.cluster_id).filter(Boolean));
  const frames = new Set(occurrenceRows.map((row) => row.usage_frame_label).filter(Boolean));
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let resolvedRows = 0;
  let unresolvedRows = 0;
  let answerEligibleRows = 0;
  let answerEligibleRowsWithSourceLicenseProfile = 0;
  let sourceLicenseProfileCompleteRows = 0;
  let forbiddenLicenseProfileRows = 0;
  let futureTranslationOutputBlockedRows = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  let forbiddenAuthorityFieldHits = 0;
  for (const row of occurrenceRows) {
    if (row.resolution_status === 'resolved') resolvedRows += 1;
    else unresolvedRows += 1;
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    const metadata = row.route_metadata || {};
    const sourceLicenseProfile = metadata.source_license_profile || {};
    if (metadata.answer_eligible === true) {
      answerEligibleRows += 1;
      if (sourceLicenseProfile.complete === true) answerEligibleRowsWithSourceLicenseProfile += 1;
    }
    if (sourceLicenseProfile.complete === true) sourceLicenseProfileCompleteRows += 1;
    if (sourceLicenseProfile.forbidden_license_detected === true) forbiddenLicenseProfileRows += 1;
    if (metadata.future_accepted_translation_output?.accepted_translation_output === false) {
      futureTranslationOutputBlockedRows += 1;
    }
    if (row.usage_boundary?.reader_facing !== false) readerFacingRows += 1;
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
    occurrence_link_rows: Number(occurrenceLinks.counts?.occurrence_link_rows || 0),
    occurrence_route_rows: occurrenceRows.length,
    route_ids: routesToCount.length,
    resolved_route_ids: routesToCount.filter((route) => route.resolution_status === 'resolved').length,
    unresolved_route_ids: routesToCount.filter((route) => route.resolution_status !== 'resolved').length,
    resolved_occurrence_route_rows: resolvedRows,
    unresolved_occurrence_route_rows: unresolvedRows,
    answer_eligible_occurrence_route_rows: answerEligibleRows,
    answer_eligible_rows_with_source_license_profile: answerEligibleRowsWithSourceLicenseProfile,
    source_license_profile_complete_rows: sourceLicenseProfileCompleteRows,
    forbidden_license_profile_rows: forbiddenLicenseProfileRows,
    future_translation_output_blocked_rows: futureTranslationOutputBlockedRows,
    source_refs: sourceRefs.size,
    cluster_ids: clusters.size,
    usage_frames: frames.size,
    status_counts: statusCounts,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
    forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  };
}

function buildChecks(counts) {
  return [
    check('route_rows_present', counts.occurrence_route_rows > 0 && counts.route_ids > 0 ? 'passed' : 'failed', `occurrence route rows ${counts.occurrence_route_rows}; route IDs ${counts.route_ids}`),
    check('all_routes_resolved', counts.unresolved_route_ids === 0 && counts.unresolved_occurrence_route_rows === 0 ? 'passed' : 'failed', `unresolved route IDs ${counts.unresolved_route_ids}; unresolved rows ${counts.unresolved_occurrence_route_rows}`),
    check('occurrence_rows_covered', counts.occurrence_route_rows === counts.occurrence_link_rows ? 'passed' : 'failed', `route rows ${counts.occurrence_route_rows}; occurrence links ${counts.occurrence_link_rows}`),
    check('status_counts_cover_rows', sumStatusCounts(counts.status_counts) === counts.occurrence_route_rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; rows ${counts.occurrence_route_rows}`),
    check('route_metadata_safe', counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `route payload hits ${counts.route_payload_field_hits}; forbidden hits ${counts.forbidden_authority_field_hits}`),
    check('answer_eligible_source_license_profile', counts.answer_eligible_occurrence_route_rows === counts.answer_eligible_rows_with_source_license_profile ? 'passed' : 'failed', `answer eligible rows ${counts.answer_eligible_occurrence_route_rows}; with complete source/license profile ${counts.answer_eligible_rows_with_source_license_profile}`),
    check('forbidden_license_profile_absent', counts.forbidden_license_profile_rows === 0 ? 'passed' : 'failed', `forbidden license profile rows ${counts.forbidden_license_profile_rows}`),
    check('future_translation_output_blocked', counts.future_translation_output_blocked_rows === counts.occurrence_route_rows ? 'passed' : 'failed', `blocked rows ${counts.future_translation_output_blocked_rows}; occurrence route rows ${counts.occurrence_route_rows}`),
    check('usage_only_boundary', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Route Resolution',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence route rows: ${artifact.counts.occurrence_route_rows}`,
    `- Route IDs resolved/unresolved: ${artifact.counts.resolved_route_ids}/${artifact.counts.unresolved_route_ids}`,
    `- Occurrence route rows resolved/unresolved: ${artifact.counts.resolved_occurrence_route_rows}/${artifact.counts.unresolved_occurrence_route_rows}`,
    `- Answer-eligible rows with source/license profile: ${artifact.counts.answer_eligible_rows_with_source_license_profile}/${artifact.counts.answer_eligible_occurrence_route_rows}`,
    `- Complete source/license profile rows: ${artifact.counts.source_license_profile_complete_rows}`,
    `- Forbidden license profile rows: ${artifact.counts.forbidden_license_profile_rows}`,
    `- Future accepted-translation output blocked rows: ${artifact.counts.future_translation_output_blocked_rows}`,
    `- Source refs / clusters / frames: ${artifact.counts.source_refs}/${artifact.counts.cluster_ids}/${artifact.counts.usage_frames}`,
    `- Supported/candidate/weak rows: ${artifact.counts.status_counts.supported}/${artifact.counts.status_counts.candidate}/${artifact.counts.status_counts.weak}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Routes',
    '',
    '| route id | source | resolution | occurrence rows | source refs | works | family | type | section |',
    '|---|---|---|---:|---:|---:|---|---|---|',
    ...artifact.routes.map((route) => `| ${mdCell(route.route_id)} | ${mdCell(route.route_source)} | ${route.resolution_status} | ${route.occurrence_link_rows} | ${route.source_refs} | ${route.works} | ${mdCell(route.route_metadata?.route_family)} | ${mdCell(route.route_metadata?.route_type)} | ${mdCell(route.route_metadata?.display_section)} |`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'This packet resolves route IDs only. It intentionally excludes route definitions, glosses, translations, answer text, ranking decisions, and publication claims.',
    '',
    'Answer-eligible route metadata carries compact source/license rows for audit only. Those rows do not clear accepted-translation output, public rendering, or publication readiness.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function sortObjectByValue(value) {
  return Object.fromEntries(Object.entries(value || {}).sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0])));
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

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--occurrence-links=')) parsed.occurrenceLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-source=')) parsed.routeSource = cleanRelativePath(valueAfterEquals(arg));
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
