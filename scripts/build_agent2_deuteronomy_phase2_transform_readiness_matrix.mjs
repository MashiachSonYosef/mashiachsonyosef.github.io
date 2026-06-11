#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const options = parseArgs(process.argv.slice(2));
const input = readJson(options.input);

if (input.artifact_type !== 'agent10_agent2_ready_deuteronomy_phase2_downstream_transform_workset') {
  throw new Error(`${options.input} is not the Agent10 Agent2-ready Deuteronomy Phase-2 downstream workset`);
}

const rows = (input.rows || []).map((row) => ({
  token_index_id: row.token_index_id,
  clicked_surface_form: row.clicked_surface_form,
  normalized_form: row.normalized_form,
  occurrence_count: Number(row.occurrence_count || 0),
  duplicate_key: row.duplicate_key,
  readiness_status: 'agent2_nonpublic_transform_ready_pending_agent6_boundary',
  transform_role: 'reader_hint_or_definition_transform_planning_only',
  source_family: row.source_family,
  source_name: row.source_name,
  license_label: row.license_label,
  license_lane: row.license_lane,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  commercial_export_candidate: row.commercial_export_candidate === true,
  attribution_required: row.attribution_required,
  owner_use_attestation: row.owner_use_attestation,
  corpus_contamination: row.corpus_contamination,
  source_url_or_citation: row.source_url_or_citation,
  agent6_boundary_required: row.agent6_boundary_required,
  answer_eligible: false,
  public_emit: false,
  definition_text_emitted: false,
  accepted_text_emitted: false,
  public_reader_output_emitted: false,
  route_shard_write: false,
  safe_claim_ids: Array.isArray(row.safe_claim_ids) ? row.safe_claim_ids : [],
  safe_source_names: Array.isArray(row.safe_source_names) ? row.safe_source_names : [],
  safe_source_ids: Array.isArray(row.safe_source_ids) ? row.safe_source_ids : [],
  safe_licenses: Array.isArray(row.safe_licenses) ? row.safe_licenses : [],
  source_route_evidence: row.source_route_evidence || null,
  downstream_boundary: row.downstream_boundary,
  exact_blockers: Array.isArray(row.exact_blockers) ? row.exact_blockers : [],
  lane_boundary: buildLaneBoundary(row),
}));

const counts = buildCounts(rows);
const artifact = {
  schema_version: 1,
  artifact_type: 'agent2_deuteronomy_phase2_transform_readiness_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs',
  status: 'nonpublic_transform_readiness_matrix_pre_agent6_boundary',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model',
  source_workset: options.input,
  source_matrix: input.source_matrix,
  spark1_run_artifact: input.spark1_run_artifact,
  target_work: input.target_work,
  policy: 'Agent 2 non-public transform/readiness matrix only. It preserves Agent 10 source-lane evidence and zero-emission counters. It does not emit definition text, answer rows, public reader output, route JSONL, route shards, accepted text, or public/runtime changes.',
  source_lane_gate: {
    preserve_actual_agent1_or_agent10_lane: true,
    new_dictionary_not_presumed_nc: true,
    old_excluded_dictionary_not_presumed_blocked: true,
    commercial_clean_and_nc_partitions_separate: true,
    metadata_link_only_no_definition_text: true,
    blocked_review_no_candidate_text_export: true,
  },
  counts,
  zero_emission_counters: {
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    accepted_text_rows: 0,
    public_reader_output_rows: 0,
  },
  agent6_boundary_now: 'none_ready_from_agent2_matrix',
  agent6_future_boundary: 'Required before any transform/display/source/license/Definition/public/runtime/answer acceptance or public output. Return this matrix to Agent 10 for exact boundary packaging.',
  rows,
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'source/license/legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'NC commercial authorization',
  ],
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Agent 2 Deuteronomy Phase-2 readiness matrix wrote ${rows.length} row(s), ${counts.occurrences} occurrence(s). Output: ${options.output}. Report: ${options.report}`);

function buildLaneBoundary(row) {
  if (row.license_lane === 'commercial_clean_candidate') {
    return {
      lane: 'commercial_clean_candidate',
      export_partition: 'commercial_clean_only_after_agent6_boundary',
      nc_partition: false,
      candidate_text_export_now: false,
      answer_eligible_now: false,
      public_emit_now: false,
    };
  }
  if (row.license_lane === 'noncommercial_educational_candidate') {
    return {
      lane: 'noncommercial_educational_candidate',
      export_partition: 'separate_nc_educational_only_after_agent6_boundary',
      nc_partition: true,
      candidate_text_export_now: false,
      answer_eligible_now: false,
      public_emit_now: false,
    };
  }
  if (row.license_lane === 'metadata_or_link_only') {
    return {
      lane: 'metadata_or_link_only',
      export_partition: 'citation_link_only',
      candidate_text_export_now: false,
      definition_text_export_now: false,
      answer_eligible_now: false,
      public_emit_now: false,
    };
  }
  return {
    lane: row.license_lane || 'blocked_or_needs_review',
    export_partition: 'blocked_or_needs_review',
    candidate_text_export_now: false,
    answer_eligible_now: false,
    public_emit_now: false,
  };
}

function buildCounts(rows) {
  const laneCounts = {};
  const laneOccurrences = {};
  const sourceCounts = {};
  const licenseCounts = {};
  for (const row of rows) {
    laneCounts[row.license_lane] = Number(laneCounts[row.license_lane] || 0) + 1;
    laneOccurrences[row.license_lane] = Number(laneOccurrences[row.license_lane] || 0) + row.occurrence_count;
    sourceCounts[row.source_name] = Number(sourceCounts[row.source_name] || 0) + 1;
    licenseCounts[row.license_label] = Number(licenseCounts[row.license_label] || 0) + 1;
  }
  return {
    rows: rows.length,
    occurrences: rows.reduce((sum, row) => sum + row.occurrence_count, 0),
    license_lane_rows: laneCounts,
    license_lane_occurrences: laneOccurrences,
    source_rows: sourceCounts,
    license_rows: licenseCounts,
    commercial_clean_candidate_rows: rows.filter((row) => row.license_lane === 'commercial_clean_candidate').length,
    commercial_clean_candidate_occurrences: rows.filter((row) => row.license_lane === 'commercial_clean_candidate').reduce((sum, row) => sum + row.occurrence_count, 0),
    noncommercial_educational_candidate_rows: rows.filter((row) => row.license_lane === 'noncommercial_educational_candidate').length,
    noncommercial_educational_candidate_occurrences: rows.filter((row) => row.license_lane === 'noncommercial_educational_candidate').reduce((sum, row) => sum + row.occurrence_count, 0),
    metadata_or_link_only_rows: rows.filter((row) => row.license_lane === 'metadata_or_link_only').length,
    blocked_or_needs_review_rows: rows.filter((row) => row.license_lane === 'blocked_or_needs_review').length,
    answer_eligible_rows: rows.filter((row) => row.answer_eligible === true).length,
    public_emit_rows: rows.filter((row) => row.public_emit === true).length,
    definition_text_emitted_rows: rows.filter((row) => row.definition_text_emitted === true).length,
    accepted_text_emitted_rows: rows.filter((row) => row.accepted_text_emitted === true).length,
    route_shard_write_rows: rows.filter((row) => row.route_shard_write === true).length,
  };
}

function parseArgs(args) {
  const parsed = {
    input: 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
    output: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
    report: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md',
  };
  for (const arg of args) {
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
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

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Agent 2 Deuteronomy Phase-2 Transform Readiness Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Counts',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Occurrences: ${artifact.counts.occurrences}`,
    `- Commercial-clean candidate rows / occurrences: ${artifact.counts.commercial_clean_candidate_rows} / ${artifact.counts.commercial_clean_candidate_occurrences}`,
    `- NC educational rows / occurrences: ${artifact.counts.noncommercial_educational_candidate_rows} / ${artifact.counts.noncommercial_educational_candidate_occurrences}`,
    `- Metadata/link-only rows: ${artifact.counts.metadata_or_link_only_rows}`,
    `- Blocked/review rows: ${artifact.counts.blocked_or_needs_review_rows}`,
    `- Answer-eligible rows: ${artifact.counts.answer_eligible_rows}`,
    `- Public emit rows: ${artifact.counts.public_emit_rows}`,
    `- Definition text emitted rows: ${artifact.counts.definition_text_emitted_rows}`,
    `- Accepted text emitted rows: ${artifact.counts.accepted_text_emitted_rows}`,
    `- Route shard write rows: ${artifact.counts.route_shard_write_rows}`,
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    `Agent 6 boundary now: ${artifact.agent6_boundary_now}`,
    `Agent 6 future boundary: ${artifact.agent6_future_boundary}`,
    '',
    '## Source Lane Gate',
    '',
    '- New dictionary sources are not presumed NC.',
    '- Old excluded dictionaries are not presumed blocked.',
    '- Commercial-clean and NC educational lanes remain separated.',
    '- Metadata/link-only rows do not emit definition text.',
    '- Blocked/review rows stay out of candidate text exports.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
