#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  plan: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.json',
  planMd: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.md',
  evidence: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  evidenceValidator: 'reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json',
  result: 'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.md'
};

const EXPECTED_TARGETS = [
  'lex-aph-h639',
  'lex-mashiach-h4899',
  'lex-ruach-h7307',
  'lex-yhwh-h3068'
].sort((a, b) => a.localeCompare(b));

const EXPECTED_BLOCKING_ROWS = [
  'curated|lex-aph-h639|source metadata incomplete',
  'curated|lex-mashiach-h4899|source metadata incomplete',
  'curated|lex-ruach-h7307|source metadata incomplete',
  'curated|lex-yhwh-h3068|source metadata incomplete'
].sort((a, b) => a.localeCompare(b));

const EXPECTED_MUST_NOT_ACCEPT = [
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

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
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
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function assertSummary(plan, evidence) {
  assert(plan.current_facts.existing_orot_evidence_validator_ok === true, 'Orot evidence validator must be ok');
  assert(['block', 'pipeline_source_rows_clear'].includes(plan.current_facts.existing_orot_evidence_status), 'Orot evidence status must be a known review state');
  for (const key of [
    'target_count',
    'chunk_entry_count',
    'token_occurrence_count',
    'incomplete_curated_rows_attached',
    'targets_with_expected_clean_source_layer_row',
    'targets_missing_clean_chunk_attachment',
    'route_lookup_shard_hit_count'
  ]) {
    assert(plan.current_facts[key] === evidence.summary[key], `summary mismatch for ${key}`, { plan: plan.current_facts[key], evidence: evidence.summary[key] });
  }
  assert(plan.current_facts.target_count === 4, 'expected four target rows');
  assert(plan.current_facts.chunk_entry_count === 17, 'expected 17 Orot chunk entries');
  assert(plan.current_facts.token_occurrence_count === 19, 'expected 19 Orot token occurrences');
  assert(plan.current_facts.targets_with_expected_clean_source_layer_row === 4, 'expected clean source-layer rows for all four targets');
  assert(plan.current_facts.route_lookup_shard_hit_count === 0, 'expected zero route lookup shard hits');
  if (plan.current_facts.existing_orot_evidence_status === 'pipeline_source_rows_clear') {
    assert(plan.current_facts.incomplete_curated_rows_attached === 0, 'clear state must have zero incomplete curated rows attached');
    assert(plan.current_facts.targets_missing_clean_chunk_attachment === 0, 'clear state must have zero targets missing clean chunk attachment');
  } else {
    assert(plan.current_facts.incomplete_curated_rows_attached === 4, 'expected four incomplete curated rows still attached');
    assert(plan.current_facts.targets_missing_clean_chunk_attachment === 2, 'expected two targets missing clean chunk attachment');
  }
}

function assertScriptProof(plan) {
  const writer = plan.writer_fallback_proof;
  assert(writer.has_entry_source_keys === true, 'writer must still inspect source_row_keys');
  assert(writer.has_fallback_source_row === true, 'writer fallbackSourceRow proof missing');
  assert(writer.has_incomplete_metadata_license === true, 'writer incomplete metadata fallback proof missing');
  assert(writer.has_add_fallback_source_rows === true, 'writer addFallbackSourceRows proof missing');
  assert(writer.fallback_rows_selected_for_possible_entries === true, 'writer possible-entry fallback selection proof missing');

  for (const proof of [
    plan.deploy_denylist_static_proof.reader_hints_script,
    plan.deploy_denylist_static_proof.route_package_script
  ]) {
    assert(proof.exists === true, `${proof.path} must exist`);
    sameSet(proof.default_deny_entries, EXPECTED_TARGETS, `${proof.path} default deny entries`);
    assert(proof.has_generic_incomplete_curated_deny_needle === true, `${proof.path} must deny incomplete curated row needles`);
    assert(proof.has_denylist_output_scan_total === true, `${proof.path} must report denylist output scan total`);
    assert(proof.has_denylist_proof === true, `${proof.path} must write denylist proof`);
    assert(proof.has_denied_token_skip === true, `${proof.path} must skip denied tokens`);
  }
  assert(plan.deploy_denylist_static_proof.output_scan_total_required_before_release_owner_use === true, 'future output scan proof must be required');
}

function renderResultMarkdown(result) {
  return `# Agent 1 Orot Stage C Source Unblock Plan Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated plan: \`${result.validated_plan}\`
- Status: \`${result.status}\`
- Target count: ${result.current_facts?.target_count}
- Incomplete curated rows attached: ${result.current_facts?.incomplete_curated_rows_attached}
- Immediate quarantine route status: \`${result.immediate_quarantine_route_status}\`
- Clearance route status: \`${result.clearance_route_status}\`
- Publication state: \`${result.boundary?.publication_state}\`

This validator confirms source/provenance blocker-route evidence only. It does not accept source/provenance custody, QA, public/runtime, publication, route-publication, Definition, product/data, usage-as-definition, translation output, or accepted translation text.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const plan = readJson(PATHS.plan);
  const evidence = readJson(PATHS.evidence);
  const evidenceValidator = readJson(PATHS.evidenceValidator);

  assert(fs.existsSync(fullPath(PATHS.planMd)), 'plan markdown must exist');
  assert(plan.artifact_type === 'agent1_orot_stage_c_source_unblock_plan', 'unexpected plan artifact type');
  assert(['quarantine_now_clear_after_pipeline_rule_change', 'source_rows_clear_awaiting_agent6_disposition'].includes(plan.status), 'unexpected plan status');
  assert(['block', 'pipeline_source_rows_clear'].includes(evidence.status), 'underlying Orot evidence must be a known review state');
  assert(evidenceValidator.ok === true, 'underlying Orot validator must be ok');
  assertBoundary(plan.boundary);
  sameSet(plan.must_not_accept, EXPECTED_MUST_NOT_ACCEPT, 'must-not-accept list');
  assertSummary(plan, evidence);
  assertScriptProof(plan);

  sameSet(plan.target_rows.map((target) => target.entry_id), EXPECTED_TARGETS, 'target rows');
  sameSet(plan.target_rows.map((target) => target.incomplete_curated_row_id), EXPECTED_BLOCKING_ROWS, 'target blocking rows');
  sameSet(plan.row_dispositions.map((target) => target.blocking_row), EXPECTED_BLOCKING_ROWS, 'row disposition blockers');
  for (const target of plan.target_rows) {
    assert(target.clean_source_layer_rows_available >= 1, `${target.entry_id} must have clean source-layer row evidence`);
    assert(target.can_be_quarantined_now_after_output_scan_proof === true, `${target.entry_id} must be quarantine-capable after output scan proof`);
    if (evidence.status === 'pipeline_source_rows_clear') {
      assert(target.exact_incomplete_curated_row_present === false, `${target.entry_id} incomplete curated row must be absent in clear state`);
      assert(target.can_be_cleared_with_current_pipeline_unchanged === true, `${target.entry_id} must be clear in current chunk evidence`);
    } else {
      assert(target.exact_incomplete_curated_row_present === true, `${target.entry_id} incomplete curated row must remain attached`);
      assert(target.can_be_cleared_with_current_pipeline_unchanged === false, `${target.entry_id} must not be clearable without pipeline change`);
    }
  }
  for (const disposition of plan.row_dispositions) {
    const expectedDisposition = evidence.status === 'pipeline_source_rows_clear'
      ? 'source_rows_clear_awaiting_agent6_disposition'
      : 'quarantine_now_clear_after_pipeline_rule_change';
    assert(disposition.disposition === expectedDisposition, `${disposition.entry_id} disposition mismatch`);
  }

  const expectedQuarantineStatus = evidence.status === 'pipeline_source_rows_clear'
    ? 'not_required_for_current_clear_chunks_but_available_as_release_safety'
    : 'recommended_but_requires_output_scan_proof_before_release_owner_use';
  assert(plan.immediate_quarantine_route.status === expectedQuarantineStatus, 'quarantine route status mismatch');
  assert(plan.immediate_quarantine_route.required_future_proof === 'denylist_output_scan_total: 0 for reader hints and route package outputs', 'future proof requirement mismatch');
  const expectedClearanceStatus = evidence.status === 'pipeline_source_rows_clear'
    ? 'current_chunks_clear_requires_agent6_disposition_before_release'
    : 'blocked_until_pipeline_rule_change_and_followup_validation';
  assert(plan.clearance_route.status === expectedClearanceStatus, 'clearance route status mismatch');
  assert(plan.clearance_route.current_clearance_claimed === false, 'clearance must not be claimed');
  if (evidence.status === 'pipeline_source_rows_clear') {
    assert((plan.remaining_blockers || []).length === 0, 'clear state must have zero remaining blockers');
  } else {
    assert((plan.remaining_blockers || []).length === 4, 'expected four remaining blockers');
    sameSet(plan.remaining_blockers.map((blocker) => blocker.blocking_row), EXPECTED_BLOCKING_ROWS, 'remaining blockers');
  }
  for (const artifact of plan.evidence_inspected || []) {
    if (artifact.endsWith('/*.json')) {
      assert(fs.existsSync(fullPath(artifact.slice(0, -7))), `evidence directory missing: ${artifact}`);
    } else {
      assert(fs.existsSync(fullPath(artifact)), `evidence artifact missing: ${artifact}`);
    }
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_plan: PATHS.plan,
    validated_plan_md: PATHS.planMd,
    status: plan.status,
    current_facts: plan.current_facts,
    immediate_quarantine_route_status: plan.immediate_quarantine_route.status,
    clearance_route_status: plan.clearance_route.status,
    remaining_blocker_count: plan.remaining_blockers.length,
    boundary: plan.boundary
  };
  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, renderResultMarkdown(result));
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
    boundary: {
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      qa_acceptance_claimed: false,
      public_runtime_acceptance_claimed: false
    }
  };
  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, renderResultMarkdown(result));
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
