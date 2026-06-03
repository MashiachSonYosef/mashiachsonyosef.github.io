#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const packagePath = 'data/build/orot/reader-hint-placeholder-candidates.json';
const candidatePath = 'reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json';
const verdictPath = 'reports/agent6-orot-next-missed-dictionary-placeholder-candidates-verdict-2026-06-03.md';
const reportJsonPath = 'reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json';
const reportMdPath = 'reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.md';

const pkg = readJson(packagePath);
const candidate = readJson(candidatePath);
const existing = new Map(pkg.rows.map((row) => [row.token_id, row]));
const rowsToAppend = candidate.rows.map((row) => ({
  token_id: row.target_token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  inline_display: 'TBD',
  display: 'TBD',
  counterpart_text: 'TBD',
  label: row.provisional_label,
  label_status: 'placeholder_only',
  placeholder_status: 'placeholder_only',
  status: 'agent6_cleared_non_public_placeholder',
  subset: 'missed_dictionary_next_batch',
  lane: row.lane,
  family_status: row.family_status,
  source_families: row.source_families,
  blocked_source_families_present_but_unused: row.blocked_source_families_present_but_unused || [],
  headwords: row.headwords,
  refs_count: row.refs_count,
  entry_ids: row.entry_ids,
  response_sha256s: row.response_sha256s,
  source_license_group: row.source_license_group,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  attribution_required: row.attribution_required,
  corpus_contamination: row.corpus_contamination,
  display_separator_only: false,
  definition_text_stored_now: false,
  nc_definition_content_stored_now: false,
  answer_eligible: false,
  promote_to_answer: false,
  approved_for_public_emit: false,
  public_emit_ready: false,
  public_hud_emit_allowed: false,
  route_jsonl_emit_allowed: false,
  cleared_by_agent6_verdict: verdictPath,
}));

const duplicates = rowsToAppend.filter((row) => existing.has(row.token_id));
if (duplicates.length) throw new Error(`duplicate token ids: ${duplicates.map((row) => row.token_id).join(', ')}`);

pkg.rows = [...pkg.rows, ...rowsToAppend];
pkg.hints_by_token_id = Object.fromEntries(pkg.rows.map((row) => [row.token_id, row]));
pkg.generated_from = [
  pkg.generated_from,
  candidatePath,
].flat().filter(Boolean);
pkg.append_history = [
  ...(pkg.append_history || []),
  {
    appended_at: new Date().toISOString(),
    candidate_packet: candidatePath,
    agent6_verdict: verdictPath,
    rows_appended: rowsToAppend.length,
    occurrences_appended: sum(rowsToAppend.map((row) => row.occurrences)),
    commit_basis: exec('git rev-parse origin/main'),
  },
];
pkg.counts = {
  placeholder_rows: pkg.rows.length,
  placeholder_occurrences: sum(pkg.rows.map((row) => row.occurrences)),
  commercial_clean_rows: pkg.rows.filter((row) => row.lane === 'commercial_clean_candidate').length,
  commercial_clean_occurrences: sum(pkg.rows.filter((row) => row.lane === 'commercial_clean_candidate').map((row) => row.occurrences)),
  noncommercial_educational_rows: pkg.rows.filter((row) => row.lane === 'noncommercial_educational_candidate').length,
  noncommercial_educational_occurrences: sum(pkg.rows.filter((row) => row.lane === 'noncommercial_educational_candidate').map((row) => row.occurrences)),
  display_integrity_tbd_rows: pkg.rows.filter((row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd').length,
  display_integrity_tbd_occurrences: sum(pkg.rows.filter((row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd').map((row) => row.occurrences)),
  answer_rows: 0,
  source_rows: 0,
  public_hud_rows: 0,
  route_jsonl_rows: 0,
  definition_content_rows: 0,
  nc_definition_content_rows: 0,
};

writeJson(packagePath, pkg);

const report = {
  schema_version: 1,
  artifact_type: 'agent10_orot_next_missed_dictionary_cleared_append',
  generated_at: new Date().toISOString(),
  package_path: packagePath,
  candidate_packet: candidatePath,
  agent6_verdict: verdictPath,
  source_hashes: {
    package_sha256_after: sha(packagePath),
    candidate_packet_sha256: sha(candidatePath),
    agent6_verdict_sha256: sha(verdictPath),
  },
  summary: {
    rows_appended: rowsToAppend.length,
    occurrences_appended: sum(rowsToAppend.map((row) => row.occurrences)),
    package_rows_after: pkg.counts.placeholder_rows,
    package_occurrences_after: pkg.counts.placeholder_occurrences,
    commercial_clean_rows_after: pkg.counts.commercial_clean_rows,
    commercial_clean_occurrences_after: pkg.counts.commercial_clean_occurrences,
    nc_rows_after: pkg.counts.noncommercial_educational_rows,
    nc_occurrences_after: pkg.counts.noncommercial_educational_occurrences,
    display_integrity_rows_after: pkg.counts.display_integrity_tbd_rows,
    display_integrity_occurrences_after: pkg.counts.display_integrity_tbd_occurrences,
  },
  outputs_now: {
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    token_index_files_changed: 0,
    lexical_payload_files_changed: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    answer_rows: 0,
    accepted_text_rows: 0,
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
    '# Agent 10 Orot Next Missed-Dictionary Cleared Append',
    '',
    `- Rows appended: ${value.summary.rows_appended}`,
    `- Occurrences appended: ${value.summary.occurrences_appended}`,
    `- Package rows after: ${value.summary.package_rows_after}`,
    `- Package occurrences after: ${value.summary.package_occurrences_after}`,
    `- Public HUD rows emitted: ${value.outputs_now.public_hud_rows}`,
    `- Route JSONL rows emitted: ${value.outputs_now.route_jsonl_rows}`,
    `- Definition-content rows emitted: ${value.outputs_now.definition_content_rows}`,
    `- Answer rows emitted: ${value.outputs_now.answer_rows}`,
    '',
    'Only Agent 6-cleared rows from `reports/agent6-orot-next-missed-dictionary-placeholder-candidates-verdict-2026-06-03.md` were appended to the non-public package.',
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
