#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJson = 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json';
const outputMd = 'reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.md';

const files = {
  workset: 'reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json',
  workset_report: 'reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.md',
  inventory: '.local-cache/workbench-evidence/token-inventory-5000.json',
  tokens_jsonl: '.local-cache/workbench-evidence/token-inventory-5000.tokens.jsonl',
  blocked_jsonl: '.local-cache/workbench-evidence/token-inventory-5000.blocked.jsonl',
  inventory_report: 'reports/workbench-token-inventory-5000.md',
  intake_validator: 'scripts/validate_agent2_future_workset_intake_packet.mjs',
  inventory_validator: 'scripts/validate_workbench_token_inventory.mjs',
};

const workset = readJson(files.workset);
const inventory = readJson(files.inventory);

const receipt = {
  schema_version: '1.0',
  artifact_type: 'agent2_broad_workbench_token_inventory_5000_return',
  date: '2026-06-04',
  mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  target: 'broad Definition Workbench token inventory expansion, non-public inventory mechanics only',
  workset: workset.workset_id,
  files,
  exact_command_or_script: {
    build: workset.command_or_expected_script,
    validate_inventory: workset.validator_or_gate,
    validate_intake: `node ${files.intake_validator} ${files.workset}`,
    validate_return: `node scripts/validate_agent2_broad_workbench_token_inventory_5000_return.mjs ${outputJson}`,
  },
  output_artifact: outputJson,
  schema_counts: {
    workset_expected_top_token_rows: workset.counts.rows,
    inventory_top_tokens: inventory.top_tokens.length,
    inventory_distinct_normalized_tokens: inventory.counts.distinct_normalized_tokens,
    inventory_total_tokens: inventory.counts.total_tokens,
    source_files_read: inventory.counts.source_files_read,
    allowed_units: inventory.counts.allowed_units,
    blocked_units: inventory.counts.blocked_units,
    blocked_jsonl_rows: countJsonl(files.blocked_jsonl),
    tokens_jsonl_rows: inventory.counts.distinct_normalized_tokens,
  },
  lane_split: {
    source_license_inventory_only: true,
    source_family_lane_rows_present: false,
    commercial_clean_candidate_rows: 0,
    noncommercial_educational_candidate_rows: 0,
    metadata_or_link_only_rows: 0,
    blocked_or_needs_review_rows: 0,
    unclassified_rows_consumed_as_candidate_text: 0,
    downstream_candidate_generation_blocker: 'token_inventory_rows_do_not_carry_source_family_lane_fields',
  },
  transform_candidate_counts: {
    token_inventory_top_rows: inventory.top_tokens.length,
    definition_candidate_rows: 0,
    reader_hint_candidate_rows: 0,
    lemma_candidate_rows: 0,
    candidate_text_rows: 0,
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
    downstream_transform_candidate_rows_blocked_until_source_family_lane_join: inventory.top_tokens.length,
    missing_field_blocker: 'source_family/source_name/license_lane/source_url_or_citation per token row before definition/lemma/reader-hint candidate generation',
  },
  validator: 'scripts/validate_agent2_broad_workbench_token_inventory_5000_return.mjs',
  handoff_owner: 'Agent 10 first; Agent 6 only by exact boundary packet if future row/subset transform/display/source/license/Definition/public/runtime/answer use is proposed',
  stop_condition: workset.stop_condition,
  zero_boundary: workset.zero_boundary,
};

assertReceipt(receipt);
writeJson(outputJson, receipt);
writeMd(outputMd, receipt);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertReceipt(value) {
  for (const relativePath of Object.values(value.files)) requirePath(relativePath);
  if (value.schema_counts.workset_expected_top_token_rows !== 5000) throw new Error('workset expected rows mismatch');
  if (value.schema_counts.inventory_top_tokens !== 5000) throw new Error('inventory top token rows mismatch');
  if (value.schema_counts.inventory_distinct_normalized_tokens !== 698873) throw new Error('distinct token row count mismatch');
  if (value.schema_counts.inventory_total_tokens !== 75290880) throw new Error('total token count mismatch');
  if (value.lane_split.source_family_lane_rows_present !== false) throw new Error('source-family lane rows must be absent');
  for (const [key, count] of Object.entries(value.zero_emission_counters)) {
    if (count !== 0) throw new Error(`zero_emission_counters.${key} must be 0`);
  }
  for (const [key, flag] of Object.entries(value.zero_boundary || {})) {
    if (flag !== false) throw new Error(`zero_boundary.${key} must be false`);
  }
}

function countJsonl(relativePath) {
  const text = fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8');
  return text.split(/\r?\n/).filter((line) => line.trim()).length;
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
    '# Agent 2 Broad Workbench Token Inventory 5000 Return - 2026-06-04',
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
    `- Workset expected top-token rows: ${value.schema_counts.workset_expected_top_token_rows}.`,
    `- Inventory top-token rows: ${value.schema_counts.inventory_top_tokens}.`,
    `- Inventory distinct normalized tokens: ${value.schema_counts.inventory_distinct_normalized_tokens}.`,
    `- Inventory total tokens: ${value.schema_counts.inventory_total_tokens}.`,
    `- Source files read: ${value.schema_counts.source_files_read}.`,
    `- Allowed units: ${value.schema_counts.allowed_units}.`,
    `- Blocked units: ${value.schema_counts.blocked_units}.`,
    '',
    '## Lane Split',
    '',
    '- Source-license inventory only; token rows do not carry source-family lane rows.',
    '- Commercial-clean candidate rows: 0.',
    '- NC educational candidate rows: 0.',
    '- Unclassified rows consumed as candidate text: 0.',
    '',
    '## Transform Candidate Counts',
    '',
    `- Token inventory top rows: ${value.transform_candidate_counts.token_inventory_top_rows}.`,
    '- Definition candidate rows: 0.',
    '- Reader-hint candidate rows: 0.',
    '- Lemma candidate rows: 0.',
    '- Candidate text rows: 0.',
    '',
    '## Exact Blocker',
    '',
    `\`${value.blocker_rows.missing_field_blocker}\``,
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${value.handoff_owner}`,
    `- Stop condition: ${value.stop_condition}`,
    '',
    '## Zero Boundary',
    '',
    'No Definition authority, answer eligibility, public reader output, route shard, definition-content storage, candidate-text export, accepted text, source/license acceptance, or NC commercial authorization is claimed.',
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
