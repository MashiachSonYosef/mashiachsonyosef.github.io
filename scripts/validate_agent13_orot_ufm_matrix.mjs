#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const matrixPath = process.argv[2] || 'reports/agent13-orot-ufm-matrix-2026-06-04.json';
const matrix = JSON.parse(fs.readFileSync(path.join(root, matrixPath), 'utf8'));
const issues = [];

expect(matrix.artifact_type === 'agent13_orot_user_facing_matrix', 'unexpected artifact_type');
expect(matrix.boundary?.status === 'ufm_non_public_planning_matrix_only', 'unexpected boundary status');
for (const flag of [
  'no_public_hud_output',
  'no_route_jsonl_rows',
  'no_route_shard_writes',
  'no_runtime_files',
  'no_public_mutation',
  'no_source_files',
  'no_definition_content_rows',
  'no_nc_definition_content_rows',
  'no_answer_eligibility',
  'no_accepted_text',
  'no_qa_acceptance',
  'no_source_acceptance',
  'no_license_acceptance',
  'no_definition_authority',
  'no_publication_readiness',
]) {
  expect(matrix.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

const packagePath = matrix.package_path;
expect(packagePath === 'data/build/orot/reader-hint-placeholder-candidates.json', 'unexpected package_path');
const pkg = JSON.parse(fs.readFileSync(path.join(root, packagePath), 'utf8'));
const packageRows = pkg.rows || [];
const rows = matrix.rows || [];
expect(matrix.package_sha256 === sha256(packagePath), 'package sha256 mismatch');
expect(matrix.counts?.rows === rows.length, 'matrix row count mismatch');
expect(matrix.counts?.rows === packageRows.length, 'matrix rows must match package rows');
expect(matrix.counts?.occurrences === sum(rows.map((row) => row.occurrence_count)), 'matrix occurrence count mismatch');
expect(matrix.counts?.occurrences === pkg.counts?.placeholder_occurrences, 'matrix occurrences must match package placeholder occurrences');
expect(matrix.counts?.answer_rows === 0, 'answer_rows must be 0');
expect(matrix.counts?.public_hud_rows === 0, 'public_hud_rows must be 0');
expect(matrix.counts?.route_jsonl_rows === 0, 'route_jsonl_rows must be 0');
expect(matrix.counts?.definition_content_rows === 0, 'definition_content_rows must be 0');
expect(matrix.counts?.nc_definition_content_rows === 0, 'nc_definition_content_rows must be 0');

const byToken = new Map(packageRows.map((row) => [row.token_id, row]));
const allowedLabels = new Set(['counterpart candidate', 'project-preferred counterpart candidate']);
const allowedStatuses = new Set([
  'pending_review_counterpart_placeholder',
  'pending_review_nc_educational_placeholder',
  'tbd_display_separator_only',
]);
for (const row of rows) {
  const source = byToken.get(row.token_id);
  expect(Boolean(source), `${row.token_id} missing package source row`);
  if (!source) continue;
  expect(row.hebrew_surface === source.surface, `${row.token_id} surface mismatch`);
  expect(row.occurrence_count === Number(source.occurrences || 0), `${row.token_id} occurrence mismatch`);
  expect(row.current_inline_english_display === 'TBD', `${row.token_id} inline display must remain TBD`);
  expect(allowedLabels.has(row.label), `${row.token_id} invalid label`);
  expect(allowedStatuses.has(row.display_status), `${row.token_id} invalid display_status`);
  expect(row.public_emit_status === 'blocked_non_public_planning_only', `${row.token_id} invalid public_emit_status`);
  expect(!/accepted|definition authority|publication readiness/i.test(row.public_emit_status), `${row.token_id} public_emit_status overclaims`);
}

const text = fs.readFileSync(path.join(root, matrixPath), 'utf8');
for (const forbidden of [
  '"public_emit_status": "accepted"',
  '"public_emit_status": "public"',
  '"display_status": "definition"',
  '"display_status": "accepted gloss"',
  '"display_status": "translation"',
  '"label": "definition"',
  '"label": "answer"',
  '"label": "translation"',
  '"label": "accepted gloss"',
]) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error(`Agent 13 Orot UFM matrix validation failed for ${matrixPath}:`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 13 Orot UFM matrix validation passed for ${matrixPath}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function sha256(relPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relPath))).digest('hex');
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
