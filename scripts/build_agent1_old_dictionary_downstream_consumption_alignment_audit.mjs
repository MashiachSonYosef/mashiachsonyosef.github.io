#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  outputJson: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.md',
  agent1Addendum: 'reports/agent1-source-license-custody-pipeline-registry-addendum-2026-06-05.json',
  agent1AddendumResult: 'reports/agent1-source-license-custody-pipeline-registry-addendum-validation-result-2026-06-05.json',
  agent1Handoff: 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json',
  agent1ExportPartitions: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
  agent2Prep: 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json',
  agent2Readiness: 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json',
  agent10Consumption: 'reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json'
};

const addendum = readJson(paths.agent1Addendum);
const addendumResult = readJson(paths.agent1AddendumResult);
const handoff = readJson(paths.agent1Handoff);
const exportPartitions = readJson(paths.agent1ExportPartitions);
const prep = readJson(paths.agent2Prep);
const readiness = readJson(paths.agent2Readiness);
const agent10 = readJson(paths.agent10Consumption);

const laneCounts = addendum.lane_output.lane_counts_rows;
const matrixRows = readiness.matrix_rows || [];
const commercialCleanRows = matrixRows.filter((row) => row.license_lane === 'commercial_clean_candidate');
const ncRows = matrixRows.filter((row) => row.license_lane === 'noncommercial_educational_candidate');
const metadataRows = matrixRows.filter((row) => row.license_lane === 'metadata_or_link_only');
const blockedRows = matrixRows.filter((row) => row.license_lane === 'blocked_or_needs_review');
const zeroCounters = {
  agent2_prep: prep.zero_output_counts,
  agent2_readiness: readiness.zero_output_counts,
  agent10_consumption: agent10.zero_counters
};

const audit = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_downstream_consumption_alignment_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_downstream_consumption_alignment_audit.mjs',
  status: 'agent1_downstream_consumption_aligned_zero_output_no_acceptance',
  agent: 'Agent 1',
  thread_title: 'Agent 1 - importer',
  current_agent1_thread_id: addendum.current_thread_id,
  old_agent1_thread_id: addendum.old_agent1_thread_id,
  old_agent1_policy: addendum.old_agent1_policy,
  active_mode: addendum.active_mode,
  production_lane: addendum.production_lane,
  target: 'old-dictionary-excluded-row-license-lane-reaudit downstream consumption alignment',
  purpose: 'Agent 1 evidence-only audit that Agent 2 and Agent 10 consumed current old-dictionary lane evidence without transforming candidate text, merging NC rows, routing release, or claiming acceptance.',
  inputs: {
    agent1_addendum: paths.agent1Addendum,
    agent1_addendum_validation_result: paths.agent1AddendumResult,
    agent1_agent2_handoff: paths.agent1Handoff,
    agent1_export_partitions: paths.agent1ExportPartitions,
    agent2_consumption_prep: paths.agent2Prep,
    agent2_transform_readiness_matrix: paths.agent2Readiness,
    agent10_readiness_consumption: paths.agent10Consumption
  },
  validator_commands_observed_current_turn: [
    'node scripts/validate_agent2_old_dictionary_excluded_row_reaudit_consumption_prep.mjs reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json',
    'node scripts/validate_agent2_old_dictionary_excluded_row_transform_readiness_matrix.mjs reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json',
    'node scripts/validate_agent10_agent2_old_dictionary_excluded_row_readiness_consumption.mjs reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json'
  ],
  agent1_source_lane_counts: {
    scoped_preview_rows: laneCounts.scoped_preview_rows,
    scoped_preview_occurrences: laneCounts.scoped_preview_occurrences,
    commercial_clean_candidate_source_families: laneCounts.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: laneCounts.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: laneCounts.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: laneCounts.blocked_or_needs_review_source_families,
    per_family_rows_can_overlap: laneCounts.per_family_rows_can_overlap
  },
  downstream_alignment_counts: {
    agent2_prep_source_family_count: prep.observed_counts.source_family_count,
    agent2_readiness_source_family_rows: readiness.matrix_counts.source_family_rows,
    agent10_consumed_source_family_rows: agent10.counts.source_family_rows,
    commercial_clean_candidate_source_families: commercialCleanRows.length,
    noncommercial_educational_candidate_source_families: ncRows.length,
    metadata_or_link_only_source_families: metadataRows.length,
    blocked_or_needs_review_source_families: blockedRows.length,
    allowed_transform_rows_now: readiness.matrix_counts.allowed_transform_rows_now,
    candidate_text_rows_now: readiness.matrix_counts.candidate_text_rows_now,
    definition_candidate_rows_now: readiness.matrix_counts.definition_candidate_rows_now,
    lemma_candidate_rows_now: readiness.matrix_counts.lemma_candidate_rows_now,
    reader_hint_candidate_rows_now: readiness.matrix_counts.reader_hint_candidate_rows_now,
    answer_eligible_rows_now: readiness.matrix_counts.answer_eligible_rows_now,
    public_emit_rows_now: readiness.matrix_counts.public_emit_rows_now,
    release_route_opened_now: 0,
    agent6_route_opened_now: 0
  },
  lane_alignment_rows: matrixRows.map((row) => ({
    row_subset_id: row.row_subset_id,
    source_family: row.source_family,
    license_lane: row.license_lane,
    rows: row.row_count,
    occurrences: row.occurrence_count,
    derived_from_nc: row.derived_from_nc,
    commercial_export_allowed: row.commercial_export_allowed,
    attribution_required: row.attribution_required,
    corpus_contamination: row.corpus_contamination,
    required_transform_inputs_present: row.required_transform_inputs_present,
    allowed_transform_now: row.allowed_transform_now,
    exact_blocker: row.exact_blocker
  })),
  preserved_lane_rules: {
    agent2_may_consume_only_rows_with_agent1_lane_evidence: true,
    commercial_clean_candidate_preserved_as_candidate_not_acceptance: true,
    noncommercial_educational_candidate_preserved_separately: true,
    metadata_or_link_only_preserved_as_zero_rows: true,
    blocked_or_needs_review_preserved_separately: true,
    nc_commercial_authorization_rows: 0,
    unclassified_rows_consumed_as_candidate_text: agent10.lane_split.unclassified_rows_consumed_as_candidate_text,
    metadata_or_link_only_rows_consumed_as_candidate_text: agent10.lane_split.metadata_or_link_only_rows_consumed_as_candidate_text
  },
  exact_blockers: readiness.exact_blockers,
  blocker_summary: {
    commercial_clean_rows_blocked_by_agent6_boundary_and_morphology_relation: commercialCleanRows.length,
    nc_rows_blocked_by_agent6_nc_boundary_and_no_commercial_export_authorization: ncRows.length,
    blocked_or_needs_review_rows_blocked_by_missing_independent_source_license_custody_basis: blockedRows.length
  },
  handoff_owner: {
    agent2: 'May consume only current Agent 1 lane evidence and must keep allowed_transform_rows_now at 0 until exact Agent 6 row/subset boundary plus approved morphology relation exist.',
    agent6: 'Receives future exact row/subset boundary questions only if a candidate-use package is prepared.',
    agent10: 'Consumes readiness/blocker evidence for release-owner assembly only; no release action or Agent 6 route is opened by current zero-output readiness.'
  },
  downstream_highest_permissible_claim: agent10.highest_permissible_claim,
  zero_output_counts: zeroCounters,
  overlay_boundary: {
    agent1_addendum_ok: addendumResult.ok === true,
    agent2_artifacts_mutated_by_agent1: false,
    agent10_artifacts_mutated_by_agent1: false,
    queue_mutation_performed: false,
    control_surface_mutation_performed: false,
    render_run: false,
    runtime_validation_run: false,
    browser_validation_run: false,
    staging_performed: false,
    commit_performed: false,
    source_tracking_performed: false,
    definition_content_created: false,
    answer_content_created: false,
    release_route_opened: false
  },
  non_acceptance_boundary: {
    no_qa_acceptance: true,
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_candidate_text_export_authorization: true,
    no_release_action: true,
    no_public_runtime_mutation: true,
    no_queue_mutation: true,
    no_staging: true,
    no_destructive_repo_action: true
  },
  stop_condition: 'Stop after Agent 1 records downstream-consumption alignment as zero-output evidence only; do not authorize transform, route, Definition content, answer rows, accepted text, publication, release, source/license/legal acceptance, or NC commercial use.'
};

assertAudit(audit);
writeJson(paths.outputJson, audit);
writeMd(paths.outputMd, audit);
console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);

function assertAudit(value) {
  if (value.current_agent1_thread_id !== '019e975d-dc9f-7020-a7c8-885d083a837e') throw new Error('current Agent 1 thread mismatch');
  if (value.old_agent1_policy !== 'archived_do_not_use') throw new Error('old Agent 1 policy mismatch');
  if (value.agent1_source_lane_counts.commercial_clean_candidate_source_families !== 3) throw new Error('Agent 1 commercial-clean count mismatch');
  if (value.agent1_source_lane_counts.noncommercial_educational_candidate_source_families !== 1) throw new Error('Agent 1 NC count mismatch');
  if (value.agent1_source_lane_counts.metadata_or_link_only_source_families !== 0) throw new Error('Agent 1 metadata/link-only count mismatch');
  if (value.agent1_source_lane_counts.blocked_or_needs_review_source_families !== 1) throw new Error('Agent 1 blocked count mismatch');
  if (value.downstream_alignment_counts.agent2_prep_source_family_count !== 5) throw new Error('Agent 2 prep source family count mismatch');
  if (value.downstream_alignment_counts.agent2_readiness_source_family_rows !== 5) throw new Error('Agent 2 readiness row count mismatch');
  if (value.downstream_alignment_counts.agent10_consumed_source_family_rows !== 5) throw new Error('Agent 10 consumed row count mismatch');
  if (value.downstream_alignment_counts.allowed_transform_rows_now !== 0) throw new Error('allowed transform rows must be zero');
  if (value.downstream_alignment_counts.candidate_text_rows_now !== 0) throw new Error('candidate text rows must be zero');
  if (value.downstream_alignment_counts.release_route_opened_now !== 0) throw new Error('release route opened must be zero');
  if (value.lane_alignment_rows.length !== 5) throw new Error('lane alignment rows mismatch');
  const klein = value.lane_alignment_rows.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  if (!klein || klein.license_lane !== 'noncommercial_educational_candidate' || klein.derived_from_nc !== true || klein.commercial_export_allowed !== false) {
    throw new Error('Klein NC lane not preserved');
  }
  const augmented = value.lane_alignment_rows.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  if (!augmented || augmented.license_lane !== 'blocked_or_needs_review' || augmented.allowed_transform_now !== false) {
    throw new Error('BDB Augmented Strong blocked lane not preserved');
  }
  for (const group of Object.values(value.zero_output_counts)) {
    for (const count of Object.values(group)) {
      if (count !== 0) throw new Error('zero-output counter mismatch');
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeMd(relativePath, value) {
  const rows = value.lane_alignment_rows.map((row) => (
    `| ${row.row_subset_id} | ${row.license_lane} | ${row.rows}/${row.occurrences} | ${row.allowed_transform_now} | ${row.exact_blocker} |`
  ));
  const lines = [
    '# Agent 1 Old Dictionary Downstream Consumption Alignment Audit - 2026-06-05',
    '',
    `Status: \`${value.status}\``,
    '',
    '## Scope',
    '',
    value.purpose,
    '',
    '## Counts',
    '',
    `- Agent 1 lane counts: commercial_clean_candidate ${value.agent1_source_lane_counts.commercial_clean_candidate_source_families}, noncommercial_educational_candidate ${value.agent1_source_lane_counts.noncommercial_educational_candidate_source_families}, metadata_or_link_only ${value.agent1_source_lane_counts.metadata_or_link_only_source_families}, blocked_or_needs_review ${value.agent1_source_lane_counts.blocked_or_needs_review_source_families}.`,
    `- Downstream source-family rows: Agent 2 prep ${value.downstream_alignment_counts.agent2_prep_source_family_count}, Agent 2 readiness ${value.downstream_alignment_counts.agent2_readiness_source_family_rows}, Agent 10 consumed ${value.downstream_alignment_counts.agent10_consumed_source_family_rows}.`,
    '- Allowed transform, candidate text, Definition, lemma, reader-hint, answer, public emit, release route, and Agent 6 route rows now: 0.',
    '',
    '## Lane Alignment',
    '',
    '| row subset | lane | rows/occurrences | allowed transform now | exact blocker |',
    '| --- | --- | ---: | --- | --- |',
    ...rows,
    '',
    '## Handoff Owner',
    '',
    `- Agent 2: ${value.handoff_owner.agent2}`,
    `- Agent 6: ${value.handoff_owner.agent6}`,
    `- Agent 10: ${value.handoff_owner.agent10}`,
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
    '## Boundary',
    '',
    'This is Agent 1 downstream-consumption alignment evidence only. It does not claim QA, source/license/legal, Definition, runtime, publication, product, answer, accepted text, candidate-text export, release action, queue, staging, render, source-tracking, or NC-commercial authorization.',
    ''
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
