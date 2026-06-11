#!/usr/bin/env node
import fs from 'node:fs';

const consumptionPath =
  process.argv[2] ||
  'reports/agent10-agent6-orot-third-missed-source-family-verdict-consumption-2026-06-05.json';

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

const consumption = readJson(consumptionPath);
expect(
  consumption.artifact_type === 'agent10_agent6_orot_third_missed_source_family_verdict_consumption',
  'unexpected artifact_type'
);
expect(consumption.disposition === 'WARN-ACCEPTED', 'disposition must remain WARN-ACCEPTED');
expect(
  consumption.allowed_use === 'non-public source-family/license-lane planning evidence only',
  'allowed_use must remain non-public planning evidence only'
);
expect(consumption.reviewed_packet, 'reviewed_packet is required');

const reviewed = readJson(consumption.reviewed_packet);
expect(
  reviewed.artifact_type === 'agent10_agent6_ready_orot_third_missed_source_family_boundary_packet',
  'reviewed packet has unexpected artifact_type'
);

const counts = consumption.counts || {};
const reviewedCounts = reviewed.counts || {};
const countPairs = [
  ['reviewed_rows', 'rows'],
  ['reviewed_occurrences', 'occurrences'],
  ['commercial_clean_candidate_planning_rows', 'commercial_clean_candidate_rows'],
  ['commercial_clean_candidate_planning_occurrences', 'commercial_clean_candidate_occurrences'],
  ['blocked_or_needs_review_rows', 'blocked_or_needs_review_rows'],
  ['blocked_or_needs_review_occurrences', 'blocked_or_needs_review_occurrences'],
];
for (const [consumptionKey, reviewedKey] of countPairs) {
  expect(
    counts[consumptionKey] === reviewedCounts[reviewedKey],
    `count mismatch ${consumptionKey}=${counts[consumptionKey]} reviewed ${reviewedKey}=${reviewedCounts[reviewedKey]}`
  );
}

expect(counts.reviewed_rows === 169, 'reviewed_rows must be 169 for this bounded packet');
expect(counts.commercial_clean_candidate_planning_rows === 138, 'commercial planning rows must be 138');
expect(counts.blocked_or_needs_review_rows === 31, 'blocked/review rows must be 31');
expect(counts.missing_lexicon_entry_id_rows === 17, 'missing lexicon-entry rows must be 17');
expect(counts.source_license_boundary_review_needed_rows === 14, 'source/license boundary rows must be 14');

const blockers = consumption.exact_blockers || [];
expect(Array.isArray(blockers) && blockers.length === 2, 'exact_blockers must contain two blocker rows');
for (const blocker of blockers) {
  expect(blocker.blocker, 'each exact_blocker needs blocker');
  expect(Number.isInteger(blocker.rows) && blocker.rows > 0, 'each exact_blocker needs positive rows');
  expect(Number.isInteger(blocker.occurrences) && blocker.occurrences > 0, 'each exact_blocker needs positive occurrences');
  expect(blocker.owner, 'each exact_blocker needs owner');
}

const zero = consumption.zero_mutation_counters || {};
for (const key of [
  'public_runtime_mutation',
  'route_shard_writes',
  'route_jsonl_rows',
  'candidate_text_export_rows',
  'definition_content_rows',
  'nc_definition_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'accepted_text_rows',
  'public_hud_rows',
]) {
  expect(zero[key] === 0, `${key} must be 0`);
}

for (const forbidden of [
  'source/provenance acceptance',
  'license/legal acceptance',
  'Definition authority',
  'answer acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'accepted gloss/text',
  'release action',
]) {
  expect((consumption.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 Orot third-missed source-family verdict consumption validation passed. ` +
    `Reviewed rows: ${counts.reviewed_rows}; commercial planning rows: ${counts.commercial_clean_candidate_planning_rows}; ` +
    `blocked rows: ${counts.blocked_or_needs_review_rows}; public/runtime mutations: ${zero.public_runtime_mutation}.`
);
