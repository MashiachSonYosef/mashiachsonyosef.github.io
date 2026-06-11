#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  correction: 'reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md',
  preview: 'reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json',
  ncMap: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json',
  nextMissedMap: 'reports/agent1-orot-next-missed-source-family-map-2026-06-04.json',
  agent6FamilyVerdict: 'reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json',
  outputJson: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  outputMd: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md'
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
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

function collectFamily(rows, fieldName, family) {
  const matched = rows.filter((row) => (row[fieldName] || []).includes(family));
  return {
    rows: matched.length,
    occurrences: matched.reduce((sum, row) => sum + Number(row.occurrences || 0), 0),
    token_ids_sample: matched.slice(0, 10).map((row) => row.token_id),
    evidence_rows_sample: matched.slice(0, 5).map((row) => ({
      token_id: row.token_id,
      surface: row.surface,
      occurrences: row.occurrences,
      public_domain_lexicons: row.public_domain_lexicons || [],
      blocked_or_unresolved_lexicons: row.blocked_or_unresolved_lexicons || [],
      preview_status: row.preview_status,
      transform_blockers: row.transform_blockers || []
    }))
  };
}

function subsetId(family) {
  return `old-dictionary-excluded-row-license-lane-reaudit::${family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

const correction = readText(PATHS.correction);
const preview = readJson(PATHS.preview);
const ncMap = readJson(PATHS.ncMap);
const nextMissedMap = readJson(PATHS.nextMissedMap);
const agent6Verdict = readJson(PATHS.agent6FamilyVerdict);
const rows = preview.rows || [];

assert(correction.includes('old-dictionary-excluded-row-license-lane-reaudit'), 'correction workset name missing');
assert(preview.summary?.audited_rows === 500, 'preview audited row count must be 500');
assert(preview.summary?.public_domain_observed_rows === 297, 'preview public-domain observed row count must be 297');
assert(preview.summary?.blocked_only_non_public_domain_or_unresolved_rows === 17, 'preview blocked/non-public row count must be 17');
assert(ncMap.family_map?.family === 'Klein Dictionary', 'NC map must be Klein Dictionary');
assert(ncMap.family_map?.rows === 17, 'NC/Klein rows must be 17');
assert(ncMap.family_map?.occurrences === 259, 'NC/Klein occurrences must be 259');
assert(nextMissedMap.target_counts?.candidate_rows === 50, 'next missed map candidate rows must be 50');
assert(rows.length === 500, 'preview row array must contain 500 rows');

const sourceFamilies = [
  {
    source_family: 'Jastrow Dictionary',
    source_name: 'Jastrow Dictionary',
    license_label: 'public-domain-observed',
    license_lane: 'commercial_clean_candidate',
    prior_status: 'old/excluded rows previously not Agent-1 lane-cleared for candidate text',
    evidence: collectFamily(rows, 'public_domain_lexicons', 'Jastrow Dictionary'),
    row_subset_id: subsetId('Jastrow Dictionary'),
    evidence_path: PATHS.preview,
    derived_from_nc: false,
    commercial_export_allowed: true,
    attribution_required: false,
    corpus_contamination: false,
    nc_flags: null,
    missing_evidence: [],
    next_command: 'Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.',
    handoff_owner: 'Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary',
    agent6_boundary_required: true,
    source_url_or_citation: PATHS.preview
  },
  {
    source_family: 'BDB Dictionary',
    source_name: 'BDB Dictionary',
    license_label: 'public-domain-observed',
    license_lane: 'commercial_clean_candidate',
    prior_status: 'old/excluded rows previously not Agent-1 lane-cleared for candidate text',
    evidence: collectFamily(rows, 'public_domain_lexicons', 'BDB Dictionary'),
    row_subset_id: subsetId('BDB Dictionary'),
    evidence_path: PATHS.preview,
    derived_from_nc: false,
    commercial_export_allowed: true,
    attribution_required: false,
    corpus_contamination: false,
    nc_flags: null,
    missing_evidence: [],
    next_command: 'Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.',
    handoff_owner: 'Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary',
    agent6_boundary_required: true,
    source_url_or_citation: PATHS.preview
  },
  {
    source_family: 'BDB Aramaic Dictionary',
    source_name: 'BDB Aramaic Dictionary',
    license_label: 'public-domain-observed',
    license_lane: 'commercial_clean_candidate',
    prior_status: 'old/excluded rows previously not Agent-1 lane-cleared for candidate text',
    evidence: collectFamily(rows, 'public_domain_lexicons', 'BDB Aramaic Dictionary'),
    row_subset_id: subsetId('BDB Aramaic Dictionary'),
    evidence_path: PATHS.preview,
    derived_from_nc: false,
    commercial_export_allowed: true,
    attribution_required: false,
    corpus_contamination: false,
    nc_flags: null,
    missing_evidence: [],
    next_command: 'Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.',
    handoff_owner: 'Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary',
    agent6_boundary_required: true,
    source_url_or_citation: PATHS.preview
  },
  {
    source_family: 'Klein Dictionary',
    source_name: 'Klein Dictionary',
    license_label: 'CC-BY-NC',
    license_lane: 'noncommercial_educational_candidate',
    prior_status: 'old excluded/non-public-domain rows previously treated as blocked or unresolved in some downstream previews',
    evidence: {
      ...collectFamily(rows, 'blocked_or_unresolved_lexicons', 'Klein Dictionary'),
      nc_packet_rows: ncMap.family_map.rows,
      nc_packet_occurrences: ncMap.family_map.occurrences
    },
    row_subset_id: subsetId('Klein Dictionary'),
    evidence_path: PATHS.ncMap,
    derived_from_nc: true,
    commercial_export_allowed: false,
    attribution_required: true,
    corpus_contamination: false,
    nc_flags: {
      derived_from_nc: true,
      commercial_export_allowed: false,
      attribution_required: true,
      owner_use_attestation: 'noncommercial_educational_zero_profit_zero_kickback',
      corpus_contamination: false,
      answer_eligible: false,
      public_emit: false
    },
    missing_evidence: [
      'Agent 6/public boundary before any display/storage/public/answer/export behavior'
    ],
    next_command: 'Keep NC rows in separate educational lane/export partition; Agent 2 may not consume as commercial-clean.',
    handoff_owner: 'Agent 1 for NC lane packet; Agent 6 for exact NC row/subset boundary',
    agent6_boundary_required: true,
    source_url_or_citation: PATHS.ncMap
  },
  {
    source_family: 'BDB Augmented Strong',
    source_name: 'BDB Augmented Strong',
    license_label: 'unresolved-independent-custody',
    license_lane: 'blocked_or_needs_review',
    prior_status: 'old excluded / present-but-unused dictionary family',
    evidence: collectFamily(rows, 'blocked_or_unresolved_lexicons', 'BDB Augmented Strong'),
    row_subset_id: subsetId('BDB Augmented Strong'),
    evidence_path: PATHS.agent6FamilyVerdict,
    derived_from_nc: false,
    commercial_export_allowed: false,
    attribution_required: false,
    corpus_contamination: false,
    nc_flags: null,
    missing_evidence: [
      'independent source/license/custody basis',
      'source URL or version source',
      'license label and allowed fields',
      'Agent 6 boundary if evidence appears'
    ],
    next_command: 'Return independent source/license/custody evidence before any Agent 2 candidate text consumption.',
    handoff_owner: 'Agent 1 if evidence appears; otherwise blocked/review',
    agent6_boundary_required: true,
    source_url_or_citation: PATHS.agent6FamilyVerdict
  }
];

const laneCounts = sourceFamilies.reduce((acc, family) => {
  acc[family.license_lane] = (acc[family.license_lane] || 0) + 1;
  return acc;
}, {
  commercial_clean_candidate: 0,
  noncommercial_educational_candidate: 0,
  metadata_or_link_only: 0,
  blocked_or_needs_review: 0
});

const exactMissingFieldBlockers = sourceFamilies
  .filter((family) => (family.missing_evidence || []).length > 0)
  .map((family) => ({
    row_subset_id: family.row_subset_id,
    source_family: family.source_family,
    license_lane: family.license_lane,
    missing_evidence: family.missing_evidence,
    handoff_owner: family.handoff_owner,
    stop_condition: 'Remain out of Agent 2 candidate text transform until missing source/license/custody evidence and Agent 6 boundary are supplied.'
  }));

const output = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_excluded_row_license_lane_reaudit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs',
  status: 'agent1_old_dictionary_excluded_row_license_lane_reaudit_prepared_for_agent6_boundary_only',
  workset: 'old-dictionary-excluded-row-license-lane-reaudit',
  inputs: PATHS,
  evidence_counts: {
    audited_rows: preview.summary.audited_rows,
    audited_occurrences: preview.summary.audited_occurrences,
    public_domain_observed_rows: preview.summary.public_domain_observed_rows,
    public_domain_observed_occurrences: preview.summary.public_domain_observed_occurrences,
    blocked_only_non_public_domain_or_unresolved_rows: preview.summary.blocked_only_non_public_domain_or_unresolved_rows,
    blocked_only_non_public_domain_or_unresolved_occurrences: preview.summary.blocked_only_non_public_domain_or_unresolved_occurrences,
    no_sefaria_hit_rows: preview.summary.no_sefaria_hit_rows,
    no_sefaria_hit_occurrences: preview.summary.no_sefaria_hit_occurrences,
    next_missed_rows: nextMissedMap.target_counts.candidate_rows,
    next_missed_occurrences: nextMissedMap.target_counts.candidate_occurrences
  },
  allowed_lanes: [
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ],
  lane_source_family_counts: laneCounts,
  exact_missing_field_blockers: exactMissingFieldBlockers,
  source_families: sourceFamilies,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    metadata_or_link_only_emits_citation_link_only: true,
    blocked_or_needs_review_emits_no_candidate_text: true
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  agent6_boundary: 'Agent 6 boundary is required before any candidate text/package use. This packet is source/lane evidence only.',
  non_acceptance_boundary: {
    no_source_license_acceptance: true,
    no_legal_acceptance: true,
    no_definition_authority: true,
    no_runtime_public_acceptance: true,
    no_publication_readiness: true,
    no_product_data_acceptance: true,
    no_answer_acceptance: true,
    no_accepted_gloss_text: true,
    no_nc_commercial_authorization: true,
    no_public_runtime_mutation: true
  },
  stop_condition: 'Stop after source-family / row-subset lane re-audit packet plus validator pass, or exact missing evidence blocker.'
};

const tableRows = sourceFamilies.map((family) => (
  `| ${family.source_family} | ${family.prior_status} | ${family.source_url_or_citation} | ${family.license_lane} | ${family.evidence.rows} / ${family.evidence.occurrences} | ${family.nc_flags ? 'yes' : 'n/a'} | ${(family.missing_evidence || []).join('; ') || 'none'} | ${family.next_command} | ${family.handoff_owner} | ${output.stop_condition} |`
)).join('\n');

const markdown = [
  '# Agent 1 Old Dictionary Excluded Row License-Lane Reaudit - 2026-06-04',
  '',
  `Status: \`${output.status}\`.`,
  `Workset: \`${output.workset}\`.`,
  '',
  '## Counts',
  '',
  `- audited rows / occurrences: \`${output.evidence_counts.audited_rows}\` / \`${output.evidence_counts.audited_occurrences}\``,
  `- public-domain observed rows / occurrences: \`${output.evidence_counts.public_domain_observed_rows}\` / \`${output.evidence_counts.public_domain_observed_occurrences}\``,
  `- blocked-only non-public/unresolved rows / occurrences: \`${output.evidence_counts.blocked_only_non_public_domain_or_unresolved_rows}\` / \`${output.evidence_counts.blocked_only_non_public_domain_or_unresolved_occurrences}\``,
  `- next-missed rows / occurrences included as prior source-family evidence: \`${output.evidence_counts.next_missed_rows}\` / \`${output.evidence_counts.next_missed_occurrences}\``,
  '',
  '## Reaudit Table',
  '',
  '| source/dictionary | prior status | evidence file(s) | proposed lane | row/subset counts | NC flags if applicable | missing evidence | next command | handoff owner | stop condition |',
  '| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |',
  tableRows,
  '',
  '## Export Rule',
  '',
  '- commercial-clean export excludes NC rows',
  '- NC educational export is separate',
  '- metadata/link-only emits citation/link only',
  '- blocked/review emits no candidate text',
  '',
  '## Boundary',
  '',
  'No source/license/legal acceptance, Definition authority, public/runtime mutation, accepted gloss/text, NC commercial authorization, or publication readiness.',
  ''
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  output_json: PATHS.outputJson,
  output_md: PATHS.outputMd,
  status: output.status,
  workset: output.workset,
  families: sourceFamilies.length,
  lane_source_family_counts: laneCounts
}, null, 2));
