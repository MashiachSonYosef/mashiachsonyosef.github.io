#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.json';
const artifact = readJson(artifactPath);

const state = readJson('reports/agent3-state.json');
const index = readJson('data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json');
const occurrence = readJson('data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json');
const provenance = readJson('data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json');
const deuteronomy = readJson('reports/agent3-deuteronomy-phase2-agent6-receipt-continuity-package-2026-06-04.json');
const agent1Orot = readJson('reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json');

const issues = [];
const stateMetrics = { ...(state.counts || {}), ...(state.current_metrics || {}) };

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_linkage_navigation_frontier_checkpoint', 'unexpected artifact_type');
expect(artifact.status === 'evidence_ready_frontier_checkpoint', 'unexpected status');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');

for (const input of artifact.reviewed_inputs || []) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
}

expect(artifact.agent3_usage_state?.status === state.worker_state, 'Agent 3 state mismatch');
expect(artifact.agent3_usage_state?.qa_acceptance_state === 'not_agent6_accepted', 'Agent 3 QA state must remain not accepted');
expect(artifact.agent3_usage_state?.control_queue_mutated === false, 'Agent 3 control queue must not be mutated');
expect(artifact.agent3_usage_state?.submitted_to_agent6 === false, 'Agent 3 usage state must not submit queue');
expectCounts(artifact.agent3_usage_state?.counts, stateMetrics, [
  'usage_concordance_rows',
  'usage_supported_rows',
  'usage_candidate_rows',
  'usage_weak_rows',
  'audit_only_ambiguous_rows',
  'selected_usage_rows',
  'selected_source_refs',
  'selected_works',
  'route_ids',
  'occurrence_link_rows',
  'occurrence_link_rows_with_complete_metadata',
  'occurrence_link_reader_facing_rows',
  'occurrence_link_route_payload_field_hits',
  'occurrence_link_forbidden_authority_field_hits',
  'smoke_steps',
  'smoke_failed_steps',
  'freshness_impact_pending_refresh_files',
]);

expect(artifact.reshit_work_category_index?.status === index.status, 'reshit work/category status mismatch');
expect(artifact.reshit_work_category_index?.counts?.source_occurrence_rows === index.counts?.source_occurrence_rows, 'reshit source occurrence rows mismatch');
expect(artifact.reshit_work_category_index?.counts?.category_index_rows === index.counts?.category_index_rows, 'reshit category rows mismatch');
expect(artifact.reshit_work_category_index?.counts?.work_index_rows === index.counts?.work_index_rows, 'reshit work rows mismatch');
expect(artifact.reshit_work_category_index?.counts?.category_license_index_rows === index.counts?.category_license_index_rows, 'reshit category-license rows mismatch');
expect(artifact.reshit_work_category_index?.counts?.occurrence_queue_links === index.counts?.occurrence_queue_links, 'reshit queue-link rows mismatch');
expect(artifact.reshit_work_category_index?.counts?.complete_metadata_rows === index.counts?.rows_with_complete_metadata, 'reshit complete metadata rows mismatch');
expect(artifact.reshit_work_category_index?.counts?.reader_facing_rows === 0, 'reshit index reader-facing rows must be 0');
expect(artifact.reshit_work_category_index?.counts?.route_payload_field_hits === 0, 'reshit index route payload hits must be 0');
expect(artifact.reshit_work_category_index?.counts?.forbidden_authority_field_hits === 0, 'reshit index forbidden authority hits must be 0');

expectCounts(artifact.reshit_occurrence_locator?.counts, occurrence.counts, [
  'unique_locator_rows',
  'source_grouped_occurrence_rows',
  'duplicate_grouped_occurrence_rows',
  'rows_with_source_url',
  'rows_with_local_work_anchor',
  'rows_with_phrase_context_snippet',
  'rows_with_work_id',
  'rows_with_route_ids',
  'distinct_route_ids',
  'reader_facing_rows',
  'route_payload_field_hits',
  'forbidden_authority_field_hits',
  'source_text_reads',
  'broad_target_expansion',
  'queue_mutations',
  'submitted_to_agent6',
]);
expect(artifact.reshit_occurrence_locator.counts.reader_facing_rows === 0, 'occurrence locator reader-facing rows must be 0');
expect(artifact.reshit_occurrence_locator.counts.route_payload_field_hits === 0, 'occurrence locator route payload hits must be 0');
expect(artifact.reshit_occurrence_locator.counts.forbidden_authority_field_hits === 0, 'occurrence locator forbidden authority hits must be 0');

expectCounts(artifact.reshit_provenance_locator?.counts, provenance.counts, [
  'source_locator_rows',
  'license_index_rows',
  'public_domain_occurrence_rows',
  'cc_by_sa_occurrence_rows',
  'version_source_index_rows',
  'license_version_index_rows',
  'rows_with_license_url',
  'rows_with_version_title',
  'rows_with_version_source',
  'rows_with_source_url',
  'rows_with_local_work_anchor',
  'rows_with_phrase_context_snippet',
  'rows_with_route_ids',
  'distinct_route_ids',
  'reader_facing_rows',
  'route_payload_field_hits',
  'forbidden_authority_field_hits',
  'source_text_reads',
  'broad_target_expansion',
  'queue_mutations',
  'submitted_to_agent6',
]);
expect(artifact.reshit_provenance_locator.counts.reader_facing_rows === 0, 'provenance locator reader-facing rows must be 0');
expect(artifact.reshit_provenance_locator.counts.route_payload_field_hits === 0, 'provenance locator route payload hits must be 0');
expect(artifact.reshit_provenance_locator.counts.forbidden_authority_field_hits === 0, 'provenance locator forbidden authority hits must be 0');

expect(artifact.deuteronomy_continuity_observed?.status === deuteronomy.status, 'Deuteronomy continuity status mismatch');
expect(artifact.deuteronomy_continuity_observed?.exact_blocker_rows_still_blocked === 6779, 'Deuteronomy blocker rows must remain 6779');
expect(artifact.deuteronomy_continuity_observed?.reviewed_planning_rows === 1334, 'Deuteronomy planning rows must remain 1334');

const observed = artifact.external_lane_observed_only?.agent1_orot_missing_linkage_candidates || {};
expect(observed.owner === 'Agent 1', 'Orot linkage packet must remain Agent 1-owned');
expect(observed.committed_by_agent3 === false, 'Agent 3 must not claim it committed Agent 1 packet');
expect(observed.row_payload_copied_here === false, 'Agent 3 checkpoint must not copy Agent 1 rows');
expect(observed.counts?.missing_lexicon_linkage_rows === agent1Orot.counts?.missing_lexicon_linkage_rows, 'Agent 1 missing linkage row count mismatch');
expect(observed.counts?.missing_lexicon_linkage_occurrences === agent1Orot.counts?.missing_lexicon_linkage_occurrences, 'Agent 1 missing linkage occurrence count mismatch');
expect(observed.counts?.mutation_rows_emitted === 0, 'Agent 1 observed mutation rows must be 0');
expect(observed.counts?.source_rows_emitted === 0, 'Agent 1 observed source rows must be 0');
expect(observed.counts?.lexicon_entry_ids_assigned === 0, 'Agent 1 observed assigned lexicon ids must be 0');

expect(!Object.prototype.hasOwnProperty.call(artifact, 'rows'), 'checkpoint must not copy row arrays');
expect(!Object.prototype.hasOwnProperty.call(observed, 'candidates'), 'checkpoint must not copy Agent 1 candidate rows');
const serialized = JSON.stringify(artifact);
for (const forbidden of ['safe_rendering_options', 'accepted_text_value', 'definition_payload', 'upstream_gloss_sample']) {
  expect(!serialized.includes(`"${forbidden}"`), `forbidden payload field copied: ${forbidden}`);
}

for (const claim of [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'semantic arbitration',
  'route ranking',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'accepted gloss/text',
  'lexicon_entry_id mutation',
]) {
  expect((artifact.what_must_not_be_accepted || []).includes(claim), `missing non-acceptance boundary: ${claim}`);
}

if (issues.length) {
  console.error('Agent 3 linkage navigation frontier checkpoint validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Agent 3 linkage navigation frontier checkpoint validation passed: usage rows ${artifact.agent3_usage_state.counts.usage_concordance_rows}; reshit locators ${artifact.reshit_occurrence_locator.counts.unique_locator_rows}; external Orot rows ${observed.counts.missing_lexicon_linkage_rows}`,
);

function expectCounts(actual, expected, keys) {
  for (const key of keys) {
    expect(actual?.[key] === expected?.[key], `count ${key} mismatch: expected ${expected?.[key]}, found ${actual?.[key]}`);
  }
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(resolve(file), 'utf8'));
}

function resolve(file) {
  return path.join(root, file);
}
