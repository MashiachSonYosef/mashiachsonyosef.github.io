import fs from "node:fs";

const artifactPath = process.argv[2];
const writeResult = process.argv.includes("--write-result");
const day = "2026-06-07";
const resultJsonPath =
  `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-validation-result-${day}.json`;
const resultMdPath =
  `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-validation-result-${day}.md`;

if (!artifactPath) {
  throw new Error(
    "usage: node scripts/validate_agent2_full_corpus_batches02_08_flagship_render_staging_consumption.mjs <artifact.json> [--write-result]"
  );
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function sumRows(rows, field) {
  return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
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

function collectReferencedPaths(artifact) {
  const paths = [];
  for (const packet of artifact.files_used.agent10_render_staging_packets) {
    paths.push(packet.json);
    if (packet.md) {
      paths.push(packet.md);
    }
  }
  paths.push(artifact.files_used.agent2_batch01_prior_consumption);
  paths.push(artifact.files_used.agent2_a14_pipeline_redesign_input);
  return paths;
}

const artifact = readJson(artifactPath);

assert(
  artifact.artifact_type === "agent2_full_corpus_batches02_08_flagship_render_staging_consumption",
  `unexpected artifact_type: ${artifact.artifact_type}`
);

const expectedBatchIds = ["02", "03", "04", "05", "06", "07", "08"];
assert(
  JSON.stringify(artifact.source_batch_ids) === JSON.stringify(expectedBatchIds),
  `unexpected source_batch_ids: ${JSON.stringify(artifact.source_batch_ids)}`
);

for (const path of collectReferencedPaths(artifact)) {
  assert(fs.existsSync(path), `referenced file missing: ${path}`);
}

const sources = expectedBatchIds.map((batchId) => {
  const sourcePath = `reports/agent10-full-corpus-batch${batchId}-flagship-render-staging-packet-${day}.json`;
  const source = readJson(sourcePath);
  assert(
    source.artifact_type === `agent10_full_corpus_batch${batchId}_flagship_render_staging_packet`,
    `unexpected source artifact_type for Batch${batchId}: ${source.artifact_type}`
  );
  assert(
    source.status === `BATCH${batchId}_20_READY_DIRECT_RENDER_CONTRACT` ||
      source.status === `BATCH${batchId}_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`,
    `unexpected source status for Batch${batchId}: ${source.status}`
  );
  assert(Array.isArray(source.batch), `source batch missing for Batch${batchId}`);
  assert(source.batch.length === 20, `source batch must contain 20 rows for Batch${batchId}`);
  assert(
    source.boundary?.includes("render/preHUD staging evidence only"),
    `source boundary missing render/preHUD for Batch${batchId}`
  );
  assert(
    source.boundary?.includes("no QA/source/license/legal/Definition/product/answer/accepted-text acceptance"),
    `source boundary missing no-acceptance clause for Batch${batchId}`
  );
  assert(
    source.boundary?.includes("no publication/release/public-runtime acceptance"),
    `source boundary missing no-publication clause for Batch${batchId}`
  );
  return { batchId, source, sourcePath };
});

const computed = {
  source_batches: sources.length,
  source_rows: 0,
  render_stage_candidate_rows: 0,
  blocked_in_batch_rows: 0,
  token_rows_total: 0,
  configured_hint_rows_total: 0,
  expected_tbd_rows_total: 0,
  browser_proof_batches: 0,
  static_validated_batches: 0,
  owner_waived_routine_browser_proof_batches: 0,
  explicit_non_batch_blockers: 0,
  process_timeouts_consumed: 0,
  bad_prehud_glosses: 0
};

for (const { batchId, source } of sources) {
  const rows = source.batch;
  const ready = rows.filter((row) => String(row.state || "").startsWith("stage_candidate"));
  const blocked = rows.filter((row) => String(row.state || "").startsWith("blocked"));
  assert(ready.length === 20, `Batch${batchId} ready row count must be 20`);
  assert(blocked.length === 0, `Batch${batchId} blocked row count must be 0`);
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

  if (source.static_proof) {
    computed.static_validated_batches += 1;
    computed.owner_waived_routine_browser_proof_batches += 1;
    assert(
      source.static_proof.all_route_hud_validators_passed === true,
      `Batch${batchId} static proof must preserve validator pass`
    );
  } else {
    computed.browser_proof_batches += 1;
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
  artifact.lane_counts_rows_consumed.definition_lane_consumption.commercial_clean_candidate_rows === 0,
  "commercial definition rows must not be consumed by render staging packet"
);
assert(
  artifact.lane_counts_rows_consumed.definition_lane_consumption.noncommercial_educational_candidate_rows === 0,
  "NC definition rows must not be consumed by render staging packet"
);
assert(
  Array.isArray(artifact.page_readiness_matrix) && artifact.page_readiness_matrix.length === 140,
  "page_readiness_matrix must contain exactly 140 rows"
);

for (const { batchId, source } of sources) {
  const summary = artifact.batch_summary.find((batch) => batch.batch_id === batchId);
  assert(summary, `missing batch summary for Batch${batchId}`);
  assert(summary.source_rows === 20, `summary rows mismatch for Batch${batchId}`);
  assert(summary.render_stage_candidate_rows === 20, `summary ready mismatch for Batch${batchId}`);
  assert(summary.blocked_in_batch_rows === 0, `summary blocked mismatch for Batch${batchId}`);
  assert(summary.token_rows_total === sumRows(source.batch, "token_rows"), `summary token total mismatch for Batch${batchId}`);
  assert(
    summary.bad_prehud_glosses === collectUnsafePrehudCount(source.browser_proof),
    `summary bad pre-HUD total mismatch for Batch${batchId}`
  );

  for (const sourceRow of source.batch) {
    const artifactRow = artifact.page_readiness_matrix.find(
      (row) => row.batch_id === batchId && row.index === sourceRow.index
    );
    assert(artifactRow, `missing matrix row for Batch${batchId} index ${sourceRow.index}`);
    assert(artifactRow.work === sourceRow.work, `matrix work mismatch for Batch${batchId} index ${sourceRow.index}`);
    assert(artifactRow.page === sourceRow.page, `matrix page mismatch for ${sourceRow.work}`);
    assert(artifactRow.token_rows === sourceRow.token_rows, `matrix token rows mismatch for ${sourceRow.work}`);
    assert(
      artifactRow.configured_hint_rows === sourceRow.configured_hint_rows,
      `matrix configured hint rows mismatch for ${sourceRow.work}`
    );
    assert(
      artifactRow.expected_tbd_rows === sourceRow.expected_tbd_rows,
      `matrix expected TBD rows mismatch for ${sourceRow.work}`
    );
    assert(
      String(artifactRow.agent2_render_stage_status).startsWith("render_stage_candidate") &&
        artifactRow.agent2_render_stage_status.endsWith("not_public_acceptance"),
      `matrix row overclaims render/public status for ${sourceRow.work}`
    );
    assert(
      Array.isArray(artifactRow.exact_blockers) && artifactRow.exact_blockers.length === 0,
      `matrix in-scope blocker should be empty for ${sourceRow.work}`
    );
  }
}

assert(
  artifact.proof_summary.bad_prehud_glosses_total === 0 && totals.bad_prehud_glosses === 0,
  "bad/unsafe pre-HUD gloss total must be 0"
);
assert(
  artifact.exact_blockers.out_of_scope_preserved_blockers.length === 1 &&
    artifact.exact_blockers.out_of_scope_preserved_blockers[0].page === "tanakh/ezekiel/index.html",
  "Batch02 non-batch Ezekiel blocker must be preserved"
);
assert(
  Array.isArray(artifact.process_timeouts_consumed) &&
    artifact.process_timeouts_consumed.length === computed.process_timeouts_consumed,
  "process timeout consumption count mismatch"
);

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
  artifact_type: "agent2_full_corpus_batches02_08_flagship_render_staging_consumption_validation_result",
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
  fs.writeFileSync(resultJsonPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    resultMdPath,
    [
      "# Agent2 Batch02-Batch08 Flagship Render Staging Consumption Validation",
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
  `Agent2 Batch02-Batch08 render staging consumption validation passed. Source rows: ${computed.source_rows}; stage candidates: ${computed.render_stage_candidate_rows}; in-batch blockers: ${computed.blocked_in_batch_rows}; bad pre-HUD glosses: ${computed.bad_prehud_glosses}.`
);
