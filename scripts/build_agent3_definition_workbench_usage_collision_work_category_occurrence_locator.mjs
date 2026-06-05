#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json';
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.md';

const source = readJson(sourcePath);
const occurrenceMap = new Map();

for (const bucket of source.category_index || []) {
  addBucketOccurrences(bucket, 'category', bucket.category || 'unknown');
}
for (const bucket of source.work_index || []) {
  addBucketOccurrences(bucket, 'work', bucket.work_id || 'unknown');
}
for (const bucket of source.category_license_index || []) {
  const key = [bucket.category, bucket.license].filter(Boolean).join('::') || 'unknown';
  addBucketOccurrences(bucket, 'category_license', key);
}

const occurrence_locator_rows = [...occurrenceMap.values()]
  .map((row) => ({
    ...row,
    categories: [...row.categories].sort(),
    works: [...row.works].sort(),
    category_license_keys: [...row.category_license_keys].sort(),
    review_queue_ids: [...row.review_queue_ids].sort(),
    collision_types: [...row.collision_types].sort(),
    related_agent2_route_ids: [...row.related_agent2_route_ids].sort(),
    locator_link_count: row.locator_link_count,
  }))
  .sort((a, b) => a.work_id.localeCompare(b.work_id) || a.source_ref.localeCompare(b.source_ref) || a.occurrence_id.localeCompare(b.occurrence_id));

const counts = {
  source_grouped_occurrence_rows: Number(source.counts?.source_occurrence_rows || 0),
  unique_locator_rows: occurrence_locator_rows.length,
  duplicate_grouped_occurrence_rows: Number(source.counts?.source_occurrence_rows || 0) - occurrence_locator_rows.length,
  rows_with_source_ref: countRows((row) => row.source_ref),
  rows_with_source_url: countRows((row) => row.source_url),
  rows_with_local_work_anchor: countRows((row) => row.local_work_anchor),
  rows_with_phrase_context_snippet: countRows((row) => row.phrase_context_snippet),
  rows_with_work_id: countRows((row) => row.work_id),
  rows_with_work_title: countRows((row) => row.work_title),
  rows_with_category: countRows((row) => row.category),
  rows_with_license: countRows((row) => row.license && row.license_url),
  rows_with_version: countRows((row) => row.version_title && row.version_source),
  rows_with_route_ids: countRows((row) => row.related_agent2_route_ids.length > 0),
  rows_labeled_observed_usage_only: countRows((row) => row.row_label === 'observed usage only'),
  category_index_rows: Number(source.counts?.category_index_rows || 0),
  work_index_rows: Number(source.counts?.work_index_rows || 0),
  category_license_index_rows: Number(source.counts?.category_license_index_rows || 0),
  rows_with_category_bucket_links: countRows((row) => row.categories.length > 0),
  rows_with_work_bucket_links: countRows((row) => row.works.length > 0),
  rows_with_category_license_bucket_links: countRows((row) => row.category_license_keys.length > 0),
  queue_links: Number(source.counts?.occurrence_queue_links || 0),
  locator_membership_links: occurrence_locator_rows.reduce((sum, row) => sum + row.locator_link_count, 0),
  distinct_source_refs: new Set(occurrence_locator_rows.map((row) => row.source_ref).filter(Boolean)).size,
  distinct_works: new Set(occurrence_locator_rows.map((row) => row.work_id).filter(Boolean)).size,
  distinct_categories: new Set(occurrence_locator_rows.map((row) => row.category).filter(Boolean)).size,
  distinct_licenses: new Set(occurrence_locator_rows.map((row) => row.license).filter(Boolean)).size,
  distinct_version_sources: new Set(occurrence_locator_rows.map((row) => row.version_source).filter(Boolean)).size,
  distinct_route_ids: new Set(occurrence_locator_rows.flatMap((row) => row.related_agent2_route_ids)).size,
  reader_facing_rows: countRows((row) => row.reader_facing === true),
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_reads: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_occurrence_locator',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: source.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_work_category_index: sourcePath,
  },
  policy: 'Occurrence locator index derived from the Agent 3 work/category usage-navigation index. It deduplicates grouped occurrence samples into concrete source/local anchor rows for QA navigation only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    occurrence_locator_only: true,
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
  occurrence_locator_rows,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 work/category occurrence locator ${artifact.status}; rows ${counts.unique_locator_rows}; anchors ${counts.rows_with_local_work_anchor}/${counts.unique_locator_rows}`);

function addBucketOccurrences(bucket, linkType, linkKey) {
  for (const occurrence of bucket.sample_occurrences || []) {
    if (!occurrence.occurrence_id) continue;
    if (!occurrenceMap.has(occurrence.occurrence_id)) {
      occurrenceMap.set(occurrence.occurrence_id, {
        occurrence_id: occurrence.occurrence_id,
        source_ref: occurrence.source_ref || null,
        source_url: occurrence.source_url || null,
        local_work_anchor: occurrence.local_work_anchor || null,
        work_id: occurrence.work_id || null,
        work_title: occurrence.work_title || null,
        category: occurrence.category || null,
        phrase_context_snippet: occurrence.phrase_context_snippet || null,
        license: occurrence.license || null,
        license_url: occurrence.license_url || null,
        version_title: occurrence.version_title || null,
        version_source: occurrence.version_source || null,
        related_agent2_route_ids: new Set(),
        categories: new Set(),
        works: new Set(),
        category_license_keys: new Set(),
        review_queue_ids: new Set(),
        collision_types: new Set(),
        row_label: occurrence.row_label || 'observed usage only',
        reader_facing: occurrence.reader_facing === true,
        not_definition_authority: occurrence.not_definition_authority !== false,
        locator_link_count: 0,
      });
    }
    const row = occurrenceMap.get(occurrence.occurrence_id);
    row.locator_link_count += 1;
    if (linkType === 'category') row.categories.add(linkKey);
    if (linkType === 'work') row.works.add(linkKey);
    if (linkType === 'category_license') row.category_license_keys.add(linkKey);
    for (const id of occurrence.related_agent2_route_ids || []) row.related_agent2_route_ids.add(id);
    for (const id of bucket.review_queue_ids || []) row.review_queue_ids.add(id);
    for (const type of bucket.collision_types || []) row.collision_types.add(type);
  }
}

function buildChecks(c) {
  return [
    check('locator_rows_present', c.unique_locator_rows === 96 && c.source_grouped_occurrence_rows === 106, `unique/source ${c.unique_locator_rows}/${c.source_grouped_occurrence_rows}`),
    check('clickable_occurrence_links_complete', c.rows_with_source_url === c.unique_locator_rows && c.rows_with_local_work_anchor === c.unique_locator_rows, `source-url/local-anchor ${c.rows_with_source_url}/${c.rows_with_local_work_anchor}`),
    check('context_and_source_refs_complete', c.rows_with_source_ref === c.unique_locator_rows && c.rows_with_phrase_context_snippet === c.unique_locator_rows, `source-ref/context ${c.rows_with_source_ref}/${c.rows_with_phrase_context_snippet}`),
    check('metadata_complete', c.rows_with_work_id === c.unique_locator_rows && c.rows_with_work_title === c.unique_locator_rows && c.rows_with_category === c.unique_locator_rows && c.rows_with_license === c.unique_locator_rows && c.rows_with_version === c.unique_locator_rows, `work/title/category/license/version ${c.rows_with_work_id}/${c.rows_with_work_title}/${c.rows_with_category}/${c.rows_with_license}/${c.rows_with_version}`),
    check('route_ids_only_visible', c.rows_with_route_ids === c.unique_locator_rows && c.distinct_route_ids === 1, `route rows/distinct ${c.rows_with_route_ids}/${c.distinct_route_ids}`),
    check('observed_usage_labels_complete', c.rows_labeled_observed_usage_only === c.unique_locator_rows, `observed ${c.rows_labeled_observed_usage_only}/${c.unique_locator_rows}`),
    check('bucket_context_visible', c.category_index_rows === 8 && c.work_index_rows === 24 && c.category_license_index_rows === 8 && c.rows_with_category_bucket_links === 58 && c.rows_with_work_bucket_links === 96 && c.rows_with_category_license_bucket_links === 58 && c.locator_membership_links === 212, `category/work/category-license rows ${c.rows_with_category_bucket_links}/${c.rows_with_work_bucket_links}/${c.rows_with_category_license_bucket_links}; buckets ${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}; links ${c.locator_membership_links}`),
    check('source_work_license_diversity_visible', c.distinct_source_refs === 49 && c.distinct_works === 24 && c.distinct_categories === 8 && c.distinct_licenses === 2, `source/work/category/license ${c.distinct_source_refs}/${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}`),
    check('no_reader_payload_authority_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Collision Work/Category Occurrence Locator',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is occurrence-link navigation only and not Definition authority.',
    '',
    '## Scope',
    '',
    'This packet deduplicates the current work/category grouped occurrence samples into concrete source/local anchor rows. It supports QA navigation from category/work buckets to source refs, local work anchors, snippets, license/version metadata, and route IDs.',
    '',
    '## Counts',
    '',
    `- Unique locator rows / grouped occurrence rows: ${c.unique_locator_rows}/${c.source_grouped_occurrence_rows}`,
    `- Duplicate grouped occurrence rows: ${c.duplicate_grouped_occurrence_rows}`,
    `- Source URLs / local anchors / snippets: ${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}`,
    `- Work IDs / work titles / categories: ${c.rows_with_work_id}/${c.rows_with_work_title}/${c.rows_with_category}`,
    `- License rows / version rows: ${c.rows_with_license}/${c.rows_with_version}`,
    `- Route-ID rows / distinct route IDs: ${c.rows_with_route_ids}/${c.distinct_route_ids}`,
    `- Category / work / category-license buckets: ${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`,
    `- Rows with category / work / category-license bucket links: ${c.rows_with_category_bucket_links}/${c.rows_with_work_bucket_links}/${c.rows_with_category_license_bucket_links}`,
    `- Locator membership links / queue links: ${c.locator_membership_links}/${c.queue_links}`,
    `- Distinct source refs / works / categories / licenses / version sources: ${c.distinct_source_refs}/${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}/${c.distinct_version_sources}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`,
    '',
    '## Locator Preview',
    '',
    '| occurrence_id | source_ref | work_id | category | local_anchor |',
    '|---|---|---|---|---|',
    ...value.occurrence_locator_rows.slice(0, 12).map((row) => `| ${row.occurrence_id} | ${row.source_ref} | ${row.work_id} | ${row.category} | \`${row.local_work_anchor}\` |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This locator exposes ${c.unique_locator_rows} observed-usage occurrence rows with complete source URLs, local work anchors, snippets, license/version metadata, and route-ID pointers. It preserves ${c.category_index_rows} category buckets, ${c.work_index_rows} work buckets, ${c.category_license_index_rows} category-license buckets, and ${c.queue_links} queue links without copying Agent 2 route payloads.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This locator is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function countRows(predicate) {
  return occurrence_locator_rows.filter(predicate).length;
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
