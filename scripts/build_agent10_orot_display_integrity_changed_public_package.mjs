#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const publicHintsPath = 'data/public-hud/orot/reader-hints.json';
const fallbackPath = 'reports/agent10-orot-display-integrity-fallback-export-packet-2026-06-03.json';
const verdictPath = 'reports/agent6-orot-display-integrity-fallback-export-verdict-2026-06-03.md';
const reportJsonPath = 'reports/agent10-orot-display-integrity-changed-public-package-2026-06-03.json';
const reportMdPath = 'reports/agent10-orot-display-integrity-changed-public-package-2026-06-03.md';

const hints = readJson(publicHintsPath);
const fallback = readJson(fallbackPath);
const hintMapKey = hints.hints && typeof hints.hints === 'object' ? 'hints' : 'hints_by_token_id';
const existingIds = new Set(Object.keys(hints[hintMapKey] || {}));
const rows = fallback.proposed_export_rows.map((row) => {
  if (existingIds.has(row.token_id)) throw new Error(`public hint already exists for ${row.token_id}`);
  return {
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
    public_placeholder_emit_allowed_now: true,
    public_placeholder_emit_docket: verdictPath,
    route_jsonl_emit_allowed: false,
    source_rows_emitted: false,
    accepted_text: false,
    merge_safe_no_existing_public_hint: true,
  };
});

hints.generated_from = [
  hints.generated_from,
  fallbackPath,
].flat().filter(Boolean);
hints.display_boundary = `${hints.display_boundary || hints.hint_policy || 'reader_hint_not_translation_not_definition_authority'}; 13 pending-review placeholder rows are fallback state, not candidate text`;
hints.counts = {
  ...(hints.counts || {}),
  final_hint_count: Number(hints.counts?.final_hint_count || Object.keys(hints[hintMapKey] || {}).length) + rows.length,
  final_hint_occurrences: Number(hints.counts?.final_hint_occurrences || 0) + sum(rows.map((row) => row.occurrences)),
  pending_review_placeholder_rows: rows.length,
  pending_review_placeholder_occurrences: sum(rows.map((row) => row.occurrences)),
};
hints[hintMapKey] = {
  ...(hints[hintMapKey] || {}),
  ...Object.fromEntries(rows.map((row) => [row.token_id, row])),
};
hints.pending_review_placeholders = {
  source_packet: fallbackPath,
  agent6_shape_verdict: verdictPath,
  rows: rows.length,
  occurrences: sum(rows.map((row) => row.occurrences)),
  fields_removed: ['display', 'inline_display', 'counterpart_text'],
  runtime_branch: 'reader_hint_pending_review',
};

writeJson(publicHintsPath, hints);

const report = {
  schema_version: 1,
  artifact_type: 'agent10_orot_display_integrity_changed_public_package',
  generated_at: new Date().toISOString(),
  public_hints_path: publicHintsPath,
  fallback_packet: fallbackPath,
  agent6_shape_verdict: verdictPath,
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  summary: {
    pending_review_rows_added: rows.length,
    pending_review_occurrences_added: sum(rows.map((row) => row.occurrences)),
    public_hint_rows_after: hints.counts.final_hint_count,
    public_hint_occurrences_after: hints.counts.final_hint_occurrences,
    current_public_overlaps: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    source_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
  },
  validation_targets: [
    'node --check assets/js/reader-workbench.js',
    'node scripts/validate_agent10_orot_display_integrity_changed_public_package.mjs',
    'node scripts/validate_reader_workbench_runtime.mjs',
  ],
  source_hashes: {
    public_hints_sha256_after: sha(publicHintsPath),
    fallback_packet_sha256: sha(fallbackPath),
    agent6_shape_verdict_sha256: sha(verdictPath),
  },
};
writeJson(reportJsonPath, report);
writeMd(reportMdPath, report);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}
function writeMd(file, value) {
  fs.writeFileSync(path.join(root, file), [
    '# Agent 10 Orot Display-Integrity Changed Public Package',
    '',
    `- Pending-review rows added: ${value.summary.pending_review_rows_added}`,
    `- Pending-review occurrences added: ${value.summary.pending_review_occurrences_added}`,
    `- Public hint rows after: ${value.summary.public_hint_rows_after}`,
    `- Route JSONL rows: ${value.summary.route_jsonl_rows}`,
    `- Definition-content rows: ${value.summary.definition_content_rows}`,
    `- Answer rows: ${value.summary.answer_rows}`,
    `- Accepted-text rows: ${value.summary.accepted_text_rows}`,
    '',
    'The added rows use pending-review placeholder fields only. They do not emit `display`, `inline_display`, or `counterpart_text`.',
    '',
  ].join('\n'));
}
function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(command) {
  return execSync(command, { cwd: root, encoding: 'utf8' }).trim();
}
