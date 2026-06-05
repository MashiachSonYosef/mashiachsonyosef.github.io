#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  spark10_matrix_json: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10_matrix_md: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  agent10_contract_json: 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json',
  agent10_contract_md: 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.md',
  agent10_current_lane_refresh_json: 'reports/agent10-current-lane-returns-refresh-consumption-2026-06-04.json',
  agent10_current_lane_refresh_md: 'reports/agent10-current-lane-returns-refresh-consumption-2026-06-04.md',
  prior_agent3_observer_json: 'reports/agent3-spark10-release-intake-return-observer-package-2026-06-04.json',
  prior_agent3_observer_md: 'reports/agent3-spark10-release-intake-return-observer-package-2026-06-04.md',
  agent3_drift_audit_json: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
  agent3_drift_audit_md: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.md',
  agent3_state_md: 'reports/agent3-state.md',
};

const outputJson = 'reports/agent3-spark10-release-intake-refresh-observer-package-2026-06-04.json';
const outputMd = 'reports/agent3-spark10-release-intake-refresh-observer-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const matrix = readJson(inputs.spark10_matrix_json);
const contract = readJson(inputs.agent10_contract_json);
const agent10Refresh = readJson(inputs.agent10_current_lane_refresh_json);
const priorObserver = readJson(inputs.prior_agent3_observer_json);
const driftAudit = readJson(inputs.agent3_drift_audit_json);

const matrixHash = sha256(inputs.spark10_matrix_json);
const priorMatrixInput = (priorObserver.reviewed_inputs || []).find((input) => input.role === 'spark10_matrix_json');
const rows = matrix.rows || [];
const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3').map(summarizeRow);
const handoffCandidates = rows
  .filter(
    (row) =>
      row.agent6_handoff_candidate ||
      row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
  )
  .map(summarizeRow);
const handoffBlocker = handoffCandidates.length
  ? `The ${handoffCandidates.length} observed Agent 6 handoff candidate(s) are external matrix rows, not Agent 3 linkage/dedupe/navigation routes.`
  : 'No Agent 6 handoff candidates are present in the current Spark-10 matrix; Agent 3 created none.';

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark10_release_intake_refresh_observer_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'spark10_release_intake_refresh_observed_no_agent3_executable_workset',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  refresh_delta_observed: {
    reason:
      'The current Spark-10 release/package intake matrix changed after the prior Agent 3 observer package; this package refreshes Agent 3 observer state without creating a new workset.',
    prior_observer_path: inputs.prior_agent3_observer_json,
    prior_observer_generated_at: priorObserver.generated_at,
    prior_matrix_generated_at: priorObserver.spark10_return_observed?.generated_at,
    prior_matrix_sha256: priorMatrixInput?.sha256 || null,
    current_matrix_path: inputs.spark10_matrix_json,
    current_matrix_generated_at: matrix.generated_at,
    current_matrix_sha256: matrixHash,
    matrix_hash_changed: priorMatrixInput?.sha256 !== matrixHash,
    matrix_generated_at_changed: priorObserver.spark10_return_observed?.generated_at !== matrix.generated_at,
  },
  spark10_return_observed: {
    matrix_path: inputs.spark10_matrix_json,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    contract_path: matrix.contract_path,
    summary: matrix.summary,
    stop_condition: matrix.stop_condition,
    boundary: matrix.boundary,
  },
  agent10_contract_observed: {
    path: inputs.agent10_contract_json,
    artifact_type: contract.artifact_type,
    spark_thread_id: contract.spark_thread_id,
    input_count: Array.isArray(contract.inputs) ? contract.inputs.length : 0,
    output: contract.output,
    agent6_handoff_condition: contract.agent6_handoff_condition,
    stop_condition: contract.stop_condition,
    boundary: contract.boundary,
  },
  agent10_current_lane_refresh_observed: {
    path: inputs.agent10_current_lane_refresh_json,
    artifact_type: agent10Refresh.artifact_type,
    status: agent10Refresh.status,
    active_agent6_wait: agent10Refresh.active_agent6_wait,
    zero_boundary: agent10Refresh.zero_boundary,
  },
  agent3_rows_observed: agent3Rows,
  agent6_handoff_candidates_observed: handoffCandidates,
  prior_agent3_drift_audit_observed: {
    path: inputs.agent3_drift_audit_json,
    status: driftAudit.status,
    audited_files: driftAudit.counts?.audited_files,
    generated_at_only_files: driftAudit.counts?.generated_at_only_files,
    substantive_changed_files: driftAudit.counts?.substantive_changed_files,
    source_files_committed_by_package: driftAudit.counts?.source_files_committed_by_this_package,
  },
  counts: {
    spark10_inputs_checked: matrix.summary?.inputs_checked,
    spark10_missing_required_inputs: matrix.summary?.missing_required_inputs,
    spark10_release_relevant_rows: matrix.summary?.release_relevant_rows,
    spark10_agent6_handoff_candidates: matrix.summary?.agent6_handoff_candidates,
    agent3_rows_observed: agent3Rows.length,
    agent3_handoff_candidate_rows: agent3Rows.filter((row) => row.agent6_handoff_candidate).length,
    external_agent10_handoff_candidate_rows: handoffCandidates.filter((row) => row.lane_owner === 'Agent 10').length,
    agent3_rows_with_missing_inputs: agent3Rows.filter((row) => !row.exists).length,
    agent3_rows_with_public_or_mutation_action: agent3Rows.filter((row) =>
      ['append', 'public_mutation', 'route_publication_support'].includes(row.next_agent10_action),
    ).length,
    matrix_hash_changed_since_prior_observer: priorMatrixInput?.sha256 !== matrixHash ? 1 : 0,
    source_files_committed_by_this_package: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_reader_output_rows: 0,
  },
  package_summary: {
    result:
      'Current Spark-10 intake matrix refresh consumed as Agent 3 linkage/navigation observer evidence only; no Agent 3 executable workset or handoff candidate was created.',
    agent3_next_action:
      'Wait for an exact changed Agent 3 linkage/dedupe/navigation workset, direct Spark return, or explicit downstream route needing Agent 3 packaging.',
    agent6_handoff_owner: handoffCandidates.length ? 'External matrix owner(s), not Agent 3' : 'none observed; Agent 3 created none',
    executable_workset_created: false,
    current_matrix_refresh_packaged: true,
  },
  boundary: zeroBoundary(),
  validation_commands: [
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
    'node scripts/validate_spark10_release_package_intake.mjs reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json',
    'node scripts/validate_agent3_spark10_release_intake_refresh_observer_package.mjs',
  ],
  what_remains_blocked: [
    'The current Spark-10 release/package matrix is external Spark-10/Agent-10 intake evidence and is not committed by this Agent 3 package.',
    handoffBlocker,
    'Agent 3 regenerated Orot/Deuteronomy source JSON files remain generated_at-only drift and are not committed here.',
    'No publication, Definition authority, answer eligibility, source/license acceptance, runtime mutation, route publication support, or accepted text is authorized.',
  ],
};

writeJson(outputJson, artifact);
fs.writeFileSync(resolve(outputMd), renderMarkdown(artifact));
updateStateMarkdown(artifact);
artifact.reviewed_inputs = manifest(inputs);
writeJson(outputJson, artifact);
fs.writeFileSync(resolve(outputMd), renderMarkdown(artifact));
console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);
console.log(`Updated ${stateMdPath}`);

function summarizeRow(row) {
  return {
    path: row.path,
    lane_owner: row.lane_owner || null,
    artifact_type: row.artifact_type || null,
    status: row.status || null,
    exists: row.exists === true,
    release_relevance: row.release_relevance || null,
    blocker: row.blocker || null,
    agent6_handoff_candidate: row.agent6_handoff_candidate === true,
    next_agent10_action: row.next_agent10_action || null,
  };
}

function manifest(inputMap) {
  return Object.entries(inputMap).map(([role, inputPath]) => {
    const abs = resolve(inputPath);
    const bytes = fs.statSync(abs).size;
    return {
      role,
      path: inputPath,
      sha256: sha256(inputPath),
      bytes,
    };
  });
}

function renderMarkdown(artifact) {
  const lines = [];
  lines.push('# Agent 3 Spark-10 Release Intake Refresh Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${outputJson}\``);
  lines.push(`- Status: \`${artifact.status}\``);
  lines.push(`- Publication state: \`${artifact.publication_state}\``);
  lines.push(`- Lane owner: \`${artifact.lane_owner}\``);
  lines.push(`- Result: ${artifact.package_summary.result}`);
  lines.push('');
  lines.push('## Refresh Delta');
  lines.push('');
  lines.push(`- Prior observer: \`${artifact.refresh_delta_observed.prior_observer_path}\``);
  lines.push(`- Prior matrix generated_at: \`${artifact.refresh_delta_observed.prior_matrix_generated_at}\``);
  lines.push(`- Prior matrix sha256: \`${artifact.refresh_delta_observed.prior_matrix_sha256}\``);
  lines.push(`- Current matrix generated_at: \`${artifact.refresh_delta_observed.current_matrix_generated_at}\``);
  lines.push(`- Current matrix sha256: \`${artifact.refresh_delta_observed.current_matrix_sha256}\``);
  lines.push(`- Matrix hash changed: \`${artifact.refresh_delta_observed.matrix_hash_changed}\``);
  lines.push('');
  lines.push('## Spark-10 Current Matrix');
  lines.push('');
  lines.push(`- Matrix: \`${artifact.spark10_return_observed.matrix_path}\``);
  lines.push(`- Inputs checked: \`${artifact.counts.spark10_inputs_checked}\``);
  lines.push(`- Missing required inputs: \`${artifact.counts.spark10_missing_required_inputs}\``);
  lines.push(`- Release-relevant rows: \`${artifact.counts.spark10_release_relevant_rows}\``);
  lines.push(`- Agent 6 handoff candidates: \`${artifact.counts.spark10_agent6_handoff_candidates}\``);
  lines.push('');
  lines.push('## Agent 3 Rows');
  lines.push('');
  lines.push('| Path | Status | Blocker | Next action |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of artifact.agent3_rows_observed) {
    lines.push(
      `| \`${row.path}\` | ${row.status || ''} | ${row.blocker || ''} | ${row.next_agent10_action || ''} |`,
    );
  }
  lines.push('');
  lines.push('## Handoff Candidates');
  lines.push('');
  lines.push('The observed Agent 6 handoff candidates are external Agent 10 packets, not Agent 3 routes.');
  lines.push('');
  lines.push('| Path | Owner | Status | Next action |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of artifact.agent6_handoff_candidates_observed) {
    lines.push(
      `| \`${row.path}\` | ${row.lane_owner || ''} | ${row.status || ''} | ${row.next_agent10_action || ''} |`,
    );
  }
  lines.push('');
  lines.push('## Agent 10 Refresh Observed');
  lines.push('');
  lines.push(`- Refresh artifact: \`${artifact.agent10_current_lane_refresh_observed.path}\``);
  lines.push(`- Status: \`${artifact.agent10_current_lane_refresh_observed.status}\``);
  lines.push(
    `- Active Agent 6 wait: \`${artifact.agent10_current_lane_refresh_observed.active_agent6_wait?.stop_condition || ''}\``,
  );
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push(
    'This is an Agent 3 observer package only. It does not create a new Agent 3 executable workset, Agent 6 handoff, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route publication support, public/runtime acceptance, publication readiness, accepted gloss/text, or public reader output.',
  );
  lines.push('');
  lines.push('## Remaining Blockers');
  lines.push('');
  for (const blocker of artifact.what_remains_blocked) {
    lines.push(`- ${blocker}`);
  }
  lines.push('');
  lines.push('## Validation');
  lines.push('');
  for (const command of artifact.validation_commands) {
    lines.push(`- \`${command}\``);
  }
  lines.push('');
  return `${lines.join('\n').trimEnd()}\n`;
}

function updateStateMarkdown(artifact) {
  const markerStart = '<!-- agent3-latest-linkage-pulse-start -->';
  const markerEnd = '<!-- agent3-latest-linkage-pulse-end -->';
  const block = [
    markerStart,
    '',
    '## Latest Linkage/Navigation Pulse',
    '',
    `- Generated: ${artifact.generated_at}`,
    `- Package: \`${outputJson}\``,
    `- Status: \`${artifact.status}\``,
    `- Current Spark-10 matrix rows/input count: ${artifact.counts.spark10_inputs_checked}`,
    `- Agent 3 rows observed / handoff candidates: ${artifact.counts.agent3_rows_observed}/${artifact.counts.agent3_handoff_candidate_rows}`,
    `- External Agent 10 handoff candidates: ${artifact.counts.external_agent10_handoff_candidate_rows}`,
    `- Matrix hash changed since prior observer: ${artifact.counts.matrix_hash_changed_since_prior_observer}`,
    '- Boundary: observer evidence only; no executable workset, Definition authority, answer selection, route publication, runtime mutation, source/license acceptance, or accepted text.',
    '- Next step: wait for exact changed Agent 3 linkage/dedupe/navigation workset, direct Spark return, or downstream route needing Agent 3 packaging.',
    '',
    markerEnd,
  ].join('\n');
  const abs = resolve(stateMdPath);
  const current = fs.readFileSync(abs, 'utf8');
  const start = current.indexOf(markerStart);
  const end = current.indexOf(markerEnd);
  if (start !== -1 && end !== -1 && end > start) {
    const next = `${current.slice(0, start)}${block}${current.slice(end + markerEnd.length)}`;
    fs.writeFileSync(abs, next);
    return;
  }
  fs.writeFileSync(abs, `${current.trimEnd()}\n\n${block}\n`);
}

function zeroBoundary() {
  return {
    source_provenance_acceptance: false,
    license_acceptance: false,
    qa_acceptance: false,
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_acceptance: false,
    answer_eligibility: false,
    route_publication_support: false,
    public_runtime_acceptance: false,
    publication_readiness: false,
    route_shard_edit: false,
    public_runtime_mutation: false,
    definition_content_storage: false,
    accepted_gloss_text: false,
    public_reader_output: false,
  };
}

function readJson(inputPath) {
  return JSON.parse(fs.readFileSync(resolve(inputPath), 'utf8'));
}

function writeJson(inputPath, value) {
  fs.writeFileSync(resolve(inputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(inputPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(resolve(inputPath))).digest('hex');
}

function resolve(inputPath) {
  return path.resolve(root, inputPath);
}
