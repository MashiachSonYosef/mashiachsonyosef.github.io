#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-consumer-manifest.json');
const packet = readJson(packetPath);
const issues = [];
const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_metadata',
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_consumer_manifest') {
  issues.push('artifact_type must be definition_workbench_usage_consumer_manifest');
}
if (!String(packet.policy || '').includes('usage-navigation consumer manifest')) {
  issues.push('policy must identify usage-navigation consumer manifest');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateStatusSemantics(packet.status_semantics || {});
validateInputs(packet.inputs || {});
validateConsumerContract(packet.consumer_contract || {});
validateNavigationKeys(packet.navigation_keys || {});
validateManifestEntries(Array.isArray(packet.manifest_entries) ? packet.manifest_entries : []);
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage consumer manifest validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 180)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage consumer manifest validation passed.');
console.log(`Manifest entries: ${packet.counts.manifest_entries}; data artifacts: ${packet.counts.data_artifacts_exist}/${packet.counts.data_artifacts}; validators: ${packet.counts.validator_scripts_exist}/${packet.counts.validator_scripts}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'consumer_manifest_only',
    'route_ids_only',
    'source_license_required',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_definition_payloads',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'publication_readiness',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateStatusSemantics(semantics) {
  const expectedFields = [
    'machine_status_axis',
    'machine_complete_label',
    'machine_complete_label_basis',
    'machine_forbidden_status_labels',
    'review_status_axis',
    'machine_review_status',
    'verified_review_status_reserved',
    'verified_review_status_reserved_for',
    'usage_status_scope',
    'answer_role_preserved',
    'source_license_rows_preserved',
    'multi_answer_warnings_preserved',
    'publication_boundary_preserved',
  ];
  requireFields(semantics, expectedFields, 'status_semantics');
  if (semantics.machine_status_axis !== 'machine_route_shape_status_not_review_authority') {
    issues.push('status_semantics.machine_status_axis must separate machine route shape from review authority');
  }
  if (semantics.machine_complete_label !== 'single_answer_source_complete') {
    issues.push('status_semantics.machine_complete_label must be single_answer_source_complete');
  }
  if (!String(semantics.machine_complete_label_basis || '').includes('not reviewed lexical authority')) {
    issues.push('status_semantics.machine_complete_label_basis must block reviewed-authority overclaim');
  }
  if (!Array.isArray(semantics.machine_forbidden_status_labels) || !semantics.machine_forbidden_status_labels.includes('verified')) {
    issues.push('status_semantics.machine_forbidden_status_labels must include verified');
  }
  if (semantics.review_status_axis !== 'lexical_authority_review_status') {
    issues.push('status_semantics.review_status_axis must be lexical_authority_review_status');
  }
  if (semantics.machine_review_status !== 'unreviewed_machine_sample') {
    issues.push('status_semantics.machine_review_status must be unreviewed_machine_sample');
  }
  if (semantics.verified_review_status_reserved !== true) {
    issues.push('status_semantics.verified_review_status_reserved must be true');
  }
  if (!String(semantics.verified_review_status_reserved_for || '').includes('reviewed lexical authority')) {
    issues.push('status_semantics.verified_review_status_reserved_for must name reviewed lexical authority');
  }
  if (!String(semantics.usage_status_scope || '').includes('not answer authority') || !String(semantics.usage_status_scope || '').includes('not reviewed lexical authority')) {
    issues.push('status_semantics.usage_status_scope must block answer/review authority overclaim');
  }
  for (const key of [
    'answer_role_preserved',
    'source_license_rows_preserved',
    'multi_answer_warnings_preserved',
    'publication_boundary_preserved',
  ]) {
    if (semantics[key] !== true) issues.push(`status_semantics.${key} must be true`);
  }
}

function validateInputs(inputs) {
  const required = [
    'occurrence_links',
    'route_resolution',
    'crossmatch_neighbors',
    'source_ref_buckets',
    'work_buckets',
    'provenance_buckets',
    'occurrence_detail_index',
    'facet_index',
    'context_token_index',
    'context_token_links',
    'context_token_occurrence_index',
    'occurrence_context_profile',
    'route_diversity_probe',
    'route_concentration_guardrail',
    'route_pointer_audit',
    'sample_gap_audit',
  ];
  for (const key of required) {
    const value = inputs[key];
    if (!value || !fs.existsSync(path.join(root, cleanRelativePath(value)))) {
      issues.push(`inputs.${key} must point to an existing local artifact`);
    }
  }
}

function validateConsumerContract(contract) {
  if (!Array.isArray(contract.safe_uses) || contract.safe_uses.length < 4) {
    issues.push('consumer_contract.safe_uses must list safe navigation uses');
  }
  if (!Array.isArray(contract.prohibited_uses) || contract.prohibited_uses.length < 8) {
    issues.push('consumer_contract.prohibited_uses must list prohibited uses');
  }
  const prohibited = Array.isArray(contract.prohibited_uses) ? contract.prohibited_uses.join(' | ') : '';
  for (const required of [
    'usage rows as definitions',
    'visible answer selection',
    'route ranking',
    'semantic arbitration',
    'public UI acceptance',
    'publication support',
    'accepted translation text',
    'copying Agent 2 route payloads',
    'reader-facing ambiguous rows',
    'broad corpus completion claims',
  ]) {
    if (!prohibited.includes(required)) issues.push(`consumer_contract.prohibited_uses must include ${required}`);
  }
  if (contract.required_row_label !== 'observed usage only') {
    issues.push('consumer_contract.required_row_label must be observed usage only');
  }
  if (!String(contract.ambiguous_rows_policy || '').includes('audit-only')) {
    issues.push('consumer_contract.ambiguous_rows_policy must keep ambiguous rows audit-only');
  }
  if (!String(contract.downstream_route_payload_rule || '').includes('related_route_ids only')) {
    issues.push('consumer_contract.downstream_route_payload_rule must restrict consumption to related_route_ids only');
  }
}

function validateNavigationKeys(keys) {
  const requiredLists = [
    'stable_row_keys',
    'source_keys',
    'usage_keys',
    'provenance_keys',
    'bucket_keys',
    'route_keys',
  ];
  for (const key of requiredLists) {
    if (!Array.isArray(keys[key]) || keys[key].length === 0) issues.push(`navigation_keys.${key} must be a non-empty array`);
  }
  if (!keys.stable_row_keys?.includes('occurrence_id')) issues.push('navigation_keys.stable_row_keys must include occurrence_id');
  if (!keys.provenance_keys?.includes('license_url')) issues.push('navigation_keys.provenance_keys must include license_url');
  if (!keys.route_keys?.includes('related_route_ids')) issues.push('navigation_keys.route_keys must include related_route_ids');
}

function validateManifestEntries(entries) {
  if (entries.length !== 16) issues.push('manifest_entries must contain exactly 16 entries');
  const ids = new Set();
  for (const [index, entry] of entries.entries()) {
    const context = `manifest_entries[${index}]`;
    requireFields(entry, [
      'artifact_id',
      'data_path',
      'report_path',
      'validator_script',
      'artifact_type',
      'status',
      'safe_consumer_role',
      'primary_count_key',
      'primary_count',
      'route_ids',
      'unresolved_route_ids',
      'reader_facing_rows',
      'route_payload_field_hits',
      'forbidden_authority_field_hits',
      'metadata_summary',
      'usage_boundary',
    ], context);
    if (ids.has(entry.artifact_id)) issues.push(`${context}: duplicate artifact_id ${entry.artifact_id}`);
    ids.add(entry.artifact_id);
    if (!fs.existsSync(path.join(root, cleanRelativePath(entry.data_path)))) issues.push(`${context}: data_path missing`);
    if (!fs.existsSync(path.join(root, cleanRelativePath(entry.report_path)))) issues.push(`${context}: report_path missing`);
    if (!fs.existsSync(path.join(root, cleanRelativePath(entry.validator_script)))) issues.push(`${context}: validator_script missing`);
    if (!['passed', 'pass_with_warnings'].includes(entry.status)) {
      issues.push(`${context}: status must be passed or pass_with_warnings`);
    }
    if (!Number.isInteger(entry.primary_count) || entry.primary_count <= 0) issues.push(`${context}: primary_count must be positive`);
    if (!Number.isInteger(entry.unresolved_route_ids) || entry.unresolved_route_ids !== 0) {
      issues.push(`${context}: unresolved_route_ids must be 0`);
    }
    if (!Number.isInteger(entry.reader_facing_rows) || entry.reader_facing_rows !== 0) {
      issues.push(`${context}: reader_facing_rows must be 0`);
    }
    if (!Number.isInteger(entry.route_payload_field_hits) || entry.route_payload_field_hits !== 0) {
      issues.push(`${context}: route_payload_field_hits must be 0`);
    }
    if (!Number.isInteger(entry.forbidden_authority_field_hits) || entry.forbidden_authority_field_hits !== 0) {
      issues.push(`${context}: forbidden_authority_field_hits must be 0`);
    }
    validateMetadataSummary(`${context}.metadata_summary`, entry.metadata_summary || {});
    validateUsageBoundary(`${context}.usage_boundary`, entry.usage_boundary || {});
  }
  for (const requiredId of [
    'occurrence_links',
    'route_resolution',
    'crossmatch_neighbors',
    'source_ref_buckets',
    'work_buckets',
    'provenance_buckets',
    'occurrence_detail_index',
    'facet_index',
    'context_token_index',
    'context_token_links',
    'context_token_occurrence_index',
    'occurrence_context_profile',
    'route_diversity_probe',
    'route_concentration_guardrail',
    'route_pointer_audit',
    'sample_gap_audit',
  ]) {
    if (!ids.has(requiredId)) issues.push(`manifest_entries missing ${requiredId}`);
  }
}

function validateMetadataSummary(context, summary) {
  for (const [key, value] of Object.entries(summary)) {
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.${key} must be a non-negative integer`);
  }
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'consumer_manifest_entry_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ];
  const expectedFalse = ['reader_facing'];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`${context}.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`${context}.${key} must be false`);
  }
}

function validateCounts(counts) {
  const required = [
    'manifest_entries',
    'data_artifacts',
    'data_artifacts_exist',
    'report_artifacts',
    'report_artifacts_exist',
    'validator_scripts',
    'validator_scripts_exist',
    'passed_entries',
    'occurrence_link_rows',
    'occurrence_detail_rows',
    'source_ref_buckets',
    'work_buckets',
    'provenance_buckets',
    'facet_index_facets',
    'facet_index_occurrence_rows',
    'facet_index_route_concentration_warning',
    'context_token_index_rows',
    'context_token_index_occurrence_rows',
    'context_token_index_occurrences',
    'context_token_index_cross_frame_rows',
    'context_token_index_repeated_focus_occurrences',
    'context_token_index_route_concentration_warning',
    'context_token_link_rows',
    'context_token_link_context_tokens',
    'context_token_link_occurrence_rows',
    'context_token_link_focus_rows',
    'context_token_link_context_rows',
    'context_token_link_repeated_focus_rows',
    'context_token_link_cross_frame_rows',
    'context_token_link_route_concentration_warning',
    'context_token_occurrence_index_rows',
    'context_token_occurrence_index_link_rows',
    'context_token_occurrence_index_occurrence_rows',
    'context_token_occurrence_index_focus_rows',
    'context_token_occurrence_index_context_rows',
    'context_token_occurrence_index_repeated_focus_rows',
    'context_token_occurrence_index_cross_frame_rows',
    'context_token_occurrence_index_cross_frame_link_rows',
    'context_token_occurrence_index_route_concentration_warning',
    'occurrence_context_profile_rows',
    'occurrence_context_profile_link_rows',
    'occurrence_context_profile_unique_context_tokens',
    'occurrence_context_profile_reverse_index_rows',
    'occurrence_context_profile_rows_with_reverse_index_ids',
    'occurrence_context_profile_rows_with_complete_reverse_index_mapping',
    'occurrence_context_profile_focus_rows',
    'occurrence_context_profile_context_rows',
    'occurrence_context_profile_repeated_focus_rows',
    'occurrence_context_profile_cross_frame_rows',
    'occurrence_context_profile_route_concentration_warning',
    'route_diversity_probe_occurrence_rows',
    'route_diversity_probe_route_ids',
    'route_diversity_probe_max_route_share_basis_points',
    'route_diversity_probe_concentration_warning',
    'route_diversity_probe_semantic_independence_claim_allowed',
    'route_concentration_guardrail_surfaces',
    'route_concentration_guardrail_single_route_surfaces',
    'route_concentration_guardrail_max_share_surfaces',
    'route_concentration_guardrail_warning_surfaces',
    'route_concentration_guardrail_semantic_independence_allowed_rows',
    'route_concentration_guardrail_answer_authority_allowed_rows',
    'route_concentration_guardrail_route_ranking_allowed_rows',
    'route_concentration_guardrail_visible_answer_selection_allowed_rows',
    'route_concentration_guardrail_reader_facing_rows',
    'route_concentration_guardrail_route_payload_field_hits',
    'route_concentration_guardrail_forbidden_authority_field_hits',
    'route_concentration_guardrail_unresolved_route_ids',
    'route_pointer_audit_rows',
    'route_pointer_audit_route_ids',
    'route_pointer_audit_resolved_route_ids',
    'route_pointer_audit_unresolved_route_ids',
    'route_pointer_audit_support_rows_with_pointer',
    'route_pointer_audit_support_rows',
    'route_pointer_audit_navigation_rows_with_pointer',
    'route_pointer_audit_navigation_rows',
    'route_pointer_audit_planning_rows_with_pointer',
    'route_pointer_audit_planning_rows',
    'route_pointer_audit_reader_facing_rows',
    'route_pointer_audit_route_payload_field_hits',
    'route_pointer_audit_forbidden_authority_field_hits',
    'route_pointer_audit_route_metadata_field_hits',
    'sample_gap_audit_gap_rows',
    'sample_gap_audit_sample_rows',
    'sample_gap_audit_sample_rows_with_usage_links',
    'sample_gap_audit_usage_tokens_not_in_sample',
    'sample_gap_audit_selected_occurrence_links',
    'sample_gap_audit_route_ids',
    'sample_gap_audit_sample_overlap_gap_visible',
    'crossmatch_neighbor_links',
    'route_ids',
    'unresolved_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'rows_with_all_bucket_links',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'prohibited_consumer_uses',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.manifest_entries !== 16) issues.push('manifest_entries must be 16');
  if (counts.data_artifacts_exist !== counts.data_artifacts) issues.push('all data artifacts must exist');
  if (counts.report_artifacts_exist !== counts.report_artifacts) issues.push('all report artifacts must exist');
  if (counts.validator_scripts_exist !== counts.validator_scripts) issues.push('all validator scripts must exist');
  if (counts.passed_entries !== counts.manifest_entries) issues.push('all manifest entries must pass');
  if (counts.occurrence_detail_rows !== counts.occurrence_link_rows) {
    issues.push('occurrence_detail_rows must equal occurrence_link_rows');
  }
  if (counts.occurrence_detail_rows <= 0) issues.push('occurrence_detail_rows must be positive');
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'rows_with_all_bucket_links',
    'observed_usage_only_rows',
  ]) {
    if (counts[key] !== counts.occurrence_detail_rows) issues.push(`counts.${key} must equal occurrence_detail_rows`);
  }
  if (counts.source_ref_buckets <= 0) issues.push('source_ref_buckets must be positive');
  if (counts.work_buckets <= 0) issues.push('work_buckets must be positive');
  if (counts.provenance_buckets <= 0) issues.push('provenance_buckets must be positive');
  if (counts.facet_index_facets <= 0) issues.push('facet_index_facets must be positive');
  if (counts.facet_index_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('facet_index_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.facet_index_route_concentration_warning !== 1) {
    issues.push('facet_index_route_concentration_warning must be 1 for current selected route concentration');
  }
  if (counts.context_token_index_rows <= 0) issues.push('context_token_index_rows must be positive');
  if (counts.context_token_index_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('context_token_index_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.context_token_index_occurrences <= counts.occurrence_detail_rows) {
    issues.push('context_token_index_occurrences must exceed occurrence_detail_rows');
  }
  if (counts.context_token_index_cross_frame_rows <= 0) {
    issues.push('context_token_index_cross_frame_rows must be positive');
  }
  if (counts.context_token_index_route_concentration_warning !== 1) {
    issues.push('context_token_index_route_concentration_warning must be 1');
  }
  if (counts.context_token_link_rows !== counts.context_token_link_focus_rows + counts.context_token_link_context_rows) {
    issues.push('context_token_link_rows must equal focus plus context link rows');
  }
  if (counts.context_token_link_context_rows !== counts.context_token_index_occurrences) {
    issues.push('context_token_link_context_rows must equal context_token_index_occurrences');
  }
  if (counts.context_token_link_context_tokens !== counts.context_token_index_rows) {
    issues.push('context_token_link_context_tokens must equal context_token_index_rows');
  }
  if (counts.context_token_link_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('context_token_link_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.context_token_link_focus_rows !== counts.occurrence_detail_rows) {
    issues.push('context_token_link_focus_rows must equal occurrence_detail_rows');
  }
  if (counts.context_token_link_context_rows <= counts.occurrence_detail_rows) {
    issues.push('context_token_link_context_rows must exceed occurrence_detail_rows');
  }
  if (counts.context_token_link_cross_frame_rows <= 0) {
    issues.push('context_token_link_cross_frame_rows must be positive');
  }
  if (counts.context_token_link_route_concentration_warning !== 1) {
    issues.push('context_token_link_route_concentration_warning must be 1');
  }
  if (counts.context_token_occurrence_index_rows !== counts.context_token_link_context_tokens) {
    issues.push('context_token_occurrence_index_rows must equal context_token_link_context_tokens');
  }
  if (counts.context_token_occurrence_index_link_rows !== counts.context_token_link_rows) {
    issues.push('context_token_occurrence_index_link_rows must equal context_token_link_rows');
  }
  if (counts.context_token_occurrence_index_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('context_token_occurrence_index_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.context_token_occurrence_index_focus_rows !== counts.context_token_link_focus_rows) {
    issues.push('context_token_occurrence_index_focus_rows must equal context_token_link_focus_rows');
  }
  if (counts.context_token_occurrence_index_context_rows !== counts.context_token_link_context_rows) {
    issues.push('context_token_occurrence_index_context_rows must equal context_token_link_context_rows');
  }
  if (counts.context_token_occurrence_index_cross_frame_rows <= 0 || counts.context_token_occurrence_index_cross_frame_link_rows <= 0) {
    issues.push('context_token_occurrence_index cross-frame rows and links must be positive');
  }
  if (counts.context_token_occurrence_index_route_concentration_warning !== 1) {
    issues.push('context_token_occurrence_index_route_concentration_warning must be 1');
  }
  if (counts.occurrence_context_profile_rows !== counts.occurrence_detail_rows) {
    issues.push('occurrence_context_profile_rows must equal occurrence_detail_rows');
  }
  if (counts.occurrence_context_profile_link_rows !== counts.context_token_link_rows) {
    issues.push('occurrence_context_profile_link_rows must equal context_token_link_rows');
  }
  if (counts.occurrence_context_profile_unique_context_tokens !== counts.context_token_occurrence_index_rows) {
    issues.push('occurrence_context_profile_unique_context_tokens must equal context_token_occurrence_index_rows');
  }
  if (counts.occurrence_context_profile_reverse_index_rows !== counts.context_token_occurrence_index_rows) {
    issues.push('occurrence_context_profile_reverse_index_rows must equal context_token_occurrence_index_rows');
  }
  if (counts.occurrence_context_profile_rows_with_reverse_index_ids !== counts.occurrence_detail_rows) {
    issues.push('occurrence_context_profile_rows_with_reverse_index_ids must equal occurrence_detail_rows');
  }
  if (counts.occurrence_context_profile_rows_with_complete_reverse_index_mapping !== counts.occurrence_detail_rows) {
    issues.push('occurrence_context_profile_rows_with_complete_reverse_index_mapping must equal occurrence_detail_rows');
  }
  if (counts.occurrence_context_profile_focus_rows !== counts.context_token_link_focus_rows) {
    issues.push('occurrence_context_profile_focus_rows must equal context_token_link_focus_rows');
  }
  if (counts.occurrence_context_profile_context_rows !== counts.context_token_link_context_rows) {
    issues.push('occurrence_context_profile_context_rows must equal context_token_link_context_rows');
  }
  if (counts.occurrence_context_profile_repeated_focus_rows <= 0) {
    issues.push('occurrence_context_profile_repeated_focus_rows must be positive');
  }
  if (counts.occurrence_context_profile_cross_frame_rows <= 0) {
    issues.push('occurrence_context_profile_cross_frame_rows must be positive');
  }
  if (counts.occurrence_context_profile_route_concentration_warning !== 1) {
    issues.push('occurrence_context_profile_route_concentration_warning must be 1');
  }
  if (counts.route_diversity_probe_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('route_diversity_probe_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.route_diversity_probe_route_ids !== counts.route_ids) {
    issues.push('route_diversity_probe_route_ids must equal route_ids');
  }
  if (counts.route_diversity_probe_max_route_share_basis_points !== 10000) {
    issues.push('route_diversity_probe_max_route_share_basis_points must be 10000');
  }
  if (counts.route_diversity_probe_concentration_warning !== 1) {
    issues.push('route_diversity_probe_concentration_warning must be 1');
  }
  if (counts.route_diversity_probe_semantic_independence_claim_allowed !== 0) {
    issues.push('route_diversity_probe_semantic_independence_claim_allowed must be 0');
  }
  if (counts.route_concentration_guardrail_surfaces !== 7) {
    issues.push('route_concentration_guardrail_surfaces must be 7');
  }
  for (const key of [
    'route_concentration_guardrail_single_route_surfaces',
    'route_concentration_guardrail_max_share_surfaces',
    'route_concentration_guardrail_warning_surfaces',
  ]) {
    if (counts[key] !== counts.route_concentration_guardrail_surfaces) {
      issues.push(`${key} must equal route_concentration_guardrail_surfaces`);
    }
  }
  for (const key of [
    'route_concentration_guardrail_semantic_independence_allowed_rows',
    'route_concentration_guardrail_answer_authority_allowed_rows',
    'route_concentration_guardrail_route_ranking_allowed_rows',
    'route_concentration_guardrail_visible_answer_selection_allowed_rows',
    'route_concentration_guardrail_reader_facing_rows',
    'route_concentration_guardrail_route_payload_field_hits',
    'route_concentration_guardrail_forbidden_authority_field_hits',
    'route_concentration_guardrail_unresolved_route_ids',
  ]) {
    if (counts[key] !== 0) issues.push(`${key} must be 0`);
  }
  if (counts.route_pointer_audit_rows !== 1) issues.push('route_pointer_audit_rows must be 1');
  if (counts.route_pointer_audit_route_ids !== counts.route_pointer_audit_rows) {
    issues.push('route_pointer_audit_route_ids must equal route_pointer_audit_rows');
  }
  if (counts.route_pointer_audit_resolved_route_ids !== counts.route_pointer_audit_route_ids) {
    issues.push('route_pointer_audit_resolved_route_ids must equal route_pointer_audit_route_ids');
  }
  if (counts.route_pointer_audit_unresolved_route_ids !== 0) {
    issues.push('route_pointer_audit_unresolved_route_ids must be 0');
  }
  if (counts.route_pointer_audit_support_rows_with_pointer !== counts.route_pointer_audit_support_rows) {
    issues.push('route_pointer_audit_support_rows_with_pointer must equal route_pointer_audit_support_rows');
  }
  if (counts.route_pointer_audit_navigation_rows_with_pointer !== counts.route_pointer_audit_navigation_rows) {
    issues.push('route_pointer_audit_navigation_rows_with_pointer must equal route_pointer_audit_navigation_rows');
  }
  if (counts.route_pointer_audit_planning_rows_with_pointer !== counts.route_pointer_audit_planning_rows) {
    issues.push('route_pointer_audit_planning_rows_with_pointer must equal route_pointer_audit_planning_rows');
  }
  for (const key of [
    'route_pointer_audit_reader_facing_rows',
    'route_pointer_audit_route_payload_field_hits',
    'route_pointer_audit_forbidden_authority_field_hits',
    'route_pointer_audit_route_metadata_field_hits',
  ]) {
    if (counts[key] !== 0) issues.push(`${key} must be 0`);
  }
  if (counts.sample_gap_audit_gap_rows <= 0) issues.push('sample_gap_audit_gap_rows must be positive');
  if (counts.sample_gap_audit_sample_rows <= 0) issues.push('sample_gap_audit_sample_rows must be positive');
  if (counts.sample_gap_audit_sample_rows_with_usage_links !== 0) {
    issues.push('sample_gap_audit_sample_rows_with_usage_links must be 0 for current bounded gap audit');
  }
  if (counts.sample_gap_audit_usage_tokens_not_in_sample <= 0) {
    issues.push('sample_gap_audit_usage_tokens_not_in_sample must be positive');
  }
  if (counts.sample_gap_audit_selected_occurrence_links <= 0) {
    issues.push('sample_gap_audit_selected_occurrence_links must be positive');
  }
  if (counts.sample_gap_audit_route_ids !== counts.route_ids) {
    issues.push('sample_gap_audit_route_ids must equal route_ids');
  }
  if (counts.sample_gap_audit_sample_overlap_gap_visible !== 1) {
    issues.push('sample_gap_audit_sample_overlap_gap_visible must be 1');
  }
  if (counts.crossmatch_neighbor_links <= 0) issues.push('crossmatch_neighbor_links must be positive');
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (counts.prohibited_consumer_uses < 10) issues.push('prohibited_consumer_uses must be at least 10');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (value[field] === undefined || value[field] === null || value[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) {
    issues.push(`forbidden authority keys present: ${hits.slice(0, 40).join(', ')}`);
  }

  function walk(node, nodePath) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) walk(item, `${nodePath}[${index}]`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbiddenAuthorityKeys.has(key)) hits.push(`${nodePath}.${key}`);
      walk(child, `${nodePath}.${key}`);
    }
  }
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}
