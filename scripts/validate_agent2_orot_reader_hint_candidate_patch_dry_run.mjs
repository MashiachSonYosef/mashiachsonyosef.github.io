#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent2_orot_reader_hint_candidate_patch_dry_run', 'unexpected artifact_type');
expect(data.target_agent === 'Agent 2', 'unexpected target agent');
expectSafeExistingPath(data.source_decisions?.agent13_policy_decision, 'Agent 13 policy decision');
expectSafeExistingPath(data.source_decisions?.agent6_warn_boundary, 'Agent 6 WARN boundary');
expectSafeExistingPath(data.source_decisions?.agent6_warn_boundary_json, 'Agent 6 WARN boundary JSON');
expectSafeExistingPath(data.input_artifact, 'input artifact');
expectSafeExistingPath(data.companion_report, 'companion report');

const scope = data.dry_run_scope || {};
expect(scope.target_work === 'orot', 'target work must be Orot');
expect(scope.rows === 31, 'dry-run rows must be 31');
expect(scope.occurrences === 1202, 'dry-run occurrences must be 1202');
expect(scope.prefix_stem_rows === 12, 'prefix/stem rows must be 12');
expect(scope.prefix_stem_occurrences === 178, 'prefix/stem occurrences must be 178');
expect(scope.project_preferred_rows === 19, 'project-preferred rows must be 19');
expect(scope.project_preferred_occurrences === 1024, 'project-preferred occurrences must be 1024');

expect(data.zero_or_safe_result?.status === 'zero_or_safe_non_public_dry_run_confirmed', 'dry-run status mismatch');
expect(data.zero_or_safe_result?.blocker_count === 0, 'dry-run blocker count must be 0');
expect(Array.isArray(data.zero_or_safe_result?.blockers) && data.zero_or_safe_result.blockers.length === 0, 'dry-run blockers must be empty');

const flags = data.flags || {};
for (const key of [
  'public_hud_rows_emitted',
  'route_jsonl_rows_emitted',
  'runtime_files_touched',
  'source_files_touched',
  'answer_eligible_true',
  'promote_to_answer_true',
  'approved_for_public_emit_true',
  'public_emit_ready_true',
  'would_modify_public_hud_true',
  'would_write_allowed_now_true',
]) {
  expect(flags[key] === 0, `${key} must be 0`);
}
expect(flags.public_hud_output === null, 'public_hud_output must be null');
expect(flags.route_jsonl === null, 'route_jsonl must be null');

const labels = data.labels || {};
expect(labels.label_counts?.['counterpart candidate'] === 12, 'counterpart candidate count must be 12');
expect(labels.label_counts?.['project-preferred counterpart candidate'] === 19, 'project-preferred counterpart candidate count must be 19');
expect(labels.label_status_counts?.candidate_not_approved === 31, 'all rows must remain candidate_not_approved');
expect(labels.forbidden_label_hits === 0, 'forbidden label hits must be 0');
for (const allowed of ['counterpart candidate', 'project-preferred counterpart candidate']) {
  expect(labels.allowed_labels?.includes(allowed), `missing allowed label: ${allowed}`);
}

expect(data.match_percent?.available_rows === 0, 'match percent available rows must be 0');
expect(data.match_percent?.null_rows === 31, 'match percent null rows must be 31');
expect(data.match_percent?.status_counts?.not_available_in_contract_inputs === 31, 'match-percent unavailable status count must be 31');

const edges = data.edges || {};
expect(edges.selected_edge_rows === 31, 'selected edge rows must be 31');
expect(edges.selected_source_rows === 31, 'selected source rows must be 31');
expect(edges.competing_edge_rows === 19, 'competing edge rows must be 19');
expect(edges.competing_edges_total === 46, 'competing edges total must be 46');
expect(edges.project_preferred_rows_with_competing_edges === 19, 'project-preferred competing-edge rows must be 19');
expect(edges.competing_edges_promote_to_answer_true === 0, 'competing edges promote_to_answer must be 0');

const recount = data.source_and_route_family_recount || {};
expect(recount.source_family_counts?.kaikki === 56, 'kaikki source count must be 56');
expect(recount.source_family_counts?.openscriptures === 2, 'openscriptures source count must be 2');
expect(recount.source_family_counts?.workspace === 19, 'workspace source count must be 19');
expect(recount.route_family_counts?.wiktionary_definition === 56, 'wiktionary route count must be 56');
expect(recount.route_family_counts?.openscriptures_definition === 2, 'openscriptures route count must be 2');
expect(recount.route_family_counts?.project_lexical === 19, 'project lexical route count must be 19');
expect(Array.isArray(recount.forbidden_jastrow_bdb_bdb_aramaic_or_sefaria_hits) && recount.forbidden_jastrow_bdb_bdb_aramaic_or_sefaria_hits.length === 0, 'Sefaria-family hits must be empty for this dry run');

for (const phrase of [
  'QA acceptance',
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'accepted gloss',
  'accepted text',
]) {
  expect(data.non_acceptance?.includes(phrase), `missing non-acceptance phrase: ${phrase}`);
}

expect(data.agent8_callback?.agent1_bounded_row_level_source_license_display_review_needed === true, 'Agent 1 review should be needed');
expect(Array.isArray(data.agent8_callback?.blockers) && data.agent8_callback.blockers.length === 0, 'Agent 8 callback blockers must be empty');

const markdownPath = report.replace(/\.json$/, '.md');
expect(fs.existsSync(path.join(root, markdownPath)), `matching markdown missing: ${markdownPath}`);
if (fs.existsSync(path.join(root, markdownPath))) {
  const markdown = fs.readFileSync(path.join(root, markdownPath), 'utf8');
  for (const needle of [
    'zero-or-safe non-public dry run',
    'Public HUD rows emitted: `0`',
    'Rows with `answer_eligible=true`: `0`',
    'Jastrow/BDB/BDB Aramaic/Sefaria-family hits in the dry-run packet: `0`',
    'Agent 8 Callback',
  ]) {
    expect(markdown.includes(needle), `markdown missing required phrase: ${needle}`);
  }
}

if (issues.length) {
  console.error(`Agent 2 Orot reader-hint candidate patch dry-run validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot reader-hint candidate patch dry-run validation passed for ${report}.`);

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
