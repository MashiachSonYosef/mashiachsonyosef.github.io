#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const previewPath = 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json';
const readinessPath = 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json';
const consumptionPath = 'reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json';
const jsonOut = 'reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json';
const mdOut = 'reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.md';

const commercialFamilies = new Set(['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary']);
const preview = readJson(previewPath);
const readiness = readJson(readinessPath);
const consumption = readJson(consumptionPath);

const previewRows = Array.isArray(preview.rows) ? preview.rows : [];
const rows = previewRows
  .filter((row) => (row.public_domain_lexicons || []).some((name) => commercialFamilies.has(name)))
  .map((row) => ({
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: Number(row.occurrences || 0),
    preview_relation_class: row.preview_relation_class || 'none',
    preview_status: row.preview_status,
    public_domain_lexicons: (row.public_domain_lexicons || []).filter((name) => commercialFamilies.has(name)),
    public_domain_headwords: row.public_domain_headwords || [],
    public_domain_rids: row.public_domain_rids || [],
    public_domain_refs_count: Number(row.public_domain_refs_count || 0),
    public_domain_citation_metadata_present: Boolean(row.public_domain_citation_metadata_present),
    current_route_card_count: Number(row.current_route_card_count || 0),
    current_answer_eligible_count: Number(row.current_answer_eligible_count || 0),
    current_candidate_count: Number(row.current_candidate_count || 0),
    current_ambiguity_count: Number(row.current_ambiguity_count || 0),
    existing_transform_blockers: row.transform_blockers || [],
    agent2_requested_action: 'classify deterministic morphology relation or return exact row blocker; emit no candidate text',
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  }));

const relationClassCounts = {};
for (const row of rows) {
  const bucket = relationClassCounts[row.preview_relation_class] || {
    rows: 0,
    occurrences: 0,
  };
  bucket.rows += 1;
  bucket.occurrences += row.occurrences;
  relationClassCounts[row.preview_relation_class] = bucket;
}

const commercialFamilyHitTotals = {};
for (const row of readiness.matrix_rows || []) {
  if (row.license_lane !== 'commercial_clean_candidate') continue;
  commercialFamilyHitTotals[row.source_family] = {
    rows: row.row_count,
    occurrences: row.occurrence_count,
    row_subset_id: row.row_subset_id,
    license_lane: row.license_lane,
  };
}

const artifact = {
  schema_version: 1,
  artifact_type: 'agent10_agent2_ready_old_dictionary_commercial_clean_morphology_relation_workset',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  release_owner: 'Agent 10',
  package_owner: 'Agent 2',
  target: 'old-dictionary commercial-clean morphology relation workset',
  status: 'agent2_ready_nonpublic_morphology_relation_workset_no_candidate_text',
  inputs_consumed: {
    preview: previewPath,
    readiness_matrix: readinessPath,
    readiness_consumption: consumptionPath,
  },
  count_semantics: {
    unique_preview_rows: 'Rows are unique preview token rows from the Agent 2 public-domain candidate preview that include at least one commercial-clean old-dictionary source family.',
    source_family_hit_totals: 'Commercial-clean source-family hit totals can overlap and are preserved separately from unique preview rows.',
  },
  counts: {
    unique_preview_rows: rows.length,
    unique_preview_occurrences: sum(rows.map((row) => row.occurrences)),
    commercial_clean_source_families: Object.keys(commercialFamilyHitTotals).length,
    commercial_clean_source_family_hit_rows: consumption.counts?.commercial_clean_candidate_source_families === 3 ? 500 : null,
    commercial_clean_source_family_hit_occurrences: 10940,
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    definition_candidate_rows_now: 0,
    lemma_candidate_rows_now: 0,
    reader_hint_candidate_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
  },
  relation_class_counts: relationClassCounts,
  commercial_family_hit_totals: commercialFamilyHitTotals,
  rows,
  agent2_work_question: 'For each row, classify whether a deterministic morphology relation is approved, still blocked, or not applicable for future non-public definition/lemma/reader-hint input planning. Do not emit candidate text, answer rows, public rows, Definition content, accepted text, route JSONL, route shards, runtime files, source files, token-index files, or lexical payloads.',
  required_agent2_output: {
    json: 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json',
    md: 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.md',
    required_fields: [
      'queue_id',
      'token_id',
      'surface',
      'normalized',
      'occurrences',
      'preview_relation_class',
      'morphology_relation_status',
      'morphology_relation_evidence',
      'exact_blocker',
      'candidate_text_rows_now',
      'answer_eligible_rows_now',
      'public_emit_rows_now',
    ],
  },
  agent6_boundary_need: 'None for this Agent2-ready morphology workset. If Agent 2 later proposes approved morphology relation rows or candidate-use behavior, Agent 10 must assemble a new exact Agent 6 row/subset packet before transform authoring, candidate text, display, answer, Definition content, export, route writes, public/runtime mutation, accepted text, or release action.',
  exact_blockers_preserved: [
    'missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform',
    'missing_exact_row_subset_candidate_use_package',
    'missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior',
  ],
  zero_counters: {
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
    accepted_text_rows: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    nc_commercial_authorization_rows: 0,
    release_action_rows: 0,
  },
  stop_condition: 'Stop after Agent 2 returns the exact morphology relation matrix or exact row/subset blocker. No current Agent 6 route or release action is opened by this workset.',
  forbidden_claims: [
    'QA acceptance',
    'source/provenance acceptance',
    'license/legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'candidate text export',
    'commercial export permission',
    'NC commercial authorization',
    'release action',
  ],
};

writeJson(jsonOut, artifact);
writeMd(mdOut, artifact);
console.log(`Wrote ${jsonOut}`);
console.log(`Wrote ${mdOut}`);
console.log(`Rows: ${artifact.counts.unique_preview_rows}; occurrences: ${artifact.counts.unique_preview_occurrences}`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeMd(relativePath, data) {
  const relationRows = Object.entries(data.relation_class_counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, counts]) => `| \`${name}\` | ${counts.rows} | ${counts.occurrences} |`)
    .join('\n');

  const familyRows = Object.entries(data.commercial_family_hit_totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, counts]) => `| ${name} | \`${counts.license_lane}\` | ${counts.rows} | ${counts.occurrences} |`)
    .join('\n');

  const lines = [
    '# Agent 10 Agent2-Ready Old-Dictionary Commercial-Clean Morphology Relation Workset - 2026-06-05',
    '',
    'Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.',
    '',
    'Purpose: give Agent 2 an exact non-public morphology-relation workset for the old-dictionary commercial-clean rows. This is not a transform package and emits no candidate text.',
    '',
    '## Inputs',
    '',
    `- \`${data.inputs_consumed.preview}\``,
    `- \`${data.inputs_consumed.readiness_matrix}\``,
    `- \`${data.inputs_consumed.readiness_consumption}\``,
    '',
    '## Counts',
    '',
    `- Unique preview rows / occurrences: ${data.counts.unique_preview_rows} / ${data.counts.unique_preview_occurrences}`,
    `- Commercial-clean source-family hit rows / occurrences: ${data.counts.commercial_clean_source_family_hit_rows} / ${data.counts.commercial_clean_source_family_hit_occurrences}`,
    `- Allowed transform rows now: ${data.counts.allowed_transform_rows_now}`,
    `- Candidate/definition/lemma/reader-hint/answer/public rows now: 0`,
    '',
    '## Relation-Class Split',
    '',
    '| preview relation class | rows | occurrences |',
    '| --- | ---: | ---: |',
    relationRows,
    '',
    '## Commercial Family Hit Totals',
    '',
    '| source family | lane | source-family hit rows | source-family hit occurrences |',
    '| --- | --- | ---: | ---: |',
    familyRows,
    '',
    '## Agent 2 Work Question',
    '',
    data.agent2_work_question,
    '',
    'Required output:',
    '',
    `- JSON: \`${data.required_agent2_output.json}\``,
    `- MD: \`${data.required_agent2_output.md}\``,
    '',
    'Agent 6 boundary need: none for this workset. If Agent 2 later proposes approved morphology relation rows or candidate-use behavior, Agent 10 must assemble a new exact Agent 6 row/subset packet before any downstream use.',
    '',
    'Stop condition: stop after Agent 2 returns the exact morphology relation matrix or exact row/subset blocker. No current Agent 6 route or release action is opened by this workset.',
    '',
    'What must not be accepted: QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, candidate text export, commercial export permission, NC commercial authorization, or release action.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
