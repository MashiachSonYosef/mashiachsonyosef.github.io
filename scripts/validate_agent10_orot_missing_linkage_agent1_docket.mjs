#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent10_agent1_ready_orot_missing_linkage_review_docket', 'unexpected artifact_type');
expect(data.boundary?.status === 'agent1_ready_missing_linkage_review_docket_not_accepted', 'unexpected boundary status');
expect(data.boundary?.evidence_only === true, 'missing evidence_only boundary');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.review_docket_only === true, 'missing review_docket_only boundary');
expect(data.boundary?.no_agent1_source_custody === true, 'must not claim Agent 1 source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_source_mutation === true, 'must not mutate source');
expect(data.boundary?.no_lexicon_entry_id_assignment === true, 'must not assign lexicon entry ids');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not emit translation output');
expect(data.boundary?.no_accepted_text === true, 'must not claim accepted text');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public/runtime acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');

expect(data.outputs?.source_mutation === null, 'source_mutation output must be null');
expect(data.outputs?.lexical_payload_mutation === null, 'lexical_payload_mutation output must be null');
expect(data.outputs?.token_index_mutation === null, 'token_index_mutation output must be null');
expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');
expect(Array.isArray(data.outputs?.runtime_files_touched) && data.outputs.runtime_files_touched.length === 0, 'runtime files touched must be empty');
expect(Array.isArray(data.outputs?.source_files_touched) && data.outputs.source_files_touched.length === 0, 'source files touched must be empty');

const paths = {
  missing_linkage: data.inputs?.missing_linkage,
  candidate_patch_docket: data.inputs?.candidate_patch_docket,
  live_old_hud_guard: data.inputs?.live_old_hud_guard,
};
for (const [key, value] of Object.entries(paths)) {
  expect(Boolean(value), `missing input path for ${key}`);
  expect(!path.isAbsolute(value || '') && !(value || '').includes('..'), `${key} input path must be safe relative path`);
}
expect(data.inputs?.missing_linkage_sha256 === sha256File(paths.missing_linkage), 'missing-linkage sha256 mismatch');
expect(data.inputs?.candidate_patch_docket_sha256 === sha256File(paths.candidate_patch_docket), 'candidate patch docket sha256 mismatch');
expect(data.inputs?.live_old_hud_guard_sha256 === sha256File(paths.live_old_hud_guard), 'live old-HUD guard sha256 mismatch');

const missingLinkage = readJson(paths.missing_linkage);
const candidatePatchDocket = readJson(paths.candidate_patch_docket);
const liveGuard = readJson(paths.live_old_hud_guard);

expect(data.summary?.status === 'warn_agent1_ready_missing_linkage_review_docket_not_accepted', 'unexpected summary status');
expect(data.summary?.review_rows === 13, 'expected 13 review rows');
expect(data.summary?.review_occurrences === 129, 'expected 129 review occurrences');
expect(data.summary?.no_current_stem_source_candidate_rows === 3, 'expected 3 no-current-source rows');
expect(data.summary?.no_current_stem_source_candidate_occurrences === 71, 'expected 71 no-current-source occurrences');
expect(data.summary?.single_stem_candidate_rows === 6, 'expected 6 single-stem rows');
expect(data.summary?.single_stem_candidate_occurrences === 32, 'expected 32 single-stem occurrences');
expect(data.summary?.project_preferred_candidate_rows === 3, 'expected 3 project-preferred rows');
expect(data.summary?.project_preferred_candidate_occurrences === 23, 'expected 23 project-preferred occurrences');
expect(data.summary?.multi_stem_no_project_preferred_rows === 1, 'expected 1 multi-stem row');
expect(data.summary?.multi_stem_no_project_preferred_occurrences === 3, 'expected 3 multi-stem occurrences');
expect(data.summary?.candidate_edges_total === 19, 'expected 19 candidate edges total');
expect(data.summary?.project_preferred_edges_total === 3, 'expected 3 project-preferred edges total');
expect(data.summary?.mutation_rows_emitted === 0, 'mutation rows emitted must be 0');
expect(data.summary?.source_rows_emitted === 0, 'source rows emitted must be 0');
expect(data.summary?.lexicon_entry_ids_assigned === 0, 'lexicon entry ids assigned must be 0');
expect(data.summary?.candidate_patch_rows_currently_prepared === 31, 'expected 31 currently prepared candidate patch rows');
expect(data.summary?.candidate_patch_occurrences_currently_prepared === 1202, 'expected 1202 currently prepared candidate patch occurrences');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.live_guard_status === 'warn_live_public_old_hud_guard', 'unexpected live guard status');
expect(data.summary?.hard_old_marker_hit_checks === 0, 'hard old marker hits must be 0');
expect(data.summary?.validation_commands_passed === 3, 'expected 3 validation commands passed');
expect(data.summary?.validation_commands_total === 3, 'expected 3 validation commands total');
expect(data.summary?.issues === 0, 'docket issues must be 0');
expect(data.summary?.warnings === 1, 'docket warnings must be 1');

expect(missingLinkage.counts?.missing_lexicon_linkage_rows === data.summary?.review_rows, 'missing-linkage row count must match source artifact');
expect(missingLinkage.counts?.missing_lexicon_linkage_occurrences === data.summary?.review_occurrences, 'missing-linkage occurrence count must match source artifact');
expect(candidatePatchDocket.summary?.candidate_patch_rows === data.summary?.candidate_patch_rows_currently_prepared, 'candidate patch row count must match candidate docket');
expect(liveGuard.summary?.old_hud_exposure === 'no', 'live guard source must preserve old_hud_exposure=no');
expect(liveGuard.summary?.hard_old_marker_hit_checks === 0, 'live guard source hard old marker hits must be 0');
expect(liveGuard.summary?.issues === 0, 'live guard source issues must be 0');

const commands = data.validation_evidence?.commands || [];
expect(commands.length === 3, 'expected three validation commands');
for (const command of commands) {
  expect(command.exit_code === 0, `validation command must pass: ${command.command}`);
}

const rows = data.review_rows || [];
expect(rows.length === data.summary?.review_rows, 'review rows length must match summary');
expect(sum(rows.map((row) => row.occurrences)) === data.summary?.review_occurrences, 'review occurrence sum must match summary');
const sourceRowsByToken = new Map((missingLinkage.candidates || []).map((row) => [row.token_id, row]));
const tokenIds = new Set();
for (const row of rows) {
  const sourceRow = sourceRowsByToken.get(row.token_id);
  expect(Boolean(sourceRow), `${row.token_id} missing source missing-linkage row`);
  expect(!tokenIds.has(row.token_id), `${row.token_id} duplicate review token`);
  tokenIds.add(row.token_id);
  expect(row.review_status === 'agent1_source_linkage_review_needed', `${row.token_id} unexpected review status`);
  expect(row.mutation_allowed_here === false, `${row.token_id} mutation_allowed_here must be false`);
  expect(row.lexicon_entry_id_assignment_allowed_here === false, `${row.token_id} lexicon_entry_id assignment must be false`);
  expect(row.source_custody_claimed === false, `${row.token_id} source custody claim must be false`);
  expect(row.source_acceptance_claimed === false, `${row.token_id} source acceptance claim must be false`);
  expect(row.definition_authority_claimed === false, `${row.token_id} definition authority claim must be false`);
  expect(row.public_hud_mutation_allowed === false, `${row.token_id} public HUD mutation must be false`);
  expect(Boolean(row.requested_agent1_review), `${row.token_id} missing Agent 1 review request`);
  if (sourceRow) {
    expect(row.queue_id === sourceRow.queue_id, `${row.token_id} queue id drifted`);
    expect(row.surface === sourceRow.surface, `${row.token_id} surface drifted`);
    expect(row.normalized === sourceRow.normalized, `${row.token_id} normalized drifted`);
    expect(row.occurrences === sourceRow.occurrences, `${row.token_id} occurrences drifted`);
    expect(row.prefix_class === sourceRow.prefix_class, `${row.token_id} prefix class drifted`);
    expect(row.prefix_stem_key === sourceRow.prefix_stem_key, `${row.token_id} prefix stem key drifted`);
    expect(row.linkage_candidate_bucket === sourceRow.linkage_candidate_bucket, `${row.token_id} bucket drifted`);
    expect(row.candidate_edge_count === sourceRow.candidate_edge_count, `${row.token_id} candidate edge count drifted`);
    expect(row.project_preferred_edge_count === sourceRow.project_preferred_edge_count, `${row.token_id} project edge count drifted`);
    expect(deepEqual(row.candidate_edges, sourceRow.candidate_edges), `${row.token_id} candidate edges drifted`);
  }
}
for (const tokenId of sourceRowsByToken.keys()) {
  expect(tokenIds.has(tokenId), `${tokenId} source row missing from review docket`);
}

expectMustNotAccept('Source/provenance acceptance');
expectMustNotAccept('Definition authority');
expectMustNotAccept('Usage-as-definition authority');
expectMustNotAccept('Accepted gloss');
expectMustNotAccept('Accepted translation text');
expectMustNotAccept('QA acceptance');
expectMustNotAccept('Validated public/runtime acceptance');
expectMustNotAccept('Publication readiness');
expectMustNotAccept('lexicon_entry_id assignment');
expectMustNotAccept('token-index mutation');
expectMustNotAccept('lexical payload mutation');
expectMustNotAccept('public HUD mutation');
expectMustNotAccept('route JSONL mutation');

if (issues.length) {
  console.error(`Agent 10 Orot missing-linkage Agent 1 docket validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot missing-linkage Agent 1 docket validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectMustNotAccept(fragment) {
  const entries = data.what_must_not_be_accepted;
  const found = Array.isArray(entries)
    && entries.some((entry) => String(entry).toLowerCase().includes(fragment.toLowerCase()));
  expect(found, `what_must_not_be_accepted must include ${fragment}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function sha256File(relativePath) {
  if (!relativePath) return null;
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
