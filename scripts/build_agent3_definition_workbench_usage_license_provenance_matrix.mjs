import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT = 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json';
const ROUTE_POINTER = 'data/definitions/definition-workbench-usage-route-pointer-audit.json';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-license-provenance-matrix.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-license-provenance-matrix.md';

const ALLOWED_LICENSES = new Set(['Public Domain', 'CC0', 'CC-BY', 'CC-BY-SA']);
const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_metadata',
  'agent2_payload',
  'agent2_payloads',
]);

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && String(value) !== ''))].sort();
}

function inc(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function objectFromMap(map) {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function rowKey(parts) {
  return parts.map((part) => String(part ?? '')).join('||');
}

function splitKey(key) {
  return String(key).split('||');
}

function isAuthorityValue(value) {
  if (value === false || value === null || value === undefined || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function scanForbiddenAuthorityValues(value, relPath, hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenAuthorityValues(item, `${relPath}[${index}]`, hits));
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key) && isAuthorityValue(child)) {
      hits.push({ path: relPath, key });
    }
    scanForbiddenAuthorityValues(child, `${relPath}.${key}`, hits);
  }
  return hits;
}

function check(id, status, detail) {
  return { id, status, detail };
}

const packet = readJson(INPUT);
const pointer = readJson(ROUTE_POINTER);
if (packet.artifact_type !== 'definition_workbench_usage_concordance_navigation_packet') {
  throw new Error(`${INPUT} must be definition_workbench_usage_concordance_navigation_packet`);
}
if (pointer.artifact_type !== 'definition_workbench_usage_route_pointer_audit') {
  throw new Error(`${ROUTE_POINTER} must be definition_workbench_usage_route_pointer_audit`);
}

const rows = packet.navigation_rows || [];
const licenseCounts = new Map();
const licenseUrlCounts = new Map();
const versionSourceCounts = new Map();
const statusCounts = new Map();
const categoryCounts = new Map();
const routeCounts = new Map();
const licenseCategoryStatus = new Map();
const licenseVersionRows = new Map();
const licenseCategoryRows = new Map();
const licenseRouteRows = new Map();

let metadataCompleteRows = 0;
let allowedLicenseRows = 0;
let readerFacingRows = 0;
let routePayloadFieldHits = 0;
let forbiddenAuthorityFieldHits = 0;
let observedUsageOnlyRows = 0;

for (const row of rows) {
  const license = row.license || 'missing';
  const licenseUrl = row.license_url || 'missing';
  const versionTitle = row.version_title || 'missing';
  const versionSource = row.version_source || 'missing';
  const status = row.status || 'missing';
  const category = row.category || 'missing';
  const routeIds = row.related_agent2_route_ids || [];

  inc(licenseCounts, license);
  inc(licenseUrlCounts, licenseUrl);
  inc(versionSourceCounts, versionSource);
  inc(statusCounts, status);
  inc(categoryCounts, category);
  for (const routeId of routeIds) inc(routeCounts, routeId);

  inc(licenseCategoryStatus, rowKey([license, category, status]));
  inc(licenseVersionRows, rowKey([license, licenseUrl, versionTitle, versionSource]));
  inc(licenseCategoryRows, rowKey([license, category]));
  for (const routeId of routeIds) inc(licenseRouteRows, rowKey([license, routeId]));

  if (ALLOWED_LICENSES.has(license)) allowedLicenseRows += 1;
  if (
    row.occurrence_id &&
    row.token_key &&
    row.source_ref &&
    /^https:\/\//.test(row.source_url || '') &&
    (row.local_work_anchor || row.local_work_page_anchor) &&
    row.work_id &&
    row.work_title &&
    row.work_slug &&
    row.phrase_context_snippet &&
    row.focus_normalized &&
    row.license &&
    row.license_url &&
    row.version_title &&
    row.version_source &&
    routeIds.length > 0
  ) {
    metadataCompleteRows += 1;
  }
  if (row.reader_facing === true || row.usage_boundary?.reader_facing === true) readerFacingRows += 1;
  if (Object.hasOwn(row, 'route_payload') || Object.hasOwn(row, 'route_payloads')) routePayloadFieldHits += 1;
  if (row.row_label === 'observed usage only' || row.usage_boundary?.observed_usage_only === true) observedUsageOnlyRows += 1;
  forbiddenAuthorityFieldHits += scanForbiddenAuthorityValues(row, row.occurrence_id || 'row').length;
}

const license_status_category_rows = [...licenseCategoryStatus.entries()]
  .map(([key, row_count]) => {
    const [license, category, status] = splitKey(key);
    return { license, category, status, row_count };
  })
  .sort((a, b) => b.row_count - a.row_count || a.license.localeCompare(b.license) || a.category.localeCompare(b.category) || a.status.localeCompare(b.status));

const license_version_rows = [...licenseVersionRows.entries()]
  .map(([key, row_count]) => {
    const [license, license_url, version_title, version_source] = splitKey(key);
    const works = unique(rows.filter((row) => rowKey([row.license, row.license_url, row.version_title, row.version_source]) === key).map((row) => row.work_id));
    return { license, license_url, version_title, version_source, row_count, work_count: works.length, sample_work_ids: works.slice(0, 20) };
  })
  .sort((a, b) => b.row_count - a.row_count || a.license.localeCompare(b.license) || a.version_title.localeCompare(b.version_title));

const license_category_rows = [...licenseCategoryRows.entries()]
  .map(([key, row_count]) => {
    const [license, category] = splitKey(key);
    return { license, category, row_count };
  })
  .sort((a, b) => b.row_count - a.row_count || a.license.localeCompare(b.license) || a.category.localeCompare(b.category));

const license_route_rows = [...licenseRouteRows.entries()]
  .map(([key, row_count]) => {
    const [license, route_id] = splitKey(key);
    return { license, route_id, row_count };
  })
  .sort((a, b) => b.row_count - a.row_count || a.license.localeCompare(b.license) || a.route_id.localeCompare(b.route_id));

const license_summary_rows = [...licenseCounts.entries()]
  .map(([license, row_count]) => {
    const matchingRows = rows.filter((row) => row.license === license);
    return {
      license,
      row_count,
      license_urls: unique(matchingRows.map((row) => row.license_url)),
      categories: unique(matchingRows.map((row) => row.category)),
      statuses: unique(matchingRows.map((row) => row.status)),
      works: unique(matchingRows.map((row) => row.work_id)).length,
      version_sources: unique(matchingRows.map((row) => row.version_source)).length,
      allowed_for_usage_navigation: ALLOWED_LICENSES.has(license),
    };
  })
  .sort((a, b) => b.row_count - a.row_count || a.license.localeCompare(b.license));

const counts = {
  navigation_rows: rows.length,
  license_count: licenseCounts.size,
  license_url_count: licenseUrlCounts.size,
  allowed_license_rows: allowedLicenseRows,
  disallowed_license_rows: rows.length - allowedLicenseRows,
  version_source_count: versionSourceCounts.size,
  category_count: categoryCounts.size,
  status_count: statusCounts.size,
  route_ids: routeCounts.size,
  route_pointer_rows: Number(pointer.counts?.route_pointer_rows || 0),
  route_pointer_payload_hits: Number(pointer.counts?.route_payload_field_hits || 0),
  route_pointer_metadata_hits: Number(pointer.counts?.route_metadata_field_hits || 0),
  metadata_complete_rows: metadataCompleteRows,
  observed_usage_only_rows: observedUsageOnlyRows,
  reader_facing_rows: readerFacingRows,
  route_payload_field_hits: routePayloadFieldHits,
  forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  license_status_category_rows: license_status_category_rows.length,
  license_version_rows: license_version_rows.length,
  license_category_rows: license_category_rows.length,
  license_route_rows: license_route_rows.length,
  source_text_read: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const checks = [
  check('navigation_rows_present', counts.navigation_rows > 0 ? 'passed' : 'failed', `rows ${counts.navigation_rows}`),
  check('license_metadata_complete', counts.metadata_complete_rows === counts.navigation_rows && counts.allowed_license_rows === counts.navigation_rows && counts.disallowed_license_rows === 0 ? 'passed' : 'failed', `metadata/allowed/disallowed ${counts.metadata_complete_rows}/${counts.allowed_license_rows}/${counts.disallowed_license_rows}`),
  check('license_spread_visible', counts.license_count > 1 && counts.license_url_count > 1 && counts.version_source_count > 1 ? 'passed' : 'failed', `licenses/license URLs/version sources ${counts.license_count}/${counts.license_url_count}/${counts.version_source_count}`),
  check('category_status_spread_visible', counts.category_count > 1 && counts.status_count === 3 ? 'passed' : 'failed', `categories/statuses ${counts.category_count}/${counts.status_count}`),
  check('route_pointer_boundary_visible', counts.route_ids === 1 && counts.route_pointer_rows === 1 && counts.route_pointer_payload_hits === 0 && counts.route_pointer_metadata_hits === 0 ? 'passed' : 'warning', `route IDs/pointers/payload/metadata ${counts.route_ids}/${counts.route_pointer_rows}/${counts.route_pointer_payload_hits}/${counts.route_pointer_metadata_hits}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === counts.navigation_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_license_provenance_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_license_provenance_matrix.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  source_artifacts: {
    concordance_navigation_packet: INPUT,
    route_pointer_audit: ROUTE_POINTER,
  },
  policy: 'Agent 3 usage-navigation license/provenance matrix over existing concordance rows only. It preserves source/license/version/category/status visibility and route IDs only. It does not read source text, import sources, expand targets, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.',
  authority_boundary: {
    observed_usage_only: true,
    license_provenance_navigation_only: true,
    route_ids_only: true,
    source_text_read: false,
    broad_target_expansion: false,
    reader_facing: false,
    lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_agent2_payloads: false,
    publication_claim: false,
    source_provenance_custody_claim: false,
    accepted_text_claim: false,
    agent6_acceptance_claim: false,
  },
  counts,
  checks,
  license_counts: objectFromMap(licenseCounts),
  license_url_counts: objectFromMap(licenseUrlCounts),
  version_source_counts: objectFromMap(versionSourceCounts),
  category_counts: objectFromMap(categoryCounts),
  status_counts: objectFromMap(statusCounts),
  route_counts: objectFromMap(routeCounts),
  license_summary_rows,
  license_version_rows,
  license_category_rows,
  license_status_category_rows,
  license_route_rows,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const md = `# Agent 3 Definition Workbench Usage License Provenance Matrix

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is usage-navigation provenance evidence only and does not claim Agent 6 acceptance.

## Scope

This packet indexes license, version, category, status, and route-ID coverage for existing Agent 3 concordance navigation rows only. It does not read source text, import sources, expand targets, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim source/provenance custody acceptance.

## Counts

- Navigation rows: ${counts.navigation_rows}
- Licenses / license URLs / version sources: ${counts.license_count}/${counts.license_url_count}/${counts.version_source_count}
- Categories / statuses / route IDs: ${counts.category_count}/${counts.status_count}/${counts.route_ids}
- Metadata complete / allowed-license / disallowed-license rows: ${counts.metadata_complete_rows}/${counts.allowed_license_rows}/${counts.disallowed_license_rows}
- Matrix rows license-version / license-category / license-category-status / license-route: ${counts.license_version_rows}/${counts.license_category_rows}/${counts.license_status_category_rows}/${counts.license_route_rows}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## License Summary

| license | rows | allowed | works | version sources | categories |
|---|---:|---:|---:|---:|---|
${license_summary_rows.map((row) => `| ${row.license} | ${row.row_count} | ${row.allowed_for_usage_navigation ? 'yes' : 'no'} | ${row.works} | ${row.version_sources} | ${row.categories.join(', ')} |`).join('\n')}

## License By Category And Status

| license | category | status | rows |
|---|---|---|---:|
${license_status_category_rows.map((row) => `| ${row.license} | ${row.category} | ${row.status} | ${row.row_count} |`).join('\n')}

## Version Sources

| license | version title | version source | rows | works |
|---|---|---|---:|---:|
${license_version_rows.map((row) => `| ${row.license} | ${mdCell(row.version_title)} | ${mdCell(row.version_source)} | ${row.row_count} | ${row.work_count} |`).join('\n')}

## Boundary

Observed usage/navigation only. License and provenance rows are evidence metadata, not Definition authority, not reviewed lexical authority, not route ranking, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not source/provenance custody acceptance, not publication readiness, not copied Agent 2 payloads, and not accepted text.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; rows ${counts.navigation_rows}; licenses ${counts.license_count}; version sources ${counts.version_source_count}`);

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
