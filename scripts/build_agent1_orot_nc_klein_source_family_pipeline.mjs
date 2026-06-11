#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  contract: 'reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json',
  sourceMap: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json',
  sourceReview: 'reports/agent1-orot-sefaria-nc-aware-family-custody-display-review-2026-06-03.json',
  request: 'reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json',
  package: 'data/build/orot/reader-hint-placeholder-candidates.json',
  agent6Verdict: 'reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md',
  outputJson: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json',
  outputMd: 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md'
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

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '/');
}

const contract = readJson(PATHS.contract);
const existingMap = readJson(PATHS.sourceMap);
const sourceReview = readJson(PATHS.sourceReview);
const request = readJson(PATHS.request);
const packageArtifact = readJson(PATHS.package);
const agent6Verdict = readText(PATHS.agent6Verdict);

assert(contract.target.rows === 17, 'contract target rows must be 17');
assert(contract.target.occurrences === 259, 'contract target occurrences must be 259');
assert(existingMap.family_map?.status === 'noncommercial_educational_candidate', 'existing map must classify Klein as noncommercial_educational_candidate');
assert(packageArtifact.counts?.noncommercial_educational_rows === 17, 'package NC row count must be 17');
assert(packageArtifact.counts?.noncommercial_educational_occurrences === 259, 'package NC occurrence count must be 259');
assert(agent6Verdict.includes('WARN-ACCEPTED'), 'Agent 6 WARN verdict must be present');

const ncRows = existingMap.nc_rows || [];
const occurrenceSum = ncRows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);
assert(ncRows.length === 17, 'NC row count must be 17');
assert(occurrenceSum === 259, 'NC occurrence count must be 259');

const output = {
  ...existingMap,
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs',
  pipeline_contract: PATHS.contract,
  status: 'agent1_nc_klein_educational_source_family_map_pipeline_built_for_agent6_boundary_only',
  inputs: {
    contract: PATHS.contract,
    source_map_prior: PATHS.sourceMap,
    source_review: PATHS.sourceReview,
    request: PATHS.request,
    current_orot_package: PATHS.package,
    agent6_verdict: PATHS.agent6Verdict
  },
  source_review_summary: sourceReview.summary,
  request_boundary_status: request.boundary?.status || null,
  agent6_boundary_state: {
    verdict: 'WARN-ACCEPTED planning evidence only',
    storage_display_public_answer_export_authorized: false
  },
  family_map: {
    ...existingMap.family_map,
    status: 'noncommercial_educational_candidate',
    license_lane: 'noncommercial_educational_candidate',
    rows: 17,
    occurrences: 259,
    derived_from_nc: true,
    commercial_export_allowed: false,
    commercial_export_prohibited: true,
    attribution_required: true,
    owner_use_attestation: 'noncommercial_educational_zero_profit_zero_kickback',
    corpus_contamination: false,
    answer_eligible: false,
    public_emit: false,
    storage_allowed: false,
    display_allowed: false,
    transformed_reader_hint_allowed: false,
    nc_definition_content_storage_allowed_now: false
  },
  nc_rows: ncRows.map((row) => ({
    ...row,
    status: 'noncommercial_educational_candidate',
    license_lane: 'noncommercial_educational_candidate',
    license_group: 'CC_BY_NC',
    derived_from_nc: true,
    commercial_export_allowed: false,
    noncommercial_display_allowed: false,
    attribution_required: true,
    owner_use_attestation: 'noncommercial_educational_zero_profit_zero_kickback',
    corpus_contamination: false,
    answer_eligible: false,
    public_emit: false,
    storage_allowed: false,
    display_allowed: false,
    transformed_reader_hint_allowed: false
  })),
  zero_output_counts: {
    answer_rows: 0,
    source_rows: 0,
    public_hud_rows: 0,
    route_jsonl_rows: 0,
    definition_content_rows: 0,
    nc_definition_content_rows: 0,
    accepted_text_rows: 0
  },
  export_partition_rule: {
    commercial_clean_exports_exclude_nc_by_default: true,
    nc_rows_require_separate_csv_export_or_partition: true,
    do_not_mix_nc_into_commercial_clean_csv: true,
    eligible_nc_rows_are_not_generic_blocked: true,
    future_contract_must_write_check_nc_educational_partition_when_schema_supplied: true
  },
  stop_condition: 'Spark-1 stops after this map plus validator pass, or exact row/count/license flag blocker.',
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
  }
};

const mdRows = output.nc_rows
  .map((row) => `| ${row.priority} | ${row.token_id} | ${row.occurrences} | ${row.license_lane} | ${row.status} | ${row.derived_from_nc} | ${row.commercial_export_allowed} | ${row.noncommercial_display_allowed} | ${row.attribution_required} | ${row.owner_use_attestation} | ${row.corpus_contamination} | ${row.answer_eligible} | ${row.public_emit} |`)
  .join('\n');

const markdown = [
  '# Agent 1 Orot NC/Klein Educational Source Family Map - 2026-06-04',
  '',
  `Status: \`${output.status}\`.`,
  `Pipeline contract: \`${PATHS.contract}\`.`,
  '',
  '## Counts',
  '',
  `- NC/Klein rows / occurrences: \`${output.family_map.rows}\` / \`${output.family_map.occurrences}\``,
  `- current package NC rows / occurrences: \`${packageArtifact.counts.noncommercial_educational_rows}\` / \`${packageArtifact.counts.noncommercial_educational_occurrences}\``,
  `- output answer/source/public HUD/route JSONL/definition-content rows: \`0\``,
  '',
  '## License Flags',
  '',
  '- classification: `noncommercial_educational_candidate`',
  '- `license_lane=noncommercial_educational_candidate`',
  '- `derived_from_nc=true`',
  '- `commercial_export_allowed=false`',
  '- `noncommercial_display_allowed=false`',
  '- `attribution_required=true`',
  '- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`',
  '- `corpus_contamination=false`',
  '- `answer_eligible=false`',
  '- `public_emit=false`',
  '- NC rows remain row-scoped and do not contaminate commercial-clean rows.',
  '- NC rows must stay in a separate educational lane/export partition and must not mix into commercial-clean CSV/export rows.',
  '',
  '## NC Rows',
  '',
  '| Priority | Token ID | Occurrences | License Lane | Status | derived_from_nc | commercial_export_allowed | noncommercial_display_allowed | attribution_required | owner_use_attestation | corpus_contamination | answer_eligible | public_emit |',
  '| ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  mdRows,
  '',
  '## Agent 6 Boundary',
  '',
  'Agent 6 returned `WARN-ACCEPTED` for row-scoped noncommercial educational planning evidence only. No NC storage/display/public/answer/export authorization is granted by this pipeline.',
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
  rows: output.family_map.rows,
  occurrences: output.family_map.occurrences,
  status: output.status
}, null, 2));
