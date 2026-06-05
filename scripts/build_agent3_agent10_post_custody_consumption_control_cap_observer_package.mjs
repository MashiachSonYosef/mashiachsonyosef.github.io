#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  currentObserverJson: 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.json',
  currentObserverMd: 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.md',
  agent10ConsumptionJson: 'reports/agent10-agent3-post-custody-wake-and-control-cap-consumption-2026-06-04.json',
  agent10ConsumptionMd: 'reports/agent10-agent3-post-custody-wake-and-control-cap-consumption-2026-06-04.md',
  agent12CapMd: 'reports/agent12-spark10-current-matrix-stale-status-cap-2026-06-04.md',
  postCustodyAuditJson: 'reports/agent3-post-custody-wake-condition-audit-2026-06-04.json',
  agent3StateJson: 'reports/agent3-state.json',
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  sparkQueueJson: 'data/control/spark_standing_queue.json',
  outputJson: 'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.json',
  outputMd: 'reports/agent3-agent10-post-custody-consumption-control-cap-observer-package-2026-06-04.md',
};

const currentObserver = readJson(paths.currentObserverJson);
const agent10Consumption = readJson(paths.agent10ConsumptionJson);
const agent10ConsumptionText = readText(paths.agent10ConsumptionMd);
const agent12CapText = readText(paths.agent12CapMd);
const postCustodyAudit = readJson(paths.postCustodyAuditJson);
const agent3State = readJson(paths.agent3StateJson);
const spark10Matrix = readJson(paths.spark10MatrixJson);
const sparkQueue = readJson(paths.sparkQueueJson);

const capMatrixCounts = parseAgent12MatrixCounts(agent12CapText);
const liveMatrixRows = spark10Matrix.rows || [];
const liveMatrixAgent3Rows = liveMatrixRows.filter((row) => row.lane_owner === 'Agent 3');
const liveMatrixSpark3Rows = liveMatrixRows.filter(
  (row) => row.lane_owner === 'Spark-3' || row.lane_owner === 'Spark 3' || /spark3/i.test(String(row.path || '')),
);
const liveMatrixHandoffRows = liveMatrixRows.filter(
  (row) =>
    row.agent6_handoff_candidate === true ||
    row.agent6_handoff_needed === true ||
    row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
);
const queueItems = Array.isArray(sparkQueue.items) ? sparkQueue.items : [];
const agent3RunnableQueueItems = queueItems.filter((item) => item.agent3_runnable_now === true);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_agent10_post_custody_consumption_control_cap_observer_package',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane_owner: 'Agent 3',
  status: 'release_owner_consumption_and_control_cap_observed_exact_workset_still_missing',
  publication_state: 'blocked_no_render',
  target:
    'Package Agent 10 release-owner consumption of Agent 3 post-custody wake state plus Agent 12 current-matrix cap posture as Agent 3 wake-condition evidence.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run:
    'node scripts/build_agent3_agent10_post_custody_consumption_control_cap_observer_package.mjs',
  current_observer_receipt: {
    path: paths.currentObserverJson,
    status: currentObserver.status,
    counts: pick(currentObserver.schema_counts, [
      'spark10_matrix_rows',
      'agent3_rows_observed',
      'spark3_rows_observed',
      'total_handoff_candidate_rows',
      'agent3_handoff_candidate_rows',
      'post_custody_agent3_runnable_queue_items',
      'post_custody_exact_new_worksets_found',
    ]),
    blocker: currentObserver.missing_field_blocker || null,
    stop_condition: currentObserver.stop_condition,
  },
  agent10_release_owner_consumption: {
    path: paths.agent10ConsumptionJson,
    artifact_type: agent10Consumption.artifact_type,
    generated_at: agent10Consumption.generated_at,
    package_workset: agent10Consumption.package_workset,
    release_owner: agent10Consumption.release_owner,
    status_line: parseMarkdownStatus(agent10ConsumptionText),
    counts: agent10Consumption.counts || {},
    lane_split: agent10Consumption.lane_split || {},
    exact_blocker: agent10Consumption.exact_blocker || null,
    agent6_boundary_question: agent10Consumption.agent6_boundary_question,
    stop_condition: agent10Consumption.stop_condition,
    zero_counters: agent10Consumption.zero_counters || {},
  },
  agent12_control_cap: {
    path: paths.agent12CapMd,
    matrix_counts: capMatrixCounts,
    standing_status_capped_as_stale: /Spark-10 standing status \| cap as stale for routing/.test(agent12CapText),
    broad_sweep_cap_present: /Boundary: Agent 12 waste-cap\/unblock note only/.test(agent12CapText),
    exact_agent6_routing_only: /Route only exact Agent 6 packets/.test(agent12CapText),
  },
  post_custody_audit_reference: {
    path: paths.postCustodyAuditJson,
    status: postCustodyAudit.status,
    counts: postCustodyAudit.schema_counts || {},
    current_blocker: postCustodyAudit.current_blocker || null,
  },
  current_agent3_state_reference: {
    path: paths.agent3StateJson,
    quality_status: agent3State.quality?.status || null,
    evidence_artifacts: agent3State.counts?.evidence_artifacts || null,
    evidence_artifacts_exist: agent3State.counts?.evidence_artifacts_exist || null,
    validator_scripts: agent3State.counts?.validator_scripts || null,
    validator_scripts_exist: agent3State.counts?.validator_scripts_exist || null,
    worker_state: agent3State.worker_state || null,
    qa_acceptance_state: agent3State.qa_acceptance_state || null,
  },
  current_spark10_matrix_reference: {
    path: paths.spark10MatrixJson,
    generated_at: spark10Matrix.generated_at,
    summary: spark10Matrix.summary || {},
    row_count: liveMatrixRows.length,
    agent3_rows: liveMatrixAgent3Rows.length,
    spark3_rows: liveMatrixSpark3Rows.length,
    handoff_candidate_rows: liveMatrixHandoffRows.length,
    boundary: spark10Matrix.boundary || {},
  },
  schema_counts: {
    current_observer_matrix_rows: number(currentObserver.schema_counts?.spark10_matrix_rows),
    current_observer_agent3_rows: number(currentObserver.schema_counts?.agent3_rows_observed),
    current_observer_spark3_rows: number(currentObserver.schema_counts?.spark3_rows_observed),
    current_observer_handoff_candidates: number(currentObserver.schema_counts?.total_handoff_candidate_rows),
    current_observer_agent3_handoff_candidates: number(currentObserver.schema_counts?.agent3_handoff_candidate_rows),
    agent10_returned_artifacts_indexed: number(agent10Consumption.counts?.returned_artifacts_indexed),
    agent10_returned_artifacts_consumed: number(agent10Consumption.counts?.returned_artifacts_consumed),
    agent10_active_worksets_indexed: number(agent10Consumption.counts?.active_worksets_indexed),
    agent10_total_rows: number(agent10Consumption.counts?.total_rows),
    agent10_total_occurrences: number(agent10Consumption.counts?.total_occurrences),
    agent10_blocker_rows: number(agent10Consumption.counts?.blocker_rows),
    agent10_blocker_occurrences: number(agent10Consumption.counts?.blocker_occurrences),
    agent10_queue_items_checked: number(agent10Consumption.counts?.queue_items_checked),
    agent10_agent3_runnable_queue_items: number(agent10Consumption.counts?.agent3_runnable_queue_items),
    agent10_candidate_files_modified_after_custody_index: number(
      agent10Consumption.counts?.candidate_files_modified_after_custody_index,
    ),
    agent10_changed_artifacts_found: number(agent10Consumption.counts?.changed_artifacts_found),
    agent10_exact_new_worksets_found: number(agent10Consumption.counts?.exact_new_worksets_found),
    agent10_new_matrix_rows: number(agent10Consumption.counts?.new_matrix_rows),
    agent10_new_matrix_occurrences: number(agent10Consumption.counts?.new_matrix_occurrences),
    agent12_current_matrix_inputs_checked: capMatrixCounts.inputs_checked,
    agent12_current_matrix_missing_required_inputs: capMatrixCounts.missing_required_inputs,
    agent12_current_matrix_release_relevant_rows: capMatrixCounts.release_relevant_rows,
    agent12_current_matrix_agent6_handoff_candidate_files: capMatrixCounts.agent6_handoff_candidate_files,
    live_spark10_inputs_checked: number(spark10Matrix.summary?.inputs_checked),
    live_spark10_missing_required_inputs: number(spark10Matrix.summary?.missing_required_inputs),
    live_spark10_release_relevant_rows: number(spark10Matrix.summary?.release_relevant_rows),
    live_spark10_agent6_handoff_candidates: number(spark10Matrix.summary?.agent6_handoff_candidates),
    live_spark10_matrix_rows: liveMatrixRows.length,
    live_spark10_agent3_rows: liveMatrixAgent3Rows.length,
    live_spark10_spark3_rows: liveMatrixSpark3Rows.length,
    live_spark10_handoff_candidate_rows: liveMatrixHandoffRows.length,
    agent12_cap_stale_against_live_matrix:
      capMatrixCounts.inputs_checked !== number(spark10Matrix.summary?.inputs_checked) ||
      capMatrixCounts.agent6_handoff_candidate_files !== number(spark10Matrix.summary?.agent6_handoff_candidates)
        ? 1
        : 0,
    spark_queue_items_seen: queueItems.length,
    spark_queue_agent3_runnable_items: agent3RunnableQueueItems.length,
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
      'Wake Agent 3 only when Agent 10, Agent 7, or the queue supplies a changed artifact or exact workset with named inputs, rows/occurrences, output path/schema, validator/gate, handoff owner, and stop condition.',
    missing_fields: [
      'changed_artifact_path_or_exact_workset_id',
      'target_rows_and_occurrences_for_new_matrix',
      'route_card_or_source_route_input_set',
      'output_path_and_schema_for_new_matrix',
      'validator_or_gate_for_new_matrix',
      'handoff_trigger_for_agent10_release_package_intake',
      'stop_condition_for_new_matrix_run',
    ],
  },
  handoff_owner:
    'Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner; Agent 3 remains held until exact changed workset.',
  stop_condition:
    'Stop after this release-owner/control-cap receipt because current evidence confirms zero Agent 3 runnable queue items, zero changed artifacts, and zero exact new worksets.',
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
    'node scripts/validate_agent3_agent10_post_custody_consumption_control_cap_observer_package.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 Agent10/cap observer: runnable ${artifact.schema_counts.agent10_agent3_runnable_queue_items}; changed artifacts ${artifact.schema_counts.agent10_changed_artifacts_found}; exact worksets ${artifact.schema_counts.agent10_exact_new_worksets_found}`,
);

function parseAgent12MatrixCounts(text) {
  const match = text.match(
    /validates and reports `(\d+)` inputs checked, `(\d+)` missing required inputs, `(\d+)` release-relevant rows, and `(\d+)` Agent 6 handoff candidate files/,
  );
  return {
    inputs_checked: match ? Number(match[1]) : 0,
    missing_required_inputs: match ? Number(match[2]) : 0,
    release_relevant_rows: match ? Number(match[3]) : 0,
    agent6_handoff_candidate_files: match ? Number(match[4]) : 0,
  };
}

function parseMarkdownStatus(text) {
  const match = text.match(/Status:\s*`([^`]+)`/);
  return match ? match[1] : null;
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
  lines.push('# Agent 3 Agent 10 Post-Custody Consumption Control-Cap Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${paths.outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Target: ${value.target}`);
  lines.push('');
  lines.push('## Current Receipt Counts');
  lines.push('');
  lines.push(`- Agent 10 consumed workset: \`${value.agent10_release_owner_consumption.package_workset}\``);
  lines.push(`- Active worksets / rows / occurrences: \`${value.schema_counts.agent10_active_worksets_indexed}\` / \`${value.schema_counts.agent10_total_rows}\` / \`${value.schema_counts.agent10_total_occurrences}\``);
  lines.push(`- Blocker rows / occurrences: \`${value.schema_counts.agent10_blocker_rows}\` / \`${value.schema_counts.agent10_blocker_occurrences}\``);
  lines.push(`- Agent 3 runnable queue items: \`${value.schema_counts.agent10_agent3_runnable_queue_items}\``);
  lines.push(`- Changed artifacts found: \`${value.schema_counts.agent10_changed_artifacts_found}\``);
  lines.push(`- Exact new worksets found: \`${value.schema_counts.agent10_exact_new_worksets_found}\``);
  lines.push(`- New matrix rows / occurrences: \`${value.schema_counts.agent10_new_matrix_rows}\` / \`${value.schema_counts.agent10_new_matrix_occurrences}\``);
  lines.push('');
  lines.push('## Spark-10 Current Matrix Cap');
  lines.push('');
  lines.push(`- Inputs checked: \`${value.schema_counts.agent12_current_matrix_inputs_checked}\``);
  lines.push(`- Missing required inputs: \`${value.schema_counts.agent12_current_matrix_missing_required_inputs}\``);
  lines.push(`- Release-relevant rows: \`${value.schema_counts.agent12_current_matrix_release_relevant_rows}\``);
  lines.push(`- Agent 6 handoff candidate files: \`${value.schema_counts.agent12_current_matrix_agent6_handoff_candidate_files}\``);
  lines.push(`- Spark-10 standing status capped as stale: \`${value.agent12_control_cap.standing_status_capped_as_stale}\``);
  lines.push(`- Live matrix now: \`${value.schema_counts.live_spark10_inputs_checked}\` inputs checked, \`${value.schema_counts.live_spark10_matrix_rows}\` rows, \`${value.schema_counts.live_spark10_agent6_handoff_candidates}\` Agent 6 handoff candidates.`);
  lines.push(`- Agent 12 cap stale against live matrix: \`${value.schema_counts.agent12_cap_stale_against_live_matrix === 1}\``);
  lines.push('');
  lines.push('## Current Observer Context');
  lines.push('');
  lines.push(`- Current observer package: \`${paths.currentObserverJson}\``);
  lines.push(`- Matrix / Agent 3 / Spark-3 rows: \`${value.schema_counts.current_observer_matrix_rows}\` / \`${value.schema_counts.current_observer_agent3_rows}\` / \`${value.schema_counts.current_observer_spark3_rows}\``);
  lines.push(`- Total handoff candidates / Agent 3 handoff candidates: \`${value.schema_counts.current_observer_handoff_candidates}\` / \`${value.schema_counts.current_observer_agent3_handoff_candidates}\``);
  lines.push(`- Agent 3 state evidence / validators: \`${value.schema_counts.state_evidence_artifacts_exist}/${value.schema_counts.state_evidence_artifacts}\` / \`${value.schema_counts.state_validator_scripts_exist}/${value.schema_counts.state_validator_scripts}\``);
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
  lines.push('This receipt is non-public planning/navigation evidence only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, semantic arbitration, route ranking, answer selection, route publication support, public/runtime acceptance, publication readiness, package/export authorization, product/data acceptance, translation output, accepted gloss/text, public reader output, or public/runtime mutation.');
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

function pick(source, keys) {
  const out = {};
  for (const key of keys) out[key] = source?.[key] ?? null;
  return out;
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
