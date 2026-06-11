#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  source: 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json',
  outputJson: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json',
  outputMd: 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.md'
};

const lanes = [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review'
];

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

function partitionFamily(family) {
  return {
    source_family: family.source_family,
    source_name: family.source_name,
    license_label: family.license_label,
    license_lane: family.license_lane,
    row_count: family.evidence?.rows || 0,
    occurrence_count: family.evidence?.occurrences || 0,
    attribution_required: family.nc_flags?.attribution_required === true,
    derived_from_nc: family.nc_flags?.derived_from_nc === true,
    commercial_export_allowed: family.license_lane === 'commercial_clean_candidate',
    owner_use_attestation: family.nc_flags?.owner_use_attestation || null,
    corpus_contamination: family.nc_flags?.corpus_contamination === false ? false : null,
    answer_eligible: false,
    public_emit: false,
    source_url_or_citation: family.source_url_or_citation,
    agent6_boundary_required: family.agent6_boundary_required === true,
    missing_evidence: family.missing_evidence || [],
    export_behavior: family.license_lane === 'commercial_clean_candidate'
      ? 'commercial_clean_partition_only_no_public_emit'
      : family.license_lane === 'noncommercial_educational_candidate'
        ? 'separate_nc_educational_partition_only_no_commercial_export'
        : family.license_lane === 'metadata_or_link_only'
          ? 'citation_link_only_no_definition_text'
          : 'excluded_from_candidate_text_export'
  };
}

const source = readJson(PATHS.source);
assert(source.artifact_type === 'agent1_old_dictionary_excluded_row_license_lane_reaudit', 'unexpected source artifact_type');
assert(source.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected source workset');

const sourceFamilies = source.source_families || [];
assert(sourceFamilies.length === 5, 'expected five source families');

const partitions = Object.fromEntries(lanes.map((lane) => [lane, []]));
for (const family of sourceFamilies) {
  assert(lanes.includes(family.license_lane), `unexpected lane ${family.license_lane}`);
  partitions[family.license_lane].push(partitionFamily(family));
}

const partitionCounts = Object.fromEntries(lanes.map((lane) => {
  const families = partitions[lane];
  return [lane, {
    source_family_count: families.length,
    row_count: families.reduce((sum, family) => sum + family.row_count, 0),
    occurrence_count: families.reduce((sum, family) => sum + family.occurrence_count, 0)
  }];
}));

const output = {
  schema_version: 1,
  artifact_type: 'agent1_old_dictionary_license_lane_export_partitions',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_old_dictionary_license_lane_export_partitions.mjs',
  status: 'agent1_old_dictionary_license_lane_export_partitions_prepared_for_agent6_boundary_only',
  source_artifact: PATHS.source,
  workset: source.workset,
  partition_counts: partitionCounts,
  count_semantics: {
    partition_counts_are_source_family_hit_totals: true,
    row_count_is_not_exclusive_export_row_count: true,
    reason: 'The same token row may have hits in multiple source families, so lane row_count and occurrence_count sum source-family evidence hits rather than mutually exclusive export rows.',
    exclusive_export_row_counts_authorized_now: false
  },
  partitions,
  export_rule: {
    commercial_clean_export_excludes_nc: true,
    nc_educational_export_separate: true,
    metadata_or_link_only_emits_citation_link_only: true,
    blocked_or_needs_review_emits_no_candidate_text: true,
    commercial_export_allowed_now: false,
    public_emit_now: false,
    answer_eligible_now: false
  },
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    accepted_text_rows: 0
  },
  agent6_boundary: 'Agent 6 boundary is required before any candidate text/package/display/public/answer use.',
  non_acceptance_boundary: source.non_acceptance_boundary,
  stop_condition: 'Stop after separated lane partition packet plus validator pass, or exact missing evidence/schema blocker.'
};

const rows = lanes.map((lane) => {
  const count = partitionCounts[lane];
  const names = partitions[lane].map((family) => family.source_family).join('; ') || 'none';
  return `| ${lane} | ${count.source_family_count} | ${count.row_count} | ${count.occurrence_count} | ${names} |`;
}).join('\n');

const markdown = [
  '# Agent 1 Old Dictionary License-Lane Export Partitions - 2026-06-04',
  '',
  `Status: \`${output.status}\`.`,
  `Source artifact: \`${PATHS.source}\`.`,
  '',
  '## Partition Counts',
  '',
  'Counts below are source-family hit totals, not mutually exclusive export row totals. The same token row may appear in multiple source-family partitions; no candidate text/export/public use is authorized here.',
  '',
  '| lane | source families | row count | occurrence count | source families |',
  '| --- | ---: | ---: | ---: | --- |',
  rows,
  '',
  '## Export Rules',
  '',
  '- commercial-clean partition excludes NC rows',
  '- NC educational partition is separate and has `commercial_export_allowed=false`',
  '- metadata/link-only partition emits citation/link only and no definition text',
  '- blocked/review partition emits no candidate text',
  '- all partitions remain `answer_eligible=false` and `public_emit=false` until exact boundary changes',
  '',
  '## Boundary',
  '',
  'This is source/license/custody partition evidence only. It does not accept source/license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, or NC commercial authorization.',
  ''
].join('\n');

writeJson(PATHS.outputJson, output);
writeText(PATHS.outputMd, markdown);

console.log(JSON.stringify({
  ok: true,
  artifact: PATHS.outputJson,
  report: PATHS.outputMd,
  partition_counts: partitionCounts
}, null, 2));
