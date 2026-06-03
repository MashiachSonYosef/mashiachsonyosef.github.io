#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent2_orot_counterpart_hint_patch_preview', 'unexpected artifact_type');
expect(data.boundary?.status === 'candidate_patch_preview_not_approved', 'unexpected boundary status');
expect(data.boundary?.pipeline_only === true, 'missing pipeline_only boundary');
expect(data.boundary?.report_only === true, 'missing report_only boundary');
expect(data.boundary?.no_agent6_verdict === true, 'must not claim Agent 6 verdict');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_source_acceptance === true, 'must not claim source acceptance');
expect(data.boundary?.no_definition_authority === true, 'must not claim definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not emit translation output');
expect(data.boundary?.no_public_runtime_acceptance === true, 'must not claim public/runtime acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_approved_reader_hint_patch === true, 'must not claim approved patch');
expect(data.outputs?.candidate_patch_file === null, 'candidate_patch_file must be null');
expect(data.outputs?.public_hud_output === null, 'public_hud_output must be null');
expect(data.outputs?.route_jsonl === null, 'route_jsonl must be null');

expect(data.summary?.status === 'warn_candidate_patch_preview_not_approved', 'unexpected summary status');
expect(data.summary?.candidate_preview_rows === 31, 'expected 31 preview rows');
expect(data.summary?.candidate_preview_occurrences === 1202, 'expected 1202 preview occurrences');
expect(data.summary?.prefix_contract_rows === 12, 'expected 12 prefix rows');
expect(data.summary?.prefix_contract_occurrences === 178, 'expected 178 prefix occurrences');
expect(data.summary?.project_preferred_rows === 19, 'expected 19 project-preferred rows');
expect(data.summary?.project_preferred_occurrences === 1024, 'expected 1024 project-preferred occurrences');
expect(data.summary?.approved_patch_rows === 0, 'approved patch rows must be 0');
expect(data.summary?.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(data.summary?.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(data.summary?.route_jsonl_rows_emitted === 0, 'route JSONL rows emitted must be 0');
expect(data.summary?.match_percent_available_rows === 0, 'match percent rows must be 0');
expect(data.summary?.missing_linkage_rows_outside_preview === 13, 'expected 13 missing-linkage rows outside preview');
expect(data.summary?.missing_linkage_occurrences_outside_preview === 129, 'expected 129 missing-linkage occurrences outside preview');
expect(data.summary?.live_old_hud_exposure === 'no', 'live old HUD exposure must be no');
expect(data.summary?.live_guard_status === 'warn_live_public_old_hud_guard', 'unexpected live guard status');
expect(data.summary?.issues === 0, 'preview issues must be 0');
expect(data.summary?.warnings === 1, 'preview warnings must be 1');
expect(Array.isArray(data.warnings) && data.warnings.length === 1, 'warnings list must contain exactly 1 warning');

expectMustNotAccept('Agent 6 acceptance');
expectMustNotAccept('QA acceptance');
expectMustNotAccept('Source custody');
expectMustNotAccept('Definition authority');
expectMustNotAccept('Usage-as-definition authority');
expectMustNotAccept('Accepted translation text');
expectMustNotAccept('Public HUD mutation');
expectMustNotAccept('Publication readiness');
expectMustNotAccept('approved reader-hint patch');

const tokenIds = new Set();
for (const row of data.preview_rows || []) {
  expect(row.preview_status === 'candidate_hint_patch_preview_not_approved', `${row.queue_id} unexpected preview status`);
  expect(!tokenIds.has(row.token_id), `${row.queue_id} duplicate token id ${row.token_id}`);
  tokenIds.add(row.token_id);
  expect(Boolean(row.reader_hint_candidate?.display), `${row.queue_id} missing display`);
  const isProjectPreferred = row.selection_basis === 'project_lexical_preference_among_competing_stem_edges';
  const expectedLabel = isProjectPreferred ? 'project-preferred counterpart candidate' : 'counterpart candidate';
  expect(row.reader_hint_candidate?.label === expectedLabel, `${row.queue_id} reader hint label must be ${expectedLabel}`);
  expect(row.reader_hint_candidate?.label_status === 'candidate_not_approved', `${row.queue_id} label status must be candidate_not_approved`);
  expect(row.reader_hint_candidate?.match_percent === null, `${row.queue_id} match percent must be null`);
  if (isProjectPreferred) {
    expect(Array.isArray(row.competing_edges) && row.competing_edges.length > 0, `${row.queue_id} must preserve competing edges`);
    for (const [index, edge] of (row.competing_edges || []).entries()) {
      expect(Boolean(edge.relation), `${row.queue_id} competing edge ${index} missing relation`);
      expect(Boolean(edge.upstream_claim_file), `${row.queue_id} competing edge ${index} missing upstream claim file`);
    }
  }
  expect(row.public_emit_ready === false, `${row.queue_id} public_emit_ready must be false`);
  expect(row.approved_for_patch === false, `${row.queue_id} approved_for_patch must be false`);
  expect(row.answer_eligible === false, `${row.queue_id} answer_eligible must be false`);
  expect(row.promote_to_answer === false, `${row.queue_id} promote_to_answer must be false`);
  expect(row.would_modify_public_hud === false, `${row.queue_id} would_modify_public_hud must be false`);
}

if (issues.length) {
  console.error(`Agent 2 Orot counterpart hint patch preview validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot counterpart hint patch preview validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectMustNotAccept(fragment) {
  const entries = data.what_must_not_be_accepted;
  const found = Array.isArray(entries)
    && entries.some((entry) => String(entry).toLowerCase().includes(fragment.toLowerCase()));
  expect(found, `what_must_not_be_accepted must include ${fragment}`);
}
