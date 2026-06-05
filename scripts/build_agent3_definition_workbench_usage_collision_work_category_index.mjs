#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json';
const outputPath = process.argv[3] || 'data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json';
const reportPath = process.argv[4] || 'reports/agent3-definition-workbench-usage-collision-work-category-index-reshit.md';

const source = readJson(sourcePath);
if (source.artifact_type !== 'agent3_definition_workbench_usage_collision_review_reverse_index') {
  throw new Error(`Unexpected source artifact: ${source.artifact_type}`);
}

const occurrenceRows = source.occurrence_index || [];
const categoryIndex = buildIndex(occurrenceRows, (row) => row.category, 'category');
const workIndex = buildIndex(occurrenceRows, (row) => row.work_id, 'work_id', (row) => ({
  work_id: row.work_id || null,
  work_title: row.work_title || null,
  category: row.category || null,
}));
const categoryLicenseIndex = buildIndex(occurrenceRows, (row) => `${row.category || ''}||${row.license || ''}`, 'category_license', (row) => ({
  category: row.category || null,
  license: row.license || null,
  license_url: row.license_url || null,
}));

const counts = {
  source_occurrence_rows: occurrenceRows.length,
  category_index_rows: categoryIndex.length,
  work_index_rows: workIndex.length,
  category_license_index_rows: categoryLicenseIndex.length,
  occurrence_queue_links: occurrenceRows.reduce((sum, row) => sum + row.queue_row_count, 0),
  category_queue_links: categoryIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  work_queue_links: workIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  category_license_queue_links: categoryLicenseIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  categories_with_multiple_works: categoryIndex.filter((row) => row.work_count > 1).length,
  works_with_multiple_source_refs: workIndex.filter((row) => row.source_ref_count > 1).length,
  category_license_rows_with_multiple_works: categoryLicenseIndex.filter((row) => row.work_count > 1).length,
  rows_with_complete_metadata: occurrenceRows.filter(hasCompleteMetadata).length,
  rows_labeled_observed_usage_only: occurrenceRows.filter((row) => row.row_label === 'observed usage only').length,
  route_id_rows: occurrenceRows.filter((row) => row.related_agent2_route_ids?.length).length,
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
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: source.focus_token_normalized,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_review_reverse_index: sourcePath,
  },
  policy: 'Work/category navigation index for Agent 3 collision review representatives. It groups existing occurrence links by category, work, and category-license for QA/navigation only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    work_category_index_only: true,
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
  category_index: categoryIndex,
  work_index: workIndex,
  category_license_index: categoryLicenseIndex,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision work/category index ${artifact.status}; categories ${counts.category_index_rows}; works ${counts.work_index_rows}; category-license ${counts.category_license_index_rows}`);

function buildIndex(rows, keyFn, keyName, partsFn = null) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].map(([key, bucketRows]) => ({
    [keyName]: key,
    parts: partsFn ? partsFn(bucketRows[0]) : {},
    occurrence_count: bucketRows.length,
    queue_link_count: bucketRows.reduce((sum, row) => sum + row.queue_row_count, 0),
    source_ref_count: new Set(bucketRows.map((row) => row.source_ref).filter(Boolean)).size,
    work_count: new Set(bucketRows.map((row) => row.work_id).filter(Boolean)).size,
    category_count: new Set(bucketRows.map((row) => row.category).filter(Boolean)).size,
    license_count: new Set(bucketRows.map((row) => row.license).filter(Boolean)).size,
    version_source_count: new Set(bucketRows.map((row) => row.version_source).filter(Boolean)).size,
    review_queue_ids: sortedUnique(bucketRows.flatMap((row) => row.review_queue_ids || [])),
    collision_types: sortedUnique(bucketRows.flatMap((row) => row.collision_types || [])),
    related_agent2_route_ids: sortedUnique(bucketRows.flatMap((row) => row.related_agent2_route_ids || [])),
    sample_occurrences: bucketRows.slice(0, 8).map(sampleOccurrence),
    row_label: 'observed usage only',
    index_visibility: 'agent6_work_category_navigation_only',
    reader_facing: false,
    not_definition_authority: true,
  })).sort((a, b) => b.queue_link_count - a.queue_link_count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function sampleOccurrence(row) {
  return {
    occurrence_id: row.occurrence_id,
    source_ref: row.source_ref,
    source_url: row.source_url,
    local_work_anchor: row.local_work_anchor,
    work_id: row.work_id,
    work_title: row.work_title,
    category: row.category,
    phrase_context_snippet: row.phrase_context_snippet,
    license: row.license,
    license_url: row.license_url,
    version_title: row.version_title,
    version_source: row.version_source,
    related_agent2_route_ids: row.related_agent2_route_ids || [],
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  };
}

function hasCompleteMetadata(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.category && row.license && row.license_url && row.version_title && row.version_source);
}

function buildChecks(c) {
  return [
    check('source_occurrences_present', c.source_occurrence_rows > 0, `source rows ${c.source_occurrence_rows}`),
    check('work_category_indexes_present', c.category_index_rows > 0 && c.work_index_rows > 0 && c.category_license_index_rows > 0, `category/work/category-license ${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`),
    check('queue_links_preserved', c.category_queue_links === c.occurrence_queue_links && c.work_queue_links === c.occurrence_queue_links && c.category_license_queue_links === c.occurrence_queue_links, `links occurrence/category/work/category-license ${c.occurrence_queue_links}/${c.category_queue_links}/${c.work_queue_links}/${c.category_license_queue_links}`),
    check('complete_metadata', c.rows_with_complete_metadata === c.source_occurrence_rows, `metadata ${c.rows_with_complete_metadata}/${c.source_occurrence_rows}`),
    check('route_ids_only_visible', c.route_id_rows === c.source_occurrence_rows, `route IDs ${c.route_id_rows}/${c.source_occurrence_rows}`),
    check('observed_usage_labels_present', c.rows_labeled_observed_usage_only === c.source_occurrence_rows, `observed labels ${c.rows_labeled_observed_usage_only}/${c.source_occurrence_rows}`),
    check('no_reader_payload_authority_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort();
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
    '# Agent 3 Definition Workbench Usage Collision Work Category Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: work/category navigation index only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Source occurrence rows: ${c.source_occurrence_rows}`,
    `- Category / work / category-license rows: ${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`,
    `- Queue links occurrence/category/work/category-license: ${c.occurrence_queue_links}/${c.category_queue_links}/${c.work_queue_links}/${c.category_license_queue_links}`,
    `- Categories with multiple works / works with multiple source refs / category-license rows with multiple works: ${c.categories_with_multiple_works}/${c.works_with_multiple_source_refs}/${c.category_license_rows_with_multiple_works}`,
    `- Complete metadata / route-ID rows: ${c.rows_with_complete_metadata}/${c.route_id_rows}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    '',
    '## Category Index',
    '',
    '| category | occurrences | queue links | source refs | works | licenses | route ids |',
    '|---|---:|---:|---:|---:|---:|---|',
    ...artifact.category_index.map((row) => `| ${escapeCell(row.category)} | ${row.occurrence_count} | ${row.queue_link_count} | ${row.source_ref_count} | ${row.work_count} | ${row.license_count} | ${row.related_agent2_route_ids.join(', ')} |`),
    '',
    '## Work Index',
    '',
    '| work | category | occurrences | queue links | source refs | licenses |',
    '|---|---|---:|---:|---:|---:|',
    ...artifact.work_index.map((row) => `| ${escapeCell(row.parts.work_title || row.work_id)} | ${escapeCell(row.parts.category || '')} | ${row.occurrence_count} | ${row.queue_link_count} | ${row.source_ref_count} | ${row.license_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This work/category index is Agent 3 QA/navigation evidence only. It preserves occurrence links and provenance visibility and does not mutate queues, inspect source text, or convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function escapeCell(value) {
  return String(value || '').replaceAll('|', '\\|').replace(/\s+/g, ' ');
}
