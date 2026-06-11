#!/usr/bin/env node
import fs from 'node:fs';

const packets = [
  {
    path: 'reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.json',
    artifactType: 'agent10_agent6_ready_deuteronomy_source_license_custody_boundary_packet',
    status: 'agent6_ready_source_license_custody_boundary_packet_not_accepted',
    scopeField: 'review_scope',
    scopeValue: 'nonpublic_source_license_custody_planning_evidence_only',
    countField: 'counts',
    zeroField: 'counts'
  },
  {
    path: 'reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.json',
    artifactType: 'agent10_agent6_ready_deuteronomy_phase2_transform_readiness_boundary_packet',
    status: 'agent6_ready_nonpublic_transform_readiness_boundary_packet',
    scopeField: 'review_scope.scope_type',
    scopeValue: 'nonpublic_transform_readiness_matrix_only',
    countField: 'review_scope',
    zeroField: 'zero_emission_counters'
  }
];

const results = packets.map(validatePacket);

console.log(JSON.stringify({
  ok: true,
  validated_packets: results.map((result) => result.path),
  completed_at: new Date().toISOString(),
  boundary: 'Agent 10 Deuteronomy Agent6 boundary packet validation only; no QA/source/license/Definition/runtime/publication/product/answer acceptance.'
}, null, 2));

function validatePacket(config) {
  const packet = JSON.parse(fs.readFileSync(config.path, 'utf8'));
  assert(packet.artifact_type === config.artifactType, `${config.path}: unexpected artifact_type`);
  assert(packet.status === config.status, `${config.path}: unexpected status`);
  assert(packet.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', `${config.path}: unexpected active_mode`);
  assert(get(packet, config.scopeField) === config.scopeValue, `${config.path}: unexpected review scope`);

  const counts = get(packet, config.countField);
  assert(counts.commercial_clean_candidate_rows === 1334, `${config.path}: commercial-clean rows must be 1334`);
  assert(counts.commercial_clean_candidate_occurrences === 2964, `${config.path}: commercial-clean occurrences must be 2964`);
  assert((counts.noncommercial_educational_rows ?? counts.noncommercial_educational_candidate_rows) === 0, `${config.path}: NC rows must be 0`);
  assert(counts.metadata_or_link_only_rows === 0, `${config.path}: metadata/link-only rows must be 0`);
  assert(counts.blocked_or_needs_review_rows === 0, `${config.path}: blocked/review rows must be 0`);

  const zero = get(packet, config.zeroField);
  for (const key of Object.keys(zero || {})) {
    if (/(answer|public|route|runtime|source_files|token_index|lexical_payload|definition|accepted|emit|mutation|writes)/.test(key)) {
      assert(zero[key] === 0, `${config.path}: ${key} must be 0`);
    }
  }

  const question = packet.review_question || packet.agent6_review_question || '';
  assert(question.includes('non-public') || question.includes('nonpublic'), `${config.path}: review question must be non-public`);
  assert(question.includes('1334'), `${config.path}: review question must carry row count`);
  assert(question.includes('2964'), `${config.path}: review question must carry occurrence count`);

  const forbidden = packet.what_must_not_be_accepted || [];
  for (const claim of [
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'answer eligibility',
    'public/runtime acceptance',
    'publication readiness'
  ]) {
    assert(forbidden.includes(claim), `${config.path}: missing forbidden claim ${claim}`);
  }

  return { path: config.path };
}

function get(object, dotted) {
  return dotted.split('.').reduce((value, key) => value?.[key], object);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
