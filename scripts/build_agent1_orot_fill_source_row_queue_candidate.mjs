#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  sourceRowEvidence: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  sourceRowEvidenceMd: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.md',
  sourceRowValidator: 'reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json',
  stageCPlan: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.md',
  stageCPlanJson: 'reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.json',
  stageCPlanValidator: 'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.json',
  stageCPlanValidatorMd: 'reports/agent1-orot-stage-c-source-unblock-plan-validator-result-2026-06-03.md',
  agent10Plan: 'reports/agent10-orot-fill-expansion-plan-2026-06-03.md',
  agent2Plan: 'reports/agent2-orot-definition-fill-plan-2026-06-03.md',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.json',
  outputMd: 'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.md'
};

const TARGET_IDS = [
  'lex-aph-h639',
  'lex-mashiach-h4899',
  'lex-ruach-h7307',
  'lex-yhwh-h3068'
];

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  for (const key of [
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function main() {
  const evidence = readJson(PATHS.sourceRowEvidence);
  const validator = readJson(PATHS.sourceRowValidator);
  const stageCValidator = readJson(PATHS.stageCPlanValidator);

  assert(evidence.artifact_type === 'agent1_orot_fill_source_row_evidence', 'unexpected Orot evidence artifact type');
  assert(['block', 'pipeline_source_rows_clear'].includes(evidence.status), 'Orot evidence status must be a known review state');
  assert(validator.ok === true, 'Orot source-row evidence validator must pass');
  assert(stageCValidator.ok === true, 'Orot Stage C source-unblock plan validator must pass');
  assert(['quarantine_now_clear_after_pipeline_rule_change', 'source_rows_clear_awaiting_agent6_disposition'].includes(stageCValidator.status), 'Orot Stage C plan status mismatch');
  assertBoundary(evidence.boundary);
  assert(evidence.summary.target_count === 4, 'expected four Orot target rows');
  assert(evidence.summary.targets_with_expected_clean_source_layer_row === 4, 'expected clean source-layer rows for all four targets');
  assert(evidence.summary.route_lookup_shard_hit_count === 0, 'expected zero route lookup shard hits for target rows');

  const isClearState = evidence.status === 'pipeline_source_rows_clear';
  if (isClearState) {
    assert(evidence.summary.incomplete_curated_rows_attached === 0, 'clear state must have zero incomplete curated rows attached');
    assert(evidence.summary.targets_missing_clean_chunk_attachment === 0, 'clear state must have zero targets missing clean chunk attachment');
    assert(evidence.blocker === null, 'clear state must not carry an active Orot blocker');
  } else {
    assert(evidence.summary.incomplete_curated_rows_attached > 0, 'block state must have incomplete curated rows still attached');
    assert(evidence.blocker?.blocker_id === 'orot_fill_incomplete_curated_source_rows_attached_to_chunk_entries', 'block state must carry the Orot blocker id');
  }

  const targetRows = evidence.targets.map((target) => ({
    entry_id: target.entry_id,
    blocker: target.blocker,
    token_occurrence_count: target.token_occurrence_count,
    chunk_entry_count: target.chunk_entry_count,
    chunk_clean_attachment_status: target.chunk_clean_attachment_status,
    expected_clean_source_layer_row_count: target.expected_clean_source_layer_row_count,
    exact_incomplete_curated_row_present: target.exact_incomplete_curated_row_present
  }));

  const requestedVerdict = 'pass_warn_block_orot_fill_source_row_evidence_only';
  const currentRisk = isClearState
    ? [
        'The four target Orot chunk entries no longer attach incomplete curated rows and do attach complete source rows, but Agent 6 has not accepted source/provenance custody or downstream reliance.',
        'This clear-state evidence may reduce the Orot row blocker, but it does not authorize publication, route release, runtime acceptance, Definition authority, or accepted text.',
        'Stage C remains quarantine-now / clear-after-pipeline-rule-change evidence only; release-owner use still requires future rule/output proof and Agent 6 disposition.',
        'Agent 1 does not authorize remapping, regeneration, filtering, publication, or custody acceptance.'
      ]
    : [
        'Clean OpenScriptures source-layer rows exist upstream for all four targets, but Orot chunks still attach incomplete curated rows.',
        'Some targets are missing clean chunk attachment while others have clean row evidence attached/nearby but still carry incomplete curated rows.',
        'Route lookup shard hits for exact target IDs/source rows are zero; this does not clear runtime/publication or source custody.',
        'Stage C plan is quarantine-now / clear-after-pipeline-rule-change evidence only; it requires future denylist output scans before release-owner use and a future pipeline rule before clearance.',
        'Agent 1 does not authorize remapping, regeneration, filtering, publication, or custody acceptance.'
      ];

  const requestedQueueItem = {
    request_id: 'agent6-agent1-orot-fill-source-row-review',
    submitted_by: 'Agent 5',
    agent1_evidence_origin: 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
    gate: 'source_provenance_custody_gate/orot_fill_source_row_gate',
    scope: `Orot fill source/provenance blocker rows for ${TARGET_IDS.join(', ')}`,
    status: 'candidate_for_agent5_queue_relay_awaiting_agent6_review',
    priority: 0,
    evidence_artifacts: [
      PATHS.sourceRowEvidenceMd,
      PATHS.sourceRowEvidence,
      PATHS.sourceRowValidator,
      PATHS.stageCPlan,
      PATHS.stageCPlanJson,
      PATHS.stageCPlanValidator,
      PATHS.stageCPlanValidatorMd,
      PATHS.agent10Plan,
      PATHS.agent2Plan,
      PATHS.agent1State,
      'scripts/build_agent1_orot_fill_source_row_evidence.mjs',
      'scripts/validate_agent1_orot_fill_source_row_evidence.mjs',
      'scripts/build_agent1_orot_fill_source_row_queue_candidate.mjs'
    ],
    requested_verdict: requestedVerdict,
    claimed_boundary: 'Agent 1 prepared Orot fill source-row evidence for four current-HUD lexical warning rows. This is source/provenance-sensitive evidence only. It is not source/provenance custody, source/provenance acceptance, source publication, source-file tracking approval, QA acceptance, public/runtime acceptance, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, or accepted translation text. Publication remains blocked_no_render.',
    known_risks: currentRisk,
    what_changed_since_last_agent6_ruling: `No Agent 6 ruling was observed for Orot fill source rows. Agent 1 recomputed live Orot lexical/source-layer evidence and found status ${evidence.status}, ${evidence.summary.chunk_entry_count} chunk entries, ${evidence.summary.token_occurrence_count} token occurrences, ${evidence.summary.incomplete_curated_rows_attached} incomplete curated rows still attached, ${evidence.summary.targets_with_expected_clean_source_layer_row} clean source-layer rows available, ${evidence.summary.targets_missing_clean_chunk_attachment} targets missing clean chunk attachment, and ${evidence.summary.route_lookup_shard_hit_count} route lookup shard hits.`,
    what_must_not_be_accepted: MUST_NOT_ACCEPT,
    next_agent6_action: 'Issue a dated pass/warn/block verdict on the Orot fill source-row evidence only, preserving all runtime/publication/source-custody boundaries unless explicitly narrowed by Agent 6.'
  };

  const candidate = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_orot_fill_source_row_queue_candidate',
    requested_queue_item: requestedQueueItem,
    current_evidence_summary: evidence.summary,
    current_evidence_blocker: evidence.blocker,
    target_rows: targetRows,
    boundary: evidence.boundary
  };

  writeJson(PATHS.outputJson, candidate);
  writeText(PATHS.outputMd, `# Agent 1 Orot Fill Source-Row Queue Candidate

Generated: ${candidate.generated_at}

Boundary: candidate for Agent 5 relay / Agent 6 review only. This does not mutate the validation queue, stage files, commit, render, publish, run browser/runtime validation, regenerate source rows, or claim source/provenance acceptance.

## Requested Queue Item

- Request ID: \`${requestedQueueItem.request_id}\`
- Gate: \`${requestedQueueItem.gate}\`
- Status: \`${requestedQueueItem.status}\`
- Requested verdict: \`${requestedQueueItem.requested_verdict}\`

## Current Evidence Summary

- Evidence status: \`${evidence.status}\`
- Target rows: ${evidence.summary.target_count}
- Orot chunk entries: ${evidence.summary.chunk_entry_count}
- Orot token occurrences: ${evidence.summary.token_occurrence_count}
- Incomplete curated rows still attached: ${evidence.summary.incomplete_curated_rows_attached}
- Targets with expected clean source-layer rows: ${evidence.summary.targets_with_expected_clean_source_layer_row}
- Targets missing clean chunk attachment: ${evidence.summary.targets_missing_clean_chunk_attachment}
- Route lookup shard hits for target IDs/source rows: ${evidence.summary.route_lookup_shard_hit_count}

## Target Rows

${targetRows.map((row) => `- \`${row.entry_id}\`: blocker ${row.blocker ? `\`${row.blocker}\`` : 'none'}, token occurrences ${row.token_occurrence_count}, chunk entries ${row.chunk_entry_count}, chunk clean attachment status \`${row.chunk_clean_attachment_status}\``).join('\n')}

## Evidence Artifacts

${formatList(requestedQueueItem.evidence_artifacts)}

## Known Risks

${formatList(requestedQueueItem.known_risks)}

## Must Not Be Accepted

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: Orot fill source-row queue candidate produced with status \`${evidence.status}\`; evidence-ready / awaiting-Agent-6 only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: Agent 6 has not docketed this Orot source-row evidence; source/provenance custody remains unresolved; runtime/publication status is out of Agent 1 scope
- next action needed: Agent 5/Agent 8 may relay \`${requestedQueueItem.request_id}\` to Agent 6 if Orot fill expansion needs source/provenance-sensitive row review
- continue condition: continue without render, staging, commit, publication, runtime validation, regeneration, filtering, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    requested_queue_item: requestedQueueItem.request_id,
    summary: evidence.summary
  }, null, 2));
}

main();
