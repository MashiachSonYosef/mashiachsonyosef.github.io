#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-integrity-digest-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-integrity-digest-reshit.md';

const manifestPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.json';
const manifest = readJson(manifestPath);
const manifestEntries = manifest.manifest_entries || [];

const digestTargets = [
  {
    key: 'work_category_handoff_manifest_data',
    role: 'current work/category handoff manifest JSON',
    path: manifestPath,
  },
  {
    key: 'work_category_handoff_manifest_report',
    role: 'current work/category handoff manifest report',
    path: 'reports/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.md',
  },
  {
    key: 'work_category_handoff_manifest_validator',
    role: 'current work/category handoff manifest validator',
    path: 'scripts/validate_agent3_definition_workbench_usage_collision_work_category_handoff_manifest.mjs',
  },
  {
    key: 'work_category_handoff_manifest_builder',
    role: 'current work/category handoff manifest builder',
    path: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_handoff_manifest.mjs',
  },
  ...manifestEntries.flatMap((entry) => [
    {
      key: `${entry.key}_data`,
      role: `${entry.key} data artifact listed by handoff manifest`,
      path: entry.data_path,
    },
    {
      key: `${entry.key}_report`,
      role: `${entry.key} report artifact listed by handoff manifest`,
      path: entry.report_path,
    },
    {
      key: `${entry.key}_validator`,
      role: `${entry.key} validator listed by handoff manifest`,
      path: entry.validator_path,
    },
  ]),
];

const digestEntries = digestTargets.map((target) => {
  const absPath = path.join(root, target.path);
  const exists = fs.existsSync(absPath);
  const bytes = exists ? fs.readFileSync(absPath) : Buffer.alloc(0);
  return {
    key: target.key,
    role: target.role,
    path: target.path,
    exists,
    bytes: bytes.length,
    sha256: exists ? crypto.createHash('sha256').update(bytes).digest('hex') : null,
  };
});

const manifestCounts = manifest.counts || {};
const counts = {
  digest_entries: digestEntries.length,
  files_present: digestEntries.filter((entry) => entry.exists).length,
  files_missing: digestEntries.filter((entry) => !entry.exists).length,
  total_bytes: digestEntries.reduce((sum, entry) => sum + entry.bytes, 0),
  manifest_entries: Number(manifestCounts.manifest_entries || 0),
  evidence_ready_entries: Number(manifestCounts.evidence_ready_entries || 0),
  source_occurrence_rows: Number(manifestCounts.source_occurrence_rows || 0),
  category_index_rows: Number(manifestCounts.category_index_rows || 0),
  work_index_rows: Number(manifestCounts.work_index_rows || 0),
  category_license_index_rows: Number(manifestCounts.category_license_index_rows || 0),
  queue_links: Number(manifestCounts.queue_links || 0),
  route_ids: Number(manifestCounts.route_ids || 0),
  occurrence_locator_rows: Number(manifestCounts.occurrence_locator_rows || 0),
  provenance_locator_rows: Number(manifestCounts.provenance_locator_rows || 0),
  provenance_license_buckets: Number(manifestCounts.provenance_license_buckets || 0),
  provenance_version_source_buckets: Number(manifestCounts.provenance_version_source_buckets || 0),
  source_ref_repeat_buckets: Number(manifestCounts.source_ref_repeat_buckets || 0),
  source_ref_repeat_rows: Number(manifestCounts.source_ref_repeat_rows || 0),
  phrase_context_repeat_buckets: Number(manifestCounts.phrase_context_repeat_buckets || 0),
  phrase_context_repeat_rows: Number(manifestCounts.phrase_context_repeat_rows || 0),
  cross_work_snippet_buckets: Number(manifestCounts.cross_work_snippet_buckets || 0),
  cross_work_snippet_occurrence_rows: Number(manifestCounts.cross_work_snippet_occurrence_rows || 0),
  validation_commands: Number(manifestCounts.validation_commands || 0),
  validation_commands_passed: Number(manifestCounts.validation_commands_passed || 0),
  validation_commands_failed: Number(manifestCounts.validation_commands_failed || 0),
  reader_facing_rows: Number(manifestCounts.total_reader_facing_rows || 0),
  route_payload_field_hits: Number(manifestCounts.total_route_payload_field_hits || 0),
  forbidden_authority_field_hits: Number(manifestCounts.total_forbidden_authority_field_hits || 0),
  source_text_reads: Number(manifestCounts.total_source_text_reads || 0),
  broad_target_expansion: Number(manifestCounts.total_broad_target_expansion || 0),
  queue_mutations: Number(manifestCounts.total_queue_mutations || 0),
  submitted_to_agent6: Number(manifestCounts.total_submitted_to_agent6 || 0),
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_work_category_integrity_digest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_work_category_integrity_digest.mjs',
  lane_owner: 'Agent 3',
  status: counts.files_missing === 0 ? 'evidence-ready' : 'awaiting-Agent-6',
  focus_token_normalized: manifest.focus_token_normalized || null,
  target_gate: 'definition_workbench_gate',
  source_artifacts: {
    work_category_handoff_manifest: manifestPath,
  },
  policy: 'Integrity digest over the Agent 3 work/category handoff package. This records file presence and hashes for QA drift tracking only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
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
  digest_entries: digestEntries,
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 work/category integrity digest ${artifact.status}; files ${counts.files_present}/${counts.digest_entries}; bytes ${counts.total_bytes}`);

function buildChecks(c) {
  return [
    check('digest_entries_present', c.digest_entries === 22, `entries ${c.digest_entries}`),
    check('all_digest_files_present', c.files_present === c.digest_entries && c.files_missing === 0, `present/missing ${c.files_present}/${c.files_missing}`),
    check('manifest_counts_visible', c.manifest_entries === 6 && c.evidence_ready_entries === 6, `manifest/evidence-ready ${c.manifest_entries}/${c.evidence_ready_entries}`),
    check('work_category_counts_visible', c.source_occurrence_rows === 106 && c.category_index_rows === 8 && c.work_index_rows === 24 && c.category_license_index_rows === 8, `source/category/work/category-license ${c.source_occurrence_rows}/${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`),
    check('locator_chain_counts_visible', c.occurrence_locator_rows === 96 && c.provenance_locator_rows === 96 && c.source_ref_repeat_buckets === 23 && c.source_ref_repeat_rows === 70 && c.cross_work_snippet_buckets === 3 && c.cross_work_snippet_occurrence_rows === 6, `occ/prov/repeat/cross ${c.occurrence_locator_rows}/${c.provenance_locator_rows}/${c.source_ref_repeat_buckets}-${c.source_ref_repeat_rows}/${c.cross_work_snippet_buckets}-${c.cross_work_snippet_occurrence_rows}`),
    check('queue_route_validation_visible', c.queue_links === 200 && c.route_ids === 1 && c.validation_commands === 2 && c.validation_commands_passed === 2 && c.validation_commands_failed === 0, `queue/route/commands/pass/fail ${c.queue_links}/${c.route_ids}/${c.validation_commands}/${c.validation_commands_passed}/${c.validation_commands_failed}`),
    check('no_reader_payload_authority_hits', c.reader_facing_rows === 0 && c.route_payload_field_hits === 0 && c.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.source_text_reads === 0 && c.broad_target_expansion === 0 && c.queue_mutations === 0 && c.submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`),
  ];
}

function writeReport(relativePath, value) {
  const c = value.counts;
  const lines = [
    '# Agent 3 Collision Work/Category Integrity Digest',
    '',
    `Generated: ${value.generated_at}`,
    '',
    'Status: evidence-ready; awaiting Agent 6. This is integrity/drift evidence only and not Definition authority.',
    '',
    '## Scope',
    '',
    'This packet records SHA-256 hashes for the current Agent 3 work/category handoff package and the source artifacts listed by that handoff. It is for QA drift tracking and handoff reproducibility only.',
    '',
    '## Digest Entries',
    '',
    '| key | file | bytes | sha256 |',
    '|---|---|---:|---|',
    ...value.digest_entries.map((entry) => `| ${entry.key} | \`${entry.path}\` | ${entry.bytes} | ${entry.sha256 || 'missing'} |`),
    '',
    '## Counts',
    '',
    `- Digest files present/missing: ${c.files_present}/${c.files_missing}`,
    `- Digest entries / total bytes: ${c.digest_entries}/${c.total_bytes}`,
    `- Handoff manifest entries / evidence-ready: ${c.manifest_entries}/${c.evidence_ready_entries}`,
    `- Source occurrence rows: ${c.source_occurrence_rows}`,
    `- Category / work / category-license rows: ${c.category_index_rows}/${c.work_index_rows}/${c.category_license_index_rows}`,
    `- Occurrence / provenance locator rows: ${c.occurrence_locator_rows}/${c.provenance_locator_rows}`,
    `- Provenance license / version-source buckets: ${c.provenance_license_buckets}/${c.provenance_version_source_buckets}`,
    `- Source-ref repeat buckets / rows: ${c.source_ref_repeat_buckets}/${c.source_ref_repeat_rows}`,
    `- Phrase-context repeat buckets / rows: ${c.phrase_context_repeat_buckets}/${c.phrase_context_repeat_rows}`,
    `- Cross-work snippet buckets / rows: ${c.cross_work_snippet_buckets}/${c.cross_work_snippet_occurrence_rows}`,
    `- Queue links / route IDs: ${c.queue_links}/${c.route_ids}`,
    `- Validation commands passed/failed: ${c.validation_commands_passed}/${c.validation_commands_failed}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.reader_facing_rows}/${c.route_payload_field_hits}/${c.forbidden_authority_field_hits}`,
    `- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: ${c.source_text_reads}/${c.broad_target_expansion}/${c.queue_mutations}/${c.submitted_to_agent6}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...value.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    '## Agent 5/6 Queue Intake Summary',
    '',
    `This digest gives Agent 5/6 a recountable drift baseline for ${c.digest_entries} work/category handoff files, with ${c.files_present}/${c.digest_entries} files present, ${c.source_occurrence_rows} observed-usage source rows, ${c.occurrence_locator_rows} concrete locator rows, ${c.cross_work_snippet_buckets} cross-work snippet buckets, ${c.queue_links} queue links, one Agent 2 route ID pointer, and zero reader-facing/payload/authority hits.`,
    '',
    '## Boundary',
    '',
    'Agent 3 output remains observed usage/navigation evidence only. This digest is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.',
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
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
