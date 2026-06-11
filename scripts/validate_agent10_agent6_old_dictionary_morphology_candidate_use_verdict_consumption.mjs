#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-agent6-old-dictionary-morphology-candidate-use-verdict-consumption-2026-06-05.json';

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
  artifact.artifact_type === 'agent10_agent6_old_dictionary_morphology_candidate_use_verdict_consumption',
  'artifact_type mismatch'
);
expect(artifact.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(
  artifact.verdict_consumed === 'reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json',
  'verdict_consumed mismatch'
);
expect(
  artifact.disposition === 'warn_accepted_nonpublic_candidate_use_planning_input_only',
  'disposition must remain WARN accepted for nonpublic candidate-use planning input only'
);
expect(
  artifact.package_workset === 'old_dictionary_morphology_candidate_use_planning_input',
  'package_workset mismatch'
);

const boundary = artifact.accepted_boundary || {};
expect(boundary.rows === 78, 'accepted boundary rows must be 78');
expect(boundary.occurrences === 1461, 'accepted boundary occurrences must be 1461');
expect(
  boundary.row_source_path === 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json',
  'row source path mismatch'
);
expect(boundary.row_source_pointer === 'exact_subset_for_future_question.queue_ids', 'row source pointer mismatch');
expect(boundary.preview_relation_class === 'exact_after_mark_strip', 'preview relation class mismatch');
expect(
  boundary.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'Agent 2 morphology relation status mismatch'
);
expect(boundary.license_lane === 'commercial_clean_candidate', 'license lane mismatch');
expect(boundary.noncommercial_educational_candidate_rows === 0, 'NC rows must remain 0');
expect(
  boundary.permitted_next_step === 'Agent_2_may_author_later_nonpublic_candidate_use_package_over_exact_78_queue_ids_only',
  'permitted next step mismatch'
);

const handoff = artifact.next_handoff || {};
expect(handoff.owner === 'Agent 2', 'next handoff owner must be Agent 2');
expect(
  handoff.requested_artifact === 'non-public old-dictionary morphology candidate-use package over exact 78 queue IDs',
  'requested artifact mismatch'
);
expect(
  handoff.source_ids ===
    'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json exact_subset_for_future_question.queue_ids',
  'source_ids mismatch'
);

for (const field of [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'occurrences',
  'source_family',
  'license_lane',
  'source_rids',
  'morphology_relation_basis',
  'agent2_morphology_relation_status',
  'candidate_use_scope',
  'derived_from_nc',
  'commercial_export_allowed',
  'attribution_required',
  'corpus_contamination',
  'answer_eligible',
  'public_emit',
  'agent6_boundary_required',
]) {
  expect((handoff.required_fields || []).includes(field), `missing required field: ${field}`);
}

for (const gate of [
  'candidate_text_export',
  'definition_lemma_reader_hint_content_storage',
  'transform_execution',
  'answer_eligibility',
  'route_write',
  'public_runtime_mutation',
  'accepted_text',
  'commercial_export',
  'release_action',
]) {
  expect((handoff.must_return_to_agent6_before || []).includes(gate), `missing Agent 6 return gate: ${gate}`);
}

for (const blocker of [
  'candidate_text_export_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'answer_eligibility_blocked',
  'public_runtime_mutation_blocked',
  'route_writes_blocked',
  'accepted_text_blocked',
  'release_action_blocked',
  '219_morphology_blocked_rows_excluded',
  'actual_candidate_use_package_requires_new_agent6_verdict_before_text_storage_transform_output_export_answer_or_runtime_mutation',
]) {
  expect((artifact.blockers_preserved || []).includes(blocker), `missing blocker: ${blocker}`);
}

for (const [key, expected] of [
  ['candidate_text_export', 0],
  ['definition_lemma_reader_hint_content_storage', 0],
  ['answer_eligibility', 0],
  ['public_runtime_mutation', 0],
  ['route_writes', 0],
  ['accepted_text', 0],
  ['release_actions', 0],
  ['source_license_legal_acceptance', 0],
  ['commercial_export_authorization', 0],
]) {
  expect(artifact.zero_counters?.[key] === expected, `zero counter ${key} must be ${expected}`);
}

expect(
  artifact.agent6_boundary_need ===
    'next Agent 6 boundary only after Agent 2 authors an exact non-public candidate-use package; no public/runtime/output/answer/Definition/export/release action is authorized now',
  'Agent 6 boundary need mismatch'
);
expect(
  artifact.stop_condition ===
    'Hand exact 78-ID candidate-use planning input to Agent 2 or preserve this consumption artifact until Agent 2 returns a package or exact blocker.',
  'stop condition mismatch'
);

for (const forbidden of [
  'QA acceptance beyond this docket',
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
  'candidate text export',
  'definition-content storage',
  'commercial export authorization',
  'NC commercial authorization',
  'release action',
]) {
  expect((artifact.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 Agent6 candidate-use verdict consumption validation passed. ` +
    `Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; next owner: ${handoff.owner}.`
);
