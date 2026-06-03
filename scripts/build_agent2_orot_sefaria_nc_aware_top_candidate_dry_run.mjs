#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.json';
const outputMd = 'reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.md';

const inputs = {
  transform_spec: 'reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.json',
  agent6_family_boundary: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json',
  agent1_family_boundary: 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json',
  public_domain_preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json',
  nc_measurement: 'reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json',
};

const spec = readJson(inputs.transform_spec);
const agent6 = readJson(inputs.agent6_family_boundary);
const preview = readJson(inputs.public_domain_preview);
const ncMeasurement = readJson(inputs.nc_measurement);

const commercialRows = preview.rows
  .filter((row) => Number(row.public_domain_observed_entry_count || 0) > 0)
  .sort((a, b) => Number(a.source_audit_priority) - Number(b.source_audit_priority))
  .slice(0, 20)
  .map((row) => ({
    candidate_lane: 'commercial_clean_candidate',
    source_audit_priority: row.source_audit_priority,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    category: row.category,
    agent2_lane: row.agent2_lane,
    lexicon_families: row.public_domain_lexicons,
    headwords: row.public_domain_headwords,
    rids: row.public_domain_rids,
    refs_count: row.public_domain_refs_count,
    refs_sample: row.public_domain_refs_sample,
    citation_metadata_present: row.public_domain_citation_metadata_present,
    relation_class: row.preview_relation_class,
    family_status: 'commercial_clean_candidate',
    source_license_group: 'PUBLIC_DOMAIN_OBSERVED',
    derived_from_nc: false,
    commercial_export_allowed: null,
    noncommercial_display_planning_allowed: true,
    noncommercial_display_public_or_runtime_authorized: false,
    attribution_required: false,
    corpus_contamination: false,
    answer_eligible: false,
    approved_for_public_emit: false,
    public_emit_ready: false,
    emitted_answer_row_now: false,
    source_row_emitted_now: false,
    public_mutation_allowed_here: false,
    definition_content_stored_now: false,
    blockers: [
      'exact_transform_package_review_required_before_output',
      'morphology_or_disambiguation_required_where_relation_is_not_exact',
      'no_definition_content_stored_by_this_dry_run',
    ],
  }));

const ncRows = ncMeasurement.row_lists.nc_commercial_export_exclusion_rows
  .sort((a, b) => Number(a.source_audit_priority) - Number(b.source_audit_priority))
  .map((row) => ({
    candidate_lane: 'noncommercial_educational_candidate',
    source_audit_priority: row.source_audit_priority,
    queue_id: row.queue_id,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    category: row.category,
    agent2_lane: row.agent2_lane,
    lexicon_families: row.nc_source_families || row.lexicon_names,
    headwords: row.headwords,
    rids: [],
    refs_count: row.refs_count,
    refs_sample: [],
    citation_metadata_present: Boolean(row.refs_present || row.source_url_present),
    relation_class: row.rough_hit_class,
    family_status: 'noncommercial_educational_candidate',
    source_license_group: 'CC_BY_NC',
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    noncommercial_display_planning_allowed: true,
    noncommercial_display_public_or_runtime_authorized: false,
    attribution_required: true,
    corpus_contamination: false,
    answer_eligible: false,
    approved_for_public_emit: false,
    public_emit_ready: false,
    emitted_answer_row_now: false,
    source_row_emitted_now: false,
    public_mutation_allowed_here: false,
    definition_content_stored_now: false,
    nc_definition_content_stored_now: false,
    blockers: [
      'exact_transform_package_review_required_before_output',
      'commercial_export_must_exclude_derived_from_nc',
      'no_nc_definition_content_stored_by_this_dry_run',
    ],
  }));

const rows = [...commercialRows, ...ncRows];
const commercialOccurrences = sum(commercialRows.map((row) => row.occurrences));
const ncOccurrences = sum(ncRows.map((row) => row.occurrences));

const report = {
  schema_version: 1,
  artifact_type: 'agent2_orot_sefaria_nc_aware_top_candidate_dry_run',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent2_orot_sefaria_nc_aware_top_candidate_dry_run.mjs',
  boundary: {
    status: 'zero_emission_non_public_candidate_dry_run_only',
    non_public_planning_only: true,
    zero_emission: true,
    no_answer_rows: true,
    no_answer_candidates_emitted: true,
    no_source_rows_emitted: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_definition_content_rows: true,
    no_nc_definition_content_storage: true,
    no_runtime_mutation: true,
    no_source_mutation: true,
    no_token_index_mutation: true,
    no_lexical_payload_mutation: true,
    no_public_mutation: true,
    no_agent4_route: true,
    no_qa_acceptance: true,
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_definition_authority: true,
    no_usage_as_definition_authority: true,
    no_answer_acceptance: true,
    no_public_runtime_acceptance: true,
    no_publication_readiness: true,
    no_route_publication_support: true,
    no_product_data_acceptance: true,
    no_translation_output: true,
    no_accepted_gloss: true,
    no_accepted_text: true,
  },
  inputs: withHashes(inputs),
  upstream_boundary_recount: {
    agent6_disposition: agent6.disposition,
    family_statuses_sufficient_for_non_public_planning_evidence: agent6.family_statuses_sufficient_for_non_public_planning_evidence,
    non_public_transform_spec_or_dry_run_may_proceed: agent6.non_public_transform_spec_or_dry_run_may_proceed,
    public_mutation_blocked: agent6.public_mutation_blocked,
    answer_eligibility_authorized: agent6.answer_eligibility_authorized,
    nc_definition_content_storage_authorized: agent6.nc_definition_content_storage_authorized,
  },
  selection_policy: {
    commercial_clean_selection: 'Top 20 existing public-domain-observed Sefaria rows by source_audit_priority from the Agent 2 preview.',
    nc_selection: 'All 17 existing Klein/CC-BY-NC educational candidate rows from the Agent 2 NC-aware measurement.',
    no_network_calls_performed: true,
    no_definition_text_selected_or_stored: true,
  },
  summary: {
    included_rows: rows.length,
    included_occurrences: commercialOccurrences + ncOccurrences,
    commercial_clean_rows: commercialRows.length,
    commercial_clean_occurrences: commercialOccurrences,
    noncommercial_educational_rows: ncRows.length,
    noncommercial_educational_occurrences: ncOccurrences,
    future_commercial_export_exclusion_rows: ncRows.length,
    future_commercial_export_exclusion_occurrences: ncOccurrences,
    answer_rows_emitted: 0,
    source_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    definition_content_rows_stored: 0,
    nc_definition_content_rows_stored: 0,
  },
  family_status_counts: {
    commercial_clean_candidate: commercialRows.length,
    noncommercial_educational_candidate: ncRows.length,
    blocked: 0,
  },
  rows,
  commercial_export_exclusion_manifest: ncRows.map((row) => ({
    token_id: row.token_id,
    surface: row.surface,
    occurrences: row.occurrences,
    family_status: row.family_status,
    source_license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    noncommercial_display_planning_allowed: true,
    noncommercial_display_public_or_runtime_authorized: false,
    attribution_required: true,
    corpus_contamination: false,
  })),
  next_route_or_blocker: {
    next_route: 'Agent 6 exact review of this zero-emission dry-run if the team wants to convert it into a later non-public fill-producing candidate package.',
    blocker: 'Public/runtime mutation, answer eligibility, source-row emission, and definition-content storage remain blocked until exact Agent 6 package review.',
    agent4_remains_held: true,
  },
  outputs: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    runtime_files_touched: [],
    source_files_touched: [],
    token_index_files_touched: [],
    lexical_payload_files_touched: [],
  },
  agent8_callback: {
    status: 'Agent 2-style NC-aware top candidate dry-run produced by Agent 10 release lane.',
    artifact_path: outputMd,
    artifact_json: outputJson,
    selected_rows: rows.length,
    selected_occurrences: commercialOccurrences + ncOccurrences,
    nc_rows: ncRows.length,
    nc_occurrences: ncOccurrences,
    next_executable_route: 'Route this exact zero-emission dry-run to Agent 6 only if Agent 13/8 wants review for later non-public fill package planning; do not route Agent 4.',
    public_mutation_blocked: true,
    agent4_remains_held: true,
  },
  what_must_not_be_accepted: [
    'QA acceptance',
    'Source/provenance acceptance',
    'License acceptance',
    'Definition authority',
    'Usage-as-definition authority',
    'Answer acceptance',
    'Public/runtime acceptance',
    'Publication readiness',
    'Route publication support',
    'Product/data acceptance',
    'Translation output',
    'Accepted gloss',
    'Accepted text',
  ],
};

writeJson(outputJson, report);
writeMarkdown(outputMd, report);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function withHashes(paths) {
  return Object.fromEntries(Object.entries(paths).flatMap(([key, relativePath]) => [
    [key, relativePath],
    [`${key}_sha256`, sha256(relativePath)],
  ]));
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, value) {
  const lines = [
    '# Agent 2 Orot/Sefaria NC-Aware Top Candidate Dry Run',
    '',
    '## Boundary',
    '',
    'Zero-emission, non-public planning only. No answer rows, source rows, public HUD rows, route JSONL rows, runtime edits, public mutation, or definition-content storage were produced.',
    '',
    '## Inputs',
    '',
    ...Object.entries(value.inputs)
      .filter(([key]) => !key.endsWith('_sha256'))
      .map(([key, relativeInput]) => `- ${key}: \`${relativeInput}\``),
    '',
    '## Summary',
    '',
    `- Included rows: ${value.summary.included_rows}`,
    `- Included occurrences: ${value.summary.included_occurrences}`,
    `- Commercial-clean rows: ${value.summary.commercial_clean_rows}`,
    `- Commercial-clean occurrences: ${value.summary.commercial_clean_occurrences}`,
    `- NC educational rows: ${value.summary.noncommercial_educational_rows}`,
    `- NC educational occurrences: ${value.summary.noncommercial_educational_occurrences}`,
    `- Future commercial-export exclusion rows: ${value.summary.future_commercial_export_exclusion_rows}`,
    `- Future commercial-export exclusion occurrences: ${value.summary.future_commercial_export_exclusion_occurrences}`,
    '',
    '## Selected Rows',
    '',
    '| Lane | Token | Surface | Occurrences | Families | Headwords |',
    '| --- | --- | --- | ---: | --- | --- |',
    ...value.rows.map((row) => `| ${row.candidate_lane} | \`${row.token_id}\` | ${row.surface} | ${row.occurrences} | ${row.lexicon_families.join(', ')} | ${row.headwords.join(', ')} |`),
    '',
    '## NC Commercial Export Exclusion',
    '',
    'All Klein/CC-BY-NC rows in this dry-run carry `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, and `corpus_contamination=false`. No NC definition content is stored.',
    '',
    '## Next Route Or Blocker',
    '',
    `- Next route: ${value.next_route_or_blocker.next_route}`,
    `- Blocker: ${value.next_route_or_blocker.blocker}`,
    `- Agent 4 remains held: ${value.next_route_or_blocker.agent4_remains_held}`,
    '',
    '## Agent 8 Callback',
    '',
    `Status: ${value.agent8_callback.status}`,
    `Artifact path: \`${value.agent8_callback.artifact_path}\``,
    `Artifact JSON: \`${value.agent8_callback.artifact_json}\``,
    `Selected rows: ${value.agent8_callback.selected_rows}`,
    `Selected occurrences: ${value.agent8_callback.selected_occurrences}`,
    `NC rows: ${value.agent8_callback.nc_rows}`,
    `NC occurrences: ${value.agent8_callback.nc_occurrences}`,
    `Next executable route: ${value.agent8_callback.next_executable_route}`,
    `Public mutation blocked: ${value.agent8_callback.public_mutation_blocked}`,
    `Agent 4 remains held: ${value.agent8_callback.agent4_remains_held}`,
    '',
    '## What Must Not Be Accepted',
    '',
    ...value.what_must_not_be_accepted.map((item) => `- ${item}`),
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
