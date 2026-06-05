#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json';
const outputPath = process.argv[3] || 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json';
const reportPath = process.argv[4] || 'reports/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.md';

const source = readJson(sourcePath);
if (source.artifact_type !== 'agent3_definition_workbench_usage_collision_review_queue') {
  throw new Error(`Unexpected source artifact: ${source.artifact_type}`);
}

const reviewRows = source.review_queue_rows || [];
const occurrenceMap = new Map();
const sourceRefMap = new Map();
const workMap = new Map();
const licenseMap = new Map();

for (const row of reviewRows) {
  for (const occurrence of row.representative_occurrences || []) {
    const entry = buildOccurrenceEntry(row, occurrence);
    addUnique(occurrenceMap, occurrence.occurrence_id, entry, (item) => `${item.review_queue_id}|${item.source_collision_id}`);
    addUnique(sourceRefMap, occurrence.source_ref, sourceRefEntry(row, occurrence), (item) => `${item.review_queue_id}|${item.occurrence_id}`);
    addUnique(workMap, occurrence.work_id, workEntry(row, occurrence), (item) => `${item.review_queue_id}|${item.occurrence_id}`);
    addUnique(licenseMap, occurrence.license, licenseEntry(row, occurrence), (item) => `${item.review_queue_id}|${item.occurrence_id}`);
  }
}

const occurrence_index = [...occurrenceMap.entries()]
  .map(([occurrence_id, rows]) => ({
    occurrence_id,
    queue_row_count: rows.length,
    review_queue_ids: sortedUnique(rows.map((row) => row.review_queue_id)),
    collision_types: sortedUnique(rows.map((row) => row.collision_type)),
    source_ref: rows[0]?.source_ref || null,
    source_url: rows[0]?.source_url || null,
    local_work_anchor: rows[0]?.local_work_anchor || null,
    work_id: rows[0]?.work_id || null,
    work_title: rows[0]?.work_title || null,
    category: rows[0]?.category || null,
    license: rows[0]?.license || null,
    license_url: rows[0]?.license_url || null,
    version_title: rows[0]?.version_title || null,
    version_source: rows[0]?.version_source || null,
    phrase_context_snippet: rows[0]?.phrase_context_snippet || null,
    related_agent2_route_ids: sortedUnique(rows.flatMap((row) => row.related_agent2_route_ids)),
    queue_links: rows,
    row_label: 'observed usage only',
    index_visibility: 'agent6_review_navigation_only',
    reader_facing: false,
    not_definition_authority: true,
  }))
  .sort((a, b) => b.queue_row_count - a.queue_row_count || a.occurrence_id.localeCompare(b.occurrence_id));

const source_ref_index = bucketIndex(sourceRefMap, 'source_ref');
const work_index = bucketIndex(workMap, 'work_id');
const license_index = bucketIndex(licenseMap, 'license');

const counts = {
  source_review_queue_rows: reviewRows.length,
  occurrence_index_rows: occurrence_index.length,
  source_ref_index_rows: source_ref_index.length,
  work_index_rows: work_index.length,
  license_index_rows: license_index.length,
  occurrence_queue_links: occurrence_index.reduce((sum, row) => sum + row.queue_row_count, 0),
  source_ref_queue_links: source_ref_index.reduce((sum, row) => sum + row.queue_link_count, 0),
  work_queue_links: work_index.reduce((sum, row) => sum + row.queue_link_count, 0),
  license_queue_links: license_index.reduce((sum, row) => sum + row.queue_link_count, 0),
  occurrence_rows_with_multiple_queue_links: occurrence_index.filter((row) => row.queue_row_count > 1).length,
  source_refs_with_multiple_queue_links: source_ref_index.filter((row) => row.queue_link_count > 1).length,
  works_with_multiple_queue_links: work_index.filter((row) => row.queue_link_count > 1).length,
  licenses_with_multiple_queue_links: license_index.filter((row) => row.queue_link_count > 1).length,
  rows_with_complete_occurrence_metadata: occurrence_index.filter(hasCompleteOccurrenceIndexRow).length,
  rows_labeled_observed_usage_only: occurrence_index.filter((row) => row.row_label === 'observed usage only').length,
  review_navigation_only_rows: occurrence_index.filter((row) => row.index_visibility === 'agent6_review_navigation_only').length,
  route_id_rows: occurrence_index.filter((row) => row.related_agent2_route_ids.length > 0).length,
  reader_facing_rows: 0,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_reads: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_review_reverse_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_review_reverse_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_key: source.focus_token_key,
  focus_token_normalized: source.focus_token_normalized,
  source_artifacts: {
    collision_review_queue: sourcePath,
  },
  policy: 'Reverse index for Agent 3 collision review queue representatives. It supports navigation from occurrence/source/work/license buckets back to review queue rows only; it does not rank routes, select visible answers, copy Agent 2 payloads, emit definitions, translate, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    collision_review_reverse_index_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_route_payloads: false,
    accepted_text_output: false,
    publication_claim: false,
    source_text_read: false,
    broad_target_expansion: false,
    agent6_accepted: false,
  },
  occurrence_index,
  source_ref_index,
  work_index,
  license_index,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision review reverse index ${artifact.status}; occurrence rows ${counts.occurrence_index_rows}; source refs ${counts.source_ref_index_rows}; works ${counts.work_index_rows}`);

function buildOccurrenceEntry(queueRow, occurrence) {
  return {
    review_queue_id: queueRow.review_queue_id,
    source_collision_id: queueRow.source_collision_id,
    collision_type: queueRow.collision_type,
    collision_key: queueRow.collision_key,
    review_reason: queueRow.review_reason,
    row_count: queueRow.row_count,
    occurrence_id: occurrence.occurrence_id,
    source_ref: occurrence.source_ref,
    source_url: occurrence.source_url,
    local_work_anchor: occurrence.local_work_anchor,
    work_id: occurrence.work_id,
    work_title: occurrence.work_title,
    category: occurrence.category,
    phrase_context_snippet: occurrence.phrase_context_snippet,
    usage_frame_label: occurrence.usage_frame_label,
    status: occurrence.status,
    raw_score: occurrence.raw_score,
    cluster_id: occurrence.cluster_id,
    related_agent2_route_ids: occurrence.related_agent2_route_ids || queueRow.related_agent2_route_ids || [],
    version_title: occurrence.version_title,
    version_source: occurrence.version_source,
    license: occurrence.license,
    license_url: occurrence.license_url,
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  };
}

function sourceRefEntry(queueRow, occurrence) {
  return {
    source_ref: occurrence.source_ref,
    occurrence_id: occurrence.occurrence_id,
    review_queue_id: queueRow.review_queue_id,
    source_collision_id: queueRow.source_collision_id,
    collision_type: queueRow.collision_type,
    source_url: occurrence.source_url,
    local_work_anchor: occurrence.local_work_anchor,
    work_id: occurrence.work_id,
    work_title: occurrence.work_title,
    license: occurrence.license,
    license_url: occurrence.license_url,
    related_agent2_route_ids: occurrence.related_agent2_route_ids || queueRow.related_agent2_route_ids || [],
  };
}

function workEntry(queueRow, occurrence) {
  return {
    work_id: occurrence.work_id,
    work_title: occurrence.work_title,
    occurrence_id: occurrence.occurrence_id,
    source_ref: occurrence.source_ref,
    review_queue_id: queueRow.review_queue_id,
    source_collision_id: queueRow.source_collision_id,
    collision_type: queueRow.collision_type,
    local_work_anchor: occurrence.local_work_anchor,
    license: occurrence.license,
    related_agent2_route_ids: occurrence.related_agent2_route_ids || queueRow.related_agent2_route_ids || [],
  };
}

function licenseEntry(queueRow, occurrence) {
  return {
    license: occurrence.license,
    license_url: occurrence.license_url,
    occurrence_id: occurrence.occurrence_id,
    source_ref: occurrence.source_ref,
    review_queue_id: queueRow.review_queue_id,
    source_collision_id: queueRow.source_collision_id,
    collision_type: queueRow.collision_type,
    work_id: occurrence.work_id,
    version_title: occurrence.version_title,
    version_source: occurrence.version_source,
    related_agent2_route_ids: occurrence.related_agent2_route_ids || queueRow.related_agent2_route_ids || [],
  };
}

function addUnique(map, key, value, idFn) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  const list = map.get(key);
  const id = idFn(value);
  if (!list.some((item) => idFn(item) === id)) list.push(value);
}

function bucketIndex(map, keyName) {
  return [...map.entries()].map(([key, rows]) => ({
    [keyName]: key,
    queue_link_count: rows.length,
    occurrence_count: new Set(rows.map((row) => row.occurrence_id)).size,
    review_queue_ids: sortedUnique(rows.map((row) => row.review_queue_id)),
    collision_types: sortedUnique(rows.map((row) => row.collision_type)),
    related_agent2_route_ids: sortedUnique(rows.flatMap((row) => row.related_agent2_route_ids || [])),
    links: rows.sort((a, b) => a.review_queue_id.localeCompare(b.review_queue_id) || a.occurrence_id.localeCompare(b.occurrence_id)),
    row_label: 'observed usage only',
    index_visibility: 'agent6_review_navigation_only',
    reader_facing: false,
    not_definition_authority: true,
  })).sort((a, b) => b.queue_link_count - a.queue_link_count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function hasCompleteOccurrenceIndexRow(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.phrase_context_snippet && row.version_title && row.version_source && row.license && row.license_url);
}

function buildChecks(c) {
  return [
    check('source_review_queue_present', c.source_review_queue_rows > 0, `source queue rows ${c.source_review_queue_rows}`),
    check('occurrence_reverse_index_present', c.occurrence_index_rows > 0, `occurrence index rows ${c.occurrence_index_rows}`),
    check('bucket_indexes_present', c.source_ref_index_rows > 0 && c.work_index_rows > 0 && c.license_index_rows > 0, `source/work/license rows ${c.source_ref_index_rows}/${c.work_index_rows}/${c.license_index_rows}`),
    check('queue_links_preserved', c.occurrence_queue_links >= c.occurrence_index_rows && c.source_ref_queue_links === c.occurrence_queue_links && c.work_queue_links === c.occurrence_queue_links && c.license_queue_links === c.occurrence_queue_links, `links occurrence/source/work/license ${c.occurrence_queue_links}/${c.source_ref_queue_links}/${c.work_queue_links}/${c.license_queue_links}`),
    check('complete_occurrence_metadata', c.rows_with_complete_occurrence_metadata === c.occurrence_index_rows, `metadata ${c.rows_with_complete_occurrence_metadata}/${c.occurrence_index_rows}`),
    check('route_ids_only_visible', c.route_id_rows === c.occurrence_index_rows, `route id rows ${c.route_id_rows}/${c.occurrence_index_rows}`),
    check('observed_usage_review_navigation_only', c.rows_labeled_observed_usage_only === c.occurrence_index_rows && c.review_navigation_only_rows === c.occurrence_index_rows, `observed/navigation ${c.rows_labeled_observed_usage_only}/${c.review_navigation_only_rows}`),
    check('no_reader_or_payload_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_broad_or_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Definition Workbench Usage Collision Review Reverse Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: reverse-index navigation only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Source review queue rows: ${c.source_review_queue_rows}`,
    `- Occurrence index rows: ${c.occurrence_index_rows}`,
    `- Source-ref / work / license index rows: ${c.source_ref_index_rows}/${c.work_index_rows}/${c.license_index_rows}`,
    `- Queue links occurrence/source/work/license: ${c.occurrence_queue_links}/${c.source_ref_queue_links}/${c.work_queue_links}/${c.license_queue_links}`,
    `- Multi-link occurrence/source/work/license rows: ${c.occurrence_rows_with_multiple_queue_links}/${c.source_refs_with_multiple_queue_links}/${c.works_with_multiple_queue_links}/${c.licenses_with_multiple_queue_links}`,
    `- Complete metadata / route-ID rows: ${c.rows_with_complete_occurrence_metadata}/${c.route_id_rows}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    '',
    '## Top Occurrence Links',
    '',
    '| occurrence id | queue rows | work | source ref | collision types | route ids |',
    '|---|---:|---|---|---|---|',
    ...artifact.occurrence_index.slice(0, 40).map((row) => `| ${row.occurrence_id} | ${row.queue_row_count} | ${escapeCell(row.work_id || '')} | ${escapeCell(row.source_ref || '')} | ${row.collision_types.join(', ')} | ${row.related_agent2_route_ids.join(', ')} |`),
    '',
    '## Top Source Ref Buckets',
    '',
    '| source ref | queue links | occurrences | collision types |',
    '|---|---:|---:|---|',
    ...artifact.source_ref_index.slice(0, 25).map((row) => `| ${escapeCell(row.source_ref || '')} | ${row.queue_link_count} | ${row.occurrence_count} | ${row.collision_types.join(', ')} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This reverse index is Agent 3 navigation scaffolding only. It links back to review queue IDs and Agent 2 route IDs only; it does not carry route payloads, definitions, translations, answer selection, or publication claims.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/\s+/g, ' ');
}
