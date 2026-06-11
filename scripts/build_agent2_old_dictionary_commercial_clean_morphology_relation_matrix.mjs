#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const worksetPath = 'reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json';
const outputPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json';
const markdownPath = 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.md';
const workset = readJson(worksetPath);

assertWorkset(workset);

const rows = workset.rows.map((row) => {
  const classification = classify(row.preview_relation_class);
  return {
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    public_domain_lexicons: row.public_domain_lexicons,
    public_domain_headwords: row.public_domain_headwords,
    public_domain_rids: row.public_domain_rids,
    preview_relation_class: row.preview_relation_class,
    agent2_morphology_relation_status: classification.status,
    agent2_morphology_relation_action: classification.action,
    exact_blocker: classification.blocker,
    nonpublic_planning_only: true,
    downstream_agent6_candidate_use_package_required: true,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    accepted_gloss_text_rows_now: 0,
    definition_content_rows_now: 0,
  };
});

const relationStatusCounts = countBy(rows, 'agent2_morphology_relation_status');
const relationClassCounts = Object.fromEntries(
  Object.entries(workset.relation_class_counts).map(([key, value]) => [key, { ...value }]),
);

const matrix = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_commercial_clean_morphology_relation_matrix',
  generated_at: '2026-06-05T12:15:00.000Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'old-dictionary commercial-clean morphology relation matrix',
  status: 'nonpublic_morphology_relation_matrix_built_no_candidate_text',
  inputs: {
    agent10_workset: worksetPath,
    readiness_matrix: workset.inputs_consumed.readiness_matrix,
    readiness_consumption: workset.inputs_consumed.readiness_consumption,
  },
  counts: {
    unique_preview_rows: workset.counts.unique_preview_rows,
    unique_preview_occurrences: workset.counts.unique_preview_occurrences,
    commercial_clean_source_families: workset.counts.commercial_clean_source_families,
    commercial_clean_source_family_hit_rows: workset.counts.commercial_clean_source_family_hit_rows,
    commercial_clean_source_family_hit_occurrences: workset.counts.commercial_clean_source_family_hit_occurrences,
    agent2_morphology_planning_approved_rows: relationStatusCounts.agent2_morphology_relation_approved_for_nonpublic_planning || 0,
    agent2_morphology_blocked_rows: rows.length - (relationStatusCounts.agent2_morphology_relation_approved_for_nonpublic_planning || 0),
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  relation_class_counts: relationClassCounts,
  relation_status_counts: relationStatusCounts,
  commercial_family_hit_totals: workset.commercial_family_hit_totals,
  rows,
  exact_blockers_preserved: [
    'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
    'missing_exact_row_subset_candidate_use_package',
    'agent2_morphology_relation_matrix_is_nonpublic_planning_only_not_candidate_use',
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
  handoff_owner: 'Agent 2 definer; Agent 10 must assemble a new exact Agent 6 row/subset packet before downstream candidate-use behavior.',
  stop_condition: 'Stop at nonpublic morphology relation matrix. Do not emit definition, lemma, reader-hint candidate text, answer/public rows, route writes, accepted text, definition content, export rows, or release artifacts.',
  non_acceptance_boundary: [
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

writeJson(outputPath, matrix);
writeMarkdown(markdownPath, matrix);
console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);

function classify(relationClass) {
  if (relationClass === 'exact_after_mark_strip') {
    return {
      status: 'agent2_morphology_relation_approved_for_nonpublic_planning',
      action: 'may carry exact-after-mark-strip morphology relation as nonpublic planning evidence only',
      blocker: 'missing_exact_agent6_row_subset_candidate_use_package_for_downstream_use',
    };
  }
  if (relationClass === 'prefix_or_clitic_possible') {
    return {
      status: 'agent2_morphology_relation_blocked_prefix_or_clitic_possible',
      action: 'return exact row blocker; no candidate text',
      blocker: 'prefix_or_clitic_possible_requires_morphology_disambiguation',
    };
  }
  return {
    status: 'agent2_morphology_relation_blocked_needs_disambiguation',
    action: 'return exact row blocker; no candidate text',
    blocker: 'needs_morphology_disambiguation',
  };
}

function assertWorkset(value) {
  if (value.artifact_type !== 'agent10_agent2_ready_old_dictionary_commercial_clean_morphology_relation_workset') throw new Error('workset artifact_type mismatch');
  if (value.counts.unique_preview_rows !== 297) throw new Error('workset row count mismatch');
  if (value.counts.allowed_transform_rows_now !== 0) throw new Error('workset allowed transform rows must be 0');
  if (!Array.isArray(value.rows) || value.rows.length !== 297) throw new Error('workset rows must contain 297 entries');
}

function countBy(values, key) {
  return values.reduce((acc, value) => {
    acc[value[key]] = (acc[value[key]] || 0) + 1;
    return acc;
  }, {});
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, matrix) {
  const lines = [
    '# Agent 2 Old-Dictionary Commercial-Clean Morphology Relation Matrix',
    '',
    `Generated: ${matrix.generated_at}`,
    '',
    '| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${matrix.target} | commercial_clean_candidate lane rows with token_id/lexicon_entry_id/source family/rids/relation class | exact-after-mark-strip rows may be carried only as nonpublic morphology planning evidence; no candidate text | prefix/clitic and disambiguation rows remain row-level blockers; downstream use still requires exact Agent 6 row/subset candidate-use package | ${matrix.handoff_owner} | ${matrix.stop_condition} |`,
    '',
    '## Counts',
    '',
    `- Unique preview rows / occurrences: ${matrix.counts.unique_preview_rows} / ${matrix.counts.unique_preview_occurrences}.`,
    `- Commercial-clean source families: ${matrix.counts.commercial_clean_source_families}.`,
    `- Commercial-clean source-family hit rows / occurrences: ${matrix.counts.commercial_clean_source_family_hit_rows} / ${matrix.counts.commercial_clean_source_family_hit_occurrences}.`,
    `- Agent2 morphology planning approved rows: ${matrix.counts.agent2_morphology_planning_approved_rows}.`,
    `- Agent2 morphology blocked rows: ${matrix.counts.agent2_morphology_blocked_rows}.`,
    '- Allowed transform rows now: 0.',
    '- Candidate/definition/lemma/reader-hint/answer/public rows now: 0.',
    '',
    '## Relation Status Counts',
    '',
    ...Object.entries(matrix.relation_status_counts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Exact Blockers Preserved',
    '',
    ...matrix.exact_blockers_preserved.map((blocker) => `- \`${blocker}\``),
    '',
    '## Non-Acceptance Boundary',
    '',
    ...matrix.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
