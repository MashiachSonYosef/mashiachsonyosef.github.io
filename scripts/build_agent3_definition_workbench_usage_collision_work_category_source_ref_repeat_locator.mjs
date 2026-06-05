#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json';
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.md';

const source = readJson(sourcePath);
const rows = source.occurrence_locator_rows || [];

const source_ref_repeat_index = buildBuckets('source_ref', 'source_ref').filter((bucket) => bucket.occurrence_count > 1);
const local_anchor_repeat_index = buildBuckets('local_work_anchor', 'local_work_anchor').filter((bucket) => bucket.occurrence_count > 1);
const phrase_context_repeat_index = buildBuckets('phrase_context_snippet', 'phrase_context_snippet').filter((bucket) => bucket.occurrence_count > 1);

const counts = {
  source_locator_rows: rows.length,
  source_ref_buckets: new Set(rows.map((row) => row.source_ref).filter(Boolean)).size,
  source_ref_repeat_buckets: source_ref_repeat_index.length,
  source_ref_repeat_rows: sum(source_ref_repeat_index, 'occurrence_count'),
  max_source_ref_repeat_count: Math.max(...source_ref_repeat_index.map((bucket) => bucket.occurrence_count)),
  local_anchor_buckets: new Set(rows.map((row) => row.local_work_anchor).filter(Boolean)).size,
  local_anchor_repeat_buckets: local_anchor_repeat_index.length,
  local_anchor_repeat_rows: sum(local_anchor_repeat_index, 'occurrence_count'),
  phrase_context_buckets: new Set(rows.map((row) => row.phrase_context_snippet).filter(Boolean)).size,
  phrase_context_repeat_buckets: phrase_context_repeat_index.length,
  phrase_context_repeat_rows: sum(phrase_context_repeat_index, 'occurrence_count'),
  cross_work_phrase_context_repeat_buckets: phrase_context_repeat_index.filter((bucket) => bucket.work_count > 1).length,
  cross_category_phrase_context_repeat_buckets: phrase_context_repeat_index.filter((bucket) => bucket.category_count > 1).length,
  rows_with_source_url: rows.filter((row) => row.source_url).length,
  rows_with_local_work_anchor: rows.filter((row) => row.local_work_anchor).length,
  rows_with_phrase_context_snippet: rows.filter((row) => row.phrase_context_snippet).length,
  rows_with_license: rows.filter((row) => row.license && row.license_url).length,
  rows_with_version: rows.filter((row) => row.version_title && row.version_source).length,
  rows_with_route_ids: rows.filter((row) => Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0).length,
  rows_labeled_observed_usage_only: rows.filter((row) => row.row_label === 'observed usage only').length,
  distinct_works: new Set(rows.map((row) => row.work_id).filter(Boolean)).size,
  distinct_categories: new Set(rows.map((row) => row.category).filter(Boolean)).size,
  distinct_licenses: new Set(rows.map((row) => row.license).filter(Boolean)).size,
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
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: source.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_work_category_occurrence_locator: sourcePath,
  },
  policy: 'Source-ref repeat locator derived from Agent 3 occurrence locator rows. It groups already-observed usage rows by repeated source refs, local anchors, and phrase snippets for QA navigation only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    source_ref_repeat_locator_only: true,
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
  source_ref_repeat_index,
  local_anchor_repeat_index,
  phrase_context_repeat_index,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 source-ref repeat locator ${artifact.status}; repeated refs ${counts.source_ref_repeat_buckets}; repeated rows ${counts.source_ref_repeat_rows}`);

function buildBuckets(key, bucketType) {
  const groups = new Map();
  for (const row of rows) {
    const bucketKey = row[key] || 'unknown';
    if (!groups.has(bucketKey)) groups.set(bucketKey, []);
    groups.get(bucketKey).push(row);
  }
  return [...groups.entries()].map(([bucketKey, bucketRows]) => ({
    bucket_type: bucketType,
    bucket_key: bucketKey,
    occurrence_count: bucketRows.length,
    source_ref_count: new Set(bucketRows.map((row) => row.source_ref).filter(Boolean)).size,
    local_anchor_count: new Set(bucketRows.map((row) => row.local_work_anchor).filter(Boolean)).size,
    work_count: new Set(bucketRows.map((row) => row.work_id).filter(Boolean)).size,
    category_count: new Set(bucketRows.map((row) => row.category).filter(Boolean)).size,
    license_count: new Set(bucketRows.map((row) => row.license).filter(Boolean)).size,
    route_ids: [...new Set(bucketRows.flatMap((row) => row.related_agent2_route_ids || []))].sort(),
    sample_occurrences: bucketRows.map((row) => ({
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
  })).sort((a, b) => b.occurrence_count - a.occurrence_count || a.bucket_key.localeCompare(b.bucket_key));
}

function buildChecks(c) {
  return [
    check('source_locator_rows_present', c.source_locator_rows === 96, `rows ${c.source_locator_rows}`),
    check('source_ref_repeats_visible', c.source_ref_buckets === 49 && c.source_ref_repeat_buckets === 23 && c.source_ref_repeat_rows === 70 && c.max_source_ref_repeat_count === 5, `source buckets/repeat buckets/repeat rows/max ${c.source_ref_buckets}/${c.source_ref_repeat_buckets}/${c.source_ref_repeat_rows}/${c.max_source_ref_repeat_count}`),
    check('local_anchor_repeats_visible', c.local_anchor_buckets === 49 && c.local_anchor_repeat_buckets === 23 && c.local_anchor_repeat_rows === 70, `anchor buckets/repeat buckets/repeat rows ${c.local_anchor_buckets}/${c.local_anchor_repeat_buckets}/${c.local_anchor_repeat_rows}`),
    check('phrase_context_repeats_visible', c.phrase_context_buckets === 89 && c.phrase_context_repeat_buckets === 7 && c.phrase_context_repeat_rows === 14, `snippet buckets/repeat buckets/repeat rows ${c.phrase_context_buckets}/${c.phrase_context_repeat_buckets}/${c.phrase_context_repeat_rows}`),
    check('cross_frame_snippet_repeats_visible', c.cross_work_phrase_context_repeat_buckets === 3 && c.cross_category_phrase_context_repeat_buckets === 1, `cross-work/cross-category ${c.cross_work_phrase_context_repeat_buckets}/${c.cross_category_phrase_context_repeat_buckets}`),
    check('clickable_metadata_complete', c.rows_with_source_url === 96 && c.rows_with_local_work_anchor === 96 && c.rows_with_phrase_context_snippet === 96 && c.rows_with_license === 96 && c.rows_with_version === 96, `source/local/context/license/version ${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}/${c.rows_with_license}/${c.rows_with_version}`),
    check('route_ids_only_visible', c.rows_with_route_ids === 96 && c.distinct_route_ids === 1, `route rows/distinct ${c.rows_with_route_ids}/${c.distinct_route_ids}`),
    check('observed_usage_labels_complete', c.rows_labeled_observed_usage_only === 96, `observed ${c.rows_labeled_observed_usage_only}/96`),
    check('work_category_license_visibility', c.distinct_works === 24 && c.distinct_categories === 8 && c.distinct_licenses === 2, `work/category/license ${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}`),
    check('no_reader_payload_authority_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Collision Work/Category Source-Ref Repeat Locator',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is repeat-navigation evidence only and not Definition authority.',
    '',
    '## Scope',
    '',
    'This packet groups concrete occurrence locator rows by repeated source refs, local anchors, and phrase snippets. It helps QA distinguish same-ref repetition from repeated phrase snippets across works/categories without making semantic or definition claims.',
    '',
    '## Counts',
    '',
    `- Source locator rows: ${c.source_locator_rows}`,
    `- Source-ref buckets / repeated buckets / repeated rows / max repeat: ${c.source_ref_buckets}/${c.source_ref_repeat_buckets}/${c.source_ref_repeat_rows}/${c.max_source_ref_repeat_count}`,
    `- Local-anchor buckets / repeated buckets / repeated rows: ${c.local_anchor_buckets}/${c.local_anchor_repeat_buckets}/${c.local_anchor_repeat_rows}`,
    `- Phrase-context buckets / repeated buckets / repeated rows: ${c.phrase_context_buckets}/${c.phrase_context_repeat_buckets}/${c.phrase_context_repeat_rows}`,
    `- Cross-work / cross-category repeated phrase-context buckets: ${c.cross_work_phrase_context_repeat_buckets}/${c.cross_category_phrase_context_repeat_buckets}`,
    `- Source URL / local anchor / snippet / license / version rows: ${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}/${c.rows_with_license}/${c.rows_with_version}`,
    `- Route-ID rows / distinct route IDs: ${c.rows_with_route_ids}/${c.distinct_route_ids}`,
    `- Distinct works / categories / licenses: ${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`,
    '',
    '## Repeated Source Ref Preview',
    '',
    '| source_ref | occurrences | work_count | local_anchor_count | route ids |',
    '|---|---:|---:|---:|---:|',
    ...value.source_ref_repeat_index.slice(0, 15).map((row) => `| ${row.bucket_key} | ${row.occurrence_count} | ${row.work_count} | ${row.local_anchor_count} | ${row.route_ids.length} |`),
    '',
    '## Repeated Snippet Preview',
    '',
    '| phrase_context_snippet | occurrences | works | categories | anchors |',
    '|---|---:|---:|---:|---:|',
    ...value.phrase_context_repeat_index.map((row) => `| ${row.bucket_key} | ${row.occurrence_count} | ${row.work_count} | ${row.category_count} | ${row.local_anchor_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This repeat locator exposes ${c.source_ref_repeat_buckets} repeated source-ref buckets covering ${c.source_ref_repeat_rows} observed-usage rows and ${c.phrase_context_repeat_buckets} repeated phrase-context buckets covering ${c.phrase_context_repeat_rows} rows. It preserves source/local/provenance links and route IDs only, with no route payload copying or authority claim.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This repeat locator is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
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
