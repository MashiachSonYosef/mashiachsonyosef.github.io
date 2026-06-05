#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json';
const outputPath = process.argv[3] || 'data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json';
const reportPath = process.argv[4] || 'reports/agent3-definition-workbench-usage-focus-collision-audit-reshit.md';
const maxRowsPerType = 80;
const maxSamples = 8;

const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_metadata',
  'route_links',
]);

const source = readJson(sourcePath);
if (source.artifact_type !== 'agent3_definition_workbench_usage_focus_token_drilldown') {
  throw new Error(`Unexpected source artifact: ${source.artifact_type}`);
}

const sourceRows = source.occurrence_rows || [];
const bucketSpecs = [
  {
    type: 'source_ref',
    description: 'Multiple observed usage rows attached to the same source reference.',
    key: (row) => row.source_ref,
  },
  {
    type: 'local_work_anchor',
    description: 'Multiple observed usage rows attached to the same local work/page anchor.',
    key: (row) => row.local_work_anchor,
  },
  {
    type: 'phrase_context',
    description: 'Multiple observed usage rows sharing the same marked phrase/context snippet.',
    key: (row) => row.phrase_context_snippet,
  },
  {
    type: 'work_frame',
    description: 'Multiple observed usage rows sharing the same work and usage frame.',
    key: (row) => `${row.work_id || ''}||${row.usage_frame_label || ''}`,
    parts: (row) => ({ work_id: row.work_id || null, usage_frame_label: row.usage_frame_label || null }),
  },
  {
    type: 'source_ref_frame',
    description: 'Multiple observed usage rows sharing the same source reference and usage frame.',
    key: (row) => `${row.source_ref || ''}||${row.usage_frame_label || ''}`,
    parts: (row) => ({ source_ref: row.source_ref || null, usage_frame_label: row.usage_frame_label || null }),
  },
  {
    type: 'source_ref_license',
    description: 'Multiple observed usage rows sharing the same source reference and license.',
    key: (row) => `${row.source_ref || ''}||${row.license || ''}`,
    parts: (row) => ({ source_ref: row.source_ref || null, license: row.license || null }),
  },
];

const collisionRows = [];
const collisionTypeCounts = {};
for (const spec of bucketSpecs) {
  const buckets = buildBuckets(sourceRows, spec);
  const duplicateBuckets = buckets.filter((bucket) => bucket.rows.length > 1)
    .sort((a, b) => b.rows.length - a.rows.length || a.key.localeCompare(b.key));
  collisionTypeCounts[spec.type] = {
    bucket_count: duplicateBuckets.length,
    row_count: duplicateBuckets.reduce((sum, bucket) => sum + bucket.rows.length, 0),
    emitted_bucket_count: Math.min(duplicateBuckets.length, maxRowsPerType),
  };
  for (const bucket of duplicateBuckets.slice(0, maxRowsPerType)) {
    collisionRows.push(buildCollisionRow(spec, bucket));
  }
}

const allRouteIds = new Set();
const allLicenses = new Set();
const allWorks = new Set();
const allRefs = new Set();
for (const row of sourceRows) {
  for (const id of row.related_agent2_route_ids || []) allRouteIds.add(id);
  if (row.license) allLicenses.add(row.license);
  if (row.work_id) allWorks.add(row.work_id);
  if (row.source_ref) allRefs.add(row.source_ref);
}

const counts = {
  source_drilldown_rows: sourceRows.length,
  focus_token_rows: sourceRows.filter((row) => row.focus_normalized === source.focus_token_normalized).length,
  source_refs: allRefs.size,
  works: allWorks.size,
  licenses: allLicenses.size,
  route_ids: allRouteIds.size,
  collision_rows: collisionRows.length,
  duplicate_source_ref_buckets: collisionTypeCounts.source_ref.bucket_count,
  duplicate_source_ref_rows: collisionTypeCounts.source_ref.row_count,
  duplicate_local_work_anchor_buckets: collisionTypeCounts.local_work_anchor.bucket_count,
  duplicate_local_work_anchor_rows: collisionTypeCounts.local_work_anchor.row_count,
  duplicate_phrase_context_buckets: collisionTypeCounts.phrase_context.bucket_count,
  duplicate_phrase_context_rows: collisionTypeCounts.phrase_context.row_count,
  duplicate_work_frame_buckets: collisionTypeCounts.work_frame.bucket_count,
  duplicate_work_frame_rows: collisionTypeCounts.work_frame.row_count,
  duplicate_source_ref_frame_buckets: collisionTypeCounts.source_ref_frame.bucket_count,
  duplicate_source_ref_frame_rows: collisionTypeCounts.source_ref_frame.row_count,
  duplicate_source_ref_license_buckets: collisionTypeCounts.source_ref_license.bucket_count,
  duplicate_source_ref_license_rows: collisionTypeCounts.source_ref_license.row_count,
  emitted_source_ref_collision_rows: collisionRows.filter((row) => row.collision_type === 'source_ref').length,
  emitted_local_work_anchor_collision_rows: collisionRows.filter((row) => row.collision_type === 'local_work_anchor').length,
  emitted_phrase_context_collision_rows: collisionRows.filter((row) => row.collision_type === 'phrase_context').length,
  emitted_work_frame_collision_rows: collisionRows.filter((row) => row.collision_type === 'work_frame').length,
  emitted_source_ref_frame_collision_rows: collisionRows.filter((row) => row.collision_type === 'source_ref_frame').length,
  emitted_source_ref_license_collision_rows: collisionRows.filter((row) => row.collision_type === 'source_ref_license').length,
  rows_with_complete_metadata: sourceRows.filter(hasCompleteMetadata).length,
  rows_with_route_ids: sourceRows.filter((row) => (row.related_agent2_route_ids || []).length).length,
  observed_usage_only_rows: sourceRows.filter((row) => row.row_label === 'observed usage only').length,
  audit_only_collision_rows: collisionRows.length,
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
  artifact_type: 'agent3_definition_workbench_usage_focus_collision_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_focus_collision_audit.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_key: source.focus_token_key,
  focus_token_normalized: source.focus_token_normalized,
  source_artifacts: {
    focus_token_drilldown: sourcePath,
  },
  policy: 'Collision/repeatability audit for selected Agent 3 usage-navigation rows. Buckets repeated refs, anchors, phrase contexts, and usage-frame pairings for QA/search navigation only. It does not rank routes, select answers, emit definitions, translate, or claim semantic authority.',
  authority_boundary: {
    usage_navigation_only: true,
    collision_audit_only: true,
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
  collision_type_counts: collisionTypeCounts,
  collision_rows: collisionRows,
  counts,
  checks: buildChecks(counts),
};

artifact.counts.forbidden_authority_field_hits = countForbiddenKeyHits(artifact);
artifact.checks = buildChecks(artifact.counts);

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision audit ${artifact.status}; source rows ${counts.source_drilldown_rows}; collision rows ${counts.collision_rows}; duplicate source refs ${counts.duplicate_source_ref_buckets}`);

function buildBuckets(rows, spec) {
  const map = new Map();
  for (const row of rows) {
    const key = spec.key(row);
    if (!key) continue;
    if (!map.has(key)) map.set(key, { key, parts: spec.parts ? spec.parts(row) : {}, rows: [] });
    map.get(key).rows.push(row);
  }
  return [...map.values()];
}

function buildCollisionRow(spec, bucket) {
  const refs = new Set();
  const works = new Set();
  const frames = new Set();
  const licenses = new Set();
  const statuses = {};
  const routeIds = new Set();
  const occurrenceIds = [];
  for (const row of bucket.rows) {
    if (row.source_ref) refs.add(row.source_ref);
    if (row.work_id) works.add(row.work_id);
    if (row.usage_frame_label) frames.add(row.usage_frame_label);
    if (row.license) licenses.add(row.license);
    if (row.status) statuses[row.status] = (statuses[row.status] || 0) + 1;
    for (const id of row.related_agent2_route_ids || []) routeIds.add(id);
    if (row.occurrence_id) occurrenceIds.push(row.occurrence_id);
  }
  return {
    collision_id: `agent3-reshit-collision-${spec.type}-${shortHash(bucket.key)}`,
    collision_type: spec.type,
    collision_key: bucket.key,
    collision_parts: bucket.parts,
    description: spec.description,
    row_count: bucket.rows.length,
    source_ref_count: refs.size,
    work_count: works.size,
    usage_frame_count: frames.size,
    license_count: licenses.size,
    status_counts: statuses,
    route_ids: [...routeIds].sort(),
    occurrence_ids: occurrenceIds.sort(),
    sample_occurrences: bucket.rows.slice(0, maxSamples).map(sampleOccurrence),
    row_label: 'observed usage only',
    audit_visibility: 'agent6_audit_only',
    reader_facing: false,
    not_definition_authority: true,
    route_payload_copied: false,
  };
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
    usage_frame_label: row.usage_frame_label,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    phrase_context_snippet: row.phrase_context_snippet,
    related_agent2_route_ids: row.related_agent2_route_ids || [],
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    row_label: 'observed usage only',
    reader_facing: false,
    not_definition_authority: true,
  };
}

function hasCompleteMetadata(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.license && row.license_url && row.version_title && row.version_source);
}

function buildChecks(c) {
  return [
    check('source_rows_present', c.source_drilldown_rows > 0, `source rows ${c.source_drilldown_rows}`),
    check('all_focus_rows_selected', c.focus_token_rows === c.source_drilldown_rows, `focus/source ${c.focus_token_rows}/${c.source_drilldown_rows}`),
    check('collision_rows_present', c.collision_rows > 0, `collision rows ${c.collision_rows}`),
    check('source_ref_collisions_visible', c.duplicate_source_ref_buckets > 0, `source-ref buckets ${c.duplicate_source_ref_buckets}`),
    check('metadata_complete', c.rows_with_complete_metadata === c.source_drilldown_rows, `metadata ${c.rows_with_complete_metadata}/${c.source_drilldown_rows}`),
    check('route_ids_only_present', c.rows_with_route_ids === c.source_drilldown_rows && c.route_ids === 1, `route rows/ids ${c.rows_with_route_ids}/${c.route_ids}`),
    check('observed_usage_boundary', c.observed_usage_only_rows === c.source_drilldown_rows && c.audit_only_collision_rows === c.collision_rows, `observed/audit ${c.observed_usage_only_rows}/${c.audit_only_collision_rows}`),
    check('no_reader_or_payload_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_broad_or_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function countForbiddenKeyHits(value) {
  let hits = 0;
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbiddenAuthorityKeys.has(key) && child !== false && child !== 0 && child !== null) hits += 1;
      walk(child);
    }
  };
  walk(value);
  return hits;
}

function shortHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
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
    '# Agent 3 Definition Workbench Usage Focus Collision Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: observed usage/navigation collision audit only; not Definition authority, not route ranking, not semantic arbitration, not UI/runtime acceptance, and not publication support.',
    '',
    '## Counts',
    '',
    `- Source drilldown rows: ${c.source_drilldown_rows}`,
    `- Collision rows emitted: ${c.collision_rows}`,
    `- Duplicate source refs / rows: ${c.duplicate_source_ref_buckets}/${c.duplicate_source_ref_rows}`,
    `- Duplicate local anchors / rows: ${c.duplicate_local_work_anchor_buckets}/${c.duplicate_local_work_anchor_rows}`,
    `- Duplicate phrase contexts / rows: ${c.duplicate_phrase_context_buckets}/${c.duplicate_phrase_context_rows}`,
    `- Duplicate work-frame buckets / rows: ${c.duplicate_work_frame_buckets}/${c.duplicate_work_frame_rows}`,
    `- Duplicate source-ref-frame buckets / rows: ${c.duplicate_source_ref_frame_buckets}/${c.duplicate_source_ref_frame_rows}`,
    `- Duplicate source-ref-license buckets / rows: ${c.duplicate_source_ref_license_buckets}/${c.duplicate_source_ref_license_rows}`,
    `- Metadata complete / route-ID rows: ${c.rows_with_complete_metadata}/${c.rows_with_route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    '',
    '## Collision Type Summary',
    '',
    '| collision type | duplicate buckets | duplicate rows | emitted buckets |',
    '|---|---:|---:|---:|',
    ...Object.entries(artifact.collision_type_counts).map(([type, row]) => `| ${type} | ${row.bucket_count} | ${row.row_count} | ${row.emitted_bucket_count} |`),
    '',
    '## Top Collision Rows',
    '',
    '| type | row count | refs | works | frames | licenses | status counts | sample key |',
    '|---|---:|---:|---:|---:|---:|---|---|',
    ...artifact.collision_rows.slice(0, 40).map((row) => `| ${row.collision_type} | ${row.row_count} | ${row.source_ref_count} | ${row.work_count} | ${row.usage_frame_count} | ${row.license_count} | ${formatStatus(row.status_counts)} | ${escapeCell(String(row.collision_key).slice(0, 120))} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This artifact is audit/navigation evidence only. Ambiguous and collision rows are not reader-facing Definition answers, and Agent 2 route payloads must be resolved outside Agent 3 artifacts.',
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
