import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_bridge_gap_row_level_return_watch_blocker.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_bridge_gap_row_level_return_watch_blocker") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
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

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  contract_rows: 3,
  contract_occurrences: 42,
  agent10_row_level_consumed_rows: 0,
  agent10_row_level_nonconsumption_blocker_rows: 0,
  agent1_agent2_source_citation_return_rows: 0,
  owner_action_resolution_present_rows: 0,
  source_citation_or_url_present_rows: 0,
  transform_rule_present_rows: 0,
  transform_rule_still_blocked_rows: 3,
  agent4_gate_proof_for_latest_no_new_blocker_rows: 0,
  a07_approval_route_rows: 3,
  a06_evidence_owner_rows: 3,
  a06_approval_requested_rows: 0,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_eligible_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  publication_or_release_claims: 0,
  release_actions: 0,
  acceptance_claims: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected count ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

for (const [owner, expectedText] of Object.entries({
  agent10: "row_level_consumption_artifact_or_exact_nonconsumption_blocker",
  agent1_agent2: "source_citation_or_url_or_exact_missing_source_citation_blocker",
  agent10_transform_rule: "proposed_candidate_text",
  agent4: "gate proof",
  A07: "approval",
  A06: "evidence"
})) {
  if (!artifact.required_next_input_before_agent2_transform[owner]?.includes(expectedText)) {
    throw new Error(`missing required next-input text for ${owner}`);
  }
}

for (const expected of [
  "missing_agent10_row_level_consumption_after_contract",
  "missing_agent1_agent2_source_citation_or_owner_action_return_after_contract",
  "missing_source_field::source_citation_or_url",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule",
  "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator",
  "missing_source_citation_resolution_for_zero_ref_gap_source_rid",
  "missing_exact_rid_scope_for_multi_rid_custody_row",
  "agent4_gate_proof_not_yet_observed_for_latest_no_new_row_level_return_blocker",
  "approval_request_misrouted_to_A06",
  "A06_output_is_evidence_ready_only_until_A07_approval",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!artifact.exact_blockers.includes(expected)) {
    throw new Error(`missing exact blocker: ${expected}`);
  }
}

console.log(
  `Agent2 row-level return watch blocker validation passed. Contract rows: ${counts.contract_rows}; Agent10 consumed rows: ${counts.agent10_row_level_consumed_rows}; Agent4 gate rows: ${counts.agent4_gate_proof_for_latest_no_new_blocker_rows}.`
);
