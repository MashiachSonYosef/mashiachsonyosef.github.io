import fs from "node:fs";

const artifactPath = process.argv[2];

if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_full_corpus_batch01_flagship_render_staging_consumption.mjs <artifact.json>");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (artifact.artifact_type !== "agent2_full_corpus_batch01_flagship_render_staging_consumption") {
  throw new Error(`unexpected artifact_type: ${artifact.artifact_type}`);
}

for (const [name, path] of Object.entries(artifact.files_used)) {
  if (!fs.existsSync(path)) {
    throw new Error(`referenced file missing (${name}): ${path}`);
  }
}

const source = JSON.parse(fs.readFileSync(artifact.files_used.agent10_render_staging_packet, "utf8"));
if (source.artifact_type !== "agent10_full_corpus_batch01_flagship_render_staging_packet") {
  throw new Error(`unexpected source artifact_type: ${source.artifact_type}`);
}
if (source.status !== "BATCH01_20_READY_DIRECT_RENDER_CONTRACT") {
  throw new Error(`unexpected source status: ${source.status}`);
}

if (!Array.isArray(source.batch) || source.batch.length !== 20) {
  throw new Error("source batch must contain exactly 20 works");
}

const sourceReady = source.batch.filter((row) => row.state.startsWith("stage_candidate")).length;
const sourceBlocked = source.batch.filter((row) => row.state === "blocked_validator").length;
if (sourceReady !== 20 || sourceBlocked !== 0) {
  throw new Error(`unexpected source readiness counts: ready=${sourceReady}; blocked=${sourceBlocked}`);
}

const sourceDaniel = source.batch.find((row) => row.work === "Daniel");
if (!sourceDaniel || sourceDaniel.state !== "stage_candidate_tbd_only") {
  throw new Error("Daniel must be the repaired TBD-only stage candidate row");
}
if (sourceDaniel.blocker !== null) {
  throw new Error("Daniel blocker must be null after repair");
}
if (sourceDaniel.repair?.route_hud_click_proof !== true || sourceDaniel.repair?.prehud_rows !== 5456 || sourceDaniel.repair?.tbd_rows !== 5456) {
  throw new Error("Daniel row-level repair proof must be present");
}
if (source.daniel_repair?.validator_result !== "passed" || source.daniel_repair?.browser_proof?.bad_prehud_glosses !== 0) {
  throw new Error("Daniel top-level repair/browser proof must be present and safe");
}

const counts = artifact.page_output_readiness_counts;
const expectedCounts = {
  batch_rows: 20,
  render_ready_stage_candidate_pages: 20,
  blocked_validator_pages: 0,
  token_rows_total: 184647,
  configured_hint_rows_total: 26148,
  expected_tbd_rows_total: 158776,
  browser_proof_pages: 3,
  bad_prehud_glosses: 0,
  public_runtime_acceptance_claims: 0,
  definition_acceptance_claims: 0,
  answer_acceptance_claims: 0,
  release_actions: 0,
  route_shard_writes: 0
};

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (counts[key] !== expected) {
    throw new Error(`unexpected count ${key}: expected ${expected}, got ${counts[key]}`);
  }
}

if (!Array.isArray(artifact.page_readiness_matrix) || artifact.page_readiness_matrix.length !== 20) {
  throw new Error("page_readiness_matrix must contain exactly 20 rows");
}

const readyRows = artifact.page_readiness_matrix.filter((row) => row.agent2_render_stage_status.startsWith("render_stage_candidate"));
const blockedRows = artifact.page_readiness_matrix.filter((row) => row.agent2_render_stage_status === "blocked_exact_validator_blocker");
if (readyRows.length !== 20 || blockedRows.length !== 0) {
  throw new Error(`unexpected artifact readiness counts: ready=${readyRows.length}; blocked=${blockedRows.length}`);
}

const daniel = artifact.page_readiness_matrix.find((row) => row.work === "Daniel");
if (!daniel || daniel.agent2_render_stage_status !== "render_stage_candidate_tbd_only_not_public_acceptance") {
  throw new Error("Daniel must be a repaired TBD-only render-stage candidate");
}
if (!Array.isArray(daniel.exact_blockers) || daniel.exact_blockers.length !== 0) {
  throw new Error("Daniel current exact blockers must be empty after repair");
}
if (!Array.isArray(artifact.historical_daniel_blocker_resolved) || artifact.historical_daniel_blocker_resolved.length !== 3) {
  throw new Error("historical Daniel blockers must be preserved as resolved history");
}

for (const sourceRow of source.batch) {
  const artifactRow = artifact.page_readiness_matrix.find((row) => row.work === sourceRow.work);
  if (!artifactRow) {
    throw new Error(`missing page row: ${sourceRow.work}`);
  }
  if (artifactRow.page !== sourceRow.page || artifactRow.token_rows !== sourceRow.token_rows) {
    throw new Error(`page row mismatch for ${sourceRow.work}`);
  }
}

for (const proofName of ["ruth_existing_hint_gate", "joel_zero_hint", "daniel_repair"]) {
  const proof = artifact.browser_proof_consumed[proofName];
  if (!proof) {
    throw new Error(`missing browser proof: ${proofName}`);
  }
  if (proof.bad_prehud_glosses !== 0) {
    throw new Error(`browser proof has bad pre-HUD glosses: ${proofName}`);
  }
}

for (const required of [
  "render_pre_hud_gating_only",
  "no_QA_source_license_legal_Definition_product_answer_accepted_text_acceptance",
  "no_public_runtime_acceptance",
  "no_publication_or_release_claim"
]) {
  if (!artifact.boundary.includes(required)) {
    throw new Error(`missing boundary: ${required}`);
  }
}

console.log(
  `Agent2 full-corpus batch01 render staging consumption validation passed. Ready pages: ${counts.render_ready_stage_candidate_pages}; blocked pages: ${counts.blocked_validator_pages}; bad pre-HUD glosses: ${counts.bad_prehud_glosses}.`
);
