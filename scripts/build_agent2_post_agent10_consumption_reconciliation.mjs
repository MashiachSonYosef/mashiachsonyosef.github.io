import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json';
const outputMd = 'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.md';

const inputs = {
  agent10_consumption: 'reports/agent10-agent2-weekly-pipeline-and-5000-token-intake-consumption-2026-06-04.json',
  current_bundle: 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
  current_manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  current_stale_scan: 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json',
  orot_zero_safe_blocker: 'reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json',
};

const agent10 = readJson(inputs.agent10_consumption);
const bundle = readJson(inputs.current_bundle);
const manifest = readJson(inputs.current_manifest);
const staleScan = readJson(inputs.current_stale_scan);
const orotBlocker = readJson(inputs.orot_zero_safe_blocker);

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_post_agent10_consumption_reconciliation',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'agent10_consumption_reconciled_current_agent2_chain_supersedes_counts',
  target: 'Reconcile latest Agent 10 Agent 2 consumption with current Agent 2 proof chain',
  files: {
    ...inputs,
    output_json: outputJson,
    output_md: outputMd,
    builder: 'scripts/build_agent2_post_agent10_consumption_reconciliation.mjs',
    validator: 'scripts/validate_agent2_post_agent10_consumption_reconciliation.mjs',
  },
  latest_agent10_consumption: {
    artifact: inputs.agent10_consumption,
    package_workset: agent10.package_workset,
    is_new_executable_agent2_workset: false,
    consumed_agent2_counts: agent10.counts,
  },
  current_agent2_chain_counts: {
    runnable_pipelines: bundle.current_counts?.runnable_pipelines,
    validator_only_checks: bundle.current_counts?.validator_only_checks,
    runnable_outputs_checked: bundle.current_counts?.runnable_outputs_checked,
    validator_only_states_checked: bundle.current_counts?.validator_only_states_checked,
    zero_boundary_artifacts_checked: staleScan.counts?.zero_boundary_artifacts_checked,
    aggregate_validator_commands: staleScan.counts?.aggregate_validator_commands,
    script_syntax_scripts_checked: staleScan.counts?.script_syntax_scripts_checked,
    stale_reference_surfaces_checked: staleScan.counts?.current_surfaces_checked,
    stale_reference_hits: staleScan.counts?.stale_reference_hits,
  },
  reconciliation: {
    agent10_consumption_count_state: 'pre_orot_zero_safe_blocker_registration',
    current_agent2_count_state: 'post_orot_zero_safe_blocker_registration',
    count_delta: {
      validator_only_checks: bundle.current_counts?.validator_only_checks - agent10.counts?.validator_only_checks,
      validator_only_states_checked: bundle.current_counts?.validator_only_states_checked - agent10.counts?.validator_only_states_checked,
      zero_boundary_artifacts_checked: staleScan.counts?.zero_boundary_artifacts_checked - agent10.counts?.zero_boundary_artifacts_checked,
      aggregate_validator_commands: staleScan.counts?.aggregate_validator_commands - agent10.counts?.validator_commands,
      script_syntax_scripts_checked: staleScan.counts?.script_syntax_scripts_checked - agent10.counts?.script_syntax_scripts_checked,
    },
    added_current_surface: inputs.orot_zero_safe_blocker,
  },
  workset_status: {
    new_executable_workset_found: false,
    consumption_only_artifact: true,
    next_required_workset_shape: bundle.next_workset_required_shape,
    exact_blockers: bundle.current_exact_blockers,
  },
  orot_zero_safe_blocker_counts: {
    target_rows: orotBlocker.counts?.target_rows,
    target_occurrences: orotBlocker.counts?.target_occurrences,
    source_clean_rows: orotBlocker.counts?.source_clean_rows,
    source_blocked_rows: orotBlocker.counts?.source_blocked_rows,
    transform_candidate_rows: orotBlocker.transform_candidate_counts?.definition_route_claim_rows,
  },
  zero_emission_counters: {
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
  },
  validator: `node scripts/validate_agent2_post_agent10_consumption_reconciliation.mjs ${outputJson}`,
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Return this reconciliation until Agent 10 or another owner supplies a changed executable Agent 2 workset with exact inputs, schema, output path, and validator.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'candidate-text export',
    'NC commercial authorization',
  ],
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertArtifact(value) {
  if (value.latest_agent10_consumption.is_new_executable_agent2_workset !== false) throw new Error('Agent10 artifact must be consumption-only');
  if (value.current_agent2_chain_counts.validator_only_checks !== 24) throw new Error('current validator-only checks mismatch');
  if (value.current_agent2_chain_counts.validator_only_states_checked !== 23) throw new Error('current validator-only states mismatch');
  if (value.current_agent2_chain_counts.zero_boundary_artifacts_checked !== 22) throw new Error('zero-boundary artifact count mismatch');
  if (value.orot_zero_safe_blocker_counts.transform_candidate_rows !== 0) throw new Error('Orot transform candidates must be zero');
  for (const counter of Object.values(value.zero_emission_counters)) {
    if (counter !== 0) throw new Error('zero emission counters must remain zero');
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Post-Agent10 Consumption Reconciliation - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Required Task Shape',
    `- Target: ${value.target}.`,
    `- Files: ${Object.values(inputs).join('; ')}.`,
    '- Command/script: `node scripts/build_agent2_post_agent10_consumption_reconciliation.mjs`.',
    `- Output artifact: ${outputJson}.`,
    `- Schema/counts: current chain ${value.current_agent2_chain_counts.runnable_pipelines} runnable / ${value.current_agent2_chain_counts.validator_only_checks} validator-only; stale hits ${value.current_agent2_chain_counts.stale_reference_hits}; Orot blocker ${value.orot_zero_safe_blocker_counts.target_rows} rows / ${value.orot_zero_safe_blocker_counts.target_occurrences} occurrences.`,
    `- Validator: \`${value.validator}\`.`,
    '- Missing-field blocker: no new executable Agent 2 workset; future workset must include exact target, inputs, schema, output path, validator, and lane-classified source rows where dictionary/source rows are involved.',
    `- Handoff owner: ${value.handoff_owner}.`,
    `- Stop condition: ${value.stop_condition}`,
    '',
    '## Reconciliation',
    '- Latest Agent 10 artifact is consumption-only, not a changed executable Agent 2 workset.',
    '- Agent 10 consumed the pre-Orot-zero-safe-blocker count state.',
    '- Current Agent 2 chain supersedes it with 22 validator-only checks, 21 validator-only states, 20 zero-boundary artifacts, 18 aggregate validators, 50 scripts checked, 19 stale-scan surfaces, and 0 stale hits.',
    '',
    '## Boundary',
    '- Zero answer rows, answer-eligible rows, public reader rows, route JSONL rows, route shard writes, definition content rows, candidate-text export rows, accepted text rows, and public runtime mutations.',
    '- No Definition authority, source/license acceptance, QA acceptance, public/runtime acceptance, publication readiness, or accepted gloss/text is claimed.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
