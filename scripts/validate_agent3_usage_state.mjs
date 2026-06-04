#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const statePath = cleanRelativePath(process.argv[2] || 'reports/agent3-state.json');
const state = readJson(statePath);
const issues = [];
const warnings = [];

if (state.schema_version !== 1) issues.push('schema_version must be 1');
if (state.artifact_type !== 'agent3_usage_navigation_state') issues.push('artifact_type must be agent3_usage_navigation_state');
if (state.agent !== 'Agent 3') issues.push('agent must be Agent 3');
if (state.lane !== 'workbench_usage_navigation') issues.push('lane must be workbench_usage_navigation');
if (state.worker_state !== 'evidence-ready') issues.push('worker_state must be evidence-ready');
if (state.qa_acceptance_state !== 'not_agent6_accepted') issues.push('qa_acceptance_state must be not_agent6_accepted');
if (state.acceptance_owner !== 'Agent 6') issues.push('acceptance_owner must be Agent 6');

validateAuthorityBoundary(state.authority_boundary || {});
validateHandoffState(state.handoff_state || {});
validateMetrics(state.current_metrics || {});
validateCounts(state.counts || {});
validateChecks(state.checks || []);
validateArtifacts(state.evidence_artifacts || [], 'evidence_artifacts');
validateArtifacts(state.validators || [], 'validators');

if (issues.length) {
  console.error(`Agent 3 usage state validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Agent 3 usage state validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Agent 3 usage state validation passed.');
}
console.log(`Evidence artifacts: ${state.counts.evidence_artifacts_exist}/${state.counts.evidence_artifacts}; validators: ${state.counts.validator_scripts_exist}/${state.counts.validator_scripts}; smoke failed: ${state.counts.smoke_failed_steps}.`);

function validateAuthorityBoundary(boundary) {
  const expectedTrue = [
    'usage_navigation_only',
    'occurrence_link_packet_only',
    'route_ids_only',
  ];
  const expectedFalse = [
    'definition_authority',
    'semantic_arbitration',
    'route_ranking',
    'hud_or_workbench_ui_acceptance',
    'publication_support',
    'accepted_translation_text',
    'agent6_accepted',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validateHandoffState(handoff) {
  if (handoff.intended_submitter !== 'Agent 5') issues.push('handoff_state.intended_submitter must be Agent 5');
  if (handoff.control_queue_mutated !== false) issues.push('handoff_state.control_queue_mutated must be false');
  if (handoff.submitted_to_agent6 !== false) issues.push('handoff_state.submitted_to_agent6 must be false');
  if (!handoff.queue_ready_packet || !fs.existsSync(path.join(root, handoff.queue_ready_packet))) {
    issues.push('handoff_state.queue_ready_packet must point to an existing packet');
  }
}

function validateMetrics(metrics) {
  const requiredNonNegative = [
    'usage_concordance_rows',
    'usage_supported_rows',
    'usage_candidate_rows',
    'usage_weak_rows',
    'audit_only_ambiguous_rows',
    'usage_clusters',
    'selected_usage_rows',
    'selected_source_refs',
    'selected_works',
    'route_ids',
    'occurrence_link_rows',
    'occurrence_link_rows_with_complete_metadata',
    'occurrence_link_reader_facing_rows',
    'occurrence_link_route_payload_field_hits',
    'occurrence_link_forbidden_authority_field_hits',
    'route_resolution_occurrence_route_rows',
    'route_resolution_route_ids',
    'route_resolution_resolved_route_ids',
    'route_resolution_unresolved_route_ids',
    'route_resolution_reader_facing_rows',
    'route_resolution_route_payload_field_hits',
    'route_resolution_forbidden_authority_field_hits',
    'crossmatch_neighbor_source_occurrence_rows',
    'crossmatch_neighbor_link_rows',
    'crossmatch_neighbor_same_frame_links',
    'crossmatch_neighbor_bridge_frame_links',
    'crossmatch_neighbor_route_ids',
    'crossmatch_neighbor_unresolved_route_ids',
    'crossmatch_neighbor_reader_facing_rows',
    'crossmatch_neighbor_route_payload_field_hits',
    'crossmatch_neighbor_forbidden_authority_field_hits',
    'source_ref_bucket_count',
    'source_ref_bucket_source_cluster_buckets',
    'source_ref_bucket_occurrence_rows',
    'source_ref_bucket_duplicate_source_ref_buckets',
    'source_ref_bucket_duplicate_source_ref_rows',
    'source_ref_bucket_cross_cluster_source_ref_buckets',
    'source_ref_bucket_cross_cluster_source_ref_rows',
    'source_ref_bucket_route_ids',
    'source_ref_bucket_unresolved_route_ids',
    'source_ref_bucket_reader_facing_rows',
    'source_ref_bucket_route_payload_field_hits',
    'source_ref_bucket_forbidden_authority_field_hits',
    'work_bucket_count',
    'work_bucket_work_frame_buckets',
    'work_bucket_occurrence_rows',
    'work_bucket_source_refs',
    'work_bucket_multi_source_work_buckets',
    'work_bucket_multi_source_work_rows',
    'work_bucket_multi_frame_work_buckets',
    'work_bucket_multi_frame_work_rows',
    'work_bucket_route_ids',
    'work_bucket_unresolved_route_ids',
    'work_bucket_reader_facing_rows',
    'work_bucket_route_payload_field_hits',
    'work_bucket_forbidden_authority_field_hits',
    'provenance_bucket_count',
    'provenance_bucket_provenance_frame_buckets',
    'provenance_bucket_occurrence_rows',
    'provenance_bucket_work_count',
    'provenance_bucket_source_refs',
    'provenance_bucket_license_count',
    'provenance_bucket_version_source_count',
    'provenance_bucket_multi_work_buckets',
    'provenance_bucket_multi_work_rows',
    'provenance_bucket_multi_frame_buckets',
    'provenance_bucket_multi_frame_rows',
    'provenance_bucket_route_ids',
    'provenance_bucket_unresolved_route_ids',
    'provenance_bucket_reader_facing_rows',
    'provenance_bucket_route_payload_field_hits',
    'provenance_bucket_forbidden_authority_field_hits',
    'occurrence_detail_rows',
    'occurrence_detail_source_refs',
    'occurrence_detail_works',
    'occurrence_detail_license_count',
    'occurrence_detail_version_source_count',
    'occurrence_detail_route_ids',
    'occurrence_detail_unresolved_route_ids',
    'occurrence_detail_rows_with_route_ids',
    'occurrence_detail_rows_with_source_link',
    'occurrence_detail_rows_with_work_anchor',
    'occurrence_detail_rows_with_hebrew_context',
    'occurrence_detail_rows_with_focus_marker',
    'occurrence_detail_rows_with_all_bucket_links',
    'occurrence_detail_neighbor_links',
    'occurrence_detail_same_frame_neighbor_links',
    'occurrence_detail_bridge_frame_neighbor_links',
    'occurrence_detail_observed_usage_only_rows',
    'occurrence_detail_reader_facing_rows',
    'occurrence_detail_route_payload_field_hits',
    'occurrence_detail_forbidden_authority_field_hits',
    'facet_index_occurrence_rows',
    'facet_index_facet_groups',
    'facet_index_facets_total',
    'facet_index_route_ids',
    'facet_index_max_route_share_basis_points',
    'facet_index_route_concentration_warning',
    'facet_index_rows_with_source_link',
    'facet_index_rows_with_work_anchor',
    'facet_index_rows_with_context',
    'facet_index_rows_with_focus_marker',
    'facet_index_rows_with_license',
    'facet_index_rows_with_version',
    'facet_index_rows_with_route_ids',
    'facet_index_reader_facing_rows',
    'facet_index_route_payload_field_hits',
    'facet_index_forbidden_authority_field_hits',
    'context_token_index_rows',
    'context_token_index_occurrence_rows',
    'context_token_index_occurrences',
    'context_token_index_cross_frame_rows',
    'context_token_index_repeated_focus_occurrences',
    'context_token_index_route_ids',
    'context_token_index_unresolved_route_ids',
    'context_token_index_route_concentration_warning',
    'context_token_index_rows_with_source_link',
    'context_token_index_rows_with_work_anchor',
    'context_token_index_rows_with_hebrew_context',
    'context_token_index_rows_with_focus_marker',
    'context_token_index_rows_with_license_metadata',
    'context_token_index_rows_with_version_metadata',
    'context_token_index_reader_facing_rows',
    'context_token_index_route_payload_field_hits',
    'context_token_index_forbidden_authority_field_hits',
    'context_token_link_rows',
    'context_token_link_context_tokens',
    'context_token_link_occurrence_rows',
    'context_token_link_focus_rows',
    'context_token_link_context_rows',
    'context_token_link_repeated_focus_rows',
    'context_token_link_cross_frame_rows',
    'context_token_link_route_ids',
    'context_token_link_unresolved_route_ids',
    'context_token_link_max_route_share_basis_points',
    'context_token_link_route_concentration_warning',
    'context_token_link_rows_with_source_link',
    'context_token_link_rows_with_work_anchor',
    'context_token_link_rows_with_hebrew_context',
    'context_token_link_rows_with_focus_marker',
    'context_token_link_rows_with_route_ids',
    'context_token_link_rows_with_license_metadata',
    'context_token_link_rows_with_version_metadata',
    'context_token_link_observed_usage_only_rows',
    'context_token_link_reader_facing_rows',
    'context_token_link_route_payload_field_hits',
    'context_token_link_forbidden_authority_field_hits',
    'context_token_occurrence_index_rows',
    'context_token_occurrence_index_link_rows',
    'context_token_occurrence_index_occurrence_rows',
    'context_token_occurrence_index_focus_rows',
    'context_token_occurrence_index_context_rows',
    'context_token_occurrence_index_repeated_focus_rows',
    'context_token_occurrence_index_cross_frame_rows',
    'context_token_occurrence_index_cross_frame_link_rows',
    'context_token_occurrence_index_route_ids',
    'context_token_occurrence_index_unresolved_route_ids',
    'context_token_occurrence_index_max_route_share_basis_points',
    'context_token_occurrence_index_route_concentration_warning',
    'context_token_occurrence_index_rows_with_source_link',
    'context_token_occurrence_index_rows_with_work_anchor',
    'context_token_occurrence_index_rows_with_hebrew_context',
    'context_token_occurrence_index_rows_with_focus_marker',
    'context_token_occurrence_index_rows_with_route_ids',
    'context_token_occurrence_index_rows_with_license_metadata',
    'context_token_occurrence_index_rows_with_version_metadata',
    'context_token_occurrence_index_reader_facing_rows',
    'context_token_occurrence_index_route_payload_field_hits',
    'context_token_occurrence_index_forbidden_authority_field_hits',
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
    'occurrence_context_profile_route_ids',
    'occurrence_context_profile_unresolved_route_ids',
    'occurrence_context_profile_max_route_share_basis_points',
    'occurrence_context_profile_route_concentration_warning',
    'occurrence_context_profile_rows_with_source_link',
    'occurrence_context_profile_rows_with_work_anchor',
    'occurrence_context_profile_rows_with_hebrew_context',
    'occurrence_context_profile_rows_with_focus_marker',
    'occurrence_context_profile_rows_with_route_ids',
    'occurrence_context_profile_rows_with_license_metadata',
    'occurrence_context_profile_rows_with_version_metadata',
    'occurrence_context_profile_reader_facing_rows',
    'occurrence_context_profile_route_payload_field_hits',
    'occurrence_context_profile_forbidden_authority_field_hits',
    'route_diversity_probe_occurrence_rows',
    'route_diversity_probe_route_ids',
    'route_diversity_probe_route_probe_rows',
    'route_diversity_probe_max_route_share_basis_points',
    'route_diversity_probe_concentration_warning',
    'route_diversity_probe_all_selected_rows_same_route',
    'route_diversity_probe_semantic_independence_claim_allowed',
    'route_diversity_probe_coverage_buckets_total',
    'route_diversity_probe_concentration_support_selected_occurrence_refs',
    'route_diversity_probe_concentration_support_unique_source_refs',
    'route_diversity_probe_concentration_support_unique_work_anchors',
    'route_diversity_probe_concentration_support_unique_works',
    'route_diversity_probe_concentration_support_unique_licenses',
    'route_diversity_probe_concentration_support_unique_version_sources',
    'route_diversity_probe_concentration_support_duplicate_source_ref_rows',
    'route_diversity_probe_concentration_support_missing_signature_rows',
    'route_diversity_probe_concentration_support_signature_memberships',
    'route_diversity_probe_concentration_support_recurring_signature_rows',
    'route_diversity_probe_concentration_support_cross_cluster_signature_rows',
    'route_diversity_probe_concentration_support_missing_lookup_rows',
    'route_diversity_probe_concentration_support_final_authority',
    'route_diversity_probe_concentration_support_semantic_independence_allowed',
    'route_diversity_probe_reader_facing_rows',
    'route_diversity_probe_route_payload_field_hits',
    'route_diversity_probe_forbidden_authority_field_hits',
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
    'sample_gap_audit_reader_facing_rows',
    'sample_gap_audit_route_payload_field_hits',
    'sample_gap_audit_forbidden_authority_field_hits',
    'consumer_manifest_entries',
    'consumer_manifest_data_artifacts_exist',
    'consumer_manifest_data_artifacts',
    'consumer_manifest_report_artifacts_exist',
    'consumer_manifest_report_artifacts',
    'consumer_manifest_validator_scripts_exist',
    'consumer_manifest_validator_scripts',
    'consumer_manifest_passed_entries',
    'consumer_manifest_occurrence_detail_rows',
    'consumer_manifest_occurrence_link_rows',
    'consumer_manifest_route_ids',
    'consumer_manifest_unresolved_route_ids',
    'consumer_manifest_reader_facing_rows',
    'consumer_manifest_route_payload_field_hits',
    'consumer_manifest_forbidden_authority_field_hits',
    'planning_packet_planning_rows',
    'planning_packet_occurrence_link_rows',
    'planning_packet_current_sample_rows_with_usage_links',
    'planning_packet_current_sample_usage_tokens_not_in_sample',
    'planning_packet_route_ids',
    'planning_packet_reader_facing_rows',
    'planning_packet_route_payload_field_hits',
    'planning_packet_forbidden_authority_field_hits',
    'planning_packet_summary_token_keys',
    'planning_packet_summary_occurrence_token_keys',
    'planning_packet_summary_supported_rows',
    'planning_packet_summary_candidate_rows',
    'planning_packet_summary_weak_rows',
    'planning_packet_summary_resolved_route_ids',
    'planning_packet_summary_unresolved_route_ids',
    'planning_packet_summary_source_refs',
    'planning_packet_summary_works',
    'planning_packet_summary_forbidden_use_items',
    'planning_packet_summary_qa_boundary_references',
    'planning_packet_summary_broad_coverage_claim_allowed',
    'planning_packet_summary_semantic_independence_claim_allowed',
    'public_handoff_selected_targets',
    'public_handoff_validation_passed',
    'public_handoff_validation_failed',
    'public_handoff_eligible_usage_rows',
    'public_handoff_count_only_ambiguous_rows',
    'public_handoff_zero_useful_targets',
    'public_handoff_supported_rows',
    'public_handoff_candidate_rows',
    'public_handoff_weak_rows',
    'public_handoff_ambiguous_rows',
    'public_handoff_downstream_consumable',
    'public_handoff_validation_passed_flag',
    'public_handoff_zero_useful_targets_blocked',
    'public_handoff_ambiguous_rows_audit_only',
    'public_handoff_license_policy_passed',
    'public_handoff_corpus_exhaustive',
    'public_handoff_artifact_source_files_scanned',
    'public_handoff_current_source_files',
    'public_handoff_source_count_delta',
    'public_handoff_files_modified_after_artifact',
    'public_handoff_files_created_after_artifact',
    'public_handoff_final_ranking_authority',
    'public_handoff_visible_answer_authority',
    'public_handoff_carries_text_rows',
    'public_handoff_warning_count',
    'anchor_audit_rows',
    'anchor_audit_existing_work_pages',
    'anchor_audit_existing_anchors',
    'anchor_audit_matching_source_refs',
    'anchor_audit_token_surfaces_in_page',
    'anchor_audit_focus_surfaces_in_page',
    'anchor_audit_rows_with_context',
    'anchor_audit_rows_with_focus_marker',
    'anchor_audit_rows_with_license',
    'anchor_audit_rows_with_version',
    'anchor_audit_rows_with_route_ids',
    'anchor_audit_reader_facing_rows',
    'anchor_audit_route_payload_field_hits',
    'anchor_audit_forbidden_authority_field_hits',
    'proof_occurrence_rows',
    'proof_rows_with_complete_metadata',
    'proof_rows_with_hebrew_context',
    'proof_mojibake_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'queue_required_fields_present',
    'queue_required_fields',
    'queue_evidence_artifacts_exist',
    'queue_evidence_artifacts',
    'smoke_steps',
    'smoke_failed_steps',
    'smoke_source_freshness_pending_files',
  ];
  for (const key of requiredNonNegative) {
    if (!Number.isInteger(metrics[key]) || metrics[key] < 0) issues.push(`current_metrics.${key} must be a non-negative integer`);
  }
  if (metrics.usage_supported_rows + metrics.usage_candidate_rows + metrics.usage_weak_rows <= 0) {
    issues.push('usage supported/candidate/weak rows must contain useful rows');
  }
  if (metrics.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be visible');
  if (metrics.occurrence_link_rows <= 0) issues.push('occurrence_link_rows must be positive');
  if (metrics.occurrence_link_rows_with_complete_metadata !== metrics.occurrence_link_rows) {
    issues.push('occurrence link metadata must be complete');
  }
  if (metrics.occurrence_link_reader_facing_rows !== 0) issues.push('occurrence_link_reader_facing_rows must be 0');
  if (metrics.occurrence_link_route_payload_field_hits !== 0) issues.push('occurrence_link_route_payload_field_hits must be 0');
  if (metrics.occurrence_link_forbidden_authority_field_hits !== 0) {
    issues.push('occurrence_link_forbidden_authority_field_hits must be 0');
  }
  if (metrics.route_resolution_occurrence_route_rows !== metrics.occurrence_link_rows) {
    issues.push('route_resolution_occurrence_route_rows must equal occurrence_link_rows');
  }
  if (metrics.route_resolution_route_ids <= 0) issues.push('route_resolution_route_ids must be positive');
  if (metrics.route_resolution_resolved_route_ids !== metrics.route_resolution_route_ids) {
    issues.push('route_resolution_resolved_route_ids must equal route_resolution_route_ids');
  }
  if (metrics.route_resolution_unresolved_route_ids !== 0) issues.push('route_resolution_unresolved_route_ids must be 0');
  if (metrics.route_resolution_reader_facing_rows !== 0) issues.push('route_resolution_reader_facing_rows must be 0');
  if (metrics.route_resolution_route_payload_field_hits !== 0) {
    issues.push('route_resolution_route_payload_field_hits must be 0');
  }
  if (metrics.route_resolution_forbidden_authority_field_hits !== 0) {
    issues.push('route_resolution_forbidden_authority_field_hits must be 0');
  }
  if (metrics.crossmatch_neighbor_source_occurrence_rows !== metrics.occurrence_link_rows) {
    issues.push('crossmatch_neighbor_source_occurrence_rows must equal occurrence_link_rows');
  }
  if (metrics.crossmatch_neighbor_link_rows <= 0) issues.push('crossmatch_neighbor_link_rows must be positive');
  if (metrics.crossmatch_neighbor_same_frame_links <= 0) issues.push('crossmatch_neighbor_same_frame_links must be positive');
  if (metrics.crossmatch_neighbor_bridge_frame_links <= 0) issues.push('crossmatch_neighbor_bridge_frame_links must be positive');
  if (metrics.crossmatch_neighbor_same_frame_links + metrics.crossmatch_neighbor_bridge_frame_links !== metrics.crossmatch_neighbor_link_rows) {
    issues.push('crossmatch neighbor same-frame plus bridge links must equal link rows');
  }
  if (metrics.crossmatch_neighbor_route_ids <= 0) issues.push('crossmatch_neighbor_route_ids must be positive');
  if (metrics.crossmatch_neighbor_unresolved_route_ids !== 0) issues.push('crossmatch_neighbor_unresolved_route_ids must be 0');
  if (metrics.crossmatch_neighbor_reader_facing_rows !== 0) issues.push('crossmatch_neighbor_reader_facing_rows must be 0');
  if (metrics.crossmatch_neighbor_route_payload_field_hits !== 0) {
    issues.push('crossmatch_neighbor_route_payload_field_hits must be 0');
  }
  if (metrics.crossmatch_neighbor_forbidden_authority_field_hits !== 0) {
    issues.push('crossmatch_neighbor_forbidden_authority_field_hits must be 0');
  }
  if (metrics.source_ref_bucket_count <= 0) issues.push('source_ref_bucket_count must be positive');
  if (metrics.source_ref_bucket_source_cluster_buckets < metrics.source_ref_bucket_count) {
    issues.push('source_ref_bucket_source_cluster_buckets must be at least source_ref_bucket_count');
  }
  if (metrics.source_ref_bucket_occurrence_rows !== metrics.occurrence_link_rows) {
    issues.push('source_ref_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (metrics.source_ref_bucket_duplicate_source_ref_buckets <= 0) {
    issues.push('source_ref_bucket_duplicate_source_ref_buckets must be positive');
  }
  if (metrics.source_ref_bucket_duplicate_source_ref_rows <= metrics.source_ref_bucket_duplicate_source_ref_buckets) {
    issues.push('source_ref_bucket_duplicate_source_ref_rows must exceed duplicate buckets');
  }
  if (metrics.source_ref_bucket_cross_cluster_source_ref_buckets <= 0) {
    issues.push('source_ref_bucket_cross_cluster_source_ref_buckets must be positive');
  }
  if (metrics.source_ref_bucket_cross_cluster_source_ref_rows <= 0) {
    issues.push('source_ref_bucket_cross_cluster_source_ref_rows must be positive');
  }
  if (metrics.source_ref_bucket_route_ids <= 0) issues.push('source_ref_bucket_route_ids must be positive');
  if (metrics.source_ref_bucket_unresolved_route_ids !== 0) issues.push('source_ref_bucket_unresolved_route_ids must be 0');
  if (metrics.source_ref_bucket_reader_facing_rows !== 0) issues.push('source_ref_bucket_reader_facing_rows must be 0');
  if (metrics.source_ref_bucket_route_payload_field_hits !== 0) {
    issues.push('source_ref_bucket_route_payload_field_hits must be 0');
  }
  if (metrics.source_ref_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('source_ref_bucket_forbidden_authority_field_hits must be 0');
  }
  if (metrics.work_bucket_count <= 0) issues.push('work_bucket_count must be positive');
  if (metrics.work_bucket_work_frame_buckets < metrics.work_bucket_count) {
    issues.push('work_bucket_work_frame_buckets must be at least work_bucket_count');
  }
  if (metrics.work_bucket_occurrence_rows !== metrics.occurrence_link_rows) {
    issues.push('work_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (metrics.work_bucket_source_refs <= 0) issues.push('work_bucket_source_refs must be positive');
  if (metrics.work_bucket_multi_source_work_buckets <= 0) {
    issues.push('work_bucket_multi_source_work_buckets must be positive');
  }
  if (metrics.work_bucket_multi_source_work_rows <= metrics.work_bucket_multi_source_work_buckets) {
    issues.push('work_bucket_multi_source_work_rows must exceed multi-source buckets');
  }
  if (metrics.work_bucket_multi_frame_work_buckets <= 0) {
    issues.push('work_bucket_multi_frame_work_buckets must be positive');
  }
  if (metrics.work_bucket_multi_frame_work_rows <= metrics.work_bucket_multi_frame_work_buckets) {
    issues.push('work_bucket_multi_frame_work_rows must exceed multi-frame buckets');
  }
  if (metrics.work_bucket_route_ids <= 0) issues.push('work_bucket_route_ids must be positive');
  if (metrics.work_bucket_unresolved_route_ids !== 0) issues.push('work_bucket_unresolved_route_ids must be 0');
  if (metrics.work_bucket_reader_facing_rows !== 0) issues.push('work_bucket_reader_facing_rows must be 0');
  if (metrics.work_bucket_route_payload_field_hits !== 0) {
    issues.push('work_bucket_route_payload_field_hits must be 0');
  }
  if (metrics.work_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('work_bucket_forbidden_authority_field_hits must be 0');
  }
  if (metrics.provenance_bucket_count <= 0) issues.push('provenance_bucket_count must be positive');
  if (metrics.provenance_bucket_provenance_frame_buckets < metrics.provenance_bucket_count) {
    issues.push('provenance_bucket_provenance_frame_buckets must be at least provenance_bucket_count');
  }
  if (metrics.provenance_bucket_occurrence_rows !== metrics.occurrence_link_rows) {
    issues.push('provenance_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (metrics.provenance_bucket_work_count <= 0) issues.push('provenance_bucket_work_count must be positive');
  if (metrics.provenance_bucket_source_refs <= 0) issues.push('provenance_bucket_source_refs must be positive');
  if (metrics.provenance_bucket_license_count <= 1) {
    issues.push('provenance_bucket_license_count must show more than one license');
  }
  if (metrics.provenance_bucket_version_source_count <= 1) {
    issues.push('provenance_bucket_version_source_count must show more than one version source');
  }
  if (metrics.provenance_bucket_multi_work_buckets <= 0) {
    issues.push('provenance_bucket_multi_work_buckets must be positive');
  }
  if (metrics.provenance_bucket_multi_work_rows <= metrics.provenance_bucket_multi_work_buckets) {
    issues.push('provenance_bucket_multi_work_rows must exceed multi-work buckets');
  }
  if (metrics.provenance_bucket_multi_frame_buckets <= 0) {
    issues.push('provenance_bucket_multi_frame_buckets must be positive');
  }
  if (metrics.provenance_bucket_multi_frame_rows <= metrics.provenance_bucket_multi_frame_buckets) {
    issues.push('provenance_bucket_multi_frame_rows must exceed multi-frame buckets');
  }
  if (metrics.provenance_bucket_route_ids <= 0) issues.push('provenance_bucket_route_ids must be positive');
  if (metrics.provenance_bucket_unresolved_route_ids !== 0) issues.push('provenance_bucket_unresolved_route_ids must be 0');
  if (metrics.provenance_bucket_reader_facing_rows !== 0) issues.push('provenance_bucket_reader_facing_rows must be 0');
  if (metrics.provenance_bucket_route_payload_field_hits !== 0) {
    issues.push('provenance_bucket_route_payload_field_hits must be 0');
  }
  if (metrics.provenance_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('provenance_bucket_forbidden_authority_field_hits must be 0');
  }
  validateOccurrenceDetailMetrics(metrics, 'current_metrics');
  validateFacetIndexMetrics(metrics, 'current_metrics');
  validateContextTokenIndexMetrics(metrics, 'current_metrics');
  validateContextTokenLinkMetrics(metrics, 'current_metrics');
  validateContextTokenOccurrenceIndexMetrics(metrics, 'current_metrics');
  validateOccurrenceContextProfileMetrics(metrics, 'current_metrics');
  validateRouteDiversityProbeMetrics(metrics, 'current_metrics');
  validateRouteConcentrationGuardrailMetrics(metrics, 'current_metrics');
  validateRoutePointerAuditMetrics(metrics, 'current_metrics');
  validateSampleGapAuditMetrics(metrics, 'current_metrics');
  validateConsumerManifestMetrics(metrics, 'current_metrics');
  validatePlanningPacketMetrics(metrics, 'current_metrics');
  validatePublicHandoffMetrics(metrics, 'current_metrics');
  validateAnchorAuditMetrics(metrics, 'current_metrics');
  if (metrics.proof_occurrence_rows <= 0) issues.push('proof_occurrence_rows must be positive');
  if (metrics.proof_rows_with_complete_metadata !== metrics.proof_occurrence_rows) issues.push('proof metadata must be complete');
  if (metrics.proof_rows_with_hebrew_context !== metrics.proof_occurrence_rows) issues.push('proof Hebrew context rows must equal proof rows');
  if (metrics.proof_mojibake_rows !== 0) issues.push('proof_mojibake_rows must be 0');
  if (metrics.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (metrics.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (metrics.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (metrics.queue_required_fields_present !== metrics.queue_required_fields) issues.push('queue required fields must be complete');
  if (metrics.queue_evidence_artifacts_exist !== metrics.queue_evidence_artifacts) issues.push('queue evidence artifacts must be complete');
  if (metrics.smoke_steps <= 0) issues.push('smoke_steps must be positive');
  if (metrics.smoke_failed_steps !== 0) issues.push('smoke_failed_steps must be 0');
  if (metrics.smoke_source_freshness_status !== 'stale') {
    warnings.push(`smoke_source_freshness_status is ${metrics.smoke_source_freshness_status || 'missing'}`);
  }
}

function validateCounts(counts) {
  const required = [
    'evidence_artifacts',
    'evidence_artifacts_exist',
    'validator_scripts',
    'validator_scripts_exist',
    'queue_required_fields_present',
    'queue_required_fields',
    'queue_mutations',
    'submitted_to_agent6',
    'usage_concordance_rows',
    'usage_supported_rows',
    'usage_candidate_rows',
    'usage_weak_rows',
    'audit_only_ambiguous_rows',
    'occurrence_link_rows',
    'occurrence_link_rows_with_complete_metadata',
    'occurrence_link_reader_facing_rows',
    'occurrence_link_route_payload_field_hits',
    'occurrence_link_forbidden_authority_field_hits',
    'route_resolution_occurrence_route_rows',
    'route_resolution_route_ids',
    'route_resolution_resolved_route_ids',
    'route_resolution_unresolved_route_ids',
    'route_resolution_reader_facing_rows',
    'route_resolution_route_payload_field_hits',
    'route_resolution_forbidden_authority_field_hits',
    'crossmatch_neighbor_source_occurrence_rows',
    'crossmatch_neighbor_link_rows',
    'crossmatch_neighbor_same_frame_links',
    'crossmatch_neighbor_bridge_frame_links',
    'crossmatch_neighbor_route_ids',
    'crossmatch_neighbor_unresolved_route_ids',
    'crossmatch_neighbor_reader_facing_rows',
    'crossmatch_neighbor_route_payload_field_hits',
    'crossmatch_neighbor_forbidden_authority_field_hits',
    'source_ref_bucket_count',
    'source_ref_bucket_source_cluster_buckets',
    'source_ref_bucket_occurrence_rows',
    'source_ref_bucket_duplicate_source_ref_buckets',
    'source_ref_bucket_duplicate_source_ref_rows',
    'source_ref_bucket_cross_cluster_source_ref_buckets',
    'source_ref_bucket_cross_cluster_source_ref_rows',
    'source_ref_bucket_route_ids',
    'source_ref_bucket_unresolved_route_ids',
    'source_ref_bucket_reader_facing_rows',
    'source_ref_bucket_route_payload_field_hits',
    'source_ref_bucket_forbidden_authority_field_hits',
    'work_bucket_count',
    'work_bucket_work_frame_buckets',
    'work_bucket_occurrence_rows',
    'work_bucket_source_refs',
    'work_bucket_multi_source_work_buckets',
    'work_bucket_multi_source_work_rows',
    'work_bucket_multi_frame_work_buckets',
    'work_bucket_multi_frame_work_rows',
    'work_bucket_route_ids',
    'work_bucket_unresolved_route_ids',
    'work_bucket_reader_facing_rows',
    'work_bucket_route_payload_field_hits',
    'work_bucket_forbidden_authority_field_hits',
    'provenance_bucket_count',
    'provenance_bucket_provenance_frame_buckets',
    'provenance_bucket_occurrence_rows',
    'provenance_bucket_work_count',
    'provenance_bucket_source_refs',
    'provenance_bucket_license_count',
    'provenance_bucket_version_source_count',
    'provenance_bucket_multi_work_buckets',
    'provenance_bucket_multi_work_rows',
    'provenance_bucket_multi_frame_buckets',
    'provenance_bucket_multi_frame_rows',
    'provenance_bucket_route_ids',
    'provenance_bucket_unresolved_route_ids',
    'provenance_bucket_reader_facing_rows',
    'provenance_bucket_route_payload_field_hits',
    'provenance_bucket_forbidden_authority_field_hits',
    'occurrence_detail_rows',
    'occurrence_detail_source_refs',
    'occurrence_detail_works',
    'occurrence_detail_license_count',
    'occurrence_detail_version_source_count',
    'occurrence_detail_route_ids',
    'occurrence_detail_unresolved_route_ids',
    'occurrence_detail_rows_with_route_ids',
    'occurrence_detail_rows_with_source_link',
    'occurrence_detail_rows_with_work_anchor',
    'occurrence_detail_rows_with_hebrew_context',
    'occurrence_detail_rows_with_focus_marker',
    'occurrence_detail_rows_with_all_bucket_links',
    'occurrence_detail_neighbor_links',
    'occurrence_detail_same_frame_neighbor_links',
    'occurrence_detail_bridge_frame_neighbor_links',
    'occurrence_detail_observed_usage_only_rows',
    'occurrence_detail_reader_facing_rows',
    'occurrence_detail_route_payload_field_hits',
    'occurrence_detail_forbidden_authority_field_hits',
    'facet_index_occurrence_rows',
    'facet_index_facet_groups',
    'facet_index_facets_total',
    'facet_index_route_ids',
    'facet_index_max_route_share_basis_points',
    'facet_index_route_concentration_warning',
    'facet_index_rows_with_source_link',
    'facet_index_rows_with_work_anchor',
    'facet_index_rows_with_context',
    'facet_index_rows_with_focus_marker',
    'facet_index_rows_with_license',
    'facet_index_rows_with_version',
    'facet_index_rows_with_route_ids',
    'facet_index_reader_facing_rows',
    'facet_index_route_payload_field_hits',
    'facet_index_forbidden_authority_field_hits',
    'context_token_index_rows',
    'context_token_index_occurrence_rows',
    'context_token_index_occurrences',
    'context_token_index_cross_frame_rows',
    'context_token_index_repeated_focus_occurrences',
    'context_token_index_route_ids',
    'context_token_index_unresolved_route_ids',
    'context_token_index_route_concentration_warning',
    'context_token_index_rows_with_source_link',
    'context_token_index_rows_with_work_anchor',
    'context_token_index_rows_with_hebrew_context',
    'context_token_index_rows_with_focus_marker',
    'context_token_index_rows_with_license_metadata',
    'context_token_index_rows_with_version_metadata',
    'context_token_index_reader_facing_rows',
    'context_token_index_route_payload_field_hits',
    'context_token_index_forbidden_authority_field_hits',
    'context_token_link_rows',
    'context_token_link_context_tokens',
    'context_token_link_occurrence_rows',
    'context_token_link_focus_rows',
    'context_token_link_context_rows',
    'context_token_link_repeated_focus_rows',
    'context_token_link_cross_frame_rows',
    'context_token_link_route_ids',
    'context_token_link_unresolved_route_ids',
    'context_token_link_max_route_share_basis_points',
    'context_token_link_route_concentration_warning',
    'context_token_link_rows_with_source_link',
    'context_token_link_rows_with_work_anchor',
    'context_token_link_rows_with_hebrew_context',
    'context_token_link_rows_with_focus_marker',
    'context_token_link_rows_with_route_ids',
    'context_token_link_rows_with_license_metadata',
    'context_token_link_rows_with_version_metadata',
    'context_token_link_observed_usage_only_rows',
    'context_token_link_reader_facing_rows',
    'context_token_link_route_payload_field_hits',
    'context_token_link_forbidden_authority_field_hits',
    'context_token_occurrence_index_rows',
    'context_token_occurrence_index_link_rows',
    'context_token_occurrence_index_occurrence_rows',
    'context_token_occurrence_index_focus_rows',
    'context_token_occurrence_index_context_rows',
    'context_token_occurrence_index_repeated_focus_rows',
    'context_token_occurrence_index_cross_frame_rows',
    'context_token_occurrence_index_cross_frame_link_rows',
    'context_token_occurrence_index_route_ids',
    'context_token_occurrence_index_unresolved_route_ids',
    'context_token_occurrence_index_max_route_share_basis_points',
    'context_token_occurrence_index_route_concentration_warning',
    'context_token_occurrence_index_rows_with_source_link',
    'context_token_occurrence_index_rows_with_work_anchor',
    'context_token_occurrence_index_rows_with_hebrew_context',
    'context_token_occurrence_index_rows_with_focus_marker',
    'context_token_occurrence_index_rows_with_route_ids',
    'context_token_occurrence_index_rows_with_license_metadata',
    'context_token_occurrence_index_rows_with_version_metadata',
    'context_token_occurrence_index_reader_facing_rows',
    'context_token_occurrence_index_route_payload_field_hits',
    'context_token_occurrence_index_forbidden_authority_field_hits',
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
    'occurrence_context_profile_route_ids',
    'occurrence_context_profile_unresolved_route_ids',
    'occurrence_context_profile_max_route_share_basis_points',
    'occurrence_context_profile_route_concentration_warning',
    'occurrence_context_profile_rows_with_source_link',
    'occurrence_context_profile_rows_with_work_anchor',
    'occurrence_context_profile_rows_with_hebrew_context',
    'occurrence_context_profile_rows_with_focus_marker',
    'occurrence_context_profile_rows_with_route_ids',
    'occurrence_context_profile_rows_with_license_metadata',
    'occurrence_context_profile_rows_with_version_metadata',
    'occurrence_context_profile_reader_facing_rows',
    'occurrence_context_profile_route_payload_field_hits',
    'occurrence_context_profile_forbidden_authority_field_hits',
    'route_diversity_probe_occurrence_rows',
    'route_diversity_probe_route_ids',
    'route_diversity_probe_route_probe_rows',
    'route_diversity_probe_max_route_share_basis_points',
    'route_diversity_probe_concentration_warning',
    'route_diversity_probe_all_selected_rows_same_route',
    'route_diversity_probe_semantic_independence_claim_allowed',
    'route_diversity_probe_coverage_buckets_total',
    'route_diversity_probe_concentration_support_selected_occurrence_refs',
    'route_diversity_probe_concentration_support_unique_source_refs',
    'route_diversity_probe_concentration_support_unique_work_anchors',
    'route_diversity_probe_concentration_support_unique_works',
    'route_diversity_probe_concentration_support_unique_licenses',
    'route_diversity_probe_concentration_support_unique_version_sources',
    'route_diversity_probe_concentration_support_duplicate_source_ref_rows',
    'route_diversity_probe_concentration_support_missing_signature_rows',
    'route_diversity_probe_concentration_support_signature_memberships',
    'route_diversity_probe_concentration_support_recurring_signature_rows',
    'route_diversity_probe_concentration_support_cross_cluster_signature_rows',
    'route_diversity_probe_concentration_support_missing_lookup_rows',
    'route_diversity_probe_concentration_support_final_authority',
    'route_diversity_probe_concentration_support_semantic_independence_allowed',
    'route_diversity_probe_reader_facing_rows',
    'route_diversity_probe_route_payload_field_hits',
    'route_diversity_probe_forbidden_authority_field_hits',
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
    'sample_gap_audit_reader_facing_rows',
    'sample_gap_audit_route_payload_field_hits',
    'sample_gap_audit_forbidden_authority_field_hits',
    'consumer_manifest_entries',
    'consumer_manifest_data_artifacts_exist',
    'consumer_manifest_data_artifacts',
    'consumer_manifest_report_artifacts_exist',
    'consumer_manifest_report_artifacts',
    'consumer_manifest_validator_scripts_exist',
    'consumer_manifest_validator_scripts',
    'consumer_manifest_passed_entries',
    'consumer_manifest_occurrence_detail_rows',
    'consumer_manifest_occurrence_link_rows',
    'consumer_manifest_route_ids',
    'consumer_manifest_unresolved_route_ids',
    'consumer_manifest_reader_facing_rows',
    'consumer_manifest_route_payload_field_hits',
    'consumer_manifest_forbidden_authority_field_hits',
    'planning_packet_planning_rows',
    'planning_packet_occurrence_link_rows',
    'planning_packet_current_sample_rows_with_usage_links',
    'planning_packet_current_sample_usage_tokens_not_in_sample',
    'planning_packet_route_ids',
    'planning_packet_reader_facing_rows',
    'planning_packet_route_payload_field_hits',
    'planning_packet_forbidden_authority_field_hits',
    'planning_packet_summary_token_keys',
    'planning_packet_summary_occurrence_token_keys',
    'planning_packet_summary_supported_rows',
    'planning_packet_summary_candidate_rows',
    'planning_packet_summary_weak_rows',
    'planning_packet_summary_resolved_route_ids',
    'planning_packet_summary_unresolved_route_ids',
    'planning_packet_summary_source_refs',
    'planning_packet_summary_works',
    'planning_packet_summary_forbidden_use_items',
    'planning_packet_summary_qa_boundary_references',
    'planning_packet_summary_broad_coverage_claim_allowed',
    'planning_packet_summary_semantic_independence_claim_allowed',
    'public_handoff_selected_targets',
    'public_handoff_validation_passed',
    'public_handoff_validation_failed',
    'public_handoff_eligible_usage_rows',
    'public_handoff_count_only_ambiguous_rows',
    'public_handoff_zero_useful_targets',
    'public_handoff_supported_rows',
    'public_handoff_candidate_rows',
    'public_handoff_weak_rows',
    'public_handoff_ambiguous_rows',
    'public_handoff_downstream_consumable',
    'public_handoff_validation_passed_flag',
    'public_handoff_zero_useful_targets_blocked',
    'public_handoff_ambiguous_rows_audit_only',
    'public_handoff_license_policy_passed',
    'public_handoff_corpus_exhaustive',
    'public_handoff_artifact_source_files_scanned',
    'public_handoff_current_source_files',
    'public_handoff_source_count_delta',
    'public_handoff_files_modified_after_artifact',
    'public_handoff_files_created_after_artifact',
    'public_handoff_final_ranking_authority',
    'public_handoff_visible_answer_authority',
    'public_handoff_carries_text_rows',
    'public_handoff_warning_count',
    'anchor_audit_rows',
    'anchor_audit_existing_work_pages',
    'anchor_audit_existing_anchors',
    'anchor_audit_matching_source_refs',
    'anchor_audit_token_surfaces_in_page',
    'anchor_audit_focus_surfaces_in_page',
    'anchor_audit_rows_with_context',
    'anchor_audit_rows_with_focus_marker',
    'anchor_audit_rows_with_license',
    'anchor_audit_rows_with_version',
    'anchor_audit_rows_with_route_ids',
    'anchor_audit_reader_facing_rows',
    'anchor_audit_route_payload_field_hits',
    'anchor_audit_forbidden_authority_field_hits',
    'proof_occurrence_rows',
    'proof_rows_with_complete_metadata',
    'proof_rows_with_hebrew_context',
    'proof_mojibake_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'smoke_steps',
    'smoke_failed_steps',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.evidence_artifacts_exist !== counts.evidence_artifacts) issues.push('all evidence artifacts must exist');
  if (counts.validator_scripts_exist !== counts.validator_scripts) issues.push('all validator scripts must exist');
  if (counts.queue_required_fields_present !== counts.queue_required_fields) issues.push('queue required fields must be complete');
  if (counts.queue_mutations !== 0) issues.push('queue_mutations must be 0');
  if (counts.submitted_to_agent6 !== 0) issues.push('submitted_to_agent6 must be 0');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.occurrence_link_rows <= 0) issues.push('occurrence_link_rows must be positive');
  if (counts.occurrence_link_rows_with_complete_metadata !== counts.occurrence_link_rows) {
    issues.push('occurrence link metadata must be complete');
  }
  if (counts.occurrence_link_reader_facing_rows !== 0) issues.push('occurrence_link_reader_facing_rows must be 0');
  if (counts.occurrence_link_route_payload_field_hits !== 0) issues.push('occurrence_link_route_payload_field_hits must be 0');
  if (counts.occurrence_link_forbidden_authority_field_hits !== 0) {
    issues.push('occurrence_link_forbidden_authority_field_hits must be 0');
  }
  if (counts.route_resolution_occurrence_route_rows !== counts.occurrence_link_rows) {
    issues.push('route_resolution_occurrence_route_rows must equal occurrence_link_rows');
  }
  if (counts.route_resolution_route_ids <= 0) issues.push('route_resolution_route_ids must be positive');
  if (counts.route_resolution_resolved_route_ids !== counts.route_resolution_route_ids) {
    issues.push('route_resolution_resolved_route_ids must equal route_resolution_route_ids');
  }
  if (counts.route_resolution_unresolved_route_ids !== 0) issues.push('route_resolution_unresolved_route_ids must be 0');
  if (counts.route_resolution_reader_facing_rows !== 0) issues.push('route_resolution_reader_facing_rows must be 0');
  if (counts.route_resolution_route_payload_field_hits !== 0) {
    issues.push('route_resolution_route_payload_field_hits must be 0');
  }
  if (counts.route_resolution_forbidden_authority_field_hits !== 0) {
    issues.push('route_resolution_forbidden_authority_field_hits must be 0');
  }
  if (counts.crossmatch_neighbor_source_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('crossmatch_neighbor_source_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.crossmatch_neighbor_link_rows <= 0) issues.push('crossmatch_neighbor_link_rows must be positive');
  if (counts.crossmatch_neighbor_same_frame_links <= 0) issues.push('crossmatch_neighbor_same_frame_links must be positive');
  if (counts.crossmatch_neighbor_bridge_frame_links <= 0) issues.push('crossmatch_neighbor_bridge_frame_links must be positive');
  if (counts.crossmatch_neighbor_same_frame_links + counts.crossmatch_neighbor_bridge_frame_links !== counts.crossmatch_neighbor_link_rows) {
    issues.push('crossmatch neighbor same-frame plus bridge links must equal link rows');
  }
  if (counts.crossmatch_neighbor_route_ids <= 0) issues.push('crossmatch_neighbor_route_ids must be positive');
  if (counts.crossmatch_neighbor_unresolved_route_ids !== 0) issues.push('crossmatch_neighbor_unresolved_route_ids must be 0');
  if (counts.crossmatch_neighbor_reader_facing_rows !== 0) issues.push('crossmatch_neighbor_reader_facing_rows must be 0');
  if (counts.crossmatch_neighbor_route_payload_field_hits !== 0) {
    issues.push('crossmatch_neighbor_route_payload_field_hits must be 0');
  }
  if (counts.crossmatch_neighbor_forbidden_authority_field_hits !== 0) {
    issues.push('crossmatch_neighbor_forbidden_authority_field_hits must be 0');
  }
  if (counts.source_ref_bucket_count <= 0) issues.push('source_ref_bucket_count must be positive');
  if (counts.source_ref_bucket_source_cluster_buckets < counts.source_ref_bucket_count) {
    issues.push('source_ref_bucket_source_cluster_buckets must be at least source_ref_bucket_count');
  }
  if (counts.source_ref_bucket_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('source_ref_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.source_ref_bucket_duplicate_source_ref_buckets <= 0) {
    issues.push('source_ref_bucket_duplicate_source_ref_buckets must be positive');
  }
  if (counts.source_ref_bucket_duplicate_source_ref_rows <= counts.source_ref_bucket_duplicate_source_ref_buckets) {
    issues.push('source_ref_bucket_duplicate_source_ref_rows must exceed duplicate buckets');
  }
  if (counts.source_ref_bucket_cross_cluster_source_ref_buckets <= 0) {
    issues.push('source_ref_bucket_cross_cluster_source_ref_buckets must be positive');
  }
  if (counts.source_ref_bucket_cross_cluster_source_ref_rows <= 0) {
    issues.push('source_ref_bucket_cross_cluster_source_ref_rows must be positive');
  }
  if (counts.source_ref_bucket_route_ids <= 0) issues.push('source_ref_bucket_route_ids must be positive');
  if (counts.source_ref_bucket_unresolved_route_ids !== 0) issues.push('source_ref_bucket_unresolved_route_ids must be 0');
  if (counts.source_ref_bucket_reader_facing_rows !== 0) issues.push('source_ref_bucket_reader_facing_rows must be 0');
  if (counts.source_ref_bucket_route_payload_field_hits !== 0) {
    issues.push('source_ref_bucket_route_payload_field_hits must be 0');
  }
  if (counts.source_ref_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('source_ref_bucket_forbidden_authority_field_hits must be 0');
  }
  if (counts.work_bucket_count <= 0) issues.push('work_bucket_count must be positive');
  if (counts.work_bucket_work_frame_buckets < counts.work_bucket_count) {
    issues.push('work_bucket_work_frame_buckets must be at least work_bucket_count');
  }
  if (counts.work_bucket_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('work_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.work_bucket_source_refs <= 0) issues.push('work_bucket_source_refs must be positive');
  if (counts.work_bucket_multi_source_work_buckets <= 0) {
    issues.push('work_bucket_multi_source_work_buckets must be positive');
  }
  if (counts.work_bucket_multi_source_work_rows <= counts.work_bucket_multi_source_work_buckets) {
    issues.push('work_bucket_multi_source_work_rows must exceed multi-source buckets');
  }
  if (counts.work_bucket_multi_frame_work_buckets <= 0) {
    issues.push('work_bucket_multi_frame_work_buckets must be positive');
  }
  if (counts.work_bucket_multi_frame_work_rows <= counts.work_bucket_multi_frame_work_buckets) {
    issues.push('work_bucket_multi_frame_work_rows must exceed multi-frame buckets');
  }
  if (counts.work_bucket_route_ids <= 0) issues.push('work_bucket_route_ids must be positive');
  if (counts.work_bucket_unresolved_route_ids !== 0) issues.push('work_bucket_unresolved_route_ids must be 0');
  if (counts.work_bucket_reader_facing_rows !== 0) issues.push('work_bucket_reader_facing_rows must be 0');
  if (counts.work_bucket_route_payload_field_hits !== 0) {
    issues.push('work_bucket_route_payload_field_hits must be 0');
  }
  if (counts.work_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('work_bucket_forbidden_authority_field_hits must be 0');
  }
  if (counts.provenance_bucket_count <= 0) issues.push('provenance_bucket_count must be positive');
  if (counts.provenance_bucket_provenance_frame_buckets < counts.provenance_bucket_count) {
    issues.push('provenance_bucket_provenance_frame_buckets must be at least provenance_bucket_count');
  }
  if (counts.provenance_bucket_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('provenance_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.provenance_bucket_work_count <= 0) issues.push('provenance_bucket_work_count must be positive');
  if (counts.provenance_bucket_source_refs <= 0) issues.push('provenance_bucket_source_refs must be positive');
  if (counts.provenance_bucket_license_count <= 1) {
    issues.push('provenance_bucket_license_count must show more than one license');
  }
  if (counts.provenance_bucket_version_source_count <= 1) {
    issues.push('provenance_bucket_version_source_count must show more than one version source');
  }
  if (counts.provenance_bucket_multi_work_buckets <= 0) {
    issues.push('provenance_bucket_multi_work_buckets must be positive');
  }
  if (counts.provenance_bucket_multi_work_rows <= counts.provenance_bucket_multi_work_buckets) {
    issues.push('provenance_bucket_multi_work_rows must exceed multi-work buckets');
  }
  if (counts.provenance_bucket_multi_frame_buckets <= 0) {
    issues.push('provenance_bucket_multi_frame_buckets must be positive');
  }
  if (counts.provenance_bucket_multi_frame_rows <= counts.provenance_bucket_multi_frame_buckets) {
    issues.push('provenance_bucket_multi_frame_rows must exceed multi-frame buckets');
  }
  if (counts.provenance_bucket_route_ids <= 0) issues.push('provenance_bucket_route_ids must be positive');
  if (counts.provenance_bucket_unresolved_route_ids !== 0) issues.push('provenance_bucket_unresolved_route_ids must be 0');
  if (counts.provenance_bucket_reader_facing_rows !== 0) issues.push('provenance_bucket_reader_facing_rows must be 0');
  if (counts.provenance_bucket_route_payload_field_hits !== 0) {
    issues.push('provenance_bucket_route_payload_field_hits must be 0');
  }
  if (counts.provenance_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('provenance_bucket_forbidden_authority_field_hits must be 0');
  }
  validateOccurrenceDetailMetrics(counts, 'counts');
  validateFacetIndexMetrics(counts, 'counts');
  validateContextTokenIndexMetrics(counts, 'counts');
  validateContextTokenLinkMetrics(counts, 'counts');
  validateContextTokenOccurrenceIndexMetrics(counts, 'counts');
  validateOccurrenceContextProfileMetrics(counts, 'counts');
  validateRouteDiversityProbeMetrics(counts, 'counts');
  validateRouteConcentrationGuardrailMetrics(counts, 'counts');
  validateRoutePointerAuditMetrics(counts, 'counts');
  validateSampleGapAuditMetrics(counts, 'counts');
  validateConsumerManifestMetrics(counts, 'counts');
  validatePublicHandoffMetrics(counts, 'counts');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (counts.smoke_failed_steps !== 0) issues.push('smoke_failed_steps must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateOccurrenceDetailMetrics(metrics, prefix) {
  if (metrics.occurrence_detail_rows !== metrics.occurrence_link_rows) {
    issues.push(`${prefix}.occurrence_detail_rows must equal occurrence_link_rows`);
  }
  if (metrics.occurrence_detail_source_refs <= 0) issues.push(`${prefix}.occurrence_detail_source_refs must be positive`);
  if (metrics.occurrence_detail_works <= 0) issues.push(`${prefix}.occurrence_detail_works must be positive`);
  if (metrics.occurrence_detail_license_count <= 1) {
    issues.push(`${prefix}.occurrence_detail_license_count must show more than one license`);
  }
  if (metrics.occurrence_detail_version_source_count <= 1) {
    issues.push(`${prefix}.occurrence_detail_version_source_count must show more than one version source`);
  }
  if (metrics.occurrence_detail_route_ids <= 0) issues.push(`${prefix}.occurrence_detail_route_ids must be positive`);
  if (metrics.occurrence_detail_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.occurrence_detail_unresolved_route_ids must be 0`);
  }
  for (const key of [
    'occurrence_detail_rows_with_route_ids',
    'occurrence_detail_rows_with_source_link',
    'occurrence_detail_rows_with_work_anchor',
    'occurrence_detail_rows_with_hebrew_context',
    'occurrence_detail_rows_with_focus_marker',
    'occurrence_detail_rows_with_all_bucket_links',
    'occurrence_detail_observed_usage_only_rows',
  ]) {
    if (metrics[key] !== metrics.occurrence_detail_rows) issues.push(`${prefix}.${key} must equal occurrence_detail_rows`);
  }
  if (metrics.occurrence_detail_neighbor_links <= 0) issues.push(`${prefix}.occurrence_detail_neighbor_links must be positive`);
  if (metrics.occurrence_detail_same_frame_neighbor_links <= 0) {
    issues.push(`${prefix}.occurrence_detail_same_frame_neighbor_links must be positive`);
  }
  if (metrics.occurrence_detail_bridge_frame_neighbor_links <= 0) {
    issues.push(`${prefix}.occurrence_detail_bridge_frame_neighbor_links must be positive`);
  }
  if (metrics.occurrence_detail_same_frame_neighbor_links + metrics.occurrence_detail_bridge_frame_neighbor_links !== metrics.occurrence_detail_neighbor_links) {
    issues.push(`${prefix}.occurrence detail same-frame plus bridge links must equal neighbor links`);
  }
  if (metrics.occurrence_detail_reader_facing_rows !== 0) issues.push(`${prefix}.occurrence_detail_reader_facing_rows must be 0`);
  if (metrics.occurrence_detail_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.occurrence_detail_route_payload_field_hits must be 0`);
  }
  if (metrics.occurrence_detail_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.occurrence_detail_forbidden_authority_field_hits must be 0`);
  }
}

function validateFacetIndexMetrics(metrics, prefix) {
  if (metrics.facet_index_occurrence_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.facet_index_occurrence_rows must equal occurrence_detail_rows`);
  }
  if (metrics.facet_index_facet_groups !== 10) issues.push(`${prefix}.facet_index_facet_groups must be 10`);
  if (metrics.facet_index_facets_total <= 0) issues.push(`${prefix}.facet_index_facets_total must be positive`);
  if (metrics.facet_index_route_ids <= 0) issues.push(`${prefix}.facet_index_route_ids must be positive`);
  if (metrics.facet_index_max_route_share_basis_points !== 10000) {
    issues.push(`${prefix}.facet_index_max_route_share_basis_points must be 10000`);
  }
  if (metrics.facet_index_route_concentration_warning !== 1) {
    issues.push(`${prefix}.facet_index_route_concentration_warning must be 1`);
  }
  for (const key of [
    'facet_index_rows_with_source_link',
    'facet_index_rows_with_work_anchor',
    'facet_index_rows_with_context',
    'facet_index_rows_with_focus_marker',
    'facet_index_rows_with_license',
    'facet_index_rows_with_version',
    'facet_index_rows_with_route_ids',
  ]) {
    if (metrics[key] !== metrics.occurrence_detail_rows) issues.push(`${prefix}.${key} must equal occurrence_detail_rows`);
  }
  if (metrics.facet_index_reader_facing_rows !== 0) issues.push(`${prefix}.facet_index_reader_facing_rows must be 0`);
  if (metrics.facet_index_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.facet_index_route_payload_field_hits must be 0`);
  }
  if (metrics.facet_index_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.facet_index_forbidden_authority_field_hits must be 0`);
  }
}

function validateContextTokenIndexMetrics(metrics, prefix) {
  if (metrics.context_token_index_occurrence_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.context_token_index_occurrence_rows must equal occurrence_detail_rows`);
  }
  if (metrics.context_token_index_rows <= 0) {
    issues.push(`${prefix}.context_token_index_rows must be positive`);
  }
  if (metrics.context_token_index_occurrences <= metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.context_token_index_occurrences must exceed occurrence_detail_rows`);
  }
  if (metrics.context_token_index_cross_frame_rows <= 0) {
    issues.push(`${prefix}.context_token_index_cross_frame_rows must be positive`);
  }
  if (metrics.context_token_index_route_ids <= 0) {
    issues.push(`${prefix}.context_token_index_route_ids must be positive`);
  }
  if (metrics.context_token_index_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.context_token_index_unresolved_route_ids must be 0`);
  }
  if (metrics.context_token_index_route_concentration_warning !== 1) {
    issues.push(`${prefix}.context_token_index_route_concentration_warning must be 1`);
  }
  for (const key of [
    'context_token_index_rows_with_source_link',
    'context_token_index_rows_with_work_anchor',
    'context_token_index_rows_with_hebrew_context',
    'context_token_index_rows_with_focus_marker',
    'context_token_index_rows_with_license_metadata',
    'context_token_index_rows_with_version_metadata',
  ]) {
    if (metrics[key] !== metrics.occurrence_detail_rows) issues.push(`${prefix}.${key} must equal occurrence_detail_rows`);
  }
  if (metrics.context_token_index_reader_facing_rows !== 0) {
    issues.push(`${prefix}.context_token_index_reader_facing_rows must be 0`);
  }
  if (metrics.context_token_index_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.context_token_index_route_payload_field_hits must be 0`);
  }
  if (metrics.context_token_index_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.context_token_index_forbidden_authority_field_hits must be 0`);
  }
}

function validateContextTokenLinkMetrics(metrics, prefix) {
  if (metrics.context_token_link_rows !== metrics.context_token_link_focus_rows + metrics.context_token_link_context_rows) {
    issues.push(`${prefix}.context_token_link_rows must equal focus plus context link rows`);
  }
  if (metrics.context_token_link_context_rows !== metrics.context_token_index_occurrences) {
    issues.push(`${prefix}.context_token_link_context_rows must equal context_token_index_occurrences`);
  }
  if (metrics.context_token_link_context_tokens !== metrics.context_token_index_rows) {
    issues.push(`${prefix}.context_token_link_context_tokens must equal context_token_index_rows`);
  }
  if (metrics.context_token_link_occurrence_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.context_token_link_occurrence_rows must equal occurrence_detail_rows`);
  }
  if (metrics.context_token_link_focus_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.context_token_link_focus_rows must equal occurrence_detail_rows`);
  }
  if (metrics.context_token_link_context_rows <= metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.context_token_link_context_rows must exceed occurrence_detail_rows`);
  }
  if (metrics.context_token_link_repeated_focus_rows <= 0) {
    issues.push(`${prefix}.context_token_link_repeated_focus_rows must be positive`);
  }
  if (metrics.context_token_link_cross_frame_rows <= 0) {
    issues.push(`${prefix}.context_token_link_cross_frame_rows must be positive`);
  }
  if (metrics.context_token_link_route_ids <= 0) {
    issues.push(`${prefix}.context_token_link_route_ids must be positive`);
  }
  if (metrics.context_token_link_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.context_token_link_unresolved_route_ids must be 0`);
  }
  if (metrics.context_token_link_max_route_share_basis_points !== 10000) {
    issues.push(`${prefix}.context_token_link_max_route_share_basis_points must be 10000`);
  }
  if (metrics.context_token_link_route_concentration_warning !== 1) {
    issues.push(`${prefix}.context_token_link_route_concentration_warning must be 1`);
  }
  for (const key of [
    'context_token_link_rows_with_source_link',
    'context_token_link_rows_with_work_anchor',
    'context_token_link_rows_with_hebrew_context',
    'context_token_link_rows_with_focus_marker',
    'context_token_link_rows_with_route_ids',
    'context_token_link_rows_with_license_metadata',
    'context_token_link_rows_with_version_metadata',
    'context_token_link_observed_usage_only_rows',
  ]) {
    if (metrics[key] !== metrics.context_token_link_rows) issues.push(`${prefix}.${key} must equal context_token_link_rows`);
  }
  if (metrics.context_token_link_reader_facing_rows !== 0) {
    issues.push(`${prefix}.context_token_link_reader_facing_rows must be 0`);
  }
  if (metrics.context_token_link_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.context_token_link_route_payload_field_hits must be 0`);
  }
  if (metrics.context_token_link_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.context_token_link_forbidden_authority_field_hits must be 0`);
  }
}

function validateContextTokenOccurrenceIndexMetrics(metrics, prefix) {
  if (metrics.context_token_occurrence_index_rows !== metrics.context_token_link_context_tokens) {
    issues.push(`${prefix}.context_token_occurrence_index_rows must equal context_token_link_context_tokens`);
  }
  if (metrics.context_token_occurrence_index_link_rows !== metrics.context_token_link_rows) {
    issues.push(`${prefix}.context_token_occurrence_index_link_rows must equal context_token_link_rows`);
  }
  if (metrics.context_token_occurrence_index_occurrence_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.context_token_occurrence_index_occurrence_rows must equal occurrence_detail_rows`);
  }
  if (metrics.context_token_occurrence_index_focus_rows !== metrics.context_token_link_focus_rows) {
    issues.push(`${prefix}.context_token_occurrence_index_focus_rows must equal context_token_link_focus_rows`);
  }
  if (metrics.context_token_occurrence_index_context_rows !== metrics.context_token_link_context_rows) {
    issues.push(`${prefix}.context_token_occurrence_index_context_rows must equal context_token_link_context_rows`);
  }
  if (metrics.context_token_occurrence_index_repeated_focus_rows <= 0) {
    issues.push(`${prefix}.context_token_occurrence_index_repeated_focus_rows must be positive`);
  }
  if (metrics.context_token_occurrence_index_cross_frame_rows <= 0 || metrics.context_token_occurrence_index_cross_frame_link_rows <= 0) {
    issues.push(`${prefix}.context_token_occurrence_index cross-frame rows and links must be positive`);
  }
  if (metrics.context_token_occurrence_index_route_ids <= 0) {
    issues.push(`${prefix}.context_token_occurrence_index_route_ids must be positive`);
  }
  if (metrics.context_token_occurrence_index_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.context_token_occurrence_index_unresolved_route_ids must be 0`);
  }
  if (metrics.context_token_occurrence_index_max_route_share_basis_points !== 10000) {
    issues.push(`${prefix}.context_token_occurrence_index_max_route_share_basis_points must be 10000`);
  }
  if (metrics.context_token_occurrence_index_route_concentration_warning !== 1) {
    issues.push(`${prefix}.context_token_occurrence_index_route_concentration_warning must be 1`);
  }
  for (const key of [
    'context_token_occurrence_index_rows_with_source_link',
    'context_token_occurrence_index_rows_with_work_anchor',
    'context_token_occurrence_index_rows_with_hebrew_context',
    'context_token_occurrence_index_rows_with_focus_marker',
    'context_token_occurrence_index_rows_with_route_ids',
    'context_token_occurrence_index_rows_with_license_metadata',
    'context_token_occurrence_index_rows_with_version_metadata',
  ]) {
    if (metrics[key] !== metrics.context_token_occurrence_index_link_rows) {
      issues.push(`${prefix}.${key} must equal context_token_occurrence_index_link_rows`);
    }
  }
  if (metrics.context_token_occurrence_index_reader_facing_rows !== 0) {
    issues.push(`${prefix}.context_token_occurrence_index_reader_facing_rows must be 0`);
  }
  if (metrics.context_token_occurrence_index_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.context_token_occurrence_index_route_payload_field_hits must be 0`);
  }
  if (metrics.context_token_occurrence_index_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.context_token_occurrence_index_forbidden_authority_field_hits must be 0`);
  }
}

function validateOccurrenceContextProfileMetrics(metrics, prefix) {
  if (metrics.occurrence_context_profile_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.occurrence_context_profile_rows must equal occurrence_detail_rows`);
  }
  if (metrics.occurrence_context_profile_link_rows !== metrics.context_token_link_rows) {
    issues.push(`${prefix}.occurrence_context_profile_link_rows must equal context_token_link_rows`);
  }
  if (metrics.occurrence_context_profile_unique_context_tokens !== metrics.context_token_occurrence_index_rows) {
    issues.push(`${prefix}.occurrence_context_profile_unique_context_tokens must equal context_token_occurrence_index_rows`);
  }
  if (metrics.occurrence_context_profile_reverse_index_rows !== metrics.context_token_occurrence_index_rows) {
    issues.push(`${prefix}.occurrence_context_profile_reverse_index_rows must equal context_token_occurrence_index_rows`);
  }
  if (metrics.occurrence_context_profile_rows_with_reverse_index_ids !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.occurrence_context_profile_rows_with_reverse_index_ids must equal occurrence_detail_rows`);
  }
  if (metrics.occurrence_context_profile_rows_with_complete_reverse_index_mapping !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.occurrence_context_profile_rows_with_complete_reverse_index_mapping must equal occurrence_detail_rows`);
  }
  if (metrics.occurrence_context_profile_focus_rows !== metrics.context_token_link_focus_rows) {
    issues.push(`${prefix}.occurrence_context_profile_focus_rows must equal context_token_link_focus_rows`);
  }
  if (metrics.occurrence_context_profile_context_rows !== metrics.context_token_link_context_rows) {
    issues.push(`${prefix}.occurrence_context_profile_context_rows must equal context_token_link_context_rows`);
  }
  if (metrics.occurrence_context_profile_repeated_focus_rows <= 0) {
    issues.push(`${prefix}.occurrence_context_profile_repeated_focus_rows must be positive`);
  }
  if (metrics.occurrence_context_profile_cross_frame_rows <= 0) {
    issues.push(`${prefix}.occurrence_context_profile_cross_frame_rows must be positive`);
  }
  if (metrics.occurrence_context_profile_route_ids <= 0) {
    issues.push(`${prefix}.occurrence_context_profile_route_ids must be positive`);
  }
  if (metrics.occurrence_context_profile_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.occurrence_context_profile_unresolved_route_ids must be 0`);
  }
  if (metrics.occurrence_context_profile_max_route_share_basis_points !== 10000) {
    issues.push(`${prefix}.occurrence_context_profile_max_route_share_basis_points must be 10000`);
  }
  if (metrics.occurrence_context_profile_route_concentration_warning !== 1) {
    issues.push(`${prefix}.occurrence_context_profile_route_concentration_warning must be 1`);
  }
  for (const key of [
    'occurrence_context_profile_rows_with_source_link',
    'occurrence_context_profile_rows_with_work_anchor',
    'occurrence_context_profile_rows_with_hebrew_context',
    'occurrence_context_profile_rows_with_focus_marker',
    'occurrence_context_profile_rows_with_route_ids',
    'occurrence_context_profile_rows_with_license_metadata',
    'occurrence_context_profile_rows_with_version_metadata',
  ]) {
    if (metrics[key] !== metrics.occurrence_context_profile_rows) {
      issues.push(`${prefix}.${key} must equal occurrence_context_profile_rows`);
    }
  }
  if (metrics.occurrence_context_profile_reader_facing_rows !== 0) {
    issues.push(`${prefix}.occurrence_context_profile_reader_facing_rows must be 0`);
  }
  if (metrics.occurrence_context_profile_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.occurrence_context_profile_route_payload_field_hits must be 0`);
  }
  if (metrics.occurrence_context_profile_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.occurrence_context_profile_forbidden_authority_field_hits must be 0`);
  }
}

function validateRouteDiversityProbeMetrics(metrics, prefix) {
  if (metrics.route_diversity_probe_occurrence_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.route_diversity_probe_occurrence_rows must equal occurrence_detail_rows`);
  }
  if (metrics.route_diversity_probe_route_ids !== metrics.occurrence_detail_route_ids) {
    issues.push(`${prefix}.route_diversity_probe_route_ids must equal occurrence_detail_route_ids`);
  }
  if (metrics.route_diversity_probe_route_probe_rows !== metrics.route_diversity_probe_route_ids) {
    issues.push(`${prefix}.route_diversity_probe_route_probe_rows must equal route_diversity_probe_route_ids`);
  }
  if (metrics.route_diversity_probe_max_route_share_basis_points !== 10000) {
    issues.push(`${prefix}.route_diversity_probe_max_route_share_basis_points must be 10000`);
  }
  if (metrics.route_diversity_probe_concentration_warning !== 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_warning must be 1`);
  }
  if (metrics.route_diversity_probe_all_selected_rows_same_route !== 1) {
    issues.push(`${prefix}.route_diversity_probe_all_selected_rows_same_route must be 1`);
  }
  if (metrics.route_diversity_probe_semantic_independence_claim_allowed !== 0) {
    issues.push(`${prefix}.route_diversity_probe_semantic_independence_claim_allowed must be 0`);
  }
  if (metrics.route_diversity_probe_coverage_buckets_total <= 0) {
    issues.push(`${prefix}.route_diversity_probe_coverage_buckets_total must be positive`);
  }
  if (metrics.route_diversity_probe_concentration_support_selected_occurrence_refs !== metrics.route_diversity_probe_occurrence_rows) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_selected_occurrence_refs must equal route_diversity_probe_occurrence_rows`);
  }
  if (metrics.route_diversity_probe_concentration_support_unique_source_refs <= 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_unique_source_refs must show source diversity`);
  }
  if (metrics.route_diversity_probe_concentration_support_unique_work_anchors <= 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_unique_work_anchors must show work-anchor diversity`);
  }
  if (metrics.route_diversity_probe_concentration_support_unique_works <= 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_unique_works must show work diversity`);
  }
  if (metrics.route_diversity_probe_concentration_support_unique_licenses <= 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_unique_licenses must show license diversity`);
  }
  if (metrics.route_diversity_probe_concentration_support_unique_version_sources <= 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_unique_version_sources must show version-source diversity`);
  }
  if (metrics.route_diversity_probe_concentration_support_duplicate_source_ref_rows < 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_duplicate_source_ref_rows must be positive`);
  }
  if (metrics.route_diversity_probe_concentration_support_signature_memberships < metrics.route_diversity_probe_occurrence_rows) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_signature_memberships must cover selected occurrence rows`);
  }
  if (metrics.route_diversity_probe_concentration_support_recurring_signature_rows < 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_recurring_signature_rows must be positive`);
  }
  if (metrics.route_diversity_probe_concentration_support_cross_cluster_signature_rows < 1) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_cross_cluster_signature_rows must be positive`);
  }
  if (metrics.route_diversity_probe_concentration_support_missing_signature_rows !== 0) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_missing_signature_rows must be 0`);
  }
  if (metrics.route_diversity_probe_concentration_support_missing_lookup_rows !== 0) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_missing_lookup_rows must be 0`);
  }
  if (metrics.route_diversity_probe_concentration_support_final_authority !== 0) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_final_authority must be 0`);
  }
  if (metrics.route_diversity_probe_concentration_support_semantic_independence_allowed !== 0) {
    issues.push(`${prefix}.route_diversity_probe_concentration_support_semantic_independence_allowed must be 0`);
  }
  if (metrics.route_diversity_probe_reader_facing_rows !== 0) {
    issues.push(`${prefix}.route_diversity_probe_reader_facing_rows must be 0`);
  }
  if (metrics.route_diversity_probe_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.route_diversity_probe_route_payload_field_hits must be 0`);
  }
  if (metrics.route_diversity_probe_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.route_diversity_probe_forbidden_authority_field_hits must be 0`);
  }
}

function validateRouteConcentrationGuardrailMetrics(metrics, prefix) {
  if (metrics.route_concentration_guardrail_surfaces !== 7) {
    issues.push(`${prefix}.route_concentration_guardrail_surfaces must be 7`);
  }
  for (const key of [
    'route_concentration_guardrail_single_route_surfaces',
    'route_concentration_guardrail_max_share_surfaces',
    'route_concentration_guardrail_warning_surfaces',
  ]) {
    if (metrics[key] !== metrics.route_concentration_guardrail_surfaces) {
      issues.push(`${prefix}.${key} must equal route_concentration_guardrail_surfaces`);
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
    if (metrics[key] !== 0) issues.push(`${prefix}.${key} must be 0`);
  }
}

function validateRoutePointerAuditMetrics(metrics, prefix) {
  if (metrics.route_pointer_audit_rows !== 1) issues.push(`${prefix}.route_pointer_audit_rows must be 1`);
  if (metrics.route_pointer_audit_route_ids !== metrics.route_pointer_audit_rows) {
    issues.push(`${prefix}.route_pointer_audit_route_ids must equal route_pointer_audit_rows`);
  }
  if (metrics.route_pointer_audit_resolved_route_ids !== metrics.route_pointer_audit_route_ids) {
    issues.push(`${prefix}.route_pointer_audit_resolved_route_ids must equal route_pointer_audit_route_ids`);
  }
  if (metrics.route_pointer_audit_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.route_pointer_audit_unresolved_route_ids must be 0`);
  }
  if (metrics.route_pointer_audit_support_rows_with_pointer !== metrics.route_pointer_audit_support_rows) {
    issues.push(`${prefix}.route_pointer_audit_support_rows_with_pointer must equal route_pointer_audit_support_rows`);
  }
  if (metrics.route_pointer_audit_navigation_rows_with_pointer !== metrics.route_pointer_audit_navigation_rows) {
    issues.push(`${prefix}.route_pointer_audit_navigation_rows_with_pointer must equal route_pointer_audit_navigation_rows`);
  }
  if (metrics.route_pointer_audit_planning_rows_with_pointer !== metrics.route_pointer_audit_planning_rows) {
    issues.push(`${prefix}.route_pointer_audit_planning_rows_with_pointer must equal route_pointer_audit_planning_rows`);
  }
  for (const key of [
    'route_pointer_audit_reader_facing_rows',
    'route_pointer_audit_route_payload_field_hits',
    'route_pointer_audit_forbidden_authority_field_hits',
    'route_pointer_audit_route_metadata_field_hits',
  ]) {
    if (metrics[key] !== 0) issues.push(`${prefix}.${key} must be 0`);
  }
}

function validateSampleGapAuditMetrics(metrics, prefix) {
  if (metrics.sample_gap_audit_gap_rows <= 0) issues.push(`${prefix}.sample_gap_audit_gap_rows must be positive`);
  if (metrics.sample_gap_audit_sample_rows <= 0) issues.push(`${prefix}.sample_gap_audit_sample_rows must be positive`);
  if (metrics.sample_gap_audit_sample_rows_with_usage_links !== 0) {
    issues.push(`${prefix}.sample_gap_audit_sample_rows_with_usage_links must be 0 for current bounded gap audit`);
  }
  if (metrics.sample_gap_audit_usage_tokens_not_in_sample <= 0) {
    issues.push(`${prefix}.sample_gap_audit_usage_tokens_not_in_sample must be positive`);
  }
  if (metrics.sample_gap_audit_selected_occurrence_links <= 0) {
    issues.push(`${prefix}.sample_gap_audit_selected_occurrence_links must be positive`);
  }
  if (metrics.sample_gap_audit_route_ids !== metrics.occurrence_detail_route_ids) {
    issues.push(`${prefix}.sample_gap_audit_route_ids must equal occurrence_detail_route_ids`);
  }
  if (metrics.sample_gap_audit_sample_overlap_gap_visible !== 1) {
    issues.push(`${prefix}.sample_gap_audit_sample_overlap_gap_visible must be 1`);
  }
  if (metrics.sample_gap_audit_reader_facing_rows !== 0) {
    issues.push(`${prefix}.sample_gap_audit_reader_facing_rows must be 0`);
  }
  if (metrics.sample_gap_audit_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.sample_gap_audit_route_payload_field_hits must be 0`);
  }
  if (metrics.sample_gap_audit_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.sample_gap_audit_forbidden_authority_field_hits must be 0`);
  }
}

function validateConsumerManifestMetrics(metrics, prefix) {
  if (metrics.consumer_manifest_entries !== 16) issues.push(`${prefix}.consumer_manifest_entries must be 16`);
  if (metrics.consumer_manifest_data_artifacts_exist !== metrics.consumer_manifest_data_artifacts) {
    issues.push(`${prefix}.consumer_manifest all data artifacts must exist`);
  }
  if (metrics.consumer_manifest_report_artifacts_exist !== metrics.consumer_manifest_report_artifacts) {
    issues.push(`${prefix}.consumer_manifest all report artifacts must exist`);
  }
  if (metrics.consumer_manifest_validator_scripts_exist !== metrics.consumer_manifest_validator_scripts) {
    issues.push(`${prefix}.consumer_manifest all validator scripts must exist`);
  }
  if (metrics.consumer_manifest_passed_entries !== metrics.consumer_manifest_entries) {
    issues.push(`${prefix}.consumer_manifest_passed_entries must equal consumer_manifest_entries`);
  }
  if (metrics.consumer_manifest_occurrence_detail_rows !== metrics.occurrence_detail_rows) {
    issues.push(`${prefix}.consumer_manifest_occurrence_detail_rows must equal occurrence_detail_rows`);
  }
  if (metrics.consumer_manifest_occurrence_link_rows !== metrics.occurrence_link_rows) {
    issues.push(`${prefix}.consumer_manifest_occurrence_link_rows must equal occurrence_link_rows`);
  }
  if (metrics.consumer_manifest_route_ids <= 0) issues.push(`${prefix}.consumer_manifest_route_ids must be positive`);
  if (metrics.consumer_manifest_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.consumer_manifest_unresolved_route_ids must be 0`);
  }
  if (metrics.consumer_manifest_reader_facing_rows !== 0) {
    issues.push(`${prefix}.consumer_manifest_reader_facing_rows must be 0`);
  }
  if (metrics.consumer_manifest_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.consumer_manifest_route_payload_field_hits must be 0`);
  }
  if (metrics.consumer_manifest_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.consumer_manifest_forbidden_authority_field_hits must be 0`);
  }
}

function validatePlanningPacketMetrics(metrics, prefix) {
  if (metrics.planning_packet_planning_rows <= 0) {
    issues.push(`${prefix}.planning_packet_planning_rows must be positive`);
  }
  if (metrics.planning_packet_occurrence_link_rows !== metrics.occurrence_link_rows) {
    issues.push(`${prefix}.planning_packet_occurrence_link_rows must equal occurrence_link_rows`);
  }
  if (metrics.planning_packet_current_sample_rows_with_usage_links !== 0) {
    issues.push(`${prefix}.planning_packet_current_sample_rows_with_usage_links must be 0`);
  }
  if (metrics.planning_packet_current_sample_usage_tokens_not_in_sample <= 0) {
    issues.push(`${prefix}.planning_packet_current_sample_usage_tokens_not_in_sample must be positive`);
  }
  if (metrics.planning_packet_route_ids <= 0) {
    issues.push(`${prefix}.planning_packet_route_ids must be positive`);
  }
  if (metrics.planning_packet_reader_facing_rows !== 0) {
    issues.push(`${prefix}.planning_packet_reader_facing_rows must be 0`);
  }
  if (metrics.planning_packet_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.planning_packet_route_payload_field_hits must be 0`);
  }
  if (metrics.planning_packet_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.planning_packet_forbidden_authority_field_hits must be 0`);
  }
  if (metrics.planning_packet_summary_token_keys <= 0) {
    issues.push(`${prefix}.planning_packet_summary_token_keys must be positive`);
  }
  if (metrics.planning_packet_summary_occurrence_token_keys <= 0) {
    issues.push(`${prefix}.planning_packet_summary_occurrence_token_keys must be positive`);
  }
  if (metrics.planning_packet_summary_supported_rows + metrics.planning_packet_summary_candidate_rows + metrics.planning_packet_summary_weak_rows !== metrics.planning_packet_occurrence_link_rows) {
    issues.push(`${prefix}.planning_packet_summary supported/candidate/weak rows must sum to planning_packet_occurrence_link_rows`);
  }
  if (metrics.planning_packet_summary_resolved_route_ids !== metrics.planning_packet_route_ids) {
    issues.push(`${prefix}.planning_packet_summary_resolved_route_ids must equal planning_packet_route_ids`);
  }
  if (metrics.planning_packet_summary_unresolved_route_ids !== 0) {
    issues.push(`${prefix}.planning_packet_summary_unresolved_route_ids must be 0`);
  }
  if (metrics.planning_packet_summary_source_refs <= 0) {
    issues.push(`${prefix}.planning_packet_summary_source_refs must be positive`);
  }
  if (metrics.planning_packet_summary_works <= 0) {
    issues.push(`${prefix}.planning_packet_summary_works must be positive`);
  }
  if (metrics.planning_packet_summary_forbidden_use_items < 7) {
    issues.push(`${prefix}.planning_packet_summary_forbidden_use_items must be at least 7`);
  }
  if (metrics.planning_packet_summary_qa_boundary_references < 2) {
    issues.push(`${prefix}.planning_packet_summary_qa_boundary_references must be at least 2`);
  }
  if (metrics.planning_packet_summary_broad_coverage_claim_allowed !== 0) {
    issues.push(`${prefix}.planning_packet_summary_broad_coverage_claim_allowed must be 0`);
  }
  if (metrics.planning_packet_summary_semantic_independence_claim_allowed !== 0) {
    issues.push(`${prefix}.planning_packet_summary_semantic_independence_claim_allowed must be 0`);
  }
}

function validatePublicHandoffMetrics(metrics, prefix) {
  if (metrics.public_handoff_selected_targets <= 0) {
    issues.push(`${prefix}.public_handoff_selected_targets must be positive`);
  }
  if (metrics.public_handoff_validation_passed !== metrics.public_handoff_selected_targets) {
    issues.push(`${prefix}.public_handoff_validation_passed must equal public_handoff_selected_targets`);
  }
  if (metrics.public_handoff_validation_failed !== 0) {
    issues.push(`${prefix}.public_handoff_validation_failed must be 0`);
  }
  if (metrics.public_handoff_eligible_usage_rows !== metrics.usage_concordance_rows) {
    issues.push(`${prefix}.public_handoff_eligible_usage_rows must equal usage_concordance_rows`);
  }
  if (metrics.public_handoff_supported_rows + metrics.public_handoff_candidate_rows + metrics.public_handoff_weak_rows !== metrics.public_handoff_eligible_usage_rows) {
    issues.push(`${prefix}.public_handoff supported/candidate/weak rows must sum to eligible usage rows`);
  }
  if (metrics.public_handoff_count_only_ambiguous_rows !== metrics.audit_only_ambiguous_rows) {
    issues.push(`${prefix}.public_handoff_count_only_ambiguous_rows must equal audit_only_ambiguous_rows`);
  }
  if (metrics.public_handoff_ambiguous_rows !== metrics.public_handoff_count_only_ambiguous_rows) {
    issues.push(`${prefix}.public_handoff_ambiguous_rows must equal count-only ambiguous rows`);
  }
  if (metrics.public_handoff_zero_useful_targets !== 0) {
    issues.push(`${prefix}.public_handoff_zero_useful_targets must be 0`);
  }
  for (const key of [
    'public_handoff_downstream_consumable',
    'public_handoff_validation_passed_flag',
    'public_handoff_zero_useful_targets_blocked',
    'public_handoff_ambiguous_rows_audit_only',
    'public_handoff_license_policy_passed',
  ]) {
    if (metrics[key] !== 1) issues.push(`${prefix}.${key} must be 1`);
  }
  if (metrics.public_handoff_corpus_exhaustive !== 0) {
    issues.push(`${prefix}.public_handoff_corpus_exhaustive must be 0`);
  }
  if (metrics.public_handoff_source_freshness_status !== 'stale') {
    issues.push(`${prefix}.public_handoff_source_freshness_status must be stale`);
  }
  if (metrics.public_handoff_artifact_source_files_scanned <= 0) {
    issues.push(`${prefix}.public_handoff_artifact_source_files_scanned must be positive`);
  }
  if (metrics.public_handoff_current_source_files < metrics.public_handoff_artifact_source_files_scanned) {
    issues.push(`${prefix}.public_handoff_current_source_files must be >= artifact scan count`);
  }
  if (metrics.public_handoff_source_count_delta <= 0) {
    issues.push(`${prefix}.public_handoff_source_count_delta must be positive while stale`);
  }
  if (metrics.public_handoff_files_modified_after_artifact <= 0) {
    issues.push(`${prefix}.public_handoff_files_modified_after_artifact must be positive while stale`);
  }
  if (metrics.public_handoff_files_created_after_artifact <= 0) {
    issues.push(`${prefix}.public_handoff_files_created_after_artifact must be positive while stale`);
  }
  if (metrics.public_handoff_final_ranking_authority !== 0) {
    issues.push(`${prefix}.public_handoff_final_ranking_authority must be 0`);
  }
  if (metrics.public_handoff_visible_answer_authority !== 0) {
    issues.push(`${prefix}.public_handoff_visible_answer_authority must be 0`);
  }
  if (metrics.public_handoff_carries_text_rows !== 0) {
    issues.push(`${prefix}.public_handoff_carries_text_rows must be 0`);
  }
  if (metrics.public_handoff_warning_count <= 0) {
    issues.push(`${prefix}.public_handoff_warning_count must be positive`);
  }
}

function validateAnchorAuditMetrics(metrics, prefix) {
  if (metrics.anchor_audit_rows !== metrics.occurrence_link_rows) {
    issues.push(`${prefix}.anchor_audit_rows must equal occurrence_link_rows`);
  }
  for (const key of [
    'anchor_audit_existing_work_pages',
    'anchor_audit_existing_anchors',
    'anchor_audit_matching_source_refs',
    'anchor_audit_token_surfaces_in_page',
    'anchor_audit_focus_surfaces_in_page',
    'anchor_audit_rows_with_context',
    'anchor_audit_rows_with_focus_marker',
    'anchor_audit_rows_with_license',
    'anchor_audit_rows_with_version',
    'anchor_audit_rows_with_route_ids',
  ]) {
    if (metrics[key] !== metrics.anchor_audit_rows) issues.push(`${prefix}.${key} must equal anchor_audit_rows`);
  }
  if (metrics.anchor_audit_reader_facing_rows !== 0) {
    issues.push(`${prefix}.anchor_audit_reader_facing_rows must be 0`);
  }
  if (metrics.anchor_audit_route_payload_field_hits !== 0) {
    issues.push(`${prefix}.anchor_audit_route_payload_field_hits must be 0`);
  }
  if (metrics.anchor_audit_forbidden_authority_field_hits !== 0) {
    issues.push(`${prefix}.anchor_audit_forbidden_authority_field_hits must be 0`);
  }
}

function validateArtifacts(paths, fieldName) {
  if (!Array.isArray(paths) || paths.length === 0) {
    issues.push(`${fieldName} must be a non-empty array`);
    return;
  }
  for (const artifactPath of paths) {
    if (!fs.existsSync(path.join(root, artifactPath))) issues.push(`${fieldName} missing path: ${artifactPath}`);
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
