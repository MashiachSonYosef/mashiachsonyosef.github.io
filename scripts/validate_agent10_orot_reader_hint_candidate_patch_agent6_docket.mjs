#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent10_agent6_ready_orot_reader_hint_candidate_patch_docket', 'unexpected artifact_type');
expect(data.boundary?.status === 'agent6_ready_review_docket_not_accepted', 'unexpected boundary status');
expect(data.boundary?.evidence_only === true, 'missing evidence_only boundary');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.review_docket_only === true, 'missing review_docket_only boundary');
expect(data.boundary?.no_agent6_verdict === true, 'must not claim Agent 6 verdict');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_accepted_translation_text === true, 'must not claim accepted translation text');
expect(data.boundary?.no_match_percent_authority === true, 'must not claim match percent authority');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public/runtime acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_public_hud_mutation === true, 'must not claim public HUD mutation');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not claim route JSONL mutation');
expect(data.boundary?.no_runtime_asset_mutation === true, 'must not claim runtime asset mutation');
expect(data.boundary?.no_approved_reader_hint_patch === true, 'must not claim approved reader-hint patch');

expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');
expect(Array.isArray(data.outputs?.runtime_files_touched) && data.outputs.runtime_files_touched.length === 0, 'runtime files touched must be empty');
expect(Array.isArray(data.outputs?.source_files_touched) && data.outputs.source_files_touched.length === 0, 'source files touched must be empty');

const paths = {
  candidate_patch: data.inputs?.candidate_patch,
  preview: data.inputs?.preview,
  prefix_contract: data.inputs?.prefix_contract,
  project_preferred_contract: data.inputs?.project_preferred_contract,
  live_old_hud_guard: data.inputs?.live_old_hud_guard,
};
for (const [key, value] of Object.entries(paths)) {
  expect(Boolean(value), `missing input path for ${key}`);
  expect(!path.isAbsolute(value || '') && !(value || '').includes('..'), `${key} input path must be safe relative path`);
}
expect(data.inputs?.candidate_patch_sha256 === sha256File(paths.candidate_patch), 'candidate patch sha256 mismatch');
expect(data.inputs?.preview_sha256 === sha256File(paths.preview), 'preview sha256 mismatch');
expect(data.inputs?.prefix_contract_sha256 === sha256File(paths.prefix_contract), 'prefix contract sha256 mismatch');
expect(data.inputs?.project_preferred_contract_sha256 === sha256File(paths.project_preferred_contract), 'project-preferred contract sha256 mismatch');
expect(data.inputs?.live_old_hud_guard_sha256 === sha256File(paths.live_old_hud_guard), 'live old-HUD guard sha256 mismatch');

const candidatePatch = readJson(paths.candidate_patch);
const liveGuard = readJson(paths.live_old_hud_guard);
expect(data.summary?.status === 'warn_agent6_ready_review_docket_not_accepted', 'unexpected summary status');
expect(data.summary?.candidate_patch_rows === 31, 'expected 31 candidate patch rows');
expect(data.summary?.candidate_patch_occurrences === 1202, 'expected 1202 candidate patch occurrences');
expect(data.summary?.prefix_contract_rows === 12, 'expected 12 prefix rows');
expect(data.summary?.project_preferred_rows === 19, 'expected 19 project-preferred rows');
expect(data.summary?.competing_edge_rows === 19, 'expected 19 competing edge rows');
expect(data.summary?.competing_edges_total === 46, 'expected 46 competing edges total');
expect(data.summary?.approved_rows === 0, 'approved rows must be 0');
expect(data.summary?.public_emit_ready_rows === 0, 'public emit ready rows must be 0');
expect(data.summary?.answer_eligible_rows === 0, 'answer eligible rows must be 0');
expect(data.summary?.promote_to_answer_rows === 0, 'promote_to_answer rows must be 0');
expect(data.summary?.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(data.summary?.route_jsonl_rows_emitted === 0, 'route JSONL rows emitted must be 0');
expect(data.summary?.match_percent_available_rows === 0, 'match percent available rows must be 0');
expect(data.summary?.match_percent_missing_rows === 31, 'match percent missing rows must be 31');
expect(data.summary?.missing_linkage_rows_outside_patch === 13, 'expected 13 missing-linkage rows outside patch');
expect(data.summary?.missing_linkage_occurrences_outside_patch === 129, 'expected 129 missing-linkage occurrences outside patch');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.live_guard_status === 'warn_live_public_old_hud_guard', 'unexpected live guard status');
expect(data.summary?.hard_old_marker_hit_checks === 0, 'hard old marker hits must be 0');
expect(data.summary?.validation_commands_passed === 5, 'expected 5 validation commands passed');
expect(data.summary?.validation_commands_total === 5, 'expected 5 validation commands total');
expect(data.summary?.issues === 0, 'docket issues must be 0');
expect(data.summary?.warnings === 1, 'docket warnings must be 1');

expect(candidatePatch.inputs?.preview_sha256 === data.validation_evidence?.candidate_patch_preview_bijection?.preview_sha256_declared, 'candidate patch preview sha must match docket derivation evidence');
expect(data.validation_evidence?.candidate_patch_preview_bijection?.preview_sha256_actual === sha256File(paths.preview), 'docket actual preview sha mismatch');
expect(data.validation_evidence?.candidate_patch_preview_bijection?.token_rows === 31, 'docket bijection token row count must be 31');
expect(data.validation_evidence?.live_old_hud_guard?.commit_or_deploy_id === liveGuard.commit_or_deploy_id, 'live guard commit/deploy id mismatch');
expect(data.validation_evidence?.live_old_hud_guard?.old_hud_exposure === 'no', 'live guard evidence must preserve old_hud_exposure=no');
expect(data.validation_evidence?.live_old_hud_guard?.hard_old_marker_hit_checks === 0, 'live guard evidence hard old marker hits must be 0');
expect(data.validation_evidence?.live_old_hud_guard?.issues === 0, 'live guard evidence issues must be 0');

const commands = data.validation_evidence?.commands || [];
expect(commands.length === 5, 'expected five validation commands');
for (const command of commands) {
  expect(command.exit_code === 0, `validation command must pass: ${command.command}`);
}

expectMustNotAccept('Agent 6 acceptance');
expectMustNotAccept('QA acceptance');
expectMustNotAccept('Source custody');
expectMustNotAccept('Definition authority');
expectMustNotAccept('Usage-as-definition authority');
expectMustNotAccept('Accepted gloss');
expectMustNotAccept('Accepted translation text');
expectMustNotAccept('Match percent authority');
expectMustNotAccept('Public HUD mutation');
expectMustNotAccept('Route JSONL mutation');
expectMustNotAccept('Runtime asset mutation');
expectMustNotAccept('Publication readiness');
expectMustNotAccept('approved reader-hint patch');

if (issues.length) {
  console.error(`Agent 10 Orot reader-hint candidate patch Agent 6 docket validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 10 Orot reader-hint candidate patch Agent 6 docket validation passed for ${report}.`);

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
