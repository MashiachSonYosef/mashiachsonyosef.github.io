#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  contract: 'reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json',
  candidatePacket: 'reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json',
  clearedAppend: 'reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json',
  ncReview: 'reports/agent1-orot-sefaria-nc-aware-family-custody-display-review-2026-06-03.json',
  dryRunReview: 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json',
  package: 'data/build/orot/reader-hint-placeholder-candidates.json',
  outputJson: 'reports/agent1-orot-next-missed-source-family-map-2026-06-04.json',
  outputMd: 'reports/agent1-orot-next-missed-source-family-map-2026-06-04.md'
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countBy(rows, getter) {
  const counts = {};
  for (const row of rows) {
    const values = getter(row);
    for (const value of Array.isArray(values) ? values : [values]) {
      const key = String(value || 'unknown');
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}

const contract = readJson(PATHS.contract);
const candidatePacket = readJson(PATHS.candidatePacket);
const clearedAppend = readJson(PATHS.clearedAppend);
const ncReview = readJson(PATHS.ncReview);
const dryRunReview = readJson(PATHS.dryRunReview);
const packageArtifact = readJson(PATHS.package);
const rows = candidatePacket.rows || [];

assert(contract.target.candidate_rows === 50, 'contract candidate_rows must be 50');
assert(contract.target.candidate_occurrences === 1193, 'contract candidate_occurrences must be 1193');
assert(candidatePacket.summary?.candidate_rows === 50, 'candidate packet rows must be 50');
assert(candidatePacket.summary?.candidate_occurrences === 1193, 'candidate packet occurrences must be 1193');
assert(candidatePacket.summary?.commercial_clean_candidate_rows === 50, 'candidate packet commercial-clean rows must be 50');
assert(candidatePacket.summary?.nc_candidate_rows === 0, 'candidate packet NC rows must be 0');
assert(rows.length === 50, 'candidate packet row array must contain 50 rows');

const occurrenceSum = rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
assert(occurrenceSum === 1193, 'candidate row occurrence sum must be 1193');

const sourceFamilyCounts = countBy(rows, (row) => row.source_families || []);
const blockedFamilyCounts = countBy(rows, (row) => row.blocked_source_families_present_but_unused || []);
const categoryCounts = countBy(rows, (row) => row.category);
const statusCounts = countBy(rows, (row) => row.family_status);

const mappedRows = rows.map((row) => ({
  token_id: row.target_token_id,
  surface: row.surface,
  normalized: row.normalized,
  occurrences: row.occurrences,
  source_audit_priority: row.source_audit_priority,
  category: row.category,
  status: 'commercial_clean_candidate',
  license_lane: 'commercial_clean_candidate',
  source_family: (row.source_families || []).join('; '),
  source_name: (row.source_families || []).join('; '),
  license_label: row.source_license_group === 'PUBLIC_DOMAIN_OBSERVED' ? 'public-domain-observed' : String(row.source_license_group || 'unknown'),
  source_license_group: row.source_license_group,
  source_families: row.source_families || [],
  blocked_source_families_present_but_unused: row.blocked_source_families_present_but_unused || [],
  derived_from_nc: false,
  commercial_export_allowed: false,
  owner_use_attestation: null,
  commercial_export_allowed_now_reason: 'Agent 6/package boundary still required before any export behavior.',
  attribution_required: Boolean(row.attribution_required),
  corpus_contamination: false,
  source_url_or_citation: 'candidate packet source references and response hashes preserved in reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json',
  agent6_boundary_required: true,
  placeholder_status: row.placeholder_status,
  counterpart_text: row.counterpart_text,
  definition_text_stored_now: false,
  answer_eligible: false,
  public_emit: false,
  public_emit_ready: false,
  exact_blocker_if_blocked: (row.blocked_source_families_present_but_unused || []).includes('BDB Augmented Strong')
    ? 'BDB Augmented Strong remains present-but-unused metadata only; independent source/license/custody evidence required before use.'
    : null
}));

const output = {
  schema_version: 1,
  artifact_type: 'agent1_orot_next_missed_source_family_map',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs',
  status: 'agent1_next_missed_source_family_map_built_for_agent6_boundary_only',
  pipeline_contract: PATHS.contract,
  inputs: {
    contract: PATHS.contract,
    candidate_packet: PATHS.candidatePacket,
    cleared_append: PATHS.clearedAppend,
    nc_review: PATHS.ncReview,
    dry_run_review: PATHS.dryRunReview,
    current_orot_package: PATHS.package
  },
  target_counts: {
    candidate_rows: 50,
    candidate_occurrences: 1193,
    commercial_clean_candidate_rows: 50,
    commercial_clean_candidate_occurrences: 1193,
    noncommercial_educational_candidate_rows: 0,
    noncommercial_educational_candidate_occurrences: 0,
    rows_blocked_pending_agent6: candidatePacket.summary.rows_blocked_pending_agent6
  },
  family_statuses: {
    commercial_clean_candidate: {
      rows: 50,
      occurrences: 1193,
      source_license_group: 'PUBLIC_DOMAIN_OBSERVED',
      storage_display_allowed_now: false,
      exact_condition: 'Agent 6 row/subset package boundary required before package behavior.'
    },
    noncommercial_educational_candidate: {
      rows: 0,
      occurrences: 0
    },
    metadata_or_link_only: {
      families: Object.keys(blockedFamilyCounts),
      blocker: 'Present-but-unused blocked families may be carried as metadata only.'
    },
    blocked_or_needs_review: {
      families: Object.keys(blockedFamilyCounts),
      blocker: 'Families lacking independent source/license/custody basis remain blocked.'
    }
  },
  row_status_counts: {
    by_family_status: statusCounts,
    by_category: categoryCounts,
    by_source_family: sourceFamilyCounts,
    by_blocked_family_present_but_unused: blockedFamilyCounts
  },
  rows: mappedRows,
  source_family_blockers: [
    {
      family: 'BDB Augmented Strong',
      status: 'blocked_or_needs_review',
      license_lane: 'blocked_or_needs_review',
      exact_blocker: 'Blocked until independent source/license/custody evidence exists; present-but-unused metadata only where named by rows.'
    }
  ],
  commercial_export_separation: {
    commercial_clean_candidate_rows: 50,
    nc_rows: 0,
    commercial_export_allowed_now: false,
    reason: 'Agent 6/package boundary required before export behavior.'
  },
  export_partition_rule: {
    commercial_clean_exports_exclude_nc_by_default: true,
    nc_rows_require_separate_csv_export_or_partition: true,
    do_not_mix_nc_into_commercial_clean_csv: true,
    eligible_nc_rows_are_not_generic_blocked: true,
    metadata_or_link_only_rows_do_not_emit_definition_text: true,
    blocked_or_needs_review_rows_stay_out_of_candidate_text_exports: true
  },
  attribution_requirements: {
    commercial_clean_rows: 'Preserve source families, entry_ids, response_sha256s, and observed public-domain source basis in any downstream manifest.',
    blocked_families: 'Do not use blocked family content without independent source/license/custody evidence.'
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    accepted_text_rows: 0
  },
  source_context: {
    cleared_append_summary: clearedAppend.summary,
    nc_review_status: ncReview.summary?.status || null,
    dry_run_review_status: dryRunReview.summary?.source_license_display_review_status || null,
    current_package_counts: packageArtifact.counts
  },
  agent6_boundary_need: 'Agent 6 must decide exact row/subset behavior if package use is requested.',
  non_acceptance_boundary: {
    no_source_license_acceptance: true,
    no_qa_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_public_runtime_mutation: true
  },
  stop_condition: 'Spark-1 stops after this map plus validator pass, or exact row/count/source-family blocker.'
};

const markdown = [
  '# Agent 1 Orot Next Missed Source Family Map - 2026-06-04',
  '',
  `Status: \`${output.status}\`.`,
  `Pipeline contract: \`${PATHS.contract}\`.`,
  '',
  '## Counts',
  '',
  `- candidate rows / occurrences: \`${output.target_counts.candidate_rows}\` / \`${output.target_counts.candidate_occurrences}\``,
  `- commercial-clean candidate rows / occurrences: \`${output.target_counts.commercial_clean_candidate_rows}\` / \`${output.target_counts.commercial_clean_candidate_occurrences}\``,
  `- NC candidate rows / occurrences: \`${output.target_counts.noncommercial_educational_candidate_rows}\` / \`${output.target_counts.noncommercial_educational_candidate_occurrences}\``,
  `- rows blocked pending Agent 6: \`${output.target_counts.rows_blocked_pending_agent6}\``,
  `- output answer/source/public HUD/route JSONL/definition-content rows: \`0\``,
  '',
  '## Source Family Status',
  '',
  `- source families: ${Object.entries(sourceFamilyCounts).map(([key, value]) => `\`${key}=${value}\``).join(', ')}`,
  `- blocked/present-but-unused families: ${Object.entries(blockedFamilyCounts).map(([key, value]) => `\`${key}=${value}\``).join(', ') || 'none'}`,
  '- BDB Augmented Strong remains metadata-link-only or blocked unless independent source/license/custody evidence appears.',
  '',
  '## Agent 6 Boundary',
  '',
  output.agent6_boundary_need,
  '',
  '## Boundary',
  '',
  'No source/license acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or public/runtime mutation.',
  ''
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  output_json: PATHS.outputJson,
  output_md: PATHS.outputMd,
  rows: output.target_counts.candidate_rows,
  occurrences: output.target_counts.candidate_occurrences,
  status: output.status
}, null, 2));
