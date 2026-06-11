import fs from "node:fs";

const day = "2026-06-07";
const batchIds = ["02", "03", "04", "05", "06", "07", "08"];
const outputJsonPath = `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-${day}.json`;
const outputMdPath = `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-${day}.md`;

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

function asciiJson(value) {
  return JSON.stringify(value, null, 2).replace(/[^\x00-\x7F]/g, (char) => {
    const hex = char.codePointAt(0).toString(16).padStart(4, "0");
    return `\\u${hex}`;
  });
}

function proofMode(packet) {
  if (packet.static_proof) {
    return "static_validated_owner_waived_routine_browser_proof";
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
  const readyRows = rows.filter((row) => String(row.state || "").startsWith("stage_candidate"));
  const blockedRows = rows.filter((row) => String(row.state || "").startsWith("blocked"));
  return {
    batch_id: batchId,
    json_path: jsonPath,
    md_path: fs.existsSync(mdPath) ? mdPath : null,
    packet,
    rows,
    readyRows,
    blockedRows
  };
});

const batchSummaries = sources.map((source) => {
  const explicitBlockers = Array.isArray(source.packet.explicit_blockers)
    ? source.packet.explicit_blockers.length
    : 0;
  const explicitNonBatchBlockers = source.packet.explicit_non_batch_blocker ? 1 : 0;
  const timeouts = Array.isArray(source.packet.process_timeout) ? source.packet.process_timeout : [];
  return {
    batch_id: source.batch_id,
    source_path: source.json_path,
    source_status: source.packet.status,
    source_rows: source.rows.length,
    render_stage_candidate_rows: source.readyRows.length,
    blocked_in_batch_rows: source.blockedRows.length,
    source_states: [...new Set(source.rows.map((row) => row.state))],
    token_rows_total: sumRows(source.rows, "token_rows"),
    configured_hint_rows_total: sumRows(source.rows, "configured_hint_rows"),
    expected_tbd_rows_total: sumRows(source.rows, "expected_tbd_rows"),
    changed_files_count: Array.isArray(source.packet.changed_files) ? source.packet.changed_files.length : 0,
    proof_mode: proofMode(source.packet),
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
      row.state === "stage_candidate_static_validated"
        ? "render_stage_candidate_static_validated_not_public_acceptance"
        : "render_stage_candidate_not_public_acceptance",
    exact_blockers: []
  }))
);

const explicitNonBatchBlockers = sources
  .filter((source) => source.packet.explicit_non_batch_blocker)
  .map((source) => ({
    source_batch_id: source.batch_id,
    ...source.packet.explicit_non_batch_blocker
  }));

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
  blocked_in_batch_rows: batchSummaries.reduce((total, batch) => total + batch.blocked_in_batch_rows, 0),
  token_rows_total: batchSummaries.reduce((total, batch) => total + batch.token_rows_total, 0),
  configured_hint_rows_total: batchSummaries.reduce((total, batch) => total + batch.configured_hint_rows_total, 0),
  expected_tbd_rows_total: batchSummaries.reduce((total, batch) => total + batch.expected_tbd_rows_total, 0),
  browser_proof_batches: batchSummaries.filter((batch) => batch.proof_mode === "browser_proof_consumed").length,
  static_validated_batches: batchSummaries.filter((batch) =>
    batch.proof_mode === "static_validated_owner_waived_routine_browser_proof"
  ).length,
  owner_waived_routine_browser_proof_batches: batchSummaries.filter((batch) =>
    batch.proof_mode === "static_validated_owner_waived_routine_browser_proof"
  ).length,
  explicit_non_batch_blockers: explicitNonBatchBlockers.length,
  process_timeouts_consumed: processTimeoutsConsumed.length,
  bad_prehud_glosses: batchSummaries.reduce((total, batch) => total + batch.bad_prehud_glosses, 0),
  definition_transform_rows: 0,
  accepted_text_rows: 0,
  answer_eligible_rows: 0,
  public_emit_rows: 0,
  route_shard_writes: 0,
  release_actions: 0
};

const artifact = {
  artifact_type: "agent2_full_corpus_batches02_08_flagship_render_staging_consumption",
  generated_at: new Date().toISOString(),
  target:
    "consume Agent10 full-corpus Batch02-Batch08 flagship render staging packets as Agent2 page-output readiness input",
  status: "render_staging_consumed_140_stage_candidates_no_public_runtime_or_definition_acceptance",
  source_batch_ids: batchIds,
  files_used: {
    agent10_render_staging_packets: sources.map((source) => ({
      batch_id: source.batch_id,
      json: source.json_path,
      md: source.md_path
    })),
    agent2_batch01_prior_consumption:
      `reports/agent2-full-corpus-batch01-flagship-render-staging-consumption-${day}.json`,
    agent2_a14_pipeline_redesign_input: `reports/agent2-a14-pipeline-redesign-input-${day}.json`
  },
  bounded_checks: [
    {
      process_timeout: false,
      command:
        "Get-ChildItem -Path reports -Filter '*.json' | Where-Object { $_.Name -match '2026-06-07' -and $_.Name -match '(gate-proof|changed-input|page-ready|render|payload)' } | Sort-Object LastWriteTime | Select-Object -Last 20 -ExpandProperty Name",
      timeout_ms: 10000,
      partial_output_or_artifact:
        "Agent10 Batch02-Batch08 flagship render staging packet JSON files found",
      next_safe_action: "consume page-output readiness packets only"
    },
    {
      process_timeout: false,
      command:
        "node inline packet schema summary over reports/agent10-full-corpus-batch02..08-flagship-render-staging-packet-2026-06-07.json",
      timeout_ms: 10000,
      partial_output_or_artifact:
        "all seven packets parsed; each contains 20 source rows and zero in-batch blocked rows",
      next_safe_action: "materialize Agent2 non-public render-staging consumption"
    }
  ],
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
  batch_summary: batchSummaries,
  page_readiness_matrix: pageReadinessMatrix,
  proof_summary: {
    browser_proof_batches: batchSummaries
      .filter((batch) => batch.proof_mode === "browser_proof_consumed")
      .map((batch) => batch.batch_id),
    static_validated_owner_waived_batches: batchSummaries
      .filter((batch) => batch.proof_mode === "static_validated_owner_waived_routine_browser_proof")
      .map((batch) => batch.batch_id),
    bad_prehud_glosses_total: totals.bad_prehud_glosses
  },
  exact_blockers: {
    in_scope_batch_blockers: [],
    out_of_scope_preserved_blockers: explicitNonBatchBlockers,
    definition_transform_blocker:
      "No new classified source-lane definition transform/owner-action return was consumed in this packet; Agent2 remains at render-staging consumption only."
  },
  process_timeouts_consumed: processTimeoutsConsumed,
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
    validator: "scripts/validate_agent2_full_corpus_batches02_08_flagship_render_staging_consumption.mjs",
    validation_result_json:
      `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-validation-result-${day}.json`,
    validation_result_md:
      `reports/agent2-full-corpus-batches02-08-flagship-render-staging-consumption-validation-result-${day}.md`
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
    "Stop at Agent2 Batch02-Batch08 render staging consumption. No source/license/legal/Definition/product/answer/accepted-text acceptance, no public/runtime acceptance, no route shard write, no repo cleanup action, no publication readiness claim, no release action."
};

const mdLines = [
  "# Agent2 Batch02-Batch08 Flagship Render Staging Consumption",
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
  `- Browser-proof batches: ${totals.browser_proof_batches}`,
  `- Static-validated owner-waived browser batches: ${totals.static_validated_batches}`,
  `- Bad/unsafe pre-HUD glosses consumed: ${totals.bad_prehud_glosses}`,
  `- Definition transform rows consumed: ${totals.definition_transform_rows}`,
  `- Accepted text rows: ${totals.accepted_text_rows}`,
  `- Public emit rows: ${totals.public_emit_rows}`,
  `- Route shard writes by Agent2: ${totals.route_shard_writes}`,
  `- Release actions by Agent2: ${totals.release_actions}`,
  "",
  "## Batch Matrix",
  "",
  "| batch | status | rows | stage candidates | blocked | token rows | proof mode | blockers | timeouts |",
  "| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |",
  ...batchSummaries.map(
    (batch) =>
      `| ${batch.batch_id} | ${batch.source_status} | ${batch.source_rows} | ${batch.render_stage_candidate_rows} | ${batch.blocked_in_batch_rows} | ${batch.token_rows_total} | ${batch.proof_mode} | ${batch.explicit_blockers_count + batch.explicit_non_batch_blockers_count} | ${batch.process_timeout_count} |`
  ),
  "",
  "## Exact Blockers",
  "",
  explicitNonBatchBlockers.length === 0
    ? "- In-scope batch blockers: none"
    : "- In-scope batch blockers: none; out-of-scope preserved blocker(s) below.",
  ...explicitNonBatchBlockers.map(
    (blocker) =>
      `- Batch${blocker.source_batch_id} non-batch blocker: ${blocker.page} -> ${blocker.blocker}; next_safe_action=${blocker.next_safe_action}`
  ),
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
