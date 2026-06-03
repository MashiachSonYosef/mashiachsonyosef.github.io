#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const publicHintsPath = 'data/public-hud/orot/reader-hints.json';
const requestPath = 'reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.json';
const verdictPath = 'reports/agent6-orot-nc-public-display-boundary-verdict-2026-06-03.md';
const reportJsonPath = 'reports/agent10-orot-nc-changed-public-package-2026-06-03.json';
const reportMdPath = 'reports/agent10-orot-nc-changed-public-package-2026-06-03.md';

const hints = readJson(publicHintsPath);
const request = readJson(requestPath);
const hintMapKey = hints.hints && typeof hints.hints === 'object' ? 'hints' : 'hints_by_token_id';
const existingIds = new Set(Object.keys(hints[hintMapKey] || {}));
const attributionNotice = 'Klein Dictionary CC BY-NC noncommercial educational; no definition content displayed';
const rows = request.rows.map((row) => {
  if (existingIds.has(row.token_id)) throw new Error(`public hint already exists for ${row.token_id}`);
  return {
    token_id: row.token_id,
    placeholder_kind: 'reader_hint_pending_review',
    review_state: 'placeholder_pending_review',
    placeholder_text: 'TBD',
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    attribution_notice_key: 'klein_cc_by_nc_noncommercial_educational',
    attribution_notice: attributionNotice,
    noncommercial_educational_candidate: true,
    commercial_export_exclusion_required: true,
    corpus_contamination: false,
    nc_definition_content_stored_now: false,
    definition_text_stored_now: false,
    answer_eligible: false,
    accepted_text: false,
    public_placeholder_emit_docket: verdictPath,
  };
});

hints.generated_from = [
  hints.generated_from,
  requestPath,
].flat().filter(Boolean);
hints.display_boundary = `${hints.display_boundary || hints.hint_policy || 'reader_hint_not_translation_not_definition_authority'}; 17 NC pending-review placeholders are attribution-gated fallback state, not candidate text`;
hints.counts = {
  ...(hints.counts || {}),
  final_hint_count: Number(hints.counts?.final_hint_count || Object.keys(hints[hintMapKey] || {}).length) + rows.length,
  final_hint_occurrences: Number(hints.counts?.final_hint_occurrences || 0) + sum(request.rows.map((row) => row.occurrences)),
  pending_review_placeholder_rows: Number(hints.counts?.pending_review_placeholder_rows || 0) + rows.length,
  pending_review_placeholder_occurrences: Number(hints.counts?.pending_review_placeholder_occurrences || 0) + sum(request.rows.map((row) => row.occurrences)),
  nc_pending_review_placeholder_rows: rows.length,
  nc_pending_review_placeholder_occurrences: sum(request.rows.map((row) => row.occurrences)),
};
hints[hintMapKey] = {
  ...(hints[hintMapKey] || {}),
  ...Object.fromEntries(rows.map((row) => [row.token_id, row])),
};
hints.nc_pending_review_placeholders = {
  source_packet: requestPath,
  agent6_contract_verdict: verdictPath,
  rows: rows.length,
  occurrences: sum(request.rows.map((row) => row.occurrences)),
  attribution_notice: attributionNotice,
  commercial_export_allowed: false,
  commercial_export_exclusion_required: true,
  fields_removed: ['display', 'inline_display', 'counterpart_text', 'headwords', 'selected_source_rows'],
};

writeJson(publicHintsPath, hints);

const report = {
  schema_version: 1,
  artifact_type: 'agent10_orot_nc_changed_public_package',
  generated_at: new Date().toISOString(),
  public_hints_path: publicHintsPath,
  boundary_request: requestPath,
  agent6_contract_verdict: verdictPath,
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  summary: {
    nc_pending_review_rows_added: rows.length,
    nc_pending_review_occurrences_added: sum(request.rows.map((row) => row.occurrences)),
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
    commercial_export_rows: 0,
  },
  validation_targets: [
    'node scripts/validate_agent10_orot_nc_changed_public_package.mjs',
    'node scripts/validate_agent10_orot_nc_commercial_export_exclusion.mjs',
    'node scripts/validate_reader_workbench_runtime.mjs',
  ],
  source_hashes: {
    public_hints_sha256_after: sha(publicHintsPath),
    boundary_request_sha256: sha(requestPath),
    agent6_contract_verdict_sha256: sha(verdictPath),
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
    '# Agent 10 Orot NC Changed Public Package',
    '',
    `- NC pending-review rows added: ${value.summary.nc_pending_review_rows_added}`,
    `- NC pending-review occurrences added: ${value.summary.nc_pending_review_occurrences_added}`,
    `- Public hint rows after: ${value.summary.public_hint_rows_after}`,
    `- Public hint occurrences after: ${value.summary.public_hint_occurrences_after}`,
    `- Route JSONL rows: ${value.summary.route_jsonl_rows}`,
    `- Definition-content rows: ${value.summary.definition_content_rows}`,
    `- NC definition-content rows: ${value.summary.nc_definition_content_rows}`,
    `- Answer rows: ${value.summary.answer_rows}`,
    `- Commercial export rows: ${value.summary.commercial_export_rows}`,
    '',
    'The added rows use placeholder-state plus visible attribution notice and commercial-export exclusion metadata only.',
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
