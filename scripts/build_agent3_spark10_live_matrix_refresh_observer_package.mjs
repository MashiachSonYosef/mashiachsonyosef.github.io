#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  previousCurrentObserverJson: 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.json',
  previousCurrentObserverMd: 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.md',
  controlCapReceiptJson:
    'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.json',
  controlCapReceiptMd:
    'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.md',
  agent10ConsumptionJson: 'reports/agent10-agent3-post-custody-wake-and-control-cap-consumption-2026-06-04.json',
  agent10ContractJson: 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json',
  agent3StateJson: 'reports/agent3-state.json',
  outputJson: 'reports/agent3-spark10-live-matrix-refresh-observer-package-2026-06-04.json',
  outputMd: 'reports/agent3-spark10-live-matrix-refresh-observer-package-2026-06-04.md',
};

const matrix = readJson(paths.spark10MatrixJson);
const previousObserver = readJson(paths.previousCurrentObserverJson);
const controlCapReceipt = readJson(paths.controlCapReceiptJson);
const agent10Consumption = readJson(paths.agent10ConsumptionJson);
const contract = readJson(paths.agent10ContractJson);
const agent3State = readJson(paths.agent3StateJson);

const rows = matrix.rows || [];
const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3');
const spark3Rows = rows.filter(
  (row) => row.lane_owner === 'Spark-3' || row.lane_owner === 'Spark 3' || /spark3/i.test(String(row.path || '')),
);
const handoffRows = rows.filter(isHandoffCandidate);
const agent3HandoffRows = agent3Rows.filter(isHandoffCandidate);
const summary = matrix.summary || {};

const previousCounts = previousObserver.schema_counts || {};
const liveCountsFromCapReceipt = controlCapReceipt.schema_counts || {};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark10_live_matrix_refresh_observer_package',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane_owner: 'Agent 3',
  status: 'live_spark10_matrix_refresh_observed_no_agent3_executable_workset',
  publication_state: 'blocked_no_render',
  target:
    'Refresh Agent 3 observation of the live Spark-10 release/package intake matrix after the prior 239-row observer snapshot, without creating Definition, release, or mutation authority.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run: 'node scripts/build_agent3_spark10_live_matrix_refresh_observer_package.mjs',
  previous_observer_snapshot: {
    path: paths.previousCurrentObserverJson,
    status: previousObserver.status,
    matrix_rows: number(previousCounts.spark10_matrix_rows),
    agent3_rows: number(previousCounts.agent3_rows_observed),
    spark3_rows: number(previousCounts.spark3_rows_observed),
    handoff_candidates: number(previousCounts.total_handoff_candidate_rows),
    agent3_handoff_candidates: number(previousCounts.agent3_handoff_candidate_rows),
  },
  control_cap_receipt_snapshot: {
    path: paths.controlCapReceiptJson,
    status: controlCapReceipt.status,
    agent12_cap_inputs_checked: number(liveCountsFromCapReceipt.agent12_current_matrix_inputs_checked),
    live_inputs_checked_at_receipt: number(liveCountsFromCapReceipt.live_spark10_inputs_checked),
    live_release_relevant_at_receipt: number(liveCountsFromCapReceipt.live_spark10_release_relevant_rows),
    live_handoff_candidates_at_receipt: number(liveCountsFromCapReceipt.live_spark10_agent6_handoff_candidates),
    exact_worksets_found_at_receipt: number(liveCountsFromCapReceipt.agent10_exact_new_worksets_found),
    changed_artifacts_found_at_receipt: number(liveCountsFromCapReceipt.agent10_changed_artifacts_found),
  },
  live_matrix_snapshot: {
    path: paths.spark10MatrixJson,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    contract_path: matrix.contract_path,
    summary,
    boundary: matrix.boundary || {},
    row_count: rows.length,
    agent3_rows: agent3Rows.map(summarizeRow),
    spark3_rows: spark3Rows.map(summarizeRow),
    handoff_candidate_rows: handoffRows.map(summarizeRow),
  },
  agent10_consumption_reference: {
    path: paths.agent10ConsumptionJson,
    status: agent10Consumption.status,
    counts: agent10Consumption.counts || {},
    exact_blocker: agent10Consumption.exact_blocker || null,
    stop_condition: agent10Consumption.stop_condition || null,
  },
  agent10_contract_reference: {
    path: paths.agent10ContractJson,
    artifact_type: contract.artifact_type,
    input_count: Array.isArray(contract.inputs) ? contract.inputs.length : 0,
    boundary: contract.boundary || {},
  },
  agent3_state_reference: {
    path: paths.agent3StateJson,
    quality_status: agent3State.quality?.status || null,
    evidence_artifacts: number(agent3State.counts?.evidence_artifacts),
    evidence_artifacts_exist: number(agent3State.counts?.evidence_artifacts_exist),
    validator_scripts: number(agent3State.counts?.validator_scripts),
    validator_scripts_exist: number(agent3State.counts?.validator_scripts_exist),
  },
  schema_counts: {
    previous_observer_matrix_rows: number(previousCounts.spark10_matrix_rows),
    previous_observer_agent3_rows: number(previousCounts.agent3_rows_observed),
    previous_observer_spark3_rows: number(previousCounts.spark3_rows_observed),
    previous_observer_handoff_candidates: number(previousCounts.total_handoff_candidate_rows),
    previous_observer_agent3_handoff_candidates: number(previousCounts.agent3_handoff_candidate_rows),
    control_cap_live_inputs_checked: number(liveCountsFromCapReceipt.live_spark10_inputs_checked),
    live_inputs_checked: number(summary.inputs_checked),
    live_missing_required_inputs: number(summary.missing_required_inputs),
    live_release_relevant_rows: number(summary.release_relevant_rows),
    live_agent6_handoff_candidates: number(summary.agent6_handoff_candidates),
    live_matrix_rows: rows.length,
    live_agent3_rows: agent3Rows.length,
    live_spark3_rows: spark3Rows.length,
    live_handoff_candidate_rows: handoffRows.length,
    live_agent3_handoff_candidate_rows: agent3HandoffRows.length,
    matrix_row_delta_since_previous_observer: rows.length - number(previousCounts.spark10_matrix_rows),
    agent3_row_delta_since_previous_observer: agent3Rows.length - number(previousCounts.agent3_rows_observed),
    handoff_candidate_delta_since_previous_observer:
      handoffRows.length - number(previousCounts.total_handoff_candidate_rows),
    agent10_agent3_runnable_queue_items: number(agent10Consumption.counts?.agent3_runnable_queue_items),
    agent10_changed_artifacts_found: number(agent10Consumption.counts?.changed_artifacts_found),
    agent10_exact_new_worksets_found: number(agent10Consumption.counts?.exact_new_worksets_found),
    agent10_new_matrix_rows: number(agent10Consumption.counts?.new_matrix_rows),
    agent10_new_matrix_occurrences: number(agent10Consumption.counts?.new_matrix_occurrences),
    state_evidence_artifacts: number(agent3State.counts?.evidence_artifacts),
    state_evidence_artifacts_exist: number(agent3State.counts?.evidence_artifacts_exist),
    state_validator_scripts: number(agent3State.counts?.validator_scripts),
    state_validator_scripts_exist: number(agent3State.counts?.validator_scripts_exist),
    route_publication_support_rows: 0,
    definition_authority_rows: 0,
    usage_as_definition_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutations: 0,
    public_reader_output_rows: 0,
  },
  reviewed_inputs: manifest(Object.entries(paths).filter(([key]) => !key.startsWith('output'))),
  missing_field_blocker: {
    blocker: 'missing_changed_artifact_or_exact_workset',
    source: paths.agent10ConsumptionJson,
    wake_condition:
      'Live Spark-10 matrix refresh is observed, but Agent 3 still needs a changed Agent 3 artifact path or exact workset with named inputs, rows/occurrences, output schema/path, validator/gate, handoff owner, and stop condition before another deterministic matrix run.',
    missing_fields: [
      'changed_agent3_artifact_path_or_exact_workset_id',
      'target_rows_and_occurrences_for_new_agent3_matrix',
      'route_card_or_source_route_input_set',
      'output_path_and_schema_for_new_agent3_matrix',
      'validator_or_gate_for_new_agent3_matrix',
      'handoff_trigger_for_agent10_release_package_intake',
      'stop_condition_for_new_agent3_run',
    ],
  },
  handoff_owner:
    'Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner; Agent 3 remains held until exact changed workset.',
  stop_condition:
    'Stop after the live Spark-10 matrix refresh observer because the refresh changes intake surface size only and does not supply an Agent 3 executable workset.',
  boundary: {
    source_license_acceptance: false,
    source_provenance_acceptance: false,
    qa_acceptance: false,
    definition_authority: false,
    usage_as_definition_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    answer_selection: false,
    route_publication_support: false,
    public_runtime_acceptance: false,
    publication_readiness: false,
    product_data_acceptance: false,
    package_export_authorization: false,
    accepted_gloss_text: false,
    accepted_text: false,
    translation_output: false,
    public_reader_output: false,
    public_runtime_mutation: false,
  },
  validators: [
    'node scripts/validate_agent3_spark10_live_matrix_refresh_observer_package.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 Spark-10 live refresh: live rows ${artifact.schema_counts.live_matrix_rows}; delta ${artifact.schema_counts.matrix_row_delta_since_previous_observer}; Agent 3 runnable ${artifact.schema_counts.agent10_agent3_runnable_queue_items}`,
);

function summarizeRow(row) {
  return {
    path: row.path || null,
    lane_owner: row.lane_owner || null,
    artifact_type: row.artifact_type || null,
    status: row.status || null,
    exists: row.exists === true,
    rows: row.rows ?? null,
    occurrences: row.occurrences ?? null,
    blocker: row.blocker || row.blocker_class || null,
    release_relevance: row.release_relevance || row.release_relevance_hint || null,
    agent6_handoff_candidate: isHandoffCandidate(row),
    next_action: row.next_agent10_action || null,
  };
}

function isHandoffCandidate(row) {
  return (
    row.agent6_handoff_candidate === true ||
    row.agent6_handoff_needed === true ||
    row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists'
  );
}

function manifest(entries) {
  return entries.map(([role, inputPath]) => {
    const absolute = resolve(inputPath);
    const stat = fs.statSync(absolute);
    return {
      role,
      path: inputPath,
      sha256: sha256File(inputPath),
      bytes: stat.size,
    };
  });
}

function renderMarkdown(value) {
  const lines = [];
  lines.push('# Agent 3 Spark-10 Live Matrix Refresh Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${paths.outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Target: ${value.target}`);
  lines.push('');
  lines.push('## Refresh Counts');
  lines.push('');
  lines.push(`- Previous observer matrix rows: \`${value.schema_counts.previous_observer_matrix_rows}\``);
  lines.push(`- Live matrix rows: \`${value.schema_counts.live_matrix_rows}\``);
  lines.push(`- Matrix row delta: \`${value.schema_counts.matrix_row_delta_since_previous_observer}\``);
  lines.push(`- Live inputs checked / release-relevant / handoff candidates: \`${value.schema_counts.live_inputs_checked}\` / \`${value.schema_counts.live_release_relevant_rows}\` / \`${value.schema_counts.live_agent6_handoff_candidates}\``);
  lines.push(`- Live Agent 3 / Spark-3 rows: \`${value.schema_counts.live_agent3_rows}\` / \`${value.schema_counts.live_spark3_rows}\``);
  lines.push(`- Agent 3 handoff candidate rows: \`${value.schema_counts.live_agent3_handoff_candidate_rows}\``);
  lines.push('');
  lines.push('## Workset Check');
  lines.push('');
  lines.push(`- Agent 3 runnable queue items: \`${value.schema_counts.agent10_agent3_runnable_queue_items}\``);
  lines.push(`- Changed artifacts found: \`${value.schema_counts.agent10_changed_artifacts_found}\``);
  lines.push(`- Exact new worksets found: \`${value.schema_counts.agent10_exact_new_worksets_found}\``);
  lines.push(`- New matrix rows / occurrences: \`${value.schema_counts.agent10_new_matrix_rows}\` / \`${value.schema_counts.agent10_new_matrix_occurrences}\``);
  lines.push('');
  lines.push('## Exact Blocker');
  lines.push('');
  lines.push(`- Blocker: \`${value.missing_field_blocker.blocker}\``);
  lines.push(`- Wake condition: ${value.missing_field_blocker.wake_condition}`);
  lines.push(`- Handoff owner: ${value.handoff_owner}`);
  lines.push(`- Stop condition: ${value.stop_condition}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('This refresh is an Agent 3 observer package only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, semantic arbitration, route ranking, answer selection, route publication support, public/runtime acceptance, publication readiness, package/export authorization, product/data acceptance, translation output, accepted gloss/text, public reader output, or public/runtime mutation.');
  lines.push('');
  lines.push('## Validation');
  lines.push('');
  for (const validator of value.validators) lines.push(`- \`${validator}\``);
  lines.push('');
  lines.push('## Reviewed Inputs');
  lines.push('');
  for (const input of value.reviewed_inputs) {
    lines.push(`- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`);
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(resolve(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolute = resolve(relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function sha256File(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function number(value) {
  return Number(value || 0);
}
