import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_bridge_gap_blocker_worksets_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_bridge_gap_blocker_worksets_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
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
  bridge_gap_overlay_rows: 14,
  bridge_gap_overlay_occurrences: 173,
  direct_source_citation_blocker_rows: 5,
  direct_source_citation_blocker_occurrences: 58,
  direct_source_citation_source_rid_links: 5,
  a06_row_level_downstream_blocker_rows: 9,
  a06_row_level_downstream_blocker_occurrences: 115,
  a06_row_level_downstream_source_rid_links: 25,
  owner_action_rows: 3,
  owner_action_occurrences: 42,
  owner_action_unique_source_rids: 3,
  source_citation_or_url_present_rows: 0,
  source_citation_or_url_present_links: 0,
  source_citation_or_url_missing_direct_rows: 5,
  source_citation_or_url_missing_a06_rows: 9,
  transform_rule_still_blocked_direct_rows: 5,
  transform_rule_still_blocked_a06_rows: 9,
  transform_rule_still_blocked_owner_action_rows: 3,
  a07_approval_route_rows: 14,
  a06_evidence_owner_rows: 14,
  a06_approval_requested_rows: 0,
  a06_evidence_ready_until_a07_rows: 14,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_rows: 0,
  answer_eligible_rows: 0,
  route_jsonl_rows: 0,
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

if (!Array.isArray(artifact.consumed_worksets) || artifact.consumed_worksets.length !== 3) {
  throw new Error("expected exactly three consumed workset summaries");
}

const expectedOwnerActions = new Map([
  ["P00280", ["queue_scope_dedupe_required", "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator", 13]],
  ["M00032", ["source_citation_ref_gap_resolution_required", "missing_source_citation_resolution_for_zero_ref_gap_source_rid", 18]],
  ["E00687", ["exact_rid_scope_required", "missing_exact_rid_scope_for_multi_rid_custody_row", 11]]
]);

if (!Array.isArray(artifact.owner_action_rows) || artifact.owner_action_rows.length !== 3) {
  throw new Error("expected exactly three owner-action rows");
}

for (const row of artifact.owner_action_rows) {
  const expected = expectedOwnerActions.get(row.source_rid);
  if (!expected) {
    throw new Error(`unexpected owner-action source_rid: ${row.source_rid}`);
  }
  if (row.owner_action_kind !== expected[0]) {
    throw new Error(`unexpected owner action for ${row.source_rid}: ${row.owner_action_kind}`);
  }
  if (row.exact_blocker !== expected[1]) {
    throw new Error(`unexpected owner blocker for ${row.source_rid}: ${row.exact_blocker}`);
  }
  if (row.occurrences !== expected[2]) {
    throw new Error(`unexpected occurrences for ${row.source_rid}: ${row.occurrences}`);
  }
  if (row.approval_route_owner !== "A07" || row.evidence_validator_owner !== "A06" || row.a06_approval_requested !== false) {
    throw new Error(`route correction not preserved for ${row.source_rid}`);
  }
  for (const forbidden of ["surface", "normalized", "source_text", "candidate_text", "definition_text", "lemma_text", "reader_hint_text"]) {
    if (Object.prototype.hasOwnProperty.call(row, forbidden)) {
      throw new Error(`forbidden text/source field stored on ${row.source_rid}: ${forbidden}`);
    }
  }
}

for (const expected of [
  "direct_source_citation_or_url_missing_after_agent2_intake_match",
  "a06_evidence_boundary_row_level_downstream_intake_missing",
  "direct_source_rid_owner_action_resolution_required",
  "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator",
  "missing_source_citation_resolution_for_zero_ref_gap_source_rid",
  "missing_exact_rid_scope_for_multi_rid_custody_row",
  "approval_request_misrouted_to_A06",
  "A06_output_is_evidence_ready_only_until_A07_approval",
  "missing_source_field::source_citation_or_url",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "next_transform_output_or_candidate_text_boundary_not_supplied",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!artifact.exact_blockers.includes(expected)) {
    throw new Error(`missing exact blocker: ${expected}`);
  }
}

console.log(
  `Agent2 bridge-gap blocker worksets consumption validation passed. Direct rows: ${counts.direct_source_citation_blocker_rows}; A06 rows: ${counts.a06_row_level_downstream_blocker_rows}; owner-action rows: ${counts.owner_action_rows}.`
);
