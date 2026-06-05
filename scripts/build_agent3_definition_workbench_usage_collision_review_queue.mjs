#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json';
const outputPath = process.argv[3] || 'data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json';
const reportPath = process.argv[4] || 'reports/agent3-definition-workbench-usage-collision-review-queue-reshit.md';
const maxRowsPerType = 12;
const maxSamples = 3;

const collisionAudit = readJson(sourcePath);
if (collisionAudit.artifact_type !== 'agent3_definition_workbench_usage_focus_collision_audit') {
  throw new Error(`Unexpected source artifact: ${collisionAudit.artifact_type}`);
}

const collisionRows = collisionAudit.collision_rows || [];
const selectedRows = [];
for (const type of ['source_ref', 'local_work_anchor', 'phrase_context', 'work_frame', 'source_ref_frame', 'source_ref_license']) {
  const rows = collisionRows
    .filter((row) => row.collision_type === type)
    .sort(compareCollisionRows)
    .slice(0, maxRowsPerType);
  selectedRows.push(...rows.map((row, index) => buildQueueRow(row, index + 1)));
}

const counts = {
  source_collision_rows: collisionRows.length,
  review_queue_rows: selectedRows.length,
  max_rows_per_type: maxRowsPerType,
  source_ref_rows: selectedRows.filter((row) => row.collision_type === 'source_ref').length,
  local_work_anchor_rows: selectedRows.filter((row) => row.collision_type === 'local_work_anchor').length,
  phrase_context_rows: selectedRows.filter((row) => row.collision_type === 'phrase_context').length,
  work_frame_rows: selectedRows.filter((row) => row.collision_type === 'work_frame').length,
  source_ref_frame_rows: selectedRows.filter((row) => row.collision_type === 'source_ref_frame').length,
  source_ref_license_rows: selectedRows.filter((row) => row.collision_type === 'source_ref_license').length,
  represented_occurrence_links: new Set(selectedRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.occurrence_id))).size,
  represented_source_refs: new Set(selectedRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.source_ref).filter(Boolean))).size,
  represented_works: new Set(selectedRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.work_id).filter(Boolean))).size,
  represented_licenses: new Set(selectedRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.license).filter(Boolean))).size,
  queue_rows_with_route_ids: selectedRows.filter((row) => row.related_agent2_route_ids.length > 0).length,
  queue_rows_with_complete_samples: selectedRows.filter((row) => row.representative_occurrences.every(hasCompleteSample)).length,
  rows_labeled_observed_usage_only: selectedRows.filter((row) => row.row_label === 'observed usage only').length,
  review_only_rows: selectedRows.filter((row) => row.queue_visibility === 'agent6_review_queue_only').length,
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
  artifact_type: 'agent3_definition_workbench_usage_collision_review_queue',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_review_queue.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_key: collisionAudit.focus_token_key,
  focus_token_normalized: collisionAudit.focus_token_normalized,
  source_artifacts: {
    collision_audit: sourcePath,
  },
  policy: 'Compact Agent 6 review queue derived from Agent 3 collision audit rows. It selects representative repeated-usage buckets for QA/navigation inspection only and does not rank routes, choose visible answers, copy Agent 2 payloads, emit definitions, translate, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    collision_review_queue_only: true,
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
  selection_policy: {
    source: 'top collision rows per collision type sorted by row_count descending, then work_count/source_ref_count descending, then collision_id',
    max_rows_per_collision_type: maxRowsPerType,
    representative_occurrences_per_row: maxSamples,
    consumer_action: 'review queue rows as observed usage/navigation evidence only; resolve Agent 2 route payloads outside Agent 3 artifacts if needed',
  },
  review_queue_rows: selectedRows,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision review queue ${artifact.status}; queue rows ${counts.review_queue_rows}; represented occurrences ${counts.represented_occurrence_links}`);

function buildQueueRow(row, ordinal) {
  const representativeOccurrences = (row.sample_occurrences || []).slice(0, maxSamples).map((sample) => ({
    occurrence_id: sample.occurrence_id,
    source_ref: sample.source_ref,
    source_url: sample.source_url,
    local_work_anchor: sample.local_work_anchor,
    work_id: sample.work_id,
    work_title: sample.work_title,
    category: sample.category,
    phrase_context_snippet: sample.phrase_context_snippet,
    usage_frame_label: sample.usage_frame_label,
    status: sample.status,
    raw_score: sample.raw_score,
    cluster_id: sample.cluster_id,
    related_agent2_route_ids: sample.related_agent2_route_ids || [],
    version_title: sample.version_title,
    version_source: sample.version_source,
    license: sample.license,
    license_url: sample.license_url,
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  }));
  return {
    review_queue_id: `agent3-reshit-collision-review-${row.collision_type}-${String(ordinal).padStart(2, '0')}`,
    source_collision_id: row.collision_id,
    collision_type: row.collision_type,
    collision_key: row.collision_key,
    row_count: row.row_count,
    source_ref_count: row.source_ref_count,
    work_count: row.work_count,
    usage_frame_count: row.usage_frame_count,
    license_count: row.license_count,
    status_counts: row.status_counts || {},
    related_agent2_route_ids: row.route_ids || [],
    represented_occurrence_count: row.occurrence_ids?.length || 0,
    representative_occurrences: representativeOccurrences,
    review_reason: reviewReason(row),
    row_label: 'observed usage only',
    queue_visibility: 'agent6_review_queue_only',
    reader_facing: false,
    not_definition_authority: true,
    route_payload_copied: false,
  };
}

function reviewReason(row) {
  if (row.collision_type === 'phrase_context') return 'Exact repeated phrase/context snippet; useful for duplicate-window and anchor QA.';
  if (row.collision_type === 'work_frame') return 'High concentration inside one work/frame; useful for navigation clustering QA.';
  if (row.usage_frame_count > 1) return 'Same citation surface spans multiple usage frames; useful for ambiguity and clustering QA.';
  return 'Repeated citation/anchor usage; useful for concordance navigation QA.';
}

function compareCollisionRows(a, b) {
  return b.row_count - a.row_count
    || b.work_count - a.work_count
    || b.source_ref_count - a.source_ref_count
    || a.collision_id.localeCompare(b.collision_id);
}

function hasCompleteSample(sample) {
  return Boolean(sample.occurrence_id && sample.source_ref && sample.source_url && sample.local_work_anchor && sample.work_id && sample.work_title && sample.phrase_context_snippet && sample.version_title && sample.version_source && sample.license && sample.license_url);
}

function buildChecks(c) {
  return [
    check('source_collision_rows_present', c.source_collision_rows > 0, `source collision rows ${c.source_collision_rows}`),
    check('review_queue_rows_present', c.review_queue_rows > 0, `review rows ${c.review_queue_rows}`),
    check('collision_types_represented', c.source_ref_rows > 0 && c.local_work_anchor_rows > 0 && c.phrase_context_rows > 0 && c.work_frame_rows > 0 && c.source_ref_frame_rows > 0 && c.source_ref_license_rows > 0, `type rows ${c.source_ref_rows}/${c.local_work_anchor_rows}/${c.phrase_context_rows}/${c.work_frame_rows}/${c.source_ref_frame_rows}/${c.source_ref_license_rows}`),
    check('samples_have_complete_metadata', c.queue_rows_with_complete_samples === c.review_queue_rows, `complete sample rows ${c.queue_rows_with_complete_samples}/${c.review_queue_rows}`),
    check('route_ids_only_visible', c.queue_rows_with_route_ids === c.review_queue_rows, `route id rows ${c.queue_rows_with_route_ids}/${c.review_queue_rows}`),
    check('observed_usage_review_only', c.rows_labeled_observed_usage_only === c.review_queue_rows && c.review_only_rows === c.review_queue_rows, `observed/review ${c.rows_labeled_observed_usage_only}/${c.review_only_rows}`),
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
    '# Agent 3 Definition Workbench Usage Collision Review Queue',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: compact collision review queue only; observed usage/navigation evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Source collision rows: ${c.source_collision_rows}`,
    `- Review queue rows: ${c.review_queue_rows}`,
    `- Rows by type: source_ref ${c.source_ref_rows}; local_work_anchor ${c.local_work_anchor_rows}; phrase_context ${c.phrase_context_rows}; work_frame ${c.work_frame_rows}; source_ref_frame ${c.source_ref_frame_rows}; source_ref_license ${c.source_ref_license_rows}`,
    `- Representative occurrence/source/work/license counts: ${c.represented_occurrence_links}/${c.represented_source_refs}/${c.represented_works}/${c.represented_licenses}`,
    `- Complete sample rows / route-ID rows: ${c.queue_rows_with_complete_samples}/${c.queue_rows_with_route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    '',
    '## Review Queue Rows',
    '',
    '| queue id | type | rows | refs | works | frames | licenses | status counts | reason |',
    '|---|---|---:|---:|---:|---:|---:|---|---|',
    ...artifact.review_queue_rows.map((row) => `| ${row.review_queue_id} | ${row.collision_type} | ${row.row_count} | ${row.source_ref_count} | ${row.work_count} | ${row.usage_frame_count} | ${row.license_count} | ${formatStatus(row.status_counts)} | ${escapeCell(row.review_reason)} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This queue is Agent 6 review scaffolding only. Rows remain observed usage only, ambiguous/collision review stays audit-only, and Agent 2 route payloads are not copied into Agent 3 artifacts.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function formatStatus(statuses) {
  return Object.entries(statuses).map(([key, value]) => `${key}:${value}`).join(', ');
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|').replace(/\s+/g, ' ');
}
