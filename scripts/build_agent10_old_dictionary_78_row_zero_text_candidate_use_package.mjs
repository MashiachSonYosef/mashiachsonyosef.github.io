import fs from 'node:fs';

const verdictPath = 'reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json';
const matrixPath = 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json';
const outputPath = 'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json';
const reportPath = 'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.md';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const verdict = readJson(verdictPath);
const matrix = readJson(matrixPath);

if (verdict.disposition !== 'warn_accepted_nonpublic_zero_text_candidate_use_package_planning_artifact_only') {
  throw new Error(`Unexpected Agent 6 disposition: ${verdict.disposition}`);
}

const rows = (matrix.rows || []).map((row) => ({
  queue_id: row.queue_id,
  token_id: row.token_id,
  lexicon_entry_id: row.lexicon_entry_id,
  occurrences: row.occurrences,
  source_license_lane: row.license_lane,
  relation_class: row.preview_relation_class,
  morphology_relation_status: row.morphology_relation_status,
  candidate_use_package_status: 'nonpublic_zero_text_candidate_use_package_planning_only',
  candidate_text_rows_now: 0,
  definition_candidate_rows_now: 0,
  lemma_candidate_rows_now: 0,
  reader_hint_candidate_rows_now: 0,
  answer_eligible_rows_now: 0,
  public_emit_rows_now: 0,
  route_writes: 0,
  accepted_text_rows: 0,
  export_rows: 0,
  release_actions: 0,
  agent6_boundary_required_before_next_use: true,
}));

const occurrences = rows.reduce((sum, row) => sum + (Number(row.occurrences) || 0), 0);

const artifact = {
  artifact_type: 'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: 'agent6_warn_accepted_zero_text_candidate_use_package_planning_materialized',
  inputs: {
    agent6_zero_text_verdict: verdictPath,
    preboundary_matrix: matrixPath,
  },
  agent6_effective_boundary: verdict.effective_boundary,
  counts: {
    rows: rows.length,
    occurrences,
    unique_queue_ids: new Set(rows.map((row) => row.queue_id)).size,
    unique_token_ids: new Set(rows.map((row) => row.token_id)).size,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    route_writes: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
    export_rows: 0,
    release_actions: 0,
  },
  source_license_lane: 'commercial_clean_candidate',
  package_rows: rows,
  preserved_blockers: verdict.preserved_blockers,
  next_required_boundary: verdict.next_required_boundary,
  stop_condition:
    'Carry only as non-public zero-text candidate-use package planning evidence. Do not create candidate text, transform output, content storage, answer eligibility, route writes, public/runtime mutation, export, accepted text, publication readiness, or release action without a new exact Agent 6 packet.',
  what_must_not_be_accepted: verdict.not_accepted,
};

fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);

const md = `# Agent 10 Old-Dictionary 78-Row Zero-Text Candidate-Use Package Planning

Generated: ${artifact.generated_at}

Status: \`${artifact.status}\`

## Inputs

| file | role |
|---|---|
| \`${verdictPath}\` | Agent 6 zero-text package planning verdict |
| \`${matrixPath}\` | exact 78-row preboundary matrix |

## Counts

| field | value |
|---|---:|
| rows | ${artifact.counts.rows} |
| occurrences | ${artifact.counts.occurrences} |
| unique queue IDs | ${artifact.counts.unique_queue_ids} |
| unique token IDs | ${artifact.counts.unique_token_ids} |
| candidate text rows | 0 |
| definition candidate rows | 0 |
| lemma candidate rows | 0 |
| reader-hint candidate rows | 0 |
| answer eligible rows | 0 |
| public emit rows | 0 |
| route writes | 0 |
| accepted text rows | 0 |
| public/runtime mutation | 0 |
| export rows | 0 |
| release actions | 0 |

Effective Agent 6 boundary: \`${artifact.agent6_effective_boundary}\`

## Next Boundary

\`${artifact.next_required_boundary}\`

## Stop Condition

${artifact.stop_condition}
`;

fs.writeFileSync(reportPath, md);

console.log(`Built ${outputPath} and ${reportPath}: ${rows.length} rows / ${occurrences} occurrences.`);
