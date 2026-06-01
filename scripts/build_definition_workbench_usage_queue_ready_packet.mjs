#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  usageAgent6Packet: 'data/definitions/definition-workbench-usage-agent6-packet.json',
  agent6Queue: 'data/control/agent6_validation_queue.json',
  goalBoard: 'data/control/agent_goal_board.json',
  output: 'data/definitions/definition-workbench-usage-queue-ready-packet.json',
  report: 'reports/definition-workbench-usage-queue-ready-packet.md',
};

const options = parseArgs(process.argv.slice(2));
const usagePacket = readJson(options.usageAgent6Packet);
const queue = readJson(options.agent6Queue);
const goalBoard = readJson(options.goalBoard);

if (usagePacket.artifact_type !== 'definition_workbench_usage_agent6_packet') {
  throw new Error(`${options.usageAgent6Packet} is not a Definition Workbench usage Agent 6 packet`);
}
if (queue.artifact_type !== 'agent6_validation_queue') {
  throw new Error(`${options.agent6Queue} is not an Agent 6 validation queue`);
}

const requiredQueueFields = queue.intake_rules?.required_request_fields || [];
const allowedSubmitters = queue.intake_rules?.allowed_submitters || [];
const queueEntryDraft = buildQueueEntryDraft();
const evidenceArtifacts = queueEntryDraft.evidence_artifacts;
const validatorScripts = [
  ...usagePacket.validators,
  'scripts/validate_definition_workbench_usage_queue_ready_packet.mjs',
].filter(Boolean);
const counts = buildCounts();
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_queue_ready_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_queue_ready_packet.mjs',
  lane_owner: 'Agent 3',
  target_gate: 'definition_workbench_gate',
  target_queue: options.agent6Queue,
  source_packet: options.usageAgent6Packet,
  submission_boundary: {
    queue_ready_only: true,
    control_queue_mutated: false,
    submitted_to_agent6: false,
    intended_submitter: 'Agent 5',
    agent3_does_not_submit_to_agent6_queue: true,
    worker_report_terminal_status_allowed: false,
  },
  queue_contract_snapshot: {
    required_request_fields: requiredQueueFields,
    allowed_submitters: allowedSubmitters,
    publication_global_status: queue.publication_global_status || null,
  },
  goal_board_snapshot: {
    goal_id: 'agent3-definition-occurrence-links',
    goal_status: getGoalStatus('agent3-definition-occurrence-links'),
    evidence_target: getGoalField('agent3-definition-occurrence-links', 'evidence_target'),
    worker_report_may_set: getGoalField('agent3-definition-occurrence-links', 'worker_report_may_set'),
    acceptance_owner: getGoalField('agent3-definition-occurrence-links', 'acceptance_owner'),
  },
  queue_entry_draft: queueEntryDraft,
  source_packet_summary: {
    status: usagePacket.quality?.status || null,
    proof_occurrence_rows: usagePacket.counts?.proof_occurrence_rows ?? null,
    proof_rows_with_source: usagePacket.counts?.proof_rows_with_source ?? null,
    proof_rows_with_work_anchor: usagePacket.counts?.proof_rows_with_work_anchor ?? null,
    proof_rows_with_context: usagePacket.counts?.proof_rows_with_context ?? null,
    proof_rows_with_license: usagePacket.counts?.proof_rows_with_license ?? null,
    proof_rows_with_version: usagePacket.counts?.proof_rows_with_version ?? null,
    proof_rows_with_route_ids: usagePacket.counts?.proof_rows_with_route_ids ?? null,
    proof_rows_with_hebrew_token: usagePacket.counts?.proof_rows_with_hebrew_token ?? null,
    proof_rows_with_hebrew_context: usagePacket.counts?.proof_rows_with_hebrew_context ?? null,
    proof_rows_with_focus_marker: usagePacket.counts?.proof_rows_with_focus_marker ?? null,
    proof_mojibake_rows: usagePacket.counts?.proof_mojibake_rows ?? null,
    route_ids: usagePacket.counts?.route_ids ?? null,
    current_sample_rows: usagePacket.counts?.current_sample_rows ?? null,
    current_sample_rows_with_usage_links: usagePacket.counts?.current_sample_rows_with_usage_links ?? null,
    usage_tokens_absent_from_current_sample: usagePacket.counts?.usage_tokens_absent_from_current_sample ?? null,
    join_rows: usagePacket.counts?.join_rows ?? null,
    projected_rows_after_seed_append: usagePacket.counts?.projected_rows_after_seed_append ?? null,
    projected_usage_link_rows: usagePacket.counts?.projected_usage_link_rows ?? null,
    reader_facing_rows: usagePacket.counts?.reader_facing_rows ?? null,
    route_payload_field_hits: usagePacket.counts?.route_payload_field_hits ?? null,
    forbidden_authority_field_hits: usagePacket.counts?.forbidden_authority_field_hits ?? null,
  },
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
console.log(`Definition Workbench usage queue-ready packet ${artifact.quality.status}; required fields ${counts.required_queue_fields_present}/${counts.required_queue_fields}; evidence artifacts ${counts.evidence_artifacts_exist}/${counts.evidence_artifacts}`);

function buildQueueEntryDraft() {
  return {
    request_id: 'agent6-definition-workbench-usage-occurrence-links',
    submitted_by: 'Agent 5',
    gate: 'definition_workbench_gate',
    scope: 'Agent 3 Definition Workbench usage/occurrence-link packet for selected nonzero seeded usage evidence',
    status: 'queue_template_not_submitted',
    priority: 2,
    evidence_artifacts: [
      options.usageAgent6Packet,
      'reports/definition-workbench-usage-agent6-packet.md',
      'data/definitions/definition-workbench-usage-link-packet.json',
      'reports/definition-workbench-usage-link-packet.md',
      'data/definitions/definition-workbench-usage-seed-queue.json',
      'reports/definition-workbench-usage-seed-queue.md',
      'data/definitions/definition-workbench-usage-join-smoke.json',
      'reports/definition-workbench-usage-join-smoke.md',
      'reports/workbench-smoke-pipeline-validation.md',
    ],
    requested_verdict: 'pass_warn_block_usage_navigation_boundary_for_definition_workbench_planning',
    claimed_boundary: 'Usage-navigation occurrence-link planning evidence only; not reviewed lexical authority, not UI acceptance, not route ranking, not semantic arbitration, not publication support, and not accepted translation text.',
    known_risks: [
      'current 200-row Definition Workbench sample has 0 current usage links for the selected Agent 3 usage token scope',
      'selected usage evidence is concentrated on one route ID and must not be treated as independent semantic confirmation',
      'usage evidence remains selected seeded scope, not broad corpus coverage',
      'ambiguous rows remain audit-only and are not reader-facing',
      'source/provenance acceptance outside cited occurrence rows remains blocked by the source-scope gate',
      'this artifact is queue-ready only; Agent 3 has not submitted to the Agent 6 queue',
    ],
    what_changed_since_last_agent6_ruling: 'Agent 3 produced a bounded Definition Workbench usage-link packet chain: the link packet preserves usage-only boundaries, the seed queue identifies one selected token absent from the current 200-row sample, the join smoke projects a bounded 201-row sample with 2390 usage-link rows, and the Agent 6 packet validates 12 proof occurrence rows with complete source/work/context/license/version/route-ID metadata, 12 Hebrew token rows, 12 Hebrew context rows, 12 focus-marker rows, 0 mojibake rows, 0 reader-facing rows, 0 route payload field hits, and 0 forbidden authority field hits.',
    what_must_not_be_accepted: [
      'usage rows as definitions',
      'reviewed lexical authority',
      'visible answer selection',
      'HUD or Workbench UI implementation acceptance',
      'route ranking or semantic arbitration',
      'publication readiness',
      'accepted translation text',
      'broad corpus coverage beyond selected seeded scope',
      'Agent 2 route definition payload copied into Agent 3 usage rows',
    ],
    next_agent6_action: 'If Agent 5 submits this request, validate the machine-readable packet chain and decide whether the occurrence-link evidence is acceptable as Definition Workbench planning context only.',
  };
}

function buildCounts() {
  const requiredPresent = requiredQueueFields.filter((field) => queueEntryDraft[field] !== undefined && queueEntryDraft[field] !== null && queueEntryDraft[field] !== '').length;
  return {
    required_queue_fields: requiredQueueFields.length,
    required_queue_fields_present: requiredPresent,
    evidence_artifacts: evidenceArtifacts.length,
    evidence_artifacts_exist: evidenceArtifacts.filter((artifactPath) => fs.existsSync(path.join(root, artifactPath))).length,
    validator_scripts: validatorScripts.length,
    validator_scripts_exist: validatorScripts.filter((scriptPath) => fs.existsSync(path.join(root, scriptPath))).length,
    allowed_submitters: allowedSubmitters.length,
    draft_submitter_allowed: allowedSubmitters.includes(queueEntryDraft.submitted_by) ? 1 : 0,
    source_packet_status_passed: usagePacket.quality?.status === 'passed' ? 1 : 0,
    proof_occurrence_rows: Number(usagePacket.counts?.proof_occurrence_rows || 0),
    proof_rows_with_complete_metadata: completeProofRows(),
    proof_rows_with_hebrew_token: Number(usagePacket.counts?.proof_rows_with_hebrew_token || 0),
    proof_rows_with_hebrew_context: Number(usagePacket.counts?.proof_rows_with_hebrew_context || 0),
    proof_rows_with_focus_marker: Number(usagePacket.counts?.proof_rows_with_focus_marker || 0),
    proof_mojibake_rows: Number(usagePacket.counts?.proof_mojibake_rows || 0),
    route_ids: Number(usagePacket.counts?.route_ids || 0),
    current_sample_rows_with_usage_links: Number(usagePacket.counts?.current_sample_rows_with_usage_links || 0),
    usage_tokens_absent_from_current_sample: Number(usagePacket.counts?.usage_tokens_absent_from_current_sample || 0),
    join_rows: Number(usagePacket.counts?.join_rows || 0),
    projected_usage_link_rows: Number(usagePacket.counts?.projected_usage_link_rows || 0),
    reader_facing_rows: Number(usagePacket.counts?.reader_facing_rows || 0),
    route_payload_field_hits: Number(usagePacket.counts?.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(usagePacket.counts?.forbidden_authority_field_hits || 0),
    queue_mutations: 0,
    submitted_to_agent6: 0,
  };
}

function buildChecks(counts) {
  return [
    check('queue_contract_loaded', requiredQueueFields.length > 0 && allowedSubmitters.length > 0 ? 'passed' : 'failed', `required fields ${requiredQueueFields.length}; allowed submitters ${allowedSubmitters.length}`),
    check('queue_required_fields_present', counts.required_queue_fields_present === counts.required_queue_fields ? 'passed' : 'failed', `${counts.required_queue_fields_present}/${counts.required_queue_fields}`),
    check('draft_submitter_allowed', counts.draft_submitter_allowed === 1 ? 'passed' : 'failed', `draft submitter ${queueEntryDraft.submitted_by}`),
    check('source_packet_passed', counts.source_packet_status_passed === 1 ? 'passed' : 'failed', `source packet status ${usagePacket.quality?.status || 'unknown'}`),
    check('evidence_artifacts_exist', counts.evidence_artifacts_exist === counts.evidence_artifacts ? 'passed' : 'failed', `${counts.evidence_artifacts_exist}/${counts.evidence_artifacts}`),
    check('validator_scripts_exist', counts.validator_scripts_exist === counts.validator_scripts ? 'passed' : 'failed', `${counts.validator_scripts_exist}/${counts.validator_scripts}`),
    check('proof_metadata_complete', counts.proof_occurrence_rows > 0 && counts.proof_rows_with_complete_metadata === counts.proof_occurrence_rows ? 'passed' : 'failed', `${counts.proof_rows_with_complete_metadata}/${counts.proof_occurrence_rows}`),
    check('hebrew_context_guard', counts.proof_rows_with_hebrew_token === counts.proof_occurrence_rows && counts.proof_rows_with_hebrew_context === counts.proof_occurrence_rows && counts.proof_rows_with_focus_marker === counts.proof_occurrence_rows && counts.proof_mojibake_rows === 0 ? 'passed' : 'failed', `token/context/focus/mojibake ${counts.proof_rows_with_hebrew_token}/${counts.proof_rows_with_hebrew_context}/${counts.proof_rows_with_focus_marker}/${counts.proof_mojibake_rows}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route payload hits ${counts.route_payload_field_hits}; forbidden authority hits ${counts.forbidden_authority_field_hits}`),
    check('bounded_join_visible', counts.current_sample_rows_with_usage_links === 0 && counts.usage_tokens_absent_from_current_sample > 0 && counts.join_rows > 0 && counts.projected_usage_link_rows > 0 ? 'passed' : 'failed', `current links ${counts.current_sample_rows_with_usage_links}; absent ${counts.usage_tokens_absent_from_current_sample}; join rows ${counts.join_rows}; projected links ${counts.projected_usage_link_rows}`),
    check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0 ? 'passed' : 'failed', `queue mutations ${counts.queue_mutations}; submitted ${counts.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Queue-Ready Packet',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Queue-ready only: ${artifact.submission_boundary.queue_ready_only}`,
    `- Target gate: ${artifact.target_gate}`,
    `- Intended submitter: ${artifact.submission_boundary.intended_submitter}`,
    `- Queue required fields present: ${artifact.counts.required_queue_fields_present}/${artifact.counts.required_queue_fields}`,
    `- Evidence artifacts present: ${artifact.counts.evidence_artifacts_exist}/${artifact.counts.evidence_artifacts}`,
    `- Validator scripts present: ${artifact.counts.validator_scripts_exist}/${artifact.counts.validator_scripts}`,
    `- Source packet status: ${artifact.source_packet_summary.status}`,
    `- Proof rows / complete metadata: ${artifact.counts.proof_occurrence_rows}/${artifact.counts.proof_rows_with_complete_metadata}`,
    `- Hebrew token/context/focus/mojibake rows: ${artifact.counts.proof_rows_with_hebrew_token}/${artifact.counts.proof_rows_with_hebrew_context}/${artifact.counts.proof_rows_with_focus_marker}/${artifact.counts.proof_mojibake_rows}`,
    `- Current usage links / absent seed tokens / join rows: ${artifact.counts.current_sample_rows_with_usage_links}/${artifact.counts.usage_tokens_absent_from_current_sample}/${artifact.counts.join_rows}`,
    `- Reader-facing rows / route payload hits / forbidden authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Queue Draft',
    '',
    `- Request ID: ${artifact.queue_entry_draft.request_id}`,
    `- Submitted by value for Agent 5 copy: ${artifact.queue_entry_draft.submitted_by}`,
    `- Requested verdict: ${artifact.queue_entry_draft.requested_verdict}`,
    `- Claimed boundary: ${artifact.queue_entry_draft.claimed_boundary}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Evidence Artifacts',
    '',
    ...artifact.queue_entry_draft.evidence_artifacts.map((artifactPath) => `- ${artifactPath}`),
    '',
    '## Must Not Accept',
    '',
    ...artifact.queue_entry_draft.what_must_not_be_accepted.map((claim) => `- ${claim}`),
    '',
    '## Boundary',
    '',
    'This is an Agent 3 queue-ready relay artifact only. It does not mutate Agent 6 control queues, submit a signoff request, accept Definition Workbench UI or authority, rank routes, publish translations, or make usage rows reader-facing definitions.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function completeProofRows() {
  const required = [
    'proof_rows_with_source',
    'proof_rows_with_work_anchor',
    'proof_rows_with_context',
    'proof_rows_with_license',
    'proof_rows_with_version',
    'proof_rows_with_route_ids',
  ];
  return Math.min(...required.map((key) => Number(usagePacket.counts?.[key] || 0)));
}

function getGoal(goalId) {
  return (goalBoard.goals || []).find((goal) => goal.id === goalId) || {};
}

function getGoalStatus(goalId) {
  return getGoal(goalId).status || null;
}

function getGoalField(goalId, field) {
  return getGoal(goalId)[field] ?? null;
}

function check(id, status, detail) {
  return { id, status, detail };
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--usage-agent6-packet=')) parsed.usageAgent6Packet = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--agent6-queue=')) parsed.agent6Queue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--goal-board=')) parsed.goalBoard = cleanRelativePath(valueAfterEquals(arg));
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
