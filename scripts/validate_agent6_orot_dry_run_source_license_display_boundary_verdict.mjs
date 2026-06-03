import fs from 'node:fs';

const paths = {
  dryRun: 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.json',
  patch: 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json',
  request: 'reports/agent10-agent1-ready-orot-dry-run-source-license-display-review-request-2026-06-03.json',
  agent1: 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json',
  agent13: 'reports/agent13-orot-reader-hint-candidate-label-policy-decision-2026-06-03.md',
  prevAgent6: 'reports/agent6-orot-reader-hint-candidate-patch-verdict-2026-06-03.json',
  verdictJson: 'reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.json',
  verdictMd: 'reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.md'
};

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertArrayEmpty(value, message) {
  assert(Array.isArray(value), `${message}: expected array`);
  assertEqual(value.length, 0, message);
}

function assertZeroOutputs(outputs, label) {
  assertEqual(outputs.answer_rows_emitted, 0, `${label} answer_rows_emitted`);
  assertEqual(outputs.source_rows_emitted, 0, `${label} source_rows_emitted`);
  assertEqual(outputs.public_hud_rows_emitted, 0, `${label} public_hud_rows_emitted`);
  assertEqual(outputs.route_jsonl_rows_emitted, 0, `${label} route_jsonl_rows_emitted`);
  assertArrayEmpty(outputs.runtime_files_touched, `${label} runtime_files_touched`);
  assertArrayEmpty(outputs.source_files_touched, `${label} source_files_touched`);
  assertArrayEmpty(outputs.token_index_files_touched, `${label} token_index_files_touched`);
  assertArrayEmpty(outputs.lexical_payload_files_touched, `${label} lexical_payload_files_touched`);
}

for (const path of Object.values(paths)) {
  assert(fs.existsSync(path), `missing required file: ${path}`);
}

const dryRun = readJson(paths.dryRun);
const patch = readJson(paths.patch);
const request = readJson(paths.request);
const agent1 = readJson(paths.agent1);
const prevAgent6 = readJson(paths.prevAgent6);
const verdict = readJson(paths.verdictJson);
const verdictMd = fs.readFileSync(paths.verdictMd, 'utf8');
const agent13Md = fs.readFileSync(paths.agent13, 'utf8');

assertEqual(dryRun.artifact_type, 'agent2_orot_reader_hint_candidate_patch_dry_run', 'dry-run artifact_type');
assertEqual(dryRun.dry_run_scope.rows, 31, 'dry-run rows');
assertEqual(dryRun.dry_run_scope.occurrences, 1202, 'dry-run occurrences');
assertEqual(dryRun.dry_run_scope.prefix_stem_rows, 12, 'dry-run prefix_stem_rows');
assertEqual(dryRun.dry_run_scope.prefix_stem_occurrences, 178, 'dry-run prefix_stem_occurrences');
assertEqual(dryRun.dry_run_scope.project_preferred_rows, 19, 'dry-run project_preferred_rows');
assertEqual(dryRun.dry_run_scope.project_preferred_occurrences, 1024, 'dry-run project_preferred_occurrences');
assertEqual(dryRun.zero_or_safe_result.status, 'zero_or_safe_non_public_dry_run_confirmed', 'dry-run status');
assertEqual(dryRun.zero_or_safe_result.blocker_count, 0, 'dry-run blocker count');
assertEqual(dryRun.flags.public_hud_rows_emitted, 0, 'dry-run public_hud_rows_emitted');
assertEqual(dryRun.flags.route_jsonl_rows_emitted, 0, 'dry-run route_jsonl_rows_emitted');
assertEqual(dryRun.flags.runtime_files_touched, 0, 'dry-run runtime_files_touched');
assertEqual(dryRun.flags.source_files_touched, 0, 'dry-run source_files_touched');
assertEqual(dryRun.flags.answer_eligible_true, 0, 'dry-run answer_eligible_true');
assertEqual(dryRun.flags.promote_to_answer_true, 0, 'dry-run promote_to_answer_true');
assertEqual(dryRun.flags.approved_for_public_emit_true, 0, 'dry-run approved_for_public_emit_true');
assertEqual(dryRun.flags.public_emit_ready_true, 0, 'dry-run public_emit_ready_true');
assertEqual(dryRun.flags.would_modify_public_hud_true, 0, 'dry-run would_modify_public_hud_true');
assertEqual(dryRun.flags.would_write_allowed_now_true, 0, 'dry-run would_write_allowed_now_true');
assertArrayEmpty(
  dryRun.source_and_route_family_recount.forbidden_jastrow_bdb_bdb_aramaic_or_sefaria_hits,
  'dry-run forbidden Sefaria-family hits'
);

assertEqual(patch.artifact_type, 'agent2_orot_reader_hint_candidate_patch', 'candidate patch artifact_type');
assertEqual(patch.summary.candidate_patch_rows, 31, 'candidate patch rows');
assertEqual(patch.summary.candidate_patch_occurrences, 1202, 'candidate patch occurrences');
assertEqual(patch.summary.approved_rows, 0, 'candidate patch approved_rows');
assertEqual(patch.summary.public_emit_ready_rows, 0, 'candidate patch public_emit_ready_rows');
assertEqual(patch.summary.answer_eligible_rows, 0, 'candidate patch answer_eligible_rows');
assertEqual(patch.summary.promote_to_answer_rows, 0, 'candidate patch promote_to_answer_rows');
assertEqual(patch.summary.public_hud_rows_emitted, 0, 'candidate patch public_hud_rows_emitted');
assertEqual(patch.summary.route_jsonl_rows_emitted, 0, 'candidate patch route_jsonl_rows_emitted');
assertEqual(patch.summary.match_percent_available_rows, 0, 'candidate patch match_percent_available_rows');
assertEqual(patch.summary.match_percent_missing_rows, 31, 'candidate patch match_percent_missing_rows');
assertEqual(patch.candidate_patch_rows.length, 31, 'candidate_patch_rows length');

assertEqual(request.artifact_type, 'agent10_agent1_ready_orot_dry_run_source_license_display_review_request', 'Agent 10 request artifact_type');
assertEqual(request.summary.candidate_rows, 31, 'Agent 10 request candidate_rows');
assertEqual(request.summary.candidate_occurrences, 1202, 'Agent 10 request candidate_occurrences');
assertEqual(request.summary.unique_source_rows_for_review, 49, 'Agent 10 request unique_source_rows_for_review');
assertEqual(request.row_review_requests.length, 31, 'Agent 10 request row_review_requests length');
assertEqual(request.source_row_review_requests.length, 49, 'Agent 10 request source_row_review_requests length');
assertEqual(request.summary.public_hud_rows_emitted, 0, 'Agent 10 request public_hud_rows_emitted');
assertEqual(request.summary.route_jsonl_rows_emitted, 0, 'Agent 10 request route_jsonl_rows_emitted');
assertEqual(request.summary.runtime_files_touched, 0, 'Agent 10 request runtime_files_touched');
assertEqual(request.summary.source_files_touched, 0, 'Agent 10 request source_files_touched');

assertEqual(agent1.artifact_type, 'agent1_orot_dry_run_source_license_display_review', 'Agent 1 artifact_type');
assertEqual(agent1.summary.candidate_rows, 31, 'Agent 1 candidate_rows');
assertEqual(agent1.summary.candidate_occurrences, 1202, 'Agent 1 candidate_occurrences');
assertEqual(agent1.summary.source_rows_reviewed, 49, 'Agent 1 source_rows_reviewed');
assertEqual(agent1.summary.selected_row_status_counts.allowed, 20, 'Agent 1 allowed selected rows');
assertEqual(agent1.summary.selected_row_status_counts.external_link_only, 10, 'Agent 1 external_link_only selected rows');
assertEqual(agent1.summary.selected_row_status_counts.metadata_only, 1, 'Agent 1 metadata_only selected rows');
assertEqual(agent1.summary.selected_occurrence_status_counts.allowed, 1033, 'Agent 1 allowed selected occurrences');
assertEqual(agent1.summary.selected_occurrence_status_counts.external_link_only, 145, 'Agent 1 external_link_only selected occurrences');
assertEqual(agent1.summary.selected_occurrence_status_counts.metadata_only, 24, 'Agent 1 metadata_only selected occurrences');
assertEqual(agent1.summary.source_row_status_counts.allowed, 12, 'Agent 1 allowed source rows');
assertEqual(agent1.summary.source_row_status_counts.external_link_only, 36, 'Agent 1 external_link_only source rows');
assertEqual(agent1.summary.source_row_status_counts.metadata_only, 1, 'Agent 1 metadata_only source rows');
assertEqual(agent1.summary.selected_rows_with_display_storage_blockers, 11, 'Agent 1 selected_rows_with_display_storage_blockers');
assertEqual(agent1.summary.source_rows_with_local_bounded_evidence_present, 49, 'Agent 1 source_rows_with_local_bounded_evidence_present');
assertEqual(agent1.summary.source_rows_missing_local_bounded_evidence, 0, 'Agent 1 source_rows_missing_local_bounded_evidence');
assertEqual(agent1.summary.agent1_review_ready_for_agent6, true, 'Agent 1 ready for Agent 6');
assertEqual(agent1.summary.public_mutation_allowed_now, false, 'Agent 1 public mutation allowed now');
assertZeroOutputs(agent1.outputs, 'Agent 1 outputs');

assertEqual(prevAgent6.disposition, 'warn_accepted', 'previous Agent 6 disposition');
assertEqual(prevAgent6.public_mutation_blocked, true, 'previous Agent 6 public_mutation_blocked');
assertEqual(prevAgent6.answer_eligibility_authorized, false, 'previous Agent 6 answer_eligibility_authorized');
assertEqual(prevAgent6.agent2_zero_or_safe_dry_run.permitted, true, 'previous Agent 6 dry-run permitted');

assert(agent13Md.includes('Proceed to Agent 2 zero-or-safe non-public dry-run'), 'Agent 13 policy missing dry-run authorization text');
assert(agent13Md.includes('Match percent must stay hidden, null, or unavailable'), 'Agent 13 policy missing match-percent boundary');
assert(agent13Md.includes('Agent 4 remains frozen'), 'Agent 13 policy missing Agent 4 boundary');

assertEqual(verdict.artifact_type, 'agent6_orot_dry_run_source_license_display_boundary_verdict', 'verdict artifact_type');
assertEqual(verdict.disposition, 'warn_accepted', 'verdict disposition');
assertEqual(verdict.pass_warn_block, 'warn', 'verdict pass_warn_block');
assertEqual(verdict.package_may_proceed_to_next_non_public_step, true, 'verdict package_may_proceed_to_next_non_public_step');
assertEqual(verdict.public_mutation_blocked, true, 'verdict public_mutation_blocked');
assertEqual(verdict.answer_eligibility_authorized, false, 'verdict answer_eligibility_authorized');
assertEqual(verdict.definition_authority_authorized, false, 'verdict definition_authority_authorized');
assertEqual(verdict.usage_as_definition_authorized, false, 'verdict usage_as_definition_authorized');
assertEqual(verdict.publication_readiness_authorized, false, 'verdict publication_readiness_authorized');
assertEqual(verdict.scope.candidate_rows, 31, 'verdict candidate_rows');
assertEqual(verdict.scope.candidate_occurrences, 1202, 'verdict candidate_occurrences');
assertEqual(verdict.scope.source_rows_reviewed, 49, 'verdict source_rows_reviewed');
assertEqual(verdict.scope.match_percent_available_rows, 0, 'verdict match_percent_available_rows');
assertEqual(verdict.agent2_dry_run_recount.public_hud_rows_emitted, 0, 'verdict dry-run recount public_hud_rows_emitted');
assertEqual(verdict.agent2_dry_run_recount.route_jsonl_rows_emitted, 0, 'verdict dry-run recount route_jsonl_rows_emitted');
assertEqual(verdict.agent2_dry_run_recount.answer_eligible_true, 0, 'verdict dry-run recount answer_eligible_true');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_row_status_counts.allowed, 20, 'verdict allowed selected rows');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_row_status_counts.external_link_only, 10, 'verdict external_link_only selected rows');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_row_status_counts.metadata_only, 1, 'verdict metadata_only selected rows');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_occurrence_status_counts.allowed, 1033, 'verdict allowed selected occurrences');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_occurrence_status_counts.external_link_only, 145, 'verdict external_link_only selected occurrences');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_occurrence_status_counts.metadata_only, 24, 'verdict metadata_only selected occurrences');
assertEqual(verdict.agent1_source_license_display_review_recount.source_row_status_counts.allowed, 12, 'verdict allowed source rows');
assertEqual(verdict.agent1_source_license_display_review_recount.source_row_status_counts.external_link_only, 36, 'verdict external_link_only source rows');
assertEqual(verdict.agent1_source_license_display_review_recount.source_row_status_counts.metadata_only, 1, 'verdict metadata_only source rows');
assertEqual(verdict.agent1_source_license_display_review_recount.selected_rows_with_display_storage_blockers, 11, 'verdict selected_rows_with_display_storage_blockers');
assertEqual(verdict.source_family_boundary.kaikki_wiktionary.agent1_status, 'external_link_only', 'verdict Kaikki status');
assertEqual(verdict.source_family_boundary.openscriptures.agent1_status, 'allowed', 'verdict OpenScriptures status');
assertEqual(verdict.source_family_boundary.workspace_project_function_word.agent1_status, 'allowed', 'verdict project function word status');
assertEqual(verdict.source_family_boundary.workspace_project_grammar_particle.agent1_status, 'metadata_only', 'verdict grammar particle status');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.permitted, true, 'verdict Agent 2 permitted');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.restricted_to_agent1_agent6_allowed_selected_rows_only, true, 'verdict Agent 2 restricted');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.allowed_selected_rows, 20, 'verdict Agent 2 allowed_selected_rows');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.allowed_selected_occurrences, 1033, 'verdict Agent 2 allowed_selected_occurrences');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.excluded_from_candidate_text_display_or_storage.external_link_only_selected_rows, 10, 'verdict Agent 2 external excluded rows');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.excluded_from_candidate_text_display_or_storage.metadata_only_selected_rows, 1, 'verdict Agent 2 metadata excluded rows');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.must_emit_no_answer_rows, true, 'verdict must_emit_no_answer_rows');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.must_emit_no_public_hud_rows, true, 'verdict must_emit_no_public_hud_rows');
assertEqual(verdict.agent2_next_zero_or_safe_package_step.must_emit_no_route_rows, true, 'verdict must_emit_no_route_rows');
assertEqual(verdict.agent13_or_user_decision.required_for_next_restricted_non_public_agent2_step, false, 'verdict Agent 13 required for restricted next step');
assertEqual(verdict.agent13_or_user_decision.required_before_public_mutation, true, 'verdict Agent 13 required before public mutation');
assertEqual(verdict.agent4_boundary.remains_held, true, 'verdict Agent 4 remains held');
assertZeroOutputs(verdict.outputs, 'verdict outputs');

const forbiddenAcceptance = [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'accepted gloss',
  'accepted text'
];
for (const item of forbiddenAcceptance) {
  assert(verdict.not_accepted.includes(item), `verdict not_accepted missing ${item}`);
  assert(verdictMd.includes(item), `verdict markdown missing ${item}`);
}

assert(verdictMd.includes('## Agent 8 Callback'), 'markdown missing Agent 8 Callback section');
assert(verdictMd.includes('Agent 8 direct callback delivery unavailable in this environment; callback requires relay.'), 'markdown missing callback delivery blocker');
assert(verdictMd.includes('Agent 2 may proceed: yes'), 'markdown missing Agent 2 proceed callback');
assert(verdictMd.includes('Agent 4 remains held: yes'), 'markdown missing Agent 4 held callback');
assert(verdictMd.includes('Public mutation remains blocked'), 'markdown missing public mutation block');

console.log(`Agent 6 Orot dry-run source/license display boundary verdict validation passed for ${paths.verdictJson}.`);
