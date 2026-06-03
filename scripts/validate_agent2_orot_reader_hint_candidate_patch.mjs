#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const previewPath = data.inputs?.preview;
const preview = previewPath ? readJson(previewPath) : null;
const issues = [];

expect(data.artifact_type === 'agent2_orot_reader_hint_candidate_patch', 'unexpected artifact_type');
expect(data.boundary?.status === 'candidate_patch_not_approved', 'unexpected boundary status');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.review_artifact_only === true, 'missing review_artifact_only boundary');
expect(data.boundary?.source_preview_only === true, 'missing source_preview_only boundary');
expect(data.boundary?.no_agent6_verdict === true, 'must not claim Agent 6 verdict');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_definition_authority === true, 'must not claim definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not emit translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_match_percent_authority === true, 'must not claim match percent authority');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public/runtime acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_runtime_asset_mutation === true, 'must not mutate runtime assets');
expect(data.boundary?.no_approved_reader_hint_patch === true, 'must not claim approved patch');

expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');
expect(Array.isArray(data.outputs?.runtime_files_touched) && data.outputs.runtime_files_touched.length === 0, 'runtime files touched must be empty');
expect(Array.isArray(data.outputs?.source_files_touched) && data.outputs.source_files_touched.length === 0, 'source files touched must be empty');
expect(data.patch_contract?.public_mutation_allowed_now === false, 'public mutation must not be allowed now');
expect(data.patch_contract?.future_public_hint_path_if_approved_later === 'data/public-hud/orot/reader-hints.json', 'unexpected future public hint path');
expect(previewPath === 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json', 'unexpected preview input path');
if (preview) {
  expect(data.inputs?.preview_sha256 === sha256File(previewPath), 'preview SHA-256 must match current preview file');
  expect(data.inputs?.prefix_contract === preview.inputs?.prefix_contract, 'prefix contract provenance must match preview input');
  expect(data.inputs?.project_preferred_contract === preview.inputs?.project_preferred_contract, 'project-preferred contract provenance must match preview input');
  expect(data.inputs?.missing_linkage_candidates === preview.inputs?.missing_linkage_candidates, 'missing-linkage provenance must match preview input');
  expect(data.inputs?.live_old_hud_guard === preview.inputs?.live_old_hud_guard, 'live guard provenance must match preview input');
}

expect(data.summary?.status === 'warn_candidate_patch_not_approved', 'unexpected summary status');
expect(data.summary?.candidate_patch_rows === 31, 'expected 31 candidate patch rows');
expect(data.summary?.candidate_patch_occurrences === 1202, 'expected 1202 candidate patch occurrences');
expect(data.summary?.prefix_contract_rows === 12, 'expected 12 prefix rows');
expect(data.summary?.project_preferred_rows === 19, 'expected 19 project-preferred rows');
expect(data.summary?.approved_rows === 0, 'approved rows must be 0');
expect(data.summary?.public_emit_ready_rows === 0, 'public emit ready rows must be 0');
expect(data.summary?.answer_eligible_rows === 0, 'answer eligible rows must be 0');
expect(data.summary?.promote_to_answer_rows === 0, 'promote_to_answer rows must be 0');
expect(data.summary?.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(data.summary?.route_jsonl_rows_emitted === 0, 'route JSONL rows emitted must be 0');
expect(data.summary?.match_percent_available_rows === 0, 'match percent available rows must be 0');
expect(data.summary?.match_percent_missing_rows === 31, 'match percent missing rows must be 31');
expect(data.summary?.competing_edge_rows === 19, 'expected 19 rows with competing edges');
expect(data.summary?.competing_edges_total === 46, 'expected 46 competing edges total');
expect(data.summary?.missing_linkage_rows_outside_patch === 13, 'expected 13 missing-linkage rows outside patch');
expect(data.summary?.missing_linkage_occurrences_outside_patch === 129, 'expected 129 missing-linkage occurrences outside patch');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.live_guard_status === 'warn_live_public_old_hud_guard', 'unexpected live guard status');
expect(data.summary?.issues === 0, 'candidate patch issues must be 0');
expect(data.summary?.warnings === 1, 'candidate patch warnings must be 1');

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

const rows = data.candidate_patch_rows || [];
expect(rows.length === data.summary?.candidate_patch_rows, 'candidate_patch_rows length must match summary');
expect(sum(rows.map((row) => row.occurrences)) === data.summary?.candidate_patch_occurrences, 'candidate occurrence sum must match summary');
expect(rows.filter((row) => row.competing_edge_count > 0).length === data.summary?.competing_edge_rows, 'competing edge row count must match summary');
expect(sum(rows.map((row) => row.competing_edge_count)) === data.summary?.competing_edges_total, 'competing edge total must match summary');
const previewByToken = new Map((preview?.preview_rows || []).map((row) => [row.token_id, row]));
expect(previewByToken.size === 31, 'preview must contain 31 unique token ids');

const tokenIds = new Set();
for (const row of rows) {
  const previewRow = previewByToken.get(row.target_token_id);
  expect(Boolean(previewRow), `${row.target_token_id} missing matching preview row`);
  expect(row.patch_status === 'candidate_patch_row_not_approved', `${row.target_token_id} unexpected patch status`);
  expect(row.target_work === 'orot', `${row.target_token_id} target work must be orot`);
  expect(row.target_route === 'orot/', `${row.target_token_id} target route must be orot/`);
  expect(!tokenIds.has(row.target_token_id), `${row.target_token_id} duplicate token id`);
  tokenIds.add(row.target_token_id);
  expect(Boolean(row.target_lexicon_entry_id), `${row.target_token_id} missing lexicon entry id`);
  expect(Boolean(row.surface), `${row.target_token_id} missing surface`);
  expect(Boolean(row.normalized), `${row.target_token_id} missing normalized`);
  if (previewRow) {
    expect(row.target_lexicon_entry_id === previewRow.lexicon_entry_id, `${row.target_token_id} lexicon entry id drifted from preview`);
    expect(row.surface === previewRow.surface, `${row.target_token_id} surface drifted from preview`);
    expect(row.normalized === previewRow.normalized, `${row.target_token_id} normalized drifted from preview`);
    expect(row.occurrences === previewRow.occurrences, `${row.target_token_id} occurrences drifted from preview`);
    expect(row.prefix_class === previewRow.prefix_class, `${row.target_token_id} prefix class drifted from preview`);
    expect(row.prefix_stem_key === previewRow.prefix_stem_key, `${row.target_token_id} prefix stem key drifted from preview`);
    expect(row.source_contract === previewRow.source_contract, `${row.target_token_id} source contract drifted from preview`);
    expect(row.source_contract_path === previewRow.source_contract_path, `${row.target_token_id} source contract path drifted from preview`);
    expect(row.source_contract_status === previewRow.source_contract_status, `${row.target_token_id} source contract status drifted from preview`);
    expect(row.selection_basis === previewRow.selection_basis, `${row.target_token_id} selection basis drifted from preview`);
    expect(row.competing_edge_count === previewRow.competing_edge_count, `${row.target_token_id} competing edge count drifted from preview`);
  }
  expect(Boolean(row.candidate_counterpart?.display), `${row.target_token_id} missing candidate display`);
  expect(row.candidate_counterpart?.label_status === 'candidate_not_approved', `${row.target_token_id} label status must be candidate_not_approved`);
  expect(row.candidate_counterpart?.match_percent === null, `${row.target_token_id} match percent must be null`);
  expect(row.candidate_counterpart?.match_percent_status === 'not_available_in_contract_inputs', `${row.target_token_id} unexpected match percent status`);
  expect(Boolean(row.candidate_counterpart?.selected_claim_id), `${row.target_token_id} missing selected claim id`);
  expect(Boolean(row.candidate_counterpart?.selected_claim_file), `${row.target_token_id} missing selected claim file`);
  expect(Array.isArray(row.candidate_counterpart?.selected_source_rows) && row.candidate_counterpart.selected_source_rows.length > 0, `${row.target_token_id} missing selected source rows`);
  if (previewRow) {
    const previewCandidate = previewRow.reader_hint_candidate || {};
    expect(row.candidate_counterpart.display === previewCandidate.display, `${row.target_token_id} candidate display drifted from preview`);
    expect(row.candidate_counterpart.label === previewCandidate.label, `${row.target_token_id} candidate label drifted from preview`);
    expect(row.candidate_counterpart.match_percent === previewCandidate.match_percent, `${row.target_token_id} match percent drifted from preview`);
    expect(row.candidate_counterpart.match_percent_status === previewCandidate.match_percent_status, `${row.target_token_id} match percent status drifted from preview`);
    expect(row.candidate_counterpart.selected_claim_id === previewCandidate.selected_claim_id, `${row.target_token_id} selected claim id drifted from preview`);
    expect(row.candidate_counterpart.selected_claim_file === previewCandidate.selected_claim_file, `${row.target_token_id} selected claim file drifted from preview`);
    expect(row.candidate_counterpart.selected_route_family === previewCandidate.selected_route_family, `${row.target_token_id} selected route family drifted from preview`);
    expect(row.candidate_counterpart.selected_route_type === previewCandidate.selected_route_type, `${row.target_token_id} selected route type drifted from preview`);
    expect(row.candidate_counterpart.selected_surface === previewCandidate.selected_surface, `${row.target_token_id} selected surface drifted from preview`);
    expect(row.candidate_counterpart.selected_normalized === previewCandidate.selected_normalized, `${row.target_token_id} selected normalized drifted from preview`);
    expect(deepEqual(row.candidate_counterpart.selected_source_rows, previewCandidate.selected_source_rows), `${row.target_token_id} selected source rows drifted from preview`);
    expect(deepEqual(row.competing_edges, previewRow.competing_edges), `${row.target_token_id} competing edges drifted from preview`);
  }

  const isProjectPreferred = row.selection_basis === 'project_lexical_preference_among_competing_stem_edges';
  const expectedLabel = isProjectPreferred ? 'project-preferred counterpart candidate' : 'counterpart candidate';
  expect(row.candidate_counterpart?.label === expectedLabel, `${row.target_token_id} candidate label must be ${expectedLabel}`);
  if (isProjectPreferred) {
    expect(Array.isArray(row.competing_edges) && row.competing_edges.length > 0, `${row.target_token_id} project-preferred row must preserve competing edges`);
    for (const [index, edge] of row.competing_edges.entries()) {
      expect(Boolean(edge.relation), `${row.target_token_id} competing edge ${index} missing relation`);
      expect(Boolean(edge.upstream_claim_file), `${row.target_token_id} competing edge ${index} missing upstream claim file`);
      expect(edge.promote_to_answer === false, `${row.target_token_id} competing edge ${index} promote_to_answer must be false`);
    }
  }

  expect(row.approved_for_public_emit === false, `${row.target_token_id} approved_for_public_emit must be false`);
  expect(row.public_emit_ready === false, `${row.target_token_id} public_emit_ready must be false`);
  expect(row.answer_eligible === false, `${row.target_token_id} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `${row.target_token_id} promote_to_answer must be false`);
  expect(row.would_modify_public_hud === false, `${row.target_token_id} would_modify_public_hud must be false`);
  expect(row.would_write_if_approved_later?.path === 'data/public-hud/orot/reader-hints.json', `${row.target_token_id} unexpected would-write path`);
  expect(row.would_write_if_approved_later?.allowed_now === false, `${row.target_token_id} would-write must not be allowed now`);
}
for (const tokenId of previewByToken.keys()) {
  expect(tokenIds.has(tokenId), `${tokenId} preview row missing from candidate patch`);
}

if (issues.length) {
  console.error(`Agent 2 Orot reader-hint candidate patch validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot reader-hint candidate patch validation passed for ${report}.`);

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
  return createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
