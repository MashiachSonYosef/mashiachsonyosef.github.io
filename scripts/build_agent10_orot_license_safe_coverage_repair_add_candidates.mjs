#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json';
const outputMd = 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.md';
const allowedLabels = ['counterpart candidate', 'project-preferred counterpart candidate'];

const inputs = {
  dry_run: 'reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.json',
  agent6_family_boundary: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json',
  agent1_family_boundary: 'reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json',
  transform_spec: 'reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.json',
};

const dryRun = readJson(inputs.dry_run);
const agent6 = readJson(inputs.agent6_family_boundary);
const rows = dryRun.rows.map((row) => ({
  target_token_id: row.token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  lane: row.candidate_lane,
  family_status: row.family_status,
  source_families: row.lexicon_families,
  headwords: row.headwords,
  refs_count: row.refs_count,
  provisional_label: row.counterpart_slot.label,
  placeholder_status: 'placeholder_only',
  counterpart_text: 'TBD',
  placeholder_text_stored_now: true,
  definition_text_stored_now: false,
  source_license_group: row.source_license_group,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  noncommercial_display_planning_allowed: row.noncommercial_display_planning_allowed,
  noncommercial_display_public_or_runtime_authorized: row.noncommercial_display_public_or_runtime_authorized,
  attribution_required: row.attribution_required,
  corpus_contamination: row.corpus_contamination,
  cleared_by_agent6_now: false,
  add_now_before_agent6: false,
  public_emit_ready: false,
}));

const ncRows = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const commercialRows = rows.filter((row) => row.lane === 'commercial_clean_candidate');

const packet = {
  schema_version: 1,
  artifact_type: 'agent10_orot_license_safe_coverage_repair_add_candidates',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_license_safe_coverage_repair_add_candidates.mjs',
  commit_basis: {
    origin_main: exec('git rev-parse origin/main'),
  },
  boundary: {
    status: 'exact_add_candidate_packet_for_agent6_review',
    pre_agent6_review: true,
    no_rows_added_before_agent6: true,
    no_answer_rows: true,
    no_source_rows_emitted: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_definition_content_rows: true,
    no_nc_definition_content_storage: true,
    no_public_mutation: true,
    no_runtime_mutation: true,
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
  upstream_recount: {
    agent6_family_boundary_disposition: agent6.disposition,
    non_public_transform_spec_or_dry_run_may_proceed: agent6.non_public_transform_spec_or_dry_run_may_proceed,
    public_mutation_blocked: agent6.public_mutation_blocked,
    answer_eligibility_authorized: agent6.answer_eligibility_authorized,
    nc_definition_content_storage_authorized: agent6.nc_definition_content_storage_authorized,
  },
  summary: {
    candidate_rows: rows.length,
    candidate_occurrences: sum(rows.map((row) => row.occurrences)),
    commercial_clean_candidate_rows: commercialRows.length,
    commercial_clean_candidate_occurrences: sum(commercialRows.map((row) => row.occurrences)),
    nc_candidate_rows: ncRows.length,
    nc_candidate_occurrences: sum(ncRows.map((row) => row.occurrences)),
    placeholders_added_to_packet: rows.length,
    rows_cleared_by_agent6_now: 0,
    rows_added_now: 0,
    rows_blocked_pending_agent6: rows.length,
    public_runtime_proof_needed_now: false,
  },
  allowed_provisional_labels: allowedLabels,
  requested_agent6_boundary: {
    requested_decision: 'clear_subset_for_non_public_placeholder_add_or_block_each_row',
    if_cleared_operation: 'write only Agent6-cleared placeholder rows into the next non-public Orot reader-hint candidate package; do not write public/runtime assets unless separately cleared.',
    clearable_fields: [
      'target_token_id',
      'surface',
      'occurrences',
      'lane',
      'family_status',
      'source_families',
      'headwords',
      'provisional_label',
      'placeholder_status',
      'counterpart_text',
      'placeholder_text_stored_now',
      'definition_text_stored_now',
      'source_license_group',
      'derived_from_nc',
      'commercial_export_allowed',
      'attribution_required',
      'corpus_contamination',
    ],
    not_requested: [
      'definition text clearance',
      'answer eligibility',
      'public HUD output',
      'runtime/public acceptance',
      'accepted gloss or accepted text',
    ],
  },
  rows,
  outputs_now: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    public_mutation_files: [],
    runtime_files_touched: [],
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

writeJson(outputJson, packet);
writeMarkdown(outputMd, packet);

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
    '# Agent 10 Orot License-Safe Coverage Repair Add-Candidates',
    '',
    '## Summary',
    '',
    `- Candidate rows: ${value.summary.candidate_rows}`,
    `- Candidate occurrences: ${value.summary.candidate_occurrences}`,
    `- Commercial-clean candidates: ${value.summary.commercial_clean_candidate_rows} rows / ${value.summary.commercial_clean_candidate_occurrences} occurrences`,
    `- NC candidates: ${value.summary.nc_candidate_rows} rows / ${value.summary.nc_candidate_occurrences} occurrences`,
    `- Placeholders in packet: ${value.summary.placeholders_added_to_packet}`,
    `- Rows added now: ${value.summary.rows_added_now}`,
    `- Rows blocked pending Agent 6: ${value.summary.rows_blocked_pending_agent6}`,
    '',
    '## Agent 6 Request',
    '',
    value.requested_agent6_boundary.requested_decision,
    '',
    'Allowed provisional labels only: `counterpart candidate`, `project-preferred counterpart candidate`.',
    '',
    'Placeholder English text is `TBD` only. It is not definition text, answer text, translation text, accepted gloss, verified text, or top-match text.',
    '',
    'NC rows remain `CC_BY_NC`, `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, and `corpus_contamination=false`.',
    '',
    '## Files',
    '',
    `- JSON: \`${outputJson}\``,
    `- Markdown: \`${outputMd}\``,
    '',
    '## Counts',
    '',
    '- Answer rows: 0',
    '- Source rows: 0',
    '- Public HUD rows: 0',
    '- Route JSONL rows: 0',
    '- Definition-content rows: 0',
    '- NC definition-content rows: 0',
    '- Public/runtime proof needed now: false',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function exec(command) {
  return execSync(command, { cwd: root, encoding: 'utf8' }).trim();
}
