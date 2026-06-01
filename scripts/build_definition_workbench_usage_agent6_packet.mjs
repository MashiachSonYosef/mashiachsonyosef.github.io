#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  usageLinkPacket: 'data/definitions/definition-workbench-usage-link-packet.json',
  usageSeedQueue: 'data/definitions/definition-workbench-usage-seed-queue.json',
  usageJoinSmoke: 'data/definitions/definition-workbench-usage-join-smoke.json',
  output: 'data/definitions/definition-workbench-usage-agent6-packet.json',
  report: 'reports/definition-workbench-usage-agent6-packet.md',
};

const options = parseArgs(process.argv.slice(2));
const linkPacket = readJson(options.usageLinkPacket);
const seedQueue = readJson(options.usageSeedQueue);
const joinSmoke = readJson(options.usageJoinSmoke);

if (linkPacket.artifact_type !== 'definition_workbench_usage_link_packet') {
  throw new Error(`${options.usageLinkPacket} is not a Definition Workbench usage-link packet`);
}
if (seedQueue.artifact_type !== 'definition_workbench_usage_seed_queue') {
  throw new Error(`${options.usageSeedQueue} is not a Definition Workbench usage seed queue`);
}
if (joinSmoke.artifact_type !== 'definition_workbench_usage_join_smoke') {
  throw new Error(`${options.usageJoinSmoke} is not a Definition Workbench usage join smoke`);
}

const joinRows = Array.isArray(joinSmoke.join_rows) ? joinSmoke.join_rows : [];
const proofOccurrences = joinRows.flatMap((row) => (row.occurrence_links || []).map((occurrence) => ({
  token_key: row.token_key,
  normalized_form: row.normalized_form,
  occurrence_id: occurrence.occurrence_id,
  source_ref: occurrence.source_ref,
  source_href: occurrence.source_href,
  work_anchor_href: occurrence.work_anchor_href,
  status: occurrence.status,
  raw_score: occurrence.raw_score,
  cluster_id: occurrence.cluster_id,
  usage_frame_label: occurrence.usage_frame_label,
  context_focus_marked: occurrence.context_focus_marked,
  route_ids: Array.isArray(occurrence.route_ids) ? occurrence.route_ids : [],
  license: occurrence.license,
  license_url: occurrence.license_url,
  version_title: occurrence.version_title,
  version_source: occurrence.version_source,
  occurrence_boundary: {
    observed_usage_only: true,
    reader_facing: false,
    route_ids_only: true,
    not_answer_authority: true,
  },
})));

const counts = buildCounts(proofOccurrences);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_agent6_packet',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_agent6_packet.mjs',
  gate: 'definition_workbench_gate',
  submitted_by: 'Agent 3',
  requested_review: 'usage_navigation_boundary_review_for_definition_workbench_planning',
  policy: 'Agent 3 QA packet for Definition Workbench usage-navigation linkage. It packages existing usage-link, seed-queue, and join-smoke artifacts for Agent 6 review without claiming answer authority, UI readiness, semantic verdicts, route ranking, accepted translation, publication readiness, or source/provenance acceptance beyond the cited rows.',
  evidence_artifacts: [
    options.usageLinkPacket,
    'reports/definition-workbench-usage-link-packet.md',
    options.usageSeedQueue,
    'reports/definition-workbench-usage-seed-queue.md',
    options.usageJoinSmoke,
    'reports/definition-workbench-usage-join-smoke.md',
  ],
  validators: [
    'scripts/validate_definition_workbench_usage_link_packet.mjs',
    'scripts/validate_definition_workbench_usage_seed_queue.mjs',
    'scripts/validate_definition_workbench_usage_join_smoke.mjs',
    'scripts/validate_definition_workbench_usage_agent6_packet.mjs',
  ],
  authority_policy: {
    usage_navigation_only: true,
    qa_packet_only: true,
    live_sample_unchanged: true,
    route_ids_only: true,
    usage_rows_not_answer_authority: true,
    review_status_not_answer_authority: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    copies_route_payloads: false,
    copies_translation_payloads: false,
    publication_claim: false,
  },
  packet_chain: {
    link_packet_status: linkPacket.quality?.status || 'unknown',
    seed_queue_status: seedQueue.quality?.status || 'unknown',
    join_smoke_status: joinSmoke.quality?.status || 'unknown',
    link_packet_warning_count: Number(linkPacket.quality?.warning_count || 0),
    seed_queue_warning_count: Number(seedQueue.quality?.warning_count || 0),
    join_smoke_warning_count: Number(joinSmoke.quality?.warning_count || 0),
  },
  review_summary: {
    current_sample_rows: Number(joinSmoke.counts?.sample_rows_checked || 0),
    current_sample_review_verified_rows: currentSampleReviewVerifiedRows(),
    current_sample_rows_with_usage_links: Number(linkPacket.counts?.sample_rows_with_usage_links || 0),
    usage_tokens_absent_from_current_sample: Number(seedQueue.counts?.seed_rows_absent_from_sample || 0),
    join_rows: Number(joinSmoke.counts?.join_rows || 0),
    projected_rows_after_seed_append: Number(joinSmoke.counts?.projected_rows_after_seed_append || 0),
    projected_usage_link_rows: Number(joinSmoke.counts?.projected_usage_link_rows || 0),
    selected_occurrence_proof_rows: proofOccurrences.length,
    route_concentration_warning_visible: Number(joinSmoke.counts?.route_concentration_warning_visible || 0) === 1,
  },
  acceptance_boundaries: {
    acceptable_if_validated: [
      'usage-only occurrence linkage can be inspected as Definition Workbench planning context',
      'seed queue can guide a future bounded sample-join smoke',
      'route references are route IDs only and must resolve through Agent 2 artifacts',
      'selected occurrence links preserve source, work anchor, context, license, and version metadata',
    ],
    blocked_acceptance_claims: [
      'reviewed lexical authority',
      'visible answer selection',
      'HUD or Workbench UI implementation acceptance',
      'route ranking or semantic arbitration',
      'publication readiness',
      'accepted translation text',
      'broad corpus coverage beyond the selected seed scope',
      'source/provenance acceptance outside the cited occurrence rows',
    ],
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  proof_occurrences: proofOccurrences,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage Agent 6 packet proof rows ${artifact.counts.proof_occurrence_rows}; route IDs ${artifact.counts.route_ids}; reader-facing rows ${artifact.counts.reader_facing_rows}`);

function buildCounts(rows) {
  return {
    evidence_artifacts: 6,
    validator_scripts: 4,
    proof_occurrence_rows: rows.length,
    proof_rows_with_source: rows.filter((row) => row.source_href).length,
    proof_rows_with_work_anchor: rows.filter((row) => row.work_anchor_href).length,
    proof_rows_with_context: rows.filter((row) => row.context_focus_marked).length,
    proof_rows_with_license: rows.filter((row) => row.license && row.license_url).length,
    proof_rows_with_version: rows.filter((row) => row.version_title && row.version_source).length,
    proof_rows_with_route_ids: rows.filter((row) => Array.isArray(row.route_ids) && row.route_ids.length > 0).length,
    route_ids: new Set(rows.flatMap((row) => row.route_ids || [])).size,
    tokens: new Set(rows.map((row) => row.token_key)).size,
    usage_frames: new Set(rows.map((row) => row.usage_frame_label).filter(Boolean)).size,
    supported_rows: rows.filter((row) => row.status === 'supported').length,
    candidate_rows: rows.filter((row) => row.status === 'candidate').length,
    weak_rows: rows.filter((row) => row.status === 'weak').length,
    audit_only_ambiguous_rows: Number(joinSmoke.counts?.audit_only_ambiguous_rows || 0),
    current_sample_rows: Number(joinSmoke.counts?.sample_rows_checked || 0),
    current_sample_review_verified_rows: currentSampleReviewVerifiedRows(),
    current_sample_rows_with_usage_links: Number(linkPacket.counts?.sample_rows_with_usage_links || 0),
    usage_tokens_absent_from_current_sample: Number(seedQueue.counts?.seed_rows_absent_from_sample || 0),
    join_rows: Number(joinSmoke.counts?.join_rows || 0),
    projected_rows_after_seed_append: Number(joinSmoke.counts?.projected_rows_after_seed_append || 0),
    projected_usage_link_rows: Number(joinSmoke.counts?.projected_usage_link_rows || 0),
    route_concentration_warning_visible: Number(joinSmoke.counts?.route_concentration_warning_visible || 0) === 1 ? 1 : 0,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('artifact_chain_present', counts.evidence_artifacts === 6 && counts.validator_scripts === 4 ? 'passed' : 'failed', `evidence artifacts ${counts.evidence_artifacts}; validators ${counts.validator_scripts}`),
    check('proof_occurrences_present', counts.proof_occurrence_rows > 0 ? 'passed' : 'failed', `proof occurrence rows ${counts.proof_occurrence_rows}`),
    check('proof_occurrence_metadata_complete', counts.proof_rows_with_source === counts.proof_occurrence_rows && counts.proof_rows_with_work_anchor === counts.proof_occurrence_rows && counts.proof_rows_with_context === counts.proof_occurrence_rows && counts.proof_rows_with_license === counts.proof_occurrence_rows && counts.proof_rows_with_version === counts.proof_occurrence_rows ? 'passed' : 'failed', `source/work/context/license/version ${counts.proof_rows_with_source}/${counts.proof_rows_with_work_anchor}/${counts.proof_rows_with_context}/${counts.proof_rows_with_license}/${counts.proof_rows_with_version}`),
    check('route_ids_only', counts.route_ids > 0 && counts.proof_rows_with_route_ids === counts.proof_occurrence_rows && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; route-id rows ${counts.proof_rows_with_route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('usage_seed_absence_visible', counts.current_sample_rows > 0 && counts.current_sample_rows_with_usage_links === 0 && counts.usage_tokens_absent_from_current_sample > 0 ? 'passed' : 'warning', `sample rows ${counts.current_sample_rows}; current usage links ${counts.current_sample_rows_with_usage_links}; absent seeds ${counts.usage_tokens_absent_from_current_sample}`),
    check('sample_review_status_not_verified', counts.current_sample_review_verified_rows === 0 ? 'passed' : 'failed', `machine verified sample rows ${counts.current_sample_review_verified_rows}`),
    check('join_smoke_bounded', counts.join_rows > 0 && counts.projected_rows_after_seed_append === counts.current_sample_rows + counts.usage_tokens_absent_from_current_sample ? 'passed' : 'failed', `join rows ${counts.join_rows}; projected rows ${counts.projected_rows_after_seed_append}`),
    check('ambiguous_rows_audit_only', counts.audit_only_ambiguous_rows > 0 && counts.reader_facing_rows === 0 ? 'passed' : 'failed', `audit-only ambiguous rows ${counts.audit_only_ambiguous_rows}; reader-facing rows ${counts.reader_facing_rows}`),
    check('route_concentration_warning_preserved', counts.route_concentration_warning_visible === 1 ? 'passed' : 'warning', `route concentration warning visible ${counts.route_concentration_warning_visible}`),
    check('forbidden_authority_fields_absent', counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `forbidden authority field hits ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Agent 6 Packet',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Current sample rows / current rows with usage links: ${artifact.counts.current_sample_rows}/${artifact.counts.current_sample_rows_with_usage_links}`,
    `- Machine verified sample/review rows: ${artifact.counts.current_sample_review_verified_rows}`,
    `- Usage tokens absent from current sample: ${artifact.counts.usage_tokens_absent_from_current_sample}`,
    `- Join rows / projected rows after seed append: ${artifact.counts.join_rows}/${artifact.counts.projected_rows_after_seed_append}`,
    `- Projected usage-link rows: ${artifact.counts.projected_usage_link_rows}`,
    `- Proof occurrence rows: ${artifact.counts.proof_occurrence_rows}`,
    `- Proof rows with source/work/context/license/version/route IDs: ${artifact.counts.proof_rows_with_source}/${artifact.counts.proof_rows_with_work_anchor}/${artifact.counts.proof_rows_with_context}/${artifact.counts.proof_rows_with_license}/${artifact.counts.proof_rows_with_version}/${artifact.counts.proof_rows_with_route_ids}`,
    `- Supported/candidate/weak proof rows: ${artifact.counts.supported_rows}/${artifact.counts.candidate_rows}/${artifact.counts.weak_rows}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Audit-only ambiguous rows carried: ${artifact.counts.audit_only_ambiguous_rows}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Forbidden authority field hits: ${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Evidence Artifacts',
    '',
    ...artifact.evidence_artifacts.map((artifactPath) => `- ${artifactPath}`),
    '',
    '## Blocked Acceptance Claims',
    '',
    ...artifact.acceptance_boundaries.blocked_acceptance_claims.map((claim) => `- ${claim}`),
    '',
    '## Boundary',
    '',
    artifact.policy,
    '',
    'This packet is for Agent 6 review of usage-navigation linkage only. It should not be used as a reader-facing definition, route winner, semantic verdict, or publication artifact.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function currentSampleReviewVerifiedRows() {
  return Number(joinSmoke.current_sample_snapshot?.machine_verified_rows ?? joinSmoke.counts?.sample_review_verified_rows ?? 0);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--usage-link-packet=')) parsed.usageLinkPacket = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-seed-queue=')) parsed.usageSeedQueue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--usage-join-smoke=')) parsed.usageJoinSmoke = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
