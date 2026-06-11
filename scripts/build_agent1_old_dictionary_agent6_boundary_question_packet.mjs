#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  outputJson: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json',
  outputMd: 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.md',
  addendum: 'reports/agent1-source-license-custody-pipeline-registry-addendum-2026-06-05.json',
  downstreamAudit: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json',
  downstreamAuditResult: 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json',
  planningState: 'reports/agent1-old-dictionary-planning-boundary-state-2026-06-04.json',
  agent6PlanningVerdict: 'reports/agent6-old-dictionary-license-lane-planning-verdict-2026-06-04.md',
  agent10CommercialCleanHeldPacket: 'reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json',
  bdbAugmentedBlocker: 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.json'
};

const addendum = readJson(paths.addendum);
const downstreamAudit = readJson(paths.downstreamAudit);
const downstreamAuditResult = readJson(paths.downstreamAuditResult);
const planningState = readJson(paths.planningState);
const agent6PlanningVerdictText = readText(paths.agent6PlanningVerdict);
const agent10CommercialCleanHeldPacket = readJson(paths.agent10CommercialCleanHeldPacket);
const bdbAugmentedBlocker = readJson(paths.bdbAugmentedBlocker);

const sourceRows = downstreamAudit.lane_alignment_rows;
const byLane = sourceRows.reduce((memo, row) => {
  if (!memo[row.license_lane]) memo[row.license_lane] = [];
  memo[row.license_lane].push(row);
  return memo;
}, {});

const boundaryQuestions = [];
for (const row of byLane.commercial_clean_candidate || []) {
  boundaryQuestions.push({
    question_id: `${row.row_subset_id}::future_candidate_use_boundary_question`,
    row_subset_id: row.row_subset_id,
    source_family: row.source_family,
    license_lane: row.license_lane,
    rows: row.rows,
    occurrences: row.occurrences,
    current_status: 'planning_evidence_only_transform_blocked',
    requested_future_boundary_if_candidate_use_package_exists: 'pass_warn_block_nonpublic_candidate_use_after_exact_row_subset_package_and_approved_morphology_relation',
    current_allowed_now: {
      planning_evidence: true,
      agent2_transform: false,
      candidate_text_export: false,
      definition_content_storage: false,
      answer_eligibility: false,
      public_emit: false,
      release_action: false
    },
    prerequisites_before_delivery: [
      'future exact row/subset candidate-use package',
      'approved morphology relation for definition/lemma/reader-hint transform',
      'Agent 10 release-owner assembly of the future package'
    ],
    exact_blocker: row.exact_blocker,
    handoff_owner: 'Agent 10 for future package assembly; Agent 6 for exact row/subset boundary'
  });
}

for (const row of byLane.noncommercial_educational_candidate || []) {
  boundaryQuestions.push({
    question_id: `${row.row_subset_id}::future_nc_boundary_question`,
    row_subset_id: row.row_subset_id,
    source_family: row.source_family,
    license_lane: row.license_lane,
    rows: row.rows,
    occurrences: row.occurrences,
    current_status: 'separate_nc_educational_planning_lane_only',
    requested_future_boundary_if_candidate_use_package_exists: 'pass_warn_block_separate_noncommercial_educational_use_only_with_no_commercial_export',
    required_flags_to_preserve: {
      derived_from_nc: true,
      commercial_export_allowed: false,
      attribution_required: true,
      corpus_contamination: false
    },
    current_allowed_now: {
      planning_evidence: true,
      agent2_transform: false,
      candidate_text_export: false,
      definition_content_storage: false,
      answer_eligibility: false,
      public_emit: false,
      commercial_export: false,
      nc_commercial_authorization: false,
      release_action: false
    },
    prerequisites_before_delivery: [
      'future exact separate NC row/subset package',
      'explicit noncommercial educational boundary question',
      'attribution and no-commercial-export handling',
      'Agent 10 release-owner assembly of the future package'
    ],
    exact_blocker: row.exact_blocker,
    handoff_owner: 'Agent 6 for NC/public boundary; Agent 10 for future package assembly'
  });
}

boundaryQuestions.push({
  question_id: 'old-dictionary-excluded-row-license-lane-reaudit::metadata-or-link-only::zero-lane-boundary-record',
  row_subset_id: 'old-dictionary-excluded-row-license-lane-reaudit::metadata-or-link-only',
  source_family: null,
  license_lane: 'metadata_or_link_only',
  rows: 0,
  occurrences: 0,
  current_status: 'zero_rows_no_boundary_question_open',
  requested_future_boundary_if_candidate_use_package_exists: 'none_currently_zero_lane',
  current_allowed_now: {
    planning_evidence: true,
    agent2_transform: false,
    candidate_text_export: false,
    definition_content_storage: false,
    answer_eligibility: false,
    public_emit: false,
    release_action: false
  },
  prerequisites_before_delivery: [
    'future metadata/link-only rows with exact row/subset evidence'
  ],
  exact_blocker: 'metadata_or_link_only_current_row_count_zero',
  handoff_owner: 'Agent 1 if metadata/link-only rows appear; Agent 6 only after exact future row/subset package'
});

for (const row of byLane.blocked_or_needs_review || []) {
  boundaryQuestions.push({
    question_id: `${row.row_subset_id}::blocked_source_custody_boundary_question`,
    row_subset_id: row.row_subset_id,
    source_family: row.source_family,
    license_lane: row.license_lane,
    rows: row.rows,
    occurrences: row.occurrences,
    current_status: 'blocked_or_needs_review_no_candidate_use',
    requested_future_boundary_if_candidate_use_package_exists: 'block_until_independent_source_license_custody_basis_then_reask_agent6_boundary',
    current_allowed_now: {
      planning_evidence: true,
      agent2_transform: false,
      candidate_text_export: false,
      definition_content_storage: false,
      answer_eligibility: false,
      public_emit: false,
      release_action: false
    },
    missing_evidence: bdbAugmentedBlocker.exact_blocker.missing_evidence,
    observed_endpoint: bdbAugmentedBlocker.exact_blocker.observed_endpoint,
    observed_license: bdbAugmentedBlocker.exact_blocker.observed_license,
    observed_version_source: bdbAugmentedBlocker.exact_blocker.observed_version_source,
    repository_candidate_source_file_count: bdbAugmentedBlocker.exact_blocker.repository_candidate_source_file_count,
    exact_blocker: row.exact_blocker,
    handoff_owner: 'Agent 1 if independent evidence appears; Agent 6 only after evidence-backed boundary question'
  });
}

const packet = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_agent6_boundary_question_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_agent6_boundary_question_packet.mjs',
  status: 'agent1_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use',
  agent: 'Agent 1',
  thread_title: 'Agent 1 - importer',
  current_agent1_thread_id: addendum.current_thread_id,
  old_agent1_thread_id: addendum.old_agent1_thread_id,
  old_agent1_policy: addendum.old_agent1_policy,
  active_mode: addendum.active_mode,
  production_lane: addendum.production_lane,
  target: 'old-dictionary-excluded-row-license-lane-reaudit Agent 6 row/subset boundary questions',
  purpose: 'Record exact row/subset boundary questions and blockers for future Agent 6 review while preserving current zero-output, no-acceptance state.',
  inputs: {
    agent1_addendum: paths.addendum,
    agent1_downstream_alignment_audit: paths.downstreamAudit,
    agent1_downstream_alignment_audit_validation_result: paths.downstreamAuditResult,
    agent1_planning_boundary_state: paths.planningState,
    agent6_planning_verdict: paths.agent6PlanningVerdict,
    agent10_commercial_clean_held_packet: paths.agent10CommercialCleanHeldPacket,
    agent1_bdb_augmented_strong_blocker: paths.bdbAugmentedBlocker
  },
  agent6_prior_planning_verdict: {
    path: paths.agent6PlanningVerdict,
    disposition: planningState.agent6_verdict.disposition,
    accepted_scope: planningState.agent6_verdict.accepted_scope,
    still_requires_new_exact_boundary_for_candidate_use: agent6PlanningVerdictText.includes('requires a new exact Agent 6 boundary packet')
  },
  boundary_question_counts: {
    total_boundary_question_rows: boundaryQuestions.length,
    commercial_clean_candidate_questions: (byLane.commercial_clean_candidate || []).length,
    noncommercial_educational_candidate_questions: (byLane.noncommercial_educational_candidate || []).length,
    metadata_or_link_only_question_records: 1,
    blocked_or_needs_review_questions: (byLane.blocked_or_needs_review || []).length,
    future_candidate_use_questions_opened_now: 0,
    delivered_to_agent6_now: 0
  },
  lane_counts_rows: {
    source_family_rows: downstreamAudit.downstream_alignment_counts.agent2_readiness_source_family_rows,
    commercial_clean_candidate_source_families: downstreamAudit.downstream_alignment_counts.commercial_clean_candidate_source_families,
    noncommercial_educational_candidate_source_families: downstreamAudit.downstream_alignment_counts.noncommercial_educational_candidate_source_families,
    metadata_or_link_only_source_families: downstreamAudit.downstream_alignment_counts.metadata_or_link_only_source_families,
    blocked_or_needs_review_source_families: downstreamAudit.downstream_alignment_counts.blocked_or_needs_review_source_families,
    allowed_transform_rows_now: downstreamAudit.downstream_alignment_counts.allowed_transform_rows_now,
    candidate_text_rows_now: downstreamAudit.downstream_alignment_counts.candidate_text_rows_now,
    answer_eligible_rows_now: downstreamAudit.downstream_alignment_counts.answer_eligible_rows_now,
    public_emit_rows_now: downstreamAudit.downstream_alignment_counts.public_emit_rows_now,
    release_route_opened_now: downstreamAudit.downstream_alignment_counts.release_route_opened_now
  },
  boundary_questions: boundaryQuestions,
  delivery_state: {
    delivered_to_agent6_now: false,
    direct_route_attempted_now: false,
    reason_not_delivered: 'No current candidate-use package exists; Agent 10 held packet records zero candidate-use rows and unavailable direct Agent 6 route.',
    inherited_delivery_blocker: agent10CommercialCleanHeldPacket.agent6_delivery_state.exact_delivery_blocker
  },
  exact_blockers: [
    'future_candidate_use_package_missing',
    'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
    'missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform',
    'noncommercial_educational_candidate::klein-dictionary_no_commercial_export_authorization',
    'blocked_or_needs_review::bdb-augmented-strong_missing_independent_source_license_custody_basis',
    'metadata_or_link_only_current_row_count_zero'
  ],
  handoff_owner: {
    agent2: 'No transform now; may use this packet only to preserve row/subset blockers and lane separation.',
    agent6: 'Receives these exact row/subset questions only when a future evidence-backed candidate-use package is assembled.',
    agent10: 'Release owner for future package assembly and routing; current held commercial-clean packet remains zero-candidate-use.'
  },
  zero_output_counts: downstreamAudit.zero_output_counts,
  overlay_boundary: {
    agent1_downstream_alignment_audit_ok: downstreamAuditResult.ok === true,
    agent10_held_packet_delivery_status: agent10CommercialCleanHeldPacket.agent6_delivery_state.delivery_status,
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
  stop_condition: 'Stop after recording exact Agent 6 row/subset boundary questions and blockers as future-use evidence only; do not deliver, route, transform, export, publish, store Definition content, create answer rows, or claim acceptance without a future exact candidate-use package.'
};

assertPacket(packet);
writeJson(paths.outputJson, packet);
writeMd(paths.outputMd, packet);
console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);

function assertPacket(value) {
  if (value.current_agent1_thread_id !== '019e975d-dc9f-7020-a7c8-885d083a837e') throw new Error('current Agent 1 thread mismatch');
  if (value.boundary_question_counts.total_boundary_question_rows !== 6) throw new Error('boundary question row count mismatch');
  if (value.boundary_question_counts.commercial_clean_candidate_questions !== 3) throw new Error('commercial-clean question count mismatch');
  if (value.boundary_question_counts.noncommercial_educational_candidate_questions !== 1) throw new Error('NC question count mismatch');
  if (value.boundary_question_counts.blocked_or_needs_review_questions !== 1) throw new Error('blocked/review question count mismatch');
  if (value.lane_counts_rows.allowed_transform_rows_now !== 0) throw new Error('allowed transform rows must be zero');
  if (value.delivery_state.delivered_to_agent6_now !== false) throw new Error('delivery must be false');
  const klein = value.boundary_questions.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  if (!klein || klein.license_lane !== 'noncommercial_educational_candidate' || klein.current_allowed_now.commercial_export !== false) {
    throw new Error('Klein NC boundary question mismatch');
  }
  const metadata = value.boundary_questions.find((row) => row.license_lane === 'metadata_or_link_only');
  if (!metadata || metadata.rows !== 0) throw new Error('metadata/link-only zero lane mismatch');
  const blocked = value.boundary_questions.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  if (!blocked || blocked.license_lane !== 'blocked_or_needs_review' || blocked.missing_evidence.length < 4) {
    throw new Error('BDB Augmented Strong boundary question mismatch');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeMd(relativePath, value) {
  const rows = value.boundary_questions.map((row) => (
    `| ${row.row_subset_id} | ${row.license_lane} | ${row.rows}/${row.occurrences} | ${row.current_status} | ${row.exact_blocker} |`
  ));
  const lines = [
    '# Agent 1 Old Dictionary Agent 6 Boundary Question Packet - 2026-06-05',
    '',
    `Status: \`${value.status}\``,
    '',
    '## Scope',
    '',
    value.purpose,
    '',
    '## Counts',
    '',
    `- Boundary question rows: ${value.boundary_question_counts.total_boundary_question_rows}.`,
    `- Lane counts: commercial_clean_candidate ${value.lane_counts_rows.commercial_clean_candidate_source_families}, noncommercial_educational_candidate ${value.lane_counts_rows.noncommercial_educational_candidate_source_families}, metadata_or_link_only ${value.lane_counts_rows.metadata_or_link_only_source_families}, blocked_or_needs_review ${value.lane_counts_rows.blocked_or_needs_review_source_families}.`,
    '- Allowed transform, candidate text, answer, public emit, release route, and Agent 6 delivery now: 0.',
    '',
    '## Boundary Questions',
    '',
    '| row subset | lane | rows/occurrences | current status | exact blocker |',
    '| --- | --- | ---: | --- | --- |',
    ...rows,
    '',
    '## Delivery State',
    '',
    `- Delivered to Agent 6 now: ${value.delivery_state.delivered_to_agent6_now}.`,
    `- Reason not delivered: ${value.delivery_state.reason_not_delivered}`,
    `- Inherited delivery blocker: ${value.delivery_state.inherited_delivery_blocker}`,
    '',
    '## Stop Condition',
    '',
    value.stop_condition,
    '',
    '## Boundary',
    '',
    'This is Agent 1 boundary-question evidence only. It does not claim QA, source/license/legal, Definition, runtime, publication, product, answer, accepted text, candidate-text export, release action, queue, staging, render, source-tracking, or NC-commercial authorization.',
    ''
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}
