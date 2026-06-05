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
  agent3_drift_audit_json: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
  agent3_drift_audit_md: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.md',
  agent3_state_md: 'reports/agent3-state.md',
};

const outputJson = 'reports/agent3-spark10-release-intake-return-observer-package-2026-06-04.json';
const outputMd = 'reports/agent3-spark10-release-intake-return-observer-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const matrix = readJson(inputs.spark10_matrix_json);
const contract = readJson(inputs.agent10_contract_json);
const driftAudit = readJson(inputs.agent3_drift_audit_json);
const rows = matrix.rows || [];
const agent3Rows = rows.filter((row) => row.lane_owner === 'Agent 3').map(summarizeRow);
const handoffCandidates = rows
  .filter((row) => row.agent6_handoff_candidate || row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists')
  .map(summarizeRow);
const handoffBlocker = handoffCandidates.length
  ? `The ${handoffCandidates.length} observed Agent 6 handoff candidate(s) are external matrix rows, not Agent 3 linkage/dedupe/navigation routes.`
  : 'No Agent 6 handoff candidates are present in the current Spark-10 matrix; Agent 3 created none.';

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark10_release_intake_return_observer_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'spark10_release_intake_return_observed_no_agent3_executable_workset',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
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
    agent3_rows_with_missing_inputs: agent3Rows.filter((row) => row.exists !== true).length,
    agent3_rows_with_public_or_mutation_action: agent3Rows.filter((row) =>
      ['append', 'public_mutation'].includes(row.next_agent10_action),
    ).length,
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
      'Spark-10 release/package intake return observed Agent 3 linkage/navigation artifacts as intake evidence only and did not create an Agent 3 executable workset.',
    agent3_next_action:
      'No Agent 3 route from this return; wait for an exact changed Agent 3 linkage/dedupe/navigation workset or direct Spark return.',
    agent6_handoff_owner: handoffCandidates.length ? 'External matrix owner(s), not Agent 3' : 'none observed; Agent 3 created none',
    executable_workset_created: false,
  },
  boundary: {
    observer_package_only: true,
    linkage_navigation_only: true,
    no_agent3_agent6_handoff_candidate: true,
    no_source_file_commit: true,
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_selection: true,
    no_route_publication_support: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_accepted_gloss_or_text: true,
    no_public_reader_output: true,
  },
  validation_commands: [
    'node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
    'node scripts/validate_spark10_release_package_intake.mjs reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json',
    'node scripts/validate_agent3_spark10_release_intake_return_observer_package.mjs',
  ],
  what_remains_blocked: [
    'The Spark-10 release/package matrix is external Spark-10/Agent-10 intake evidence and is not committed by this Agent 3 package.',
    handoffBlocker,
    'Agent 3 regenerated Orot/Deuteronomy source JSON files remain generated_at-only drift and are not committed here.',
    'No publication, Definition authority, answer eligibility, source/license acceptance, runtime mutation, or accepted text is authorized.',
  ],
};

writeJson(outputJson, artifact);
writeText(outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);

console.log(JSON.stringify({ ok: true, output_json: outputJson, output_md: outputMd }, null, 2));

function summarizeRow(row) {
  return {
    path: row.path,
    lane_owner: row.lane_owner,
    exists: row.exists,
    status: row.status || null,
    blocker_class: row.blocker_class || null,
    next_agent10_action: row.next_agent10_action || null,
    release_relevance_hint: row.release_relevance_hint || null,
    agent6_handoff_candidate: Boolean(row.agent6_handoff_candidate),
  };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function manifest(inputMap) {
  return Object.entries(inputMap).map(([role, relativePath]) => {
    const absolute = resolve(relativePath);
    const stat = fs.statSync(absolute);
    return {
      role,
      path: relativePath,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex'),
      bytes: stat.size,
    };
  });
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const absolute = resolve(relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function renderMarkdown(value) {
  return `# Agent 3 Spark-10 Release Intake Return Observer Package - 2026-06-04

## Status

- Artifact: \`${outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Lane owner: \`${value.lane_owner}\`
- Result: ${value.package_summary.result}

## Spark-10 Return

- Matrix: \`${inputs.spark10_matrix_json}\`
- Inputs checked: \`${value.counts.spark10_inputs_checked}\`
- Missing required inputs: \`${value.counts.spark10_missing_required_inputs}\`
- Release-relevant rows: \`${value.counts.spark10_release_relevant_rows}\`
- Agent 6 handoff candidates: \`${value.counts.spark10_agent6_handoff_candidates}\`

## Agent 3 Rows

| Path | Status | Blocker | Next action |
| --- | --- | --- | --- |
${value.agent3_rows_observed
  .map((row) => `| \`${row.path}\` | ${row.status || ''} | ${row.blocker_class || ''} | ${row.next_agent10_action || ''} |`)
  .join('\n')}

## Handoff Candidates

The observed Agent 6 handoff candidates are external Agent 10 packets, not Agent 3 routes.

| Path | Owner | Status | Next action |
| --- | --- | --- | --- |
${value.agent6_handoff_candidates_observed
  .map((row) => `| \`${row.path}\` | ${row.lane_owner} | ${row.status || ''} | ${row.next_agent10_action || ''} |`)
  .join('\n')}

## Boundary

This package is an Agent 3 observer package only. It does not create a new Agent 3 executable workset, Agent 6 handoff, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route publication support, public/runtime acceptance, publication readiness, accepted gloss/text, or public reader output.

## Remaining Blockers

${value.what_remains_blocked.map((item) => `- ${item}`).join('\n')}

## Validation

${value.validation_commands.map((command) => `- \`${command}\``).join('\n')}

## Reviewed Inputs

${value.reviewed_inputs.map((input) => `- \`${input.path}\` (${input.bytes} bytes, sha256 \`${input.sha256}\`)`).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_spark10_release_intake_return_observer:start -->';
  const end = '<!-- agent3_spark10_release_intake_return_observer:end -->';
  const section = `${start}

## Latest Spark-10 Release Intake Return Observer

- Package: \`${outputMd}\`
- JSON: \`${outputJson}\`
- Status: \`${value.status}\`
- Spark-10 summary: ${value.counts.spark10_inputs_checked} inputs checked, ${value.counts.spark10_agent6_handoff_candidates} Agent 6 handoff candidates.
- Agent 3 rows observed: ${value.counts.agent3_rows_observed}; Agent 3 handoff candidates: ${value.counts.agent3_handoff_candidate_rows}.
- Boundary: observer/linkage continuity only; no new Agent 3 executable workset, no acceptance, no public/runtime/Definition/answer path.

${end}`;
  const absolute = resolve(stateMdPath);
  const existing = fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '# Agent 3 State\n';
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  const next = pattern.test(existing) ? existing.replace(pattern, section) : `${existing.trimEnd()}\n\n${section}\n`;
  fs.writeFileSync(absolute, next);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
