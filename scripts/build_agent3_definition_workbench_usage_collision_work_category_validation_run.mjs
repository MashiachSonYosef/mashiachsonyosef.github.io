#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.md';
const commands = [
  {
    key: 'collision_work_category_index',
    command: 'node scripts\\validate_agent3_definition_workbench_usage_collision_work_category_index.mjs',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_index.mjs',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json',
  },
  {
    key: 'agent3_usage_state',
    command: 'node scripts\\validate_agent3_usage_state.mjs',
    validator_path: 'scripts/validate_agent3_usage_state.mjs',
    data_path: 'reports/agent3-state.md',
  },
];

const command_results = commands.map(runCommand);
const index = readJson(commands[0].data_path);
const counts = {
  validation_commands: command_results.length,
  commands_passed: command_results.filter((row) => row.exit_code === 0).length,
  commands_failed: command_results.filter((row) => row.exit_code !== 0).length,
  validators_present: command_results.filter((row) => row.validator_exists).length,
  data_paths_present: command_results.filter((row) => row.data_exists).length,
  source_occurrence_rows: index.counts?.source_occurrence_rows || 0,
  category_index_rows: index.counts?.category_index_rows || 0,
  work_index_rows: index.counts?.work_index_rows || 0,
  category_license_index_rows: index.counts?.category_license_index_rows || 0,
  queue_links: index.counts?.occurrence_queue_links || 0,
  reader_facing_rows: index.counts?.reader_facing_rows || 0,
  route_payload_field_hits: index.counts?.route_payload_field_hits || 0,
  forbidden_authority_field_hits: index.counts?.forbidden_authority_field_hits || 0,
  source_text_reads: index.counts?.source_text_reads || 0,
  broad_target_expansion: index.counts?.broad_target_expansion || 0,
  queue_mutations: index.counts?.queue_mutations || 0,
  submitted_to_agent6: index.counts?.submitted_to_agent6 || 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_validation_run',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_validation_run.mjs',
  lane_owner: 'Agent 3',
  status: counts.commands_failed ? 'failed' : 'evidence-ready',
  focus_token_normalized: index.focus_token_normalized,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_work_category_index: commands[0].data_path,
    agent3_state: 'reports/agent3-state.md',
  },
  policy: 'Validation-run packet for the Agent 3 collision work/category index. It records current validator outputs for QA evidence only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    validation_run_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
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

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 work/category validation run ${artifact.status}; commands passed ${counts.commands_passed}/${counts.validation_commands}`);

function runCommand(item) {
  const [cmd, ...args] = item.command.split(/\s+/);
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
  return {
    key: item.key,
    command: item.command,
    validator_path: item.validator_path,
    data_path: item.data_path,
    validator_exists: exists(item.validator_path),
    data_exists: exists(item.data_path),
    exit_code: typeof result.status === 'number' ? result.status : 1,
    passed: result.status === 0,
    stdout: String(result.stdout || '').replace(/\r\n/g, '\n').trim(),
    stderr: String(result.stderr || '').replace(/\r\n/g, '\n').trim(),
  };
}

function buildChecks(c) {
  return [
    check('validation_commands_present', c.validation_commands === 2, `commands ${c.validation_commands}`),
    check('all_commands_passed', c.commands_passed === c.validation_commands && c.commands_failed === 0, `passed/failed ${c.commands_passed}/${c.commands_failed}`),
    check('validators_and_data_present', c.validators_present === c.validation_commands && c.data_paths_present === c.validation_commands, `validators/data ${c.validators_present}/${c.data_paths_present}`),
    check('work_category_counts_visible', c.source_occurrence_rows === 106 && c.category_index_rows === 8 && c.work_index_rows === 24 && c.category_license_index_rows === 8, `source/category/work/category-license ${c.source_occurrence_rows}/${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`),
    check('queue_links_visible', c.queue_links === 200, `queue links ${c.queue_links}`),
    check('no_authority_or_side_effects', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0 && c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `boundary ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}/${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
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

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Definition Workbench Usage Collision Work Category Validation Run',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: validator-run evidence only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Validation commands passed: ${c.commands_passed}/${c.validation_commands}`,
    `- Work/category rows: source ${c.source_occurrence_rows}; category ${c.category_index_rows}; work ${c.work_index_rows}; category-license ${c.category_license_index_rows}`,
    `- Queue links: ${c.queue_links}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    '',
    '## Command Results',
    '',
    '| key | command | exit | passed | stdout | stderr |',
    '|---|---|---:|---|---|---|',
    ...artifact.command_results.map((row) => `| ${row.key} | ${row.command} | ${row.exit_code} | ${row.passed} | ${escapeCell(row.stdout)} | ${escapeCell(row.stderr)} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This packet is Agent 3 validation evidence only. It does not mutate queues, inspect source text, or convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function escapeCell(value) {
  return String(value || '').replaceAll('|', '\\|').replace(/\s+/g, ' ');
}
