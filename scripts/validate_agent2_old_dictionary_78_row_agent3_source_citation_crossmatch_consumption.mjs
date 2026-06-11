import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_78_row_agent3_source_citation_crossmatch_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_old_dictionary_78_row_agent3_source_citation_crossmatch_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

const required = [
  "target",
  "files_used",
  "lane_counts_rows_consumed",
  "agent3_lineage_evidence_consumed",
  "transform_action_once_unblocked",
  "exact_blockers",
  "handoff_owner",
  "output_artifact_path",
  "stop_condition"
];

for (const key of required) {
  if (!(key in artifact)) {
    throw new Error(`missing top-level field: ${key}`);
  }
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  rows: 78,
  occurrences: 1461,
  source_license_lane: "commercial_clean_candidate",
  relation_class: "exact_after_mark_strip",
  morphology_relation_status: "agent2_morphology_relation_approved_for_nonpublic_planning",
  boundary_chain_rows_linked: 78,
  boundary_chain_rows_missing: 0,
  row_count_mismatch: 0,
  occurrence_count_mismatch: 0,
  source_citation_supplied_rows: 0,
  source_citation_missing_rows: 78,
  transform_rule_supplied_rows: 0,
  transform_rule_missing_rows: 78,
  transform_ready_rows: 0,
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
  source_acceptance_claims: 0,
  acceptance_claims: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected count ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

const lineage = artifact.agent3_lineage_evidence_consumed;
const expectedLineage = {
  status: "evidence-ready",
  authority_role: "source_citation_dependency_navigation_only_no_source_or_transform_authority",
  source_family_rows: 3,
  source_family_memberships: 159,
  source_rid_references: 393,
  unique_source_rids: 344,
  source_rid_prefix_rows: 21,
  exact_blocker_rows: 5,
  stale_agent1_route_blocker_rows: 1
};

for (const [key, expected] of Object.entries(expectedLineage)) {
  if (lineage[key] !== expected) {
    throw new Error(`unexpected lineage ${key}: expected ${expected}, got ${lineage[key]}`);
  }
}

if (!Array.isArray(lineage.source_families) || lineage.source_families.length !== 3) {
  throw new Error("expected exactly 3 source family rows");
}

const blockers = new Set(artifact.exact_blockers);
for (const blocker of [
  "missing_source_citation_or_url_for_78_row_subset",
  "missing_source_field::source_citation_or_url",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "new_exact_agent6_packet_required_before_transform_output_candidate_text_definition_lemma_reader_hint_content_storage_answer_eligibility_route_write_public_runtime_mutation_export_accepted_text_publication_readiness_or_release",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!blockers.has(blocker)) {
    throw new Error(`missing exact blocker: ${blocker}`);
  }
}

console.log(
  `Agent2 Agent3 source-citation crossmatch consumption validation passed. Rows: ${counts.rows}; occurrences: ${counts.occurrences}; source citation missing rows: ${counts.source_citation_missing_rows}; transform ready rows: ${counts.transform_ready_rows}.`
);
