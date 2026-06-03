import fs from 'node:fs';

const paths = {
  allowedPackage: 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json',
  priorAgent6: 'reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.json',
  agent1: 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json',
  originalDryRun: 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.json',
  agent13: 'reports/agent13-orot-reader-hint-candidate-label-policy-decision-2026-06-03.md',
  verdictJson: 'reports/agent6-orot-allowed-row-reader-hint-package-verdict-2026-06-03.json',
  verdictMd: 'reports/agent6-orot-allowed-row-reader-hint-package-verdict-2026-06-03.md'
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

function assertZeroOutputObject(outputs, label) {
  assertEqual(outputs.answer_rows_emitted, 0, `${label} answer_rows_emitted`);
  assertEqual(outputs.source_rows_emitted, 0, `${label} source_rows_emitted`);
  assertEqual(outputs.public_hud_rows_emitted, 0, `${label} public_hud_rows_emitted`);
  assertEqual(outputs.route_jsonl_rows_emitted, 0, `${label} route_jsonl_rows_emitted`);
  assertArrayEmpty(outputs.runtime_files_touched, `${label} runtime_files_touched`);
  assertArrayEmpty(outputs.source_files_touched, `${label} source_files_touched`);
  assertArrayEmpty(outputs.token_index_files_touched, `${label} token_index_files_touched`);
  assertArrayEmpty(outputs.lexical_payload_files_touched, `${label} lexical_payload_files_touched`);
}

function sum(rows) {
  return rows.reduce((total, row) => total + row.occurrences, 0);
}

for (const path of Object.values(paths)) {
  assert(fs.existsSync(path), `missing required file: ${path}`);
}

const allowedPackage = readJson(paths.allowedPackage);
const priorAgent6 = readJson(paths.priorAgent6);
const agent1 = readJson(paths.agent1);
const originalDryRun = readJson(paths.originalDryRun);
const verdict = readJson(paths.verdictJson);
const verdictMd = fs.readFileSync(paths.verdictMd, 'utf8');
const agent13Md = fs.readFileSync(paths.agent13, 'utf8');

assertEqual(allowedPackage.artifact_type, 'agent2_orot_allowed_row_reader_hint_package_dry_run', 'allowed package artifact_type');
assertEqual(allowedPackage.status, 'zero_or_safe_non_public_allowed_row_package_dry_run_produced', 'allowed package status');
assertEqual(allowedPackage.dry_run_scope.input_rows, 31, 'allowed package input_rows');
assertEqual(allowedPackage.dry_run_scope.input_occurrences, 1202, 'allowed package input_occurrences');
assertEqual(allowedPackage.dry_run_scope.included_allowed_rows, 20, 'allowed package included rows');
assertEqual(allowedPackage.dry_run_scope.included_allowed_occurrences, 1033, 'allowed package included occurrences');
assertEqual(allowedPackage.dry_run_scope.excluded_rows, 11, 'allowed package excluded rows');
assertEqual(allowedPackage.dry_run_scope.excluded_occurrences, 169, 'allowed package excluded occurrences');
assertEqual(allowedPackage.dry_run_scope.excluded_status_counts.external_link_only, 10, 'allowed package external_link_only excluded rows');
assertEqual(allowedPackage.dry_run_scope.excluded_status_counts.metadata_only, 1, 'allowed package metadata_only excluded rows');
assertEqual(allowedPackage.dry_run_scope.excluded_occurrence_status_counts.external_link_only, 145, 'allowed package external_link_only excluded occurrences');
assertEqual(allowedPackage.dry_run_scope.excluded_occurrence_status_counts.metadata_only, 24, 'allowed package metadata_only excluded occurrences');
assertEqual(allowedPackage.zero_or_safe_result.status, 'zero_or_safe_non_public_allowed_row_package_dry_run_confirmed', 'allowed package zero_or_safe status');
assertEqual(allowedPackage.zero_or_safe_result.blockers_inside_allowed_20_row_package, 0, 'allowed package blockers');
assertEqual(allowedPackage.flags.answer_rows_emitted, 0, 'allowed package answer_rows_emitted');
assertEqual(allowedPackage.flags.source_rows_emitted, 0, 'allowed package source_rows_emitted');
assertEqual(allowedPackage.flags.public_hud_rows_emitted, 0, 'allowed package public_hud_rows_emitted');
assertEqual(allowedPackage.flags.route_jsonl_rows_emitted, 0, 'allowed package route_jsonl_rows_emitted');
assertArrayEmpty(allowedPackage.flags.runtime_files_touched, 'allowed package runtime_files_touched');
assertArrayEmpty(allowedPackage.flags.source_files_touched, 'allowed package source_files_touched');
assertArrayEmpty(allowedPackage.flags.token_index_files_touched, 'allowed package token_index_files_touched');
assertArrayEmpty(allowedPackage.flags.lexical_payload_files_touched, 'allowed package lexical_payload_files_touched');
assertEqual(allowedPackage.flags.answer_eligible_true, 0, 'allowed package answer_eligible_true');
assertEqual(allowedPackage.flags.promote_to_answer_true, 0, 'allowed package promote_to_answer_true');
assertEqual(allowedPackage.flags.approved_for_public_emit_true, 0, 'allowed package approved_for_public_emit_true');
assertEqual(allowedPackage.flags.public_emit_ready_true, 0, 'allowed package public_emit_ready_true');
assertEqual(allowedPackage.flags.would_modify_public_hud_true, 0, 'allowed package would_modify_public_hud_true');
assertEqual(allowedPackage.flags.would_write_allowed_now_true, 0, 'allowed package would_write_allowed_now_true');
assertEqual(allowedPackage.flags.match_percent_available_rows, 0, 'allowed package match_percent_available_rows');
assertEqual(allowedPackage.flags.match_percent_null_rows, 31, 'allowed package match_percent_null_rows');

assert(Array.isArray(allowedPackage.package_rows), 'allowed package package_rows expected array');
assert(Array.isArray(allowedPackage.excluded_rows), 'allowed package excluded_rows expected array');
assertEqual(allowedPackage.package_rows.length, 20, 'allowed package package_rows length');
assertEqual(allowedPackage.excluded_rows.length, 11, 'allowed package excluded_rows length');
const includedRows = allowedPackage.package_rows.filter((row) => row.row_package_status === 'included_allowed_selected_row_non_public_candidate_package');
const excludedRows = allowedPackage.excluded_rows.filter((row) => row.row_package_status === 'excluded_from_allowed_row_candidate_text_package');
assertEqual(includedRows.length, 20, 'included package row count');
assertEqual(sum(includedRows), 1033, 'included package occurrence sum');
assertEqual(excludedRows.length, 11, 'excluded package row count');
assertEqual(sum(excludedRows), 169, 'excluded package occurrence sum');
assertEqual(excludedRows.filter((row) => row.agent1_status === 'external_link_only').length, 10, 'excluded external-link row count');
assertEqual(sum(excludedRows.filter((row) => row.agent1_status === 'external_link_only')), 145, 'excluded external-link occurrence sum');
assertEqual(excludedRows.filter((row) => row.agent1_status === 'metadata_only').length, 1, 'excluded metadata-only row count');
assertEqual(sum(excludedRows.filter((row) => row.agent1_status === 'metadata_only')), 24, 'excluded metadata-only occurrence sum');

for (const row of includedRows) {
  assert(['counterpart candidate', 'project-preferred counterpart candidate'].includes(row.label), `unexpected included label for ${row.token_id}`);
  assertEqual(row.label_status, 'candidate_not_approved', `included label_status for ${row.token_id}`);
  assertEqual(row.match_percent, null, `included match_percent for ${row.token_id}`);
  assertEqual(row.answer_eligible, false, `included answer_eligible for ${row.token_id}`);
  assertEqual(row.promote_to_answer, false, `included promote_to_answer for ${row.token_id}`);
  assertEqual(row.approved_for_public_emit, false, `included approved_for_public_emit for ${row.token_id}`);
  assertEqual(row.public_emit_ready, false, `included public_emit_ready for ${row.token_id}`);
  assertEqual(row.would_modify_public_hud, false, `included would_modify_public_hud for ${row.token_id}`);
  assertEqual(row.future_write_if_later_approved.allowed_now, false, `included allowed_now for ${row.token_id}`);
  assertEqual(row.storage_allowed_in_this_non_public_package, true, `included storage_allowed for ${row.token_id}`);
  assertEqual(row.display_allowed_in_this_non_public_package, true, `included display_allowed for ${row.token_id}`);
  assertEqual(row.candidate_counterpart.display_included, true, `included candidate display for ${row.token_id}`);
}

for (const row of excludedRows) {
  assertEqual(row.answer_eligible, false, `excluded answer_eligible for ${row.token_id}`);
  assertEqual(row.promote_to_answer, false, `excluded promote_to_answer for ${row.token_id}`);
  assertEqual(row.approved_for_public_emit, false, `excluded approved_for_public_emit for ${row.token_id}`);
  assertEqual(row.public_emit_ready, false, `excluded public_emit_ready for ${row.token_id}`);
  assertEqual(row.would_modify_public_hud, false, `excluded would_modify_public_hud for ${row.token_id}`);
  assertEqual(row.future_write_if_later_approved.allowed_now, false, `excluded allowed_now for ${row.token_id}`);
  assertEqual(row.storage_allowed_in_this_non_public_package, false, `excluded storage_allowed for ${row.token_id}`);
  assertEqual(row.display_allowed_in_this_non_public_package, false, `excluded display_allowed for ${row.token_id}`);
  assertEqual(row.candidate_counterpart.display_included, false, `excluded candidate display for ${row.token_id}`);
  assertEqual(row.candidate_counterpart.display, null, `excluded candidate display text for ${row.token_id}`);
}

assertEqual(priorAgent6.disposition, 'warn_accepted', 'prior Agent 6 disposition');
assertEqual(priorAgent6.package_may_proceed_to_next_non_public_step, true, 'prior Agent 6 package may proceed');
assertEqual(priorAgent6.public_mutation_blocked, true, 'prior Agent 6 public_mutation_blocked');
assertEqual(priorAgent6.agent2_next_zero_or_safe_package_step.permitted, true, 'prior Agent 6 Agent 2 permitted');
assertEqual(priorAgent6.agent2_next_zero_or_safe_package_step.allowed_selected_rows, 20, 'prior Agent 6 allowed_selected_rows');
assertEqual(priorAgent6.agent2_next_zero_or_safe_package_step.allowed_selected_occurrences, 1033, 'prior Agent 6 allowed_selected_occurrences');
assertEqual(priorAgent6.agent2_next_zero_or_safe_package_step.excluded_from_candidate_text_display_or_storage.external_link_only_selected_rows, 10, 'prior Agent 6 external excluded rows');
assertEqual(priorAgent6.agent2_next_zero_or_safe_package_step.excluded_from_candidate_text_display_or_storage.metadata_only_selected_rows, 1, 'prior Agent 6 metadata excluded rows');
assertEqual(priorAgent6.agent4_boundary.remains_held, true, 'prior Agent 6 Agent 4 held');

assertEqual(agent1.summary.agent1_review_ready_for_agent6, true, 'Agent 1 ready for Agent 6');
assertEqual(agent1.summary.public_mutation_allowed_now, false, 'Agent 1 public mutation allowed now');
assertEqual(agent1.summary.selected_row_status_counts.allowed, 20, 'Agent 1 allowed rows');
assertEqual(agent1.summary.selected_row_status_counts.external_link_only, 10, 'Agent 1 external-link rows');
assertEqual(agent1.summary.selected_row_status_counts.metadata_only, 1, 'Agent 1 metadata-only rows');
assertEqual(agent1.summary.selected_occurrence_status_counts.allowed, 1033, 'Agent 1 allowed occurrences');
assertEqual(agent1.summary.selected_occurrence_status_counts.external_link_only, 145, 'Agent 1 external-link occurrences');
assertEqual(agent1.summary.selected_occurrence_status_counts.metadata_only, 24, 'Agent 1 metadata-only occurrences');
assertEqual(agent1.summary.source_row_status_counts.allowed, 12, 'Agent 1 allowed source rows');
assertEqual(agent1.summary.source_row_status_counts.external_link_only, 36, 'Agent 1 external-link source rows');
assertEqual(agent1.summary.source_row_status_counts.metadata_only, 1, 'Agent 1 metadata-only source rows');
assertEqual(agent1.summary.selected_rows_with_display_storage_blockers, 11, 'Agent 1 selected rows with display/storage blockers');
assertEqual(agent1.summary.source_rows_missing_local_bounded_evidence, 0, 'Agent 1 missing local bounded evidence');

assertEqual(originalDryRun.dry_run_scope.rows, 31, 'original dry-run rows');
assertEqual(originalDryRun.dry_run_scope.occurrences, 1202, 'original dry-run occurrences');
assertEqual(originalDryRun.flags.public_hud_rows_emitted, 0, 'original dry-run public_hud_rows_emitted');
assertEqual(originalDryRun.flags.route_jsonl_rows_emitted, 0, 'original dry-run route_jsonl_rows_emitted');
assertEqual(originalDryRun.flags.answer_eligible_true, 0, 'original dry-run answer_eligible_true');
assertEqual(originalDryRun.flags.promote_to_answer_true, 0, 'original dry-run promote_to_answer_true');
assertEqual(originalDryRun.flags.approved_for_public_emit_true, 0, 'original dry-run approved_for_public_emit_true');
assertEqual(originalDryRun.flags.public_emit_ready_true, 0, 'original dry-run public_emit_ready_true');

assert(agent13Md.includes('Proceed to Agent 2 zero-or-safe non-public dry-run'), 'Agent 13 policy missing dry-run route');
assert(agent13Md.includes('Match percent must stay hidden, null, or unavailable'), 'Agent 13 policy missing match-percent boundary');
assert(agent13Md.includes('Agent 4 remains frozen'), 'Agent 13 policy missing Agent 4 boundary');
assert(agent13Md.includes('No expansion to top-100, top-500, full Orot'), 'Agent 13 policy missing expansion cap');

assertEqual(verdict.artifact_type, 'agent6_orot_allowed_row_reader_hint_package_verdict', 'verdict artifact_type');
assertEqual(verdict.disposition, 'warn_accepted', 'verdict disposition');
assertEqual(verdict.pass_warn_block, 'warn', 'verdict pass_warn_block');
assertEqual(verdict.package_may_proceed_to_next_non_public_package_planning_step, true, 'verdict next planning permitted');
assertEqual(verdict.public_mutation_blocked, true, 'verdict public_mutation_blocked');
assertEqual(verdict.agent4_remains_held, true, 'verdict agent4_remains_held');
assertEqual(verdict.answer_eligibility_authorized, false, 'verdict answer_eligibility_authorized');
assertEqual(verdict.definition_authority_authorized, false, 'verdict definition_authority_authorized');
assertEqual(verdict.usage_as_definition_authorized, false, 'verdict usage_as_definition_authorized');
assertEqual(verdict.publication_readiness_authorized, false, 'verdict publication_readiness_authorized');
assertEqual(verdict.route_publication_support_authorized, false, 'verdict route_publication_support_authorized');
assertEqual(verdict.product_data_acceptance_authorized, false, 'verdict product_data_acceptance_authorized');
assertEqual(verdict.scope.included_allowed_rows, 20, 'verdict included_allowed_rows');
assertEqual(verdict.scope.included_allowed_occurrences, 1033, 'verdict included_allowed_occurrences');
assertEqual(verdict.scope.excluded_rows, 11, 'verdict excluded_rows');
assertEqual(verdict.scope.excluded_occurrences, 169, 'verdict excluded_occurrences');
assertEqual(verdict.scope.excluded_external_link_only_rows, 10, 'verdict excluded external rows');
assertEqual(verdict.scope.excluded_external_link_only_occurrences, 145, 'verdict excluded external occurrences');
assertEqual(verdict.scope.excluded_metadata_only_rows, 1, 'verdict excluded metadata rows');
assertEqual(verdict.scope.excluded_metadata_only_occurrences, 24, 'verdict excluded metadata occurrences');
assertEqual(verdict.agent2_allowed_package_recount.blockers_inside_allowed_20_row_package, 0, 'verdict package blockers');
assertEqual(verdict.agent2_allowed_package_recount.answer_rows_emitted, 0, 'verdict recount answer_rows_emitted');
assertEqual(verdict.agent2_allowed_package_recount.source_rows_emitted, 0, 'verdict recount source_rows_emitted');
assertEqual(verdict.agent2_allowed_package_recount.public_hud_rows_emitted, 0, 'verdict recount public_hud_rows_emitted');
assertEqual(verdict.agent2_allowed_package_recount.route_jsonl_rows_emitted, 0, 'verdict recount route_jsonl_rows_emitted');
assertEqual(verdict.agent2_allowed_package_recount.runtime_files_touched, 0, 'verdict recount runtime_files_touched');
assertEqual(verdict.agent2_allowed_package_recount.source_files_touched, 0, 'verdict recount source_files_touched');
assertEqual(verdict.agent2_allowed_package_recount.token_index_files_touched, 0, 'verdict recount token_index_files_touched');
assertEqual(verdict.agent2_allowed_package_recount.lexical_payload_files_touched, 0, 'verdict recount lexical_payload_files_touched');
assertEqual(verdict.agent2_allowed_package_recount.answer_eligible_true, 0, 'verdict recount answer_eligible_true');
assertEqual(verdict.agent2_allowed_package_recount.promote_to_answer_true, 0, 'verdict recount promote_to_answer_true');
assertEqual(verdict.agent2_allowed_package_recount.approved_for_public_emit_true, 0, 'verdict recount approved_for_public_emit_true');
assertEqual(verdict.agent2_allowed_package_recount.public_emit_ready_true, 0, 'verdict recount public_emit_ready_true');
assertEqual(verdict.agent2_allowed_package_recount.would_modify_public_hud_true, 0, 'verdict recount would_modify_public_hud_true');
assertEqual(verdict.agent2_allowed_package_recount.would_write_allowed_now_true, 0, 'verdict recount would_write_allowed_now_true');
assertEqual(verdict.agent1_boundary_recount.selected_row_status_counts.allowed, 20, 'verdict Agent 1 allowed rows');
assertEqual(verdict.agent1_boundary_recount.selected_row_status_counts.external_link_only, 10, 'verdict Agent 1 external rows');
assertEqual(verdict.agent1_boundary_recount.selected_row_status_counts.metadata_only, 1, 'verdict Agent 1 metadata rows');
assertEqual(verdict.agent1_boundary_recount.selected_occurrence_status_counts.allowed, 1033, 'verdict Agent 1 allowed occurrences');
assertEqual(verdict.agent1_boundary_recount.selected_occurrence_status_counts.external_link_only, 145, 'verdict Agent 1 external occurrences');
assertEqual(verdict.agent1_boundary_recount.selected_occurrence_status_counts.metadata_only, 24, 'verdict Agent 1 metadata occurrences');
assertEqual(verdict.prior_agent6_boundary_recount.restricted_to_agent1_agent6_allowed_selected_rows_only, true, 'verdict prior Agent 6 restriction');
assertEqual(verdict.next_permitted_route.owner, 'Agent 10', 'verdict next route owner');
assertEqual(verdict.next_permitted_route.agent4_follow_up_needed, false, 'verdict Agent 4 follow-up');
assertEqual(verdict.next_permitted_route.agent6_follow_up_needed_after_package_planning, true, 'verdict Agent 6 follow-up after planning');
assertEqual(verdict.agent4_boundary.remains_held, true, 'verdict Agent 4 boundary');
assertZeroOutputObject(verdict.outputs, 'verdict outputs');

const requiredNotAccepted = [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'translation output',
  'accepted gloss',
  'accepted text',
  'public HUD mutation',
  'route JSONL mutation',
  'runtime mutation',
  'source mutation',
  'token-index mutation',
  'lexical payload mutation'
];

for (const item of requiredNotAccepted) {
  assert(verdict.not_accepted.includes(item), `verdict not_accepted missing ${item}`);
  assert(verdictMd.includes(item), `verdict markdown missing ${item}`);
}

assert(verdictMd.includes('## Agent 8 Callback'), 'markdown missing Agent 8 Callback section');
assert(verdictMd.includes('Disposition: `WARN-ACCEPTED` for evidence sufficiency only.'), 'markdown missing disposition');
assert(verdictMd.includes('Agent 10 may prepare one non-public candidate package handoff'), 'markdown missing next route');
assert(verdictMd.includes('Public mutation remains blocked'), 'markdown missing public mutation blocker');
assert(verdictMd.includes('Agent 4 remains held: yes'), 'markdown missing Agent 4 callback');
assert(verdictMd.includes('Agent 8 direct callback delivery unavailable in this environment; callback requires relay.'), 'markdown missing callback delivery blocker');

console.log(`Agent 6 Orot allowed-row reader-hint package verdict validation passed for ${paths.verdictJson}.`);
