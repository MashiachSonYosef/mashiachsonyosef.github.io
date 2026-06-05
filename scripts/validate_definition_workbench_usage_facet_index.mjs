#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-facet-index.json');
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
const requiredFacetGroups = [
  'route_id',
  'token_key',
  'focus_normalized',
  'cluster_id',
  'usage_frame',
  'status',
  'work',
  'source_ref',
  'provenance',
  'license',
];

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_facet_index') {
  issues.push('artifact_type must be definition_workbench_usage_facet_index');
}
if (!String(packet.policy || '').includes('usage-navigation facet index')) {
  issues.push('policy must identify usage-navigation facet index');
}

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateOccurrences(packet.occurrence_rows || []);
validateFacets(packet.facets || {}, packet.occurrence_rows || []);
validateRouteConcentration(packet.route_concentration || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage facet index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage facet index validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage facet index validation passed.');
}
console.log(`Occurrences: ${packet.counts.occurrence_rows}; facets: ${packet.counts.facets_total}; route IDs: ${packet.counts.route_ids}; concentration warning: ${packet.counts.route_concentration_warning}.`);

function validateInputs(inputs) {
  if (!inputs.occurrence_detail_index || !fs.existsSync(path.join(root, cleanRelativePath(inputs.occurrence_detail_index)))) {
    issues.push('inputs.occurrence_detail_index must point to an existing occurrence-detail index');
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
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateOccurrences(rows) {
  if (!Array.isArray(rows) || rows.length <= 0) {
    issues.push('occurrence_rows must be a non-empty array');
    return;
  }
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const context = `occurrence_rows[${index}]`;
    for (const field of [
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
      'provenance_id',
      'version_title',
      'version_source',
      'license',
      'license_url',
    ]) {
      if (row[field] === undefined || row[field] === null || row[field] === '') issues.push(`${context}.${field} is required`);
    }
    if (ids.has(row.occurrence_id)) issues.push(`${context}.occurrence_id duplicate ${row.occurrence_id}`);
    ids.add(row.occurrence_id);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length <= 0) {
      issues.push(`${context}.related_route_ids must be a non-empty array`);
    }
    if (!Array.isArray(row.unresolved_route_ids) || row.unresolved_route_ids.length !== 0) {
      issues.push(`${context}.unresolved_route_ids must be an empty array`);
    }
    if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
      issues.push(`${context}.context_focus_marked must include a focus marker`);
    }
    if (row.usage_label !== 'observed usage only') issues.push(`${context}.usage_label must be observed usage only`);
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
  }
}

function validateFacets(facets, rows) {
  const occurrenceIds = new Set(rows.map((row) => row.occurrence_id));
  for (const group of requiredFacetGroups) {
    const groupRows = facets[group];
    if (!Array.isArray(groupRows) || groupRows.length <= 0) {
      issues.push(`facets.${group} must be a non-empty array`);
      continue;
    }
    const covered = new Set();
    for (const [index, facet] of groupRows.entries()) {
      const context = `facets.${group}[${index}]`;
      for (const field of [
        'facet_id',
        'facet_kind',
        'facet_key',
        'facet_label',
        'facet_rank',
        'occurrence_count',
        'selected_row_share_basis_points',
        'occurrence_ids',
        'status_counts',
        'cluster_ids',
        'usage_frame_labels',
        'source_refs',
        'work_slugs',
        'route_ids',
        'unresolved_route_ids',
        'license_urls',
        'version_sources',
        'provenance_keys',
        'metadata_counts',
        'usage_boundary',
        'sample_occurrence_links',
      ]) {
        if (facet[field] === undefined || facet[field] === null || facet[field] === '') issues.push(`${context}.${field} is required`);
      }
      if (facet.facet_kind !== group) issues.push(`${context}.facet_kind must be ${group}`);
      if (!Number.isInteger(facet.occurrence_count) || facet.occurrence_count <= 0) {
        issues.push(`${context}.occurrence_count must be positive`);
      }
      if (!Array.isArray(facet.occurrence_ids) || facet.occurrence_ids.length !== facet.occurrence_count) {
        issues.push(`${context}.occurrence_ids length must equal occurrence_count`);
      }
      for (const occurrenceId of facet.occurrence_ids || []) {
        if (!occurrenceIds.has(occurrenceId)) issues.push(`${context}.occurrence_ids contains unknown ${occurrenceId}`);
        covered.add(occurrenceId);
      }
      validateMetadataCounts(`${context}.metadata_counts`, facet.metadata_counts || {}, facet.occurrence_count);
      validateUsageBoundary(`${context}.usage_boundary`, facet.usage_boundary || {});
      if (!Array.isArray(facet.unresolved_route_ids) || facet.unresolved_route_ids.length !== 0) {
        issues.push(`${context}.unresolved_route_ids must be empty`);
      }
      if (!Array.isArray(facet.sample_occurrence_links) || facet.sample_occurrence_links.length <= 0) {
        issues.push(`${context}.sample_occurrence_links must be non-empty`);
      }
    }
    if (group !== 'route_id' && covered.size !== occurrenceIds.size) {
      issues.push(`facets.${group} must cover every occurrence id`);
    }
    if (group === 'route_id' && covered.size !== occurrenceIds.size) {
      issues.push('facets.route_id must cover every occurrence id');
    }
  }
}

function validateMetadataCounts(context, counts, expected) {
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
  ]) {
    if (counts[key] !== expected) issues.push(`${context}.${key} must equal facet occurrence_count`);
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

function validateRouteConcentration(concentration) {
  if (!Number.isInteger(concentration.unique_route_ids) || concentration.unique_route_ids <= 0) {
    issues.push('route_concentration.unique_route_ids must be positive');
  }
  if (!Array.isArray(concentration.route_ids) || concentration.route_ids.length !== concentration.unique_route_ids) {
    issues.push('route_concentration.route_ids length must equal unique_route_ids');
  }
  if (concentration.unique_route_ids === 1) {
    if (concentration.max_route_share_basis_points !== 10000) issues.push('single-route concentration must have 10000 basis point share');
    if (concentration.concentration_warning !== true) issues.push('single-route concentration must set concentration_warning true');
    if (!String(concentration.warning_label || '').includes('not independent semantic route diversity')) {
      issues.push('route concentration warning must say it is not independent semantic route diversity');
    }
    warnings.push('route-linked selected rows remain concentrated on one route ID');
  }
}

function validateCounts(counts) {
  const required = [
    'occurrence_rows',
    'facet_groups',
    'facets_total',
    ...requiredFacetGroups.map((group) => `${group}_facets`),
    'route_ids',
    'max_route_occurrence_count',
    'max_route_share_basis_points',
    'route_concentration_warning',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'unresolved_route_ids',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.occurrence_rows <= 0) issues.push('counts.occurrence_rows must be positive');
  if (counts.facet_groups !== requiredFacetGroups.length) issues.push('counts.facet_groups must match required facet groups');
  if (counts.facets_total < counts.facet_groups) issues.push('counts.facets_total must be at least facet_groups');
  for (const group of requiredFacetGroups) {
    if (counts[`${group}_facets`] <= 0) issues.push(`counts.${group}_facets must be positive`);
  }
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
    'observed_usage_only_rows',
  ]) {
    if (counts[key] !== counts.occurrence_rows) issues.push(`counts.${key} must equal occurrence_rows`);
  }
  if (counts.route_ids <= 0) issues.push('counts.route_ids must be positive');
  if (counts.route_ids === 1 && counts.max_route_share_basis_points !== 10000) {
    issues.push('single-route facet share must be 10000 basis points');
  }
  if (counts.route_ids === 1 && counts.route_concentration_warning !== 1) {
    issues.push('single-route concentration must set route_concentration_warning to 1');
  }
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
  if (counts.unresolved_route_ids !== 0) issues.push('counts.unresolved_route_ids must be 0');
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
