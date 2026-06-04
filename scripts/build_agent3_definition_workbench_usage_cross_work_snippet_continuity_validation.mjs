#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-cross-work-snippet-continuity-validation-2026-06-04.json';
const reportPath = 'reports/agent3-definition-workbench-usage-cross-work-snippet-continuity-validation-2026-06-04.md';
const sourcePath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.json';

const commands = [
  {
    key: 'cross_work_snippet_locator',
    command: ['node', 'scripts\\validate_agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator.mjs'],
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator.mjs',
    data_path: sourcePath,
  },
  {
    key: 'agent3_usage_state',
    command: ['node', 'scripts\\validate_agent3_usage_state.mjs'],
    validator_path: 'scripts/validate_agent3_usage_state.mjs',
    data_path: 'reports/agent3-state.md',
  },
];

const command_results = commands.map((entry) => {
  const result = spawnSync(entry.command[0], entry.command.slice(1), {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  return {
    key: entry.key,
    command: entry.command.join(' '),
    validator_path: entry.validator_path,
    data_path: entry.data_path,
    validator_exists: exists(entry.validator_path),
    data_exists: exists(entry.data_path),
    exit_code: result.status,
    passed: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
});

const source = readJson(sourcePath);
const sourceCounts = source.counts || {};
const counts = {
  validation_commands: command_results.length,
  commands_passed: command_results.filter((row) => row.passed).length,
  commands_failed: command_results.filter((row) => !row.passed).length,
  validators_present: command_results.filter((row) => row.validator_exists).length,
  data_paths_present: command_results.filter((row) => row.data_exists).length,
  source_repeat_locator_rows: Number(sourceCounts.source_repeat_locator_rows || 0),
  source_phrase_context_repeat_buckets: Number(sourceCounts.source_phrase_context_repeat_buckets || 0),
  cross_work_snippet_buckets: Number(sourceCounts.cross_work_snippet_buckets || 0),
  cross_category_buckets: Number(sourceCounts.cross_category_buckets || 0),
  cross_work_snippet_occurrence_rows: Number(sourceCounts.cross_work_snippet_occurrence_rows || 0),
  rows_with_source_ref: Number(sourceCounts.rows_with_source_ref || 0),
  rows_with_source_url: Number(sourceCounts.rows_with_source_url || 0),
  rows_with_local_work_anchor: Number(sourceCounts.rows_with_local_work_anchor || 0),
  rows_with_license: Number(sourceCounts.rows_with_license || 0),
  rows_with_version: Number(sourceCounts.rows_with_version || 0),
  rows_with_route_ids: Number(sourceCounts.rows_with_route_ids || 0),
  rows_labeled_observed_usage_only: Number(sourceCounts.rows_labeled_observed_usage_only || 0),
  distinct_works: Number(sourceCounts.distinct_works || 0),
  distinct_categories: Number(sourceCounts.distinct_categories || 0),
  distinct_licenses: Number(sourceCounts.distinct_licenses || 0),
  distinct_route_ids: Number(sourceCounts.distinct_route_ids || 0),
  reader_facing_rows: Number(sourceCounts.reader_facing_rows || 0),
  route_payload_field_hits: Number(sourceCounts.route_payload_field_hits || 0),
  forbidden_authority_field_hits: Number(sourceCounts.forbidden_authority_field_hits || 0),
  semantic_independence_claims: Number(sourceCounts.semantic_independence_claims || 0),
  source_text_reads: Number(sourceCounts.source_text_reads || 0),
  broad_target_expansion: Number(sourceCounts.broad_target_expansion || 0),
  queue_mutations: Number(sourceCounts.queue_mutations || 0),
  submitted_to_agent6: Number(sourceCounts.submitted_to_agent6 || 0),
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_cross_work_snippet_continuity_validation',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_cross_work_snippet_continuity_validation.mjs',
  lane_owner: 'Agent 3',
  status: counts.commands_failed === 0 ? 'evidence-ready' : 'awaiting-Agent-6',
  focus_token_normalized: source.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    cross_work_snippet_locator: sourcePath,
    agent3_state: 'reports/agent3-state.md',
  },
  policy: 'Continuity validation run for the Agent 3 cross-work snippet locator in the current June 4 worktree. It records validator results and current counts for QA handoff only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    continuity_validation_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
    semantic_independence: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_route_payloads: false,
    accepted_text_output: false,
    publication_claim: false,
    source_text_read: false,
    broad_target_expansion: false,
    agent6_accepted: false,
  },
  command_results,
  counts,
  checks: buildChecks(counts),
};

writeJson(artifactPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${artifactPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 cross-work snippet continuity validation ${artifact.status}; commands ${counts.commands_passed}/${counts.validation_commands}; rows ${counts.cross_work_snippet_occurrence_rows}`);

function buildChecks(c) {
  return [
    check('validation_commands_passed', c.validation_commands === 2 && c.commands_passed === 2 && c.commands_failed === 0, `commands/pass/fail ${c.validation_commands}/${c.commands_passed}/${c.commands_failed}`),
    check('validators_and_data_present', c.validators_present === 2 && c.data_paths_present === 2, `validators/data ${c.validators_present}/${c.data_paths_present}`),
    check('cross_work_counts_stable', c.source_repeat_locator_rows === 96 && c.source_phrase_context_repeat_buckets === 7 && c.cross_work_snippet_buckets === 3 && c.cross_category_buckets === 1 && c.cross_work_snippet_occurrence_rows === 6, `source/repeat/cross/category/rows ${c.source_repeat_locator_rows}/${c.source_phrase_context_repeat_buckets}/${c.cross_work_snippet_buckets}/${c.cross_category_buckets}/${c.cross_work_snippet_occurrence_rows}`),
    check('links_and_metadata_complete', c.rows_with_source_ref === 6 && c.rows_with_source_url === 6 && c.rows_with_local_work_anchor === 6 && c.rows_with_license === 6 && c.rows_with_version === 6 && c.rows_with_route_ids === 6, `ref/url/anchor/license/version/route ${c.rows_with_source_ref}/${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_license}/${c.rows_with_version}/${c.rows_with_route_ids}`),
    check('observed_usage_complete', c.rows_labeled_observed_usage_only === 6, `observed ${c.rows_labeled_observed_usage_only}/6`),
    check('diversity_stable', c.distinct_works === 6 && c.distinct_categories === 4 && c.distinct_licenses === 2 && c.distinct_route_ids === 1, `work/category/license/route ${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}/${c.distinct_route_ids}`),
    check('no_reader_payload_authority_or_semantic_claims', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0 && c.semantic_independence_claims === 0, `reader/payload/forbidden/semantic ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}/${c.semantic_independence_claims}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Cross-Work Snippet Continuity Validation',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is continuity validation only and not Definition authority.',
    '',
    '## Scope',
    '',
    'This packet records that the latest Agent 3 cross-work snippet locator still validates in the current June 4 worktree. It is QA continuity evidence only.',
    '',
    '## Commands',
    '',
    '| key | command | passed | exit |',
    '|---|---|---:|---:|',
    ...value.command_results.map((row) => `| ${row.key} | \`${row.command}\` | ${row.passed ? 'yes' : 'no'} | ${row.exit_code} |`),
    '',
    '## Counts',
    '',
    `- Validation commands passed/failed: ${c.commands_passed}/${c.commands_failed}`,
    `- Cross-work snippet buckets / cross-category buckets / occurrence rows: ${c.cross_work_snippet_buckets}/${c.cross_category_buckets}/${c.cross_work_snippet_occurrence_rows}`,
    `- Source refs / source URLs / local anchors / license rows / version rows / route-ID rows: ${c.rows_with_source_ref}/${c.rows_with_source_url}/${c.rows_with_local_work_anchor}/${c.rows_with_license}/${c.rows_with_version}/${c.rows_with_route_ids}`,
    `- Distinct works / categories / licenses / route IDs: ${c.distinct_works}/${c.distinct_categories}/${c.distinct_licenses}/${c.distinct_route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority / semantic-independence claims: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}/${c.semantic_independence_claims}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This continuity packet confirms the current Agent 3 cross-work snippet locator still validates with ${c.cross_work_snippet_buckets} buckets and ${c.cross_work_snippet_occurrence_rows} observed-usage rows. It records validator pass state only and does not claim Agent 6 acceptance.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This validation packet is not Definition authority, not reviewed lexical authority, not semantic independence, not semantic arbitration, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}
