#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  queue: 'data/control/spark_standing_queue.json',
  downstreamWorkset: 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
  agent3Matrix: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  outputJson: 'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json',
  outputMd: 'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md'
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countRows(rows, key) {
  const counts = {};
  for (const row of rows) {
    const value = String(row[key] || 'unknown');
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function sumBy(rows, key, valueKey = 'occurrence_count') {
  const counts = {};
  for (const row of rows) {
    const value = String(row[key] || 'unknown');
    counts[value] = (counts[value] || 0) + Number(row[valueKey] || 0);
  }
  return counts;
}

const queue = readJson(PATHS.queue);
const target = queue.current_per_book_pipeline_target;
assert(target?.target === 'tanakh/deuteronomy', 'current per-book target must be tanakh/deuteronomy');
const agent1Slot = (target.lane_slots || []).find((slot) => slot.lane === 'Agent 1 / Spark-1');
assert(agent1Slot, 'Agent 1 / Spark-1 lane slot is missing for Deuteronomy');

const workset = readJson(PATHS.downstreamWorkset);
const matrix = readJson(PATHS.agent3Matrix);
const rows = workset.rows || [];

assert(workset.target_work?.work_id === 'deuteronomy', 'downstream workset target must be deuteronomy');
assert(workset.counts?.rows === 1334, 'downstream workset row count must be 1334');
assert(workset.counts?.occurrences === 2964, 'downstream workset occurrence count must be 2964');
assert(workset.counts?.nc_rows === 0, 'downstream workset NC rows must be 0');
assert(rows.length === 1334, 'downstream workset row array must contain 1334 rows');

const occurrenceSum = rows.reduce((sum, row) => sum + Number(row.occurrence_count || 0), 0);
assert(occurrenceSum === 2964, 'downstream row occurrence sum must be 2964');

const mappedRows = rows.map((row) => ({
  token_index_id: row.token_index_id,
  surface: row.clicked_surface_form,
  normalized: row.normalized_form,
  occurrences: row.occurrence_count,
  source_family: row.source_family,
  source_name: row.source_name,
  source_id: (row.safe_source_ids || []).join('; '),
  license_label: row.license_label,
  license_lane: row.license_lane,
  attribution_required: row.attribution_required,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: false,
  commercial_export_candidate: row.commercial_export_candidate === true,
  owner_use_attestation: row.owner_use_attestation,
  corpus_contamination: row.corpus_contamination,
  source_url_or_citation: row.source_url_or_citation,
  agent6_boundary_required: row.agent6_boundary_required,
  answer_eligible: false,
  public_emit: false,
  definition_text_stored_now: false,
  accepted_text_now: false,
  exact_blockers: row.exact_blockers || [],
  source_route_evidence: row.source_route_evidence
}));

const laneRows = countRows(mappedRows, 'license_lane');
const laneOccurrences = sumBy(mappedRows, 'license_lane', 'occurrences');
const licenseRows = countRows(mappedRows, 'license_label');
const licenseOccurrences = sumBy(mappedRows, 'license_label', 'occurrences');
const sourceRows = countRows(mappedRows, 'source_name');
const sourceOccurrences = sumBy(mappedRows, 'source_name', 'occurrences');

const output = {
  schema_version: 2,
  artifact_type: 'agent1_deuteronomy_source_license_custody_map',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_deuteronomy_source_license_custody_map.mjs',
  status: 'agent1_deuteronomy_source_license_custody_map_prepared_for_agent6_boundary_only',
  active_mode: queue.broad_floor_target?.mode || 'BROAD_CORPUS_EXPANSION',
  target: target.target,
  mode: target.mode,
  lane: agent1Slot.lane,
  item: agent1Slot.item,
  exact_inputs_checked: [
    PATHS.queue,
    PATHS.downstreamWorkset,
    PATHS.agent3Matrix
  ],
  source_license_counts: {
    work_target_count: 1,
    row_count_covered: rows.length,
    occurrence_count_covered: occurrenceSum,
    commercial_clean_rows: laneRows.commercial_clean_candidate || 0,
    commercial_clean_occurrences: laneOccurrences.commercial_clean_candidate || 0,
    noncommercial_educational_rows: laneRows.noncommercial_educational_candidate || 0,
    noncommercial_educational_occurrences: laneOccurrences.noncommercial_educational_candidate || 0,
    metadata_or_link_only_rows: laneRows.metadata_or_link_only || 0,
    blocked_or_needs_review_rows: laneRows.blocked_or_needs_review || 0,
    unmatched_rows: 0,
    exact_blocker_rows_from_matrix: matrix.counts?.exact_blocker_rows || null,
    exact_blocker_occurrences_from_matrix: matrix.counts?.exact_blocker_occurrences || null
  },
  lane_counts: {
    rows: laneRows,
    occurrences: laneOccurrences
  },
  license_counts: {
    rows: licenseRows,
    occurrences: licenseOccurrences
  },
  source_counts: {
    rows: sourceRows,
    occurrences: sourceOccurrences
  },
  rows: mappedRows,
  blocker: null,
  remaining_blockers: [
    {
      blocker: 'agent6_boundary_required_before_transform_or_export',
      rows: rows.length,
      occurrences: occurrenceSum,
      owner: 'Agent 6',
      reason: 'Rows are source/license/custody lane evidence only; package/export/display/public/answer behavior remains unauthorized.'
    },
    {
      blocker: 'matrix_exact_blocker_rows_outside_this_downstream_workset',
      rows: matrix.counts?.exact_blocker_rows || 0,
      occurrences: matrix.counts?.exact_blocker_occurrences || 0,
      owner: 'Agent 3 / Agent 1 depending on future workset',
      reason: 'Agent 3 matrix rows outside the downstream workset remain blocked before Agent 2 transform.'
    }
  ],
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    metadata_or_link_only_emits_citation_link_only: true,
    blocked_or_needs_review_emits_no_candidate_text: true,
    commercial_export_allowed_now: false
  },
  nc_posture: {
    nc_rows_observed: 0,
    preserve_noncommercial_educational_candidate_if_future_rows_exist: true,
    derived_from_nc: true,
    commercial_export_allowed: false,
    owner_use_attestation_required: 'noncommercial_educational_zero_profit_zero_kickback',
    corpus_contamination: false
  },
  command_or_script: {
    build: 'node scripts/build_agent1_deuteronomy_source_license_custody_map.mjs',
    validator: 'node scripts/validate_agent1_deuteronomy_source_license_custody_map.mjs'
  },
  spark1_handoff: 'Runnable Agent 1 Deuteronomy source/license/custody map exists and validates; Spark-1 may rerun mechanically if requested with this command pair.',
  agent6_boundary: 'Agent 6 boundary is required before any Deuteronomy package/export/display/public/answer behavior. This packet is evidence only.',
  stop_condition: agent1Slot.stop_condition,
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  boundary: {
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_nc_flattening: true,
    no_qa_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_public_runtime_mutation: true
  }
};

const markdown = [
  '# Agent 1 Deuteronomy Source/License/Custody Map - 2026-06-04',
  '',
  `Status: \`${output.status}\`.`,
  '',
  '## Target',
  '',
  `lane: ${output.lane}.`,
  `target: \`${output.target}\`.`,
  `item: \`${output.item}\`.`,
  '',
  '## Inputs',
  '',
  ...output.exact_inputs_checked.map((input) => `- \`${input}\``),
  '',
  '## Counts',
  '',
  `- rows / occurrences covered: \`${output.source_license_counts.row_count_covered}\` / \`${output.source_license_counts.occurrence_count_covered}\``,
  `- commercial-clean candidate rows / occurrences: \`${output.source_license_counts.commercial_clean_rows}\` / \`${output.source_license_counts.commercial_clean_occurrences}\``,
  `- NC educational rows / occurrences: \`${output.source_license_counts.noncommercial_educational_rows}\` / \`${output.source_license_counts.noncommercial_educational_occurrences}\``,
  `- matrix exact blocker rows / occurrences outside this downstream workset: \`${output.source_license_counts.exact_blocker_rows_from_matrix}\` / \`${output.source_license_counts.exact_blocker_occurrences_from_matrix}\``,
  '',
  '## License Lanes',
  '',
  ...Object.entries(output.lane_counts.rows).map(([lane, count]) => `- \`${lane}\`: \`${count}\` rows / \`${output.lane_counts.occurrences[lane] || 0}\` occurrences`),
  '',
  '## Source Families',
  '',
  ...Object.entries(output.source_counts.rows).map(([source, count]) => `- \`${source}\`: \`${count}\` rows / \`${output.source_counts.occurrences[source] || 0}\` occurrences`),
  '',
  '## Handoff',
  '',
  `Spark-1 handoff: ${output.spark1_handoff}`,
  `Agent 6 boundary: ${output.agent6_boundary}`,
  '',
  '## Boundary',
  '',
  'No source/provenance/license acceptance, no NC flattening, no QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or public/runtime mutation.',
  ''
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  output_json: PATHS.outputJson,
  output_md: PATHS.outputMd,
  status: output.status,
  rows: output.source_license_counts.row_count_covered,
  occurrences: output.source_license_counts.occurrence_count_covered,
  commercial_clean_rows: output.source_license_counts.commercial_clean_rows,
  nc_rows: output.source_license_counts.noncommercial_educational_rows
}, null, 2));
