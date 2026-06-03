#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-license-safe-cleared-placeholder-package-2026-06-03.json';
const outputMd = 'reports/agent10-orot-license-safe-cleared-placeholder-package-2026-06-03.md';
const inputs = {
  agent6_verdict: 'reports/agent6-orot-license-safe-coverage-repair-add-candidates-verdict-2026-06-03.md',
  add_candidates: 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json',
  owner_priority_packet: 'reports/agent10-orot-owner-priority-work-packet-2026-06-03.json',
};

const verdictText = fs.readFileSync(path.join(root, inputs.agent6_verdict), 'utf8');
const candidates = readJson(inputs.add_candidates);
const ownerPriority = readJson(inputs.owner_priority_packet);
const clearedIds = [...new Set([...verdictText.matchAll(/- `(tok-[^`]+)`/g)].map((match) => match[1]))];
const candidateById = new Map(candidates.rows.map((row) => [row.target_token_id, row]));
const clearedRows = clearedIds.map((id) => candidateById.get(id)).filter(Boolean);
const missingClearedIds = clearedIds.filter((id) => !candidateById.has(id));
const ncRows = clearedRows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const commercialRows = clearedRows.filter((row) => row.lane === 'commercial_clean_candidate');

const packageRows = clearedRows.map((row) => ({
  target_token_id: row.target_token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  lane: row.lane,
  family_status: row.family_status,
  source_families: row.source_families,
  headwords: row.headwords,
  refs_count: row.refs_count,
  provisional_label: row.provisional_label,
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
  cleared_by_agent6_now: true,
  added_to_non_public_placeholder_package: true,
  answer_eligible: false,
  public_emit_ready: false,
}));

const report = {
  schema_version: 1,
  artifact_type: 'agent10_orot_license_safe_cleared_placeholder_package',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_license_safe_cleared_placeholder_package.mjs',
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    status: 'agent6_cleared_non_public_placeholder_package',
    exact_agent6_boundary_only: true,
    non_public_package_only: true,
    no_answer_rows: true,
    no_source_rows_emitted: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_definition_content_rows: true,
    no_nc_definition_content_storage: true,
    no_public_mutation: true,
    no_runtime_mutation: true,
    no_qa_acceptance_beyond_exact_boundary: true,
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
  agent6_verdict_recount: {
    cleared_ids_found_in_verdict: clearedIds.length,
    missing_cleared_ids_in_candidate_packet: missingClearedIds,
    cleared_rows_applied: packageRows.length,
  },
  summary: {
    rows_added_to_non_public_placeholder_package: packageRows.length,
    occurrences_added_to_non_public_placeholder_package: sum(packageRows.map((row) => row.occurrences)),
    commercial_clean_rows_added: commercialRows.length,
    commercial_clean_occurrences_added: sum(commercialRows.map((row) => row.occurrences)),
    nc_rows_added: ncRows.length,
    nc_occurrences_added: sum(ncRows.map((row) => row.occurrences)),
    rows_blocked_within_agent6_verdict_boundary: 0,
    owner_priority_tbd_rows_pending_agent6: ownerPriority.summary.display_integrity_tbd_rows,
    owner_priority_tbd_occurrences_pending_agent6: ownerPriority.summary.display_integrity_tbd_occurrences,
  },
  package_rows: packageRows,
  pending_rows_not_added_here: {
    reason: 'The owner-priority 13 TBD display-integrity rows are not in the Agent 6 verdict consumed by this package.',
    rows: ownerPriority.display_integrity_tbd_rows,
  },
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
};

writeJson(outputJson, report);
writeMd(outputMd, report);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
function withHashes(paths) {
  return Object.fromEntries(Object.entries(paths).flatMap(([key, file]) => [[key, file], [`${key}_sha256`, sha(file)]]));
}
function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}
function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}
function writeMd(file, value) {
  fs.writeFileSync(path.join(root, file), [
    '# Agent 10 Orot License-Safe Cleared Placeholder Package',
    '',
    `- Rows added to non-public placeholder package: ${value.summary.rows_added_to_non_public_placeholder_package}`,
    `- Occurrences added: ${value.summary.occurrences_added_to_non_public_placeholder_package}`,
    `- Commercial-clean rows added: ${value.summary.commercial_clean_rows_added}`,
    `- NC rows added: ${value.summary.nc_rows_added}`,
    `- Blocked inside Agent 6 verdict boundary: ${value.summary.rows_blocked_within_agent6_verdict_boundary}`,
    `- Owner-priority TBD rows still pending Agent 6: ${value.summary.owner_priority_tbd_rows_pending_agent6}`,
    '',
    'This package adds only Agent 6-cleared non-public `TBD` placeholder rows. It does not emit answer rows, source rows, public HUD rows, route JSONL rows, definition content, NC definition content, public assets, or runtime files.',
    '',
  ].join('\n'));
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
}
