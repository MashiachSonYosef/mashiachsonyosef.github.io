#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  spark10MatrixJson: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10MatrixMd: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  agent10ConsumptionMd: 'reports/agent10-spark10-release-package-intake-consumption-2026-06-04.md',
  agent10ContractJson: 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json',
  agent10ContractMd: 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.md',
  spark10HybridShadowMd: 'reports/spark10-hybrid-floor-release-relevance-shadow-2026-06-04.md',
  agent10HybridBlockerJson: 'reports/agent10-spark10-hybrid-shadow-blocker-consumption-2026-06-04.json',
  agent10DeutSupplementalJson:
    'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.json',
  agent10UsageNavigationJson: 'reports/agent10-agent3-workbench-usage-navigation-consumption-2026-06-04.json',
  agent3PostCustodyJson: 'reports/agent3-post-custody-wake-condition-audit-2026-06-04.json',
  agent3ActiveHandoffJson: 'reports/agent3-active-workset-handoff-index-2026-06-04.json',
  outputJson: 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.json',
  outputMd: 'reports/agent3-spark10-release-intake-current-observer-package-2026-06-04.md',
};

const matrix = readJson(paths.spark10MatrixJson);
const contract = readJson(paths.agent10ContractJson);
const hybridBlocker = readJson(paths.agent10HybridBlockerJson);
const deutSupplemental = readJson(paths.agent10DeutSupplementalJson);
const usageNavigation = readJson(paths.agent10UsageNavigationJson);
const postCustody = readJson(paths.agent3PostCustodyJson);
const activeHandoff = readJson(paths.agent3ActiveHandoffJson);
const agent10ConsumptionText = readText(paths.agent10ConsumptionMd);
const spark10HybridShadowText = readText(paths.spark10HybridShadowMd);

const matrixRows = matrix.rows || [];
const agent3Rows = matrixRows.filter((row) => row.lane_owner === 'Agent 3');
const spark3Rows = matrixRows.filter((row) => row.lane_owner === 'Spark-3' || row.lane_owner === 'Spark 3' || /spark3/i.test(String(row.path || '')));
const handoffRows = matrixRows.filter(isHandoffCandidate);
const agent3HandoffRows = agent3Rows.filter(isHandoffCandidate);
const matrixSummary = matrix.summary || {};

const agent10Consumption = parseAgent10Consumption(agent10ConsumptionText);
const shadowStatus = parseMarkdownStatus(spark10HybridShadowText);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark10_release_intake_current_observer_package',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  lane_owner: 'Agent 3',
  status: 'current_spark10_release_intake_observed_no_agent3_authority_or_mutation',
  publication_state: 'blocked_no_render',
  target: 'Consume current Spark-10 / Agent-10 release-package intake mechanics as Agent 3 linkage/navigation observer evidence.',
  files: {
    input_files: Object.entries(paths)
      .filter(([key]) => !key.startsWith('output'))
      .map(([, value]) => value),
    output_json: paths.outputJson,
    output_markdown: paths.outputMd,
  },
  exact_command_or_script_to_write_or_run: 'node scripts/build_agent3_spark10_release_intake_current_observer_package.mjs',
  matrix_snapshot: {
    path: paths.spark10MatrixJson,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    contract_path: matrix.contract_path,
    summary: matrixSummary,
    boundary: matrix.boundary || {},
    row_count: matrixRows.length,
    agent3_rows: agent3Rows.map(summarizeMatrixRow),
    spark3_rows: spark3Rows.map(summarizeMatrixRow),
    handoff_candidate_rows: handoffRows.map(summarizeMatrixRow),
  },
  agent10_consumption_observed: {
    path: paths.agent10ConsumptionMd,
    status: agent10Consumption.status,
    current_package_anchor: agent10Consumption.current_package_anchor,
    agent3_orot_linkage_blocker: agent10Consumption.agent3_orot_linkage_blocker,
    no_direct_release_action: agent10Consumption.no_direct_release_action,
    stop_condition: agent10Consumption.stop_condition,
  },
  contract_observed: {
    path: paths.agent10ContractJson,
    artifact_type: contract.artifact_type,
    spark_thread_id: contract.spark_thread_id,
    input_count: Array.isArray(contract.inputs) ? contract.inputs.length : 0,
    output: contract.output || null,
    agent6_handoff_condition: contract.agent6_handoff_condition || null,
    stop_condition: contract.stop_condition || null,
    boundary: contract.boundary || {},
  },
  downstream_observed: {
    spark10_hybrid_shadow: {
      path: paths.spark10HybridShadowMd,
      status: shadowStatus,
      awaiting_changed_artifact: /awaiting_changed_artifact/.test(spark10HybridShadowText),
    },
    agent10_hybrid_blocker_consumption: {
      path: paths.agent10HybridBlockerJson,
      status: hybridBlocker.status,
      exact_blocker_count: Array.isArray(hybridBlocker.exact_blockers) ? hybridBlocker.exact_blockers.length : 0,
      zero_output_counts: hybridBlocker.zero_output_counts || {},
    },
    agent10_deuteronomy_supplemental_receipt: {
      path: paths.agent10DeutSupplementalJson,
      status: deutSupplemental.status,
      counts: deutSupplemental.counts || {},
      boundary: deutSupplemental.boundary || {},
      next_release_owner_action: deutSupplemental.next_release_owner_action || null,
    },
    agent10_usage_navigation_consumption: {
      path: paths.agent10UsageNavigationJson,
      status: usageNavigation.status || null,
      counts: usageNavigation.counts || {},
      lane_split: usageNavigation.lane_split || {},
      stop_condition: usageNavigation.stop_condition || null,
    },
    agent3_post_custody_audit: {
      path: paths.agent3PostCustodyJson,
      status: postCustody.status,
      counts: postCustody.schema_counts || {},
      current_blocker: postCustody.current_blocker || null,
    },
    agent3_active_handoff: {
      path: paths.agent3ActiveHandoffJson,
      status: activeHandoff.status,
      counts: activeHandoff.counts || activeHandoff.schema_counts || {},
      boundary: activeHandoff.boundary || {},
    },
  },
  schema_counts: {
    spark10_inputs_checked: number(matrixSummary.inputs_checked),
    spark10_missing_required_inputs: number(matrixSummary.missing_required_inputs),
    spark10_release_relevant_rows: number(matrixSummary.release_relevant_rows),
    spark10_agent6_handoff_candidates: number(matrixSummary.agent6_handoff_candidates),
    spark10_matrix_rows: matrixRows.length,
    agent3_rows_observed: agent3Rows.length,
    spark3_rows_observed: spark3Rows.length,
    total_handoff_candidate_rows: handoffRows.length,
    agent3_handoff_candidate_rows: agent3HandoffRows.length,
    agent3_rows_with_missing_inputs: agent3Rows.filter((row) => row.exists === false).length,
    agent3_rows_with_public_or_mutation_action: agent3Rows.filter(hasPublicOrMutationAction).length,
    agent10_consumption_anchor_rows: agent10Consumption.current_package_anchor.rows,
    agent10_consumption_anchor_occurrences: agent10Consumption.current_package_anchor.occurrences,
    agent10_consumption_orot_linkage_blocker_rows: agent10Consumption.agent3_orot_linkage_blocker.rows,
    agent10_consumption_orot_linkage_blocker_occurrences: agent10Consumption.agent3_orot_linkage_blocker.occurrences,
    hybrid_exact_blockers: Array.isArray(hybridBlocker.exact_blockers) ? hybridBlocker.exact_blockers.length : 0,
    deuteronomy_agent3_matrix_rows: number(deutSupplemental.counts?.agent3_matrix_rows),
    deuteronomy_agent3_matrix_occurrences: number(deutSupplemental.counts?.agent3_matrix_occurrences),
    deuteronomy_exact_blocker_rows: number(deutSupplemental.counts?.agent3_exact_blocker_rows),
    deuteronomy_exact_blocker_occurrences: number(deutSupplemental.counts?.agent3_exact_blocker_occurrences),
    deuteronomy_downstream_boundary_rows: number(deutSupplemental.counts?.downstream_boundary_rows),
    deuteronomy_downstream_boundary_occurrences: number(deutSupplemental.counts?.downstream_boundary_occurrences),
    deuteronomy_duplicate_key_collision_groups: number(deutSupplemental.counts?.duplicate_key_collision_groups),
    usage_concordance_rows: number(usageNavigation.counts?.usage_concordance_rows),
    usage_supported_rows: number(usageNavigation.counts?.usage_supported_rows),
    usage_candidate_rows: number(usageNavigation.counts?.usage_candidate_rows),
    usage_weak_rows: number(usageNavigation.counts?.usage_weak_rows),
    usage_audit_only_ambiguous_rows: number(usageNavigation.counts?.audit_only_ambiguous_rows),
    usage_occurrence_link_rows: number(usageNavigation.counts?.occurrence_link_rows),
    usage_route_resolution_unresolved_route_ids: number(usageNavigation.counts?.route_resolution_unresolved_route_ids),
    usage_reader_facing_rows: number(usageNavigation.counts?.reader_facing_rows),
    usage_forbidden_authority_field_hits: number(usageNavigation.counts?.forbidden_authority_field_hits),
    usage_public_runtime_output_answer_definition_accepted_text_emissions: number(
      usageNavigation.counts?.public_runtime_output_answer_definition_accepted_text_emissions,
    ),
    active_handoff_total_rows: number((activeHandoff.counts || activeHandoff.schema_counts)?.total_rows),
    active_handoff_total_occurrences: number((activeHandoff.counts || activeHandoff.schema_counts)?.total_occurrences),
    active_handoff_blocker_rows: number((activeHandoff.counts || activeHandoff.schema_counts)?.blocker_rows),
    active_handoff_blocker_occurrences: number((activeHandoff.counts || activeHandoff.schema_counts)?.blocker_occurrences),
    post_custody_agent3_runnable_queue_items: number(postCustody.schema_counts?.agent3_runnable_queue_items),
    post_custody_exact_new_worksets_found: number(postCustody.schema_counts?.exact_new_worksets_found),
    source_files_committed_by_this_package: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_reader_output_rows: 0,
    public_runtime_mutations: 0,
  },
  reviewed_inputs: manifest(Object.entries(paths).filter(([key]) => !key.startsWith('output'))),
  missing_field_blocker: {
    blocker: 'missing_changed_agent3_executable_workset_or_release_owner_boundary_request',
    missing_fields: [
      'changed_agent3_artifact_path_or_exact_workset_id',
      'target_rows_and_occurrences_for_new_agent3_matrix',
      'route_card_or_source_route_input_set',
      'output_path_and_schema_for_new_agent3_matrix',
      'validator_or_gate_for_new_agent3_matrix',
      'release_owner_boundary_request_if_agent6_review_is_needed',
      'stop_condition_for_new_agent3_run',
    ],
  },
  handoff_owner: 'Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.',
  stop_condition:
    'Stop after current observer package because the changed downstream intake is consumed as evidence/navigation continuity only and creates no Agent 3 mutation, authority, or executable matrix workset.',
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
    accepted_gloss_text: false,
    accepted_text: false,
    translation_output: false,
    public_reader_output: false,
    public_runtime_mutation: false,
  },
  validators: [
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
    'node scripts/validate_agent3_spark10_release_intake_current_observer_package.mjs',
  ],
};

writeJson(paths.outputJson, artifact);
writeText(paths.outputMd, renderMarkdown(artifact));

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(
  `Agent 3 Spark-10 current observer: matrix rows ${artifact.schema_counts.spark10_matrix_rows}; Agent 3 rows ${artifact.schema_counts.agent3_rows_observed}; handoff candidates ${artifact.schema_counts.total_handoff_candidate_rows}; Agent 3 handoff candidates ${artifact.schema_counts.agent3_handoff_candidate_rows}`,
);

function summarizeMatrixRow(row) {
  return {
    path: row.path || null,
    lane_owner: row.lane_owner || null,
    artifact_type: row.artifact_type || null,
    status: row.status || null,
    exists: row.exists === true,
    rows: row.rows ?? null,
    occurrences: row.occurrences ?? null,
    release_relevance: row.release_relevance || row.release_relevance_hint || null,
    blocker: row.blocker || row.blocker_class || null,
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

function hasPublicOrMutationAction(row) {
  return /append|public|runtime|route_shard|publication|answer|definition/i.test(String(row.next_agent10_action || ''));
}

function parseAgent10Consumption(text) {
  const status = parseMarkdownStatus(text);
  const anchor = matchCounts(text, /- `(\d+)` rows \/ `(\d+)` occurrences/);
  const orotBlocker = matchCounts(text, /Agent 3 broad linkage\/dedupe\/navigation output remains evidence\/navigation only, with `(\d+)` rows \/ `(\d+)` occurrences still under exact linkage blocker/);
  return {
    status,
    current_package_anchor: {
      path: 'data/build/orot/reader-hint-placeholder-candidates.json',
      rows: anchor.rows,
      occurrences: anchor.occurrences,
    },
    agent3_orot_linkage_blocker: orotBlocker,
    no_direct_release_action: /No direct Agent 10 append, public\/runtime mutation/.test(text),
    stop_condition: lineAfterHeading(text, '## Stop Condition'),
  };
}

function parseMarkdownStatus(text) {
  const match = text.match(/Status:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

function matchCounts(text, regex) {
  const match = text.match(regex);
  return {
    rows: match ? Number(match[1]) : 0,
    occurrences: match ? Number(match[2]) : 0,
  };
}

function lineAfterHeading(text, heading) {
  const index = text.indexOf(heading);
  if (index === -1) return null;
  const after = text.slice(index + heading.length).trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return after[0] || null;
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
  lines.push('# Agent 3 Spark-10 Release Intake Current Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${paths.outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Target: ${value.target}`);
  lines.push('');
  lines.push('## Current Matrix Snapshot');
  lines.push('');
  lines.push(`- Matrix: \`${paths.spark10MatrixJson}\``);
  lines.push(`- Inputs checked: \`${value.schema_counts.spark10_inputs_checked}\``);
  lines.push(`- Missing required inputs: \`${value.schema_counts.spark10_missing_required_inputs}\``);
  lines.push(`- Matrix rows: \`${value.schema_counts.spark10_matrix_rows}\``);
  lines.push(`- Release-relevant rows: \`${value.schema_counts.spark10_release_relevant_rows}\``);
  lines.push(`- Agent 6 handoff candidates: \`${value.schema_counts.spark10_agent6_handoff_candidates}\``);
  lines.push(`- Agent 3 rows observed: \`${value.schema_counts.agent3_rows_observed}\``);
  lines.push(`- Spark-3 rows observed: \`${value.schema_counts.spark3_rows_observed}\``);
  lines.push(`- Agent 3 handoff candidate rows: \`${value.schema_counts.agent3_handoff_candidate_rows}\``);
  lines.push('');
  lines.push('## Agent 3 Matrix Rows');
  lines.push('');
  lines.push('| Path | Rows | Occurrences | Status | Blocker | Next action |');
  lines.push('| --- | ---: | ---: | --- | --- | --- |');
  for (const row of value.matrix_snapshot.agent3_rows) {
    lines.push(
      `| \`${row.path}\` | ${row.rows ?? ''} | ${row.occurrences ?? ''} | ${row.status || ''} | ${row.blocker || ''} | ${row.next_action || ''} |`,
    );
  }
  lines.push('');
  lines.push('## Downstream Counts');
  lines.push('');
  lines.push(`- Agent 10 package anchor: \`${value.schema_counts.agent10_consumption_anchor_rows}\` rows / \`${value.schema_counts.agent10_consumption_anchor_occurrences}\` occurrences.`);
  lines.push(`- Orot linkage blocker retained: \`${value.schema_counts.agent10_consumption_orot_linkage_blocker_rows}\` rows / \`${value.schema_counts.agent10_consumption_orot_linkage_blocker_occurrences}\` occurrences.`);
  lines.push(`- Deuteronomy Agent 3 matrix: \`${value.schema_counts.deuteronomy_agent3_matrix_rows}\` rows / \`${value.schema_counts.deuteronomy_agent3_matrix_occurrences}\` occurrences.`);
  lines.push(`- Deuteronomy exact blockers: \`${value.schema_counts.deuteronomy_exact_blocker_rows}\` rows / \`${value.schema_counts.deuteronomy_exact_blocker_occurrences}\` occurrences.`);
  lines.push(`- Deuteronomy downstream boundary evidence: \`${value.schema_counts.deuteronomy_downstream_boundary_rows}\` rows / \`${value.schema_counts.deuteronomy_downstream_boundary_occurrences}\` occurrences.`);
  lines.push(`- Usage concordance: \`${value.schema_counts.usage_concordance_rows}\` rows; selected occurrence links \`${value.schema_counts.usage_occurrence_link_rows}\`; reader-facing rows \`${value.schema_counts.usage_reader_facing_rows}\`.`);
  lines.push(`- Active Agent 3 handoff index: \`${value.schema_counts.active_handoff_total_rows}\` rows / \`${value.schema_counts.active_handoff_total_occurrences}\` occurrences; blockers \`${value.schema_counts.active_handoff_blocker_rows}\` rows / \`${value.schema_counts.active_handoff_blocker_occurrences}\` occurrences.`);
  lines.push('');
  lines.push('## Missing Workset Blocker');
  lines.push('');
  lines.push(`- Blocker: \`${value.missing_field_blocker.blocker}\``);
  lines.push(`- Handoff owner: ${value.handoff_owner}`);
  lines.push(`- Stop condition: ${value.stop_condition}`);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push('This package is navigation/planning evidence only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, route ranking, answer selection, route publication support, public/runtime acceptance, publication readiness, product/data acceptance, translation output, accepted gloss/text, public reader output, or mutation authority.');
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
  lines.push('');
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
