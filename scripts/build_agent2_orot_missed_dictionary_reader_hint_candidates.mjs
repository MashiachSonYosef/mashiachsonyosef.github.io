#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const args = parseArgs(process.argv.slice(2));
const limit = Number(args.limit || 50);
const outputJson = args.output || 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json';
const outputMd = args.report || outputJson.replace(/\.json$/u, '.md');
const inputs = {
  audit: 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json',
  current_public_hints: 'data/public-hud/orot/reader-hints.json',
  prior_non_public_package: 'data/build/orot/reader-hint-placeholder-candidates.json',
  prior_candidate_packet: 'reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json',
  oracle9_weekly_order: 'reports/oracle9-weekly-goal-mode-lexicon-expansion-order-2026-06-04.md',
  pipeline_contract: 'reports/agent2-spark2-pipeline-contract-orot-missed-dictionary-reader-hints-2026-06-04.json',
};
const labels = ['counterpart candidate', 'project-preferred counterpart candidate'];
const commercialFamilies = ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary'];
const ncFamilies = ['Klein Dictionary'];
const requiredSourceLaneFields = [
  'source_family',
  'source_name',
  'license_label',
  'license_lane',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'source_url_or_citation',
  'agent6_boundary_required',
];

for (const file of Object.values(inputs)) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`missing required input: ${file}`);
  }
}

const audit = readJson(inputs.audit);
const usedTokenIds = usedIds([
  inputs.current_public_hints,
  inputs.prior_non_public_package,
  inputs.prior_candidate_packet,
]);

const eligible = (audit.rows || [])
  .filter((row) => !usedTokenIds.has(row.token_id))
  .map(toCandidate)
  .filter(Boolean);

const rows = eligible.slice(0, limit);
const classificationPreflight = buildClassificationPreflight(rows);
if (rows.length > 0 && classificationPreflight.missing_classified_row_count > 0 && !args.allowUnclassifiedDryRun) {
  throw new Error(`missing_agent1_source_family_lane_classification: ${classificationPreflight.missing_classified_row_count}/${rows.length} candidate rows lack required Agent 1 lane fields`);
}
const commercialRows = rows.filter((row) => row.lane === 'commercial_clean_candidate');
const ncRows = rows.filter((row) => row.lane === 'noncommercial_educational_candidate');

const packet = {
  schema_version: 1,
  artifact_type: 'agent2_orot_missed_dictionary_reader_hint_candidates',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs',
  commit_basis: { head: exec('git rev-parse HEAD') },
  boundary: {
    status: 'pre_agent6_orot_missed_dictionary_reader_hint_candidate_packet',
    pre_agent6_review: true,
    non_public_reader_hint_candidate_evidence_only: true,
    no_rows_added_before_agent6: true,
    no_answer_rows: true,
    no_answer_eligibility: true,
    no_source_rows_emitted: true,
    no_public_hud_rows: true,
    no_route_jsonl_rows: true,
    no_route_shard_writes: true,
    no_definition_content_rows: true,
    no_nc_definition_content_storage: true,
    no_public_mutation: true,
    no_runtime_mutation: true,
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
    audit_rows: (audit.rows || []).length,
    excluded_existing_public_or_packaged_token_ids: usedTokenIds.size,
    remaining_allowed_dictionary_rows: eligible.length,
    selected_next_rows: rows.length,
    selected_by: 'audit order after excluding existing public hints and prior non-public placeholder package rows',
    limit,
    blocked_family_not_used: 'BDB Augmented Strong',
  },
  summary: {
    candidate_rows: rows.length,
    candidate_occurrences: sum(rows.map((row) => row.occurrences)),
    commercial_clean_candidate_rows: commercialRows.length,
    commercial_clean_candidate_occurrences: sum(commercialRows.map((row) => row.occurrences)),
    noncommercial_educational_candidate_rows: ncRows.length,
    noncommercial_educational_candidate_occurrences: sum(ncRows.map((row) => row.occurrences)),
    metadata_link_only_rows: 0,
    blocked_rows: 0,
    unmatched_rows: Math.max(0, (audit.rows || []).length - usedTokenIds.size - eligible.length),
    rows_cleared_by_agent6_now: 0,
    rows_added_now: 0,
    rows_blocked_pending_agent6: rows.length,
    public_runtime_proof_needed_now: false,
  },
  source_license_counts: {
    commercial_clean_candidate: commercialRows.length,
    noncommercial_educational_candidate: ncRows.length,
    metadata_link_only: 0,
    blocked: 0,
    unmatched: Math.max(0, (audit.rows || []).length - usedTokenIds.size - eligible.length),
  },
  source_family_lane_preflight: classificationPreflight,
  allowed_provisional_labels: labels,
  requested_agent6_boundary: {
    requested_decision: 'clear_exact_subset_for_non_public_reader_hint_candidate_use_or_block_each_row',
    if_cleared_operation: 'append only Agent6-cleared placeholder rows into a non-public Orot reader-hint candidate package; do not write public/runtime assets unless separately cleared.',
    not_requested: [
      'definition text clearance',
      'answer eligibility',
      'public HUD output',
      'route publication support',
      'runtime/public acceptance',
      'accepted gloss or accepted text',
    ],
  },
  rows,
  outputs_now: {
    answer_rows: 0,
    answer_eligible_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    route_shards_written: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    public_mutation_files: [],
    runtime_files_touched: [],
    source_payload_mutation_files: [],
    lexical_payload_mutation_files: [],
    token_index_mutation_files: [],
  },
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss',
    'accepted text',
  ],
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
    license_lane: isNc ? 'noncommercial_educational_candidate' : 'commercial_clean_candidate',
    consumed_from_partition: isNc ? 'noncommercial_educational_candidate' : 'commercial_clean_candidate',
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
    owner_use_attestation: isNc ? 'noncommercial_educational_zero_profit_zero_kickback' : null,
    noncommercial_display_planning_allowed: true,
    noncommercial_display_public_or_runtime_authorized: false,
    attribution_required: isNc,
    corpus_contamination: false,
    cleared_by_agent6_now: false,
    add_now_before_agent6: false,
    answer_eligible: false,
    public_emit: false,
    public_emit_ready: false,
    agent1_source_family_classified: false,
    source_family_classification_status: 'missing_agent1_source_family_lane_classification',
    missing_source_family_lane_fields: requiredSourceLaneFields,
  };
}

function buildClassificationPreflight(rows) {
  const missingRows = rows
    .map((row) => ({
      target_token_id: row.target_token_id,
      lane: row.lane,
      missing_fields: row.agent1_source_family_classified === true
        ? []
        : requiredSourceLaneFields.filter((field) => !(field in row)),
      classification_status: row.source_family_classification_status || 'missing_agent1_source_family_lane_classification',
    }))
    .filter((row) => row.missing_fields.length > 0 || row.classification_status !== 'agent1_classified');
  return {
    required: true,
    policy: 'Agent 2 candidate generation may consume only Agent-1-classified source-family rows. Commercial-clean and NC educational partitions must remain separate; NC rows must preserve NC flags and owner-use attestation.',
    candidate_rows_checked: rows.length,
    fully_classified_row_count: rows.length - missingRows.length,
    missing_classified_row_count: missingRows.length,
    missing_rows: missingRows.slice(0, 50),
    blocks_candidate_text_export: missingRows.length > 0,
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
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, value) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), [
    '# Agent 2 Orot Missed-Dictionary Reader-Hint Candidates',
    '',
    `- Candidate rows: ${value.summary.candidate_rows}`,
    `- Candidate occurrences: ${value.summary.candidate_occurrences}`,
    `- Commercial-clean candidates: ${value.summary.commercial_clean_candidate_rows} rows / ${value.summary.commercial_clean_candidate_occurrences} occurrences`,
    `- NC educational candidates: ${value.summary.noncommercial_educational_candidate_rows} rows / ${value.summary.noncommercial_educational_candidate_occurrences} occurrences`,
    `- Metadata-link-only rows: ${value.summary.metadata_link_only_rows}`,
    `- Blocked rows: ${value.summary.blocked_rows}`,
    `- Unmatched rows: ${value.summary.unmatched_rows}`,
    `- Rows added now: ${value.summary.rows_added_now}`,
    `- Rows pending Agent 6: ${value.summary.rows_blocked_pending_agent6}`,
    '',
    'These rows are non-public reader-hint candidates from the existing Orot Sefaria hit audit. They store no definition content, no NC definition content, no answer rows, no public HUD rows, no route JSONL rows, and no route shard writes.',
    '',
    'BDB Augmented Strong is recorded only as present-but-unused where applicable.',
    '',
    'Next route: Agent 10 first, then Agent 6 row/subset boundary review if routed.',
    '',
    'No Definition authority, answer eligibility, accepted gloss/text, QA/source/license/runtime/publication/product acceptance, public reader output, route publication support, or public/runtime mutation is claimed.',
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
  try {
    return execSync(command, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq > -1) {
      parsed[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      parsed[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return parsed;
}
