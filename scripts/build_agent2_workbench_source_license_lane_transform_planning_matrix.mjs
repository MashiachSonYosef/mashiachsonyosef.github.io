import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceInventoryPath = 'reports/agent1-workbench-source-license-custody-inventory-2026-06-04.json';
const tokenInventoryPath = 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json';
const outputJson = 'reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json';
const outputMd = 'reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.md';

const sourceInventory = readJson(sourceInventoryPath);
const tokenInventory = readJson(tokenInventoryPath);

const matrixRows = (sourceInventory.license_rows || []).map((row) => ({
  source_family: row.source_family,
  source_name: row.source_name,
  license_label: row.license_label,
  license_lane: row.license_lane,
  source_row_count: row.source_row_count,
  attribution_required: row.attribution_required,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  share_alike_required: row.share_alike_required,
  owner_use_attestation: row.owner_use_attestation,
  corpus_contamination: row.corpus_contamination,
  source_url_or_citation: row.source_url_or_citation,
  agent6_boundary_required: row.agent6_boundary_required,
  candidate_text_rows_now: 0,
  definition_content_rows_now: 0,
  answer_eligible_rows_now: 0,
  public_emit_rows_now: 0,
  blocker_to_definition_lemma_reader_hint_candidates: blockerFor(row),
}));

const artifact = {
  schema_version: '1.0',
  artifact_type: 'agent2_workbench_source_license_lane_transform_planning_matrix',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID',
  status: 'nonpublic_workbench_source_license_lane_transform_planning_matrix_pre_agent6_boundary',
  target: 'broad Definition Workbench source-license lane planning after Agent 1 custody inventory',
  inputs: {
    agent1_source_license_custody_inventory: sourceInventoryPath,
    agent2_broad_workbench_token_inventory_5000_return: tokenInventoryPath,
  },
  files: {
    builder: 'scripts/build_agent2_workbench_source_license_lane_transform_planning_matrix.mjs',
    validator: 'scripts/validate_agent2_workbench_source_license_lane_transform_planning_matrix.mjs',
    output_json: outputJson,
    output_md: outputMd,
  },
  exact_command_or_script: {
    build: 'node scripts/build_agent2_workbench_source_license_lane_transform_planning_matrix.mjs',
    validate: `node scripts/validate_agent2_workbench_source_license_lane_transform_planning_matrix.mjs ${outputJson}`,
  },
  source_license_inventory_counts: {
    input_file_count: sourceInventory.counts.input_file_count,
    source_row_count: sourceInventory.counts.source_row_count,
    unique_work_count: sourceInventory.counts.unique_work_count,
    unique_source_id_count: sourceInventory.counts.unique_source_id_count,
    required_field_missing_counts: sourceInventory.required_field_missing_counts,
  },
  token_inventory_counts: {
    token_inventory_top_rows: tokenInventory.schema_counts.inventory_top_tokens,
    distinct_normalized_tokens: tokenInventory.schema_counts.inventory_distinct_normalized_tokens,
    total_tokens: tokenInventory.schema_counts.inventory_total_tokens,
    token_rows_with_source_license_join: 0,
  },
  lane_split: {
    commercial_clean_candidate_license_rows: matrixRows.filter((row) => row.license_lane === 'commercial_clean_candidate').length,
    noncommercial_educational_candidate_license_rows: matrixRows.filter((row) => row.license_lane === 'noncommercial_educational_candidate').length,
    metadata_or_link_only_license_rows: matrixRows.filter((row) => row.license_lane === 'metadata_or_link_only').length,
    blocked_or_needs_review_license_rows: matrixRows.filter((row) => row.license_lane === 'blocked_or_needs_review').length,
    commercial_clean_candidate_source_rows: (sourceInventory.lane_counts.commercial_clean_candidate || {}).source_row_count || 0,
    noncommercial_educational_candidate_source_rows: (sourceInventory.lane_counts.noncommercial_educational_candidate || {}).source_row_count || 0,
    unclassified_rows_consumed_as_candidate_text: 0,
  },
  matrix_rows: matrixRows,
  transform_candidate_counts: {
    definition_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    lemma_candidate_rows: 0,
    candidate_text_rows: 0,
    source_license_lane_planning_rows: matrixRows.length,
  },
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
  missing_field_blocker: 'workbench_token_inventory_missing_per_token_source_license_join_before_definition_lemma_reader_hint_candidates',
  missing_fields: [
    'token_inventory.rows[].source_family',
    'token_inventory.rows[].source_name',
    'token_inventory.rows[].license_label',
    'token_inventory.rows[].license_lane',
    'token_inventory.rows[].source_url_or_citation',
    'token_inventory.rows[].agent6_boundary_required',
  ],
  agent6_boundary_question: 'If a future row/subset package is proposed, may these exact source-license-joined token rows be used/stored/displayed within their preserved license lanes under zero-answer/public flags?',
  validator: `node scripts/validate_agent2_workbench_source_license_lane_transform_planning_matrix.mjs ${outputJson}`,
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Stop at source-license lane planning rows until a per-token source/license join and exact Agent 6 boundary permit candidate text/package/display/public/answer use.',
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

function blockerFor(row) {
  if (row.share_alike_required) return 'cc_by_sa_share_alike_boundary_and_per_token_source_license_join_required';
  return 'per_token_source_license_join_and_exact_agent6_boundary_required';
}

function assertArtifact(value) {
  if (value.matrix_rows.length !== 4) throw new Error('expected 4 license planning rows');
  if (value.source_license_inventory_counts.source_row_count !== 105747) throw new Error('expected 105747 source rows');
  if (value.token_inventory_counts.token_inventory_top_rows !== 5000) throw new Error('expected 5000 token inventory rows');
  if (value.lane_split.commercial_clean_candidate_license_rows !== 4) throw new Error('expected 4 commercial-clean license rows');
  if (value.lane_split.noncommercial_educational_candidate_license_rows !== 0) throw new Error('expected 0 NC license rows');
  if (value.transform_candidate_counts.candidate_text_rows !== 0) throw new Error('candidate text rows must be 0');
  for (const row of value.matrix_rows) {
    if (row.agent6_boundary_required !== true) throw new Error(`${row.license_label} must require Agent 6 boundary`);
    if (row.candidate_text_rows_now !== 0 || row.definition_content_rows_now !== 0 || row.answer_eligible_rows_now !== 0 || row.public_emit_rows_now !== 0) {
      throw new Error(`${row.license_label} violates zero row boundary`);
    }
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
    '# Agent 2 Workbench Source-License Lane Transform Planning Matrix - 2026-06-04',
    '',
    `Status: ${value.status}.`,
    '',
    '## Required Shape',
    'target | files | exact command/script to write or run | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition',
    '',
    '## Target',
    value.target,
    '',
    '## Files',
    `- Agent 1 source/license custody inventory: ${value.inputs.agent1_source_license_custody_inventory}.`,
    `- Agent 2 token inventory return: ${value.inputs.agent2_broad_workbench_token_inventory_5000_return}.`,
    `- Output artifact: ${value.files.output_json}.`,
    `- Companion report: ${value.files.output_md}.`,
    '',
    '## Commands',
    `- Build: \`${value.exact_command_or_script.build}\`.`,
    `- Validate: \`${value.exact_command_or_script.validate}\`.`,
    '',
    '## Schema/Counts',
    `- Source/license rows: ${value.source_license_inventory_counts.source_row_count}.`,
    `- License planning rows: ${value.transform_candidate_counts.source_license_lane_planning_rows}.`,
    `- Commercial-clean license rows/source rows: ${value.lane_split.commercial_clean_candidate_license_rows} / ${value.lane_split.commercial_clean_candidate_source_rows}.`,
    `- NC educational license rows/source rows: ${value.lane_split.noncommercial_educational_candidate_license_rows} / ${value.lane_split.noncommercial_educational_candidate_source_rows}.`,
    `- Token inventory top rows / distinct normalized tokens / total tokens: ${value.token_inventory_counts.token_inventory_top_rows} / ${value.token_inventory_counts.distinct_normalized_tokens} / ${value.token_inventory_counts.total_tokens}.`,
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows now: 0.',
    '',
    '## Validator',
    value.validator,
    '',
    '## Missing-Field Blocker',
    value.missing_field_blocker,
    '',
    '## Handoff Owner',
    value.handoff_owner,
    '',
    '## Stop Condition',
    value.stop_condition,
    '',
    '## Boundary',
    'This is nonpublic source-license lane planning only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}
