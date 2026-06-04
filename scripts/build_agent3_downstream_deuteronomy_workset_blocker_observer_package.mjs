#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  agent2_next_workset_json: 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
  agent2_next_workset_md: 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.md',
  agent2_route_scan_json: 'reports/agent2-current-route-scan-receipt-2026-06-04.json',
  agent2_route_scan_md: 'reports/agent2-current-route-scan-receipt-2026-06-04.md',
  spark10_matrix_json: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10_matrix_md: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  agent3_drift_audit_json: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
};

const outputJson =
  'reports/agent3-downstream-deuteronomy-workset-blocker-observer-package-2026-06-04.json';
const outputMd = 'reports/agent3-downstream-deuteronomy-workset-blocker-observer-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const agent2Next = readJson(inputs.agent2_next_workset_json);
const routeScan = readJson(inputs.agent2_route_scan_json);
const matrix = readJson(inputs.spark10_matrix_json);
const driftAudit = readJson(inputs.agent3_drift_audit_json);
const matrixRows = matrix.rows || [];
const agent3Rows = matrixRows.filter((row) => row.lane_owner === 'Agent 3').map(summarizeRow);
const agent2Rows = matrixRows.filter((row) => row.lane_owner === 'Agent 2').map(summarizeRow);
const handoffCandidates = matrixRows
  .filter(
    (row) =>
      row.agent6_handoff_candidate ||
      row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
  )
  .map(summarizeRow);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_downstream_deuteronomy_workset_blocker_observer_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'downstream_deuteronomy_no_agent3_workset_observed',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  downstream_agent2_blocker_observed: {
    path: inputs.agent2_next_workset_json,
    artifact_type: agent2Next.artifact_type,
    status: agent2Next.status,
    exact_blocker: agent2Next.exact_blocker,
    latest_agent10_agent2_executable_route_found: agent2Next.latest_agent10_agent2_executable_route_found,
    agent2_returned_outputs: agent2Next.agent2_returned_outputs,
    required_next_workset_shape: agent2Next.required_next_workset_shape,
    standing_exact_blockers: agent2Next.standing_exact_blockers,
    spark1_handoff: agent2Next.spark1_handoff,
  },
  agent2_route_scan_observed: {
    path: inputs.agent2_route_scan_json,
    artifact_type: routeScan.artifact_type,
    scan_status: routeScan.scan_status,
    current_exact_blocker: routeScan.current_exact_blocker,
    scan_caveat: routeScan.scan_caveat,
    zero_boundary: routeScan.zero_boundary,
  },
  spark10_current_matrix_observed: {
    path: inputs.spark10_matrix_json,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    summary: matrix.summary,
    boundary: matrix.boundary,
  },
  agent3_rows_observed: agent3Rows,
  agent2_rows_observed: agent2Rows,
  agent6_handoff_candidates_observed: handoffCandidates,
  agent3_drift_audit_observed: {
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
    agent3_rows_with_missing_inputs: agent3Rows.filter((row) => !row.exists).length,
    agent3_rows_with_public_or_mutation_action: agent3Rows.filter((row) =>
      ['append', 'public_mutation', 'route_publication_support'].includes(row.next_agent10_action),
    ).length,
    agent2_rows_observed: agent2Rows.length,
    agent2_exact_workset_available_now: agent2Next.status === 'no_new_agent2_exact_workset_after_deuteronomy_return' ? 0 : 1,
    external_agent10_handoff_candidate_rows: handoffCandidates.filter((row) => row.lane_owner === 'Agent 10').length,
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
      'Observed downstream Agent 2 Deuteronomy return state: no new exact Agent 2 workset is available, and Spark10 current matrix still exposes no Agent 3 handoff candidate.',
    agent3_next_action:
      'Wait for an exact changed Agent 3 linkage/dedupe/navigation workset, direct Spark return, or downstream route that names Agent 3-owned rows.',
    executable_workset_created: false,
    downstream_agent2_blocker_packaged: true,
  },
  boundary: zeroBoundary(),
  validation_commands: [
    'node scripts/validate_agent3_downstream_deuteronomy_workset_blocker_observer_package.mjs',
    'git diff --check -- reports/agent3-downstream-deuteronomy-workset-blocker-observer-package-2026-06-04.json reports/agent3-downstream-deuteronomy-workset-blocker-observer-package-2026-06-04.md scripts/build_agent3_downstream_deuteronomy_workset_blocker_observer_package.mjs scripts/validate_agent3_downstream_deuteronomy_workset_blocker_observer_package.mjs reports/agent3-state.md',
  ],
  what_remains_blocked: [
    'No new Agent 3 executable linkage/dedupe/navigation workset is named by the downstream Agent 2 return.',
    'Agent 2 exact workset remains blocked until a changed input or exact new target is named.',
    'The observed Agent 6 handoff candidates are Agent 10-owned packets, not Agent 3 routes.',
    'Agent 3 Orot/Deuteronomy source matrices remain generated_at-only working-tree drift and are not committed here.',
    'No publication, Definition authority, answer eligibility, source/license acceptance, runtime mutation, route publication support, or accepted text is authorized.',
  ],
};

writeJson(outputJson, artifact);
writeText(outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);
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
    return {
      role,
      path: inputPath,
      sha256: sha256(fs.readFileSync(abs)),
      bytes: fs.statSync(abs).size,
    };
  });
}

function renderMarkdown(value) {
  const lines = [];
  lines.push('# Agent 3 Downstream Deuteronomy Workset Blocker Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Result: ${value.package_summary.result}`);
  lines.push('');
  lines.push('## Current Counts');
  lines.push('');
  lines.push(`- Spark10 inputs checked: \`${value.counts.spark10_inputs_checked}\``);
  lines.push(`- Spark10 release-relevant rows: \`${value.counts.spark10_release_relevant_rows}\``);
  lines.push(`- Spark10 Agent 6 handoff candidates: \`${value.counts.spark10_agent6_handoff_candidates}\``);
  lines.push(`- Agent 3 rows observed / handoff candidates: \`${value.counts.agent3_rows_observed}/${value.counts.agent3_handoff_candidate_rows}\``);
  lines.push(`- Agent 2 rows observed / exact workset available now: \`${value.counts.agent2_rows_observed}/${value.counts.agent2_exact_workset_available_now}\``);
  lines.push('');
  lines.push('## Downstream Agent 2 Blocker');
  lines.push('');
  lines.push(`- Path: \`${value.downstream_agent2_blocker_observed.path}\``);
  lines.push(`- Status: \`${value.downstream_agent2_blocker_observed.status}\``);
  lines.push(`- Exact blocker: \`${value.downstream_agent2_blocker_observed.exact_blocker}\``);
  lines.push('');
  lines.push('## Agent 3 Rows');
  lines.push('');
  lines.push('| Path | Status | Blocker | Next action |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of value.agent3_rows_observed) {
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
  for (const row of value.agent6_handoff_candidates_observed) {
    lines.push(
      `| \`${row.path}\` | ${row.lane_owner || ''} | ${row.status || ''} | ${row.next_agent10_action || ''} |`,
    );
  }
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push(
    'This is an Agent 3 observer/blocker package only. It does not create a new Agent 3 executable workset, Agent 6 handoff, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route publication support, public/runtime acceptance, publication readiness, accepted gloss/text, or public reader output.',
  );
  lines.push('');
  lines.push('## Remaining Blockers');
  lines.push('');
  for (const blocker of value.what_remains_blocked) lines.push(`- ${blocker}`);
  lines.push('');
  lines.push('## Validation');
  lines.push('');
  for (const command of value.validation_commands) lines.push(`- \`${command}\``);
  return `${lines.join('\n').trimEnd()}\n`;
}

function updateStateMarkdown(value) {
  const markerStart = '<!-- agent3-latest-linkage-pulse-start -->';
  const markerEnd = '<!-- agent3-latest-linkage-pulse-end -->';
  const block = [
    markerStart,
    '',
    '## Latest Linkage/Navigation Pulse',
    '',
    `- Generated: ${value.generated_at}`,
    `- Package: \`${outputJson}\``,
    `- Status: \`${value.status}\``,
    `- Current Spark-10 matrix rows/input count: ${value.counts.spark10_inputs_checked}`,
    `- Agent 3 rows observed / handoff candidates: ${value.counts.agent3_rows_observed}/${value.counts.agent3_handoff_candidate_rows}`,
    `- External Agent 10 handoff candidates: ${value.counts.external_agent10_handoff_candidate_rows}`,
    `- Downstream Agent 2 exact workset available now: ${value.counts.agent2_exact_workset_available_now}`,
    '- Boundary: observer evidence only; no executable workset, Definition authority, answer selection, route publication, runtime mutation, source/license acceptance, or accepted text.',
    '- Next step: wait for exact changed Agent 3 linkage/dedupe/navigation workset, direct Spark return, or downstream route needing Agent 3 packaging.',
    '',
    markerEnd,
  ].join('\n');
  const statePath = resolve(stateMdPath);
  const current = fs.readFileSync(statePath, 'utf8');
  const start = current.indexOf(markerStart);
  const end = current.indexOf(markerEnd);
  if (start !== -1 && end !== -1 && end > start) {
    fs.writeFileSync(statePath, `${current.slice(0, start)}${block}${current.slice(end + markerEnd.length)}`);
    return;
  }
  fs.writeFileSync(statePath, `${current.trimEnd()}\n\n${block}\n`);
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

function writeText(inputPath, value) {
  fs.writeFileSync(resolve(inputPath), value);
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function resolve(inputPath) {
  return path.resolve(root, inputPath);
}
