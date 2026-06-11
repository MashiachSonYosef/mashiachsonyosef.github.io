#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json';

const requiredNoAcceptanceKeys = [
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
  const audit = readJson(artifactPath);
  const addendum = readJson(audit.inputs.agent1_addendum);
  const handoff = readJson(audit.inputs.agent1_agent2_handoff);
  const exportPartitions = readJson(audit.inputs.agent1_export_partitions);
  const prep = readJson(audit.inputs.agent2_consumption_prep);
  const readiness = readJson(audit.inputs.agent2_transform_readiness_matrix);
  const agent10 = readJson(audit.inputs.agent10_readiness_consumption);

  assert(audit.artifact_type === 'agent1_old_dictionary_downstream_consumption_alignment_audit', 'unexpected artifact_type');
  assert(audit.status === 'agent1_downstream_consumption_aligned_zero_output_no_acceptance', 'unexpected status');
  assert(audit.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(audit.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 thread mismatch');
  assert(audit.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(addendum.status === 'agent1_source_license_custody_registry_addendum_validated_overlay_only', 'Agent 1 addendum status mismatch');

  assert(handoff.counts.agent2_transform_allowed_now_rows === 0, 'Agent 1 handoff transform rows must be zero');
  assert(exportPartitions.partition_counts.commercial_clean_candidate.source_family_count === 3, 'export partition commercial-clean count mismatch');
  assert(exportPartitions.partition_counts.noncommercial_educational_candidate.source_family_count === 1, 'export partition NC count mismatch');
  assert(exportPartitions.partition_counts.metadata_or_link_only.source_family_count === 0, 'export partition metadata/link count mismatch');
  assert(exportPartitions.partition_counts.blocked_or_needs_review.source_family_count === 1, 'export partition blocked count mismatch');

  assert(prep.current_agent1_thread_id === audit.current_agent1_thread_id, 'Agent 2 prep current Agent 1 thread mismatch');
  assert(readiness.current_agent1_thread_id === audit.current_agent1_thread_id, 'Agent 2 readiness current Agent 1 thread mismatch');
  assert(agent10.lane_split.current_agent1_thread_id === audit.current_agent1_thread_id, 'Agent 10 current Agent 1 thread mismatch');
  assert(prep.observed_counts.source_family_count === 5, 'Agent 2 prep source family count mismatch');
  assert(readiness.matrix_counts.source_family_rows === 5, 'Agent 2 readiness row count mismatch');
  assert(agent10.counts.source_family_rows === 5, 'Agent 10 consumed row count mismatch');
  assert(readiness.matrix_counts.allowed_transform_rows_now === 0, 'Agent 2 allowed transform rows must be zero');
  assert(agent10.counts.allowed_transform_rows_now === 0, 'Agent 10 allowed transform rows must be zero');
  assert(agent10.status === 'release_owner_consumed_nonpublic_readiness_no_agent6_route_ready', 'Agent 10 status mismatch');

  const matrixRows = readiness.matrix_rows || [];
  const auditRows = audit.lane_alignment_rows || [];
  assert(matrixRows.length === 5, 'matrix row count mismatch');
  assert(auditRows.length === 5, 'audit row count mismatch');
  for (const row of matrixRows) {
    const auditRow = auditRows.find((candidate) => candidate.row_subset_id === row.row_subset_id);
    assert(auditRow, `missing audit row: ${row.row_subset_id}`);
    assert(auditRow.license_lane === row.license_lane, `audit lane mismatch: ${row.row_subset_id}`);
    assert(auditRow.allowed_transform_now === false, `audit transform flag must be false: ${row.row_subset_id}`);
    assert(row.allowed_transform_now === false, `matrix transform flag must be false: ${row.row_subset_id}`);
    assert(row.candidate_text_rows_now === 0, `candidate text rows must be zero: ${row.row_subset_id}`);
    assert(row.definition_content_rows_now === 0, `definition content rows must be zero: ${row.row_subset_id}`);
    assert(row.accepted_gloss_text_rows_now === 0, `accepted gloss rows must be zero: ${row.row_subset_id}`);
  }

  const laneCounts = countBy(auditRows, 'license_lane');
  assert(laneCounts.commercial_clean_candidate === 3, 'commercial-clean lane count mismatch');
  assert(laneCounts.noncommercial_educational_candidate === 1, 'NC lane count mismatch');
  assert((laneCounts.metadata_or_link_only || 0) === 0, 'metadata/link-only lane count mismatch');
  assert(laneCounts.blocked_or_needs_review === 1, 'blocked/review lane count mismatch');

  const klein = auditRows.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
  assert(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein lane mismatch');
  assert(klein?.derived_from_nc === true, 'Klein NC flag mismatch');
  assert(klein?.commercial_export_allowed === false, 'Klein commercial export must be false');
  assert(klein?.attribution_required === true, 'Klein attribution flag mismatch');
  assert(klein?.corpus_contamination === false, 'Klein corpus contamination flag mismatch');

  const augmented = auditRows.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  assert(augmented?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong lane mismatch');
  assert(augmented?.commercial_export_allowed === false, 'BDB Augmented Strong commercial export must be false');
  assert(augmented?.allowed_transform_now === false, 'BDB Augmented Strong transform must be false');

  assert(Array.isArray(audit.exact_blockers) && audit.exact_blockers.length === 5, 'exact blocker count mismatch');
  assert(audit.exact_blockers.every((blocker) => readiness.exact_blockers.includes(blocker)), 'audit blockers must match readiness blockers');
  assert(agent10.exact_blockers.length === 5, 'Agent 10 exact blocker count mismatch');
  assert(agent10.agent6_boundary_reason.includes('zero candidate text'), 'Agent 10 Agent 6 boundary reason must preserve zero candidate text');

  for (const [groupName, group] of Object.entries(audit.zero_output_counts || {})) {
    for (const [key, value] of Object.entries(group || {})) {
      assert(value === 0, `zero-output count must be zero: ${groupName}.${key}`);
    }
  }
  assert(audit.preserved_lane_rules.noncommercial_educational_candidate_preserved_separately === true, 'NC separate lane rule missing');
  assert(audit.preserved_lane_rules.nc_commercial_authorization_rows === 0, 'NC commercial authorization rows must be zero');
  assert(audit.overlay_boundary.agent2_artifacts_mutated_by_agent1 === false, 'Agent 2 mutation flag must be false');
  assert(audit.overlay_boundary.agent10_artifacts_mutated_by_agent1 === false, 'Agent 10 mutation flag must be false');
  assert(audit.overlay_boundary.release_route_opened === false, 'release route opened flag must be false');
  for (const key of requiredNoAcceptanceKeys) {
    assert(audit.non_acceptance_boundary[key] === true, `missing no-acceptance key: ${key}`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: audit.status,
    target: audit.target,
    current_agent1_thread_id: audit.current_agent1_thread_id,
    source_family_rows: audit.downstream_alignment_counts.agent2_readiness_source_family_rows,
    commercial_clean_candidate_source_families: laneCounts.commercial_clean_candidate,
    noncommercial_educational_candidate_source_families: laneCounts.noncommercial_educational_candidate,
    metadata_or_link_only_source_families: laneCounts.metadata_or_link_only || 0,
    blocked_or_needs_review_source_families: laneCounts.blocked_or_needs_review,
    allowed_transform_rows_now: readiness.matrix_counts.allowed_transform_rows_now,
    candidate_text_rows_now: readiness.matrix_counts.candidate_text_rows_now,
    answer_eligible_rows_now: readiness.matrix_counts.answer_eligible_rows_now,
    public_emit_rows_now: readiness.matrix_counts.public_emit_rows_now,
    release_route_opened_now: audit.downstream_alignment_counts.release_route_opened_now,
    exact_blocker_count: audit.exact_blockers.length,
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
