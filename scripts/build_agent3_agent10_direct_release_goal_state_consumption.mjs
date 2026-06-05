#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  agent10DirectGoalStateJson: 'reports/agent10-direct-release-package-goal-state-2026-06-05.json',
  agent10DirectGoalStateMd: 'reports/agent10-direct-release-package-goal-state-2026-06-05.md',
  agent10PostMatrixJson: 'reports/agent10-post-matrix-lane-output-consumption-2026-06-05.json',
  agent10PostMatrixMd: 'reports/agent10-post-matrix-lane-output-consumption-2026-06-05.md',
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  agent3PostMatrixPackageJson:
    'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json',
  agent3PostMatrixPackageMd:
    'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.md',
  agent3Spark10DeltaAuditJson: 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.json',
  agent3Spark10DeltaAuditMd: 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.md',
  agent3PostRefreshAuditJson: 'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.json',
  agent3PostRefreshAuditMd: 'reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.md',
  latestAgent3ContinuityJson:
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
  latestAgent3ContinuityMd:
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md',
  outputJson: 'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.json',
  outputMd: 'reports/agent3-agent10-direct-release-goal-state-consumption-2026-06-05.md',
};

const directGoal = readJson(paths.agent10DirectGoalStateJson);
const postMatrix = readJson(paths.agent10PostMatrixJson);
const spark10 = readJson(paths.spark10MatrixJson);
const agent3PostMatrix = readJson(paths.agent3PostMatrixPackageJson);
const deltaAudit = readJson(paths.agent3Spark10DeltaAuditJson);
const postRefreshAudit = readJson(paths.agent3PostRefreshAuditJson);
const continuity = readJson(paths.latestAgent3ContinuityJson);

const directGoalRows = directGoal.rows || [];
const directAgent3Row = findRow(
  directGoalRows,
  'agent10_direct_release_package_goal',
  'Agent 3 Deuteronomy/linkage continuation',
);
const directMatrixRow = findRow(directGoalRows, 'agent10_direct_release_package_goal', 'Local release/package intake matrix');
const postMatrixAgent3Continuity = findPackage(postMatrix, 'agent3_deuteronomy_phase2_continuity_registration');
const postMatrixAgent3Support = findPackage(postMatrix, 'agent3_post_matrix_and_post_refresh_no_workset_support');
const spark10Rows = spark10.rows || [];
const agent3RelatedRows = spark10Rows.filter(isAgent3Related);
const agent3ExecutableRows = agent3RelatedRows.filter(isExecutableAgent3Workset);
const agent6HandoffRows = spark10Rows.filter((row) => row.agent6_handoff_needed === true);
const zeroCounters = directGoal.zero_counters || {};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_agent10_direct_release_goal_state_consumption',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode',
  lane_owner: 'Agent 3',
  status: 'direct_release_goal_state_consumed_no_agent3_workset',
  publication_state: 'blocked_no_render',
  target:
    'Consume Agent 10 direct release/package goal state for the Agent 3 linkage/dedupe/navigation lane and preserve the exact no-workset blocker without creating authority or release claims.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run:
    'node scripts/build_agent3_agent10_direct_release_goal_state_consumption.mjs',
  agent10_direct_goal_state: {
    path: paths.agent10DirectGoalStateJson,
    artifact_type: directGoal.artifact_type,
    generated_at: directGoal.generated_at,
    release_owner: directGoal.release_owner,
    spark_assistant_capacity: directGoal.spark_assistant_capacity,
    highest_permissible_claim: directGoal.highest_permissible_claim,
    forbidden_claims: directGoal.forbidden_claims || [],
    agent3_row: directAgent3Row || null,
    local_matrix_row: directMatrixRow || null,
    zero_counters: zeroCounters,
  },
  agent10_post_matrix_reference: {
    path: paths.agent10PostMatrixJson,
    artifact_type: postMatrix.artifact_type,
    generated_at: postMatrix.generated_at,
    package_workset: postMatrix.package_workset,
    agent3_continuity_package: postMatrixAgent3Continuity || null,
    agent3_support_package: postMatrixAgent3Support || null,
    next_handoff: postMatrix.next_handoff || {},
    highest_permissible_claim: postMatrix.highest_permissible_claim,
  },
  spark10_local_matrix_reference: {
    path: paths.spark10MatrixJson,
    artifact_type: spark10.artifact_type,
    generated_at: spark10.generated_at,
    summary: spark10.summary || {},
    boundary: spark10.boundary || {},
    row_count: spark10Rows.length,
    agent3_related_rows: agent3RelatedRows.length,
    agent3_executable_rows: agent3ExecutableRows.map((row) => ({
      path: row.path,
      status: row.status || null,
      next_agent10_action: row.next_agent10_action || null,
    })),
    agent6_handoff_rows: agent6HandoffRows.length,
  },
  prior_agent3_support_references: {
    post_matrix_package: {
      path: paths.agent3PostMatrixPackageJson,
      status: agent3PostMatrix.status,
      remaining_blocker: agent3PostMatrix.remaining_blocker?.blocker || null,
      schema_counts: agent3PostMatrix.schema_counts || {},
    },
    spark10_delta_audit: {
      path: paths.agent3Spark10DeltaAuditJson,
      status: deltaAudit.status,
      publication_state: deltaAudit.publication_state,
      note: 'Earlier matrix-delta observation is support evidence only and is superseded for live counts by Agent 10 direct goal state plus current local matrix validation.',
    },
    post_refresh_audit: {
      path: paths.agent3PostRefreshAuditJson,
      status: postRefreshAudit.status,
      publication_state: postRefreshAudit.publication_state,
      note: 'Earlier no-workset audit is support evidence only and is superseded for live counts by Agent 10 direct goal state plus current local matrix validation.',
    },
  },
  latest_agent3_continuity_package: {
    path: paths.latestAgent3ContinuityJson,
    status: continuity.status,
    publication_state: continuity.publication_state,
    transform_readiness_rows: continuity.deuteronomy_transform_readiness_counts?.rows,
    transform_readiness_occurrences: continuity.deuteronomy_transform_readiness_counts?.occurrences,
    agent3_matrix_rows: continuity.agent3_linkage_matrix_counts?.rows,
    agent3_matrix_occurrences: continuity.agent3_linkage_matrix_counts?.occurrences,
    exact_blocker_rows: continuity.agent3_linkage_matrix_counts?.exact_blocker_rows,
    exact_blocker_occurrences: continuity.agent3_linkage_matrix_counts?.exact_blocker_occurrences,
    external_lane_rows_copied: continuity.package_summary?.external_lane_rows_copied,
    executable_output_authorized: continuity.package_summary?.executable_output_authorized,
  },
  schema_counts: {
    direct_goal_rows: directGoalRows.length,
    direct_goal_agent3_rows: directAgent3Row ? 1 : 0,
    direct_goal_local_matrix_rows: directMatrixRow ? 1 : 0,
    direct_goal_transform_readiness_rows: number(directAgent3Row?.counts?.transform_readiness_rows),
    direct_goal_transform_readiness_occurrences: number(directAgent3Row?.counts?.transform_readiness_occurrences),
    direct_goal_agent3_matrix_rows: number(directAgent3Row?.counts?.agent3_matrix_rows),
    direct_goal_agent3_matrix_occurrences: number(directAgent3Row?.counts?.agent3_matrix_occurrences),
    direct_goal_exact_blocker_rows: number(directAgent3Row?.counts?.exact_blocker_rows),
    direct_goal_exact_blocker_occurrences: number(directAgent3Row?.counts?.exact_blocker_occurrences),
    direct_goal_agent3_executable_worksets: number(directAgent3Row?.counts?.direct_agent3_executable_worksets),
    direct_goal_matrix_inputs_checked: number(directMatrixRow?.counts?.inputs_checked),
    direct_goal_matrix_release_relevant_rows: number(directMatrixRow?.counts?.release_relevant_rows),
    direct_goal_matrix_agent6_handoff_candidates: number(directMatrixRow?.counts?.agent6_handoff_candidates),
    direct_goal_matrix_counts_match_current:
      number(directMatrixRow?.counts?.inputs_checked) === number(spark10.summary?.inputs_checked) &&
      number(directMatrixRow?.counts?.release_relevant_rows) === number(spark10.summary?.release_relevant_rows) &&
      number(directMatrixRow?.counts?.agent6_handoff_candidates) ===
        number(spark10.summary?.agent6_handoff_candidates)
        ? 1
        : 0,
    matrix_input_delta_since_direct_goal:
      number(spark10.summary?.inputs_checked) - number(directMatrixRow?.counts?.inputs_checked),
    matrix_release_relevant_delta_since_direct_goal:
      number(spark10.summary?.release_relevant_rows) - number(directMatrixRow?.counts?.release_relevant_rows),
    matrix_handoff_delta_since_direct_goal:
      number(spark10.summary?.agent6_handoff_candidates) -
      number(directMatrixRow?.counts?.agent6_handoff_candidates),
    spark10_matrix_inputs_checked: number(spark10.summary?.inputs_checked),
    spark10_matrix_missing_required_inputs: number(spark10.summary?.missing_required_inputs),
    spark10_matrix_release_relevant_rows: number(spark10.summary?.release_relevant_rows),
    spark10_matrix_agent6_handoff_candidates: number(spark10.summary?.agent6_handoff_candidates),
    spark10_matrix_rows: spark10Rows.length,
    spark10_agent3_related_rows: agent3RelatedRows.length,
    spark10_agent3_executable_rows: agent3ExecutableRows.length,
    spark10_agent6_handoff_rows: agent6HandoffRows.length,
    post_matrix_agent3_support_packages: postMatrixAgent3Support ? 1 : 0,
    post_matrix_agent3_support_changed_artifacts_found: number(
      postMatrixAgent3Support?.counts?.agent3_changed_artifacts_found,
    ),
    post_matrix_agent3_support_exact_new_worksets_found: number(
      postMatrixAgent3Support?.counts?.agent3_exact_new_worksets_found,
    ),
    post_matrix_agent3_support_direct_executable_worksets: number(
      postMatrixAgent3Support?.counts?.direct_agent3_executable_worksets,
    ),
    post_matrix_package_direct_executable_worksets: number(
      agent3PostMatrix.schema_counts?.direct_agent3_executable_worksets,
    ),
    zero_counter_total: Object.values(zeroCounters).reduce((sum, value) => sum + number(value), 0),
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
    'Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner; Agent 3 remains held until exact changed executable workset.',
  stop_condition:
    'Stop after consuming the current Agent 10 direct release/package goal state and recording that Agent 3 still has zero executable changed worksets.',
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
    'node scripts/validate_agent3_agent10_direct_release_goal_state_consumption.mjs',
    'node scripts/validate_agent3_agent10_post_matrix_registration_consumption_package.mjs',
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
    'node scripts/validate_agent3_usage_state.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 direct-state consumption: matrix ${artifact.schema_counts.spark10_matrix_inputs_checked}; Agent3 executable ${artifact.schema_counts.direct_goal_agent3_executable_worksets}; blocker ${artifact.remaining_blocker.blocker}`,
);

function findRow(rows, key, expectedValue) {
  return rows.find((row) => row[key] === expectedValue) || null;
}

function findPackage(value, packageWorkset) {
  return (value.consumed_packages || []).find((entry) => entry.package_workset === packageWorkset) || null;
}

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
  return (
    row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker' ||
    row.agent3_runnable_now === true
  );
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
  return `# Agent 3 Agent10 Direct Release Goal State Consumption - 2026-06-05

## Status

- Artifact: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Target: ${value.target}

## Direct State

- Agent 10 input: \`${value.agent10_direct_goal_state.path}\`
- Spark/assistant capacity: \`${value.agent10_direct_goal_state.spark_assistant_capacity}\`
- Agent 3 blocker: \`${value.remaining_blocker.blocker}\`
- Wake condition: ${value.remaining_blocker.wake_condition}

## Counts

| Measure | Count |
| --- | ---: |
| Direct goal rows | ${counts.direct_goal_rows} |
| Direct Agent 3 rows | ${counts.direct_goal_agent3_rows} |
| Transform/readiness rows | ${counts.direct_goal_transform_readiness_rows} |
| Transform/readiness occurrences | ${counts.direct_goal_transform_readiness_occurrences} |
| Agent 3 matrix rows | ${counts.direct_goal_agent3_matrix_rows} |
| Agent 3 matrix occurrences | ${counts.direct_goal_agent3_matrix_occurrences} |
| Exact blocker rows | ${counts.direct_goal_exact_blocker_rows} |
| Exact blocker occurrences | ${counts.direct_goal_exact_blocker_occurrences} |
| Direct Agent 3 executable worksets | ${counts.direct_goal_agent3_executable_worksets} |
| Spark10/local inputs checked | ${counts.spark10_matrix_inputs_checked} |
| Spark10/local release-relevant rows | ${counts.spark10_matrix_release_relevant_rows} |
| Spark10/local Agent 6 handoff candidates | ${counts.spark10_matrix_agent6_handoff_candidates} |
| Matrix input delta since direct goal | ${counts.matrix_input_delta_since_direct_goal} |
| Spark10/local Agent 3 executable rows | ${counts.spark10_agent3_executable_rows} |
| Post-matrix Agent 3 changed artifacts | ${counts.post_matrix_agent3_support_changed_artifacts_found} |
| Post-matrix Agent 3 exact new worksets | ${counts.post_matrix_agent3_support_exact_new_worksets_found} |
| Zero counter total | ${counts.zero_counter_total} |

## Boundary

This package is non-public linkage/navigation planning evidence only. It does not authorize source/provenance acceptance, license/legal acceptance, commercial export, Definition authority, usage-as-definition authority, answer eligibility, route ranking, candidate text export, route publication support, public/runtime mutation, publication readiness, accepted gloss/text, or public reader output.

## Validation

${value.validators.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}
