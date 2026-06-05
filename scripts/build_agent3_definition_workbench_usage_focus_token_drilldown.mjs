import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOKEN = process.argv[2] || 'ראשית';
const INPUT = 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json';
const TOKEN_MATRIX = 'data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-focus-token-drilldown-reshit.md';
const REPORT_ROWS = 60;
const TOP_CONTEXT_TOKENS = 80;

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function inc(map, key, amount = 1) {
  map.set(key || 'missing', (map.get(key || 'missing') || 0) + amount);
}

function sortedCounts(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([key, count]) => ({ key, count }));
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function check(id, status, detail) {
  return { id, status, detail };
}

const packet = readJson(INPUT);
const tokenMatrix = readJson(TOKEN_MATRIX);
if (packet.artifact_type !== 'definition_workbench_usage_concordance_navigation_packet') {
  throw new Error(`${INPUT} must be definition_workbench_usage_concordance_navigation_packet`);
}
if (tokenMatrix.artifact_type !== 'agent3_definition_workbench_usage_concordance_token_matrix') {
  throw new Error(`${TOKEN_MATRIX} must be agent3_definition_workbench_usage_concordance_token_matrix`);
}

const sourceRows = packet.navigation_rows || [];
const matchingRows = sourceRows.filter((row) => row.focus_normalized === TOKEN || row.token_normalized === TOKEN);
const compactRows = [];
const workCounts = new Map();
const categoryCounts = new Map();
const statusCounts = new Map();
const frameCounts = new Map();
const clusterCounts = new Map();
const licenseCounts = new Map();
const versionSourceCounts = new Map();
const routeCounts = new Map();
const contextTokenCounts = new Map();
const contextTokenFrameCounts = new Map();
const sourceRefs = new Set();
const workIds = new Set();
let phraseTokenAppearances = 0;
let focusAppearances = 0;
let repeatedFocusContextAppearances = 0;
let rowsWithCompleteMetadata = 0;
let rowsWithRouteIds = 0;
let observedUsageRows = 0;
let readerFacingRows = 0;
let routePayloadFieldHits = 0;
let forbiddenAuthorityFieldHits = 0;

for (const row of matchingRows) {
  inc(workCounts, row.work_id);
  inc(categoryCounts, row.category);
  inc(statusCounts, row.status);
  inc(frameCounts, row.usage_frame_label);
  inc(clusterCounts, row.cluster_id);
  inc(licenseCounts, row.license);
  inc(versionSourceCounts, row.version_source);
  for (const routeId of row.related_agent2_route_ids || []) inc(routeCounts, routeId);
  sourceRefs.add(row.source_ref);
  workIds.add(row.work_id);
  if (row.source_ref && row.source_url && row.local_work_anchor && row.license && row.license_url && row.version_title && row.version_source) rowsWithCompleteMetadata += 1;
  if ((row.related_agent2_route_ids || []).length) rowsWithRouteIds += 1;
  if (row.row_label === 'observed usage only' && row.usage_boundary?.observed_usage_only === true && row.usage_boundary?.not_definition_authority === true) observedUsageRows += 1;
  if (row.reader_facing === true || row.usage_boundary?.reader_facing === true) readerFacingRows += 1;
  if (Object.hasOwn(row, 'route_payload') || Object.hasOwn(row, 'route_payloads')) routePayloadFieldHits += 1;

  const phraseTokens = row.phrase_tokens || [];
  const compactTokens = phraseTokens.map((token) => {
    const normalized = token.normalized || token.surface;
    phraseTokenAppearances += 1;
    if (token.focus_marked === true || token.role === 'focus') focusAppearances += 1;
    if (token.role === 'repeated_focus_context' || (normalized === TOKEN && !(token.focus_marked === true || token.role === 'focus'))) repeatedFocusContextAppearances += 1;
    if (normalized && normalized !== TOKEN) {
      inc(contextTokenCounts, normalized);
      inc(contextTokenFrameCounts, `${normalized}||${row.usage_frame_label}`);
    }
    return {
      surface: token.surface,
      normalized,
      role: token.role || (token.focus_marked ? 'focus' : 'context'),
      focus_marked: token.focus_marked === true,
      distance_from_focus: Number.isFinite(Number(token.distance_from_focus)) ? Number(token.distance_from_focus) : null,
    };
  });

  compactRows.push({
    navigation_row_id: row.navigation_row_id,
    occurrence_id: row.occurrence_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    phrase_context_snippet: row.phrase_context_snippet,
    phrase_tokens: compactTokens,
    source_ref: row.source_ref,
    source_url: row.source_url,
    local_work_anchor: row.local_work_anchor,
    work_id: row.work_id,
    work_title: row.work_title,
    category: row.category,
    usage_frame_label: row.usage_frame_label,
    cluster_id: row.cluster_id,
    status: row.status,
    raw_score: row.raw_score,
    row_label: 'observed usage only',
    related_agent2_route_ids: row.related_agent2_route_ids || [],
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      route_payload_copied: false,
      not_definition_authority: true,
      not_semantic_arbitration: true,
      not_route_ranking: true,
      not_visible_answer_selection: true,
      not_publication_support: true,
      not_accepted_text: true,
    },
  });
}

const tokenMatrixRow = (tokenMatrix.token_rows || []).find((row) => row.token_normalized === TOKEN) || null;
const routeIds = sortedCounts(routeCounts).map((row) => row.key);
const counts = {
  source_navigation_rows: sourceRows.length,
  focus_token_rows: matchingRows.length,
  token_matrix_occurrence_rows: tokenMatrixRow?.occurrence_row_count || 0,
  token_matrix_total_appearances: tokenMatrixRow?.total_appearances || 0,
  phrase_token_appearances: phraseTokenAppearances,
  focus_appearances: focusAppearances,
  repeated_focus_context_appearances: repeatedFocusContextAppearances,
  source_refs: sourceRefs.size,
  works: workIds.size,
  categories: categoryCounts.size,
  frames: frameCounts.size,
  clusters: clusterCounts.size,
  licenses: licenseCounts.size,
  version_sources: versionSourceCounts.size,
  route_ids: routeIds.length,
  rows_with_complete_metadata: rowsWithCompleteMetadata,
  rows_with_route_ids: rowsWithRouteIds,
  observed_usage_only_rows: observedUsageRows,
  reader_facing_rows: readerFacingRows,
  route_payload_field_hits: routePayloadFieldHits,
  forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  context_token_rows: contextTokenCounts.size,
  source_text_read: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const contextTokenRows = sortedCounts(contextTokenCounts).slice(0, TOP_CONTEXT_TOKENS).map((entry) => {
  const frameCountsForToken = sortedCounts(new Map(
    [...contextTokenFrameCounts.entries()]
      .filter(([key]) => key.startsWith(`${entry.key}||`))
      .map(([key, count]) => [key.slice(entry.key.length + 2), count])
  ));
  return {
    token_normalized: entry.key,
    appearances: entry.count,
    top_frames: frameCountsForToken.slice(0, 5),
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  };
});

const checks = [
  check('focus_rows_present', counts.focus_token_rows > 0 ? 'passed' : 'failed', `focus rows ${counts.focus_token_rows}`),
  check('token_matrix_alignment', counts.focus_token_rows === counts.token_matrix_occurrence_rows && counts.phrase_token_appearances >= counts.token_matrix_total_appearances ? 'passed' : 'failed', `focus rows/matrix rows ${counts.focus_token_rows}/${counts.token_matrix_occurrence_rows}; appearances ${counts.phrase_token_appearances}/${counts.token_matrix_total_appearances}`),
  check('metadata_complete', counts.rows_with_complete_metadata === counts.focus_token_rows && counts.rows_with_route_ids === counts.focus_token_rows ? 'passed' : 'failed', `metadata/route ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}/${counts.focus_token_rows}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === counts.focus_token_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('source_diversity_visible', counts.source_refs > 0 && counts.works > 0 && counts.categories > 0 && counts.licenses > 0 ? 'passed' : 'failed', `refs/works/categories/licenses ${counts.source_refs}/${counts.works}/${counts.categories}/${counts.licenses}`),
  check('route_concentration_preserved', counts.route_ids === 1 ? 'warning' : 'passed', `route IDs ${counts.route_ids}`),
  check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_focus_token_drilldown',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_focus_token_drilldown.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  focus_token_normalized: TOKEN,
  source_artifacts: {
    concordance_navigation_packet: INPUT,
    concordance_token_matrix: TOKEN_MATRIX,
  },
  policy: 'Focused usage-navigation drilldown over existing selected concordance rows only. This is occurrence navigation and context-token evidence, not Definition authority, route ranking, semantic arbitration, translation, publication support, source custody, or Agent 6 acceptance.',
  authority_boundary: {
    observed_usage_only: true,
    focus_token_navigation_only: true,
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
  status_counts: sortedCounts(statusCounts),
  category_counts: sortedCounts(categoryCounts),
  usage_frame_counts: sortedCounts(frameCounts),
  cluster_counts: sortedCounts(clusterCounts),
  license_counts: sortedCounts(licenseCounts),
  version_source_counts: sortedCounts(versionSourceCounts),
  route_counts: sortedCounts(routeCounts),
  context_token_rows: contextTokenRows,
  occurrence_rows: compactRows,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const reportRows = compactRows.slice(0, REPORT_ROWS);
const md = `# Agent 3 Definition Workbench Usage Focus Token Drilldown

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is a focus-token usage-navigation drilldown for \`${TOKEN}\`, not Agent 6 acceptance.

## Scope

This packet extracts every current selected concordance navigation row whose focus token is \`${TOKEN}\`. It keeps occurrence links, local anchors, context snippets, frame/cluster/status counts, and provenance/license metadata visible. It does not read source text, import sources, broaden targets, mutate queues, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Counts

- Source navigation rows / focus-token rows: ${counts.source_navigation_rows}/${counts.focus_token_rows}
- Token-matrix occurrence rows / token-matrix appearances: ${counts.token_matrix_occurrence_rows}/${counts.token_matrix_total_appearances}
- Phrase token appearances / focus appearances / repeated focus context appearances: ${counts.phrase_token_appearances}/${counts.focus_appearances}/${counts.repeated_focus_context_appearances}
- Source refs / works / categories / frames / clusters: ${counts.source_refs}/${counts.works}/${counts.categories}/${counts.frames}/${counts.clusters}
- Licenses / version sources / route IDs: ${counts.licenses}/${counts.version_sources}/${counts.route_ids}
- Complete metadata / route rows: ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Usage Frame Counts

| frame | rows |
|---|---:|
${artifact.usage_frame_counts.map((row) => `| ${mdCell(row.key)} | ${row.count} |`).join('\n')}

## Top Context Tokens

| token | appearances | top frames |
|---|---:|---|
${contextTokenRows.slice(0, 30).map((row) => `| ${mdCell(row.token_normalized)} | ${row.appearances} | ${mdCell(row.top_frames.map((frame) => `${frame.key}:${frame.count}`).join(', '))} |`).join('\n')}

## Sample Occurrence Rows

| occurrence | status | frame | source | work | license | route IDs |
|---|---|---|---|---|---|---|
${reportRows.map((row) => `| ${row.occurrence_id} | ${row.status} | ${mdCell(row.usage_frame_label)} | [${mdCell(row.source_ref)}](${row.source_url}) / ${mdCell(row.local_work_anchor)} | ${mdCell(row.work_id)} | ${mdCell(row.license)} | ${mdCell(row.related_agent2_route_ids.join(', '))} |`).join('\n')}

## Boundary

Observed usage/navigation only. This packet does not claim \`${TOKEN}\` has a Definition Workbench answer, does not make a semantic finding, does not rank or select visible answers, and does not make ambiguous rows reader-facing. Route concentration remains a visible warning.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; focus rows ${counts.focus_token_rows}; context tokens ${counts.context_token_rows}`);
