#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent1-ready-orot-sefaria-family-custody-matrix-request-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent10_agent1_ready_orot_sefaria_family_custody_matrix_request', 'unexpected artifact_type');
expect(data.generator === 'scripts/build_agent10_agent1_orot_sefaria_family_custody_matrix_request.mjs', 'unexpected generator');
expect(data.boundary?.evidence_only === true, 'must be evidence-only');
expect(data.boundary?.request_only === true, 'must be request-only');
expect(data.boundary?.matrix_request_only === true, 'must be matrix-request-only');
expect(data.boundary?.no_license_acceptance === true, 'must not claim license acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_accepted_translation_text === true, 'must not claim accepted text');
expect(data.boundary?.no_answer_rows === true, 'must not emit answer rows');
expect(data.boundary?.no_answer_candidates_emitted === true, 'must not emit answer candidates');
expect(data.boundary?.no_source_rows_emitted === true, 'must not emit source rows');
expect(data.boundary?.no_lexicon_entry_id_assignment === true, 'must not assign lexicon entry ids');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_runtime_mutation === true, 'must not mutate runtime files');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');

for (const [key, value] of Object.entries(data.inputs || {})) {
  if (key.endsWith('_sha256')) continue;
  expectSafeExistingPath(value, `input ${key}`);
}
expectSafeExistingPath(data.outputs?.markdown_report, 'markdown report output');
for (const [key, value] of Object.entries(data.outputs || {})) {
  if (Array.isArray(value)) expect(value.length === 0, `${key} must be empty`);
  else if (key.endsWith('_rows') || key === 'lexicon_entry_id_assignments') expect(value === 0, `${key} must be 0`);
}

const summary = data.summary || {};
expect(summary.family_requests === 5, 'expected five family requests');
expect(summary.candidate_public_domain_families === 3, 'expected three candidate public-domain families');
expect(summary.blocked_or_unresolved_families === 2, 'expected two blocked/unresolved families');
expect(summary.top500_hit_rows === 314, 'expected top500 hit rows 314');
expect(summary.top500_hit_occurrences === 6006, 'expected top500 hit occurrences 6006');
expect(summary.public_domain_observed_rows === 297, 'expected public-domain rows 297');
expect(summary.public_domain_observed_occurrences === 5747, 'expected public-domain occurrences 5747');
expect(summary.strict_exact_preview_rows === 78, 'expected strict exact rows 78');
expect(summary.strict_exact_preview_occurrences === 1461, 'expected strict exact occurrences 1461');
expect(summary.prefix_or_clitic_preview_rows === 129, 'expected prefix/clitic rows 129');
expect(summary.prefix_or_clitic_preview_occurrences === 3035, 'expected prefix/clitic occurrences 3035');
expect(summary.missing_linkage_rows === 13, 'expected 13 missing-linkage rows');
expect(summary.missing_linkage_occurrences === 129, 'expected 129 missing-linkage occurrences');
expect(summary.source_row_evidence_targets === 4, 'expected four source-row evidence targets');
expect(summary.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(summary.answer_candidate_rows_emitted === 0, 'answer candidate rows emitted must be 0');
expect(summary.source_rows_emitted === 0, 'source rows emitted must be 0');
expect(summary.lexicon_entry_ids_assigned === 0, 'lexicon ids assigned must be 0');
expect(summary.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(summary.route_jsonl_rows_emitted === 0, 'route JSONL rows emitted must be 0');

const familyRequests = data.family_requests || [];
expect(familyRequests.length === 5, 'family_requests length mismatch');
for (const family of ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary', 'Klein Dictionary', 'BDB Augmented Strong']) {
  expect(familyRequests.some((row) => row.family === family), `missing family request: ${family}`);
}
for (const family of ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary']) {
  const row = familyRequests.find((entry) => entry.family === family);
  expect(row?.observed_license === 'Public Domain', `${family} expected Public Domain observation`);
  expect(row?.requested_default_status === 'candidate_public_domain_needs_custody_review', `${family} expected custody review status`);
}
expect(familyRequests.find((row) => row.family === 'Klein Dictionary')?.observed_license === 'CC-BY-NC', 'Klein expected CC-BY-NC observation');
expect(familyRequests.find((row) => row.family === 'Klein Dictionary')?.requested_default_status === 'blocked_or_metadata_only_until_agent1_review', 'Klein expected blocked/default status');
expect(familyRequests.find((row) => row.family === 'BDB Augmented Strong')?.requested_default_status === 'blocked_or_metadata_only_until_agent1_review', 'BDB Augmented Strong expected blocked/default status');
for (const row of familyRequests) {
  expect(row.answer_rows_allowed_now === false, `${row.family} answer rows must not be allowed now`);
  expect(row.public_hud_rows_allowed_now === false, `${row.family} public HUD rows must not be allowed now`);
  expect(row.route_jsonl_rows_allowed_now === false, `${row.family} route JSONL rows must not be allowed now`);
}

const schema = data.requested_agent1_matrix_schema || {};
for (const status of [
  'cleared_for_storage_and_display_candidate',
  'cleared_for_metadata_only',
  'cleared_for_external_link_or_citation_only',
  'blocked_unresolved_license',
  'blocked_source_custody_gap',
  'blocked_attribution_gap',
  'blocked_noncommercial_or_policy_gap',
]) {
  expect(schema.required_status_values?.includes(status), `missing required status value: ${status}`);
}
for (const field of ['family', 'observed_license', 'custody_status', 'storage_allowed', 'display_allowed', 'source_manifest_requirement', 'exact_blocker_if_blocked']) {
  expect(schema.required_family_fields?.includes(field), `missing family field: ${field}`);
}
for (const field of ['token_id', 'surface', 'linkage_candidate_bucket', 'recommended_agent1_status', 'exact_blocker_if_blocked']) {
  expect(schema.required_linkage_fields?.includes(field), `missing linkage field: ${field}`);
}

expect(data.missing_linkage_review_request?.rows === 13, 'missing linkage request rows mismatch');
expect((data.missing_linkage_review_request?.rows_for_agent1 || []).length === 13, 'rows_for_agent1 length mismatch');
for (const row of data.missing_linkage_review_request?.rows_for_agent1 || []) {
  expect(row.mutation_allowed_here === false, `${row.token_id} mutation_allowed_here must be false`);
}

expect(data.agent8_callback?.next_executable_route?.includes('Route this packet to Agent 1'), 'Agent 8 callback must route to Agent 1');
expect(data.agent8_callback?.agent1_needed === true, 'Agent 1 should be needed');
expect(data.agent8_callback?.agent2_needed_now === false, 'Agent 2 should not be needed now');
expect(data.agent8_callback?.agent4_needed_now === false, 'Agent 4 should not be needed now');
expect(data.agent8_callback?.agent6_needed_after_agent1 === true, 'Agent 6 should be needed after Agent 1');

const jsonText = fs.readFileSync(path.join(root, report), 'utf8');
for (const forbidden of [
  '"content":',
  '"notes":',
  '"definition":',
  '"answer_text":',
  '"accepted_text":',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain forbidden payload key ${forbidden}`);
}

const markdown = fs.readFileSync(path.join(root, data.outputs.markdown_report), 'utf8');
for (const needle of [
  'Evidence-only request packet',
  'emits zero answer rows',
  'Family Requests',
  'Requested Matrix Schema',
  'Missing Linkage Review Request',
  'Source Row Evidence Request',
  'Agent 8 Callback',
  'What Must Not Be Accepted',
]) {
  expect(markdown.includes(needle), `markdown missing required phrase: ${needle}`);
}

if (issues.length) {
  console.error(`Agent 10 Agent 1 Orot Sefaria family custody matrix request validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Agent 1 Orot Sefaria family custody matrix request validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expectSafeExistingPath(relativePath, label) {
  expect(Boolean(relativePath), `${label} is missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}
