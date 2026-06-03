#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const inputPath = 'reports/agent10-orot-owner-priority-cleared-placeholder-package-2026-06-03.json';
const outputPath = 'data/build/orot/reader-hint-placeholder-candidates.json';
const reportPath = 'reports/agent10-orot-non-public-reader-hint-placeholder-package-2026-06-03.md';

const input = JSON.parse(fs.readFileSync(path.join(root, inputPath), 'utf8'));
const rows = input.package_rows.map((row) => ({
  token_id: row.target_token_id,
  surface: row.surface,
  occurrences: row.occurrences,
  inline_display: 'TBD',
  display: 'TBD',
  counterpart_text: 'TBD',
  label: row.provisional_label,
  label_status: 'placeholder_only',
  placeholder_status: 'placeholder_only',
  status: 'agent6_cleared_non_public_placeholder',
  subset: row.subset,
  lane: row.lane,
  family_status: row.family_status,
  source_families: row.source_families,
  headwords: row.headwords,
  refs_count: row.refs_count,
  source_license_group: row.source_license_group,
  derived_from_nc: row.derived_from_nc,
  commercial_export_allowed: row.commercial_export_allowed,
  attribution_required: row.attribution_required,
  corpus_contamination: row.corpus_contamination,
  display_separator_only: row.display_separator_only,
  definition_text_stored_now: false,
  nc_definition_content_stored_now: false,
  answer_eligible: false,
  promote_to_answer: false,
  approved_for_public_emit: false,
  public_emit_ready: false,
  public_hud_emit_allowed: false,
  route_jsonl_emit_allowed: false,
  cleared_by_agent6_verdict: input.inputs.agent6_verdict,
}));

const byToken = Object.fromEntries(rows.map((row) => [row.token_id, row]));
const ncRows = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');
const displayRows = rows.filter((row) => row.subset === 'display_integrity_tbd');
const packageData = {
  schema_version: 1,
  artifact_type: 'orot_non_public_reader_hint_placeholder_candidates',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent10_orot_non_public_reader_hint_placeholder_package.mjs',
  target_work: 'orot',
  publication_status: 'non_public_candidate_package_only',
  generated_from: inputPath,
  generated_from_sha256: sha(inputPath),
  commit_basis: { origin_main: exec('git rev-parse origin/main') },
  boundary: {
    exact_agent6_boundary_only: true,
    non_public_package_only: true,
    no_public_hud_output: true,
    no_route_jsonl_rows: true,
    no_route_shard_writes: true,
    no_runtime_files: true,
    no_public_mutation: true,
    no_source_files: true,
    no_token_index_files: true,
    no_lexical_payload_files: true,
    no_definition_content_rows: true,
    no_nc_definition_content_rows: true,
    no_answer_eligibility: true,
    no_accepted_text: true,
  },
  counts: {
    placeholder_rows: rows.length,
    placeholder_occurrences: sum(rows.map((row) => row.occurrences)),
    commercial_clean_rows: rows.filter((row) => row.lane === 'commercial_clean_candidate').length,
    noncommercial_educational_rows: ncRows.length,
    display_integrity_tbd_rows: displayRows.length,
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
  },
  hints_by_token_id: byToken,
  rows,
};

fs.mkdirSync(path.dirname(path.join(root, outputPath)), { recursive: true });
fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(packageData, null, 2)}\n`);
fs.writeFileSync(path.join(root, reportPath), [
  '# Agent 10 Orot Non-Public Reader-Hint Placeholder Package',
  '',
  `- Data package: \`${outputPath}\``,
  `- Rows: ${packageData.counts.placeholder_rows}`,
  `- Occurrences: ${packageData.counts.placeholder_occurrences}`,
  `- Commercial-clean rows: ${packageData.counts.commercial_clean_rows}`,
  `- NC/Klein rows: ${packageData.counts.noncommercial_educational_rows}`,
  `- Display-integrity TBD rows: ${packageData.counts.display_integrity_tbd_rows}`,
  '',
  'This is a non-public candidate package only. It does not mutate `data/public-hud/orot/reader-hints.json`, route JSONL, route shards, runtime files, source files, token-index files, lexical payload files, or definition content.',
  '',
].join('\n'));

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}
function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
function exec(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
}
