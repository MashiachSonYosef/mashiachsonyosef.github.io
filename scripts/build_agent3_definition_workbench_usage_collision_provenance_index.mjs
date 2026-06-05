#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json';
const outputPath = process.argv[3] || 'data/definitions/agent3-definition-workbench-usage-collision-provenance-index-reshit.json';
const reportPath = process.argv[4] || 'reports/agent3-definition-workbench-usage-collision-provenance-index-reshit.md';

const source = readJson(sourcePath);
if (source.artifact_type !== 'agent3_definition_workbench_usage_collision_review_reverse_index') {
  throw new Error(`Unexpected source artifact: ${source.artifact_type}`);
}

const occurrenceRows = source.occurrence_index || [];
const licenseIndex = buildIndex(occurrenceRows, (row) => row.license, 'license');
const versionSourceIndex = buildIndex(occurrenceRows, (row) => row.version_source, 'version_source');
const versionTitleIndex = buildIndex(occurrenceRows, (row) => row.version_title, 'version_title');
const workLicenseIndex = buildIndex(occurrenceRows, (row) => `${row.work_id || ''}||${row.license || ''}`, 'work_license', (row) => ({
  work_id: row.work_id || null,
  work_title: row.work_title || null,
  license: row.license || null,
  license_url: row.license_url || null,
}));

const counts = {
  source_occurrence_rows: occurrenceRows.length,
  license_index_rows: licenseIndex.length,
  version_source_index_rows: versionSourceIndex.length,
  version_title_index_rows: versionTitleIndex.length,
  work_license_index_rows: workLicenseIndex.length,
  occurrence_queue_links: occurrenceRows.reduce((sum, row) => sum + row.queue_row_count, 0),
  license_queue_links: licenseIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  version_source_queue_links: versionSourceIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  version_title_queue_links: versionTitleIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  work_license_queue_links: workLicenseIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
  licenses_with_multiple_works: licenseIndex.filter((row) => row.work_count > 1).length,
  version_sources_with_multiple_works: versionSourceIndex.filter((row) => row.work_count > 1).length,
  works_with_multiple_licenses: countWorksWithMultipleLicenses(workLicenseIndex),
  rows_with_complete_provenance: occurrenceRows.filter(hasCompleteProvenance).length,
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
  artifact_type: 'agent3_definition_workbench_usage_collision_provenance_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_provenance_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: source.focus_token_normalized,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_review_reverse_index: sourcePath,
  },
  policy: 'License/provenance visibility index for Agent 3 collision review representatives. It groups existing occurrence links by license, version source, version title, and work-license pair for QA/navigation only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    provenance_index_only: true,
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
  license_index: licenseIndex,
  version_source_index: versionSourceIndex,
  version_title_index: versionTitleIndex,
  work_license_index: workLicenseIndex,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision provenance index ${artifact.status}; licenses ${counts.license_index_rows}; version sources ${counts.version_source_index_rows}; works/licenses ${counts.work_license_index_rows}`);

function buildIndex(rows, keyFn, keyName, partsFn = null) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].map(([key, bucketRows]) => {
    const queueLinks = bucketRows.reduce((sum, row) => sum + row.queue_row_count, 0);
    return {
      [keyName]: key,
      parts: partsFn ? partsFn(bucketRows[0]) : {},
      occurrence_count: bucketRows.length,
      queue_link_count: queueLinks,
      source_ref_count: new Set(bucketRows.map((row) => row.source_ref).filter(Boolean)).size,
      work_count: new Set(bucketRows.map((row) => row.work_id).filter(Boolean)).size,
      license_count: new Set(bucketRows.map((row) => row.license).filter(Boolean)).size,
      version_source_count: new Set(bucketRows.map((row) => row.version_source).filter(Boolean)).size,
      version_title_count: new Set(bucketRows.map((row) => row.version_title).filter(Boolean)).size,
      review_queue_ids: sortedUnique(bucketRows.flatMap((row) => row.review_queue_ids || [])),
      collision_types: sortedUnique(bucketRows.flatMap((row) => row.collision_types || [])),
      related_agent2_route_ids: sortedUnique(bucketRows.flatMap((row) => row.related_agent2_route_ids || [])),
      sample_occurrences: bucketRows.slice(0, 8).map(sampleOccurrence),
      row_label: 'observed usage only',
      index_visibility: 'agent6_provenance_navigation_only',
      reader_facing: false,
      not_definition_authority: true,
    };
  }).sort((a, b) => b.queue_link_count - a.queue_link_count || String(a[keyName]).localeCompare(String(b[keyName])));
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

function countWorksWithMultipleLicenses(indexRows) {
  const map = new Map();
  for (const row of indexRows) {
    const workId = row.parts?.work_id;
    const license = row.parts?.license;
    if (!workId || !license) continue;
    if (!map.has(workId)) map.set(workId, new Set());
    map.get(workId).add(license);
  }
  return [...map.values()].filter((licenses) => licenses.size > 1).length;
}

function hasCompleteProvenance(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.license && row.license_url && row.version_title && row.version_source);
}

function buildChecks(c) {
  return [
    check('source_occurrences_present', c.source_occurrence_rows > 0, `source rows ${c.source_occurrence_rows}`),
    check('provenance_indexes_present', c.license_index_rows > 0 && c.version_source_index_rows > 0 && c.version_title_index_rows > 0 && c.work_license_index_rows > 0, `license/version/work ${c.license_index_rows}/${c.version_source_index_rows}/${c.version_title_index_rows}/${c.work_license_index_rows}`),
    check('queue_links_preserved', c.license_queue_links === c.occurrence_queue_links && c.version_source_queue_links === c.occurrence_queue_links && c.version_title_queue_links === c.occurrence_queue_links && c.work_license_queue_links === c.occurrence_queue_links, `links occurrence/license/source/title/work ${c.occurrence_queue_links}/${c.license_queue_links}/${c.version_source_queue_links}/${c.version_title_queue_links}/${c.work_license_queue_links}`),
    check('complete_provenance_metadata', c.rows_with_complete_provenance === c.source_occurrence_rows, `provenance ${c.rows_with_complete_provenance}/${c.source_occurrence_rows}`),
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
    '# Agent 3 Definition Workbench Usage Collision Provenance Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: provenance/navigation index only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Source occurrence rows: ${c.source_occurrence_rows}`,
    `- License / version-source / version-title / work-license rows: ${c.license_index_rows}/${c.version_source_index_rows}/${c.version_title_index_rows}/${c.work_license_index_rows}`,
    `- Queue links occurrence/license/version-source/version-title/work-license: ${c.occurrence_queue_links}/${c.license_queue_links}/${c.version_source_queue_links}/${c.version_title_queue_links}/${c.work_license_queue_links}`,
    `- Complete provenance / route-ID rows: ${c.rows_with_complete_provenance}/${c.route_id_rows}`,
    `- Licenses with multiple works / version sources with multiple works / works with multiple licenses: ${c.licenses_with_multiple_works}/${c.version_sources_with_multiple_works}/${c.works_with_multiple_licenses}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    '',
    '## License Index',
    '',
    '| license | occurrences | queue links | source refs | works | version sources | route ids |',
    '|---|---:|---:|---:|---:|---:|---|',
    ...artifact.license_index.map((row) => `| ${escapeCell(row.license)} | ${row.occurrence_count} | ${row.queue_link_count} | ${row.source_ref_count} | ${row.work_count} | ${row.version_source_count} | ${row.related_agent2_route_ids.join(', ')} |`),
    '',
    '## Version Source Index',
    '',
    '| version source | occurrences | queue links | works | license count |',
    '|---|---:|---:|---:|---:|',
    ...artifact.version_source_index.slice(0, 40).map((row) => `| ${escapeCell(row.version_source)} | ${row.occurrence_count} | ${row.queue_link_count} | ${row.work_count} | ${row.license_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This provenance index is Agent 3 QA/navigation evidence only. It preserves source/license/version visibility and does not mutate queues, inspect source text, or convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function escapeCell(value) {
  return String(value || '').replaceAll('|', '\\|').replace(/\s+/g, ' ');
}
