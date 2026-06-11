#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gateProofPath = 'reports/agent4-agent2-orot-205-commercial-clean-gate-consumption-receipt-gate-proof-2026-06-05.json';
const orot205ReceiptPath = 'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json';
const outputPath = 'reports/agent2-orot-205-gate-proof-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-orot-205-gate-proof-consumption-receipt-2026-06-05.md';

const gateProof = readJson(gateProofPath);
const orot205Receipt = readJson(orot205ReceiptPath);
assertInputs(gateProof, orot205Receipt);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_orot_205_gate_proof_consumption_receipt',
  generated_at: '2026-06-05T15:02:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent2 Orot 205 receipt Agent4 gate-proof consumption',
  status: 'agent4_gate_proof_consumed_planning_only_evidence',
  inputs: {
    agent4_gate_proof: gateProofPath,
    orot_205_receipt: orot205ReceiptPath,
  },
  consumed_gate_proof: {
    artifact_type: gateProof.artifact_type,
    status: gateProof.status,
    boundary: gateProof.boundary,
    commands_passed: gateProof.commands.length,
    validated_file: gateProof.files[0].path,
    validator_file: gateProof.files[1].path,
  },
  counts: {
    rows: gateProof.counts.rows,
    occurrences: gateProof.counts.occurrences,
    exact_after_mark_strip_rows: gateProof.counts.exact_after_mark_strip_rows,
    exact_after_mark_strip_occurrences: gateProof.counts.exact_after_mark_strip_occurrences,
    prefix_or_clitic_possible_rows: gateProof.counts.prefix_or_clitic_possible_rows,
    prefix_or_clitic_possible_occurrences: gateProof.counts.prefix_or_clitic_possible_occurrences,
    needs_morphology_disambiguation_rows: gateProof.counts.needs_morphology_disambiguation_rows,
    needs_morphology_disambiguation_occurrences: gateProof.counts.needs_morphology_disambiguation_occurrences,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  blockers_preserved: gateProof.blockers,
  zero_output_counts: {
    definition_candidate_rows: 0,
    lemma_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    candidate_text_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    release_rows: 0,
  },
  highest_permissible_claim: 'Agent2 consumed the Agent4 proof as validator/prereq evidence for the Orot 205 planning-only receipt.',
  handoff_owner: 'Agent 2 definition/reader-hint transform lane remains blocked; Agent10/Agent6 own any later exact downstream boundary.',
  stop_condition: 'Stop at Orot 205 gate-proof consumption. Do not emit definition, lemma, reader-hint candidates, candidate text, answer rows, public output, route writes, accepted text, definition content, export rows, or release artifacts.',
  non_acceptance_boundary: [
    'No QA acceptance',
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate-use authorization',
    'No candidate text export',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(gateProof, orot205Receipt) {
  if (gateProof.artifact_type !== 'agent4_agent2_orot_205_commercial_clean_gate_consumption_receipt_gate_proof') throw new Error('gate proof artifact_type mismatch');
  if (gateProof.status !== 'validator_passed_planning_only_evidence') throw new Error('gate proof status mismatch');
  if (gateProof.counts.rows !== 205) throw new Error('gate proof rows mismatch');
  if (gateProof.zero_counters.candidate_text_rows_now !== 0) throw new Error('gate proof candidate rows must be 0');
  if (orot205Receipt.artifact_type !== 'agent2_orot_205_commercial_clean_gate_consumption_receipt') throw new Error('Orot 205 receipt artifact_type mismatch');
  if (orot205Receipt.counts.rows !== 205) throw new Error('Orot 205 receipt rows mismatch');
  if (orot205Receipt.counts.candidate_text_rows_now !== 0) throw new Error('Orot 205 receipt candidate rows must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, receipt) {
  const lines = [
    '# Agent 2 Orot 205 Gate-Proof Consumption Receipt',
    '',
    `Generated: ${receipt.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${receipt.target} | Orot 205 planning-only receipt plus Agent4 validator proof | consume as validator/prereq evidence only; no candidate-use or transform rows | planning_only_boundary_remains | ${receipt.handoff_owner} | ${receipt.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Rows / occurrences: ${receipt.counts.rows} / ${receipt.counts.occurrences}.`,
    `- Exact-after-mark-strip rows / occurrences: ${receipt.counts.exact_after_mark_strip_rows} / ${receipt.counts.exact_after_mark_strip_occurrences}.`,
    '- Candidate/definition/lemma/reader-hint/answer/public/route/runtime rows: 0.',
    '',
    '## Blockers Preserved',
    '',
    ...receipt.blockers_preserved.map((blocker) => `- \`${blocker}\``),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...receipt.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
