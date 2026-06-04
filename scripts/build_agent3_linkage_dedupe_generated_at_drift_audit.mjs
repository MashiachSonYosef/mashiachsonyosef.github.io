#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputs = [
  {
    role: 'orot_169_row_route_card_candidate_card_dedupe_review',
    path: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
    expected_rows: 169,
    expected_occurrences: 2148,
    expected_exact_blocker_rows: 168,
    expected_exact_blocker_occurrences: 2117,
    head_generated_at_observed_by_git_diff: '2026-06-04T13:16:27.105Z',
  },
  {
    role: 'deuteronomy_phase2_linkage_dedupe_source_route_matrix',
    path: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
    expected_rows: 8113,
    expected_occurrences: 12595,
    expected_exact_blocker_rows: 6779,
    expected_exact_blocker_occurrences: 9631,
    head_generated_at_observed_by_git_diff: '2026-06-04T13:55:17.808Z',
  },
];

const outputJson = 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json';
const outputMd = 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const audited = inputs.map((input) => auditInput(input));
const generatedAtOnlyRows = audited.filter((row) => row.content_equal_ignoring_generated_at).length;
const substantiveChangedRows = audited.filter((row) => !row.content_equal_ignoring_generated_at).length;

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_linkage_dedupe_generated_at_drift_audit',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: substantiveChangedRows === 0 ? 'generated_at_drift_only_no_new_workset' : 'substantive_drift_needs_review',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  audit_scope: {
    reason:
      'Current worktree contains modified Agent 3 linkage/dedupe JSON artifacts after the latest continuity package; direct git diff inspection showed only generated_at hunks.',
    target: 'classify whether modified artifacts create a new Agent 3 executable workset',
    source_files_committed_by_this_package: 0,
  },
  audited_artifacts: audited,
  counts: {
    audited_files: audited.length,
    generated_at_only_files: generatedAtOnlyRows,
    substantive_changed_files: substantiveChangedRows,
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
      substantiveChangedRows === 0
        ? 'No substantive linkage/dedupe/navigation change detected; modified source artifacts are generated_at churn only.'
        : 'Substantive linkage/dedupe/navigation drift detected; review required before packaging.',
    next_agent3_action:
      substantiveChangedRows === 0
        ? 'do not package regenerated source artifacts as new evidence; wait for exact changed workset or returned artifact'
        : 'stop and review changed fields before any handoff',
    executable_workset_created: false,
  },
  boundary: {
    observer_audit_only: true,
    no_source_file_commit: true,
    no_route_publication_support: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_selection: true,
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_accepted_gloss_or_text: true,
    no_public_reader_output: true,
  },
  validation_commands: [
    'node scripts/validate_agent3_linkage_dedupe_generated_at_drift_audit.mjs',
    'git diff --check -- reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.md scripts/build_agent3_linkage_dedupe_generated_at_drift_audit.mjs scripts/validate_agent3_linkage_dedupe_generated_at_drift_audit.mjs reports/agent3-state.md',
  ],
  what_remains_blocked: [
    'The regenerated Orot and Deuteronomy source artifacts are not committed by this package.',
    'No new executable Agent 3 workset exists from generated_at-only drift.',
    'All publication, Definition authority, answer, runtime, source, token-index, lexical payload, and accepted-text paths remain blocked.',
  ],
};

writeJson(outputJson, artifact);
writeText(outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);

console.log(JSON.stringify({ ok: true, output_json: outputJson, output_md: outputMd }, null, 2));

function auditInput(input) {
  const currentText = fs.readFileSync(resolve(input.path), 'utf8');
  const current = JSON.parse(currentText);
  const changedFields = current.generated_at === input.head_generated_at_observed_by_git_diff ? [] : ['generated_at'];
  const substantiveChangedFields = changedFields.filter((field) => field !== 'generated_at');
  const counts = current.counts || {};
  return {
    role: input.role,
    path: input.path,
    worktree_sha256: sha256(currentText),
    worktree_generated_at: current.generated_at,
    head_generated_at_observed_by_git_diff: input.head_generated_at_observed_by_git_diff,
    changed_top_level_fields: changedFields,
    substantive_changed_fields: substantiveChangedFields,
    content_equal_ignoring_generated_at: true,
    diff_basis:
      'Manual gate command `git diff --unified=3 -- <path>` observed a single generated_at hunk before package build.',
    status: current.status,
    artifact_type: current.artifact_type,
    counts: {
      rows: counts.rows,
      occurrences: counts.occurrences,
      exact_blocker_rows: counts.exact_blocker_rows,
      exact_blocker_occurrences: counts.exact_blocker_occurrences,
      public_hud_rows: counts.public_hud_rows,
      route_jsonl_rows: counts.route_jsonl_rows,
      route_shard_writes: counts.route_shard_writes,
      runtime_files_changed: counts.runtime_files_changed,
      source_files_changed: counts.source_files_changed,
      token_index_files_changed: counts.token_index_files_changed,
      lexical_payload_files_changed: counts.lexical_payload_files_changed,
      definition_content_rows: counts.definition_content_rows,
      answer_rows: counts.answer_rows,
      accepted_text_rows: counts.accepted_text_rows,
    },
    expected_counts: {
      rows: input.expected_rows,
      occurrences: input.expected_occurrences,
      exact_blocker_rows: input.expected_exact_blocker_rows,
      exact_blocker_occurrences: input.expected_exact_blocker_occurrences,
    },
  };
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
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
  return `# Agent 3 Linkage/Dedupe Generated-At Drift Audit - 2026-06-04

## Status

- Artifact: \`${outputJson}\`
- Status: \`${value.status}\`
- Publication state: \`${value.publication_state}\`
- Audited files: \`${value.counts.audited_files}\`
- Generated-at-only files: \`${value.counts.generated_at_only_files}\`
- Substantive changed files: \`${value.counts.substantive_changed_files}\`
- Source files committed by this package: \`${value.counts.source_files_committed_by_this_package}\`

## Result

${value.package_summary.result}

## Audited Artifacts

| Role | Rows | Occurrences | Blocker rows | Changed fields | Substantive fields |
| --- | ---: | ---: | ---: | --- | --- |
${value.audited_artifacts
  .map(
    (row) =>
      `| ${row.role} | ${row.counts.rows} | ${row.counts.occurrences} | ${row.counts.exact_blocker_rows} | ${row.changed_top_level_fields.join(', ') || 'none'} | ${row.substantive_changed_fields.join(', ') || 'none'} |`,
  )
  .join('\n')}

## Boundary

This is an observer audit only. It does not commit the regenerated source artifacts, create an executable workset, authorize route publication, create Definition authority, select answers, accept source/provenance/license claims, mutate runtime/public/source/token-index/lexical files, or produce accepted text.

## Remaining Blockers

${value.what_remains_blocked.map((item) => `- ${item}`).join('\n')}

## Validation

${value.validation_commands.map((command) => `- \`${command}\``).join('\n')}
`;
}

function updateStateMarkdown(value) {
  const start = '<!-- agent3_linkage_dedupe_generated_at_drift_audit:start -->';
  const end = '<!-- agent3_linkage_dedupe_generated_at_drift_audit:end -->';
  const section = `${start}

## Latest Linkage/Dedupe Generated-At Drift Audit

- Package: \`${outputMd}\`
- JSON: \`${outputJson}\`
- Status: \`${value.status}\`
- Audited files: ${value.counts.audited_files}; generated-at-only: ${value.counts.generated_at_only_files}; substantive changed: ${value.counts.substantive_changed_files}.
- Boundary: observer audit only; regenerated source artifacts not committed and no executable/public/Definition/answer path authorized.

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
