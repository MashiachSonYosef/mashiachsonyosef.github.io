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
  const publicationBoundary = parseInputFreezePublicationBoundary(text);
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
    publication_boundary: publicationBoundary,
  };
}

function parseInputFreezePublicationBoundary(text) {
  const boundary = {};
  let inBoundarySection = false;

  for (const line of text.split(/\r?\n/)) {
    if (line === '## Boundary') {
      inBoundarySection = true;
      continue;
    }
    if (inBoundarySection && line.startsWith('## ')) break;
    if (!inBoundarySection || !line.startsWith('- ')) continue;

    const [label, ...rest] = line.slice(2).split(':');
    const key = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const value = rest.join(':').trim();
    if (!key) continue;
    if (['validates', 'does_not_clear'].includes(key)) {
      boundary[key] = value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
    } else if (['warning_status_blocks_publication_claim', 'current_route_inputs_reconciled', 'route_data_regenerated', 'source_imports_changed', 'public_lookup_artifacts_changed'].includes(key)) {
      boundary[key] = value === 'true';
    } else {
      boundary[key] = value;
    }
  }

  return Object.keys(boundary).length ? boundary : null;
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
  validateInputPublicationBoundary(audit.publication_boundary, issues);
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
  validateInputFreezePublicationBoundary(inputFreezeDrift, issues);

  const publicationBoundary = {
    publication_status: 'blocked_no_render',
    validates: [
      'route_publication_boundary_audit_summary',
      'route_card_publication_boundary',
    ],
    does_not_clear: [
      'translation_output',
      'source_publication',
      'public_lexical_export_reuse',
      'accepted_definition_authority',
    ],
    answer_eligible_scope: 'hud_answer_slot_only_not_translation_or_publication_readiness',
    warning_status_blocks_publication_claim: true,
    current_route_inputs_reconciled: inputFreezeDrift.status === 'pass',
  };
  validatePublicationBoundary(publicationBoundary, inputFreezeDrift, counts, issues);

  const result = {
    generated_at: new Date().toISOString(),
    artifact_type: 'route_boundary_report_summary_validation',
    input: inputPath,
    release_scope: inputFreezeDrift.status === 'pass'
      ? 'frozen_public_lookup_and_current_route_inputs_match'
      : 'frozen_public_lookup_passes_current_route_inputs_unreconciled',
    publication_boundary: publicationBoundary,
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
    `- Input-freeze publication status: ${inputFreezeDrift.publication_boundary?.publication_status || 'missing'}`,
    `- Input-freeze current route inputs reconciled: ${inputFreezeDrift.publication_boundary?.current_route_inputs_reconciled}`,
    `- Input-freeze public lookup artifacts changed: ${inputFreezeDrift.publication_boundary?.public_lookup_artifacts_changed}`,
    '',
    '## Publication Boundary',
    '',
    `- Publication status: ${publicationBoundary.publication_status}`,
    `- Validates: ${publicationBoundary.validates.join(', ')}`,
    `- Does not clear: ${publicationBoundary.does_not_clear.join(', ')}`,
    `- Answer eligibility scope: ${publicationBoundary.answer_eligible_scope}`,
    `- Warning status blocks publication claim: ${publicationBoundary.warning_status_blocks_publication_claim}`,
    `- Current route inputs reconciled: ${publicationBoundary.current_route_inputs_reconciled}`,
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

function validateInputFreezePublicationBoundary(inputFreezeDrift, issues) {
  if (inputFreezeDrift.status === 'missing') return;
  const boundary = inputFreezeDrift.publication_boundary;
  if (!boundary || typeof boundary !== 'object') {
    issues.push('route input freeze drift report publication boundary is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push('route input freeze drift publication_boundary.publication_status must be blocked_no_render');
  }
  for (const item of ['hud_route_input_freeze_drift', 'frozen_route_input_cache_comparison']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      issues.push(`route input freeze drift publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of [
    'translation_output',
    'source_publication',
    'public_lexical_export_reuse',
    'accepted_definition_authority',
    'public_lookup_publication',
    'route_publication_readiness',
  ]) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      issues.push(`route input freeze drift publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.route_input_scope || '').includes('not_publication_readiness')) {
    issues.push('route input freeze drift publication_boundary.route_input_scope must block publication readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('route input freeze drift publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (inputFreezeDrift.status !== 'pass' && boundary.current_route_inputs_reconciled !== false) {
    issues.push('route input freeze drift publication_boundary.current_route_inputs_reconciled must be false unless status is pass');
  }
  for (const field of ['route_data_regenerated', 'source_imports_changed', 'public_lookup_artifacts_changed']) {
    if (boundary[field] !== false) issues.push(`route input freeze drift publication_boundary.${field} must be false`);
  }
}

function validatePublicationBoundary(boundary, inputFreezeDrift, counts, issues) {
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push('publication_boundary.publication_status must be blocked_no_render');
  }
  for (const item of ['route_publication_boundary_audit_summary', 'route_card_publication_boundary']) {
    if (!boundary.validates.includes(item)) issues.push(`publication_boundary.validates missing ${item}`);
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!boundary.does_not_clear.includes(item)) issues.push(`publication_boundary.does_not_clear missing ${item}`);
  }
  if (!boundary.answer_eligible_scope.includes('not_translation_or_publication_readiness')) {
    issues.push('publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (Number(counts.warning_count || 0) > 0 && boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('publication_boundary.warning_status_blocks_publication_claim must be true when warnings remain visible');
  }
  if (inputFreezeDrift.status !== 'pass' && boundary.current_route_inputs_reconciled !== false) {
    issues.push('publication_boundary.current_route_inputs_reconciled must be false unless route input freeze drift is pass');
  }
}

function validateInputPublicationBoundary(boundary, issues) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push('input audit publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push('input audit publication_boundary.publication_status must be blocked_no_render');
  }
  for (const item of ['route_publication_boundary_audit', 'route_card_publication_boundary', 'public_hud_route_lookup_publication_boundary']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      issues.push(`input audit publication_boundary.validates missing ${item}`);
    }
  }
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
      issues.push(`input audit publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
    issues.push('input audit publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('input audit publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (boundary.current_route_inputs_reconciled !== 'not_checked_by_route_publication_boundary_audit') {
    issues.push('input audit publication_boundary.current_route_inputs_reconciled must be not_checked_by_route_publication_boundary_audit');
  }
}

const result = validate();
if (result.issues.length) {
  console.error(`Route boundary report summary validation failed with ${result.issues.length} issue(s). Report: ${markdownPath}`);
  process.exit(1);
}
console.log(`Route boundary report summary validation ${result.verdict}: ${markdownPath}`);
