#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const handoffPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/usage-navigation-handoff-index.json');
const artifact = readJson(handoffPath);
const issues = [];
const forbiddenFieldNames = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'english',
  'english_text',
  'english_translation',
  'imported_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_links',
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_handoff_index') {
  issues.push('artifact_type must be workbench_usage_navigation_handoff_index');
}
if (!String(artifact.policy || '').includes('usage-navigation/concordance')) {
  issues.push('policy must identify the usage-navigation/concordance lane');
}
if (artifact.authority_policy?.usage_navigation_only !== true) issues.push('authority_policy.usage_navigation_only must be true');
if (artifact.authority_policy?.ranks_routes !== false) issues.push('authority_policy.ranks_routes must be false');
if (artifact.authority_policy?.selects_visible_result !== false) issues.push('authority_policy.selects_visible_result must be false');
if (artifact.authority_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('authority_policy.ambiguous_rows_reader_facing must be false');
}
if (artifact.consumer_boundary?.observed_usage_not_meaning_claim !== true) {
  issues.push('consumer_boundary.observed_usage_not_meaning_claim must be true');
}
if (artifact.consumer_boundary?.ambiguous_rows_reader_facing !== false) {
  issues.push('consumer_boundary.ambiguous_rows_reader_facing must be false');
}
if (artifact.consumer_boundary?.ranks_routes !== false) issues.push('consumer_boundary.ranks_routes must be false');
if (artifact.consumer_boundary?.selects_visible_result !== false) issues.push('consumer_boundary.selects_visible_result must be false');
if (artifact.consumer_boundary?.broad_target_expansion !== false) issues.push('consumer_boundary.broad_target_expansion must be false');

validateCounts();
validateArtifacts();
validateValidation();
validateCommands();
walkNoForbiddenFields(artifact, handoffPath);

if (issues.length) {
  console.error(`Workbench usage handoff index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage handoff index validation passed. Rows: ${artifact.counts.concordance_rows}. Clusters: ${artifact.counts.usage_clusters}.`);

function validateCounts() {
  for (const field of [
    'concordance_rows',
    'selected_manifests',
    'supported',
    'candidate',
    'weak',
    'audit_only_ambiguous',
    'audit_only_blocked',
    'route_linked_rows',
    'observed_only_rows',
    'usage_clusters',
    'unique_route_ids',
    'sample_rows',
    'lookup_occurrence_refs',
    'lookup_works',
    'work_frame_matrix_rows',
    'work_frame_matrix_works',
    'work_frame_matrix_categories',
    'work_frame_matrix_clusters',
    'work_frame_matrix_route_payload_field_hits',
    'search_rows',
    'search_rows_works',
    'search_rows_categories',
    'search_rows_clusters',
    'search_rows_route_payload_field_hits',
    'provenance_rows',
    'provenance_licenses',
    'provenance_version_sources',
    'provenance_works',
    'provenance_categories',
    'provenance_rows_with_license_metadata',
    'provenance_rows_with_source_links',
    'provenance_rows_with_version_metadata',
    'provenance_unsafe_license_rows',
    'provenance_route_payload_field_hits',
    'search_shard_index_shards',
    'search_shard_index_rows',
    'search_shard_index_categories',
    'search_shard_index_clusters',
    'search_shard_index_statuses',
    'search_shard_index_route_payload_field_hits',
    'refresh_priority_pending_files',
    'refresh_priority_known_usage_candidates',
    'refresh_priority_review_only_not_promoted',
    'refresh_priority_promoted_run_targets',
    'refresh_priority_blocked_broad_refresh_files',
    'refresh_priority_route_payload_field_hits',
    'unit_density_units',
    'unit_density_rows',
    'unit_density_multi_occurrence_units',
    'unit_density_max_occurrences_per_unit',
    'unit_density_works',
    'unit_density_route_payload_field_hits',
    'phrase_recurrence_rows',
    'phrase_recurrence_ngram_instances',
    'phrase_recurrence_groups_all',
    'phrase_recurrence_recurring_groups',
    'phrase_recurrence_rows_with_recurring_groups',
    'phrase_recurrence_max_occurrences_per_group',
    'phrase_recurrence_skipped_rows_without_focus',
    'phrase_recurrence_route_payload_field_hits',
    'context_offset_rows',
    'context_offset_rows_with_context',
    'context_offset_rows_with_context_tokens',
    'context_offset_token_observations',
    'context_offset_immediate_neighbor_observations',
    'context_offset_offsets',
    'context_offset_token_buckets',
    'context_offset_skipped_rows_without_focus',
    'context_offset_route_payload_field_hits',
    'context_signature_rows',
    'context_signature_rows_with_signatures',
    'context_signature_windows',
    'context_signature_groups_all',
    'context_signature_recurring_groups',
    'context_signature_rows_with_recurring_signatures',
    'context_signature_cross_cluster_groups',
    'context_signature_skipped_rows_without_focus',
    'context_signature_route_payload_field_hits',
    'context_signature_lookup_occurrence_refs',
    'context_signature_lookup_memberships',
    'context_signature_lookup_recurring_memberships',
    'context_signature_lookup_occurrences_with_recurring',
    'context_signature_lookup_cross_cluster_memberships',
    'context_signature_lookup_occurrences_with_cross_cluster',
    'context_signature_lookup_unmatched_occurrence_ids',
    'context_signature_lookup_route_payload_field_hits',
    'context_signature_contrast_groups',
    'context_signature_contrast_occurrence_refs',
    'context_signature_contrast_reader_facing_rows',
    'context_signature_contrast_route_payload_field_hits',
    'selected_slice_rows',
    'selected_slice_works',
    'selected_slices_index_slices',
    'selected_slices_index_rows',
    'selected_slices_index_unique_occurrences',
    'selected_slices_index_duplicate_rows',
    'selected_occurrence_rows',
    'selected_occurrence_memberships',
    'selected_occurrence_duplicate_memberships',
    'selected_signature_independence_rows',
    'selected_signature_independence_memberships',
    'selected_signature_independence_recurring_memberships',
    'selected_signature_independence_cross_cluster_memberships',
    'selected_signature_independence_rows_with_recurring',
    'selected_signature_independence_rows_with_cross_cluster',
    'selected_signature_independence_missing_lookup_rows',
    'selected_signature_independence_reader_facing_rows',
    'selected_signature_independence_route_payload_field_hits',
    'selected_source_diversity_rows',
    'selected_source_diversity_unique_source_refs',
    'selected_source_diversity_unique_work_anchors',
    'selected_source_diversity_unique_works',
    'selected_source_diversity_unique_categories',
    'selected_source_diversity_unique_licenses',
    'selected_source_diversity_unique_version_sources',
    'selected_source_diversity_duplicate_source_ref_buckets',
    'selected_source_diversity_duplicate_source_ref_rows',
    'selected_source_diversity_missing_signature_rows',
    'selected_source_diversity_reader_facing_rows',
    'selected_source_diversity_route_payload_field_hits',
    'selected_provenance_matrix_buckets',
    'selected_provenance_matrix_rows',
    'selected_provenance_matrix_licenses',
    'selected_provenance_matrix_version_sources',
    'selected_provenance_matrix_rows_with_license_metadata',
    'selected_provenance_matrix_rows_with_version_metadata',
    'selected_provenance_matrix_missing_or_unrecognized_license_rows',
    'selected_provenance_matrix_samples',
    'selected_provenance_matrix_reader_facing_rows',
    'selected_provenance_matrix_route_payload_field_hits',
    'selected_frame_provenance_matrix_rows',
    'selected_frame_provenance_matrix_selected_rows',
    'selected_frame_provenance_matrix_frames',
    'selected_frame_provenance_matrix_buckets',
    'selected_frame_provenance_matrix_missing_provenance_rows',
    'selected_frame_provenance_matrix_samples',
    'selected_frame_provenance_matrix_reader_facing_rows',
    'selected_frame_provenance_matrix_route_payload_field_hits',
    'selected_collision_audit_buckets',
    'selected_collision_audit_occurrence_rows',
    'selected_collision_audit_duplicate_source_ref_buckets',
    'selected_collision_audit_duplicate_source_ref_rows',
    'selected_collision_audit_duplicate_work_anchor_buckets',
    'selected_collision_audit_duplicate_work_anchor_rows',
    'selected_collision_audit_cross_frame_buckets',
    'selected_collision_audit_cross_frame_rows',
    'selected_collision_audit_reader_facing_rows',
    'selected_collision_audit_route_payload_field_hits',
    'selected_route_concentration_response_rows',
    'selected_route_concentration_response_route_buckets',
    'selected_route_concentration_response_warning_visible',
    'selected_route_concentration_response_unique_source_refs',
    'selected_route_concentration_response_unique_works',
    'selected_route_concentration_response_rows_with_recurring',
    'selected_route_concentration_response_rows_with_cross_cluster',
    'selected_route_concentration_response_reader_facing_rows',
    'selected_route_concentration_response_route_payload_field_hits',
    'selected_occurrence_cards_rows',
    'selected_occurrence_cards_with_context',
    'selected_occurrence_cards_with_focus_marker',
    'selected_occurrence_cards_with_related_signatures',
    'selected_occurrence_cards_with_cross_cluster_signatures',
    'selected_occurrence_cards_related_occurrence_samples',
    'selected_occurrence_cards_route_concentration_warning_visible',
    'selected_occurrence_cards_mojibake_rows',
    'selected_occurrence_cards_reader_facing_rows',
    'selected_occurrence_cards_route_payload_field_hits',
    'selected_route_resolution_route_id_buckets',
    'selected_route_resolution_selected_route_links',
    'selected_route_resolution_resolved_route_ids',
    'selected_route_resolution_unresolved_route_ids',
    'selected_route_resolution_reader_facing_rows',
    'selected_route_resolution_route_payload_copied_rows',
    'selected_route_resolution_route_payload_field_hits',
    'selected_route_provenance_audit_rows',
    'selected_route_provenance_audit_links',
    'selected_route_provenance_audit_buckets',
    'selected_route_provenance_audit_unresolved_route_rows',
    'selected_route_provenance_audit_missing_provenance_rows',
    'selected_route_provenance_audit_payload_copied_rows',
    'selected_route_provenance_audit_samples',
    'selected_route_provenance_audit_reader_facing_rows',
    'selected_route_provenance_audit_route_payload_field_hits',
    'selected_occurrence_navigation_rows',
    'selected_occurrence_navigation_source_refs',
    'selected_occurrence_navigation_work_anchors',
    'selected_occurrence_navigation_works',
    'selected_occurrence_navigation_frames',
    'selected_occurrence_navigation_route_ids',
    'selected_occurrence_navigation_provenance_buckets',
    'selected_occurrence_navigation_rows_with_source_link',
    'selected_occurrence_navigation_rows_with_work_anchor',
    'selected_occurrence_navigation_rows_with_hebrew_context',
    'selected_occurrence_navigation_rows_with_focus_marker',
    'selected_occurrence_navigation_rows_with_provenance',
    'selected_occurrence_navigation_collision_member_rows',
    'selected_occurrence_navigation_collision_memberships',
    'selected_occurrence_navigation_observed_usage_only_rows',
    'selected_occurrence_navigation_reader_facing_rows',
    'selected_occurrence_navigation_route_payload_field_hits',
    'selected_navigation_edge_rows',
    'selected_navigation_edge_source_occurrences',
    'selected_navigation_edge_target_occurrences',
    'selected_navigation_edge_source_refs',
    'selected_navigation_edge_works',
    'selected_navigation_edge_frames',
    'selected_navigation_edge_route_ids',
    'selected_navigation_edge_provenance_buckets',
    'selected_navigation_edge_same_frame_edges',
    'selected_navigation_edge_bridge_edges',
    'selected_navigation_edge_rows_with_source_context',
    'selected_navigation_edge_rows_with_target_context',
    'selected_navigation_edge_rows_with_source_link',
    'selected_navigation_edge_rows_with_target_link',
    'selected_navigation_edge_rows_with_source_provenance',
    'selected_navigation_edge_rows_with_target_provenance',
    'selected_navigation_edge_reader_facing_rows',
    'selected_navigation_edge_route_payload_field_hits',
    'selected_frame_bridge_rows',
    'selected_frame_bridge_edge_memberships',
    'selected_frame_bridge_same_frame_rows',
    'selected_frame_bridge_bridge_frame_rows',
    'selected_frame_bridge_same_frame_edges',
    'selected_frame_bridge_bridge_frame_edges',
    'selected_frame_bridge_route_ids',
    'selected_frame_bridge_provenance_buckets',
    'selected_frame_bridge_sample_rows',
    'selected_frame_bridge_sample_rows_with_links',
    'selected_frame_bridge_sample_rows_with_context',
    'selected_frame_bridge_reader_facing_rows',
    'selected_frame_bridge_route_payload_field_hits',
    'selected_occurrence_adjacency_rows',
    'selected_occurrence_adjacency_target_links',
    'selected_occurrence_adjacency_source_refs',
    'selected_occurrence_adjacency_works',
    'selected_occurrence_adjacency_frames',
    'selected_occurrence_adjacency_route_ids',
    'selected_occurrence_adjacency_provenance_buckets',
    'selected_occurrence_adjacency_same_frame_links',
    'selected_occurrence_adjacency_bridge_frame_links',
    'selected_occurrence_adjacency_rows_with_source_context',
    'selected_occurrence_adjacency_rows_with_source_link',
    'selected_occurrence_adjacency_rows_with_source_provenance',
    'selected_occurrence_adjacency_rows_with_complete_targets',
    'selected_occurrence_adjacency_target_links_with_context',
    'selected_occurrence_adjacency_target_links_with_source_link',
    'selected_occurrence_adjacency_target_links_with_provenance',
    'selected_occurrence_adjacency_reader_facing_rows',
    'selected_occurrence_adjacency_route_payload_field_hits',
    'selected_focus_context_audit_rows',
    'selected_focus_context_audit_focus_marker_rows',
    'selected_focus_context_audit_mismatch_rows',
    'selected_focus_context_audit_repeated_focus_rows',
    'selected_focus_context_audit_missing_hebrew_rows',
    'selected_focus_context_audit_reader_facing_rows',
    'selected_focus_context_audit_route_payload_field_hits',
    'selected_frame_summary_frames',
    'selected_frame_summary_rows',
    'selected_frame_summary_repeated_focus_rows',
    'selected_frame_summary_samples',
    'selected_frame_summary_reader_facing_rows',
    'selected_frame_summary_route_payload_field_hits',
    'selected_work_frame_matrix_rows',
    'selected_work_frame_matrix_selected_rows',
    'selected_work_frame_matrix_works',
    'selected_work_frame_matrix_frames',
    'selected_work_frame_matrix_samples',
    'selected_work_frame_matrix_reader_facing_rows',
    'selected_work_frame_matrix_route_payload_field_hits',
    'selected_qa_package_items',
    'selected_qa_package_selected_rows',
    'selected_qa_package_route_ids',
    'selected_qa_package_unresolved_route_ids',
    'selected_qa_package_route_concentration_warning_visible',
    'selected_qa_package_crossmatch_directed_edges',
    'selected_qa_package_crossmatch_bridge_edges',
    'selected_qa_package_reader_facing_rows',
    'selected_qa_package_route_payload_field_hits',
    'selected_qa_package_failed_checks',
    'selected_occurrence_lookup_work_buckets',
    'selected_occurrence_lookup_cluster_buckets',
    'selected_occurrence_lookup_status_buckets',
    'crossmatch_occurrence_refs',
    'crossmatch_directed_edges',
    'crossmatch_undirected_pairs',
    'crossmatch_strong_edges',
    'crossmatch_moderate_edges',
    'crossmatch_weak_edges',
    'crossmatch_route_payload_field_hits',
    'crossmatch_bridge_edges',
    'crossmatch_same_frame_edges',
    'crossmatch_bridge_buckets',
    'crossmatch_bridge_route_payload_field_hits',
    'crossmatch_neighborhoods',
    'crossmatch_neighborhood_same_frame_links',
    'crossmatch_neighborhood_bridge_links',
    'crossmatch_neighborhood_route_payload_field_hits',
    'agent6_boundary_checks',
    'agent6_boundary_failed_checks',
    'concentration_warnings',
    'concentration_failed_checks',
    'concentration_route_id_buckets',
    'concentration_cluster_buckets',
    'concentration_route_payload_field_hits',
  ]) {
    const value = Number(artifact.counts?.[field]);
    if (!Number.isInteger(value) || value < 0) issues.push(`counts.${field} must be a non-negative integer`);
  }
  const readerFacingRows = Number(artifact.counts?.supported || 0)
    + Number(artifact.counts?.candidate || 0)
    + Number(artifact.counts?.weak || 0);
  if (readerFacingRows !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('supported + candidate + weak must equal concordance_rows');
  }
  const routeStateRows = Number(artifact.counts?.route_linked_rows || 0)
    + Number(artifact.counts?.observed_only_rows || 0);
  if (routeStateRows !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('route_linked_rows + observed_only_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.selected_slices_index_unique_occurrences || 0) > Number(artifact.counts?.selected_slices_index_rows || 0)) {
    issues.push('selected_slices_index_unique_occurrences cannot exceed selected_slices_index_rows');
  }
  if (
    Number(artifact.counts?.selected_slices_index_rows || 0)
      - Number(artifact.counts?.selected_slices_index_unique_occurrences || 0)
    !== Number(artifact.counts?.selected_slices_index_duplicate_rows || 0)
  ) {
    issues.push('selected_slices_index_duplicate_rows must equal selected_slices_index_rows minus unique occurrences');
  }
  if (Number(artifact.counts?.selected_occurrence_rows || 0) !== Number(artifact.counts?.selected_slices_index_unique_occurrences || 0)) {
    issues.push('selected_occurrence_rows must equal selected_slices_index_unique_occurrences');
  }
  if (Number(artifact.counts?.selected_occurrence_memberships || 0) !== Number(artifact.counts?.selected_slices_index_rows || 0)) {
    issues.push('selected_occurrence_memberships must equal selected_slices_index_rows');
  }
  if (
    Number(artifact.counts?.selected_occurrence_memberships || 0)
      - Number(artifact.counts?.selected_occurrence_rows || 0)
    !== Number(artifact.counts?.selected_occurrence_duplicate_memberships || 0)
  ) {
    issues.push('selected_occurrence_duplicate_memberships must equal memberships minus occurrence rows');
  }
  if (Number(artifact.counts?.selected_signature_independence_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_signature_independence_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_signature_independence_memberships || 0) < Number(artifact.counts?.selected_signature_independence_rows || 0)) {
    issues.push('selected_signature_independence_memberships must be at least selected rows');
  }
  if (Number(artifact.counts?.selected_signature_independence_rows_with_recurring || 0) <= 0) {
    issues.push('selected_signature_independence_rows_with_recurring must be positive');
  }
  if (Number(artifact.counts?.selected_signature_independence_missing_lookup_rows || 0) !== 0) {
    issues.push('selected_signature_independence_missing_lookup_rows must be 0');
  }
  if (Number(artifact.counts?.selected_signature_independence_reader_facing_rows || 0) !== 0) {
    issues.push('selected_signature_independence_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_signature_independence_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_signature_independence_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_source_diversity_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_source_diversity_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0) <= 0) {
    issues.push('selected_source_diversity_unique_source_refs must be positive');
  }
  if (Number(artifact.counts?.selected_source_diversity_unique_work_anchors || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_source_diversity_unique_work_anchors must equal unique source refs for selected rows');
  }
  if (Number(artifact.counts?.selected_source_diversity_unique_works || 0) <= 0) {
    issues.push('selected_source_diversity_unique_works must be positive');
  }
  if (Number(artifact.counts?.selected_source_diversity_unique_licenses || 0) <= 0) {
    issues.push('selected_source_diversity_unique_licenses must be positive');
  }
  if (Number(artifact.counts?.selected_source_diversity_unique_version_sources || 0) <= 0) {
    issues.push('selected_source_diversity_unique_version_sources must be positive');
  }
  if (Number(artifact.counts?.selected_source_diversity_missing_signature_rows || 0) !== 0) {
    issues.push('selected_source_diversity_missing_signature_rows must be 0');
  }
  if (Number(artifact.counts?.selected_source_diversity_reader_facing_rows || 0) !== 0) {
    issues.push('selected_source_diversity_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_source_diversity_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_source_diversity_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_buckets || 0) <= 0) {
    issues.push('selected_provenance_matrix_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_licenses || 0) <= 0) {
    issues.push('selected_provenance_matrix_licenses must be positive');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_version_sources || 0) <= 0) {
    issues.push('selected_provenance_matrix_version_sources must be positive');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_rows_with_license_metadata || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_rows_with_license_metadata must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_rows_with_version_metadata || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_rows_with_version_metadata must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_missing_or_unrecognized_license_rows || 0) !== 0) {
    issues.push('selected_provenance_matrix_missing_or_unrecognized_license_rows must be 0');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_samples || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_samples must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_reader_facing_rows || 0) !== 0) {
    issues.push('selected_provenance_matrix_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_provenance_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_provenance_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_rows || 0) <= 0) {
    issues.push('selected_frame_provenance_matrix_rows must be positive');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_selected_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_frame_provenance_matrix_selected_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_frame_provenance_matrix_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_frame_provenance_matrix_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_missing_provenance_rows || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_missing_provenance_rows must be 0');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_samples || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_frame_provenance_matrix_samples must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_reader_facing_rows || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_frame_provenance_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_collision_audit_buckets || 0) <= 0) {
    issues.push('selected_collision_audit_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_collision_audit_occurrence_rows || 0) <= 0) {
    issues.push('selected_collision_audit_occurrence_rows must be positive');
  }
  if (Number(artifact.counts?.selected_collision_audit_duplicate_source_ref_buckets || 0) !== Number(artifact.counts?.selected_source_diversity_duplicate_source_ref_buckets || 0)) {
    issues.push('selected_collision_audit_duplicate_source_ref_buckets must equal selected_source_diversity_duplicate_source_ref_buckets');
  }
  if (Number(artifact.counts?.selected_collision_audit_duplicate_source_ref_rows || 0) !== Number(artifact.counts?.selected_source_diversity_duplicate_source_ref_rows || 0)) {
    issues.push('selected_collision_audit_duplicate_source_ref_rows must equal selected_source_diversity_duplicate_source_ref_rows');
  }
  if (Number(artifact.counts?.selected_collision_audit_duplicate_work_anchor_buckets || 0) <= 0) {
    issues.push('selected_collision_audit_duplicate_work_anchor_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_collision_audit_duplicate_work_anchor_rows || 0) <= 0) {
    issues.push('selected_collision_audit_duplicate_work_anchor_rows must be positive');
  }
  if (Number(artifact.counts?.selected_collision_audit_cross_frame_buckets || 0) <= 0) {
    issues.push('selected_collision_audit_cross_frame_buckets must be positive');
  }
  if (Number(artifact.counts?.selected_collision_audit_cross_frame_rows || 0) <= 0) {
    issues.push('selected_collision_audit_cross_frame_rows must be positive');
  }
  if (Number(artifact.counts?.selected_collision_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_collision_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_collision_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_collision_audit_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_route_concentration_response_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_route_buckets || 0) !== Number(artifact.counts?.concentration_route_id_buckets || 0)) {
    issues.push('selected_route_concentration_response_route_buckets must equal concentration_route_id_buckets');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_warning_visible || 0) !== 1) {
    issues.push('selected_route_concentration_response_warning_visible must be 1');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_unique_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_route_concentration_response_unique_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_unique_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_route_concentration_response_unique_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_rows_with_recurring || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_recurring || 0)) {
    issues.push('selected_route_concentration_response_rows_with_recurring must equal selected_signature_independence_rows_with_recurring');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_rows_with_cross_cluster || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_cross_cluster || 0)) {
    issues.push('selected_route_concentration_response_rows_with_cross_cluster must equal selected_signature_independence_rows_with_cross_cluster');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_reader_facing_rows || 0) !== 0) {
    issues.push('selected_route_concentration_response_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_concentration_response_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_route_concentration_response_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_cards_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_with_context || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_cards_with_context must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_with_focus_marker || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_cards_with_focus_marker must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_with_related_signatures || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_recurring || 0)) {
    issues.push('selected_occurrence_cards_with_related_signatures must equal selected_signature_independence_rows_with_recurring');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_with_cross_cluster_signatures || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_cross_cluster || 0)) {
    issues.push('selected_occurrence_cards_with_cross_cluster_signatures must equal selected_signature_independence_rows_with_cross_cluster');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_route_concentration_warning_visible || 0) !== 1) {
    issues.push('selected_occurrence_cards_route_concentration_warning_visible must be 1');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_mojibake_rows || 0) !== 0) {
    issues.push('selected_occurrence_cards_mojibake_rows must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_reader_facing_rows || 0) !== 0) {
    issues.push('selected_occurrence_cards_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_cards_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_occurrence_cards_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_route_resolution_route_id_buckets || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_route_resolution_route_id_buckets must equal unique_route_ids');
  }
  if (Number(artifact.counts?.selected_route_resolution_selected_route_links || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_route_resolution_selected_route_links must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_route_resolution_resolved_route_ids || 0) !== Number(artifact.counts?.selected_route_resolution_route_id_buckets || 0)) {
    issues.push('selected_route_resolution_resolved_route_ids must equal route_id_buckets');
  }
  if (Number(artifact.counts?.selected_route_resolution_unresolved_route_ids || 0) !== 0) {
    issues.push('selected_route_resolution_unresolved_route_ids must be 0');
  }
  if (artifact.counts?.selected_route_resolution_route_link_check_status !== 'passed') {
    issues.push('selected_route_resolution_route_link_check_status must be passed');
  }
  if (Number(artifact.counts?.selected_route_resolution_reader_facing_rows || 0) !== 0) {
    issues.push('selected_route_resolution_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_resolution_route_payload_copied_rows || 0) !== 0) {
    issues.push('selected_route_resolution_route_payload_copied_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_resolution_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_route_resolution_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_rows || 0) !== Number(artifact.counts?.selected_route_resolution_route_id_buckets || 0)) {
    issues.push('selected_route_provenance_audit_rows must equal selected_route_resolution_route_id_buckets');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_links || 0) !== Number(artifact.counts?.selected_route_resolution_selected_route_links || 0)) {
    issues.push('selected_route_provenance_audit_links must equal selected_route_resolution_selected_route_links');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_route_provenance_audit_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_unresolved_route_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_unresolved_route_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_missing_provenance_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_missing_provenance_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_payload_copied_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_payload_copied_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_samples || 0) !== Number(artifact.counts?.selected_route_resolution_selected_route_links || 0)) {
    issues.push('selected_route_provenance_audit_samples must equal selected_route_resolution_selected_route_links');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_route_provenance_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_route_provenance_audit_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_occurrence_navigation_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_work_anchors || 0) !== Number(artifact.counts?.selected_source_diversity_unique_work_anchors || 0)) {
    issues.push('selected_occurrence_navigation_work_anchors must equal selected_source_diversity_unique_work_anchors');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_occurrence_navigation_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_occurrence_navigation_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_occurrence_navigation_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_occurrence_navigation_provenance_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_rows_with_source_link || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_source_link must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_rows_with_work_anchor || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_work_anchor must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_rows_with_hebrew_context || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_hebrew_context must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_rows_with_focus_marker || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_focus_marker must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_rows_with_provenance || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_provenance must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_collision_member_rows || 0) <= 0) {
    issues.push('selected_occurrence_navigation_collision_member_rows must be positive');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_collision_memberships || 0) !== Number(artifact.counts?.selected_collision_audit_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_collision_memberships must equal selected_collision_audit_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_observed_usage_only_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_observed_usage_only_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_reader_facing_rows || 0) !== 0) {
    issues.push('selected_occurrence_navigation_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_navigation_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_occurrence_navigation_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('selected_navigation_edge_rows must equal crossmatch_directed_edges');
  }
  if (Number(artifact.counts?.selected_navigation_edge_source_occurrences || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_navigation_edge_source_occurrences must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_target_occurrences || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_navigation_edge_target_occurrences must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_navigation_edge_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.counts?.selected_navigation_edge_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_navigation_edge_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.counts?.selected_navigation_edge_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_navigation_edge_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.counts?.selected_navigation_edge_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_navigation_edge_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.counts?.selected_navigation_edge_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_navigation_edge_provenance_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.counts?.selected_navigation_edge_same_frame_edges || 0) + Number(artifact.counts?.selected_navigation_edge_bridge_edges || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_same_frame_edges + selected_navigation_edge_bridge_edges must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows_with_source_context || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_source_context must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows_with_target_context || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_target_context must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows_with_source_link || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_source_link must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows_with_target_link || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_target_link must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows_with_source_provenance || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_source_provenance must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_rows_with_target_provenance || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_target_provenance must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_navigation_edge_reader_facing_rows || 0) !== 0) {
    issues.push('selected_navigation_edge_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_navigation_edge_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_navigation_edge_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_frame_bridge_edge_memberships || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_frame_bridge_edge_memberships must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_frame_bridge_same_frame_edges || 0) !== Number(artifact.counts?.selected_navigation_edge_same_frame_edges || 0)) {
    issues.push('selected_frame_bridge_same_frame_edges must equal selected_navigation_edge_same_frame_edges');
  }
  if (Number(artifact.counts?.selected_frame_bridge_bridge_frame_edges || 0) !== Number(artifact.counts?.selected_navigation_edge_bridge_edges || 0)) {
    issues.push('selected_frame_bridge_bridge_frame_edges must equal selected_navigation_edge_bridge_edges');
  }
  if (Number(artifact.counts?.selected_frame_bridge_same_frame_rows || 0) <= 0) {
    issues.push('selected_frame_bridge_same_frame_rows must be positive');
  }
  if (Number(artifact.counts?.selected_frame_bridge_bridge_frame_rows || 0) <= 0) {
    issues.push('selected_frame_bridge_bridge_frame_rows must be positive');
  }
  if (Number(artifact.counts?.selected_frame_bridge_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_frame_bridge_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.counts?.selected_frame_bridge_sample_rows_with_links || 0) !== Number(artifact.counts?.selected_frame_bridge_sample_rows || 0)) {
    issues.push('selected_frame_bridge_sample_rows_with_links must equal selected_frame_bridge_sample_rows');
  }
  if (Number(artifact.counts?.selected_frame_bridge_sample_rows_with_context || 0) !== Number(artifact.counts?.selected_frame_bridge_sample_rows || 0)) {
    issues.push('selected_frame_bridge_sample_rows_with_context must equal selected_frame_bridge_sample_rows');
  }
  if (Number(artifact.counts?.selected_frame_bridge_reader_facing_rows || 0) !== 0) {
    issues.push('selected_frame_bridge_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_frame_bridge_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_frame_bridge_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_target_links || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_occurrence_adjacency_target_links must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_occurrence_adjacency_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_occurrence_adjacency_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_occurrence_adjacency_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_occurrence_adjacency_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_occurrence_adjacency_provenance_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_same_frame_links || 0) + Number(artifact.counts?.selected_occurrence_adjacency_bridge_frame_links || 0) !== Number(artifact.counts?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_same_frame_links + bridge_frame_links must equal target links');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_rows_with_source_context || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_source_context must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_rows_with_source_link || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_source_link must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_rows_with_source_provenance || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_source_provenance must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_rows_with_complete_targets || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_complete_targets must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_target_links_with_context || 0) !== Number(artifact.counts?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_target_links_with_context must equal selected_occurrence_adjacency_target_links');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_target_links_with_source_link || 0) !== Number(artifact.counts?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_target_links_with_source_link must equal selected_occurrence_adjacency_target_links');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_target_links_with_provenance || 0) !== Number(artifact.counts?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_target_links_with_provenance must equal selected_occurrence_adjacency_target_links');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_reader_facing_rows || 0) !== 0) {
    issues.push('selected_occurrence_adjacency_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_occurrence_adjacency_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_occurrence_adjacency_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_focus_context_audit_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_focus_marker_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_focus_context_audit_focus_marker_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_mismatch_rows || 0) !== 0) {
    issues.push('selected_focus_context_audit_mismatch_rows must be 0');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_repeated_focus_rows || 0) <= 0) {
    issues.push('selected_focus_context_audit_repeated_focus_rows must be positive');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_missing_hebrew_rows || 0) !== 0) {
    issues.push('selected_focus_context_audit_missing_hebrew_rows must be 0');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_focus_context_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_focus_context_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_focus_context_audit_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_frame_summary_frames || 0) <= 0) {
    issues.push('selected_frame_summary_frames must be positive');
  }
  if (Number(artifact.counts?.selected_frame_summary_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_frame_summary_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_frame_summary_repeated_focus_rows || 0) !== Number(artifact.counts?.selected_focus_context_audit_repeated_focus_rows || 0)) {
    issues.push('selected_frame_summary_repeated_focus_rows must equal selected_focus_context_audit_repeated_focus_rows');
  }
  if (Number(artifact.counts?.selected_frame_summary_samples || 0) < Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_frame_summary_samples must cover each frame');
  }
  if (Number(artifact.counts?.selected_frame_summary_reader_facing_rows || 0) !== 0) {
    issues.push('selected_frame_summary_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_frame_summary_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_frame_summary_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_rows || 0) <= 0) {
    issues.push('selected_work_frame_matrix_rows must be positive');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_selected_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_work_frame_matrix_selected_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_works || 0) <= 1) {
    issues.push('selected_work_frame_matrix_works must show multiple works');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_work_frame_matrix_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_samples || 0) < Number(artifact.counts?.selected_work_frame_matrix_rows || 0)) {
    issues.push('selected_work_frame_matrix_samples must cover each matrix row');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_reader_facing_rows || 0) !== 0) {
    issues.push('selected_work_frame_matrix_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_work_frame_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_work_frame_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_qa_package_items || 0) !== 21) {
    issues.push('selected_qa_package_items must be 21');
  }
  if (Number(artifact.counts?.selected_qa_package_selected_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_qa_package_selected_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.selected_qa_package_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_qa_package_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.counts?.selected_qa_package_unresolved_route_ids || 0) !== 0) {
    issues.push('selected_qa_package_unresolved_route_ids must be 0');
  }
  if (Number(artifact.counts?.selected_qa_package_route_concentration_warning_visible || 0) !== 1) {
    issues.push('selected_qa_package_route_concentration_warning_visible must be 1');
  }
  if (Number(artifact.counts?.selected_qa_package_crossmatch_directed_edges || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('selected_qa_package_crossmatch_directed_edges must equal crossmatch_directed_edges');
  }
  if (Number(artifact.counts?.selected_qa_package_crossmatch_bridge_edges || 0) !== Number(artifact.counts?.crossmatch_bridge_edges || 0)) {
    issues.push('selected_qa_package_crossmatch_bridge_edges must equal crossmatch_bridge_edges');
  }
  if (Number(artifact.counts?.selected_qa_package_reader_facing_rows || 0) !== 0) {
    issues.push('selected_qa_package_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.selected_qa_package_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_qa_package_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.selected_qa_package_failed_checks || 0) !== 0) {
    issues.push('selected_qa_package_failed_checks must be 0');
  }
  if (Number(artifact.counts?.crossmatch_occurrence_refs || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('crossmatch_occurrence_refs must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.work_frame_matrix_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('work_frame_matrix_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.work_frame_matrix_works || 0) !== Number(artifact.counts?.lookup_works || 0)) {
    issues.push('work_frame_matrix_works must equal lookup_works');
  }
  if (Number(artifact.counts?.work_frame_matrix_clusters || 0) !== Number(artifact.counts?.usage_clusters || 0)) {
    issues.push('work_frame_matrix_clusters must equal usage_clusters');
  }
  if (Number(artifact.counts?.work_frame_matrix_categories || 0) <= 0) {
    issues.push('work_frame_matrix_categories must be positive');
  }
  if (Number(artifact.counts?.work_frame_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('work_frame_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.search_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('search_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.search_rows_works || 0) !== Number(artifact.counts?.lookup_works || 0)) {
    issues.push('search_rows_works must equal lookup_works');
  }
  if (Number(artifact.counts?.search_rows_clusters || 0) !== Number(artifact.counts?.usage_clusters || 0)) {
    issues.push('search_rows_clusters must equal usage_clusters');
  }
  if (Number(artifact.counts?.search_rows_categories || 0) <= 0) {
    issues.push('search_rows_categories must be positive');
  }
  if (Number(artifact.counts?.search_rows_route_payload_field_hits || 0) !== 0) {
    issues.push('search_rows_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.provenance_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('provenance_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.provenance_licenses || 0) <= 0) {
    issues.push('provenance_licenses must be positive');
  }
  if (Number(artifact.counts?.provenance_version_sources || 0) <= 0) {
    issues.push('provenance_version_sources must be positive');
  }
  if (Number(artifact.counts?.provenance_works || 0) !== Number(artifact.counts?.lookup_works || 0)) {
    issues.push('provenance_works must equal lookup_works');
  }
  if (Number(artifact.counts?.provenance_categories || 0) !== Number(artifact.counts?.search_rows_categories || 0)) {
    issues.push('provenance_categories must equal search_rows_categories');
  }
  if (Number(artifact.counts?.provenance_rows_with_license_metadata || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('provenance_rows_with_license_metadata must equal concordance_rows');
  }
  if (Number(artifact.counts?.provenance_rows_with_source_links || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('provenance_rows_with_source_links must equal concordance_rows');
  }
  if (Number(artifact.counts?.provenance_rows_with_version_metadata || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('provenance_rows_with_version_metadata must equal concordance_rows');
  }
  if (Number(artifact.counts?.provenance_unsafe_license_rows || 0) !== 0) {
    issues.push('provenance_unsafe_license_rows must be 0');
  }
  if (Number(artifact.counts?.provenance_route_payload_field_hits || 0) !== 0) {
    issues.push('provenance_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.search_shard_index_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('search_shard_index_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.search_shard_index_categories || 0) !== Number(artifact.counts?.search_rows_categories || 0)) {
    issues.push('search_shard_index_categories must equal search_rows_categories');
  }
  if (Number(artifact.counts?.search_shard_index_clusters || 0) !== Number(artifact.counts?.usage_clusters || 0)) {
    issues.push('search_shard_index_clusters must equal usage_clusters');
  }
  if (Number(artifact.counts?.search_shard_index_statuses || 0) !== 3) {
    issues.push('search_shard_index_statuses must be 3');
  }
  if (Number(artifact.counts?.search_shard_index_shards || 0) <= 0) {
    issues.push('search_shard_index_shards must be positive');
  }
  if (Number(artifact.counts?.search_shard_index_route_payload_field_hits || 0) !== 0) {
    issues.push('search_shard_index_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.refresh_priority_pending_files || 0) !== Number(artifact.counts?.refresh_priority_blocked_broad_refresh_files || 0)) {
    issues.push('refresh_priority_pending_files must equal refresh_priority_blocked_broad_refresh_files');
  }
  if (Number(artifact.counts?.refresh_priority_promoted_run_targets || 0) !== 0) {
    issues.push('refresh_priority_promoted_run_targets must be 0');
  }
  if (
    Number(artifact.counts?.refresh_priority_known_usage_candidates || 0)
      + Number(artifact.counts?.refresh_priority_review_only_not_promoted || 0)
    !== Number(artifact.counts?.refresh_priority_pending_files || 0)
  ) {
    issues.push('refresh priority known + review-only counts must equal pending files');
  }
  if (Number(artifact.counts?.refresh_priority_route_payload_field_hits || 0) !== 0) {
    issues.push('refresh_priority_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.unit_density_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('unit_density_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.unit_density_units || 0) <= 0) {
    issues.push('unit_density_units must be positive');
  }
  if (Number(artifact.counts?.unit_density_multi_occurrence_units || 0) <= 0) {
    issues.push('unit_density_multi_occurrence_units must be positive');
  }
  if (Number(artifact.counts?.unit_density_max_occurrences_per_unit || 0) <= 1) {
    issues.push('unit_density_max_occurrences_per_unit must be greater than 1');
  }
  if (Number(artifact.counts?.unit_density_works || 0) !== Number(artifact.counts?.lookup_works || 0)) {
    issues.push('unit_density_works must equal lookup_works');
  }
  if (Number(artifact.counts?.unit_density_route_payload_field_hits || 0) !== 0) {
    issues.push('unit_density_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.phrase_recurrence_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('phrase_recurrence_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.phrase_recurrence_ngram_instances || 0) <= Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('phrase_recurrence_ngram_instances must exceed concordance_rows');
  }
  if (Number(artifact.counts?.phrase_recurrence_groups_all || 0) < Number(artifact.counts?.phrase_recurrence_recurring_groups || 0)) {
    issues.push('phrase_recurrence_groups_all must be >= recurring groups');
  }
  if (Number(artifact.counts?.phrase_recurrence_recurring_groups || 0) <= 0) {
    issues.push('phrase_recurrence_recurring_groups must be positive');
  }
  if (Number(artifact.counts?.phrase_recurrence_rows_with_recurring_groups || 0) <= 0) {
    issues.push('phrase_recurrence_rows_with_recurring_groups must be positive');
  }
  if (Number(artifact.counts?.phrase_recurrence_max_occurrences_per_group || 0) < 2) {
    issues.push('phrase_recurrence_max_occurrences_per_group must be >= 2');
  }
  if (Number(artifact.counts?.phrase_recurrence_skipped_rows_without_focus || 0) !== 0) {
    issues.push('phrase_recurrence_skipped_rows_without_focus must be 0');
  }
  if (Number(artifact.counts?.phrase_recurrence_route_payload_field_hits || 0) !== 0) {
    issues.push('phrase_recurrence_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.context_offset_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_offset_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.context_offset_rows_with_context || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_offset_rows_with_context must equal concordance_rows');
  }
  if (Number(artifact.counts?.context_offset_rows_with_context_tokens || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_offset_rows_with_context_tokens must equal concordance_rows');
  }
  if (Number(artifact.counts?.context_offset_token_observations || 0) <= Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_offset_token_observations must exceed concordance_rows');
  }
  if (Number(artifact.counts?.context_offset_immediate_neighbor_observations || 0) <= 0) {
    issues.push('context_offset_immediate_neighbor_observations must be positive');
  }
  if (Number(artifact.counts?.context_offset_offsets || 0) <= 0) {
    issues.push('context_offset_offsets must be positive');
  }
  if (Number(artifact.counts?.context_offset_token_buckets || 0) <= 0) {
    issues.push('context_offset_token_buckets must be positive');
  }
  if (Number(artifact.counts?.context_offset_skipped_rows_without_focus || 0) !== 0) {
    issues.push('context_offset_skipped_rows_without_focus must be 0');
  }
  if (Number(artifact.counts?.context_offset_route_payload_field_hits || 0) !== 0) {
    issues.push('context_offset_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.context_signature_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_rows must equal concordance_rows');
  }
  if (Number(artifact.counts?.context_signature_rows_with_signatures || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_rows_with_signatures must equal concordance_rows');
  }
  if (Number(artifact.counts?.context_signature_windows || 0) <= Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_windows must exceed concordance_rows');
  }
  if (Number(artifact.counts?.context_signature_groups_all || 0) <= 0) {
    issues.push('context_signature_groups_all must be positive');
  }
  if (Number(artifact.counts?.context_signature_groups_all || 0) < Number(artifact.counts?.context_signature_recurring_groups || 0)) {
    issues.push('context_signature_groups_all must be >= recurring groups');
  }
  if (Number(artifact.counts?.context_signature_recurring_groups || 0) <= 0) {
    issues.push('context_signature_recurring_groups must be positive');
  }
  if (Number(artifact.counts?.context_signature_rows_with_recurring_signatures || 0) <= 0) {
    issues.push('context_signature_rows_with_recurring_signatures must be positive');
  }
  if (Number(artifact.counts?.context_signature_skipped_rows_without_focus || 0) !== 0) {
    issues.push('context_signature_skipped_rows_without_focus must be 0');
  }
  if (Number(artifact.counts?.context_signature_route_payload_field_hits || 0) !== 0) {
    issues.push('context_signature_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.context_signature_lookup_occurrence_refs || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_lookup_occurrence_refs must equal concordance_rows');
  }
  if (Number(artifact.counts?.context_signature_lookup_memberships || 0) !== Number(artifact.counts?.context_signature_windows || 0)) {
    issues.push('context_signature_lookup_memberships must equal context_signature_windows');
  }
  if (Number(artifact.counts?.context_signature_lookup_recurring_memberships || 0) <= 0) {
    issues.push('context_signature_lookup_recurring_memberships must be positive');
  }
  if (Number(artifact.counts?.context_signature_lookup_occurrences_with_recurring || 0) !== Number(artifact.counts?.context_signature_rows_with_recurring_signatures || 0)) {
    issues.push('context_signature_lookup_occurrences_with_recurring must equal context_signature_rows_with_recurring_signatures');
  }
  if (Number(artifact.counts?.context_signature_lookup_unmatched_occurrence_ids || 0) !== 0) {
    issues.push('context_signature_lookup_unmatched_occurrence_ids must be 0');
  }
  if (Number(artifact.counts?.context_signature_lookup_route_payload_field_hits || 0) !== 0) {
    issues.push('context_signature_lookup_route_payload_field_hits must be 0');
  }
  if (Number(artifact.counts?.context_signature_contrast_groups || 0) !== Number(artifact.counts?.context_signature_cross_cluster_groups || 0)) {
    issues.push('context_signature_contrast_groups must equal context_signature_cross_cluster_groups');
  }
  if (Number(artifact.counts?.context_signature_contrast_occurrence_refs || 0) <= 0) {
    issues.push('context_signature_contrast_occurrence_refs must be positive');
  }
  if (Number(artifact.counts?.context_signature_contrast_reader_facing_rows || 0) !== 0) {
    issues.push('context_signature_contrast_reader_facing_rows must be 0');
  }
  if (Number(artifact.counts?.context_signature_contrast_route_payload_field_hits || 0) !== 0) {
    issues.push('context_signature_contrast_route_payload_field_hits must be 0');
  }
  const expectedDirectedEdges = Number(artifact.counts?.crossmatch_occurrence_refs || 0)
    * Math.max(0, Number(artifact.counts?.crossmatch_occurrence_refs || 0) - 1);
  if (Number(artifact.counts?.crossmatch_directed_edges || 0) !== expectedDirectedEdges) {
    issues.push('crossmatch_directed_edges must form a complete directed selected-occurrence graph');
  }
  if (Number(artifact.counts?.crossmatch_undirected_pairs || 0) !== expectedDirectedEdges / 2) {
    issues.push('crossmatch_undirected_pairs must equal crossmatch_directed_edges / 2');
  }
  const strengthRows = Number(artifact.counts?.crossmatch_strong_edges || 0)
    + Number(artifact.counts?.crossmatch_moderate_edges || 0)
    + Number(artifact.counts?.crossmatch_weak_edges || 0);
  if (strengthRows !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('crossmatch strength counts must equal crossmatch_directed_edges');
  }
  if (Number(artifact.counts?.crossmatch_bridge_edges || 0) + Number(artifact.counts?.crossmatch_same_frame_edges || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('crossmatch_bridge_edges + crossmatch_same_frame_edges must equal crossmatch_directed_edges');
  }
  if (Number(artifact.counts?.crossmatch_bridge_buckets || 0) <= 0) {
    issues.push('crossmatch_bridge_buckets must be positive');
  }
  if (Number(artifact.counts?.crossmatch_neighborhoods || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('crossmatch_neighborhoods must equal selected_occurrence_rows');
  }
  if (Number(artifact.counts?.crossmatch_neighborhood_same_frame_links || 0) !== Number(artifact.counts?.crossmatch_same_frame_edges || 0)) {
    issues.push('crossmatch_neighborhood_same_frame_links must equal crossmatch_same_frame_edges');
  }
  if (Number(artifact.counts?.crossmatch_neighborhood_bridge_links || 0) !== Number(artifact.counts?.crossmatch_bridge_edges || 0)) {
    issues.push('crossmatch_neighborhood_bridge_links must equal crossmatch_bridge_edges');
  }
}

function validateArtifacts() {
  for (const field of ['concordance_json', 'concordance_report', 'manifest']) {
    if (!String(artifact.artifacts?.[field]?.path || '').trim()) issues.push(`artifacts.${field}.path must be present`);
  }
  for (const field of [
    'occurrence_link_check_report',
    'route_link_check_report',
    'audit_only_review_report',
    'cluster_index_report',
    'route_coverage_report',
    'sample_index_report',
    'lookup_index_report',
    'work_frame_matrix_report',
    'search_rows_report',
    'provenance_index_report',
    'search_shard_index_report',
    'refresh_priority_index_report',
    'unit_density_index_report',
    'phrase_recurrence_index_report',
    'context_offset_index_report',
    'context_signature_index_report',
    'context_signature_lookup_report',
    'context_signature_contrast_report',
    'selected_slice_report',
    'selected_slices_index_report',
    'selected_occurrences_report',
    'selected_signature_independence_report',
    'selected_source_diversity_report',
    'selected_provenance_matrix_report',
    'selected_frame_provenance_matrix_report',
    'selected_collision_audit_report',
    'selected_collision_provenance_audit_report',
    'selected_route_concentration_response_report',
    'selected_occurrence_cards_report',
    'selected_route_resolution_report',
    'selected_route_provenance_audit_report',
    'selected_occurrence_navigation_index_report',
    'selected_navigation_edge_index_report',
    'selected_frame_bridge_index_report',
    'selected_occurrence_adjacency_index_report',
    'selected_focus_context_audit_report',
    'selected_frame_summary_report',
    'selected_work_frame_matrix_report',
    'selected_qa_package_report',
    'selected_occurrence_lookup_report',
    'crossmatch_links_report',
    'crossmatch_bridge_index_report',
    'crossmatch_neighborhoods_report',
    'agent6_boundary_packet_report',
    'concentration_packet_report',
    'smoke_validation_report',
  ]) {
    if (!String(artifact.artifacts?.[field] || '').trim()) issues.push(`artifacts.${field} must be present`);
  }
}

function validateValidation() {
  const allowedSmoke = new Set(['passed', 'failed', 'not_run', 'skipped_self_reference']);
  if (artifact.validation?.occurrence_link_check_status !== 'passed') {
    issues.push('validation.occurrence_link_check_status must be passed');
  }
  if (artifact.validation?.route_link_check_status !== 'passed') {
    issues.push('validation.route_link_check_status must be passed');
  }
  if (artifact.validation?.cluster_index_status !== 'present') issues.push('validation.cluster_index_status must be present');
  if (artifact.validation?.route_coverage_status !== 'present') issues.push('validation.route_coverage_status must be present');
  if (artifact.validation?.sample_index_status !== 'present') issues.push('validation.sample_index_status must be present');
  if (artifact.validation?.lookup_index_status !== 'present') issues.push('validation.lookup_index_status must be present');
  if (artifact.validation?.work_frame_matrix_status !== 'present') {
    issues.push('validation.work_frame_matrix_status must be present');
  }
  if (artifact.validation?.search_rows_status !== 'present') {
    issues.push('validation.search_rows_status must be present');
  }
  if (artifact.validation?.provenance_index_status !== 'present') {
    issues.push('validation.provenance_index_status must be present');
  }
  if (artifact.validation?.search_shard_index_status !== 'present') {
    issues.push('validation.search_shard_index_status must be present');
  }
  if (artifact.validation?.refresh_priority_index_status !== 'present') {
    issues.push('validation.refresh_priority_index_status must be present');
  }
  if (artifact.validation?.unit_density_index_status !== 'present') {
    issues.push('validation.unit_density_index_status must be present');
  }
  if (artifact.validation?.phrase_recurrence_index_status !== 'present') {
    issues.push('validation.phrase_recurrence_index_status must be present');
  }
  if (artifact.validation?.context_offset_index_status !== 'present') {
    issues.push('validation.context_offset_index_status must be present');
  }
  if (artifact.validation?.context_signature_index_status !== 'present') {
    issues.push('validation.context_signature_index_status must be present');
  }
  if (artifact.validation?.context_signature_lookup_status !== 'present') {
    issues.push('validation.context_signature_lookup_status must be present');
  }
  if (artifact.validation?.context_signature_contrast_status !== 'present') {
    issues.push('validation.context_signature_contrast_status must be present');
  }
  if (artifact.validation?.selected_slice_status !== 'present') issues.push('validation.selected_slice_status must be present');
  if (artifact.validation?.selected_slices_index_status !== 'present') issues.push('validation.selected_slices_index_status must be present');
  if (artifact.validation?.selected_occurrences_status !== 'present') issues.push('validation.selected_occurrences_status must be present');
  if (artifact.validation?.selected_signature_independence_status !== 'present') {
    issues.push('validation.selected_signature_independence_status must be present');
  }
  if (artifact.validation?.selected_source_diversity_status !== 'present') {
    issues.push('validation.selected_source_diversity_status must be present');
  }
  if (artifact.validation?.selected_provenance_matrix_status !== 'present') {
    issues.push('validation.selected_provenance_matrix_status must be present');
  }
  if (artifact.validation?.selected_frame_provenance_matrix_status !== 'present') {
    issues.push('validation.selected_frame_provenance_matrix_status must be present');
  }
  if (artifact.validation?.selected_collision_audit_status !== 'present') {
    issues.push('validation.selected_collision_audit_status must be present');
  }
  if (artifact.validation?.selected_collision_provenance_audit_status !== 'present') {
    issues.push('validation.selected_collision_provenance_audit_status must be present');
  }
  if (artifact.validation?.selected_route_concentration_response_status !== 'present') {
    issues.push('validation.selected_route_concentration_response_status must be present');
  }
  if (artifact.validation?.selected_occurrence_cards_status !== 'present') {
    issues.push('validation.selected_occurrence_cards_status must be present');
  }
  if (artifact.validation?.selected_route_resolution_status !== 'present') {
    issues.push('validation.selected_route_resolution_status must be present');
  }
  if (artifact.validation?.selected_route_provenance_audit_status !== 'present') {
    issues.push('validation.selected_route_provenance_audit_status must be present');
  }
  if (artifact.validation?.selected_focus_context_audit_status !== 'present') {
    issues.push('validation.selected_focus_context_audit_status must be present');
  }
  if (artifact.validation?.selected_frame_summary_status !== 'present') {
    issues.push('validation.selected_frame_summary_status must be present');
  }
  if (artifact.validation?.selected_work_frame_matrix_status !== 'present') {
    issues.push('validation.selected_work_frame_matrix_status must be present');
  }
  if (artifact.validation?.selected_qa_package_status !== 'present') {
    issues.push('validation.selected_qa_package_status must be present');
  }
  if (artifact.validation?.selected_occurrence_lookup_status !== 'present') {
    issues.push('validation.selected_occurrence_lookup_status must be present');
  }
  if (artifact.validation?.crossmatch_links_status !== 'present') {
    issues.push('validation.crossmatch_links_status must be present');
  }
  if (artifact.validation?.crossmatch_bridge_index_status !== 'present') {
    issues.push('validation.crossmatch_bridge_index_status must be present');
  }
  if (artifact.validation?.crossmatch_neighborhoods_status !== 'present') {
    issues.push('validation.crossmatch_neighborhoods_status must be present');
  }
  if (artifact.validation?.agent6_boundary_packet_status !== 'present') {
    issues.push('validation.agent6_boundary_packet_status must be present');
  }
  if (artifact.validation?.concentration_packet_status !== 'present') {
    issues.push('validation.concentration_packet_status must be present');
  }
  if (Number(artifact.validation?.occurrence_source_url_bad || 0) !== 0) issues.push('occurrence source URL issues must be 0');
  if (Number(artifact.validation?.occurrence_work_anchor_bad || 0) !== 0) issues.push('occurrence work anchor issues must be 0');
  if (Number(artifact.validation?.route_links_unresolved || 0) !== 0) issues.push('route_links_unresolved must be 0');
  if (Number(artifact.validation?.route_metadata_mismatches || 0) !== 0) issues.push('route_metadata_mismatches must be 0');
  if (artifact.validation?.audit_review_reader_facing !== false) issues.push('audit_review_reader_facing must be false');
  if (Number(artifact.validation?.route_coverage_links || 0) < Number(artifact.counts?.route_linked_rows || 0)) {
    issues.push('route_coverage_links must be at least route_linked_rows');
  }
  if (Number(artifact.validation?.sample_index_rows || 0) <= 0) issues.push('sample_index_rows must be positive');
  if (Number(artifact.validation?.lookup_index_occurrence_refs || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('lookup_index_occurrence_refs must equal concordance_rows');
  }
  if (Number(artifact.validation?.work_frame_matrix_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('work_frame_matrix_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.work_frame_matrix_works || 0) !== Number(artifact.counts?.work_frame_matrix_works || 0)) {
    issues.push('validation.work_frame_matrix_works must equal counts.work_frame_matrix_works');
  }
  if (Number(artifact.validation?.work_frame_matrix_categories || 0) !== Number(artifact.counts?.work_frame_matrix_categories || 0)) {
    issues.push('validation.work_frame_matrix_categories must equal counts.work_frame_matrix_categories');
  }
  if (Number(artifact.validation?.work_frame_matrix_failed_checks || 0) !== 0) {
    issues.push('work_frame_matrix_failed_checks must be 0');
  }
  if (Number(artifact.validation?.work_frame_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('work_frame_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.search_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('search_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.search_rows_works || 0) !== Number(artifact.counts?.search_rows_works || 0)) {
    issues.push('validation.search_rows_works must equal counts.search_rows_works');
  }
  if (Number(artifact.validation?.search_rows_categories || 0) !== Number(artifact.counts?.search_rows_categories || 0)) {
    issues.push('validation.search_rows_categories must equal counts.search_rows_categories');
  }
  if (Number(artifact.validation?.search_rows_failed_checks || 0) !== 0) {
    issues.push('search_rows_failed_checks must be 0');
  }
  if (Number(artifact.validation?.search_rows_route_payload_field_hits || 0) !== 0) {
    issues.push('search_rows_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.provenance_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('validation.provenance_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.provenance_licenses || 0) !== Number(artifact.counts?.provenance_licenses || 0)) {
    issues.push('validation.provenance_licenses must equal counts.provenance_licenses');
  }
  if (Number(artifact.validation?.provenance_version_sources || 0) !== Number(artifact.counts?.provenance_version_sources || 0)) {
    issues.push('validation.provenance_version_sources must equal counts.provenance_version_sources');
  }
  if (Number(artifact.validation?.provenance_rows_with_license_metadata || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('validation.provenance_rows_with_license_metadata must equal concordance_rows');
  }
  if (Number(artifact.validation?.provenance_rows_with_source_links || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('validation.provenance_rows_with_source_links must equal concordance_rows');
  }
  if (Number(artifact.validation?.provenance_rows_with_version_metadata || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('validation.provenance_rows_with_version_metadata must equal concordance_rows');
  }
  if (Number(artifact.validation?.provenance_unsafe_license_rows || 0) !== 0) {
    issues.push('validation.provenance_unsafe_license_rows must be 0');
  }
  if (Number(artifact.validation?.provenance_failed_checks || 0) !== 0) {
    issues.push('provenance_failed_checks must be 0');
  }
  if (Number(artifact.validation?.provenance_route_payload_field_hits || 0) !== 0) {
    issues.push('provenance_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.search_shard_index_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('search_shard_index_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.search_shard_index_shards || 0) !== Number(artifact.counts?.search_shard_index_shards || 0)) {
    issues.push('validation.search_shard_index_shards must equal counts.search_shard_index_shards');
  }
  if (Number(artifact.validation?.search_shard_index_failed_checks || 0) !== 0) {
    issues.push('search_shard_index_failed_checks must be 0');
  }
  if (Number(artifact.validation?.search_shard_index_route_payload_field_hits || 0) !== 0) {
    issues.push('search_shard_index_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.refresh_priority_pending_files || 0) !== Number(artifact.counts?.refresh_priority_pending_files || 0)) {
    issues.push('validation.refresh_priority_pending_files must equal counts.refresh_priority_pending_files');
  }
  if (Number(artifact.validation?.refresh_priority_promoted_run_targets || 0) !== 0) {
    issues.push('refresh_priority_promoted_run_targets must be 0');
  }
  if (Number(artifact.validation?.refresh_priority_failed_checks || 0) !== 0) {
    issues.push('refresh_priority_failed_checks must be 0');
  }
  if (Number(artifact.validation?.refresh_priority_route_payload_field_hits || 0) !== 0) {
    issues.push('refresh_priority_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.unit_density_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('unit_density_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.unit_density_units || 0) !== Number(artifact.counts?.unit_density_units || 0)) {
    issues.push('validation.unit_density_units must equal counts.unit_density_units');
  }
  if (Number(artifact.validation?.unit_density_multi_occurrence_units || 0) !== Number(artifact.counts?.unit_density_multi_occurrence_units || 0)) {
    issues.push('validation.unit_density_multi_occurrence_units must equal counts.unit_density_multi_occurrence_units');
  }
  if (Number(artifact.validation?.unit_density_failed_checks || 0) !== 0) {
    issues.push('unit_density_failed_checks must be 0');
  }
  if (Number(artifact.validation?.unit_density_route_payload_field_hits || 0) !== 0) {
    issues.push('unit_density_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.phrase_recurrence_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('phrase_recurrence_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.phrase_recurrence_ngram_instances || 0) !== Number(artifact.counts?.phrase_recurrence_ngram_instances || 0)) {
    issues.push('validation.phrase_recurrence_ngram_instances must equal counts.phrase_recurrence_ngram_instances');
  }
  if (Number(artifact.validation?.phrase_recurrence_recurring_groups || 0) !== Number(artifact.counts?.phrase_recurrence_recurring_groups || 0)) {
    issues.push('validation.phrase_recurrence_recurring_groups must equal counts.phrase_recurrence_recurring_groups');
  }
  if (Number(artifact.validation?.phrase_recurrence_rows_with_recurring_groups || 0) !== Number(artifact.counts?.phrase_recurrence_rows_with_recurring_groups || 0)) {
    issues.push('validation.phrase_recurrence_rows_with_recurring_groups must equal counts.phrase_recurrence_rows_with_recurring_groups');
  }
  if (Number(artifact.validation?.phrase_recurrence_skipped_rows_without_focus || 0) !== 0) {
    issues.push('phrase_recurrence_skipped_rows_without_focus must be 0');
  }
  if (Number(artifact.validation?.phrase_recurrence_failed_checks || 0) !== 0) {
    issues.push('phrase_recurrence_failed_checks must be 0');
  }
  if (Number(artifact.validation?.phrase_recurrence_route_payload_field_hits || 0) !== 0) {
    issues.push('phrase_recurrence_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.context_offset_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_offset_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.context_offset_rows_with_context || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_offset_rows_with_context must equal concordance_rows');
  }
  if (Number(artifact.validation?.context_offset_token_observations || 0) !== Number(artifact.counts?.context_offset_token_observations || 0)) {
    issues.push('validation.context_offset_token_observations must equal counts.context_offset_token_observations');
  }
  if (Number(artifact.validation?.context_offset_immediate_neighbor_observations || 0) !== Number(artifact.counts?.context_offset_immediate_neighbor_observations || 0)) {
    issues.push('validation.context_offset_immediate_neighbor_observations must equal counts.context_offset_immediate_neighbor_observations');
  }
  if (Number(artifact.validation?.context_offset_offsets || 0) !== Number(artifact.counts?.context_offset_offsets || 0)) {
    issues.push('validation.context_offset_offsets must equal counts.context_offset_offsets');
  }
  if (Number(artifact.validation?.context_offset_token_buckets || 0) !== Number(artifact.counts?.context_offset_token_buckets || 0)) {
    issues.push('validation.context_offset_token_buckets must equal counts.context_offset_token_buckets');
  }
  if (Number(artifact.validation?.context_offset_skipped_rows_without_focus || 0) !== 0) {
    issues.push('context_offset_skipped_rows_without_focus must be 0');
  }
  if (Number(artifact.validation?.context_offset_failed_checks || 0) !== 0) {
    issues.push('context_offset_failed_checks must be 0');
  }
  if (Number(artifact.validation?.context_offset_route_payload_field_hits || 0) !== 0) {
    issues.push('context_offset_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.context_signature_rows || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_rows must equal concordance_rows');
  }
  if (Number(artifact.validation?.context_signature_rows_with_signatures || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_rows_with_signatures must equal concordance_rows');
  }
  if (Number(artifact.validation?.context_signature_windows || 0) !== Number(artifact.counts?.context_signature_windows || 0)) {
    issues.push('validation.context_signature_windows must equal counts.context_signature_windows');
  }
  if (Number(artifact.validation?.context_signature_groups_all || 0) !== Number(artifact.counts?.context_signature_groups_all || 0)) {
    issues.push('validation.context_signature_groups_all must equal counts.context_signature_groups_all');
  }
  if (Number(artifact.validation?.context_signature_recurring_groups || 0) !== Number(artifact.counts?.context_signature_recurring_groups || 0)) {
    issues.push('validation.context_signature_recurring_groups must equal counts.context_signature_recurring_groups');
  }
  if (Number(artifact.validation?.context_signature_rows_with_recurring_signatures || 0) !== Number(artifact.counts?.context_signature_rows_with_recurring_signatures || 0)) {
    issues.push('validation.context_signature_rows_with_recurring_signatures must equal counts.context_signature_rows_with_recurring_signatures');
  }
  if (Number(artifact.validation?.context_signature_cross_cluster_groups || 0) !== Number(artifact.counts?.context_signature_cross_cluster_groups || 0)) {
    issues.push('validation.context_signature_cross_cluster_groups must equal counts.context_signature_cross_cluster_groups');
  }
  if (Number(artifact.validation?.context_signature_skipped_rows_without_focus || 0) !== 0) {
    issues.push('context_signature_skipped_rows_without_focus must be 0');
  }
  if (Number(artifact.validation?.context_signature_failed_checks || 0) !== 0) {
    issues.push('context_signature_failed_checks must be 0');
  }
  if (Number(artifact.validation?.context_signature_route_payload_field_hits || 0) !== 0) {
    issues.push('context_signature_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.context_signature_lookup_occurrence_refs || 0) !== Number(artifact.counts?.concordance_rows || 0)) {
    issues.push('context_signature_lookup_occurrence_refs must equal concordance_rows');
  }
  if (Number(artifact.validation?.context_signature_lookup_memberships || 0) !== Number(artifact.counts?.context_signature_windows || 0)) {
    issues.push('context_signature_lookup_memberships must equal context_signature_windows');
  }
  if (Number(artifact.validation?.context_signature_lookup_recurring_memberships || 0) !== Number(artifact.counts?.context_signature_lookup_recurring_memberships || 0)) {
    issues.push('validation.context_signature_lookup_recurring_memberships must equal count');
  }
  if (Number(artifact.validation?.context_signature_lookup_occurrences_with_recurring || 0) !== Number(artifact.counts?.context_signature_rows_with_recurring_signatures || 0)) {
    issues.push('context_signature_lookup_occurrences_with_recurring must equal context_signature_rows_with_recurring_signatures');
  }
  if (Number(artifact.validation?.context_signature_lookup_cross_cluster_memberships || 0) !== Number(artifact.counts?.context_signature_lookup_cross_cluster_memberships || 0)) {
    issues.push('validation.context_signature_lookup_cross_cluster_memberships must equal count');
  }
  if (Number(artifact.validation?.context_signature_lookup_occurrences_with_cross_cluster || 0) !== Number(artifact.counts?.context_signature_lookup_occurrences_with_cross_cluster || 0)) {
    issues.push('validation.context_signature_lookup_occurrences_with_cross_cluster must equal count');
  }
  if (Number(artifact.validation?.context_signature_lookup_unmatched_occurrence_ids || 0) !== 0) {
    issues.push('context_signature_lookup_unmatched_occurrence_ids must be 0');
  }
  if (Number(artifact.validation?.context_signature_lookup_failed_checks || 0) !== 0) {
    issues.push('context_signature_lookup_failed_checks must be 0');
  }
  if (Number(artifact.validation?.context_signature_lookup_route_payload_field_hits || 0) !== 0) {
    issues.push('context_signature_lookup_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.context_signature_contrast_groups || 0) !== Number(artifact.counts?.context_signature_contrast_groups || 0)) {
    issues.push('validation.context_signature_contrast_groups must equal count');
  }
  if (Number(artifact.validation?.context_signature_contrast_occurrence_refs || 0) !== Number(artifact.counts?.context_signature_contrast_occurrence_refs || 0)) {
    issues.push('validation.context_signature_contrast_occurrence_refs must equal count');
  }
  if (Number(artifact.validation?.context_signature_contrast_reader_facing_rows || 0) !== 0) {
    issues.push('context_signature_contrast_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.context_signature_contrast_failed_checks || 0) !== 0) {
    issues.push('context_signature_contrast_failed_checks must be 0');
  }
  if (Number(artifact.validation?.context_signature_contrast_route_payload_field_hits || 0) !== 0) {
    issues.push('context_signature_contrast_route_payload_field_hits must be 0');
  }
  if (!String(artifact.validation?.selected_slice_id || '').trim()) issues.push('selected_slice_id must be present');
  if (Number(artifact.validation?.selected_slice_rows || 0) <= 0) issues.push('selected_slice_rows must be positive');
  if (Number(artifact.validation?.selected_slices_index_slices || 0) <= 0) {
    issues.push('selected_slices_index_slices must be positive');
  }
  if (Number(artifact.validation?.selected_slices_index_unique_occurrences || 0) <= 0) {
    issues.push('selected_slices_index_unique_occurrences must be positive');
  }
  if (Number(artifact.validation?.selected_occurrence_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('validation.selected_occurrence_rows must equal counts.selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_signature_independence_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_signature_independence_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_signature_independence_memberships || 0) !== Number(artifact.counts?.selected_signature_independence_memberships || 0)) {
    issues.push('validation.selected_signature_independence_memberships must equal count');
  }
  if (Number(artifact.validation?.selected_signature_independence_recurring_memberships || 0) !== Number(artifact.counts?.selected_signature_independence_recurring_memberships || 0)) {
    issues.push('validation.selected_signature_independence_recurring_memberships must equal count');
  }
  if (Number(artifact.validation?.selected_signature_independence_cross_cluster_memberships || 0) !== Number(artifact.counts?.selected_signature_independence_cross_cluster_memberships || 0)) {
    issues.push('validation.selected_signature_independence_cross_cluster_memberships must equal count');
  }
  if (Number(artifact.validation?.selected_signature_independence_rows_with_recurring || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_recurring || 0)) {
    issues.push('validation.selected_signature_independence_rows_with_recurring must equal count');
  }
  if (Number(artifact.validation?.selected_signature_independence_rows_with_cross_cluster || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_cross_cluster || 0)) {
    issues.push('validation.selected_signature_independence_rows_with_cross_cluster must equal count');
  }
  if (Number(artifact.validation?.selected_signature_independence_missing_lookup_rows || 0) !== 0) {
    issues.push('selected_signature_independence_missing_lookup_rows must be 0');
  }
  if (Number(artifact.validation?.selected_signature_independence_reader_facing_rows || 0) !== 0) {
    issues.push('selected_signature_independence_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_signature_independence_failed_checks || 0) !== 0) {
    issues.push('selected_signature_independence_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_signature_independence_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_signature_independence_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_source_diversity_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_source_diversity_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_source_diversity_unique_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('validation.selected_source_diversity_unique_source_refs must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_unique_work_anchors || 0) !== Number(artifact.counts?.selected_source_diversity_unique_work_anchors || 0)) {
    issues.push('validation.selected_source_diversity_unique_work_anchors must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_unique_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('validation.selected_source_diversity_unique_works must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_unique_categories || 0) !== Number(artifact.counts?.selected_source_diversity_unique_categories || 0)) {
    issues.push('validation.selected_source_diversity_unique_categories must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_unique_licenses || 0) !== Number(artifact.counts?.selected_source_diversity_unique_licenses || 0)) {
    issues.push('validation.selected_source_diversity_unique_licenses must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_unique_version_sources || 0) !== Number(artifact.counts?.selected_source_diversity_unique_version_sources || 0)) {
    issues.push('validation.selected_source_diversity_unique_version_sources must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_duplicate_source_ref_buckets || 0) !== Number(artifact.counts?.selected_source_diversity_duplicate_source_ref_buckets || 0)) {
    issues.push('validation.selected_source_diversity_duplicate_source_ref_buckets must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_duplicate_source_ref_rows || 0) !== Number(artifact.counts?.selected_source_diversity_duplicate_source_ref_rows || 0)) {
    issues.push('validation.selected_source_diversity_duplicate_source_ref_rows must equal count');
  }
  if (Number(artifact.validation?.selected_source_diversity_missing_signature_rows || 0) !== 0) {
    issues.push('selected_source_diversity_missing_signature_rows must be 0');
  }
  if (Number(artifact.validation?.selected_source_diversity_reader_facing_rows || 0) !== 0) {
    issues.push('selected_source_diversity_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_source_diversity_failed_checks || 0) !== 0) {
    issues.push('selected_source_diversity_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_source_diversity_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_source_diversity_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_buckets || 0) <= 0) {
    issues.push('selected_provenance_matrix_buckets must be positive');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_licenses || 0) <= 0) {
    issues.push('selected_provenance_matrix_licenses must be positive');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_version_sources || 0) <= 0) {
    issues.push('selected_provenance_matrix_version_sources must be positive');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_rows_with_license_metadata || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_rows_with_license_metadata must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_rows_with_version_metadata || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_rows_with_version_metadata must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_missing_or_unrecognized_license_rows || 0) !== 0) {
    issues.push('selected_provenance_matrix_missing_or_unrecognized_license_rows must be 0');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_samples || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_provenance_matrix_samples must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_reader_facing_rows || 0) !== 0) {
    issues.push('selected_provenance_matrix_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_failed_checks || 0) !== 0) {
    issues.push('selected_provenance_matrix_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_warning_count || 0) !== 0) {
    issues.push('selected_provenance_matrix_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_provenance_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_provenance_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_rows || 0) <= 0) {
    issues.push('selected_frame_provenance_matrix_rows must be positive');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_selected_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_frame_provenance_matrix_selected_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_frame_provenance_matrix_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_frame_provenance_matrix_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_missing_provenance_rows || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_missing_provenance_rows must be 0');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_samples || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_frame_provenance_matrix_samples must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_reader_facing_rows || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_failed_checks || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_warning_count || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_frame_provenance_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_frame_provenance_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_collision_audit_buckets || 0) <= 0) {
    issues.push('selected_collision_audit_buckets must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_occurrence_rows || 0) <= 0) {
    issues.push('selected_collision_audit_occurrence_rows must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_duplicate_source_ref_buckets || 0) !== Number(artifact.counts?.selected_source_diversity_duplicate_source_ref_buckets || 0)) {
    issues.push('selected_collision_audit_duplicate_source_ref_buckets must equal selected_source_diversity_duplicate_source_ref_buckets');
  }
  if (Number(artifact.validation?.selected_collision_audit_duplicate_source_ref_rows || 0) !== Number(artifact.counts?.selected_source_diversity_duplicate_source_ref_rows || 0)) {
    issues.push('selected_collision_audit_duplicate_source_ref_rows must equal selected_source_diversity_duplicate_source_ref_rows');
  }
  if (Number(artifact.validation?.selected_collision_audit_duplicate_work_anchor_buckets || 0) <= 0) {
    issues.push('selected_collision_audit_duplicate_work_anchor_buckets must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_duplicate_work_anchor_rows || 0) <= 0) {
    issues.push('selected_collision_audit_duplicate_work_anchor_rows must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_cross_frame_buckets || 0) <= 0) {
    issues.push('selected_collision_audit_cross_frame_buckets must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_cross_frame_rows || 0) <= 0) {
    issues.push('selected_collision_audit_cross_frame_rows must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_collision_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_collision_audit_failed_checks || 0) !== 0) {
    issues.push('selected_collision_audit_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_collision_audit_warning_count || 0) <= 0) {
    issues.push('selected_collision_audit_warning_count must be positive');
  }
  if (Number(artifact.validation?.selected_collision_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_collision_audit_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_buckets || 0) !== Number(artifact.validation?.selected_collision_audit_buckets || 0)) {
    issues.push('selected_collision_provenance_audit_buckets must equal selected_collision_audit_buckets');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_occurrence_rows || 0) !== Number(artifact.validation?.selected_collision_audit_occurrence_rows || 0)) {
    issues.push('selected_collision_provenance_audit_occurrence_rows must equal selected_collision_audit_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_provenance_buckets || 0) <= 0) {
    issues.push('selected_collision_provenance_audit_provenance_buckets must be positive');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_frame_provenance_buckets || 0) <= 0) {
    issues.push('selected_collision_provenance_audit_frame_provenance_buckets must be positive');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_missing_provenance_rows || 0) !== 0) {
    issues.push('selected_collision_provenance_audit_missing_provenance_rows must be 0');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_missing_frame_provenance_rows || 0) !== 0) {
    issues.push('selected_collision_provenance_audit_missing_frame_provenance_rows must be 0');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_samples || 0) !== Number(artifact.validation?.selected_collision_audit_occurrence_rows || 0)) {
    issues.push('selected_collision_provenance_audit_samples must equal selected_collision_audit_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_collision_provenance_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_failed_checks || 0) !== 0) {
    issues.push('selected_collision_provenance_audit_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_warning_count || 0) <= 0) {
    issues.push('selected_collision_provenance_audit_warning_count must be positive');
  }
  if (Number(artifact.validation?.selected_collision_provenance_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_collision_provenance_audit_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_route_concentration_response_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_route_buckets || 0) !== Number(artifact.counts?.concentration_route_id_buckets || 0)) {
    issues.push('selected_route_concentration_response_route_buckets must equal concentration_route_id_buckets');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_warning_visible || 0) !== 1) {
    issues.push('selected_route_concentration_response_warning_visible must be 1');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_unique_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('validation.selected_route_concentration_response_unique_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_unique_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('validation.selected_route_concentration_response_unique_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_rows_with_recurring || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_recurring || 0)) {
    issues.push('selected_route_concentration_response_rows_with_recurring must equal selected_signature_independence_rows_with_recurring');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_rows_with_cross_cluster || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_cross_cluster || 0)) {
    issues.push('selected_route_concentration_response_rows_with_cross_cluster must equal selected_signature_independence_rows_with_cross_cluster');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_reader_facing_rows || 0) !== 0) {
    issues.push('selected_route_concentration_response_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_failed_checks || 0) !== 0) {
    issues.push('selected_route_concentration_response_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_warning_count || 0) <= 0) {
    issues.push('selected_route_concentration_response_warning_count must be positive');
  }
  if (Number(artifact.validation?.selected_route_concentration_response_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_route_concentration_response_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_cards_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_with_context || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_cards_with_context must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_with_focus_marker || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_cards_with_focus_marker must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_with_related_signatures || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_recurring || 0)) {
    issues.push('selected_occurrence_cards_with_related_signatures must equal selected_signature_independence_rows_with_recurring');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_with_cross_cluster_signatures || 0) !== Number(artifact.counts?.selected_signature_independence_rows_with_cross_cluster || 0)) {
    issues.push('selected_occurrence_cards_with_cross_cluster_signatures must equal selected_signature_independence_rows_with_cross_cluster');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_route_concentration_warning_visible || 0) !== 1) {
    issues.push('selected_occurrence_cards_route_concentration_warning_visible must be 1');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_mojibake_rows || 0) !== 0) {
    issues.push('selected_occurrence_cards_mojibake_rows must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_reader_facing_rows || 0) !== 0) {
    issues.push('selected_occurrence_cards_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_failed_checks || 0) !== 0) {
    issues.push('selected_occurrence_cards_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_warning_count || 0) <= 0) {
    issues.push('selected_occurrence_cards_warning_count must be positive');
  }
  if (Number(artifact.validation?.selected_occurrence_cards_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_occurrence_cards_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_route_resolution_route_id_buckets || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_route_resolution_route_id_buckets must equal unique_route_ids');
  }
  if (Number(artifact.validation?.selected_route_resolution_selected_route_links || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_route_resolution_selected_route_links must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_route_resolution_resolved_route_ids || 0) !== Number(artifact.validation?.selected_route_resolution_route_id_buckets || 0)) {
    issues.push('selected_route_resolution_resolved_route_ids must equal route_id_buckets');
  }
  if (Number(artifact.validation?.selected_route_resolution_unresolved_route_ids || 0) !== 0) {
    issues.push('selected_route_resolution_unresolved_route_ids must be 0');
  }
  if (artifact.validation?.selected_route_resolution_route_link_check_status !== 'passed') {
    issues.push('selected_route_resolution_route_link_check_status must be passed');
  }
  if (Number(artifact.validation?.selected_route_resolution_reader_facing_rows || 0) !== 0) {
    issues.push('selected_route_resolution_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_resolution_failed_checks || 0) !== 0) {
    issues.push('selected_route_resolution_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_route_resolution_warning_count || 0) !== 0) {
    issues.push('selected_route_resolution_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_route_resolution_route_payload_copied_rows || 0) !== 0) {
    issues.push('selected_route_resolution_route_payload_copied_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_resolution_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_route_resolution_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_rows || 0) !== Number(artifact.counts?.selected_route_resolution_route_id_buckets || 0)) {
    issues.push('selected_route_provenance_audit_rows must equal selected_route_resolution_route_id_buckets');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_links || 0) !== Number(artifact.counts?.selected_route_resolution_selected_route_links || 0)) {
    issues.push('selected_route_provenance_audit_links must equal selected_route_resolution_selected_route_links');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_route_provenance_audit_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_unresolved_route_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_unresolved_route_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_missing_provenance_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_missing_provenance_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_payload_copied_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_payload_copied_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_samples || 0) !== Number(artifact.counts?.selected_route_resolution_selected_route_links || 0)) {
    issues.push('selected_route_provenance_audit_samples must equal selected_route_resolution_selected_route_links');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_route_provenance_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_failed_checks || 0) !== 0) {
    issues.push('selected_route_provenance_audit_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_warning_count || 0) !== 0) {
    issues.push('selected_route_provenance_audit_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_route_provenance_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_route_provenance_audit_route_payload_field_hits must be 0');
  }
  if (artifact.validation?.selected_occurrence_navigation_index_status !== 'present') {
    issues.push('selected_occurrence_navigation_index_status must be present');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_occurrence_navigation_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_work_anchors || 0) !== Number(artifact.counts?.selected_source_diversity_unique_work_anchors || 0)) {
    issues.push('selected_occurrence_navigation_work_anchors must equal selected_source_diversity_unique_work_anchors');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_occurrence_navigation_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_occurrence_navigation_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_occurrence_navigation_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_occurrence_navigation_provenance_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_rows_with_source_link || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_source_link must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_rows_with_work_anchor || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_work_anchor must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_rows_with_hebrew_context || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_hebrew_context must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_rows_with_focus_marker || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_focus_marker must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_rows_with_provenance || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_rows_with_provenance must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_collision_member_rows || 0) <= 0) {
    issues.push('selected_occurrence_navigation_collision_member_rows must be positive');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_collision_memberships || 0) !== Number(artifact.counts?.selected_collision_audit_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_collision_memberships must equal selected_collision_audit_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_observed_usage_only_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_navigation_observed_usage_only_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_reader_facing_rows || 0) !== 0) {
    issues.push('selected_occurrence_navigation_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_failed_checks || 0) !== 0) {
    issues.push('selected_occurrence_navigation_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_warning_count || 0) !== 0) {
    issues.push('selected_occurrence_navigation_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_navigation_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_occurrence_navigation_route_payload_field_hits must be 0');
  }
  if (artifact.validation?.selected_navigation_edge_index_status !== 'present') {
    issues.push('selected_navigation_edge_index_status must be present');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('selected_navigation_edge_rows must equal crossmatch_directed_edges');
  }
  if (Number(artifact.validation?.selected_navigation_edge_source_occurrences || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_navigation_edge_source_occurrences must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_target_occurrences || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_navigation_edge_target_occurrences must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_navigation_edge_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.validation?.selected_navigation_edge_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_navigation_edge_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.validation?.selected_navigation_edge_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_navigation_edge_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.validation?.selected_navigation_edge_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_navigation_edge_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.validation?.selected_navigation_edge_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_navigation_edge_provenance_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.validation?.selected_navigation_edge_same_frame_edges || 0) + Number(artifact.validation?.selected_navigation_edge_bridge_edges || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_same_frame_edges + selected_navigation_edge_bridge_edges must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows_with_source_context || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_source_context must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows_with_target_context || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_target_context must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows_with_source_link || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_source_link must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows_with_target_link || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_target_link must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows_with_source_provenance || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_source_provenance must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_rows_with_target_provenance || 0) !== Number(artifact.validation?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_navigation_edge_rows_with_target_provenance must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_navigation_edge_reader_facing_rows || 0) !== 0) {
    issues.push('selected_navigation_edge_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_navigation_edge_failed_checks || 0) !== 0) {
    issues.push('selected_navigation_edge_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_navigation_edge_warning_count || 0) !== 0) {
    issues.push('selected_navigation_edge_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_navigation_edge_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_navigation_edge_route_payload_field_hits must be 0');
  }
  if (artifact.validation?.selected_frame_bridge_index_status !== 'present') {
    issues.push('selected_frame_bridge_index_status must be present');
  }
  if (Number(artifact.validation?.selected_frame_bridge_edge_memberships || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_frame_bridge_edge_memberships must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_frame_bridge_same_frame_edges || 0) !== Number(artifact.counts?.selected_navigation_edge_same_frame_edges || 0)) {
    issues.push('selected_frame_bridge_same_frame_edges must equal selected_navigation_edge_same_frame_edges');
  }
  if (Number(artifact.validation?.selected_frame_bridge_bridge_frame_edges || 0) !== Number(artifact.counts?.selected_navigation_edge_bridge_edges || 0)) {
    issues.push('selected_frame_bridge_bridge_frame_edges must equal selected_navigation_edge_bridge_edges');
  }
  if (Number(artifact.validation?.selected_frame_bridge_same_frame_rows || 0) <= 0) {
    issues.push('selected_frame_bridge_same_frame_rows must be positive');
  }
  if (Number(artifact.validation?.selected_frame_bridge_bridge_frame_rows || 0) <= 0) {
    issues.push('selected_frame_bridge_bridge_frame_rows must be positive');
  }
  if (Number(artifact.validation?.selected_frame_bridge_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_frame_bridge_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.validation?.selected_frame_bridge_sample_rows_with_links || 0) !== Number(artifact.validation?.selected_frame_bridge_sample_rows || 0)) {
    issues.push('selected_frame_bridge_sample_rows_with_links must equal selected_frame_bridge_sample_rows');
  }
  if (Number(artifact.validation?.selected_frame_bridge_sample_rows_with_context || 0) !== Number(artifact.validation?.selected_frame_bridge_sample_rows || 0)) {
    issues.push('selected_frame_bridge_sample_rows_with_context must equal selected_frame_bridge_sample_rows');
  }
  if (Number(artifact.validation?.selected_frame_bridge_reader_facing_rows || 0) !== 0) {
    issues.push('selected_frame_bridge_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_frame_bridge_failed_checks || 0) !== 0) {
    issues.push('selected_frame_bridge_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_frame_bridge_warning_count || 0) !== 0) {
    issues.push('selected_frame_bridge_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_frame_bridge_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_frame_bridge_route_payload_field_hits must be 0');
  }
  if (artifact.validation?.selected_occurrence_adjacency_index_status !== 'present') {
    issues.push('selected_occurrence_adjacency_index_status must be present');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_target_links || 0) !== Number(artifact.counts?.selected_navigation_edge_rows || 0)) {
    issues.push('selected_occurrence_adjacency_target_links must equal selected_navigation_edge_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_source_refs || 0) !== Number(artifact.counts?.selected_source_diversity_unique_source_refs || 0)) {
    issues.push('selected_occurrence_adjacency_source_refs must equal selected_source_diversity_unique_source_refs');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_works || 0) !== Number(artifact.counts?.selected_source_diversity_unique_works || 0)) {
    issues.push('selected_occurrence_adjacency_works must equal selected_source_diversity_unique_works');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_occurrence_adjacency_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_occurrence_adjacency_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_provenance_buckets || 0) !== Number(artifact.counts?.selected_provenance_matrix_buckets || 0)) {
    issues.push('selected_occurrence_adjacency_provenance_buckets must equal selected_provenance_matrix_buckets');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_same_frame_links || 0) + Number(artifact.validation?.selected_occurrence_adjacency_bridge_frame_links || 0) !== Number(artifact.validation?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency same/bridge links must equal target links');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_rows_with_source_context || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_source_context must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_rows_with_source_link || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_source_link must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_rows_with_source_provenance || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_source_provenance must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_rows_with_complete_targets || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_occurrence_adjacency_rows_with_complete_targets must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_target_links_with_context || 0) !== Number(artifact.validation?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_target_links_with_context must equal target links');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_target_links_with_source_link || 0) !== Number(artifact.validation?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_target_links_with_source_link must equal target links');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_target_links_with_provenance || 0) !== Number(artifact.validation?.selected_occurrence_adjacency_target_links || 0)) {
    issues.push('selected_occurrence_adjacency_target_links_with_provenance must equal target links');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_reader_facing_rows || 0) !== 0) {
    issues.push('selected_occurrence_adjacency_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_failed_checks || 0) !== 0) {
    issues.push('selected_occurrence_adjacency_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_warning_count || 0) !== 0) {
    issues.push('selected_occurrence_adjacency_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_adjacency_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_occurrence_adjacency_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_focus_context_audit_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_focus_marker_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_focus_context_audit_focus_marker_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_mismatch_rows || 0) !== 0) {
    issues.push('selected_focus_context_audit_mismatch_rows must be 0');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_repeated_focus_rows || 0) <= 0) {
    issues.push('selected_focus_context_audit_repeated_focus_rows must be positive');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_missing_hebrew_rows || 0) !== 0) {
    issues.push('selected_focus_context_audit_missing_hebrew_rows must be 0');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_reader_facing_rows || 0) !== 0) {
    issues.push('selected_focus_context_audit_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_failed_checks || 0) !== 0) {
    issues.push('selected_focus_context_audit_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_warning_count || 0) <= 0) {
    issues.push('selected_focus_context_audit_warning_count must be positive');
  }
  if (Number(artifact.validation?.selected_focus_context_audit_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_focus_context_audit_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_frame_summary_frames || 0) <= 0) {
    issues.push('selected_frame_summary_frames must be positive');
  }
  if (Number(artifact.validation?.selected_frame_summary_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_frame_summary_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_frame_summary_repeated_focus_rows || 0) !== Number(artifact.counts?.selected_focus_context_audit_repeated_focus_rows || 0)) {
    issues.push('selected_frame_summary_repeated_focus_rows must equal selected_focus_context_audit_repeated_focus_rows');
  }
  if (Number(artifact.validation?.selected_frame_summary_samples || 0) < Number(artifact.validation?.selected_frame_summary_frames || 0)) {
    issues.push('selected_frame_summary_samples must cover each frame');
  }
  if (Number(artifact.validation?.selected_frame_summary_reader_facing_rows || 0) !== 0) {
    issues.push('selected_frame_summary_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_frame_summary_failed_checks || 0) !== 0) {
    issues.push('selected_frame_summary_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_frame_summary_warning_count || 0) !== 0) {
    issues.push('selected_frame_summary_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_frame_summary_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_frame_summary_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_rows || 0) <= 0) {
    issues.push('selected_work_frame_matrix_rows must be positive');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_selected_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_work_frame_matrix_selected_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_works || 0) <= 1) {
    issues.push('selected_work_frame_matrix_works must show multiple works');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_frames || 0) !== Number(artifact.counts?.selected_frame_summary_frames || 0)) {
    issues.push('selected_work_frame_matrix_frames must equal selected_frame_summary_frames');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_samples || 0) < Number(artifact.validation?.selected_work_frame_matrix_rows || 0)) {
    issues.push('selected_work_frame_matrix_samples must cover each matrix row');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_reader_facing_rows || 0) !== 0) {
    issues.push('selected_work_frame_matrix_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_failed_checks || 0) !== 0) {
    issues.push('selected_work_frame_matrix_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_warning_count || 0) !== 0) {
    issues.push('selected_work_frame_matrix_warning_count must be 0');
  }
  if (Number(artifact.validation?.selected_work_frame_matrix_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_work_frame_matrix_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_qa_package_items || 0) !== 21) {
    issues.push('selected_qa_package_items must be 21');
  }
  if (Number(artifact.validation?.selected_qa_package_selected_rows || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('selected_qa_package_selected_rows must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.selected_qa_package_route_ids || 0) !== Number(artifact.counts?.unique_route_ids || 0)) {
    issues.push('selected_qa_package_route_ids must equal unique_route_ids');
  }
  if (Number(artifact.validation?.selected_qa_package_unresolved_route_ids || 0) !== 0) {
    issues.push('selected_qa_package_unresolved_route_ids must be 0');
  }
  if (Number(artifact.validation?.selected_qa_package_route_concentration_warning_visible || 0) !== 1) {
    issues.push('selected_qa_package_route_concentration_warning_visible must be 1');
  }
  if (Number(artifact.validation?.selected_qa_package_crossmatch_directed_edges || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('selected_qa_package_crossmatch_directed_edges must equal crossmatch_directed_edges');
  }
  if (Number(artifact.validation?.selected_qa_package_crossmatch_bridge_edges || 0) !== Number(artifact.counts?.crossmatch_bridge_edges || 0)) {
    issues.push('selected_qa_package_crossmatch_bridge_edges must equal crossmatch_bridge_edges');
  }
  if (Number(artifact.validation?.selected_qa_package_reader_facing_rows || 0) !== 0) {
    issues.push('selected_qa_package_reader_facing_rows must be 0');
  }
  if (Number(artifact.validation?.selected_qa_package_failed_checks || 0) !== 0) {
    issues.push('selected_qa_package_failed_checks must be 0');
  }
  if (Number(artifact.validation?.selected_qa_package_warning_count || 0) !== 1) {
    issues.push('selected_qa_package_warning_count must be 1');
  }
  if (Number(artifact.validation?.selected_qa_package_route_payload_field_hits || 0) !== 0) {
    issues.push('selected_qa_package_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.selected_occurrence_lookup_work_buckets || 0) <= 0) {
    issues.push('selected_occurrence_lookup_work_buckets must be positive');
  }
  if (Number(artifact.validation?.crossmatch_occurrence_refs || 0) !== Number(artifact.counts?.selected_occurrence_rows || 0)) {
    issues.push('crossmatch_occurrence_refs must equal selected_occurrence_rows');
  }
  if (Number(artifact.validation?.crossmatch_directed_edges || 0) !== Number(artifact.counts?.crossmatch_directed_edges || 0)) {
    issues.push('validation.crossmatch_directed_edges must equal counts.crossmatch_directed_edges');
  }
  if (Number(artifact.validation?.crossmatch_failed_checks || 0) !== 0) {
    issues.push('crossmatch_failed_checks must be 0');
  }
  if (Number(artifact.validation?.crossmatch_route_payload_field_hits || 0) !== 0) {
    issues.push('crossmatch_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.crossmatch_bridge_edges || 0) !== Number(artifact.counts?.crossmatch_bridge_edges || 0)) {
    issues.push('validation.crossmatch_bridge_edges must equal counts.crossmatch_bridge_edges');
  }
  if (Number(artifact.validation?.crossmatch_bridge_buckets || 0) !== Number(artifact.counts?.crossmatch_bridge_buckets || 0)) {
    issues.push('validation.crossmatch_bridge_buckets must equal counts.crossmatch_bridge_buckets');
  }
  if (Number(artifact.validation?.crossmatch_bridge_failed_checks || 0) !== 0) {
    issues.push('crossmatch_bridge_failed_checks must be 0');
  }
  if (Number(artifact.validation?.crossmatch_bridge_route_payload_field_hits || 0) !== 0) {
    issues.push('crossmatch_bridge_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.crossmatch_neighborhoods || 0) !== Number(artifact.counts?.crossmatch_neighborhoods || 0)) {
    issues.push('validation.crossmatch_neighborhoods must equal counts.crossmatch_neighborhoods');
  }
  if (Number(artifact.validation?.crossmatch_neighborhood_same_frame_links || 0) !== Number(artifact.counts?.crossmatch_neighborhood_same_frame_links || 0)) {
    issues.push('validation.crossmatch_neighborhood_same_frame_links must equal counts.crossmatch_neighborhood_same_frame_links');
  }
  if (Number(artifact.validation?.crossmatch_neighborhood_bridge_links || 0) !== Number(artifact.counts?.crossmatch_neighborhood_bridge_links || 0)) {
    issues.push('validation.crossmatch_neighborhood_bridge_links must equal counts.crossmatch_neighborhood_bridge_links');
  }
  if (Number(artifact.validation?.crossmatch_neighborhood_failed_checks || 0) !== 0) {
    issues.push('crossmatch_neighborhood_failed_checks must be 0');
  }
  if (Number(artifact.validation?.crossmatch_neighborhood_route_payload_field_hits || 0) !== 0) {
    issues.push('crossmatch_neighborhood_route_payload_field_hits must be 0');
  }
  if (Number(artifact.validation?.agent6_boundary_checks || 0) <= 0) issues.push('agent6_boundary_checks must be positive');
  if (Number(artifact.validation?.agent6_boundary_failed_checks || 0) !== 0) {
    issues.push('agent6_boundary_failed_checks must be 0');
  }
  if (Number(artifact.validation?.concentration_failed_checks || 0) !== 0) {
    issues.push('concentration_failed_checks must be 0');
  }
  if (Number(artifact.validation?.concentration_route_payload_field_hits || 0) !== 0) {
    issues.push('concentration_route_payload_field_hits must be 0');
  }
  if (!['passed', 'pass_with_warnings'].includes(String(artifact.validation?.concentration_quality_status || ''))) {
    issues.push('concentration_quality_status must be passed or pass_with_warnings');
  }
  if (!allowedSmoke.has(artifact.validation?.smoke_validation_status)) {
    issues.push('smoke_validation_status must be passed/failed/not_run/skipped_self_reference');
  }
  if (artifact.validation?.smoke_validation_status === 'failed') issues.push('smoke_validation_status must not be failed');
}

function validateCommands() {
  const expectedScripts = {
    regenerate: 'build_workbench_usage_concordance.mjs',
    validate_concordance: 'validate_workbench_usage_concordance.mjs',
    check_occurrence_links: 'check_workbench_usage_concordance_links.mjs',
    check_route_links: 'check_workbench_usage_route_links.mjs',
    build_audit_review: 'build_workbench_usage_audit_review.mjs',
    build_cluster_index: 'build_workbench_usage_cluster_index.mjs',
    validate_cluster_index: 'validate_workbench_usage_cluster_index.mjs',
    build_route_coverage: 'build_workbench_usage_route_coverage.mjs',
    validate_route_coverage: 'validate_workbench_usage_route_coverage.mjs',
    build_sample_index: 'build_workbench_usage_sample_index.mjs',
    validate_sample_index: 'validate_workbench_usage_sample_index.mjs',
    build_lookup_index: 'build_workbench_usage_lookup_index.mjs',
    validate_lookup_index: 'validate_workbench_usage_lookup_index.mjs',
    build_work_frame_matrix: 'build_workbench_usage_work_frame_matrix.mjs',
    validate_work_frame_matrix: 'validate_workbench_usage_work_frame_matrix.mjs',
    build_search_rows: 'build_workbench_usage_search_rows.mjs',
    validate_search_rows: 'validate_workbench_usage_search_rows.mjs',
    build_provenance_index: 'build_workbench_usage_provenance_index.mjs',
    validate_provenance_index: 'validate_workbench_usage_provenance_index.mjs',
    build_search_shard_index: 'build_workbench_usage_search_shard_index.mjs',
    validate_search_shard_index: 'validate_workbench_usage_search_shard_index.mjs',
    build_refresh_priority_index: 'build_workbench_usage_refresh_priority_index.mjs',
    validate_refresh_priority_index: 'validate_workbench_usage_refresh_priority_index.mjs',
    build_unit_density_index: 'build_workbench_usage_unit_density_index.mjs',
    validate_unit_density_index: 'validate_workbench_usage_unit_density_index.mjs',
    build_phrase_recurrence_index: 'build_workbench_usage_phrase_recurrence_index.mjs',
    validate_phrase_recurrence_index: 'validate_workbench_usage_phrase_recurrence_index.mjs',
    build_context_offset_index: 'build_workbench_usage_context_offset_index.mjs',
    validate_context_offset_index: 'validate_workbench_usage_context_offset_index.mjs',
    build_context_signature_index: 'build_workbench_usage_context_signature_index.mjs',
    validate_context_signature_index: 'validate_workbench_usage_context_signature_index.mjs',
    build_context_signature_lookup: 'build_workbench_usage_context_signature_lookup.mjs',
    validate_context_signature_lookup: 'validate_workbench_usage_context_signature_lookup.mjs',
    build_context_signature_contrast: 'build_workbench_usage_context_signature_contrast.mjs',
    validate_context_signature_contrast: 'validate_workbench_usage_context_signature_contrast.mjs',
    build_selected_slice: 'build_workbench_usage_slice_index.mjs',
    validate_selected_slice: 'validate_workbench_usage_slice_index.mjs',
    build_selected_slice_jeremiah: 'build_workbench_usage_slice_index.mjs',
    validate_selected_slice_jeremiah: 'validate_workbench_usage_slice_index.mjs',
    build_selected_slices_index: 'build_workbench_usage_selected_slices_index.mjs',
    validate_selected_slices_index: 'validate_workbench_usage_selected_slices_index.mjs',
    build_selected_occurrences: 'build_workbench_usage_selected_occurrences.mjs',
    validate_selected_occurrences: 'validate_workbench_usage_selected_occurrences.mjs',
    build_selected_signature_independence: 'build_workbench_usage_selected_signature_independence.mjs',
    validate_selected_signature_independence: 'validate_workbench_usage_selected_signature_independence.mjs',
    build_selected_source_diversity: 'build_workbench_usage_selected_source_diversity.mjs',
    validate_selected_source_diversity: 'validate_workbench_usage_selected_source_diversity.mjs',
    build_selected_provenance_matrix: 'build_workbench_usage_selected_provenance_matrix.mjs',
    validate_selected_provenance_matrix: 'validate_workbench_usage_selected_provenance_matrix.mjs',
    build_selected_frame_provenance_matrix: 'build_workbench_usage_selected_frame_provenance_matrix.mjs',
    validate_selected_frame_provenance_matrix: 'validate_workbench_usage_selected_frame_provenance_matrix.mjs',
    build_selected_collision_audit: 'build_workbench_usage_selected_collision_audit.mjs',
    validate_selected_collision_audit: 'validate_workbench_usage_selected_collision_audit.mjs',
    build_selected_collision_provenance_audit: 'build_workbench_usage_selected_collision_provenance_audit.mjs',
    validate_selected_collision_provenance_audit: 'validate_workbench_usage_selected_collision_provenance_audit.mjs',
    build_selected_route_concentration_response: 'build_workbench_usage_selected_route_concentration_response.mjs',
    validate_selected_route_concentration_response: 'validate_workbench_usage_selected_route_concentration_response.mjs',
    build_selected_occurrence_cards: 'build_workbench_usage_selected_occurrence_cards.mjs',
    validate_selected_occurrence_cards: 'validate_workbench_usage_selected_occurrence_cards.mjs',
    build_selected_route_resolution: 'build_workbench_usage_selected_route_resolution.mjs',
    validate_selected_route_resolution: 'validate_workbench_usage_selected_route_resolution.mjs',
    build_selected_route_provenance_audit: 'build_workbench_usage_selected_route_provenance_audit.mjs',
    validate_selected_route_provenance_audit: 'validate_workbench_usage_selected_route_provenance_audit.mjs',
    build_selected_occurrence_navigation_index: 'build_workbench_usage_selected_occurrence_navigation_index.mjs',
    validate_selected_occurrence_navigation_index: 'validate_workbench_usage_selected_occurrence_navigation_index.mjs',
    build_selected_navigation_edge_index: 'build_workbench_usage_selected_navigation_edge_index.mjs',
    validate_selected_navigation_edge_index: 'validate_workbench_usage_selected_navigation_edge_index.mjs',
    build_selected_frame_bridge_index: 'build_workbench_usage_selected_frame_bridge_index.mjs',
    validate_selected_frame_bridge_index: 'validate_workbench_usage_selected_frame_bridge_index.mjs',
    build_selected_occurrence_adjacency_index: 'build_workbench_usage_selected_occurrence_adjacency_index.mjs',
    validate_selected_occurrence_adjacency_index: 'validate_workbench_usage_selected_occurrence_adjacency_index.mjs',
    build_selected_focus_context_audit: 'build_workbench_usage_selected_focus_context_audit.mjs',
    validate_selected_focus_context_audit: 'validate_workbench_usage_selected_focus_context_audit.mjs',
    build_selected_frame_summary: 'build_workbench_usage_selected_frame_summary.mjs',
    validate_selected_frame_summary: 'validate_workbench_usage_selected_frame_summary.mjs',
    build_selected_work_frame_matrix: 'build_workbench_usage_selected_work_frame_matrix.mjs',
    validate_selected_work_frame_matrix: 'validate_workbench_usage_selected_work_frame_matrix.mjs',
    build_selected_qa_package: 'build_workbench_usage_selected_qa_package.mjs',
    validate_selected_qa_package: 'validate_workbench_usage_selected_qa_package.mjs',
    build_selected_occurrence_lookup: 'build_workbench_usage_selected_occurrence_lookup.mjs',
    validate_selected_occurrence_lookup: 'validate_workbench_usage_selected_occurrence_lookup.mjs',
    build_crossmatch_links: 'build_workbench_usage_crossmatch_links.mjs',
    validate_crossmatch_links: 'validate_workbench_usage_crossmatch_links.mjs',
    build_crossmatch_bridge_index: 'build_workbench_usage_crossmatch_bridge_index.mjs',
    validate_crossmatch_bridge_index: 'validate_workbench_usage_crossmatch_bridge_index.mjs',
    build_crossmatch_neighborhoods: 'build_workbench_usage_crossmatch_neighborhoods.mjs',
    validate_crossmatch_neighborhoods: 'validate_workbench_usage_crossmatch_neighborhoods.mjs',
    build_agent6_boundary_packet: 'build_workbench_usage_agent6_boundary_packet.mjs',
    validate_agent6_boundary_packet: 'validate_workbench_usage_agent6_boundary_packet.mjs',
    build_concentration_packet: 'build_workbench_usage_concentration_packet.mjs',
    validate_concentration_packet: 'validate_workbench_usage_concentration_packet.mjs',
    build_handoff_index: 'build_workbench_usage_handoff_index.mjs',
    validate_handoff_index: 'validate_workbench_usage_handoff_index.mjs',
    validate_smoke_pipeline: 'validate_workbench_smoke_pipeline.mjs',
  };
  for (const [field, script] of Object.entries(expectedScripts)) {
    if (!String(artifact.commands?.[field] || '').includes(script)) {
      issues.push(`commands.${field} must reference ${script}`);
    }
  }
}

function walkNoForbiddenFields(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkNoForbiddenFields(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden field ${key}`);
    walkNoForbiddenFields(item, context, [...pathParts, key]);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
