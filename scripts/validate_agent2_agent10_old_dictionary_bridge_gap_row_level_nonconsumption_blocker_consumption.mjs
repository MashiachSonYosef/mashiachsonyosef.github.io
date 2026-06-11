import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_agent10_old_dictionary_bridge_gap_row_level_nonconsumption_blocker_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_agent10_old_dictionary_bridge_gap_row_level_nonconsumption_blocker_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const agent10 = JSON.parse(fs.readFileSync(artifact.files_used.agent10_row_level_nonconsumption_blocker, "utf8"));
if (agent10.artifact_type !== "agent10_old_dictionary_bridge_gap_row_level_nonconsumption_blocker") {
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

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  contract_rows: 3,
  contract_occurrences: 42,
  agent10_contract_consumed_as_blocker_rows: 3,
  agent10_row_level_text_consumed_rows: 0,
  agent1_agent2_source_citation_return_rows: 0,
  source_citation_or_url_present_rows: 0,
  owner_action_resolution_present_rows: 0,
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

const expectedRows = new Map([
  ["agent2-orot-gap-tok-126d54d64a8c", { source_rid: "P00280", owner_action_kind: "queue_scope_dedupe_required" }],
  ["agent2-orot-gap-tok-d29b2c27700e", { source_rid: "M00032", owner_action_kind: "source_citation_ref_gap_resolution_required" }],
  ["agent2-orot-gap-tok-e50370ece8ba", { source_rid: "E00687", owner_action_kind: "exact_rid_scope_required" }]
]);

if (!Array.isArray(artifact.row_level_nonconsumption_rows) || artifact.row_level_nonconsumption_rows.length !== 3) {
  throw new Error("expected exactly three row_level_nonconsumption_rows");
}

if (!Array.isArray(agent10.row_level_return) || agent10.row_level_return.length !== 3) {
  throw new Error("Agent10 artifact must contain exactly three row_level_return rows");
}

for (const row of artifact.row_level_nonconsumption_rows) {
  const expected = expectedRows.get(row.queue_id);
  if (!expected) {
    throw new Error(`unexpected queue_id: ${row.queue_id}`);
  }
  if (row.source_rid !== expected.source_rid || row.owner_action_kind !== expected.owner_action_kind) {
    throw new Error(`unexpected row mapping for ${row.queue_id}`);
  }
  if (!row.row_level_consumption_artifact_or_exact_nonconsumption_blocker?.startsWith("exact_nonconsumption_blocker::")) {
    throw new Error(`row is not an exact nonconsumption blocker: ${row.queue_id}`);
  }
  if (row.approval_route_owner !== "A07") {
    throw new Error(`row approval route must be A07: ${row.queue_id}`);
  }
}

for (const sourceRow of agent10.row_level_return) {
  const artifactRow = artifact.row_level_nonconsumption_rows.find((row) => row.queue_id === sourceRow.queue_id);
  if (!artifactRow) {
    throw new Error(`Agent10 row missing from Agent2 consumption: ${sourceRow.queue_id}`);
  }
  if (artifactRow.row_level_consumption_artifact_or_exact_nonconsumption_blocker !== sourceRow.row_level_consumption_artifact_or_exact_nonconsumption_blocker) {
    throw new Error(`Agent10 blocker mismatch for ${sourceRow.queue_id}`);
  }
}

for (const expected of [
  "agent10_row_level_nonconsumption_blocker_consumed_not_transform_input",
  "missing_agent1_agent2_source_citation_or_owner_action_return_after_contract",
  "missing_source_field::source_citation_or_url",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule",
  "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator",
  "missing_source_citation_resolution_for_zero_ref_gap_source_rid",
  "missing_exact_rid_scope_for_multi_rid_custody_row",
  "agent4_gate_proof_not_yet_observed_for_latest_no_new_row_level_return_blocker",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!artifact.exact_blockers.includes(expected)) {
    throw new Error(`missing exact blocker: ${expected}`);
  }
}

if (artifact.exact_blockers.includes("missing_agent10_row_level_consumption_after_contract")) {
  throw new Error("stale missing Agent10 row-level return blocker must not remain after nonconsumption return is consumed");
}

console.log(
  `Agent2 Agent10 row-level nonconsumption consumption validation passed. Contract rows: ${counts.contract_rows}; Agent10 nonconsumption rows: ${counts.agent10_contract_consumed_as_blocker_rows}; transform rows: ${counts.candidate_text_rows}.`
);
