import fs from 'node:fs';

const path = process.argv[2] || 'reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json';
const artifact = JSON.parse(fs.readFileSync(path, 'utf8'));

function fail(message) {
  throw new Error(message);
}

if (artifact.artifact_type !== 'agent10_old_dictionary_78_row_candidate_use_preboundary_matrix') {
  fail(`unexpected artifact_type: ${artifact.artifact_type}`);
}

if (artifact.source_license_lane !== 'commercial_clean_candidate') {
  fail(`unexpected source_license_lane: ${artifact.source_license_lane}`);
}

if (artifact.intended_candidate_use !== 'candidate_use_preboundary_review_only_no_text_emission') {
  fail(`unexpected intended_candidate_use: ${artifact.intended_candidate_use}`);
}

const rows = artifact.rows || [];
const occurrences = rows.reduce((sum, row) => sum + (Number(row.occurrences) || 0), 0);

if (rows.length !== 78) fail(`expected 78 rows, found ${rows.length}`);
if (occurrences !== 1461) fail(`expected 1461 occurrences, found ${occurrences}`);
if (artifact.counts?.rows !== 78) fail(`counts.rows mismatch: ${artifact.counts?.rows}`);
if (artifact.counts?.occurrences !== 1461) fail(`counts.occurrences mismatch: ${artifact.counts?.occurrences}`);

const requiredZeroFields = [
  'candidate_text_rows_now',
  'definition_candidate_rows_now',
  'lemma_candidate_rows_now',
  'reader_hint_candidate_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'route_writes',
  'accepted_text_rows',
];

for (const field of requiredZeroFields) {
  if (artifact.counts?.[field] !== 0) fail(`counts.${field} must be 0`);
}

const queueIds = new Set();
const tokenIds = new Set();

for (const [index, row] of rows.entries()) {
  for (const field of [
    'queue_id',
    'token_id',
    'lexicon_entry_id',
    'surface',
    'normalized',
    'occurrences',
    'source_family_hits',
    'public_domain_headwords',
    'public_domain_rids',
    'license_lane',
    'preview_relation_class',
    'morphology_relation_status',
    'intended_candidate_use',
    'exact_agent6_question',
  ]) {
    if (!(field in row)) fail(`row ${index} missing ${field}`);
  }
  if (row.license_lane !== 'commercial_clean_candidate') fail(`row ${index} has wrong lane`);
  if (row.preview_relation_class !== 'exact_after_mark_strip') fail(`row ${index} has wrong relation class`);
  if (row.morphology_relation_status !== 'agent2_morphology_relation_approved_for_nonpublic_planning') {
    fail(`row ${index} has wrong morphology status`);
  }
  if (row.intended_candidate_use !== artifact.intended_candidate_use) fail(`row ${index} has wrong intended use`);
  if (!Array.isArray(row.source_family_hits) || row.source_family_hits.length === 0) {
    fail(`row ${index} lacks commercial-clean source family hits`);
  }
  for (const field of requiredZeroFields) {
    if (row[field] !== 0) fail(`row ${index} ${field} must be 0`);
  }
  queueIds.add(row.queue_id);
  tokenIds.add(row.token_id);
}

if (queueIds.size !== rows.length) fail(`queue_id duplicate count mismatch: ${queueIds.size}`);
if (tokenIds.size !== rows.length) fail(`token_id duplicate count mismatch: ${tokenIds.size}`);

console.log(`Agent10 78-row candidate-use preboundary matrix validation passed. Rows: ${rows.length}; occurrences: ${occurrences}.`);
