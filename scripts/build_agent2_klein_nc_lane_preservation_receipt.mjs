#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = 'reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json';
const validationPath = 'reports/agent1-old-dictionary-klein-nc-lane-preservation-validation-result-2026-06-05.json';
const outputPath = 'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json';
const markdownPath = 'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.md';

const packet = readJson(packetPath);
const validation = readJson(validationPath);

assertInputs(packet, validation);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_klein_nc_lane_preservation_receipt',
  generated_at: '2026-06-05T23:59:59.990Z',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / source-lane separated lexicon expansion',
  target: 'Klein Dictionary NC lane preservation receipt',
  status: 'klein_nc_lane_preserved_separately_no_commercial_export_zero_output',
  inputs: {
    agent1_klein_nc_lane_preservation: packetPath,
    agent1_klein_nc_lane_preservation_validation: validationPath,
  },
  scope_boundary: packet.scope_boundary,
  source_family: {
    row_subset_id: packet.source_family.row_subset_id,
    source_family: packet.source_family.source_family,
    license_label: packet.source_family.license_label,
    license_lane: packet.source_family.license_lane,
    rows: packet.source_family.rows,
    occurrences: packet.source_family.occurrences,
    derived_from_nc: true,
    commercial_export_allowed: false,
    attribution_required: true,
    corpus_contamination: false,
  },
  nc_source_family_map_evidence: {
    artifact: packet.nc_source_family_map_evidence.artifact,
    family_map_status: packet.nc_source_family_map_evidence.family_map_status,
    metadata_only_allowed: packet.nc_source_family_map_evidence.metadata_only_allowed,
    external_link_only_allowed: packet.nc_source_family_map_evidence.external_link_only_allowed,
    storage_allowed: packet.nc_source_family_map_evidence.storage_allowed,
    display_allowed: packet.nc_source_family_map_evidence.display_allowed,
    transformed_reader_hint_allowed: packet.nc_source_family_map_evidence.transformed_reader_hint_allowed,
  },
  zero_output_counts: {
    allowed_transform_rows_now: 0,
    candidate_text_rows_now: 0,
    candidate_text_export_rows: 0,
    definition_content_rows_now: 0,
    lemma_content_rows_now: 0,
    reader_hint_content_rows_now: 0,
    answer_rows_now: 0,
    answer_eligible_rows_now: 0,
    public_emit_rows_now: 0,
    public_runtime_mutation: 0,
    route_jsonl_rows_now: 0,
    route_shard_writes: 0,
    accepted_text_rows_now: 0,
    agent6_delivery_now: 0,
    commercial_export_authorization: 0,
    nc_commercial_authorization: 0,
    release_actions: 0,
  },
  exact_blockers: [
    'klein_old_dictionary_nc_scope_214_rows_distinct_from_prior_17_row_nc_map',
    'klein_dictionary_remains_noncommercial_educational_candidate_no_commercial_export_authorization',
    'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization',
  ],
  handoff_owner: 'Agent 6 for exact NC boundary; Agent 2 preserves NC lane separately and remains no-output.',
  stop_condition: 'Stop at Agent2 Klein NC preservation receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, NC commercial authorization, publication readiness, or release action.',
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

function assertInputs(packet, validation) {
  if (packet.artifact_type !== 'agent1_old_dictionary_klein_nc_lane_preservation') throw new Error('Klein packet artifact_type mismatch');
  if (packet.status !== 'klein_noncommercial_educational_candidate_preserved_separately_zero_output') throw new Error('Klein packet status mismatch');
  if (packet.scope_boundary.old_dictionary_klein_subset_rows !== 214) throw new Error('Klein old-dictionary row count mismatch');
  if (packet.scope_boundary.prior_nc_klein_package_rows !== 17) throw new Error('Klein prior NC package row count mismatch');
  if (packet.source_family.license_lane !== 'noncommercial_educational_candidate') throw new Error('Klein lane mismatch');
  if (packet.source_family.commercial_export_allowed !== false) throw new Error('Klein commercial export must be false');
  if (packet.source_family.attribution_required !== true) throw new Error('Klein attribution must be true');
  if (validation.ok !== true) throw new Error('Klein validation must be ok');
  if (validation.allowed_transform_rows_now !== 0) throw new Error('Klein transform rows must be 0');
  if (validation.candidate_text_rows_now !== 0) throw new Error('Klein candidate text rows must be 0');
  if (validation.agent6_delivery_now !== 0) throw new Error('Klein Agent6 delivery must be 0');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Klein NC Lane Preservation Receipt',
    '',
    `Generated: ${value.generated_at}`,
    '',
    '| target | rows | occurrences | prior NC rows | commercial export | exact blocker |',
    '| --- | ---: | ---: | ---: | --- | --- |',
    `| ${value.target} | ${value.source_family.rows} | ${value.source_family.occurrences} | ${value.scope_boundary.prior_nc_klein_package_rows} | \`${value.source_family.commercial_export_allowed}\` | \`${value.exact_blockers[2]}\` |`,
    '',
    '## NC Flags',
    '',
    `- Derived from NC: \`${value.source_family.derived_from_nc}\`.`,
    `- Commercial export allowed: \`${value.source_family.commercial_export_allowed}\`.`,
    `- Attribution required: \`${value.source_family.attribution_required}\`.`,
    `- Corpus contamination: \`${value.source_family.corpus_contamination}\`.`,
    '',
    '## Exact Blockers',
    '',
    ...value.exact_blockers.map((blocker) => `- \`${blocker}\``),
    '',
    '## Zero Output',
    '',
    '- Transform/candidate/export/definition/lemma/reader-hint/answer/public/route/runtime/accepted/commercial-export/release rows: 0.',
    '',
    '## Non-Acceptance Boundary',
    '',
    ...value.non_acceptance_boundary.map((boundary) => `- ${boundary}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
