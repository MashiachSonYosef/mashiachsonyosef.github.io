#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = 'data/build/orot/reader-hint-placeholder-candidates.json';
const outputJson = 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.json';
const outputMd = 'reports/agent2-orot-tbd-13-placeholder-inventory-consumption-2026-06-04.md';

const pkg = readJson(packagePath);
const rows = Object.values(pkg.hints_by_token_id || {})
  .filter((row) => row.lane === 'display_integrity_tbd_placeholder' || row.subset === 'display_integrity_tbd' || row.display_separator_only === true)
  .sort((a, b) => String(a.token_id).localeCompare(String(b.token_id)))
  .map((row) => ({
    token_id: row.token_id,
    surface: row.surface,
    occurrences: Number(row.occurrences || 0),
    lane: row.lane,
    subset: row.subset,
    label: row.label,
    label_status: row.label_status,
    placeholder_status: row.placeholder_status,
    inline_display: row.inline_display,
    display: row.display,
    counterpart_text: row.counterpart_text,
    display_separator_only: row.display_separator_only === true,
    definition_text_stored_now: row.definition_text_stored_now === true,
    nc_definition_content_stored_now: row.nc_definition_content_stored_now === true,
    answer_eligible: row.answer_eligible === true,
    promote_to_answer: row.promote_to_answer === true,
    approved_for_public_emit: row.approved_for_public_emit === true,
    public_hud_emit_allowed: row.public_hud_emit_allowed === true,
    route_jsonl_emit_allowed: row.route_jsonl_emit_allowed === true,
    cleared_by_agent6_verdict: row.cleared_by_agent6_verdict || null,
  }));

const output = {
  schema_version: 1,
  artifact_type: 'agent2_orot_tbd_13_placeholder_inventory_consumption',
  generated_at: new Date().toISOString(),
  active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
  source_queue_item: 'spark-orot-tbd-13-placeholder-inventory',
  status: 'standing_queue_item_consumed_as_existing_non_public_display_integrity_inventory',
  package_anchor: {
    path: packagePath,
    sha256: sha(packagePath),
    placeholder_rows: pkg.counts?.placeholder_rows,
    placeholder_occurrences: pkg.counts?.placeholder_occurrences,
  },
  counts: {
    display_integrity_tbd_rows: rows.length,
    display_integrity_tbd_occurrences: sum(rows.map((row) => row.occurrences)),
    answer_rows_emitted: 0,
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    route_shards_written: 0,
    runtime_files_changed: 0,
    source_files_changed: 0,
    definition_content_rows_emitted: 0,
    nc_definition_content_rows_emitted: 0,
    accepted_text_rows: 0,
  },
  rows,
  blocker: null,
  next_handoff: {
    consumer: 'Agent 10',
    agent6_boundary: 'none_opened_by_this_inventory; Agent 6 only if a future package proposes transform/display/source/license/Definition/public/runtime/answer use',
    spark1_route: 'not_needed_for_unchanged_input',
  },
  stop_condition: 'Stop after consuming the existing 13-row non-public TBD display-integrity inventory; do not emit public/runtime/route/answer/definition output.',
  highest_permissible_claim: 'Agent 2 consumed the existing non-public Orot 13-row TBD display-integrity inventory as reader-understanding/package evidence only.',
  what_must_not_be_accepted: [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'legal acceptance',
    'Definition authority',
    'usage-as-definition authority',
    'answer acceptance',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'translation output',
    'accepted gloss/text',
    'public reader output',
    'route-shard edit',
    'public/runtime mutation',
    'definition-content storage',
    'NC commercial authorization',
  ],
};

assertOutput(output);
writeJson(outputJson, output);
writeMd(outputMd, output);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function assertOutput(output) {
  if (output.package_anchor.placeholder_rows !== 332) throw new Error('expected package anchor rows 332');
  if (output.package_anchor.placeholder_occurrences !== 6156) throw new Error('expected package anchor occurrences 6156');
  if (output.counts.display_integrity_tbd_rows !== 13) throw new Error('expected 13 display-integrity TBD rows');
  if (output.counts.display_integrity_tbd_occurrences !== 129) throw new Error('expected 129 display-integrity TBD occurrences');
  for (const [key, value] of Object.entries(output.counts)) {
    if (key.startsWith('display_integrity_tbd_')) continue;
    if (value !== 0) throw new Error(`expected zero ${key}`);
  }
  for (const row of output.rows) {
    if (row.inline_display !== 'TBD' || row.display !== 'TBD' || row.counterpart_text !== 'TBD') {
      throw new Error(`row ${row.token_id} does not preserve TBD display fields`);
    }
    if (!row.display_separator_only) throw new Error(`row ${row.token_id} is not display_separator_only`);
    if (row.definition_text_stored_now || row.nc_definition_content_stored_now || row.answer_eligible || row.promote_to_answer || row.approved_for_public_emit || row.public_hud_emit_allowed || row.route_jsonl_emit_allowed) {
      throw new Error(`row ${row.token_id} violates zero boundary`);
    }
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, output) {
  const lines = [
    '# Agent 2 Orot TBD 13-Placeholder Inventory Consumption',
    '',
    `- Source queue item: \`${output.source_queue_item}\``,
    `- Source package: \`${output.package_anchor.path}\``,
    `- Package anchor: ${output.package_anchor.placeholder_rows} rows / ${output.package_anchor.placeholder_occurrences} occurrences`,
    `- Display-integrity TBD rows: ${output.counts.display_integrity_tbd_rows}`,
    `- Display-integrity TBD occurrences: ${output.counts.display_integrity_tbd_occurrences}`,
    '',
    '## Zero Outputs',
    '',
    ...Object.entries(output.counts)
      .filter(([key]) => !key.startsWith('display_integrity_tbd_'))
      .map(([key, value]) => `- \`${key}\`: ${value}`),
    '',
    '## Boundary',
    '',
    '`TBD` remains a display-integrity separator only. It is not a definition, answer, translation, accepted gloss, accepted text, verified text, or top match.',
    '',
    output.highest_permissible_claim,
    '',
    '## Next Handoff',
    '',
    `- Consumer: ${output.next_handoff.consumer}`,
    `- Agent 6 boundary: ${output.next_handoff.agent6_boundary}`,
    `- Spark-1 route: ${output.next_handoff.spark1_route}`,
    '',
  ];
  fs.writeFileSync(path.join(root, file), lines.join('\n'));
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
