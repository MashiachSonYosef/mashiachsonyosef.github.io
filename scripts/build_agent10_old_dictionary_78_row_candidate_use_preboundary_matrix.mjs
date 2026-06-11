import fs from 'node:fs';

const morphologyPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const handoffPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json';
const worksetPath = 'reports/agent10-agent2-ready-old-dictionary-78-row-candidate-use-workset-2026-06-06.json';
const outputPath = 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json';
const reportPath = 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.md';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const morphology = readJson(morphologyPath);
const handoff = readJson(handoffPath);
const workset = readJson(worksetPath);

const commercialCleanFamilies = new Set(
  (handoff.transform_rows || [])
    .filter((row) => row.license_lane === 'commercial_clean_candidate')
    .map((row) => row.source_family),
);

const rows = (morphology.rows || [])
  .filter((row) => row.preview_relation_class === workset.selection_rule.preview_relation_class)
  .filter((row) => row.agent2_morphology_relation_status === workset.selection_rule.agent2_morphology_relation_status)
  .map((row) => {
    const sourceFamilyHits = (row.public_domain_lexicons || []).filter((source) => commercialCleanFamilies.has(source));
    return {
      queue_id: row.queue_id,
      token_id: row.token_id,
      lexicon_entry_id: row.lexicon_entry_id,
      surface: row.surface,
      normalized: row.normalized,
      occurrences: row.occurrences,
      source_family_hits: sourceFamilyHits,
      public_domain_headwords: row.public_domain_headwords || [],
      public_domain_rids: row.public_domain_rids || [],
      license_lane: 'commercial_clean_candidate',
      preview_relation_class: row.preview_relation_class,
      morphology_relation_status: row.agent2_morphology_relation_status,
      intended_candidate_use: workset.agent2_required_output.required_intended_candidate_use,
      nonpublic_planning_only: true,
      agent6_boundary_required: true,
      candidate_text_rows_now: 0,
      definition_candidate_rows_now: 0,
      lemma_candidate_rows_now: 0,
      reader_hint_candidate_rows_now: 0,
      answer_eligible_rows_now: 0,
      public_emit_rows_now: 0,
      route_writes: 0,
      accepted_text_rows: 0,
      exact_agent6_question: workset.agent6_boundary_question_to_prepare,
    };
  });

const occurrenceTotal = rows.reduce((sum, row) => sum + (Number(row.occurrences) || 0), 0);

const artifact = {
  artifact_type: 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  status: 'agent10_built_exact_preboundary_matrix_ready_for_agent6_packet_assembly',
  inputs: {
    morphology_matrix: morphologyPath,
    agent1_source_lane_handoff: handoffPath,
    agent10_workset: worksetPath,
  },
  selection_rule: workset.selection_rule,
  counts: {
    rows: rows.length,
    occurrences: occurrenceTotal,
    source_family_hits_are_commercial_clean: true,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    route_writes: 0,
    accepted_text_rows: 0,
    release_actions: 0,
  },
  source_license_lane: 'commercial_clean_candidate',
  intended_candidate_use: workset.agent2_required_output.required_intended_candidate_use,
  agent6_boundary_question: workset.agent6_boundary_question_to_prepare,
  rows,
  stop_condition:
    'Use this matrix only to assemble an exact Agent 6 boundary packet. Do not emit candidate text, definition/lemma/reader-hint content, answers, public/runtime files, route shards, accepted text, export files, publication readiness, or release action.',
  what_must_not_be_accepted: workset.what_must_not_be_accepted,
};

fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);

const md = `# Agent 10 Old-Dictionary 78-Row Candidate-Use Preboundary Matrix

Generated: ${artifact.generated_at}

Status: \`${artifact.status}\`

## Inputs

| file | role |
|---|---|
| \`${morphologyPath}\` | source morphology matrix |
| \`${handoffPath}\` | Agent 1 source-family lane handoff |
| \`${worksetPath}\` | Agent 10 selected workset |

## Counts

| field | value |
|---|---:|
| rows | ${artifact.counts.rows} |
| occurrences | ${artifact.counts.occurrences} |
| candidate text rows | 0 |
| definition candidate rows | 0 |
| lemma candidate rows | 0 |
| reader-hint candidate rows | 0 |
| answer eligible rows | 0 |
| public emit rows | 0 |
| route writes | 0 |
| accepted text rows | 0 |

Source/license lane: \`commercial_clean_candidate\`

Intended candidate use: \`${artifact.intended_candidate_use}\`

Agent 6 boundary question:

${artifact.agent6_boundary_question}

## Stop Condition

${artifact.stop_condition}
`;

fs.writeFileSync(reportPath, md);

console.log(`Built ${outputPath} and ${reportPath}: ${rows.length} rows / ${occurrenceTotal} occurrences.`);
