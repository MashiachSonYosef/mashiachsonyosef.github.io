import fs from "node:fs";

const artifactPath = process.argv[2];
const writeResult = process.argv.includes("--write-result");
if (!artifactPath) {
  throw new Error("usage: node scripts/validate_agent2_full_corpus_render_staging_consumption_range.mjs <artifact.json> [--write-result]");
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function sumRows(rows, field) {
  return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
}

function boundaryText(packet) {
  if (Array.isArray(packet.boundary)) {
    return packet.boundary.join(" ");
  }
  return String(packet.boundary || "");
}

function collectUnsafePrehudCount(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + collectUnsafePrehudCount(item), 0);
  }
  if (typeof value === "object") {
    let total = 0;
    for (const [key, child] of Object.entries(value)) {
      const normalized = key.toLowerCase();
      if (
        typeof child === "number" &&
        (normalized.includes("unsafe_prehud") ||
          normalized.includes("bad_prehud") ||
          normalized.includes("exact_unsafe_prehud"))
      ) {
        total += child;
      } else {
        total += collectUnsafePrehudCount(child);
      }
    }
    return total;
  }
  return 0;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const artifact = readJson(artifactPath);
assert(
  /^agent2_full_corpus_batches\d{2}-\d{2}_flagship_render_staging_consumption$/.test(artifact.artifact_type),
  `unexpected artifact_type: ${artifact.artifact_type}`
);
assert(Array.isArray(artifact.source_batch_ids) && artifact.source_batch_ids.length > 0, "source_batch_ids missing");

const referencedPaths = artifact.files_used.agent10_render_staging_packets.flatMap((packet) =>
  packet.md ? [packet.json, packet.md] : [packet.json]
);
for (const optionalPath of [
  artifact.files_used.agent2_prior_consumption_anchor,
  artifact.files_used.agent2_a14_pipeline_redesign_input
]) {
  if (optionalPath) {
    referencedPaths.push(optionalPath);
  }
}
for (const path of referencedPaths) {
  assert(fs.existsSync(path), `referenced file missing: ${path}`);
}

const computed = {
  source_batches: artifact.source_batch_ids.length,
  source_rows: 0,
  render_stage_candidate_rows: 0,
  blocked_in_batch_rows: 0,
  token_rows_total: 0,
  configured_hint_rows_total: 0,
  expected_tbd_rows_total: 0,
  browser_proof_batches: 0,
  static_validated_batches: 0,
  static_proof_object_batches: 0,
  static_validated_without_static_proof_object_batches: 0,
  explicit_non_batch_blockers: 0,
  process_timeouts_consumed: 0,
  bad_prehud_glosses: 0
};

for (const batchId of artifact.source_batch_ids) {
  const sourcePath = `reports/agent10-full-corpus-batch${batchId}-flagship-render-staging-packet-2026-06-07.json`;
  const source = readJson(sourcePath);
  assert(
    source.artifact_type === `agent10_full_corpus_batch${batchId}_flagship_render_staging_packet`,
    `unexpected source artifact_type for Batch${batchId}: ${source.artifact_type}`
  );
  const statusMatch = String(source.status || "").match(
    new RegExp(`^BATCH${batchId}_(\\d+)_READY(?:_[A-Z0-9]+)*_DIRECT_RENDER_CONTRACT(?:_STATIC_VALIDATED)?$`)
  );
  assert(statusMatch, `unexpected source status for Batch${batchId}: ${source.status}`);
  const expectedRows = Number(statusMatch[1]);
  assert(
    Array.isArray(source.batch) && source.batch.length === expectedRows,
    `Batch${batchId} must contain ${expectedRows} rows from status`
  );

  const boundary = boundaryText(source).toLowerCase();
  for (const required of [
    "staging evidence only",
    "no QA/source/license/legal/Definition/product/answer/accepted-text acceptance",
    "no publication/release/public-runtime acceptance"
  ]) {
    assert(boundary.includes(required.toLowerCase()), `source boundary missing "${required}" for Batch${batchId}`);
  }

  const rows = source.batch;
  const ready = rows.filter((row) => String(row.state || "").startsWith("stage_candidate"));
  const blocked = rows.filter((row) => String(row.state || "").startsWith("blocked"));
  assert(ready.length === expectedRows, `Batch${batchId} ready count must be ${expectedRows}`);
  assert(blocked.length === 0, `Batch${batchId} blocked count must be 0`);
  for (const row of rows) {
    assert(row.reader_layout_mode === "prehud_rows", `Batch${batchId} non-preHUD row: ${row.work}`);
  }

  computed.source_rows += rows.length;
  computed.render_stage_candidate_rows += ready.length;
  computed.blocked_in_batch_rows += blocked.length;
  computed.token_rows_total += sumRows(rows, "token_rows");
  computed.configured_hint_rows_total += sumRows(rows, "configured_hint_rows");
  computed.expected_tbd_rows_total += sumRows(rows, "expected_tbd_rows");
  computed.bad_prehud_glosses += collectUnsafePrehudCount(source.browser_proof);
  computed.explicit_non_batch_blockers += source.explicit_non_batch_blocker ? 1 : 0;
  computed.process_timeouts_consumed += Array.isArray(source.process_timeout) ? source.process_timeout.length : 0;
  if (source.status.includes("STATIC_VALIDATED")) {
    computed.static_validated_batches += 1;
    if (source.static_proof) {
      computed.static_proof_object_batches += 1;
    } else {
      computed.static_validated_without_static_proof_object_batches += 1;
    }
  } else if (source.browser_proof) {
    computed.browser_proof_batches += 1;
  }

  const summary = artifact.batch_summary.find((batch) => batch.batch_id === batchId);
  assert(summary, `missing batch summary for Batch${batchId}`);
  assert(summary.source_rows === rows.length, `summary row count mismatch for Batch${batchId}`);
  assert(summary.render_stage_candidate_rows === ready.length, `summary ready count mismatch for Batch${batchId}`);
  assert(summary.blocked_in_batch_rows === blocked.length, `summary blocked count mismatch for Batch${batchId}`);
  assert(summary.token_rows_total === sumRows(rows, "token_rows"), `summary token total mismatch for Batch${batchId}`);

  for (const sourceRow of rows) {
    const artifactRow = artifact.page_readiness_matrix.find(
      (row) => row.batch_id === batchId && row.index === sourceRow.index
    );
    assert(artifactRow, `missing matrix row for Batch${batchId} index ${sourceRow.index}`);
    assert(artifactRow.work === sourceRow.work, `matrix work mismatch for Batch${batchId} index ${sourceRow.index}`);
    assert(artifactRow.page === sourceRow.page, `matrix page mismatch for ${sourceRow.work}`);
    assert(artifactRow.token_rows === sourceRow.token_rows, `matrix token rows mismatch for ${sourceRow.work}`);
    assert(
      String(artifactRow.agent2_render_stage_status).startsWith("render_stage_candidate") &&
        artifactRow.agent2_render_stage_status.endsWith("not_public_acceptance"),
      `matrix row overclaims render/public status for ${sourceRow.work}`
    );
    assert(
      Array.isArray(artifactRow.exact_blockers) && artifactRow.exact_blockers.length === 0,
      `matrix in-scope blockers must be empty for ${sourceRow.work}`
    );
  }
}

const totals = artifact.lane_counts_rows_consumed.render_pre_hud_staging_evidence;
for (const [key, expected] of Object.entries(computed)) {
  assert(totals[key] === expected, `unexpected total ${key}: expected ${expected}, got ${totals[key]}`);
}
for (const [key, expected] of Object.entries({
  definition_transform_rows: 0,
  accepted_text_rows: 0,
  answer_eligible_rows: 0,
  public_emit_rows: 0,
  route_shard_writes: 0,
  release_actions: 0
})) {
  assert(totals[key] === expected, `unexpected zero-boundary count ${key}: got ${totals[key]}`);
}
assert(
  Array.isArray(artifact.page_readiness_matrix) && artifact.page_readiness_matrix.length === computed.source_rows,
  "page_readiness_matrix row count mismatch"
);
assert(
  artifact.proof_summary.bad_prehud_glosses_total === 0 && totals.bad_prehud_glosses === 0,
  "bad/unsafe pre-HUD gloss total must be 0"
);
assert(Array.isArray(artifact.exact_blockers.in_scope_batch_blockers), "in_scope_batch_blockers missing");
assert(artifact.exact_blockers.in_scope_batch_blockers.length === 0, "in-scope batch blockers must be empty");

for (const required of [
  "render_pre_hud_staging_evidence_only",
  "no_QA_source_license_legal_Definition_product_answer_accepted_text_acceptance",
  "no_public_runtime_acceptance",
  "no_publication_readiness_or_release_claim",
  "no_route_shard_write",
  "no_repo_cleanup_action"
]) {
  assert(artifact.boundary.includes(required), `missing boundary: ${required}`);
}

const result = {
  artifact_type: `${artifact.artifact_type}_validation_result`,
  generated_at: new Date().toISOString(),
  validated_artifact: artifactPath,
  status: "passed",
  checks: {
    source_batches: computed.source_batches,
    source_rows: computed.source_rows,
    render_stage_candidate_rows: computed.render_stage_candidate_rows,
    blocked_in_batch_rows: computed.blocked_in_batch_rows,
    token_rows_total: computed.token_rows_total,
    configured_hint_rows_total: computed.configured_hint_rows_total,
    expected_tbd_rows_total: computed.expected_tbd_rows_total,
    browser_proof_batches: computed.browser_proof_batches,
    static_validated_batches: computed.static_validated_batches,
    static_proof_object_batches: computed.static_proof_object_batches,
    static_validated_without_static_proof_object_batches: computed.static_validated_without_static_proof_object_batches,
    explicit_non_batch_blockers: computed.explicit_non_batch_blockers,
    process_timeouts_consumed: computed.process_timeouts_consumed,
    bad_prehud_glosses: computed.bad_prehud_glosses,
    definition_transform_rows: totals.definition_transform_rows,
    public_emit_rows: totals.public_emit_rows,
    route_shard_writes: totals.route_shard_writes,
    release_actions: totals.release_actions
  },
  boundary: artifact.boundary,
  stop_condition: artifact.stop_condition
};

if (writeResult) {
  fs.writeFileSync(artifact.output_artifacts.validation_result_json, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    artifact.output_artifacts.validation_result_md,
    [
      `# ${artifact.artifact_type} Validation`,
      "",
      `Status: ${result.status}`,
      "",
      `Validated artifact: ${artifactPath}`,
      "",
      `Source batches: ${computed.source_batches}`,
      `Source rows: ${computed.source_rows}`,
      `Render-stage candidate rows: ${computed.render_stage_candidate_rows}`,
      `Blocked in-batch rows: ${computed.blocked_in_batch_rows}`,
      `Bad/unsafe pre-HUD glosses: ${computed.bad_prehud_glosses}`,
      `Definition transform rows: ${totals.definition_transform_rows}`,
      `Public emit rows: ${totals.public_emit_rows}`,
      `Route shard writes: ${totals.route_shard_writes}`,
      `Release actions: ${totals.release_actions}`,
      "",
      artifact.stop_condition
    ].join("\n") + "\n",
    "utf8"
  );
}

console.log(
  `Agent2 ${artifact.source_batch_ids[0]}-${artifact.source_batch_ids.at(-1)} render staging consumption validation passed. Source rows: ${computed.source_rows}; stage candidates: ${computed.render_stage_candidate_rows}; in-batch blockers: ${computed.blocked_in_batch_rows}; bad pre-HUD glosses: ${computed.bad_prehud_glosses}.`
);
