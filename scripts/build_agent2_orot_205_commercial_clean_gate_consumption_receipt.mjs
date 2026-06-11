#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gateProofPath = 'reports/agent4-orot-205-row-commercial-clean-subset-gate-proof-2026-06-05.json';
const agent10ConsumptionPath = 'reports/agent10-agent2-agent4-fresh-output-consumption-2026-06-05.json';
const outputPath = 'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-orot-205-commercial-clean-gate-consumption-receipt-2026-06-05.md';

const gateProof = readJson(gateProofPath);
const agent10Consumption = readJson(agent10ConsumptionPath);
assertInputs(gateProof, agent10Consumption);

const agent10Entry = agent10Consumption.consumed_outputs.find(
  (entry) => entry.package_workset === 'agent4_orot_205_row_commercial_clean_subset_gate_proof',
);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_orot_205_commercial_clean_gate_consumption_receipt',
  generated_at: '2026-06-05T14:00:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Orot 205-row commercial-clean planning subset gate-proof consumption',
  status: 'commercial_clean_205_row_gate_proof_consumed_as_planning_only_evidence',
  inputs: {
    agent4_gate_proof: gateProofPath,
    agent10_consumption: agent10ConsumptionPath,
    changed_package: gateProof.changed_package_input_path,
    runnable_contract: gateProof.files.runnable_contract_json,
  },
  counts: {
    rows: gateProof.counts.rows,
    occurrences: gateProof.counts.occurrences,
    exact_after_mark_strip_rows: gateProof.counts.relation_class_counts.exact_after_mark_strip.rows,
    exact_after_mark_strip_occurrences: gateProof.counts.relation_class_counts.exact_after_mark_strip.occurrences,
    prefix_or_clitic_possible_rows: gateProof.counts.relation_class_counts.prefix_or_clitic_possible.rows,
    prefix_or_clitic_possible_occurrences: gateProof.counts.relation_class_counts.prefix_or_clitic_possible.occurrences,
    needs_morphology_disambiguation_rows: gateProof.counts.relation_class_counts.needs_morphology_disambiguation.rows,
    needs_morphology_disambiguation_occurrences: gateProof.counts.relation_class_counts.needs_morphology_disambiguation.occurrences,
    missing_agent1_6_custody_disposition_rows: gateProof.counts.transform_blocker_counts.missing_agent1_6_custody_disposition,
    answer_text_not_stored_by_preview_rows: gateProof.counts.transform_blocker_counts.answer_text_not_stored_by_preview,
    missing_approved_morphology_relation_rows: gateProof.counts.transform_blocker_counts.missing_approved_morphology_relation,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  agent10_consumption_state: {
    validator_result: agent10Entry.validator_result,
    release_relevance: agent10Entry.release_relevance,
    exact_blocker: agent10Entry.exact_blocker,
    agent6_boundary_question: agent10Entry.agent6_boundary_question,
    next_handoff: agent10Entry.next_handoff,
  },
  blockers_preserved: [
    'planning_only_boundary_remains',
    'missing_agent1_6_custody_disposition',
    'answer_text_not_stored_by_preview',
    'missing_approved_morphology_relation_for_153_rows',
    'separate_exact_agent6_boundary_required_for_any_downstream_candidate_use',
  ],
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
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    accepted_gloss_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    release_rows: 0,
  },
  highest_permissible_claim: 'Agent2 consumed the Orot 205-row commercial-clean gate proof as nonpublic planning/prereq evidence only.',
  handoff_owner: 'Agent 2 definition/reader-hint transform owner remains blocked; Agent10/Agent6 own any later exact downstream boundary.',
  stop_condition: 'Stop at 205-row gate-proof consumption. Do not emit definition, lemma, reader-hint candidates, candidate text, answer rows, public output, route writes, accepted text, definition content, export rows, or release artifacts.',
  non_acceptance_boundary: [
    'No QA acceptance',
    'No Definition authority',
    'No answer acceptance',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate text export',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(gateProof, agent10Consumption) {
  if (gateProof.artifact_type !== 'agent4_validator_prereq_gate_proof') throw new Error('gate proof artifact_type mismatch');
  if (gateProof.target !== 'orot-205-row-commercial-clean-subset') throw new Error('gate proof target mismatch');
  if (gateProof.result !== 'runnable_contract_authored_and_validator_passed') throw new Error('gate proof result mismatch');
  if (gateProof.counts.rows !== 205) throw new Error('gate proof rows mismatch');
  if (gateProof.counts.definition_content_rows !== 0) throw new Error('definition content rows must be 0');
  if (agent10Consumption.artifact_type !== 'agent10_agent2_agent4_fresh_output_consumption') throw new Error('Agent10 consumption artifact_type mismatch');
  const entry = agent10Consumption.consumed_outputs.find((item) => item.package_workset === 'agent4_orot_205_row_commercial_clean_subset_gate_proof');
  if (!entry) throw new Error('Agent10 205-row entry missing');
  if (entry.exact_blocker !== 'planning_only_boundary_remains') throw new Error('Agent10 exact blocker mismatch');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, receipt) {
  const lines = [
    '# Agent 2 Orot 205 Commercial-Clean Gate Consumption Receipt',
    '',
    `Generated: ${receipt.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${receipt.target} | commercial-clean source lane, changed package, validator gate proof | consume as planning/prereq evidence only; no transform candidates | planning_only_boundary_remains | ${receipt.handoff_owner} | ${receipt.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Rows / occurrences: ${receipt.counts.rows} / ${receipt.counts.occurrences}.`,
    `- Exact-after-mark-strip rows / occurrences: ${receipt.counts.exact_after_mark_strip_rows} / ${receipt.counts.exact_after_mark_strip_occurrences}.`,
    `- Prefix/clitic rows / occurrences: ${receipt.counts.prefix_or_clitic_possible_rows} / ${receipt.counts.prefix_or_clitic_possible_occurrences}.`,
    `- Needs-disambiguation rows / occurrences: ${receipt.counts.needs_morphology_disambiguation_rows} / ${receipt.counts.needs_morphology_disambiguation_occurrences}.`,
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
