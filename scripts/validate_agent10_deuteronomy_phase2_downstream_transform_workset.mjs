#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetPath = process.argv[2] || 'reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json';
const artifact = readJson(targetPath);

assert(artifact.artifact_type === 'agent10_agent2_ready_deuteronomy_phase2_downstream_transform_workset', 'unexpected artifact_type');
assert(artifact.status === 'agent2_ready_nonpublic_workset', 'unexpected status');
assert(artifact.counts.rows === 1334, `expected 1334 rows, got ${artifact.counts.rows}`);
assert(artifact.counts.occurrences === 2964, `expected 2964 occurrences, got ${artifact.counts.occurrences}`);
assert(Array.isArray(artifact.rows), 'rows must be an array');
assert(artifact.rows.length === 1334, `expected rows array length 1334, got ${artifact.rows.length}`);

const occurrenceSum = artifact.rows.reduce((sum, row) => sum + Number(row.occurrence_count || 0), 0);
assert(occurrenceSum === 2964, `expected row occurrence sum 2964, got ${occurrenceSum}`);

const duplicateKeys = new Set();
for (const row of artifact.rows) {
  assert(row.route_bucket === 'agent2_agent6_boundary_candidate', `unexpected route_bucket for ${row.token_index_id}`);
  assert(row.duplicate_key && !duplicateKeys.has(row.duplicate_key), `duplicate or missing duplicate_key for ${row.token_index_id}`);
  duplicateKeys.add(row.duplicate_key);
  for (const field of [
    'source_family',
    'source_name',
    'license_label',
    'license_lane',
    'source_url_or_citation',
  ]) {
    assert(typeof row[field] === 'string' && row[field].length > 0, `missing ${field} for ${row.token_index_id}`);
  }
  assert(row.agent6_boundary_required === true, `agent6_boundary_required must be true for ${row.token_index_id}`);
  assert(row.answer_eligible === false, `answer_eligible must be false for ${row.token_index_id}`);
  assert(row.public_emit === false, `public_emit must be false for ${row.token_index_id}`);
  assert(row.commercial_export_allowed === false, `commercial_export_allowed must remain false before boundary for ${row.token_index_id}`);
  assert(row.corpus_contamination === false, `corpus_contamination must be false for ${row.token_index_id}`);
  if (row.license_lane === 'noncommercial_educational_candidate') {
    assert(row.derived_from_nc === true, `NC row missing derived_from_nc for ${row.token_index_id}`);
    assert(row.attribution_required === true, `NC row missing attribution_required for ${row.token_index_id}`);
    assert(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', `NC row missing owner attestation for ${row.token_index_id}`);
  } else {
    assert(row.license_lane === 'commercial_clean_candidate', `unexpected license_lane ${row.license_lane} for ${row.token_index_id}`);
    assert(row.derived_from_nc === false, `commercial row derived_from_nc must be false for ${row.token_index_id}`);
    assert(row.owner_use_attestation === null, `commercial row owner attestation must be null for ${row.token_index_id}`);
  }
}

for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  assert(value === 0, `zero emission counter ${key} must be 0`);
}

assert(artifact.nc_csv_separation_policy?.missing_source_family_lane_classification_is_blocker === true, 'missing source lane blocker policy flag');
assert(artifact.nc_csv_separation_policy?.old_dictionary_excluded_row_reaudit_workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'missing old dictionary reaudit workset');

console.log(`Agent 10 Deuteronomy downstream transform workset validation passed: rows ${artifact.counts.rows}; occurrences ${artifact.counts.occurrences}`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
