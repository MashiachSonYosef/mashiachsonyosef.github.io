import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_bridge_gap_a07_a06_route_overlay_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_bridge_gap_a07_a06_route_overlay_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const route = artifact.route_correction_consumed;
if (route.approval_sop_final_validation_release_gate_owner !== "A07") {
  throw new Error("approval route owner must be A07");
}
if (route.evidence_validators_repo_cleaning_production_owner !== "A06") {
  throw new Error("evidence route owner must be A06");
}
if (route.a06_outputs_evidence_ready_until_a07_approves !== true || route.do_not_ask_a06_for_approval !== true) {
  throw new Error("A06 evidence-only boundary is not preserved");
}
if (route.agent4_gate_result !== "validated_agent2_A07_approval_route_correction_gate") {
  throw new Error(`unexpected Agent4 gate result: ${route.agent4_gate_result}`);
}

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  overlay_rows: 14,
  overlay_occurrences: 173,
  source_rid_route_links: 30,
  unique_source_rids: 30,
  direct_source_citation_workset_rows: 5,
  direct_source_citation_workset_occurrences: 58,
  a06_evidence_boundary_workset_rows: 9,
  a06_evidence_boundary_workset_occurrences: 115,
  mixed_or_missing_workset_rows: 0,
  source_citation_required_links: 30,
  source_citation_or_url_present_links: 0,
  source_citation_or_url_missing_links: 30,
  transform_rule_still_blocked_links: 30,
  a07_approval_route_rows: 14,
  a06_evidence_validator_only_rows: 14,
  a06_approval_requested_rows: 0,
  a06_outputs_evidence_ready_until_a07_rows: 14,
  do_not_ask_a06_for_approval_rows: 14,
  existing_validated_words_preserved_rows: 14,
  redo_only_changed_or_flagged_rows: 14,
  source_family_selection_claims: 0,
  source_acceptance_claims: 0,
  source_license_acceptance_claims: 0,
  source_legal_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
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

if (!Array.isArray(artifact.downstream_workset_rows) || artifact.downstream_workset_rows.length !== 2) {
  throw new Error("expected exactly two downstream workset rows");
}

for (const expected of [
  "a07_route_overlay_a06_evidence_boundary_prereq_still_blocked_no_a06_approval",
  "a07_route_overlay_direct_source_citation_prereq_still_blocked",
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

const serialized = JSON.stringify(artifact);
for (const forbiddenKey of ["surface", "normalized", "source_text", "candidate_text", "definition_text", "lemma_text", "reader_hint_text"]) {
  if (serialized.includes(`"${forbiddenKey}"`)) {
    throw new Error(`forbidden text/source field stored: ${forbiddenKey}`);
  }
}

console.log(
  `Agent2 A07/A06 route overlay consumption validation passed. Overlay rows: ${counts.overlay_rows}; direct rows: ${counts.direct_source_citation_workset_rows}; A06 evidence rows: ${counts.a06_evidence_boundary_workset_rows}.`
);
