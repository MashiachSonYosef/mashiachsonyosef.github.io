#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const outputJson = 'reports/agent10-orot-owner-priority-cleared-placeholder-package-2026-06-03.json';
const outputMd = 'reports/agent10-orot-owner-priority-cleared-placeholder-package-2026-06-03.md';
const inputs = {
  agent6_verdict: 'reports/agent6-orot-owner-priority-work-packet-verdict-2026-06-03.md',
  owner_priority_packet: 'reports/agent10-orot-owner-priority-work-packet-2026-06-03.json',
};

const verdictText = fs.readFileSync(path.join(root, inputs.agent6_verdict), 'utf8');
const owner = readJson(inputs.owner_priority_packet);
const clearedIds = [...new Set([...verdictText.matchAll(/- `(tok-[^`]+)`/g)].map((match) => match[1]))];
const sourceRows = [
  ...owner.missed_dictionary_candidate_rows.map((row) => ({ ...row, subset: 'missed_dictionary' })),
  ...owner.display_integrity_tbd_rows.map((row) => ({ ...row, subset: 'display_integrity_tbd' })),
];
const byId = new Map(sourceRows.map((row) => [row.token_id, row]));
const missingIds = clearedIds.filter((id) => !byId.has(id));
const packageRows = clearedIds.map((id) => byId.get(id)).filter(Boolean).map(toPackageRow);
const commercialRows = packageRows.filter((row) => row.subset === 'missed_dictionary' && row.lane === 'commercial_clean_candidate');
const ncRows = packageRows.filter((row) => row.subset === 'missed_dictionary' && row.lane === 'noncommercial_educational_candidate');
const tbdRows = packageRows.filter((row) => row.subset === 'display_integrity_tbd');

const report = {
  schema_version: 1,
  artifact_type: 'agent10_orot_owner_priority_cleared_placeholder_package',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_owner_priority_cleared_placeholder_package.mjs',
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    status: 'agent6_cleared_owner_priority_non_public_placeholder_package',
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
    no_source_mutation: true,
    no_token_index_mutation: true,
    no_lexical_payload_mutation: true,
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
    missing_cleared_ids_in_owner_packet: missingIds,
    cleared_rows_applied: packageRows.length,
  },
  summary: {
    rows_added_to_non_public_placeholder_package: packageRows.length,
    occurrences_added_to_non_public_placeholder_package: sum(packageRows.map((row) => row.occurrences)),
    commercial_clean_rows_added: commercialRows.length,
    commercial_clean_occurrences_added: sum(commercialRows.map((row) => row.occurrences)),
    nc_rows_added: ncRows.length,
    nc_occurrences_added: sum(ncRows.map((row) => row.occurrences)),
    display_integrity_tbd_rows_added: tbdRows.length,
    display_integrity_tbd_occurrences_added: sum(tbdRows.map((row) => row.occurrences)),
    rows_blocked_within_agent6_verdict_boundary: 0,
  },
  package_rows: packageRows,
  outputs_now: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    public_mutation_files: [],
    runtime_files_touched: [],
    source_files_touched: [],
    token_index_files_touched: [],
    lexical_payload_files_touched: [],
  },
};

writeJson(outputJson, report);
writeMd(outputMd, report);

function toPackageRow(row) {
  const isDisplay = row.subset === 'display_integrity_tbd';
  return {
    subset: row.subset,
    target_token_id: row.token_id,
    surface: row.surface,
    occurrences: row.occurrences,
    lane: row.lane || 'display_integrity_tbd_placeholder',
    family_status: row.family_status || null,
    source_families: row.source_families || [],
    headwords: row.headwords || [],
    refs_count: row.refs_count || 0,
    linkage_candidate_bucket: row.linkage_candidate_bucket || null,
    provisional_label: row.provisional_label,
    placeholder_status: 'placeholder_only',
    counterpart_text: 'TBD',
    placeholder_text_stored_now: true,
    definition_text_stored_now: false,
    display_separator_only: isDisplay,
    source_license_group: row.source_license_group || null,
    derived_from_nc: row.derived_from_nc === true,
    commercial_export_allowed: row.commercial_export_allowed ?? null,
    noncommercial_display_public_or_runtime_authorized: row.noncommercial_display_public_or_runtime_authorized === true ? true : false,
    attribution_required: row.attribution_required === true,
    corpus_contamination: row.corpus_contamination === true ? true : false,
    cleared_by_agent6_now: true,
    added_to_non_public_placeholder_package: true,
    answer_eligible: false,
    public_emit_ready: false,
  };
}
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
    '# Agent 10 Orot Owner-Priority Cleared Placeholder Package',
    '',
    `- Rows added to non-public placeholder package: ${value.summary.rows_added_to_non_public_placeholder_package}`,
    `- Occurrences added: ${value.summary.occurrences_added_to_non_public_placeholder_package}`,
    `- Commercial-clean dictionary rows added: ${value.summary.commercial_clean_rows_added}`,
    `- NC/Klein rows added: ${value.summary.nc_rows_added}`,
    `- Display-integrity TBD rows added: ${value.summary.display_integrity_tbd_rows_added}`,
    `- Rows blocked inside Agent 6 verdict boundary: ${value.summary.rows_blocked_within_agent6_verdict_boundary}`,
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
