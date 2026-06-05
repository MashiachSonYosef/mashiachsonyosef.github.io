#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-queue-ready-packet.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
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
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_queue_ready_packet') {
  issues.push('artifact_type must be definition_workbench_usage_queue_ready_packet');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');
if (packet.target_gate !== 'definition_workbench_gate') issues.push('target_gate must be definition_workbench_gate');

validateSubmissionBoundary(packet.submission_boundary || {});
validatePublicationBoundary(packet.publication_boundary || {});
validateStatusSemanticsSummary(packet.status_semantics_summary || {});
validateQueueContract(packet.queue_contract_snapshot || {});
validateGoalBoardSnapshot(packet.goal_board_snapshot || {});
validateQueueDraft(packet.queue_entry_draft || {});
validateSourcePacketSummary(packet.source_packet_summary || {});
validateOccurrenceLinksSummary(packet.occurrence_links_summary || {});
validateRouteResolutionSummary(packet.route_resolution_summary || {});
validateCrossmatchNeighborsSummary(packet.crossmatch_neighbors_summary || {});
validateSourceRefBucketsSummary(packet.source_ref_buckets_summary || {});
validateWorkBucketsSummary(packet.work_buckets_summary || {});
validateProvenanceBucketsSummary(packet.provenance_buckets_summary || {});
validateOccurrenceDetailIndexSummary(packet.occurrence_detail_index_summary || {});
validateFacetIndexSummary(packet.facet_index_summary || {});
validateContextTokenIndexSummary(packet.context_token_index_summary || {});
validateContextTokenLinksSummary(packet.context_token_links_summary || {});
validateContextTokenOccurrenceIndexSummary(packet.context_token_occurrence_index_summary || {});
validateOccurrenceContextProfileSummary(packet.occurrence_context_profile_summary || {});
validateRouteDiversityProbeSummary(packet.route_diversity_probe_summary || {});
validateRouteConcentrationGuardrailSummary(packet.route_concentration_guardrail_summary || {});
validateRoutePointerAuditSummary(packet.route_pointer_audit_summary || {});
validateSampleGapAuditSummary(packet.sample_gap_audit_summary || {});
validateConsumerManifestSummary(packet.consumer_manifest_summary || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage queue-ready packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage queue-ready packet validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage queue-ready packet validation passed.');
}
console.log(`Required fields: ${packet.counts.required_queue_fields_present}/${packet.counts.required_queue_fields}; evidence artifacts: ${packet.counts.evidence_artifacts_exist}/${packet.counts.evidence_artifacts}; submitted: ${packet.counts.submitted_to_agent6}.`);

function validateSubmissionBoundary(boundary) {
  const expectedTrue = [
    'queue_ready_only',
    'agent3_does_not_submit_to_agent6_queue',
  ];
  const expectedFalse = [
    'control_queue_mutated',
    'submitted_to_agent6',
    'worker_report_terminal_status_allowed',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`submission_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`submission_boundary.${key} must be false`);
  }
  if (boundary.intended_submitter !== 'Agent 5') issues.push('submission_boundary.intended_submitter must be Agent 5');
}

function validatePublicationBoundary(boundary) {
  const expectedTrue = [
    'queue_ready_only',
    'warning_status_blocks_publication_claim',
  ];
  const expectedFalse = [
    'reader_facing',
    'ui_assignment',
    'publication_claim',
    'clears_publication_readiness',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'source_publication',
    'public_lookup_artifact',
    'control_queue_mutated',
    'submitted_to_agent6',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`publication_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`publication_boundary.${key} must be false`);
  }
  if (boundary.boundary_status !== 'blocked_no_render') {
    issues.push('publication_boundary.boundary_status must be blocked_no_render');
  }
  const doesNotClear = Array.isArray(boundary.does_not_clear) ? boundary.does_not_clear.join(' | ') : '';
  for (const required of [
    'ui_assignment',
    'reviewed_lexical_authority',
    'accepted_translation',
    'source_publication',
    'public_lookup_publication',
    'publication_readiness',
    'Agent_6_acceptance',
  ]) {
    if (!doesNotClear.includes(required)) issues.push(`publication_boundary.does_not_clear must include ${required}`);
  }
}

function validateStatusSemanticsSummary(summary) {
  if (summary.machine_status_axis !== 'machine_route_shape_status_not_review_authority') {
    issues.push('status_semantics_summary.machine_status_axis must preserve machine route-shape status axis');
  }
  if (summary.machine_complete_label !== 'single_answer_source_complete') {
    issues.push('status_semantics_summary.machine_complete_label must be single_answer_source_complete');
  }
  if (summary.machine_review_status !== 'unreviewed_machine_sample') {
    issues.push('status_semantics_summary.machine_review_status must be unreviewed_machine_sample');
  }
  if (summary.verified_review_status_reserved !== true) {
    issues.push('status_semantics_summary.verified_review_status_reserved must be true');
  }
  if (!String(summary.usage_status_scope || '').includes('not answer authority') || !String(summary.usage_status_scope || '').includes('not reviewed lexical authority')) {
    issues.push('status_semantics_summary.usage_status_scope must block answer/review authority overclaim');
  }
  for (const key of [
    'answer_role_preserved',
    'source_license_rows_preserved',
    'multi_answer_warnings_preserved',
    'publication_boundary_preserved',
  ]) {
    if (summary[key] !== true) issues.push(`status_semantics_summary.${key} must be true`);
  }
  for (const key of [
    'consumer_manifest_reviewed_lexical_authority',
    'consumer_manifest_accepted_translation_output',
    'consumer_manifest_publication_readiness',
  ]) {
    if (summary[key] !== false) issues.push(`status_semantics_summary.${key} must be false`);
  }
}

function validateQueueContract(contract) {
  if (!Array.isArray(contract.required_request_fields) || contract.required_request_fields.length < 9) {
    issues.push('queue_contract_snapshot.required_request_fields must include Agent 6 intake fields');
  }
  if (!Array.isArray(contract.allowed_submitters) || !contract.allowed_submitters.includes('Agent 5')) {
    issues.push('queue_contract_snapshot.allowed_submitters must include Agent 5');
  }
  if (contract.publication_global_status !== 'blocked_no_render') {
    warnings.push('publication_global_status is not blocked_no_render');
  }
}

function validateGoalBoardSnapshot(snapshot) {
  if (snapshot.goal_id !== 'agent3-definition-occurrence-links') {
    issues.push('goal_board_snapshot.goal_id must be agent3-definition-occurrence-links');
  }
  if (!['active', 'evidence-ready', 'awaiting-Agent-6'].includes(snapshot.goal_status)) {
    warnings.push(`goal status is ${snapshot.goal_status || 'missing'}`);
  }
  if (snapshot.acceptance_owner !== 'Agent 6') issues.push('goal_board_snapshot.acceptance_owner must be Agent 6');
  if (!Array.isArray(snapshot.worker_report_may_set) || !snapshot.worker_report_may_set.includes('evidence-ready')) {
    issues.push('goal_board_snapshot.worker_report_may_set must include evidence-ready');
  }
}

function validateQueueDraft(draft) {
  const required = packet.queue_contract_snapshot?.required_request_fields || [];
  for (const field of required) {
    if (draft[field] === undefined || draft[field] === null || draft[field] === '') {
      issues.push(`queue_entry_draft.${field} is required by Agent 6 queue contract`);
    }
  }
  if (draft.request_id !== 'agent6-definition-workbench-usage-occurrence-links') {
    issues.push('queue_entry_draft.request_id is unexpected');
  }
  if (draft.submitted_by !== 'Agent 5') issues.push('queue_entry_draft.submitted_by must be Agent 5 for queue-copy template');
  if (!packet.queue_contract_snapshot?.allowed_submitters?.includes(draft.submitted_by)) {
    issues.push('queue_entry_draft.submitted_by is not allowed by current queue contract');
  }
  if (draft.gate !== 'definition_workbench_gate') issues.push('queue_entry_draft.gate must be definition_workbench_gate');
  if (draft.status !== 'queue_template_not_submitted') issues.push('queue_entry_draft.status must be queue_template_not_submitted');
  if (!Array.isArray(draft.evidence_artifacts) || draft.evidence_artifacts.length < 8) {
    issues.push('queue_entry_draft.evidence_artifacts must contain machine-readable packet chain paths');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-occurrence-links.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include occurrence links packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-occurrence-links.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include occurrence links report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-route-resolution.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route resolution packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-route-resolution.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route resolution report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-crossmatch-neighbors.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include crossmatch neighbors packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-crossmatch-neighbors.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include crossmatch neighbors report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-source-ref-buckets.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include source-ref buckets packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-source-ref-buckets.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include source-ref buckets report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-work-buckets.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include work buckets packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-work-buckets.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include work buckets report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-provenance-buckets.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include provenance buckets packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-provenance-buckets.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include provenance buckets report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-occurrence-detail-index.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include occurrence detail index packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-occurrence-detail-index.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include occurrence detail index report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-facet-index.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include facet index packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-facet-index.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include facet index report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-context-token-index.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include context-token index packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-context-token-index.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include context-token index report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-context-token-links.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include context-token links packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-context-token-links.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include context-token links report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-route-diversity-probe.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route diversity probe packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-route-diversity-probe.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route diversity probe report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-route-concentration-guardrail.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route concentration guardrail packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-route-concentration-guardrail.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route concentration guardrail report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-route-pointer-audit.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route pointer audit packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-route-pointer-audit.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include route pointer audit report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-sample-gap-audit.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include sample gap audit packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-sample-gap-audit.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include sample gap audit report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-consumer-manifest.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include consumer manifest packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-consumer-manifest.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include consumer manifest report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-planning-packet.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include usage planning packet');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-planning-packet.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include usage planning report');
  }
  if (!draft.evidence_artifacts.includes('data/definitions/definition-workbench-usage-anchor-audit.json')) {
    issues.push('queue_entry_draft.evidence_artifacts must include usage anchor audit');
  }
  if (!draft.evidence_artifacts.includes('reports/definition-workbench-usage-anchor-audit.md')) {
    issues.push('queue_entry_draft.evidence_artifacts must include usage anchor audit report');
  }
  if (!String(draft.claimed_boundary || '').includes('Usage-navigation occurrence-link planning evidence only')) {
    issues.push('queue_entry_draft.claimed_boundary must preserve usage-navigation-only boundary');
  }
  const mustNot = Array.isArray(draft.what_must_not_be_accepted) ? draft.what_must_not_be_accepted.join(' | ') : '';
  for (const requiredClaim of ['usage rows as definitions', 'reviewed lexical authority', 'publication readiness', 'accepted translation text']) {
    if (!mustNot.includes(requiredClaim)) issues.push(`queue_entry_draft.what_must_not_be_accepted must include ${requiredClaim}`);
  }
}

function validateSourcePacketSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('source_packet_summary.status must be passed or pass_with_warnings');
  }
  const proofRows = Number(summary.proof_occurrence_rows || 0);
  if (proofRows < 1) issues.push('source_packet_summary.proof_occurrence_rows must be positive');
  for (const key of [
    'proof_rows_with_source',
    'proof_rows_with_work_anchor',
    'proof_rows_with_context',
    'proof_rows_with_license',
    'proof_rows_with_version',
    'proof_rows_with_route_ids',
    'proof_rows_with_hebrew_token',
    'proof_rows_with_hebrew_context',
    'proof_rows_with_focus_marker',
  ]) {
    if (Number(summary[key] || 0) !== proofRows) issues.push(`source_packet_summary.${key} must equal proof_occurrence_rows`);
  }
  if (Number(summary.proof_mojibake_rows || 0) !== 0) issues.push('source_packet_summary.proof_mojibake_rows must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('source_packet_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) issues.push('source_packet_summary.route_payload_field_hits must be 0');
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) issues.push('source_packet_summary.forbidden_authority_field_hits must be 0');
}

function validateOccurrenceLinksSummary(summary) {
  if (summary.status !== 'passed') issues.push('occurrence_links_summary.status must be passed');
  const rows = Number(summary.occurrence_link_rows || 0);
  if (rows < 1) issues.push('occurrence_links_summary.occurrence_link_rows must be positive');
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`occurrence_links_summary.${key} must equal occurrence_link_rows`);
  }
  if (Number(summary.audit_only_ambiguous_rows_available || 0) <= 0) {
    issues.push('occurrence_links_summary.audit_only_ambiguous_rows_available must be positive');
  }
  if (Number(summary.audit_only_ambiguous_rows_emitted || 0) !== 0) {
    issues.push('occurrence_links_summary.audit_only_ambiguous_rows_emitted must be 0');
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('occurrence_links_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) issues.push('occurrence_links_summary.route_payload_field_hits must be 0');
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('occurrence_links_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateRouteResolutionSummary(summary) {
  if (summary.status !== 'passed') issues.push('route_resolution_summary.status must be passed');
  const rows = Number(summary.occurrence_route_rows || 0);
  const routeIds = Number(summary.route_ids || 0);
  if (rows < 1) issues.push('route_resolution_summary.occurrence_route_rows must be positive');
  if (routeIds < 1) issues.push('route_resolution_summary.route_ids must be positive');
  if (Number(summary.resolved_route_ids || 0) !== routeIds) {
    issues.push('route_resolution_summary.resolved_route_ids must equal route_ids');
  }
  if (Number(summary.unresolved_route_ids || 0) !== 0) {
    issues.push('route_resolution_summary.unresolved_route_ids must be 0');
  }
  if (Number(summary.resolved_occurrence_route_rows || 0) !== rows) {
    issues.push('route_resolution_summary.resolved_occurrence_route_rows must equal occurrence_route_rows');
  }
  if (Number(summary.unresolved_occurrence_route_rows || 0) !== 0) {
    issues.push('route_resolution_summary.unresolved_occurrence_route_rows must be 0');
  }
  if (Number(summary.answer_eligible_rows_with_source_license_profile || 0) !== Number(summary.answer_eligible_occurrence_route_rows || 0)) {
    issues.push('route_resolution_summary answer-eligible rows must all carry source/license profile');
  }
  if (Number(summary.source_license_profile_complete_rows || 0) !== rows) {
    issues.push('route_resolution_summary.source_license_profile_complete_rows must equal occurrence_route_rows');
  }
  if (Number(summary.forbidden_license_profile_rows || 0) !== 0) {
    issues.push('route_resolution_summary.forbidden_license_profile_rows must be 0');
  }
  if (Number(summary.future_translation_output_blocked_rows || 0) !== rows) {
    issues.push('route_resolution_summary.future_translation_output_blocked_rows must equal occurrence_route_rows');
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('route_resolution_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('route_resolution_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('route_resolution_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateCrossmatchNeighborsSummary(summary) {
  if (summary.status !== 'passed') issues.push('crossmatch_neighbors_summary.status must be passed');
  const rows = Number(summary.source_occurrence_rows || 0);
  const links = Number(summary.neighbor_link_rows || 0);
  if (rows < 1) issues.push('crossmatch_neighbors_summary.source_occurrence_rows must be positive');
  if (links < 1) issues.push('crossmatch_neighbors_summary.neighbor_link_rows must be positive');
  if (Number(summary.same_frame_neighbor_links || 0) < 1) {
    issues.push('crossmatch_neighbors_summary.same_frame_neighbor_links must be positive');
  }
  if (Number(summary.bridge_frame_neighbor_links || 0) < 1) {
    issues.push('crossmatch_neighbors_summary.bridge_frame_neighbor_links must be positive');
  }
  if (Number(summary.same_frame_neighbor_links || 0) + Number(summary.bridge_frame_neighbor_links || 0) !== links) {
    issues.push('crossmatch_neighbors_summary same-frame plus bridge links must equal neighbor links');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('crossmatch_neighbors_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) issues.push('crossmatch_neighbors_summary.unresolved_route_ids must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('crossmatch_neighbors_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('crossmatch_neighbors_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('crossmatch_neighbors_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateSourceRefBucketsSummary(summary) {
  if (summary.status !== 'passed') issues.push('source_ref_buckets_summary.status must be passed');
  const sourceBuckets = Number(summary.source_ref_buckets || 0);
  const sourceClusterBuckets = Number(summary.source_cluster_buckets || 0);
  const rows = Number(summary.occurrence_rows || 0);
  if (sourceBuckets < 1) issues.push('source_ref_buckets_summary.source_ref_buckets must be positive');
  if (sourceClusterBuckets < sourceBuckets) issues.push('source_ref_buckets_summary.source_cluster_buckets must be at least source_ref_buckets');
  if (rows < 1) issues.push('source_ref_buckets_summary.occurrence_rows must be positive');
  if (Number(summary.duplicate_source_ref_buckets || 0) < 1) {
    issues.push('source_ref_buckets_summary.duplicate_source_ref_buckets must be positive');
  }
  if (Number(summary.duplicate_source_ref_rows || 0) <= Number(summary.duplicate_source_ref_buckets || 0)) {
    issues.push('source_ref_buckets_summary.duplicate_source_ref_rows must exceed duplicate buckets');
  }
  if (Number(summary.cross_cluster_source_ref_buckets || 0) < 1) {
    issues.push('source_ref_buckets_summary.cross_cluster_source_ref_buckets must be positive');
  }
  if (Number(summary.cross_cluster_source_ref_rows || 0) < 1) {
    issues.push('source_ref_buckets_summary.cross_cluster_source_ref_rows must be positive');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('source_ref_buckets_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) issues.push('source_ref_buckets_summary.unresolved_route_ids must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('source_ref_buckets_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('source_ref_buckets_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('source_ref_buckets_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateWorkBucketsSummary(summary) {
  if (summary.status !== 'passed') issues.push('work_buckets_summary.status must be passed');
  const workBuckets = Number(summary.work_buckets || 0);
  const workFrameBuckets = Number(summary.work_frame_buckets || 0);
  const rows = Number(summary.occurrence_rows || 0);
  if (workBuckets < 1) issues.push('work_buckets_summary.work_buckets must be positive');
  if (workFrameBuckets < workBuckets) issues.push('work_buckets_summary.work_frame_buckets must be at least work_buckets');
  if (rows < 1) issues.push('work_buckets_summary.occurrence_rows must be positive');
  if (Number(summary.source_ref_count || 0) < 1) issues.push('work_buckets_summary.source_ref_count must be positive');
  if (Number(summary.multi_source_ref_work_buckets || 0) < 1) {
    issues.push('work_buckets_summary.multi_source_ref_work_buckets must be positive');
  }
  if (Number(summary.multi_source_ref_work_rows || 0) <= Number(summary.multi_source_ref_work_buckets || 0)) {
    issues.push('work_buckets_summary.multi_source_ref_work_rows must exceed multi-source buckets');
  }
  if (Number(summary.multi_frame_work_buckets || 0) < 1) {
    issues.push('work_buckets_summary.multi_frame_work_buckets must be positive');
  }
  if (Number(summary.multi_frame_work_rows || 0) <= Number(summary.multi_frame_work_buckets || 0)) {
    issues.push('work_buckets_summary.multi_frame_work_rows must exceed multi-frame buckets');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('work_buckets_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) issues.push('work_buckets_summary.unresolved_route_ids must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('work_buckets_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('work_buckets_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('work_buckets_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateProvenanceBucketsSummary(summary) {
  if (summary.status !== 'passed') issues.push('provenance_buckets_summary.status must be passed');
  const provenanceBuckets = Number(summary.provenance_buckets || 0);
  const provenanceFrameBuckets = Number(summary.provenance_frame_buckets || 0);
  const rows = Number(summary.occurrence_rows || 0);
  if (provenanceBuckets < 1) issues.push('provenance_buckets_summary.provenance_buckets must be positive');
  if (provenanceFrameBuckets < provenanceBuckets) {
    issues.push('provenance_buckets_summary.provenance_frame_buckets must be at least provenance_buckets');
  }
  if (rows < 1) issues.push('provenance_buckets_summary.occurrence_rows must be positive');
  if (Number(summary.work_count || 0) < 1) issues.push('provenance_buckets_summary.work_count must be positive');
  if (Number(summary.source_ref_count || 0) < 1) issues.push('provenance_buckets_summary.source_ref_count must be positive');
  if (Number(summary.license_count || 0) <= 1) issues.push('provenance_buckets_summary.license_count must show more than one license');
  if (Number(summary.version_source_count || 0) <= 1) {
    issues.push('provenance_buckets_summary.version_source_count must show more than one version source');
  }
  if (Number(summary.multi_work_provenance_buckets || 0) < 1) {
    issues.push('provenance_buckets_summary.multi_work_provenance_buckets must be positive');
  }
  if (Number(summary.multi_work_provenance_rows || 0) <= Number(summary.multi_work_provenance_buckets || 0)) {
    issues.push('provenance_buckets_summary.multi_work_provenance_rows must exceed multi-work buckets');
  }
  if (Number(summary.multi_frame_provenance_buckets || 0) < 1) {
    issues.push('provenance_buckets_summary.multi_frame_provenance_buckets must be positive');
  }
  if (Number(summary.multi_frame_provenance_rows || 0) <= Number(summary.multi_frame_provenance_buckets || 0)) {
    issues.push('provenance_buckets_summary.multi_frame_provenance_rows must exceed multi-frame buckets');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('provenance_buckets_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) issues.push('provenance_buckets_summary.unresolved_route_ids must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('provenance_buckets_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('provenance_buckets_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('provenance_buckets_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateOccurrenceDetailIndexSummary(summary) {
  if (summary.status !== 'passed') issues.push('occurrence_detail_index_summary.status must be passed');
  const rows = Number(summary.occurrence_detail_rows || 0);
  if (rows < 1) issues.push('occurrence_detail_index_summary.occurrence_detail_rows must be positive');
  if (Number(summary.source_ref_count || 0) < 1) issues.push('occurrence_detail_index_summary.source_ref_count must be positive');
  if (Number(summary.work_count || 0) < 1) issues.push('occurrence_detail_index_summary.work_count must be positive');
  if (Number(summary.license_count || 0) <= 1) issues.push('occurrence_detail_index_summary.license_count must show more than one license');
  if (Number(summary.version_source_count || 0) <= 1) {
    issues.push('occurrence_detail_index_summary.version_source_count must show more than one version source');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('occurrence_detail_index_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) issues.push('occurrence_detail_index_summary.unresolved_route_ids must be 0');
  for (const key of [
    'rows_with_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_all_bucket_links',
    'observed_usage_only_rows',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`occurrence_detail_index_summary.${key} must equal occurrence_detail_rows`);
  }
  if (Number(summary.neighbor_links || 0) < 1) issues.push('occurrence_detail_index_summary.neighbor_links must be positive');
  if (Number(summary.same_frame_neighbor_links || 0) < 1) {
    issues.push('occurrence_detail_index_summary.same_frame_neighbor_links must be positive');
  }
  if (Number(summary.bridge_frame_neighbor_links || 0) < 1) {
    issues.push('occurrence_detail_index_summary.bridge_frame_neighbor_links must be positive');
  }
  if (Number(summary.same_frame_neighbor_links || 0) + Number(summary.bridge_frame_neighbor_links || 0) !== Number(summary.neighbor_links || 0)) {
    issues.push('occurrence_detail_index_summary same-frame plus bridge links must equal neighbor links');
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('occurrence_detail_index_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('occurrence_detail_index_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('occurrence_detail_index_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateFacetIndexSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('facet_index_summary.status must be passed or pass_with_warnings');
  }
  const rows = Number(summary.occurrence_rows || 0);
  if (rows < 1) issues.push('facet_index_summary.occurrence_rows must be positive');
  if (Number(summary.facet_groups || 0) !== 10) issues.push('facet_index_summary.facet_groups must be 10');
  if (Number(summary.facets_total || 0) < Number(summary.facet_groups || 0)) {
    issues.push('facet_index_summary.facets_total must be at least facet_groups');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('facet_index_summary.route_ids must be positive');
  if (Number(summary.max_route_share_basis_points || 0) !== 10000) {
    issues.push('facet_index_summary.max_route_share_basis_points must be 10000 for current selected route concentration');
  }
  if (Number(summary.route_concentration_warning || 0) !== 1) {
    issues.push('facet_index_summary.route_concentration_warning must be 1');
  }
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`facet_index_summary.${key} must equal occurrence_rows`);
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('facet_index_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('facet_index_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('facet_index_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateContextTokenIndexSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('context_token_index_summary.status must be passed or pass_with_warnings');
  }
  const rows = Number(summary.occurrence_rows || 0);
  if (rows < 1) issues.push('context_token_index_summary.occurrence_rows must be positive');
  if (Number(summary.context_token_rows || 0) < 1) {
    issues.push('context_token_index_summary.context_token_rows must be positive');
  }
  if (Number(summary.context_token_occurrences || 0) <= rows) {
    issues.push('context_token_index_summary.context_token_occurrences must exceed occurrence_rows');
  }
  if (Number(summary.cross_frame_context_token_rows || 0) < 1) {
    issues.push('context_token_index_summary.cross_frame_context_token_rows must be positive');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('context_token_index_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) {
    issues.push('context_token_index_summary.unresolved_route_ids must be 0');
  }
  if (Number(summary.max_route_share_basis_points || 0) !== 10000) {
    issues.push('context_token_index_summary.max_route_share_basis_points must be 10000 for current selected route concentration');
  }
  if (Number(summary.route_concentration_warning || 0) !== 1) {
    issues.push('context_token_index_summary.route_concentration_warning must be 1');
  }
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`context_token_index_summary.${key} must equal occurrence_rows`);
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('context_token_index_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('context_token_index_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('context_token_index_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateContextTokenLinksSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('context_token_links_summary.status must be passed or pass_with_warnings');
  }
  const rows = Number(summary.context_token_link_rows || 0);
  if (rows < 1) issues.push('context_token_links_summary.context_token_link_rows must be positive');
  if (rows !== Number(summary.focus_marked_link_rows || 0) + Number(summary.context_role_link_rows || 0)) {
    issues.push('context_token_links_summary.context_token_link_rows must equal focus plus context link rows');
  }
  if (Number(summary.context_token_rows || 0) < 1) {
    issues.push('context_token_links_summary.context_token_rows must be positive');
  }
  if (Number(summary.occurrence_rows || 0) < 1) {
    issues.push('context_token_links_summary.occurrence_rows must be positive');
  }
  if (Number(summary.focus_marked_link_rows || 0) !== Number(summary.occurrence_rows || 0)) {
    issues.push('context_token_links_summary.focus_marked_link_rows must equal occurrence_rows');
  }
  if (Number(summary.context_role_link_rows || 0) <= Number(summary.occurrence_rows || 0)) {
    issues.push('context_token_links_summary.context_role_link_rows must exceed occurrence_rows');
  }
  if (Number(summary.cross_frame_context_token_links || 0) < 1) {
    issues.push('context_token_links_summary.cross_frame_context_token_links must be positive');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('context_token_links_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) {
    issues.push('context_token_links_summary.unresolved_route_ids must be 0');
  }
  if (Number(summary.max_route_share_basis_points || 0) !== 10000) {
    issues.push('context_token_links_summary.max_route_share_basis_points must be 10000');
  }
  if (Number(summary.route_concentration_warning || 0) !== 1) {
    issues.push('context_token_links_summary.route_concentration_warning must be 1');
  }
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_route_ids',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`context_token_links_summary.${key} must equal context_token_link_rows`);
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('context_token_links_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('context_token_links_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('context_token_links_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateContextTokenOccurrenceIndexSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('context_token_occurrence_index_summary.status must be passed or pass_with_warnings');
  }
  const rows = Number(summary.context_token_occurrence_rows || 0);
  const links = Number(summary.context_token_link_rows || 0);
  if (rows < 1) issues.push('context_token_occurrence_index_summary.context_token_occurrence_rows must be positive');
  if (links < 1) issues.push('context_token_occurrence_index_summary.context_token_link_rows must be positive');
  if (Number(summary.occurrence_rows || 0) < 1) {
    issues.push('context_token_occurrence_index_summary.occurrence_rows must be positive');
  }
  if (links !== Number(summary.focus_link_rows || 0) + Number(summary.context_link_rows || 0)) {
    issues.push('context_token_occurrence_index_summary.context_token_link_rows must equal focus plus context link rows');
  }
  if (Number(summary.context_link_rows || 0) <= Number(summary.occurrence_rows || 0)) {
    issues.push('context_token_occurrence_index_summary.context_link_rows must exceed occurrence_rows');
  }
  if (Number(summary.cross_frame_context_token_rows || 0) < 1 || Number(summary.cross_frame_context_token_link_rows || 0) < 1) {
    issues.push('context_token_occurrence_index_summary cross-frame rows and links must be positive');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('context_token_occurrence_index_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) {
    issues.push('context_token_occurrence_index_summary.unresolved_route_ids must be 0');
  }
  if (Number(summary.max_route_share_basis_points || 0) !== 10000) {
    issues.push('context_token_occurrence_index_summary.max_route_share_basis_points must be 10000');
  }
  if (Number(summary.route_concentration_warning || 0) !== 1) {
    issues.push('context_token_occurrence_index_summary.route_concentration_warning must be 1');
  }
  for (const key of [
    'link_rows_with_source_link',
    'link_rows_with_work_anchor',
    'link_rows_with_hebrew_context',
    'link_rows_with_focus_marker',
    'link_rows_with_route_ids',
    'link_rows_with_license_metadata',
    'link_rows_with_version_metadata',
  ]) {
    if (Number(summary[key] || 0) !== links) issues.push(`context_token_occurrence_index_summary.${key} must equal context_token_link_rows`);
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) {
    issues.push('context_token_occurrence_index_summary.reader_facing_rows must be 0');
  }
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('context_token_occurrence_index_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('context_token_occurrence_index_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateOccurrenceContextProfileSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('occurrence_context_profile_summary.status must be passed or pass_with_warnings');
  }
  const rows = Number(summary.profile_rows || 0);
  const links = Number(summary.context_token_link_rows || 0);
  if (rows < 1) issues.push('occurrence_context_profile_summary.profile_rows must be positive');
  if (links < 1) issues.push('occurrence_context_profile_summary.context_token_link_rows must be positive');
  if (Number(summary.unique_context_tokens || 0) < 1) {
    issues.push('occurrence_context_profile_summary.unique_context_tokens must be positive');
  }
  if (Number(summary.reverse_index_rows || 0) < 1) {
    issues.push('occurrence_context_profile_summary.reverse_index_rows must be positive');
  }
  if (Number(summary.rows_with_reverse_index_ids || 0) !== rows) {
    issues.push('occurrence_context_profile_summary.rows_with_reverse_index_ids must equal profile_rows');
  }
  if (Number(summary.rows_with_complete_reverse_index_mapping || 0) !== rows) {
    issues.push('occurrence_context_profile_summary.rows_with_complete_reverse_index_mapping must equal profile_rows');
  }
  if (links !== Number(summary.focus_link_rows || 0) + Number(summary.context_link_rows || 0)) {
    issues.push('occurrence_context_profile_summary.context_token_link_rows must equal focus plus context link rows');
  }
  if (Number(summary.focus_link_rows || 0) !== rows) {
    issues.push('occurrence_context_profile_summary.focus_link_rows must equal profile_rows');
  }
  if (Number(summary.context_link_rows || 0) <= rows) {
    issues.push('occurrence_context_profile_summary.context_link_rows must exceed profile_rows');
  }
  if (Number(summary.repeated_focus_context_link_rows || 0) < 1) {
    issues.push('occurrence_context_profile_summary.repeated_focus_context_link_rows must be positive');
  }
  if (Number(summary.cross_frame_context_link_rows || 0) < 1) {
    issues.push('occurrence_context_profile_summary.cross_frame_context_link_rows must be positive');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('occurrence_context_profile_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) {
    issues.push('occurrence_context_profile_summary.unresolved_route_ids must be 0');
  }
  if (Number(summary.max_route_share_basis_points || 0) !== 10000) {
    issues.push('occurrence_context_profile_summary.max_route_share_basis_points must be 10000');
  }
  if (Number(summary.route_concentration_warning || 0) !== 1) {
    issues.push('occurrence_context_profile_summary.route_concentration_warning must be 1');
  }
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_route_ids',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
  ]) {
    if (Number(summary[key] || 0) !== rows) issues.push(`occurrence_context_profile_summary.${key} must equal profile_rows`);
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) {
    issues.push('occurrence_context_profile_summary.reader_facing_rows must be 0');
  }
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('occurrence_context_profile_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('occurrence_context_profile_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateRouteDiversityProbeSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('route_diversity_probe_summary.status must be passed or pass_with_warnings');
  }
  const rows = Number(summary.occurrence_rows || 0);
  if (rows < 1) issues.push('route_diversity_probe_summary.occurrence_rows must be positive');
  if (Number(summary.route_ids || 0) < 1) issues.push('route_diversity_probe_summary.route_ids must be positive');
  if (Number(summary.route_probe_rows || 0) !== Number(summary.route_ids || 0)) {
    issues.push('route_diversity_probe_summary.route_probe_rows must equal route_ids');
  }
  if (Number(summary.max_route_share_basis_points || 0) !== 10000) {
    issues.push('route_diversity_probe_summary.max_route_share_basis_points must be 10000');
  }
  if (Number(summary.route_concentration_warning || 0) !== 1) {
    issues.push('route_diversity_probe_summary.route_concentration_warning must be 1');
  }
  if (Number(summary.all_selected_rows_same_route || 0) !== 1) {
    issues.push('route_diversity_probe_summary.all_selected_rows_same_route must be 1');
  }
  if (Number(summary.semantic_independence_claim_allowed || 0) !== 0) {
    issues.push('route_diversity_probe_summary.semantic_independence_claim_allowed must be 0');
  }
  if (Number(summary.coverage_buckets_total || 0) < 1) {
    issues.push('route_diversity_probe_summary.coverage_buckets_total must be positive');
  }
  if (Number(summary.concentration_support_selected_occurrence_refs || 0) !== rows) {
    issues.push('route_diversity_probe_summary.concentration_support_selected_occurrence_refs must equal occurrence_rows');
  }
  if (Number(summary.concentration_support_unique_source_refs || 0) <= 1) {
    issues.push('route_diversity_probe_summary.concentration_support_unique_source_refs must show source diversity');
  }
  if (Number(summary.concentration_support_unique_works || 0) <= 1) {
    issues.push('route_diversity_probe_summary.concentration_support_unique_works must show work diversity');
  }
  if (Number(summary.concentration_support_unique_licenses || 0) <= 1) {
    issues.push('route_diversity_probe_summary.concentration_support_unique_licenses must show license diversity');
  }
  if (Number(summary.concentration_support_unique_version_sources || 0) <= 1) {
    issues.push('route_diversity_probe_summary.concentration_support_unique_version_sources must show version-source diversity');
  }
  if (Number(summary.concentration_support_duplicate_source_ref_rows || 0) < 1) {
    issues.push('route_diversity_probe_summary.concentration_support_duplicate_source_ref_rows must be positive');
  }
  if (Number(summary.concentration_support_recurring_signature_rows || 0) < 1) {
    issues.push('route_diversity_probe_summary.concentration_support_recurring_signature_rows must be positive');
  }
  if (Number(summary.concentration_support_cross_cluster_signature_rows || 0) < 1) {
    issues.push('route_diversity_probe_summary.concentration_support_cross_cluster_signature_rows must be positive');
  }
  if (Number(summary.concentration_support_missing_signature_rows || 0) !== 0) {
    issues.push('route_diversity_probe_summary.concentration_support_missing_signature_rows must be 0');
  }
  if (Number(summary.concentration_support_missing_lookup_rows || 0) !== 0) {
    issues.push('route_diversity_probe_summary.concentration_support_missing_lookup_rows must be 0');
  }
  if (Number(summary.concentration_support_final_authority || 0) !== 0) {
    issues.push('route_diversity_probe_summary.concentration_support_final_authority must be 0');
  }
  if (Number(summary.concentration_support_semantic_independence_allowed || 0) !== 0) {
    issues.push('route_diversity_probe_summary.concentration_support_semantic_independence_allowed must be 0');
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) {
    issues.push('route_diversity_probe_summary.reader_facing_rows must be 0');
  }
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('route_diversity_probe_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('route_diversity_probe_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateRouteConcentrationGuardrailSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('route_concentration_guardrail_summary.status must be passed or pass_with_warnings');
  }
  const surfaces = Number(summary.guardrail_surfaces || 0);
  if (surfaces !== 7) issues.push('route_concentration_guardrail_summary.guardrail_surfaces must be 7');
  for (const key of ['single_route_surfaces', 'max_share_surfaces', 'warning_surfaces']) {
    if (Number(summary[key] || 0) !== surfaces) {
      issues.push(`route_concentration_guardrail_summary.${key} must equal guardrail_surfaces`);
    }
  }
  for (const key of [
    'semantic_independence_allowed_rows',
    'answer_authority_allowed_rows',
    'route_ranking_allowed_rows',
    'visible_answer_selection_allowed_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'unresolved_route_ids',
  ]) {
    if (Number(summary[key] || 0) !== 0) {
      issues.push(`route_concentration_guardrail_summary.${key} must be 0`);
    }
  }
}

function validateRoutePointerAuditSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('route_pointer_audit_summary.status must be passed or pass_with_warnings');
  }
  if (Number(summary.route_pointer_rows || 0) !== 1) {
    issues.push('route_pointer_audit_summary.route_pointer_rows must be 1');
  }
  if (Number(summary.route_ids || 0) !== Number(summary.route_pointer_rows || 0)) {
    issues.push('route_pointer_audit_summary.route_ids must equal route_pointer_rows');
  }
  if (Number(summary.resolved_route_ids || 0) !== Number(summary.route_ids || 0)) {
    issues.push('route_pointer_audit_summary.resolved_route_ids must equal route_ids');
  }
  if (Number(summary.unresolved_route_ids || 0) !== 0) {
    issues.push('route_pointer_audit_summary.unresolved_route_ids must be 0');
  }
  if (Number(summary.support_rows_with_pointer || 0) !== Number(summary.support_rows || 0)) {
    issues.push('route_pointer_audit_summary.support_rows_with_pointer must equal support_rows');
  }
  if (Number(summary.navigation_rows_with_pointer || 0) !== Number(summary.navigation_rows || 0)) {
    issues.push('route_pointer_audit_summary.navigation_rows_with_pointer must equal navigation_rows');
  }
  if (Number(summary.planning_rows_with_pointer || 0) !== Number(summary.planning_rows || 0)) {
    issues.push('route_pointer_audit_summary.planning_rows_with_pointer must equal planning_rows');
  }
  for (const key of [
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'route_metadata_field_hits',
  ]) {
    if (Number(summary[key] || 0) !== 0) issues.push(`route_pointer_audit_summary.${key} must be 0`);
  }
}

function validateSampleGapAuditSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('sample_gap_audit_summary.status must be passed or pass_with_warnings');
  }
  if (Number(summary.gap_rows || 0) < 1) issues.push('sample_gap_audit_summary.gap_rows must be positive');
  if (Number(summary.sample_rows || 0) < 1) issues.push('sample_gap_audit_summary.sample_rows must be positive');
  if (Number(summary.sample_rows_with_usage_links || 0) !== 0) {
    issues.push('sample_gap_audit_summary.sample_rows_with_usage_links must be 0 for current bounded gap audit');
  }
  if (Number(summary.usage_tokens_not_in_sample || 0) < 1) {
    issues.push('sample_gap_audit_summary.usage_tokens_not_in_sample must be positive');
  }
  if (Number(summary.selected_occurrence_links || 0) < 1) {
    issues.push('sample_gap_audit_summary.selected_occurrence_links must be positive');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('sample_gap_audit_summary.route_ids must be positive');
  if (Number(summary.sample_overlap_gap_visible || 0) !== 1) {
    issues.push('sample_gap_audit_summary.sample_overlap_gap_visible must be 1');
  }
  if (Number(summary.reader_facing_rows || 0) !== 0) {
    issues.push('sample_gap_audit_summary.reader_facing_rows must be 0');
  }
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('sample_gap_audit_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('sample_gap_audit_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateConsumerManifestSummary(summary) {
  if (!['passed', 'pass_with_warnings'].includes(summary.status)) {
    issues.push('consumer_manifest_summary.status must be passed or pass_with_warnings');
  }
  const entries = Number(summary.manifest_entries || 0);
  if (entries < 1) issues.push('consumer_manifest_summary.manifest_entries must be positive');
  if (Number(summary.data_artifacts || 0) !== entries) {
    issues.push('consumer_manifest_summary.data_artifacts must equal manifest_entries');
  }
  if (Number(summary.report_artifacts || 0) !== entries) {
    issues.push('consumer_manifest_summary.report_artifacts must equal manifest_entries');
  }
  if (Number(summary.validator_scripts || 0) !== entries) {
    issues.push('consumer_manifest_summary.validator_scripts must equal manifest_entries');
  }
  if (Number(summary.data_artifacts_exist || 0) !== Number(summary.data_artifacts || 0)) {
    issues.push('consumer_manifest_summary all data artifacts must exist');
  }
  if (Number(summary.report_artifacts_exist || 0) !== Number(summary.report_artifacts || 0)) {
    issues.push('consumer_manifest_summary all report artifacts must exist');
  }
  if (Number(summary.validator_scripts_exist || 0) !== Number(summary.validator_scripts || 0)) {
    issues.push('consumer_manifest_summary all validator scripts must exist');
  }
  if (Number(summary.passed_entries || 0) !== Number(summary.manifest_entries || 0)) {
    issues.push('consumer_manifest_summary.passed_entries must equal manifest_entries');
  }
  if (Number(summary.occurrence_detail_rows || 0) < 1) {
    issues.push('consumer_manifest_summary.occurrence_detail_rows must be positive');
  }
  if (Number(summary.occurrence_detail_rows || 0) !== Number(summary.occurrence_link_rows || 0)) {
    issues.push('consumer_manifest_summary occurrence/detail rows must match');
  }
  if (Number(summary.route_ids || 0) < 1) issues.push('consumer_manifest_summary.route_ids must be positive');
  if (Number(summary.unresolved_route_ids || 0) !== 0) issues.push('consumer_manifest_summary.unresolved_route_ids must be 0');
  if (Number(summary.reader_facing_rows || 0) !== 0) issues.push('consumer_manifest_summary.reader_facing_rows must be 0');
  if (Number(summary.route_payload_field_hits || 0) !== 0) {
    issues.push('consumer_manifest_summary.route_payload_field_hits must be 0');
  }
  if (Number(summary.forbidden_authority_field_hits || 0) !== 0) {
    issues.push('consumer_manifest_summary.forbidden_authority_field_hits must be 0');
  }
}

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'required_queue_fields',
    'required_queue_fields_present',
    'evidence_artifacts',
    'evidence_artifacts_exist',
    'validator_scripts',
    'validator_scripts_exist',
    'allowed_submitters',
    'draft_submitter_allowed',
    'publication_global_status_blocked',
    'consumer_manifest_reviewed_lexical_authority_false',
    'consumer_manifest_accepted_translation_output_false',
    'consumer_manifest_publication_readiness_false',
    'consumer_manifest_verified_review_status_reserved',
    'consumer_manifest_status_semantics_preserved',
    'source_packet_status_passed',
    'source_packet_status_accepted',
    'occurrence_links_status_passed',
    'route_resolution_status_passed',
    'crossmatch_neighbors_status_passed',
    'source_ref_buckets_status_passed',
    'work_buckets_status_passed',
    'provenance_buckets_status_passed',
    'occurrence_detail_index_status_passed',
    'facet_index_status_accepted',
    'context_token_index_status_accepted',
    'context_token_links_status_accepted',
    'context_token_occurrence_index_status_accepted',
    'occurrence_context_profile_status_accepted',
    'route_diversity_probe_status_accepted',
    'route_concentration_guardrail_status_accepted',
    'sample_gap_audit_status_accepted',
    'consumer_manifest_status_passed',
    'planning_packet_status_accepted',
    'anchor_audit_status_passed',
    'occurrence_link_rows',
    'occurrence_link_rows_with_complete_metadata',
    'occurrence_link_rows_with_hebrew_context',
    'occurrence_link_rows_with_focus_marker',
    'occurrence_link_mojibake_rows',
    'occurrence_link_audit_only_ambiguous_rows_available',
    'occurrence_link_audit_only_ambiguous_rows_emitted',
    'occurrence_link_reader_facing_rows',
    'occurrence_link_route_payload_field_hits',
    'occurrence_link_forbidden_authority_field_hits',
    'route_resolution_occurrence_route_rows',
    'route_resolution_route_ids',
    'route_resolution_resolved_route_ids',
    'route_resolution_unresolved_route_ids',
    'route_resolution_answer_eligible_occurrence_route_rows',
    'route_resolution_answer_eligible_rows_with_source_license_profile',
    'route_resolution_source_license_profile_complete_rows',
    'route_resolution_forbidden_license_profile_rows',
    'route_resolution_future_translation_output_blocked_rows',
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
    'context_token_index_max_route_share_basis_points',
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
    'route_pointer_audit_status_accepted',
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
    'proof_rows_with_hebrew_token',
    'proof_rows_with_hebrew_context',
    'proof_rows_with_focus_marker',
    'proof_mojibake_rows',
    'route_ids',
    'current_sample_rows_with_usage_links',
    'usage_tokens_absent_from_current_sample',
    'join_rows',
    'projected_usage_link_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'queue_mutations',
    'submitted_to_agent6',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.required_queue_fields_present !== counts.required_queue_fields) issues.push('all required queue fields must be present');
  if (counts.evidence_artifacts_exist !== counts.evidence_artifacts) issues.push('all evidence artifacts must exist');
  if (counts.validator_scripts_exist !== counts.validator_scripts) issues.push('all validator scripts must exist');
  if (counts.draft_submitter_allowed !== 1) issues.push('draft_submitter_allowed must be 1');
  if (counts.publication_global_status_blocked !== 1) issues.push('publication_global_status_blocked must be 1');
  if (counts.consumer_manifest_reviewed_lexical_authority_false !== 1) {
    issues.push('consumer_manifest_reviewed_lexical_authority_false must be 1');
  }
  if (counts.consumer_manifest_accepted_translation_output_false !== 1) {
    issues.push('consumer_manifest_accepted_translation_output_false must be 1');
  }
  if (counts.consumer_manifest_publication_readiness_false !== 1) {
    issues.push('consumer_manifest_publication_readiness_false must be 1');
  }
  if (counts.consumer_manifest_verified_review_status_reserved !== 1) {
    issues.push('consumer_manifest_verified_review_status_reserved must be 1');
  }
  if (counts.consumer_manifest_status_semantics_preserved !== 1) {
    issues.push('consumer_manifest_status_semantics_preserved must be 1');
  }
  if (counts.source_packet_status_accepted !== 1) issues.push('source_packet_status_accepted must be 1');
  if (counts.occurrence_links_status_passed !== 1) issues.push('occurrence_links_status_passed must be 1');
  if (counts.route_resolution_status_passed !== 1) issues.push('route_resolution_status_passed must be 1');
  if (counts.crossmatch_neighbors_status_passed !== 1) issues.push('crossmatch_neighbors_status_passed must be 1');
  if (counts.source_ref_buckets_status_passed !== 1) issues.push('source_ref_buckets_status_passed must be 1');
  if (counts.work_buckets_status_passed !== 1) issues.push('work_buckets_status_passed must be 1');
  if (counts.provenance_buckets_status_passed !== 1) issues.push('provenance_buckets_status_passed must be 1');
  if (counts.occurrence_detail_index_status_passed !== 1) issues.push('occurrence_detail_index_status_passed must be 1');
  if (counts.facet_index_status_accepted !== 1) issues.push('facet_index_status_accepted must be 1');
  if (counts.context_token_index_status_accepted !== 1) issues.push('context_token_index_status_accepted must be 1');
  if (counts.context_token_links_status_accepted !== 1) issues.push('context_token_links_status_accepted must be 1');
  if (counts.context_token_occurrence_index_status_accepted !== 1) {
    issues.push('context_token_occurrence_index_status_accepted must be 1');
  }
  if (counts.occurrence_context_profile_status_accepted !== 1) {
    issues.push('occurrence_context_profile_status_accepted must be 1');
  }
  if (counts.route_diversity_probe_status_accepted !== 1) issues.push('route_diversity_probe_status_accepted must be 1');
  if (counts.sample_gap_audit_status_accepted !== 1) issues.push('sample_gap_audit_status_accepted must be 1');
  if (counts.consumer_manifest_status_passed !== 1) issues.push('consumer_manifest_status_passed must be 1');
  if (counts.planning_packet_status_accepted !== 1) issues.push('planning_packet_status_accepted must be 1');
  if (counts.anchor_audit_status_passed !== 1) issues.push('anchor_audit_status_passed must be 1');
  if (counts.occurrence_link_rows < 1) issues.push('occurrence_link_rows must be positive');
  if (counts.occurrence_link_rows_with_complete_metadata !== counts.occurrence_link_rows) {
    issues.push('occurrence link metadata must be complete');
  }
  if (counts.occurrence_link_rows_with_hebrew_context !== counts.occurrence_link_rows) {
    issues.push('occurrence links must include Hebrew context');
  }
  if (counts.occurrence_link_rows_with_focus_marker !== counts.occurrence_link_rows) {
    issues.push('occurrence links must include focus markers');
  }
  if (counts.occurrence_link_mojibake_rows !== 0) issues.push('occurrence_link_mojibake_rows must be 0');
  if (counts.occurrence_link_audit_only_ambiguous_rows_available < 1) {
    issues.push('occurrence_link_audit_only_ambiguous_rows_available must be positive');
  }
  if (counts.occurrence_link_audit_only_ambiguous_rows_emitted !== 0) {
    issues.push('occurrence_link_audit_only_ambiguous_rows_emitted must be 0');
  }
  if (counts.occurrence_link_reader_facing_rows !== 0) issues.push('occurrence_link_reader_facing_rows must be 0');
  if (counts.occurrence_link_route_payload_field_hits !== 0) {
    issues.push('occurrence_link_route_payload_field_hits must be 0');
  }
  if (counts.occurrence_link_forbidden_authority_field_hits !== 0) {
    issues.push('occurrence_link_forbidden_authority_field_hits must be 0');
  }
  if (counts.route_resolution_occurrence_route_rows !== counts.occurrence_link_rows) {
    issues.push('route_resolution_occurrence_route_rows must equal occurrence_link_rows');
  }
  if (counts.route_resolution_route_ids < 1) issues.push('route_resolution_route_ids must be positive');
  if (counts.route_resolution_resolved_route_ids !== counts.route_resolution_route_ids) {
    issues.push('route_resolution_resolved_route_ids must equal route_resolution_route_ids');
  }
  if (counts.route_resolution_unresolved_route_ids !== 0) issues.push('route_resolution_unresolved_route_ids must be 0');
  if (counts.route_resolution_answer_eligible_rows_with_source_license_profile !== counts.route_resolution_answer_eligible_occurrence_route_rows) {
    issues.push('route_resolution answer-eligible rows must all carry source/license profile');
  }
  if (counts.route_resolution_source_license_profile_complete_rows !== counts.route_resolution_occurrence_route_rows) {
    issues.push('route_resolution_source_license_profile_complete_rows must equal route_resolution_occurrence_route_rows');
  }
  if (counts.route_resolution_forbidden_license_profile_rows !== 0) {
    issues.push('route_resolution_forbidden_license_profile_rows must be 0');
  }
  if (counts.route_resolution_future_translation_output_blocked_rows !== counts.route_resolution_occurrence_route_rows) {
    issues.push('route_resolution_future_translation_output_blocked_rows must equal route_resolution_occurrence_route_rows');
  }
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
  if (counts.crossmatch_neighbor_link_rows < 1) issues.push('crossmatch_neighbor_link_rows must be positive');
  if (counts.crossmatch_neighbor_same_frame_links < 1) issues.push('crossmatch_neighbor_same_frame_links must be positive');
  if (counts.crossmatch_neighbor_bridge_frame_links < 1) issues.push('crossmatch_neighbor_bridge_frame_links must be positive');
  if (counts.crossmatch_neighbor_same_frame_links + counts.crossmatch_neighbor_bridge_frame_links !== counts.crossmatch_neighbor_link_rows) {
    issues.push('crossmatch same-frame plus bridge links must equal link rows');
  }
  if (counts.crossmatch_neighbor_route_ids < 1) issues.push('crossmatch_neighbor_route_ids must be positive');
  if (counts.crossmatch_neighbor_unresolved_route_ids !== 0) issues.push('crossmatch_neighbor_unresolved_route_ids must be 0');
  if (counts.crossmatch_neighbor_reader_facing_rows !== 0) issues.push('crossmatch_neighbor_reader_facing_rows must be 0');
  if (counts.crossmatch_neighbor_route_payload_field_hits !== 0) {
    issues.push('crossmatch_neighbor_route_payload_field_hits must be 0');
  }
  if (counts.crossmatch_neighbor_forbidden_authority_field_hits !== 0) {
    issues.push('crossmatch_neighbor_forbidden_authority_field_hits must be 0');
  }
  if (counts.source_ref_bucket_count < 1) issues.push('source_ref_bucket_count must be positive');
  if (counts.source_ref_bucket_source_cluster_buckets < counts.source_ref_bucket_count) {
    issues.push('source_ref_bucket_source_cluster_buckets must be at least source_ref_bucket_count');
  }
  if (counts.source_ref_bucket_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('source_ref_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.source_ref_bucket_duplicate_source_ref_buckets < 1) {
    issues.push('source_ref_bucket_duplicate_source_ref_buckets must be positive');
  }
  if (counts.source_ref_bucket_duplicate_source_ref_rows <= counts.source_ref_bucket_duplicate_source_ref_buckets) {
    issues.push('source_ref_bucket_duplicate_source_ref_rows must exceed duplicate buckets');
  }
  if (counts.source_ref_bucket_cross_cluster_source_ref_buckets < 1) {
    issues.push('source_ref_bucket_cross_cluster_source_ref_buckets must be positive');
  }
  if (counts.source_ref_bucket_cross_cluster_source_ref_rows < 1) {
    issues.push('source_ref_bucket_cross_cluster_source_ref_rows must be positive');
  }
  if (counts.source_ref_bucket_route_ids < 1) issues.push('source_ref_bucket_route_ids must be positive');
  if (counts.source_ref_bucket_unresolved_route_ids !== 0) issues.push('source_ref_bucket_unresolved_route_ids must be 0');
  if (counts.source_ref_bucket_reader_facing_rows !== 0) issues.push('source_ref_bucket_reader_facing_rows must be 0');
  if (counts.source_ref_bucket_route_payload_field_hits !== 0) {
    issues.push('source_ref_bucket_route_payload_field_hits must be 0');
  }
  if (counts.source_ref_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('source_ref_bucket_forbidden_authority_field_hits must be 0');
  }
  if (counts.work_bucket_count < 1) issues.push('work_bucket_count must be positive');
  if (counts.work_bucket_work_frame_buckets < counts.work_bucket_count) {
    issues.push('work_bucket_work_frame_buckets must be at least work_bucket_count');
  }
  if (counts.work_bucket_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('work_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.work_bucket_source_refs < 1) issues.push('work_bucket_source_refs must be positive');
  if (counts.work_bucket_multi_source_work_buckets < 1) {
    issues.push('work_bucket_multi_source_work_buckets must be positive');
  }
  if (counts.work_bucket_multi_source_work_rows <= counts.work_bucket_multi_source_work_buckets) {
    issues.push('work_bucket_multi_source_work_rows must exceed multi-source buckets');
  }
  if (counts.work_bucket_multi_frame_work_buckets < 1) {
    issues.push('work_bucket_multi_frame_work_buckets must be positive');
  }
  if (counts.work_bucket_multi_frame_work_rows <= counts.work_bucket_multi_frame_work_buckets) {
    issues.push('work_bucket_multi_frame_work_rows must exceed multi-frame buckets');
  }
  if (counts.work_bucket_route_ids < 1) issues.push('work_bucket_route_ids must be positive');
  if (counts.work_bucket_unresolved_route_ids !== 0) issues.push('work_bucket_unresolved_route_ids must be 0');
  if (counts.work_bucket_reader_facing_rows !== 0) issues.push('work_bucket_reader_facing_rows must be 0');
  if (counts.work_bucket_route_payload_field_hits !== 0) {
    issues.push('work_bucket_route_payload_field_hits must be 0');
  }
  if (counts.work_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('work_bucket_forbidden_authority_field_hits must be 0');
  }
  if (counts.provenance_bucket_count < 1) issues.push('provenance_bucket_count must be positive');
  if (counts.provenance_bucket_provenance_frame_buckets < counts.provenance_bucket_count) {
    issues.push('provenance_bucket_provenance_frame_buckets must be at least provenance_bucket_count');
  }
  if (counts.provenance_bucket_occurrence_rows !== counts.occurrence_link_rows) {
    issues.push('provenance_bucket_occurrence_rows must equal occurrence_link_rows');
  }
  if (counts.provenance_bucket_work_count < 1) issues.push('provenance_bucket_work_count must be positive');
  if (counts.provenance_bucket_source_refs < 1) issues.push('provenance_bucket_source_refs must be positive');
  if (counts.provenance_bucket_license_count <= 1) {
    issues.push('provenance_bucket_license_count must show more than one license');
  }
  if (counts.provenance_bucket_version_source_count <= 1) {
    issues.push('provenance_bucket_version_source_count must show more than one version source');
  }
  if (counts.provenance_bucket_multi_work_buckets < 1) {
    issues.push('provenance_bucket_multi_work_buckets must be positive');
  }
  if (counts.provenance_bucket_multi_work_rows <= counts.provenance_bucket_multi_work_buckets) {
    issues.push('provenance_bucket_multi_work_rows must exceed multi-work buckets');
  }
  if (counts.provenance_bucket_multi_frame_buckets < 1) {
    issues.push('provenance_bucket_multi_frame_buckets must be positive');
  }
  if (counts.provenance_bucket_multi_frame_rows <= counts.provenance_bucket_multi_frame_buckets) {
    issues.push('provenance_bucket_multi_frame_rows must exceed multi-frame buckets');
  }
  if (counts.provenance_bucket_route_ids < 1) issues.push('provenance_bucket_route_ids must be positive');
  if (counts.provenance_bucket_unresolved_route_ids !== 0) issues.push('provenance_bucket_unresolved_route_ids must be 0');
  if (counts.provenance_bucket_reader_facing_rows !== 0) issues.push('provenance_bucket_reader_facing_rows must be 0');
  if (counts.provenance_bucket_route_payload_field_hits !== 0) {
    issues.push('provenance_bucket_route_payload_field_hits must be 0');
  }
  if (counts.provenance_bucket_forbidden_authority_field_hits !== 0) {
    issues.push('provenance_bucket_forbidden_authority_field_hits must be 0');
  }
  if (counts.occurrence_detail_rows !== counts.occurrence_link_rows) {
    issues.push('occurrence_detail_rows must equal occurrence_link_rows');
  }
  if (counts.occurrence_detail_source_refs < 1) issues.push('occurrence_detail_source_refs must be positive');
  if (counts.occurrence_detail_works < 1) issues.push('occurrence_detail_works must be positive');
  if (counts.occurrence_detail_license_count <= 1) issues.push('occurrence_detail_license_count must show more than one license');
  if (counts.occurrence_detail_version_source_count <= 1) {
    issues.push('occurrence_detail_version_source_count must show more than one version source');
  }
  if (counts.occurrence_detail_route_ids < 1) issues.push('occurrence_detail_route_ids must be positive');
  if (counts.occurrence_detail_unresolved_route_ids !== 0) issues.push('occurrence_detail_unresolved_route_ids must be 0');
  for (const key of [
    'occurrence_detail_rows_with_route_ids',
    'occurrence_detail_rows_with_source_link',
    'occurrence_detail_rows_with_work_anchor',
    'occurrence_detail_rows_with_hebrew_context',
    'occurrence_detail_rows_with_focus_marker',
    'occurrence_detail_rows_with_all_bucket_links',
    'occurrence_detail_observed_usage_only_rows',
  ]) {
    if (counts[key] !== counts.occurrence_detail_rows) issues.push(`${key} must equal occurrence_detail_rows`);
  }
  if (counts.occurrence_detail_neighbor_links < 1) issues.push('occurrence_detail_neighbor_links must be positive');
  if (counts.occurrence_detail_same_frame_neighbor_links < 1) {
    issues.push('occurrence_detail_same_frame_neighbor_links must be positive');
  }
  if (counts.occurrence_detail_bridge_frame_neighbor_links < 1) {
    issues.push('occurrence_detail_bridge_frame_neighbor_links must be positive');
  }
  if (counts.occurrence_detail_same_frame_neighbor_links + counts.occurrence_detail_bridge_frame_neighbor_links !== counts.occurrence_detail_neighbor_links) {
    issues.push('occurrence detail same-frame plus bridge links must equal neighbor links');
  }
  if (counts.occurrence_detail_reader_facing_rows !== 0) issues.push('occurrence_detail_reader_facing_rows must be 0');
  if (counts.occurrence_detail_route_payload_field_hits !== 0) {
    issues.push('occurrence_detail_route_payload_field_hits must be 0');
  }
  if (counts.occurrence_detail_forbidden_authority_field_hits !== 0) {
    issues.push('occurrence_detail_forbidden_authority_field_hits must be 0');
  }
  if (counts.facet_index_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('facet_index_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.facet_index_facet_groups !== 10) issues.push('facet_index_facet_groups must be 10');
  if (counts.facet_index_facets_total < counts.facet_index_facet_groups) {
    issues.push('facet_index_facets_total must be at least facet_index_facet_groups');
  }
  if (counts.facet_index_route_ids < 1) issues.push('facet_index_route_ids must be positive');
  if (counts.facet_index_max_route_share_basis_points !== 10000) {
    issues.push('facet_index_max_route_share_basis_points must be 10000');
  }
  if (counts.facet_index_route_concentration_warning !== 1) {
    issues.push('facet_index_route_concentration_warning must be 1');
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
    if (counts[key] !== counts.occurrence_detail_rows) issues.push(`${key} must equal occurrence_detail_rows`);
  }
  if (counts.facet_index_reader_facing_rows !== 0) issues.push('facet_index_reader_facing_rows must be 0');
  if (counts.facet_index_route_payload_field_hits !== 0) {
    issues.push('facet_index_route_payload_field_hits must be 0');
  }
  if (counts.facet_index_forbidden_authority_field_hits !== 0) {
    issues.push('facet_index_forbidden_authority_field_hits must be 0');
  }
  if (counts.context_token_index_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('context_token_index_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.context_token_index_rows <= 0) issues.push('context_token_index_rows must be positive');
  if (counts.context_token_index_occurrences <= counts.occurrence_detail_rows) {
    issues.push('context_token_index_occurrences must exceed occurrence_detail_rows');
  }
  if (counts.context_token_index_cross_frame_rows <= 0) {
    issues.push('context_token_index_cross_frame_rows must be positive');
  }
  if (counts.context_token_index_route_ids <= 0) issues.push('context_token_index_route_ids must be positive');
  if (counts.context_token_index_unresolved_route_ids !== 0) {
    issues.push('context_token_index_unresolved_route_ids must be 0');
  }
  if (counts.context_token_index_max_route_share_basis_points !== 10000) {
    issues.push('context_token_index_max_route_share_basis_points must be 10000');
  }
  if (counts.context_token_index_route_concentration_warning !== 1) {
    issues.push('context_token_index_route_concentration_warning must be 1');
  }
  for (const key of [
    'context_token_index_rows_with_source_link',
    'context_token_index_rows_with_work_anchor',
    'context_token_index_rows_with_hebrew_context',
    'context_token_index_rows_with_focus_marker',
    'context_token_index_rows_with_license_metadata',
    'context_token_index_rows_with_version_metadata',
  ]) {
    if (counts[key] !== counts.occurrence_detail_rows) issues.push(`${key} must equal occurrence_detail_rows`);
  }
  if (counts.context_token_index_reader_facing_rows !== 0) {
    issues.push('context_token_index_reader_facing_rows must be 0');
  }
  if (counts.context_token_index_route_payload_field_hits !== 0) {
    issues.push('context_token_index_route_payload_field_hits must be 0');
  }
  if (counts.context_token_index_forbidden_authority_field_hits !== 0) {
    issues.push('context_token_index_forbidden_authority_field_hits must be 0');
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
  if (counts.context_token_link_route_ids <= 0) issues.push('context_token_link_route_ids must be positive');
  if (counts.context_token_link_unresolved_route_ids !== 0) {
    issues.push('context_token_link_unresolved_route_ids must be 0');
  }
  if (counts.context_token_link_max_route_share_basis_points !== 10000) {
    issues.push('context_token_link_max_route_share_basis_points must be 10000');
  }
  if (counts.context_token_link_route_concentration_warning !== 1) {
    issues.push('context_token_link_route_concentration_warning must be 1');
  }
  for (const key of [
    'context_token_link_rows_with_source_link',
    'context_token_link_rows_with_work_anchor',
    'context_token_link_rows_with_hebrew_context',
    'context_token_link_rows_with_focus_marker',
    'context_token_link_rows_with_route_ids',
    'context_token_link_rows_with_license_metadata',
    'context_token_link_rows_with_version_metadata',
  ]) {
    if (counts[key] !== counts.context_token_link_rows) issues.push(`${key} must equal context_token_link_rows`);
  }
  if (counts.context_token_link_reader_facing_rows !== 0) {
    issues.push('context_token_link_reader_facing_rows must be 0');
  }
  if (counts.context_token_link_route_payload_field_hits !== 0) {
    issues.push('context_token_link_route_payload_field_hits must be 0');
  }
  if (counts.context_token_link_forbidden_authority_field_hits !== 0) {
    issues.push('context_token_link_forbidden_authority_field_hits must be 0');
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
  if (counts.context_token_occurrence_index_route_ids <= 0) {
    issues.push('context_token_occurrence_index_route_ids must be positive');
  }
  if (counts.context_token_occurrence_index_unresolved_route_ids !== 0) {
    issues.push('context_token_occurrence_index_unresolved_route_ids must be 0');
  }
  if (counts.context_token_occurrence_index_max_route_share_basis_points !== 10000) {
    issues.push('context_token_occurrence_index_max_route_share_basis_points must be 10000');
  }
  if (counts.context_token_occurrence_index_route_concentration_warning !== 1) {
    issues.push('context_token_occurrence_index_route_concentration_warning must be 1');
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
    if (counts[key] !== counts.context_token_occurrence_index_link_rows) {
      issues.push(`${key} must equal context_token_occurrence_index_link_rows`);
    }
  }
  if (counts.context_token_occurrence_index_reader_facing_rows !== 0) {
    issues.push('context_token_occurrence_index_reader_facing_rows must be 0');
  }
  if (counts.context_token_occurrence_index_route_payload_field_hits !== 0) {
    issues.push('context_token_occurrence_index_route_payload_field_hits must be 0');
  }
  if (counts.context_token_occurrence_index_forbidden_authority_field_hits !== 0) {
    issues.push('context_token_occurrence_index_forbidden_authority_field_hits must be 0');
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
  if (counts.occurrence_context_profile_route_ids <= 0) {
    issues.push('occurrence_context_profile_route_ids must be positive');
  }
  if (counts.occurrence_context_profile_unresolved_route_ids !== 0) {
    issues.push('occurrence_context_profile_unresolved_route_ids must be 0');
  }
  if (counts.occurrence_context_profile_max_route_share_basis_points !== 10000) {
    issues.push('occurrence_context_profile_max_route_share_basis_points must be 10000');
  }
  if (counts.occurrence_context_profile_route_concentration_warning !== 1) {
    issues.push('occurrence_context_profile_route_concentration_warning must be 1');
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
    if (counts[key] !== counts.occurrence_context_profile_rows) {
      issues.push(`${key} must equal occurrence_context_profile_rows`);
    }
  }
  if (counts.occurrence_context_profile_reader_facing_rows !== 0) {
    issues.push('occurrence_context_profile_reader_facing_rows must be 0');
  }
  if (counts.occurrence_context_profile_route_payload_field_hits !== 0) {
    issues.push('occurrence_context_profile_route_payload_field_hits must be 0');
  }
  if (counts.occurrence_context_profile_forbidden_authority_field_hits !== 0) {
    issues.push('occurrence_context_profile_forbidden_authority_field_hits must be 0');
  }
  if (counts.route_diversity_probe_occurrence_rows !== counts.occurrence_detail_rows) {
    issues.push('route_diversity_probe_occurrence_rows must equal occurrence_detail_rows');
  }
  if (counts.route_diversity_probe_route_ids !== counts.occurrence_detail_route_ids) {
    issues.push('route_diversity_probe_route_ids must equal occurrence_detail_route_ids');
  }
  if (counts.route_diversity_probe_route_probe_rows !== counts.route_diversity_probe_route_ids) {
    issues.push('route_diversity_probe_route_probe_rows must equal route_diversity_probe_route_ids');
  }
  if (counts.route_diversity_probe_max_route_share_basis_points !== 10000) {
    issues.push('route_diversity_probe_max_route_share_basis_points must be 10000');
  }
  if (counts.route_diversity_probe_concentration_warning !== 1) {
    issues.push('route_diversity_probe_concentration_warning must be 1');
  }
  if (counts.route_diversity_probe_all_selected_rows_same_route !== 1) {
    issues.push('route_diversity_probe_all_selected_rows_same_route must be 1');
  }
  if (counts.route_diversity_probe_semantic_independence_claim_allowed !== 0) {
    issues.push('route_diversity_probe_semantic_independence_claim_allowed must be 0');
  }
  if (counts.route_diversity_probe_coverage_buckets_total < 1) {
    issues.push('route_diversity_probe_coverage_buckets_total must be positive');
  }
  if (counts.route_diversity_probe_concentration_support_selected_occurrence_refs !== counts.route_diversity_probe_occurrence_rows) {
    issues.push('route_diversity_probe_concentration_support_selected_occurrence_refs must equal route_diversity_probe_occurrence_rows');
  }
  if (counts.route_diversity_probe_concentration_support_unique_source_refs <= 1) {
    issues.push('route_diversity_probe_concentration_support_unique_source_refs must show source diversity');
  }
  if (counts.route_diversity_probe_concentration_support_unique_work_anchors <= 1) {
    issues.push('route_diversity_probe_concentration_support_unique_work_anchors must show work-anchor diversity');
  }
  if (counts.route_diversity_probe_concentration_support_unique_works <= 1) {
    issues.push('route_diversity_probe_concentration_support_unique_works must show work diversity');
  }
  if (counts.route_diversity_probe_concentration_support_unique_licenses <= 1) {
    issues.push('route_diversity_probe_concentration_support_unique_licenses must show license diversity');
  }
  if (counts.route_diversity_probe_concentration_support_unique_version_sources <= 1) {
    issues.push('route_diversity_probe_concentration_support_unique_version_sources must show version-source diversity');
  }
  if (counts.route_diversity_probe_concentration_support_duplicate_source_ref_rows < 1) {
    issues.push('route_diversity_probe_concentration_support_duplicate_source_ref_rows must be positive');
  }
  if (counts.route_diversity_probe_concentration_support_signature_memberships < counts.route_diversity_probe_occurrence_rows) {
    issues.push('route_diversity_probe_concentration_support_signature_memberships must cover selected occurrence rows');
  }
  if (counts.route_diversity_probe_concentration_support_recurring_signature_rows < 1) {
    issues.push('route_diversity_probe_concentration_support_recurring_signature_rows must be positive');
  }
  if (counts.route_diversity_probe_concentration_support_cross_cluster_signature_rows < 1) {
    issues.push('route_diversity_probe_concentration_support_cross_cluster_signature_rows must be positive');
  }
  if (counts.route_diversity_probe_concentration_support_missing_signature_rows !== 0) {
    issues.push('route_diversity_probe_concentration_support_missing_signature_rows must be 0');
  }
  if (counts.route_diversity_probe_concentration_support_missing_lookup_rows !== 0) {
    issues.push('route_diversity_probe_concentration_support_missing_lookup_rows must be 0');
  }
  if (counts.route_diversity_probe_concentration_support_final_authority !== 0) {
    issues.push('route_diversity_probe_concentration_support_final_authority must be 0');
  }
  if (counts.route_diversity_probe_concentration_support_semantic_independence_allowed !== 0) {
    issues.push('route_diversity_probe_concentration_support_semantic_independence_allowed must be 0');
  }
  if (counts.route_diversity_probe_reader_facing_rows !== 0) {
    issues.push('route_diversity_probe_reader_facing_rows must be 0');
  }
  if (counts.route_diversity_probe_route_payload_field_hits !== 0) {
    issues.push('route_diversity_probe_route_payload_field_hits must be 0');
  }
  if (counts.route_diversity_probe_forbidden_authority_field_hits !== 0) {
    issues.push('route_diversity_probe_forbidden_authority_field_hits must be 0');
  }
  if (counts.route_concentration_guardrail_status_accepted !== 1) {
    issues.push('route_concentration_guardrail_status_accepted must be 1');
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
  if (counts.route_pointer_audit_status_accepted !== 1) {
    issues.push('route_pointer_audit_status_accepted must be 1');
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
  if (counts.sample_gap_audit_reader_facing_rows !== 0) {
    issues.push('sample_gap_audit_reader_facing_rows must be 0');
  }
  if (counts.sample_gap_audit_route_payload_field_hits !== 0) {
    issues.push('sample_gap_audit_route_payload_field_hits must be 0');
  }
  if (counts.sample_gap_audit_forbidden_authority_field_hits !== 0) {
    issues.push('sample_gap_audit_forbidden_authority_field_hits must be 0');
  }
  if (counts.consumer_manifest_entries !== 16) issues.push('consumer_manifest_entries must be 16');
  if (counts.consumer_manifest_data_artifacts !== counts.consumer_manifest_entries) {
    issues.push('consumer_manifest_data_artifacts must equal consumer_manifest_entries');
  }
  if (counts.consumer_manifest_report_artifacts !== counts.consumer_manifest_entries) {
    issues.push('consumer_manifest_report_artifacts must equal consumer_manifest_entries');
  }
  if (counts.consumer_manifest_validator_scripts !== counts.consumer_manifest_entries) {
    issues.push('consumer_manifest_validator_scripts must equal consumer_manifest_entries');
  }
  if (counts.consumer_manifest_data_artifacts_exist !== counts.consumer_manifest_data_artifacts) {
    issues.push('consumer_manifest all data artifacts must exist');
  }
  if (counts.consumer_manifest_report_artifacts_exist !== counts.consumer_manifest_report_artifacts) {
    issues.push('consumer_manifest all report artifacts must exist');
  }
  if (counts.consumer_manifest_validator_scripts_exist !== counts.consumer_manifest_validator_scripts) {
    issues.push('consumer_manifest all validator scripts must exist');
  }
  if (counts.consumer_manifest_passed_entries !== counts.consumer_manifest_entries) {
    issues.push('consumer_manifest_passed_entries must equal consumer_manifest_entries');
  }
  if (counts.consumer_manifest_occurrence_detail_rows !== counts.occurrence_detail_rows) {
    issues.push('consumer_manifest_occurrence_detail_rows must equal occurrence_detail_rows');
  }
  if (counts.consumer_manifest_occurrence_link_rows !== counts.occurrence_link_rows) {
    issues.push('consumer_manifest_occurrence_link_rows must equal occurrence_link_rows');
  }
  if (counts.consumer_manifest_route_ids < 1) issues.push('consumer_manifest_route_ids must be positive');
  if (counts.consumer_manifest_unresolved_route_ids !== 0) issues.push('consumer_manifest_unresolved_route_ids must be 0');
  if (counts.consumer_manifest_reader_facing_rows !== 0) issues.push('consumer_manifest_reader_facing_rows must be 0');
  if (counts.consumer_manifest_route_payload_field_hits !== 0) {
    issues.push('consumer_manifest_route_payload_field_hits must be 0');
  }
  if (counts.consumer_manifest_forbidden_authority_field_hits !== 0) {
    issues.push('consumer_manifest_forbidden_authority_field_hits must be 0');
  }
  if (counts.planning_packet_planning_rows <= 0) issues.push('planning_packet_planning_rows must be positive');
  if (counts.planning_packet_occurrence_link_rows !== counts.occurrence_link_rows) {
    issues.push('planning_packet_occurrence_link_rows must equal occurrence_link_rows');
  }
  if (counts.planning_packet_current_sample_rows_with_usage_links !== 0) {
    issues.push('planning_packet_current_sample_rows_with_usage_links must be 0');
  }
  if (counts.planning_packet_current_sample_usage_tokens_not_in_sample <= 0) {
    issues.push('planning_packet_current_sample_usage_tokens_not_in_sample must be positive');
  }
  if (counts.planning_packet_route_ids <= 0) issues.push('planning_packet_route_ids must be positive');
  if (counts.planning_packet_reader_facing_rows !== 0) issues.push('planning_packet_reader_facing_rows must be 0');
  if (counts.planning_packet_route_payload_field_hits !== 0) {
    issues.push('planning_packet_route_payload_field_hits must be 0');
  }
  if (counts.planning_packet_forbidden_authority_field_hits !== 0) {
    issues.push('planning_packet_forbidden_authority_field_hits must be 0');
  }
  if (counts.anchor_audit_rows !== counts.occurrence_link_rows) {
    issues.push('anchor_audit_rows must equal occurrence_link_rows');
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
    if (counts[key] !== counts.anchor_audit_rows) issues.push(`${key} must equal anchor_audit_rows`);
  }
  if (counts.anchor_audit_reader_facing_rows !== 0) issues.push('anchor_audit_reader_facing_rows must be 0');
  if (counts.anchor_audit_route_payload_field_hits !== 0) {
    issues.push('anchor_audit_route_payload_field_hits must be 0');
  }
  if (counts.anchor_audit_forbidden_authority_field_hits !== 0) {
    issues.push('anchor_audit_forbidden_authority_field_hits must be 0');
  }
  if (counts.proof_occurrence_rows < 1) issues.push('proof_occurrence_rows must be positive');
  if (counts.proof_rows_with_complete_metadata !== counts.proof_occurrence_rows) issues.push('proof metadata must be complete');
  if (counts.proof_rows_with_hebrew_token !== counts.proof_occurrence_rows) issues.push('all proof rows must include Hebrew token fields');
  if (counts.proof_rows_with_hebrew_context !== counts.proof_occurrence_rows) issues.push('all proof rows must include Hebrew context');
  if (counts.proof_rows_with_focus_marker !== counts.proof_occurrence_rows) issues.push('all proof rows must include focus markers');
  if (counts.proof_mojibake_rows !== 0) issues.push('proof_mojibake_rows must be 0');
  if (counts.current_sample_rows_with_usage_links !== 0) issues.push('current_sample_rows_with_usage_links must be 0 for this queue-ready packet');
  if (counts.usage_tokens_absent_from_current_sample < 1) issues.push('usage_tokens_absent_from_current_sample must be positive');
  if (counts.join_rows < 1) issues.push('join_rows must be positive');
  if (counts.projected_usage_link_rows < counts.proof_occurrence_rows) issues.push('projected_usage_link_rows must cover proof rows');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (counts.queue_mutations !== 0) issues.push('queue_mutations must be 0');
  if (counts.submitted_to_agent6 !== 0) issues.push('submitted_to_agent6 must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) {
    issues.push(`forbidden authority keys present: ${hits.slice(0, 30).join(', ')}`);
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
