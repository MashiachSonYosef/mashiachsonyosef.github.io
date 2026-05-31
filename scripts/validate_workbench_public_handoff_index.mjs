#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = cleanRelativePath(process.argv[2] || 'data/workbench-evidence/public-handoff-index.json');
const artifact = readJson(indexPath);
const issues = [];
const allowedStatuses = new Set(['supported', 'candidate', 'weak', 'ambiguous', 'blocked']);
const expectedLicenseCounts = new Map();
const expectedWorkCounts = new Map();
const expectedClusterCounts = new Map();
const expectedRouteLinkMetadata = makeRouteLinkAccumulator();
const expectedIntegritySummary = {
  files: 0,
  existing_files: 0,
  missing_files: 0,
  bytes: 0,
  by_kind: new Map(),
};
const forbiddenFieldNames = new Set([
  'phrase_hebrew',
  'phrase_tokens',
  'usage_note',
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'english_translation',
  'winner',
  'final_answer',
]);

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_public_handoff_index') issues.push('artifact_type must be workbench_public_handoff_index');
if (!Array.isArray(artifact.manifests) || !artifact.manifests.length) issues.push('manifests must be a non-empty array');
if (artifact.reader_facing_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('reader_facing_policy.ambiguous_rows_reader_facing must be false');
}
validateStatusSemantics(artifact.reader_facing_policy?.status_semantics);
validateConsumerContract(artifact.consumer_contract);
validateHandoffPayloadContract(artifact.handoff_payload_contract);
validateCoverageBoundary(artifact.coverage_boundary);

const expected = {
  selected_targets: 0,
  validation_passed: 0,
  validation_failed: 0,
  missing_manifests: 0,
  occurrence_markers: 0,
  candidate_rows: 0,
  clusters: 0,
  blocked_rows: 0,
  reader_facing_eligible_rows: 0,
  count_only_ambiguous_rows: 0,
  zero_useful_targets: 0,
  status_counts: { supported: 0, candidate: 0, weak: 0, ambiguous: 0, blocked: 0 },
};

for (const [index, manifest] of (artifact.manifests || []).entries()) {
  validateManifest(manifest, `manifests[${index}]`);
}

for (const key of ['selected_targets', 'validation_passed', 'validation_failed', 'missing_manifests', 'occurrence_markers', 'candidate_rows', 'clusters', 'blocked_rows', 'reader_facing_eligible_rows', 'count_only_ambiguous_rows', 'zero_useful_targets']) {
  if (Number(artifact.counts?.[key] || 0) !== expected[key]) {
    issues.push(`counts.${key} expected ${expected[key]}, found ${artifact.counts?.[key]}`);
  }
}
for (const status of allowedStatuses) {
  if (Number(artifact.counts?.status_counts?.[status] || 0) !== expected.status_counts[status]) {
    issues.push(`counts.status_counts.${status} expected ${expected.status_counts[status]}, found ${artifact.counts?.status_counts?.[status]}`);
  }
}
validateQualityGates(artifact.quality_gates);
validateAggregateSourceMetadata(artifact.aggregate_source_metadata);
validateAggregateClusterMetadata(artifact.aggregate_cluster_metadata);
validateAggregateRouteLinkMetadata(artifact.aggregate_route_link_metadata);
validateIntegritySummary(artifact.integrity_summary);

walkNoRowPayloads(artifact, indexPath);

if (issues.length) {
  console.error(`Workbench public handoff index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

const topCluster = (artifact.aggregate_cluster_metadata?.cluster_counts || [])[0] || null;
console.log([
  `Workbench public handoff index validation passed. Manifests: ${expected.selected_targets}.`,
  `Eligible rows: ${expected.reader_facing_eligible_rows}.`,
  `Ambiguous count-only rows: ${expected.count_only_ambiguous_rows}.`,
  `Quality: ${artifact.quality_gates?.overall_status || 'unknown'}.`,
  `Top frame: ${topCluster ? `${topCluster.cluster_id} (${topCluster.reader_facing_eligible_rows} eligible)` : 'none'}.`,
].join(' '));

function validateManifest(row, context) {
  expected.selected_targets += 1;
  for (const field of ['slug', 'selection', 'focus', 'manifest_path', 'counts', 'status_counts', 'validation']) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') issues.push(`${context}: missing ${field}`);
  }
  const validationStatus = row.validation?.status || '';
  if (validationStatus === 'passed') expected.validation_passed += 1;
  else expected.validation_failed += 1;
  if (validationStatus === 'missing_manifest') expected.missing_manifests += 1;
  if (validationStatus === 'passed' && Array.isArray(row.validation?.issues) && row.validation.issues.length) {
    issues.push(`${context}: passed validation must not include issues`);
  }
  if (validationStatus !== 'passed' && (!Array.isArray(row.validation?.issues) || row.validation.issues.length === 0)) {
    issues.push(`${context}: failed validation must include issues`);
  }
  if (row.ambiguous_rows_reader_facing !== false) issues.push(`${context}: ambiguous_rows_reader_facing must be false`);

  for (const key of ['occurrence_markers', 'candidate_rows', 'clusters', 'blocked_rows']) {
    const value = Number(row.counts?.[key] || 0);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.counts.${key}: must be a non-negative integer`);
    expected[key] += Math.max(0, value);
  }
  let eligible = 0;
  for (const status of allowedStatuses) {
    const value = Number(row.status_counts?.[status] || 0);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.status_counts.${status}: must be a non-negative integer`);
    expected.status_counts[status] += Math.max(0, value);
    if (['supported', 'candidate', 'weak'].includes(status)) eligible += Math.max(0, value);
  }
  expected.reader_facing_eligible_rows += eligible;
  expected.count_only_ambiguous_rows += Math.max(0, Number(row.status_counts?.ambiguous || 0));
  if (validationStatus === 'passed' && eligible === 0) {
    expected.zero_useful_targets += 1;
    issues.push(`${context}: passed selected target has 0 supported + candidate + weak rows`);
  }
  if (Number(row.reader_facing_eligible_rows || 0) !== eligible) {
    issues.push(`${context}: reader_facing_eligible_rows expected ${eligible}, found ${row.reader_facing_eligible_rows}`);
  }
  const statusTotal = [...allowedStatuses].reduce((sum, status) => sum + Number(row.status_counts?.[status] || 0), 0);
  if (Number(row.counts?.candidate_rows || 0) + Number(row.counts?.blocked_rows || 0) !== statusTotal) {
    issues.push(`${context}: status counts do not match candidate_rows + blocked_rows`);
  }
  validateFileIntegrity(row.file_integrity, `${context}.file_integrity`, validationStatus === 'passed');
  for (const [index, licenseRow] of (row.license_counts || []).entries()) {
    validateCountRow(licenseRow, `${context}.license_counts[${index}]`);
    incrementBy(expectedLicenseCounts, licenseRow.value, licenseRow.count);
  }
  for (const [index, workRow] of (row.work_counts || []).entries()) {
    validateCountRow(workRow, `${context}.work_counts[${index}]`);
    incrementBy(expectedWorkCounts, workRow.value, workRow.count);
  }
  for (const [index, clusterRow] of (row.cluster_summaries || []).entries()) {
    validateClusterRow(clusterRow, `${context}.cluster_summaries[${index}]`);
    incrementCluster(expectedClusterCounts, clusterRow);
  }
  validateRouteLinkSummary(row.route_link_summary, `${context}.route_link_summary`, Number(row.counts?.candidate_rows || 0));
  incrementRouteLinkSummary(expectedRouteLinkMetadata, row.route_link_summary);
}

function validateStatusSemantics(semantics) {
  if (!semantics || typeof semantics !== 'object') {
    issues.push('reader_facing_policy.status_semantics must be present');
    return;
  }
  for (const status of allowedStatuses) {
    const text = semantics[status];
    if (typeof text !== 'string' || !text.trim()) {
      issues.push(`reader_facing_policy.status_semantics.${status} must be a non-empty string`);
    }
  }
}

function validateConsumerContract(contract) {
  if (!contract || typeof contract !== 'object') {
    issues.push('consumer_contract must be present');
    return;
  }
  if (contract.artifact_role !== 'usage_evidence_index') issues.push('consumer_contract.artifact_role must be usage_evidence_index');
  if (contract.evidence_model !== 'graph_first_candidate_second') issues.push('consumer_contract.evidence_model must be graph_first_candidate_second');
  if (!sameList(contract.downstream_visible_statuses, ['supported', 'candidate', 'weak'])) {
    issues.push('consumer_contract.downstream_visible_statuses must be supported,candidate,weak');
  }
  if (!sameList(contract.audit_only_statuses, ['ambiguous', 'blocked'])) {
    issues.push('consumer_contract.audit_only_statuses must be ambiguous,blocked');
  }
  if (contract.final_ranking_authority !== false) issues.push('consumer_contract.final_ranking_authority must be false');
  if (contract.visible_answer_authority !== false) issues.push('consumer_contract.visible_answer_authority must be false');
  if (contract.carries_text_rows !== false) issues.push('consumer_contract.carries_text_rows must be false');
}

function validateHandoffPayloadContract(contract) {
  if (!contract || typeof contract !== 'object') {
    issues.push('handoff_payload_contract must be present');
    return;
  }
  if (contract.contract_version !== 1) issues.push('handoff_payload_contract.contract_version must be 1');
  if (!String(contract.payload_root || '').trim()) issues.push('handoff_payload_contract.payload_root must be present');
  if (contract.public_index_carries_payload_rows !== false) {
    issues.push('handoff_payload_contract.public_index_carries_payload_rows must be false');
  }
  if (contract.row_model !== 'observed_usage_first_candidate_second') {
    issues.push('handoff_payload_contract.row_model must be observed_usage_first_candidate_second');
  }
  if (contract.score_authority !== 'raw_score_only_non_final') {
    issues.push('handoff_payload_contract.score_authority must be raw_score_only_non_final');
  }
  if (!sameList(contract.visible_statuses, ['supported', 'candidate', 'weak'])) {
    issues.push('handoff_payload_contract.visible_statuses must be supported,candidate,weak');
  }
  if (!sameList(contract.audit_only_statuses, ['ambiguous', 'blocked'])) {
    issues.push('handoff_payload_contract.audit_only_statuses must be ambiguous,blocked');
  }
  for (const stableId of ['token_key', 'occurrence_id', 'candidate_id', 'cluster_id']) {
    if (!Array.isArray(contract.stable_ids) || !contract.stable_ids.includes(stableId)) {
      issues.push(`handoff_payload_contract.stable_ids missing ${stableId}`);
    }
  }
  const files = Array.isArray(contract.files) ? contract.files : [];
  if (!sameList(files.map((row) => row.key), ['manifest_json', 'occurrences_jsonl', 'candidates_jsonl', 'clusters_json', 'blocked_jsonl'])) {
    issues.push('handoff_payload_contract.files must list manifest_json,occurrences_jsonl,candidates_jsonl,clusters_json,blocked_jsonl in order');
  }
  for (const row of files) validatePayloadFileContract(row);
  const mustNot = Array.isArray(contract.consumer_must_not) ? contract.consumer_must_not.join(' ') : '';
  for (const phrase of ['definition', 'ambiguous', 'raw_score', 'corpus-exhaustive', 'English translations']) {
    if (!mustNot.includes(phrase)) issues.push(`handoff_payload_contract.consumer_must_not missing ${phrase}`);
  }
}

function validatePayloadFileContract(row) {
  if (!row || typeof row !== 'object') {
    issues.push('handoff_payload_contract.files entry must be an object');
    return;
  }
  if (!String(row.key || '').trim()) issues.push('handoff_payload_contract.files entry missing key');
  if (!String(row.role || '').trim()) issues.push(`handoff_payload_contract.files.${row.key || 'unknown'} missing role`);
  if (!['json', 'jsonl'].includes(String(row.format || ''))) {
    issues.push(`handoff_payload_contract.files.${row.key || 'unknown'} format must be json or jsonl`);
  }
  if (!Array.isArray(row.required_fields)) {
    issues.push(`handoff_payload_contract.files.${row.key || 'unknown'} required_fields must be an array`);
  }
  const requiredFields = Array.isArray(row.required_fields) ? row.required_fields : [];
  if (row.key === 'occurrences_jsonl') {
    for (const field of ['occurrence_id', 'token_key', 'phrase_window', 'source_ref', 'work_id', 'license', 'license_url', 'cluster_id']) {
      if (!requiredFields.includes(field)) issues.push(`handoff_payload_contract.files.occurrences_jsonl missing required field ${field}`);
    }
    if (row.may_include_english_translation !== false) issues.push('handoff_payload_contract.files.occurrences_jsonl may_include_english_translation must be false');
    if (row.final_ranking_authority !== false) issues.push('handoff_payload_contract.files.occurrences_jsonl final_ranking_authority must be false');
  }
  if (row.key === 'candidates_jsonl') {
    for (const field of ['candidate_id', 'occurrence_id', 'route_type', 'candidate_status', 'not_a_definition', 'observed_usage_only', 'raw_score']) {
      if (!requiredFields.includes(field)) issues.push(`handoff_payload_contract.files.candidates_jsonl missing required field ${field}`);
    }
    if (row.status_field !== 'candidate_status') issues.push('handoff_payload_contract.files.candidates_jsonl status_field must be candidate_status');
    if (row.score_field !== 'raw_score') issues.push('handoff_payload_contract.files.candidates_jsonl score_field must be raw_score');
    if (row.route_link_field !== 'route_links') issues.push('handoff_payload_contract.files.candidates_jsonl route_link_field must be route_links');
    if (row.may_include_english_translation !== false) issues.push('handoff_payload_contract.files.candidates_jsonl may_include_english_translation must be false');
    if (row.final_ranking_authority !== false) issues.push('handoff_payload_contract.files.candidates_jsonl final_ranking_authority must be false');
  }
  if (row.key === 'clusters_json') {
    if (row.frame_labels_are_definitions !== false) issues.push('handoff_payload_contract.files.clusters_json frame_labels_are_definitions must be false');
    if (row.final_ranking_authority !== false) issues.push('handoff_payload_contract.files.clusters_json final_ranking_authority must be false');
  }
  if (row.key === 'blocked_jsonl' && row.reader_facing_eligible !== false) {
    issues.push('handoff_payload_contract.files.blocked_jsonl reader_facing_eligible must be false');
  }
}

function validateCoverageBoundary(boundary) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push('coverage_boundary must be present');
    return;
  }
  if (boundary.selection_mode !== 'known_useful_or_seeded_smoke_only') {
    issues.push('coverage_boundary.selection_mode must be known_useful_or_seeded_smoke_only');
  }
  if (boundary.corpus_exhaustive !== false) issues.push('coverage_boundary.corpus_exhaustive must be false');
  const freshness = boundary.source_freshness;
  if (!freshness || typeof freshness !== 'object') {
    issues.push('coverage_boundary.source_freshness must be present');
    return;
  }
  if (!['current', 'stale', 'unavailable', 'unknown'].includes(String(freshness.status || ''))) {
    issues.push(`coverage_boundary.source_freshness.status invalid: ${freshness.status}`);
  }
  if (freshness.status !== 'unavailable') {
    for (const key of ['artifact_source_files_scanned', 'current_source_files', 'count_delta_vs_artifact_scan', 'files_modified_after_artifact', 'files_created_after_artifact']) {
      const value = Number(freshness[key]);
      if (!Number.isInteger(value) || value < 0) issues.push(`coverage_boundary.source_freshness.${key} must be a non-negative integer`);
    }
  }
}

function validateQualityGates(gates) {
  if (!gates || typeof gates !== 'object') {
    issues.push('quality_gates must be present');
    return;
  }
  const expectedValidationPassed = expected.validation_failed === 0;
  const expectedZeroUsefulTargetsBlocked = expected.zero_useful_targets === 0;
  const expectedAmbiguousRowsAuditOnly = true;
  const expectedDownstreamConsumable = expectedValidationPassed
    && expectedZeroUsefulTargetsBlocked
    && expectedAmbiguousRowsAuditOnly;
  const expectedWarnings = [];
  const freshnessStatus = artifact.coverage_boundary?.source_freshness?.status || 'unavailable';
  if (freshnessStatus === 'stale') expectedWarnings.push('source_freshness_stale');
  else if (freshnessStatus === 'unavailable') expectedWarnings.push('source_freshness_unavailable');
  if (expected.count_only_ambiguous_rows > 0) expectedWarnings.push('ambiguous_rows_count_only');
  const expectedOverallStatus = expectedDownstreamConsumable && expectedWarnings.length
    ? 'pass_with_warnings'
    : expectedDownstreamConsumable ? 'pass' : 'fail';

  if (gates.overall_status !== expectedOverallStatus) {
    issues.push(`quality_gates.overall_status expected ${expectedOverallStatus}, found ${gates.overall_status}`);
  }
  if (gates.downstream_consumable !== expectedDownstreamConsumable) {
    issues.push(`quality_gates.downstream_consumable expected ${expectedDownstreamConsumable}`);
  }
  if (gates.validation_passed !== expectedValidationPassed) {
    issues.push(`quality_gates.validation_passed expected ${expectedValidationPassed}`);
  }
  if (gates.zero_useful_targets_blocked !== expectedZeroUsefulTargetsBlocked) {
    issues.push(`quality_gates.zero_useful_targets_blocked expected ${expectedZeroUsefulTargetsBlocked}`);
  }
  if (gates.ambiguous_rows_audit_only !== expectedAmbiguousRowsAuditOnly) {
    issues.push('quality_gates.ambiguous_rows_audit_only must be true');
  }
  if (gates.source_freshness_status !== freshnessStatus) {
    issues.push(`quality_gates.source_freshness_status expected ${freshnessStatus}, found ${gates.source_freshness_status}`);
  }
  if (!sameList(gates.warnings || [], expectedWarnings)) {
    issues.push(`quality_gates.warnings expected ${expectedWarnings.join(',')}, found ${(gates.warnings || []).join(',')}`);
  }
}

function validateAggregateSourceMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    issues.push('aggregate_source_metadata must be present');
    return;
  }
  validateCountList(
    metadata.license_counts,
    topCounts(expectedLicenseCounts, 20),
    'aggregate_source_metadata.license_counts',
  );
  validateCountList(
    metadata.top_work_counts,
    topCounts(expectedWorkCounts, 40),
    'aggregate_source_metadata.top_work_counts',
  );
}

function validateAggregateClusterMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    issues.push('aggregate_cluster_metadata must be present');
    return;
  }
  const expectedRows = [...expectedClusterCounts.values()]
    .sort((a, b) => (
      b.reader_facing_eligible_rows - a.reader_facing_eligible_rows
      || b.occurrence_count - a.occurrence_count
      || a.cluster_id.localeCompare(b.cluster_id)
    ));
  const actualRows = metadata.cluster_counts;
  if (!Array.isArray(actualRows)) {
    issues.push('aggregate_cluster_metadata.cluster_counts must be an array');
    return;
  }
  if (actualRows.length !== expectedRows.length) {
    issues.push(`aggregate_cluster_metadata.cluster_counts expected ${expectedRows.length} rows, found ${actualRows.length}`);
    return;
  }
  for (const [index, expectedRow] of expectedRows.entries()) {
    const actualRow = actualRows[index] || {};
    for (const key of ['cluster_id', 'frame_label']) {
      if (actualRow[key] !== expectedRow[key]) {
        issues.push(`aggregate_cluster_metadata.cluster_counts[${index}].${key} expected ${expectedRow[key]}, found ${actualRow[key]}`);
      }
    }
    for (const key of ['manifest_count', 'occurrence_count', 'supported', 'candidate', 'weak', 'ambiguous', 'reader_facing_eligible_rows']) {
      if (Number(actualRow[key] || 0) !== expectedRow[key]) {
        issues.push(`aggregate_cluster_metadata.cluster_counts[${index}].${key} expected ${expectedRow[key]}, found ${actualRow[key]}`);
      }
    }
    if (actualRow.ambiguous_rows_reader_facing !== false) {
      issues.push(`aggregate_cluster_metadata.cluster_counts[${index}].ambiguous_rows_reader_facing must be false`);
    }
  }
}

function validateAggregateRouteLinkMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    issues.push('aggregate_route_link_metadata must be present');
    return;
  }
  const expectedSummary = summarizeRouteLinks(expectedRouteLinkMetadata);
  for (const key of ['linked_candidate_rows', 'unlinked_candidate_rows', 'total_route_links']) {
    if (Number(metadata[key] || 0) !== expectedSummary[key]) {
      issues.push(`aggregate_route_link_metadata.${key} expected ${expectedSummary[key]}, found ${metadata[key]}`);
    }
  }
  validateCountList(metadata.route_family_counts, expectedSummary.route_family_counts, 'aggregate_route_link_metadata.route_family_counts');
  validateCountList(metadata.route_type_counts, expectedSummary.route_type_counts, 'aggregate_route_link_metadata.route_type_counts');
  validateCountList(metadata.route_source_counts, expectedSummary.route_source_counts, 'aggregate_route_link_metadata.route_source_counts');
}

function validateFileIntegrity(fileIntegrity, context, requirePresent) {
  if (!fileIntegrity || typeof fileIntegrity !== 'object') {
    issues.push(`${context} must be present`);
    return;
  }
  for (const label of ['manifest_json', 'occurrences_jsonl', 'candidates_jsonl', 'clusters_json', 'blocked_jsonl']) {
    const row = fileIntegrity[label];
    if (!row || typeof row !== 'object') {
      issues.push(`${context}.${label} must be present`);
      continue;
    }
    if (requirePresent && row.exists !== true) issues.push(`${context}.${label}.exists must be true for passed manifests`);
    if (row.exists === true) {
      if (!String(row.path || '').trim()) issues.push(`${context}.${label}.path must be non-empty`);
      const bytes = Number(row.bytes || 0);
      if (!Number.isInteger(bytes) || bytes < 0) issues.push(`${context}.${label}.bytes must be a non-negative integer`);
      if (!/^[a-f0-9]{64}$/.test(String(row.sha256 || ''))) issues.push(`${context}.${label}.sha256 must be a lowercase sha256 hex digest`);
      addIntegrity(label, true, bytes);
    } else {
      if (Number(row.bytes || 0) !== 0) issues.push(`${context}.${label}.bytes must be 0 when missing`);
      if (row.sha256 !== null) issues.push(`${context}.${label}.sha256 must be null when missing`);
      addIntegrity(label, false, 0);
    }
  }
}

function validateIntegritySummary(summary) {
  if (!summary || typeof summary !== 'object') {
    issues.push('integrity_summary must be present');
    return;
  }
  for (const key of ['files', 'existing_files', 'missing_files', 'bytes']) {
    if (Number(summary[key] || 0) !== expectedIntegritySummary[key]) {
      issues.push(`integrity_summary.${key} expected ${expectedIntegritySummary[key]}, found ${summary[key]}`);
    }
  }
  const expectedByKind = [...expectedIntegritySummary.by_kind.values()].sort((a, b) => a.kind.localeCompare(b.kind));
  const actualByKind = summary.by_kind;
  if (!Array.isArray(actualByKind)) {
    issues.push('integrity_summary.by_kind must be an array');
    return;
  }
  if (actualByKind.length !== expectedByKind.length) {
    issues.push(`integrity_summary.by_kind expected ${expectedByKind.length} rows, found ${actualByKind.length}`);
    return;
  }
  for (const [index, expectedRow] of expectedByKind.entries()) {
    const actualRow = actualByKind[index] || {};
    for (const key of ['kind', 'files', 'existing_files', 'missing_files', 'bytes']) {
      if (actualRow[key] !== expectedRow[key]) {
        issues.push(`integrity_summary.by_kind[${index}].${key} expected ${expectedRow[key]}, found ${actualRow[key]}`);
      }
    }
  }
}

function walkNoRowPayloads(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkNoRowPayloads(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden row/verdict field ${key}`);
    walkNoRowPayloads(item, context, [...pathParts, key]);
  }
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing public handoff index: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function sameList(value, expected) {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((item, index) => item === expected[index]);
}

function validateCountRow(row, context) {
  if (!row || typeof row !== 'object') {
    issues.push(`${context}: must be an object`);
    return;
  }
  if (!String(row.value || '').trim()) issues.push(`${context}.value must be non-empty`);
  const count = Number(row.count);
  if (!Number.isInteger(count) || count < 0) issues.push(`${context}.count must be a non-negative integer`);
}

function validateCountList(actual, expectedRows, context) {
  if (!Array.isArray(actual)) {
    issues.push(`${context} must be an array`);
    return;
  }
  if (actual.length !== expectedRows.length) {
    issues.push(`${context} expected ${expectedRows.length} rows, found ${actual.length}`);
    return;
  }
  for (const [index, expectedRow] of expectedRows.entries()) {
    const actualRow = actual[index] || {};
    if (actualRow.value !== expectedRow.value || Number(actualRow.count || 0) !== expectedRow.count) {
      issues.push(`${context}[${index}] expected ${expectedRow.value}:${expectedRow.count}, found ${actualRow.value}:${actualRow.count}`);
    }
  }
}

function topCounts(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function incrementBy(map, key, count) {
  const safeKey = String(key || '').trim();
  const safeCount = Number(count || 0);
  if (!safeKey || !Number.isFinite(safeCount) || safeCount <= 0) return;
  map.set(safeKey, (map.get(safeKey) || 0) + safeCount);
}

function validateClusterRow(row, context) {
  if (!row || typeof row !== 'object') {
    issues.push(`${context}: must be an object`);
    return;
  }
  if (!String(row.cluster_id || '').trim()) issues.push(`${context}.cluster_id must be non-empty`);
  for (const key of ['occurrence_count', 'supported', 'candidate', 'weak', 'ambiguous', 'reader_facing_eligible_rows']) {
    const value = Number(row[key]);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.${key} must be a non-negative integer`);
  }
  if (row.ambiguous_rows_reader_facing !== false) issues.push(`${context}.ambiguous_rows_reader_facing must be false`);
}

function validateRouteLinkSummary(row, context, candidateRows) {
  if (!row || typeof row !== 'object') {
    issues.push(`${context}: must be present`);
    return;
  }
  for (const key of ['linked_candidate_rows', 'unlinked_candidate_rows', 'total_route_links']) {
    const value = Number(row[key]);
    if (!Number.isInteger(value) || value < 0) issues.push(`${context}.${key} must be a non-negative integer`);
  }
  const linked = Number(row.linked_candidate_rows || 0);
  const unlinked = Number(row.unlinked_candidate_rows || 0);
  const totalLinks = Number(row.total_route_links || 0);
  if (linked + unlinked !== candidateRows) {
    issues.push(`${context}: linked + unlinked rows must equal candidate_rows (${candidateRows})`);
  }
  if (totalLinks < linked) issues.push(`${context}.total_route_links must be at least linked_candidate_rows`);
  for (const [index, countRow] of (row.route_family_counts || []).entries()) {
    validateCountRow(countRow, `${context}.route_family_counts[${index}]`);
  }
  for (const [index, countRow] of (row.route_type_counts || []).entries()) {
    validateCountRow(countRow, `${context}.route_type_counts[${index}]`);
  }
  for (const [index, countRow] of (row.route_source_counts || []).entries()) {
    validateCountRow(countRow, `${context}.route_source_counts[${index}]`);
  }
}

function incrementCluster(map, row) {
  const clusterId = String(row.cluster_id || 'unclustered');
  const existing = map.get(clusterId) || {
    cluster_id: clusterId,
    frame_label: '',
    manifest_count: 0,
    occurrence_count: 0,
    supported: 0,
    candidate: 0,
    weak: 0,
    ambiguous: 0,
    reader_facing_eligible_rows: 0,
    ambiguous_rows_reader_facing: false,
  };
  if (!existing.frame_label && row.frame_label) existing.frame_label = row.frame_label;
  existing.manifest_count += 1;
  for (const key of ['occurrence_count', 'supported', 'candidate', 'weak', 'ambiguous', 'reader_facing_eligible_rows']) {
    existing[key] += Number(row[key] || 0);
  }
  map.set(clusterId, existing);
}

function makeRouteLinkAccumulator() {
  return {
    linkedRows: 0,
    unlinkedRows: 0,
    totalLinks: 0,
    routeFamilies: new Map(),
    routeTypes: new Map(),
    routeSources: new Map(),
  };
}

function incrementRouteLinkSummary(accumulator, summary) {
  if (!summary || typeof summary !== 'object') return;
  accumulator.linkedRows += Number(summary.linked_candidate_rows || 0);
  accumulator.unlinkedRows += Number(summary.unlinked_candidate_rows || 0);
  accumulator.totalLinks += Number(summary.total_route_links || 0);
  for (const row of summary.route_family_counts || []) incrementBy(accumulator.routeFamilies, row.value, row.count);
  for (const row of summary.route_type_counts || []) incrementBy(accumulator.routeTypes, row.value, row.count);
  for (const row of summary.route_source_counts || []) incrementBy(accumulator.routeSources, row.value, row.count);
}

function summarizeRouteLinks(accumulator) {
  return {
    linked_candidate_rows: Number(accumulator.linkedRows || 0),
    unlinked_candidate_rows: Number(accumulator.unlinkedRows || 0),
    total_route_links: Number(accumulator.totalLinks || 0),
    route_family_counts: topCounts(accumulator.routeFamilies || new Map(), 20),
    route_type_counts: topCounts(accumulator.routeTypes || new Map(), 20),
    route_source_counts: topCounts(accumulator.routeSources || new Map(), 20),
  };
}

function addIntegrity(kind, exists, bytes) {
  const summary = expectedIntegritySummary.by_kind.get(kind) || {
    kind,
    files: 0,
    existing_files: 0,
    missing_files: 0,
    bytes: 0,
  };
  summary.files += 1;
  expectedIntegritySummary.files += 1;
  if (exists) {
    summary.existing_files += 1;
    summary.bytes += bytes;
    expectedIntegritySummary.existing_files += 1;
    expectedIntegritySummary.bytes += bytes;
  } else {
    summary.missing_files += 1;
    expectedIntegritySummary.missing_files += 1;
  }
  expectedIntegritySummary.by_kind.set(kind, summary);
}
