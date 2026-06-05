#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const paths = {
  sparkQueue: 'data/control/spark_standing_queue.json',
  goalBoard: 'data/control/agent_goal_board.json',
  custodyIndex: 'reports/agent3-returned-spark-artifact-custody-index-2026-06-04.json',
  activeHandoff: 'reports/agent3-active-workset-handoff-index-2026-06-04.json',
  nextBlocker: 'reports/agent3-next-deterministic-matrix-workset-blocker-2026-06-04.json',
  driftAudit: 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json',
  outputJson: 'reports/agent3-post-custody-wake-condition-audit-2026-06-04.json',
  outputMarkdown: 'reports/agent3-post-custody-wake-condition-audit-2026-06-04.md',
};

const queue = readJson(paths.sparkQueue);
const goalBoard = readJson(paths.goalBoard);
const custody = readJson(paths.custodyIndex);
const handoff = readJson(paths.activeHandoff);
const blocker = readJson(paths.nextBlocker);
const drift = readJson(paths.driftAudit);

const candidateScan = scanCandidateFiles();
const queueItems = [
  queueItem('spark3-broad-linkage-dedupe-navigation'),
  queueItem('spark-oracle9-missed-dictionary-evidence-diff'),
  queueItem('spark5plus-continuation-dedupe'),
  queueItem('spark10-hybrid-floor-release-relevance-shadow'),
].filter(Boolean);

const agent3Goal = (goalBoard.goals || []).find((entry) => entry.id === 'agent3-broad-linkage-dedupe-navigation')
  || (goalBoard.goals || []).find((entry) => entry.id === 'agent3-definition-occurrence-links')
  || null;

const agent10Shadow = queueItems.find(
  (entry) => entry.id === 'spark10-hybrid-floor-release-relevance-shadow' && entry.exists === true,
);
const agent3RunnableQueueItems = queueItems.filter((entry) => entry.agent3_runnable_now);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_post_custody_wake_condition_audit',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: agent3RunnableQueueItems.length ? 'agent3_runnable_workset_found' : 'no_new_agent3_executable_workset_after_custody_index',
  target: 'Post-custody current wake-condition audit for Agent 3 linkage/dedupe/navigation/source-route lane.',
  files: {
    input_files: [
      paths.sparkQueue,
      paths.goalBoard,
      paths.custodyIndex,
      paths.activeHandoff,
      paths.nextBlocker,
      paths.driftAudit,
    ],
    output_json: paths.outputJson,
    output_markdown: paths.outputMarkdown,
  },
  exact_command_or_script_to_write_or_run: 'node scripts/build_agent3_post_custody_wake_condition_audit.mjs',
  schema_counts: {
    returned_artifacts_indexed: Number(custody.schema_counts.returned_artifacts_indexed || 0),
    returned_artifacts_consumed: Number(custody.schema_counts.returned_artifacts_consumed || 0),
    unconsumed_returned_artifacts: Number(custody.schema_counts.unconsumed_returned_artifacts || 0),
    active_worksets_indexed: Number(handoff.schema_counts.worksets_indexed || 0),
    total_rows: Number(handoff.schema_counts.total_rows || 0),
    total_occurrences: Number(handoff.schema_counts.total_occurrences || 0),
    blocker_rows: Number(handoff.schema_counts.blocker_rows || 0),
    blocker_occurrences: Number(handoff.schema_counts.blocker_occurrences || 0),
    queue_items_checked: queueItems.length,
    agent3_runnable_queue_items: agent3RunnableQueueItems.length,
    agent10_handoff_items_observed: agent10Shadow ? 1 : 0,
    candidate_files_scanned: candidateScan.scanned,
    candidate_files_modified_after_custody_index: candidateScan.modifiedAfterCustody.length,
    changed_artifacts_found: Number(blocker.schema_counts.changed_artifacts_found || 0),
    exact_new_worksets_found: Number(blocker.schema_counts.exact_new_worksets_found || 0),
    matrix_substantive_changed_files: Number(drift.counts.substantive_changed_files || 0),
    new_matrix_rows: 0,
    new_matrix_occurrences: 0,
    route_publication_support_rows: 0,
    definition_authority_rows: 0,
    usage_as_definition_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutations: 0,
  },
  queue_observations: queueItems,
  file_delta_scan: {
    custody_index_path: paths.custodyIndex,
    custody_index_mtime_iso: new Date(fs.statSync(path.join(root, paths.custodyIndex)).mtimeMs).toISOString(),
    scanned_patterns: [
      'reports/agent3-*linkage|dedupe|source-route|custody|workset*',
      'reports/spark3-*',
      'reports/spark1-deuteronomy-*',
      'reports/spark10-orot-169-*',
    ],
    ignored_outputs: [paths.outputJson, paths.outputMarkdown, 'reports/agent3-state.json', 'reports/agent3-state.md'],
    modified_after_custody_index: candidateScan.modifiedAfterCustody,
  },
  active_handoff: {
    artifact: paths.activeHandoff,
    status: handoff.status,
    rows: Number(handoff.schema_counts.total_rows || 0),
    occurrences: Number(handoff.schema_counts.total_occurrences || 0),
    blocker_rows: Number(handoff.schema_counts.blocker_rows || 0),
    blocker_occurrences: Number(handoff.schema_counts.blocker_occurrences || 0),
  },
  current_blocker: {
    artifact: paths.nextBlocker,
    blocker: blocker.missing_field_blocker?.blocker || custody.current_blocker?.blocker,
    changed_artifacts_found: Number(blocker.schema_counts.changed_artifacts_found || 0),
    exact_new_worksets_found: Number(blocker.schema_counts.exact_new_worksets_found || 0),
    wake_condition: blocker.missing_field_blocker?.wake_condition || custody.current_blocker?.wake_condition,
  },
  agent10_handoff_observed: agent10Shadow
    ? {
        queue_item: agent10Shadow.id,
        status: agent10Shadow.status,
        package_owner: 'Agent 10',
        agent3_input_paths: agent10Shadow.inputs.filter((input) => input.includes('agent3-')),
        disposition: 'handoff_observed_not_agent3_runnable_workset',
      }
    : null,
  agent3_goal_observation: agent3Goal
    ? {
        id: agent3Goal.id,
        status: agent3Goal.status || null,
        latest_spark_artifact: agent3Goal.latest_spark_artifact || null,
        next_action: agent3Goal.next_action || null,
      }
    : null,
  validator: 'node scripts/validate_agent3_post_custody_wake_condition_audit.mjs',
  missing_field_blocker: {
    blocker: 'missing_changed_artifact_or_exact_workset',
    missing_fields: [
      'changed_artifact_path_or_exact_workset_id',
      'target_rows_and_occurrences_for_new_matrix',
      'route_card_or_source_route_input_set',
      'output_path_and_schema_for_new_matrix',
      'validator_or_gate_for_new_matrix',
      'handoff_trigger_for_agent10_release_package_intake',
      'stop_condition_for_new_matrix_run',
    ],
  },
  handoff_owner: 'Agent 10 for release/package intake planning; Agent 6 only by exact boundary packet prepared through release owner.',
  stop_condition: 'Stop after current wake-condition audit because no new Agent 3 executable workset is present.',
  boundary: {
    source_license_acceptance: false,
    qa_acceptance: false,
    definition_authority: false,
    usage_as_definition_authority: false,
    answer_selection: false,
    route_publication_support: false,
    public_runtime_acceptance: false,
    publication_readiness: false,
    product_data_acceptance: false,
    accepted_gloss_text: false,
    public_runtime_mutation: false,
  },
};

writeJson(paths.outputJson, artifact);
writeMarkdown(paths.outputMarkdown, artifact);

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMarkdown}`);
console.log(`Agent 3 post-custody wake audit: runnable ${artifact.schema_counts.agent3_runnable_queue_items}; file deltas ${artifact.schema_counts.candidate_files_modified_after_custody_index}; new worksets ${artifact.schema_counts.exact_new_worksets_found}`);

function queueItem(id) {
  const item = (queue.items || []).find((entry) => entry.id === id);
  if (!item) {
    return {
      id,
      exists: false,
      status: null,
      package_owners: [],
      returned_artifact: null,
      expected_output: null,
      has_pipeline_commands: false,
      pipeline_command_count: 0,
      agent3_runnable_now: false,
      disposition: 'missing_queue_row',
      wake_condition: 'No current queue item with this id; wake only with an exact changed artifact or exact workset contract.',
      inputs: [],
    };
  }
  const packageOwners = item.package_owners || [];
  const hasPipelineCommands = Array.isArray(item.pipeline_commands) && item.pipeline_commands.length > 0;
  const isAgent3Owned = packageOwners.includes('Agent 3');
  const agent3RunnableNow = isAgent3Owned
    && hasPipelineCommands
    && !String(item.status || '').includes('returned_')
    && !String(item.status || '').includes('sleep')
    && !String(item.status || '').includes('missing');
  return {
    id: item.id,
    exists: true,
    status: item.status || null,
    package_owners: packageOwners,
    returned_artifact: item.returned_artifact || null,
    expected_output: item.expected_output || null,
    has_pipeline_commands: hasPipelineCommands,
    pipeline_command_count: hasPipelineCommands ? item.pipeline_commands.length : 0,
    agent3_runnable_now: agent3RunnableNow,
    disposition: dispositionFor(item, isAgent3Owned, hasPipelineCommands, agent3RunnableNow),
    wake_condition: item.wake_condition || item.blocker_if_not_seeded || null,
    inputs: item.inputs || [],
  };
}

function dispositionFor(item, isAgent3Owned, hasPipelineCommands, runnable) {
  if (runnable) return 'agent3_runnable_workset';
  if (item.id === 'spark10-hybrid-floor-release-relevance-shadow') return 'agent10_owned_handoff_not_agent3_runnable';
  if (String(item.status || '').includes('returned_no_blocker_no_queued_item')) return 'returned_consumed_sleep_until_exact_workset';
  if (!hasPipelineCommands) return 'missing_pipeline_commands_or_schema';
  if (!isAgent3Owned) return 'not_agent3_package_owner';
  return 'not_agent3_runnable_now';
}

function scanCandidateFiles() {
  const custodyMtime = fs.statSync(path.join(root, paths.custodyIndex)).mtimeMs;
  const ignored = new Set([
    paths.outputJson,
    paths.outputMarkdown,
    'reports/agent3-state.json',
    'reports/agent3-state.md',
  ]);
  const pattern = /^(agent3-.*(linkage|dedupe|source-route|custody|workset|returned-spark|active-workset|next-deterministic)|spark3-|spark1-deuteronomy-|spark10-orot-169-)/;
  const entries = fs.readdirSync(path.join(root, 'reports'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => `reports/${entry.name}`)
    .sort();
  const modifiedAfterCustody = entries
    .filter((entryPath) => !ignored.has(entryPath))
    .filter((entryPath) => fs.statSync(path.join(root, entryPath)).mtimeMs > custodyMtime)
    .map((entryPath) => ({
      path: entryPath,
      mtime_iso: new Date(fs.statSync(path.join(root, entryPath)).mtimeMs).toISOString(),
      sha256: sha256File(entryPath),
    }));
  return {
    scanned: entries.length,
    modifiedAfterCustody,
  };
}

function writeMarkdown(filePath, data) {
  const lines = [
    '# Agent 3 Post-Custody Wake Condition Audit - 2026-06-04',
    '',
    `- Status: \`${data.status}\``,
    `- Returned artifacts consumed: ${data.schema_counts.returned_artifacts_consumed}/${data.schema_counts.returned_artifacts_indexed}`,
    `- Agent 3 runnable queue items: ${data.schema_counts.agent3_runnable_queue_items}`,
    `- Candidate files modified after custody index: ${data.schema_counts.candidate_files_modified_after_custody_index}`,
    `- Exact new worksets found: ${data.schema_counts.exact_new_worksets_found}`,
    `- Active rows / occurrences: ${data.schema_counts.total_rows} / ${data.schema_counts.total_occurrences}`,
    `- Blocker rows / occurrences: ${data.schema_counts.blocker_rows} / ${data.schema_counts.blocker_occurrences}`,
    '',
    '## Queue Observations',
    '',
    '| Queue item | Status | Owners | Pipeline commands | Disposition |',
    '| --- | --- | --- | ---: | --- |',
    ...data.queue_observations.map((entry) => `| \`${entry.id}\` | \`${entry.status}\` | ${entry.package_owners.join(', ') || 'none'} | ${entry.pipeline_command_count} | \`${entry.disposition}\` |`),
    '',
    '## Agent 10 Handoff',
    '',
    data.agent10_handoff_observed
      ? `- Observed \`${data.agent10_handoff_observed.queue_item}\` as Agent 10-owned handoff using ${data.agent10_handoff_observed.agent3_input_paths.length} Agent 3 input path(s), not an Agent 3 runnable workset.`
      : '- No Agent 10 handoff item observed.',
    '',
    '## Current Blocker',
    '',
    `- Blocker: \`${data.current_blocker.blocker}\``,
    `- Wake condition: ${data.current_blocker.wake_condition}`,
    '',
    '## Boundary',
    '',
    'This audit is Agent 3 linkage/dedupe/navigation planning evidence only. It does not create QA acceptance, source/license acceptance, Definition authority, usage-as-definition authority, answer selection, route publication support, public/runtime acceptance, publication readiness, product/data acceptance, accepted gloss/text, or public/runtime mutation.',
  ];
  writeText(filePath, `${lines.join('\n')}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8'));
}

function writeJson(filePath, data) {
  writeText(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  const absolutePath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, text);
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, filePath))).digest('hex');
}
