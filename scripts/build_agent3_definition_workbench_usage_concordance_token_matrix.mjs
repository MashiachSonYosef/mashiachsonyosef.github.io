import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT = 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-concordance-token-matrix.md';
const MAX_SAMPLES = 20;
const REPORT_ROWS = 160;

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

function inc(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function addSample(list, value, limit = MAX_SAMPLES) {
  if (!value || list.includes(value) || list.length >= limit) return;
  list.push(value);
}

function sortedObject(map) {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function sortedValues(set) {
  return [...set].sort();
}

function isAuthorityValue(value) {
  if (value === false || value === null || value === undefined || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function scanForbiddenAuthorityValues(value, hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    value.forEach((item) => scanForbiddenAuthorityValues(item, hits));
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key) && isAuthorityValue(child)) hits.push(key);
    scanForbiddenAuthorityValues(child, hits);
  }
  return hits;
}

function check(id, status, detail) {
  return { id, status, detail };
}

const packet = readJson(INPUT);
if (packet.artifact_type !== 'definition_workbench_usage_concordance_navigation_packet') {
  throw new Error(`${INPUT} must be definition_workbench_usage_concordance_navigation_packet`);
}

const rows = packet.navigation_rows || [];
const tokenMap = new Map();
const roleCounts = new Map();
const categoryCounts = new Map();
const statusCounts = new Map();
const licenseCounts = new Map();
const routeCounts = new Map();
let tokenAppearances = 0;
let rowsWithPhraseTokens = 0;
let rowsWithFocusToken = 0;
let rowsWithContextToken = 0;
let rowsWithObservedUsageLabel = 0;
let readerFacingRows = 0;
let routePayloadFieldHits = 0;
let forbiddenAuthorityFieldHits = 0;
let rowsWithLicenseMetadata = 0;
let rowsWithVersionMetadata = 0;
let rowsWithRouteIds = 0;

for (const row of rows) {
  const phraseTokens = Array.isArray(row.phrase_tokens) ? row.phrase_tokens : [];
  if (phraseTokens.length) rowsWithPhraseTokens += 1;
  if (phraseTokens.some((token) => token.focus_marked === true || token.role === 'focus')) rowsWithFocusToken += 1;
  if (phraseTokens.some((token) => token.role === 'context')) rowsWithContextToken += 1;
  if (row.row_label === 'observed usage only' || row.usage_boundary?.observed_usage_only === true) rowsWithObservedUsageLabel += 1;
  if (row.reader_facing === true || row.usage_boundary?.reader_facing === true) readerFacingRows += 1;
  if (Object.hasOwn(row, 'route_payload') || Object.hasOwn(row, 'route_payloads')) routePayloadFieldHits += 1;
  forbiddenAuthorityFieldHits += scanForbiddenAuthorityValues(row).length;
  if (row.license && row.license_url) rowsWithLicenseMetadata += 1;
  if (row.version_title && row.version_source) rowsWithVersionMetadata += 1;
  if ((row.related_agent2_route_ids || []).length) rowsWithRouteIds += 1;
  inc(categoryCounts, row.category || 'missing');
  inc(statusCounts, row.status || 'missing');
  inc(licenseCounts, row.license || 'missing');
  for (const routeId of row.related_agent2_route_ids || []) inc(routeCounts, routeId);

  for (const token of phraseTokens) {
    const normalized = token.normalized || token.surface;
    if (!normalized) continue;
    const tokenKey = `he:${normalized}`;
    if (!tokenMap.has(tokenKey)) {
      tokenMap.set(tokenKey, {
        token_key: tokenKey,
        token_normalized: normalized,
        surface_samples: [],
        total_appearances: 0,
        focus_appearances: 0,
        context_appearances: 0,
        repeated_focus_context_appearances: 0,
        occurrence_rows: new Set(),
        source_refs: new Set(),
        works: new Set(),
        categories: new Set(),
        statuses: new Map(),
        licenses: new Set(),
        version_sources: new Set(),
        route_ids: new Set(),
        clusters: new Set(),
        usage_frames: new Set(),
        min_distance_from_focus: null,
        max_distance_from_focus: null,
        sample_occurrences: [],
      });
    }
    const entry = tokenMap.get(tokenKey);
    entry.total_appearances += 1;
    tokenAppearances += 1;
    if (token.role === 'focus' || token.focus_marked === true) entry.focus_appearances += 1;
    else if (token.role === 'repeated_focus_context') entry.repeated_focus_context_appearances += 1;
    else entry.context_appearances += 1;
    inc(roleCounts, token.role || (token.focus_marked ? 'focus' : 'context'));
    addSample(entry.surface_samples, token.surface);
    entry.occurrence_rows.add(row.occurrence_id);
    entry.source_refs.add(row.source_ref);
    entry.works.add(row.work_id);
    entry.categories.add(row.category);
    inc(entry.statuses, row.status || 'missing');
    entry.licenses.add(row.license);
    entry.version_sources.add(row.version_source);
    for (const routeId of row.related_agent2_route_ids || []) entry.route_ids.add(routeId);
    entry.clusters.add(row.cluster_id);
    entry.usage_frames.add(row.usage_frame_label);
    const distance = Number(token.distance_from_focus);
    if (Number.isFinite(distance)) {
      entry.min_distance_from_focus = entry.min_distance_from_focus === null ? distance : Math.min(entry.min_distance_from_focus, distance);
      entry.max_distance_from_focus = entry.max_distance_from_focus === null ? distance : Math.max(entry.max_distance_from_focus, distance);
    }
    if (entry.sample_occurrences.length < MAX_SAMPLES && !entry.sample_occurrences.some((sample) => sample.occurrence_id === row.occurrence_id)) {
      entry.sample_occurrences.push({
        occurrence_id: row.occurrence_id,
        source_ref: row.source_ref,
        source_url: row.source_url,
        local_work_anchor: row.local_work_anchor || row.local_work_page_anchor,
        work_id: row.work_id,
        status: row.status,
        usage_frame_label: row.usage_frame_label,
        cluster_id: row.cluster_id,
        role: token.role || (token.focus_marked ? 'focus' : 'context'),
        distance_from_focus: Number.isFinite(distance) ? distance : null,
        related_agent2_route_ids: row.related_agent2_route_ids || [],
        license: row.license,
        license_url: row.license_url,
        version_title: row.version_title,
        version_source: row.version_source,
        row_label: 'observed usage only',
      });
    }
  }
}

const token_rows = [...tokenMap.values()]
  .map((entry) => ({
    token_key: entry.token_key,
    token_normalized: entry.token_normalized,
    surface_samples: entry.surface_samples,
    total_appearances: entry.total_appearances,
    focus_appearances: entry.focus_appearances,
    context_appearances: entry.context_appearances,
    repeated_focus_context_appearances: entry.repeated_focus_context_appearances,
    occurrence_row_count: entry.occurrence_rows.size,
    source_ref_count: entry.source_refs.size,
    work_count: entry.works.size,
    categories: sortedValues(entry.categories),
    status_counts: sortedObject(entry.statuses),
    licenses: sortedValues(entry.licenses),
    version_source_count: entry.version_sources.size,
    route_ids: sortedValues(entry.route_ids),
    cluster_ids: sortedValues(entry.clusters),
    usage_frame_labels: sortedValues(entry.usage_frames),
    min_distance_from_focus: entry.min_distance_from_focus,
    max_distance_from_focus: entry.max_distance_from_focus,
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
    sample_occurrences: entry.sample_occurrences,
  }))
  .sort((a, b) => b.total_appearances - a.total_appearances || b.occurrence_row_count - a.occurrence_row_count || a.token_key.localeCompare(b.token_key));

const repeated_across_work_tokens = token_rows.filter((row) => row.work_count > 1);
const cross_category_tokens = token_rows.filter((row) => row.categories.length > 1);
const focus_tokens = token_rows.filter((row) => row.focus_appearances > 0);
const counts = {
  source_navigation_rows: rows.length,
  token_rows: token_rows.length,
  token_appearances: tokenAppearances,
  rows_with_phrase_tokens: rowsWithPhraseTokens,
  rows_with_focus_token: rowsWithFocusToken,
  rows_with_context_token: rowsWithContextToken,
  focus_token_rows: focus_tokens.length,
  repeated_across_work_token_rows: repeated_across_work_tokens.length,
  cross_category_token_rows: cross_category_tokens.length,
  max_token_appearances: token_rows[0]?.total_appearances || 0,
  max_token_occurrence_rows: token_rows[0]?.occurrence_row_count || 0,
  categories: categoryCounts.size,
  statuses: statusCounts.size,
  licenses: licenseCounts.size,
  route_ids: routeCounts.size,
  rows_with_license_metadata: rowsWithLicenseMetadata,
  rows_with_version_metadata: rowsWithVersionMetadata,
  rows_with_route_ids: rowsWithRouteIds,
  observed_usage_only_rows: rowsWithObservedUsageLabel,
  reader_facing_rows: readerFacingRows,
  route_payload_field_hits: routePayloadFieldHits,
  forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  source_text_read: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const checks = [
  check('source_rows_present', counts.source_navigation_rows > 0 ? 'passed' : 'failed', `rows ${counts.source_navigation_rows}`),
  check('phrase_token_coverage_complete', counts.rows_with_phrase_tokens === counts.source_navigation_rows && counts.rows_with_focus_token === counts.source_navigation_rows && counts.rows_with_context_token === counts.source_navigation_rows ? 'passed' : 'failed', `phrase/focus/context ${counts.rows_with_phrase_tokens}/${counts.rows_with_focus_token}/${counts.rows_with_context_token}`),
  check('token_matrix_nonzero', counts.token_rows > 0 && counts.token_appearances > counts.source_navigation_rows ? 'passed' : 'failed', `tokens/appearances ${counts.token_rows}/${counts.token_appearances}`),
  check('cross_navigation_visible', counts.repeated_across_work_token_rows > 0 && counts.cross_category_token_rows > 0 ? 'passed' : 'failed', `repeated-work/cross-category ${counts.repeated_across_work_token_rows}/${counts.cross_category_token_rows}`),
  check('metadata_complete', counts.rows_with_license_metadata === counts.source_navigation_rows && counts.rows_with_version_metadata === counts.source_navigation_rows && counts.rows_with_route_ids === counts.source_navigation_rows ? 'passed' : 'failed', `license/version/route ${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}/${counts.rows_with_route_ids}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === counts.source_navigation_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('route_concentration_visible', counts.route_ids === 1 ? 'warning' : 'passed', `route IDs ${counts.route_ids}`),
  check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_concordance_token_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_concordance_token_matrix.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  source_artifacts: {
    concordance_navigation_packet: INPUT,
  },
  policy: 'Agent 3 concordance token matrix over existing usage-navigation phrase tokens only. It supports usage navigation and cross-reference search. It does not read source text, import sources, expand targets, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.',
  authority_boundary: {
    observed_usage_only: true,
    concordance_token_navigation_only: true,
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
  role_counts: sortedObject(roleCounts),
  category_counts: sortedObject(categoryCounts),
  status_counts: sortedObject(statusCounts),
  license_counts: sortedObject(licenseCounts),
  route_counts: sortedObject(routeCounts),
  token_rows,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const reportRows = token_rows.slice(0, REPORT_ROWS);
const md = `# Agent 3 Definition Workbench Usage Concordance Token Matrix

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is usage-navigation token evidence only and does not claim Agent 6 acceptance.

## Scope

This packet indexes normalized Hebrew tokens already present in the ${counts.source_navigation_rows} existing Agent 3 concordance-navigation rows. It supports cross-reference/search navigation and preserves source/license/version/route-ID metadata in samples. It does not read source text, import sources, expand targets, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Counts

- Source navigation rows: ${counts.source_navigation_rows}
- Token rows / appearances: ${counts.token_rows}/${counts.token_appearances}
- Rows with phrase/focus/context tokens: ${counts.rows_with_phrase_tokens}/${counts.rows_with_focus_token}/${counts.rows_with_context_token}
- Focus token rows: ${counts.focus_token_rows}
- Repeated-across-work / cross-category token rows: ${counts.repeated_across_work_token_rows}/${counts.cross_category_token_rows}
- Categories / statuses / licenses / route IDs: ${counts.categories}/${counts.statuses}/${counts.licenses}/${counts.route_ids}
- Metadata complete license/version/route rows: ${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}/${counts.rows_with_route_ids}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Top Token Rows

| token | surfaces | appearances | occurrence rows | focus | context | works | categories | statuses | licenses |
|---|---|---:|---:|---:|---:|---:|---|---|---|
${reportRows.map((row) => `| ${mdCell(row.token_normalized)} | ${mdCell(row.surface_samples.join(', '))} | ${row.total_appearances} | ${row.occurrence_row_count} | ${row.focus_appearances} | ${row.context_appearances + row.repeated_focus_context_appearances} | ${row.work_count} | ${mdCell(row.categories.join(', '))} | ${mdCell(Object.entries(row.status_counts).map(([status, count]) => `${status}:${count}`).join(', '))} | ${mdCell(row.licenses.join(', '))} |`).join('\n')}

## Boundary

Observed usage/navigation only. Token matrix rows are concordance/navigation metadata, not Definition authority, not reviewed lexical authority, not route ranking, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not source/provenance custody acceptance, not publication readiness, not copied Agent 2 payloads, and not accepted text.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; tokens ${counts.token_rows}; appearances ${counts.token_appearances}; source rows ${counts.source_navigation_rows}`);

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
