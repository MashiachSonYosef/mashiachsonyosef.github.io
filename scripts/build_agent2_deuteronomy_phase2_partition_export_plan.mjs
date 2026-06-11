#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const options = parseArgs(process.argv.slice(2));
const matrix = readJson(options.input);

if (matrix.artifact_type !== 'agent2_deuteronomy_phase2_transform_readiness_matrix') {
  throw new Error(`${options.input} is not the Agent 2 Deuteronomy Phase-2 transform readiness matrix`);
}

const rows = (matrix.rows || []).map((row) => ({
  token_index_id: row.token_index_id,
  normalized_form: row.normalized_form,
  duplicate_key: row.duplicate_key,
  occurrence_count: Number(row.occurrence_count || 0),
  source_family: row.source_family,
  source_name: row.source_name,
  license_label: row.license_label,
  license_lane: row.license_lane,
  source_url_or_citation: row.source_url_or_citation,
  attribution_required: row.attribution_required,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: false,
  commercial_export_candidate: row.commercial_export_candidate === true && row.license_lane === 'commercial_clean_candidate',
  owner_use_attestation: row.owner_use_attestation ?? null,
  corpus_contamination: row.corpus_contamination === true ? true : false,
  agent6_boundary_required: true,
  planned_partition: partitionFor(row),
  candidate_text_export_now: false,
  definition_text_export_now: false,
  answer_eligible: false,
  public_emit: false,
  route_shard_write: false,
  public_reader_output: false,
  accepted_text: false,
  exact_blockers: blockersFor(row),
}));

const counts = buildCounts(rows);
const artifact = {
  schema_version: 1,
  artifact_type: 'agent2_deuteronomy_phase2_partition_export_plan',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent2_deuteronomy_phase2_partition_export_plan.mjs',
  status: 'nonpublic_partition_export_planning_only_pre_agent6_boundary',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model',
  source_matrix: options.input,
  source_workset: matrix.source_workset,
  target_work: matrix.target_work,
  policy: {
    source_lane_preservation: true,
    commercial_clean_and_nc_separate: true,
    metadata_link_only_no_definition_text: true,
    blocked_review_no_candidate_text_export: true,
    spark_output_is_evidence_not_permission: true,
  },
  counts,
  partitions: {
    commercial_clean_candidate: {
      planned_output_class: 'commercial_clean_partition_plan_only',
      rows: counts.license_lane_rows.commercial_clean_candidate || 0,
      occurrences: counts.license_lane_occurrences.commercial_clean_candidate || 0,
      export_now: false,
      agent6_boundary_required: true,
    },
    noncommercial_educational_candidate: {
      planned_output_class: 'separate_nc_educational_partition_plan_only',
      rows: counts.license_lane_rows.noncommercial_educational_candidate || 0,
      occurrences: counts.license_lane_occurrences.noncommercial_educational_candidate || 0,
      export_now: false,
      required_flags: [
        'license_lane=noncommercial_educational_candidate',
        'derived_from_nc=true',
        'commercial_export_allowed=false',
        'attribution_required=true',
        'owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback',
        'corpus_contamination=false',
      ],
      agent6_boundary_required: true,
    },
    metadata_or_link_only: {
      planned_output_class: 'citation_link_only_partition_plan',
      rows: counts.license_lane_rows.metadata_or_link_only || 0,
      occurrences: counts.license_lane_occurrences.metadata_or_link_only || 0,
      definition_text_export_now: false,
    },
    blocked_or_needs_review: {
      planned_output_class: 'blocked_no_candidate_text_export',
      rows: counts.license_lane_rows.blocked_or_needs_review || 0,
      occurrences: counts.license_lane_occurrences.blocked_or_needs_review || 0,
      candidate_text_export_now: false,
    },
  },
  zero_emission_counters: {
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    accepted_text_rows: 0,
    public_reader_output_rows: 0,
  },
  rows,
  agent6_boundary_now: 'none_opened_by_partition_plan',
  agent6_future_boundary: 'Required before any row/subset partition export, definition/display/source/license/Definition/public/runtime/answer use, or candidate text storage/display.',
  stop_condition: 'Return this non-public partition/export planning artifact; do not emit CSV/export rows or candidate text before an exact Agent 6 boundary.',
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Agent 2 Deuteronomy Phase-2 partition/export plan wrote ${rows.length} row(s), ${counts.occurrences} occurrence(s). Output: ${options.output}. Report: ${options.report}`);

function partitionFor(row) {
  if (row.license_lane === 'commercial_clean_candidate') return 'commercial_clean_partition_after_agent6_boundary';
  if (row.license_lane === 'noncommercial_educational_candidate') return 'separate_nc_educational_partition_after_agent6_boundary';
  if (row.license_lane === 'metadata_or_link_only') return 'citation_link_only_no_definition_text';
  return 'blocked_or_needs_review_no_candidate_text_export';
}

function blockersFor(row) {
  const blockers = [];
  if (!row.source_family) blockers.push('missing_source_family');
  if (!row.source_name) blockers.push('missing_source_name');
  if (!row.license_label) blockers.push('missing_license_label');
  if (!row.license_lane) blockers.push('missing_license_lane');
  if (row.license_lane === 'noncommercial_educational_candidate') {
    if (row.derived_from_nc !== true) blockers.push('missing_nc_derived_from_nc_true');
    if (row.commercial_export_allowed !== false) blockers.push('nc_commercial_export_allowed_must_be_false');
    if (row.attribution_required !== true) blockers.push('missing_nc_attribution_required_true');
    if (row.owner_use_attestation !== 'noncommercial_educational_zero_profit_zero_kickback') blockers.push('missing_nc_owner_use_attestation');
    if (row.corpus_contamination !== false) blockers.push('nc_corpus_contamination_must_be_false');
  }
  if (row.license_lane === 'metadata_or_link_only') blockers.push('metadata_link_only_no_definition_text');
  if (row.license_lane === 'blocked_or_needs_review') blockers.push('blocked_or_needs_review_no_candidate_text_export');
  blockers.push('agent6_boundary_required_before_export_or_display');
  return blockers;
}

function buildCounts(rows) {
  const counts = {
    rows: rows.length,
    occurrences: 0,
    license_lane_rows: {},
    license_lane_occurrences: {},
    source_rows: {},
    license_rows: {},
    commercial_clean_candidate_rows: 0,
    commercial_clean_candidate_occurrences: 0,
    noncommercial_educational_candidate_rows: 0,
    noncommercial_educational_candidate_occurrences: 0,
    metadata_or_link_only_rows: 0,
    blocked_or_needs_review_rows: 0,
    candidate_text_export_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
  };
  for (const row of rows) {
    const occurrenceCount = Number(row.occurrence_count || 0);
    counts.occurrences += occurrenceCount;
    increment(counts.license_lane_rows, row.license_lane, 1);
    increment(counts.license_lane_occurrences, row.license_lane, occurrenceCount);
    increment(counts.source_rows, row.source_name, 1);
    increment(counts.license_rows, row.license_label, 1);
    if (row.license_lane === 'commercial_clean_candidate') {
      counts.commercial_clean_candidate_rows += 1;
      counts.commercial_clean_candidate_occurrences += occurrenceCount;
    }
    if (row.license_lane === 'noncommercial_educational_candidate') {
      counts.noncommercial_educational_candidate_rows += 1;
      counts.noncommercial_educational_candidate_occurrences += occurrenceCount;
    }
    if (row.license_lane === 'metadata_or_link_only') counts.metadata_or_link_only_rows += 1;
    if (row.license_lane === 'blocked_or_needs_review') counts.blocked_or_needs_review_rows += 1;
    if (row.candidate_text_export_now === true) counts.candidate_text_export_rows += 1;
    if (row.answer_eligible === true) counts.answer_eligible_rows += 1;
    if (row.public_emit === true) counts.public_emit_rows += 1;
  }
  return counts;
}

function increment(target, key, amount) {
  const safeKey = key || 'missing';
  target[safeKey] = (target[safeKey] || 0) + amount;
}

function parseArgs(argv) {
  const options = {
    input: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
    output: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
    report: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md',
  };
  for (const arg of argv) {
    if (arg.startsWith('--input=')) options.input = cleanRelativePath(arg.slice('--input='.length));
    else if (arg.startsWith('--output=')) options.output = cleanRelativePath(arg.slice('--output='.length));
    else if (arg.startsWith('--report=')) options.report = cleanRelativePath(arg.slice('--report='.length));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Agent 2 Deuteronomy Phase-2 Partition Export Plan - 2026-06-04',
    '',
    '## Status',
    '',
    'Non-public partition/export planning artifact prepared from the Agent 2 Deuteronomy Phase-2 transform readiness matrix. This is planning evidence only and opens no Agent 6 route by itself.',
    '',
    '## Counts',
    '',
    `- Rows: ${artifact.counts.rows}.`,
    `- Occurrences: ${artifact.counts.occurrences}.`,
    `- Commercial-clean candidate rows: ${artifact.counts.commercial_clean_candidate_rows}; occurrences: ${artifact.counts.commercial_clean_candidate_occurrences}.`,
    `- NC educational candidate rows: ${artifact.counts.noncommercial_educational_candidate_rows}; occurrences: ${artifact.counts.noncommercial_educational_candidate_occurrences}.`,
    `- Metadata/link-only rows: ${artifact.counts.metadata_or_link_only_rows}.`,
    `- Blocked/review rows: ${artifact.counts.blocked_or_needs_review_rows}.`,
    `- Candidate text export rows now: ${artifact.counts.candidate_text_export_rows}.`,
    `- Answer-eligible rows now: ${artifact.counts.answer_eligible_rows}.`,
    `- Public emit rows now: ${artifact.counts.public_emit_rows}.`,
    '',
    '## Partition Rule',
    '',
    '- Commercial-clean rows stay in the commercial-clean partition plan only and still require an exact Agent 6 boundary before export/display use.',
    '- NC rows, if present in a future workset, must stay in a separate NC educational partition and preserve NC flags.',
    '- Metadata/link-only rows may carry citation/link planning only and no definition text.',
    '- Blocked/review rows do not produce candidate text exports.',
    '',
    '## Zero Boundary',
    '',
    '- No Definition authority.',
    '- No answer eligibility or answer acceptance.',
    '- No accepted gloss/text.',
    '- No candidate text export.',
    '- No public reader output.',
    '- No route JSONL or route-shard write.',
    '- No public/runtime/source/token-index/lexical payload mutation.',
    '- No QA/source/license/legal/product/publication acceptance.',
    '',
    '## Handoff',
    '',
    '- Consumer: Agent 10 first.',
    '- Spark-1 may run this builder/validator as a mechanical planning pipeline only.',
    '- Agent 6 boundary remains future row/subset-specific and is required before export/display/source/license/Definition/public/runtime/answer use.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
