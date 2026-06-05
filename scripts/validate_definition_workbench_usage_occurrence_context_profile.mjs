#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-occurrence-context-profile.json');
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
if (packet.artifact_type !== 'definition_workbench_usage_occurrence_context_profile') {
  issues.push('artifact_type must be definition_workbench_usage_occurrence_context_profile');
}
if (!String(packet.policy || '').includes('occurrence-to-context-token profile')) {
  issues.push('policy must describe occurrence-to-context-token profile');
}
if (packet.generator !== 'scripts/build_definition_workbench_usage_occurrence_context_profile.mjs') {
  issues.push('generator must be scripts/build_definition_workbench_usage_occurrence_context_profile.mjs');
}

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateUsageContract(packet.usage_contract || {});
validateRows(Array.isArray(packet.occurrence_context_profiles) ? packet.occurrence_context_profiles : []);
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage occurrence context profile validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage occurrence context profile validation passed.');
console.log(`Profiles: ${packet.counts.profile_rows}; links: ${packet.counts.context_token_link_rows}; reverse-linked rows: ${packet.counts.rows_with_reverse_index_ids}/${packet.counts.profile_rows}.`);

function validateInputs(inputs) {
  const expected = [
    'occurrence_detail_index',
    'context_token_links',
    'context_token_occurrence_index',
  ];
  for (const key of expected) {
    if (!inputs[key] || !fs.existsSync(path.join(root, cleanRelativePath(inputs[key])))) {
      issues.push(`inputs.${key} must point to an existing artifact`);
    }
  }
}

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'selected_scope_only',
    'occurrence_context_profile_only',
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

function validateUsageContract(contract) {
  if (contract.row_label !== 'observed usage only') issues.push('usage_contract.row_label must be observed usage only');
  if (!String(contract.safe_consumer_role || '').includes('occurrence-centric context-token navigation')) {
    issues.push('usage_contract.safe_consumer_role must identify occurrence-centric context-token navigation');
  }
  if (!String(contract.route_payload_rule || '').includes('related_route_ids only')) {
    issues.push('usage_contract.route_payload_rule must restrict to related_route_ids only');
  }
  if (!String(contract.ambiguous_policy || '').includes('audit-only')) {
    issues.push('usage_contract.ambiguous_policy must keep ambiguous rows audit-only');
  }
  if (!Array.isArray(contract.not_authority) || contract.not_authority.length < 6) {
    issues.push('usage_contract.not_authority must list non-authority boundaries');
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) issues.push('occurrence_context_profiles must be non-empty');
  const profileIds = new Set();
  const occurrenceIds = new Set();
  let linkTotal = 0;
  let focusTotal = 0;
  let contextTotal = 0;
  let rowsWithSource = 0;
  let rowsWithWork = 0;
  let rowsWithContext = 0;
  let rowsWithFocusMarker = 0;
  let rowsWithRouteIds = 0;
  let rowsWithLicense = 0;
  let rowsWithVersion = 0;
  let rowsObserved = 0;
  let rowsWithReverseIds = 0;
  let rowsCompleteReverse = 0;

  for (const [index, row] of rows.entries()) {
    const context = `occurrence_context_profiles[${index}]`;
    requireFields(row, [
      'occurrence_context_profile_id',
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
      'route_resolution_status',
      'unresolved_route_ids',
      'provenance_id',
      'version_title',
      'version_source',
      'license',
      'license_url',
      'context_token_profile',
      'context_tokens',
      'usage_boundary',
    ], context);
    if (profileIds.has(row.occurrence_context_profile_id)) issues.push(`${context}.occurrence_context_profile_id duplicate`);
    profileIds.add(row.occurrence_context_profile_id);
    if (occurrenceIds.has(row.occurrence_id)) issues.push(`${context}.occurrence_id duplicate`);
    occurrenceIds.add(row.occurrence_id);
    if (row.usage_label !== 'observed usage only') issues.push(`${context}.usage_label must be observed usage only`);
    if (row.navigation_label !== 'occurrence context-token profile') {
      issues.push(`${context}.navigation_label must be occurrence context-token profile`);
    }
    if (!['supported', 'candidate', 'weak'].includes(row.status)) issues.push(`${context}.status must be supported, candidate, or weak`);
    if (!Number.isInteger(row.raw_score) || row.raw_score < 0) issues.push(`${context}.raw_score must be non-negative integer`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) issues.push(`${context}.related_route_ids must be non-empty`);
    if (!Array.isArray(row.unresolved_route_ids) || row.unresolved_route_ids.length !== 0) issues.push(`${context}.unresolved_route_ids must be empty`);
    if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
      issues.push(`${context}.context_focus_marked must include focus brackets`);
    }
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
    validateProfile(`${context}.context_token_profile`, row.context_token_profile || {}, row.context_tokens || []);
    validateContextTokens(`${context}.context_tokens`, row.context_tokens || []);

    linkTotal += Number(row.context_token_profile?.context_token_count || 0);
    focusTotal += Number(row.context_token_profile?.focus_link_count || 0);
    contextTotal += Number(row.context_token_profile?.context_link_count || 0);
    if (row.source_href) rowsWithSource += 1;
    if (row.work_anchor_href) rowsWithWork += 1;
    if (row.context_focus_marked) rowsWithContext += 1;
    if (String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')) rowsWithFocusMarker += 1;
    if ((row.related_route_ids || []).length > 0) rowsWithRouteIds += 1;
    if (row.license && row.license_url) rowsWithLicense += 1;
    if (row.version_title && row.version_source) rowsWithVersion += 1;
    if (row.usage_label === 'observed usage only' && row.usage_boundary?.observed_usage_only === true) rowsObserved += 1;
    if ((row.context_token_profile?.context_token_occurrence_index_ids || []).length > 0) rowsWithReverseIds += 1;
    if ((row.context_tokens || []).every((token) => token.context_token_occurrence_index_id)) rowsCompleteReverse += 1;
  }

  const counts = packet.counts || {};
  if (counts.profile_rows !== rows.length) issues.push('counts.profile_rows must equal occurrence_context_profiles length');
  if (counts.context_token_link_rows !== linkTotal) issues.push('counts.context_token_link_rows must equal per-row link sum');
  if (counts.focus_link_rows !== focusTotal) issues.push('counts.focus_link_rows must equal per-row focus sum');
  if (counts.context_link_rows !== contextTotal) issues.push('counts.context_link_rows must equal per-row context sum');
  const expectedEqualsProfile = {
    rows_with_source_link: rowsWithSource,
    rows_with_work_anchor: rowsWithWork,
    rows_with_hebrew_context: rowsWithContext,
    rows_with_focus_marker: rowsWithFocusMarker,
    rows_with_route_ids: rowsWithRouteIds,
    rows_with_license_metadata: rowsWithLicense,
    rows_with_version_metadata: rowsWithVersion,
    observed_usage_only_rows: rowsObserved,
    rows_with_reverse_index_ids: rowsWithReverseIds,
    rows_with_complete_reverse_index_mapping: rowsCompleteReverse,
  };
  for (const [key, value] of Object.entries(expectedEqualsProfile)) {
    if (counts[key] !== value) issues.push(`counts.${key} must equal observed row count ${value}`);
  }
}

function validateProfile(context, profile, tokens) {
  requireFields(profile, [
    'context_token_link_ids',
    'context_token_occurrence_index_ids',
    'context_token_count',
    'unique_context_normalized_count',
    'focus_link_count',
    'context_link_count',
    'repeated_focus_context_link_count',
    'cross_frame_context_link_count',
    'before_focus_count',
    'at_focus_count',
    'after_focus_count',
  ], context);
  if (!Array.isArray(profile.context_token_link_ids) || profile.context_token_link_ids.length === 0) {
    issues.push(`${context}.context_token_link_ids must be non-empty`);
  }
  if (!Array.isArray(profile.context_token_occurrence_index_ids) || profile.context_token_occurrence_index_ids.length === 0) {
    issues.push(`${context}.context_token_occurrence_index_ids must be non-empty`);
  }
  if (profile.context_token_count !== tokens.length) issues.push(`${context}.context_token_count must equal context_tokens length`);
  if (profile.context_token_link_ids.length !== tokens.length) issues.push(`${context}.context_token_link_ids length must equal context_tokens length`);
  if (profile.focus_link_count !== tokens.filter((token) => token.focus_marked === true).length) {
    issues.push(`${context}.focus_link_count mismatch`);
  }
  if (profile.context_link_count !== tokens.filter((token) => token.focus_marked !== true).length) {
    issues.push(`${context}.context_link_count mismatch`);
  }
  if (profile.focus_link_count !== 1) issues.push(`${context}.focus_link_count must be 1`);
  if (profile.context_link_count <= 0) issues.push(`${context}.context_link_count must be positive`);
  if (profile.at_focus_count !== 1) issues.push(`${context}.at_focus_count must be 1`);
  if (profile.after_focus_count <= 0) issues.push(`${context}.after_focus_count must be positive`);
}

function validateContextTokens(context, tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) issues.push(`${context} must be non-empty`);
  const linkIds = new Set();
  for (const [index, token] of tokens.entries()) {
    const tokenContext = `${context}[${index}]`;
    requireFields(token, [
      'context_token_link_id',
      'context_token_id',
      'context_token_occurrence_index_id',
      'context_surface',
      'context_normalized',
      'context_link_role',
      'focus_marked',
      'is_repeated_focus_token',
      'distance_from_focus',
      'cross_frame_context_token',
      'selected_row_share_basis_points',
    ], tokenContext);
    if (linkIds.has(token.context_token_link_id)) issues.push(`${tokenContext}.context_token_link_id duplicate in profile`);
    linkIds.add(token.context_token_link_id);
    if (!['context', 'focus', 'repeated_focus_context'].includes(token.context_link_role)) {
      issues.push(`${tokenContext}.context_link_role must be context/focus/repeated_focus_context`);
    }
    if (typeof token.focus_marked !== 'boolean') issues.push(`${tokenContext}.focus_marked must be boolean`);
    if (typeof token.is_repeated_focus_token !== 'boolean') issues.push(`${tokenContext}.is_repeated_focus_token must be boolean`);
    if (!Number.isInteger(token.distance_from_focus)) issues.push(`${tokenContext}.distance_from_focus must be integer`);
    if (typeof token.cross_frame_context_token !== 'boolean') issues.push(`${tokenContext}.cross_frame_context_token must be boolean`);
    if (!Number.isInteger(token.selected_row_share_basis_points) || token.selected_row_share_basis_points < 0) {
      issues.push(`${tokenContext}.selected_row_share_basis_points must be non-negative integer`);
    }
  }
}

function validateCounts(counts) {
  const required = [
    'profile_rows',
    'input_occurrence_detail_rows',
    'context_token_link_rows',
    'input_context_token_link_rows',
    'reverse_index_rows',
    'input_reverse_index_rows',
    'unique_context_tokens',
    'rows_with_context_tokens',
    'rows_with_reverse_index_ids',
    'rows_with_complete_reverse_index_mapping',
    'focus_link_rows',
    'input_focus_link_rows',
    'context_link_rows',
    'input_context_link_rows',
    'repeated_focus_context_link_rows',
    'cross_frame_context_link_rows',
    'rows_with_cross_frame_context_links',
    'rows_with_repeated_focus_context_links',
    'rows_with_before_focus_tokens',
    'rows_with_after_focus_tokens',
    'source_refs',
    'works',
    'licenses',
    'version_sources',
    'route_ids',
    'unresolved_route_ids',
    'max_route_share_basis_points',
    'route_concentration_warning',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_route_ids',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.profile_rows !== counts.input_occurrence_detail_rows || counts.profile_rows <= 0) {
    issues.push('profile_rows must equal input_occurrence_detail_rows and be positive');
  }
  if (counts.context_token_link_rows !== counts.input_context_token_link_rows) {
    issues.push('context_token_link_rows must equal input_context_token_link_rows');
  }
  if (counts.context_token_link_rows !== counts.focus_link_rows + counts.context_link_rows) {
    issues.push('context_token_link_rows must equal focus plus context link rows');
  }
  if (counts.reverse_index_rows !== counts.input_reverse_index_rows || counts.reverse_index_rows <= 0) {
    issues.push('reverse_index_rows must equal input_reverse_index_rows and be positive');
  }
  if (counts.rows_with_context_tokens !== counts.profile_rows) issues.push('rows_with_context_tokens must equal profile_rows');
  if (counts.rows_with_reverse_index_ids !== counts.profile_rows) issues.push('rows_with_reverse_index_ids must equal profile_rows');
  if (counts.rows_with_complete_reverse_index_mapping !== counts.profile_rows) {
    issues.push('rows_with_complete_reverse_index_mapping must equal profile_rows');
  }
  if (counts.focus_link_rows !== counts.input_focus_link_rows || counts.focus_link_rows !== counts.profile_rows) {
    issues.push('focus_link_rows must equal input_focus_link_rows and profile_rows');
  }
  if (counts.context_link_rows !== counts.input_context_link_rows) issues.push('context_link_rows must equal input_context_link_rows');
  if (counts.context_link_rows <= counts.profile_rows) issues.push('context_link_rows must exceed profile_rows');
  if (counts.repeated_focus_context_link_rows <= 0) issues.push('repeated_focus_context_link_rows must be positive');
  if (counts.rows_with_before_focus_tokens <= 0) issues.push('rows_with_before_focus_tokens must be positive');
  if (counts.rows_with_after_focus_tokens !== counts.profile_rows) issues.push('rows_with_after_focus_tokens must equal profile_rows');
  if (counts.cross_frame_context_link_rows <= 0 || counts.rows_with_cross_frame_context_links <= 0) {
    issues.push('cross-frame context links and rows must be positive');
  }
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.max_route_share_basis_points !== 10000) issues.push('max_route_share_basis_points must be 10000');
  if (counts.route_concentration_warning !== 1) issues.push('route_concentration_warning must be 1');
  for (const key of [
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_route_ids',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'observed_usage_only_rows',
  ]) {
    if (counts[key] !== counts.profile_rows) issues.push(`counts.${key} must equal profile_rows`);
  }
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'occurrence_context_profile_only',
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

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 50).join(', ')}`);

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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value).replace(/\\/g, '/');
  if (normalized.includes('..')) throw new Error(`Refusing path with parent traversal: ${value}`);
  return normalized;
}
