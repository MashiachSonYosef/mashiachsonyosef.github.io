#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = 'reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json';
const packagePath = 'data/build/orot/reader-hint-placeholder-candidates.json';
const outputJson = 'reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json';
const outputMd = 'reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.md';

const packet = readJson(inputPath);
const pkg = readJson(packagePath);
const rows = (packet.rows || [])
  .filter((row) => row.source_route_needed === 'local_route_card_dedupe_review')
  .map((row) => ({
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    queue_id: row.queue_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    source_audit_priority: row.source_audit_priority,
    category: row.category,
    agent2_lane: row.agent2_lane,
    current_route_card_count: row.current_route_card_count,
    current_answer_eligible_count: row.current_answer_eligible_count,
    current_ambiguity_count: row.current_ambiguity_count,
    current_candidate_count: row.current_candidate_count,
    current_dominant_failure_reason: row.current_dominant_failure_reason,
    already_in_placeholder_package: row.already_in_placeholder_package,
    in_missing_linkage_inventory: row.in_missing_linkage_inventory,
    source_route_needed: row.source_route_needed,
    recommended_next_owner: row.recommended_next_owner,
    next_mechanical_review: classifyNextReview(row),
    mutation_allowed_here: false,
    public_emit_allowed_here: false,
    answer_eligible_now: false,
    definition_text_stored_now: false,
  }));

const output = {
  schema_version: 1,
  artifact_type: 'spark10_orot_169_row_local_route_card_dedupe_source_route_matrix',
  generated_at: new Date().toISOString(),
  source_packet: {
    path: inputPath,
    sha256: sha(inputPath),
  },
  package_anchor: {
    path: packagePath,
    sha256: sha(packagePath),
    rows: pkg.counts?.placeholder_rows,
    occurrences: pkg.counts?.placeholder_occurrences,
  },
  summary: {
    rows: rows.length,
    occurrences: sum(rows.map((row) => row.occurrences)),
    route_card_count_total: sum(rows.map((row) => row.current_route_card_count)),
    candidate_count_total: sum(rows.map((row) => row.current_candidate_count)),
    ambiguity_count_total: sum(rows.map((row) => row.current_ambiguity_count)),
    already_in_placeholder_package_rows: rows.filter((row) => row.already_in_placeholder_package).length,
    already_in_placeholder_package_occurrences: sum(rows.filter((row) => row.already_in_placeholder_package).map((row) => row.occurrences)),
    missing_from_placeholder_package_rows: rows.filter((row) => !row.already_in_placeholder_package).length,
    missing_from_placeholder_package_occurrences: sum(rows.filter((row) => !row.already_in_placeholder_package).map((row) => row.occurrences)),
    next_review_counts: countBy(rows, (row) => row.next_mechanical_review),
    public_hud_rows_emitted: 0,
    route_jsonl_rows_emitted: 0,
    answer_rows_emitted: 0,
    definition_content_rows_emitted: 0,
  },
  rows,
  zero_counts: {
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
  },
  stop_condition: 'Stop after matrix generation and validation; no public/runtime/output/answer/definition mutation.',
  highest_permissible_claim: 'Spark-10 mechanical 169-row route-card matrix generated for Agent 10 consumption only.',
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
    'accepted gloss',
    'accepted text',
    'public reader output',
  ],
};

assertOutput(output);
writeJson(outputJson, output);
writeMd(outputMd, output);
console.log(`wrote ${outputJson}`);
console.log(`wrote ${outputMd}`);

function classifyNextReview(row) {
  if ((row.current_candidate_count || 0) > 0) return 'dedupe_candidate_cards_against_route_cards';
  if ((row.current_ambiguity_count || 0) > 0) return 'dedupe_ambiguity_cards_against_route_cards';
  return 'route_cards_without_candidate_rejoin';
}

function assertOutput(output) {
  if (output.package_anchor.rows !== 332) throw new Error('expected package anchor rows 332');
  if (output.package_anchor.occurrences !== 6156) throw new Error('expected package anchor occurrences 6156');
  if (output.summary.rows !== 169) throw new Error('expected 169 rows');
  if (output.summary.occurrences !== 2148) throw new Error('expected 2148 occurrences');
  for (const [key, value] of Object.entries(output.zero_counts)) {
    if (value !== 0) throw new Error(`expected zero ${key}`);
  }
  for (const row of output.rows) {
    if (row.mutation_allowed_here !== false || row.public_emit_allowed_here !== false || row.answer_eligible_now !== false || row.definition_text_stored_now !== false) {
      throw new Error(`row ${row.token_id} violates non-mutation boundary`);
    }
  }
}

function countBy(rows, keyFn) {
  const out = {};
  for (const row of rows) {
    const key = keyFn(row);
    out[key] ||= { rows: 0, occurrences: 0 };
    out[key].rows += 1;
    out[key].occurrences += Number(row.occurrences || 0);
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMd(file, output) {
  const lines = [
    '# Spark-10 Orot 169-Row Local Route-Card Dedupe Source-Route Matrix',
    '',
    `- Source packet: \`${output.source_packet.path}\``,
    `- Package anchor: ${output.package_anchor.rows} rows / ${output.package_anchor.occurrences} occurrences`,
    `- Rows: ${output.summary.rows}`,
    `- Occurrences: ${output.summary.occurrences}`,
    `- Route cards total: ${output.summary.route_card_count_total}`,
    `- Candidate cards total: ${output.summary.candidate_count_total}`,
    `- Ambiguity cards total: ${output.summary.ambiguity_count_total}`,
    '',
    '## Next Mechanical Review Buckets',
    '',
    ...Object.entries(output.summary.next_review_counts).map(([key, value]) => `- \`${key}\`: ${value.rows} rows / ${value.occurrences} occurrences`),
    '',
    '## Zero Outputs',
    '',
    ...Object.entries(output.zero_counts).map(([key, value]) => `- \`${key}\`: ${value}`),
    '',
    '## Boundary',
    '',
    output.highest_permissible_claim,
    '',
    'No QA/source/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, and no public reader output.',
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
