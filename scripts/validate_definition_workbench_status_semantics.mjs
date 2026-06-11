#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const artifactPaths = {
  sample: 'data/definitions/definition-workbench-sample.json',
  usageLinkPacket: 'data/definitions/definition-workbench-usage-link-packet.json',
  usageJoinSmoke: 'data/definitions/definition-workbench-usage-join-smoke.json',
  agent6Packet: 'data/definitions/definition-workbench-usage-agent6-packet.json',
  consumerManifest: 'data/definitions/definition-workbench-usage-consumer-manifest.json',
  queueReadyPacket: 'data/definitions/definition-workbench-usage-queue-ready-packet.json',
};
const statusContractFixturesPath = 'data/definitions/definition-workbench-status-contract-fixtures.json';

const issues = [];
const artifacts = Object.fromEntries(
  Object.entries(artifactPaths).map(([key, relativePath]) => [key, readJson(relativePath)]),
);
const statusContractFixtures = readJson(statusContractFixturesPath);

validateSample(artifacts.sample);
validateUsageLinkPacket(artifacts.usageLinkPacket);
validateUsageJoinSmoke(artifacts.usageJoinSmoke);
validateAgent6Packet(artifacts.agent6Packet);
validateConsumerManifest(artifacts.consumerManifest);
validateQueueReadyPacket(artifacts.queueReadyPacket);
validateStatusContractFixtures(statusContractFixtures);

for (const [name, artifact] of Object.entries(artifacts)) {
  scanForbiddenVerifiedStatus(artifact, `$${name}`);
}

if (issues.length) {
  console.error(`Definition Workbench status semantics validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench status semantics validation passed.');
console.log([
  `Sample rows: ${artifacts.sample.counts.rows}`,
  `single_answer_source_complete rows: ${artifacts.sample.counts.status_counts.single_answer_source_complete || 0}`,
  `review_status rows: ${JSON.stringify(artifacts.sample.counts.review_status_counts)}`,
  `forbidden verified labels: ${artifacts.usageLinkPacket.counts.sample_forbidden_verified_label_rows}`,
  `consumer entries: ${artifacts.consumerManifest.counts.manifest_entries}`,
  `status fixture cases: ${statusContractFixtures.fixtures?.length || 0}`,
].join('; '));

function validateSample(sample) {
  requireValue(sample.artifact_type, 'definition_workbench_sample', 'sample.artifact_type');
  requireValue(sample.status_axis, 'machine_route_shape_status_not_review_authority', 'sample.status_axis');
  requireValue(sample.review_status_axis, 'lexical_authority_review_status', 'sample.review_status_axis');
  requireText(sample.review_policy, 'never emits review_status=verified', 'sample.review_policy');
  requireText(sample.answer_role_policy, 'answer_role=answer', 'sample.answer_role_policy');
  requireText(sample.source_license_policy, 'source_rows', 'sample.source_license_policy');
  requireText(sample.multi_answer_policy, 'multi_answer=true', 'sample.multi_answer_policy');
  validatePublicationBoundary(sample.publication_boundary, 'sample.publication_boundary');

  const rows = Array.isArray(sample.rows) ? sample.rows : [];
  if (sample.counts?.rows !== rows.length) issues.push('sample.counts.rows must match rows length');
  requireNoVerifiedCount(sample.counts?.status_counts, 'sample.counts.status_counts');
  requireNoVerifiedCount(sample.counts?.review_status_counts, 'sample.counts.review_status_counts');
  if (sample.counts?.rows_with_complete_source_license !== rows.length) {
    issues.push('sample rows must all preserve complete source/license flags');
  }
  for (const [index, row] of rows.entries()) {
    const context = `sample.rows[${index}]`;
    if (row.status === 'verified') issues.push(`${context}.status must not be verified`);
    if (row.review_status !== 'unreviewed_machine_sample') {
      issues.push(`${context}.review_status must be unreviewed_machine_sample`);
    }
    if (row.status === 'single_answer_source_complete') {
      if (row.distinct_answer_definition_count !== 1) {
        issues.push(`${context}.single_answer_source_complete must have exactly one answer definition hash`);
      }
      if (row.answer_card_count < 1) {
        issues.push(`${context}.single_answer_source_complete must preserve at least one answer card`);
      }
      if (row.source_license_complete !== true) {
        issues.push(`${context}.single_answer_source_complete must preserve source/license completeness`);
      }
    }
    if (row.multi_answer === true && row.status !== 'conflicting') {
      issues.push(`${context}.multi_answer=true must remain a conflicting warning row`);
    }
  }
}

function validateUsageLinkPacket(packet) {
  requireValue(packet.artifact_type, 'definition_workbench_usage_link_packet', 'usageLinkPacket.artifact_type');
  requireValue(packet.definition_sample_contract?.status_axis, 'machine_route_shape_status_not_review_authority', 'usageLinkPacket.definition_sample_contract.status_axis');
  requireValue(packet.definition_sample_contract?.review_status_axis, 'lexical_authority_review_status', 'usageLinkPacket.definition_sample_contract.review_status_axis');
  requireText(packet.definition_sample_contract?.review_policy, 'review_status=verified', 'usageLinkPacket.definition_sample_contract.review_policy');
  requireText(packet.definition_sample_contract?.answer_role_policy, 'answer_role=answer', 'usageLinkPacket.definition_sample_contract.answer_role_policy');
  requireText(packet.definition_sample_contract?.source_license_policy, 'source_rows', 'usageLinkPacket.definition_sample_contract.source_license_policy');
  requireText(packet.definition_sample_contract?.multi_answer_policy, 'multi_answer=true', 'usageLinkPacket.definition_sample_contract.multi_answer_policy');
  validatePublicationBoundary(packet.definition_sample_contract?.publication_boundary, 'usageLinkPacket.definition_sample_contract.publication_boundary');

  if (packet.counts?.sample_forbidden_verified_label_rows !== 0) {
    issues.push('usageLinkPacket.counts.sample_forbidden_verified_label_rows must be 0');
  }
  requireNoVerifiedCount(packet.counts?.sample_status_counts, 'usageLinkPacket.counts.sample_status_counts');
  requireNoVerifiedCount(packet.counts?.sample_review_status_counts, 'usageLinkPacket.counts.sample_review_status_counts');
  if (packet.counts?.sample_rows_with_complete_source_license !== packet.counts?.sample_rows) {
    issues.push('usageLinkPacket counts must preserve source/license completeness for every sample row');
  }
  if (packet.counts?.multi_answer_sample_rows !== packet.counts?.sample_status_counts?.conflicting) {
    issues.push('usageLinkPacket multi-answer count must remain visible as conflicting rows');
  }
}

function validateUsageJoinSmoke(packet) {
  requireValue(packet.artifact_type, 'definition_workbench_usage_join_smoke', 'usageJoinSmoke.artifact_type');
  requireValue(packet.current_sample_snapshot?.status_axis, 'machine_route_shape_status_not_review_authority', 'usageJoinSmoke.current_sample_snapshot.status_axis');
  requireValue(packet.current_sample_snapshot?.review_status_axis, 'lexical_authority_review_status', 'usageJoinSmoke.current_sample_snapshot.review_status_axis');
  requireNoVerifiedCount(packet.current_sample_snapshot?.status_counts, 'usageJoinSmoke.current_sample_snapshot.status_counts');
  requireNoVerifiedCount(packet.current_sample_snapshot?.review_status_counts, 'usageJoinSmoke.current_sample_snapshot.review_status_counts');
  if (packet.current_sample_snapshot?.forbidden_verified_label_rows !== 0) {
    issues.push('usageJoinSmoke.current_sample_snapshot.forbidden_verified_label_rows must be 0');
  }
  validatePublicationBoundary(packet.current_sample_snapshot?.publication_boundary, 'usageJoinSmoke.current_sample_snapshot.publication_boundary');
}

function validateAgent6Packet(packet) {
  requireValue(packet.artifact_type, 'definition_workbench_usage_agent6_packet', 'agent6Packet.artifact_type');
  if (packet.review_summary?.current_sample_forbidden_verified_label_rows !== 0) {
    issues.push('agent6Packet.review_summary.current_sample_forbidden_verified_label_rows must be 0');
  }
  if (packet.authority_policy?.review_status_not_answer_authority !== true) {
    issues.push('agent6Packet.authority_policy.review_status_not_answer_authority must be true');
  }
  validatePublicationBoundary(packet.acceptance_boundaries?.definition_sample_publication_boundary, 'agent6Packet.acceptance_boundaries.definition_sample_publication_boundary');
}

function validateConsumerManifest(packet) {
  requireValue(packet.artifact_type, 'definition_workbench_usage_consumer_manifest', 'consumerManifest.artifact_type');
  const semantics = packet.status_semantics || {};
  requireValue(semantics.machine_status_axis, 'machine_route_shape_status_not_review_authority', 'consumerManifest.status_semantics.machine_status_axis');
  requireValue(semantics.machine_complete_label, 'single_answer_source_complete', 'consumerManifest.status_semantics.machine_complete_label');
  requireText(semantics.machine_complete_label_basis, 'not reviewed lexical authority', 'consumerManifest.status_semantics.machine_complete_label_basis');
  requireValue(semantics.review_status_axis, 'lexical_authority_review_status', 'consumerManifest.status_semantics.review_status_axis');
  requireValue(semantics.machine_review_status, 'unreviewed_machine_sample', 'consumerManifest.status_semantics.machine_review_status');
  if (!Array.isArray(semantics.machine_forbidden_status_labels) || !semantics.machine_forbidden_status_labels.includes('verified')) {
    issues.push('consumerManifest.status_semantics.machine_forbidden_status_labels must include verified');
  }
  if (semantics.verified_review_status_reserved !== true) {
    issues.push('consumerManifest.status_semantics.verified_review_status_reserved must be true');
  }
  for (const key of [
    'answer_role_preserved',
    'source_license_rows_preserved',
    'multi_answer_warnings_preserved',
    'publication_boundary_preserved',
  ]) {
    if (semantics[key] !== true) issues.push(`consumerManifest.status_semantics.${key} must be true`);
  }
}

function validateQueueReadyPacket(packet) {
  requireValue(packet.artifact_type, 'definition_workbench_usage_queue_ready_packet', 'queueReadyPacket.artifact_type');
  const summary = packet.status_semantics_summary || {};
  requireValue(summary.machine_status_axis, 'machine_route_shape_status_not_review_authority', 'queueReadyPacket.status_semantics_summary.machine_status_axis');
  requireValue(summary.machine_complete_label, 'single_answer_source_complete', 'queueReadyPacket.status_semantics_summary.machine_complete_label');
  requireValue(summary.machine_review_status, 'unreviewed_machine_sample', 'queueReadyPacket.status_semantics_summary.machine_review_status');
  if (summary.verified_review_status_reserved !== true) {
    issues.push('queueReadyPacket.status_semantics_summary.verified_review_status_reserved must be true');
  }
  validatePublicationBoundary(packet.publication_boundary, 'queueReadyPacket.publication_boundary');
}

function validateStatusContractFixtures(packet) {
  requireValue(packet.artifact_type, 'definition_workbench_status_contract_fixtures', 'statusContractFixtures.artifact_type');
  requireValue(packet.expected_machine_complete_label, 'single_answer_source_complete', 'statusContractFixtures.expected_machine_complete_label');
  requireValue(packet.expected_machine_review_status, 'unreviewed_machine_sample', 'statusContractFixtures.expected_machine_review_status');
  requireValue(packet.reserved_review_status, 'verified', 'statusContractFixtures.reserved_review_status');
  const fixtures = Array.isArray(packet.fixtures) ? packet.fixtures : [];
  if (!fixtures.length) issues.push('statusContractFixtures.fixtures must contain regression cases');
  const byId = new Map(fixtures.map((fixture) => [fixture?.id, fixture]));
  requireFixtureCase(byId, 'single-answer-source-complete-valid', 'pass', 'single_answer_source_complete', 'unreviewed_machine_sample');
  requireFixtureCase(byId, 'machine-status-verified-rejected', 'fail', 'verified', 'unreviewed_machine_sample');
  requireFixtureCase(byId, 'machine-review-status-verified-rejected', 'fail', 'single_answer_source_complete', 'verified');
  requireFixtureCase(byId, 'multi-answer-warning-preserved', 'pass', 'conflicting', 'unreviewed_machine_sample');
  requireFixtureCase(byId, 'publication-boundary-claim-rejected', 'fail', 'single_answer_source_complete', 'unreviewed_machine_sample');
  for (const [index, fixture] of fixtures.entries()) {
    const context = `statusContractFixtures.fixtures[${index}]`;
    validateFixturePublicationBoundary(fixture, `${context}.row.publication_boundary`);
    if (fixture?.row?.multi_answer === true && fixture?.row?.status !== 'conflicting') {
      issues.push(`${context}.multi_answer=true must remain a conflicting warning row`);
    }
  }
}

function validateFixturePublicationBoundary(fixture, context) {
  const boundary = fixture?.row?.publication_boundary;
  if (fixture?.id === 'publication-boundary-claim-rejected') {
    if (boundary?.publication_claim !== true) {
      issues.push(`${context}.publication_claim must stay true in the negative publication-claim fixture`);
    }
    validatePublicationBoundary({ ...boundary, publication_claim: false }, context);
    return;
  }
  validatePublicationBoundary(boundary, context);
}

function requireFixtureCase(byId, id, expectedResult, expectedStatus, expectedReviewStatus) {
  const fixture = byId.get(id);
  if (!fixture) {
    issues.push(`statusContractFixtures missing ${id}`);
    return;
  }
  if (fixture.expect !== expectedResult) {
    issues.push(`statusContractFixtures.${id}.expect must be ${expectedResult}`);
  }
  if (fixture.row?.status !== expectedStatus) {
    issues.push(`statusContractFixtures.${id}.row.status must be ${expectedStatus}`);
  }
  if (fixture.row?.review_status !== expectedReviewStatus) {
    issues.push(`statusContractFixtures.${id}.row.review_status must be ${expectedReviewStatus}`);
  }
}

function validatePublicationBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.boundary_status !== 'blocked_no_render') issues.push(`${context}.boundary_status must be blocked_no_render`);
  for (const key of [
    'reader_facing',
    'ui_assignment',
    'publication_claim',
    'clears_publication_readiness',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'source_publication',
    'public_lookup_artifact',
  ]) {
    if (boundary[key] !== false) issues.push(`${context}.${key} must be false`);
  }
  const doesNotClear = new Set(Array.isArray(boundary.does_not_clear) ? boundary.does_not_clear : []);
  for (const key of ['reviewed_lexical_authority', 'accepted_translation', 'publication_readiness']) {
    if (!doesNotClear.has(key)) issues.push(`${context}.does_not_clear must include ${key}`);
  }
}

function scanForbiddenVerifiedStatus(node, nodePath) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const [index, child] of node.entries()) scanForbiddenVerifiedStatus(child, `${nodePath}[${index}]`);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    const lower = key.toLowerCase();
    if ((lower === 'status' || lower.endsWith('_status')) && value === 'verified') {
      issues.push(`${nodePath}.${key} must not be verified in machine-generated Definition Workbench artifacts`);
    }
    scanForbiddenVerifiedStatus(value, `${nodePath}.${key}`);
  }
}

function requireNoVerifiedCount(counts, context) {
  if (!counts || typeof counts !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if ('verified' in counts) issues.push(`${context}.verified must not be present`);
}

function requireValue(actual, expected, context) {
  if (actual !== expected) issues.push(`${context} must be ${expected}`);
}

function requireText(actual, needle, context) {
  if (!String(actual || '').includes(needle)) issues.push(`${context} must include ${needle}`);
}

function readJson(relativePath) {
  const clean = cleanRelativePath(relativePath);
  return JSON.parse(fs.readFileSync(path.join(root, clean), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
