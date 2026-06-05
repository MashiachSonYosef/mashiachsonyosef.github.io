#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-route-diversity-probe.json');
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
  'route_metadata',
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_route_diversity_probe') {
  issues.push('artifact_type must be definition_workbench_usage_route_diversity_probe');
}
if (!String(packet.policy || '').includes('route-diversity probe')) {
  issues.push('policy must identify route-diversity probe');
}

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateRouteDiversity(packet.route_diversity || {});
validateRouteProbes(packet.route_probes || [], packet.occurrence_route_links || []);
validateCoverageBuckets(packet.coverage_buckets || {}, packet.occurrence_route_links || []);
validateConcentrationSupport(packet.concentration_support || {}, packet.occurrence_route_links || []);
validateOccurrenceRouteLinks(packet.occurrence_route_links || []);
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage route-diversity probe validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 180)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage route-diversity probe validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage route-diversity probe validation passed.');
}
console.log(`Occurrences: ${packet.counts.occurrence_rows}; route IDs: ${packet.counts.route_ids}; max route share: ${packet.counts.max_route_share_basis_points}/10000.`);

function validateInputs(inputs) {
  for (const key of ['occurrence_detail_index', 'route_resolution', 'selected_source_diversity', 'selected_signature_independence']) {
    if (!inputs[key] || !fs.existsSync(path.join(root, cleanRelativePath(inputs[key])))) {
      issues.push(`inputs.${key} must point to an existing local artifact`);
    }
  }
}

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'selected_scope_only',
    'observed_usage_only',
    'route_ids_only',
    'source_license_required',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_agent2_payloads',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'semantic_independence_claim',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateRouteDiversity(diversity) {
  requireFields(diversity, [
    'status',
    'selected_scope_only',
    'route_ids',
    'unique_route_ids',
    'selected_occurrence_rows',
    'max_route_id',
    'max_route_occurrence_count',
    'max_route_share_basis_points',
    'all_selected_rows_same_route',
    'concentration_warning',
    'semantic_independence_claim_allowed',
    'usage_rows_may_be_used_as_authority',
    'warning_label',
  ], 'route_diversity');
  if (diversity.selected_scope_only !== true) issues.push('route_diversity.selected_scope_only must be true');
  if (!Array.isArray(diversity.route_ids) || diversity.route_ids.length !== diversity.unique_route_ids) {
    issues.push('route_diversity.route_ids length must equal unique_route_ids');
  }
  if (!Number.isInteger(diversity.unique_route_ids) || diversity.unique_route_ids <= 0) {
    issues.push('route_diversity.unique_route_ids must be positive');
  }
  if (diversity.unique_route_ids === 1) {
    if (diversity.status !== 'concentrated') issues.push('single-route probe must be concentrated');
    if (diversity.max_route_share_basis_points !== 10000) issues.push('single-route probe must have 10000 basis-point share');
    if (diversity.all_selected_rows_same_route !== true) issues.push('single-route probe must mark all_selected_rows_same_route true');
    if (diversity.concentration_warning !== true) issues.push('single-route probe must set concentration_warning true');
    warnings.push('selected occurrence links remain concentrated on one route ID');
  }
  if (diversity.semantic_independence_claim_allowed !== false) {
    issues.push('route_diversity.semantic_independence_claim_allowed must be false');
  }
  if (diversity.usage_rows_may_be_used_as_authority !== false) {
    issues.push('route_diversity.usage_rows_may_be_used_as_authority must be false');
  }
  if (!String(diversity.warning_label || '').includes('must not be treated as independent semantic route diversity')) {
    issues.push('route_diversity.warning_label must block independent semantic route diversity claims');
  }
}

function validateRouteProbes(probes, occurrenceRows) {
  if (!Array.isArray(probes) || probes.length <= 0) issues.push('route_probes must be a non-empty array');
  const occurrenceTotal = occurrenceRows.length;
  for (const [index, probe] of probes.entries()) {
    const context = `route_probes[${index}]`;
    requireFields(probe, [
      'route_id',
      'route_sources',
      'occurrence_count',
      'selected_row_share_basis_points',
      'resolved_occurrence_rows',
      'unresolved_occurrence_rows',
      'status_counts',
      'cluster_counts',
      'usage_frame_counts',
      'work_count',
      'source_ref_count',
      'license_count',
      'provenance_count',
      'sample_occurrence_links',
      'usage_boundary',
    ], context);
    if (!Array.isArray(probe.route_sources) || probe.route_sources.length <= 0) issues.push(`${context}.route_sources must be non-empty`);
    if (!Number.isInteger(probe.occurrence_count) || probe.occurrence_count <= 0) issues.push(`${context}.occurrence_count must be positive`);
    if (probe.occurrence_count > occurrenceTotal) issues.push(`${context}.occurrence_count cannot exceed occurrence rows`);
    if (probe.unresolved_occurrence_rows !== 0) issues.push(`${context}.unresolved_occurrence_rows must be 0`);
    if (!Array.isArray(probe.sample_occurrence_links) || probe.sample_occurrence_links.length <= 0) {
      issues.push(`${context}.sample_occurrence_links must be non-empty`);
    }
    validateUsageBoundary(`${context}.usage_boundary`, probe.usage_boundary || {});
  }
}

function validateCoverageBuckets(buckets, occurrenceRows) {
  const requiredGroups = ['by_status', 'by_cluster', 'by_usage_frame', 'by_work', 'by_source_ref', 'by_license', 'by_provenance'];
  const occurrenceIds = new Set(occurrenceRows.map((row) => row.occurrence_id));
  for (const group of requiredGroups) {
    if (!Array.isArray(buckets[group]) || buckets[group].length <= 0) {
      issues.push(`coverage_buckets.${group} must be a non-empty array`);
      continue;
    }
    const covered = new Set();
    for (const [index, bucket] of buckets[group].entries()) {
      const context = `coverage_buckets.${group}[${index}]`;
      requireFields(bucket, [
        'bucket_key',
        'bucket_label',
        'occurrence_count',
        'selected_row_share_basis_points',
        'route_ids',
        'status_counts',
        'cluster_ids',
        'usage_frame_labels',
        'source_refs',
        'work_slugs',
        'license_urls',
        'occurrence_ids',
        'usage_boundary',
      ], context);
      if (!Array.isArray(bucket.occurrence_ids) || bucket.occurrence_ids.length !== bucket.occurrence_count) {
        issues.push(`${context}.occurrence_ids length must equal occurrence_count`);
      }
      for (const occurrenceId of bucket.occurrence_ids || []) {
        if (!occurrenceIds.has(occurrenceId)) issues.push(`${context}.occurrence_ids contains unknown ${occurrenceId}`);
        covered.add(occurrenceId);
      }
      validateUsageBoundary(`${context}.usage_boundary`, bucket.usage_boundary || {});
    }
    if (covered.size !== occurrenceIds.size) issues.push(`coverage_buckets.${group} must cover every occurrence id`);
  }
}

function validateConcentrationSupport(support, occurrenceRows) {
  requireFields(support, [
    'selected_occurrence_refs',
    'source_diversity',
    'signature_independence',
    'boundary',
  ], 'concentration_support');
  if (support.selected_occurrence_refs !== occurrenceRows.length) {
    issues.push('concentration_support.selected_occurrence_refs must equal occurrence route rows');
  }
  const source = support.source_diversity || {};
  for (const key of [
    'unique_source_refs',
    'unique_work_anchors',
    'unique_works',
    'unique_licenses',
    'unique_version_sources',
    'duplicate_source_ref_buckets',
    'duplicate_source_ref_rows',
    'missing_signature_independence_rows',
  ]) {
    if (!Number.isInteger(source[key]) || source[key] < 0) {
      issues.push(`concentration_support.source_diversity.${key} must be a non-negative integer`);
    }
  }
  if (source.unique_source_refs <= 1) issues.push('concentration_support.source_diversity.unique_source_refs must show diversity');
  if (source.unique_works <= 1) issues.push('concentration_support.source_diversity.unique_works must show diversity');
  if (source.unique_licenses <= 1) issues.push('concentration_support.source_diversity.unique_licenses must show license spread');
  if (source.unique_version_sources <= 1) issues.push('concentration_support.source_diversity.unique_version_sources must show version-source spread');
  if (source.duplicate_source_ref_rows <= 0) issues.push('concentration_support.source_diversity.duplicate_source_ref_rows must be positive');
  if (source.missing_signature_independence_rows !== 0) {
    issues.push('concentration_support.source_diversity.missing_signature_independence_rows must be 0');
  }

  const signature = support.signature_independence || {};
  for (const key of [
    'signature_memberships',
    'recurring_signature_memberships',
    'cross_cluster_signature_memberships',
    'occurrence_refs_with_recurring_signatures',
    'occurrence_refs_with_cross_cluster_signatures',
    'occurrence_refs_without_recurring_signatures',
    'missing_lookup_rows',
  ]) {
    if (!Number.isInteger(signature[key]) || signature[key] < 0) {
      issues.push(`concentration_support.signature_independence.${key} must be a non-negative integer`);
    }
  }
  if (signature.signature_memberships <= 0) issues.push('concentration_support.signature_independence.signature_memberships must be positive');
  if (signature.occurrence_refs_with_recurring_signatures <= 0) {
    issues.push('concentration_support.signature_independence.occurrence_refs_with_recurring_signatures must be positive');
  }
  if (signature.occurrence_refs_with_cross_cluster_signatures <= 0) {
    issues.push('concentration_support.signature_independence.occurrence_refs_with_cross_cluster_signatures must be positive');
  }
  if (signature.missing_lookup_rows !== 0) {
    issues.push('concentration_support.signature_independence.missing_lookup_rows must be 0');
  }

  const boundary = support.boundary || {};
  const expectedTrue = [
    'support_context_only',
    'selected_scope_only',
    'observed_usage_only',
    'route_ids_only',
    'not_definition_authority',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`concentration_support.boundary.${key} must be true`);
  }
  for (const key of ['reader_facing', 'ranks_routes', 'selects_visible_result', 'semantic_independence_claim_allowed']) {
    if (boundary[key] !== false) issues.push(`concentration_support.boundary.${key} must be false`);
  }
}

function validateOccurrenceRouteLinks(rows) {
  if (!Array.isArray(rows) || rows.length <= 0) {
    issues.push('occurrence_route_links must be a non-empty array');
    return;
  }
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const context = `occurrence_route_links[${index}]`;
    requireFields(row, [
      'occurrence_id',
      'detail_id',
      'row_id',
      'token_key',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'usage_label',
      'navigation_label',
      'status',
      'raw_score',
      'cluster_id',
      'usage_frame_label',
      'source_ref',
      'source_href',
      'work_title',
      'work_slug',
      'work_anchor_href',
      'context_focus_marked',
      'related_route_ids',
      'route_sources',
      'route_resolution_statuses',
      'unresolved_route_ids',
      'provenance_id',
      'provenance_key',
      'version_title',
      'version_source',
      'license',
      'license_url',
      'neighbor_summary',
      'usage_boundary',
    ], context);
    if (ids.has(row.occurrence_id)) issues.push(`${context}.occurrence_id duplicate ${row.occurrence_id}`);
    ids.add(row.occurrence_id);
    if (row.usage_label !== 'observed usage only') issues.push(`${context}.usage_label must be observed usage only`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length <= 0) {
      issues.push(`${context}.related_route_ids must be non-empty`);
    }
    if (!Array.isArray(row.route_sources) || row.route_sources.length <= 0) {
      issues.push(`${context}.route_sources must be non-empty`);
    }
    if (!Array.isArray(row.unresolved_route_ids) || row.unresolved_route_ids.length !== 0) {
      issues.push(`${context}.unresolved_route_ids must be empty`);
    }
    if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
      issues.push(`${context}.context_focus_marked must include focus marker`);
    }
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
  }
}

function validateCounts(counts) {
  const required = [
    'occurrence_rows',
    'route_ids',
    'route_probe_rows',
    'max_route_occurrence_count',
    'max_route_share_basis_points',
    'route_concentration_warning',
    'all_selected_rows_same_route',
    'semantic_independence_claim_allowed',
    'occurrence_rows_with_source_link',
    'occurrence_rows_with_work_anchor',
    'occurrence_rows_with_context',
    'occurrence_rows_with_focus_marker',
    'occurrence_rows_with_license',
    'occurrence_rows_with_version',
    'occurrence_rows_with_route_ids',
    'observed_usage_only_rows',
    'source_refs',
    'works',
    'clusters',
    'usage_frames',
    'statuses',
    'licenses',
    'provenance_keys',
    'coverage_bucket_groups',
    'coverage_buckets_total',
    'concentration_support_selected_occurrence_refs',
    'concentration_support_unique_source_refs',
    'concentration_support_unique_work_anchors',
    'concentration_support_unique_works',
    'concentration_support_unique_licenses',
    'concentration_support_unique_version_sources',
    'concentration_support_duplicate_source_ref_rows',
    'concentration_support_missing_signature_rows',
    'concentration_support_signature_memberships',
    'concentration_support_recurring_signature_rows',
    'concentration_support_cross_cluster_signature_rows',
    'concentration_support_missing_lookup_rows',
    'concentration_support_final_authority',
    'concentration_support_semantic_independence_allowed',
    'unresolved_route_ids',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.occurrence_rows <= 0) issues.push('counts.occurrence_rows must be positive');
  if (counts.route_ids <= 0) issues.push('counts.route_ids must be positive');
  if (counts.route_probe_rows !== counts.route_ids) issues.push('counts.route_probe_rows must equal route_ids');
  if (counts.route_ids === 1) {
    if (counts.max_route_share_basis_points !== 10000) issues.push('single-route probe must have 10000 max route share');
    if (counts.route_concentration_warning !== 1) issues.push('single-route probe must set route_concentration_warning to 1');
    if (counts.all_selected_rows_same_route !== 1) issues.push('single-route probe must set all_selected_rows_same_route to 1');
  }
  if (counts.semantic_independence_claim_allowed !== 0) {
    issues.push('counts.semantic_independence_claim_allowed must be 0');
  }
  for (const key of [
    'occurrence_rows_with_source_link',
    'occurrence_rows_with_work_anchor',
    'occurrence_rows_with_context',
    'occurrence_rows_with_focus_marker',
    'occurrence_rows_with_license',
    'occurrence_rows_with_version',
    'occurrence_rows_with_route_ids',
    'observed_usage_only_rows',
  ]) {
    if (counts[key] !== counts.occurrence_rows) issues.push(`counts.${key} must equal occurrence_rows`);
  }
  if (counts.source_refs <= 0) issues.push('counts.source_refs must be positive');
  if (counts.works <= 0) issues.push('counts.works must be positive');
  if (counts.clusters <= 0) issues.push('counts.clusters must be positive');
  if (counts.usage_frames <= 0) issues.push('counts.usage_frames must be positive');
  if (counts.licenses <= 0) issues.push('counts.licenses must be positive');
  if (counts.provenance_keys <= 0) issues.push('counts.provenance_keys must be positive');
  if (counts.coverage_bucket_groups !== 7) issues.push('counts.coverage_bucket_groups must be 7');
  if (counts.coverage_buckets_total <= 0) issues.push('counts.coverage_buckets_total must be positive');
  if (counts.concentration_support_selected_occurrence_refs !== counts.occurrence_rows) {
    issues.push('counts.concentration_support_selected_occurrence_refs must equal occurrence_rows');
  }
  if (counts.concentration_support_unique_source_refs <= 1) {
    issues.push('counts.concentration_support_unique_source_refs must show diversity');
  }
  if (counts.concentration_support_unique_work_anchors <= 1) {
    issues.push('counts.concentration_support_unique_work_anchors must show diversity');
  }
  if (counts.concentration_support_unique_works <= 1) {
    issues.push('counts.concentration_support_unique_works must show diversity');
  }
  if (counts.concentration_support_unique_licenses <= 1) {
    issues.push('counts.concentration_support_unique_licenses must show license spread');
  }
  if (counts.concentration_support_unique_version_sources <= 1) {
    issues.push('counts.concentration_support_unique_version_sources must show version-source spread');
  }
  if (counts.concentration_support_duplicate_source_ref_rows <= 0) {
    issues.push('counts.concentration_support_duplicate_source_ref_rows must be positive');
  }
  if (counts.concentration_support_missing_signature_rows !== 0) {
    issues.push('counts.concentration_support_missing_signature_rows must be 0');
  }
  if (counts.concentration_support_signature_memberships <= 0) {
    issues.push('counts.concentration_support_signature_memberships must be positive');
  }
  if (counts.concentration_support_recurring_signature_rows <= 0) {
    issues.push('counts.concentration_support_recurring_signature_rows must be positive');
  }
  if (counts.concentration_support_cross_cluster_signature_rows <= 0) {
    issues.push('counts.concentration_support_cross_cluster_signature_rows must be positive');
  }
  if (counts.concentration_support_missing_lookup_rows !== 0) {
    issues.push('counts.concentration_support_missing_lookup_rows must be 0');
  }
  if (counts.concentration_support_final_authority !== 0) {
    issues.push('counts.concentration_support_final_authority must be 0');
  }
  if (counts.concentration_support_semantic_independence_allowed !== 0) {
    issues.push('counts.concentration_support_semantic_independence_allowed must be 0');
  }
  if (counts.unresolved_route_ids !== 0) issues.push('counts.unresolved_route_ids must be 0');
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  const supportCheck = checks.find((check) => check.id === 'concentration_support_complete');
  if (!supportCheck) issues.push('checks must include concentration_support_complete');
  if (supportCheck && supportCheck.status !== 'warning') {
    issues.push('concentration_support_complete must be a warning');
  }
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`${context}.${key} must be true`);
  }
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
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

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (value[field] === undefined || value[field] === null || value[field] === '') {
      issues.push(`${context}: missing ${field}`);
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
