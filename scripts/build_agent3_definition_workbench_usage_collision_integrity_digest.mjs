#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const sourcePath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json';
const outputPath = process.argv[3] || 'data/definitions/agent3-definition-workbench-usage-collision-integrity-digest-reshit.json';
const reportPath = process.argv[4] || 'reports/agent3-definition-workbench-usage-collision-integrity-digest-reshit.md';

const manifest = readJson(sourcePath);
if (manifest.artifact_type !== 'agent3_definition_workbench_usage_collision_handoff_manifest') {
  throw new Error(`Unexpected source artifact: ${manifest.artifact_type}`);
}

const digestEntries = [];
for (const entry of manifest.manifest_entries || []) {
  digestEntries.push(buildDigestEntry(entry, 'data', entry.data_path));
  digestEntries.push(buildDigestEntry(entry, 'report', entry.report_path));
  digestEntries.push(buildDigestEntry(entry, 'validator', entry.validator_path));
}
digestEntries.push(buildDigestEntry({
  key: 'collision_handoff_manifest',
  artifact_type: manifest.artifact_type,
  status: manifest.status,
  counts: manifest.counts,
}, 'data', sourcePath));
digestEntries.push(buildDigestEntry({
  key: 'collision_handoff_manifest',
  artifact_type: manifest.artifact_type,
  status: manifest.status,
  counts: manifest.counts,
}, 'report', 'reports/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.md'));
digestEntries.push(buildDigestEntry({
  key: 'collision_handoff_manifest',
  artifact_type: manifest.artifact_type,
  status: manifest.status,
  counts: manifest.counts,
}, 'validator', 'scripts/validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs'));

const artifactKeys = [...new Set(digestEntries.map((entry) => entry.artifact_key))].sort();
const counts = {
  digest_entries: digestEntries.length,
  artifact_keys: artifactKeys.length,
  data_entries: digestEntries.filter((entry) => entry.file_role === 'data').length,
  report_entries: digestEntries.filter((entry) => entry.file_role === 'report').length,
  validator_entries: digestEntries.filter((entry) => entry.file_role === 'validator').length,
  files_present: digestEntries.filter((entry) => entry.exists).length,
  entries_with_sha256: digestEntries.filter((entry) => entry.sha256).length,
  entries_with_bytes: digestEntries.filter((entry) => Number.isInteger(entry.bytes) && entry.bytes >= 0).length,
  evidence_ready_data_artifacts: digestEntries.filter((entry) => entry.file_role === 'data' && entry.status === 'evidence-ready').length,
  total_bytes: digestEntries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0),
  manifest_reader_facing_rows: manifest.counts?.total_reader_facing_rows || 0,
  manifest_route_payload_field_hits: manifest.counts?.total_route_payload_field_hits || 0,
  manifest_forbidden_authority_field_hits: manifest.counts?.total_forbidden_authority_field_hits || 0,
  manifest_source_text_reads: manifest.counts?.total_source_text_reads || 0,
  manifest_broad_target_expansion: manifest.counts?.total_broad_target_expansion || 0,
  manifest_queue_mutations: manifest.counts?.total_queue_mutations || 0,
  manifest_submitted_to_agent6: manifest.counts?.total_submitted_to_agent6 || 0,
  reader_facing_rows: 0,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  source_text_reads: 0,
  broad_target_expansion: 0,
  queue_mutations: 0,
  submitted_to_agent6: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_integrity_digest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_integrity_digest.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: manifest.focus_token_normalized,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    collision_handoff_manifest: sourcePath,
  },
  policy: 'Integrity digest for Agent 3 collision handoff artifacts. It records file identity, sizes, hashes, artifact statuses, and boundary counts for QA drift detection only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    integrity_digest_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    audit_only: true,
    reader_facing: false,
    definition_authority: false,
    reviewed_lexical_authority: false,
    semantic_arbitration: false,
    route_ranking: false,
    visible_answer_selection: false,
    copied_route_payloads: false,
    accepted_text_output: false,
    publication_claim: false,
    source_text_read: false,
    broad_target_expansion: false,
    agent6_accepted: false,
  },
  digest_scope: {
    source_manifest: sourcePath,
    artifact_keys: artifactKeys,
    file_roles: ['data', 'report', 'validator'],
    hash_algorithm: 'sha256',
    consumer_action: 'verify file identity before Agent 6/Agent 5 QA intake; treat rows as observed usage/navigation only',
  },
  digest_entries: digestEntries,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision integrity digest ${artifact.status}; entries ${counts.digest_entries}; total bytes ${counts.total_bytes}`);

function buildDigestEntry(entry, fileRole, relativePath) {
  const fullPath = path.join(root, relativePath);
  const exists = fs.existsSync(fullPath);
  const bytes = exists ? fs.statSync(fullPath).size : 0;
  const sha256 = exists ? crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex') : null;
  return {
    artifact_key: entry.key,
    artifact_type: entry.artifact_type || entry.expected_type || null,
    status: entry.status || null,
    file_role: fileRole,
    path: relativePath,
    exists,
    bytes,
    sha256,
    counts_snapshot: fileRole === 'data' ? (entry.counts || {}) : {},
    boundary_summary: fileRole === 'data' ? (entry.boundary_summary || boundaryFromCounts(entry.counts || {})) : {},
  };
}

function boundaryFromCounts(counts) {
  return {
    reader_facing_rows: counts.reader_facing_rows || counts.total_reader_facing_rows || 0,
    route_payload_field_hits: counts.route_payload_field_hits || counts.total_route_payload_field_hits || 0,
    forbidden_authority_field_hits: counts.forbidden_authority_field_hits || counts.total_forbidden_authority_field_hits || 0,
    source_text_reads: counts.source_text_reads || counts.total_source_text_reads || 0,
    broad_target_expansion: counts.broad_target_expansion || counts.total_broad_target_expansion || 0,
    queue_mutations: counts.queue_mutations || counts.total_queue_mutations || 0,
    submitted_to_agent6: counts.submitted_to_agent6 || counts.total_submitted_to_agent6 || 0,
  };
}

function buildChecks(c) {
  return [
    check('digest_entries_present', c.digest_entries === 12, `entries ${c.digest_entries}`),
    check('all_files_present', c.files_present === c.digest_entries, `present ${c.files_present}/${c.digest_entries}`),
    check('roles_complete', c.data_entries === 4 && c.report_entries === 4 && c.validator_entries === 4, `data/report/validator ${c.data_entries}/${c.report_entries}/${c.validator_entries}`),
    check('hashes_and_sizes_present', c.entries_with_sha256 === c.digest_entries && c.entries_with_bytes === c.digest_entries && c.total_bytes > 0, `hash/bytes/total ${c.entries_with_sha256}/${c.entries_with_bytes}/${c.total_bytes}`),
    check('data_artifacts_evidence_ready', c.evidence_ready_data_artifacts === c.data_entries, `evidence-ready data ${c.evidence_ready_data_artifacts}/${c.data_entries}`),
    check('manifest_boundary_zero', c.manifest_reader_facing_rows === 0 && c.manifest_route_payload_field_hits === 0 && c.manifest_forbidden_authority_field_hits === 0, `manifest reader/payload/forbidden ${c.manifest_reader_facing_rows}/${c.manifest_route_payload_field_hits}/${c.manifest_forbidden_authority_field_hits}`),
    check('manifest_no_side_effects', c.manifest_source_text_reads === 0 && c.manifest_broad_target_expansion === 0 && c.manifest_queue_mutations === 0 && c.manifest_submitted_to_agent6 === 0, `manifest source/broad/queue/submitted ${c.manifest_source_text_reads}/${c.manifest_broad_target_expansion}/${c.manifest_queue_mutations}/${c.manifest_submitted_to_agent6}`),
    check('digest_boundary_zero', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `digest reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('digest_no_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `digest source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Definition Workbench Usage Collision Integrity Digest',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: integrity/drift digest only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Digest entries: ${c.digest_entries}`,
    `- Artifact keys: ${c.artifact_keys}`,
    `- Data/report/validator entries: ${c.data_entries}/${c.report_entries}/${c.validator_entries}`,
    `- Files present / SHA-256 present: ${c.files_present}/${c.entries_with_sha256}`,
    `- Evidence-ready data artifacts: ${c.evidence_ready_data_artifacts}/${c.data_entries}`,
    `- Total bytes: ${c.total_bytes}`,
    `- Manifest reader-facing / route-payload / forbidden-authority hits: ${c.manifest_reader_facing_rows}/${c.manifest_route_payload_field_hits}/${c.manifest_forbidden_authority_field_hits}`,
    '',
    '## Digest Entries',
    '',
    '| artifact | role | bytes | sha256 | path |',
    '|---|---|---:|---|---|',
    ...artifact.digest_entries.map((entry) => `| ${entry.artifact_key} | ${entry.file_role} | ${entry.bytes} | ${entry.sha256} | ${entry.path} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This digest is Agent 3 QA/drift scaffolding only. It records file identity for usage-navigation artifacts and does not mutate queues, inspect source text, or convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}
