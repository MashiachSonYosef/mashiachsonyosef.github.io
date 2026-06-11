#!/usr/bin/env node
import fs from 'node:fs';

const handoffPath =
  process.argv[2] ||
  'reports/agent10-agent5-handoff-old-dictionary-78-row-agent1-route-blocker-2026-06-06.json';

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

const handoff = readJson(handoffPath);

expect(
  handoff.artifact_type === 'agent10_agent5_handoff_old_dictionary_78_row_agent1_route_blocker',
  'artifact_type mismatch',
);
expect(handoff.active_mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'active mode mismatch');
expect(
  handoff.target_package === 'old-dictionary-commercial-clean-78-row-source-citation-enrichment',
  'target package mismatch',
);
expect(
  handoff.exact_blocker === 'stale_agent1_registry_target_current_agent1_thread_required',
  'exact blocker mismatch',
);

const requiredFiles = [
  'reports/agent10-agent1-ready-old-dictionary-78-row-source-citation-enrichment-workset-2026-06-06.json',
  'reports/agent10-agent1-old-dictionary-78-row-source-citation-enrichment-live-route-blocker-2026-06-06.json',
  'reports/agent10-release-director-state-old-dictionary-boundaries-2026-06-06.json',
];
for (const path of requiredFiles) {
  expect(handoff.files_to_preserve?.includes(path), `files_to_preserve missing ${path}`);
  expect(fs.existsSync(path), `referenced file missing: ${path}`);
}

const workset = readJson(requiredFiles[0]);
const routeBlocker = readJson(requiredFiles[1]);
const director = readJson(requiredFiles[2]);

expect(
  workset.artifact_type === 'agent10_agent1_ready_old_dictionary_78_row_source_citation_enrichment_workset',
  'workset artifact_type mismatch',
);
expect(
  routeBlocker.artifact_type ===
    'agent10_agent1_old_dictionary_78_row_source_citation_enrichment_live_route_blocker',
  'route blocker artifact_type mismatch',
);
expect(
  director.artifact_type === 'agent10_release_director_state_old_dictionary_boundaries',
  'director artifact_type mismatch',
);

const counts = handoff.counts || {};
expect(counts.rows === 78, 'handoff rows must be 78');
expect(counts.occurrences === 1461, 'handoff occurrences must be 1461');
expect(counts.license_lane === 'commercial_clean_candidate', 'handoff license lane mismatch');

const worksetRows = workset.workset || {};
expect(worksetRows.rows === counts.rows, 'workset rows mismatch');
expect(worksetRows.occurrences === counts.occurrences, 'workset occurrences mismatch');
expect(worksetRows.source_license_lane === counts.license_lane, 'workset license lane mismatch');
expect(worksetRows.missing_field_to_supply === 'source_citation_or_url', 'workset missing field mismatch');

for (const field of [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'source_license_lane',
  'source_family_hits',
  'source_rids',
  'source_headwords',
  'source_citation_or_url',
  'citation_basis',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'corpus_contamination',
  'source_acceptance_claimed',
  'agent6_boundary_required',
]) {
  expect(worksetRows.required_fields?.includes(field), `workset required_fields missing ${field}`);
}

const rules = worksetRows.required_rules || {};
expect(rules.rows === counts.rows, 'required_rules rows mismatch');
expect(rules.occurrences === counts.occurrences, 'required_rules occurrences mismatch');
expect(rules.source_license_lane === counts.license_lane, 'required_rules license lane mismatch');
expect(
  rules.source_citation_or_url === 'row_level_non_empty_or_exact_missing_citation_blocker',
  'required source_citation_or_url rule mismatch',
);

for (const field of [
  'source_acceptance_claimed',
  'definition_authority',
  'source_provenance_acceptance',
  'license_legal_acceptance',
  'candidate_text',
  'definition_text',
  'lemma_text',
  'reader_hint_text',
  'answer',
  'route_write',
  'public_runtime_mutation',
  'export',
  'publication_readiness',
  'release_action',
]) {
  expect(rules[field] === false, `required_rules.${field} must be false`);
}
expect(rules.agent6_boundary_required === true, 'required_rules.agent6_boundary_required must be true');

for (const field of [
  'public_runtime_mutation',
  'route_writes',
  'candidate_text_export',
  'definition_lemma_reader_hint_content_storage',
  'answer_eligibility',
  'accepted_text',
  'release_actions',
]) {
  expect(counts[field] === 0, `handoff counts.${field} must be 0`);
}

expect(
  routeBlocker.live_route_attempt?.target_attempted ===
    handoff.live_route_blocker?.target_attempted,
  'route blocker target mismatch',
);
expect(
  routeBlocker.live_route_attempt?.result === handoff.live_route_blocker?.result,
  'route blocker result mismatch',
);
expect(
  routeBlocker.exact_blocker === handoff.live_route_blocker?.exact_blocker,
  'route blocker exact blocker mismatch',
);
expect(routeBlocker.exact_blocker === handoff.exact_blocker, 'route blocker/handoff blocker mismatch');

expect(
  handoff.agent5_preservation_handoff?.owner === 'Agent 5 / coordination',
  'Agent5 handoff owner mismatch',
);
expect(
  handoff.agent5_preservation_handoff?.do_not_push_back_to_agent10_for_source_citation_mechanics === true,
  'Agent10 source mechanics guardrail mismatch',
);
for (const wake of [
  'current Agent 1 route proof',
  'Agent 1 source-citation enrichment return',
  'Agent 1 exact blocker',
  'release/package judgment needed',
]) {
  expect(handoff.agent5_preservation_handoff?.wake_agent10_only_for?.includes(wake), `wake list missing ${wake}`);
}

expect(
  handoff.agent6_boundary_need ===
    'No new Agent 6 route is ready until source_citation_or_url and exact transform-output rule exist, or a narrower no-text boundary question is selected.',
  'Agent6 boundary need mismatch',
);
expect(handoff.stop_condition?.includes('Stop at Agent 5 / coordination preservation handoff'), 'stop condition mismatch');

for (const forbidden of [
  'no_QA_acceptance',
  'no_source_provenance_acceptance',
  'no_source_license_legal_acceptance',
  'no_Definition_authority',
  'no_answer_eligibility',
  'no_public_runtime_mutation',
  'no_candidate_text_export',
  'no_definition_lemma_reader_hint_content_storage',
  'no_publication_readiness',
  'no_release_action',
]) {
  expect(handoff.non_acceptance_boundary?.includes(forbidden), `missing non-acceptance boundary ${forbidden}`);
}

console.log(
  `Agent10 Agent5 Agent1-route blocker handoff validation passed. Rows: ${counts.rows}; occurrences: ${counts.occurrences}; blocker: ${handoff.exact_blocker}.`,
);
