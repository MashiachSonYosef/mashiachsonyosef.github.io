import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_bridge_gap_row_level_return_contract_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_bridge_gap_row_level_return_contract_consumption") {
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
  throw new Error("A06 evidence-only boundary was not preserved");
}

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  input_downstream_gap_rows: 3,
  contract_rows: 3,
  contract_occurrences: 42,
  unique_source_rids: 3,
  agent10_return_contract_rows: 3,
  agent1_agent2_return_contract_rows: 3,
  queue_scope_dedupe_contract_rows: 1,
  ref_gap_contract_rows: 1,
  exact_rid_scope_contract_rows: 1,
  agent10_return_field_cells: 21,
  agent1_agent2_return_field_cells: 27,
  action_specific_return_field_cells: 3,
  row_level_downstream_gap_rows: 3,
  agent10_broad_context_rows: 3,
  agent10_row_level_consumed_rows: 0,
  source_citation_or_url_present_rows: 0,
  transform_rule_still_blocked_rows: 3,
  a07_approval_route_rows: 3,
  a06_evidence_owner_rows: 3,
  a06_approval_requested_rows: 0,
  source_license_acceptance_claims: 0,
  source_provenance_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
  source_text_rows: 0,
  definition_authority_rows: 0,
  answer_selection_rows: 0,
  route_publication_support_rows: 0,
  accepted_text_rows: 0,
  release_actions: 0,
  publication_or_release_claims: 0,
  acceptance_claims: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected count ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

for (const field of [
  "queue_id",
  "source_rid",
  "owner_action_kind",
  "row_level_consumption_artifact_or_exact_nonconsumption_blocker",
  "consumed_agent3_gap_artifact",
  "downstream_owner_next_step",
  "approval_route_owner"
]) {
  if (!artifact.required_agent10_return_fields.includes(field)) {
    throw new Error(`missing required Agent10 return field: ${field}`);
  }
}

for (const field of [
  "queue_id",
  "source_rid",
  "source_citation_or_url_or_exact_missing_source_citation_blocker",
  "owner_action_resolution_or_exact_blocker",
  "transform_blocked_until_prereqs_clear",
  "no_source_license_acceptance_claim",
  "no_definition_or_answer_claim",
  "approval_route_owner"
]) {
  if (!artifact.required_agent1_agent2_return_fields_base.includes(field)) {
    throw new Error(`missing required Agent1/Agent2 return field: ${field}`);
  }
}

const expectedRows = new Map([
  ["P00280", ["queue_scope_dedupe_required", "queue_scope_dedupe_resolution_or_exact_duplicate_blocker", 13]],
  ["M00032", ["source_citation_ref_gap_resolution_required", "ref_gap_source_citation_resolution_or_exact_missing_citation_blocker", 18]],
  ["E00687", ["exact_rid_scope_required", "exact_rid_scope_resolution_or_exact_scope_blocker", 11]]
]);

if (!Array.isArray(artifact.contract_rows) || artifact.contract_rows.length !== 3) {
  throw new Error("expected exactly three contract rows");
}

for (const row of artifact.contract_rows) {
  const expected = expectedRows.get(row.source_rid);
  if (!expected) {
    throw new Error(`unexpected contract source_rid: ${row.source_rid}`);
  }
  if (row.owner_action_kind !== expected[0]) {
    throw new Error(`unexpected owner action for ${row.source_rid}: ${row.owner_action_kind}`);
  }
  if (row.action_specific_return_field !== expected[1]) {
    throw new Error(`unexpected action-specific field for ${row.source_rid}: ${row.action_specific_return_field}`);
  }
  if (row.occurrences !== expected[2]) {
    throw new Error(`unexpected occurrences for ${row.source_rid}: ${row.occurrences}`);
  }
  if (row.source_citation_or_url_present !== false || row.transform_rule_still_blocked !== true) {
    throw new Error(`citation/transform blocker not preserved for ${row.source_rid}`);
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
  "owner_action_row_has_broad_context_but_no_row_level_downstream_consumption",
  "direct_source_citation_prereq_matched_but_source_citation_or_url_missing",
  "missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator",
  "missing_source_citation_resolution_for_zero_ref_gap_source_rid",
  "missing_exact_rid_scope_for_multi_rid_custody_row",
  "missing_source_field::source_citation_or_url",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "approval_request_misrouted_to_A06",
  "A06_output_is_evidence_ready_only_until_A07_approval"
]) {
  if (!artifact.exact_blockers.includes(expected)) {
    throw new Error(`missing exact blocker: ${expected}`);
  }
}

console.log(
  `Agent2 row-level return contract consumption validation passed. Contract rows: ${counts.contract_rows}; occurrences: ${counts.contract_occurrences}; Agent10 row-level consumed rows: ${counts.agent10_row_level_consumed_rows}.`
);
