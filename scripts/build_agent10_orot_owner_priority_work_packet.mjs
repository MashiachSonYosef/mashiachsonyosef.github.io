#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-owner-priority-work-packet-2026-06-03.json';
const outputMd = 'reports/agent10-orot-owner-priority-work-packet-2026-06-03.md';
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];

const inputs = {
  agent13_priority: 'reports/agent13-orot-owner-priority-decision-2026-06-03.md',
  agent13_sequence_correction: 'reports/agent13-orot-finish-first-sequencing-correction-2026-06-03.md',
  coverage_repair_candidates: 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json',
  missing_linkage_candidates: 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json',
  dry_run: 'reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.json',
};

const repair = readJson(inputs.coverage_repair_candidates);
const missing = readJson(inputs.missing_linkage_candidates);

const dictionaryRows = repair.rows.map((row) => ({
  row_type: 'missed_dictionary_candidate',
  token_id: row.target_token_id,
  surface: row.surface,
  occurrences: row.occurrences,
  lane: row.lane,
  family_status: row.family_status,
  source_families: row.source_families,
  provisional_label: row.provisional_label,
  counterpart_text: 'TBD',
  placeholder_only: true,
  definition_text_stored_now: false,
  source_license_group: row.source_license_group,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  attribution_required: row.attribution_required,
  corpus_contamination: row.corpus_contamination,
  add_only_if_agent6_clears: true,
}));

const tbdRows = missing.candidates.map((row) => ({
  row_type: 'display_integrity_tbd_placeholder',
  token_id: row.token_id,
  surface: row.surface,
  occurrences: row.occurrences,
  linkage_candidate_bucket: row.linkage_candidate_bucket,
  provisional_label: row.linkage_candidate_bucket === 'project_preferred_function_word_stem_candidate_exists'
    ? 'project-preferred counterpart candidate'
    : 'counterpart candidate',
  counterpart_text: 'TBD',
  display_separator_only: true,
  placeholder_only: true,
  definition_text_stored_now: false,
  answer_eligible: false,
  public_emit_ready: false,
  add_only_if_agent6_clears: true,
}));

const ncRows = dictionaryRows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const commercialRows = dictionaryRows.filter((row) => row.lane === 'commercial_clean_candidate');

const packet = {
  schema_version: 1,
  artifact_type: 'agent10_orot_owner_priority_work_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_owner_priority_work_packet.mjs',
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    status: 'agent13_aligned_pre_agent6_work_packet',
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
  summary: {
    missed_dictionary_candidate_rows: dictionaryRows.length,
    missed_dictionary_candidate_occurrences: sum(dictionaryRows.map((row) => row.occurrences)),
    commercial_clean_candidate_rows: commercialRows.length,
    commercial_clean_candidate_occurrences: sum(commercialRows.map((row) => row.occurrences)),
    nc_candidate_rows: ncRows.length,
    nc_candidate_occurrences: sum(ncRows.map((row) => row.occurrences)),
    display_integrity_tbd_rows: tbdRows.length,
    display_integrity_tbd_occurrences: sum(tbdRows.map((row) => row.occurrences)),
    rows_added_now: 0,
    rows_pending_agent6: dictionaryRows.length + tbdRows.length,
  },
  allowed_provisional_labels: labels,
  nc_klein_rows: ncRows,
  display_integrity_tbd_rows: tbdRows,
  missed_dictionary_candidate_rows: dictionaryRows,
  requested_agent6_decision: {
    requested_boundary: 'clear any safe subset for non-public placeholder addition; block exact rows otherwise',
    prefer_one_safe_row_over_zero: true,
    add_after_clearance_only: true,
    no_public_runtime_route_requested: true,
    objective_4_broad_discovery_after_orot_closeout: true,
    objective_5_fallback_orot_finishing_after_priorities: 'Only after priorities 1-4 are exhausted or blocked, and only through an Agent 6-approved license/legal pipeline.',
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

writeJson(outputJson, packet);
writeMd(outputMd, packet);

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
    '# Agent 10 Orot Owner-Priority Work Packet',
    '',
    `- Missed dictionary candidates: ${value.summary.missed_dictionary_candidate_rows} rows / ${value.summary.missed_dictionary_candidate_occurrences} occurrences`,
    `- Commercial-clean subset: ${value.summary.commercial_clean_candidate_rows} rows / ${value.summary.commercial_clean_candidate_occurrences} occurrences`,
    `- NC/Klein subset: ${value.summary.nc_candidate_rows} rows / ${value.summary.nc_candidate_occurrences} occurrences`,
    `- Explicit TBD display rows: ${value.summary.display_integrity_tbd_rows} rows / ${value.summary.display_integrity_tbd_occurrences} occurrences`,
    `- Rows added now: ${value.summary.rows_added_now}`,
    `- Rows pending Agent 6: ${value.summary.rows_pending_agent6}`,
    '',
    'NC rows remain `noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed=false`, attribution-gated, and `corpus_contamination=false`.',
    '',
    '`TBD` is display separator text only, not a definition, answer, translation, accepted gloss, verified text, or top match.',
    '',
    'Next route: Agent 6 row/subset boundary review, then add only cleared rows. Objective 4 is broad discovery continuation after Orot closeout, not an Agent 4 route. Objective 5 is a next-week fallback bucket only: other Orot-finishing work through an Agent 6-approved license/legal pipeline.',
    '',
  ].join('\n'));
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
}
