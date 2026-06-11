import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_agent10_old_dictionary_bridge_gap_no_text_transform_rule_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_agent10_old_dictionary_bridge_gap_no_text_transform_rule_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const agent10 = JSON.parse(fs.readFileSync(artifact.files_used.agent10_no_text_transform_rule_and_boundary_blocker, "utf8"));
if (agent10.artifact_type !== "agent10_old_dictionary_bridge_gap_no_text_transform_rule_and_boundary_blocker") {
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
  rows: 3,
  occurrences: 42,
  commercial_clean_candidate_rows: 3,
  noncommercial_educational_candidate_rows: 0,
  metadata_or_link_only_rows: 0,
  blocked_or_needs_review_rows: 3,
  agent10_no_text_transform_rule_consumed_rows: 3,
  transform_rule_present_rows: 3,
  text_transform_authorized_rows: 0,
  source_citation_or_url_present_rows: 0,
  owner_action_resolution_present_rows: 0,
  agent6_boundary_packet_ready_rows: 0,
  proposed_candidate_text_rows: 0,
  proposed_definition_text_rows: 0,
  proposed_lemma_text_rows: 0,
  proposed_reader_hint_text_rows: 0,
  answer_eligible_rows: 0,
  public_emit_rows: 0,
  definition_content_rows: 0,
  accepted_text_rows: 0,
  route_shard_writes: 0,
  public_runtime_mutation: 0,
  release_actions: 0,
  acceptance_claims: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected count ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

if (artifact.exact_transform_rule?.rule_id !== "agent10_no_text_transform_until_source_and_owner_action_prereqs_clear") {
  throw new Error("unexpected exact_transform_rule.rule_id");
}
if (artifact.exact_transform_rule.allowed_transform_output_before_prereqs !== "blocker rows only") {
  throw new Error("unexpected allowed_transform_output_before_prereqs");
}

const expectedRows = new Map([
  ["agent2-orot-gap-tok-126d54d64a8c", { source_rid: "P00280", occurrences: 13, owner_action_kind: "queue_scope_dedupe_required" }],
  ["agent2-orot-gap-tok-d29b2c27700e", { source_rid: "M00032", occurrences: 18, owner_action_kind: "source_citation_ref_gap_resolution_required" }],
  ["agent2-orot-gap-tok-e50370ece8ba", { source_rid: "E00687", occurrences: 11, owner_action_kind: "exact_rid_scope_required" }]
]);

if (!Array.isArray(artifact.rows) || artifact.rows.length !== 3) {
  throw new Error("expected exactly three rows");
}

for (const row of artifact.rows) {
  const expected = expectedRows.get(row.queue_id);
  if (!expected) {
    throw new Error(`unexpected queue_id: ${row.queue_id}`);
  }
  if (row.source_rid !== expected.source_rid || row.occurrences !== expected.occurrences || row.owner_action_kind !== expected.owner_action_kind) {
    throw new Error(`unexpected row mapping for ${row.queue_id}`);
  }
  if (row.source_license_lane !== "commercial_clean_candidate") {
    throw new Error(`unexpected source license lane for ${row.queue_id}`);
  }
  if (row.transform_rule !== "no_text_transform_until_prereqs_clear") {
    throw new Error(`unexpected transform rule for ${row.queue_id}`);
  }
  for (const field of [
    "proposed_candidate_text",
    "proposed_definition_text",
    "proposed_lemma_text",
    "proposed_reader_hint_text"
  ]) {
    if (row[field] !== null) {
      throw new Error(`text field must remain null for ${row.queue_id}: ${field}`);
    }
  }
}

for (const sourceRow of agent10.rows) {
  const artifactRow = artifact.rows.find((row) => row.queue_id === sourceRow.queue_id);
  if (!artifactRow) {
    throw new Error(`Agent10 row missing from Agent2 consumption: ${sourceRow.queue_id}`);
  }
  if (artifactRow.exact_blocker !== sourceRow.exact_blocker) {
    throw new Error(`Agent10 exact blocker mismatch for ${sourceRow.queue_id}`);
  }
}

for (const expected of [
  "agent10_no_text_transform_rule_consumed_blocks_text_until_prereqs_clear",
  "missing_agent1_agent2_source_citation_or_owner_action_return_after_contract",
  "missing_source_field::source_citation_or_url",
  "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator",
  "missing_source_citation_resolution_for_zero_ref_gap_source_rid",
  "missing_exact_rid_scope_for_multi_rid_custody_row",
  "agent6_boundary_packet_not_ready_no_agent6_packet_now",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!artifact.exact_blockers.includes(expected)) {
    throw new Error(`missing exact blocker: ${expected}`);
  }
}

for (const stale of [
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule"
]) {
  if (artifact.exact_blockers.includes(stale)) {
    throw new Error(`stale transform blocker must not remain after no-text rule is consumed: ${stale}`);
  }
}

console.log(
  `Agent2 Agent10 no-text transform rule consumption validation passed. Rows: ${counts.rows}; no-text rule rows: ${counts.agent10_no_text_transform_rule_consumed_rows}; text rows: ${counts.proposed_candidate_text_rows}.`
);
