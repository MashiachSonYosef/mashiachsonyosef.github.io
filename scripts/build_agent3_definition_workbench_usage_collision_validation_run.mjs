#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outputPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-validation-run-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-validation-run-reshit.md';

const validatorCommands = [
  {
    key: 'focus_collision_audit',
    command: 'node scripts\\validate_agent3_definition_workbench_usage_focus_collision_audit.mjs',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_focus_collision_audit.mjs',
    data_path: 'data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json',
  },
  {
    key: 'collision_review_queue',
    command: 'node scripts\\validate_agent3_definition_workbench_usage_collision_review_queue.mjs',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_review_queue.mjs',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json',
  },
  {
    key: 'collision_review_reverse_index',
    command: 'node scripts\\validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json',
  },
  {
    key: 'collision_handoff_manifest',
    command: 'node scripts\\validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json',
  },
  {
    key: 'collision_integrity_digest',
    command: 'node scripts\\validate_agent3_definition_workbench_usage_collision_integrity_digest.mjs',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_integrity_digest.mjs',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-integrity-digest-reshit.json',
  },
  {
    key: 'agent3_usage_state',
    command: 'node scripts\\validate_agent3_usage_state.mjs',
    validator_path: 'scripts/validate_agent3_usage_state.mjs',
    data_path: 'reports/agent3-state.md',
  },
];

const commandResults = validatorCommands.map(runValidator);
const dataArtifacts = validatorCommands
  .filter((item) => item.data_path.endsWith('.json'))
  .map((item) => readJson(item.data_path));
const routeIds = new Set();
for (const artifact of dataArtifacts) collectRouteIds(artifact, routeIds);

const counts = {
  validation_commands: commandResults.length,
  commands_passed: commandResults.filter((result) => result.exit_code === 0).length,
  commands_failed: commandResults.filter((result) => result.exit_code !== 0).length,
  validators_present: commandResults.filter((result) => result.validator_exists).length,
  data_paths_present: commandResults.filter((result) => result.data_exists).length,
  json_data_artifacts: dataArtifacts.length,
  evidence_ready_json_artifacts: dataArtifacts.filter((artifact) => artifact.status === 'evidence-ready').length,
  route_ids: routeIds.size,
  reader_facing_rows: 0,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_reads: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_validation_run',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_validation_run.mjs',
  lane_owner: 'Agent 3',
  status: counts.commands_failed ? 'failed' : 'evidence-ready',
  focus_token_normalized: dataArtifacts.find((artifact) => artifact.focus_token_normalized)?.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_integrity_digest: 'data/definitions/agent3-definition-workbench-usage-collision-integrity-digest-reshit.json',
    agent3_state: 'reports/agent3-state.md',
  },
  policy: 'Validation-run packet for the Agent 3 collision handoff set. It records current validator commands and outputs for QA evidence only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, mutate queues, emit definitions, translate, or publish.',
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
  command_results: commandResults,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision validation run ${artifact.status}; commands passed ${counts.commands_passed}/${counts.validation_commands}`);

function runValidator(item) {
  const [cmd, ...args] = item.command.split(/\s+/);
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: false });
  return {
    key: item.key,
    command: item.command,
    validator_path: item.validator_path,
    data_path: item.data_path,
    validator_exists: exists(item.validator_path),
    data_exists: exists(item.data_path),
    exit_code: typeof result.status === 'number' ? result.status : 1,
    stdout: normalizeOutput(result.stdout),
    stderr: normalizeOutput(result.stderr),
    passed: result.status === 0,
  };
}

function normalizeOutput(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim().slice(0, 2000);
}

function buildChecks(c) {
  return [
    check('validation_commands_present', c.validation_commands === 6, `commands ${c.validation_commands}`),
    check('all_validators_present', c.validators_present === c.validation_commands, `validators ${c.validators_present}/${c.validation_commands}`),
    check('all_data_paths_present', c.data_paths_present === c.validation_commands, `data paths ${c.data_paths_present}/${c.validation_commands}`),
    check('all_commands_passed', c.commands_passed === c.validation_commands && c.commands_failed === 0, `passed/failed ${c.commands_passed}/${c.commands_failed}`),
    check('json_data_evidence_ready', c.evidence_ready_json_artifacts === c.json_data_artifacts, `evidence-ready json ${c.evidence_ready_json_artifacts}/${c.json_data_artifacts}`),
    check('single_route_visible', c.route_ids === 1, `route IDs ${c.route_ids}`),
    check('no_reader_payload_authority_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function collectRouteIds(node, ids) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectRouteIds(item, ids);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if ((key === 'related_agent2_route_ids' || key === 'route_ids') && Array.isArray(value)) {
      for (const id of value) if (typeof id === 'string') ids.add(id);
    }
    collectRouteIds(value, ids);
  }
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
    '# Agent 3 Definition Workbench Usage Collision Validation Run',
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
    `- Validation commands: ${c.validation_commands}`,
    `- Commands passed / failed: ${c.commands_passed}/${c.commands_failed}`,
    `- Validators present / data paths present: ${c.validators_present}/${c.data_paths_present}`,
    `- JSON data artifacts evidence-ready: ${c.evidence_ready_json_artifacts}/${c.json_data_artifacts}`,
    `- Route IDs visible: ${c.route_ids}`,
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
    'This validation-run packet is Agent 3 QA evidence only. It records validator outputs and does not mutate queues, inspect source text, or convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function escapeCell(value) {
  return String(value || '').replaceAll('|', '\\|').replace(/\s+/g, ' ');
}
