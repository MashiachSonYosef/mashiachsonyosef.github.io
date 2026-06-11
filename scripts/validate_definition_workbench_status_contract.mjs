#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputJsonPath = cleanRelativePath(process.argv[2] || 'reports/definition-workbench-status-contract.json');
const outputMarkdownPath = cleanRelativePath(process.argv[3] || 'reports/definition-workbench-status-contract.md');

const samplePath = 'data/definitions/definition-workbench-sample.json';
const linkPacketPath = 'data/definitions/definition-workbench-usage-link-packet.json';
const joinSmokePath = 'data/definitions/definition-workbench-usage-join-smoke.json';
const agent6PacketPath = 'data/definitions/definition-workbench-usage-agent6-packet.json';
const queueReadyPacketPath = 'data/definitions/definition-workbench-usage-queue-ready-packet.json';
const statusContractFixturesPath = 'data/definitions/definition-workbench-status-contract-fixtures.json';
const historicalWarningReports = [
  'reports/agent6-definition-workbench-sample-verdict-2026-06-01.md',
  'reports/agent7-definition-workbench-ceo-plan-2026-06-01.md',
];

const sample = readJson(samplePath);
const linkPacket = readJson(linkPacketPath);
const joinSmoke = readJson(joinSmokePath);
const agent6Packet = readJson(agent6PacketPath);
const queueReadyPacket = readJson(queueReadyPacketPath);
const statusContractFixtures = readJson(statusContractFixturesPath);

const issues = [];
const warnings = [];
const allowedMachineStatuses = new Set([
  'missing',
  'proposed_only',
  'single_answer_source_complete',
  'conflicting',
  'low_confidence',
  'unreviewed',
]);
const allowedMachineReviewStatuses = new Set(['unreviewed_machine_sample']);
const requiredSampleFields = [
  'token_key',
  'route_card_count',
  'answer_card_count',
  'evidence_only_card_count',
  'distinct_answer_definition_count',
  'multi_answer',
  'source_license_complete',
  'status',
  'status_basis',
  'review_status',
  'review_status_basis',
];
const artifactPaths = {
  definition_workbench_sample: samplePath,
  definition_workbench_usage_link_packet: linkPacketPath,
  definition_workbench_usage_join_smoke: joinSmokePath,
  definition_workbench_usage_agent6_packet: agent6PacketPath,
  definition_workbench_usage_queue_ready_packet: queueReadyPacketPath,
  definition_workbench_status_contract_fixtures: statusContractFixturesPath,
};

validateSample();
validateLinkPacket();
validateJoinSmoke();
validateAgent6Packet();
validateQueueReadyPacket();
const fixtureValidation = validateStatusContractFixtures();

const sampleRows = Array.isArray(sample.rows) ? sample.rows : [];
const forbiddenVerifiedLabelRows = sampleRows.filter((row) => row.status === 'verified' || row.review_status === 'verified').length;
const statusCounts = countValues(sampleRows.map((row) => row.status));
const reviewStatusCounts = countValues(sampleRows.map((row) => row.review_status));
const completeSourceLicenseRows = sampleRows.filter((row) => row.source_license_complete === true).length;
const answerRoleReadyRows = sampleRows.filter((row) => Number(row.answer_card_count || 0) > 0).length;
const multiAnswerRows = sampleRows.filter((row) => row.multi_answer === true).length;
const unsafeAuthorityOrPublicationClaimArtifacts = Object.entries({
  sample,
  link_packet: linkPacket,
  join_smoke: joinSmoke,
  agent6_packet: agent6Packet,
  queue_ready_packet: queueReadyPacket,
}).filter(([, artifact]) => hasUnsafeAuthorityOrPublicationClaim(artifact)).map(([name]) => name);

const status = issues.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed';
const currentDisposition = {
  agent6_verified_overclaim_warning_addressed: forbiddenVerifiedLabelRows === 0
    && Number(linkPacket.counts?.sample_forbidden_verified_label_rows ?? 0) === 0
    && Number(joinSmoke.counts?.sample_forbidden_verified_label_rows ?? 0) === 0
    && Number(agent6Packet.review_summary?.current_sample_forbidden_verified_label_rows ?? agent6Packet.counts?.current_sample_forbidden_verified_label_rows ?? 0) === 0,
  queue_ready_status_semantics_preserved: hasQueueReadyStatusSemantics(queueReadyPacket),
  queue_ready_publication_boundary_preserved: hasQueueReadyPublicationBoundary(queueReadyPacket),
  machine_complete_label: 'single_answer_source_complete',
  machine_review_status: 'unreviewed_machine_sample',
  reserved_review_label: 'verified',
  reviewed_lexical_authority: false,
  accepted_translation_output: false,
  publication_readiness: false,
  current_artifacts_checked: Object.values(artifactPaths),
  status_contract_fixtures_checked: fixtureValidation.fixtures,
  status_contract_fixtures_passed: fixtureValidation.passed,
  historical_warning_reports: historicalWarningReports,
  historical_warning_reports_scope: 'Historical reports may describe the earlier verified overclaim; current data-contract artifacts and this validator supersede them for machine status semantics.',
};
const report = {
  schema_version: 1,
  artifact_type: 'definition_workbench_status_contract_validation',
  generated_at: new Date().toISOString(),
  generator: 'scripts/validate_definition_workbench_status_contract.mjs',
  status,
  validates: [
    'machine_status_not_review_authority',
    'review_status_verified_reserved',
    'answer_role_counts_preserved',
    'source_license_completeness_visible',
    'multi_answer_warnings_visible',
    'row_basis_review_boundary_visible',
    'no_ui_assignment_or_publication_claim',
    'machine_status_regression_fixtures',
  ],
  inputs: artifactPaths,
  contract: {
    machine_shape_status_axis: sample.status_axis || null,
    review_status_axis: sample.review_status_axis || null,
    verified_reserved_for_reviewed_lexical_authority: true,
    allowed_machine_statuses: [...allowedMachineStatuses].sort(),
    allowed_machine_review_statuses: [...allowedMachineReviewStatuses].sort(),
    publication_boundary: sample.publication_boundary || null,
  },
  current_disposition: currentDisposition,
  counts: {
    sample_rows: sampleRows.length,
    forbidden_verified_label_rows: forbiddenVerifiedLabelRows,
    status_counts: statusCounts,
    review_status_counts: reviewStatusCounts,
    complete_source_license_rows: completeSourceLicenseRows,
    answer_role_ready_rows: answerRoleReadyRows,
    multi_answer_rows: multiAnswerRows,
    link_packet_sample_forbidden_verified_label_rows: Number(linkPacket.counts?.sample_forbidden_verified_label_rows ?? 0),
    join_smoke_sample_forbidden_verified_label_rows: Number(joinSmoke.counts?.sample_forbidden_verified_label_rows ?? 0),
    agent6_packet_current_sample_forbidden_verified_label_rows: Number(agent6Packet.review_summary?.current_sample_forbidden_verified_label_rows ?? agent6Packet.counts?.current_sample_forbidden_verified_label_rows ?? 0),
    queue_ready_status_semantics_preserved: hasQueueReadyStatusSemantics(queueReadyPacket) ? 1 : 0,
    queue_ready_publication_boundary_preserved: hasQueueReadyPublicationBoundary(queueReadyPacket) ? 1 : 0,
    unsafe_authority_or_publication_claim_artifacts: unsafeAuthorityOrPublicationClaimArtifacts.length,
    publication_claim_artifacts: unsafeAuthorityOrPublicationClaimArtifacts.length,
    status_contract_fixture_rows: fixtureValidation.fixtures,
    status_contract_fixture_expected_pass_rows: fixtureValidation.expectedPass,
    status_contract_fixture_expected_fail_rows: fixtureValidation.expectedFail,
    status_contract_fixture_passed: fixtureValidation.passed ? 1 : 0,
  },
  issues,
  warnings,
};

writeJson(outputJsonPath, report);
writeMarkdown(outputMarkdownPath, report);

if (issues.length) {
  console.error(`Definition Workbench status contract failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Definition Workbench status contract ${status}. Rows: ${sampleRows.length}; forbidden verified labels: ${forbiddenVerifiedLabelRows}.`);

function validateSample() {
  if (sample.schema_version !== 1) issues.push('sample.schema_version must be 1');
  if (sample.artifact_type !== 'definition_workbench_sample') issues.push('sample.artifact_type must be definition_workbench_sample');
  if (sample.status_axis !== 'machine_route_shape_status_not_review_authority') {
    issues.push('sample.status_axis must be machine_route_shape_status_not_review_authority');
  }
  if (sample.review_status_axis !== 'lexical_authority_review_status') {
    issues.push('sample.review_status_axis must be lexical_authority_review_status');
  }
  if (!String(sample.review_policy || '').includes('never emits review_status=verified')) {
    issues.push('sample.review_policy must reserve review_status=verified outside machine samples');
  }
  if (!String(sample.answer_role_policy || '').includes('answer_role=answer')) {
    issues.push('sample.answer_role_policy must preserve answer_role=answer filtering');
  }
  if (!String(sample.source_license_policy || '').includes('source_rows')) {
    issues.push('sample.source_license_policy must preserve source/license rows');
  }
  if (!String(sample.multi_answer_policy || '').includes('multi_answer=true')) {
    issues.push('sample.multi_answer_policy must preserve multi-answer warnings');
  }
  if (!String(sample.boundary || '').includes('no publication readiness')) {
    issues.push('sample.boundary must state no publication readiness');
  }
  validatePublicationBoundary(sample.publication_boundary, 'sample.publication_boundary');
  if (!Array.isArray(sample.rows)) {
    issues.push('sample.rows must be an array');
    return;
  }

  sample.rows.forEach((row, index) => validateSampleRow(row, `sample.rows[${index}]`));
  assertCountObject('sample.counts.status_counts', sample.counts?.status_counts, countValues(sample.rows.map((row) => row.status)));
  assertCountObject('sample.counts.review_status_counts', sample.counts?.review_status_counts, countValues(sample.rows.map((row) => row.review_status)));
  if (Number(sample.counts?.rows) !== sample.rows.length) issues.push('sample.counts.rows must equal rows.length');
  if (Number(sample.counts?.multi_answer_rows) !== sample.rows.filter((row) => row.multi_answer === true).length) {
    issues.push('sample.counts.multi_answer_rows must equal multi_answer row count');
  }
  if (Number(sample.counts?.rows_with_complete_source_license) !== sample.rows.filter((row) => row.source_license_complete === true).length) {
    issues.push('sample.counts.rows_with_complete_source_license must equal complete source/license rows');
  }
}

function validateSampleRow(row, context) {
  for (const field of requiredSampleFields) {
    if (!(field in row)) issues.push(`${context} missing ${field}`);
  }
  if (!allowedMachineStatuses.has(row.status)) issues.push(`${context} has invalid machine status ${row.status || '(missing)'}`);
  if (row.status === 'verified') issues.push(`${context} uses forbidden machine status verified`);
  if (!allowedMachineReviewStatuses.has(row.review_status)) {
    issues.push(`${context} has invalid review_status ${row.review_status || '(missing)'}`);
  }
  if (row.review_status === 'verified') issues.push(`${context} uses forbidden machine review_status verified`);
  if (row.status === 'single_answer_source_complete' && row.source_license_complete !== true) {
    issues.push(`${context} single_answer_source_complete requires source_license_complete=true`);
  }
  if (row.status === 'single_answer_source_complete'
    && !String(row.status_basis || '').includes('not reviewed lexical authority')) {
    issues.push(`${context} single_answer_source_complete status_basis must state not reviewed lexical authority`);
  }
  if (row.review_status === 'unreviewed_machine_sample'
    && (!String(row.review_status_basis || '').includes('not reviewed lexical authority')
      || !String(row.review_status_basis || '').includes('not publication readiness'))) {
    issues.push(`${context} review_status_basis must state not reviewed lexical authority and not publication readiness`);
  }
  if (row.answer_card_count + row.evidence_only_card_count !== row.route_card_count) {
    issues.push(`${context} route card counts do not reconcile`);
  }
  if (row.multi_answer !== (row.distinct_answer_definition_count > 1)) {
    issues.push(`${context} multi_answer does not match distinct answer count`);
  }
}

function validateLinkPacket() {
  if (linkPacket.artifact_type !== 'definition_workbench_usage_link_packet') issues.push('link packet artifact_type mismatch');
  if (linkPacket.definition_sample_contract?.review_status_axis !== 'lexical_authority_review_status') {
    issues.push('link packet must preserve lexical authority review_status axis');
  }
  if (linkPacket.authority_policy?.review_status_not_definition_authority !== true) {
    issues.push('link packet authority_policy.review_status_not_definition_authority must be true');
  }
  if (Number(linkPacket.counts?.sample_forbidden_verified_label_rows ?? 0) !== 0) {
    issues.push('link packet sample_forbidden_verified_label_rows must be 0');
  }
  if (linkPacket.quality?.status !== 'pass_with_warnings' && linkPacket.quality?.status !== 'passed') {
    issues.push('link packet quality.status must be passed or pass_with_warnings');
  }
  if (linkPacket.quality?.warning_count && Number(linkPacket.quality.warning_count) > 0) {
    warnings.push(`link packet carries ${linkPacket.quality.warning_count} warning(s); keep visible to Agent 5/6`);
  }
  validateAuthorityPolicy(linkPacket.authority_policy, 'link packet authority_policy');
}

function validateJoinSmoke() {
  if (joinSmoke.artifact_type !== 'definition_workbench_usage_join_smoke') issues.push('join smoke artifact_type mismatch');
  const snapshot = joinSmoke.current_sample_snapshot || {};
  if (snapshot.status_axis !== 'machine_route_shape_status_not_review_authority') {
    issues.push('join smoke must preserve machine status axis');
  }
  if (snapshot.review_status_axis !== 'lexical_authority_review_status') {
    issues.push('join smoke must preserve lexical authority review_status axis');
  }
  if (Number(snapshot.status_counts?.verified || 0) !== 0) issues.push('join smoke snapshot status_counts.verified must be 0');
  if (Number(snapshot.review_status_counts?.verified || 0) !== 0) issues.push('join smoke snapshot review_status_counts.verified must be 0');
  if (Number(snapshot.forbidden_verified_label_rows ?? -1) !== 0) issues.push('join smoke snapshot forbidden_verified_label_rows must be 0');
  if (Number(joinSmoke.counts?.sample_forbidden_verified_label_rows ?? 0) !== 0) {
    issues.push('join smoke counts.sample_forbidden_verified_label_rows must be 0');
  }
  validateAuthorityPolicy(joinSmoke.authority_policy, 'join smoke authority_policy');
}

function validateAgent6Packet() {
  if (agent6Packet.artifact_type !== 'definition_workbench_usage_agent6_packet') issues.push('Agent 6 packet artifact_type mismatch');
  if (Number(agent6Packet.review_summary?.current_sample_forbidden_verified_label_rows ?? -1) !== 0) {
    issues.push('Agent 6 packet current_sample_forbidden_verified_label_rows must be 0');
  }
  validateAuthorityPolicy(agent6Packet.authority_policy, 'Agent 6 packet authority_policy');
}

function validateQueueReadyPacket() {
  if (queueReadyPacket.artifact_type !== 'definition_workbench_usage_queue_ready_packet') {
    issues.push('queue-ready packet artifact_type mismatch');
  }
  if (!hasQueueReadyStatusSemantics(queueReadyPacket)) {
    issues.push('queue-ready packet must preserve status/review_status semantics');
  }
  if (!hasQueueReadyPublicationBoundary(queueReadyPacket)) {
    issues.push('queue-ready packet must preserve blocked_no_render publication boundary');
  }
  if (queueReadyPacket.queue_entry_draft?.submitted_by !== 'Agent 5') {
    issues.push('queue-ready packet queue_entry_draft.submitted_by must remain Agent 5');
  }
  const mustNotAccept = queueReadyPacket.queue_entry_draft?.what_must_not_be_accepted || [];
  for (const required of ['reviewed lexical authority', 'publication readiness', 'accepted translation text']) {
    if (!mustNotAccept.includes(required)) issues.push(`queue-ready packet must_not_accept must include ${required}`);
  }
}

function validateStatusContractFixtures() {
  const summary = {
    fixtures: Array.isArray(statusContractFixtures.fixtures) ? statusContractFixtures.fixtures.length : 0,
    expectedPass: 0,
    expectedFail: 0,
    passed: false,
  };
  if (statusContractFixtures.schema_version !== 1) issues.push('status contract fixtures schema_version must be 1');
  if (statusContractFixtures.artifact_type !== 'definition_workbench_status_contract_fixtures') {
    issues.push('status contract fixtures artifact_type mismatch');
  }
  if (statusContractFixtures.expected_machine_complete_label !== 'single_answer_source_complete') {
    issues.push('status contract fixtures expected_machine_complete_label must be single_answer_source_complete');
  }
  if (statusContractFixtures.expected_machine_review_status !== 'unreviewed_machine_sample') {
    issues.push('status contract fixtures expected_machine_review_status must be unreviewed_machine_sample');
  }
  if (statusContractFixtures.reserved_review_status !== 'verified') {
    issues.push('status contract fixtures reserved_review_status must be verified');
  }
  if (!Array.isArray(statusContractFixtures.fixtures) || statusContractFixtures.fixtures.length === 0) {
    issues.push('status contract fixtures must be a non-empty array');
    return summary;
  }

  let failedFixtureCount = 0;
  for (const fixture of statusContractFixtures.fixtures) {
    const fixtureId = fixture?.id || '(missing id)';
    if (fixture?.expect === 'pass') summary.expectedPass += 1;
    else if (fixture?.expect === 'fail') summary.expectedFail += 1;
    else issues.push(`status contract fixture ${fixtureId}.expect must be pass or fail`);

    const rowIssues = validateStatusContractFixtureRow(fixture?.row || {}, fixtureId);
    if (fixture.expect === 'pass' && rowIssues.length) {
      failedFixtureCount += 1;
      issues.push(`status contract fixture ${fixtureId} expected pass but failed: ${rowIssues.join('; ')}`);
    }
    if (fixture.expect === 'fail') {
      if (!rowIssues.length) {
        failedFixtureCount += 1;
        issues.push(`status contract fixture ${fixtureId} expected fail but passed`);
      } else if (fixture.expected_issue && !rowIssues.some((issue) => issue.includes(fixture.expected_issue))) {
        failedFixtureCount += 1;
        issues.push(`status contract fixture ${fixtureId} did not emit expected issue "${fixture.expected_issue}"`);
      }
    }
  }

  summary.passed = failedFixtureCount === 0;
  return summary;
}

function validateStatusContractFixtureRow(row, context) {
  const rowIssues = [];
  if (!allowedMachineStatuses.has(row.status)) rowIssues.push(`${context}.status has invalid machine status ${row.status || '(missing)'}`);
  if (row.status === 'verified') rowIssues.push(`${context}.machine status must not be verified`);
  if (!allowedMachineReviewStatuses.has(row.review_status)) {
    rowIssues.push(`${context}.review_status has invalid machine review status ${row.review_status || '(missing)'}`);
  }
  if (row.review_status === 'verified') {
    rowIssues.push(`${context}.review_status=verified is reserved for reviewed lexical authority`);
  }
  for (const countField of [
    'answer_card_count',
    'evidence_only_card_count',
    'route_card_count',
    'distinct_answer_definition_count',
  ]) {
    if (!Number.isInteger(row[countField]) || row[countField] < 0) {
      rowIssues.push(`${context}.${countField} must be a non-negative integer`);
    }
  }
  if (Number.isInteger(row.answer_card_count)
    && Number.isInteger(row.evidence_only_card_count)
    && Number.isInteger(row.route_card_count)
    && row.answer_card_count + row.evidence_only_card_count !== row.route_card_count) {
    rowIssues.push(`${context}.answer/evidence card counts must reconcile with route_card_count`);
  }
  if (row.status === 'single_answer_source_complete') {
    if (row.distinct_answer_definition_count !== 1) {
      rowIssues.push(`${context}.single_answer_source_complete requires one answer definition`);
    }
    if (row.answer_card_count < 1) {
      rowIssues.push(`${context}.single_answer_source_complete requires at least one answer card`);
    }
    if (row.source_license_complete !== true) {
      rowIssues.push(`${context}.single_answer_source_complete requires source_license_complete=true`);
    }
  }
  if (row.multi_answer !== (row.distinct_answer_definition_count > 1)) {
    rowIssues.push(`${context}.multi_answer must match distinct_answer_definition_count > 1`);
  }
  if (row.multi_answer === true && row.status !== 'conflicting') {
    rowIssues.push(`${context}.multi_answer=true must remain a conflicting warning`);
  }
  validateStatusContractFixtureBoundary(row.publication_boundary, `${context}.publication_boundary`, rowIssues);
  return rowIssues;
}

function validateStatusContractFixtureBoundary(boundary, context, rowIssues) {
  if (!boundary || typeof boundary !== 'object') {
    rowIssues.push(`${context} must be an object`);
    return;
  }
  if (boundary.boundary_status !== 'blocked_no_render') rowIssues.push(`${context}.boundary_status must be blocked_no_render`);
  for (const key of [
    'reader_facing',
    'ui_assignment',
    'publication_claim',
    'clears_publication_readiness',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'public_lookup_artifact',
  ]) {
    if (boundary[key] !== false) rowIssues.push(`${context}.${key} must be false`);
  }
}

function hasQueueReadyStatusSemantics(packet) {
  const summary = packet.status_semantics_summary || {};
  return summary.machine_status_axis === 'machine_route_shape_status_not_review_authority'
    && summary.machine_complete_label === 'single_answer_source_complete'
    && summary.machine_review_status === 'unreviewed_machine_sample'
    && summary.verified_review_status_reserved === true
    && summary.answer_role_preserved === true
    && summary.source_license_rows_preserved === true
    && summary.multi_answer_warnings_preserved === true
    && summary.publication_boundary_preserved === true
    && summary.consumer_manifest_reviewed_lexical_authority === false
    && summary.consumer_manifest_accepted_translation_output === false
    && summary.consumer_manifest_publication_readiness === false;
}

function hasQueueReadyPublicationBoundary(packet) {
  const boundary = packet.publication_boundary || {};
  const doesNotClear = new Set(Array.isArray(boundary.does_not_clear) ? boundary.does_not_clear : []);
  return boundary.boundary_status === 'blocked_no_render'
    && boundary.queue_ready_only === true
    && boundary.reader_facing === false
    && boundary.ui_assignment === false
    && boundary.publication_claim === false
    && boundary.clears_publication_readiness === false
    && boundary.reviewed_lexical_authority === false
    && boundary.accepted_translation_output === false
    && boundary.source_publication === false
    && boundary.public_lookup_artifact === false
    && boundary.control_queue_mutated === false
    && boundary.submitted_to_agent6 === false
    && doesNotClear.has('reviewed_lexical_authority')
    && doesNotClear.has('accepted_translation')
    && doesNotClear.has('publication_readiness');
}

function validateAuthorityPolicy(policy, context) {
  if (!policy || typeof policy !== 'object') {
    issues.push(`${context} missing`);
    return;
  }
  for (const [field, expected] of [
    ['reader_facing', false],
    ['ranks_routes', false],
    ['selects_visible_result', false],
    ['copies_translation_payloads', false],
    ['publication_claim', false],
  ]) {
    if (policy[field] !== expected) issues.push(`${context}.${field} must be ${expected}`);
  }
}

function validatePublicationBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.boundary_status !== 'blocked_no_render') issues.push(`${context}.boundary_status must be blocked_no_render`);
  if (boundary.sample_only !== true) issues.push(`${context}.sample_only must be true`);
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
  const blockedClaims = new Set(Array.isArray(boundary.does_not_clear) ? boundary.does_not_clear : []);
  for (const required of [
    'ui_assignment',
    'reviewed_lexical_authority',
    'accepted_translation',
    'source_publication',
    'public_lookup_publication',
    'publication_readiness',
  ]) {
    if (!blockedClaims.has(required)) issues.push(`${context}.does_not_clear must include ${required}`);
  }
}

function hasUnsafeAuthorityOrPublicationClaim(value) {
  if (!value || typeof value !== 'object') return false;
  if (value.reader_facing === true
    || value.ui_assignment === true
    || value.publication_claim === true
    || value.clears_publication_readiness === true
    || value.reviewed_lexical_authority === true
    || value.accepted_translation_output === true
    || value.source_publication === true
    || value.public_lookup_artifact === true
    || value.publication_status === 'published'
    || value.publication_ready === true) {
    return true;
  }
  if (Array.isArray(value)) return value.some((item) => hasUnsafeAuthorityOrPublicationClaim(item));
  return Object.values(value).some((item) => hasUnsafeAuthorityOrPublicationClaim(item));
}

function assertCountObject(name, actual, expected) {
  if (!actual || typeof actual !== 'object') {
    issues.push(`${name} must exist`);
    return;
  }
  if (JSON.stringify(sortObject(actual)) !== JSON.stringify(sortObject(expected))) {
    issues.push(`${name} does not match actual row counts`);
  }
  if (Number(actual.verified || 0) !== 0) issues.push(`${name}.verified must remain 0`);
}

function sortObject(value) {
  return Object.fromEntries(Object.entries(value).sort((a, b) => a[0].localeCompare(b[0])));
}

function countValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return sortObject(Object.fromEntries(counts.entries()));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Status Contract',
    '',
    `- Generated: ${artifact.generated_at}`,
    `- Status: ${artifact.status}`,
    `- Sample rows: ${artifact.counts.sample_rows}`,
    `- Rows using forbidden verified labels: ${artifact.counts.forbidden_verified_label_rows}`,
    `- Complete source/license rows: ${artifact.counts.complete_source_license_rows}`,
    `- Answer-role rows with answer cards: ${artifact.counts.answer_role_ready_rows}`,
    `- Multi-answer warning rows: ${artifact.counts.multi_answer_rows}`,
    `- UI/authority/publication claim artifacts: ${artifact.counts.unsafe_authority_or_publication_claim_artifacts}`,
    '',
    '## Contract',
    '',
    '- Machine route-shape status may use `single_answer_source_complete`; it is not reviewed lexical authority.',
    '- `review_status=verified` is reserved for future reviewed lexical authority and is forbidden in this machine sample lane.',
    '- `status=verified` is forbidden for machine-derived Definition Workbench sample rows.',
    '- Source/license completeness, answer-role counts, and multi-answer warnings remain visible.',
    '- This validator makes no UI assignment and clears no publication boundary.',
    '',
    '## Current Disposition',
    '',
    `- Agent 6 verified-overclaim warning addressed in current machine artifacts: ${artifact.current_disposition.agent6_verified_overclaim_warning_addressed}`,
    `- Queue-ready status semantics preserved: ${artifact.current_disposition.queue_ready_status_semantics_preserved}`,
    `- Queue-ready publication boundary preserved: ${artifact.current_disposition.queue_ready_publication_boundary_preserved}`,
    `- Machine complete label: ${artifact.current_disposition.machine_complete_label}`,
    `- Machine review status: ${artifact.current_disposition.machine_review_status}`,
    `- Reserved review label: ${artifact.current_disposition.reserved_review_label}`,
    `- Status contract fixtures checked: ${artifact.current_disposition.status_contract_fixtures_checked}`,
    `- Status contract fixtures passed: ${artifact.current_disposition.status_contract_fixtures_passed}`,
    `- Reviewed lexical authority: ${artifact.current_disposition.reviewed_lexical_authority}`,
    `- Accepted translation output: ${artifact.current_disposition.accepted_translation_output}`,
    `- Publication readiness: ${artifact.current_disposition.publication_readiness}`,
    `- Historical warning report scope: ${artifact.current_disposition.historical_warning_reports_scope}`,
    '',
    '## Current Artifacts Checked',
    '',
    ...artifact.current_disposition.current_artifacts_checked.map((artifactPath) => `- ${artifactPath}`),
    '',
    '## Historical Warning Reports',
    '',
    ...artifact.current_disposition.historical_warning_reports.map((artifactPath) => `- ${artifactPath}`),
    '',
    '## Publication Boundary',
    '',
    `- Boundary status: ${artifact.contract.publication_boundary?.boundary_status || '(missing)'}`,
    `- Sample only: ${artifact.contract.publication_boundary?.sample_only}`,
    `- Reader-facing: ${artifact.contract.publication_boundary?.reader_facing}`,
    `- UI assignment: ${artifact.contract.publication_boundary?.ui_assignment}`,
    `- Publication claim: ${artifact.contract.publication_boundary?.publication_claim}`,
    `- Clears publication readiness: ${artifact.contract.publication_boundary?.clears_publication_readiness}`,
    `- Reviewed lexical authority: ${artifact.contract.publication_boundary?.reviewed_lexical_authority}`,
    `- Accepted translation output: ${artifact.contract.publication_boundary?.accepted_translation_output}`,
    `- Source publication: ${artifact.contract.publication_boundary?.source_publication}`,
    `- Public lookup artifact: ${artifact.contract.publication_boundary?.public_lookup_artifact}`,
    `- Does not clear: ${(artifact.contract.publication_boundary?.does_not_clear || []).join(', ')}`,
    '',
    '## Status Counts',
    '',
    ...Object.entries(artifact.counts.status_counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Review Status Counts',
    '',
    ...Object.entries(artifact.counts.review_status_counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Downstream Packet Checks',
    '',
    `- Link packet forbidden verified labels: ${artifact.counts.link_packet_sample_forbidden_verified_label_rows}`,
    `- Join smoke forbidden verified labels: ${artifact.counts.join_smoke_sample_forbidden_verified_label_rows}`,
    `- Agent 6 packet forbidden verified labels: ${artifact.counts.agent6_packet_current_sample_forbidden_verified_label_rows}`,
    `- Queue-ready status semantics preserved: ${artifact.counts.queue_ready_status_semantics_preserved}`,
    `- Queue-ready publication boundary preserved: ${artifact.counts.queue_ready_publication_boundary_preserved}`,
    `- Status contract fixture rows: ${artifact.counts.status_contract_fixture_rows}`,
    `- Status contract fixture expected-pass rows: ${artifact.counts.status_contract_fixture_expected_pass_rows}`,
    `- Status contract fixture expected-fail rows: ${artifact.counts.status_contract_fixture_expected_fail_rows}`,
    `- Status contract fixtures passed: ${artifact.counts.status_contract_fixture_passed}`,
    '',
    '## Warnings',
    '',
    ...(artifact.warnings.length ? artifact.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Issues',
    '',
    ...(artifact.issues.length ? artifact.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}`);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
