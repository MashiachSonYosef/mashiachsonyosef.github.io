#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const options = parseArgs(process.argv.slice(2));
const concordancePath = options.concordance;
const artifact = readJson(concordancePath);
const manifest = options.manifest ? readJson(options.manifest) : null;
const issues = [];
const eligibleStatuses = new Set(['supported', 'candidate', 'weak']);
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
]);
const allowedLicenses = new Set(['Public Domain', 'CC0', 'CC-BY', 'CC-BY-SA']);
const expectedStatusCounts = { supported: 0, candidate: 0, weak: 0 };
const expectedRouteLinkStateCounts = {
  route_linked_observed_usage: 0,
  observed_usage_only: 0,
};

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_usage_navigation_concordance') {
  issues.push('artifact_type must be workbench_usage_navigation_concordance');
}
if (artifact.reader_facing_policy?.ambiguous_rows_reader_facing !== false) {
  issues.push('reader_facing_policy.ambiguous_rows_reader_facing must be false');
}
if (!sameList(artifact.reader_facing_policy?.emitted_statuses, ['supported', 'candidate', 'weak'])) {
  issues.push('reader_facing_policy.emitted_statuses must be supported,candidate,weak');
}
if (!sameList(artifact.reader_facing_policy?.audit_only_statuses, ['ambiguous', 'blocked'])) {
  issues.push('reader_facing_policy.audit_only_statuses must be ambiguous,blocked');
}

for (const [index, row] of (artifact.rows || []).entries()) {
  validateRow(row, `rows[${index}]`);
}
validateCounts();
if (manifest) validateManifest(manifest);
walkNoForbiddenFields(artifact, concordancePath);

if (issues.length) {
  console.error(`Workbench usage concordance validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage concordance validation passed. Rows: ${artifact.rows.length}. Supported: ${expectedStatusCounts.supported}. Candidate: ${expectedStatusCounts.candidate}. Weak: ${expectedStatusCounts.weak}. Audit-only ambiguous: ${artifact.counts?.audit_only_counts?.ambiguous ?? 0}.`);

function validateManifest(manifest) {
  if (manifest.schema_version !== 1) issues.push('manifest.schema_version must be 1');
  if (manifest.artifact_type !== 'workbench_usage_navigation_concordance_manifest') {
    issues.push('manifest.artifact_type must be workbench_usage_navigation_concordance_manifest');
  }
  if (manifest.outputs?.concordance_json?.tracked_in_git !== false) {
    issues.push('manifest.outputs.concordance_json.tracked_in_git must be false');
  }
  if (manifest.outputs?.concordance_report?.tracked_in_git !== true) {
    issues.push('manifest.outputs.concordance_report.tracked_in_git must be true');
  }
  if (manifest.outputs?.manifest?.tracked_in_git !== true) {
    issues.push('manifest.outputs.manifest.tracked_in_git must be true');
  }
  if (manifest.authority_policy?.usage_navigation_only !== true) issues.push('manifest.authority_policy.usage_navigation_only must be true');
  if (manifest.authority_policy?.ranks_routes !== false) issues.push('manifest.authority_policy.ranks_routes must be false');
  if (manifest.authority_policy?.selects_visible_result !== false) issues.push('manifest.authority_policy.selects_visible_result must be false');
  if (manifest.authority_policy?.ambiguous_rows_reader_facing !== false) {
    issues.push('manifest.authority_policy.ambiguous_rows_reader_facing must be false');
  }
  if (!sameList(manifest.emitted_row_statuses, ['supported', 'candidate', 'weak'])) {
    issues.push('manifest.emitted_row_statuses must be supported,candidate,weak');
  }
  if (!sameList(manifest.audit_only_statuses, ['ambiguous', 'blocked'])) {
    issues.push('manifest.audit_only_statuses must be ambiguous,blocked');
  }
  if (JSON.stringify(manifest.counts || {}) !== JSON.stringify(artifact.counts || {})) {
    issues.push('manifest.counts must match concordance counts');
  }
  const expectedCommands = {
    regenerate: 'build_workbench_usage_concordance.mjs',
    validate: 'validate_workbench_usage_concordance.mjs',
    validate_concordance: 'validate_workbench_usage_concordance.mjs',
    check_occurrence_links: 'check_workbench_usage_concordance_links.mjs',
    check_route_links: 'check_workbench_usage_route_links.mjs',
    build_audit_review: 'build_workbench_usage_audit_review.mjs',
    validate_smoke_pipeline: 'validate_workbench_smoke_pipeline.mjs',
  };
  for (const [field, expectedScript] of Object.entries(expectedCommands)) {
    if (!String(manifest.commands?.[field] || '').includes(expectedScript)) {
      issues.push(`manifest.commands.${field} must reference ${expectedScript}`);
    }
  }
  const requiredSections = manifest.row_contract?.required_sections || [];
  for (const field of ['ids', 'token', 'usage_frame', 'status', 'occurrence_links', 'phrase', 'source', 'agent2_route_ids', 'route_links']) {
    if (!requiredSections.includes(field)) issues.push(`manifest.row_contract.required_sections missing ${field}`);
  }
  const forbiddenRows = manifest.row_contract?.forbidden_row_fields || [];
  for (const field of forbiddenFieldNames) {
    if (!forbiddenRows.includes(field)) issues.push(`manifest.row_contract.forbidden_row_fields missing ${field}`);
  }
}

function validateRow(row, context) {
  for (const field of ['row_role', 'observed_usage_only', 'navigation_label', 'route_link_state', 'authority', 'ids', 'token', 'usage_frame', 'status', 'occurrence_links', 'phrase', 'source', 'agent2_route_ids', 'route_links']) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') issues.push(`${context}: missing ${field}`);
  }
  if (row.row_role !== 'usage_navigation') issues.push(`${context}.row_role must be usage_navigation`);
  if (row.observed_usage_only !== true) issues.push(`${context}.observed_usage_only must be true`);
  if (row.authority?.usage_navigation_only !== true) issues.push(`${context}.authority.usage_navigation_only must be true`);
  if (row.authority?.ranks_routes !== false) issues.push(`${context}.authority.ranks_routes must be false`);
  if (row.authority?.selects_visible_result !== false) issues.push(`${context}.authority.selects_visible_result must be false`);

  for (const field of ['token_key', 'occurrence_id', 'candidate_id', 'cluster_id']) {
    if (!String(row.ids?.[field] || '').trim()) issues.push(`${context}.ids.${field} must be present`);
  }
  if (!String(row.token?.focus_normalized || row.token?.token_normalized || '').trim()) {
    issues.push(`${context}.token normalized field must be present`);
  }
  const status = row.status?.candidate_status;
  if (!eligibleStatuses.has(status)) issues.push(`${context}.status.candidate_status must be supported/candidate/weak`);
  else expectedStatusCounts[status] += 1;
  const rawScore = Number(row.status?.raw_score);
  if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 100) issues.push(`${context}.status.raw_score must be 0-100`);

  const routeIds = Array.isArray(row.agent2_route_ids) ? row.agent2_route_ids : [];
  const routeLinks = Array.isArray(row.route_links) ? row.route_links : [];
  if (routeIds.length !== routeLinks.length) issues.push(`${context}: agent2_route_ids length must match route_links length`);
  const expectedState = routeIds.length ? 'route_linked_observed_usage' : 'observed_usage_only';
  if (row.route_link_state !== expectedState) issues.push(`${context}.route_link_state expected ${expectedState}`);
  if (row.navigation_label !== (routeIds.length ? 'route-linked observed usage' : 'observed usage only')) {
    issues.push(`${context}.navigation_label does not match route link state`);
  }
  expectedRouteLinkStateCounts[expectedState] += 1;

  if (!String(row.occurrence_links?.source_ref?.label || '').trim()) issues.push(`${context}.occurrence_links.source_ref.label must be present`);
  if (!/^https?:\/\//.test(String(row.occurrence_links?.source_ref?.href || ''))) {
    issues.push(`${context}.occurrence_links.source_ref.href must be an http(s) URL`);
  }
  if (!String(row.occurrence_links?.work_anchor?.href || '').includes('#')) {
    issues.push(`${context}.occurrence_links.work_anchor.href must include a local anchor`);
  }

  if (!String(row.phrase?.phrase_hebrew || '').trim()) issues.push(`${context}.phrase.phrase_hebrew must be present`);
  if (/[A-Za-z]{4,}/.test(String(row.phrase?.phrase_hebrew || ''))) {
    issues.push(`${context}.phrase.phrase_hebrew must not contain English words`);
  }
  if (!Array.isArray(row.phrase?.phrase_tokens) || !row.phrase.phrase_tokens.some((token) => token.role === 'focus-token')) {
    issues.push(`${context}.phrase.phrase_tokens must include a focus-token`);
  }

  for (const field of ['source_ref', 'work_id', 'work_title', 'source_url', 'version_title', 'version_source', 'license', 'license_url']) {
    if (!String(row.source?.[field] || '').trim()) issues.push(`${context}.source.${field} must be present`);
  }
  if (!allowedLicenses.has(row.source?.license)) issues.push(`${context}.source.license is not allowed: ${row.source?.license || 'missing'}`);
}

function validateCounts() {
  if (!Array.isArray(artifact.rows)) {
    issues.push('rows must be an array');
    return;
  }
  if (Number(artifact.counts?.rows || 0) !== artifact.rows.length) {
    issues.push(`counts.rows expected ${artifact.rows.length}, found ${artifact.counts?.rows}`);
  }
  for (const status of Object.keys(expectedStatusCounts)) {
    if (Number(artifact.counts?.status_counts?.[status] || 0) !== expectedStatusCounts[status]) {
      issues.push(`counts.status_counts.${status} expected ${expectedStatusCounts[status]}, found ${artifact.counts?.status_counts?.[status]}`);
    }
  }
  for (const state of Object.keys(expectedRouteLinkStateCounts)) {
    if (Number(artifact.counts?.route_link_state_counts?.[state] || 0) !== expectedRouteLinkStateCounts[state]) {
      issues.push(`counts.route_link_state_counts.${state} expected ${expectedRouteLinkStateCounts[state]}, found ${artifact.counts?.route_link_state_counts?.[state]}`);
    }
  }
  if (Number(artifact.counts?.audit_only_counts?.ambiguous || 0) < 0) issues.push('counts.audit_only_counts.ambiguous must be non-negative');
  if (Number(artifact.counts?.audit_only_counts?.blocked || 0) < 0) issues.push('counts.audit_only_counts.blocked must be non-negative');
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

function parseArgs(args) {
  const parsed = {
    concordance: 'data/workbench-evidence/usage-concordance.json',
    manifest: null,
  };
  for (const arg of args) {
    if (arg.startsWith('--manifest=')) parsed.manifest = cleanRelativePath(valueAfterEquals(arg));
    else if (!arg.startsWith('--') && parsed.concordance === 'data/workbench-evidence/usage-concordance.json') {
      parsed.concordance = cleanRelativePath(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function sameList(value, expected) {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((item, index) => item === expected[index]);
}
