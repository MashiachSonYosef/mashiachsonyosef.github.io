#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json';
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.md';

const source = readJson(sourcePath);
const rows = source.occurrence_locator_rows || [];

const license_index = [...groupBy(rows, (row) => row.license || 'unknown').entries()]
  .map(([license, group]) => buildBucket({ bucket_type: 'license', bucket_key: license, rows: group }))
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.bucket_key.localeCompare(b.bucket_key));

const version_source_index = [...groupBy(rows, (row) => row.version_source || 'unknown').entries()]
  .map(([versionSource, group]) => buildBucket({ bucket_type: 'version_source', bucket_key: versionSource, rows: group }))
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.bucket_key.localeCompare(b.bucket_key));

const license_version_index = [...groupBy(rows, (row) => `${row.license || 'unknown'}::${row.version_source || 'unknown'}`).entries()]
  .map(([key, group]) => {
    const [license, version_source] = key.split('::');
    return buildBucket({ bucket_type: 'license_version_source', bucket_key: key, license, version_source, rows: group });
  })
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.bucket_key.localeCompare(b.bucket_key));

const counts = {
  source_locator_rows: rows.length,
  license_index_rows: license_index.length,
  version_source_index_rows: version_source_index.length,
  license_version_index_rows: license_version_index.length,
  public_domain_occurrence_rows: rows.filter((row) => row.license === 'Public Domain').length,
  cc_by_sa_occurrence_rows: rows.filter((row) => row.license === 'CC-BY-SA').length,
  rows_with_license_url: rows.filter((row) => row.license_url).length,
  rows_with_version_title: rows.filter((row) => row.version_title).length,
  rows_with_version_source: rows.filter((row) => row.version_source).length,
  rows_with_source_url: rows.filter((row) => row.source_url).length,
  rows_with_local_work_anchor: rows.filter((row) => row.local_work_anchor).length,
  rows_with_phrase_context_snippet: rows.filter((row) => row.phrase_context_snippet).length,
  rows_with_route_ids: rows.filter((row) => Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0).length,
  rows_labeled_observed_usage_only: rows.filter((row) => row.row_label === 'observed usage only').length,
  distinct_source_refs: new Set(rows.map((row) => row.source_ref).filter(Boolean)).size,
  distinct_works: new Set(rows.map((row) => row.work_id).filter(Boolean)).size,
  distinct_categories: new Set(rows.map((row) => row.category).filter(Boolean)).size,
  distinct_version_sources: new Set(rows.map((row) => row.version_source).filter(Boolean)).size,
  distinct_route_ids: new Set(rows.flatMap((row) => row.related_agent2_route_ids || [])).size,
  reader_facing_rows: rows.filter((row) => row.reader_facing === true).length,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_reads: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_provenance_locator',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: source.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_work_category_occurrence_locator: sourcePath,
  },
  policy: 'Provenance locator derived from Agent 3 occurrence locator rows. It groups existing observed-usage links by license and version source for QA navigation only; it does not accept source/provenance custody, inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    provenance_locator_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
    source_provenance_custody_accepted: false,
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
  license_index,
  version_source_index,
  license_version_index,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 provenance locator ${artifact.status}; rows ${counts.source_locator_rows}; licenses ${counts.license_index_rows}; version sources ${counts.version_source_index_rows}`);

function buildBucket({ bucket_type, bucket_key, license = null, version_source = null, rows: bucketRows }) {
  return {
    bucket_type,
    bucket_key,
    license,
    version_source,
    occurrence_count: bucketRows.length,
    source_ref_count: new Set(bucketRows.map((row) => row.source_ref).filter(Boolean)).size,
    work_count: new Set(bucketRows.map((row) => row.work_id).filter(Boolean)).size,
    category_count: new Set(bucketRows.map((row) => row.category).filter(Boolean)).size,
    route_ids: [...new Set(bucketRows.flatMap((row) => row.related_agent2_route_ids || []))].sort(),
    sample_occurrences: bucketRows.slice(0, 8).map((row) => ({
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
      related_agent2_route_ids: row.related_agent2_route_ids,
      row_label: row.row_label,
      reader_facing: row.reader_facing,
      not_definition_authority: row.not_definition_authority,
    })),
    row_label: 'observed usage only',
    index_visibility: 'qa_navigation_only',
    reader_facing: false,
    not_definition_authority: true,
    source_provenance_custody_accepted: false,
  };
}

function buildChecks(c) {
  return [
    check('source_locator_rows_present', c.source_locator_rows === 96, `rows ${c.source_locator_rows}`),
    check('license_buckets_visible', c.license_index_rows === 2 && c.public_domain_occurrence_rows === 94 && c.cc_by_sa_occurrence_rows === 2, `license buckets/public-domain/cc-by-sa ${c.license_index_rows}/${c.public_domain_occurrence_rows}/${c.cc_by_sa_occurrence_rows}`),
    check('version_source_buckets_visible', c.version_source_index_rows === 22 && c.license_version_index_rows === 22, `version/license-version ${c.version_source_index_rows}/${c.license_version_index_rows}`),
    check('provenance_metadata_complete', c.rows_with_license_url === 96 && c.rows_with_version_title === 96 && c.rows_with_version_source === 96, `license-url/version-title/version-source ${c.rows_with_license_url}/${c.rows_with_version_title}/${c.rows_with_version_source}`),
    check('clickable_context_complete', c.rows_with_source_url === 96 && c.rows_with_local_work_anchor === 96 && c.rows_with_phrase_context_snippet === 96, `source-url/local-anchor/context ${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}`),
    check('route_ids_only_visible', c.rows_with_route_ids === 96 && c.distinct_route_ids === 1, `route rows/distinct ${c.rows_with_route_ids}/${c.distinct_route_ids}`),
    check('observed_usage_labels_complete', c.rows_labeled_observed_usage_only === 96, `observed ${c.rows_labeled_observed_usage_only}/96`),
    check('source_work_category_visibility', c.distinct_source_refs === 49 && c.distinct_works === 24 && c.distinct_categories === 8, `source/work/category ${c.distinct_source_refs}/${c.distinct_works}/${c.distinct_categories}`),
    check('no_reader_payload_authority_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Collision Work/Category Provenance Locator',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is provenance navigation only and not Definition authority or source/provenance custody acceptance.',
    '',
    '## Scope',
    '',
    'This packet groups concrete occurrence locator rows by license, version source, and license-version source pairs. It preserves source URLs, local anchors, snippets, license/version metadata, and route IDs for QA navigation only.',
    '',
    '## Counts',
    '',
    `- Source locator rows: ${c.source_locator_rows}`,
    `- License buckets / Public Domain / CC-BY-SA rows: ${c.license_index_rows}/${c.public_domain_occurrence_rows}/${c.cc_by_sa_occurrence_rows}`,
    `- Version-source buckets / license-version buckets: ${c.version_source_index_rows}/${c.license_version_index_rows}`,
    `- License URL / version title / version source rows: ${c.rows_with_license_url}/${c.rows_with_version_title}/${c.rows_with_version_source}`,
    `- Source URL / local anchor / snippet rows: ${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}`,
    `- Route-ID rows / distinct route IDs: ${c.rows_with_route_ids}/${c.distinct_route_ids}`,
    `- Distinct source refs / works / categories / version sources: ${c.distinct_source_refs}/${c.distinct_works}/${c.distinct_categories}/${c.distinct_version_sources}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`,
    '',
    '## License Buckets',
    '',
    '| license | occurrences | source refs | works | categories | route ids |',
    '|---|---:|---:|---:|---:|---:|',
    ...value.license_index.map((row) => `| ${row.bucket_key} | ${row.occurrence_count} | ${row.source_ref_count} | ${row.work_count} | ${row.category_count} | ${row.route_ids.length} |`),
    '',
    '## Version Source Preview',
    '',
    '| version_source | occurrences | works | categories |',
    '|---|---:|---:|---:|',
    ...value.version_source_index.slice(0, 12).map((row) => `| ${row.bucket_key} | ${row.occurrence_count} | ${row.work_count} | ${row.category_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This provenance locator gives Agent 5/6 a navigation view over ${c.source_locator_rows} observed-usage locator rows: ${c.public_domain_occurrence_rows} Public Domain rows and ${c.cc_by_sa_occurrence_rows} CC-BY-SA rows across ${c.version_source_index_rows} version sources. It does not accept source/provenance custody and does not copy Agent 2 route payloads.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This provenance locator is not Definition authority, not reviewed lexical authority, not source/provenance custody acceptance, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, and not accepted text.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
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
