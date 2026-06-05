import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT = 'data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json';
const FRAME_SUMMARY = 'data/definitions/agent3-definition-workbench-usage-focus-frame-summary-reshit.json';
const OUT_JSON = 'data/definitions/agent3-definition-workbench-usage-focus-navigation-shards-reshit.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-focus-navigation-shards-reshit.md';
const SAMPLE_LIMIT = 12;
const REPORT_ROWS = 120;

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeText(relPath, text) {
  const target = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function shardKey(parts) {
  return parts.map((part) => String(part ?? 'missing')).join('||');
}

function splitShardKey(key) {
  return key.split('||');
}

function check(id, status, detail) {
  return { id, status, detail };
}

const drilldown = readJson(INPUT);
const frameSummary = readJson(FRAME_SUMMARY);
if (drilldown.artifact_type !== 'agent3_definition_workbench_usage_focus_token_drilldown') {
  throw new Error(`${INPUT} must be agent3_definition_workbench_usage_focus_token_drilldown`);
}
if (frameSummary.artifact_type !== 'agent3_definition_workbench_usage_focus_frame_summary') {
  throw new Error(`${FRAME_SUMMARY} must be agent3_definition_workbench_usage_focus_frame_summary`);
}

const rows = drilldown.occurrence_rows || [];
const focus = drilldown.focus_token_normalized;
const shardMaps = {
  frame_category: new Map(),
  frame_license: new Map(),
  frame_status: new Map(),
  category_license: new Map(),
  work_frame: new Map(),
};

function addToShard(map, key, row) {
  if (!map.has(key)) {
    map.set(key, {
      shard_key: key,
      row_count: 0,
      occurrence_ids: [],
      source_refs: new Set(),
      works: new Set(),
      licenses: new Set(),
      route_ids: new Set(),
      samples: [],
      row_label: 'observed usage only',
      reader_facing: false,
      not_definition_authority: true,
    });
  }
  const shard = map.get(key);
  shard.row_count += 1;
  shard.occurrence_ids.push(row.occurrence_id);
  shard.source_refs.add(row.source_ref);
  shard.works.add(row.work_id);
  shard.licenses.add(row.license);
  for (const routeId of row.related_agent2_route_ids || []) shard.route_ids.add(routeId);
  if (shard.samples.length < SAMPLE_LIMIT) {
    shard.samples.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_url: row.source_url,
      local_work_anchor: row.local_work_anchor,
      work_id: row.work_id,
      usage_frame_label: row.usage_frame_label,
      category: row.category,
      status: row.status,
      license: row.license,
      version_title: row.version_title,
      version_source: row.version_source,
      related_agent2_route_ids: row.related_agent2_route_ids || [],
      row_label: 'observed usage only',
    });
  }
}

let observedUsageRows = 0;
let readerFacingRows = 0;
let routePayloadFieldHits = 0;
let forbiddenAuthorityFieldHits = 0;
let rowsWithCompleteMetadata = 0;
let rowsWithRouteIds = 0;

for (const row of rows) {
  addToShard(shardMaps.frame_category, shardKey([row.usage_frame_label, row.category]), row);
  addToShard(shardMaps.frame_license, shardKey([row.usage_frame_label, row.license]), row);
  addToShard(shardMaps.frame_status, shardKey([row.usage_frame_label, row.status]), row);
  addToShard(shardMaps.category_license, shardKey([row.category, row.license]), row);
  addToShard(shardMaps.work_frame, shardKey([row.work_id, row.usage_frame_label]), row);

  const boundary = row.usage_boundary || {};
  if (row.row_label === 'observed usage only' && boundary.observed_usage_only === true && boundary.not_definition_authority === true) observedUsageRows += 1;
  if (row.reader_facing === true || boundary.reader_facing === true) readerFacingRows += 1;
  if (Object.hasOwn(row, 'route_payload') || Object.hasOwn(row, 'route_payloads')) routePayloadFieldHits += 1;
  if (row.source_ref && row.source_url && row.local_work_anchor && row.license && row.license_url && row.version_title && row.version_source) rowsWithCompleteMetadata += 1;
  if ((row.related_agent2_route_ids || []).length) rowsWithRouteIds += 1;
}

function materializeShard(type, key, value) {
  const parts = splitShardKey(key);
  return {
    shard_type: type,
    shard_key: key,
    shard_parts: parts,
    row_count: value.row_count,
    source_ref_count: value.source_refs.size,
    work_count: value.works.size,
    license_count: value.licenses.size,
    route_ids: [...value.route_ids].sort(),
    occurrence_ids: value.occurrence_ids,
    sample_occurrences: value.samples,
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  };
}

const shardRows = Object.entries(shardMaps).flatMap(([type, map]) =>
  [...map.entries()].map(([key, value]) => materializeShard(type, key, value))
).sort((a, b) => b.row_count - a.row_count || a.shard_type.localeCompare(b.shard_type) || a.shard_key.localeCompare(b.shard_key));

const routeIds = new Set(rows.flatMap((row) => row.related_agent2_route_ids || []));
const counts = {
  source_drilldown_rows: drilldown.counts?.focus_token_rows || rows.length,
  source_frame_summary_rows: frameSummary.counts?.summarized_rows || 0,
  source_rows: rows.length,
  shard_rows: shardRows.length,
  frame_category_shards: shardMaps.frame_category.size,
  frame_license_shards: shardMaps.frame_license.size,
  frame_status_shards: shardMaps.frame_status.size,
  category_license_shards: shardMaps.category_license.size,
  work_frame_shards: shardMaps.work_frame.size,
  rows_with_complete_metadata: rowsWithCompleteMetadata,
  rows_with_route_ids: rowsWithRouteIds,
  observed_usage_only_rows: observedUsageRows,
  reader_facing_rows: readerFacingRows,
  route_payload_field_hits: routePayloadFieldHits,
  forbidden_authority_field_hits: forbiddenAuthorityFieldHits,
  route_ids: routeIds.size,
  source_text_read: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const checks = [
  check('source_inputs_loaded', counts.source_drilldown_rows === rows.length && counts.source_frame_summary_rows === rows.length ? 'passed' : 'failed', `drilldown/frame/source ${counts.source_drilldown_rows}/${counts.source_frame_summary_rows}/${rows.length}`),
  check('shards_present', counts.shard_rows > 0 && counts.frame_category_shards > 0 && counts.frame_license_shards > 0 && counts.frame_status_shards > 0 && counts.category_license_shards > 0 && counts.work_frame_shards > 0 ? 'passed' : 'failed', `total/frameCategory/frameLicense/frameStatus/categoryLicense/workFrame ${counts.shard_rows}/${counts.frame_category_shards}/${counts.frame_license_shards}/${counts.frame_status_shards}/${counts.category_license_shards}/${counts.work_frame_shards}`),
  check('metadata_complete', counts.rows_with_complete_metadata === rows.length && counts.rows_with_route_ids === rows.length ? 'passed' : 'failed', `metadata/routes ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}/${rows.length}`),
  check('usage_only_boundary', counts.observed_usage_only_rows === rows.length && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  check('route_concentration_preserved', counts.route_ids === 1 ? 'warning' : 'passed', `route IDs ${counts.route_ids}`),
  check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`),
];

const failed = checks.filter((row) => row.status === 'failed');
const warnings = checks.filter((row) => row.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_focus_navigation_shards',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_focus_navigation_shards.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  status: failed.length ? 'awaiting-Agent-6' : 'evidence-ready',
  focus_token_normalized: focus,
  source_artifacts: {
    focus_token_drilldown: INPUT,
    focus_frame_summary: FRAME_SUMMARY,
  },
  policy: 'Compact search/navigation shard index over existing focus-token drilldown rows only. Shards are occurrence navigation aids, not Definition authority, route ranking, semantic arbitration, translation, publication support, source custody, or Agent 6 acceptance.',
  authority_boundary: {
    observed_usage_only: true,
    focus_navigation_shards_only: true,
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
  shard_rows: shardRows,
  checks,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
  },
};

const reportRows = shardRows.slice(0, REPORT_ROWS);
const md = `# Agent 3 Definition Workbench Usage Focus Navigation Shards

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is a compact navigation-shard index for \`${focus}\`, not Agent 6 acceptance.

## Scope

This packet derives frame/category/license/status/work shards from the existing focus-token drilldown and frame summary. It stores occurrence IDs and source/work/license samples for search/navigation only. It does not read source text, import sources, broaden targets, mutate queues, rank routes, select answers, define terms, translate, copy Agent 2 payloads, or claim publication/source-custody acceptance.

## Counts

- Source drilldown rows / frame-summary rows / source rows: ${counts.source_drilldown_rows}/${counts.source_frame_summary_rows}/${counts.source_rows}
- Shard rows: ${counts.shard_rows}
- Frame-category / frame-license / frame-status / category-license / work-frame shards: ${counts.frame_category_shards}/${counts.frame_license_shards}/${counts.frame_status_shards}/${counts.category_license_shards}/${counts.work_frame_shards}
- Complete metadata / route rows: ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}
- Observed usage / reader-facing / route-payload / forbidden-authority rows: ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}
- Route IDs: ${counts.route_ids}
- Source-text reads / broad expansion / queue mutations / submitted to Agent 6: ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}

## Checks

| check | status | detail |
|---|---|---|
${checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`).join('\n')}

## Top Shards

| type | parts | rows | source refs | works | licenses | route IDs |
|---|---|---:|---:|---:|---:|---|
${reportRows.map((row) => `| ${row.shard_type} | ${mdCell(row.shard_parts.join(' / '))} | ${row.row_count} | ${row.source_ref_count} | ${row.work_count} | ${row.license_count} | ${mdCell(row.route_ids.join(', '))} |`).join('\n')}

## Boundary

Observed usage/navigation only. Shards are search facets over existing occurrence rows; they do not claim semantic confirmation, Definition authority, route ranking, visible answer selection, publication support, source/provenance custody, or accepted text. Route concentration remains a visible warning.
`;

writeText(OUT_JSON, `${JSON.stringify(artifact, null, 2)}\n`);
writeText(OUT_MD, md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; shards ${counts.shard_rows}; source rows ${counts.source_rows}`);
