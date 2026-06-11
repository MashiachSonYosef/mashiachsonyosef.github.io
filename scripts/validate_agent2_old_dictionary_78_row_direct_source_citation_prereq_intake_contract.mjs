import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
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
  unique_source_rids: 5,
  unique_source_rid_prefixes: 5,
  unique_queue_ids: 5,
  unique_token_ids: 5,
  unique_lexicon_entry_ids: 5,
  source_citation_required_rows: 5,
  source_citation_or_url_present_rows: 0,
  source_citation_or_url_missing_rows: 5,
  transform_rule_still_blocked_rows: 5,
  agent6_boundary_after_prereq_rows: 5,
  source_family_selection_boundary_blocker_rows: 0,
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
  export_rows: 0,
  release_actions: 0,
  acceptance_claims: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

const requiredFields = new Set(artifact.required_agent1_return_fields_for_each_direct_row);
for (const field of [
  "queue_id",
  "token_id",
  "lexicon_entry_id",
  "source_rid",
  "source_rid_prefix",
  "source_family",
  "source_license_lane",
  "source_citation_or_url",
  "citation_basis",
  "source_acceptance_claimed",
  "agent6_boundary_required"
]) {
  if (!requiredFields.has(field)) {
    throw new Error(`missing required Agent1 return field: ${field}`);
  }
}

if (!Array.isArray(artifact.direct_identifier_rows) || artifact.direct_identifier_rows.length !== 5) {
  throw new Error("expected exactly 5 direct identifier rows");
}

const expectedRows = new Map([
  ["M00032", ["agent2-orot-gap-tok-d29b2c27700e", 18]],
  ["P00280", ["agent2-orot-gap-tok-126d54d64a8c", 13]],
  ["E00687", ["agent2-orot-gap-tok-e50370ece8ba", 11]],
  ["U00063", ["agent2-orot-gap-tok-d6cbb8ff849c", 9]],
  ["I00126", ["agent2-orot-gap-tok-f14e3500010d", 7]]
]);

let occurrenceTotal = 0;
for (const row of artifact.direct_identifier_rows) {
  const expected = expectedRows.get(row.source_rid);
  if (!expected) {
    throw new Error(`unexpected source_rid: ${row.source_rid}`);
  }
  if (row.queue_id !== expected[0]) {
    throw new Error(`unexpected queue_id for ${row.source_rid}: ${row.queue_id}`);
  }
  if (row.occurrences !== expected[1]) {
    throw new Error(`unexpected occurrences for ${row.source_rid}: ${row.occurrences}`);
  }
  if (row.source_family !== "Jastrow Dictionary") {
    throw new Error(`unexpected source_family for ${row.source_rid}: ${row.source_family}`);
  }
  if (row.triage_group !== "commercial_clean_only") {
    throw new Error(`unexpected triage_group for ${row.source_rid}: ${row.triage_group}`);
  }
  if (row.source_citation_or_url_present !== false) {
    throw new Error(`source_citation_or_url_present must be false for ${row.source_rid}`);
  }
  if (row.transform_rule_still_blocked !== true) {
    throw new Error(`transform_rule_still_blocked must be true for ${row.source_rid}`);
  }
  occurrenceTotal += row.occurrences;
}

if (occurrenceTotal !== 58) {
  throw new Error(`unexpected occurrence total: ${occurrenceTotal}`);
}

const serialized = JSON.stringify(artifact);
for (const forbiddenKey of ["surfaces", "normalized_forms", "source_text", "candidate_text", "definition_text", "lemma_text", "reader_hint_text"]) {
  if (serialized.includes(`"${forbiddenKey}"`)) {
    throw new Error(`forbidden text/source field stored: ${forbiddenKey}`);
  }
}

for (const blocker of [
  "missing_source_field::source_citation_or_url",
  "missing_transform_output_proposal_matrix_or_exact_transform_rule",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "next_transform_output_or_candidate_text_boundary_not_supplied",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!artifact.exact_blockers.includes(blocker)) {
    throw new Error(`missing exact blocker: ${blocker}`);
  }
}

console.log(
  `Agent2 direct source-citation prereq intake contract validation passed. Direct rows: ${counts.direct_rows}; direct occurrences: ${counts.direct_occurrences}; citation missing rows: ${counts.source_citation_or_url_missing_rows}.`
);
