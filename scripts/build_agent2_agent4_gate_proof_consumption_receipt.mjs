#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const morphologyGateProofPath = 'reports/agent4-agent2-old-dictionary-morphology-relation-gate-proof-2026-06-05.json';
const candidateUseGateProofPath = 'reports/agent4-agent2-morphology-planning-candidate-use-blocker-gate-proof-2026-06-05.json';
const preflightHandoffPath = 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json';
const outputPath = 'reports/agent2-agent4-gate-proof-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-agent4-gate-proof-consumption-receipt-2026-06-05.md';

const morphologyGateProof = readJson(morphologyGateProofPath);
const candidateUseGateProof = readJson(candidateUseGateProofPath);
const preflightHandoff = readJson(preflightHandoffPath);

assertInputs(morphologyGateProof, candidateUseGateProof, preflightHandoff);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent4_gate_proof_consumption_receipt',
  generated_at: '2026-06-05T13:42:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent2 morphology and candidate-use blocker Agent4 gate-proof consumption',
  status: 'agent4_gate_proofs_consumed_as_validator_prereq_evidence_only',
  inputs: {
    morphology_gate_proof: morphologyGateProofPath,
    candidate_use_gate_proof: candidateUseGateProofPath,
    agent2_preflight_handoff: preflightHandoffPath,
  },
  consumed_gate_proofs: [
    {
      path: morphologyGateProofPath,
      artifact_type: morphologyGateProof.artifact_type,
      status: morphologyGateProof.status,
      boundary: morphologyGateProof.boundary,
      commands_passed: morphologyGateProof.commands.length,
    },
    {
      path: candidateUseGateProofPath,
      artifact_type: candidateUseGateProof.artifact_type,
      status: candidateUseGateProof.status,
      boundary: candidateUseGateProof.boundary,
      commands_passed: candidateUseGateProof.commands.length,
    },
  ],
  counts: {
    morphology_matrix_rows: morphologyGateProof.counts.unique_preview_rows,
    morphology_planning_approved_rows: morphologyGateProof.counts.agent2_morphology_planning_approved_rows,
    morphology_blocked_rows: morphologyGateProof.counts.agent2_morphology_blocked_rows,
    candidate_use_blocker_planning_rows: candidateUseGateProof.counts.morphology_planning_rows,
    preflight_future_question_rows: preflightHandoff.exact_subset_for_future_question.row_count,
    allowed_candidate_use_rows_now: 0,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  blockers_preserved: [
    ...morphologyGateProof.blockers,
    ...candidateUseGateProof.blockers,
    preflightHandoff.exact_blocker_until_agent10_agent6_packet_exists,
  ],
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    release_rows: 0,
  },
  highest_permissible_claim: 'Agent2 consumed Agent4 gate proofs as validator/prereq evidence for nonpublic morphology planning and candidate-use blockers only.',
  handoff_owner: 'Agent 2 definer retains blocker state; Agent 10/Agent 6 still own any future exact candidate-use boundary packet.',
  stop_condition: 'Stop at Agent4 gate-proof consumption. Do not treat gate proof as QA, source, license, Definition, answer, public/runtime, publication, product/data, accepted-text, candidate-use, export, or release acceptance.',
  non_acceptance_boundary: [
    'No QA acceptance',
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No candidate text export',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(morphologyGateProof, candidateUseGateProof, preflightHandoff) {
  if (morphologyGateProof.artifact_type !== 'agent4_agent2_old_dictionary_morphology_relation_gate_proof') throw new Error('morphology gate proof artifact_type mismatch');
  if (morphologyGateProof.status !== 'validators_passed_nonpublic_morphology_planning_only') throw new Error('morphology gate proof status mismatch');
  if (morphologyGateProof.counts.agent2_morphology_planning_approved_rows !== 78) throw new Error('morphology gate proof planning count mismatch');
  if (candidateUseGateProof.artifact_type !== 'agent4_agent2_morphology_planning_candidate_use_blocker_gate_proof') throw new Error('candidate-use gate proof artifact_type mismatch');
  if (candidateUseGateProof.status !== 'validator_passed_candidate_use_blocked') throw new Error('candidate-use gate proof status mismatch');
  if (candidateUseGateProof.counts.allowed_candidate_use_rows_now !== 0) throw new Error('candidate-use gate proof allowed rows must be 0');
  if (preflightHandoff.artifact_type !== 'agent2_agent10_candidate_use_preflight_handoff') throw new Error('preflight handoff artifact_type mismatch');
  if (preflightHandoff.exact_subset_for_future_question.row_count !== 78) throw new Error('preflight row count mismatch');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, receipt) {
  const lines = [
    '# Agent 2 Agent4 Gate-Proof Consumption Receipt',
    '',
    `Generated: ${receipt.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${receipt.target} | current commercial-clean lane, morphology matrix, candidate-use blocker, Agent4 gate proofs | consume gate proofs as validator/prereq evidence only; no candidate-use or transform rows | Agent10/Agent6 exact candidate-use packet still missing for 78 rows | ${receipt.handoff_owner} | ${receipt.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Morphology matrix rows: ${receipt.counts.morphology_matrix_rows}.`,
    `- Morphology planning approved rows: ${receipt.counts.morphology_planning_approved_rows}.`,
    `- Morphology blocked rows: ${receipt.counts.morphology_blocked_rows}.`,
    `- Candidate-use blocker planning rows: ${receipt.counts.candidate_use_blocker_planning_rows}.`,
    `- Preflight future-question rows: ${receipt.counts.preflight_future_question_rows}.`,
    '- Allowed candidate-use rows now: 0.',
    '- Allowed transform rows now: 0.',
    '',
    '## Gate Proofs Consumed',
    '',
    ...receipt.consumed_gate_proofs.map((proof) => `- \`${proof.path}\`: \`${proof.status}\`, commands passed ${proof.commands_passed}.`),
    '',
    '## Blockers Preserved',
    '',
    ...[...new Set(receipt.blockers_preserved)].map((blocker) => `- \`${blocker}\``),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...receipt.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
