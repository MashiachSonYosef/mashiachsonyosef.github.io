import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_JSON = 'reports/agent3-definition-workbench-usage-negative-consumer-followup-2026-06-02.json';
const OUT_MD = 'reports/agent3-definition-workbench-usage-negative-consumer-followup-2026-06-02.md';

const SOURCE_REPORTS = [
  'reports/definition-workbench-usage-queue-ready-packet.md',
  'reports/definition-workbench-usage-consumer-manifest.md',
  'reports/definition-workbench-usage-route-pointer-audit.md',
  'reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md',
];

const SOURCE_JSON = {
  queue_packet: 'data/definitions/definition-workbench-usage-queue-ready-packet.json',
  consumer_manifest: 'data/definitions/definition-workbench-usage-consumer-manifest.json',
  route_pointer_audit: 'data/definitions/definition-workbench-usage-route-pointer-audit.json',
  agent3_state: 'reports/agent3-state.json',
};

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'semantic_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'accepted_translation_text',
  'final_answer',
  'answer',
  'winner',
  'selected_answer',
  'visible_answer',
  'route_payload',
  'route_payloads',
  'route_metadata',
  'agent2_payload',
  'agent2_payloads',
]);

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function get(obj, key, fallback = 0) {
  return Number(obj?.[key] ?? fallback);
}

function isAuthorityValue(value) {
  if (value === false || value === null || value === undefined || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function scanForbiddenAuthorityValues(value, relPath, hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenAuthorityValues(item, `${relPath}[${index}]`, hits));
    return hits;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key) && isAuthorityValue(nested)) {
      hits.push({ path: relPath, key });
    }
    scanForbiddenAuthorityValues(nested, `${relPath}.${key}`, hits);
  }
  return hits;
}

function check(name, passed, detail, severity = 'required') {
  return { name, status: passed ? 'passed' : 'failed', severity, detail };
}

function warning(name, condition, detail) {
  return { name, status: condition ? 'warning' : 'passed', severity: 'warning', detail };
}

const queue = readJson(SOURCE_JSON.queue_packet);
const manifest = readJson(SOURCE_JSON.consumer_manifest);
const pointer = readJson(SOURCE_JSON.route_pointer_audit);
const state = readJson(SOURCE_JSON.agent3_state);

const queueCounts = queue.counts ?? {};
const manifestCounts = manifest.counts ?? {};
const pointerCounts = pointer.counts ?? {};
const stateCounts = state.counts ?? {};

const sourceReportPresence = SOURCE_REPORTS.map((report) => ({ report, exists: exists(report) }));
const sourceJsonPresence = Object.entries(SOURCE_JSON).map(([name, relPath]) => ({ name, path: relPath, exists: exists(relPath) }));

const scannedAuthorityJson = [
  SOURCE_JSON.queue_packet,
  SOURCE_JSON.consumer_manifest,
  SOURCE_JSON.route_pointer_audit,
  SOURCE_JSON.agent3_state,
];
const forbiddenAuthorityValueHits = scannedAuthorityJson.flatMap((relPath) => scanForbiddenAuthorityValues(readJson(relPath), relPath));

const counts = {
  files_inspected: SOURCE_REPORTS.length + Object.keys(SOURCE_JSON).length,
  source_reports_present: sourceReportPresence.filter((row) => row.exists).length,
  source_reports_expected: SOURCE_REPORTS.length,
  source_json_present: sourceJsonPresence.filter((row) => row.exists).length,
  source_json_expected: Object.keys(SOURCE_JSON).length,
  queue_required_fields_present: get(queueCounts, 'required_queue_fields_present'),
  queue_required_fields: get(queueCounts, 'required_queue_fields'),
  queue_evidence_artifacts_exist: get(queueCounts, 'evidence_artifacts_exist'),
  queue_evidence_artifacts: get(queueCounts, 'evidence_artifacts'),
  queue_submitted_to_agent6: get(queueCounts, 'submitted_to_agent6'),
  queue_mutations: get(queueCounts, 'queue_mutations'),
  consumer_manifest_entries: get(manifestCounts, 'manifest_entries'),
  consumer_manifest_passed_entries: get(manifestCounts, 'passed_entries'),
  consumer_manifest_data_artifacts_exist: get(manifestCounts, 'data_artifacts_exist'),
  consumer_manifest_data_artifacts: get(manifestCounts, 'data_artifacts'),
  consumer_manifest_report_artifacts_exist: get(manifestCounts, 'report_artifacts_exist'),
  consumer_manifest_report_artifacts: get(manifestCounts, 'report_artifacts'),
  consumer_manifest_validator_scripts_exist: get(manifestCounts, 'validator_scripts_exist'),
  consumer_manifest_validator_scripts: get(manifestCounts, 'validator_scripts'),
  consumer_manifest_reader_facing_rows: get(manifestCounts, 'reader_facing_rows'),
  consumer_manifest_route_payload_field_hits: get(manifestCounts, 'route_payload_field_hits'),
  consumer_manifest_forbidden_authority_field_hits: get(manifestCounts, 'forbidden_authority_field_hits'),
  occurrence_link_rows: get(queueCounts, 'occurrence_link_rows'),
  occurrence_link_complete_metadata_rows: get(queueCounts, 'occurrence_link_rows_with_complete_metadata'),
  occurrence_link_reader_facing_rows: get(queueCounts, 'occurrence_link_reader_facing_rows'),
  occurrence_link_route_payload_field_hits: get(queueCounts, 'occurrence_link_route_payload_field_hits'),
  occurrence_link_forbidden_authority_field_hits: get(queueCounts, 'occurrence_link_forbidden_authority_field_hits'),
  concordance_navigation_rows: get(queueCounts, 'concordance_navigation_rows'),
  concordance_supported_rows: get(queueCounts, 'concordance_navigation_supported_rows'),
  concordance_candidate_rows: get(queueCounts, 'concordance_navigation_candidate_rows'),
  concordance_weak_rows: get(queueCounts, 'concordance_navigation_weak_rows'),
  concordance_reader_facing_rows: get(queueCounts, 'concordance_navigation_reader_facing_rows'),
  concordance_route_payload_field_hits: get(queueCounts, 'concordance_navigation_route_payload_field_hits'),
  concordance_forbidden_authority_field_hits: get(queueCounts, 'concordance_navigation_forbidden_authority_field_hits'),
  ambiguous_audit_only_available: get(queueCounts, 'occurrence_link_audit_only_ambiguous_rows_available') || get(pointerCounts, 'audit_only_ambiguous_rows_available'),
  ambiguous_emitted_rows: get(queueCounts, 'occurrence_link_audit_only_ambiguous_rows_emitted') || get(pointerCounts, 'audit_only_ambiguous_rows_emitted'),
  route_pointer_rows: get(pointerCounts, 'route_pointer_rows'),
  route_pointer_route_ids: get(pointerCounts, 'route_ids'),
  route_pointer_resolved_route_ids: get(pointerCounts, 'resolved_route_ids'),
  route_pointer_unresolved_route_ids: get(pointerCounts, 'unresolved_route_ids'),
  route_pointer_support_rows_with_pointer: get(pointerCounts, 'support_rows_with_pointer'),
  route_pointer_support_rows: get(pointerCounts, 'support_rows'),
  route_pointer_navigation_rows_with_pointer: get(pointerCounts, 'navigation_rows_with_pointer'),
  route_pointer_navigation_rows: get(pointerCounts, 'navigation_rows'),
  route_pointer_payload_copied_rows: get(pointerCounts, 'route_payload_copied_rows'),
  route_pointer_agent2_payload_copied_rows: get(pointerCounts, 'agent2_payload_copied_rows'),
  route_pointer_metadata_copied_rows: get(pointerCounts, 'route_metadata_copied_rows'),
  route_pointer_reader_facing_rows: get(pointerCounts, 'reader_facing_rows'),
  route_pointer_route_payload_field_hits: get(pointerCounts, 'route_payload_field_hits'),
  route_pointer_forbidden_authority_field_hits: get(pointerCounts, 'forbidden_authority_field_hits'),
  route_pointer_route_metadata_field_hits: get(pointerCounts, 'route_metadata_field_hits'),
  single_route_scope_warning: get(pointerCounts, 'route_ids') === 1 ? 1 : 0,
  agent3_state_evidence_artifacts_exist: get(stateCounts, 'evidence_artifacts_exist'),
  agent3_state_evidence_artifacts: get(stateCounts, 'evidence_artifacts'),
  agent3_state_validator_scripts_exist: get(stateCounts, 'validator_scripts_exist'),
  agent3_state_validator_scripts: get(stateCounts, 'validator_scripts'),
  agent3_state_smoke_failed: get(stateCounts, 'smoke_failed_steps'),
  agent3_state_source_freshness_pending: get(stateCounts, 'freshness_impact_pending_refresh_files'),
  forbidden_authority_value_hits: forbiddenAuthorityValueHits.length,
};

const negativeTests = [
  check(
    'source_files_present',
    counts.source_reports_present === counts.source_reports_expected && counts.source_json_present === counts.source_json_expected,
    `reports ${counts.source_reports_present}/${counts.source_reports_expected}; json ${counts.source_json_present}/${counts.source_json_expected}`,
  ),
  check(
    'queue_is_not_self_submitted',
    counts.queue_required_fields_present === counts.queue_required_fields && counts.queue_submitted_to_agent6 === 0 && counts.queue_mutations === 0,
    `required fields ${counts.queue_required_fields_present}/${counts.queue_required_fields}; queue mutations/submitted ${counts.queue_mutations}/${counts.queue_submitted_to_agent6}`,
  ),
  check(
    'consumer_manifest_usage_only',
    counts.consumer_manifest_reader_facing_rows === 0 && counts.consumer_manifest_route_payload_field_hits === 0 && counts.consumer_manifest_forbidden_authority_field_hits === 0,
    `reader-facing/route-payload/forbidden ${counts.consumer_manifest_reader_facing_rows}/${counts.consumer_manifest_route_payload_field_hits}/${counts.consumer_manifest_forbidden_authority_field_hits}`,
  ),
  check(
    'occurrence_links_not_answers',
    counts.occurrence_link_rows === counts.occurrence_link_complete_metadata_rows && counts.occurrence_link_reader_facing_rows === 0 && counts.occurrence_link_route_payload_field_hits === 0 && counts.occurrence_link_forbidden_authority_field_hits === 0,
    `rows/metadata ${counts.occurrence_link_rows}/${counts.occurrence_link_complete_metadata_rows}; reader-facing/payload/forbidden ${counts.occurrence_link_reader_facing_rows}/${counts.occurrence_link_route_payload_field_hits}/${counts.occurrence_link_forbidden_authority_field_hits}`,
  ),
  check(
    'concordance_navigation_not_reader_authority',
    counts.concordance_navigation_rows > 0 && counts.concordance_reader_facing_rows === 0 && counts.concordance_route_payload_field_hits === 0 && counts.concordance_forbidden_authority_field_hits === 0,
    `rows ${counts.concordance_navigation_rows}; reader-facing/payload/forbidden ${counts.concordance_reader_facing_rows}/${counts.concordance_route_payload_field_hits}/${counts.concordance_forbidden_authority_field_hits}`,
  ),
  check(
    'ambiguous_rows_audit_only',
    counts.ambiguous_audit_only_available > 0 && counts.ambiguous_emitted_rows === 0,
    `ambiguous available/emitted ${counts.ambiguous_audit_only_available}/${counts.ambiguous_emitted_rows}`,
  ),
  check(
    'route_pointers_resolve_without_payload_copy',
    counts.route_pointer_rows > 0 &&
      counts.route_pointer_unresolved_route_ids === 0 &&
      counts.route_pointer_support_rows_with_pointer === counts.route_pointer_support_rows &&
      counts.route_pointer_navigation_rows_with_pointer === counts.route_pointer_navigation_rows &&
      counts.route_pointer_payload_copied_rows === 0 &&
      counts.route_pointer_agent2_payload_copied_rows === 0 &&
      counts.route_pointer_metadata_copied_rows === 0 &&
      counts.route_pointer_route_payload_field_hits === 0 &&
      counts.route_pointer_forbidden_authority_field_hits === 0 &&
      counts.route_pointer_route_metadata_field_hits === 0,
    `routes/resolved/unresolved ${counts.route_pointer_route_ids}/${counts.route_pointer_resolved_route_ids}/${counts.route_pointer_unresolved_route_ids}; support ${counts.route_pointer_support_rows_with_pointer}/${counts.route_pointer_support_rows}; navigation ${counts.route_pointer_navigation_rows_with_pointer}/${counts.route_pointer_navigation_rows}; payload/agent2/metadata copied ${counts.route_pointer_payload_copied_rows}/${counts.route_pointer_agent2_payload_copied_rows}/${counts.route_pointer_metadata_copied_rows}`,
  ),
  check(
    'forbidden_authority_keys_absent_in_scanned_json',
    counts.forbidden_authority_value_hits === 0,
    `hard-true forbidden authority value hits ${counts.forbidden_authority_value_hits}`,
  ),
  warning(
    'single_route_scope_visible_not_resolved',
    counts.single_route_scope_warning === 1,
    `route IDs ${counts.route_pointer_route_ids}; this packet preserves the Agent 6 WARN rather than claiming diversity`,
  ),
  warning(
    'source_freshness_still_pending',
    counts.agent3_state_source_freshness_pending > 0,
    `pending source-freshness files ${counts.agent3_state_source_freshness_pending}`,
  ),
];

const failed = negativeTests.filter((row) => row.status === 'failed');
const warnings = negativeTests.filter((row) => row.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_definition_workbench_usage_negative_consumer_followup',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_definition_workbench_usage_negative_consumer_followup.mjs',
  lane_owner: 'Agent 3',
  target_reviewer: 'Agent 6',
  queue_submitter: 'Agent 5',
  status: failed.length === 0 ? 'evidence-ready' : 'awaiting-Agent-6',
  chosen_path: 'ui_consumer_negative_tests',
  source_reports: sourceReportPresence,
  source_json: sourceJsonPresence,
  scanned_json_for_authority_keys: scannedAuthorityJson,
  forbidden_authority_keys_checked: Array.from(FORBIDDEN_AUTHORITY_KEYS).sort(),
  forbidden_authority_value_hits: forbiddenAuthorityValueHits,
  counts,
  negative_tests: negativeTests,
  queue_intake_summary: {
    packet_role: 'usage-navigation occurrence-link follow-up only',
    validated_result: failed.length === 0 ? 'negative consumer tests passed with warnings preserved' : 'negative consumer tests failed',
    selected_rows: counts.occurrence_link_rows,
    navigation_rows: counts.concordance_navigation_rows,
    supported_candidate_weak: `${counts.concordance_supported_rows}/${counts.concordance_candidate_rows}/${counts.concordance_weak_rows}`,
    route_ids: counts.route_pointer_route_ids,
    route_payload_policy: 'route IDs only; resolve Agent 2 payloads outside Agent 3 artifacts',
    ambiguity_policy: 'audit-only; not emitted reader-facing',
    agent6_verdict_dependency: 'WARN-ACCEPTED planning evidence only; this packet does not claim Agent 6 acceptance',
  },
  boundaries: {
    observed_usage_only: true,
    answer_authority_claimed: false,
    semantic_arbitration_claimed: false,
    route_ranking_claimed: false,
    visible_answer_selection_claimed: false,
    ui_runtime_acceptance_claimed: false,
    public_display_claimed: false,
    publication_readiness_claimed: false,
    source_provenance_custody_claimed: false,
    copied_agent2_payloads_claimed: false,
    accepted_text_claimed: false,
    agent6_acceptance_claimed: false,
    broad_corpus_completion_claimed: false,
  },
  stop_conditions_respected: {
    broad_corpus_rebuild_required: false,
    route_ranking_required: false,
    ui_runtime_work_required: false,
    source_provenance_acceptance_required: false,
    destructive_action_required: false,
    external_input_required: false,
  },
  quality: {
    status: failed.length === 0 && warnings.length > 0 ? 'pass_with_warnings' : failed.length === 0 ? 'passed' : 'failed',
    failed_checks: failed.length,
    warning_checks: warnings.length,
    warnings: warnings.map((row) => row.name),
  },
};

const md = `# Agent 3 Definition Workbench Usage Negative Consumer Follow-Up

Generated: ${artifact.generated_at}

Status: ${artifact.status}; awaiting Agent 6 review. This is evidence-only usage-navigation work and does not claim Agent 6 acceptance.

## Chosen Bounded Path

UI-consumer negative tests proving current usage rows cannot become Definition Workbench answers through Agent 3 artifacts. This path addresses the Agent 6 WARN boundary without broad corpus rebuild, route ranking, answer selection, UI/runtime work, publication work, or source/provenance custody acceptance.

## Reused Evidence

- \`reports/definition-workbench-usage-queue-ready-packet.md\`: queue-ready only, required fields ${counts.queue_required_fields_present}/${counts.queue_required_fields}, evidence artifacts ${counts.queue_evidence_artifacts_exist}/${counts.queue_evidence_artifacts}, queue mutations/submitted ${counts.queue_mutations}/${counts.queue_submitted_to_agent6}.
- \`reports/definition-workbench-usage-consumer-manifest.md\`: manifest entries ${counts.consumer_manifest_entries}, artifacts/validators ${counts.consumer_manifest_data_artifacts_exist}-${counts.consumer_manifest_report_artifacts_exist}/${counts.consumer_manifest_validator_scripts_exist}, reader-facing/route-payload/forbidden ${counts.consumer_manifest_reader_facing_rows}/${counts.consumer_manifest_route_payload_field_hits}/${counts.consumer_manifest_forbidden_authority_field_hits}.
- \`reports/definition-workbench-usage-route-pointer-audit.md\`: route pointers ${counts.route_pointer_rows}, support rows ${counts.route_pointer_support_rows_with_pointer}/${counts.route_pointer_support_rows}, navigation rows ${counts.route_pointer_navigation_rows_with_pointer}/${counts.route_pointer_navigation_rows}, copied route/Agent2/metadata rows ${counts.route_pointer_payload_copied_rows}/${counts.route_pointer_agent2_payload_copied_rows}/${counts.route_pointer_metadata_copied_rows}.
- \`reports/agent6-agent3-definition-workbench-usage-occurrence-links-verdict-2026-06-02.md\`: WARN-ACCEPTED for queue-ready usage-navigation planning evidence only; not accepted for Definition authority, UI display, public/runtime use, route ranking, semantic arbitration, publication support, or accepted text.

## Files Inspected

| file | role | present |
|---|---|---:|
${sourceReportPresence.map((row) => `| \`${row.report}\` | reused report | ${row.exists ? 'yes' : 'no'} |`).join('\n')}
${sourceJsonPresence.map((row) => `| \`${row.path}\` | reused JSON evidence | ${row.exists ? 'yes' : 'no'} |`).join('\n')}

Total inspected files: ${counts.files_inspected}. Source reports present: ${counts.source_reports_present}/${counts.source_reports_expected}. Source JSON present: ${counts.source_json_present}/${counts.source_json_expected}.

## Exact Counts

- Occurrence rows / complete metadata: ${counts.occurrence_link_rows}/${counts.occurrence_link_complete_metadata_rows}
- Occurrence reader-facing / route-payload / forbidden-authority hits: ${counts.occurrence_link_reader_facing_rows}/${counts.occurrence_link_route_payload_field_hits}/${counts.occurrence_link_forbidden_authority_field_hits}
- Concordance navigation rows supported/candidate/weak: ${counts.concordance_navigation_rows} (${counts.concordance_supported_rows}/${counts.concordance_candidate_rows}/${counts.concordance_weak_rows})
- Concordance reader-facing / route-payload / forbidden-authority hits: ${counts.concordance_reader_facing_rows}/${counts.concordance_route_payload_field_hits}/${counts.concordance_forbidden_authority_field_hits}
- Ambiguous audit-only rows available/emitted: ${counts.ambiguous_audit_only_available}/${counts.ambiguous_emitted_rows}
- Route pointer rows / route IDs / resolved-unresolved: ${counts.route_pointer_rows}/${counts.route_pointer_route_ids}/${counts.route_pointer_resolved_route_ids}-${counts.route_pointer_unresolved_route_ids}
- Route pointer support rows linked/resolved source rows: ${counts.route_pointer_support_rows_with_pointer}/${counts.route_pointer_support_rows}
- Route pointer navigation rows linked/source rows: ${counts.route_pointer_navigation_rows_with_pointer}/${counts.route_pointer_navigation_rows}
- Route pointer reader-facing / route-payload / forbidden-authority / metadata hits: ${counts.route_pointer_reader_facing_rows}/${counts.route_pointer_route_payload_field_hits}/${counts.route_pointer_forbidden_authority_field_hits}/${counts.route_pointer_route_metadata_field_hits}
- Hard-true forbidden authority value hits in scanned Agent 3 JSON: ${counts.forbidden_authority_value_hits}
- Agent 3 state evidence artifacts / validators: ${counts.agent3_state_evidence_artifacts_exist}/${counts.agent3_state_evidence_artifacts}; ${counts.agent3_state_validator_scripts_exist}/${counts.agent3_state_validator_scripts}
- Pending freshness files still visible: ${counts.agent3_state_source_freshness_pending}

## Negative Tests

| test | status | detail |
|---|---|---|
${negativeTests.map((row) => `| ${row.name} | ${row.status} | ${row.detail} |`).join('\n')}

## Agent 5/6 Queue Intake Summary

This packet is an Agent 3 follow-up for Definition Workbench usage-navigation planning evidence only. It shows the current consumer path has ${counts.occurrence_link_rows} selected occurrence rows and ${counts.concordance_navigation_rows} concordance navigation rows, all usage-only, with ${counts.route_pointer_route_ids} Agent 2 route ID pointer and zero copied route payload/metadata rows. Ambiguous rows remain audit-only (${counts.ambiguous_audit_only_available}/${counts.ambiguous_emitted_rows}). The packet preserves the Agent 6 WARN limits: single-route concentration remains visible, source freshness remains pending, and no UI/runtime, answer-selection, ranking, semantic arbitration, publication, source-custody, or accepted-text claim is made.

## Boundary

Agent 3 output remains observed usage/navigation evidence only. This packet is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.
`;

fs.writeFileSync(path.join(ROOT, OUT_JSON), `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(path.join(ROOT, OUT_MD), md);

console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
console.log(`status ${artifact.status}; quality ${artifact.quality.status}; warnings ${warnings.length}; failed ${failed.length}`);
