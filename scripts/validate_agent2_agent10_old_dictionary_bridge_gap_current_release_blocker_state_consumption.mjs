import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_agent10_old_dictionary_bridge_gap_current_release_blocker_state_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_agent10_old_dictionary_bridge_gap_current_release_blocker_state_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const agent10 = JSON.parse(fs.readFileSync(artifact.files_used.agent10_current_release_blocker_state, "utf8"));
if (agent10.artifact_type !== "agent10_old_dictionary_bridge_gap_current_release_blocker_state") {
  throw new Error(`unexpected Agent10 artifact_type: ${agent10.artifact_type}`);
}

if (!Array.isArray(artifact.bounded_checks) || artifact.bounded_checks.length !== 5) {
  throw new Error("expected exactly five bounded checks");
}

for (const check of artifact.bounded_checks) {
  if (check.process_timeout !== false) {
    throw new Error(`bounded check timed out unexpectedly: ${check.command}`);
  }
  if (check.timeout_ms !== 120000) {
    throw new Error(`bounded check timeout must be 120000: ${check.command}`);
  }
}

const route = artifact.route_correction_preserved;
if (route.approval_sop_final_validation_release_gate_owner !== "A07") {
  throw new Error("approval owner must be A07");
}
if (route.evidence_validators_repo_cleaning_production_owner !== "A06") {
  throw new Error("evidence owner must be A06");
}
if (route.a06_outputs_evidence_ready_until_a07_approves !== true || route.do_not_ask_a06_for_approval !== true) {
  throw new Error("A06 evidence-only route was not preserved");
}

const counts = artifact.package_state;
const expectedState = {
  rows: 3,
  occurrences: 42,
  source_license_lane: "commercial_clean_candidate",
  row_status: "blocked_or_needs_review",
  agent10_no_text_transform_rule_consumed_rows: 3,
  text_transform_authorized_rows: 0,
  source_citation_or_url_present_rows: 0,
  owner_action_resolution_present_rows: 0,
  agent6_boundary_packet_ready_rows: 0
};

for (const [key, expected] of Object.entries(expectedState)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected package_state ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

const zero = artifact.zero_mutation_counters;
const expectedZeroCounters = [
  "proposed_candidate_text_rows",
  "proposed_definition_text_rows",
  "proposed_lemma_text_rows",
  "proposed_reader_hint_text_rows",
  "answer_eligible_rows",
  "public_emit_rows",
  "definition_content_rows",
  "accepted_text_rows",
  "route_shard_writes",
  "source_text_rows",
  "public_runtime_mutation",
  "release_actions",
  "acceptance_claims"
];

for (const key of expectedZeroCounters) {
  if (zero[key] !== 0) {
    throw new Error(`zero mutation counter must be 0 (${key}): ${zero[key]}`);
  }
}

if (artifact.agent6_boundary_need !== "none_now") {
  throw new Error(`unexpected agent6_boundary_need: ${artifact.agent6_boundary_need}`);
}
if (!Array.isArray(artifact.agent6_boundary_questions) || artifact.agent6_boundary_questions.length !== 0) {
  throw new Error("agent6_boundary_questions must be empty");
}

for (const expected of [
  "agent10_current_release_blocker_state_consumed_no_release_action",
  "agent10_no_text_transform_rule_consumed_blocks_text_until_prereqs_clear",
  "missing_agent1_agent2_source_citation_or_owner_action_return_after_contract",
  "missing_source_field::source_citation_or_url",
  "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator",
  "missing_source_citation_resolution_for_zero_ref_gap_source_rid",
  "missing_exact_rid_scope_for_multi_rid_custody_row",
  "stale_agent1_registry_target_current_agent1_thread_required",
  "agent3_git_index_write_capability_blocker",
  "agent4_gate_proof_not_observed_for_changed_three_row_input"
]) {
  if (!artifact.exact_blockers.includes(expected)) {
    throw new Error(`missing exact blocker: ${expected}`);
  }
}

for (const stale of [
  "missing_agent10_row_level_consumption_after_contract",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule"
]) {
  if (artifact.exact_blockers.includes(stale)) {
    throw new Error(`stale blocker must not remain: ${stale}`);
  }
}

for (const expected of agent10.exact_blockers) {
  if (!artifact.consumed_agent10_exact_blockers.includes(expected)) {
    throw new Error(`Agent10 blocker not recorded as consumed: ${expected}`);
  }
}

console.log(
  `Agent2 Agent10 current release blocker state consumption validation passed. Rows: ${counts.rows}; Agent6 packets: ${counts.agent6_boundary_packet_ready_rows}; release actions: ${zero.release_actions}.`
);
