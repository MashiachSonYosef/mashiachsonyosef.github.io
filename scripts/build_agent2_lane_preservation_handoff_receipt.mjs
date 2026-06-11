#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json';
const outputMd = 'reports/agent2-lane-preservation-handoff-receipt-2026-06-04.md';

const files = {
  handoff_bundle: 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json',
  manifest: 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json',
  blocker: 'reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json',
  deuteronomy_readiness: 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json',
  deuteronomy_partition: 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json',
  old_dictionary_planning: 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json',
  stale_scan: 'reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json',
};

const bundle = readJson(files.handoff_bundle);
const manifest = readJson(files.manifest);
const blocker = readJson(files.blocker);
const deuteronomyReadiness = readJson(files.deuteronomy_readiness);
const deuteronomyPartition = readJson(files.deuteronomy_partition);
const oldDictionary = readJson(files.old_dictionary_planning);
const staleScan = readJson(files.stale_scan);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_lane_preservation_handoff_receipt',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  target: 'definition/lemma/reader-hint transforms only after source-family lane evidence exists',
  files,
  exact_command_or_script: {
    build: 'node scripts/build_agent2_lane_preservation_handoff_receipt.mjs',
    validate: 'node scripts/validate_agent2_lane_preservation_handoff_receipt.mjs reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json',
  },
  output_artifact: outputJson,
  schema_counts: {
    runnable_pipelines: manifest.runnable_pipelines.length,
    validator_only_checks: manifest.validator_only_checks.length,
    deuteronomy_input_rows: deuteronomyReadiness.counts.rows,
    deuteronomy_input_occurrences: deuteronomyReadiness.counts.occurrences,
    deuteronomy_commercial_clean_candidate_rows: deuteronomyReadiness.counts.commercial_clean_candidate_rows,
    deuteronomy_noncommercial_educational_candidate_rows: deuteronomyReadiness.counts.noncommercial_educational_candidate_rows,
    deuteronomy_partition_plan_rows: deuteronomyPartition.counts.rows,
    old_dictionary_planning_rows: oldDictionary.planning_counts.audited_rows,
    old_dictionary_planning_occurrences: oldDictionary.planning_counts.audited_occurrences,
    old_dictionary_next_missed_rows: oldDictionary.planning_counts.next_missed_rows,
    orot_missed_dictionary_candidate_rows: blocker.restored_required_output_shape.transform_candidate_counts.orot_missed_dictionary_candidate_rows,
    orot_missed_dictionary_unmatched_rows: blocker.restored_required_output_shape.input_rows.orot_missed_dictionary_unmatched_rows,
    stale_reference_hits: staleScan.counts.stale_reference_hits,
  },
  lane_preservation: {
    consume_agent1_lane_classified_rows_only: true,
    blanket_nc_recast: false,
    blanket_block_recast: false,
    commercial_clean_recast_as_nc: false,
    unclassified_rows_consumed_as_candidate_text: 0,
    commercial_clean_and_nc_separated_downstream: true,
    metadata_link_only_definition_text_export: false,
    blocked_review_candidate_text_export: false,
  },
  transform_candidate_counts: {
    deuteronomy_readiness_rows: deuteronomyReadiness.counts.rows,
    deuteronomy_partition_plan_rows: deuteronomyPartition.counts.rows,
    old_dictionary_candidate_text_rows: 0,
    orot_missed_dictionary_candidate_rows: blocker.restored_required_output_shape.transform_candidate_counts.orot_missed_dictionary_candidate_rows,
  },
  zero_emission_counters: {
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
  },
  blocker_rows: {
    orot_unmatched_rows_requiring_changed_source_family_linkage_dictionary_evidence: blocker.restored_required_output_shape.input_rows.orot_missed_dictionary_unmatched_rows,
    old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary: true,
    no_new_agent2_exact_workset_after_deuteronomy_return: true,
  },
  validator: 'scripts/validate_agent2_lane_preservation_handoff_receipt.mjs',
  missing_field_blocker: 'new target/workset/input/schema/validator with lane-classified source rows is required before another transform candidate packet',
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner',
  stop_condition: 'Return this validated handoff/blocker until a new exact lane-classified Agent 2 workset is supplied.',
  zero_boundary: {
    definition_authority: false,
    answer_acceptance: false,
    answer_eligibility: false,
    public_output: false,
    source_license_acceptance: false,
    accepted_gloss_text: false,
    nc_commercial_authorization: false,
  },
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(value) {
  for (const relativePath of Object.values(value.files)) requirePath(relativePath);
  if (value.schema_counts.runnable_pipelines !== 7) throw new Error('runnable pipeline count mismatch');
  if (value.schema_counts.validator_only_checks !== 24) throw new Error('validator-only check count mismatch');
  if (value.schema_counts.deuteronomy_input_rows !== 1334) throw new Error('Deuteronomy row count mismatch');
  if (value.schema_counts.deuteronomy_commercial_clean_candidate_rows !== 1334) throw new Error('Deuteronomy commercial-clean count mismatch');
  if (value.schema_counts.deuteronomy_noncommercial_educational_candidate_rows !== 0) throw new Error('Deuteronomy NC count mismatch');
  if (value.schema_counts.old_dictionary_planning_rows !== 500) throw new Error('old-dictionary planning count mismatch');
  if (value.schema_counts.orot_missed_dictionary_unmatched_rows !== 168) throw new Error('Orot unmatched count mismatch');
  for (const [key, count] of Object.entries(value.zero_emission_counters)) {
    if (count !== 0) throw new Error(`zero_emission_counters.${key} must be 0`);
  }
  for (const [key, flag] of Object.entries(value.zero_boundary)) {
    if (flag !== false) throw new Error(`zero_boundary.${key} must be false`);
  }
}

function requirePath(relativePath) {
  if (!fs.existsSync(path.join(root, cleanRelativePath(relativePath)))) throw new Error(`missing path ${relativePath}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(relativePath, value) {
  const lines = [
    '# Agent 2 Lane Preservation Handoff Receipt - 2026-06-04',
    '',
    '## Target',
    '',
    value.target,
    '',
    '## Files',
    '',
    ...Object.entries(value.files).map(([key, file]) => `- ${key}: \`${file}\``),
    '',
    '## Counts',
    '',
    `- Runnable pipelines: ${value.schema_counts.runnable_pipelines}.`,
    `- Validator-only checks: ${value.schema_counts.validator_only_checks}.`,
    `- Deuteronomy input rows / occurrences: ${value.schema_counts.deuteronomy_input_rows} / ${value.schema_counts.deuteronomy_input_occurrences}.`,
    `- Deuteronomy lane split: ${value.schema_counts.deuteronomy_commercial_clean_candidate_rows} commercial-clean / ${value.schema_counts.deuteronomy_noncommercial_educational_candidate_rows} NC.`,
    `- Old-dictionary planning rows / occurrences: ${value.schema_counts.old_dictionary_planning_rows} / ${value.schema_counts.old_dictionary_planning_occurrences}.`,
    `- Orot missed-dictionary candidates / unmatched: ${value.schema_counts.orot_missed_dictionary_candidate_rows} / ${value.schema_counts.orot_missed_dictionary_unmatched_rows}.`,
    `- Stale-reference hits: ${value.schema_counts.stale_reference_hits}.`,
    '',
    '## Lane Preservation',
    '',
    '- Consume Agent 1 lane-classified rows only.',
    '- Do not blanket-NC, blanket-block, or recast commercial-clean as NC.',
    '- Do not consume unclassified rows as candidate text.',
    '- Do not consume/export candidate text without exact Agent 6 boundary.',
    '',
    '## Blocker',
    '',
    `\`${value.missing_field_blocker}\``,
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${value.handoff_owner}`,
    `- Stop condition: ${value.stop_condition}`,
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, answer eligibility, accepted text, public output, source/license acceptance, or NC commercial authorization is claimed.',
    '',
  ];
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), lines.join('\n'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
