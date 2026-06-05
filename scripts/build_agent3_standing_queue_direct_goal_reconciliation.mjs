#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  sparkStandingQueueJson: 'data/control/spark_standing_queue.json',
  agent10DirectGoalStateJson: 'reports/agent10-direct-release-package-goal-state-2026-06-05.json',
  agent10DirectGoalStateMd: 'reports/agent10-direct-release-package-goal-state-2026-06-05.md',
  agent3DirectStateConsumptionJson:
    'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.json',
  agent3DirectStateConsumptionMd:
    'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.md',
  agent3PostMatrixPackageJson:
    'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json',
  agent3PostMatrixPackageMd:
    'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.md',
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  outputJson: 'reports/agent3-standing-queue-direct-goal-reconciliation-2026-06-05.json',
  outputMd: 'reports/agent3-standing-queue-direct-goal-reconciliation-2026-06-05.md',
};

const queue = readJson(paths.sparkStandingQueueJson);
const directGoal = readJson(paths.agent10DirectGoalStateJson);
const directConsumption = readJson(paths.agent3DirectStateConsumptionJson);
const postMatrix = readJson(paths.agent3PostMatrixPackageJson);
const spark10 = readJson(paths.spark10MatrixJson);

const queueAgent3 = (queue.direct_agent_goal_proof || []).find((row) => row.production_lane === 'Agent 3') || null;
const directGoalAgent3 = (directGoal.rows || []).find(
  (row) => row.agent10_direct_release_package_goal === 'Agent 3 Deuteronomy/linkage continuation',
) || null;
const directGoalMatrix = (directGoal.rows || []).find(
  (row) => row.agent10_direct_release_package_goal === 'Local release/package intake matrix',
) || null;
const spark10Rows = spark10.rows || [];
const agent3RelatedRows = spark10Rows.filter(isAgent3Related);
const agent3ExecutableRows = agent3RelatedRows.filter(isExecutableAgent3Workset);

const queueCurrentText = `${queueAgent3?.current_artifact_or_exact_blocker || ''} ${queueAgent3?.direct_active_goal || ''}`;
const queueNamesStaleDeuteronomyContractBlocker = /Deuteronomy phase-2 contract missing exact fields/i.test(
  queueCurrentText,
);
const currentNoWorksetBlocker =
  directGoalAgent3?.local_artifact_or_exact_blocker === 'no_exact_changed_executable_agent3_workset' &&
  directConsumption.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset' &&
  postMatrix.remaining_blocker?.blocker === 'no_exact_changed_executable_agent3_workset';

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_standing_queue_direct_goal_reconciliation',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  lane_owner: 'Agent 3',
  status: 'stale_queue_blocker_reconciled_to_current_no_workset_blocker',
  publication_state: 'blocked_no_render',
  target:
    'Reconcile the Agent 3 line in data/control/spark_standing_queue.json with current Agent 10 direct release/package goal state and current Agent 3 blocker evidence without editing control state.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run: 'node scripts/build_agent3_standing_queue_direct_goal_reconciliation.mjs',
  queue_agent3_line: {
    path: paths.sparkStandingQueueJson,
    exists: Boolean(queueAgent3),
    direct_active_goal: queueAgent3?.direct_active_goal || null,
    current_artifact_or_exact_blocker: queueAgent3?.current_artifact_or_exact_blocker || null,
    stop_condition: queueAgent3?.stop_condition || null,
    proof_location: queueAgent3?.proof_location || null,
    stale_deuteronomy_contract_blocker_observed: queueNamesStaleDeuteronomyContractBlocker,
  },
  current_agent10_direct_goal: {
    path: paths.agent10DirectGoalStateJson,
    generated_at: directGoal.generated_at,
    spark_assistant_capacity: directGoal.spark_assistant_capacity,
    agent3_row: directGoalAgent3 || null,
    local_matrix_row: directGoalMatrix || null,
  },
  current_agent3_consumption: {
    path: paths.agent3DirectStateConsumptionJson,
    status: directConsumption.status,
    remaining_blocker: directConsumption.remaining_blocker?.blocker || null,
    schema_counts: directConsumption.schema_counts || {},
  },
  current_post_matrix_package: {
    path: paths.agent3PostMatrixPackageJson,
    status: postMatrix.status,
    remaining_blocker: postMatrix.remaining_blocker?.blocker || null,
    schema_counts: postMatrix.schema_counts || {},
  },
  current_local_matrix: {
    path: paths.spark10MatrixJson,
    generated_at: spark10.generated_at,
    summary: spark10.summary || {},
    boundary: spark10.boundary || {},
    row_count: spark10Rows.length,
    agent3_related_rows: agent3RelatedRows.length,
    agent3_executable_rows: agent3ExecutableRows.length,
  },
  reconciliation: {
    queue_blocker_status: queueNamesStaleDeuteronomyContractBlocker ? 'stale' : 'not_observed',
    current_blocker_status: currentNoWorksetBlocker ? 'current_no_workset_blocker_observed' : 'needs_review',
    current_authority: 'Agent10 direct release/package goal state plus Agent3 direct-state consumption packet',
    control_edit_authorized: false,
    recommended_handoff:
      'Agent 10 / Agent 7 control owner may update queue language if desired; Agent 3 only supplies reconciliation evidence.',
  },
  schema_counts: {
    queue_agent3_rows: queueAgent3 ? 1 : 0,
    queue_stale_deuteronomy_contract_blocker_rows: queueNamesStaleDeuteronomyContractBlocker ? 1 : 0,
    direct_goal_agent3_rows: directGoalAgent3 ? 1 : 0,
    direct_goal_agent3_executable_worksets: number(directGoalAgent3?.counts?.direct_agent3_executable_worksets),
    direct_goal_transform_readiness_rows: number(directGoalAgent3?.counts?.transform_readiness_rows),
    direct_goal_transform_readiness_occurrences: number(directGoalAgent3?.counts?.transform_readiness_occurrences),
    direct_goal_agent3_matrix_rows: number(directGoalAgent3?.counts?.agent3_matrix_rows),
    direct_goal_agent3_matrix_occurrences: number(directGoalAgent3?.counts?.agent3_matrix_occurrences),
    direct_goal_exact_blocker_rows: number(directGoalAgent3?.counts?.exact_blocker_rows),
    direct_goal_exact_blocker_occurrences: number(directGoalAgent3?.counts?.exact_blocker_occurrences),
    direct_goal_matrix_inputs_checked: number(directGoalMatrix?.counts?.inputs_checked),
    direct_goal_matrix_release_relevant_rows: number(directGoalMatrix?.counts?.release_relevant_rows),
    direct_goal_matrix_agent6_handoff_candidates: number(directGoalMatrix?.counts?.agent6_handoff_candidates),
    spark10_matrix_inputs_checked: number(spark10.summary?.inputs_checked),
    spark10_matrix_release_relevant_rows: number(spark10.summary?.release_relevant_rows),
    spark10_matrix_agent6_handoff_candidates: number(spark10.summary?.agent6_handoff_candidates),
    spark10_agent3_related_rows: agent3RelatedRows.length,
    spark10_agent3_executable_rows: agent3ExecutableRows.length,
    direct_consumption_agent3_executable_worksets: number(
      directConsumption.schema_counts?.direct_goal_agent3_executable_worksets,
    ),
    post_matrix_direct_agent3_executable_worksets: number(
      postMatrix.schema_counts?.direct_agent3_executable_worksets,
    ),
    current_no_workset_blocker_sources: currentNoWorksetBlocker ? 3 : 0,
    control_edits: 0,
    route_publication_support_rows: 0,
    definition_authority_rows: 0,
    usage_as_definition_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutations: 0,
    public_reader_output_rows: 0,
  },
  reviewed_inputs: manifest(Object.entries(paths).filter(([key]) => !key.startsWith('output'))),
  remaining_blocker: {
    blocker: 'no_exact_changed_executable_agent3_workset',
    source: paths.agent10DirectGoalStateJson,
    wake_condition:
      'Wake Agent 3 only with changed artifact path or exact workset with rows/occurrences, inputs, output schema/path, validator/gate, handoff owner, and stop condition.',
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
    'Agent 10 / Agent 7 for control-language updates if desired; Agent 3 remains evidence-only and held until exact changed executable workset.',
  stop_condition:
    'Stop after recording that the standing queue Agent 3 line is stale relative to current Agent10/Agent3 no-workset evidence; no control edit is made by Agent 3.',
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
    control_state_mutation: false,
  },
  validators: [
    'node scripts/validate_agent3_standing_queue_direct_goal_reconciliation.mjs',
    'node scripts/validate_agent3_agent10_direct_release_goal_state_consumption.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 queue reconciliation: stale ${artifact.schema_counts.queue_stale_deuteronomy_contract_blocker_rows}; executable ${artifact.schema_counts.spark10_agent3_executable_rows}; blocker ${artifact.remaining_blocker.blocker}`,
);

function isAgent3Related(row) {
  return (
    row.lane_owner === 'Agent 3' ||
    row.lane_owner === 'Spark-3' ||
    /agent3/i.test(String(row.path || '')) ||
    /spark3/i.test(String(row.path || ''))
  );
}

function isExecutableAgent3Workset(row) {
  if (!isAgent3Related(row)) return false;
  return row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker' || row.agent3_runnable_now === true;
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function manifest(entries) {
  return entries.map(([role, inputPath]) => {
    const absolute = resolve(inputPath);
    return {
      role,
      path: inputPath,
      exists: fs.existsSync(absolute),
      bytes: fs.existsSync(absolute) ? fs.statSync(absolute).size : 0,
      sha256: fs.existsSync(absolute) ? sha256(inputPath) : null,
    };
  });
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

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(relativePath))).digest('hex');
}

function renderMarkdown(value) {
  const counts = value.schema_counts;
  return `# Agent 3 Standing Queue Direct Goal Reconciliation - 2026-06-05

## Status

- Artifact: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Target: ${value.target}

## Reconciliation

- Queue Agent 3 line: \`${value.queue_agent3_line.current_artifact_or_exact_blocker}\`
- Queue stale blocker observed: \`${value.reconciliation.queue_blocker_status}\`
- Current blocker: \`${value.remaining_blocker.blocker}\`
- Control edit authorized: \`${value.reconciliation.control_edit_authorized}\`
- Handoff: ${value.reconciliation.recommended_handoff}

## Counts

| Measure | Count |
| --- | ---: |
| Queue Agent 3 rows | ${counts.queue_agent3_rows} |
| Queue stale Deuteronomy blocker rows | ${counts.queue_stale_deuteronomy_contract_blocker_rows} |
| Direct Agent 3 executable worksets | ${counts.direct_goal_agent3_executable_worksets} |
| Transform/readiness rows | ${counts.direct_goal_transform_readiness_rows} |
| Transform/readiness occurrences | ${counts.direct_goal_transform_readiness_occurrences} |
| Agent 3 matrix rows | ${counts.direct_goal_agent3_matrix_rows} |
| Agent 3 matrix occurrences | ${counts.direct_goal_agent3_matrix_occurrences} |
| Exact blocker rows | ${counts.direct_goal_exact_blocker_rows} |
| Exact blocker occurrences | ${counts.direct_goal_exact_blocker_occurrences} |
| Spark10/local inputs checked | ${counts.spark10_matrix_inputs_checked} |
| Spark10/local Agent 3 executable rows | ${counts.spark10_agent3_executable_rows} |
| Current no-workset blocker sources | ${counts.current_no_workset_blocker_sources} |
| Control edits | ${counts.control_edits} |

## Boundary

This packet is non-public control reconciliation and linkage/navigation planning evidence only. It does not authorize source/provenance acceptance, license/legal acceptance, commercial export, Definition authority, usage-as-definition authority, answer eligibility, route ranking, candidate text export, route publication support, public/runtime mutation, publication readiness, accepted gloss/text, public reader output, or control-state mutation.

## Validation

${value.validators.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}
