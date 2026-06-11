#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json';
const outputMd = 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.md';
const prepPath = 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json';
const agent1PacketPath = 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json';

const prep = readJson(prepPath);
const agent1 = readJson(agent1PacketPath);
const sourceFamilies = agent1.source_families || [];

const rows = sourceFamilies.map((row) => ({
  row_subset_id: row.row_subset_id,
  source_family: row.source_family,
  source_name: row.source_name,
  license_label: row.license_label,
  license_lane: row.license_lane,
  evidence_path: row.evidence_path,
  source_url_or_citation: row.source_url_or_citation,
  row_count: row.evidence?.rows,
  occurrence_count: row.evidence?.occurrences,
  attribution_required: row.attribution_required,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  corpus_contamination: row.corpus_contamination,
  agent6_boundary_required: row.agent6_boundary_required,
  required_transform_inputs_present: requiredTransformInputsPresent(row),
  allowed_transform_now: false,
  transform_readiness: readinessFor(row),
  transform_action_once_unblocked: actionFor(row),
  exact_blocker: blockerFor(row),
  candidate_text_rows_now: 0,
  definition_candidate_rows_now: 0,
  lemma_candidate_rows_now: 0,
  reader_hint_candidate_rows_now: 0,
  answer_eligible_rows_now: 0,
  public_emit_rows_now: 0,
  accepted_gloss_text_rows_now: 0,
  definition_content_rows_now: 0,
}));

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_excluded_row_transform_readiness_matrix',
  generated_at: new Date().toISOString(),
  active_mode: prep.active_mode,
  current_agent1_thread_id: prep.current_agent1_thread_id,
  target: 'old-dictionary-excluded-row-license-lane-reaudit transform readiness',
  status: 'nonpublic_transform_readiness_matrix_built_no_transform_emitted',
  inputs: {
    agent2_consumption_prep: prepPath,
    agent1_classified_packet: agent1PacketPath,
  },
  required_lanes: prep.required_lanes,
  matrix_rows: rows,
  matrix_counts: {
    source_family_rows: rows.length,
    commercial_clean_candidate_source_families: countLane(rows, 'commercial_clean_candidate'),
    noncommercial_educational_candidate_source_families: countLane(rows, 'noncommercial_educational_candidate'),
    metadata_or_link_only_source_families: countLane(rows, 'metadata_or_link_only'),
    blocked_or_needs_review_source_families: countLane(rows, 'blocked_or_needs_review'),
    allowed_transform_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    candidate_text_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  exact_blockers: Array.from(new Set(rows.map((row) => row.exact_blocker))),
  lane_preservation_assertions: {
    commercial_clean_candidate_not_contaminated_by_nc: true,
    nc_separate_partition_required: true,
    nc_derived_from_nc_required: true,
    nc_commercial_export_allowed_required_value: false,
    nc_attribution_required_value: true,
    blocked_or_needs_review_excluded_from_transform: true,
  },
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    nc_commercial_authorization_rows: 0,
  },
  validator: `node scripts/validate_agent2_old_dictionary_excluded_row_transform_readiness_matrix.mjs ${outputJson}`,
  handoff_owner: 'Agent 2 readiness matrix; Agent 10 release owner consumes; Agent 6 supplies exact row/subset boundary before any candidate-text/package/display behavior.',
  stop_condition: 'Stop at transform-readiness rows. No old/new/missed dictionary row may become Definition content, lemma candidate, reader-hint candidate, answer row, accepted gloss/text, or public/runtime output from this artifact.',
  non_acceptance_boundary: prep.non_acceptance_boundary,
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function requiredTransformInputsPresent(row) {
  return Boolean(row.source_family && row.source_name && row.license_label && row.license_lane && row.row_subset_id && row.evidence_path);
}

function readinessFor(row) {
  if (row.license_lane === 'blocked_or_needs_review') return 'blocked_missing_source_license_custody_basis';
  if (row.license_lane === 'noncommercial_educational_candidate') return 'classified_nc_separate_lane_awaiting_exact_agent6_nc_boundary';
  if (row.license_lane === 'metadata_or_link_only') return 'metadata_link_only_no_candidate_text_transform';
  return 'classified_commercial_clean_awaiting_exact_agent6_row_subset_boundary_and_morphology_relation';
}

function actionFor(row) {
  if (row.license_lane === 'blocked_or_needs_review') return 'no transform; preserve blocked lane until Agent 1 supplies independent source/license/custody basis and Agent 6 boundary';
  if (row.license_lane === 'noncommercial_educational_candidate') return 'prepare only separate noncommercial educational metadata/readiness partition after exact Agent 6 NC boundary; no commercial export';
  if (row.license_lane === 'metadata_or_link_only') return 'metadata/link-only planning; no definition text, accepted gloss/text, answer row, or public emission';
  return 'prepare nonpublic metadata-only definition/lemma/reader-hint input rows after exact Agent 6 row/subset boundary and approved morphology relation';
}

function blockerFor(row) {
  if (row.license_lane === 'blocked_or_needs_review') return `${row.row_subset_id}::missing_independent_source_license_custody_basis`;
  if (row.license_lane === 'noncommercial_educational_candidate') return `${row.row_subset_id}::missing_exact_agent6_nc_boundary_no_commercial_export_authorization`;
  if (row.license_lane === 'metadata_or_link_only') return `${row.row_subset_id}::metadata_or_link_only_no_candidate_text_transform`;
  return `${row.row_subset_id}::missing_exact_agent6_boundary_and_approved_morphology_relation`;
}

function countLane(rows, lane) {
  return rows.filter((row) => row.license_lane === lane).length;
}

function assertArtifact(value) {
  if (value.current_agent1_thread_id !== '019e975d-dc9f-7020-a7c8-885d083a837e') throw new Error('current Agent 1 thread mismatch');
  if (value.matrix_counts.source_family_rows !== 5) throw new Error('expected 5 source-family rows');
  if (value.matrix_counts.commercial_clean_candidate_source_families !== 3) throw new Error('expected 3 commercial-clean families');
  if (value.matrix_counts.noncommercial_educational_candidate_source_families !== 1) throw new Error('expected 1 NC family');
  if (value.matrix_counts.blocked_or_needs_review_source_families !== 1) throw new Error('expected 1 blocked family');
  for (const row of value.matrix_rows) {
    if (row.allowed_transform_now !== false) throw new Error(`${row.row_subset_id} transform must remain blocked now`);
    if (row.license_lane === 'noncommercial_educational_candidate') {
      if (row.derived_from_nc !== true || row.commercial_export_allowed !== false || row.attribution_required !== true || row.corpus_contamination !== false) {
        throw new Error('NC flags not preserved');
      }
    }
  }
  for (const count of Object.values(value.zero_output_counts)) {
    if (count !== 0) throw new Error('zero output counter mismatch');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Old Dictionary Excluded-Row Transform Readiness Matrix - 2026-06-05',
    '',
    `Status: ${value.status}.`,
    '',
    '## Counts',
    '',
    `- Source-family rows: ${value.matrix_counts.source_family_rows}.`,
    `- Commercial-clean / NC / metadata-link / blocked source families: ${value.matrix_counts.commercial_clean_candidate_source_families} / ${value.matrix_counts.noncommercial_educational_candidate_source_families} / ${value.matrix_counts.metadata_or_link_only_source_families} / ${value.matrix_counts.blocked_or_needs_review_source_families}.`,
    '- Transform, candidate text, Definition, lemma, reader-hint, answer, public, and accepted-text rows now: 0.',
    '',
    '## Exact Blockers',
    '',
    ...value.exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Handoff Owner',
    '',
    value.handoff_owner,
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
    '## Boundary',
    '',
    value.non_acceptance_boundary.join('; '),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
