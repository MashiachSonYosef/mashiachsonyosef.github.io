#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  queue: 'data/control/spark_standing_queue.json',
  deuteronomyStaffing: 'reports/agent7-deuteronomy-orot-level-pipeline-staffing-2026-06-04.md',
  deuteronomyMap: 'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json',
  outputJson: 'reports/agent1-per-book-source-license-custody-contract-template-2026-06-04.json',
  outputMd: 'reports/agent1-per-book-source-license-custody-contract-template-2026-06-04.md'
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readTextIfExists(relativePath) {
  const file = fullPath(relativePath);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
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

const queue = readJson(PATHS.queue);
const target = queue.current_per_book_pipeline_target;
assert(target?.target, 'current_per_book_pipeline_target.target is missing');

const agent1Slot = (target.lane_slots || []).find((slot) => slot.lane === 'Agent 1 / Spark-1');
assert(agent1Slot, 'Agent 1 / Spark-1 lane slot is missing');

const staffingText = readTextIfExists(PATHS.deuteronomyStaffing);
const deuteronomyMap = fs.existsSync(fullPath(PATHS.deuteronomyMap)) ? readJson(PATHS.deuteronomyMap) : null;
const deuteronomyRunnable = deuteronomyMap?.status === 'agent1_deuteronomy_source_license_custody_map_prepared_for_agent6_boundary_only' &&
  deuteronomyMap?.source_license_counts?.row_count_covered === 1334 &&
  deuteronomyMap?.source_license_counts?.occurrence_count_covered === 2964;
const candidateInputHints = [
  'data/sources/deuteronomy.json',
  'data/sources/*-on-deuteronomy.json',
  'data/lexical/*deuteronomy*',
  'Deuteronomy public-HUD data'
].filter((hint) => staffingText.includes(hint) || target.target === 'tanakh/deuteronomy');

const requiredFields = [
  'book/work target',
  'Agent 1 source/license/custody package owner',
  'exact input files/manifests',
  'exact existing command/script or exact script to author',
  'output artifact path',
  'output JSON schema',
  'validator/gate command',
  'source/license count definitions',
  'commercial_clean classification field',
  'noncommercial_educational_candidate classification field',
  'metadata_link_only classification field',
  'blocked classification field',
  'derived_from_nc flag where applicable',
  'commercial_export_allowed flag where applicable',
  'attribution requirement field',
  'source/custody manifest requirement field',
  'Agent 6 boundary question',
  'stop condition'
];

const template = {
  schema_version: 1,
  artifact_type: 'agent1_per_book_source_license_custody_contract_template',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent1_per_book_source_license_custody_contract_template.mjs',
  status: deuteronomyRunnable ? 'template_ready_with_current_target_runnable' : 'template_ready_with_current_target_blocker',
  active_mode: queue.broad_floor_target?.mode || 'BROAD_CORPUS_EXPANSION',
  current_target: {
    target: target.target,
    mode: target.mode,
    state: target.state,
    lane: agent1Slot.lane,
    item: agent1Slot.item,
    expected_artifact: agent1Slot.expected_artifact,
    stop_condition: agent1Slot.stop_condition,
    exact_blocker_wake_condition: agent1Slot.exact_blocker_wake_condition,
    candidate_input_hints: candidateInputHints,
    routable_now: deuteronomyRunnable,
    blocker: deuteronomyRunnable ? null : 'missing_pipeline_blocker',
    current_map: deuteronomyRunnable ? PATHS.deuteronomyMap : null,
    current_map_counts: deuteronomyRunnable ? deuteronomyMap.source_license_counts : null
  },
  reusable_contract_schema: {
    target: 'string book/work target, for example tanakh/deuteronomy',
    lane: 'Agent 1 / Spark-1',
    package_owner: 'Agent 1',
    exact_inputs: ['string path to source package input/manifests'],
    command: 'node scripts/<agent1_per_book_source_license_custody_builder>.mjs',
    output_json: 'reports/agent1-<target-slug>-source-license-custody-map-<date>.json',
    output_md: 'reports/agent1-<target-slug>-source-license-custody-map-<date>.md',
    validator: 'node scripts/<agent1_per_book_source_license_custody_validator>.mjs',
    counts: {
      work_target_count: 'number',
      row_count_covered: 'number',
      occurrence_count_covered: 'number',
      commercial_clean_rows: 'number',
      commercial_clean_occurrences: 'number',
      noncommercial_educational_rows: 'number',
      noncommercial_educational_occurrences: 'number',
      metadata_link_only_rows: 'number',
      blocked_rows: 'number',
      unmatched_rows: 'number'
    },
    row_fields_required: [
      'row_id',
      'work_target',
      'source_family',
      'source_name',
      'license_label',
      'license_lane',
      'status',
      'derived_from_nc',
      'commercial_export_allowed',
      'attribution_required',
      'owner_use_attestation',
      'source_manifest_path',
      'custody_manifest_path',
      'source_url_or_citation',
      'agent6_boundary_required',
      'blocker_reason'
    ],
    allowed_statuses: [
      'commercial_clean_candidate',
      'noncommercial_educational_candidate',
      'metadata_or_link_only',
      'external_link_only',
      'blocked_or_needs_review'
    ],
    nc_flags: {
      preserve_noncommercial_educational_candidate: true,
      license_lane: 'noncommercial_educational_candidate',
      derived_from_nc: true,
      commercial_export_allowed: false,
      attribution_required: true,
      owner_use_attestation: 'noncommercial_educational_zero_profit_zero_kickback',
      corpus_contamination: false,
      answer_eligible: false,
      public_emit: false
    },
    export_partition_rule: {
      commercial_clean_exports_exclude_nc_by_default: true,
      nc_rows_require_separate_csv_export_or_partition: true,
      do_not_mix_nc_into_commercial_clean_csv: true,
      eligible_nc_rows_are_not_generic_blocked: true,
      future_contract_must_write_check_nc_educational_partition_when_schema_supplied: true
    }
  },
  required_fields: requiredFields,
  missing_fields_for_current_target: deuteronomyRunnable ? [] : [
    'exact Deuteronomy-specific source package input artifact',
    'exact Deuteronomy source/license/custody row schema',
    'existing Deuteronomy source/license/custody build command',
    'Deuteronomy row-level source-family buckets',
    'validator/gate for Deuteronomy source/license/custody map',
    'Agent 6 boundary docket question for exact Deuteronomy source/license/custody package'
  ],
  spark1_handoff: deuteronomyRunnable
    ? 'Current Deuteronomy target has a validated Agent 1 source/license/custody map; Spark-1 may rerun the Deuteronomy build/validate pair if requested.'
    : 'Use this template to author a runnable per-book Agent 1 contract once exact input files, command, output schema, validator, and stop condition are supplied; current Deuteronomy target remains not routable.',
  agent6_boundary: deuteronomyRunnable
    ? 'Agent 6 boundary is required before any Deuteronomy package/export/display/public/answer behavior.'
    : 'Agent 6 boundary is required only after a row-level source/license/custody map exists; no boundary question is ready for the current Deuteronomy blocker.',
  boundary: {
    no_source_provenance_acceptance: true,
    no_license_acceptance: true,
    no_nc_flattening: true,
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

const md = [
  '# Agent 1 Per-Book Source/License/Custody Contract Template - 2026-06-04',
  '',
  `Status: \`${template.status}\`.`,
  '',
  '## Current Target',
  '',
  `target: \`${template.current_target.target}\``,
  `lane: \`${template.current_target.lane}\``,
  `item: \`${template.current_target.item}\``,
  `expected artifact: \`${template.current_target.expected_artifact}\``,
  `routable now: \`${template.current_target.routable_now}\``,
  `blocker: \`${template.current_target.blocker || 'none_for_current_validated_map'}\``,
  template.current_target.current_map ? `current map: \`${template.current_target.current_map}\`` : '',
  '',
  'candidate input hints from staffing/control evidence:',
  '',
  ...(candidateInputHints.length ? candidateInputHints.map((hint) => `- \`${hint}\``) : ['- none']),
  '',
  '## Reusable Contract Fields',
  '',
  ...requiredFields.map((field) => `- ${field}`),
  '',
  '## Required Row Fields',
  '',
  ...template.reusable_contract_schema.row_fields_required.map((field) => `- \`${field}\``),
  '',
  '## Allowed Statuses',
  '',
  ...template.reusable_contract_schema.allowed_statuses.map((status) => `- \`${status}\``),
  '',
  '## NC CSV / Export Separation',
  '',
  '- commercial-clean exports must exclude NC rows by default',
  '- NC educational candidates require a separate CSV/export, partition, table, or sheet',
  '- do not mix NC rows into commercial-clean CSV/export rows',
  '- eligible NC rows are `noncommercial_educational_candidate`, not generic blocked solely because they are NC',
  '- new dictionary sources are not blanket NC and must be classified source-by-source from actual source/license evidence',
  '- metadata/link-only rows emit citation/link-only output only and no definition text',
  '- blocked/review rows stay excluded from candidate text exports',
  '- future contracts must write/check the separated NC educational CSV/export partition when exact input/output/schema/validator are supplied',
  '- required NC flags: `license_lane=noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `corpus_contamination=false`, `answer_eligible=false`, `public_emit=false`',
  '',
  '## Current Missing Fields',
  '',
  ...(template.missing_fields_for_current_target.length ? template.missing_fields_for_current_target.map((field) => `- ${field}`) : ['- none for the current validated Deuteronomy map']),
  '',
  '## Handoff',
  '',
  `Spark-1 handoff: ${template.spark1_handoff}`,
  `Agent 6 boundary: ${template.agent6_boundary}`,
  '',
  '## Boundary',
  '',
  'No source/provenance/license acceptance, no NC flattening, no QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or public/runtime mutation.',
  ''
].join('\n');

writeJson(PATHS.outputJson, template);
writeText(PATHS.outputMd, md);

console.log(JSON.stringify({
  ok: true,
  output_json: PATHS.outputJson,
  output_md: PATHS.outputMd,
  status: template.status,
  current_target: template.current_target.target,
  routable_now: template.current_target.routable_now,
  blocker: template.current_target.blocker
}, null, 2));
