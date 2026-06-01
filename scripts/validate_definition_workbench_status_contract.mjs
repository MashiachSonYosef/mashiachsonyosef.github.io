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

const sample = readJson(samplePath);
const linkPacket = readJson(linkPacketPath);
const joinSmoke = readJson(joinSmokePath);
const agent6Packet = readJson(agent6PacketPath);

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
  'review_status',
];
const artifactPaths = {
  definition_workbench_sample: samplePath,
  definition_workbench_usage_link_packet: linkPacketPath,
  definition_workbench_usage_join_smoke: joinSmokePath,
  definition_workbench_usage_agent6_packet: agent6PacketPath,
};

validateSample();
validateLinkPacket();
validateJoinSmoke();
validateAgent6Packet();

const sampleRows = Array.isArray(sample.rows) ? sample.rows : [];
const machineVerifiedRows = sampleRows.filter((row) => row.status === 'verified' || row.review_status === 'verified').length;
const statusCounts = countValues(sampleRows.map((row) => row.status));
const reviewStatusCounts = countValues(sampleRows.map((row) => row.review_status));
const completeSourceLicenseRows = sampleRows.filter((row) => row.source_license_complete === true).length;
const answerRoleReadyRows = sampleRows.filter((row) => Number(row.answer_card_count || 0) > 0).length;
const multiAnswerRows = sampleRows.filter((row) => row.multi_answer === true).length;
const publicationClaimArtifacts = Object.entries({
  sample,
  link_packet: linkPacket,
  join_smoke: joinSmoke,
  agent6_packet: agent6Packet,
}).filter(([, artifact]) => hasPublicationClaim(artifact)).map(([name]) => name);

const status = issues.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed';
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
    'no_ui_assignment_or_publication_claim',
  ],
  inputs: artifactPaths,
  contract: {
    machine_shape_status_axis: sample.status_axis || null,
    review_status_axis: sample.review_status_axis || null,
    verified_reserved_for_reviewed_lexical_authority: true,
    allowed_machine_statuses: [...allowedMachineStatuses].sort(),
    allowed_machine_review_statuses: [...allowedMachineReviewStatuses].sort(),
    publication_boundary: 'Definition Workbench machine contract only; no UI assignment, accepted translation, source publication, or publication readiness claim.',
  },
  counts: {
    sample_rows: sampleRows.length,
    machine_verified_rows: machineVerifiedRows,
    status_counts: statusCounts,
    review_status_counts: reviewStatusCounts,
    complete_source_license_rows: completeSourceLicenseRows,
    answer_role_ready_rows: answerRoleReadyRows,
    multi_answer_rows: multiAnswerRows,
    link_packet_sample_review_verified_rows: Number(linkPacket.counts?.sample_review_verified_rows ?? 0),
    join_smoke_sample_review_verified_rows: Number(joinSmoke.counts?.sample_review_verified_rows ?? 0),
    agent6_packet_current_sample_review_verified_rows: Number(agent6Packet.review_summary?.current_sample_review_verified_rows ?? agent6Packet.counts?.current_sample_review_verified_rows ?? 0),
    publication_claim_artifacts: publicationClaimArtifacts.length,
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

console.log(`Definition Workbench status contract ${status}. Rows: ${sampleRows.length}; machine verified rows: ${machineVerifiedRows}.`);

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
  if (Number(linkPacket.counts?.sample_review_verified_rows ?? 0) !== 0) {
    issues.push('link packet sample_review_verified_rows must be 0');
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
  if (Number(snapshot.machine_verified_rows ?? -1) !== 0) issues.push('join smoke snapshot machine_verified_rows must be 0');
  if (Number(joinSmoke.counts?.sample_review_verified_rows ?? 0) !== 0) {
    issues.push('join smoke counts.sample_review_verified_rows must be 0');
  }
  validateAuthorityPolicy(joinSmoke.authority_policy, 'join smoke authority_policy');
}

function validateAgent6Packet() {
  if (agent6Packet.artifact_type !== 'definition_workbench_usage_agent6_packet') issues.push('Agent 6 packet artifact_type mismatch');
  if (Number(agent6Packet.review_summary?.current_sample_review_verified_rows ?? -1) !== 0) {
    issues.push('Agent 6 packet current_sample_review_verified_rows must be 0');
  }
  validateAuthorityPolicy(agent6Packet.authority_policy, 'Agent 6 packet authority_policy');
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

function hasPublicationClaim(value) {
  if (!value || typeof value !== 'object') return false;
  if (value.publication_claim === true || value.publication_status === 'published' || value.publication_ready === true) return true;
  if (Array.isArray(value)) return value.some((item) => hasPublicationClaim(item));
  return Object.values(value).some((item) => hasPublicationClaim(item));
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
    `- Machine verified rows: ${artifact.counts.machine_verified_rows}`,
    `- Complete source/license rows: ${artifact.counts.complete_source_license_rows}`,
    `- Answer-role rows with answer cards: ${artifact.counts.answer_role_ready_rows}`,
    `- Multi-answer warning rows: ${artifact.counts.multi_answer_rows}`,
    `- Publication-claim artifacts: ${artifact.counts.publication_claim_artifacts}`,
    '',
    '## Contract',
    '',
    '- Machine route-shape status may use `single_answer_source_complete`; it is not reviewed lexical authority.',
    '- `review_status=verified` is reserved for future reviewed lexical authority and is forbidden in this machine sample lane.',
    '- `status=verified` is forbidden for machine-derived Definition Workbench sample rows.',
    '- Source/license completeness, answer-role counts, and multi-answer warnings remain visible.',
    '- This validator makes no UI assignment and clears no publication boundary.',
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
    `- Link packet machine verified rows: ${artifact.counts.link_packet_sample_review_verified_rows}`,
    `- Join smoke machine verified rows: ${artifact.counts.join_smoke_sample_review_verified_rows}`,
    `- Agent 6 packet machine verified rows: ${artifact.counts.agent6_packet_current_sample_review_verified_rows}`,
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
