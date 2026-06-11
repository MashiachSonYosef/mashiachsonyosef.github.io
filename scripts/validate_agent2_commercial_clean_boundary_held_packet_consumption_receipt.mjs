#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_commercial_clean_boundary_held_packet_consumption_receipt', 'artifact_type mismatch');
expect(receipt.status === 'held_agent10_agent6_boundary_packet_consumed_as_nonpublic_readiness_evidence_only', 'status mismatch');
expect(receipt.source_lane_owner?.agent_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 owner missing');
expect(receipt.consumed_packet === 'reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json', 'consumed packet mismatch');

expect(receipt.commercial_clean_scope?.source_family_count === 3, 'commercial-clean source family count must be 3');
expect(receipt.commercial_clean_scope?.row_count === 500, 'commercial-clean row count must be 500');
expect(receipt.commercial_clean_scope?.occurrence_count === 10940, 'commercial-clean occurrence count must be 10940');
expect(receipt.commercial_clean_scope?.transform_allowed_now === false, 'transform must not be allowed now');
expect(Array.isArray(receipt.commercial_clean_scope?.row_subset_ids), 'commercial-clean subset ids missing');
for (const expected of [
  'old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary',
  'old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary',
]) {
  expect(receipt.commercial_clean_scope.row_subset_ids.includes(expected), `missing commercial-clean subset: ${expected}`);
}

const excluded = receipt.excluded_lanes || [];
expect(excluded.length === 2, 'excluded lanes must contain exactly NC and blocked rows');
const klein = excluded.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary');
expect(klein?.license_lane === 'noncommercial_educational_candidate', 'Klein lane must remain NC educational');
expect(klein?.derived_from_nc === true, 'Klein derived_from_nc must be true');
expect(klein?.commercial_export_allowed === false, 'Klein commercial export must remain false');
expect(klein?.attribution_required === true, 'Klein attribution must remain required');
const bdbAug = excluded.find((row) => row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
expect(bdbAug?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must remain blocked/review');
expect(bdbAug?.commercial_export_allowed === false, 'BDB Augmented Strong export must remain false');

expect(receipt.agent6_delivery_state?.delivery_status === 'held_not_delivered_zero_candidate_use_rows_and_agent6_route_unavailable', 'Agent 6 held delivery status mismatch');
expect(receipt.agent6_delivery_state?.exact_delivery_blocker === 'no_current_agent6_route_from_readiness_only_zero_candidate_use_rows; agent6_known_thread_not_found_for_direct_wait_or_delivery', 'Agent 6 delivery blocker mismatch');
for (const blocker of [
  'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
  'missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform',
  'klein_dictionary_remains_noncommercial_educational_candidate_no_commercial_export_authorization',
  'bdb_augmented_strong_remains_blocked_or_needs_review_missing_independent_source_license_custody_basis',
]) {
  expect(receipt.current_blockers?.includes(blocker), `missing blocker: ${blocker}`);
}

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

expect(receipt.allowed_action_now === 'carry_nonpublic_transform_readiness_planning_evidence_only', 'allowed action must be readiness planning evidence only');
for (const forbidden of [
  'Definition authority',
  'answer acceptance',
  'public/runtime mutation',
  'candidate text export',
  'definition-content storage',
  'NC commercial authorization',
  'release action',
]) {
  expect(receipt.forbidden_actions?.includes(forbidden), `forbidden action missing: ${forbidden}`);
}
expect(receipt.stop_condition?.includes('Do not author transform candidates'), 'stop condition must block transform candidates');
expect(receipt.stop_condition?.includes('exact Agent 6 row/subset boundary and approved morphology relation'), 'stop condition must require Agent 6 boundary and morphology relation');

if (issues.length) {
  console.error(`Agent 2 commercial-clean boundary held packet consumption receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 commercial-clean boundary held packet consumption receipt validation passed. Transform rows: 0; commercial-clean subsets held: 3; NC separated.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
