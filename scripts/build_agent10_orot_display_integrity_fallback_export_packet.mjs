#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-display-integrity-fallback-export-packet-2026-06-03.json';
const outputMd = 'reports/agent10-orot-display-integrity-fallback-export-packet-2026-06-03.md';
const inputs = {
  source_package: 'data/build/orot/reader-hint-placeholder-candidates.json',
  agent6_public_boundary_verdict: 'reports/agent6-orot-public-placeholder-promotion-boundary-verdict-2026-06-03.md',
  current_public_hints: 'data/public-hud/orot/reader-hints.json',
};

const source = readJson(inputs.source_package);
const publicHints = readJson(inputs.current_public_hints);
const sourceRows = source.rows.filter((row) => row.subset === 'display_integrity_tbd');
const publicIds = new Set(Object.keys(publicHints.hints_by_token_id || {}));
const rows = sourceRows.map((row) => ({
  token_id: row.token_id,
  surface: row.surface,
  occurrences: row.occurrences,
  placeholder_kind: 'reader_hint_pending_review',
  review_state: 'placeholder_pending_review',
  placeholder_text: 'TBD',
  display_state: 'pending_reader_hint_review',
  label_status: 'placeholder_pending_review',
  label: row.label,
  answer_eligible: false,
  promote_to_answer: false,
  definition_text_stored_now: false,
  nc_definition_content_stored_now: false,
  definition_candidate_emit_allowed: false,
  public_placeholder_emit_requested: true,
  public_placeholder_emit_allowed_now: false,
  route_jsonl_emit_allowed: false,
  source_rows_emitted: false,
  accepted_text: false,
  merge_safe_no_existing_public_hint: !publicIds.has(row.token_id),
}));

const packet = {
  schema_version: 1,
  artifact_type: 'agent10_orot_display_integrity_fallback_export_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_display_integrity_fallback_export_packet.mjs',
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    status: 'pre_agent6_public_safe_fallback_export_packet',
    direct_public_tbd_fields_removed: true,
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
    no_agent4_route: true,
  },
  inputs: withHashes(inputs),
  summary: {
    source_rows: sourceRows.length,
    fallback_export_candidate_rows: rows.length,
    fallback_export_candidate_occurrences: sum(rows.map((row) => row.occurrences)),
    public_overlap_rows: rows.filter((row) => !row.merge_safe_no_existing_public_hint).length,
    rows_added_now: 0,
    public_runtime_proof_needed_now: false,
  },
  requested_agent6_boundary: {
    requested_decision: 'clear_or_block_public_safe_runtime_fallback_for_13_display_integrity_rows',
    if_cleared_operation: 'write a public/runtime fallback that renders pending-review placeholder state without using display, inline_display, or counterpart_text as TBD candidate text.',
    not_requested: [
      'definition text clearance',
      'answer eligibility',
      'NC metadata display',
      'accepted gloss or accepted text',
      'route JSONL/source rows',
    ],
  },
  proposed_export_rows: rows,
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
    '# Agent 10 Orot Display-Integrity Fallback Export Packet',
    '',
    `- Fallback candidate rows: ${value.summary.fallback_export_candidate_rows}`,
    `- Fallback candidate occurrences: ${value.summary.fallback_export_candidate_occurrences}`,
    `- Public overlaps: ${value.summary.public_overlap_rows}`,
    `- Rows added now: ${value.summary.rows_added_now}`,
    '',
    'This packet follows Agent 6 blocker guidance by removing `display`, `inline_display`, and `counterpart_text` from placeholder export rows.',
    '',
    'Rows use `placeholder_kind`, `review_state`, `placeholder_text`, and `display_state` only. This is still pre-Agent-6 review and performs no public/runtime mutation.',
    '',
    'Requested Agent 6 decision: clear or block public-safe runtime fallback for the 13 display-integrity rows.',
    '',
    'Outputs now: public HUD rows 0, runtime files 0, route JSONL rows 0, source rows 0, definition-content rows 0, answer rows 0, accepted-text rows 0.',
    '',
  ].join('\n'));
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(command) {
  return execSync(command, { cwd: root, encoding: 'utf8' }).trim();
}
