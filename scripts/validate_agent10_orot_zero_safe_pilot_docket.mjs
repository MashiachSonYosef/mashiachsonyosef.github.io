#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent10_agent2_ready_orot_zero_safe_pilot_docket', 'unexpected artifact_type');
expect(data.boundary?.status === 'agent2_zero_safe_pilot_docket_not_accepted', 'unexpected boundary status');
expect(data.boundary?.evidence_only === true, 'missing evidence_only boundary');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.review_docket_only === true, 'missing review_docket_only boundary');
expect(data.boundary?.zero_safe_output_only === true, 'missing zero_safe_output_only boundary');
expect(data.boundary?.no_agent2_definition_authority === true, 'must not claim Agent 2 Definition authority');
expect(data.boundary?.no_agent6_verdict === true, 'must not claim Agent 6 verdict');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_accepted_translation_text === true, 'must not claim accepted translation text');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public/runtime acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_runtime_asset_mutation === true, 'must not mutate runtime assets');

expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');
expect(Array.isArray(data.outputs?.runtime_files_touched) && data.outputs.runtime_files_touched.length === 0, 'runtime files touched must be empty');
expect(Array.isArray(data.outputs?.source_files_touched) && data.outputs.source_files_touched.length === 0, 'source files touched must be empty');

const paths = {
  pilot: data.inputs?.pilot,
  pilot_report: data.inputs?.pilot_report,
  source_blocker_map: data.inputs?.source_blocker_map,
  agent6_requirements: data.inputs?.agent6_requirements,
  live_old_hud_guard: data.inputs?.live_old_hud_guard,
};
for (const [key, value] of Object.entries(paths)) {
  expect(Boolean(value), `missing input path for ${key}`);
  expect(!path.isAbsolute(value || '') && !(value || '').includes('..'), `${key} input path must be safe relative path`);
}
expect(data.inputs?.pilot_sha256 === sha256File(paths.pilot), 'pilot sha256 mismatch');
expect(data.inputs?.pilot_report_sha256 === sha256File(paths.pilot_report), 'pilot report sha256 mismatch');
expect(data.inputs?.source_blocker_map_sha256 === sha256File(paths.source_blocker_map), 'source blocker map sha256 mismatch');
expect(data.inputs?.agent6_requirements_sha256 === sha256File(paths.agent6_requirements), 'Agent 6 requirements sha256 mismatch');
expect(data.inputs?.live_old_hud_guard_sha256 === sha256File(paths.live_old_hud_guard), 'live old-HUD guard sha256 mismatch');

const pilot = readJson(paths.pilot);
const liveGuard = readJson(paths.live_old_hud_guard);
expect(data.summary?.status === 'warn_agent2_zero_safe_pilot_docket_not_accepted', 'unexpected summary status');
expect(data.summary?.target_rows === 100, 'expected 100 target rows');
expect(data.summary?.target_occurrences === 1960, 'expected 1960 target occurrences');
expect(data.summary?.source_clean_rows === 87, 'expected 87 source-clean rows');
expect(data.summary?.source_blocked_rows === 13, 'expected 13 source-blocked rows');
expect(data.summary?.rows_with_exact_upstream_claim === 0, 'rows with exact upstream claim must be 0');
expect(data.summary?.route_cards === 1897, 'expected 1897 route cards');
expect(data.summary?.route_answer_cards === 0, 'route answer cards must be 0');
expect(data.summary?.emitted_answer_rows === 0, 'emitted answer rows must be 0');
expect(data.summary?.blocked_rows === 100, 'blocked rows must be 100');
expect(data.summary?.route_claim_jsonl_written === false, 'route JSONL must not be written');
expect(data.summary?.route_claim_jsonl_exists === false, 'route JSONL must not exist');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.live_guard_status === 'warn_live_public_old_hud_guard', 'unexpected live guard status');
expect(data.summary?.hard_old_marker_hit_checks === 0, 'hard old marker hits must be 0');
expect(data.summary?.validation_commands_passed === 2, 'expected 2 validation commands passed');
expect(data.summary?.validation_commands_total === 2, 'expected 2 validation commands total');
expect(data.summary?.issues === 0, 'docket issues must be 0');
expect(data.summary?.warnings === 1, 'docket warnings must be 1');

expect(pilot.boundary?.status === 'zero_safe_output_blocker', 'pilot source must remain zero_safe_output_blocker');
expect(pilot.counts?.emitted_answer_rows === data.summary?.emitted_answer_rows, 'pilot emitted answer count mismatch');
expect(pilot.counts?.blocked_rows === data.summary?.blocked_rows, 'pilot blocked row count mismatch');
expect(liveGuard.summary?.old_hud_exposure === 'no', 'live guard source must preserve old_hud_exposure=no');
expect(liveGuard.summary?.hard_old_marker_hit_checks === 0, 'live guard source hard old marker hits must be 0');
expect(liveGuard.summary?.issues === 0, 'live guard source issues must be 0');

expect(data.blocker_counts?.missing_exact_upstream_definition_claim === 100, 'missing upstream blocker count mismatch');
expect(data.blocker_counts?.current_route_cards_are_non_answer === 100, 'current-route non-answer blocker count mismatch');
expect(data.blocker_counts?.existing_cards_are_evidence_or_form_reference === 100, 'evidence/form blocker count mismatch');
expect(data.blocker_counts?.missing_lexicon_entry_id === 13, 'missing lexicon blocker count mismatch');

const commands = data.validation_evidence?.commands || [];
expect(commands.length === 2, 'expected two validation commands');
for (const command of commands) {
  expect(command.exit_code === 0, `validation command must pass: ${command.command}`);
}

const rows = data.sample_blocked_rows || [];
expect(rows.length === 25, 'expected 25 sample blocked rows');
for (const row of rows) {
  expect(Boolean(row.token_id), 'sample row missing token id');
  expect(row.route_answer_card_count === 0, `${row.token_id} route answer cards must be 0`);
  expect(row.upstream_claim_count === 0, `${row.token_id} upstream claim count must be 0`);
  expect(Array.isArray(row.blockers) && row.blockers.includes('missing_exact_upstream_definition_claim'), `${row.token_id} missing upstream blocker`);
  expect(Boolean(row.next_safe_route), `${row.token_id} missing next safe route`);
}

expectMustNotAccept('Agent 2 Definition authority');
expectMustNotAccept('Agent 6 acceptance');
expectMustNotAccept('QA acceptance');
expectMustNotAccept('Validated public/runtime acceptance');
expectMustNotAccept('Source custody');
expectMustNotAccept('Definition authority');
expectMustNotAccept('Usage-as-definition authority');
expectMustNotAccept('Accepted gloss');
expectMustNotAccept('Accepted translation text');
expectMustNotAccept('Public HUD mutation');
expectMustNotAccept('Route JSONL mutation');
expectMustNotAccept('Runtime asset mutation');
expectMustNotAccept('Publication readiness');
expectMustNotAccept('fill-producing Orot package');

if (issues.length) {
  console.error(`Agent 10 Orot zero-safe pilot docket validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot zero-safe pilot docket validation passed for ${report}.`);

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
