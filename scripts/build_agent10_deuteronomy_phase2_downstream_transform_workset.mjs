#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceMatrixPath = 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json';
const sparkRunPath = 'reports/spark1-deuteronomy-phase2-linkage-dedupe-source-route-run-2026-06-04.md';
const outputJsonPath = 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json';
const outputMdPath = 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.md';

const sourceMatrix = readJson(sourceMatrixPath);
const sourceRows = sourceMatrix.rows.filter((row) => row.route_bucket === 'agent2_agent6_boundary_candidate');
const rows = sourceRows.map((row) => {
  const safeLicenses = Array.isArray(row.safe_licenses) ? row.safe_licenses : [];
  const safeSourceNames = Array.isArray(row.safe_source_names) ? row.safe_source_names : [];
  const safeSourceIds = Array.isArray(row.safe_source_ids) ? row.safe_source_ids : [];
  const isNc = safeLicenses.some((license) => /NC|NonCommercial/i.test(String(license)));
  const sourceFamily = deriveSourceFamily(safeSourceNames);
  return {
    token_index_id: row.token_index_id,
    clicked_surface_form: row.clicked_surface_form,
    normalized_form: row.normalized_form,
    occurrence_count: row.occurrence_count,
    export_status: row.export_status,
    route_bucket: row.route_bucket,
    duplicate_key: row.duplicate_key,
    safe_claim_ids: row.safe_claim_ids || [],
    safe_source_names: safeSourceNames,
    safe_source_ids: safeSourceIds,
    safe_licenses: safeLicenses,
    source_family: sourceFamily,
    source_name: unique(safeSourceNames).join('; '),
    license_label: unique(safeLicenses).join('; '),
    license_lane: isNc ? 'noncommercial_educational_candidate' : 'commercial_clean_candidate',
    derived_from_nc: isNc,
    commercial_export_allowed: false,
    commercial_export_candidate: !isNc,
    attribution_required: isNc || safeLicenses.some((license) => /CC BY/i.test(String(license))),
    owner_use_attestation: isNc ? 'noncommercial_educational_zero_profit_zero_kickback' : null,
    corpus_contamination: false,
    source_url_or_citation: buildSourceCitation(row, safeSourceNames, safeSourceIds),
    agent6_boundary_required: true,
    answer_eligible: false,
    public_emit: false,
    source_route_evidence: row.source_route_evidence,
    downstream_boundary: row.downstream_boundary,
    exact_blockers: row.exact_blockers || [],
  };
});

const counts = summarize(rows);
const artifact = {
  schema_version: 1,
  artifact_type: 'agent10_agent2_ready_deuteronomy_phase2_downstream_transform_workset',
  generated_at: new Date().toISOString(),
  status: 'agent2_ready_nonpublic_workset',
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model',
  source_matrix: sourceMatrixPath,
  spark1_run_artifact: sparkRunPath,
  target_work: {
    work_id: 'deuteronomy',
    work_path: 'tanakh/deuteronomy',
    workset: 'deuteronomy-phase2-agent2-downstream-transform-workset',
  },
  counts,
  source_matrix_counts: sourceMatrix.counts,
  nc_csv_separation_policy: {
    policy_artifacts: [
      'reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md',
      'reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md',
      'reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md',
      'reports/agent12-agent8-nc-csv-separation-cap-rule-2026-06-04.md',
      'reports/agent12-agent8-nc-educational-lane-cap-delta-2026-06-04.md',
    ],
    source_lane_gate: 'Every row must carry actual source-by-source lane evidence before Agent 2 output is release/package usable.',
    commercial_clean_exports_exclude_nc_by_default: true,
    mixed_planning_views_are_not_commercial_clean_source: true,
    old_dictionary_excluded_row_reaudit_workset: 'old-dictionary-excluded-row-license-lane-reaudit',
    missing_source_family_lane_classification_is_blocker: true,
    required_nc_flags: [
      'license_lane=noncommercial_educational_candidate',
      'derived_from_nc=true',
      'commercial_export_allowed=false',
      'attribution_required=true',
      'owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback',
      'corpus_contamination=false',
      'answer_eligible=false',
      'public_emit=false',
    ],
  },
  zero_emission_counters: {
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
    public_reader_output_rows: 0,
  },
  agent2_objective: 'Produce a non-public Deuteronomy transform/readiness matrix or exact blocker from these 1334 downstream candidates. Do not emit answer rows, definition text, public HUD rows, route JSONL rows, route shards, accepted text, or public/runtime changes.',
  agent6_boundary_now: 'none_ready_from_agent10_packet',
  agent6_future_boundary: 'Required before any transform/display/source/license/Definition/public/runtime/answer acceptance or public output. Agent 2 output must return to Agent 10 for exact boundary packaging.',
  rows,
  stop_condition: 'Stop after Agent 2 returns a non-public transform/readiness matrix for this exact 1334-row / 2964-occurrence workset, or exact blocker naming missing command/input/output/schema/source/license/morphology requirement.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
  ],
};

fs.writeFileSync(path.join(root, outputJsonPath), `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(path.join(root, outputMdPath), buildReport(artifact));
console.log(`wrote ${outputJsonPath}`);
console.log(`wrote ${outputMdPath}`);
console.log(`rows: ${counts.rows}`);
console.log(`occurrences: ${counts.occurrences}`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function summarize(inputRows) {
  const counts = {
    rows: inputRows.length,
    occurrences: inputRows.reduce((sum, row) => sum + Number(row.occurrence_count || 0), 0),
    license_lanes: {},
    licenses: {},
    sources: {},
    nc_rows: 0,
    nc_occurrences: 0,
    commercial_clean_candidate_rows: 0,
    commercial_clean_candidate_occurrences: 0,
  };
  for (const row of inputRows) {
    addCount(counts.license_lanes, row.license_lane, row.occurrence_count);
    for (const license of row.safe_licenses) addCount(counts.licenses, license, row.occurrence_count);
    for (const source of row.safe_source_names) addCount(counts.sources, source, row.occurrence_count);
    if (row.license_lane === 'noncommercial_educational_candidate') {
      counts.nc_rows += 1;
      counts.nc_occurrences += Number(row.occurrence_count || 0);
    }
    if (row.license_lane === 'commercial_clean_candidate') {
      counts.commercial_clean_candidate_rows += 1;
      counts.commercial_clean_candidate_occurrences += Number(row.occurrence_count || 0);
    }
  }
  return counts;
}

function addCount(bucket, key, occurrences) {
  const normalized = key || 'UNKNOWN';
  if (!bucket[normalized]) bucket[normalized] = { rows: 0, occurrences: 0 };
  bucket[normalized].rows += 1;
  bucket[normalized].occurrences += Number(occurrences || 0);
}

function unique(values) {
  return [...new Set((values || []).filter((value) => value !== null && value !== undefined && String(value).length > 0).map(String))];
}

function deriveSourceFamily(sourceNames) {
  const families = unique((sourceNames || []).map((name) => {
    if (/Wikidata/i.test(name)) return 'wikidata_lexeme';
    if (/OpenScriptures/i.test(name)) return 'openscriptures';
    if (/Project-authored/i.test(name)) return 'project_authored';
    return String(name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'unknown';
  }));
  return families.join('; ');
}

function buildSourceCitation(row, sourceNames, sourceIds) {
  const artifact = row.source_route_evidence?.source_artifact || 'data/public-lexical/by-work/deuteronomy-token-claims-min60.csv';
  return `${artifact}; sources=${unique(sourceNames).join('|') || 'UNKNOWN'}; source_ids=${unique(sourceIds).join('|') || 'UNKNOWN'}`;
}

function buildReport(artifact) {
  return `# Agent 10 Agent2-Ready Deuteronomy Phase-2 Downstream Transform Workset

Date: 2026-06-04

Status: \`${artifact.status}\`

Source matrix:

- \`${artifact.source_matrix}\`
- \`${artifact.spark1_run_artifact}\`

## Counts

- Rows: \`${artifact.counts.rows}\`
- Occurrences: \`${artifact.counts.occurrences}\`
- Commercial-clean candidate rows / occurrences: \`${artifact.counts.commercial_clean_candidate_rows}\` / \`${artifact.counts.commercial_clean_candidate_occurrences}\`
- NC educational rows / occurrences: \`${artifact.counts.nc_rows}\` / \`${artifact.counts.nc_occurrences}\`
- Public/runtime/output/answer/definition/accepted-text emissions: \`0\`

## License Lanes

\`\`\`json
${JSON.stringify(artifact.counts.license_lanes, null, 2)}
\`\`\`

NC policy artifacts:

- \`reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md\`
- \`reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md\`
- \`reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md\`
- \`reports/agent12-agent8-nc-csv-separation-cap-rule-2026-06-04.md\`
- \`reports/agent12-agent8-nc-educational-lane-cap-delta-2026-06-04.md\`

Source lane gate: every row must preserve actual source-family lane evidence before Agent 2 output is release/package usable. NC rows, if any later appear in this lane, must remain separated from commercial-clean export partitions and preserve the owner-use attestation flag.

Old-dictionary excluded-row reaudit remains a separate upstream workset: \`old-dictionary-excluded-row-license-lane-reaudit\`.

## Agent 2 Objective

${artifact.agent2_objective}

## Agent 6 Boundary

Current Agent 6 route: \`${artifact.agent6_boundary_now}\`.

Future Agent 6 boundary: ${artifact.agent6_future_boundary}

## Stop Condition

${artifact.stop_condition}

## Not Accepted

${artifact.what_must_not_be_accepted.join('; ')}.
`;
}
