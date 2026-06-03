#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent6-ready-numbers-runtime-review-docket-2026-06-03.json';
const data = readJson(report);
const issues = [];

const configs = {
  numbers: {
    page: 'tanakh/numbers/',
    max_shard_bytes: 61167,
    hint_count: 5204,
    route_key_count: 2577,
    shard_count: 1429,
    card_count: 7054,
    route_cards_clicked: 21,
    answer_cards_clicked: 2,
    source_rows_clicked: 3,
    proof_artifact_type: 'agent4_numbers_live_browser_click_proof',
    required_checks_total: 10,
  },
  ruth: {
    page: 'tanakh/ruth/',
    max_shard_bytes: 23873,
    hint_count: 676,
    route_key_count: 567,
    shard_count: 405,
    card_count: 1599,
    route_cards_clicked: 8,
    answer_cards_clicked: 2,
    source_rows_clicked: 3,
    proof_artifact_type: 'agent4_live_ruth_browser_runtime_evidence',
    required_checks_total: 7,
  },
};

const workId = data.summary?.work_id;
const config = configs[workId];
expect(Boolean(config), `unsupported work_id: ${workId}`);

expect(data.artifact_type === 'agent10_agent6_ready_runtime_review_docket', 'unexpected artifact_type');
expect(data.boundary?.status === `agent6_ready_${workId}_runtime_review_docket_not_accepted`, 'unexpected boundary status');
expect(data.boundary?.evidence_only === true, 'missing evidence_only boundary');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.review_docket_only === true, 'missing review_docket_only boundary');
expect(data.boundary?.exact_surface_only === true, 'missing exact_surface_only boundary');
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
expect(data.boundary?.no_deploy_or_cache_closure === true, 'must not claim deploy/cache closure');
expect(data.boundary?.no_broad_rollout === true, 'must not claim broad rollout');

expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');
expect(Array.isArray(data.outputs?.runtime_files_touched) && data.outputs.runtime_files_touched.length === 0, 'runtime files touched must be empty');
expect(Array.isArray(data.outputs?.source_files_touched) && data.outputs.source_files_touched.length === 0, 'source files touched must be empty');

const paths = {
  release_train: data.inputs?.release_train,
  candidate_prep: data.inputs?.candidate_prep,
  agent4_proof: data.inputs?.agent4_proof,
  agent4_proof_report: data.inputs?.agent4_proof_report,
  agent4_screenshot: data.inputs?.agent4_screenshot,
  live_old_hud_guard: data.inputs?.live_old_hud_guard,
};
for (const [key, value] of Object.entries(paths)) {
  expect(Boolean(value), `missing input path for ${key}`);
  expect(!path.isAbsolute(value || '') && !(value || '').includes('..'), `${key} input path must be safe relative path`);
}
expect(data.inputs?.release_train_sha256 === sha256File(paths.release_train), 'release train sha256 mismatch');
expect(data.inputs?.candidate_prep_sha256 === sha256File(paths.candidate_prep), 'candidate prep sha256 mismatch');
expect(data.inputs?.agent4_proof_sha256 === sha256File(paths.agent4_proof), 'Agent 4 proof sha256 mismatch');
expect(data.inputs?.agent4_proof_report_sha256 === sha256File(paths.agent4_proof_report), 'Agent 4 proof report sha256 mismatch');
expect(data.inputs?.agent4_screenshot_sha256 === sha256File(paths.agent4_screenshot), 'Agent 4 screenshot sha256 mismatch');
expect(data.inputs?.live_old_hud_guard_sha256 === sha256File(paths.live_old_hud_guard), 'live old-HUD guard sha256 mismatch');

const releaseTrain = readJson(paths.release_train);
const proof = readJson(paths.agent4_proof);
const liveGuard = readJson(paths.live_old_hud_guard);
const liveLane = (releaseTrain.live_lane_checks || []).find((row) => row.work_id === workId) || {};

expect(data.summary?.status === `warn_agent6_ready_${workId}_runtime_review_docket_not_accepted`, 'unexpected summary status');
if (config) {
  expect(data.summary?.page === config.page, 'unexpected page');
  expect(data.summary?.live_page_status === 200, 'live page must be 200');
  expect(data.summary?.live_page_hard_old_marker_hits === 0, 'hard old-HUD hits must be 0');
  expect(data.summary?.manifest_status === 200, 'manifest must be 200');
  expect(data.summary?.reader_hints_status === 200, 'reader hints must be 200');
  expect(data.summary?.route_lookup_manifest_status === 200, 'route lookup manifest must be 200');
  expect(data.summary?.hint_count === config.hint_count, 'hint count drifted');
  expect(data.summary?.route_key_count === config.route_key_count, 'route key count drifted');
  expect(data.summary?.shard_count === config.shard_count, 'shard count drifted');
  expect(data.summary?.card_count === config.card_count, 'card count drifted');
  expect(data.summary?.max_shard_bytes === config.max_shard_bytes, 'max shard bytes drifted');
  expect(data.summary?.agent4_route_cards_clicked === config.route_cards_clicked, 'Agent 4 route cards clicked drifted');
  expect(data.summary?.agent4_answer_cards_clicked === config.answer_cards_clicked, 'Agent 4 answer cards clicked drifted');
  expect(data.summary?.agent4_source_rows_clicked === config.source_rows_clicked, 'Agent 4 source rows clicked drifted');
  expect(proof.artifact_type === config.proof_artifact_type, 'Agent 4 proof artifact type drifted');
}
expect(String(data.summary?.agent4_status || '').startsWith('warn_'), 'Agent 4 status drifted');
expect(data.summary?.agent4_required_checks_passed === config?.required_checks_total, `expected ${config?.required_checks_total} Agent 4 required checks passed`);
expect(data.summary?.agent4_required_checks_total === config?.required_checks_total, `expected ${config?.required_checks_total} Agent 4 required checks total`);
expect(data.summary?.agent4_hud_open === true, 'Agent 4 HUD must open');
expect(data.summary?.agent4_fullscreen_width === true, 'Agent 4 fullscreen width must be true');
expect(data.summary?.agent4_fullscreen_height === true, 'Agent 4 fullscreen height must be true');
expect(data.summary?.agent4_old_marker_hits === 0, 'Agent 4 old marker hits must be 0');
expect(data.summary?.fresh_live_old_hud_exposure === 'no', 'fresh live old HUD exposure must be no');
expect(data.summary?.fresh_hard_old_marker_hit_checks === 0, 'fresh hard old marker hit checks must be 0');
expect(data.summary?.validation_commands_passed === 2, 'expected 2 validation commands passed');
expect(data.summary?.validation_commands_total === 2, 'expected 2 validation commands total');
expect(data.summary?.issues === 0, 'docket issues must be 0');
expect(data.summary?.warnings === (workId === 'ruth' ? 3 : 2), `docket warnings must be ${workId === 'ruth' ? 3 : 2}`);

expect(liveLane.page_status === data.summary?.live_page_status, 'release train live page status mismatch');
expect(liveLane.hint_count === data.summary?.hint_count, 'release train hint count mismatch');
expect(liveLane.route_key_count === data.summary?.route_key_count, 'release train route key count mismatch');
expect(liveLane.shard_count === data.summary?.shard_count, 'release train shard count mismatch');
expect(liveLane.card_count === data.summary?.card_count, 'release train card count mismatch');
expect((proof.status || proof.summary?.status) === data.summary?.agent4_status, 'Agent 4 proof status mismatch');
expect(proof.fullscreen_measurement?.hudOpen === true, 'Agent 4 proof HUD open must remain true');
expect((proof.fullscreen_measurement?.oldMarkerHits || []).length === 0, 'Agent 4 proof fullscreen old marker hits must be 0');
expect(liveGuard.summary?.old_hud_exposure === 'no', 'live guard source must preserve old_hud_exposure=no');
expect(liveGuard.summary?.hard_old_marker_hit_checks === 0, 'live guard source hard marker hits must be 0');
expect(liveGuard.summary?.issues === 0, 'live guard source issues must be 0');

const commands = data.validation_evidence?.commands || [];
expect(commands.length === 2, 'expected two validation commands');
for (const command of commands) {
  expect(command.exit_code === 0, `validation command must pass: ${command.command}`);
}

expectMustNotAccept('Agent 6 acceptance');
expectMustNotAccept('QA acceptance');
expectMustNotAccept('Validated public/runtime acceptance');
expectMustNotAccept('Source custody');
expectMustNotAccept('Definition authority');
expectMustNotAccept('Usage-as-definition authority');
expectMustNotAccept('Accepted gloss');
expectMustNotAccept('Accepted translation text');
expectMustNotAccept('Deployment/CDN/cache closure');
expectMustNotAccept('Publication readiness');
expectMustNotAccept('Public HUD mutation');
expectMustNotAccept('Route JSONL mutation');
expectMustNotAccept('Runtime asset mutation');
expectMustNotAccept('Broad rollout');

if (issues.length) {
  console.error(`Agent 10 runtime review docket validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 runtime review docket validation passed for ${report}.`);

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
