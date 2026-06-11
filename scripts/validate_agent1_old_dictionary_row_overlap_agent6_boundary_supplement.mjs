#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-validation-result-2026-06-05.json';

const expectedRows = {
  commercial_clean_only: { rows: 18, occurrences: 494 },
  commercial_clean_plus_noncommercial_educational: { rows: 57, occurrences: 818 },
  commercial_clean_plus_blocked_review: { rows: 82, occurrences: 1068 },
  commercial_clean_plus_noncommercial_educational_plus_blocked_review: { rows: 140, occurrences: 3367 },
  noncommercial_educational_only: { rows: 17, occurrences: 259 },
  blocked_review_only: { rows: 0, occurrences: 0 },
  metadata_or_link_only: { rows: 0, occurrences: 0 },
  no_sefaria_source_hit: { rows: 186, occurrences: 2421 }
};

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

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(fullPath(relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

try {
  const artifact = readJson(artifactPath);
  const rowOverlap = readJson(artifact.inputs.rowOverlapBoundary);
  const rowOverlapResult = readJson(artifact.inputs.rowOverlapBoundaryValidationResult);
  const priorAgent6Packet = readJson(artifact.inputs.agent6BoundaryQuestionPacket);

  assert(artifact.artifact_type === 'agent1_old_dictionary_row_overlap_agent6_boundary_supplement', 'unexpected artifact_type');
  assert(artifact.status === 'row_overlap_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['rowOverlapBoundary', 'rowOverlapBoundaryValidationResult', 'agent6BoundaryQuestionPacket', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(rowOverlap.artifact_type === 'agent1_old_dictionary_row_overlap_lane_boundary', 'row-overlap input mismatch');
  assert(rowOverlapResult.ok === true, 'row-overlap validator result must be ok');
  assert(priorAgent6Packet.boundary_question_counts.delivered_to_agent6_now === 0, 'prior Agent 6 packet must have zero delivery');

  const records = artifact.boundary_questions || [];
  assert(records.length === 8, 'boundary question record count mismatch');
  assert(artifact.boundary_question_counts.total_boundary_question_records === 8, 'total boundary count mismatch');
  assert(artifact.boundary_question_counts.nonzero_boundary_question_records === 6, 'nonzero boundary count mismatch');
  assert(artifact.boundary_question_counts.zero_row_boundary_records === 2, 'zero-row boundary count mismatch');
  assert(artifact.boundary_question_counts.total_rows_represented === 500, 'represented row count mismatch');
  assert(artifact.boundary_question_counts.total_occurrences_represented === 8427, 'represented occurrence count mismatch');
  assert(artifact.boundary_question_counts.delivered_to_agent6_now === 0, 'Agent 6 delivery must be zero');
  assert(artifact.boundary_question_counts.future_candidate_use_questions_opened_now === 0, 'future candidate-use questions opened now must be zero');

  const byBucket = new Map(records.map((row) => [row.row_overlap_bucket, row]));
  for (const [bucket, expected] of Object.entries(expectedRows)) {
    const row = byBucket.get(bucket);
    assert(row, `missing boundary record for ${bucket}`);
    assert(row.rows === expected.rows, `${bucket} rows mismatch`, row);
    assert(row.occurrences === expected.occurrences, `${bucket} occurrences mismatch`, row);
    assert(typeof row.exact_blocker === 'string' && row.exact_blocker.length > 0, `${bucket} exact blocker missing`);
    for (const [key, value] of Object.entries(row.current_allowed_now || {})) {
      if (key === 'planning_evidence') {
        assert(value === true, `${bucket} planning evidence should be true`);
      } else {
        assert(value === false, `${bucket} ${key} must be false`);
      }
    }
  }

  assert(byBucket.get('commercial_clean_only').classification_lanes.includes('commercial_clean_candidate'), 'commercial-only lane missing');
  assert(byBucket.get('commercial_clean_plus_noncommercial_educational').classification_lanes.includes('noncommercial_educational_candidate'), 'commercial+NC lane missing NC');
  assert(byBucket.get('commercial_clean_plus_blocked_review').classification_lanes.includes('blocked_or_needs_review'), 'commercial+blocked lane missing blocked');
  assert(byBucket.get('commercial_clean_plus_noncommercial_educational_plus_blocked_review').classification_lanes.length === 3, 'triple-overlap lane count mismatch');
  assert(byBucket.get('noncommercial_educational_only').classification_lanes.length === 1, 'NC-only lane count mismatch');
  assert(byBucket.get('noncommercial_educational_only').classification_lanes[0] === 'noncommercial_educational_candidate', 'NC-only lane must remain NC');
  assert(byBucket.get('metadata_or_link_only').classification_lanes[0] === 'metadata_or_link_only', 'metadata/link-only lane mismatch');

  assert((artifact.exact_blockers || []).length === records.length, 'exact blocker rows mismatch');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization'), 'NC exact blocker missing');
  assert(artifact.exact_blockers.some((row) => row.blocker === 'no_sefaria_source_hit_missing_source_license_custody_evidence'), 'no-source-hit blocker missing');

  assert(artifact.lane_counts_rows.audited_rows === 500, 'lane count audited rows mismatch');
  assert(artifact.lane_counts_rows.commercial_clean_candidate_evidence_rows === 297, 'commercial evidence rows mismatch');
  assert(artifact.lane_counts_rows.noncommercial_educational_candidate_evidence_rows === 214, 'NC evidence rows mismatch');
  assert(artifact.lane_counts_rows.blocked_or_needs_review_evidence_rows === 222, 'blocked/review evidence rows mismatch');
  assert(artifact.lane_counts_rows.metadata_or_link_only_rows === 0, 'metadata/link-only row count mismatch');
  assert(artifact.lane_counts_rows.multi_lane_overlap_rows === 279, 'multi-lane overlap rows mismatch');
  assert(artifact.lane_counts_rows.allowed_transform_rows_now === 0, 'allowed transform rows must be zero');
  assert(artifact.lane_counts_rows.candidate_text_rows_now === 0, 'candidate text rows must be zero');
  assert(artifact.lane_counts_rows.agent6_delivery_now === 0, 'Agent 6 delivery rows must be zero');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `${key} must be true`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    boundary_question_counts: artifact.boundary_question_counts,
    exact_blocker_count: artifact.exact_blockers.length,
    no_acceptance_claims: true,
    zero_output_counts: artifact.zero_output_counts
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
