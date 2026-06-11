#!/usr/bin/env node
import fs from 'node:fs';

const packets = [
  {
    path: 'reports/agent10-agent6-ready-workbench-cc-by-attribution-boundary-packet-2026-06-04.json',
    workset: 'workbench-cc-by-attribution-boundary-map',
    blocker: 'cc_by_attribution_boundary_required',
    laneChecks: {
      commercial_export_allowed: false,
      cc_by_export_authorized_now: false,
      commercial_compatibility_claim_only: true,
      answer_eligible: false,
      public_emit: false,
      agent6_boundary_required: true
    }
  },
  {
    path: 'reports/agent10-agent6-ready-workbench-cc-by-sa-share-alike-boundary-packet-2026-06-04.json',
    workset: 'workbench-cc-by-sa-share-alike-boundary-map',
    blocker: 'cc_by_sa_share_alike_boundary_required',
    laneChecks: {
      commercial_export_allowed: false,
      answer_eligible: false,
      public_emit: false,
      agent6_boundary_required: true,
      share_alike_required: true
    }
  },
  {
    path: 'reports/agent10-agent6-ready-workbench-full-source-name-custody-partitions-boundary-packet-2026-06-04.json',
    workset: 'workbench-full-source-name-custody-partitions',
    blocker: 'full_source_name_custody_partitions_require_agent6_boundary_before_any_source_license_acceptance_or_export_use',
    laneChecks: {}
  }
];

const results = packets.map(validatePacket);

console.log(JSON.stringify({
  ok: true,
  validated_packets: results.map((result) => result.path),
  completed_at: new Date().toISOString(),
  boundary: 'Agent 10 CC-BY/CC-BY-SA boundary packet validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.'
}, null, 2));

function validatePacket({ path, workset, blocker, laneChecks }) {
  const packet = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert(packet.artifact_type === 'agent10_agent6_ready_boundary_packet', `${path}: unexpected artifact_type`);
  assert(packet.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', `${path}: unexpected active_mode`);
  assert(packet.workset === workset, `${path}: unexpected workset`);
  assert(packet.review_scope?.includes('nonpublic_source_license_custody_planning_evidence_only'), `${path}: review_scope must be non-public planning evidence only`);
  assert(packet.spark_route_note?.includes('historical contract artifacts only'), `${path}: missing historical Spark-1 artifact note`);
  assert(packet.spark_route_note?.includes('does not route new work to Spark-1'), `${path}: missing no-new-Spark-1 route note`);
  const blockerIds = Array.isArray(packet.exact_blockers)
    ? packet.exact_blockers
    : [packet.exact_blocker?.id].filter(Boolean);
  assert(blockerIds.includes(blocker), `${path}: unexpected exact blocker`);
  if (packet.exact_blocker) {
    assert(Array.isArray(packet.exact_blocker.missing_fields) && packet.exact_blocker.missing_fields.length >= 3, `${path}: exact blocker must list missing fields`);
  } else {
    assert(packet.exact_blockers.length >= 3, `${path}: exact blockers must list missing fields`);
  }

  for (const [field, expected] of Object.entries(laneChecks)) {
    assert(packet.lane_flags?.[field] === expected, `${path}: lane_flags.${field} expected ${expected}`);
  }

  for (const [field, value] of Object.entries(packet.zero_counters || {})) {
    assert(value === 0, `${path}: zero_counters.${field} must be 0`);
  }

  for (const forbidden of [
    'QA acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness'
  ]) {
    assert(packet.forbidden_claims?.includes(forbidden), `${path}: missing forbidden claim ${forbidden}`);
  }

  return { path, workset, blocker };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
