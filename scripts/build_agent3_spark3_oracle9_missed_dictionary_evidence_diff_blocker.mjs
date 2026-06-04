#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const inputs = {
  spark_standing_queue_json: 'data/control/spark_standing_queue.json',
  spark3_status_md: 'reports/spark3-standing-goal-mode-status-2026-06-04.md',
  spark1_status_md: 'reports/spark1-standing-goal-mode-status-2026-06-04.md',
  oracle9_owner_pulse_0410_md: 'reports/oracle9-owner-pulse-2026-06-03-0410Z.md',
  oracle9_owner_pulse_1039_md: 'reports/oracle9-owner-pulse-2026-06-03-1039Z.md',
  agent2_missed_dictionary_json: 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json',
  agent2_missed_dictionary_md: 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md',
  agent10_zero_candidate_consumption_json:
    'reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.json',
  agent10_zero_candidate_consumption_md:
    'reports/agent10-agent2-orot-missed-dictionary-zero-candidate-consumption-2026-06-04.md',
  agent3_frontier_checkpoint_json: 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json',
};

const queueItemId = 'spark-oracle9-missed-dictionary-evidence-diff';
const outputJson = 'reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.json';
const outputMd = 'reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const queue = readJson(inputs.spark_standing_queue_json);
const queueItem = (queue.items || []).find((item) => item.id === queueItemId);
if (!queueItem) throw new Error(`Missing queue item: ${queueItemId}`);

const agent2Missed = readJson(inputs.agent2_missed_dictionary_json);
const agent10Consumption = readJson(inputs.agent10_zero_candidate_consumption_json);
const frontier = readJson(inputs.agent3_frontier_checkpoint_json);
const queueInputStatuses = (queueItem.inputs || []).map((inputPath) => ({
  path: inputPath,
  exists: fs.existsSync(resolve(inputPath)),
  sha256: fs.existsSync(resolve(inputPath)) ? sha256(fs.readFileSync(resolve(inputPath))) : null,
  bytes: fs.existsSync(resolve(inputPath)) ? fs.statSync(resolve(inputPath)).size : 0,
}));
const zeroOutputCounts = agent10Consumption.zero_output_counts || {};

const missingContractFields = [
  !Array.isArray(queueItem.pipeline_commands) || queueItem.pipeline_commands.length === 0
    ? 'pipeline_commands'
    : null,
  !queueItem.output_path && !queueItem.output_schema ? 'output_path_schema' : null,
  !queueItem.validator_command && !queueItem.validator ? 'validator_gate' : null,
  !queueItem.command && !queueItem.command_script ? 'command_script_invocation' : null,
].filter(Boolean);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark3_oracle9_missed_dictionary_evidence_diff_blocker',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'missing_pipeline_blocker',
  blocker_id: `${queueItemId}_missing_pipeline_contract`,
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  queue_item_observed: {
    id: queueItem.id,
    status: queueItem.status,
    objective: queueItem.objective,
    spark_affinity: queueItem.spark_affinity || [],
    package_owners: queueItem.package_owners || [],
    first_consumer: queueItem.first_consumer || null,
    stop_condition: queueItem.stop_condition || null,
    pipeline_rule: queueItem.pipeline_rule || null,
    boundary: queueItem.boundary || null,
    inputs: queueInputStatuses,
    inputs_present: queueInputStatuses.filter((entry) => entry.exists).length,
    inputs_expected: queueInputStatuses.length,
  },
  spark3_status_observed: {
    path: inputs.spark3_status_md,
    status: 'awaiting_pipeline_contract',
    observed_affinity_target: queueItemId,
    observed_blocker: 'missing_pipeline_contract',
  },
  runnable_contract_check: {
    complete_pipeline_contract: false,
    runnable_by_spark3: false,
    no_pipeline_invention: true,
    missing_contract_fields: missingContractFields,
    exact_blocker:
      'Queue item supplies source evidence inputs but does not supply pipeline_commands, output path/schema, validator/gate, or command/script invocation for Spark-3 execution.',
  },
  current_missed_dictionary_state: {
    agent2_artifact: inputs.agent2_missed_dictionary_json,
    agent2_artifact_type: agent2Missed.artifact_type,
    candidate_rows: agent2Missed.summary?.candidate_rows,
    candidate_occurrences: agent2Missed.summary?.candidate_occurrences,
    commercial_clean_candidate_rows: agent2Missed.summary?.commercial_clean_candidate_rows,
    commercial_clean_candidate_occurrences: agent2Missed.summary?.commercial_clean_candidate_occurrences,
    noncommercial_educational_candidate_rows: agent2Missed.summary?.noncommercial_educational_candidate_rows,
    noncommercial_educational_candidate_occurrences: agent2Missed.summary?.noncommercial_educational_candidate_occurrences,
    unmatched_rows: agent2Missed.summary?.unmatched_rows,
    rows_added_now: agent2Missed.summary?.rows_added_now,
    rows_cleared_by_agent6_now: agent2Missed.summary?.rows_cleared_by_agent6_now,
    source_license_counts: agent2Missed.source_license_counts || {},
  },
  agent10_consumption_observed: {
    path: inputs.agent10_zero_candidate_consumption_json,
    artifact_type: agent10Consumption.artifact_type,
    status: agent10Consumption.status,
    zero_output_counts: zeroOutputCounts,
  },
  agent3_frontier_observed: {
    path: inputs.agent3_frontier_checkpoint_json,
    status: frontier.status,
    publication_state: frontier.publication_state,
    existing_orot_missing_linkage_rows: frontier.external_lane_observed_only?.agent1_orot_missing_linkage_rows ?? null,
    existing_orot_missing_linkage_occurrences:
      frontier.external_lane_observed_only?.agent1_orot_missing_linkage_occurrences ?? null,
  },
  counts: {
    queue_inputs_expected: queueInputStatuses.length,
    queue_inputs_present: queueInputStatuses.filter((entry) => entry.exists).length,
    missing_contract_fields: missingContractFields.length,
    candidate_rows: agent2Missed.summary?.candidate_rows,
    candidate_occurrences: agent2Missed.summary?.candidate_occurrences,
    unmatched_rows: agent2Missed.summary?.unmatched_rows,
    rows_added_now: agent2Missed.summary?.rows_added_now,
    rows_cleared_by_agent6_now: agent2Missed.summary?.rows_cleared_by_agent6_now,
    zero_output_counter_sum: sum(Object.values(zeroOutputCounts)),
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
      'Spark-3 Oracle9 missed-dictionary evidence-diff item is input-present but not runnable because no complete execution contract is supplied.',
    next_action:
      'Author or supply an exact Agent3/Spark-3 command packet with pipeline_commands, output path/schema, validator/gate, package owner, Agent 6 boundary trigger, and stop condition before Spark-3 execution.',
    executable_workset_created: false,
    duplicate_package_created: false,
  },
  boundary: zeroBoundary(),
  validation_commands: [
    'node scripts/validate_agent3_spark3_oracle9_missed_dictionary_evidence_diff_blocker.mjs',
    'git diff --check -- reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.json reports/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker-2026-06-04.md scripts/build_agent3_spark3_oracle9_missed_dictionary_evidence_diff_blocker.mjs scripts/validate_agent3_spark3_oracle9_missed_dictionary_evidence_diff_blocker.mjs reports/agent3-state.md',
  ],
  what_remains_blocked: [
    'No Spark-3 execution is allowed because pipeline_commands are absent.',
    'No output path/schema is supplied for the Oracle9 missed-dictionary evidence diff.',
    'No validator/gate is supplied for the Oracle9 missed-dictionary evidence diff.',
    'Current Agent2 missed-dictionary packet has 0 candidate rows / 0 candidate occurrences and 168 unmatched rows.',
    'No token-index mutation, lexical-payload mutation, route-shard write, public/runtime mutation, Definition authority, answer eligibility, or accepted text is authorized.',
  ],
};

writeJson(outputJson, artifact);
writeText(outputMd, renderMarkdown(artifact));
updateStateMarkdown(artifact);
console.log(`Wrote ${outputJson}`);
console.log(`Wrote ${outputMd}`);
console.log(`Updated ${stateMdPath}`);

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
  lines.push('# Agent 3 Spark-3 Oracle9 Missed-Dictionary Evidence-Diff Blocker - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Blocker id: \`${value.blocker_id}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Result: ${value.package_summary.result}`);
  lines.push('');
  lines.push('## Queue Item');
  lines.push('');
  lines.push(`- Queue id: \`${value.queue_item_observed.id}\``);
  lines.push(`- Queue status: \`${value.queue_item_observed.status}\``);
  lines.push(`- Inputs present / expected: \`${value.counts.queue_inputs_present}/${value.counts.queue_inputs_expected}\``);
  lines.push(`- Missing contract fields: \`${value.runnable_contract_check.missing_contract_fields.join(', ')}\``);
  lines.push(`- Runnable by Spark-3: \`${value.runnable_contract_check.runnable_by_spark3}\``);
  lines.push('');
  lines.push('## Current Missed-Dictionary State');
  lines.push('');
  lines.push(`- Agent2 packet: \`${value.current_missed_dictionary_state.agent2_artifact}\``);
  lines.push(
    `- Candidate rows / occurrences: \`${value.counts.candidate_rows}/${value.counts.candidate_occurrences}\``,
  );
  lines.push(`- Unmatched rows: \`${value.counts.unmatched_rows}\``);
  lines.push(`- Rows added now / Agent6-cleared now: \`${value.counts.rows_added_now}/${value.counts.rows_cleared_by_agent6_now}\``);
  lines.push(`- Zero output counter sum: \`${value.counts.zero_output_counter_sum}\``);
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push(
    'This is an Agent3 blocker package only. It does not create a new execution contract, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route publication support, public/runtime acceptance, publication readiness, candidate text export, accepted gloss/text, lexicon_entry_id mutation, or public reader output.',
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
    `- Queue item: \`${value.queue_item_observed.id}\``,
    `- Inputs present / expected: ${value.counts.queue_inputs_present}/${value.counts.queue_inputs_expected}`,
    `- Missing contract fields: ${value.runnable_contract_check.missing_contract_fields.join(', ')}`,
    `- Missed-dictionary candidate rows / unmatched rows: ${value.counts.candidate_rows}/${value.counts.unmatched_rows}`,
    '- Boundary: blocker evidence only; no executable workset, Definition authority, answer selection, route publication, runtime mutation, source/license acceptance, candidate text export, lexicon_entry_id mutation, or accepted text.',
    '- Next step: supply an exact Agent3/Spark-3 command packet before any Oracle9 missed-dictionary evidence-diff execution.',
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
    lexicon_entry_id_mutation: false,
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

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}
