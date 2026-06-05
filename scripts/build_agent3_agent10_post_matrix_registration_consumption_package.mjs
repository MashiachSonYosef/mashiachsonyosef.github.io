#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  agent10PostMatrixConsumptionJson: 'reports/agent10-post-matrix-lane-output-consumption-2026-06-05.json',
  agent10PostMatrixConsumptionMd: 'reports/agent10-post-matrix-lane-output-consumption-2026-06-05.md',
  latestAgent3ContinuityJson:
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.json',
  latestAgent3ContinuityMd:
    'reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md',
  latestAgent3RegistrationAuditJson:
    'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.json',
  latestAgent3RegistrationAuditMd:
    'reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.md',
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  agent3StateJson: 'reports/agent3-state.json',
  agent3StateMd: 'reports/agent3-state.md',
  outputJson: 'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.json',
  outputMd: 'reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.md',
};

const agent10 = readJson(paths.agent10PostMatrixConsumptionJson);
const continuity = readJson(paths.latestAgent3ContinuityJson);
const registrationAudit = readJson(paths.latestAgent3RegistrationAuditJson);
const spark10 = readJson(paths.spark10MatrixJson);
const agent3State = readJson(paths.agent3StateJson);

const rows = spark10.rows || [];
const continuityPaths = [
  paths.latestAgent3ContinuityJson,
  paths.latestAgent3ContinuityMd,
  paths.latestAgent3RegistrationAuditJson,
  paths.latestAgent3RegistrationAuditMd,
];
const registeredContinuityRows = rows.filter((row) => continuityPaths.includes(row.path));
const agent3RelatedRows = rows.filter((row) => isAgent3Related(row));
const handoffRows = rows.filter(isHandoffCandidate);
const agent3RelatedHandoffRows = agent3RelatedRows.filter(isHandoffCandidate);
const routeExactRows = rows.filter((row) => row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker');
const directAgent6PacketRows = rows.filter((row) => row.release_relevance_hint === 'agent6_ready_boundary_packet');
const consumedAgent3 = (agent10.consumed_packages || []).find(
  (entry) => entry.package_workset === 'agent3_deuteronomy_phase2_continuity_registration',
);
const spark10ValidationBlockers = buildSpark10ValidationBlockers();

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_agent10_post_matrix_registration_consumption_package',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane_owner: 'Agent 3',
  status: 'agent10_post_matrix_registration_consumed_no_executable_workset',
  publication_state: 'blocked_no_render',
  target:
    'Consume Agent 10 post-matrix lane output registration for the latest Agent 3 Deuteronomy continuity artifacts without creating a new Agent 3 executable workset or authority claim.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run:
    'node scripts/build_agent3_agent10_post_matrix_registration_consumption_package.mjs',
  agent10_consumption: {
    path: paths.agent10PostMatrixConsumptionJson,
    artifact_type: agent10.artifact_type,
    package_workset: agent10.package_workset,
    release_owner: agent10.release_owner,
    highest_permissible_claim: agent10.highest_permissible_claim,
    agent3_package_consumed: {
      package_workset: consumedAgent3?.package_workset || null,
      release_relevance: consumedAgent3?.release_relevance || null,
      counts: consumedAgent3?.counts || null,
      exact_blocker: consumedAgent3?.exact_blocker || null,
      agent6_boundary_question: consumedAgent3?.agent6_boundary_question ?? null,
    },
    zero_counters: agent10.zero_counters || {},
    next_handoff: agent10.next_handoff || {},
    forbidden_claims: agent10.forbidden_claims || [],
  },
  latest_agent3_continuity_package: {
    path: paths.latestAgent3ContinuityJson,
    markdown_path: paths.latestAgent3ContinuityMd,
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
  prior_registration_audit: {
    path: paths.latestAgent3RegistrationAuditJson,
    status: registrationAudit.status,
    prior_blocker: registrationAudit.missing_field_blocker?.blocker || null,
    latest_package_state_indexed:
      registrationAudit.schema_counts?.latest_agent3_package_state_indexed,
    latest_package_spark10_registered:
      registrationAudit.schema_counts?.latest_agent3_package_spark10_registered,
  },
  spark10_registration_snapshot: {
    path: paths.spark10MatrixJson,
    artifact_type: spark10.artifact_type,
    generated_at: spark10.generated_at,
    summary: spark10.summary || {},
    boundary: spark10.boundary || {},
    row_count: rows.length,
    registered_agent3_continuity_rows: registeredContinuityRows.map((row) => ({
      path: row.path,
      lane_owner: row.lane_owner || null,
      required: Boolean(row.required),
      status: row.status || null,
      release_relevance_hint: row.release_relevance_hint || null,
      blocker_class: row.blocker_class || null,
      agent6_handoff_needed: Boolean(row.agent6_handoff_needed),
      next_agent10_action: row.next_agent10_action || null,
    })),
    agent3_related_rows: agent3RelatedRows.length,
    agent3_related_handoff_rows: agent3RelatedHandoffRows.length,
    handoff_rows: handoffRows.length,
    direct_agent6_packet_rows: directAgent6PacketRows.length,
    route_exact_rows: routeExactRows.map((row) => ({
      path: row.path,
      lane_owner: row.lane_owner || null,
      status: row.status || null,
      blocker_class: row.blocker_class || null,
    })),
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
    agent10_agent3_consumed_packages: consumedAgent3 ? 1 : 0,
    transform_readiness_rows: consumedAgent3?.counts?.transform_readiness_rows ?? null,
    transform_readiness_occurrences: consumedAgent3?.counts?.transform_readiness_occurrences ?? null,
    agent3_matrix_rows: consumedAgent3?.counts?.agent3_matrix_rows ?? null,
    agent3_matrix_occurrences: consumedAgent3?.counts?.agent3_matrix_occurrences ?? null,
    exact_blocker_rows: consumedAgent3?.counts?.exact_blocker_rows ?? null,
    exact_blocker_occurrences: consumedAgent3?.counts?.exact_blocker_occurrences ?? null,
    external_lane_rows_copied: consumedAgent3?.counts?.external_lane_rows_copied ?? null,
    spark10_inputs_checked: number(spark10.summary?.inputs_checked),
    spark10_release_relevant_rows: number(spark10.summary?.release_relevant_rows),
    spark10_agent6_handoff_candidates: number(spark10.summary?.agent6_handoff_candidates),
    spark10_matrix_rows: rows.length,
    spark10_agent3_continuity_registered_rows: registeredContinuityRows.length,
    spark10_agent3_related_rows: agent3RelatedRows.length,
    spark10_agent3_related_handoff_rows: agent3RelatedHandoffRows.length,
    spark10_route_exact_rows: routeExactRows.length,
    spark10_direct_agent6_packet_rows: directAgent6PacketRows.length,
    spark10_validation_blocker_count: spark10ValidationBlockers.length,
    direct_agent3_executable_worksets: 0,
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
    'agent3StateJson',
    'agent3StateMd',
  ],
  resolved_blocker: {
    prior_blocker: 'missing_spark10_intake_registration_or_exact_agent3_workset',
    resolved_scope: 'Spark-10 registration for latest Agent 3 Deuteronomy continuity artifacts only',
    evidence: paths.agent10PostMatrixConsumptionJson,
  },
  remaining_blocker: {
    blocker: 'no_exact_changed_executable_agent3_workset',
    wake_condition:
      'Wake Agent 3 only when Agent 10, Agent 7, or a queue supplies an exact changed executable workset with named inputs, rows/occurrences, output path/schema, validator/gate, handoff owner, and stop condition.',
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
  upstream_spark10_validation: {
    status: spark10ValidationBlockers.length ? 'blocked_by_current_spark10_cap_drift' : 'passed_at_package_time',
    validator_command:
      'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
    blockers: spark10ValidationBlockers,
  },
  handoff_owner:
    'Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner; Agent 3 remains held until exact changed executable workset.',
  stop_condition:
    'Stop after consuming Agent 10 registration of latest Agent 3 continuity artifacts and recording that no exact changed executable Agent 3 workset exists.',
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
    'node scripts/validate_agent3_agent10_post_matrix_registration_consumption_package.mjs',
    'node scripts/validate_agent3_deuteronomy_phase2_transform_readiness_verdict_continuity_package.mjs',
    'node scripts/validate_agent3_usage_state.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 Agent10 post-matrix registration consumed: registered rows ${artifact.schema_counts.spark10_agent3_continuity_registered_rows}; remaining executable worksets ${artifact.schema_counts.direct_agent3_executable_worksets}`,
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

function buildSpark10ValidationBlockers() {
  const blockers = [];
  if (routeExactRows.length > 1) {
    blockers.push({
      id: 'spark10_route_exact_cap_drift',
      expected: 'at most 1 route-exact row',
      observed: routeExactRows.length,
      paths: routeExactRows.map((row) => row.path),
    });
  }
  if (directAgent6PacketRows.length !== number(spark10.summary?.agent6_handoff_candidates)) {
    blockers.push({
      id: 'spark10_agent6_candidate_count_drift',
      expected: number(spark10.summary?.agent6_handoff_candidates),
      observed: directAgent6PacketRows.length,
      paths: directAgent6PacketRows.map((row) => row.path),
    });
  }
  return blockers;
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
  return `# Agent 3 Agent10 Post-Matrix Registration Consumption Package - 2026-06-05

## Status

- Artifact: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Target: ${value.target}

## Agent 10 Consumption

- Agent 10 input: \`${value.agent10_consumption.path}\`
- Consumed package: \`${value.agent10_consumption.agent3_package_consumed.package_workset}\`
- Release relevance: ${value.agent10_consumption.agent3_package_consumed.release_relevance}
- Resolved blocker scope: ${value.resolved_blocker.resolved_scope}
- Remaining blocker: \`${value.remaining_blocker.blocker}\`

## Counts

| Measure | Count |
| --- | ---: |
| Transform/readiness rows | ${counts.transform_readiness_rows} |
| Transform/readiness occurrences | ${counts.transform_readiness_occurrences} |
| Agent 3 matrix rows | ${counts.agent3_matrix_rows} |
| Agent 3 matrix occurrences | ${counts.agent3_matrix_occurrences} |
| Exact blocker rows | ${counts.exact_blocker_rows} |
| Exact blocker occurrences | ${counts.exact_blocker_occurrences} |
| External lane rows copied | ${counts.external_lane_rows_copied} |
| Spark10 inputs checked | ${counts.spark10_inputs_checked} |
| Spark10 release-relevant rows | ${counts.spark10_release_relevant_rows} |
| Spark10 handoff candidates | ${counts.spark10_agent6_handoff_candidates} |
| Spark10 Agent 3 continuity registered rows | ${counts.spark10_agent3_continuity_registered_rows} |
| Spark10 validation blockers | ${counts.spark10_validation_blocker_count} |
| Direct Agent 3 executable worksets | ${counts.direct_agent3_executable_worksets} |

## Boundary

This package is non-public planning/navigation evidence only. It does not authorize source/provenance acceptance, license/legal acceptance, commercial export, Definition authority, usage-as-definition authority, answer eligibility, route ranking, candidate text export, route publication support, public/runtime mutation, publication readiness, accepted gloss/text, or public reader output.

## Wake Condition

${value.remaining_blocker.wake_condition}

## Upstream Spark10 Validation

- Status: \`${value.upstream_spark10_validation.status}\`
- Validator command: \`${value.upstream_spark10_validation.validator_command}\`
- Blockers: ${value.upstream_spark10_validation.blockers.length ? value.upstream_spark10_validation.blockers.map((blocker) => `\`${blocker.id}\` observed ${blocker.observed} vs expected ${blocker.expected}`).join('; ') : '`none`'}

## Validation

${value.validators.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_agent10_post_matrix_registration_consumption:start -->';
  const end = '<!-- agent3_agent10_post_matrix_registration_consumption:end -->';
  const section = `${start}

## Latest Agent10 Post-Matrix Registration Consumption

- Package: \`${paths.outputMd}\`
- JSON: \`${paths.outputJson}\`
- Status: \`${value.status}\`
- Agent 10 input: \`${value.agent10_consumption.path}\`
- Resolved blocker scope: ${value.resolved_blocker.resolved_scope}
- Remaining blocker: \`${value.remaining_blocker.blocker}\`
- Counts: ${value.schema_counts.transform_readiness_rows} rows / ${value.schema_counts.transform_readiness_occurrences} occurrences; Spark10 registered continuity rows ${value.schema_counts.spark10_agent3_continuity_registered_rows}; executable worksets ${value.schema_counts.direct_agent3_executable_worksets}.

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
