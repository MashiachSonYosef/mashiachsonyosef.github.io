#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceLinks: 'data/definitions/definition-workbench-usage-occurrence-links.json',
  routeResolution: 'data/definitions/definition-workbench-usage-route-resolution.json',
  crossmatchNeighbors: 'data/definitions/definition-workbench-usage-crossmatch-neighbors.json',
  sourceRefBuckets: 'data/definitions/definition-workbench-usage-source-ref-buckets.json',
  workBuckets: 'data/definitions/definition-workbench-usage-work-buckets.json',
  provenanceBuckets: 'data/definitions/definition-workbench-usage-provenance-buckets.json',
  occurrenceDetailIndex: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  facetIndex: 'data/definitions/definition-workbench-usage-facet-index.json',
  contextTokenIndex: 'data/definitions/definition-workbench-usage-context-token-index.json',
  contextTokenLinks: 'data/definitions/definition-workbench-usage-context-token-links.json',
  contextTokenOccurrenceIndex: 'data/definitions/definition-workbench-usage-context-token-occurrence-index.json',
  occurrenceContextProfile: 'data/definitions/definition-workbench-usage-occurrence-context-profile.json',
  routeDiversityProbe: 'data/definitions/definition-workbench-usage-route-diversity-probe.json',
  routeConcentrationGuardrail: 'data/definitions/definition-workbench-usage-route-concentration-guardrail.json',
  routePointerAudit: 'data/definitions/definition-workbench-usage-route-pointer-audit.json',
  sampleGapAudit: 'data/definitions/definition-workbench-usage-sample-gap-audit.json',
  output: 'data/definitions/definition-workbench-usage-consumer-manifest.json',
  report: 'reports/definition-workbench-usage-consumer-manifest.md',
};
const forbiddenAuthorityKeys = [
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
];

const options = parseArgs(process.argv.slice(2));
const packets = {
  occurrenceLinks: readJson(options.occurrenceLinks),
  routeResolution: readJson(options.routeResolution),
  crossmatchNeighbors: readJson(options.crossmatchNeighbors),
  sourceRefBuckets: readJson(options.sourceRefBuckets),
  workBuckets: readJson(options.workBuckets),
  provenanceBuckets: readJson(options.provenanceBuckets),
  occurrenceDetailIndex: readJson(options.occurrenceDetailIndex),
  facetIndex: readJson(options.facetIndex),
  contextTokenIndex: readJson(options.contextTokenIndex),
  contextTokenLinks: readJson(options.contextTokenLinks),
  contextTokenOccurrenceIndex: readJson(options.contextTokenOccurrenceIndex),
  occurrenceContextProfile: readJson(options.occurrenceContextProfile),
  routeDiversityProbe: readJson(options.routeDiversityProbe),
  routeConcentrationGuardrail: readJson(options.routeConcentrationGuardrail),
  routePointerAudit: readJson(options.routePointerAudit),
  sampleGapAudit: readJson(options.sampleGapAudit),
};

assertArtifact(packets.occurrenceLinks, 'definition_workbench_usage_occurrence_links', options.occurrenceLinks);
assertArtifact(packets.routeResolution, 'definition_workbench_usage_route_resolution', options.routeResolution);
assertArtifact(packets.crossmatchNeighbors, 'definition_workbench_usage_crossmatch_neighbors', options.crossmatchNeighbors);
assertArtifact(packets.sourceRefBuckets, 'definition_workbench_usage_source_ref_buckets', options.sourceRefBuckets);
assertArtifact(packets.workBuckets, 'definition_workbench_usage_work_buckets', options.workBuckets);
assertArtifact(packets.provenanceBuckets, 'definition_workbench_usage_provenance_buckets', options.provenanceBuckets);
assertArtifact(packets.occurrenceDetailIndex, 'definition_workbench_usage_occurrence_detail_index', options.occurrenceDetailIndex);
assertArtifact(packets.facetIndex, 'definition_workbench_usage_facet_index', options.facetIndex);
assertArtifact(packets.contextTokenIndex, 'definition_workbench_usage_context_token_index', options.contextTokenIndex);
assertArtifact(packets.contextTokenLinks, 'definition_workbench_usage_context_token_links', options.contextTokenLinks);
assertArtifact(packets.contextTokenOccurrenceIndex, 'definition_workbench_usage_context_token_occurrence_index', options.contextTokenOccurrenceIndex);
assertArtifact(packets.occurrenceContextProfile, 'definition_workbench_usage_occurrence_context_profile', options.occurrenceContextProfile);
assertArtifact(packets.routeDiversityProbe, 'definition_workbench_usage_route_diversity_probe', options.routeDiversityProbe);
assertArtifact(packets.routeConcentrationGuardrail, 'definition_workbench_usage_route_concentration_guardrail', options.routeConcentrationGuardrail);
assertArtifact(packets.routePointerAudit, 'definition_workbench_usage_route_pointer_audit', options.routePointerAudit);
assertArtifact(packets.sampleGapAudit, 'definition_workbench_usage_sample_gap_audit', options.sampleGapAudit);

const manifestEntries = buildManifestEntries();
const counts = buildCounts(manifestEntries);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_consumer_manifest',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_consumer_manifest.mjs',
  policy: 'Stable Agent 3 Definition Workbench usage-navigation consumer manifest. It identifies safe downstream consumption paths for selected usage occurrence artifacts while preserving source/license/provenance visibility and route-ID-only linkage. It is not a HUD implementation, route ranking surface, semantic arbiter, public UI acceptance, publication claim, or accepted text source.',
  inputs: {
    occurrence_links: options.occurrenceLinks,
    route_resolution: options.routeResolution,
    crossmatch_neighbors: options.crossmatchNeighbors,
    source_ref_buckets: options.sourceRefBuckets,
    work_buckets: options.workBuckets,
    provenance_buckets: options.provenanceBuckets,
    occurrence_detail_index: options.occurrenceDetailIndex,
    facet_index: options.facetIndex,
    context_token_index: options.contextTokenIndex,
    context_token_links: options.contextTokenLinks,
    context_token_occurrence_index: options.contextTokenOccurrenceIndex,
    occurrence_context_profile: options.occurrenceContextProfile,
    route_diversity_probe: options.routeDiversityProbe,
    route_concentration_guardrail: options.routeConcentrationGuardrail,
    route_pointer_audit: options.routePointerAudit,
    sample_gap_audit: options.sampleGapAudit,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    consumer_manifest_only: true,
    route_ids_only: true,
    source_license_required: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    reviewed_lexical_authority: false,
    accepted_translation_output: false,
    publication_readiness: false,
    publication_claim: false,
  },
  status_semantics: {
    machine_status_axis: 'machine_route_shape_status_not_review_authority',
    machine_complete_label: 'single_answer_source_complete',
    machine_complete_label_basis: 'one answer route hash and complete source/license rows; not reviewed lexical authority',
    machine_forbidden_status_labels: ['verified'],
    review_status_axis: 'lexical_authority_review_status',
    machine_review_status: 'unreviewed_machine_sample',
    verified_review_status_reserved: true,
    verified_review_status_reserved_for: 'future reviewed lexical authority outside machine-generated usage/navigation artifacts',
    usage_status_scope: 'observed usage/navigation status only; not answer authority and not reviewed lexical authority',
    answer_role_preserved: true,
    source_license_rows_preserved: true,
    multi_answer_warnings_preserved: true,
    publication_boundary_preserved: true,
  },
  consumer_contract: {
    safe_uses: [
      'occurrence lookup by stable occurrence_id',
      'source/work/provenance navigation',
      'route-ID-only linkback to Agent 2 artifacts',
      'QA checks for source/license/context visibility',
      'audit comparison of selected usage frames and neighbor links',
    ],
    prohibited_uses: [
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
    ],
    required_row_label: 'observed usage only',
    ambiguous_rows_policy: 'audit-only unless a later Agent 6 docket accepts a narrower display boundary',
    downstream_route_payload_rule: 'consume related_route_ids only; resolve Agent 2 payloads outside Agent 3 artifacts',
  },
  navigation_keys: {
    stable_row_keys: ['occurrence_id', 'row_id', 'detail_id'],
    source_keys: ['source_ref', 'source_href', 'work_slug', 'work_anchor_href'],
    usage_keys: ['token_key', 'focus_normalized', 'cluster_id', 'usage_frame_label', 'status', 'raw_score'],
    provenance_keys: ['provenance_id', 'version_title', 'version_source', 'license', 'license_url'],
    bucket_keys: ['source_ref_bucket_key', 'source_cluster_key', 'work_bucket_key', 'work_frame_key', 'provenance_key', 'provenance_frame_key'],
    route_keys: ['related_route_ids', 'route_sources', 'unresolved_route_ids'],
  },
  manifest_entries: manifestEntries,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage consumer manifest ${artifact.quality.status}; entries ${counts.manifest_entries}; data artifacts ${counts.data_artifacts_exist}/${counts.data_artifacts}; validators ${counts.validator_scripts_exist}/${counts.validator_scripts}`);

function buildManifestEntries() {
  return [
    manifestEntry({
      artifact_id: 'occurrence_links',
      data_path: options.occurrenceLinks,
      report_path: 'reports/definition-workbench-usage-occurrence-links.md',
      validator_script: 'scripts/validate_definition_workbench_usage_occurrence_links.mjs',
      packet: packets.occurrenceLinks,
      primary_count_key: 'occurrence_link_rows',
      safe_consumer_role: 'base selected occurrence links with source/work/context/provenance/route IDs',
    }),
    manifestEntry({
      artifact_id: 'route_resolution',
      data_path: options.routeResolution,
      report_path: 'reports/definition-workbench-usage-route-resolution.md',
      validator_script: 'scripts/validate_definition_workbench_usage_route_resolution.mjs',
      packet: packets.routeResolution,
      primary_count_key: 'occurrence_route_rows',
      safe_consumer_role: 'route-ID resolution proof without Agent 2 payload copying',
    }),
    manifestEntry({
      artifact_id: 'crossmatch_neighbors',
      data_path: options.crossmatchNeighbors,
      report_path: 'reports/definition-workbench-usage-crossmatch-neighbors.md',
      validator_script: 'scripts/validate_definition_workbench_usage_crossmatch_neighbors.mjs',
      packet: packets.crossmatchNeighbors,
      primary_count_key: 'neighbor_link_rows',
      safe_consumer_role: 'occurrence-to-occurrence navigation neighbors',
    }),
    manifestEntry({
      artifact_id: 'source_ref_buckets',
      data_path: options.sourceRefBuckets,
      report_path: 'reports/definition-workbench-usage-source-ref-buckets.md',
      validator_script: 'scripts/validate_definition_workbench_usage_source_ref_buckets.mjs',
      packet: packets.sourceRefBuckets,
      primary_count_key: 'source_ref_buckets',
      safe_consumer_role: 'source-ref and source-ref-plus-cluster grouping',
    }),
    manifestEntry({
      artifact_id: 'work_buckets',
      data_path: options.workBuckets,
      report_path: 'reports/definition-workbench-usage-work-buckets.md',
      validator_script: 'scripts/validate_definition_workbench_usage_work_buckets.mjs',
      packet: packets.workBuckets,
      primary_count_key: 'work_buckets',
      safe_consumer_role: 'work and work-plus-cluster grouping',
    }),
    manifestEntry({
      artifact_id: 'provenance_buckets',
      data_path: options.provenanceBuckets,
      report_path: 'reports/definition-workbench-usage-provenance-buckets.md',
      validator_script: 'scripts/validate_definition_workbench_usage_provenance_buckets.mjs',
      packet: packets.provenanceBuckets,
      primary_count_key: 'provenance_buckets',
      safe_consumer_role: 'version/license/provenance grouping',
    }),
    manifestEntry({
      artifact_id: 'occurrence_detail_index',
      data_path: options.occurrenceDetailIndex,
      report_path: 'reports/definition-workbench-usage-occurrence-detail-index.md',
      validator_script: 'scripts/validate_definition_workbench_usage_occurrence_detail_index.mjs',
      packet: packets.occurrenceDetailIndex,
      primary_count_key: 'occurrence_detail_rows',
      safe_consumer_role: 'joined occurrence detail navigation index',
    }),
    manifestEntry({
      artifact_id: 'facet_index',
      data_path: options.facetIndex,
      report_path: 'reports/definition-workbench-usage-facet-index.md',
      validator_script: 'scripts/validate_definition_workbench_usage_facet_index.mjs',
      packet: packets.facetIndex,
      primary_count_key: 'facets_total',
      safe_consumer_role: 'selected occurrence search/filter facets with route concentration warning',
    }),
    manifestEntry({
      artifact_id: 'context_token_index',
      data_path: options.contextTokenIndex,
      report_path: 'reports/definition-workbench-usage-context-token-index.md',
      validator_script: 'scripts/validate_definition_workbench_usage_context_token_index.mjs',
      packet: packets.contextTokenIndex,
      primary_count_key: 'context_token_rows',
      safe_consumer_role: 'selected occurrence Hebrew context-token co-occurrence navigation',
    }),
    manifestEntry({
      artifact_id: 'context_token_links',
      data_path: options.contextTokenLinks,
      report_path: 'reports/definition-workbench-usage-context-token-links.md',
      validator_script: 'scripts/validate_definition_workbench_usage_context_token_links.mjs',
      packet: packets.contextTokenLinks,
      primary_count_key: 'context_token_link_rows',
      safe_consumer_role: 'per-appearance Hebrew context-token links back to selected occurrence rows',
    }),
    manifestEntry({
      artifact_id: 'context_token_occurrence_index',
      data_path: options.contextTokenOccurrenceIndex,
      report_path: 'reports/definition-workbench-usage-context-token-occurrence-index.md',
      validator_script: 'scripts/validate_definition_workbench_usage_context_token_occurrence_index.mjs',
      packet: packets.contextTokenOccurrenceIndex,
      primary_count_key: 'context_token_occurrence_rows',
      safe_consumer_role: 'reverse lookup from normalized Hebrew context token to all selected occurrence-link IDs',
    }),
    manifestEntry({
      artifact_id: 'occurrence_context_profile',
      data_path: options.occurrenceContextProfile,
      report_path: 'reports/definition-workbench-usage-occurrence-context-profile.md',
      validator_script: 'scripts/validate_definition_workbench_usage_occurrence_context_profile.mjs',
      packet: packets.occurrenceContextProfile,
      primary_count_key: 'profile_rows',
      safe_consumer_role: 'occurrence-centric context-token profile with reverse-index IDs',
    }),
    manifestEntry({
      artifact_id: 'route_diversity_probe',
      data_path: options.routeDiversityProbe,
      report_path: 'reports/definition-workbench-usage-route-diversity-probe.md',
      validator_script: 'scripts/validate_definition_workbench_usage_route_diversity_probe.mjs',
      packet: packets.routeDiversityProbe,
      primary_count_key: 'occurrence_rows',
      safe_consumer_role: 'route concentration visibility over selected occurrence links without semantic independence claims',
    }),
    manifestEntry({
      artifact_id: 'route_concentration_guardrail',
      data_path: options.routeConcentrationGuardrail,
      report_path: 'reports/definition-workbench-usage-route-concentration-guardrail.md',
      validator_script: 'scripts/validate_definition_workbench_usage_route_concentration_guardrail.mjs',
      packet: packets.routeConcentrationGuardrail,
      primary_count_key: 'guardrail_surfaces',
      safe_consumer_role: 'consolidated route-concentration guardrail blocking semantic independence and answer-authority overclaim',
    }),
    manifestEntry({
      artifact_id: 'route_pointer_audit',
      data_path: options.routePointerAudit,
      report_path: 'reports/definition-workbench-usage-route-pointer-audit.md',
      validator_script: 'scripts/validate_definition_workbench_usage_route_pointer_audit.mjs',
      packet: packets.routePointerAudit,
      primary_count_key: 'route_pointer_rows',
      safe_consumer_role: 'route-ID pointer audit for resolving Agent 2 route payloads outside Agent 3 artifacts',
    }),
    manifestEntry({
      artifact_id: 'sample_gap_audit',
      data_path: options.sampleGapAudit,
      report_path: 'reports/definition-workbench-usage-sample-gap-audit.md',
      validator_script: 'scripts/validate_definition_workbench_usage_sample_gap_audit.mjs',
      packet: packets.sampleGapAudit,
      primary_count_key: 'gap_rows',
      safe_consumer_role: 'Definition Workbench sample-overlap gap visibility for selected usage tokens without answer authority',
    }),
  ];
}

function manifestEntry({ artifact_id, data_path, report_path, validator_script, packet, primary_count_key, safe_consumer_role }) {
  const counts = packet.counts || {};
  return {
    artifact_id,
    data_path,
    report_path,
    validator_script,
    artifact_type: packet.artifact_type,
    status: packet.quality?.status || null,
    safe_consumer_role,
    primary_count_key,
    primary_count: Number(counts[primary_count_key] || 0),
    route_ids: Number(counts.route_ids ?? counts.unique_route_ids ?? 0),
    unresolved_route_ids: Number(counts.unresolved_route_ids || 0),
    reader_facing_rows: Number(counts.reader_facing_rows || 0),
    route_payload_field_hits: Number(counts.route_payload_field_hits || 0),
    forbidden_authority_field_hits: Number(counts.forbidden_authority_field_hits || 0),
    metadata_summary: {
      rows_with_source_link: Number(counts.rows_with_source_link ?? counts.rows_with_source ?? counts.link_rows_with_source_link ?? 0),
      rows_with_work_anchor: Number(counts.rows_with_work_anchor ?? counts.link_rows_with_work_anchor ?? 0),
      rows_with_hebrew_context: Number(counts.rows_with_hebrew_context ?? counts.link_rows_with_hebrew_context ?? 0),
      rows_with_focus_marker: Number(counts.rows_with_focus_marker ?? counts.link_rows_with_focus_marker ?? 0),
      rows_with_license_metadata: Number(counts.rows_with_license_metadata ?? counts.rows_with_license ?? counts.link_rows_with_license_metadata ?? 0),
      rows_with_version_metadata: Number(counts.rows_with_version_metadata ?? counts.rows_with_version ?? counts.link_rows_with_version_metadata ?? 0),
    },
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      consumer_manifest_entry_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
  };
}

function buildCounts(entries) {
  const occurrenceRows = Number(packets.occurrenceLinks.counts?.occurrence_link_rows || 0);
  const detailRows = Number(packets.occurrenceDetailIndex.counts?.occurrence_detail_rows || 0);
  return {
    manifest_entries: entries.length,
    data_artifacts: entries.length,
    data_artifacts_exist: entries.filter((entry) => fs.existsSync(path.join(root, entry.data_path))).length,
    report_artifacts: entries.length,
    report_artifacts_exist: entries.filter((entry) => fs.existsSync(path.join(root, entry.report_path))).length,
    validator_scripts: entries.length,
    validator_scripts_exist: entries.filter((entry) => fs.existsSync(path.join(root, entry.validator_script))).length,
    passed_entries: entries.filter((entry) => ['passed', 'pass_with_warnings'].includes(entry.status)).length,
    occurrence_link_rows: occurrenceRows,
    occurrence_detail_rows: detailRows,
    source_ref_buckets: Number(packets.sourceRefBuckets.counts?.source_ref_buckets || 0),
    work_buckets: Number(packets.workBuckets.counts?.work_buckets || 0),
    provenance_buckets: Number(packets.provenanceBuckets.counts?.provenance_buckets || 0),
    facet_index_facets: Number(packets.facetIndex.counts?.facets_total || 0),
    facet_index_occurrence_rows: Number(packets.facetIndex.counts?.occurrence_rows || 0),
    facet_index_route_concentration_warning: Number(packets.facetIndex.counts?.route_concentration_warning || 0),
    context_token_index_rows: Number(packets.contextTokenIndex.counts?.context_token_rows || 0),
    context_token_index_occurrence_rows: Number(packets.contextTokenIndex.counts?.occurrence_rows || 0),
    context_token_index_occurrences: Number(packets.contextTokenIndex.counts?.context_token_occurrences || 0),
    context_token_index_cross_frame_rows: Number(packets.contextTokenIndex.counts?.cross_frame_context_token_rows || 0),
    context_token_index_repeated_focus_occurrences: Number(packets.contextTokenIndex.counts?.repeated_focus_context_occurrences || 0),
    context_token_index_route_concentration_warning: Number(packets.contextTokenIndex.counts?.route_concentration_warning || 0),
    context_token_link_rows: Number(packets.contextTokenLinks.counts?.context_token_link_rows || 0),
    context_token_link_context_tokens: Number(packets.contextTokenLinks.counts?.context_token_rows || 0),
    context_token_link_occurrence_rows: Number(packets.contextTokenLinks.counts?.occurrence_rows || 0),
    context_token_link_focus_rows: Number(packets.contextTokenLinks.counts?.focus_marked_link_rows || 0),
    context_token_link_context_rows: Number(packets.contextTokenLinks.counts?.context_role_link_rows || 0),
    context_token_link_repeated_focus_rows: Number(packets.contextTokenLinks.counts?.repeated_focus_context_links || 0),
    context_token_link_cross_frame_rows: Number(packets.contextTokenLinks.counts?.cross_frame_context_token_links || 0),
    context_token_link_route_concentration_warning: Number(packets.contextTokenLinks.counts?.route_concentration_warning || 0),
    context_token_occurrence_index_rows: Number(packets.contextTokenOccurrenceIndex.counts?.context_token_occurrence_rows || 0),
    context_token_occurrence_index_link_rows: Number(packets.contextTokenOccurrenceIndex.counts?.context_token_link_rows || 0),
    context_token_occurrence_index_occurrence_rows: Number(packets.contextTokenOccurrenceIndex.counts?.occurrence_rows || 0),
    context_token_occurrence_index_focus_rows: Number(packets.contextTokenOccurrenceIndex.counts?.focus_link_rows || 0),
    context_token_occurrence_index_context_rows: Number(packets.contextTokenOccurrenceIndex.counts?.context_link_rows || 0),
    context_token_occurrence_index_repeated_focus_rows: Number(packets.contextTokenOccurrenceIndex.counts?.repeated_focus_context_link_rows || 0),
    context_token_occurrence_index_cross_frame_rows: Number(packets.contextTokenOccurrenceIndex.counts?.cross_frame_context_token_rows || 0),
    context_token_occurrence_index_cross_frame_link_rows: Number(packets.contextTokenOccurrenceIndex.counts?.cross_frame_context_token_link_rows || 0),
    context_token_occurrence_index_route_concentration_warning: Number(packets.contextTokenOccurrenceIndex.counts?.route_concentration_warning || 0),
    occurrence_context_profile_rows: Number(packets.occurrenceContextProfile.counts?.profile_rows || 0),
    occurrence_context_profile_link_rows: Number(packets.occurrenceContextProfile.counts?.context_token_link_rows || 0),
    occurrence_context_profile_unique_context_tokens: Number(packets.occurrenceContextProfile.counts?.unique_context_tokens || 0),
    occurrence_context_profile_reverse_index_rows: Number(packets.occurrenceContextProfile.counts?.reverse_index_rows || 0),
    occurrence_context_profile_rows_with_reverse_index_ids: Number(packets.occurrenceContextProfile.counts?.rows_with_reverse_index_ids || 0),
    occurrence_context_profile_rows_with_complete_reverse_index_mapping: Number(packets.occurrenceContextProfile.counts?.rows_with_complete_reverse_index_mapping || 0),
    occurrence_context_profile_focus_rows: Number(packets.occurrenceContextProfile.counts?.focus_link_rows || 0),
    occurrence_context_profile_context_rows: Number(packets.occurrenceContextProfile.counts?.context_link_rows || 0),
    occurrence_context_profile_repeated_focus_rows: Number(packets.occurrenceContextProfile.counts?.repeated_focus_context_link_rows || 0),
    occurrence_context_profile_cross_frame_rows: Number(packets.occurrenceContextProfile.counts?.cross_frame_context_link_rows || 0),
    occurrence_context_profile_route_concentration_warning: Number(packets.occurrenceContextProfile.counts?.route_concentration_warning || 0),
    route_diversity_probe_occurrence_rows: Number(packets.routeDiversityProbe.counts?.occurrence_rows || 0),
    route_diversity_probe_route_ids: Number(packets.routeDiversityProbe.counts?.route_ids || 0),
    route_diversity_probe_max_route_share_basis_points: Number(packets.routeDiversityProbe.counts?.max_route_share_basis_points || 0),
    route_diversity_probe_concentration_warning: Number(packets.routeDiversityProbe.counts?.route_concentration_warning || 0),
    route_diversity_probe_semantic_independence_claim_allowed: Number(packets.routeDiversityProbe.counts?.semantic_independence_claim_allowed || 0),
    route_concentration_guardrail_surfaces: Number(packets.routeConcentrationGuardrail.counts?.guardrail_surfaces || 0),
    route_concentration_guardrail_single_route_surfaces: Number(packets.routeConcentrationGuardrail.counts?.guardrail_surfaces_with_single_route || 0),
    route_concentration_guardrail_max_share_surfaces: Number(packets.routeConcentrationGuardrail.counts?.guardrail_surfaces_with_max_share_10000 || 0),
    route_concentration_guardrail_warning_surfaces: Number(packets.routeConcentrationGuardrail.counts?.guardrail_surfaces_with_concentration_warning || 0),
    route_concentration_guardrail_semantic_independence_allowed_rows: Number(packets.routeConcentrationGuardrail.counts?.semantic_independence_allowed_rows || 0),
    route_concentration_guardrail_answer_authority_allowed_rows: Number(packets.routeConcentrationGuardrail.counts?.answer_authority_allowed_rows || 0),
    route_concentration_guardrail_route_ranking_allowed_rows: Number(packets.routeConcentrationGuardrail.counts?.route_ranking_allowed_rows || 0),
    route_concentration_guardrail_visible_answer_selection_allowed_rows: Number(packets.routeConcentrationGuardrail.counts?.visible_answer_selection_allowed_rows || 0),
    route_concentration_guardrail_reader_facing_rows: Number(packets.routeConcentrationGuardrail.counts?.reader_facing_rows || 0),
    route_concentration_guardrail_route_payload_field_hits: Number(packets.routeConcentrationGuardrail.counts?.route_payload_field_hits || 0),
    route_concentration_guardrail_forbidden_authority_field_hits: Number(packets.routeConcentrationGuardrail.counts?.forbidden_authority_field_hits || 0),
    route_concentration_guardrail_unresolved_route_ids: Number(packets.routeConcentrationGuardrail.counts?.unresolved_route_ids || 0),
    route_pointer_audit_rows: Number(packets.routePointerAudit.counts?.route_pointer_rows || 0),
    route_pointer_audit_route_ids: Number(packets.routePointerAudit.counts?.route_ids || 0),
    route_pointer_audit_resolved_route_ids: Number(packets.routePointerAudit.counts?.resolved_route_ids || 0),
    route_pointer_audit_unresolved_route_ids: Number(packets.routePointerAudit.counts?.unresolved_route_ids || 0),
    route_pointer_audit_support_rows_with_pointer: Number(packets.routePointerAudit.counts?.support_rows_with_pointer || 0),
    route_pointer_audit_support_rows: Number(packets.routePointerAudit.counts?.support_rows || 0),
    route_pointer_audit_navigation_rows_with_pointer: Number(packets.routePointerAudit.counts?.navigation_rows_with_pointer || 0),
    route_pointer_audit_navigation_rows: Number(packets.routePointerAudit.counts?.navigation_rows || 0),
    route_pointer_audit_planning_rows_with_pointer: Number(packets.routePointerAudit.counts?.planning_rows_with_pointer || 0),
    route_pointer_audit_planning_rows: Number(packets.routePointerAudit.counts?.planning_rows || 0),
    route_pointer_audit_reader_facing_rows: Number(packets.routePointerAudit.counts?.reader_facing_rows || 0),
    route_pointer_audit_route_payload_field_hits: Number(packets.routePointerAudit.counts?.route_payload_field_hits || 0),
    route_pointer_audit_forbidden_authority_field_hits: Number(packets.routePointerAudit.counts?.forbidden_authority_field_hits || 0),
    route_pointer_audit_route_metadata_field_hits: Number(packets.routePointerAudit.counts?.route_metadata_field_hits || 0),
    sample_gap_audit_gap_rows: Number(packets.sampleGapAudit.counts?.gap_rows || 0),
    sample_gap_audit_sample_rows: Number(packets.sampleGapAudit.counts?.sample_rows || 0),
    sample_gap_audit_sample_rows_with_usage_links: Number(packets.sampleGapAudit.counts?.sample_rows_with_usage_links || 0),
    sample_gap_audit_usage_tokens_not_in_sample: Number(packets.sampleGapAudit.counts?.usage_tokens_not_in_sample || 0),
    sample_gap_audit_selected_occurrence_links: Number(packets.sampleGapAudit.counts?.selected_occurrence_links || 0),
    sample_gap_audit_route_ids: Number(packets.sampleGapAudit.counts?.route_ids || 0),
    sample_gap_audit_sample_overlap_gap_visible: Number(packets.sampleGapAudit.counts?.sample_overlap_gap_visible || 0),
    crossmatch_neighbor_links: Number(packets.crossmatchNeighbors.counts?.neighbor_link_rows || 0),
    route_ids: Number(packets.occurrenceDetailIndex.counts?.route_ids || 0),
    unresolved_route_ids: Number(packets.occurrenceDetailIndex.counts?.unresolved_route_ids || 0),
    rows_with_source_link: Number(packets.occurrenceDetailIndex.counts?.rows_with_source_link || 0),
    rows_with_work_anchor: Number(packets.occurrenceDetailIndex.counts?.rows_with_work_anchor || 0),
    rows_with_hebrew_context: Number(packets.occurrenceDetailIndex.counts?.rows_with_hebrew_context || 0),
    rows_with_focus_marker: Number(packets.occurrenceDetailIndex.counts?.rows_with_focus_marker || 0),
    rows_with_license_metadata: Number(packets.occurrenceDetailIndex.counts?.rows_with_license_metadata || 0),
    rows_with_version_metadata: Number(packets.occurrenceDetailIndex.counts?.rows_with_version_metadata || 0),
    rows_with_all_bucket_links: Number(packets.occurrenceDetailIndex.counts?.rows_with_all_bucket_links || 0),
    observed_usage_only_rows: Number(packets.occurrenceDetailIndex.counts?.observed_usage_only_rows || 0),
    reader_facing_rows: sum(entries.map((entry) => entry.reader_facing_rows)),
    route_payload_field_hits: sum(entries.map((entry) => entry.route_payload_field_hits)),
    forbidden_authority_field_hits: sum(entries.map((entry) => entry.forbidden_authority_field_hits)),
    prohibited_consumer_uses: 10,
  };
}

function buildChecks(counts) {
  return [
    check('manifest_entries_present', counts.manifest_entries === 16 ? 'passed' : 'failed', `entries ${counts.manifest_entries}`),
    check('data_artifacts_exist', counts.data_artifacts_exist === counts.data_artifacts ? 'passed' : 'failed', `${counts.data_artifacts_exist}/${counts.data_artifacts}`),
    check('report_artifacts_exist', counts.report_artifacts_exist === counts.report_artifacts ? 'passed' : 'failed', `${counts.report_artifacts_exist}/${counts.report_artifacts}`),
    check('validator_scripts_exist', counts.validator_scripts_exist === counts.validator_scripts ? 'passed' : 'failed', `${counts.validator_scripts_exist}/${counts.validator_scripts}`),
    check('entries_passed', counts.passed_entries === counts.manifest_entries ? 'passed' : 'failed', `${counts.passed_entries}/${counts.manifest_entries}`),
    check('detail_alignment', counts.occurrence_detail_rows === counts.occurrence_link_rows && counts.occurrence_detail_rows > 0 ? 'passed' : 'failed', `detail/occurrence ${counts.occurrence_detail_rows}/${counts.occurrence_link_rows}`),
    check('metadata_complete', allEqual(counts.occurrence_detail_rows, [
      counts.rows_with_source_link,
      counts.rows_with_work_anchor,
      counts.rows_with_hebrew_context,
      counts.rows_with_focus_marker,
      counts.rows_with_license_metadata,
      counts.rows_with_version_metadata,
      counts.rows_with_all_bucket_links,
      counts.observed_usage_only_rows,
    ]) ? 'passed' : 'failed', `rows/source/work/context/focus/license/version/buckets/observed ${counts.occurrence_detail_rows}/${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_hebrew_context}/${counts.rows_with_focus_marker}/${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}/${counts.rows_with_all_bucket_links}/${counts.observed_usage_only_rows}`),
    check('route_ids_only', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('facet_index_present', counts.facet_index_facets > 0 && counts.facet_index_occurrence_rows === counts.occurrence_detail_rows && counts.facet_index_route_concentration_warning === 1 ? 'warning' : 'passed', `facets ${counts.facet_index_facets}; rows ${counts.facet_index_occurrence_rows}; concentration warning ${counts.facet_index_route_concentration_warning}`),
    check('context_token_index_present', counts.context_token_index_rows > 0 && counts.context_token_index_occurrence_rows === counts.occurrence_detail_rows && counts.context_token_index_occurrences > counts.occurrence_detail_rows && counts.context_token_index_cross_frame_rows > 0 && counts.context_token_index_route_concentration_warning === 1 ? 'warning' : 'failed', `tokens ${counts.context_token_index_rows}; occurrences ${counts.context_token_index_occurrences}; cross-frame ${counts.context_token_index_cross_frame_rows}; repeated focus ${counts.context_token_index_repeated_focus_occurrences}; concentration ${counts.context_token_index_route_concentration_warning}`),
    check('context_token_links_present', counts.context_token_link_rows === counts.context_token_link_focus_rows + counts.context_token_link_context_rows && counts.context_token_link_context_rows === counts.context_token_index_occurrences && counts.context_token_link_context_tokens === counts.context_token_index_rows && counts.context_token_link_occurrence_rows === counts.occurrence_detail_rows && counts.context_token_link_focus_rows === counts.occurrence_detail_rows && counts.context_token_link_context_rows > counts.occurrence_detail_rows && counts.context_token_link_cross_frame_rows > 0 && counts.context_token_link_route_concentration_warning === 1 ? 'warning' : 'failed', `links ${counts.context_token_link_rows}/${counts.context_token_link_focus_rows + counts.context_token_link_context_rows}; context ${counts.context_token_link_context_rows}/${counts.context_token_index_occurrences}; tokens ${counts.context_token_link_context_tokens}/${counts.context_token_index_rows}; occurrences ${counts.context_token_link_occurrence_rows}/${counts.occurrence_detail_rows}; focus/context/repeated ${counts.context_token_link_focus_rows}/${counts.context_token_link_context_rows}/${counts.context_token_link_repeated_focus_rows}; cross-frame ${counts.context_token_link_cross_frame_rows}; concentration ${counts.context_token_link_route_concentration_warning}`),
    check('context_token_occurrence_index_present', counts.context_token_occurrence_index_rows === counts.context_token_link_context_tokens && counts.context_token_occurrence_index_link_rows === counts.context_token_link_rows && counts.context_token_occurrence_index_occurrence_rows === counts.occurrence_detail_rows && counts.context_token_occurrence_index_focus_rows === counts.context_token_link_focus_rows && counts.context_token_occurrence_index_context_rows === counts.context_token_link_context_rows && counts.context_token_occurrence_index_cross_frame_rows > 0 && counts.context_token_occurrence_index_cross_frame_link_rows > 0 && counts.context_token_occurrence_index_route_concentration_warning === 1 ? 'warning' : 'failed', `rows/links/occurrences ${counts.context_token_occurrence_index_rows}/${counts.context_token_occurrence_index_link_rows}/${counts.context_token_occurrence_index_occurrence_rows}; focus/context/repeated ${counts.context_token_occurrence_index_focus_rows}/${counts.context_token_occurrence_index_context_rows}/${counts.context_token_occurrence_index_repeated_focus_rows}; cross-frame ${counts.context_token_occurrence_index_cross_frame_rows}/${counts.context_token_occurrence_index_cross_frame_link_rows}; concentration ${counts.context_token_occurrence_index_route_concentration_warning}`),
    check('occurrence_context_profile_present', counts.occurrence_context_profile_rows === counts.occurrence_detail_rows && counts.occurrence_context_profile_link_rows === counts.context_token_link_rows && counts.occurrence_context_profile_unique_context_tokens === counts.context_token_occurrence_index_rows && counts.occurrence_context_profile_reverse_index_rows === counts.context_token_occurrence_index_rows && counts.occurrence_context_profile_rows_with_reverse_index_ids === counts.occurrence_detail_rows && counts.occurrence_context_profile_rows_with_complete_reverse_index_mapping === counts.occurrence_detail_rows && counts.occurrence_context_profile_focus_rows === counts.context_token_link_focus_rows && counts.occurrence_context_profile_context_rows === counts.context_token_link_context_rows && counts.occurrence_context_profile_cross_frame_rows > 0 && counts.occurrence_context_profile_route_concentration_warning === 1 ? 'warning' : 'failed', `profiles/links/tokens/reverse ${counts.occurrence_context_profile_rows}/${counts.occurrence_context_profile_link_rows}/${counts.occurrence_context_profile_unique_context_tokens}/${counts.occurrence_context_profile_reverse_index_rows}; reverse-linked ${counts.occurrence_context_profile_rows_with_reverse_index_ids}/${counts.occurrence_context_profile_rows_with_complete_reverse_index_mapping}; focus/context/cross-frame ${counts.occurrence_context_profile_focus_rows}/${counts.occurrence_context_profile_context_rows}/${counts.occurrence_context_profile_cross_frame_rows}; concentration ${counts.occurrence_context_profile_route_concentration_warning}`),
    check('route_diversity_probe_present', counts.route_diversity_probe_occurrence_rows === counts.occurrence_detail_rows && counts.route_diversity_probe_route_ids === counts.route_ids && counts.route_diversity_probe_max_route_share_basis_points === 10000 && counts.route_diversity_probe_concentration_warning === 1 && counts.route_diversity_probe_semantic_independence_claim_allowed === 0 ? 'warning' : 'failed', `rows ${counts.route_diversity_probe_occurrence_rows}; route IDs ${counts.route_diversity_probe_route_ids}; max share ${counts.route_diversity_probe_max_route_share_basis_points}/10000; semantic independence allowed ${counts.route_diversity_probe_semantic_independence_claim_allowed}`),
    check('route_concentration_guardrail_present', counts.route_concentration_guardrail_surfaces === 7 && counts.route_concentration_guardrail_single_route_surfaces === counts.route_concentration_guardrail_surfaces && counts.route_concentration_guardrail_max_share_surfaces === counts.route_concentration_guardrail_surfaces && counts.route_concentration_guardrail_warning_surfaces === counts.route_concentration_guardrail_surfaces && counts.route_concentration_guardrail_semantic_independence_allowed_rows === 0 && counts.route_concentration_guardrail_answer_authority_allowed_rows === 0 && counts.route_concentration_guardrail_route_ranking_allowed_rows === 0 && counts.route_concentration_guardrail_visible_answer_selection_allowed_rows === 0 && counts.route_concentration_guardrail_reader_facing_rows === 0 && counts.route_concentration_guardrail_route_payload_field_hits === 0 && counts.route_concentration_guardrail_forbidden_authority_field_hits === 0 && counts.route_concentration_guardrail_unresolved_route_ids === 0 ? 'warning' : 'failed', `surfaces/single/max/warn ${counts.route_concentration_guardrail_surfaces}/${counts.route_concentration_guardrail_single_route_surfaces}/${counts.route_concentration_guardrail_max_share_surfaces}/${counts.route_concentration_guardrail_warning_surfaces}; semantic/answer/rank/visible ${counts.route_concentration_guardrail_semantic_independence_allowed_rows}/${counts.route_concentration_guardrail_answer_authority_allowed_rows}/${counts.route_concentration_guardrail_route_ranking_allowed_rows}/${counts.route_concentration_guardrail_visible_answer_selection_allowed_rows}; reader/payload/forbidden/unresolved ${counts.route_concentration_guardrail_reader_facing_rows}/${counts.route_concentration_guardrail_route_payload_field_hits}/${counts.route_concentration_guardrail_forbidden_authority_field_hits}/${counts.route_concentration_guardrail_unresolved_route_ids}`),
    check('route_pointer_audit_present', counts.route_pointer_audit_rows === 1 && counts.route_pointer_audit_route_ids === counts.route_pointer_audit_rows && counts.route_pointer_audit_resolved_route_ids === counts.route_pointer_audit_route_ids && counts.route_pointer_audit_unresolved_route_ids === 0 && counts.route_pointer_audit_support_rows_with_pointer === counts.route_pointer_audit_support_rows && counts.route_pointer_audit_navigation_rows_with_pointer === counts.route_pointer_audit_navigation_rows && counts.route_pointer_audit_planning_rows_with_pointer === counts.route_pointer_audit_planning_rows && counts.route_pointer_audit_reader_facing_rows === 0 && counts.route_pointer_audit_route_payload_field_hits === 0 && counts.route_pointer_audit_forbidden_authority_field_hits === 0 && counts.route_pointer_audit_route_metadata_field_hits === 0 ? 'warning' : 'failed', `routes/resolved/unresolved ${counts.route_pointer_audit_route_ids}/${counts.route_pointer_audit_resolved_route_ids}/${counts.route_pointer_audit_unresolved_route_ids}; support ${counts.route_pointer_audit_support_rows_with_pointer}/${counts.route_pointer_audit_support_rows}; navigation ${counts.route_pointer_audit_navigation_rows_with_pointer}/${counts.route_pointer_audit_navigation_rows}; planning ${counts.route_pointer_audit_planning_rows_with_pointer}/${counts.route_pointer_audit_planning_rows}; reader/payload/forbidden/metadata ${counts.route_pointer_audit_reader_facing_rows}/${counts.route_pointer_audit_route_payload_field_hits}/${counts.route_pointer_audit_forbidden_authority_field_hits}/${counts.route_pointer_audit_route_metadata_field_hits}`),
    check('sample_gap_audit_present', counts.sample_gap_audit_gap_rows > 0 && counts.sample_gap_audit_sample_rows > 0 && counts.sample_gap_audit_sample_rows_with_usage_links === 0 && counts.sample_gap_audit_usage_tokens_not_in_sample > 0 && counts.sample_gap_audit_selected_occurrence_links > 0 && counts.sample_gap_audit_route_ids === counts.route_ids && counts.sample_gap_audit_sample_overlap_gap_visible === 1 ? 'warning' : 'failed', `gap rows ${counts.sample_gap_audit_gap_rows}; sample usage links ${counts.sample_gap_audit_sample_rows_with_usage_links}/${counts.sample_gap_audit_sample_rows}; usage tokens not in sample ${counts.sample_gap_audit_usage_tokens_not_in_sample}; selected links ${counts.sample_gap_audit_selected_occurrence_links}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route-payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Consumer Manifest',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Manifest entries: ${artifact.counts.manifest_entries}`,
    `- Data artifacts present: ${artifact.counts.data_artifacts_exist}/${artifact.counts.data_artifacts}`,
    `- Report artifacts present: ${artifact.counts.report_artifacts_exist}/${artifact.counts.report_artifacts}`,
    `- Validator scripts present: ${artifact.counts.validator_scripts_exist}/${artifact.counts.validator_scripts}`,
    `- Occurrence detail rows / occurrence link rows: ${artifact.counts.occurrence_detail_rows}/${artifact.counts.occurrence_link_rows}`,
    `- Source-ref/work/provenance buckets: ${artifact.counts.source_ref_buckets}/${artifact.counts.work_buckets}/${artifact.counts.provenance_buckets}`,
    `- Facet index facets / occurrence rows / concentration warning: ${artifact.counts.facet_index_facets}/${artifact.counts.facet_index_occurrence_rows}/${artifact.counts.facet_index_route_concentration_warning}`,
    `- Context-token rows / appearances / cross-frame rows: ${artifact.counts.context_token_index_rows}/${artifact.counts.context_token_index_occurrences}/${artifact.counts.context_token_index_cross_frame_rows}`,
    `- Context-token link rows / focus-context-repeated / cross-frame rows: ${artifact.counts.context_token_link_rows}/${artifact.counts.context_token_link_focus_rows}-${artifact.counts.context_token_link_context_rows}-${artifact.counts.context_token_link_repeated_focus_rows}/${artifact.counts.context_token_link_cross_frame_rows}`,
    `- Context-token occurrence index rows / links / cross-frame rows: ${artifact.counts.context_token_occurrence_index_rows}/${artifact.counts.context_token_occurrence_index_link_rows}/${artifact.counts.context_token_occurrence_index_cross_frame_rows}`,
    `- Occurrence context profile rows / links / reverse-linked rows: ${artifact.counts.occurrence_context_profile_rows}/${artifact.counts.occurrence_context_profile_link_rows}/${artifact.counts.occurrence_context_profile_rows_with_reverse_index_ids}`,
    `- Route diversity probe rows / route IDs / max share / concentration warning: ${artifact.counts.route_diversity_probe_occurrence_rows}/${artifact.counts.route_diversity_probe_route_ids}/${artifact.counts.route_diversity_probe_max_route_share_basis_points}/10000/${artifact.counts.route_diversity_probe_concentration_warning}`,
    `- Route concentration guardrail surfaces / warnings / semantic allowed: ${artifact.counts.route_concentration_guardrail_surfaces}/${artifact.counts.route_concentration_guardrail_warning_surfaces}/${artifact.counts.route_concentration_guardrail_semantic_independence_allowed_rows}`,
    `- Route pointer audit routes / support / navigation / payload hits: ${artifact.counts.route_pointer_audit_route_ids}/${artifact.counts.route_pointer_audit_support_rows_with_pointer}-${artifact.counts.route_pointer_audit_support_rows}/${artifact.counts.route_pointer_audit_navigation_rows_with_pointer}-${artifact.counts.route_pointer_audit_navigation_rows}/${artifact.counts.route_pointer_audit_route_payload_field_hits}`,
    `- Sample gap audit rows / current sample usage links / usage tokens not in sample: ${artifact.counts.sample_gap_audit_gap_rows}/${artifact.counts.sample_gap_audit_sample_rows_with_usage_links}/${artifact.counts.sample_gap_audit_usage_tokens_not_in_sample}`,
    `- Crossmatch neighbor links: ${artifact.counts.crossmatch_neighbor_links}`,
    `- Route IDs / unresolved: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Status Semantics',
    '',
    `- Machine status axis: ${artifact.status_semantics.machine_status_axis}`,
    `- Machine complete label: ${artifact.status_semantics.machine_complete_label}`,
    `- Machine review status: ${artifact.status_semantics.machine_review_status}`,
    `- Verified review status reserved: ${artifact.status_semantics.verified_review_status_reserved}`,
    `- Usage status scope: ${artifact.status_semantics.usage_status_scope}`,
    `- Answer role preserved: ${artifact.status_semantics.answer_role_preserved}`,
    `- Source/license rows preserved: ${artifact.status_semantics.source_license_rows_preserved}`,
    `- Multi-answer warnings preserved: ${artifact.status_semantics.multi_answer_warnings_preserved}`,
    '',
    '## Consumer Contract',
    '',
    `- Required row label: ${artifact.consumer_contract.required_row_label}`,
    `- Ambiguous rows policy: ${artifact.consumer_contract.ambiguous_rows_policy}`,
    `- Route payload rule: ${artifact.consumer_contract.downstream_route_payload_rule}`,
    '',
    '## Manifest Entries',
    '',
    '| artifact | status | rows/count | safe role |',
    '|---|---|---:|---|',
    ...artifact.manifest_entries.map((entry) => `| ${mdCell(entry.artifact_id)} | ${entry.status} | ${entry.primary_count} | ${mdCell(entry.safe_consumer_role)} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Boundary',
    '',
    'This manifest is a consumption guide for Agent 3 selected usage-navigation artifacts only. It does not make usage rows definitions, does not rank or select visible answers, does not copy Agent 2 payloads, does not accept public UI rendering, and does not support publication or accepted translation text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function assertArtifact(artifact, artifactType, relativePath) {
  if (artifact.artifact_type !== artifactType) {
    throw new Error(`${relativePath} is not ${artifactType}`);
  }
}

function countForbiddenKeys(value, keys) {
  const keySet = new Set(keys);
  let hits = 0;
  walk(value);
  return hits;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (keySet.has(key)) hits += 1;
      walk(child);
    }
  }
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--occurrence-links=')) parsed.occurrenceLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-resolution=')) parsed.routeResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--crossmatch-neighbors=')) parsed.crossmatchNeighbors = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-ref-buckets=')) parsed.sourceRefBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--work-buckets=')) parsed.workBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--provenance-buckets=')) parsed.provenanceBuckets = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--occurrence-detail-index=')) parsed.occurrenceDetailIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--facet-index=')) parsed.facetIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-token-index=')) parsed.contextTokenIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-token-links=')) parsed.contextTokenLinks = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--context-token-occurrence-index=')) parsed.contextTokenOccurrenceIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--occurrence-context-profile=')) parsed.occurrenceContextProfile = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-diversity-probe=')) parsed.routeDiversityProbe = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-concentration-guardrail=')) parsed.routeConcentrationGuardrail = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--route-pointer-audit=')) parsed.routePointerAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--sample-gap-audit=')) parsed.sampleGapAudit = cleanRelativePath(valueAfterEquals(arg));
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
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}
