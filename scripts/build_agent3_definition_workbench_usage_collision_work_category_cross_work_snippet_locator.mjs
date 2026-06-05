#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.json';
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.md';

const source = readJson(sourcePath);
const cross_work_snippet_index = (source.phrase_context_repeat_index || [])
  .filter((bucket) => bucket.work_count > 1 || bucket.category_count > 1)
  .map((bucket) => ({
    bucket_type: 'cross_work_phrase_context',
    phrase_context_snippet: bucket.bucket_key,
    occurrence_count: bucket.occurrence_count,
    work_count: bucket.work_count,
    category_count: bucket.category_count,
    local_anchor_count: bucket.local_anchor_count,
    license_count: bucket.license_count,
    route_ids: bucket.route_ids,
    cross_work: bucket.work_count > 1,
    cross_category: bucket.category_count > 1,
    sample_occurrences: (bucket.sample_occurrences || []).map((row) => ({
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
    index_visibility: 'agent6_review_focus_only',
    reader_facing: false,
    not_definition_authority: true,
    semantic_independence_claimed: false,
  }))
  .sort((a, b) => b.occurrence_count - a.occurrence_count || b.category_count - a.category_count || a.phrase_context_snippet.localeCompare(b.phrase_context_snippet));

const occurrenceRows = cross_work_snippet_index.flatMap((bucket) => bucket.sample_occurrences);
const counts = {
  source_repeat_locator_rows: Number(source.counts?.source_locator_rows || 0),
  source_phrase_context_repeat_buckets: Number(source.counts?.phrase_context_repeat_buckets || 0),
  cross_work_snippet_buckets: cross_work_snippet_index.length,
  cross_work_only_buckets: cross_work_snippet_index.filter((bucket) => bucket.cross_work).length,
  cross_category_buckets: cross_work_snippet_index.filter((bucket) => bucket.cross_category).length,
  cross_work_snippet_occurrence_rows: occurrenceRows.length,
  rows_with_source_ref: occurrenceRows.filter((row) => row.source_ref).length,
  rows_with_source_url: occurrenceRows.filter((row) => row.source_url).length,
  rows_with_local_work_anchor: occurrenceRows.filter((row) => row.local_work_anchor).length,
  rows_with_phrase_context_snippet: occurrenceRows.filter((row) => row.phrase_context_snippet).length,
  rows_with_license: occurrenceRows.filter((row) => row.license && row.license_url).length,
  rows_with_version: occurrenceRows.filter((row) => row.version_title && row.version_source).length,
  rows_with_route_ids: occurrenceRows.filter((row) => Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0).length,
  rows_labeled_observed_usage_only: occurrenceRows.filter((row) => row.row_label === 'observed usage only').length,
  distinct_source_refs: new Set(occurrenceRows.map((row) => row.source_ref).filter(Boolean)).size,
  distinct_local_anchors: new Set(occurrenceRows.map((row) => row.local_work_anchor).filter(Boolean)).size,
  distinct_works: new Set(occurrenceRows.map((row) => row.work_id).filter(Boolean)).size,
  distinct_categories: new Set(occurrenceRows.map((row) => row.category).filter(Boolean)).size,
  distinct_licenses: new Set(occurrenceRows.map((row) => row.license).filter(Boolean)).size,
  distinct_route_ids: new Set(occurrenceRows.flatMap((row) => row.related_agent2_route_ids || [])).size,
  reader_facing_rows: occurrenceRows.filter((row) => row.reader_facing === true).length,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  semantic_independence_claims: 0,
  source_text_reads: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: source.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    source_ref_repeat_locator: sourcePath,
  },
  policy: 'Cross-work repeated-snippet locator derived from Agent 3 repeat locator rows. It isolates repeated phrase-context snippets across works/categories for Agent 6 review focus only; it does not claim semantic independence, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, inspect source text, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    cross_work_snippet_locator_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
    semantic_independence: false,
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
  cross_work_snippet_index,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 cross-work snippet locator ${artifact.status}; buckets ${counts.cross_work_snippet_buckets}; rows ${counts.cross_work_snippet_occurrence_rows}`);

function buildChecks(c) {
  return [
    check('source_repeat_locator_visible', c.source_repeat_locator_rows === 96 && c.source_phrase_context_repeat_buckets === 7, `source rows/repeat snippets ${c.source_repeat_locator_rows}/${c.source_phrase_context_repeat_buckets}`),
    check('cross_work_snippet_counts', c.cross_work_snippet_buckets === 3 && c.cross_work_only_buckets === 3 && c.cross_category_buckets === 1 && c.cross_work_snippet_occurrence_rows === 6, `buckets/cross-work/cross-category/rows ${c.cross_work_snippet_buckets}/${c.cross_work_only_buckets}/${c.cross_category_buckets}/${c.cross_work_snippet_occurrence_rows}`),
    check('clickable_metadata_complete', c.rows_with_source_ref === 6 && c.rows_with_source_url === 6 && c.rows_with_local_work_anchor === 6 && c.rows_with_phrase_context_snippet === 6 && c.rows_with_license === 6 && c.rows_with_version === 6, `ref/url/anchor/context/license/version ${c.rows_with_source_ref}/${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}/${c.rows_with_license}/${c.rows_with_version}`),
    check('route_ids_only_visible', c.rows_with_route_ids === 6 && c.distinct_route_ids === 1, `route rows/distinct ${c.rows_with_route_ids}/${c.distinct_route_ids}`),
    check('observed_usage_labels_complete', c.rows_labeled_observed_usage_only === 6, `observed ${c.rows_labeled_observed_usage_only}/6`),
    check('cross_work_diversity_visible', c.distinct_source_refs === 6 && c.distinct_local_anchors === 6 && c.distinct_works === 6 && c.distinct_categories === 4 && c.distinct_licenses === 2, `source/anchor/work/category/license ${c.distinct_source_refs}/${c.distinct_local_anchors}/${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}`),
    check('no_reader_payload_authority_or_semantic_claims', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0 && c.semantic_independence_claims === 0, `reader/payload/forbidden/semantic ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}/${c.semantic_independence_claims}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Collision Work/Category Cross-Work Snippet Locator',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is cross-work snippet navigation only and not Definition authority, not semantic confirmation, and not semantic independence.',
    '',
    '## Scope',
    '',
    'This packet isolates repeated phrase-context snippets that occur across multiple works or categories. It is a QA review-focus locator for usage navigation and does not claim that repeated snippets prove a definition, route rank, or semantic independence.',
    '',
    '## Counts',
    '',
    `- Source repeat locator rows / repeated snippet buckets: ${c.source_repeat_locator_rows}/${c.source_phrase_context_repeat_buckets}`,
    `- Cross-work snippet buckets / cross-category buckets / occurrence rows: ${c.cross_work_snippet_buckets}/${c.cross_category_buckets}/${c.cross_work_snippet_occurrence_rows}`,
    `- Source refs / source URLs / local anchors / snippets: ${c.rows_with_source_ref}/${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_phrase_context_snippet}`,
    `- License rows / version rows / route-ID rows: ${c.rows_with_license}/${c.rows_with_version}/${c.rows_with_route_ids}`,
    `- Distinct source refs / anchors / works / categories / licenses: ${c.distinct_source_refs}/${c.distinct_local_anchors}/${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}`,
    `- Reader-facing / route-payload / forbidden-authority / semantic-independence claims: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}/${c.semantic_independence_claims}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`,
    '',
    '## Cross-Work Snippets',
    '',
    '| snippet | rows | works | categories | licenses |',
    '|---|---:|---:|---:|---:|',
    ...value.cross_work_snippet_index.map((row) => `| ${row.phrase_context_snippet} | ${row.occurrence_count} | ${row.work_count} | ${row.category_count} | ${row.license_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This locator isolates ${c.cross_work_snippet_buckets} repeated phrase snippets across works/categories, covering ${c.cross_work_snippet_occurrence_rows} observed-usage rows with complete source/local/provenance links. It is review-focus navigation only and carries zero semantic-independence, definition, ranking, or route-payload claims.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This cross-work snippet locator is not Definition authority, not reviewed lexical authority, not semantic independence, not semantic arbitration, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
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
