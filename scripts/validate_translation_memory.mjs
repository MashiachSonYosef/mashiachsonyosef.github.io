#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = cleanRelativePath(process.argv[2] || 'data/translation-memory/translation-memory-index.json');
const index = readJson(indexPath);
const contract = readJson(index.contract || 'data/translation-memory/translation-decision-contract.json');
const issues = [];

const allowedStatuses = new Set(contract.decision_statuses || []);
const allowedScopes = new Set(contract.scopes || []);
const requiredFields = contract.required_row_fields || [];
const forbiddenFields = new Set(contract.forbidden_row_fields || []);
const statusCounts = Object.fromEntries([...allowedStatuses].map((status) => [status, 0]));
const seenDecisionIds = new Set();
const seenOccurrenceIds = new Set();
let rowCount = 0;

if (index.schema_version !== 1) issues.push('index.schema_version must be 1');
if (index.artifact_type !== 'translation_memory_index') issues.push('index.artifact_type must be translation_memory_index');
if (contract.schema_version !== 1) issues.push('contract.schema_version must be 1');
if (contract.contract_id !== 'translation-decision-contract') issues.push('contract.contract_id must be translation-decision-contract');

for (const [fileIndex, file] of (index.decision_files || []).entries()) {
  const context = `decision_files[${fileIndex}]`;
  if (!file.path) {
    issues.push(`${context}: missing path`);
    continue;
  }
  const fullPath = path.join(root, cleanRelativePath(file.path));
  if (!fs.existsSync(fullPath)) {
    issues.push(`${context}: missing file ${file.path}`);
    continue;
  }
  const rows = readJsonl(fullPath, file.path);
  if (Number.isFinite(file.row_count) && file.row_count !== rows.length) {
    issues.push(`${context}: row_count mismatch, expected ${file.row_count}, got ${rows.length}`);
  }
  for (const [rowIndex, row] of rows.entries()) {
    validateRow(row, `${file.path}:${rowIndex + 1}`);
  }
}

if (index.counts?.decision_rows !== rowCount) {
  issues.push(`index.counts.decision_rows mismatch, expected ${index.counts?.decision_rows}, got ${rowCount}`);
}
for (const status of allowedStatuses) {
  if ((index.counts?.[status] || 0) !== statusCounts[status]) {
    issues.push(`index.counts.${status} mismatch, expected ${index.counts?.[status] || 0}, got ${statusCounts[status]}`);
  }
}

if (issues.length) {
  console.error(`Translation memory validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Translation memory validation passed. Rows: ${rowCount}.`);

function validateRow(row, context) {
  rowCount += 1;
  for (const field of requiredFields) {
    if (row?.[field] === undefined || row?.[field] === null) {
      issues.push(`${context}: missing ${field}`);
    }
  }
  if (row.schema_version !== 1) issues.push(`${context}: schema_version must be 1`);
  if (row.artifact_type !== 'translation_decision') issues.push(`${context}: artifact_type must be translation_decision`);
  if (seenDecisionIds.has(row.decision_id)) issues.push(`${context}: duplicate decision_id ${row.decision_id}`);
  else seenDecisionIds.add(row.decision_id);
  if (seenOccurrenceIds.has(row.surface_occurrence_id)) issues.push(`${context}: duplicate surface_occurrence_id ${row.surface_occurrence_id}`);
  else seenOccurrenceIds.add(row.surface_occurrence_id);
  if (!allowedStatuses.has(row.decision_status)) issues.push(`${context}: invalid decision_status ${row.decision_status}`);
  if (!allowedScopes.has(row.scope)) issues.push(`${context}: invalid scope ${row.scope}`);
  if (row.license_profile?.publication_class === 'blocked_until_license_review') {
    if (row.license_safe !== false) issues.push(`${context}: blocked license rows must set license_safe=false`);
  } else if (row.license_safe !== true) {
    issues.push(`${context}: license_safe must be true for non-blocked rows`);
  }
  validateLicenseProfile(row.license_profile, row, `${context}.license_profile`);
  if (row.not_a_translation_yet !== true && row.decision_status !== 'accepted') {
    issues.push(`${context}: non-accepted rows must keep not_a_translation_yet=true`);
  }
  if (row.decision_status === 'accepted' && !String(row.english_rendering || '').trim()) {
    issues.push(`${context}: accepted rows require english_rendering`);
  }
  if (['ambiguous', 'rejected', 'blocked', 'needs_review'].includes(row.decision_status) && !String(row.ambiguity_notes || row.rejection_reason || '').trim()) {
    issues.push(`${context}: unresolved rows require ambiguity_notes or rejection_reason`);
  }
  if (!Array.isArray(row.source_rows) || !row.source_rows.length) {
    issues.push(`${context}: source_rows must be a non-empty array`);
  } else {
    row.source_rows.forEach((sourceRow, index) => validateSourceRow(sourceRow, `${context}.source_rows[${index}]`));
  }
  validateSourceAnchor(row.source_anchor, row, `${context}.source_anchor`);
  for (const arrayField of ['route_card_ids', 'usage_evidence_ids', 'morphology_ids', 'validated_by']) {
    if (!Array.isArray(row[arrayField])) issues.push(`${context}: ${arrayField} must be an array`);
  }
  walkForbidden(row, context);
  statusCounts[row.decision_status] = (statusCounts[row.decision_status] || 0) + 1;
}

function validateLicenseProfile(profile, row, context) {
  const allowedClasses = new Set([
    'publication_ok',
    'publication_ok_with_attribution',
    'workbench_ok_publication_review',
    'blocked_until_license_review',
  ]);
  if (!profile || typeof profile !== 'object') {
    issues.push(`${context}: must be an object`);
    return;
  }
  if (profile.profile_version !== 1) issues.push(`${context}: profile_version must be 1`);
  if (!allowedClasses.has(profile.publication_class)) issues.push(`${context}: invalid publication_class ${profile.publication_class || 'missing'}`);
  for (const field of ['workbench_display_ok', 'direct_translation_use_ok', 'attribution_required', 'share_alike_required', 'copyleft_review_required']) {
    if (typeof profile[field] !== 'boolean') issues.push(`${context}: ${field} must be boolean`);
  }
  if (!Array.isArray(profile.source_families) || !profile.source_families.length) issues.push(`${context}: source_families must be a non-empty array`);
  if (!Array.isArray(profile.licenses) || !profile.licenses.length) issues.push(`${context}: licenses must be a non-empty array`);
  if (profile.publication_class === 'blocked_until_license_review' && profile.workbench_display_ok === true) {
    issues.push(`${context}: blocked_until_license_review rows must not be workbench_display_ok`);
  }
  if (profile.publication_class === 'workbench_ok_publication_review' && profile.direct_translation_use_ok === true) {
    issues.push(`${context}: workbench_ok_publication_review must not be direct_translation_use_ok`);
  }
  if (row.decision_status === 'accepted' && profile.direct_translation_use_ok !== true) {
    issues.push(`${context}: accepted rows require direct_translation_use_ok`);
  }
}

function validateSourceAnchor(anchor, row, context) {
  if (!anchor || typeof anchor !== 'object') {
    issues.push(`${context}: must be an object`);
    return;
  }
  for (const field of ['anchor_model', 'selector_standard', 'source_ref', 'unit_id', 'unit_text_sha1', 'token_position', 'text_quote_selector']) {
    if (anchor[field] === undefined || anchor[field] === null || anchor[field] === '') issues.push(`${context}: missing ${field}`);
  }
  if (anchor.source_ref !== row.source_ref) issues.push(`${context}: source_ref must match row.source_ref`);
  if (anchor.unit_id !== row.unit_id) issues.push(`${context}: unit_id must match row.unit_id`);
  if (!/^[0-9a-f]{40}$/i.test(String(anchor.unit_text_sha1 || ''))) issues.push(`${context}: unit_text_sha1 must be a SHA-1 hex digest`);
  const quote = anchor.text_quote_selector || {};
  if (quote.type !== 'TextQuoteSelector') issues.push(`${context}.text_quote_selector: type must be TextQuoteSelector`);
  if (normalizeHebrewDisplay(quote.exact) !== normalizeHebrewDisplay(row.surface_text)) {
    issues.push(`${context}.text_quote_selector: normalized exact must match row.surface_text`);
  }
  if (typeof quote.prefix !== 'string') issues.push(`${context}.text_quote_selector: prefix must be a string`);
  if (typeof quote.suffix !== 'string') issues.push(`${context}.text_quote_selector: suffix must be a string`);
  if (anchor.text_position_selector !== null && anchor.text_position_selector !== undefined) {
    const position = anchor.text_position_selector;
    if (position.type !== 'TextPositionSelector') issues.push(`${context}.text_position_selector: type must be TextPositionSelector`);
    if (!Number.isInteger(position.start) || position.start < 0) issues.push(`${context}.text_position_selector: start must be a non-negative integer`);
    if (!Number.isInteger(position.end) || position.end <= position.start) issues.push(`${context}.text_position_selector: end must be greater than start`);
  }
}

function normalizeHebrewDisplay(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/g, (_, letter) => `${letter}\u05F3`)
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g, (_, letter) => `${letter}\u05F4`);
}

function validateSourceRow(row, context) {
  for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url', 'fields_used', 'notes']) {
    if (row?.[field] === undefined || row?.[field] === null) issues.push(`${context}: missing ${field}`);
  }
  if (!Array.isArray(row.fields_used)) issues.push(`${context}: fields_used must be an array`);
  if (/\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i.test(String(row.license || ''))) {
    issues.push(`${context}: unsafe or unclear license ${row.license || 'missing'}`);
  }
}

function walkForbidden(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForbidden(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFields.has(key)) issues.push(`${context}.${itemPath}: forbidden field ${key}`);
    walkForbidden(item, context, [...pathParts, key]);
  }
}

function readJson(relativePath) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSON file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function readJsonl(fullPath, label) {
  const text = fs.readFileSync(fullPath, 'utf8');
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        issues.push(`${label}:${index + 1}: invalid JSONL row: ${error.message}`);
        return {};
      }
    });
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}
