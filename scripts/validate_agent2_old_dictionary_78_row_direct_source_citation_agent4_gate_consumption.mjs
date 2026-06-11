import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_78_row_direct_source_citation_agent4_gate_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_78_row_direct_source_citation_agent4_gate_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const gate = artifact.agent4_gate_consumed;
const expectedGate = {
  gate_result: "validated_agent2_direct_source_citation_prereq_intake_contract_only",
  validator_check_passed: true,
  positional_validator_passed: true,
  input_flag_validator_failed_without_mutation: true,
  changed_input_after_gate: false,
  changed_input_blocker: "changed_package_input_missing",
  packet_sweep_result: "validated_agent4_packet_corpus_after_agent2_direct_source_citation_intake",
  packet_sweep_passed: 75,
  packet_sweep_failed: 0
};

for (const [key, expected] of Object.entries(expectedGate)) {
  if (gate[key] !== expected) {
    throw new Error(`unexpected gate ${key}: expected ${expected}, got ${gate[key]}`);
  }
}

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  parent_rows: 78,
  parent_occurrences: 1461,
  direct_rows: 5,
  direct_occurrences: 58,
  source_license_lane: "commercial_clean_candidate",
  triage_group: "commercial_clean_only",
  source_family: "Jastrow Dictionary",
  source_citation_required_rows: 5,
  source_citation_or_url_present_rows: 0,
  source_citation_or_url_missing_rows: 5,
  transform_rule_still_blocked_rows: 5,
  source_family_selection_boundary_blocker_rows: 0,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_eligible_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  export_rows: 0,
  release_actions: 0,
  acceptance_claims: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected count ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

for (const blocker of [
  "missing_source_field::source_citation_or_url",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "next_transform_output_or_candidate_text_boundary_not_supplied",
  "stale_agent1_registry_target_current_agent1_thread_required",
  "changed_package_input_missing"
]) {
  if (!artifact.exact_blockers.includes(blocker)) {
    throw new Error(`missing exact blocker: ${blocker}`);
  }
}

const next = artifact.required_next_input_before_agent2_transform;
if (next.agent1_source_citation_return.required !== true || next.agent1_source_citation_return.rows !== 5) {
  throw new Error("agent1 source-citation return requirement must target 5 rows");
}
if (next.agent10_transform_rule_return.required !== true) {
  throw new Error("agent10 transform rule requirement must be true");
}
if (next.agent6_boundary.current_packet_ready !== false) {
  throw new Error("agent6 current_packet_ready must be false");
}

const serialized = JSON.stringify(artifact);
for (const forbiddenKey of ["surfaces", "normalized_forms", "source_text", "candidate_text", "definition_text", "lemma_text", "reader_hint_text"]) {
  if (serialized.includes(`"${forbiddenKey}"`)) {
    throw new Error(`forbidden text/source field stored: ${forbiddenKey}`);
  }
}

console.log(
  `Agent2 Agent4 gate consumption validation passed. Direct rows: ${counts.direct_rows}; citation missing rows: ${counts.source_citation_or_url_missing_rows}; changed input after gate: ${gate.changed_input_after_gate}.`
);
