#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = {
  agent6_old_dictionary_verdict_md: 'reports/agent6-old-dictionary-license-lane-planning-verdict-2026-06-04.md',
  agent10_old_dictionary_consumption_json:
    'reports/agent10-agent6-old-dictionary-license-lane-verdict-consumption-2026-06-04.json',
  agent10_old_dictionary_consumption_md:
    'reports/agent10-agent6-old-dictionary-license-lane-verdict-consumption-2026-06-04.md',
  spark10_matrix_json: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json',
  spark10_matrix_md: 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md',
  agent3_drift_audit_json: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
};

const outputJson = 'reports/agent3-external-old-dictionary-verdict-observer-package-2026-06-04.json';
const outputMd = 'reports/agent3-external-old-dictionary-verdict-observer-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const verdictText = fs.readFileSync(resolve(inputs.agent6_old_dictionary_verdict_md), 'utf8');
const consumption = readJson(inputs.agent10_old_dictionary_consumption_json);
const matrix = readJson(inputs.spark10_matrix_json);
const driftAudit = readJson(inputs.agent3_drift_audit_json);
const matrixRows = matrix.rows || [];
const agent3Rows = matrixRows.filter((row) => row.lane_owner === 'Agent 3').map(summarizeRow);
const handoffCandidates = matrixRows
  .filter(
    (row) =>
      row.agent6_handoff_candidate ||
      row.next_agent10_action === 'prepare_or_route_agent6_boundary_only_if_exact_package_exists',
  )
  .map(summarizeRow);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_external_old_dictionary_verdict_observer_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'external_old_dictionary_planning_verdict_observed_no_agent3_workset',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  external_verdict_observed: {
    path: inputs.agent6_old_dictionary_verdict_md,
    disposition: verdictText.includes('WARN-ACCEPTED') ? 'WARN-ACCEPTED' : 'not_detected',
    planning_only: verdictText.includes('non-public old-dictionary source-family/license-lane planning evidence'),
    blocker_effect: verdictText.includes('missing_agent1_old_dictionary_excluded_row_license_lane_assignment')
      ? 'old_dictionary_lane_assignment_resolved_for_nonpublic_planning_only'
      : 'not_detected',
    no_authority_boundary_detected:
      verdictText.includes('does not authorize candidate text consumption') &&
      verdictText.includes('Definition authority') &&
      verdictText.includes('public/runtime mutation'),
  },
  agent10_consumption_observed: {
    path: inputs.agent10_old_dictionary_consumption_json,
    artifact_type: consumption.artifact_type,
    status: consumption.status,
    disposition: consumption.disposition,
    blocker_effect: consumption.blocker_effect,
    zero_output_counts: consumption.zero_output_counts,
  },
  spark10_current_matrix_observed: {
    path: inputs.spark10_matrix_json,
    artifact_type: matrix.artifact_type,
    generated_at: matrix.generated_at,
    summary: matrix.summary,
    boundary: matrix.boundary,
  },
  agent3_rows_observed: agent3Rows,
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
    external_agent10_handoff_candidate_rows: handoffCandidates.filter((row) => row.lane_owner === 'Agent 10').length,
    old_dictionary_verdict_agent3_workset_rows: 0,
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
      'External old-dictionary Agent6/Agent10 planning verdict observed; it resolves an Agent2/Agent10 planning blocker only and creates no Agent3 linkage/dedupe/navigation workset.',
    agent3_next_action:
      'Wait for an exact changed Agent3 linkage/dedupe/navigation workset, direct Spark return, or downstream route that names Agent3-owned rows.',
    executable_workset_created: false,
    external_verdict_packaged: true,
  },
  boundary: zeroBoundary(),
  validation_commands: [
    'node scripts/validate_agent3_external_old_dictionary_verdict_observer_package.mjs',
    'git diff --check -- reports/agent3-external-old-dictionary-verdict-observer-package-2026-06-04.json reports/agent3-external-old-dictionary-verdict-observer-package-2026-06-04.md scripts/build_agent3_external_old_dictionary_verdict_observer_package.mjs scripts/validate_agent3_external_old_dictionary_verdict_observer_package.mjs reports/agent3-state.md',
  ],
  what_remains_blocked: [
    'Old-dictionary verdict is external Agent10/Agent2 non-public planning evidence, not Agent3 linkage authority.',
    'No Agent3 executable linkage/dedupe/navigation workset is named by the verdict or Spark10 matrix.',
    'Agent3 Orot/Deuteronomy source matrices remain generated_at-only working-tree drift and are not committed here.',
    'No publication, Definition authority, answer eligibility, source/license acceptance, runtime mutation, route publication support, candidate text export, or accepted text is authorized.',
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
  lines.push('# Agent 3 External Old-Dictionary Verdict Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Result: ${value.package_summary.result}`);
  lines.push('');
  lines.push('## External Verdict');
  lines.push('');
  lines.push(`- Agent 6 verdict: \`${value.external_verdict_observed.path}\``);
  lines.push(`- Disposition: \`${value.external_verdict_observed.disposition}\``);
  lines.push(`- Blocker effect: \`${value.external_verdict_observed.blocker_effect}\``);
  lines.push(`- Planning only: \`${value.external_verdict_observed.planning_only}\``);
  lines.push('');
  lines.push('## Spark10 Matrix');
  lines.push('');
  lines.push(`- Inputs checked: \`${value.counts.spark10_inputs_checked}\``);
  lines.push(`- Release-relevant rows: \`${value.counts.spark10_release_relevant_rows}\``);
  lines.push(`- Agent6 handoff candidates: \`${value.counts.spark10_agent6_handoff_candidates}\``);
  lines.push(`- Agent3 rows observed / handoff candidates: \`${value.counts.agent3_rows_observed}/${value.counts.agent3_handoff_candidate_rows}\``);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push(
    'This is an Agent3 observer package only. It does not create a new Agent3 executable workset, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route publication support, public/runtime acceptance, publication readiness, candidate text export, accepted gloss/text, or public reader output.',
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
    `- External verdict: \`${value.external_verdict_observed.disposition}\` old-dictionary planning only`,
    `- Spark10 inputs/release rows: ${value.counts.spark10_inputs_checked}/${value.counts.spark10_release_relevant_rows}`,
    `- Agent3 rows observed / handoff candidates: ${value.counts.agent3_rows_observed}/${value.counts.agent3_handoff_candidate_rows}`,
    '- Boundary: observer evidence only; no executable workset, Definition authority, answer selection, route publication, runtime mutation, source/license acceptance, candidate text export, or accepted text.',
    '- Next step: wait for exact Agent3-owned linkage/dedupe/navigation workset or direct Spark return.',
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
    candidate_text_export: false,
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
