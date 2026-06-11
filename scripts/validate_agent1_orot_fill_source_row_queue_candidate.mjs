#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  candidate: 'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.json',
  sourceRowEvidence: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  sourceRowValidator: 'reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json',
  stageCPlan: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.json',
  stageCPlanValidator: 'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.json',
  result: 'reports/agent1-orot-fill-source-row-queue-validator-result-2026-06-03.json'
};

const EXPECTED_TARGETS = [
  'lex-aph-h639',
  'lex-mashiach-h4899',
  'lex-ruach-h7307',
  'lex-yhwh-h3068'
].sort((a, b) => a.localeCompare(b));

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
].sort((a, b) => a.localeCompare(b));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} mismatch`, { actual, expected });
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  for (const key of [
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function assertSummary(summary) {
  assert(summary.target_count === 4, 'expected four target rows');
  assert(summary.chunk_entry_count === 17, 'expected 17 Orot chunk entries');
  assert(summary.token_occurrence_count === 19, 'expected 19 Orot token occurrences');
  assert(summary.targets_with_expected_clean_source_layer_row === 4, 'expected clean source-layer rows for all four targets');
  assert(summary.route_lookup_shard_hit_count === 0, 'expected zero route lookup shard hits');
}

function main() {
  const startedAt = new Date().toISOString();
  const candidate = readJson(PATHS.candidate);
  const evidence = readJson(PATHS.sourceRowEvidence);
  const sourceRowValidator = readJson(PATHS.sourceRowValidator);
  const stageCPlan = readJson(PATHS.stageCPlan);
  const stageCPlanValidator = readJson(PATHS.stageCPlanValidator);

  assert(candidate.artifact_type === 'agent1_orot_fill_source_row_queue_candidate', 'unexpected candidate artifact type');
  assert(candidate.requested_queue_item?.request_id === 'agent6-agent1-orot-fill-source-row-review', 'unexpected request id');
  assert(candidate.requested_queue_item?.submitted_by === 'Agent 5', 'requested queue item must be shaped for Agent 5 relay');
  assert(candidate.requested_queue_item?.agent1_evidence_origin === 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review', 'missing Agent 1 evidence origin');
  assert(candidate.requested_queue_item?.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', 'unexpected candidate status');
  assert(candidate.requested_queue_item?.requested_verdict === 'pass_warn_block_orot_fill_source_row_evidence_only', 'unexpected requested verdict');
  assert(candidate.requested_queue_item?.gate === 'source_provenance_custody_gate/orot_fill_source_row_gate', 'unexpected gate');
  assert(typeof candidate.requested_queue_item?.what_changed_since_last_agent6_ruling === 'string' && candidate.requested_queue_item.what_changed_since_last_agent6_ruling.length > 0, 'missing Agent 6 change-history field');
  assert(candidate.requested_queue_item.what_changed_since_prior_blocker_map === undefined, 'legacy prior-blocker-map field must not replace Agent 6 change-history field');
  assert(sourceRowValidator.ok === true, 'source-row evidence validator must pass');
  assert(stageCPlan.artifact_type === 'agent1_orot_stage_c_source_unblock_plan', 'unexpected Stage C plan artifact type');
  assert(['quarantine_now_clear_after_pipeline_rule_change', 'source_rows_clear_awaiting_agent6_disposition'].includes(stageCPlan.status), 'Stage C plan status mismatch');
  assert(stageCPlanValidator.ok === true, 'Stage C plan validator must pass');
  assert(['block', 'pipeline_source_rows_clear'].includes(evidence.status), 'Orot evidence status must be a known review state');
  assertBoundary(candidate.boundary);
  assertBoundary(evidence.boundary);
  sameSet(sorted(candidate.requested_queue_item.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');

  assertSummary(candidate.current_evidence_summary);
  assert(JSON.stringify(candidate.current_evidence_summary) === JSON.stringify(evidence.summary), 'candidate summary must match Orot evidence summary');
  assert(JSON.stringify(candidate.boundary) === JSON.stringify(evidence.boundary), 'candidate boundary must match Orot evidence boundary');
  if (evidence.status === 'pipeline_source_rows_clear') {
    assert(candidate.current_evidence_summary.incomplete_curated_rows_attached === 0, 'clear state must have zero incomplete curated rows');
    assert(candidate.current_evidence_summary.targets_missing_clean_chunk_attachment === 0, 'clear state must have zero missing clean chunk attachments');
    assert(candidate.current_evidence_blocker === null, 'clear state must not carry an active Orot blocker');
  } else {
    assert(candidate.current_evidence_summary.incomplete_curated_rows_attached > 0, 'block state must have incomplete curated rows');
    assert(candidate.current_evidence_blocker?.blocker_id === 'orot_fill_incomplete_curated_source_rows_attached_to_chunk_entries', 'unexpected Orot blocker id');
  }
  assert(candidate.requested_queue_item.evidence_artifacts.includes('reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.md'), 'Stage C plan markdown must be evidence');
  assert(candidate.requested_queue_item.evidence_artifacts.includes('reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.json'), 'Stage C plan JSON must be evidence');
  assert(candidate.requested_queue_item.evidence_artifacts.includes('reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.json'), 'Stage C plan validator must be evidence');
  assert(candidate.requested_queue_item.known_risks.some((risk) => risk.includes('Stage C') && risk.includes('quarantine-now')), 'Stage C plan risk boundary missing');

  const targetRows = candidate.target_rows || [];
  assert(targetRows.length === 4, 'expected four target rows in candidate');
  sameSet(sorted(targetRows.map((target) => target.entry_id)), EXPECTED_TARGETS, 'target row set');
  for (const target of targetRows) {
    assert(target.expected_clean_source_layer_row_count >= 1, `${target.entry_id} must have clean source-layer row evidence`);
    if (evidence.status === 'pipeline_source_rows_clear') {
      assert(target.exact_incomplete_curated_row_present === false, `${target.entry_id} incomplete curated row must be absent in clear state`);
      assert(target.blocker === null, `${target.entry_id} blocker row must be null in clear state`);
      assert(target.chunk_clean_attachment_status === 'clean_source_row_attached_no_incomplete_curated_row', `${target.entry_id} clear attachment status mismatch`);
    } else {
      assert(target.exact_incomplete_curated_row_present === true, `${target.entry_id} must retain exact incomplete curated row evidence`);
      assert(String(target.blocker || '').startsWith(`curated|${target.entry_id}|`), `${target.entry_id} blocker row mismatch`);
    }
  }

  for (const artifact of candidate.requested_queue_item.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_candidate: PATHS.candidate,
    request_id: candidate.requested_queue_item.request_id,
    summary: candidate.current_evidence_summary,
    blocker: candidate.current_evidence_blocker,
    boundary: candidate.boundary
  };
  writeJson(PATHS.result, result);
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
