#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  rowOverlapBoundary: 'reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json',
  boundarySupplement: 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json',
  agent2Receipt: 'reports/agent2-agent1-transform-lane-handoff-receipt-2026-06-05.json',
  agent6Verdict: 'reports/agent6-old-dictionary-overlap-exclusion-and-row-overlap-supplement-verdict-2026-06-05.json',
  agent10Refresh: 'reports/agent10-direct-release-package-intake-refresh-2026-06-05i.json',
  output: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json',
  report: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const rowOverlapBoundary = readJson(options.rowOverlapBoundary);
const boundarySupplement = readJson(options.boundarySupplement);
const agent2Receipt = readJson(options.agent2Receipt);
const agent6Verdict = readJson(options.agent6Verdict);
const agent10Refresh = readJson(options.agent10Refresh);

const sourceFamiliesByLane = buildSourceFamiliesByLane(agent2Receipt.transform_rows || []);
const transformRowsByLane = buildTransformRowsByLane(agent2Receipt.transform_rows || []);
const supplementByBucket = new Map(
  (boundarySupplement.boundary_questions || []).map((question) => [question.row_overlap_bucket, question]),
);
const verdictBuckets = agent6Verdict.row_overlap_supplement_verdict?.buckets || {};
const bucketEntries = Object.entries(rowOverlapBoundary.row_overlap_buckets || {});
const rows = bucketEntries.map(([bucketId, bucket]) => buildRow(bucketId, bucket));
const sampleMembership = buildSampleMembership(rows);
const duplicateSampleTokenIds = [...sampleMembership.entries()]
  .filter(([, bucketIds]) => bucketIds.length > 1)
  .map(([tokenId, bucketIds]) => ({ token_id: tokenId, buckets: bucketIds }));

for (const row of rows) {
  row.sample_token_overlap_with_buckets = row.sample_token_ids
    .flatMap((tokenId) =>
      (sampleMembership.get(tokenId) || [])
        .filter((bucketId) => bucketId !== row.row_overlap_bucket)
        .map((bucketId) => ({ token_id: tokenId, overlapping_bucket: bucketId })),
    )
    .sort((left, right) => left.token_id.localeCompare(right.token_id));
  row.duplicate_sample_token_count = row.sample_token_overlap_with_buckets.length;
}

const counts = {
  bucket_rows: rows.length,
  nonzero_bucket_rows: rows.filter((row) => row.rows > 0).length,
  zero_bucket_rows: rows.filter((row) => row.rows === 0).length,
  represented_rows: sum(rows, (row) => row.rows),
  represented_occurrences: sum(rows, (row) => row.occurrences),
  agent1_audited_rows: Number(rowOverlapBoundary.row_overlap_totals?.audited_rows || 0),
  agent1_audited_occurrences: Number(rowOverlapBoundary.row_overlap_totals?.audited_occurrences || 0),
  agent6_total_rows_represented: Number(agent6Verdict.row_overlap_supplement_verdict?.total_rows_represented || 0),
  agent6_total_occurrences_represented: Number(agent6Verdict.row_overlap_supplement_verdict?.total_occurrences_represented || 0),
  agent10_boundary_missing: agent10Refresh.current_exact_blocker ? 1 : 0,
  rows_with_agent6_verdict_bucket: rows.filter((row) => row.agent6_bucket !== null).length,
  rows_with_boundary_question: rows.filter((row) => row.boundary_question_id).length,
  rows_with_agent2_lane_pointers: rows.filter((row) => row.agent2_source_family_pointers.length > 0).length,
  sample_token_ids: sum(rows, (row) => row.sample_token_ids.length),
  unique_sample_token_ids: sampleMembership.size,
  duplicate_sample_token_ids: duplicateSampleTokenIds.length,
  duplicate_row_subset_ids: countDuplicateValues(rows.map((row) => row.row_subset_id).filter(Boolean)),
  source_family_pointer_rows: sum(rows, (row) => row.agent2_source_family_pointers.length),
  exact_blocker_rows: rows.filter((row) => row.status.startsWith('exact_blocker')).length,
  audit_zero_row_records: rows.filter((row) => row.status === 'audit_zero_row_record').length,
  allowed_transform_rows_now: Number(boundarySupplement.zero_output_counts?.allowed_transform_rows_now || 0),
  candidate_text_rows_now: Number(boundarySupplement.zero_output_counts?.candidate_text_rows_now || 0),
  definition_content_rows_now: Number(boundarySupplement.zero_output_counts?.definition_content_rows_now || 0),
  answer_rows_now: Number(boundarySupplement.zero_output_counts?.answer_rows_now || 0),
  public_hud_rows_now: Number(boundarySupplement.zero_output_counts?.public_hud_rows_now || 0),
  route_jsonl_rows_now: Number(boundarySupplement.zero_output_counts?.route_jsonl_rows_now || 0),
  agent6_delivery_now: Number(boundarySupplement.zero_output_counts?.agent6_delivery_now || 0),
  queue_mutation_count: Number(boundarySupplement.zero_output_counts?.queue_mutation_count || 0),
  render_mutation_count: Number(boundarySupplement.zero_output_counts?.render_mutation_count || 0),
  staging_count: Number(boundarySupplement.zero_output_counts?.staging_count || 0),
  release_actions: Number(agent10Refresh.global_zero_counters?.release_actions || 0),
  source_text_read: 0,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  acceptance_claims: 0,
  public_runtime_mutations: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_row_overlap_linkage_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_row_overlap_linkage_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old-dictionary row-overlap source-family linkage/dedupe matrix',
  inputs: {
    row_overlap_boundary: options.rowOverlapBoundary,
    boundary_supplement: options.boundarySupplement,
    agent2_receipt: options.agent2Receipt,
    agent6_verdict: options.agent6Verdict,
    agent10_refresh: options.agent10Refresh,
  },
  authority_boundary: {
    linkage_navigation_only: true,
    source_family_pointer_only: true,
    row_overlap_dedupe_only: true,
    token_id_samples_only: true,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    route_ranking: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
  },
  counts,
  duplicate_sample_token_ids: duplicateSampleTokenIds,
  rows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    transform_owner_after_exact_boundary: 'Agent 2',
    source_lane_owner_for_new_evidence: 'Agent 1',
    qa_boundary_owner_if_needed: 'Agent 6',
    next_required_boundary: agent10Refresh.next_required_boundary_before_any_use || [],
    current_exact_blocker: agent10Refresh.current_exact_blocker || '',
    stop_condition:
      'Use this as nonpublic planning/navigation evidence only. Do not transform, export candidate text, write routes, select answers, or claim any acceptance from this matrix.',
  },
};

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 old-dictionary row-overlap linkage matrix rows=${counts.bucket_rows} represented=${counts.represented_rows}/${counts.represented_occurrences} duplicate_sample_tokens=${counts.duplicate_sample_token_ids} blockers=${counts.exact_blocker_rows}`,
);

function buildRow(bucketId, bucket) {
  const supplement = supplementByBucket.get(bucketId) || null;
  const classificationLanes = supplement?.classification_lanes || inferClassificationLanes(bucketId);
  const rowCount = Number(bucket.row_count || 0);
  const sourcePointers = hasDirectSourceFamilyEvidence(bucketId, rowCount)
    ? classificationLanes.flatMap((lane) =>
        (sourceFamiliesByLane.get(lane) || []).map((sourceFamily) => ({
          license_lane: lane,
          source_family: sourceFamily,
          transform_lane: findTransformLane(sourceFamily),
          row_subset_id: findTransformRow(sourceFamily)?.row_subset_id || '',
          evidence_path: findTransformRow(sourceFamily)?.evidence_path || '',
        })),
      )
    : [];
  const rowsSample = Array.isArray(bucket.rows_sample) ? bucket.rows_sample : [];
  const agent6Bucket = verdictBuckets[bucketId] || null;
  const status = classifyBucket(bucketId, Number(bucket.row_count || 0), classificationLanes);
  return {
    row_id: `agent3-old-dictionary-row-overlap-${bucketId}`,
    row_overlap_bucket: bucketId,
    row_subset_id: supplement?.row_subset_id || `old-dictionary-excluded-row-license-lane-reaudit::row-overlap::${bucketId}`,
    classification_lanes: classificationLanes,
    rows: rowCount,
    occurrences: Number(bucket.occurrence_count || 0),
    sample_token_ids: bucket.token_ids_sample || [],
    sample_rows: rowsSample.map(compactSampleRow),
    agent2_source_family_pointers: sourcePointers,
    agent6_bucket: agent6Bucket
      ? {
          rows: Number(agent6Bucket.rows || 0),
          occurrences: Number(agent6Bucket.occurrences || 0),
          disposition: agent6Verdict.row_overlap_supplement_verdict?.disposition || '',
        }
      : null,
    boundary_question_id: supplement?.question_id || '',
    boundary_question_type: supplement?.boundary_question_type || '',
    current_allowed_now: supplement?.current_allowed_now || zeroAllowedNow(),
    exact_blocker: supplement?.exact_blocker || blockerForBucket(bucketId),
    handoff_owner: supplement?.handoff_owner || '',
    dedupe_key: sha256(
      [
        bucketId,
        [...classificationLanes].sort().join('+'),
        Number(bucket.row_count || 0),
        Number(bucket.occurrence_count || 0),
      ].join('|'),
    ),
    status,
    boundary_note:
      'Agent 3 supplies row-overlap linkage, source-family pointers, token-sample dedupe checks, and blockers only; it does not authorize use or define terms.',
  };
}

function hasDirectSourceFamilyEvidence(bucketId, rowCount) {
  return rowCount > 0 && !['no_sefaria_source_hit', 'metadata_or_link_only', 'blocked_review_only'].includes(bucketId);
}

function compactSampleRow(row) {
  return {
    token_id: row.token_id || '',
    lexicon_entry_id: row.lexicon_entry_id || '',
    occurrences: Number(row.occurrences || 0),
    public_domain_lexicons: row.public_domain_lexicons || [],
    blocked_or_unresolved_lexicons: row.blocked_or_unresolved_lexicons || [],
    preview_status: row.preview_status || '',
    transform_blockers: row.transform_blockers || [],
  };
}

function buildSourceFamiliesByLane(transformRows) {
  const map = new Map();
  for (const row of transformRows) {
    if (!map.has(row.license_lane)) map.set(row.license_lane, []);
    map.get(row.license_lane).push(row.source_family);
  }
  for (const [lane, families] of map) map.set(lane, unique(families.filter(Boolean)));
  return map;
}

function buildTransformRowsByLane(transformRows) {
  const map = new Map();
  for (const row of transformRows) {
    if (!map.has(row.license_lane)) map.set(row.license_lane, []);
    map.get(row.license_lane).push(row);
  }
  return map;
}

function findTransformRow(sourceFamily) {
  return (agent2Receipt.transform_rows || []).find((row) => row.source_family === sourceFamily) || null;
}

function findTransformLane(sourceFamily) {
  return findTransformRow(sourceFamily)?.transform_lane || '';
}

function inferClassificationLanes(bucketId) {
  if (bucketId === 'commercial_clean_only') return ['commercial_clean_candidate'];
  if (bucketId === 'commercial_clean_plus_noncommercial_educational') {
    return ['commercial_clean_candidate', 'noncommercial_educational_candidate'];
  }
  if (bucketId === 'commercial_clean_plus_blocked_review') {
    return ['commercial_clean_candidate', 'blocked_or_needs_review'];
  }
  if (bucketId === 'commercial_clean_plus_noncommercial_educational_plus_blocked_review') {
    return ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'blocked_or_needs_review'];
  }
  if (bucketId === 'noncommercial_educational_only') return ['noncommercial_educational_candidate'];
  if (bucketId === 'metadata_or_link_only') return ['metadata_or_link_only'];
  return ['blocked_or_needs_review'];
}

function classifyBucket(bucketId, rowCount, classificationLanes) {
  if (rowCount === 0) return 'audit_zero_row_record';
  if (bucketId === 'no_sefaria_source_hit') return 'exact_blocker_missing_source_lane_evidence';
  if (classificationLanes.includes('blocked_or_needs_review')) {
    return 'exact_blocker_blocked_source_family_overlap_boundary_required';
  }
  if (classificationLanes.includes('noncommercial_educational_candidate')) {
    return classificationLanes.includes('commercial_clean_candidate')
      ? 'exact_blocker_nc_overlap_source_family_selection_required'
      : 'exact_blocker_nc_boundary_required';
  }
  return 'exact_blocker_candidate_use_boundary_and_morphology_required';
}

function blockerForBucket(bucketId) {
  if (bucketId === 'no_sefaria_source_hit') return 'no_sefaria_source_hit_missing_source_license_custody_evidence';
  if (bucketId === 'metadata_or_link_only') return 'metadata_or_link_only_zero_rows_no_current_boundary_delivery';
  if (bucketId === 'blocked_review_only') return 'blocked_review_only_zero_rows_no_current_boundary_delivery';
  return 'exact_row_subset_use_boundary_missing';
}

function buildSampleMembership(matrixRows) {
  const membership = new Map();
  for (const row of matrixRows) {
    for (const tokenId of row.sample_token_ids) {
      if (!membership.has(tokenId)) membership.set(tokenId, []);
      membership.get(tokenId).push(row.row_overlap_bucket);
    }
  }
  return membership;
}

function zeroAllowedNow() {
  return {
    planning_evidence: true,
    agent2_transform: false,
    candidate_text_export: false,
    definition_content_storage: false,
    answer_eligibility: false,
    public_emit: false,
    release_action: false,
    agent6_delivery: false,
  };
}

function writeMarkdown(outputPath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Row-Overlap Linkage Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    'Status: evidence-ready. This is nonpublic linkage/dedupe/navigation planning evidence only.',
    '',
    '## Counts',
    '',
    '| metric | count |',
    '|---|---:|',
    ...Object.entries(artifact.counts).map(([key, value]) => `| ${key} | ${value} |`),
    '',
    '## Rows',
    '',
    '| bucket | rows | occurrences | lanes | source-family pointers | sample tokens | duplicate sample tokens | status | blocker |',
    '|---|---:|---:|---|---:|---:|---:|---|---|',
    ...artifact.rows.map((row) =>
      [
        row.row_overlap_bucket,
        row.rows,
        row.occurrences,
        row.classification_lanes.join(', '),
        row.agent2_source_family_pointers.length,
        row.sample_token_ids.length,
        row.duplicate_sample_token_count,
        row.status,
        row.exact_blocker,
      ].map(escapeCell).join(' | '),
    ).map((line) => `| ${line} |`),
    '',
    '## Boundary',
    '',
    '- No candidate use, transform, Definition authority, usage-as-definition authority, answer selection, source/license acceptance, QA acceptance, public/runtime mutation, publication readiness, or accepted gloss/text.',
    '- The JSON carries token IDs, lexicon IDs, source-family pointers, blockers, and dedupe keys only; it does not carry candidate text or source text.',
  ];
  fs.writeFileSync(abs(outputPath), `${lines.join('\n')}\n`);
}

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

function writeJson(outputPath, value) {
  fs.mkdirSync(path.dirname(abs(outputPath)), { recursive: true });
  fs.writeFileSync(abs(outputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(abs(filePath), 'utf8'));
}

function unique(values) {
  return [...new Set(values)];
}

function sum(values, callback) {
  return values.reduce((total, value) => total + Number(callback(value) || 0), 0);
}

function countDuplicateValues(values) {
  const countsByValue = new Map();
  for (const value of values) countsByValue.set(value, (countsByValue.get(value) || 0) + 1);
  return [...countsByValue.values()].filter((count) => count > 1).length;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function abs(filePath) {
  return path.resolve(root, filePath);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    const normalizedKey = key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (normalizedKey in parsed) parsed[normalizedKey] = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
