import fs from 'node:fs';

const OUT_JSON = 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json';
const OUT_MD = 'reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.md';
const AGENT6_JSON = 'reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.json';
const AGENT1_JSON = 'reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json';
const AGENT2_DRY_RUN_JSON = 'reports/agent2-orot-reader-hint-candidate-patch-dry-run-2026-06-03.json';
const AGENT2_PATCH_JSON = 'reports/agent2-orot-reader-hint-candidate-patch-2026-06-03.json';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function sum(rows, key = 'occurrences') {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function countsBy(rows, key) {
  const counts = {};
  for (const row of rows) {
    const value = row[key];
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function occurrencesBy(rows, key) {
  const counts = {};
  for (const row of rows) {
    const value = row[key];
    counts[value] = (counts[value] || 0) + Number(row.occurrences || 0);
  }
  return counts;
}

function setEq(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function assertFalseFlags(row, label) {
  for (const key of [
    'approved_for_public_emit',
    'public_emit_ready',
    'answer_eligible',
    'promote_to_answer',
    'would_modify_public_hud'
  ]) {
    assert(row[key] === false, `${label} ${row.token_id} has ${key} !== false`);
  }
  assert(
    row.future_write_if_later_approved &&
      row.future_write_if_later_approved.allowed_now === false,
    `${label} ${row.token_id} future write allowed_now must be false`
  );
}

const out = readJson(OUT_JSON);
const agent6 = readJson(AGENT6_JSON);
const agent1 = readJson(AGENT1_JSON);
const dryRun = readJson(AGENT2_DRY_RUN_JSON);
const patch = readJson(AGENT2_PATCH_JSON);
const markdown = fs.readFileSync(OUT_MD, 'utf8');

assert(out.artifact_type === 'agent2_orot_allowed_row_reader_hint_package_dry_run', 'unexpected artifact_type');
assert(out.status === 'zero_or_safe_non_public_allowed_row_package_dry_run_produced', 'unexpected status');
assert(Array.isArray(out.package_rows), 'package_rows must be an array');
assert(Array.isArray(out.excluded_rows), 'excluded_rows must be an array');

const patchRows = patch.candidate_patch_rows || [];
assert(patchRows.length === 31, 'input candidate patch must contain 31 rows');
assert(sum(patchRows) === 1202, 'input candidate patch must total 1202 occurrences');
assert(dryRun.dry_run_scope.rows === 31, 'dry-run input rows must be 31');
assert(dryRun.dry_run_scope.occurrences === 1202, 'dry-run input occurrences must be 1202');

const agent1Allowed = agent1.row_statuses.filter((row) => row.status === 'allowed');
const agent1Excluded = agent1.row_statuses.filter((row) => row.status !== 'allowed');
const expectedAllowedIds = new Set(agent1Allowed.map((row) => row.token_id));
const expectedExcludedIds = new Set(agent1Excluded.map((row) => row.token_id));
const packageIds = new Set(out.package_rows.map((row) => row.token_id));
const excludedIds = new Set(out.excluded_rows.map((row) => row.token_id));

assert(agent1Allowed.length === 20, 'Agent 1 allowed row count must be 20');
assert(sum(agent1Allowed) === 1033, 'Agent 1 allowed occurrence count must be 1033');
assert(agent1Excluded.length === 11, 'Agent 1 excluded row count must be 11');
assert(sum(agent1Excluded) === 169, 'Agent 1 excluded occurrence count must be 169');
assert(setEq(packageIds, expectedAllowedIds), 'package_rows token ids do not match Agent 1 allowed rows');
assert(setEq(excludedIds, expectedExcludedIds), 'excluded_rows token ids do not match Agent 1 excluded rows');

assert(out.package_rows.length === 20, 'package_rows length must be 20');
assert(sum(out.package_rows) === 1033, 'package_rows occurrences must total 1033');
assert(out.excluded_rows.length === 11, 'excluded_rows length must be 11');
assert(sum(out.excluded_rows) === 169, 'excluded_rows occurrences must total 169');
assert(out.dry_run_scope.included_allowed_rows === 20, 'scope included rows must be 20');
assert(out.dry_run_scope.included_allowed_occurrences === 1033, 'scope included occurrences must be 1033');
assert(out.dry_run_scope.excluded_rows === 11, 'scope excluded rows must be 11');
assert(out.dry_run_scope.excluded_occurrences === 169, 'scope excluded occurrences must be 169');
assert(agent6.agent2_next_zero_or_safe_package_step.allowed_selected_rows === 20, 'Agent 6 allowed rows must be 20');
assert(agent6.agent2_next_zero_or_safe_package_step.allowed_selected_occurrences === 1033, 'Agent 6 allowed occurrences must be 1033');

const excludedStatusCounts = countsBy(out.excluded_rows, 'agent1_status');
const excludedOccurrenceCounts = occurrencesBy(out.excluded_rows, 'agent1_status');
assert(excludedStatusCounts.external_link_only === 10, 'external_link_only excluded rows must be 10');
assert(excludedOccurrenceCounts.external_link_only === 145, 'external_link_only excluded occurrences must be 145');
assert(excludedStatusCounts.metadata_only === 1, 'metadata_only excluded rows must be 1');
assert(excludedOccurrenceCounts.metadata_only === 24, 'metadata_only excluded occurrences must be 24');

const allowedLabels = new Set(['counterpart candidate', 'project-preferred counterpart candidate']);
const patchByToken = new Map(patchRows.map((row) => [row.target_token_id, row]));
const agent1ByToken = new Map(agent1.row_statuses.map((row) => [row.token_id, row]));

for (const row of out.package_rows) {
  const agent1Row = agent1ByToken.get(row.token_id);
  const patchRow = patchByToken.get(row.token_id);
  assert(agent1Row && patchRow, `missing input row for included ${row.token_id}`);
  assert(row.agent1_status === 'allowed', `included row ${row.token_id} must have allowed status`);
  assert(row.row_package_status === 'included_allowed_selected_row_non_public_candidate_package', `included row ${row.token_id} has wrong package status`);
  assert(row.occurrences === patchRow.occurrences, `included row ${row.token_id} occurrence mismatch`);
  assert(row.label === patchRow.candidate_counterpart.label, `included row ${row.token_id} label mismatch`);
  assert(allowedLabels.has(row.label), `included row ${row.token_id} has forbidden label`);
  assert(row.label_status === 'candidate_not_approved', `included row ${row.token_id} label_status must remain candidate_not_approved`);
  assert(row.match_percent === null, `included row ${row.token_id} match_percent must be null`);
  assert(row.candidate_counterpart.display === patchRow.candidate_counterpart.display, `included row ${row.token_id} candidate display mismatch`);
  assert(row.candidate_counterpart.display_included === true, `included row ${row.token_id} display must be included`);
  assert(row.storage_allowed_in_this_non_public_package === true, `included row ${row.token_id} storage flag must be true`);
  assert(row.display_allowed_in_this_non_public_package === true, `included row ${row.token_id} display flag must be true`);
  assertFalseFlags(row, 'included');
  assert(Array.isArray(row.selected_source_row_statuses) && row.selected_source_row_statuses.length > 0, `included row ${row.token_id} missing selected source statuses`);
  for (const sourceStatus of row.selected_source_row_statuses) {
    assert(sourceStatus.status === 'allowed', `included row ${row.token_id} selected source ${sourceStatus.source_row} is not allowed`);
    assert(sourceStatus.storage_allowed === true, `included row ${row.token_id} selected source ${sourceStatus.source_row} storage not allowed`);
    assert(sourceStatus.display_allowed === true, `included row ${row.token_id} selected source ${sourceStatus.source_row} display not allowed`);
  }
  for (const edge of row.competing_edges || []) {
    assert(edge.promote_to_answer === false, `included row ${row.token_id} competing edge promotes to answer`);
    const sourceStatuses = edge.upstream_source_row_statuses || [];
    const allAllowed = sourceStatuses.length > 0 && sourceStatuses.every((status) => status.status === 'allowed' && status.storage_allowed && status.display_allowed);
    if (!allAllowed) {
      assert(edge.counterpart_candidate_display === null, `included row ${row.token_id} competing edge text must be redacted unless all source rows are allowed`);
      assert(edge.counterpart_candidate_display_included === false, `included row ${row.token_id} competing edge display flag must be false`);
    }
  }
}

for (const row of out.excluded_rows) {
  const patchRow = patchByToken.get(row.token_id);
  assert(patchRow, `missing input row for excluded ${row.token_id}`);
  assert(row.agent1_status === 'external_link_only' || row.agent1_status === 'metadata_only', `excluded row ${row.token_id} has unexpected status`);
  assert(row.row_package_status === 'excluded_from_allowed_row_candidate_text_package', `excluded row ${row.token_id} has wrong package status`);
  assert(allowedLabels.has(row.label), `excluded row ${row.token_id} has forbidden label`);
  assert(row.label_status === 'candidate_not_approved', `excluded row ${row.token_id} label_status must remain candidate_not_approved`);
  assert(row.match_percent === null, `excluded row ${row.token_id} match_percent must be null`);
  assert(row.candidate_counterpart.display === null, `excluded row ${row.token_id} must not store candidate display text`);
  assert(row.candidate_counterpart.display_included === false, `excluded row ${row.token_id} display flag must be false`);
  assert(row.storage_allowed_in_this_non_public_package === false, `excluded row ${row.token_id} storage flag must be false`);
  assert(row.display_allowed_in_this_non_public_package === false, `excluded row ${row.token_id} display flag must be false`);
  assert(typeof row.exclusion_reason === 'string' && row.exclusion_reason.length > 0, `excluded row ${row.token_id} missing exclusion reason`);
  assertFalseFlags(row, 'excluded');
  for (const sourceStatus of row.selected_source_row_statuses || []) {
    assert(sourceStatus.status !== 'allowed', `excluded row ${row.token_id} selected source ${sourceStatus.source_row} should not be allowed`);
  }
}

for (const [key, expected] of Object.entries({
  answer_rows_emitted: 0,
  source_rows_emitted: 0,
  public_hud_rows_emitted: 0,
  route_jsonl_rows_emitted: 0,
  answer_eligible_true: 0,
  promote_to_answer_true: 0,
  approved_for_public_emit_true: 0,
  public_emit_ready_true: 0,
  would_modify_public_hud_true: 0,
  would_write_allowed_now_true: 0,
  match_percent_available_rows: 0
})) {
  assert(out.flags[key] === expected, `flags.${key} must be ${expected}`);
}

for (const key of [
  'runtime_files_touched',
  'source_files_touched',
  'token_index_files_touched',
  'lexical_payload_files_touched'
]) {
  assert(Array.isArray(out.flags[key]) && out.flags[key].length === 0, `flags.${key} must be empty`);
}

assert(out.outputs.answer_rows_emitted === 0, 'outputs answer_rows_emitted must be zero');
assert(out.outputs.source_rows_emitted === 0, 'outputs source_rows_emitted must be zero');
assert(out.outputs.public_hud_rows_emitted === 0, 'outputs public_hud_rows_emitted must be zero');
assert(out.outputs.route_jsonl_rows_emitted === 0, 'outputs route_jsonl_rows_emitted must be zero');
assert(out.agent8_callback.agent6_follow_up_ready === true, 'Agent 8 callback must mark Agent 6 follow-up ready');
assert(out.agent8_callback.agent4_remains_held === true, 'Agent 8 callback must keep Agent 4 held');

for (const phrase of [
  '## Agent 8 Callback',
  'Included: 20 rows / 1033 occurrences.',
  'Excluded: 11 rows / 169 occurrences.',
  'Agent 4 remains held: yes',
  'No QA acceptance'
]) {
  assert(markdown.includes(phrase), `markdown missing required phrase: ${phrase}`);
}

console.log(`Agent 2 allowed-row reader-hint package dry-run validation passed for ${OUT_JSON}.`);
