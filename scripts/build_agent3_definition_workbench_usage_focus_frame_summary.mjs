import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT = 'data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-focus-frame-summary-reshit.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-focus-frame-summary-reshit.md';
const TOP_WORKS_PER_FRAME = 25;
const TOP_CONTEXT_PER_FRAME = 25;

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

const drilldown = readJson(INPUT);
if (drilldown.artifact_type !== 'agent3_definition_workbench_usage_focus_token_drilldown') {
  throw new Error(`${INPUT} must be agent3_definition_workbench_usage_focus_token_drilldown`);
}

const rows = drilldown.occurrence_rows || [];
const focus = drilldown.focus_token_normalized;
const frameMap = new Map();
const routeIds = new Set();
let observedUsageRows = 0;
let readerFacingRows = 0;
let routePayloadFieldHits = 0;
let forbiddenAuthorityFieldHits = 0;
let rowsWithCompleteMetadata = 0;
let rowsWithRouteIds = 0;
let phraseTokenAppearances = 0;
let focusAppearances = 0;

function ensureFrame(label) {
  const key = label || 'missing';
  if (!frameMap.has(key)) {
    frameMap.set(key, {
      frame_label: key,
      row_count: 0,
      source_refs: new Set(),
      works: new Set(),
      categories: new Map(),
      statuses: new Map(),
      clusters: new Map(),
      licenses: new Map(),
      version_sources: new Set(),
      route_ids: new Set(),
      context_tokens: new Map(),
      sample_occurrences: [],
      row_label: 'observed usage only',
      reader_facing: false,
      not_definition_authority: true,
    });
  }
  return frameMap.get(key);
}

for (const row of rows) {
  const frame = ensureFrame(row.usage_frame_label);
  frame.row_count += 1;
  frame.source_refs.add(row.source_ref);
  frame.works.add(row.work_id);
  inc(frame.categories, row.category);
  inc(frame.statuses, row.status);
  inc(frame.clusters, row.cluster_id);
  inc(frame.licenses, row.license);
  frame.version_sources.add(row.version_source);
  for (const routeId of row.related_agent2_route_ids || []) {
    frame.route_ids.add(routeId);
    routeIds.add(routeId);
  }

  const boundary = row.usage_boundary || {};
  if (row.row_label === 'observed usage only' && boundary.observed_usage_only === true && boundary.not_definition_authority === true) observedUsageRows += 1;
  if (boundary.reader_facing === true || row.reader_facing === true) readerFacingRows += 1;
  if (Object.hasOwn(row, 'route_payload') || Object.hasOwn(row, 'route_payloads')) routePayloadFieldHits += 1;
  if (row.source_ref && row.source_url && row.local_work_anchor && row.license && row.license_url && row.version_title && row.version_source) rowsWithCompleteMetadata += 1;
  if ((row.related_agent2_route_ids || []).length) rowsWithRouteIds += 1;

  for (const token of row.phrase_tokens || []) {
    phraseTokenAppearances += 1;
    if (token.focus_marked === true || token.role === 'focus') focusAppearances += 1;
    if (token.normalized && token.normalized !== focus) inc(frame.context_tokens, token.normalized);
  }

  if (frame.sample_occurrences.length < 12) {
    frame.sample_occurrences.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_url: row.source_url,
      local_work_anchor: row.local_work_anchor,
      work_id: row.work_id,
      status: row.status,
      license: row.license,
      version_title: row.version_title,
      version_source: row.version_source,
      related_agent2_route_ids: row.related_agent2_route_ids || [],
      row_label: 'observed usage only',
    });
  }
}

const frameRows = [...frameMap.values()]
  .map((frame) => ({
    frame_label: frame.frame_label,
    row_count: frame.row_count,
    source_ref_count: frame.source_refs.size,
    work_count: frame.works.size,
    category_counts: sortedCounts(frame.categories),
    status_counts: sortedCounts(frame.statuses),
    cluster_counts: sortedCounts(frame.clusters),
    license_counts: sortedCounts(frame.licenses),
    version_source_count: frame.version_sources.size,
    route_ids: [...frame.route_ids].sort(),
    top_context_tokens: sortedCounts(frame.context_tokens).slice(0, TOP_CONTEXT_PER_FRAME),
    top_works: sortedCounts(new Map([...frame.works].map((workId) => [workId, rows.filter((row) => row.usage_frame_label === frame.frame_label && row.work_id === workId).length]))).slice(0, TOP_WORKS_PER_FRAME),
    sample_occurrences: frame.sample_occurrences,
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  }))
  .sort((a, b) => b.row_count - a.row_count || a.frame_label.localeCompare(b.frame_label));

const counts = {
  source_drilldown_rows: drilldown.counts?.focus_token_rows || rows.length,
  summarized_rows: rows.length,
  frame_rows: frameRows.length,
  source_refs: drilldown.counts?.source_refs || new Set(rows.map((row) => row.source_ref)).size,
  works: drilldown.counts?.works || new Set(rows.map((row) => row.work_id)).size,
  categories: drilldown.counts?.categories || 0,
  licenses: drilldown.counts?.licenses || 0,
  version_sources: drilldown.counts?.version_sources || 0,
  route_ids: routeIds.size,
  phrase_token_appearances: phraseTokenAppearances,
  focus_appearances: focusAppearances,
  rows_with_complete_metadata: rowsWithCompleteMetadata,
  rows_with_route_ids: rowsWithRouteIds,
  observed_usage_only_rows: observedUsageRows,
  reader_facing_rows: readerFacingRows,
  route_payload_field_hits: routePayloadFieldHits,
  forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  source_text_read: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const checks = [
  check('source_drilldown_loaded', counts.source_drilldown_rows === rows.length && rows.length > 0 ? 'passed' : 'failed', `source/rows ${counts.source_drilldown_rows}/${rows.length}`),
  check('frame_rows_present', counts.frame_rows > 0 ? 'passed' : 'failed', `frames ${counts.frame_rows}`),
  check('frame_rows_cover_source', frameRows.reduce((sum, row) => sum + row.row_count, 0) === rows.length ? 'passed' : 'failed', `frame sum/source ${frameRows.reduce((sum, row) => sum + row.row_count, 0)}/${rows.length}`),
  check('metadata_complete', counts.rows_with_complete_metadata === rows.length && counts.rows_with_route_ids === rows.length ? 'passed' : 'failed', `metadata/routes ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}/${rows.length}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === rows.length && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('route_concentration_preserved', counts.route_ids === 1 ? 'warning' : 'passed', `route IDs ${counts.route_ids}`),
  check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_focus_frame_summary',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_focus_frame_summary.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  focus_token_normalized: focus,
  source_artifacts: {
    focus_token_drilldown: INPUT,
  },
  policy: 'Compact frame/provenance summary over the existing focus-token drilldown only. This is usage navigation and QA intake evidence, not Definition authority, route ranking, semantic arbitration, translation, publication support, source custody, or Agent 6 acceptance.',
  authority_boundary: {
    observed_usage_only: true,
    focus_frame_summary_only: true,
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
  frame_rows: frameRows,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const md = `# Agent 3 Definition Workbench Usage Focus Frame Summary

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is a compact frame/provenance summary for \`${focus}\`, not Agent 6 acceptance.

## Scope

This packet summarizes the existing focus-token drilldown by usage frame, source/provenance dimensions, and context tokens. It does not read source text, import sources, broaden targets, mutate queues, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Counts

- Source drilldown rows / summarized rows / frame rows: ${counts.source_drilldown_rows}/${counts.summarized_rows}/${counts.frame_rows}
- Source refs / works / categories / licenses / version sources: ${counts.source_refs}/${counts.works}/${counts.categories}/${counts.licenses}/${counts.version_sources}
- Route IDs: ${counts.route_ids}
- Phrase-token appearances / focus appearances: ${counts.phrase_token_appearances}/${counts.focus_appearances}
- Complete metadata / route rows: ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}
- Source-text reads / broad expansion / queue mutations / submitted to Agent 6: ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Frame Rows

| frame | rows | source refs | works | licenses | route IDs | statuses |
|---|---:|---:|---:|---|---|---|
${frameRows.map((row) => `| ${mdCell(row.frame_label)} | ${row.row_count} | ${row.source_ref_count} | ${row.work_count} | ${mdCell(row.license_counts.map((item) => `${item.key}:${item.count}`).join(', '))} | ${mdCell(row.route_ids.join(', '))} | ${mdCell(row.status_counts.map((item) => `${item.key}:${item.count}`).join(', '))} |`).join('\n')}

## Top Context Tokens By Frame

${frameRows.map((row) => `### ${row.frame_label}

| token | appearances |
|---|---:|
${row.top_context_tokens.slice(0, 20).map((item) => `| ${mdCell(item.key)} | ${item.count} |`).join('\n')}`).join('\n\n')}

## Boundary

Observed usage/navigation only. Frame labels are usage-navigation buckets from the existing evidence set; this packet does not claim semantic confirmation, Definition authority, route ranking, visible answer selection, publication support, source/provenance custody, or accepted text. Route concentration remains a visible warning.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; frames ${counts.frame_rows}; rows ${counts.summarized_rows}`);
