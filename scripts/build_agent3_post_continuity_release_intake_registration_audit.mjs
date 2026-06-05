#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  latestAgent3PackageJson:
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
  latestAgent3PackageMd:
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md',
  latestAgent3Validator:
    'scripts/validate_agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package.mjs',
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  previousSpark10DeltaAuditJson: 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.json',
  previousSpark10DeltaAuditMd: 'reports/agent3-spark10-matrix-delta-audit-2026-06-05.md',
  agent10WeeklyBoundaryOrBlockerMd: 'reports/agent10-weekly-lexicon-release-next-boundary-or-blocker-2026-06-04.md',
  agent10ChangedOutputsConsumptionJson: 'reports/agent10-current-changed-lane-outputs-consumption-2026-06-04.json',
  agent10ChangedOutputsConsumptionMd: 'reports/agent10-current-changed-lane-outputs-consumption-2026-06-04.md',
  agent10CurrentBoundaryVerdictConsumptionJson:
    'reports/agent10-agent6-current-release-package-boundary-packets-verdict-consumption-2026-06-05.json',
  agent10CurrentBoundaryVerdictConsumptionMd:
    'reports/agent10-agent6-current-release-package-boundary-packets-verdict-consumption-2026-06-05.md',
  sparkQueueJson: 'data/control/spark_standing_queue.json',
  agentGoalBoardJson: 'data/control/agent_goal_board.json',
  agent3StateJson: 'reports/agent3-state.json',
  agent3StateMd: 'reports/agent3-state.md',
  outputJson: 'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json',
  outputMd: 'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.md',
};

const latestPackage = readJson(paths.latestAgent3PackageJson);
const matrix = readJson(paths.spark10MatrixJson);
const previousAudit = readJson(paths.previousSpark10DeltaAuditJson);
const changedOutputs = readJson(paths.agent10ChangedOutputsConsumptionJson);
const verdictConsumption = readJson(paths.agent10CurrentBoundaryVerdictConsumptionJson);
const sparkQueue = readJson(paths.sparkQueueJson);
const goalBoard = readJson(paths.agentGoalBoardJson);
const agent3State = readJson(paths.agent3StateJson);

const rows = matrix.rows || [];
const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3');
const spark3Rows = rows.filter((row) => row.lane_owner === 'Spark-3' || /spark3/i.test(String(row.path || '')));
const agent3RelatedRows = rows.filter((row) => isAgent3Related(row));
const handoffRows = rows.filter(isHandoffCandidate);
const agent3HandoffRows = agent3RelatedRows.filter(isHandoffCandidate);
const queueItems = Array.isArray(sparkQueue.items) ? sparkQueue.items : [];
const agent3RunnableQueueItems = queueItems.filter(isAgent3RunnableQueueItem);
const latestPackagePath = paths.latestAgent3PackageJson;
const latestPackageMdPath = paths.latestAgent3PackageMd;
const latestPackageInMatrix = rows.some((row) => row.path === latestPackagePath || row.path === latestPackageMdPath);
const stateEvidence = agent3State.evidence_artifacts || [];
const stateValidators = agent3State.validators || [];
const previousCounts = previousAudit.schema_counts || {};
const summary = matrix.summary || {};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_post_continuity_release_intake_registration_audit',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane_owner: 'Agent 3',
  status: latestPackageInMatrix
    ? 'latest_agent3_package_already_registered_no_new_workset'
    : 'latest_agent3_package_state_indexed_missing_spark10_intake_row',
  publication_state: 'blocked_no_render',
  target:
    'Audit whether the latest Agent 3 Deuteronomy transform/readiness continuity package is visible to Spark-10 release/package intake and whether any new executable Agent 3 workset exists.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run:
    'node scripts/build_agent3_post_continuity_release_intake_registration_audit.mjs',
  latest_agent3_package: {
    path: latestPackagePath,
    markdown_path: latestPackageMdPath,
    status: latestPackage.status,
    publication_state: latestPackage.publication_state,
    transform_readiness_rows:
      latestPackage.deuteronomy_transform_readiness_counts?.rows,
    transform_readiness_occurrences:
      latestPackage.deuteronomy_transform_readiness_counts?.occurrences,
    agent3_matrix_rows: latestPackage.agent3_linkage_matrix_counts?.rows,
    agent3_matrix_occurrences: latestPackage.agent3_linkage_matrix_counts?.occurrences,
    exact_blocker_rows: latestPackage.agent3_linkage_matrix_counts?.exact_blocker_rows,
    exact_blocker_occurrences:
      latestPackage.agent3_linkage_matrix_counts?.exact_blocker_occurrences,
    external_lane_rows_copied: latestPackage.package_summary?.external_lane_rows_copied,
    executable_output_authorized: latestPackage.package_summary?.executable_output_authorized,
    state_indexed_json: stateEvidence.includes(latestPackagePath),
    state_indexed_markdown: stateEvidence.includes(latestPackageMdPath),
    validator_indexed: stateValidators.includes(paths.latestAgent3Validator),
    spark10_intake_registered: latestPackageInMatrix,
  },
  spark10_current_matrix: {
    path: paths.spark10MatrixJson,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    summary,
    boundary: matrix.boundary || {},
    row_count: rows.length,
    agent3_rows: agent3Rows.length,
    spark3_rows: spark3Rows.length,
    agent3_related_rows: agent3RelatedRows.length,
    handoff_rows: handoffRows.length,
    agent3_related_handoff_rows: agent3HandoffRows.length,
    latest_agent3_package_registered: latestPackageInMatrix,
    agent3_related_paths: agent3RelatedRows.map((row) => ({
      path: row.path,
      lane_owner: row.lane_owner || null,
      status: row.status || null,
      blocker_class: row.blocker_class || null,
      next_agent10_action: row.next_agent10_action || null,
      agent6_handoff_needed: Boolean(row.agent6_handoff_needed || row.agent6_handoff_candidate),
    })),
  },
  previous_spark10_delta_audit: {
    path: paths.previousSpark10DeltaAuditJson,
    status: previousAudit.status,
    counts: pick(previousCounts, [
      'current_inputs_checked',
      'current_release_relevant_rows',
      'current_agent6_handoff_candidates',
      'current_matrix_rows',
      'current_agent3_rows',
      'current_spark3_rows',
      'agent10_agent3_runnable_queue_items',
      'agent10_changed_artifacts_found',
      'agent10_exact_new_worksets_found',
    ]),
  },
  agent10_changed_outputs_consumption: {
    path: paths.agent10ChangedOutputsConsumptionJson,
    status: changedOutputs.status,
    package_workset: changedOutputs.package_workset,
    consumed_packages: (changedOutputs.consumed_packages || []).map((entry) => ({
      package_workset: entry.package_workset,
      release_relevance: entry.release_relevance,
      exact_blocker: entry.exact_blocker,
    })),
    zero_counters: changedOutputs.zero_counters || {},
    highest_permissible_claim: changedOutputs.highest_permissible_claim,
  },
  agent10_current_boundary_verdict_consumption: {
    path: paths.agent10CurrentBoundaryVerdictConsumptionJson,
    disposition: verdictConsumption.disposition,
    packets: (verdictConsumption.packets || []).map((packet) => ({
      workset: packet.workset,
      carried_forward_as: packet.carried_forward_as,
    })),
    zero_counters: verdictConsumption.zero_counters || {},
    next_release_owner_action: verdictConsumption.next_release_owner_action,
  },
  queue_reference: {
    path: paths.sparkQueueJson,
    queue_items_seen: queueItems.length,
    direct_agent3_runnable_items: agent3RunnableQueueItems.map((item) => ({
      id: item.id || null,
      status: item.status || null,
      expected_output: item.expected_output || null,
    })),
  },
  goal_reference: {
    path: paths.agentGoalBoardJson,
    agent3_goal: ((goalBoard.goals || []).find((goal) => goal.id === 'agent3-broad-linkage-dedupe-navigation')
      || (goalBoard.goals || []).find((goal) => goal.id === 'agent3-definition-occurrence-links')
      || null),
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
    previous_inputs_checked: number(previousCounts.current_inputs_checked),
    previous_release_relevant_rows: number(previousCounts.current_release_relevant_rows),
    previous_agent6_handoff_candidates: number(previousCounts.current_agent6_handoff_candidates),
    previous_matrix_rows: number(previousCounts.current_matrix_rows),
    previous_agent3_rows: number(previousCounts.current_agent3_rows),
    previous_spark3_rows: number(previousCounts.current_spark3_rows),
    current_inputs_checked: number(summary.inputs_checked),
    current_missing_required_inputs: number(summary.missing_required_inputs),
    current_release_relevant_rows: number(summary.release_relevant_rows),
    current_agent6_handoff_candidates: number(summary.agent6_handoff_candidates),
    current_matrix_rows: rows.length,
    current_agent3_rows: agent3Rows.length,
    current_spark3_rows: spark3Rows.length,
    current_agent3_related_rows: agent3RelatedRows.length,
    current_handoff_rows: handoffRows.length,
    current_agent3_related_handoff_rows: agent3HandoffRows.length,
    input_delta_since_previous_audit: number(summary.inputs_checked) - number(previousCounts.current_inputs_checked),
    matrix_row_delta_since_previous_audit: rows.length - number(previousCounts.current_matrix_rows),
    release_relevant_delta_since_previous_audit:
      number(summary.release_relevant_rows) - number(previousCounts.current_release_relevant_rows),
    handoff_delta_since_previous_audit:
      number(summary.agent6_handoff_candidates) - number(previousCounts.current_agent6_handoff_candidates),
    agent3_row_delta_since_previous_audit: agent3Rows.length - number(previousCounts.current_agent3_rows),
    spark3_row_delta_since_previous_audit: spark3Rows.length - number(previousCounts.current_spark3_rows),
    latest_agent3_package_state_indexed:
      stateEvidence.includes(latestPackagePath) && stateEvidence.includes(latestPackageMdPath) ? 1 : 0,
    latest_agent3_validator_state_indexed: stateValidators.includes(paths.latestAgent3Validator) ? 1 : 0,
    latest_agent3_package_spark10_registered: latestPackageInMatrix ? 1 : 0,
    direct_queue_agent3_runnable_items: agent3RunnableQueueItems.length,
    route_publication_support_rows: 0,
    definition_authority_rows: 0,
    usage_as_definition_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutations: 0,
    public_reader_output_rows: 0,
  },
  reviewed_inputs: manifest(Object.entries(paths).filter(([key]) => !key.startsWith('output'))),
  volatile_reviewed_input_roles: [
    'spark10MatrixJson',
    'spark10MatrixMd',
    'agent10WeeklyBoundaryOrBlockerMd',
    'sparkQueueJson',
    'agentGoalBoardJson',
    'agent3StateJson',
    'agent3StateMd',
  ],
  missing_field_blocker: {
    blocker: latestPackageInMatrix
      ? 'missing_changed_artifact_or_exact_workset'
      : 'missing_spark10_intake_registration_or_exact_agent3_workset',
    source: paths.spark10MatrixJson,
    wake_condition: latestPackageInMatrix
      ? 'Latest Agent 3 package is registered in Spark-10 intake, but Agent 3 still lacks an exact changed executable workset.'
      : 'Latest Agent 3 package is state-indexed but not represented as its own Spark-10 intake row; Agent 3 still lacks an exact changed executable workset.',
    missing_fields: [
      'spark10_contract_or_matrix_row_for_latest_agent3_package_if_release_owner_wants_intake_tracking',
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
    'Agent 10 for release/package intake registration decision; Agent 6 only by exact boundary packet prepared through release owner; Agent 3 remains held until exact changed workset.',
  stop_condition:
    'Stop after recording latest Agent 3 package registration state and the absence of an executable Agent 3 workset.',
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
    'node scripts/validate_agent3_post_continuity_release_intake_registration_audit.mjs',
    'node scripts/validate_agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 post-continuity intake registration: latest package in state ${artifact.schema_counts.latest_agent3_package_state_indexed}; in Spark10 ${artifact.schema_counts.latest_agent3_package_spark10_registered}; direct runnable ${artifact.schema_counts.direct_queue_agent3_runnable_items}`,
);

function isAgent3Related(row) {
  return (
    row.lane_owner === 'Agent 3' ||
    row.lane_owner === 'Spark-3' ||
    /agent3/i.test(String(row.path || '')) ||
    /spark3/i.test(String(row.path || ''))
  );
}

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
      sha256: crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex'),
      bytes: stat.size,
    };
  });
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
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

function renderMarkdown(value) {
  const counts = value.schema_counts;
  return `# Agent 3 Post-Continuity Release Intake Registration Audit - 2026-06-05

## Status

- Artifact: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Target: ${value.target}

## Latest Agent 3 Package

- Package: \`${value.latest_agent3_package.path}\`
- Status: \`${value.latest_agent3_package.status}\`
- Transform/readiness rows / occurrences: \`${value.latest_agent3_package.transform_readiness_rows}\` / \`${value.latest_agent3_package.transform_readiness_occurrences}\`
- Agent 3 matrix rows / occurrences: \`${value.latest_agent3_package.agent3_matrix_rows}\` / \`${value.latest_agent3_package.agent3_matrix_occurrences}\`
- Exact blocker rows / occurrences: \`${value.latest_agent3_package.exact_blocker_rows}\` / \`${value.latest_agent3_package.exact_blocker_occurrences}\`
- State indexed: \`${Boolean(counts.latest_agent3_package_state_indexed)}\`
- Spark10 intake registered: \`${Boolean(counts.latest_agent3_package_spark10_registered)}\`

## Spark10 Snapshot

| Measure | Count |
| --- | ---: |
| Inputs checked | ${counts.current_inputs_checked} |
| Release-relevant rows | ${counts.current_release_relevant_rows} |
| Agent 6 handoff candidates | ${counts.current_agent6_handoff_candidates} |
| Matrix rows | ${counts.current_matrix_rows} |
| Agent 3 rows | ${counts.current_agent3_rows} |
| Spark-3 rows | ${counts.current_spark3_rows} |
| Agent 3 related rows | ${counts.current_agent3_related_rows} |
| Agent 3 related handoff rows | ${counts.current_agent3_related_handoff_rows} |
| Direct queue Agent 3 runnable items | ${counts.direct_queue_agent3_runnable_items} |

## Blocker

- Blocker: \`${value.missing_field_blocker.blocker}\`
- Wake condition: ${value.missing_field_blocker.wake_condition}
- Handoff owner: ${value.handoff_owner}

## Boundary

This audit is non-public planning/navigation evidence only. It does not authorize source/provenance acceptance, license/legal acceptance, commercial export, Definition authority, usage-as-definition authority, answer eligibility, route ranking, candidate text export, route publication support, public/runtime mutation, publication readiness, accepted gloss/text, or public reader output.

## Validation

${value.validators.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_post_continuity_release_intake_registration_audit:start -->';
  const end = '<!-- agent3_post_continuity_release_intake_registration_audit:end -->';
  const section = `${start}

## Latest Post-Continuity Release Intake Registration Audit

- Package: \`${paths.outputMd}\`
- JSON: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Latest Agent 3 package: \`${value.latest_agent3_package.path}\`
- Spark10 inputs/release/handoff: ${value.schema_counts.current_inputs_checked} / ${value.schema_counts.current_release_relevant_rows} / ${value.schema_counts.current_agent6_handoff_candidates}
- Registration: state indexed ${Boolean(value.schema_counts.latest_agent3_package_state_indexed)}; Spark10 intake registered ${Boolean(value.schema_counts.latest_agent3_package_spark10_registered)}.
- Blocker: \`${value.missing_field_blocker.blocker}\`; no Agent 3 executable workset is created here.

${end}`;
  const absolute = resolve(paths.agent3StateMd);
  const existing = fs.existsSync(absolute) ? readText(paths.agent3StateMd) : '# Agent 3 State\n';
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  const next = pattern.test(existing) ? existing.replace(pattern, section) : `${existing.trimEnd()}\n\n${section}\n`;
  fs.writeFileSync(absolute, next);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
