#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-multi-lane-reader-surface-release-train-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent10_multi_lane_reader_surface_release_train', 'unexpected artifact_type');
expect(data.boundary?.status === 'multi_lane_release_train_evidence_only', 'unexpected boundary status');
expect(data.boundary?.evidence_only === true, 'missing evidence_only boundary');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.blocked_no_render === true, 'missing blocked_no_render boundary');
expect(data.boundary?.no_queue_acceptance === true, 'must not claim queue acceptance');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_accepted_translation_text === true, 'must not claim accepted translation text');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public runtime acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_runtime_asset_mutation === true, 'must not mutate runtime assets');
expect(data.boundary?.no_broad_render === true, 'must not claim broad render');

expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');
expect(Array.isArray(data.outputs?.runtime_files_touched) && data.outputs.runtime_files_touched.length === 0, 'runtime files touched must be empty');
expect(Array.isArray(data.outputs?.source_files_touched) && data.outputs.source_files_touched.length === 0, 'source files touched must be empty');

const inputPaths = {
  agent1_missing_linkage_docket: data.inputs?.agent1_missing_linkage_docket,
  agent6_reader_hint_candidate_patch_docket: data.inputs?.agent6_reader_hint_candidate_patch_docket,
  live_old_hud_guard: data.inputs?.live_old_hud_guard,
  ruth_browser_proof: data.inputs?.ruth_browser_proof,
  ruth_runtime_docket: data.inputs?.ruth_runtime_docket,
  jonah_candidate_prep: data.inputs?.jonah_candidate_prep,
};
for (const [key, value] of Object.entries(inputPaths)) {
  expect(Boolean(value), `missing input path ${key}`);
  expect(!path.isAbsolute(value || '') && !(value || '').includes('..'), `${key} must be a safe relative path`);
}
expect(data.inputs?.agent1_missing_linkage_docket_sha256 === sha256File(inputPaths.agent1_missing_linkage_docket), 'Agent 1 docket sha256 mismatch');
expect(data.inputs?.agent6_reader_hint_candidate_patch_docket_sha256 === sha256File(inputPaths.agent6_reader_hint_candidate_patch_docket), 'Agent 6 docket sha256 mismatch');
expect(data.inputs?.live_old_hud_guard_sha256 === sha256File(inputPaths.live_old_hud_guard), 'live guard sha256 mismatch');
expect(data.inputs?.ruth_browser_proof_sha256 === sha256File(inputPaths.ruth_browser_proof), 'Ruth browser proof sha256 mismatch');
expect(data.inputs?.ruth_runtime_docket_hash_boundary === 'not_hashed_here_to_avoid_release_train_runtime_docket_cyclic_dependency', 'Ruth runtime docket hash boundary missing');
expect(data.inputs?.jonah_candidate_prep_sha256 === sha256File(inputPaths.jonah_candidate_prep), 'Jonah candidate prep sha256 mismatch');

expect(data.summary?.status === 'warn_multi_lane_release_train_evidence_only', 'unexpected summary status');
expect(data.summary?.active_lanes === 5, 'expected 5 active lanes');
expect(data.summary?.protected_lanes === 3, 'expected 3 protected lanes');
expect(data.summary?.orot_candidate_patch_rows === 31, 'expected 31 Orot candidate patch rows');
expect(data.summary?.orot_candidate_patch_occurrences === 1202, 'expected 1202 Orot candidate patch occurrences');
expect(data.summary?.orot_missing_linkage_rows === 13, 'expected 13 Orot missing-linkage rows');
expect(data.summary?.orot_missing_linkage_occurrences === 129, 'expected 129 Orot missing-linkage occurrences');
expect(data.summary?.live_lanes_checked === 8, 'expected 8 live lanes checked');
expect(data.summary?.live_page_200_count === 8, 'expected all 8 live pages to return 200');
expect(data.summary?.live_page_hard_old_marker_hits === 0, 'live page hard old-HUD marker hits must be 0');
expect(data.summary?.live_data_endpoint_200_count === 24, 'expected 24 public data endpoints to return 200');
expect(data.summary?.base_live_old_hud_exposure === 'no', 'base live old HUD exposure must be no');
expect(data.summary?.base_hard_old_marker_hit_checks === 0, 'base hard old marker hits must be 0');
expect(data.summary?.validation_commands_passed === 5, 'expected 5 validation commands passed');
expect(data.summary?.validation_commands_total === 5, 'expected 5 validation commands total');
expect(data.summary?.issues === 0, 'release train issues must be 0');
expect(data.summary?.warnings === 1, 'release train warnings must be 1');

expect(Array.isArray(data.lanes) && data.lanes.length === 6, 'expected 6 lane records including protected baseline bundle');
for (const laneId of ['orot_flagship_data_fill', 'leviticus_agent6_runtime_review', 'numbers_agent6_runtime_review', 'ruth_agent6_runtime_review', 'jonah_agent4_browser_proof', 'baseline_preserve']) {
  expect(data.lanes.some((lane) => lane.lane_id === laneId), `missing lane ${laneId}`);
}
for (const lane of data.lanes || []) {
  expect(Boolean(lane.next_packet), `${lane.lane_id} missing next packet`);
  expect(Boolean(lane.stop_condition), `${lane.lane_id} missing stop condition`);
}

const liveByWork = new Map((data.live_lane_checks || []).map((row) => [row.work_id, row]));
for (const workId of ['orot', 'leviticus', 'numbers', 'ruth', 'jonah', 'deuteronomy', 'genesis', 'exodus']) {
  const row = liveByWork.get(workId);
  expect(Boolean(row), `missing live lane check for ${workId}`);
  if (!row) continue;
  expect(row.page_status === 200, `${workId} live page must return 200`);
  expect(row.page_hard_old_marker_hits.length === 0, `${workId} hard old-HUD marker hits must be 0`);
  expect(row.current_hud_markers.includes('data-route-hud-panel'), `${workId} must include current HUD marker`);
  expect(row.manifest_status === 200, `${workId} manifest must return 200`);
  expect(row.reader_hints_status === 200, `${workId} reader hints must return 200`);
  expect(row.route_lookup_manifest_status === 200, `${workId} route lookup manifest must return 200`);
  expect(Number(row.hint_count) > 0, `${workId} hint_count must be positive`);
  expect(Number(row.route_key_count) > 0, `${workId} route key count must be positive`);
  expect(Number(row.shard_count) > 0, `${workId} shard count must be positive`);
  expect(Number(row.card_count) > 0, `${workId} card count must be positive`);
}

expect(liveByWork.get('leviticus')?.hint_count === 3869, 'Leviticus hint count drifted');
expect(liveByWork.get('leviticus')?.route_key_count === 1909, 'Leviticus route key count drifted');
expect(liveByWork.get('leviticus')?.shard_count === 1137, 'Leviticus shard count drifted');
expect(liveByWork.get('leviticus')?.card_count === 5237, 'Leviticus card count drifted');
expect(liveByWork.get('numbers')?.hint_count === 5204, 'Numbers hint count drifted');
expect(liveByWork.get('numbers')?.route_key_count === 2577, 'Numbers route key count drifted');
expect(liveByWork.get('numbers')?.shard_count === 1429, 'Numbers shard count drifted');
expect(liveByWork.get('numbers')?.card_count === 7054, 'Numbers card count drifted');
expect(liveByWork.get('ruth')?.hint_count === 676, 'Ruth hint count drifted');
expect(liveByWork.get('ruth')?.route_key_count === 567, 'Ruth route key count drifted');
expect(liveByWork.get('ruth')?.shard_count === 405, 'Ruth shard count drifted');
expect(liveByWork.get('ruth')?.card_count === 1599, 'Ruth card count drifted');
expect(liveByWork.get('jonah')?.hint_count === 360, 'Jonah hint count drifted');
expect(liveByWork.get('jonah')?.route_key_count === 379, 'Jonah route key count drifted');
expect(liveByWork.get('jonah')?.shard_count === 285, 'Jonah shard count drifted');
expect(liveByWork.get('jonah')?.card_count === 1089, 'Jonah card count drifted');

const commands = data.validation_evidence?.commands || [];
expect(commands.length === 5, 'expected 5 validation commands');
for (const command of commands) {
  expect(command.exit_code === 0, `validation command must pass: ${command.command}`);
}
expect(data.validation_evidence?.live_old_hud_guard?.old_hud_exposure === 'no', 'live guard evidence must preserve exposure=no');
expect(data.validation_evidence?.live_old_hud_guard?.hard_old_marker_hit_checks === 0, 'live guard evidence hard marker hits must be 0');
expect(data.sidecar_agents?.length === 4, 'expected four sidecar agent records');
expect(data.allowed_next_packets?.length === 7, 'expected seven allowed next packets');

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
expectMustNotAccept('Broad rollout');

if (issues.length) {
  console.error(`Agent 10 multi-lane reader surface release train validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 multi-lane reader surface release train validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectMustNotAccept(fragment) {
  const entries = data.what_must_not_be_accepted;
  const found = Array.isArray(entries)
    && entries.some((entry) => String(entry).toLowerCase().includes(fragment.toLowerCase()));
  expect(found, `what_must_not_be_accepted must include ${fragment}`);
}

function sha256File(relativePath) {
  if (!relativePath) return null;
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}
