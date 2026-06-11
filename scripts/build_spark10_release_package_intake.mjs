#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const contractPath = cleanRelativePath(args.contract || 'reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json');
const contract = readJson(contractPath);

if (contract.artifact_type !== 'spark10_release_package_intake_pipeline_contract') {
  throw new Error(`Unexpected contract artifact_type: ${contract.artifact_type}`);
}

const rows = [];
for (const input of contract.inputs || []) {
  const inputPath = cleanRelativePath(input.path);
  const absolutePath = path.join(root, inputPath);
  const exists = fs.existsSync(absolutePath);
  const row = {
    path: inputPath,
    lane_owner: input.lane_owner || 'unknown',
    required: input.required !== false,
    exists,
    sha256: exists ? sha256(inputPath) : null,
    artifact_type: null,
    status: null,
    rows: null,
    occurrences: null,
    release_relevance_hint: input.release_relevance_hint || 'unspecified',
    blocker_class: exists ? 'none_detected_by_intake' : 'missing_input_blocker',
    agent6_handoff_needed: false,
    next_agent10_action: exists ? 'inspect_if_release_relevant' : 'missing_input_blocker',
    notes: input.notes || '',
  };

  if (exists && inputPath.endsWith('.json')) {
    try {
      const json = readJson(inputPath);
      row.artifact_type = json.artifact_type || null;
      row.status = json.status || json.disposition || json.current_standing_status || json.summary?.status || json.boundary?.status || null;
      const counts = json.counts || json.summary || json.current_non_public_orot_package_counts || json.measured_scope || {};
      row.rows = firstInteger(
        counts.rows,
        counts.placeholder_rows,
        counts.candidate_rows,
        counts.candidate_patch_rows,
        counts.missing_lexicon_linkage_rows,
        counts.nc_educational_candidate_rows,
        counts.input_rows,
      );
      row.occurrences = firstInteger(
        counts.occurrences,
        counts.placeholder_occurrences,
        counts.candidate_occurrences,
        counts.candidate_patch_occurrences,
        counts.missing_lexicon_linkage_occurrences,
        counts.nc_educational_candidate_occurrences,
      );
      if (hasNonZeroMutation(counts, json.boundary)) {
        row.blocker_class = 'unexpected_mutation_counter_or_boundary';
        row.next_agent10_action = 'hold_and_request_owner_review';
      }
    } catch (error) {
      row.blocker_class = 'json_parse_blocker';
      row.next_agent10_action = 'missing_or_invalid_input_blocker';
      row.notes = `${row.notes ? `${row.notes}; ` : ''}${error.message}`;
    }
  } else if (exists) {
    const text = fs.readFileSync(absolutePath, 'utf8');
    row.status = extractTextField(text, ['status', 'standing_status', 'Disposition', 'Status']);
    row.artifact_type = extractHeading(text);
    row.blocker_class = inferBlockerClass(text);
    row.agent6_handoff_needed = /Agent6-ready|Agent-6-Ready|Current Agent 6 boundary need:\s*`route_|Agent 6 route requested|requested Agent 6 route|route Agent 6 now/i.test(text);
    if (/^reports\/agent10-orot-current-goal-audit-|^reports\/agent6-.*(?:verdict|receipt)-/i.test(inputPath)) {
      row.agent6_handoff_needed = false;
    }
    row.next_agent10_action = inferNextAction(text, row.blocker_class, row.agent6_handoff_needed);
  }

  if (typeof input.agent6_handoff_needed === 'boolean') {
    row.agent6_handoff_needed = input.agent6_handoff_needed;
    row.next_agent10_action = inferNextAction('', row.blocker_class, row.agent6_handoff_needed);
  }

  if (row.agent6_handoff_needed && !isDirectAgent6HandoffPacket(row)) {
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'inspect_if_release_relevant';
  }

  if (input.lane_owner === 'Agent 12' || /^control_cap/.test(String(input.release_relevance_hint || ''))) {
    row.blocker_class = 'none_detected_by_intake';
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'inspect_if_release_relevant';
  }

  if (/historical.*Spark-1|assistant-1\/Spark-1 remains paused|historical_source_lane_status_paused/i.test(`${row.notes} ${row.release_relevance_hint}`)) {
    row.blocker_class = 'none_detected_by_intake';
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'inspect_if_release_relevant';
  }

  if (/agent10-direct-release-package-goal-state/.test(row.path)) {
    row.blocker_class = 'none_detected_by_intake';
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'inspect_if_release_relevant';
  }

  if (row.status === 'evidence_ready_control_drift_refresh' || /agent3-current-control-drift-refresh/.test(row.path)) {
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'inspect_if_release_relevant';
  }

  if (/spark3-standing-goal-mode-status/.test(row.path)) {
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'inspect_if_release_relevant';
  }

  if (/agent3-spark3-oracle9-missed-dictionary-evidence-diff-blocker/.test(row.path)) {
    row.agent6_handoff_needed = false;
    if (row.path.endsWith('.json')) {
      row.blocker_class = 'pipeline_contract_blocker';
      row.next_agent10_action = 'inspect_if_release_relevant';
    } else {
      row.next_agent10_action = 'inspect_if_release_relevant';
    }
  }

  if (/superseded delivery blocker/i.test(`${row.notes} ${row.status || ''}`)) {
    row.agent6_handoff_needed = false;
    row.next_agent10_action = inferNextAction('', row.blocker_class, false);
  }

  if (/agent6_delivered_boundary_packet_awaiting_verdict/i.test(String(input.release_relevance_hint || ''))) {
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'await_agent6_verdict_or_exact_blocker';
  }

  if (/consumption/i.test(row.path)) {
    row.agent6_handoff_needed = false;
    if (row.next_agent10_action === 'route_exact_contract_or_missing_field_blocker') {
      row.next_agent10_action = 'inspect_if_release_relevant';
    }
  }

  if (/agent4_orot_205_validator_prereq_blocker/i.test(String(input.release_relevance_hint || ''))) {
    row.agent6_handoff_needed = false;
    row.next_agent10_action = 'hold_until_exact_command_list_or_changed_contract';
  }

  rows.push(row);
}

const missingRequiredInputs = rows.filter((row) => row.required && !row.exists);
const agent6Candidates = rows.filter((row) => row.agent6_handoff_needed);
const releaseRelevantRows = rows.filter((row) => row.release_relevance_hint === 'release_relevant' || row.agent6_handoff_needed);

const matrix = {
  schema_version: 1,
  artifact_type: 'spark10_release_package_intake_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_spark10_release_package_intake.mjs',
  contract_path: contractPath,
  active_mode: contract.active_mode,
  spark_thread_id: contract.spark_thread_id,
  spark_capacity_status: contract.spark_capacity_status || 'historical_support_only',
  boundary: contract.boundary,
  summary: {
    inputs_checked: rows.length,
    missing_required_inputs: missingRequiredInputs.length,
    release_relevant_rows: releaseRelevantRows.length,
    agent6_handoff_candidates: agent6Candidates.length,
    public_runtime_mutation_authorized: false,
    answer_definition_release_authorized: false,
  },
  rows,
  agent6_handoff_condition: contract.agent6_handoff_condition,
  stop_condition: contract.stop_condition,
  forbidden_claims: contract.forbidden_claims,
};

const outputJson = cleanRelativePath(contract.output?.json || 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json');
const outputMd = cleanRelativePath(contract.output?.md || 'reports/spark10-release-package-intake-matrix-current-2026-06-04.md');
fs.writeFileSync(path.join(root, outputJson), `${JSON.stringify(matrix, null, 2)}\n`);
fs.writeFileSync(path.join(root, outputMd), buildReport(matrix));

console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);
console.log(`inputs checked: ${rows.length}`);
console.log(`missing required inputs: ${missingRequiredInputs.length}`);

function parseArgs(argv) {
  const parsed = {};
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) parsed[match[1]] = match[2];
  }
  return parsed;
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

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function firstInteger(...values) {
  for (const value of values) {
    if (Number.isInteger(value)) return value;
  }
  return null;
}

function hasNonZeroMutation(counts, boundary) {
  const mutationKeys = [
    'public_hud_rows',
    'route_jsonl_rows',
    'route_shard_writes',
    'answer_rows',
    'definition_content_rows',
    'nc_definition_content_rows',
    'accepted_text_rows',
  ];
  for (const key of mutationKeys) {
    if (Number(counts?.[key] || 0) !== 0) return true;
  }
  if (boundary && typeof boundary === 'object') {
    for (const key of ['no_public_mutation', 'no_route_shard_writes', 'no_answer_eligibility', 'no_accepted_text']) {
      if (key in boundary && boundary[key] !== true) return true;
    }
  }
  return false;
}

function extractTextField(text, fields) {
  for (const field of fields) {
    const pattern = '^[-*]?\\s*' + escapeRegExp(field) + '\\s*[:=]\\s*`?([^\\n`]+)`?';
    const match = new RegExp(pattern, 'im').exec(text);
    if (match) return match[1].trim();
  }
  return null;
}

function extractHeading(text) {
  const match = /^#\s+(.+)$/m.exec(text);
  return match ? match[1].trim() : null;
}

function inferBlockerClass(text) {
  if (/Status:\s*`?pipeline_contract_runnable_validated`?|status["']?\s*:\s*["']pipeline_contract_runnable_validated/i.test(text)) return 'none_detected_by_intake';
  if (/runnable_contract_for_first_target|Blocker\s*\n-\s*none|blocker:\s*none/i.test(text)) return 'none_detected_by_intake';
  if (/pipeline_runnable_with_zero_candidate_closure_on_current_inputs/i.test(text)) return 'zero_candidate_closure';
  if (/contracts_1_2_runnable_validated__contract_3_missing_workset_blocker/i.test(text)) return 'partial_runnable_contracts_with_future_workset_blocker';
  if (/missing[_ -]pipeline[_ -]blocker|missing_script_blocker|missing_validator_blocker|missing_agent2_owned_builder/i.test(text)) return 'missing_pipeline_blocker';
  if (/replacement_blocker|awaiting_pipeline_contract|complete_pipeline_contract:\s*`?false/i.test(text)) return 'pipeline_contract_blocker';
  if (/blocked_no_render/i.test(text)) return 'blocked_no_render';
  if (/WARN-ACCEPTED|WARN_ACCEPTED/i.test(text)) return 'warn_accepted_evidence_only';
  return 'none_detected_by_intake';
}

function inferNextAction(text, blockerClass, agent6HandoffNeeded) {
  if (/evidence_ready_control_drift_refresh/i.test(text)) return 'inspect_if_release_relevant';
  if (/not_complete_current_frontier_recorded/i.test(text)) return 'hold_until_changed_inputs_or_new_target';
  if (/ready_contracts_exhausted|awaiting_contract_component_or_wake/i.test(text)) return 'hold_until_changed_inputs_or_new_target';
  if (blockerClass === 'zero_candidate_closure') return 'hold_until_changed_inputs_or_new_target';
  if (blockerClass === 'partial_runnable_contracts_with_future_workset_blocker') return 'consume_spark1_run_or_route_future_workset';
  if (blockerClass === 'missing_pipeline_blocker' || blockerClass === 'pipeline_contract_blocker') return 'route_exact_contract_or_missing_field_blocker';
  if (agent6HandoffNeeded) return 'prepare_or_route_agent6_boundary_only_if_exact_package_exists';
  if (/no direct Agent 10|No Agent 10|no release mutation|No release/i.test(text)) return 'hold_no_release_mutation';
  return 'inspect_if_release_relevant';
}

function isDirectAgent6HandoffPacket(row) {
  if (/^reports\/agent10-agent6-ready-.*\.(?:json|md)$/i.test(row.path)) return true;
  if (/^data\/definitions\/definition-workbench-usage-(?:queue-ready-packet|agent6-packet)\.json$/i.test(row.path)) return true;
  if (/agent10_agent6_ready_boundary_packet|definition_workbench_usage_(?:queue_ready_packet|agent6_packet)/i.test(String(row.artifact_type || ''))) return true;
  return false;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildReport(matrix) {
  const rows = matrix.rows.map((row) => (
    `| \`${escapeMd(row.path)}\` | ${escapeMd(row.lane_owner)} | ${row.exists ? 'yes' : 'no'} | ${escapeMd(row.status || '')} | ${escapeMd(row.blocker_class)} | ${escapeMd(row.next_agent10_action)} |`
  )).join('\n');
  return `# Agent 10 Direct Release Package Intake Matrix\n\n` +
    `Note: this file keeps the historical Spark-10-named path for compatibility, but it is local Agent 10 release/package intake evidence. Spark/assistant lanes are not active capacity unless owner explicitly re-enables a repaired lane.\n\n` +
    `Generated: ${matrix.generated_at}\n\n` +
    `Contract: \`${matrix.contract_path}\`\n\n` +
    `## Summary\n\n` +
    `- Inputs checked: \`${matrix.summary.inputs_checked}\`\n` +
    `- Missing required inputs: \`${matrix.summary.missing_required_inputs}\`\n` +
    `- Release-relevant rows: \`${matrix.summary.release_relevant_rows}\`\n` +
    `- Agent 6 handoff candidates: \`${matrix.summary.agent6_handoff_candidates}\`\n` +
    `- Public/runtime mutation authorized: \`false\`\n` +
    `- Answer/definition/release authorized: \`false\`\n\n` +
    `## Matrix\n\n` +
    `| path | lane owner | exists | status | blocker class | next Agent 10 action |\n` +
    `| --- | --- | --- | --- | --- | --- |\n` +
    `${rows}\n\n` +
    `## Stop Condition\n\n${matrix.stop_condition}\n\n` +
    `## Not Accepted\n\n${matrix.forbidden_claims.join('; ')}.\n`;
}

function escapeMd(value) {
  return String(value).replace(/\|/g, '\\|');
}
