#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = 'data/control/spark_standing_queue.json';
const activeItemId = 'spark10-hybrid-floor-release-relevance-shadow';
const inputs = {
  spark_standing_queue_json: queuePath,
  spark10_primary_status_md: 'reports/spark10-primary-agent8-13-status-2026-06-04.md',
  stale_spark10_shadow_md: 'reports/spark10-hybrid-floor-release-relevance-shadow-2026-06-04.md',
  agent1_orot_source_family_md: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md',
  agent1_orot_source_family_json: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json',
  agent3_orot_dedupe_md: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md',
  agent3_orot_dedupe_json: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
  agent6_workbench_500_verdict_md: 'reports/agent6-broad-definition-workbench-500-sample-boundary-verdict-2026-06-04.md',
};

const outputJson = 'reports/agent3-spark10-hybrid-shadow-blocker-observer-package-2026-06-04.json';
const outputMd = 'reports/agent3-spark10-hybrid-shadow-blocker-observer-package-2026-06-04.md';
const stateMdPath = 'reports/agent3-state.md';

const queue = readJson(queuePath);
const activeItem = (queue.items || []).find((item) => item.id === activeItemId);
if (!activeItem) throw new Error(`Missing queue item: ${activeItemId}`);
const inputStatuses = (activeItem.inputs || []).map((inputPath) => {
  const exists = fs.existsSync(resolve(inputPath));
  return {
    path: inputPath,
    exists,
    bytes: exists ? fs.statSync(resolve(inputPath)).size : 0,
    sha256: exists ? sha256(fs.readFileSync(resolve(inputPath))) : null,
  };
});
const missingInputs = inputStatuses.filter((input) => !input.exists);
const missingContractFields = [];
if (!Array.isArray(activeItem.pipeline_commands) || activeItem.pipeline_commands.length === 0) {
  missingContractFields.push('pipeline_commands');
}
if (!activeItem.output_schema) missingContractFields.push('output_schema');
if (!activeItem.validator_gate) missingContractFields.push('validator_gate');
const staleShadowText = fs.readFileSync(resolve(inputs.stale_spark10_shadow_md), 'utf8');
const staleShadowMissingInputClaims = [
  'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md',
  'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json',
  'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md',
  'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
  'reports/agent6-broad-definition-workbench-500-sample-boundary-verdict-2026-06-04.md',
].filter((inputPath) => staleShadowText.includes(inputPath) && fs.existsSync(resolve(inputPath)));
const primaryStatusText = fs.readFileSync(resolve(inputs.spark10_primary_status_md), 'utf8');
const primaryStatusBlocker = primaryStatusText.includes('missing_pipeline_blocker')
  ? 'missing_pipeline_blocker'
  : 'not_detected';
const orotReview = readJson(inputs.agent3_orot_dedupe_json);

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_spark10_hybrid_shadow_blocker_observer_package',
  generated_at: new Date().toISOString(),
  lane_owner: 'Agent 3',
  status: 'spark10_hybrid_shadow_missing_pipeline_contract_observed',
  publication_state: 'blocked_no_render',
  active_goal: 'ongoing Agent 3 linkage/dedupe/navigation lane',
  reviewed_inputs: manifest(inputs),
  queue_item_observed: {
    path: queuePath,
    id: activeItem.id,
    status: activeItem.status,
    objective: activeItem.objective,
    assigned_thread_id: activeItem.assigned_thread_id,
    expected_output: activeItem.expected_output,
    package_owners: activeItem.package_owners || [],
    stop_condition: activeItem.stop_condition,
    boundary: activeItem.boundary,
    inputs: inputStatuses,
    missing_inputs: missingInputs.map((input) => input.path),
    missing_contract_fields: missingContractFields,
  },
  spark10_primary_status_observed: {
    path: inputs.spark10_primary_status_md,
    blocker: primaryStatusBlocker,
    active_item: activeItemId,
    current_status_mentions_missing_contract_fields:
      primaryStatusText.includes('pipeline_commands') &&
      primaryStatusText.includes('output_schema') &&
      primaryStatusText.includes('validator_gate'),
  },
  stale_shadow_observed: {
    path: inputs.stale_spark10_shadow_md,
    status: staleShadowText.includes('missing_input_blocker') ? 'stale_missing_input_blocker_report' : 'unknown',
    now_present_paths_claimed_missing: staleShadowMissingInputClaims,
  },
  agent3_orot_dedupe_observed: {
    path: inputs.agent3_orot_dedupe_json,
    artifact_type: orotReview.artifact_type,
    status: orotReview.status,
    rows: orotReview.counts?.rows,
    occurrences: orotReview.counts?.occurrences,
    exact_blocker_rows: orotReview.counts?.exact_blocker_rows,
    exact_blocker_occurrences: orotReview.counts?.exact_blocker_occurrences,
    source_files_committed_by_package: 0,
  },
  counts: {
    queue_inputs_expected: inputStatuses.length,
    queue_inputs_present: inputStatuses.filter((input) => input.exists).length,
    queue_inputs_missing: missingInputs.length,
    missing_contract_fields: missingContractFields.length,
    stale_shadow_now_present_missing_claim_paths: staleShadowMissingInputClaims.length,
    agent3_orot_rows: orotReview.counts?.rows,
    agent3_orot_occurrences: orotReview.counts?.occurrences,
    agent3_orot_exact_blocker_rows: orotReview.counts?.exact_blocker_rows,
    agent3_orot_exact_blocker_occurrences: orotReview.counts?.exact_blocker_occurrences,
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
      'Spark10 hybrid release-relevance shadow is blocked by missing runnable pipeline contract fields, not by missing Agent3 Orot input.',
    agent3_next_action:
      'Do not invent Spark10 commands; wait for exact pipeline_commands, output_schema, validator_gate, package owner, and stop condition or a new Agent3-owned linkage/dedupe/navigation workset.',
    executable_workset_created: false,
    missing_pipeline_blocker_packaged: true,
  },
  boundary: zeroBoundary(),
  validation_commands: [
    'node scripts/validate_agent3_spark10_hybrid_shadow_blocker_observer_package.mjs',
    'git diff --check -- reports/agent3-spark10-hybrid-shadow-blocker-observer-package-2026-06-04.json reports/agent3-spark10-hybrid-shadow-blocker-observer-package-2026-06-04.md scripts/build_agent3_spark10_hybrid_shadow_blocker_observer_package.mjs scripts/validate_agent3_spark10_hybrid_shadow_blocker_observer_package.mjs reports/agent3-state.md',
  ],
  what_remains_blocked: [
    'Spark10 hybrid shadow queue item lacks pipeline_commands, output_schema, and validator_gate.',
    'Existing Spark10 hybrid shadow report is stale relative to current queue inputs and remains evidence only.',
    'No Agent3 executable linkage/dedupe/navigation workset is created here.',
    'Agent3 Orot source matrix remains working-tree generated_at drift and is not committed here.',
    'No publication, Definition authority, answer eligibility, source/license acceptance, runtime mutation, route publication support, or accepted text is authorized.',
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
  lines.push('# Agent 3 Spark10 Hybrid Shadow Blocker Observer Package - 2026-06-04');
  lines.push('');
  lines.push('## Status');
  lines.push('');
  lines.push(`- Artifact: \`${outputJson}\``);
  lines.push(`- Status: \`${value.status}\``);
  lines.push(`- Publication state: \`${value.publication_state}\``);
  lines.push(`- Lane owner: \`${value.lane_owner}\``);
  lines.push(`- Result: ${value.package_summary.result}`);
  lines.push('');
  lines.push('## Queue Item');
  lines.push('');
  lines.push(`- Queue: \`${queuePath}\``);
  lines.push(`- Item: \`${value.queue_item_observed.id}\``);
  lines.push(`- Status: \`${value.queue_item_observed.status}\``);
  lines.push(`- Expected output: \`${value.queue_item_observed.expected_output}\``);
  lines.push(`- Inputs present/missing: \`${value.counts.queue_inputs_present}/${value.counts.queue_inputs_missing}\``);
  lines.push(`- Missing contract fields: \`${value.queue_item_observed.missing_contract_fields.join(', ')}\``);
  lines.push('');
  lines.push('## Agent 3 Orot Input');
  lines.push('');
  lines.push(`- Path: \`${value.agent3_orot_dedupe_observed.path}\``);
  lines.push(`- Status: \`${value.agent3_orot_dedupe_observed.status}\``);
  lines.push(`- Rows / occurrences: \`${value.counts.agent3_orot_rows}/${value.counts.agent3_orot_occurrences}\``);
  lines.push(
    `- Exact blocker rows / occurrences: \`${value.counts.agent3_orot_exact_blocker_rows}/${value.counts.agent3_orot_exact_blocker_occurrences}\``,
  );
  lines.push('');
  lines.push('## Stale Shadow');
  lines.push('');
  lines.push(`- Prior shadow report: \`${value.stale_shadow_observed.path}\``);
  lines.push(`- Prior shadow status: \`${value.stale_shadow_observed.status}\``);
  lines.push(
    `- Paths now present but claimed missing by stale shadow: \`${value.counts.stale_shadow_now_present_missing_claim_paths}\``,
  );
  lines.push('');
  lines.push('## Boundary');
  lines.push('');
  lines.push(
    'This is an Agent 3 observer/blocker package only. It does not create or run a Spark10 pipeline, Agent3 executable workset, Agent6 handoff, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer eligibility, route publication support, public/runtime acceptance, publication readiness, accepted gloss/text, or public reader output.',
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
    `- Queue inputs present/missing: ${value.counts.queue_inputs_present}/${value.counts.queue_inputs_missing}`,
    `- Missing contract fields: ${value.queue_item_observed.missing_contract_fields.join(', ')}`,
    `- Agent 3 Orot rows / exact blockers: ${value.counts.agent3_orot_rows}/${value.counts.agent3_orot_exact_blocker_rows}`,
    '- Boundary: observer evidence only; no executable workset, Spark10 command invention, Definition authority, answer selection, route publication, runtime mutation, source/license acceptance, or accepted text.',
    '- Next step: wait for exact Spark10 pipeline contract fields or a new Agent3-owned linkage/dedupe/navigation workset.',
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
