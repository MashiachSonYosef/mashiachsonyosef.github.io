#!/usr/bin/env node
import fs from 'node:fs';

const paths = process.argv.slice(2);
const defaultPaths = [
  'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-validation-result-2026-06-05.json',
  'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json',
  'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-validation-result-2026-06-05.json',
];
const artifactPaths = paths.length ? paths : defaultPaths;

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const artifacts = Object.fromEntries(artifactPaths.map((path) => [path, readJson(path)]));

const commercial = artifacts['reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-validation-result-2026-06-05.json'];
expect(commercial?.ok === true, 'commercial-clean metadata custody validation must be ok');
expect(
  commercial.validated_artifact === 'reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json',
  'commercial-clean validated artifact mismatch'
);
expect(
  commercial.status === 'commercial_clean_only_metadata_custody_recorded_zero_output_no_acceptance',
  'commercial-clean status mismatch'
);
expect(commercial.custody_counts?.commercial_clean_only_rows === 18, 'commercial-clean-only rows must be 18');
expect(commercial.custody_counts?.commercial_clean_only_occurrences === 494, 'commercial-clean-only occurrences must be 494');
expect(commercial.custody_counts?.source_family === 'Jastrow Dictionary', 'commercial-clean source family mismatch');
expect(commercial.custody_counts?.rows_with_refs === 17, 'rows_with_refs must be 17');
expect(commercial.custody_counts?.occurrences_with_refs === 476, 'occurrences_with_refs must be 476');
expect(commercial.custody_counts?.rows_without_refs === 1, 'rows_without_refs must be 1');
expect(commercial.custody_counts?.occurrences_without_refs === 18, 'occurrences_without_refs must be 18');
expect(commercial.exact_blocker_count === 3, 'commercial-clean exact blocker count must be 3');
expect(commercial.no_acceptance_claims === true, 'commercial-clean must preserve no acceptance claims');

for (const [key, value] of Object.entries(commercial.zero_output_counts || {})) {
  expect(value === 0, `commercial-clean zero_output_counts.${key} must be 0`);
}

const alignment = artifacts['reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json'];
expect(alignment?.ok === true, 'downstream alignment validation must be ok');
expect(
  alignment.validated_artifact === 'reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json',
  'alignment validated artifact mismatch'
);
expect(alignment.status === 'agent1_downstream_consumption_aligned_zero_output_no_acceptance', 'alignment status mismatch');
expect(alignment.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent1 thread mismatch');
expect(alignment.source_family_rows === 5, 'alignment source_family_rows must be 5');
expect(alignment.commercial_clean_candidate_source_families === 3, 'alignment commercial source family count must be 3');
expect(alignment.noncommercial_educational_candidate_source_families === 1, 'alignment NC source family count must be 1');
expect(alignment.metadata_or_link_only_source_families === 0, 'alignment metadata source family count must be 0');
expect(alignment.blocked_or_needs_review_source_families === 1, 'alignment blocked/review source family count must be 1');
for (const key of [
  'allowed_transform_rows_now',
  'candidate_text_rows_now',
  'answer_eligible_rows_now',
  'public_emit_rows_now',
  'release_route_opened_now',
]) {
  expect(alignment[key] === 0, `alignment ${key} must be 0`);
}
expect(alignment.exact_blocker_count === 5, 'alignment exact blocker count must be 5');
expect(alignment.no_acceptance_claims === true, 'alignment must preserve no acceptance claims');

const overlap = artifacts['reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-validation-result-2026-06-05.json'];
expect(overlap?.ok === true, 'commercial/NC overlap validation must be ok');
expect(
  overlap.validated_artifact === 'reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json',
  'overlap validated artifact mismatch'
);
expect(
  overlap.status === 'commercial_nc_overlap_exclusion_manifest_recorded_zero_output_no_acceptance',
  'overlap status mismatch'
);
expect(overlap.overlap_counts?.audited_rows === 500, 'overlap audited rows must be 500');
expect(overlap.overlap_counts?.audited_occurrences === 8427, 'overlap audited occurrences must be 8427');
expect(overlap.overlap_counts?.commercial_nc_overlap_rows === 197, 'commercial/NC overlap rows must be 197');
expect(overlap.overlap_counts?.commercial_nc_overlap_occurrences === 4185, 'commercial/NC overlap occurrences must be 4185');
expect(overlap.overlap_counts?.commercial_nc_without_bdb_augmented_strong_rows === 57, 'commercial/NC without BDB Augmented rows must be 57');
expect(overlap.overlap_counts?.commercial_nc_with_bdb_augmented_strong_rows === 140, 'commercial/NC with BDB Augmented rows must be 140');
expect(overlap.overlap_counts?.klein_only_excluded_rows === 17, 'Klein-only excluded rows must be 17');
expect(overlap.overlap_counts?.klein_only_excluded_occurrences === 259, 'Klein-only excluded occurrences must be 259');
expect(overlap.exact_blocker_count === 4, 'overlap exact blocker count must be 4');
expect(overlap.no_acceptance_claims === true, 'overlap must preserve no acceptance claims');

for (const [key, value] of Object.entries(overlap.zero_output_counts || {})) {
  expect(value === 0, `overlap zero_output_counts.${key} must be 0`);
}

console.log(
  `Agent1 old-dictionary validation-result bundle passed. ` +
    `Commercial-only rows: ${commercial.custody_counts.commercial_clean_only_rows}; ` +
    `source families: ${alignment.source_family_rows}; overlap rows: ${overlap.overlap_counts.commercial_nc_overlap_rows}.`
);
