#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-package-summary-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-package-summary-reshit.md';

const inputs = {
  handoff_manifest: 'data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json',
  integrity_digest: 'data/definitions/agent3-definition-workbench-usage-collision-integrity-digest-reshit.json',
  validation_run: 'data/definitions/agent3-definition-workbench-usage-collision-validation-run-reshit.json',
  provenance_index: 'data/definitions/agent3-definition-workbench-usage-collision-provenance-index-reshit.json',
  work_category_handoff_manifest: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.json',
  work_category_integrity_digest: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-integrity-digest-reshit.json',
  work_category_validation_run: 'data/definitions/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.json',
};

const handoff = readJson(inputs.handoff_manifest);
const digest = readJson(inputs.integrity_digest);
const validation = readJson(inputs.validation_run);
const provenance = readJson(inputs.provenance_index);
const workCategoryHandoff = readJson(inputs.work_category_handoff_manifest);
const workCategoryDigest = readJson(inputs.work_category_integrity_digest);
const workCategoryValidation = readJson(inputs.work_category_validation_run);
const sourceArtifacts = [handoff, digest, validation, provenance, workCategoryHandoff, workCategoryDigest, workCategoryValidation];
const routeIds = new Set();
for (const data of sourceArtifacts) collectRouteIds(data, routeIds);

const counts = {
  package_artifacts: sourceArtifacts.length,
  evidence_ready_artifacts: sourceArtifacts.filter((row) => row.status === 'evidence-ready').length,
  handoff_entries: handoff.counts?.manifest_entries || 0,
  digest_entries: digest.counts?.digest_entries || 0,
  validation_commands: validation.counts?.validation_commands || 0,
  validation_commands_passed: validation.counts?.commands_passed || 0,
  work_category_handoff_entries: workCategoryHandoff.counts?.manifest_entries || 0,
  work_category_digest_entries: workCategoryDigest.counts?.digest_entries || 0,
  work_category_validation_commands: workCategoryValidation.counts?.validation_commands || 0,
  work_category_validation_commands_passed: workCategoryValidation.counts?.commands_passed || 0,
  work_category_source_occurrences: workCategoryHandoff.counts?.source_occurrence_rows || 0,
  work_category_index_rows: workCategoryHandoff.counts?.category_index_rows || 0,
  work_category_occurrence_locator_rows: workCategoryHandoff.counts?.occurrence_locator_rows || 0,
  work_category_provenance_locator_rows: workCategoryHandoff.counts?.provenance_locator_rows || 0,
  work_category_source_ref_repeat_buckets: workCategoryHandoff.counts?.source_ref_repeat_buckets || 0,
  work_category_cross_work_snippet_buckets: workCategoryHandoff.counts?.cross_work_snippet_buckets || 0,
  provenance_source_occurrences: provenance.counts?.source_occurrence_rows || 0,
  provenance_license_rows: provenance.counts?.license_index_rows || 0,
  provenance_version_source_rows: provenance.counts?.version_source_index_rows || 0,
  provenance_version_title_rows: provenance.counts?.version_title_index_rows || 0,
  provenance_work_license_rows: provenance.counts?.work_license_index_rows || 0,
  provenance_queue_links: provenance.counts?.occurrence_queue_links || 0,
  route_ids: routeIds.size,
  total_reader_facing_rows: sumCounts('reader_facing_rows', ...sourceArtifacts) + Number(handoff.counts?.total_reader_facing_rows || 0) + Number(workCategoryHandoff.counts?.total_reader_facing_rows || 0),
  total_route_payload_field_hits: sumCounts('route_payload_field_hits', ...sourceArtifacts) + Number(handoff.counts?.total_route_payload_field_hits || 0) + Number(workCategoryHandoff.counts?.total_route_payload_field_hits || 0),
  total_forbidden_authority_field_hits: sumCounts('forbidden_authority_field_hits', ...sourceArtifacts) + Number(handoff.counts?.total_forbidden_authority_field_hits || 0) + Number(workCategoryHandoff.counts?.total_forbidden_authority_field_hits || 0),
  total_source_text_reads: sumCounts('source_text_reads', ...sourceArtifacts) + Number(handoff.counts?.total_source_text_reads || 0) + Number(workCategoryHandoff.counts?.total_source_text_reads || 0),
  total_broad_target_expansion: sumCounts('broad_target_expansion', ...sourceArtifacts) + Number(handoff.counts?.total_broad_target_expansion || 0) + Number(workCategoryHandoff.counts?.total_broad_target_expansion || 0),
  total_queue_mutations: sumCounts('queue_mutations', ...sourceArtifacts) + Number(handoff.counts?.total_queue_mutations || 0) + Number(workCategoryHandoff.counts?.total_queue_mutations || 0),
  total_submitted_to_agent6: sumCounts('submitted_to_agent6', ...sourceArtifacts) + Number(handoff.counts?.total_submitted_to_agent6 || 0) + Number(workCategoryHandoff.counts?.total_submitted_to_agent6 || 0),
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_collision_package_summary',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_collision_package_summary.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  focus_token_normalized: handoff.focus_token_normalized || provenance.focus_token_normalized,
  target_gate: 'definition_workbench_gate',
  source_artifacts: inputs,
  policy: 'Compact QA intake summary for the Agent 3 collision package. It summarizes handoff, digest, validation, and provenance artifacts as observed usage/navigation evidence only; it does not inspect source text, rank routes, select answers, copy Agent 2 payloads, emit definitions, translate, mutate queues, or publish.',
  authority_boundary: {
    usage_navigation_only: true,
    package_summary_only: true,
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
  readiness_summary: {
    package_status: 'awaiting-Agent-6',
    all_package_artifacts_evidence_ready: counts.evidence_ready_artifacts === counts.package_artifacts,
    validators_passed: validation.counts?.commands_passed || 0,
    validators_failed: validation.counts?.commands_failed || 0,
    work_category_validators_passed: workCategoryValidation.counts?.commands_passed || 0,
    work_category_validators_failed: workCategoryValidation.counts?.commands_failed || 0,
    digest_entries_present: Number(digest.counts?.files_present || 0) + Number(workCategoryDigest.counts?.files_present || 0),
    provenance_complete_rows: provenance.counts?.rows_with_complete_provenance || 0,
    allowed_use: 'Agent 6/Agent 5 QA intake and usage-navigation planning only',
    blocked_use: 'Definition authority, route ranking, visible answer selection, UI/runtime acceptance, publication readiness, or accepted text',
  },
  artifact_summaries: [
    artifactSummary('handoff_manifest', inputs.handoff_manifest, handoff),
    artifactSummary('integrity_digest', inputs.integrity_digest, digest),
    artifactSummary('validation_run', inputs.validation_run, validation),
    artifactSummary('provenance_index', inputs.provenance_index, provenance),
    artifactSummary('work_category_handoff_manifest', inputs.work_category_handoff_manifest, workCategoryHandoff),
    artifactSummary('work_category_integrity_digest', inputs.work_category_integrity_digest, workCategoryDigest),
    artifactSummary('work_category_validation_run', inputs.work_category_validation_run, workCategoryValidation),
  ],
  counts,
  checks: buildChecks(counts),
};

writeJson(outputPath, artifact);
writeReport(reportPath, artifact);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Agent 3 collision package summary ${artifact.status}; artifacts ${counts.evidence_ready_artifacts}/${counts.package_artifacts}; validators ${counts.validation_commands_passed}/${counts.validation_commands}`);

function artifactSummary(key, filePath, data) {
  return {
    key,
    path: filePath,
    artifact_type: data.artifact_type,
    status: data.status,
    focus_token_normalized: data.focus_token_normalized || null,
    key_counts: data.counts || {},
    reader_facing_rows: data.counts?.reader_facing_rows || data.counts?.total_reader_facing_rows || 0,
    route_payload_field_hits: data.counts?.route_payload_field_hits || data.counts?.total_route_payload_field_hits || 0,
    forbidden_authority_field_hits: data.counts?.forbidden_authority_field_hits || data.counts?.total_forbidden_authority_field_hits || 0,
    source_text_reads: data.counts?.source_text_reads || data.counts?.total_source_text_reads || 0,
    broad_target_expansion: data.counts?.broad_target_expansion || data.counts?.total_broad_target_expansion || 0,
    queue_mutations: data.counts?.queue_mutations || data.counts?.total_queue_mutations || 0,
    submitted_to_agent6: data.counts?.submitted_to_agent6 || data.counts?.total_submitted_to_agent6 || 0,
  };
}

function buildChecks(c) {
  return [
    check('package_artifacts_present', c.package_artifacts === 7, `artifacts ${c.package_artifacts}`),
    check('all_package_artifacts_evidence_ready', c.evidence_ready_artifacts === c.package_artifacts, `evidence-ready ${c.evidence_ready_artifacts}/${c.package_artifacts}`),
    check('handoff_digest_validation_visible', c.handoff_entries === 3 && c.digest_entries === 12 && c.validation_commands === 6 && c.validation_commands_passed === 6, `handoff/digest/validation ${c.handoff_entries}/${c.digest_entries}/${c.validation_commands_passed}/${c.validation_commands}`),
    check('work_category_handoff_digest_validation_visible', c.work_category_handoff_entries === 6 && c.work_category_digest_entries === 22 && c.work_category_validation_commands === 2 && c.work_category_validation_commands_passed === 2, `work-category handoff/digest/validation ${c.work_category_handoff_entries}/${c.work_category_digest_entries}/${c.work_category_validation_commands_passed}/${c.work_category_validation_commands}`),
    check('provenance_visible', c.provenance_source_occurrences === 106 && c.provenance_license_rows === 2 && c.provenance_version_source_rows === 22 && c.provenance_work_license_rows === 24, `provenance ${c.provenance_source_occurrences}/${c.provenance_license_rows}/${c.provenance_version_source_rows}/${c.provenance_work_license_rows}`),
    check('work_category_locators_visible', c.work_category_source_occurrences === 106 && c.work_category_occurrence_locator_rows === 96 && c.work_category_provenance_locator_rows === 96 && c.work_category_source_ref_repeat_buckets === 23 && c.work_category_cross_work_snippet_buckets === 3, `work-category source/occ/prov/repeat/cross-work ${c.work_category_source_occurrences}/${c.work_category_occurrence_locator_rows}/${c.work_category_provenance_locator_rows}/${c.work_category_source_ref_repeat_buckets}/${c.work_category_cross_work_snippet_buckets}`),
    check('single_route_visible', c.route_ids === 1, `route IDs ${c.route_ids}`),
    check('no_reader_payload_authority_hits', c.total_reader_facing_rows === 0 && c.total_route_payload_field_hits === 0 && c.total_forbidden_authority_field_hits === 0, `reader/payload/forbidden ${c.total_reader_facing_rows}/${c.total_route_payload_field_hits}/${c.total_forbidden_authority_field_hits}`),
    check('no_source_broad_queue_side_effects', c.total_source_text_reads === 0 && c.total_broad_target_expansion === 0 && c.total_queue_mutations === 0 && c.total_submitted_to_agent6 === 0, `source/broad/queue/submitted ${c.total_source_text_reads}/${c.total_broad_target_expansion}/${c.total_queue_mutations}/${c.total_submitted_to_agent6}`),
  ];
}

function check(id, ok, detail) {
  return { id, status: ok ? 'passed' : 'failed', detail };
}

function sumCounts(key, ...artifacts) {
  return artifacts.reduce((sum, data) => sum + Number(data.counts?.[key] || 0), 0);
}

function collectRouteIds(node, ids) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectRouteIds(item, ids);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if ((key === 'related_agent2_route_ids' || key === 'route_ids') && Array.isArray(value)) {
      for (const id of value) if (typeof id === 'string') ids.add(id);
    }
    collectRouteIds(value, ids);
  }
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
    '# Agent 3 Definition Workbench Usage Collision Package Summary',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Status: ${artifact.status}`,
    `- Focus token: ${artifact.focus_token_normalized}`,
    '- Boundary: package summary only; observed usage/navigation evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.',
    '',
    '## Counts',
    '',
    `- Package artifacts evidence-ready: ${c.evidence_ready_artifacts}/${c.package_artifacts}`,
    `- Collision handoff entries / digest entries / validation passed: ${c.handoff_entries}/${c.digest_entries}/${c.validation_commands_passed}/${c.validation_commands}`,
    `- Work-category handoff entries / digest entries / validation passed: ${c.work_category_handoff_entries}/${c.work_category_digest_entries}/${c.work_category_validation_commands_passed}/${c.work_category_validation_commands}`,
    `- Work-category source/occurrence/provenance/repeat/cross-work rows: ${c.work_category_source_occurrences}/${c.work_category_occurrence_locator_rows}/${c.work_category_provenance_locator_rows}/${c.work_category_source_ref_repeat_buckets}/${c.work_category_cross_work_snippet_buckets}`,
    `- Provenance occurrence/license/version-source/work-license rows: ${c.provenance_source_occurrences}/${c.provenance_license_rows}/${c.provenance_version_source_rows}/${c.provenance_work_license_rows}`,
    `- Provenance queue links: ${c.provenance_queue_links}`,
    `- Route IDs visible: ${c.route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${c.total_reader_facing_rows}/${c.total_route_payload_field_hits}/${c.total_forbidden_authority_field_hits}`,
    '',
    '## Artifact Summaries',
    '',
    '| key | status | artifact type | path | reader/payload/forbidden |',
    '|---|---|---|---|---|',
    ...artifact.artifact_summaries.map((row) => `| ${row.key} | ${row.status} | ${row.artifact_type} | ${row.path} | ${row.reader_facing_rows}/${row.route_payload_field_hits}/${row.forbidden_authority_field_hits} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${row.id} | ${row.status} | ${row.detail} |`),
    '',
    'This package summary is Agent 3 QA/navigation evidence only. It does not mutate queues, inspect source text, rank routes, or convert usage rows into definitions.',
    '',
  ];
  fs.writeFileSync(path.join(root, relativePath), lines.join('\n'));
}
