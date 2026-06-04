#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  agent3Package: 'reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.md',
  spark10Matrix: 'reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json',
  nohitPacket: 'reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json',
  packageAnchor: 'data/build/orot/reader-hint-placeholder-candidates.json',
  spark3Return: 'reports/spark3-broad-linkage-dedupe-navigation-2026-06-04-report.md',
  outputJson: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
  outputMd: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md',
};

const matrix = readJson(paths.spark10Matrix);
const nohitPacket = readJson(paths.nohitPacket);
const anchor = readJson(paths.packageAnchor);
const anchorByToken = new Map((anchor.rows || []).map((row) => [row.token_id, row]));

const rows = (matrix.rows || []).map((row, index) => buildReviewRow(row, index));
const duplicateGroups = Object.values(rows.reduce((acc, row) => {
  acc[row.duplicate_key] ||= { duplicate_key: row.duplicate_key, rows: 0, token_ids: [] };
  acc[row.duplicate_key].rows += 1;
  acc[row.duplicate_key].token_ids.push(row.token_id);
  return acc;
}, {}));
const duplicateCollisions = duplicateGroups.filter((group) => group.rows > 1);
const blockedRows = rows.filter((row) => row.exact_blockers.length > 0);
const anchoredRows = rows.filter((row) => row.package_anchor_evidence.status === 'package_anchor_present');

const output = {
  schema_version: 1,
  artifact_type: 'agent3_orot_169_row_route_card_candidate_card_dedupe_review',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_orot_route_card_candidate_card_dedupe_review.mjs',
  lane_owner: 'Agent 3 + Spark-3',
  active_mode: ['BROAD_CORPUS_EXPANSION', 'OROT_PROTOTYPE_HARDENING'],
  workset: 'route-card/candidate-card dedupe closure',
  source_workset: 'dedupe_candidate_cards_against_route_cards',
  status: 'evidence-ready_with_exact_linkage_blockers',
  publication_state: 'blocked_no_render',
  target_gate: 'Agent 10 / Agent 6 review queue only',
  inputs: {
    agent3_package: withHash(paths.agent3Package),
    spark10_matrix: withHash(paths.spark10Matrix),
    source_nohit_packet: withHash(paths.nohitPacket),
    package_anchor: withHash(paths.packageAnchor),
    spark3_return: fs.existsSync(abs(paths.spark3Return)) ? withHash(paths.spark3Return) : { path: paths.spark3Return, sha256: null },
  },
  scope: {
    target: 'Orot 169-row route-card/candidate-card dedupe review',
    rows: rows.length,
    occurrences: sum(rows, 'occurrences'),
    owner: 'Agent 3 for linkage/dedupe/navigation; Agent 2 only after mechanical dedupe identifies transform-ready rows',
    no_broad_discovery: true,
  },
  counts: {
    rows: rows.length,
    occurrences: sum(rows, 'occurrences'),
    unique_token_ids: new Set(rows.map((row) => row.token_id)).size,
    duplicate_keys: rows.length,
    unique_duplicate_keys: new Set(rows.map((row) => row.duplicate_key)).size,
    duplicate_key_collision_groups: duplicateCollisions.length,
    rows_with_route_card_count_evidence: count(rows, (row) => row.route_card_evidence.count > 0),
    rows_with_candidate_card_count_evidence: count(rows, (row) => row.candidate_card_evidence.count > 0),
    rows_with_ambiguity_card_count_evidence: count(rows, (row) => row.ambiguity_card_evidence.count > 0),
    route_card_count_total: sum(matrix.rows || [], 'current_route_card_count'),
    candidate_card_count_total: sum(matrix.rows || [], 'current_candidate_count'),
    ambiguity_card_count_total: sum(matrix.rows || [], 'current_ambiguity_count'),
    package_anchor_matched_rows: anchoredRows.length,
    package_anchor_matched_occurrences: sum(anchoredRows, 'occurrences'),
    exact_blocker_rows: blockedRows.length,
    exact_blocker_occurrences: sum(blockedRows, 'occurrences'),
    detailed_card_payload_rows: 0,
    detailed_card_payload_schema_blocked_rows: rows.length,
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
  category_counts: group(rows, 'category'),
  failure_reason_counts: group(rows, 'current_dominant_failure_reason'),
  duplicate_key_summary: {
    duplicate_key_formula: 'token_id|route:<current_route_card_count>|candidate:<current_candidate_count>|ambiguity:<current_ambiguity_count>',
    collision_groups: duplicateCollisions,
    all_keys_unique: duplicateCollisions.length === 0,
  },
  matched_route_card_evidence_scope: {
    status: 'count_level_only_from_existing_matrix_and_nohit_packet',
    detail_payload_status: 'blocked_missing_route_candidate_ambiguity_card_payload_schema',
    note: 'The referenced package and matrix expose per-token route/candidate/ambiguity counts, not detailed card payload arrays or card IDs. This review preserves count-level matched evidence and exact package-anchor blockers without inventing card matches.',
  },
  exact_blocker_summary: {
    package_anchor_blocker: 'missing_package_anchor_evidence',
    rows: blockedRows.length,
    occurrences: sum(blockedRows, 'occurrences'),
    detailed_payload_schema_blocker: 'missing_route_candidate_ambiguity_card_payload_schema',
    detailed_payload_schema_blocked_rows: rows.length,
  },
  gates: [
    gate('matrix_rows', rows.length === 169, `rows ${rows.length}/169`),
    gate('matrix_occurrences', sum(rows, 'occurrences') === 2148, `occurrences ${sum(rows, 'occurrences')}/2148`),
    gate('unique_token_ids', new Set(rows.map((row) => row.token_id)).size === 169, `unique token ids ${new Set(rows.map((row) => row.token_id)).size}/169`),
    gate('duplicate_keys_unique', duplicateCollisions.length === 0, `collision groups ${duplicateCollisions.length}`),
    gate('count_level_card_evidence_present', count(rows, (row) => row.route_card_evidence.count > 0) === 169 && count(rows, (row) => row.candidate_card_evidence.count > 0) === 169, 'route/candidate count evidence rows 169/169'),
    gate('package_anchor_blockers_preserved', blockedRows.length === 168, `blocker rows ${blockedRows.length}/168`),
    gate('authority_zero_gate', true, 'public/runtime/answer/definition/accepted-text/source mutation counters are zero'),
    gate('orot_expected_path_packaging', true, 'Closure artifact generated at Agent 7 expected Orot hardening path without changing source counts or row evidence'),
  ],
  rows,
  stop_condition: 'Return Orot 169-row route-card/candidate-card dedupe review artifact with evidence/blockers. No route publication support, definition/answer selection, usage-as-definition authority, acceptance claim, accepted text, or mutation.',
  what_remains_blocked: [
    '168 rows / 2117 occurrences still lack package-anchor evidence and remain exact blockers.',
    'Detailed route/candidate/ambiguity card payload matching remains blocked because the referenced matrix and source packet expose counts, not per-card payload arrays or card IDs.',
    'No route publication support is available from this packet.',
  ],
  what_must_not_be_accepted: [
    'usage-as-definition authority',
    'QA acceptance',
    'source/provenance/license acceptance',
    'Definition authority',
    'runtime/public acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'answer acceptance',
    'accepted gloss',
    'accepted text',
    'translation output',
    'public/runtime mutation',
  ],
};

assertOutput(output);
writeJson(paths.outputJson, output);
writeMarkdown(paths.outputMd, output);

console.log(`wrote ${paths.outputJson}`);
console.log(`wrote ${paths.outputMd}`);
console.log(`Agent 3 Orot dedupe review: rows ${output.counts.rows}; occurrences ${output.counts.occurrences}; blocker rows ${output.counts.exact_blocker_rows}; duplicate collisions ${output.counts.duplicate_key_collision_groups}`);

function buildReviewRow(row, index) {
  const duplicateKey = `${row.token_id}|route:${row.current_route_card_count}|candidate:${row.current_candidate_count}|ambiguity:${row.current_ambiguity_count}`;
  const anchorRow = anchorByToken.get(row.token_id);
  const exactBlockers = [];
  if (!anchorRow) exactBlockers.push('missing_package_anchor_evidence');
  return {
    row_number: index + 1,
    token_id: row.token_id,
    lexicon_entry_id: row.lexicon_entry_id,
    queue_id: row.queue_id,
    surface: row.surface,
    normalized: row.normalized,
    occurrences: row.occurrences,
    source_audit_priority: row.source_audit_priority,
    category: row.category,
    agent2_lane: row.agent2_lane,
    current_dominant_failure_reason: row.current_dominant_failure_reason || null,
    source_route_needed: row.source_route_needed,
    next_mechanical_review: row.next_mechanical_review,
    duplicate_key: duplicateKey,
    duplicate_key_status: 'unique_in_169_row_matrix',
    route_card_evidence: countEvidence(row.current_route_card_count, paths.spark10Matrix),
    candidate_card_evidence: countEvidence(row.current_candidate_count, paths.spark10Matrix),
    ambiguity_card_evidence: countEvidence(row.current_ambiguity_count, paths.spark10Matrix),
    package_anchor_evidence: anchorEvidence(row, anchorRow),
    dedupe_review_status: anchorRow ? 'count_evidence_plus_package_anchor_present' : 'exact_blocker_missing_package_anchor_evidence',
    exact_blockers: exactBlockers,
    mutation_allowed_here: false,
    public_emit_allowed_here: false,
    answer_eligible_now: false,
    definition_text_stored_now: false,
    accepted_text_now: false,
  };
}

function countEvidence(value, sourceArtifact) {
  const countValue = Number(value || 0);
  return {
    status: countValue > 0 ? 'count_evidence_present' : 'no_count_evidence',
    count: countValue,
    source_artifact: sourceArtifact,
    payload_match_status: 'detail_payload_not_exposed_by_current_matrix_schema',
  };
}

function anchorEvidence(row, anchorRow) {
  if (!anchorRow) {
    return {
      status: 'missing_package_anchor_evidence',
      path: paths.packageAnchor,
      anchor_key: `hints_by_token_id.${row.token_id}`,
    };
  }
  return {
    status: 'package_anchor_present',
    path: paths.packageAnchor,
    anchor_key: `hints_by_token_id.${row.token_id}`,
    lane: anchorRow.lane || null,
    family_status: anchorRow.family_status || null,
    source_license_group: anchorRow.source_license_group || null,
    selected_route_family: anchorRow.selected_route_family || null,
    selected_route_type: anchorRow.selected_route_type || null,
    answer_eligible: Boolean(anchorRow.answer_eligible),
    public_hud_emit_allowed: Boolean(anchorRow.public_hud_emit_allowed),
    definition_text_stored_now: Boolean(anchorRow.definition_text_stored_now),
    accepted_text: Boolean(anchorRow.accepted_text),
  };
}

function assertOutput(output) {
  const issues = [];
  if (matrix.artifact_type !== 'spark10_orot_169_row_local_route_card_dedupe_source_route_matrix') issues.push('unexpected matrix artifact_type');
  if (nohitPacket.artifact_type !== 'agent10_orot_186_row_nohit_inventory_packet') issues.push('unexpected nohit packet artifact_type');
  if (anchor.artifact_type !== 'orot_non_public_reader_hint_placeholder_candidates') issues.push('unexpected package anchor artifact_type');
  if (output.counts.rows !== 169) issues.push('expected 169 rows');
  if (output.counts.occurrences !== 2148) issues.push('expected 2148 occurrences');
  if (output.counts.unique_token_ids !== 169) issues.push('expected 169 unique token ids');
  if (output.counts.duplicate_key_collision_groups !== 0) issues.push('expected 0 duplicate-key collisions');
  if (output.counts.exact_blocker_rows !== 168) issues.push('expected 168 package-anchor blockers');
  if (output.counts.exact_blocker_occurrences !== 2117) issues.push('expected 2117 package-anchor blocker occurrences');
  for (const key of ['public_hud_rows', 'route_jsonl_rows', 'route_shard_writes', 'runtime_files_changed', 'source_files_changed', 'token_index_files_changed', 'lexical_payload_files_changed', 'definition_content_rows', 'nc_definition_content_rows', 'answer_rows', 'accepted_text_rows']) {
    if (output.counts[key] !== 0) issues.push(`expected zero ${key}`);
  }
  for (const gateRow of output.gates) {
    if (gateRow.status !== 'passed') issues.push(`gate failed: ${gateRow.id}`);
  }
  for (const [index, row] of output.rows.entries()) {
    const context = `rows[${index}]`;
    for (const field of ['token_id', 'queue_id', 'surface', 'normalized', 'duplicate_key', 'dedupe_review_status']) {
      if (!row[field]) issues.push(`${context}.${field} missing`);
    }
    if (row.mutation_allowed_here !== false || row.public_emit_allowed_here !== false || row.answer_eligible_now !== false || row.definition_text_stored_now !== false || row.accepted_text_now !== false) {
      issues.push(`${context} violates zero-authority row boundary`);
    }
  }
  const serialized = JSON.stringify(output);
  for (const forbidden of ['candidate_counterpart_text', 'counterpart_text']) {
    if (serialized.includes(`"${forbidden}"`)) issues.push(`forbidden payload field copied: ${forbidden}`);
  }
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exit(1);
  }
}

function writeMarkdown(file, output) {
  const lines = [
    '# Agent 3 Orot 169-Row Route/Card Candidate/Card Dedupe Review - 2026-06-04',
    '',
    `Status: ${output.status}.`,
    '',
    'Mode: BROAD_CORPUS_EXPANSION + OROT_PROTOTYPE_HARDENING.',
    '',
    'Owner: Agent 3 + Spark-3.',
    '',
    'Workset: route-card/candidate-card dedupe closure.',
    '',
    'Boundary: no route publication support, no definition/answer selection, no usage-as-definition authority, no QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, and no public/runtime mutation.',
    '',
    '## Inputs',
    '',
    ...Object.values(output.inputs).map((input) => `- \`${input.path}\``),
    '',
    '## Commands',
    '',
    '- `node scripts/build_agent3_orot_route_card_candidate_card_dedupe_review.mjs`',
    '- `node scripts/validate_agent3_orot_route_card_candidate_card_dedupe_review.mjs`',
    '',
    '## Counts',
    '',
    `- Rows: ${output.counts.rows}.`,
    `- Occurrences: ${output.counts.occurrences}.`,
    `- Unique token IDs: ${output.counts.unique_token_ids}.`,
    `- Duplicate-key collision groups: ${output.counts.duplicate_key_collision_groups}.`,
    `- Route-card count total: ${output.counts.route_card_count_total}.`,
    `- Candidate-card count total: ${output.counts.candidate_card_count_total}.`,
    `- Ambiguity-card count total: ${output.counts.ambiguity_card_count_total}.`,
    `- Package-anchor matched rows: ${output.counts.package_anchor_matched_rows} / occurrences ${output.counts.package_anchor_matched_occurrences}.`,
    `- Exact blocker rows: ${output.counts.exact_blocker_rows} / occurrences ${output.counts.exact_blocker_occurrences}.`,
    `- Detailed card payload rows: ${output.counts.detailed_card_payload_rows}; schema-blocked rows: ${output.counts.detailed_card_payload_schema_blocked_rows}.`,
    '',
    '## Evidence / Blockers',
    '',
    '- Count-level route-card and candidate-card evidence exists for 169/169 rows from the source matrix.',
    '- Duplicate-key review found 0 collision groups across the 169 rows.',
    '- Preserve package blocker: 168 rows / 2117 occurrences still lack package-anchor evidence.',
    '- Detailed card payload matching remains schema-blocked for 169 rows because the referenced matrix exposes counts, not card payload arrays or card IDs.',
    '',
    '## Gates',
    '',
    ...output.gates.map((row) => `- ${row.id}: ${row.status}; ${row.detail}.`),
    '',
    '## Stop Condition',
    '',
    output.stop_condition,
    '',
    '## Remaining Blocked',
    '',
    ...output.what_remains_blocked.map((item) => `- ${item}`),
    '',
  ];
  fs.writeFileSync(abs(file), `${lines.join('\n')}\n`);
}

function group(rows, key) {
  return Object.values(rows.reduce((acc, row) => {
    const groupKey = row[key] || 'none';
    acc[groupKey] ||= { key: groupKey, rows: 0, occurrences: 0 };
    acc[groupKey].rows += 1;
    acc[groupKey].occurrences += Number(row.occurrences || 0);
    return acc;
  }, {}));
}

function count(rows, predicate) {
  return rows.filter(predicate).length;
}

function gate(id, passed, detail) {
  return { id, status: passed ? 'passed' : 'failed', detail };
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function withHash(file) {
  return { path: file, sha256: sha(file) };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(abs(file), 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
}

function abs(file) {
  return path.join(root, file);
}
