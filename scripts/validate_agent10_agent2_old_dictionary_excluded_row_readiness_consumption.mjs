#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json');
const packet = readJson(artifactPath);
const issues = [];

expect(packet.schema_version === 1, 'schema_version must be 1');
expect(packet.artifact_type === 'agent10_agent2_old_dictionary_excluded_row_readiness_consumption', 'artifact_type mismatch');
expect(packet.status === 'release_owner_consumed_nonpublic_readiness_no_agent6_route_ready', 'status mismatch');
expect(packet.release_owner === 'Agent 10', 'release_owner must be Agent 10');

for (const relativePath of packet.inputs_consumed || []) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `input missing: ${relativePath}`);
}

const counts = packet.counts || {};
expect(counts.source_family_rows === 5, 'source_family_rows must be 5');
expect(counts.commercial_clean_candidate_source_families === 3, 'commercial clean count must be 3');
expect(counts.noncommercial_educational_candidate_source_families === 1, 'NC count must be 1');
expect(counts.metadata_or_link_only_source_families === 0, 'metadata/link-only count must be 0');
expect(counts.blocked_or_needs_review_source_families === 1, 'blocked count must be 1');
expect(counts.allowed_transform_rows_now === 0, 'allowed transform rows now must be 0');
expect(counts.definition_candidate_rows_now === 0, 'definition candidate rows now must be 0');
expect(counts.lemma_candidate_rows_now === 0, 'lemma candidate rows now must be 0');
expect(counts.reader_hint_candidate_rows_now === 0, 'reader hint candidate rows now must be 0');
expect(counts.candidate_text_rows_now === 0, 'candidate text rows now must be 0');
expect(counts.answer_eligible_rows_now === 0, 'answer eligible rows now must be 0');
expect(counts.public_emit_rows_now === 0, 'public emit rows now must be 0');

const lane = packet.lane_split || {};
expect(lane.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
expect(lane.commercial_clean_and_nc_separated === true, 'commercial/NC separation must be true');
expect(lane.nc_row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary', 'NC row subset mismatch');
expect(lane.nc_derived_from_nc === true, 'NC derived_from_nc must be true');
expect(lane.nc_commercial_export_allowed === false, 'NC commercial_export_allowed must be false');
expect(lane.nc_attribution_required === true, 'NC attribution_required must be true');
expect(lane.blocked_row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong', 'blocked row subset mismatch');
expect(lane.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate text consumption must be 0');

expect(Array.isArray(packet.validator_results) && packet.validator_results.length === 2, 'validator_results length must be 2');
for (const result of packet.validator_results || []) {
  expect(result.result === 'passed', `validator did not pass: ${result.command}`);
}

expect((packet.exact_blockers || []).length === 5, 'exact blocker count must be 5');
expect(packet.exact_blockers.includes('old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization'), 'Klein NC blocker missing');
expect(packet.exact_blockers.includes('old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis'), 'BDB Augmented Strong blocker missing');
expect(packet.agent6_boundary_question === null, 'agent6_boundary_question must be null');
expect(/No Agent 6 route is opened/.test(packet.agent6_boundary_reason || ''), 'Agent 6 non-route reason missing');

for (const [key, value] of Object.entries(packet.zero_counters || {})) {
  expect(value === 0, `zero_counters.${key} must be 0`);
}

for (const claim of [
  'Definition authority',
  'answer eligibility',
  'accepted gloss/text',
  'public reader output',
  'public/runtime mutation',
  'candidate text export',
  'NC commercial authorization',
  'release action',
]) {
  expect(packet.forbidden_claims?.includes(claim), `forbidden_claims missing ${claim}`);
}

expect(/No Definition/.test(packet.highest_permissible_claim || ''), 'highest permissible claim must reject Definition authority');
expect(/No .*release action/.test(packet.highest_permissible_claim || ''), 'highest permissible claim must reject release action');

if (issues.length) {
  console.error(`Agent10 Agent2 old-dictionary excluded-row readiness consumption validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent10 Agent2 old-dictionary excluded-row readiness consumption validation passed. Release route opened: 0; candidate rows: 0; NC lane preserved.');

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
