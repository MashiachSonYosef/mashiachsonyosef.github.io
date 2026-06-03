#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.json';
const outputMd = 'reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.md';
const inputs = {
  source_package: 'data/build/orot/reader-hint-placeholder-candidates.json',
  agent6_public_boundary_verdict: 'reports/agent6-orot-public-placeholder-promotion-boundary-verdict-2026-06-03.md',
};

const source = readJson(inputs.source_package);
const sourceRows = source.rows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const rows = sourceRows.map((row) => ({
  token_id: row.token_id,
  surface: row.surface,
  occurrences: row.occurrences,
  lane: 'noncommercial_educational_candidate',
  family_status: 'noncommercial_educational_candidate',
  source_license_group: 'CC_BY_NC',
  derived_from_nc: true,
  commercial_export_allowed: false,
  attribution_required: true,
  corpus_contamination: false,
  definition_text_stored_now: false,
  nc_definition_content_stored_now: false,
  public_metadata_display_authorized_now: false,
  public_placeholder_emit_authorized_now: false,
  commercial_export_exclusion_required: true,
  attribution_notice_required: 'Klein Dictionary / CC BY-NC / noncommercial educational lane',
  proposed_public_fields_if_cleared: {
    token_id: row.token_id,
    placeholder_kind: 'reader_hint_pending_review',
    review_state: 'placeholder_pending_review',
    placeholder_text: 'TBD',
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    attribution_notice_key: 'klein_cc_by_nc_noncommercial_educational',
  },
  prohibited_public_fields_without_separate_clearance: [
    'display',
    'inline_display',
    'counterpart_text',
    'definition_text',
    'nc_definition_content',
    'headwords',
    'selected_source_rows',
    'accepted_text',
  ],
}));

const packet = {
  schema_version: 1,
  artifact_type: 'agent10_orot_nc_public_display_boundary_request',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_nc_public_display_boundary_request.mjs',
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    status: 'pre_agent6_nc_public_display_boundary_request',
    pre_agent6_review: true,
    no_public_mutation_now: true,
    no_runtime_mutation_now: true,
    no_public_hud_rows_written_now: true,
    no_route_jsonl_rows: true,
    no_route_shard_writes: true,
    no_source_rows: true,
    no_definition_content_rows: true,
    no_nc_definition_content_rows: true,
    no_answer_rows: true,
    no_accepted_text: true,
    no_commercial_export_now: true,
    no_agent4_route: true,
  },
  inputs: withHashes(inputs),
  summary: {
    nc_rows: rows.length,
    nc_occurrences: sum(rows.map((row) => row.occurrences)),
    rows_added_now: 0,
    public_runtime_proof_needed_now: false,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
  },
  requested_agent6_boundary: {
    requested_decision: 'clear_or_block_nc_metadata_placeholder_display_and_commercial_export_exclusion_contract',
    questions: [
      'May these 17 NC/Klein rows be used in a public/runtime placeholder fallback when only placeholder state plus NC attribution/exclusion metadata is emitted?',
      'Is the proposed attribution notice key sufficient, or must visible attribution text/link be present wherever the placeholder appears?',
      'Must derived_from_nc and commercial_export_allowed remain non-rendered machine metadata, or may they appear in public JSON?',
      'What validator proof is required to show commercial exports exclude these rows?',
    ],
    not_requested: [
      'NC definition content storage',
      'definition text display',
      'answer eligibility',
      'accepted gloss or accepted text',
      'commercial export permission',
    ],
  },
  rows,
  outputs_now: {
    public_hud_rows_written: 0,
    runtime_files_changed: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    source_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
    commercial_export_rows: 0,
  },
};

writeJson(outputJson, packet);
writeMd(outputMd, packet);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function withHashes(files) {
  return Object.fromEntries(Object.entries(files).flatMap(([key, file]) => [
    [key, file],
    [`${key}_sha256`, sha(file)],
  ]));
}
function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}
function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}
function writeMd(file, value) {
  fs.writeFileSync(path.join(root, file), [
    '# Agent 10 Orot NC Public Display Boundary Request',
    '',
    `- NC/Klein rows: ${value.summary.nc_rows}`,
    `- NC/Klein occurrences: ${value.summary.nc_occurrences}`,
    `- Rows added now: ${value.summary.rows_added_now}`,
    '',
    'This packet asks for the separate NC public display / attribution / commercial-export exclusion boundary required by Agent 6.',
    '',
    'It requests no NC definition content, no answer eligibility, no accepted text, no public mutation, and no commercial export permission.',
    '',
    'Proposed public fallback shape, if cleared, is placeholder-state plus NC attribution/exclusion metadata only.',
    '',
  ].join('\n'));
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(command) {
  return execSync(command, { cwd: root, encoding: 'utf8' }).trim();
}
