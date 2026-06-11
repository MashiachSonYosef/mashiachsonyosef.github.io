#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const handoffPath = 'reports/agent10-agent2-old-dictionary-morphology-candidate-use-handoff-2026-06-05.json';
const packagePath = 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json';
const gateProofPath = 'reports/agent4-agent2-old-dictionary-morphology-candidate-use-package-gate-proof-2026-06-05.json';
const outputPath = 'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-agent10-morphology-candidate-use-handoff-consumption-receipt-2026-06-05.md';

const handoff = readJson(handoffPath);
const pkg = readJson(packagePath);
const gateProof = readJson(gateProofPath);

assertInputs(handoff, pkg, gateProof);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_agent10_morphology_candidate_use_handoff_consumption_receipt',
  generated_at: '2026-06-05T23:59:55.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent10 old-dictionary morphology candidate-use handoff consumption by Agent2',
  status: 'handoff_consumed_package_already_authored_and_gate_proved_no_text_output',
  inputs: {
    agent10_handoff: handoffPath,
    agent2_package: packagePath,
    agent4_gate_proof: gateProofPath,
  },
  consumed_request: {
    request: handoff.request,
    row_source_path: handoff.row_source.path,
    row_source_pointer: handoff.row_source.pointer,
    rows: handoff.row_source.rows,
    occurrences: handoff.row_source.occurrences,
    license_lane: handoff.row_source.license_lane,
    preview_relation_class: handoff.row_source.preview_relation_class,
    agent2_morphology_relation_status: handoff.row_source.agent2_morphology_relation_status,
    noncommercial_educational_candidate_rows: handoff.row_source.noncommercial_educational_candidate_rows,
    excluded_morphology_blocked_rows: handoff.row_source.excluded_morphology_blocked_rows,
  },
  delivered_agent2_artifacts: {
    package_json: packagePath,
    package_markdown: 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.md',
    package_validator: 'scripts/validate_agent2_old_dictionary_morphology_candidate_use_package.mjs',
    package_gate_proof: gateProofPath,
  },
  counts: {
    package_rows: pkg.counts.package_rows,
    package_occurrences: pkg.counts.package_occurrences,
    unique_queue_ids: pkg.counts.unique_queue_ids,
    commercial_clean_candidate_rows: pkg.counts.commercial_clean_candidate_rows,
    noncommercial_educational_candidate_rows: pkg.counts.noncommercial_educational_candidate_rows,
    morphology_blocked_rows_excluded: pkg.counts.morphology_blocked_rows_excluded,
    exact_after_mark_strip_rows: pkg.counts.exact_after_mark_strip_rows,
    candidate_text_rows: 0,
    definition_content_rows: 0,
    lemma_content_rows: 0,
    reader_hint_content_rows: 0,
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_emit_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
  },
  validator_result: {
    command: gateProof.commands[0].command,
    result: gateProof.commands[0].result,
    stdout_summary: gateProof.commands[0].stdout_summary,
  },
  exact_blocker: 'new_agent6_verdict_required_before_text_storage_transform_output_export_answer_route_runtime_accepted_text_commercial_export_or_release',
  next_handoff_owner: 'Agent 10 for Agent 6 boundary review before any actual text/storage/export/answer/public/runtime/release step.',
  stop_condition: 'Stop at handoff consumption receipt. Do not store candidate text, definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
  non_acceptance_boundary: [
    'No Definition authority',
    'No answer acceptance',
    'No answer eligibility',
    'No source/license/legal acceptance',
    'No accepted gloss/text',
    'No public/runtime mutation',
    'No route-shard edit',
    'No candidate text export',
    'No definition/lemma/reader-hint content storage',
    'No commercial export authorization',
    'No NC commercial authorization',
    'No release action',
  ],
};

writeJson(outputPath, receipt);
writeMarkdown(markdownPath, receipt);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function assertInputs(handoff, pkg, gateProof) {
  if (handoff.artifact_type !== 'agent10_agent2_old_dictionary_morphology_candidate_use_handoff') throw new Error('Agent10 handoff artifact_type mismatch');
  if (handoff.handoff_owner !== 'Agent 2') throw new Error('Agent10 handoff owner mismatch');
  if (handoff.row_source.rows !== 78) throw new Error('Agent10 handoff row count mismatch');
  if (handoff.row_source.occurrences !== 1461) throw new Error('Agent10 handoff occurrence count mismatch');
  if (handoff.row_source.license_lane !== 'commercial_clean_candidate') throw new Error('Agent10 handoff license lane mismatch');
  if (handoff.row_source.noncommercial_educational_candidate_rows !== 0) throw new Error('Agent10 handoff NC rows must be 0');
  if (pkg.artifact_type !== 'agent2_old_dictionary_morphology_candidate_use_package') throw new Error('Agent2 package artifact_type mismatch');
  if (pkg.counts.package_rows !== handoff.row_source.rows) throw new Error('package rows do not satisfy handoff');
  if (pkg.counts.package_occurrences !== handoff.row_source.occurrences) throw new Error('package occurrences do not satisfy handoff');
  if (pkg.counts.candidate_text_rows !== 0) throw new Error('package text rows must be 0');
  if (gateProof.artifact_type !== 'agent4_validator_prereq_gate_proof') throw new Error('Agent4 gate proof artifact_type mismatch');
  if (gateProof.changed_package_input !== packagePath) throw new Error('Agent4 gate proof package input mismatch');
  if (gateProof.commands?.[0]?.result !== 'passed') throw new Error('Agent4 gate proof command did not pass');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Agent10 Morphology Candidate-Use Handoff Consumption Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | rows | occurrences | lane | artifact | exact blocker | stop condition |',
    '| --- | ---: | ---: | --- | --- | --- | --- |',
    `| ${value.target} | ${value.counts.package_rows} | ${value.counts.package_occurrences} | \`${value.consumed_request.license_lane}\` | \`${value.delivered_agent2_artifacts.package_json}\` | \`${value.exact_blocker}\` | ${value.stop_condition} |`,
    '',
    '## Validator Result',
    '',
    `- Command: \`${value.validator_result.command}\`.`,
    `- Result: \`${value.validator_result.result}\`.`,
    `- Summary: ${value.validator_result.stdout_summary}`,
    '',
    '## Counts',
    '',
    `- Package rows: ${value.counts.package_rows}.`,
    `- Package occurrences: ${value.counts.package_occurrences}.`,
    `- Commercial-clean rows: ${value.counts.commercial_clean_candidate_rows}.`,
    `- NC rows: ${value.counts.noncommercial_educational_candidate_rows}.`,
    `- Morphology-blocked rows excluded: ${value.counts.morphology_blocked_rows_excluded}.`,
    '- Candidate text/definition/lemma/reader-hint/answer/public/route/runtime rows: 0.',
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
