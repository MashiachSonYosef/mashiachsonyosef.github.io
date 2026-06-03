#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json';
const outputMd = 'reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.md';
const inputs = {
  audit: 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json',
  current_public_hints: 'data/public-hud/orot/reader-hints.json',
  prior_non_public_package: 'data/build/orot/reader-hint-placeholder-candidates.json',
  prior_candidate_packet: 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json',
};
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];
const commercialFamilies = ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary'];
const ncFamilies = ['Klein Dictionary'];

const audit = readJson(inputs.audit);
const usedTokenIds = usedIds([
  inputs.current_public_hints,
  inputs.prior_non_public_package,
  inputs.prior_candidate_packet,
]);

const eligible = audit.rows
  .filter((row) => !usedTokenIds.has(row.token_id))
  .map(toCandidate)
  .filter(Boolean);

const rows = eligible.slice(0, 50);
const commercialRows = rows.filter((row) => row.lane === 'commercial_clean_candidate');
const ncRows = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');

const packet = {
  schema_version: 1,
  artifact_type: 'agent10_orot_next_missed_dictionary_placeholder_candidates',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_next_missed_dictionary_placeholder_candidates.mjs',
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    status: 'pre_agent6_next_missed_dictionary_placeholder_packet',
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
  selection: {
    audit_rows: audit.rows.length,
    excluded_existing_public_or_packaged_token_ids: usedTokenIds.size,
    remaining_allowed_dictionary_rows: eligible.length,
    selected_next_rows: rows.length,
    selected_by: 'audit order after excluding existing public hints and prior non-public placeholder package rows',
    blocked_family_not_used: 'BDB Augmented Strong',
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
  allowed_provisional_labels: labels,
  requested_agent6_boundary: {
    requested_decision: 'clear_subset_for_non_public_placeholder_add_or_block_each_row',
    if_cleared_operation: 'append only Agent6-cleared placeholder rows into the non-public Orot reader-hint placeholder package; do not write public/runtime assets unless separately cleared.',
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
};

writeJson(outputJson, packet);
writeMd(outputMd, packet);

function toCandidate(row) {
  const entries = queryEntries(row);
  const commercial = usableEntries(entries, commercialFamilies);
  const nc = usableEntries(entries, ncFamilies);
  const selected = commercial.length ? commercial : nc;
  if (!selected.length) return null;
  const isNc = !commercial.length && nc.length > 0;
  const families = unique(selected.map((entry) => entry.parent_lexicon));
  return {
    target_token_id: row.token_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    source_audit_priority: row.source_audit_priority,
    category: row.category,
    lane: isNc ? 'noncommercial_educational_candidate' : 'commercial_clean_candidate',
    family_status: isNc ? 'noncommercial_educational_candidate' : 'commercial_clean_candidate',
    source_families: families,
    blocked_source_families_present_but_unused: entries.some((entry) => entry.parent_lexicon === 'BDB Augmented Strong')
      ? ['BDB Augmented Strong']
      : [],
    headwords: unique(selected.map((entry) => entry.headword).filter(Boolean)).slice(0, 12),
    refs_count: sum(selected.map((entry) => entry.refs_count)),
    entry_ids: unique(selected.map((entry) => entry.rid).filter(Boolean)).slice(0, 12),
    response_sha256s: unique((row.query_results || []).map((query) => query.response_sha256).filter(Boolean)).slice(0, 6),
    provisional_label: 'counterpart candidate',
    placeholder_status: 'placeholder_only',
    counterpart_text: 'TBD',
    placeholder_text_stored_now: true,
    definition_text_stored_now: false,
    source_license_group: isNc ? 'CC_BY_NC' : 'PUBLIC_DOMAIN_OBSERVED',
    derived_from_nc: isNc,
    commercial_export_allowed: isNc ? false : null,
    noncommercial_display_planning_allowed: true,
    noncommercial_display_public_or_runtime_authorized: false,
    attribution_required: isNc,
    corpus_contamination: false,
    cleared_by_agent6_now: false,
    add_now_before_agent6: false,
    answer_eligible: false,
    public_emit_ready: false,
  };
}

function queryEntries(row) {
  return (row.query_results || []).flatMap((query) => query.entries || []);
}
function usableEntries(entries, families) {
  return entries.filter((entry) => families.includes(entry.parent_lexicon));
}
function usedIds(files) {
  const ids = new Set();
  for (const file of files) {
    const data = readJson(file);
    for (const row of data.rows || []) ids.add(row.target_token_id || row.token_id);
    for (const row of data.missed_dictionary_candidate_rows || []) ids.add(row.token_id || row.target_token_id);
    for (const id of Object.keys(data.hints_by_token_id || {})) ids.add(id);
  }
  return ids;
}
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
    '# Agent 10 Orot Next Missed-Dictionary Placeholder Candidates',
    '',
    `- Candidate rows: ${value.summary.candidate_rows}`,
    `- Candidate occurrences: ${value.summary.candidate_occurrences}`,
    `- Commercial-clean candidates: ${value.summary.commercial_clean_candidate_rows} rows / ${value.summary.commercial_clean_candidate_occurrences} occurrences`,
    `- NC/Klein candidates: ${value.summary.nc_candidate_rows} rows / ${value.summary.nc_candidate_occurrences} occurrences`,
    `- Rows added now: ${value.summary.rows_added_now}`,
    `- Rows pending Agent 6: ${value.summary.rows_blocked_pending_agent6}`,
    '',
    'These rows are metadata-only placeholders from the existing Sefaria hit audit. They store no definition content, no NC definition content, no answer rows, no public HUD rows, and no route JSONL rows.',
    '',
    'BDB Augmented Strong is recorded only as present-but-unused where applicable.',
    '',
    'Next route: Agent 6 row/subset boundary review, then append only cleared rows to the non-public Orot placeholder package.',
    '',
  ].join('\n'));
}
function unique(values) {
  return [...new Set(values)];
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(command) {
  return execSync(command, { cwd: root, encoding: 'utf8' }).trim();
}
