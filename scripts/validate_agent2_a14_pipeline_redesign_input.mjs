import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_a14_pipeline_redesign_input.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_a14_pipeline_redesign_input") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const requiredTopLevel = [
  "message_to_a14",
  "agent2_pipeline_spec",
  "runes",
  "stage_contract",
  "dirty_repo_policy",
  "page_output_pressure",
  "role_redesign_recommendations",
  "deprecations",
  "stop_conditions"
];

for (const key of requiredTopLevel) {
  if (!artifact[key]) {
    throw new Error(`missing required top-level field: ${key}`);
  }
}

const spec = artifact.agent2_pipeline_spec;
if (spec.pipeline_name !== "definition_lemma_reader_hint_spec_pipeline") {
  throw new Error(`unexpected pipeline_name: ${spec.pipeline_name}`);
}
if (spec.primary_output !== "usable_page_ready_lexicon_payload_or_exact_blocker") {
  throw new Error(`unexpected primary_output: ${spec.primary_output}`);
}
if (spec.authority_boundary !== "non_authoritative_until_A07_where_required") {
  throw new Error(`unexpected authority_boundary: ${spec.authority_boundary}`);
}

for (const rune of [
  "LANE",
  "PREREQ",
  "NULL_TEXT",
  "MUTATION",
  "PAGE_READY",
  "BLOCKER",
  "VALIDATE",
  "HANDOFF",
  "STOP"
]) {
  if (!artifact.runes.find((row) => row.name === rune)) {
    throw new Error(`missing rune: ${rune}`);
  }
}

if (!Array.isArray(artifact.stage_contract) || artifact.stage_contract.length < 7) {
  throw new Error("stage_contract must contain at least seven stages");
}

const pageStage = artifact.stage_contract.find((stage) => stage.stage_id === "S7_page_ready_packaging");
if (!pageStage) {
  throw new Error("missing S7_page_ready_packaging stage");
}
if (pageStage.public_runtime_mutation_allowed !== false) {
  throw new Error("S7 must not allow public runtime mutation");
}

const dirty = artifact.dirty_repo_policy;
if (dirty.allow_repetitive_no_change_blockers !== false) {
  throw new Error("repetitive no-change blockers must be disallowed");
}
if (dirty.max_no_change_receipts_per_target !== 1) {
  throw new Error("max_no_change_receipts_per_target must be 1");
}

if (artifact.stop_conditions.no_public_runtime_mutation !== true) {
  throw new Error("stop condition must preserve no public runtime mutation");
}
if (artifact.stop_conditions.no_definition_or_answer_acceptance !== true) {
  throw new Error("stop condition must preserve no definition or answer acceptance");
}

console.log(
  `Agent2 A14 pipeline redesign input validation passed. Stages: ${artifact.stage_contract.length}; runes: ${artifact.runes.length}; no-change max: ${dirty.max_no_change_receipts_per_target}.`
);
