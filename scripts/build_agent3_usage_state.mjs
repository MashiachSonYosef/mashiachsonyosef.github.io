#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  agentRegistry: 'data/control/agent_registry.json',
  goalBoard: 'data/control/agent_goal_board.json',
  queueReadyPacket: 'data/definitions/definition-workbench-usage-queue-ready-packet.json',
  usageAgent6Packet: 'data/definitions/definition-workbench-usage-agent6-packet.json',
  smokeValidation: '.local-cache/workbench-evidence/smoke-pipeline-validation.json',
  usageConcordance: 'data/workbench-evidence/usage-concordance.json',
  usageHandoffIndex: '.local-cache/workbench-evidence/usage-navigation-handoff-index.json',
  output: 'reports/agent3-state.json',
  report: 'reports/agent3-state.md',
};

const options = parseArgs(process.argv.slice(2));
const agentRegistry = readJson(options.agentRegistry);
const goalBoard = readJson(options.goalBoard);
const queueReadyPacket = readJson(options.queueReadyPacket);
const usageAgent6Packet = readJson(options.usageAgent6Packet);
const smokeValidation = readJson(options.smokeValidation);
const usageConcordance = readJson(options.usageConcordance);
const usageHandoffIndex = readJson(options.usageHandoffIndex);

if (queueReadyPacket.artifact_type !== 'definition_workbench_usage_queue_ready_packet') {
  throw new Error(`${options.queueReadyPacket} is not a queue-ready packet`);
}
if (usageAgent6Packet.artifact_type !== 'definition_workbench_usage_agent6_packet') {
  throw new Error(`${options.usageAgent6Packet} is not an Agent 6 usage packet`);
}

const agent = (agentRegistry.agents || []).find((entry) => entry.agent === 'Agent 3') || {};
const goal = (goalBoard.goals || []).find((entry) => entry.id === 'agent3-definition-occurrence-links') || {};
const evidenceArtifacts = unique([
  options.queueReadyPacket,
  'reports/definition-workbench-usage-queue-ready-packet.md',
  options.usageAgent6Packet,
  'reports/definition-workbench-usage-agent6-packet.md',
  'data/definitions/definition-workbench-usage-link-packet.json',
  'reports/definition-workbench-usage-link-packet.md',
  'data/definitions/definition-workbench-usage-seed-queue.json',
  'reports/definition-workbench-usage-seed-queue.md',
  'data/definitions/definition-workbench-usage-join-smoke.json',
  'reports/definition-workbench-usage-join-smoke.md',
  'reports/workbench-smoke-pipeline-validation.md',
  'data/workbench-evidence/usage-concordance.json',
]);
const validators = unique([
  'scripts/validate_definition_workbench_usage_queue_ready_packet.mjs',
  'scripts/validate_definition_workbench_usage_agent6_packet.mjs',
  'scripts/validate_definition_workbench_usage_link_packet.mjs',
  'scripts/validate_definition_workbench_usage_seed_queue.mjs',
  'scripts/validate_definition_workbench_usage_join_smoke.mjs',
  'scripts/validate_workbench_smoke_pipeline.mjs',
  'scripts/validate_agent3_usage_state.mjs',
]);
const counts = buildCounts();
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_usage_navigation_state',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_usage_state.mjs',
  agent: 'Agent 3',
  lane: agent.lane || 'workbench_usage_navigation',
  state_file: agent.state_file || options.report,
  worker_state: 'evidence-ready',
  qa_acceptance_state: 'not_agent6_accepted',
  goal_id: 'agent3-definition-occurrence-links',
  goal_board_status: goal.status || null,
  manager: goal.manager || 'Agent 5',
  acceptance_owner: goal.acceptance_owner || 'Agent 6',
  authority_boundary: {
    usage_navigation_only: true,
    occurrence_link_packet_only: true,
    route_ids_only: true,
    definition_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    hud_or_workbench_ui_acceptance: false,
    publication_support: false,
    accepted_translation_text: false,
    agent6_accepted: false,
  },
  handoff_state: {
    queue_ready_packet: options.queueReadyPacket,
    intended_submitter: queueReadyPacket.submission_boundary?.intended_submitter || 'Agent 5',
    control_queue_mutated: queueReadyPacket.submission_boundary?.control_queue_mutated === true,
    submitted_to_agent6: queueReadyPacket.submission_boundary?.submitted_to_agent6 === true,
  },
  evidence_artifacts: evidenceArtifacts,
  validators,
  current_metrics: {
    usage_concordance_rows: Number(usageConcordance.counts?.rows || usageHandoffIndex.counts?.concordance_rows || 0),
    usage_supported_rows: Number(usageConcordance.counts?.status_counts?.supported ?? usageHandoffIndex.counts?.supported ?? 0),
    usage_candidate_rows: Number(usageConcordance.counts?.status_counts?.candidate ?? usageHandoffIndex.counts?.candidate ?? 0),
    usage_weak_rows: Number(usageConcordance.counts?.status_counts?.weak ?? usageHandoffIndex.counts?.weak ?? 0),
    audit_only_ambiguous_rows: Number(usageConcordance.counts?.audit_only_counts?.ambiguous ?? usageHandoffIndex.counts?.audit_only_ambiguous ?? 0),
    usage_clusters: Number(usageHandoffIndex.counts?.usage_clusters || smokeValidation.counts?.usage_cluster_index_clusters || 0),
    selected_usage_rows: Number(smokeValidation.counts?.usage_selected_slice_rows || 0),
    selected_source_refs: Number(smokeValidation.counts?.usage_selected_source_diversity_unique_source_refs || 0),
    selected_works: Number(smokeValidation.counts?.usage_selected_source_diversity_unique_works || 0),
    route_ids: Number(usageAgent6Packet.counts?.route_ids || 0),
    proof_occurrence_rows: Number(usageAgent6Packet.counts?.proof_occurrence_rows || 0),
    proof_rows_with_complete_metadata: completeProofRows(usageAgent6Packet),
    proof_rows_with_hebrew_context: Number(usageAgent6Packet.counts?.proof_rows_with_hebrew_context || 0),
    proof_mojibake_rows: Number(usageAgent6Packet.counts?.proof_mojibake_rows || 0),
    reader_facing_rows: Number(usageAgent6Packet.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(usageAgent6Packet.counts?.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(usageAgent6Packet.counts?.forbidden_authority_field_hits || 0),
    queue_required_fields_present: Number(queueReadyPacket.counts?.required_queue_fields_present || 0),
    queue_required_fields: Number(queueReadyPacket.counts?.required_queue_fields || 0),
    queue_evidence_artifacts_exist: Number(queueReadyPacket.counts?.evidence_artifacts_exist || 0),
    queue_evidence_artifacts: Number(queueReadyPacket.counts?.evidence_artifacts || 0),
    smoke_steps: Number(smokeValidation.counts?.steps || 0),
    smoke_failed_steps: Number(smokeValidation.counts?.failed_steps || 0),
    smoke_source_freshness_status: smokeValidation.counts?.source_freshness_status || null,
    smoke_source_freshness_pending_files: Number(smokeValidation.counts?.usage_refresh_priority_pending_files || 0),
  },
  known_risks: [
    'Definition Workbench current 200-row sample still has 0 current usage links for the selected Agent 3 usage token scope.',
    'Selected usage evidence is concentrated on one route ID; it is usage navigation, not independent semantic confirmation.',
    'Usage coverage is selected seeded scope, not broad corpus completion.',
    'Ambiguous rows remain audit-only and are not reader-facing.',
    `Smoke source freshness is ${smokeValidation.counts?.source_freshness_status || 'unknown'} with ${Number(smokeValidation.counts?.usage_refresh_priority_pending_files || 0)} pending refresh files.`,
    'Agent 3 did not mutate Agent 6 queue state; Agent 5 remains the intended submitter.',
  ],
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Agent 3 state ${artifact.quality.status}; evidence ${counts.evidence_artifacts_exist}/${counts.evidence_artifacts}; validators ${counts.validator_scripts_exist}/${counts.validator_scripts}`);

function buildCounts() {
  return {
    evidence_artifacts: evidenceArtifacts.length,
    evidence_artifacts_exist: evidenceArtifacts.filter((artifactPath) => fs.existsSync(path.join(root, artifactPath))).length,
    validator_scripts: validators.length,
    validator_scripts_exist: validators.filter((scriptPath) => fs.existsSync(path.join(root, scriptPath))).length,
    queue_required_fields_present: Number(queueReadyPacket.counts?.required_queue_fields_present || 0),
    queue_required_fields: Number(queueReadyPacket.counts?.required_queue_fields || 0),
    queue_mutations: Number(queueReadyPacket.counts?.queue_mutations || 0),
    submitted_to_agent6: Number(queueReadyPacket.counts?.submitted_to_agent6 || 0),
    usage_concordance_rows: Number(usageConcordance.counts?.rows || 0),
    usage_supported_rows: Number(usageConcordance.counts?.status_counts?.supported || 0),
    usage_candidate_rows: Number(usageConcordance.counts?.status_counts?.candidate || 0),
    usage_weak_rows: Number(usageConcordance.counts?.status_counts?.weak || 0),
    audit_only_ambiguous_rows: Number(usageConcordance.counts?.audit_only_counts?.ambiguous || 0),
    proof_occurrence_rows: Number(usageAgent6Packet.counts?.proof_occurrence_rows || 0),
    proof_rows_with_complete_metadata: completeProofRows(usageAgent6Packet),
    proof_rows_with_hebrew_context: Number(usageAgent6Packet.counts?.proof_rows_with_hebrew_context || 0),
    proof_mojibake_rows: Number(usageAgent6Packet.counts?.proof_mojibake_rows || 0),
    reader_facing_rows: Number(usageAgent6Packet.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(usageAgent6Packet.counts?.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(usageAgent6Packet.counts?.forbidden_authority_field_hits || 0),
    smoke_steps: Number(smokeValidation.counts?.steps || 0),
    smoke_failed_steps: Number(smokeValidation.counts?.failed_steps || 0),
  };
}

function buildChecks(counts) {
  return [
    check('registry_state_file_present', agent.state_file === options.report ? 'passed' : 'failed', `registry ${agent.state_file || 'missing'}; report ${options.report}`),
    check('goal_boundary_loaded', goal.id === 'agent3-definition-occurrence-links' && goal.acceptance_owner === 'Agent 6' ? 'passed' : 'failed', `goal ${goal.id || 'missing'}; acceptance ${goal.acceptance_owner || 'missing'}`),
    check('evidence_artifacts_exist', counts.evidence_artifacts_exist === counts.evidence_artifacts ? 'passed' : 'failed', `${counts.evidence_artifacts_exist}/${counts.evidence_artifacts}`),
    check('validator_scripts_exist', counts.validator_scripts_exist === counts.validator_scripts ? 'passed' : 'failed', `${counts.validator_scripts_exist}/${counts.validator_scripts}`),
    check('queue_ready_not_submitted', counts.queue_required_fields_present === counts.queue_required_fields && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `fields ${counts.queue_required_fields_present}/${counts.queue_required_fields}; mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
    check('usage_counts_nonzero', counts.usage_supported_rows + counts.usage_candidate_rows + counts.usage_weak_rows > 0 ? 'passed' : 'failed', `supported/candidate/weak ${counts.usage_supported_rows}/${counts.usage_candidate_rows}/${counts.usage_weak_rows}`),
    check('ambiguous_audit_only_visible', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `ambiguous ${counts.audit_only_ambiguous_rows}; reader-facing ${counts.reader_facing_rows}`),
    check('proof_metadata_complete', counts.proof_occurrence_rows > 0 && counts.proof_rows_with_complete_metadata === counts.proof_occurrence_rows ? 'passed' : 'failed', `${counts.proof_rows_with_complete_metadata}/${counts.proof_occurrence_rows}`),
    check('hebrew_context_clean', counts.proof_rows_with_hebrew_context === counts.proof_occurrence_rows && counts.proof_mojibake_rows === 0 ? 'passed' : 'failed', `Hebrew context ${counts.proof_rows_with_hebrew_context}; mojibake ${counts.proof_mojibake_rows}`),
    check('no_authority_fields', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
    check('smoke_validation_passed', counts.smoke_steps > 0 && counts.smoke_failed_steps === 0 ? 'passed' : 'failed', `steps ${counts.smoke_steps}; failed ${counts.smoke_failed_steps}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Agent 3 State',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## State',
    '',
    `- Lane: ${artifact.lane}`,
    `- Worker state: ${artifact.worker_state}`,
    `- QA acceptance state: ${artifact.qa_acceptance_state}`,
    `- Goal: ${artifact.goal_id} (${artifact.goal_board_status})`,
    `- Manager / acceptance owner: ${artifact.manager} / ${artifact.acceptance_owner}`,
    `- Queue-ready packet: ${artifact.handoff_state.queue_ready_packet}`,
    `- Queue mutated / submitted: ${artifact.handoff_state.control_queue_mutated}/${artifact.handoff_state.submitted_to_agent6}`,
    '',
    '## Metrics',
    '',
    `- Usage concordance rows: ${artifact.current_metrics.usage_concordance_rows}`,
    `- Supported/candidate/weak rows: ${artifact.current_metrics.usage_supported_rows}/${artifact.current_metrics.usage_candidate_rows}/${artifact.current_metrics.usage_weak_rows}`,
    `- Audit-only ambiguous rows: ${artifact.current_metrics.audit_only_ambiguous_rows}`,
    `- Selected usage rows/source refs/works: ${artifact.current_metrics.selected_usage_rows}/${artifact.current_metrics.selected_source_refs}/${artifact.current_metrics.selected_works}`,
    `- Proof rows / complete metadata: ${artifact.current_metrics.proof_occurrence_rows}/${artifact.current_metrics.proof_rows_with_complete_metadata}`,
    `- Hebrew context / mojibake rows: ${artifact.current_metrics.proof_rows_with_hebrew_context}/${artifact.current_metrics.proof_mojibake_rows}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.current_metrics.reader_facing_rows}/${artifact.current_metrics.route_payload_field_hits}/${artifact.current_metrics.forbidden_authority_field_hits}`,
    `- Queue required fields: ${artifact.current_metrics.queue_required_fields_present}/${artifact.current_metrics.queue_required_fields}`,
    `- Smoke steps / failed: ${artifact.current_metrics.smoke_steps}/${artifact.current_metrics.smoke_failed_steps}`,
    `- Source freshness: ${artifact.current_metrics.smoke_source_freshness_status}, pending ${artifact.current_metrics.smoke_source_freshness_pending_files}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Known Risks',
    '',
    ...artifact.known_risks.map((risk) => `- ${risk}`),
    '',
    '## Boundary',
    '',
    'Agent 3 output remains usage navigation and occurrence-link evidence only. This state file is not Definition authority, not semantic arbitration, not route ranking, not HUD or Workbench UI acceptance, not publication support, not accepted translation text, and not Agent 6 acceptance.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function completeProofRows(packet) {
  const required = [
    'proof_rows_with_source',
    'proof_rows_with_work_anchor',
    'proof_rows_with_context',
    'proof_rows_with_license',
    'proof_rows_with_version',
    'proof_rows_with_route_ids',
  ];
  return Math.min(...required.map((key) => Number(packet.counts?.[key] || 0)));
}

function check(id, status, detail) {
  return { id, status, detail };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--agent-registry=')) parsed.agentRegistry = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--goal-board=')) parsed.goalBoard = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--queue-ready-packet=')) parsed.queueReadyPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-agent6-packet=')) parsed.usageAgent6Packet = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--smoke-validation=')) parsed.smokeValidation = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-concordance=')) parsed.usageConcordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-handoff-index=')) parsed.usageHandoffIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
