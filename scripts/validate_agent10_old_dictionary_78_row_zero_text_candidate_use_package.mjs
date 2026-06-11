import fs from 'node:fs';

const path = process.argv[2] || 'reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json';
const artifact = JSON.parse(fs.readFileSync(path, 'utf8'));

function fail(message) {
  throw new Error(message);
}

if (artifact.artifact_type !== 'agent10_old_dictionary_78_row_zero_text_candidate_use_package_planning') {
  fail(`unexpected artifact_type: ${artifact.artifact_type}`);
}

if (artifact.status !== 'agent6_warn_accepted_zero_text_candidate_use_package_planning_materialized') {
  fail(`unexpected status: ${artifact.status}`);
}

if (artifact.source_license_lane !== 'commercial_clean_candidate') {
  fail(`unexpected source_license_lane: ${artifact.source_license_lane}`);
}

const rows = artifact.package_rows || [];
const occurrences = rows.reduce((sum, row) => sum + (Number(row.occurrences) || 0), 0);

if (rows.length !== 78) fail(`expected 78 rows, found ${rows.length}`);
if (occurrences !== 1461) fail(`expected 1461 occurrences, found ${occurrences}`);
if (artifact.counts?.rows !== 78) fail(`counts.rows mismatch: ${artifact.counts?.rows}`);
if (artifact.counts?.occurrences !== 1461) fail(`counts.occurrences mismatch: ${artifact.counts?.occurrences}`);

const zeroFields = [
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'route_writes',
  'accepted_text_rows',
  'export_rows',
  'release_actions',
];

for (const field of [...zeroFields, 'public_runtime_mutation']) {
  if (artifact.counts?.[field] !== 0) fail(`counts.${field} must be 0`);
}

const queueIds = new Set();
const tokenIds = new Set();
for (const [index, row] of rows.entries()) {
  for (const field of [
    'queue_id',
    'token_id',
    'lexicon_entry_id',
    'occurrences',
    'source_license_lane',
    'relation_class',
    'morphology_relation_status',
    'candidate_use_package_status',
  ]) {
    if (!(field in row)) fail(`row ${index} missing ${field}`);
  }
  if (row.source_license_lane !== 'commercial_clean_candidate') fail(`row ${index} wrong source lane`);
  if (row.relation_class !== 'exact_after_mark_strip') fail(`row ${index} wrong relation class`);
  if (row.morphology_relation_status !== 'agent2_morphology_relation_approved_for_nonpublic_planning') {
    fail(`row ${index} wrong morphology relation status`);
  }
  if (row.candidate_use_package_status !== 'nonpublic_zero_text_candidate_use_package_planning_only') {
    fail(`row ${index} wrong package status`);
  }
  for (const field of zeroFields) {
    if (row[field] !== 0) fail(`row ${index} ${field} must be 0`);
  }
  if (row.agent6_boundary_required_before_next_use !== true) {
    fail(`row ${index} must preserve next Agent 6 boundary requirement`);
  }
  queueIds.add(row.queue_id);
  tokenIds.add(row.token_id);
}

if (queueIds.size !== 78) fail(`expected 78 unique queue IDs, found ${queueIds.size}`);
if (tokenIds.size !== 78) fail(`expected 78 unique token IDs, found ${tokenIds.size}`);

console.log(`Agent10 zero-text candidate-use package validation passed. Rows: ${rows.length}; occurrences: ${occurrences}.`);
