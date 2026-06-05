import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'reports/agent3-definition-workbench-usage-negative-consumer-followup-2026-06-02.json';
const REPORT = 'reports/agent3-definition-workbench-usage-negative-consumer-followup-2026-06-02.md';

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
  return { name, passed, severity, detail };
}

const artifact = readJson(ARTIFACT);
const counts = artifact.counts ?? {};
const boundaries = artifact.boundaries ?? {};
const stopConditions = artifact.stop_conditions_respected ?? {};
const negativeTests = artifact.negative_tests ?? [];
const failedNegativeTests = negativeTests.filter((row) => row.status === 'failed');
const warnings = negativeTests.filter((row) => row.status === 'warning');
const forbiddenHits = scanForbiddenAuthorityValues(artifact, ARTIFACT);

const checks = [
  check('report_exists', exists(REPORT), REPORT),
  check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_negative_consumer_followup', artifact.artifact_type),
  check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(artifact.status), artifact.status),
  check('chosen_path', artifact.chosen_path === 'ui_consumer_negative_tests', artifact.chosen_path),
  check('source_reports_present', counts.source_reports_present === counts.source_reports_expected && counts.source_reports_expected === 4, `${counts.source_reports_present}/${counts.source_reports_expected}`),
  check('source_json_present', counts.source_json_present === counts.source_json_expected && counts.source_json_expected === 4, `${counts.source_json_present}/${counts.source_json_expected}`),
  check('queue_not_submitted', counts.queue_required_fields_present === counts.queue_required_fields && counts.queue_mutations === 0 && counts.queue_submitted_to_agent6 === 0, `fields ${counts.queue_required_fields_present}/${counts.queue_required_fields}; mutations/submitted ${counts.queue_mutations}/${counts.queue_submitted_to_agent6}`),
  check('consumer_manifest_complete', counts.consumer_manifest_entries === 16 && counts.consumer_manifest_passed_entries === 16 && counts.consumer_manifest_data_artifacts_exist === counts.consumer_manifest_data_artifacts && counts.consumer_manifest_validator_scripts_exist === counts.consumer_manifest_validator_scripts, `entries ${counts.consumer_manifest_entries}/${counts.consumer_manifest_passed_entries}; data ${counts.consumer_manifest_data_artifacts_exist}/${counts.consumer_manifest_data_artifacts}; validators ${counts.consumer_manifest_validator_scripts_exist}/${counts.consumer_manifest_validator_scripts}`),
  check('consumer_manifest_no_authority_hits', counts.consumer_manifest_reader_facing_rows === 0 && counts.consumer_manifest_route_payload_field_hits === 0 && counts.consumer_manifest_forbidden_authority_field_hits === 0, `${counts.consumer_manifest_reader_facing_rows}/${counts.consumer_manifest_route_payload_field_hits}/${counts.consumer_manifest_forbidden_authority_field_hits}`),
  check('occurrence_links_usage_only', counts.occurrence_link_rows === 49 && counts.occurrence_link_complete_metadata_rows === 49 && counts.occurrence_link_reader_facing_rows === 0 && counts.occurrence_link_route_payload_field_hits === 0 && counts.occurrence_link_forbidden_authority_field_hits === 0, `rows ${counts.occurrence_link_rows}/${counts.occurrence_link_complete_metadata_rows}; hits ${counts.occurrence_link_reader_facing_rows}/${counts.occurrence_link_route_payload_field_hits}/${counts.occurrence_link_forbidden_authority_field_hits}`),
  check('concordance_navigation_usage_only', counts.concordance_navigation_rows === 2390 && counts.concordance_supported_rows === 339 && counts.concordance_candidate_rows === 1351 && counts.concordance_weak_rows === 700 && counts.concordance_reader_facing_rows === 0 && counts.concordance_route_payload_field_hits === 0 && counts.concordance_forbidden_authority_field_hits === 0, `rows ${counts.concordance_navigation_rows}; statuses ${counts.concordance_supported_rows}/${counts.concordance_candidate_rows}/${counts.concordance_weak_rows}; hits ${counts.concordance_reader_facing_rows}/${counts.concordance_route_payload_field_hits}/${counts.concordance_forbidden_authority_field_hits}`),
  check('ambiguous_rows_audit_only', counts.ambiguous_audit_only_available === 2064 && counts.ambiguous_emitted_rows === 0, `${counts.ambiguous_audit_only_available}/${counts.ambiguous_emitted_rows}`),
  check('route_pointer_only', counts.route_pointer_rows === 1 && counts.route_pointer_route_ids === 1 && counts.route_pointer_resolved_route_ids === 1 && counts.route_pointer_unresolved_route_ids === 0 && counts.route_pointer_support_rows_with_pointer === 49 && counts.route_pointer_support_rows === 49 && counts.route_pointer_navigation_rows_with_pointer === 2390 && counts.route_pointer_navigation_rows === 2390, `routes ${counts.route_pointer_rows}/${counts.route_pointer_route_ids}; support ${counts.route_pointer_support_rows_with_pointer}/${counts.route_pointer_support_rows}; nav ${counts.route_pointer_navigation_rows_with_pointer}/${counts.route_pointer_navigation_rows}`),
  check('route_payloads_not_copied', counts.route_pointer_payload_copied_rows === 0 && counts.route_pointer_agent2_payload_copied_rows === 0 && counts.route_pointer_metadata_copied_rows === 0 && counts.route_pointer_route_payload_field_hits === 0 && counts.route_pointer_forbidden_authority_field_hits === 0 && counts.route_pointer_route_metadata_field_hits === 0, `copied ${counts.route_pointer_payload_copied_rows}/${counts.route_pointer_agent2_payload_copied_rows}/${counts.route_pointer_metadata_copied_rows}; hits ${counts.route_pointer_route_payload_field_hits}/${counts.route_pointer_forbidden_authority_field_hits}/${counts.route_pointer_route_metadata_field_hits}`),
  check('negative_tests_no_failures', failedNegativeTests.length === 0, `failed ${failedNegativeTests.length}; warnings ${warnings.length}`),
  check('artifact_no_hard_true_forbidden_values', forbiddenHits.length === 0 && counts.forbidden_authority_value_hits === 0, `artifact hits ${forbiddenHits.length}; scanned source hits ${counts.forbidden_authority_value_hits}`),
  check('observed_usage_only_boundary', boundaries.observed_usage_only === true && boundaries.answer_authority_claimed === false && boundaries.semantic_arbitration_claimed === false && boundaries.route_ranking_claimed === false && boundaries.visible_answer_selection_claimed === false && boundaries.ui_runtime_acceptance_claimed === false && boundaries.public_display_claimed === false && boundaries.publication_readiness_claimed === false && boundaries.source_provenance_custody_claimed === false && boundaries.copied_agent2_payloads_claimed === false && boundaries.accepted_text_claimed === false && boundaries.agent6_acceptance_claimed === false && boundaries.broad_corpus_completion_claimed === false, JSON.stringify(boundaries)),
  check('stop_conditions_not_required', Object.values(stopConditions).every((value) => value === false), JSON.stringify(stopConditions)),
  check('warnings_preserved', counts.single_route_scope_warning === 1 && counts.agent3_state_source_freshness_pending > 0 && warnings.length >= 2, `single-route ${counts.single_route_scope_warning}; freshness ${counts.agent3_state_source_freshness_pending}; warnings ${warnings.length}`, 'warning'),
];

const failed = checks.filter((row) => !row.passed && row.severity !== 'warning');
const warningFailures = checks.filter((row) => !row.passed && row.severity === 'warning');

for (const row of checks) {
  const prefix = row.passed ? 'PASS' : row.severity === 'warning' ? 'WARN' : 'FAIL';
  console.log(`${prefix} ${row.name}: ${row.detail}`);
}

if (warningFailures.length) {
  console.log(`Warnings not preserved as expected: ${warningFailures.map((row) => row.name).join(', ')}`);
}

if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Validation passed with ${warnings.length} preserved packet warnings.`);
