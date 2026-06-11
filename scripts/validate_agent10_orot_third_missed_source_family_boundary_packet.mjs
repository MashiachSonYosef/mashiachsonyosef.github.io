#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2] || 'reports/agent10-agent6-ready-orot-third-missed-source-family-boundary-packet-2026-06-05.json';
const packet = JSON.parse(fs.readFileSync(path.join(root, packetPath), 'utf8'));
const issues = [];

expect(packet.schema_version === 1, 'schema_version must be 1');
expect(packet.artifact_type === 'agent10_agent6_ready_orot_third_missed_source_family_boundary_packet', 'artifact_type mismatch');
expect(String(packet.active_mode || '').includes('direct Agent run mode'), 'active_mode must preserve direct Agent run mode');
expect(packet.workset === 'orot_third_missed_source_family', 'workset mismatch');
expect(Array.isArray(packet.rows), 'rows must be array');

const counts = countRows(packet.rows);
expect(packet.counts?.rows === 169, `expected 169 rows, got ${packet.counts?.rows}`);
expect(packet.counts?.occurrences === 2148, `expected 2148 occurrences, got ${packet.counts?.occurrences}`);
expect(counts.rows === packet.counts?.rows, 'row count mismatch');
expect(counts.occurrences === packet.counts?.occurrences, 'occurrence count mismatch');
expect(packet.counts?.commercial_clean_candidate_rows === 138, 'commercial-clean row count mismatch');
expect(packet.counts?.commercial_clean_candidate_occurrences === 1672, 'commercial-clean occurrence count mismatch');
expect(packet.counts?.blocked_or_needs_review_rows === 31, 'blocked/review row count mismatch');
expect(packet.counts?.blocked_or_needs_review_occurrences === 476, 'blocked/review occurrence count mismatch');
expect(packet.counts?.noncommercial_educational_candidate_rows === 0, 'NC row count must be zero for this packet');
expect(packet.counts?.metadata_or_link_only_rows === 0, 'metadata/link-only row count must be zero for this packet');

for (const [index, row] of packet.rows.entries()) {
  const label = `row ${index} ${row.row_subset_id || row.token_id_or_row_id || ''}`.trim();
  expect(typeof row.row_subset_id === 'string' && row.row_subset_id.length > 0, `${label} row_subset_id required`);
  expect(typeof row.target_token_id === 'string' && row.target_token_id.length > 0, `${label} target_token_id required`);
  expect(['commercial_clean_candidate', 'blocked_or_needs_review'].includes(row.license_lane), `${label} unexpected license_lane ${row.license_lane}`);
  expect(row.agent6_boundary_required === true, `${label} must require Agent 6 boundary`);
  expect(row.answer_eligible === false, `${label} answer_eligible must be false`);
  expect(row.public_emit === false, `${label} public_emit must be false`);
  expect(row.commercial_export_allowed === false, `${label} commercial_export_allowed must be false before boundary`);
  expect(row.corpus_contamination === false, `${label} corpus_contamination must be false`);
  expect(Number.isInteger(row.occurrences) && row.occurrences > 0, `${label} occurrences must be positive integer`);
}

const zeroCounters = packet.zero_mutation_counters || {};
for (const key of [
  'public_runtime_mutation',
  'route_shard_writes',
  'route_jsonl_rows',
  'candidate_text_export_rows',
  'definition_content_rows',
  'nc_definition_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'accepted_text_rows',
  'public_hud_rows',
]) {
  expect(Number(zeroCounters[key] || 0) === 0, `${key} must remain zero`);
}

expect(String(packet.agent6_boundary_question || '').includes('Pass/warn/block'), 'Agent 6 boundary question required');
expect(String(packet.agent6_boundary_question || '').includes('non-public source-family/license-lane planning evidence only'), 'boundary question must preserve non-public planning-only use');
expect(Array.isArray(packet.forbidden_claims) && packet.forbidden_claims.includes('Definition authority'), 'forbidden claims must include Definition authority');
expect(packet.forbidden_claims.includes('release action'), 'forbidden claims must include release action');

if (issues.length) {
  console.error(`Agent 10 Orot third-missed source-family boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  validated_packet: packetPath,
  rows: packet.counts.rows,
  occurrences: packet.counts.occurrences,
  commercial_clean_candidate_rows: packet.counts.commercial_clean_candidate_rows,
  blocked_or_needs_review_rows: packet.counts.blocked_or_needs_review_rows,
  boundary: 'Agent 10 Orot third-missed source-family boundary packet validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.',
}, null, 2));

function countRows(rows) {
  const result = { rows: rows.length, occurrences: 0 };
  for (const row of rows) result.occurrences += Number(row.occurrences || 0);
  return result;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
