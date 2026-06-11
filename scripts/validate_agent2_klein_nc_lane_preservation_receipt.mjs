#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = process.argv[2] || 'reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json';
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.artifact_type === 'agent2_klein_nc_lane_preservation_receipt', 'artifact_type mismatch');
expect(receipt.status === 'klein_nc_lane_preserved_separately_no_commercial_export_zero_output', 'status mismatch');
expect(receipt.scope_boundary?.old_dictionary_klein_subset_rows === 214, 'old-dictionary Klein rows must be 214');
expect(receipt.scope_boundary?.old_dictionary_klein_subset_occurrences === 4444, 'old-dictionary Klein occurrences must be 4444');
expect(receipt.scope_boundary?.prior_nc_klein_package_rows === 17, 'prior NC Klein package rows must be 17');
expect(receipt.scope_boundary?.prior_nc_klein_package_occurrences === 259, 'prior NC Klein package occurrences must be 259');
expect(receipt.scope_boundary?.scopes_are_not_interchangeable === true, 'Klein scopes must not be interchangeable');

expect(receipt.source_family?.source_family === 'Klein Dictionary', 'source family must be Klein Dictionary');
expect(receipt.source_family?.license_label === 'CC-BY-NC', 'license label must be CC-BY-NC');
expect(receipt.source_family?.license_lane === 'noncommercial_educational_candidate', 'license lane must be NC educational');
expect(receipt.source_family?.rows === 214, 'source rows must be 214');
expect(receipt.source_family?.occurrences === 4444, 'source occurrences must be 4444');
expect(receipt.source_family?.derived_from_nc === true, 'derived_from_nc must be true');
expect(receipt.source_family?.commercial_export_allowed === false, 'commercial export must be false');
expect(receipt.source_family?.attribution_required === true, 'attribution required must be true');
expect(receipt.source_family?.corpus_contamination === false, 'corpus contamination must be false');

expect(receipt.nc_source_family_map_evidence?.metadata_only_allowed === true, 'metadata only allowed must be true');
expect(receipt.nc_source_family_map_evidence?.external_link_only_allowed === true, 'external link only allowed must be true');
expect(receipt.nc_source_family_map_evidence?.storage_allowed === false, 'storage allowed must be false');
expect(receipt.nc_source_family_map_evidence?.display_allowed === false, 'display allowed must be false');
expect(receipt.nc_source_family_map_evidence?.transformed_reader_hint_allowed === false, 'reader hint allowed must be false');

for (const [key, value] of Object.entries(receipt.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

for (const blocker of [
  'klein_old_dictionary_nc_scope_214_rows_distinct_from_prior_17_row_nc_map',
  'klein_dictionary_remains_noncommercial_educational_candidate_no_commercial_export_authorization',
  'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization',
]) {
  expect(receipt.exact_blockers?.includes(blocker), `missing blocker: ${blocker}`);
}

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No answer eligibility',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No route-shard edit',
  'No candidate text export',
  'No definition/lemma/reader-hint content storage',
  'No commercial export authorization',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(receipt.non_acceptance_boundary?.includes(boundary), `missing boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 Klein NC lane preservation receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Klein NC lane preservation receipt validation passed. Rows: 214; occurrences: 4444; transform/text/output rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
