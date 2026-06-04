#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const inputs = {
  spark1_return: 'reports/spark1-deuteronomy-phase2-linkage-dedupe-source-route-run-2026-06-04.md',
  agent3_contract_json: 'reports/agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.json',
  agent3_contract_md: 'reports/agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.md',
  agent3_matrix_json: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
  agent3_matrix_md: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md',
  agent10_consumption_md: 'reports/agent10-deuteronomy-phase2-release-intake-consumption-2026-06-04.md',
  agent10_agent2_workset_json: 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
  agent10_agent2_workset_md: 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.md',
  agent2_readiness_json: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
  agent2_readiness_md: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md',
  agent10_agent6_packet_json: 'reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.json',
  agent10_agent6_packet_md: 'reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.md',
};

const outputJson = 'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json';
const outputMd = 'reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.md';

const spark1Text = readText(inputs.spark1_return);
const contract = readJson(inputs.agent3_contract_json);
const matrix = readJson(inputs.agent3_matrix_json);
const agent10Workset = readJson(inputs.agent10_agent2_workset_json);
const agent2Readiness = readJson(inputs.agent2_readiness_json);
const agent6Packet = readJson(inputs.agent10_agent6_packet_json);

const packageArtifact = {
  schema_version: 1,
  artifact_type: 'agent3_deuteronomy_phase2_spark1_return_consumption_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'spark1_return_consumed_agent3_review_package',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model',
  publication_state: 'blocked_no_render',
  target_work: {
    work_id: 'deuteronomy',
    work_title: 'Deuteronomy',
    workset: 'deuteronomy-linkage-dedupe-source-route-matrix',
  },
  reviewed_inputs: inputManifest(inputs),
  spark1_return: {
    artifact: inputs.spark1_return,
    observed: true,
    blocker_reported: spark1Text.includes('- `none`') ? 'none' : 'review_required',
    command_results_reported: [
      {
        command: 'node scripts/build_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs',
        exit_code: spark1Text.includes('build_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs` | `0`') ? 0 : null,
      },
      {
        command: 'node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs',
        exit_code: spark1Text.includes('validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs` | `0`') ? 0 : null,
      },
    ],
  },
  agent3_matrix: {
    status: matrix.status,
    publication_state: matrix.publication_state,
    counts: pick(matrix.counts, [
      'rows',
      'occurrences',
      'token_index_forms',
      'token_index_occurrences',
      'occurrence_units',
      'source_units',
      'manifest_chunks',
      'joined_token_index_rows',
      'missing_token_index_join_rows',
      'downstream_boundary_rows',
      'downstream_boundary_occurrences',
      'exact_blocker_rows',
      'exact_blocker_occurrences',
      'duplicate_key_collision_groups',
      'public_hud_rows',
      'route_jsonl_rows',
      'route_shard_writes',
      'runtime_files_changed',
      'source_files_changed',
      'token_index_files_changed',
      'lexical_payload_files_changed',
      'definition_content_rows',
      'nc_definition_content_rows',
      'answer_rows',
      'accepted_text_rows',
    ]),
  },
  downstream_chain_observed: {
    agent10_consumption: {
      artifact: inputs.agent10_consumption_md,
      observed: true,
      status: 'consumed_spark1_return_report_observed',
    },
    agent10_agent2_workset: {
      artifact_json: inputs.agent10_agent2_workset_json,
      artifact_md: inputs.agent10_agent2_workset_md,
      status: agent10Workset.status,
      counts: {
        rows: agent10Workset.counts?.rows,
        occurrences: agent10Workset.counts?.occurrences,
        commercial_clean_candidate_rows: agent10Workset.counts?.commercial_clean_candidate_rows,
        commercial_clean_candidate_occurrences: agent10Workset.counts?.commercial_clean_candidate_occurrences,
        nc_rows: agent10Workset.counts?.nc_rows,
        nc_occurrences: agent10Workset.counts?.nc_occurrences,
      },
      license_lanes: agent10Workset.counts?.license_lanes || {},
    },
    agent2_readiness_matrix: {
      artifact_json: inputs.agent2_readiness_json,
      artifact_md: inputs.agent2_readiness_md,
      status: agent2Readiness.status,
      counts: pick(agent2Readiness.counts, [
        'rows',
        'occurrences',
        'commercial_clean_candidate_rows',
        'commercial_clean_candidate_occurrences',
        'noncommercial_educational_candidate_rows',
        'noncommercial_educational_candidate_occurrences',
        'metadata_or_link_only_rows',
        'blocked_or_needs_review_rows',
        'answer_eligible_rows',
        'public_emit_rows',
        'definition_text_emitted_rows',
        'accepted_text_emitted_rows',
        'route_shard_write_rows',
      ]),
      zero_emission_counters: agent2Readiness.zero_emission_counters || {},
      agent6_boundary_now: agent2Readiness.agent6_boundary_now,
    },
    agent10_agent6_boundary_packet: {
      artifact_json: inputs.agent10_agent6_packet_json,
      artifact_md: inputs.agent10_agent6_packet_md,
      status: agent6Packet.status,
      review_scope: agent6Packet.review_scope,
      zero_emission_counters: agent6Packet.zero_emission_counters || {},
    },
  },
  package_summary: {
    spark1_return_available: true,
    spark1_exact_blocker: 'none_reported_by_return_artifact',
    agent10_consumed_return: true,
    agent2_matrix_present: true,
    agent6_boundary_packet_present: true,
    agent6_acceptance_claimed: false,
    ready_for: 'Agent 10 / Agent 6 review as non-public linkage/dedupe/navigation provenance evidence only',
  },
  validation_commands: [
    'node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs',
    'node scripts/validate_agent10_deuteronomy_phase2_downstream_transform_workset.mjs reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json',
    'node scripts/validate_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
    'node scripts/validate_agent3_deuteronomy_phase2_spark1_return_package.mjs',
  ],
  what_remains_blocked: [
    '6779 Agent 3 matrix rows / 9631 occurrences remain exact blockers: below safe confidence or unresolved lexical entry.',
    '1334 downstream-boundary rows / 2964 occurrences remain non-public planning evidence only until downstream review.',
    'Agent 6 boundary review is prepared by Agent 10 packet but not accepted by this Agent 3 package.',
    'No route publication support, answer eligibility, public output, or source/license acceptance is created here.',
  ],
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss',
    'accepted text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
  ],
};

fs.mkdirSync(path.dirname(resolve(outputJson)), { recursive: true });
fs.writeFileSync(resolve(outputJson), `${JSON.stringify(packageArtifact, null, 2)}\n`);
fs.writeFileSync(resolve(outputMd), renderMarkdown(packageArtifact));

console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);
console.log(
  `Agent 3 Spark-1 return package: matrix rows ${packageArtifact.agent3_matrix.counts.rows}; downstream rows ${packageArtifact.downstream_chain_observed.agent10_agent2_workset.counts.rows}; Agent2 rows ${packageArtifact.downstream_chain_observed.agent2_readiness_matrix.counts.rows}`,
);

function renderMarkdown(artifact) {
  const matrixCounts = artifact.agent3_matrix.counts;
  const worksetCounts = artifact.downstream_chain_observed.agent10_agent2_workset.counts;
  const readinessCounts = artifact.downstream_chain_observed.agent2_readiness_matrix.counts;
  const reviewScope = artifact.downstream_chain_observed.agent10_agent6_boundary_packet.review_scope;

  return [
    '# Agent 3 Deuteronomy Phase-2 Spark-1 Return Consumption Package - 2026-06-04',
    '',
    `Status: \`${artifact.status}\`.`,
    '',
    `Publication state: \`${artifact.publication_state}\`.`,
    '',
    'Boundary: non-public linkage/dedupe/navigation provenance evidence only. This package does not claim QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, public/runtime acceptance, publication readiness, route publication support, accepted gloss/text, or public/runtime mutation.',
    '',
    '## Consumed Spark-1 Return',
    '',
    `- Return artifact: \`${artifact.spark1_return.artifact}\`.`,
    `- Blocker reported by Spark-1 artifact: \`${artifact.spark1_return.blocker_reported}\`.`,
    `- Build command exit code reported: \`${artifact.spark1_return.command_results_reported[0].exit_code}\`.`,
    `- Validator command exit code reported: \`${artifact.spark1_return.command_results_reported[1].exit_code}\`.`,
    '',
    '## Agent 3 Matrix Counts',
    '',
    `- Rows / occurrences: \`${matrixCounts.rows}\` / \`${matrixCounts.occurrences}\`.`,
    `- Occurrence units / source units / manifest chunks: \`${matrixCounts.occurrence_units}\` / \`${matrixCounts.source_units}\` / \`${matrixCounts.manifest_chunks}\`.`,
    `- Downstream-boundary rows / occurrences: \`${matrixCounts.downstream_boundary_rows}\` / \`${matrixCounts.downstream_boundary_occurrences}\`.`,
    `- Exact blocker rows / occurrences: \`${matrixCounts.exact_blocker_rows}\` / \`${matrixCounts.exact_blocker_occurrences}\`.`,
    `- Duplicate-key collision groups: \`${matrixCounts.duplicate_key_collision_groups}\`.`,
    '',
    '## Downstream Chain Observed',
    '',
    `- Agent 10 consumption: \`${artifact.downstream_chain_observed.agent10_consumption.artifact}\`.`,
    `- Agent 10 Agent2-ready workset rows / occurrences: \`${worksetCounts.rows}\` / \`${worksetCounts.occurrences}\`.`,
    `- Agent 10 commercial-clean candidate rows / occurrences: \`${worksetCounts.commercial_clean_candidate_rows}\` / \`${worksetCounts.commercial_clean_candidate_occurrences}\`.`,
    `- Agent 10 NC rows / occurrences: \`${worksetCounts.nc_rows}\` / \`${worksetCounts.nc_occurrences}\`.`,
    `- Agent 2 matrix status: \`${artifact.downstream_chain_observed.agent2_readiness_matrix.status}\`.`,
    `- Agent 2 matrix rows / occurrences: \`${readinessCounts.rows}\` / \`${readinessCounts.occurrences}\`.`,
    `- Agent 2 answer/public/definition/accepted/route-shard emitted rows: \`${readinessCounts.answer_eligible_rows}\` / \`${readinessCounts.public_emit_rows}\` / \`${readinessCounts.definition_text_emitted_rows}\` / \`${readinessCounts.accepted_text_emitted_rows}\` / \`${readinessCounts.route_shard_write_rows}\`.`,
    `- Agent 6 boundary packet status: \`${artifact.downstream_chain_observed.agent10_agent6_boundary_packet.status}\`.`,
    `- Agent 6 review scope rows / occurrences: \`${reviewScope.rows}\` / \`${reviewScope.occurrences}\`.`,
    '',
    '## Reviewed Inputs',
    '',
    ...artifact.reviewed_inputs.map((input) => `- \`${input.role}\`: \`${input.path}\` (${input.sha256}).`),
    '',
    '## Validation Commands',
    '',
    ...artifact.validation_commands.map((command) => `- \`${command}\``),
    '',
    '## Remaining Blocked',
    '',
    ...artifact.what_remains_blocked.map((item) => `- ${item}`),
    '',
    '## Not Accepted',
    '',
    ...artifact.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

function inputManifest(sourceInputs) {
  return Object.entries(sourceInputs).map(([role, inputPath]) => ({
    role,
    path: inputPath,
    sha256: sha256(inputPath),
  }));
}

function pick(source, keys) {
  const result = {};
  for (const key of keys) result[key] = source?.[key];
  return result;
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function readText(file) {
  return fs.readFileSync(resolve(file), 'utf8');
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(file))).digest('hex');
}

function resolve(file) {
  return path.join(root, file);
}
