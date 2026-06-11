import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_old_dictionary_78_row_transform_output_proposal_blocker_stale_agent1_route.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const requiredTopLevel = [
  "artifact_type",
  "target",
  "required_agent_1_fields",
  "transform_action_once_classified",
  "files_used",
  "lane_counts_rows_consumed",
  "exact_blockers",
  "handoff_owner",
  "output_artifact_path",
  "stop_condition"
];

for (const key of requiredTopLevel) {
  if (!(key in artifact)) {
    throw new Error(`missing top-level field: ${key}`);
  }
}

if (artifact.artifact_type !== "agent2_old_dictionary_78_row_transform_output_proposal_blocker") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

const counts = artifact.lane_counts_rows_consumed;
const expectedCounts = {
  rows: 78,
  occurrences: 1461,
  source_license_lane: "commercial_clean_candidate",
  relation_class: "exact_after_mark_strip",
  morphology_relation_status: "agent2_morphology_relation_approved_for_nonpublic_planning",
  candidate_text_rows: 0,
  definition_lemma_reader_hint_rows: 0,
  answer_eligible_rows: 0,
  public_emit_rows: 0,
  route_writes: 0,
  accepted_text_rows: 0,
  export_rows: 0,
  release_actions: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

const requiredAgent1Fields = [
  "queue_id",
  "token_id",
  "lexicon_entry_id",
  "occurrences",
  "source_family",
  "license_lane",
  "source_rids",
  "morphology_relation_basis",
  "agent2_morphology_relation_status",
  "candidate_use_scope",
  "derived_from_nc",
  "commercial_export_allowed",
  "attribution_required",
  "corpus_contamination",
  "answer_eligible",
  "public_emit",
  "agent6_boundary_required",
  "source_citation_or_url"
];

for (const field of requiredAgent1Fields) {
  if (artifact.required_agent_1_fields[field] !== true) {
    throw new Error(`required_agent_1_fields.${field} must be true`);
  }
}

const blockers = new Set(artifact.exact_blockers);
for (const blocker of [
  "missing_source_field::source_citation_or_url",
  "missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text",
  "next_transform_output_or_candidate_text_boundary_not_supplied",
  "stale_agent1_registry_target_current_agent1_thread_required"
]) {
  if (!blockers.has(blocker)) {
    throw new Error(`missing exact blocker: ${blocker}`);
  }
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const forbiddenFragments = [
  "definition authority true",
  "answer eligible true",
  "public emit true",
  "accepted text true",
  "publication readiness true",
  "release action true",
  "commercial export authorized"
];

const serialized = JSON.stringify(artifact).toLowerCase();
for (const fragment of forbiddenFragments) {
  if (serialized.includes(fragment)) {
    throw new Error(`forbidden acceptance fragment present: ${fragment}`);
  }
}

console.log(
  `Agent2 stale Agent1 route blocker validation passed. Rows: ${counts.rows}; occurrences: ${counts.occurrences}; blockers: ${artifact.exact_blockers.length}.`
);
