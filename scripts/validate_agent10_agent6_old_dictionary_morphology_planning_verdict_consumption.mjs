#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-agent6-old-dictionary-morphology-planning-verdict-consumption-2026-06-05.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const artifact = readJson(artifactPath);

expect(
  artifact.artifact_type === 'agent10_agent6_old_dictionary_morphology_planning_verdict_consumption',
  'unexpected artifact_type'
);
expect(artifact.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(
  artifact.disposition === 'warn_accepted_nonpublic_morphology_planning_evidence_only',
  'disposition must remain planning-only WARN acceptance'
);
expect(
  artifact.consumed_docket_json === 'reports/agent6-old-dictionary-morphology-planning-boundary-verdict-2026-06-05.json',
  'consumed Agent6 verdict JSON mismatch'
);

const boundary = artifact.accepted_planning_boundary || {};
expect(boundary.rows === 78, 'accepted planning rows must be 78');
expect(boundary.occurrences === 1461, 'accepted planning occurrences must be 1461');
expect(boundary.selector_preview_relation_class === 'exact_after_mark_strip', 'selector relation class mismatch');
expect(
  boundary.selector_agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'selector morphology status mismatch'
);
expect(boundary.nc_rows_in_reviewed_subset === 0, 'NC rows must be 0');
expect(boundary.blocked_rows_preserved_outside_subset === 219, 'blocked rows outside subset must be 219');
expect(boundary.prefix_or_clitic_possible_rows_blocked === 129, 'prefix/clitic blocked rows must be 129');
expect(boundary.needs_morphology_disambiguation_rows_blocked === 90, 'needs-disambiguation rows must be 90');
expect(boundary.forbidden_flag_rows_observed === 0, 'forbidden flag rows must be 0');

expect(Array.isArray(artifact.validators_reported_passed) && artifact.validators_reported_passed.length === 4, 'expected four validators_reported_passed');

const zero = artifact.zero_counters || {};
for (const key of [
  'candidate_use_rows',
  'transform_rows',
  'candidate_text_rows',
  'definition_candidate_rows',
  'lemma_candidate_rows',
  'reader_hint_candidate_rows',
  'definition_content_rows',
  'candidate_text_export_rows',
  'answer_rows',
  'answer_eligible_rows',
  'public_reader_output_rows',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
  'accepted_gloss_text_rows',
  'accepted_text_rows',
  'release_rows',
]) {
  expect(zero[key] === 0, `${key} must be 0`);
}

for (const blocker of [
  'missing_exact_agent6_row_subset_boundary_for_candidate_use',
  'missing_agent10_exact_agent6_candidate_use_packet_for_the_specific_planning_rows',
  'definition_lane_must_still_emit_no_public_or_answer_acceptance',
  'prefix_or_clitic_possible_requires_morphology_disambiguation',
  'needs_morphology_disambiguation',
]) {
  expect((artifact.exact_blockers_preserved || []).includes(blocker), `missing blocker: ${blocker}`);
}

for (const forbidden of [
  'source/provenance acceptance',
  'license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'translation output',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'definition-content storage',
  'candidate text consumption/export',
  'commercial export permission',
  'NC commercial authorization',
  'release action',
]) {
  expect((artifact.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 Agent6 old-dictionary morphology planning verdict consumption validation passed. ` +
    `Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; candidate-use rows: ${zero.candidate_use_rows}.`
);
