#!/usr/bin/env node
import fs from 'node:fs';

const packetPath = 'reports/agent10-agent6-ready-old-dictionary-lane-partition-transform-planning-boundary-packet-2026-06-04.json';
const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

assert(packet.artifact_type === 'agent10_agent6_ready_boundary_packet', 'unexpected artifact_type');
assert(packet.review_scope === 'old_dictionary_lane_partition_transform_planning_matrix_nonpublic_planning_evidence_only', 'unexpected review_scope');
assert(packet.workset === 'old-dictionary-lane-partition-transform-planning-matrix', 'unexpected workset');
assert(packet.release_owner === 'Agent 10', 'unexpected release_owner');

assert(packet.count_semantics?.partition_counts_are_source_family_hit_totals === true, 'missing source-family hit count semantics');
assert(packet.count_semantics?.row_count_is_not_exclusive_export_row_count === true, 'missing non-exclusive row count semantics');
assert(packet.count_semantics?.exclusive_export_row_counts_authorized_now === false, 'exclusive export row counts must not be authorized');

for (const [field, expected] of Object.entries({
  candidate_text_rows_now: 0,
  definition_content_rows_now: 0,
  answer_eligible_rows_now: 0,
  public_emit_rows_now: 0
})) {
  assert(packet.counts?.[field] === expected, `counts.${field} expected ${expected}`);
}

assert(packet.lane_split?.noncommercial_educational_candidate?.includes('commercial_export_allowed=false'), 'NC lane must preserve commercial_export_allowed=false');
assert(packet.lane_split?.noncommercial_educational_candidate?.includes('corpus_contamination=false'), 'NC lane must preserve corpus_contamination=false');
assert(packet.lane_split?.blocked_or_needs_review?.includes('BDB Augmented Strong'), 'blocked lane must preserve BDB Augmented Strong');

for (const blocker of [
  'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
  'BDB Augmented Strong remains blocked_or_needs_review pending independent custody evidence',
  'Klein rows remain separate noncommercial_educational_candidate lane only and are not commercial export candidates'
]) {
  assert(packet.exact_blockers?.includes(blocker), `missing exact blocker: ${blocker}`);
}

for (const [field, value] of Object.entries(packet.zero_counters || {})) {
  assert(value === 0, `zero_counters.${field} must be 0`);
}

for (const forbidden of [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'answer eligibility',
  'public/runtime acceptance',
  'definition-content storage',
  'candidate text export',
  'commercial export permission',
  'NC commercial authorization'
]) {
  assert(packet.forbidden_claims?.includes(forbidden), `missing forbidden claim ${forbidden}`);
}

console.log(JSON.stringify({
  ok: true,
  validated_packet: packetPath,
  completed_at: new Date().toISOString(),
  boundary: 'Agent 10 old-dictionary lane-partition transform-planning boundary packet validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.'
}, null, 2));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
