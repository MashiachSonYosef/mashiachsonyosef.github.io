#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] ||
  'reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.json';

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

const artifact = readJson(artifactPath);

expect(
  artifact.artifact_type ===
    'agent10_old_dictionary_commercial_clean_source_family_morphology_coverage_summary',
  'artifact_type mismatch',
);
expect(artifact.owner === 'Agent 10', 'owner must be Agent 10');
expect(
  artifact.status === 'current_prior_agent6_planning_coverage_summary_no_transform_or_use_route',
  'status mismatch',
);

const morphology = artifact.prior_agent6_coverage?.morphology_planning || {};
expect(
  morphology.disposition === 'warn_accepted_nonpublic_morphology_planning_evidence_only',
  'morphology disposition mismatch',
);
expect(morphology.rows === 78, 'morphology rows must be 78');
expect(morphology.occurrences === 1461, 'morphology occurrences must be 1461');
expect(morphology.blocked_rows_preserved_outside_subset === 219, 'blocked rows must be 219');

const sourceFamily = artifact.prior_agent6_coverage?.source_family_overlap || {};
expect(
  sourceFamily.disposition === 'warn_accepted_nonpublic_source_family_overlap_planning_evidence_only',
  'source-family disposition mismatch',
);
expect(sourceFamily.total_exact_combination_rows === 500, 'source-family rows must be 500');
expect(sourceFamily.total_exact_combination_occurrences === 8427, 'source-family occurrences must be 8427');
expect(sourceFamily.exact_blockers === 23, 'source-family blockers must be 23');

const subset = artifact.prior_agent6_coverage?.exact_row_subset_manifest || {};
expect(
  subset.disposition === 'warn_accepted_nonpublic_source_lane_row_subset_planning_evidence_only',
  'subset disposition mismatch',
);
expect(subset.rows === 500, 'subset rows must be 500');
expect(subset.occurrences === 8427, 'subset occurrences must be 8427');
expect(subset.unique_token_ids === 500, 'unique token ids must be 500');
expect(subset.unique_queue_ids === 500, 'unique queue ids must be 500');
expect(subset.duplicate_token_ids === 0, 'duplicate token ids must be 0');
expect(subset.duplicate_queue_ids === 0, 'duplicate queue ids must be 0');
expect(subset.nonzero_zero_counters === 0, 'nonzero zero counters must be 0');

const commercialRows = artifact.commercial_clean_source_family_subsets || [];
expect(Array.isArray(commercialRows) && commercialRows.length === 3, 'expected three commercial-clean source-family rows');
const byFamily = new Map(commercialRows.map((row) => [row.source_family, row]));
expect(byFamily.get('Jastrow Dictionary')?.rows === 210, 'Jastrow rows must be 210');
expect(byFamily.get('BDB Dictionary')?.rows === 221, 'BDB Dictionary rows must be 221');
expect(byFamily.get('BDB Aramaic Dictionary')?.rows === 69, 'BDB Aramaic rows must be 69');
for (const row of commercialRows) {
  expect(row.license_lane === 'commercial_clean_candidate', `${row.source_family} lane mismatch`);
  expect(row.agent2_transform_allowed_now === false, `${row.source_family} must not be transform-authorized now`);
  expect(row.answer_eligible === false, `${row.source_family} must not be answer eligible`);
  expect(row.public_emit === false, `${row.source_family} must not be public emit`);
}

expect(
  artifact.release_package_decision?.agent6_packet_ready_now === false,
  'Agent 6 packet must not be ready now',
);
expect(
  artifact.exact_blockers?.includes('candidate_use_or_transform_intent_not_supplied_for_specific_subset'),
  'missing specific-subset intent blocker',
);

const zero = artifact.global_zero_counters || {};
for (const [key, value] of Object.entries(zero)) {
  expect(value === 0, `zero counter ${key} must be 0`);
}

console.log(
  `Agent10 old-dictionary coverage summary validation passed. Commercial-clean families: ${commercialRows.length}; morphology rows: ${morphology.rows}; subset rows: ${subset.rows}.`,
);
