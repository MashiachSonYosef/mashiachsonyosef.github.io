#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-agent6-boundary-question-packet-validation-result-2026-06-05.json';

const noAcceptanceKeys = [
  'no_qa_acceptance',
  'no_source_license_acceptance',
  'no_legal_acceptance',
  'no_definition_authority',
  'no_runtime_public_acceptance',
  'no_publication_readiness',
  'no_product_data_acceptance',
  'no_answer_acceptance',
  'no_accepted_gloss_text',
  'no_nc_commercial_authorization',
  'no_candidate_text_export_authorization',
  'no_release_action',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

try {
  const packet = readJson(artifactPath);
  const addendum = readJson(packet.inputs.agent1_addendum);
  const downstreamAudit = readJson(packet.inputs.agent1_downstream_alignment_audit);
  const downstreamAuditResult = readJson(packet.inputs.agent1_downstream_alignment_audit_validation_result);
  const planningState = readJson(packet.inputs.agent1_planning_boundary_state);
  const agent10Held = readJson(packet.inputs.agent10_commercial_clean_held_packet);
  const bdbBlocker = readJson(packet.inputs.agent1_bdb_augmented_strong_blocker);

  assert(packet.artifact_type === 'agent1_old_dictionary_agent6_boundary_question_packet', 'unexpected artifact_type');
  assert(packet.status === 'agent1_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use', 'unexpected status');
  assert(packet.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(packet.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 thread mismatch');
  assert(packet.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(addendum.current_thread_id === packet.current_agent1_thread_id, 'Agent 1 addendum thread mismatch');
  assert(downstreamAuditResult.ok === true, 'downstream alignment audit validator must be ok');
  assert(downstreamAudit.status === 'agent1_downstream_consumption_aligned_zero_output_no_acceptance', 'downstream audit status mismatch');
  assert(planningState.agent6_verdict?.disposition === 'WARN-ACCEPTED', 'prior Agent 6 planning verdict mismatch');
  assert(agent10Held.agent6_delivery_state?.delivery_status === 'held_not_delivered_zero_candidate_use_rows_and_agent6_route_unavailable', 'Agent 10 held delivery status mismatch');

  const questions = packet.boundary_questions || [];
  assert(questions.length === 6, 'boundary question row count must be 6');
  assert(packet.boundary_question_counts.total_boundary_question_rows === 6, 'total boundary question count mismatch');
  assert(packet.boundary_question_counts.commercial_clean_candidate_questions === 3, 'commercial-clean question count mismatch');
  assert(packet.boundary_question_counts.noncommercial_educational_candidate_questions === 1, 'NC question count mismatch');
  assert(packet.boundary_question_counts.metadata_or_link_only_question_records === 1, 'metadata/link question count mismatch');
  assert(packet.boundary_question_counts.blocked_or_needs_review_questions === 1, 'blocked question count mismatch');
  assert(packet.boundary_question_counts.future_candidate_use_questions_opened_now === 0, 'future question opened-now count must be 0');
  assert(packet.boundary_question_counts.delivered_to_agent6_now === 0, 'Agent 6 delivery count must be 0');

  const laneCounts = countBy(questions, 'license_lane');
  assert(laneCounts.commercial_clean_candidate === 3, 'commercial-clean lane count mismatch');
  assert(laneCounts.noncommercial_educational_candidate === 1, 'NC lane count mismatch');
  assert(laneCounts.metadata_or_link_only === 1, 'metadata/link-only zero record count mismatch');
  assert(laneCounts.blocked_or_needs_review === 1, 'blocked/review lane count mismatch');

  for (const row of questions) {
    for (const [key, value] of Object.entries(row.current_allowed_now || {})) {
      if (key === 'planning_evidence') assert(value === true, `${row.row_subset_id} planning evidence flag must be true`);
      else assert(value === false, `${row.row_subset_id} current_allowed_now.${key} must be false`);
    }
  }
  const commercialRows = questions.filter((row) => row.license_lane === 'commercial_clean_candidate');
  const expectedCommercial = new Map([
    ['old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary', [210, 4474]],
    ['old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary', [221, 4418]],
    ['old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary', [69, 2048]]
  ]);
  for (const row of commercialRows) {
    const expected = expectedCommercial.get(row.row_subset_id);
    assert(Boolean(expected), `unexpected commercial-clean row: ${row.row_subset_id}`);
    assert(row.rows === expected[0], `commercial-clean row count mismatch: ${row.row_subset_id}`);
    assert(row.occurrences === expected[1], `commercial-clean occurrence count mismatch: ${row.row_subset_id}`);
    assert(row.prerequisites_before_delivery.includes('approved morphology relation for definition/lemma/reader-hint transform'), `commercial-clean morphology prerequisite missing: ${row.row_subset_id}`);
  }

  const klein = questions.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  assert(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein lane mismatch');
  assert(klein.required_flags_to_preserve?.derived_from_nc === true, 'Klein NC flag mismatch');
  assert(klein.required_flags_to_preserve?.commercial_export_allowed === false, 'Klein commercial flag mismatch');
  assert(klein.current_allowed_now?.nc_commercial_authorization === false, 'Klein NC commercial authorization must be false');

  const metadata = questions.find((row) => row.license_lane === 'metadata_or_link_only');
  assert(metadata?.rows === 0, 'metadata/link-only row count must be zero');
  assert(metadata?.exact_blocker === 'metadata_or_link_only_current_row_count_zero', 'metadata/link-only blocker mismatch');

  const blocked = questions.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  assert(blocked?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong lane mismatch');
  assert(blocked.missing_evidence?.length === bdbBlocker.exact_blocker.missing_evidence.length, 'BDB Augmented Strong missing evidence mismatch');
  assert(blocked.repository_candidate_source_file_count === 0, 'BDB Augmented Strong source-file probe count must be 0');

  assert(packet.lane_counts_rows.allowed_transform_rows_now === 0, 'allowed transform rows must be zero');
  assert(packet.lane_counts_rows.candidate_text_rows_now === 0, 'candidate text rows must be zero');
  assert(packet.lane_counts_rows.answer_eligible_rows_now === 0, 'answer eligible rows must be zero');
  assert(packet.lane_counts_rows.public_emit_rows_now === 0, 'public emit rows must be zero');
  assert(packet.lane_counts_rows.release_route_opened_now === 0, 'release route opened rows must be zero');
  assert(packet.delivery_state.delivered_to_agent6_now === false, 'delivered_to_agent6_now must be false');
  assert(packet.delivery_state.direct_route_attempted_now === false, 'direct_route_attempted_now must be false');
  assert(packet.exact_blockers.length === 6, 'exact blocker count mismatch');

  for (const group of Object.values(packet.zero_output_counts || {})) {
    for (const value of Object.values(group || {})) assert(value === 0, 'zero-output counters must remain zero');
  }
  for (const key of noAcceptanceKeys) assert(packet.non_acceptance_boundary?.[key] === true, `missing no-acceptance key: ${key}`);
  assert(packet.overlay_boundary.queue_mutation_performed === false, 'queue mutation must be false');
  assert(packet.overlay_boundary.release_route_opened === false, 'release route opened must be false');
  assert(packet.overlay_boundary.definition_content_created === false, 'definition content created must be false');
  assert(packet.overlay_boundary.answer_content_created === false, 'answer content created must be false');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: packet.status,
    target: packet.target,
    current_agent1_thread_id: packet.current_agent1_thread_id,
    boundary_question_rows: questions.length,
    commercial_clean_candidate_questions: laneCounts.commercial_clean_candidate,
    noncommercial_educational_candidate_questions: laneCounts.noncommercial_educational_candidate,
    metadata_or_link_only_question_records: laneCounts.metadata_or_link_only,
    blocked_or_needs_review_questions: laneCounts.blocked_or_needs_review,
    delivered_to_agent6_now: false,
    allowed_transform_rows_now: packet.lane_counts_rows.allowed_transform_rows_now,
    candidate_text_rows_now: packet.lane_counts_rows.candidate_text_rows_now,
    answer_eligible_rows_now: packet.lane_counts_rows.answer_eligible_rows_now,
    public_emit_rows_now: packet.lane_counts_rows.public_emit_rows_now,
    release_route_opened_now: packet.lane_counts_rows.release_route_opened_now,
    exact_blocker_count: packet.exact_blockers.length,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details ?? null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
}

function countBy(rows, key) {
  return rows.reduce((memo, row) => {
    memo[row[key]] = (memo[row[key]] || 0) + 1;
    return memo;
  }, {});
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}
