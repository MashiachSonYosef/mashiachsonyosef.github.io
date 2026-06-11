#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auditPath = 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json';
const validationPath = 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json';
const outputPath = 'reports/agent2-downstream-alignment-audit-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-downstream-alignment-audit-receipt-2026-06-05.md';

const audit = readJson(auditPath);
const validation = readJson(validationPath);

assertInputs(audit, validation);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_downstream_alignment_audit_receipt',
  generated_at: '2026-06-05T23:59:59.900Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Agent1 old-dictionary downstream consumption alignment audit receipt',
  status: 'agent1_downstream_alignment_consumed_as_agent2_no_output_boundary_evidence',
  inputs: {
    agent1_downstream_alignment_audit: auditPath,
    agent1_downstream_alignment_validation: validationPath,
  },
  current_agent1_thread_id: audit.current_agent1_thread_id,
  old_agent1_policy: audit.old_agent1_policy,
  agent1_source_lane_counts: audit.agent1_source_lane_counts,
  downstream_alignment_counts: audit.downstream_alignment_counts,
  lane_alignment_rows: audit.lane_alignment_rows.map((row) => ({
    row_subset_id: row.row_subset_id,
    source_family: row.source_family,
    license_lane: row.license_lane,
    rows: row.rows,
    occurrences: row.occurrences,
    derived_from_nc: row.derived_from_nc,
    commercial_export_allowed: false,
    attribution_required: row.attribution_required,
    corpus_contamination: row.corpus_contamination,
    allowed_transform_now: false,
    exact_blocker: row.exact_blocker,
  })),
  preserved_lane_rules: audit.preserved_lane_rules,
  exact_blockers: audit.exact_blockers,
  zero_output_counts: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    release_route_opened_now: 0,
    agent6_route_opened_now: 0,
    accepted_text_rows_now: 0,
    route_jsonl_rows_now: 0,
    route_shard_writes: 0,
    public_runtime_mutation: 0,
    commercial_export_authorization: 0,
  },
  highest_permissible_claim: 'Agent2 records Agent1 audit evidence that downstream consumption stayed aligned, zero-output, and non-acceptance.',
  handoff_owner: 'Agent 2 preserves blockers; Agent 6/Agent 10 own any future exact boundary that could change zero-output state.',
  stop_condition: 'Stop at Agent2 downstream-alignment receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, publication readiness, or release action.',
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

function assertInputs(audit, validation) {
  if (audit.artifact_type !== 'agent1_old_dictionary_downstream_consumption_alignment_audit') throw new Error('audit artifact_type mismatch');
  if (audit.status !== 'agent1_downstream_consumption_aligned_zero_output_no_acceptance') throw new Error('audit status mismatch');
  if (audit.current_agent1_thread_id !== '019e975d-dc9f-7020-a7c8-885d083a837e') throw new Error('current Agent1 thread mismatch');
  if (audit.downstream_alignment_counts.agent2_readiness_source_family_rows !== 5) throw new Error('Agent2 readiness rows mismatch');
  if (audit.downstream_alignment_counts.allowed_transform_rows_now !== 0) throw new Error('audit transform rows must be 0');
  if (audit.downstream_alignment_counts.candidate_text_rows_now !== 0) throw new Error('audit candidate text rows must be 0');
  if (audit.downstream_alignment_counts.answer_eligible_rows_now !== 0) throw new Error('audit answer rows must be 0');
  if (audit.preserved_lane_rules.noncommercial_educational_candidate_preserved_separately !== true) throw new Error('NC lane separation missing');
  if (validation.ok !== true) throw new Error('validation result must be ok');
  if (validation.exact_blocker_count !== 5) throw new Error('validation blocker count mismatch');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Downstream Alignment Audit Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | source families | commercial clean | NC | blocked/review | transform rows | exact blockers |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${value.target} | ${value.downstream_alignment_counts.agent2_readiness_source_family_rows} | ${value.downstream_alignment_counts.commercial_clean_candidate_source_families} | ${value.downstream_alignment_counts.noncommercial_educational_candidate_source_families} | ${value.downstream_alignment_counts.blocked_or_needs_review_source_families} | ${value.downstream_alignment_counts.allowed_transform_rows_now} | ${value.exact_blockers.length} |`,
    '',
    '## Exact Blockers',
    '',
    ...value.exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Lane Rows',
    '',
    ...value.lane_alignment_rows.map((row) => `- \`${row.row_subset_id}\`: \`${row.license_lane}\`, rows ${row.rows}, occurrences ${row.occurrences}, transform allowed \`${row.allowed_transform_now}\`.`),
    '',
    '## Zero Output',
    '',
    '- Transform/candidate/definition/lemma/reader-hint/answer/public/route/runtime/accepted/commercial-export/release rows: 0.',
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
