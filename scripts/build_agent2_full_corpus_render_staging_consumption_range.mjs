import fs from "node:fs";

const [startArg, endArg] = process.argv.slice(2);
if (!startArg || !endArg) {
  throw new Error("usage: node scripts/build_agent2_full_corpus_render_staging_consumption_range.mjs <start-batch> <end-batch>");
}

const day = "2026-06-07";
const start = Number(startArg);
const end = Number(endArg);
if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
  throw new Error(`invalid batch range: ${startArg}-${endArg}`);
}

const batchIds = Array.from({ length: end - start + 1 }, (_, index) => String(start + index).padStart(2, "0"));
const rangeLabel = `batches${batchIds[0]}-${batchIds[batchIds.length - 1]}`;
const artifactType = `agent2_full_corpus_${rangeLabel}_flagship_render_staging_consumption`;
const outputJsonPath = `reports/agent2-full-corpus-${rangeLabel}-flagship-render-staging-consumption-${day}.json`;
const outputMdPath = `reports/agent2-full-corpus-${rangeLabel}-flagship-render-staging-consumption-${day}.md`;
const validationJsonPath = `reports/agent2-full-corpus-${rangeLabel}-flagship-render-staging-consumption-validation-result-${day}.json`;
const validationMdPath = `reports/agent2-full-corpus-${rangeLabel}-flagship-render-staging-consumption-validation-result-${day}.md`;
const agent2ProcessTimeouts = JSON.parse(process.env.AGENT2_PROCESS_TIMEOUTS_JSON || "[]");

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

function asciiJson(value) {
  return JSON.stringify(value, null, 2).replace(/[^\x00-\x7F]/g, (char) => {
    const hex = char.codePointAt(0).toString(16).padStart(4, "0");
    return `\\u${hex}`;
  });
}

function proofMode(packet) {
  if (String(packet.status || "").includes("STATIC_VALIDATED")) {
    return packet.static_proof
      ? "static_validated_with_static_proof_object"
      : "static_validated_without_static_proof_object";
  }
  if (packet.browser_proof) {
    return "browser_proof_consumed";
  }
  return "proof_metadata_missing_blocker";
}

const sources = batchIds.map((batchId) => {
  const jsonPath = `reports/agent10-full-corpus-batch${batchId}-flagship-render-staging-packet-${day}.json`;
  const mdPath = `reports/agent10-full-corpus-batch${batchId}-flagship-render-staging-packet-${day}.md`;
  const packet = readJson(jsonPath);
  const rows = Array.isArray(packet.batch) ? packet.batch : [];
  return {
    batch_id: batchId,
    json_path: jsonPath,
    md_path: fs.existsSync(mdPath) ? mdPath : null,
    packet,
    rows,
    ready_rows: rows.filter((row) => String(row.state || "").startsWith("stage_candidate")),
    blocked_rows: rows.filter((row) => String(row.state || "").startsWith("blocked"))
  };
});

const batchSummary = sources.map((source) => {
  const explicitBlockers = Array.isArray(source.packet.explicit_blockers) ? source.packet.explicit_blockers.length : 0;
  const explicitNonBatchBlockers = source.packet.explicit_non_batch_blocker ? 1 : 0;
  const timeouts = Array.isArray(source.packet.process_timeout) ? source.packet.process_timeout : [];
  return {
    batch_id: source.batch_id,
    source_path: source.json_path,
    source_status: source.packet.status,
    source_rows: source.rows.length,
    render_stage_candidate_rows: source.ready_rows.length,
    blocked_in_batch_rows: source.blocked_rows.length,
    source_states: [...new Set(source.rows.map((row) => row.state))],
    token_rows_total: sumRows(source.rows, "token_rows"),
    configured_hint_rows_total: sumRows(source.rows, "configured_hint_rows"),
    expected_tbd_rows_total: sumRows(source.rows, "expected_tbd_rows"),
    changed_files_count: Array.isArray(source.packet.changed_files) ? source.packet.changed_files.length : 0,
    proof_mode: proofMode(source.packet),
    boundary_shape: Array.isArray(source.packet.boundary) ? "array" : "string",
    bad_prehud_glosses: collectUnsafePrehudCount(source.packet.browser_proof),
    explicit_blockers_count: explicitBlockers,
    explicit_non_batch_blockers_count: explicitNonBatchBlockers,
    process_timeout_count: timeouts.length,
    validators_count: Array.isArray(source.packet.validators) ? source.packet.validators.length : 0,
    agent2_consumption_status: "render_stage_evidence_consumed_not_public_or_definition_acceptance"
  };
});

const pageReadinessMatrix = sources.flatMap((source) =>
  source.rows.map((row) => ({
    batch_id: source.batch_id,
    index: row.index,
    work: row.work,
    page: row.page,
    token_rows: row.token_rows,
    configured_hint_rows: row.configured_hint_rows,
    expected_tbd_rows: row.expected_tbd_rows,
    reader_layout_mode: row.reader_layout_mode,
    reader_hint_path: row.reader_hint_path ?? null,
    source_state: row.state,
    agent2_render_stage_status:
      String(row.state || "").includes("static_validated")
        ? "render_stage_candidate_static_validated_not_public_acceptance"
        : "render_stage_candidate_not_public_acceptance",
    exact_blockers: []
  }))
);

const explicitNonBatchBlockers = sources
  .filter((source) => source.packet.explicit_non_batch_blocker)
  .map((source) => ({ source_batch_id: source.batch_id, ...source.packet.explicit_non_batch_blocker }));

const processTimeoutsConsumed = sources.flatMap((source) =>
  (Array.isArray(source.packet.process_timeout) ? source.packet.process_timeout : []).map((timeout) => ({
    source_batch_id: source.batch_id,
    ...timeout
  }))
);

const totals = {
  source_batches: sources.length,
  source_rows: pageReadinessMatrix.length,
  render_stage_candidate_rows: pageReadinessMatrix.length,
  blocked_in_batch_rows: batchSummary.reduce((total, batch) => total + batch.blocked_in_batch_rows, 0),
  token_rows_total: batchSummary.reduce((total, batch) => total + batch.token_rows_total, 0),
  configured_hint_rows_total: batchSummary.reduce((total, batch) => total + batch.configured_hint_rows_total, 0),
  expected_tbd_rows_total: batchSummary.reduce((total, batch) => total + batch.expected_tbd_rows_total, 0),
  browser_proof_batches: batchSummary.filter((batch) => batch.proof_mode === "browser_proof_consumed").length,
  static_validated_batches: batchSummary.filter((batch) => batch.proof_mode.startsWith("static_validated")).length,
  static_proof_object_batches: batchSummary.filter((batch) => batch.proof_mode === "static_validated_with_static_proof_object").length,
  static_validated_without_static_proof_object_batches: batchSummary.filter(
    (batch) => batch.proof_mode === "static_validated_without_static_proof_object"
  ).length,
  explicit_non_batch_blockers: explicitNonBatchBlockers.length,
  process_timeouts_consumed: processTimeoutsConsumed.length,
  bad_prehud_glosses: batchSummary.reduce((total, batch) => total + batch.bad_prehud_glosses, 0),
  definition_transform_rows: 0,
  accepted_text_rows: 0,
  answer_eligible_rows: 0,
  public_emit_rows: 0,
  route_shard_writes: 0,
  release_actions: 0
};

const artifact = {
  artifact_type: artifactType,
  generated_at: new Date().toISOString(),
  target:
    `consume Agent10 full-corpus Batch${batchIds[0]}-Batch${batchIds[batchIds.length - 1]} flagship render staging packets as Agent2 page-output readiness input`,
  status: `render_staging_consumed_${totals.render_stage_candidate_rows}_stage_candidates_no_public_runtime_or_definition_acceptance`,
  source_batch_ids: batchIds,
  files_used: {
    agent10_render_staging_packets: sources.map((source) => ({
      batch_id: source.batch_id,
      json: source.json_path,
      md: source.md_path
    })),
    agent2_prior_consumption_anchor:
      `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-${day}.json`,
    agent2_a14_pipeline_redesign_input: `reports/agent2-a14-pipeline-redesign-input-${day}.json`
  },
  bounded_checks: [
    {
      process_timeout: false,
      command:
        `node scripts/build_agent2_full_corpus_render_staging_consumption_range.mjs ${batchIds[0]} ${batchIds[batchIds.length - 1]}`,
      timeout_ms: 120000,
      partial_output_or_artifact: `${sources.length} source packets parsed into ${outputJsonPath}`,
      next_safe_action: "run matching range validator"
    }
  ].concat(
    agent2ProcessTimeouts.map((timeout) => ({
      process_timeout: true,
      command: timeout.command,
      timeout: timeout.timeout,
      partial_output_or_artifact: timeout.partial_output_or_artifact,
      next_safe_action: timeout.next_safe_action
    }))
  ),
  lane_counts_rows_consumed: {
    render_pre_hud_staging_evidence: totals,
    definition_lane_consumption: {
      source_license_lanes_consumed: [],
      commercial_clean_candidate_rows: 0,
      noncommercial_educational_candidate_rows: 0,
      metadata_or_link_only_rows: 0,
      blocked_or_needs_review_rows: 0,
      note:
        "These Agent10 packets are page-output/render staging evidence, not source-lane definition transform rows."
    }
  },
  batch_summary: batchSummary,
  page_readiness_matrix: pageReadinessMatrix,
  proof_summary: {
    browser_proof_batches: batchSummary
      .filter((batch) => batch.proof_mode === "browser_proof_consumed")
      .map((batch) => batch.batch_id),
    static_validated_batches: batchSummary
      .filter((batch) => batch.proof_mode.startsWith("static_validated"))
      .map((batch) => batch.batch_id),
    static_validated_without_static_proof_object_batches: batchSummary
      .filter((batch) => batch.proof_mode === "static_validated_without_static_proof_object")
      .map((batch) => batch.batch_id),
    bad_prehud_glosses_total: totals.bad_prehud_glosses
  },
  schema_variance_preserved: {
    boundary_array_batches: batchSummary.filter((batch) => batch.boundary_shape === "array").map((batch) => batch.batch_id),
    boundary_string_batches: batchSummary.filter((batch) => batch.boundary_shape === "string").map((batch) => batch.batch_id),
    static_validated_without_static_proof_object_batches: batchSummary
      .filter((batch) => batch.proof_mode === "static_validated_without_static_proof_object")
      .map((batch) => batch.batch_id),
    note:
      "Schema variance is preserved as evidence metadata, not normalized into approval or acceptance."
  },
  exact_blockers: {
    in_scope_batch_blockers: [],
    out_of_scope_preserved_blockers: explicitNonBatchBlockers,
    definition_transform_blocker:
      "No new classified source-lane definition transform/owner-action return was consumed in this packet; Agent2 remains at render-staging consumption only."
  },
  process_timeouts_consumed: processTimeoutsConsumed,
  agent2_process_timeouts: agent2ProcessTimeouts,
  agent2_interpretation: {
    render_stage_meaning:
      "A page row is a render-stage candidate only; it is not public runtime acceptance, publication readiness, accepted text, or Definition authority.",
    tbd_meaning: "TBD is display-integrity only, not definition text, answer text, or accepted reader output.",
    a06_a07_route_correction:
      "A06 remains evidence/validator production only; approval/final validation/release-gate requests route to A07.",
    next_owner:
      "A14/A10 may use this as page-output readiness input for pipeline redesign and staging review; A07 only if an approval route is requested."
  },
  output_artifacts: {
    json: outputJsonPath,
    md: outputMdPath,
    validator: "scripts/validate_agent2_full_corpus_render_staging_consumption_range.mjs",
    validation_result_json: validationJsonPath,
    validation_result_md: validationMdPath
  },
  boundary: [
    "render_pre_hud_staging_evidence_only",
    "no_QA_source_license_legal_Definition_product_answer_accepted_text_acceptance",
    "no_public_runtime_acceptance",
    "no_publication_readiness_or_release_claim",
    "no_route_shard_write",
    "no_repo_cleanup_action"
  ],
  stop_condition:
    `Stop at Agent2 Batch${batchIds[0]}-Batch${batchIds[batchIds.length - 1]} render staging consumption. No source/license/legal/Definition/product/answer/accepted-text acceptance, no public/runtime acceptance, no route shard write, no repo cleanup action, no publication readiness claim, no release action.`
};

const mdLines = [
  `# Agent2 Batch${batchIds[0]}-Batch${batchIds[batchIds.length - 1]} Flagship Render Staging Consumption`,
  "",
  `Generated: ${artifact.generated_at}`,
  "",
  "## Target",
  "",
  artifact.target,
  "",
  "## Files Used",
  "",
  ...sources.map((source) => `- Batch${source.batch_id}: ${source.json_path}`),
  "",
  "## Lane Counts / Rows Consumed",
  "",
  `- Render/pre-HUD staging source batches: ${totals.source_batches}`,
  `- Render/pre-HUD staging rows consumed: ${totals.source_rows}`,
  `- Render-stage candidate rows: ${totals.render_stage_candidate_rows}`,
  `- In-batch blocked rows: ${totals.blocked_in_batch_rows}`,
  `- Token rows represented: ${totals.token_rows_total}`,
  `- Configured hint rows represented: ${totals.configured_hint_rows_total}`,
  `- Expected TBD rows represented: ${totals.expected_tbd_rows_total}`,
  `- Static-validated batches: ${totals.static_validated_batches}`,
  `- Static-validated batches without static_proof object: ${totals.static_validated_without_static_proof_object_batches}`,
  `- Bad/unsafe pre-HUD glosses consumed: ${totals.bad_prehud_glosses}`,
  `- Definition transform rows consumed: ${totals.definition_transform_rows}`,
  `- Accepted text rows: ${totals.accepted_text_rows}`,
  `- Public emit rows: ${totals.public_emit_rows}`,
  `- Route shard writes by Agent2: ${totals.route_shard_writes}`,
  `- Release actions by Agent2: ${totals.release_actions}`,
  `- Agent2 command timeouts recorded: ${agent2ProcessTimeouts.length}`,
  "",
  "## Batch Matrix",
  "",
  "| batch | status | rows | stage candidates | blocked | token rows | proof mode | boundary | timeouts |",
  "| --- | --- | ---: | ---: | ---: | ---: | --- | --- | ---: |",
  ...batchSummary.map(
    (batch) =>
      `| ${batch.batch_id} | ${batch.source_status} | ${batch.source_rows} | ${batch.render_stage_candidate_rows} | ${batch.blocked_in_batch_rows} | ${batch.token_rows_total} | ${batch.proof_mode} | ${batch.boundary_shape} | ${batch.process_timeout_count} |`
  ),
  "",
  "## Exact Blockers",
  "",
  "- In-scope batch blockers: none",
  `- Definition transform blocker: ${artifact.exact_blockers.definition_transform_blocker}`,
  "",
  "## Handoff Owner",
  "",
  "- A14/A10: page-output readiness and pipeline/staging design intake.",
  "- A06: evidence/validator production only.",
  "- A07: approval/final-validation/release-gate route only if approval is requested.",
  "",
  "## Stop Condition",
  "",
  artifact.stop_condition
];

fs.writeFileSync(outputJsonPath, `${asciiJson(artifact)}\n`, "utf8");
fs.writeFileSync(outputMdPath, `${mdLines.join("\n")}\n`, "utf8");

console.log(`Wrote ${outputJsonPath}`);
console.log(`Wrote ${outputMdPath}`);
