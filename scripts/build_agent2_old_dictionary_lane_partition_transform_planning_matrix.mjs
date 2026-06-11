import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json';
const intakePath = 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json';
const outputJson = 'reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json';
const outputMd = 'reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.md';

const input = readJson(inputPath);
const intake = readJson(intakePath);
const rows = [];

for (const [license_lane, entries] of Object.entries(input.partitions || {})) {
  for (const entry of entries || []) {
    rows.push({
      source_family: entry.source_family,
      source_name: entry.source_name,
      license_label: entry.license_label,
      license_lane,
      row_count: entry.row_count,
      occurrence_count: entry.occurrence_count,
      attribution_required: entry.attribution_required,
      derived_from_nc: entry.derived_from_nc,
      commercial_export_allowed: entry.commercial_export_allowed === true && license_lane === 'commercial_clean_candidate',
      owner_use_attestation: entry.owner_use_attestation,
      corpus_contamination: entry.corpus_contamination,
      source_url_or_citation: entry.source_url_or_citation,
      agent6_boundary_required: entry.agent6_boundary_required,
      export_behavior: entry.export_behavior,
      missing_evidence: entry.missing_evidence || [],
      candidate_text_rows_now: 0,
      definition_content_rows_now: 0,
      answer_eligible_rows_now: 0,
      public_emit_rows_now: 0,
      blocker_to_candidate_generation: blockerFor(entry, license_lane),
    });
  }
}

const laneCounts = Object.fromEntries(Object.entries(input.partition_counts || {}).map(([lane, counts]) => [lane, {
  source_family_count: counts.source_family_count,
  row_count: counts.row_count,
  occurrence_count: counts.occurrence_count,
}]));

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_old_dictionary_lane_partition_transform_planning_matrix',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'nonpublic_lane_partition_transform_planning_matrix_pre_agent6_boundary',
  target: 'old-dictionary-excluded-row-license-lane-reaudit lane partition planning',
  inputs: {
    agent1_export_partitions: inputPath,
    agent2_old_dictionary_lane_intake: intakePath,
  },
  count_semantics: input.count_semantics,
  lane_counts: laneCounts,
  row_count_note: 'Lane row_count values are source-family hit totals, not mutually exclusive candidate/export row counts.',
  matrix_rows: rows,
  matrix_counts: {
    source_family_rows: rows.length,
    commercial_clean_candidate_source_families: rows.filter((row) => row.license_lane === 'commercial_clean_candidate').length,
    noncommercial_educational_candidate_source_families: rows.filter((row) => row.license_lane === 'noncommercial_educational_candidate').length,
    metadata_or_link_only_source_families: rows.filter((row) => row.license_lane === 'metadata_or_link_only').length,
    blocked_or_needs_review_source_families: rows.filter((row) => row.license_lane === 'blocked_or_needs_review').length,
    candidate_text_rows_now: 0,
    definition_content_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  allowed_pipeline_effect_now: {
    may_generate_lane_partition_planning_rows: true,
    may_generate_candidate_text_rows: false,
    may_export_candidate_text: false,
    may_store_definition_content: false,
    may_mark_answer_eligible: false,
    may_public_emit: false,
  },
  exact_blocker: intake.blocker_update?.remaining_exact_blocker || 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
  required_next_input_for_candidate_generation: intake.next_agent2_pipeline_effect?.required_next_input_for_candidate_generation || [],
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
  validator: `node scripts/validate_agent2_old_dictionary_lane_partition_transform_planning_matrix.mjs ${outputJson}`,
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop at lane-partition planning rows until an exact Agent 6 boundary permits candidate text/package/display/public/answer use.',
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
    'commercial export permission',
    'NC commercial authorization',
  ],
};

assertArtifact(artifact);
writeJson(outputJson, artifact);
writeMd(outputMd, artifact);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function blockerFor(entry, lane) {
  if (lane === 'blocked_or_needs_review') return 'blocked_or_needs_review_source_family_missing_independent_custody';
  if (lane === 'noncommercial_educational_candidate') return 'requires_exact_nc_educational_agent6_boundary_before_candidate_text_storage_display_or_export';
  return 'requires_exact_agent6_boundary_before_candidate_text_storage_display_or_export';
}

function assertArtifact(value) {
  if (value.matrix_counts.source_family_rows !== 5) throw new Error('expected 5 source-family rows');
  if (value.matrix_counts.commercial_clean_candidate_source_families !== 3) throw new Error('expected 3 commercial-clean source families');
  if (value.matrix_counts.noncommercial_educational_candidate_source_families !== 1) throw new Error('expected 1 NC source family');
  if (value.matrix_counts.blocked_or_needs_review_source_families !== 1) throw new Error('expected 1 blocked source family');
  for (const row of value.matrix_rows) {
    if (row.license_lane === 'noncommercial_educational_candidate') {
      if (row.derived_from_nc !== true || row.commercial_export_allowed !== false || row.attribution_required !== true || row.corpus_contamination !== false) {
        throw new Error('NC flags not preserved');
      }
    }
    if (row.candidate_text_rows_now !== 0 || row.answer_eligible_rows_now !== 0 || row.public_emit_rows_now !== 0) throw new Error('zero row boundary failed');
  }
  for (const counter of Object.values(value.zero_emission_counters)) {
    if (counter !== 0) throw new Error('zero emission counter mismatch');
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
    '# Agent 2 Old-Dictionary Lane Partition Transform Planning Matrix - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Counts',
    `- Source-family planning rows: ${value.matrix_counts.source_family_rows}.`,
    `- Commercial-clean source families: ${value.matrix_counts.commercial_clean_candidate_source_families}.`,
    `- NC educational source families: ${value.matrix_counts.noncommercial_educational_candidate_source_families}.`,
    `- Blocked/review source families: ${value.matrix_counts.blocked_or_needs_review_source_families}.`,
    '- Candidate text rows, definition content rows, answer-eligible rows, and public emit rows now: 0.',
    '',
    '## Blocker',
    value.exact_blocker,
    '',
    '## Boundary',
    'This is nonpublic lane-partition planning only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, or publication readiness.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
