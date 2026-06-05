#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  previousPostRefreshAuditJson: 'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.json',
  previousPostRefreshAuditMd: 'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.md',
  liveRefreshJson: 'reports/agent3-spark10-live-matrix-refresh-observer-package-2026-06-04.json',
  agent10ConsumptionJson: 'reports/agent10-agent3-post-custody-wake-and-control-cap-consumption-2026-06-04.json',
  sparkQueueJson: 'data/control/spark_standing_queue.json',
  agentGoalBoardJson: 'data/control/agent_goal_board.json',
  agent3StateJson: 'reports/agent3-state.json',
  outputJson: 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.json',
  outputMd: 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.md',
};

const matrix = readJson(paths.spark10MatrixJson);
const previousAudit = readJson(paths.previousPostRefreshAuditJson);
const liveRefresh = readJson(paths.liveRefreshJson);
const agent10Consumption = readJson(paths.agent10ConsumptionJson);
const sparkQueue = readJson(paths.sparkQueueJson);
const goalBoard = readJson(paths.agentGoalBoardJson);
const agent3State = readJson(paths.agent3StateJson);

const rows = matrix.rows || [];
const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3');
const spark3Rows = rows.filter(
  (row) => row.lane_owner === 'Spark-3' || row.lane_owner === 'Spark 3' || /spark3/i.test(String(row.path || '')),
);
const handoffRows = rows.filter(isHandoffCandidate);
const agent3HandoffRows = agent3Rows.filter(isHandoffCandidate);
const queueItems = Array.isArray(sparkQueue.items) ? sparkQueue.items : [];
const directAgent3RunnableItems = queueItems.filter(isAgent3RunnableQueueItem);
const agent3Goal = (goalBoard.goals || []).find((goal) => goal.id === 'agent3-broad-linkage-dedupe-navigation')
  || (goalBoard.goals || []).find((goal) => goal.id === 'agent3-definition-occurrence-links')
  || null;

const summary = matrix.summary || {};
const previousCounts = previousAudit.schema_counts || {};
const agent10Counts = agent10Consumption.counts || {};
const stateCounts = agent3State.counts || {};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark10_matrix_delta_audit',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane_owner: 'Agent 3',
  status: 'spark10_matrix_delta_observed_no_agent3_workset',
  publication_state: 'blocked_no_render',
  target:
    'Record the live Spark-10 intake matrix delta after the prior Agent 3 post-refresh no-new-workset audit while preserving Agent 3 as evidence/navigation only.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run: 'node scripts/build_agent3_spark10_matrix_delta_audit.mjs',
  previous_post_refresh_audit: {
    path: paths.previousPostRefreshAuditJson,
    status: previousAudit.status,
    counts: pick(previousCounts, [
      'current_matrix_inputs_checked',
      'current_matrix_release_relevant_rows',
      'current_matrix_agent6_handoff_candidates',
      'current_matrix_rows',
      'current_matrix_agent3_rows',
      'current_matrix_spark3_rows',
      'agent10_agent3_runnable_queue_items',
      'agent10_changed_artifacts_found',
      'agent10_exact_new_worksets_found',
    ]),
    blocker: previousAudit.missing_field_blocker || null,
  },
  live_refresh_reference: {
    path: paths.liveRefreshJson,
    status: liveRefresh.status,
    snapshot_counts: pick(liveRefresh.schema_counts || {}, [
      'live_inputs_checked',
      'live_release_relevant_rows',
      'live_agent6_handoff_candidates',
      'matrix_row_delta_since_previous_observer',
    ]),
  },
  current_matrix: {
    path: paths.spark10MatrixJson,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    summary,
    boundary: matrix.boundary || {},
    row_count: rows.length,
    agent3_rows: agent3Rows.length,
    spark3_rows: spark3Rows.length,
    handoff_rows: handoffRows.length,
    agent3_handoff_rows: agent3HandoffRows.length,
  },
  agent10_consumption_reference: {
    path: paths.agent10ConsumptionJson,
    status: agent10Consumption.status,
    counts: agent10Counts,
    exact_blocker: agent10Consumption.exact_blocker || null,
    stop_condition: agent10Consumption.stop_condition || null,
    zero_counters: agent10Consumption.zero_counters || {},
  },
  queue_reference: {
    path: paths.sparkQueueJson,
    queue_items_seen: queueItems.length,
    direct_agent3_runnable_items: directAgent3RunnableItems.map((item) => ({
      id: item.id || null,
      status: item.status || null,
      expected_output: item.expected_output || null,
    })),
  },
  goal_reference: {
    path: paths.agentGoalBoardJson,
    id: agent3Goal?.id || null,
    status: agent3Goal?.status || null,
    latest_spark_artifact: agent3Goal?.latest_spark_artifact || null,
    next_action: agent3Goal?.next_action || null,
  },
  agent3_state_reference: {
    path: paths.agent3StateJson,
    quality_status: agent3State.quality?.status || null,
    evidence_artifacts: number(stateCounts.evidence_artifacts),
    evidence_artifacts_exist: number(stateCounts.evidence_artifacts_exist),
    validator_scripts: number(stateCounts.validator_scripts),
    validator_scripts_exist: number(stateCounts.validator_scripts_exist),
  },
  schema_counts: {
    previous_inputs_checked: number(previousCounts.current_matrix_inputs_checked),
    previous_release_relevant_rows: number(previousCounts.current_matrix_release_relevant_rows),
    previous_agent6_handoff_candidates: number(previousCounts.current_matrix_agent6_handoff_candidates),
    previous_matrix_rows: number(previousCounts.current_matrix_rows),
    previous_agent3_rows: number(previousCounts.current_matrix_agent3_rows),
    previous_spark3_rows: number(previousCounts.current_matrix_spark3_rows),
    current_inputs_checked: number(summary.inputs_checked),
    current_missing_required_inputs: number(summary.missing_required_inputs),
    current_release_relevant_rows: number(summary.release_relevant_rows),
    current_agent6_handoff_candidates: number(summary.agent6_handoff_candidates),
    current_matrix_rows: rows.length,
    current_agent3_rows: agent3Rows.length,
    current_spark3_rows: spark3Rows.length,
    current_handoff_rows: handoffRows.length,
    current_agent3_handoff_rows: agent3HandoffRows.length,
    input_delta_since_previous_audit: number(summary.inputs_checked) - number(previousCounts.current_matrix_inputs_checked),
    matrix_row_delta_since_previous_audit: rows.length - number(previousCounts.current_matrix_rows),
    release_relevant_delta_since_previous_audit:
      number(summary.release_relevant_rows) - number(previousCounts.current_matrix_release_relevant_rows),
    handoff_delta_since_previous_audit:
      number(summary.agent6_handoff_candidates) - number(previousCounts.current_matrix_agent6_handoff_candidates),
    agent3_row_delta_since_previous_audit: agent3Rows.length - number(previousCounts.current_matrix_agent3_rows),
    spark3_row_delta_since_previous_audit: spark3Rows.length - number(previousCounts.current_matrix_spark3_rows),
    agent10_agent3_runnable_queue_items: number(agent10Counts.agent3_runnable_queue_items),
    agent10_changed_artifacts_found: number(agent10Counts.changed_artifacts_found),
    agent10_exact_new_worksets_found: number(agent10Counts.exact_new_worksets_found),
    agent10_new_matrix_rows: number(agent10Counts.new_matrix_rows),
    agent10_new_matrix_occurrences: number(agent10Counts.new_matrix_occurrences),
    direct_queue_agent3_runnable_items: directAgent3RunnableItems.length,
    state_evidence_artifacts: number(stateCounts.evidence_artifacts),
    state_evidence_artifacts_exist: number(stateCounts.evidence_artifacts_exist),
    state_validator_scripts: number(stateCounts.validator_scripts),
    state_validator_scripts_exist: number(stateCounts.validator_scripts_exist),
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
      'Spark-10 intake matrix size changed, but Agent 3 still lacks a changed Agent 3 artifact path or exact workset with named inputs, row/occurrence bounds, output schema/path, validator/gate, handoff owner, and stop condition.',
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
    'Stop after recording the Spark-10 matrix delta because the delta changes release-intake surface size only and does not create an Agent 3 executable workset.',
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
    'node scripts/validate_agent3_spark10_matrix_delta_audit.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 Spark-10 matrix delta: inputs +${artifact.schema_counts.input_delta_since_previous_audit}; release +${artifact.schema_counts.release_relevant_delta_since_previous_audit}; handoff +${artifact.schema_counts.handoff_delta_since_previous_audit}; runnable ${artifact.schema_counts.agent10_agent3_runnable_queue_items}`,
);

function isHandoffCandidate(row) {
  return (
    row.agent6_handoff_candidate === true ||
    row.agent6_handoff_needed === true ||
    row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists'
  );
}

function isAgent3RunnableQueueItem(item) {
  if (item.agent3_runnable_now === true) return true;
  const owners = item.package_owners || [];
  const hasCommands = Array.isArray(item.pipeline_commands) && item.pipeline_commands.length > 0;
  const status = String(item.status || '');
  return owners.includes('Agent 3') && hasCommands && !/returned|sleep|missing|blocked/.test(status);
}

function pick(source, keys) {
  const out = {};
  for (const key of keys) out[key] = source?.[key] ?? null;
  return out;
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
  lines.push('# Agent 3 Spark-10 Matrix Delta Audit - 2026-06-05');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${paths.outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Target: ${value.target}`);
  lines.push('');
  lines.push('## Matrix Delta');
  lines.push('');
  lines.push(`- Previous audit matrix: \`${value.schema_counts.previous_inputs_checked}\` inputs, \`${value.schema_counts.previous_release_relevant_rows}\` release-relevant rows, \`${value.schema_counts.previous_agent6_handoff_candidates}\` handoff candidates.`);
  lines.push(`- Current matrix: \`${value.schema_counts.current_inputs_checked}\` inputs, \`${value.schema_counts.current_release_relevant_rows}\` release-relevant rows, \`${value.schema_counts.current_agent6_handoff_candidates}\` handoff candidates.`);
  lines.push(`- Input / matrix row delta: \`${value.schema_counts.input_delta_since_previous_audit}\` / \`${value.schema_counts.matrix_row_delta_since_previous_audit}\``);
  lines.push(`- Release-relevant / handoff delta: \`${value.schema_counts.release_relevant_delta_since_previous_audit}\` / \`${value.schema_counts.handoff_delta_since_previous_audit}\``);
  lines.push(`- Agent 3 / Spark-3 row delta: \`${value.schema_counts.agent3_row_delta_since_previous_audit}\` / \`${value.schema_counts.spark3_row_delta_since_previous_audit}\``);
  lines.push('');
  lines.push('## Workset Check');
  lines.push('');
  lines.push(`- Agent 3 runnable queue items: \`${value.schema_counts.agent10_agent3_runnable_queue_items}\``);
  lines.push(`- Direct queue Agent 3 runnable items: \`${value.schema_counts.direct_queue_agent3_runnable_items}\``);
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
  lines.push('This audit is non-public planning/navigation evidence only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, semantic arbitration, route ranking, answer selection, route publication support, public/runtime acceptance, publication readiness, package/export authorization, product/data acceptance, translation output, accepted gloss/text, public reader output, or public/runtime mutation.');
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
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
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
