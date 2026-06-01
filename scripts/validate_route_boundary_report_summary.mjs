#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = process.argv[2] || 'reports/route-publication-boundary-audit.json';
const markdownPath = 'reports/route-boundary-report-summary-validation.md';
const jsonPath = 'reports/route-boundary-report-summary-validation.json';
const inputFreezeDriftPath = 'reports/hud-route-input-freeze-drift.md';

const ZERO_COUNT_FIELDS = [
  'invalid_manifest_shard_paths',
  'duplicate_manifest_shard_paths',
  'duplicate_manifest_shard_ids',
  'shard_identity_mismatches',
  'shard_count_field_mismatches',
  'duplicate_card_ids',
  'normalized_lookup_key_mismatches',
  'invalid_route_card_string_fields',
  'invalid_route_score_fields',
  'invalid_route_score_formulas',
  'route_cards_missing_source_rows',
  'route_cards_with_duplicate_source_ids',
  'answer_eligible_cards_missing_answer_score',
  'answer_role_answer_noneligible_cards',
  'invalid_form_reference_cards',
  'invalid_form_reference_tag_entries',
  'source_row_duplicate_source_ids',
  'invalid_source_row_string_fields',
  'invalid_source_row_fields_used_entries',
  'forbidden_fields_used_entries',
  'invalid_source_family_values',
  'invalid_reference_url_fields',
  'forbidden_source_row_notes',
  'invalid_source_url_compatibility',
  'invalid_license_url_compatibility',
  'hud_unsafe_source_rows',
  'route_cards_with_publication_fields',
  'issue_count',
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readTextIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFile(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '/');
}

function parseInputFreezeDrift(relativePath) {
  const text = readTextIfExists(relativePath);
  if (!text) {
    return {
      path: relativePath,
      status: 'missing',
      drift_count: 0,
      drift: [],
    };
  }

  const statusMatch = text.match(/^Status:\s*(.+)$/m);
  const status = statusMatch ? statusMatch[1].trim() : 'unknown';
  const drift = [];
  let inDriftSection = false;

  for (const line of text.split(/\r?\n/)) {
    if (line === '## Drift') {
      inDriftSection = true;
      continue;
    }
    if (inDriftSection && line.startsWith('## ')) break;
    if (!inDriftSection || !line.startsWith('- ')) continue;

    const item = line.slice(2).trim();
    if (item && item !== 'None') drift.push(item);
  }

  return {
    path: relativePath,
    status,
    drift_count: drift.length,
    drift,
  };
}

function validate() {
  const audit = readJson(inputPath);
  const counts = audit.counts || {};
  const inputFreezeDrift = parseInputFreezeDrift(inputFreezeDriftPath);
  const issues = [];
  const warnings = [];

  if (audit.artifact_type !== 'route_publication_boundary_audit') {
    issues.push(`unexpected artifact_type: ${audit.artifact_type || 'missing'}`);
  }
  if (!String(audit.policy || '').includes('not publication readiness')) {
    issues.push('policy text does not explicitly preserve the not-publication-readiness boundary');
  }
  if (!String(audit.policy || '').includes('source/license rows')) {
    issues.push('policy text does not explicitly require source/license rows');
  }
  for (const field of ZERO_COUNT_FIELDS) {
    if (Number(counts[field] || 0) !== 0) issues.push(`${field} is ${counts[field]}, expected 0`);
  }
  if (Number(counts.cards || 0) <= 0) issues.push('cards count is zero or missing');
  if (Number(counts.shards || 0) <= 0) issues.push('shards count is zero or missing');
  if (Number(counts.tokens || 0) <= 0) issues.push('tokens count is zero or missing');
  if (Number(counts.route_cards_with_source_rows) !== Number(counts.cards)) {
    issues.push('not every route card has source rows');
  }
  if (Number(counts.answer_eligible_cards_with_source_rows) !== Number(counts.answer_eligible_cards)) {
    issues.push('not every answer-eligible card has source rows');
  }
  if (Number(counts.answer_eligible_cards_with_answer_score) !== Number(counts.answer_eligible_cards)) {
    issues.push('not every answer-eligible card has numeric answer score');
  }
  if (Number(counts.warning_count || 0) <= 0) {
    warnings.push('warning_count is zero; expected route publication-boundary warnings to remain visible');
  }
  if (Number(counts.translation_output_unsafe_cards || 0) <= 0) {
    warnings.push('translation_output_unsafe_cards is zero; check whether warning accounting changed');
  }
  if (Number(counts.answer_eligible_translation_output_unsafe_cards || 0) <= 0) {
    warnings.push('answer_eligible_translation_output_unsafe_cards is zero; check whether warning accounting changed');
  }
  if (Number(counts.warning_count) !== Number(counts.translation_output_unsafe_cards)) {
    warnings.push('warning_count differs from translation_output_unsafe_cards; verify warning semantics before Agent 6 review');
  }
  if ((audit.issues || []).length !== 0) {
    issues.push(`issues array contains ${(audit.issues || []).length} sampled issue(s)`);
  }
  if ((audit.warnings || []).length === 0 && Number(counts.warning_count || 0) > 0) {
    warnings.push('warning_count is nonzero but sampled warnings array is empty');
  }
  if (inputFreezeDrift.status === 'missing') {
    warnings.push('route input freeze drift report is missing; current route input reconciliation is unverified');
  } else if (inputFreezeDrift.status === 'unknown') {
    warnings.push('route input freeze drift report has no parseable status; current route input reconciliation is unverified');
  } else if (inputFreezeDrift.status === 'drift') {
    warnings.push('current route input cache differs from frozen release inputs; do not claim current route inputs are public-release reconciled');
  } else if (inputFreezeDrift.status !== 'pass') {
    issues.push(`route input freeze drift status is ${inputFreezeDrift.status}, expected pass or drift`);
  }
  if (inputFreezeDrift.status === 'drift' && inputFreezeDrift.drift_count <= 0) {
    warnings.push('route input freeze drift status is drift, but no drift items were parsed');
  }

  const result = {
    generated_at: new Date().toISOString(),
    artifact_type: 'route_boundary_report_summary_validation',
    input: inputPath,
    release_scope: inputFreezeDrift.status === 'pass'
      ? 'frozen_public_lookup_and_current_route_inputs_match'
      : 'frozen_public_lookup_passes_current_route_inputs_unreconciled',
    input_freeze_drift: inputFreezeDrift,
    verdict: issues.length ? 'fail' : (warnings.length ? 'pass_with_warnings' : 'pass'),
    counts: {
      shards: counts.shards || 0,
      tokens: counts.tokens || 0,
      cards: counts.cards || 0,
      answer_eligible_cards: counts.answer_eligible_cards || 0,
      route_cards_missing_source_rows: counts.route_cards_missing_source_rows || 0,
      answer_eligible_cards_missing_answer_score: counts.answer_eligible_cards_missing_answer_score || 0,
      route_cards_with_publication_fields: counts.route_cards_with_publication_fields || 0,
      issue_count: counts.issue_count || 0,
      warning_count: counts.warning_count || 0,
      translation_output_unsafe_cards: counts.translation_output_unsafe_cards || 0,
      answer_eligible_translation_output_unsafe_cards: counts.answer_eligible_translation_output_unsafe_cards || 0,
    },
    issues,
    warnings,
  };

  const markdown = [
    '# Route Boundary Report Summary Validation',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Verdict: ${result.verdict}`,
    '',
    `Input: ${inputPath}`,
    '',
    '## Summary',
    '',
    `- Shards: ${result.counts.shards}`,
    `- Tokens: ${result.counts.tokens}`,
    `- Cards: ${result.counts.cards}`,
    `- Answer-eligible cards: ${result.counts.answer_eligible_cards}`,
    `- Route cards missing source rows: ${result.counts.route_cards_missing_source_rows}`,
    `- Answer-eligible cards missing answer score: ${result.counts.answer_eligible_cards_missing_answer_score}`,
    `- Cards with publication-readiness fields: ${result.counts.route_cards_with_publication_fields}`,
    `- Issues: ${result.counts.issue_count}`,
    `- Warnings preserved: ${result.counts.warning_count}`,
    `- Translation-output unsafe cards flagged: ${result.counts.translation_output_unsafe_cards}`,
    `- Answer-eligible translation-output unsafe cards flagged: ${result.counts.answer_eligible_translation_output_unsafe_cards}`,
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${mdCell(issue)}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((warning) => `- ${mdCell(warning)}`) : ['- none']),
    '',
    '## Route Input Freeze Drift',
    '',
    `- Report: ${inputFreezeDrift.path}`,
    `- Status: ${inputFreezeDrift.status}`,
    `- Drift items: ${inputFreezeDrift.drift_count}`,
    ...(inputFreezeDrift.drift.length ? inputFreezeDrift.drift.map((item) => `- ${mdCell(item)}`) : ['- none']),
    '',
    '## Boundary',
    '',
    '- This validates the already-produced route publication-boundary audit summary only; it does not rescan route shards.',
    '- A pass means the report preserves the intended split: route cards are HUD/workbench evidence, not publication support.',
    '- This pass does not prove current `.local-cache/definition-routes` inputs are reconciled while the input freeze drift status is not `pass`.',
    '- The warning count is expected and must remain visible downstream.',
    '- Publication remains blocked_no_render.',
    '',
  ].join('\n');

  writeFile(markdownPath, `${markdown.trimEnd()}\n`);
  writeFile(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const result = validate();
if (result.issues.length) {
  console.error(`Route boundary report summary validation failed with ${result.issues.length} issue(s). Report: ${markdownPath}`);
  process.exit(1);
}
console.log(`Route boundary report summary validation ${result.verdict}: ${markdownPath}`);
