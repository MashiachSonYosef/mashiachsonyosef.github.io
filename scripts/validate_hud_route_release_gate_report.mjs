#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  gateJson: 'reports/hud-route-release-gate.json',
  gateReport: 'reports/hud-route-release-gate.md',
  output: 'reports/hud-route-release-gate-validation.json',
  report: 'reports/hud-route-release-gate-validation.md',
};

const options = parseArgs(process.argv.slice(2));
const gate = readJson(options.gateJson);
const markdown = readText(options.gateReport);
const issues = [];
const warnings = [];

const allowedStatuses = new Set(['pass', 'pass_with_warnings', 'fail']);
const allowedDriftStatuses = new Set(['pass', 'drift', 'missing', 'unknown']);
const zeroBoundaryFields = [
  'issues',
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
  'invalid_source_row_string_fields',
  'source_row_duplicate_source_ids',
  'invalid_source_row_fields_used_entries',
  'forbidden_fields_used_entries',
  'invalid_source_family_values',
  'forbidden_source_row_notes',
  'invalid_reference_url_fields',
  'invalid_source_url_compatibility',
  'invalid_license_url_compatibility',
  'answer_eligible_cards_missing_answer_score',
  'answer_role_answer_noneligible_cards',
  'invalid_form_reference_cards',
  'invalid_form_reference_tag_entries',
];
const boundaryTextChecks = [
  {
    id: 'route_gate_only',
    text: 'This gate validates the HUD route release stamp, HUD route lookup integrity, and the route-card/publication boundary only.',
  },
  {
    id: 'not_translation_or_authority',
    text: 'It does not clear translation output, source publication, public lexical export reuse, or accepted definition authority.',
  },
  {
    id: 'warning_unreconciled',
    text: 'A warning status means current route-source reconciliation is not proven for the frozen public lookup release.',
  },
  {
    id: 'blocked_no_render',
    text: 'Publication remains blocked_no_render.',
  },
];

validateTopLevel();
validatePublicLookup();
validatePublicationBoundary();
validateBoundary();
validateFreezeDrift();
validateMarkdownBoundary();
propagateGateWarningState();

const result = {
  schema_version: 1,
  artifact_type: 'hud_route_release_gate_validation',
  generated_at: new Date().toISOString(),
  verdict: issues.length ? 'fail' : (warnings.length ? 'pass_with_warnings' : 'pass'),
  inputs: {
    gate_json: cleanPath(options.gateJson),
    gate_report: cleanPath(options.gateReport),
  },
  release_id: gate.release_id || '',
  gate_status: gate.status || '',
  release_scope: gate.release_scope || '',
  publication_boundary: gate.publication_boundary || {},
  input_freeze_publication_boundary: gate.route_input_freeze_drift?.publication_boundary || null,
  counts: {
    public_cards_written: numberAt(gate, 'public_cards_written'),
    public_distinct_normalized_tokens: numberAt(gate, 'public_distinct_normalized_tokens'),
    public_shard_count: numberAt(gate, 'public_shard_count'),
    boundary_issues: numberAt(gate.route_publication_boundary, 'issues'),
    boundary_warnings: numberAt(gate.route_publication_boundary, 'warnings'),
    route_cards_with_source_rows: numberAt(gate.route_publication_boundary, 'route_cards_with_source_rows'),
    route_cards_missing_source_rows: numberAt(gate.route_publication_boundary, 'route_cards_missing_source_rows'),
    answer_role_answer_cards: numberAt(gate.route_publication_boundary, 'answer_role_answer_cards'),
    answer_eligible_translation_output_unsafe_cards: numberAt(gate.route_publication_boundary, 'answer_eligible_translation_output_unsafe_cards'),
    answer_eligible_translation_output_unsafe_source_rows: numberAt(gate.route_publication_boundary, 'answer_eligible_translation_output_unsafe_source_rows'),
    translation_output_unsafe_cards: numberAt(gate.route_publication_boundary, 'translation_output_unsafe_cards'),
    gate_warnings: Array.isArray(gate.warnings) ? gate.warnings.length : 0,
    gate_issues: Array.isArray(gate.issues) ? gate.issues.length : 0,
    drift_items: numberAt(gate.route_input_freeze_drift, 'drift_count'),
  },
  boundary_assertions: {
    answer_eligible_not_publication_ready: true,
    source_license_rows_required: true,
    unsafe_translation_output_flags_visible: true,
    warning_status_blocks_publication_claim: true,
    publication_status: 'blocked_no_render',
  },
  issues,
  warnings,
};

writeJson(options.output, result);
writeMarkdown(options.report, result);

if (issues.length) {
  console.error(`HUD route release gate report validation failed with ${issues.length} issue(s). Report: ${options.report}`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`HUD route release gate report validation ${result.verdict}: ${options.report}`);
if (warnings.length) {
  for (const warning of warnings) console.log(`- ${warning}`);
}

function validateTopLevel() {
  if (gate.schema_version !== 1) issues.push('gate schema_version must be 1');
  if (gate.artifact_type !== 'hud_route_release_gate_report') {
    issues.push(`gate artifact_type must be hud_route_release_gate_report, got ${gate.artifact_type || 'missing'}`);
  }
  if (!allowedStatuses.has(gate.status)) issues.push(`gate status is invalid: ${gate.status || 'missing'}`);
  if (!Array.isArray(gate.issues)) issues.push('gate issues must be an array');
  if (!Array.isArray(gate.warnings)) issues.push('gate warnings must be an array');
  if ((gate.issues || []).length > 0 && gate.status !== 'fail') {
    issues.push('gate issues are present, but status is not fail');
  }
  if ((gate.issues || []).length === 0 && gate.status === 'fail') {
    issues.push('gate status is fail without sampled issues in the JSON report');
  }
  if ((gate.warnings || []).length > 0 && gate.status === 'pass') {
    issues.push('gate status is pass even though warnings are present');
  }
  if ((gate.warnings || []).length > 0 && !String(gate.release_scope || '').includes('unproven')) {
    issues.push('warning gate release_scope must state current route-source reconciliation is unproven');
  }
  if ((gate.warnings || []).length === 0 && gate.status === 'pass_with_warnings') {
    issues.push('gate status is pass_with_warnings but warnings array is empty');
  }
  if (!String(gate.release_scope || '').startsWith('public_lookup_integrity_passed_')) {
    issues.push('release_scope must be explicit about public lookup integrity only');
  }
}

function validatePublicLookup() {
  for (const field of ['public_cards_written', 'public_distinct_normalized_tokens', 'public_shard_count', 'checked_sample_tokens']) {
    if (numberAt(gate, field) <= 0) issues.push(`${field} must be a positive number`);
  }
  const manifest = gate.public_lookup_manifest || {};
  if (numberAt(manifest, 'shard_path_checks') !== numberAt(gate, 'public_shard_count')) {
    issues.push('public lookup manifest shard_path_checks must equal public_shard_count');
  }
  for (const field of ['invalid_shard_paths', 'duplicate_shard_paths', 'duplicate_shard_ids']) {
    if (numberAt(manifest, field) !== 0) issues.push(`public_lookup_manifest.${field} must be 0`);
  }
}

function validatePublicationBoundary() {
  const boundary = gate.publication_boundary || {};
  if (!boundary || typeof boundary !== 'object' || Array.isArray(boundary)) {
    issues.push('publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push(`publication_boundary.publication_status must be blocked_no_render, got ${boundary.publication_status || 'missing'}`);
  }
  if (!Array.isArray(boundary.validates)
    || !boundary.validates.includes('hud_route_release_stamp')
    || !boundary.validates.includes('hud_route_lookup_integrity')
    || !boundary.validates.includes('route_card_publication_boundary')) {
    issues.push('publication_boundary.validates must include HUD route release stamp, HUD route lookup integrity, and route-card publication boundary');
  }
  const doesNotClear = new Set(Array.isArray(boundary.does_not_clear) ? boundary.does_not_clear : []);
  for (const item of ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority']) {
    if (!doesNotClear.has(item)) issues.push(`publication_boundary.does_not_clear missing ${item}`);
  }
  if (boundary.answer_eligible_scope !== 'hud_answer_slot_only_not_translation_or_publication_readiness') {
    issues.push('publication_boundary.answer_eligible_scope must block translation/publication readiness overclaim');
  }
  if (gate.status === 'pass_with_warnings' && boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('publication_boundary.warning_status_blocks_publication_claim must be true for warning gate status');
  }
  if (gate.route_input_freeze_drift?.status !== 'pass' && boundary.current_route_sources_reconciled !== false) {
    issues.push('publication_boundary.current_route_sources_reconciled must be false when freeze drift is not pass');
  }
}

function validateBoundary() {
  const boundary = gate.route_publication_boundary || {};
  if (!boundary || typeof boundary !== 'object') issues.push('route_publication_boundary is required');
  for (const field of zeroBoundaryFields) {
    if (numberAt(boundary, field) !== 0) issues.push(`route_publication_boundary.${field} must be 0`);
  }
  if (numberAt(boundary, 'warnings') <= 0) {
    warnings.push('route_publication_boundary.warnings is 0; unsafe translation-output warning visibility may have changed');
  }
  if (numberAt(boundary, 'translation_output_unsafe_cards') <= 0) {
    warnings.push('translation_output_unsafe_cards is 0; this validator expects unsafe translation-output flags to remain visible');
  }
  if (numberAt(boundary, 'answer_eligible_translation_output_unsafe_cards') <= 0) {
    warnings.push('answer_eligible_translation_output_unsafe_cards is 0; answer-eligible unsafe flags are not visible');
  }
  if (numberAt(boundary, 'answer_eligible_translation_output_unsafe_source_rows') <= 0) {
    warnings.push('answer_eligible_translation_output_unsafe_source_rows is 0; answer-eligible unsafe source rows are not visible');
  }
  if (numberAt(boundary, 'route_cards_with_source_rows') !== numberAt(gate, 'public_cards_written')) {
    issues.push('route_cards_with_source_rows must equal public_cards_written');
  }
  if (numberAt(boundary, 'answer_eligible_cards_with_answer_score') !== numberAt(boundary, 'answer_role_answer_cards')) {
    issues.push('answer_eligible_cards_with_answer_score must equal answer_role_answer_cards');
  }
  if (numberAt(boundary, 'answer_eligible_cards_with_answer_score') <= 0) {
    issues.push('answer-eligible answer cards with scores must be present');
  }
  if (numberAt(boundary, 'route_cards_with_source_rows') <= 0) {
    issues.push('route cards with source rows must be present');
  }
  if (numberAt(boundary, 'source_row_string_fields_checked') <= 0) {
    issues.push('source row string fields must be checked');
  }
}

function validateFreezeDrift() {
  const drift = gate.route_input_freeze_drift || {};
  const status = drift.status || 'missing';
  if (!allowedDriftStatuses.has(status)) issues.push(`route_input_freeze_drift.status is invalid: ${status}`);
  if (status === 'pass' && numberAt(drift, 'drift_count') !== 0) {
    issues.push('route input freeze drift status is pass but drift_count is nonzero');
  }
  if (status === 'drift') {
    if (numberAt(drift, 'drift_count') <= 0) issues.push('route input freeze drift status is drift but drift_count is not positive');
    if (!Array.isArray(drift.drift) || drift.drift.length !== numberAt(drift, 'drift_count')) {
      issues.push('route input freeze drift list length must equal drift_count');
    }
    if (gate.status !== 'pass_with_warnings') {
      issues.push('route input freeze drift must force gate status pass_with_warnings when no hard issues exist');
    }
    if (!String(gate.release_scope || '').includes('unproven')) {
      issues.push('route input freeze drift must force unreconciled/unproven release_scope');
    }
    if (!(gate.warnings || []).some((warning) => String(warning).includes('differ from the frozen release inputs'))) {
      issues.push('route input freeze drift must be present in gate warnings');
    }
  }
  if ((status === 'missing' || status === 'unknown') && !String(gate.release_scope || '').includes('unproven')) {
    issues.push('missing/unknown drift report must leave release_scope unproven');
  }
  validateInputFreezePublicationBoundary(drift, status);
}

function validateInputFreezePublicationBoundary(drift, status) {
  if (status === 'missing') return;
  const boundary = drift.publication_boundary;
  if (!boundary || typeof boundary !== 'object') {
    issues.push('route_input_freeze_drift.publication_boundary object is required');
    return;
  }
  if (boundary.publication_status !== 'blocked_no_render') {
    issues.push('route_input_freeze_drift.publication_boundary.publication_status must be blocked_no_render');
  }
  for (const item of ['hud_route_input_freeze_drift', 'frozen_route_input_cache_comparison']) {
    if (!Array.isArray(boundary.validates) || !boundary.validates.includes(item)) {
      issues.push(`route_input_freeze_drift.publication_boundary.validates missing ${item}`);
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
      issues.push(`route_input_freeze_drift.publication_boundary.does_not_clear missing ${item}`);
    }
  }
  if (!String(boundary.route_input_scope || '').includes('not_publication_readiness')) {
    issues.push('route_input_freeze_drift.publication_boundary.route_input_scope must block publication readiness');
  }
  if (boundary.warning_status_blocks_publication_claim !== true) {
    issues.push('route_input_freeze_drift.publication_boundary.warning_status_blocks_publication_claim must be true');
  }
  if (status !== 'pass' && boundary.current_route_inputs_reconciled !== false) {
    issues.push('route_input_freeze_drift.publication_boundary.current_route_inputs_reconciled must be false unless status is pass');
  }
  for (const field of ['route_data_regenerated', 'source_imports_changed', 'public_lookup_artifacts_changed']) {
    if (boundary[field] !== false) issues.push(`route_input_freeze_drift.publication_boundary.${field} must be false`);
  }
}

function validateMarkdownBoundary() {
  for (const check of boundaryTextChecks) {
    if (!markdown.includes(check.text)) issues.push(`gate markdown is missing boundary text: ${check.id}`);
  }
  if (/Status:\s*pass\b/.test(markdown) && (gate.warnings || []).length > 0) {
    issues.push('gate markdown says Status: pass while JSON warnings are present');
  }
  if (!markdown.includes(`Status: ${gate.status}`)) issues.push('gate markdown status does not match gate JSON');
  if (!markdown.includes(`Release scope: ${gate.release_scope}`)) issues.push('gate markdown release_scope does not match gate JSON');
}

function propagateGateWarningState() {
  if (gate.status === 'pass_with_warnings') {
    warnings.push(`gate status is pass_with_warnings; ${Array.isArray(gate.warnings) ? gate.warnings.length : 0} gate warning(s) are preserved`);
  }
  const driftStatus = gate.route_input_freeze_drift?.status || 'missing';
  if (driftStatus !== 'pass') {
    warnings.push(`route input freeze drift status is ${driftStatus}; current route inputs are not release-reconciled`);
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--gate-json') parsed.gateJson = args[++index];
    else if (arg === '--gate-report') parsed.gateReport = args[++index];
    else if (arg === '--output') parsed.output = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_hud_route_release_gate_report.mjs',
      '',
      'Options:',
      '  --gate-json reports/hud-route-release-gate.json',
      '  --gate-report reports/hud-route-release-gate.md',
      '  --output reports/hud-route-release-gate-validation.json',
      '  --report reports/hud-route-release-gate-validation.md',
    ].join('\n'));
    process.exit(0);
  }
  for (const key of ['gateJson', 'gateReport', 'output', 'report']) parsed[key] = cleanPath(parsed[key]);
  validatePathScopes(parsed);
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, cleanPath(relativePath)), 'utf8');
}

function writeJson(relativePath, value) {
  writeFile(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, result) {
  const lines = [
    '# HUD Route Release Gate Validation',
    '',
    `Generated: ${result.generated_at}`,
    `Verdict: ${result.verdict}`,
    `Gate status: ${result.gate_status}`,
    `Release scope: ${result.release_scope}`,
    `Release ID: ${result.release_id}`,
    '',
    '## Publication Boundary',
    '',
    `- Publication status: ${result.publication_boundary.publication_status || 'missing'}`,
    `- Validates: ${(result.publication_boundary.validates || []).join(', ') || 'missing'}`,
    `- Does not clear: ${(result.publication_boundary.does_not_clear || []).join(', ') || 'missing'}`,
    `- Answer eligibility scope: ${result.publication_boundary.answer_eligible_scope || 'missing'}`,
    `- Warning status blocks publication claim: ${result.publication_boundary.warning_status_blocks_publication_claim}`,
    `- Current route sources reconciled: ${result.publication_boundary.current_route_sources_reconciled}`,
    `- Input-freeze publication status: ${result.input_freeze_publication_boundary?.publication_status || 'missing'}`,
    `- Input-freeze current route inputs reconciled: ${result.input_freeze_publication_boundary?.current_route_inputs_reconciled}`,
    `- Input-freeze public lookup artifacts changed: ${result.input_freeze_publication_boundary?.public_lookup_artifacts_changed}`,
    '',
    '## Counts',
    '',
    `- Public route cards: ${result.counts.public_cards_written}`,
    `- Public normalized tokens: ${result.counts.public_distinct_normalized_tokens}`,
    `- Public shards: ${result.counts.public_shard_count}`,
    `- Boundary issues: ${result.counts.boundary_issues}`,
    `- Boundary warnings: ${result.counts.boundary_warnings}`,
    `- Route cards with source rows: ${result.counts.route_cards_with_source_rows}`,
    `- Route cards missing source rows: ${result.counts.route_cards_missing_source_rows}`,
    `- Answer-role answer cards: ${result.counts.answer_role_answer_cards}`,
    `- Unsafe translation-output cards flagged: ${result.counts.translation_output_unsafe_cards}`,
    `- Answer-eligible unsafe cards flagged: ${result.counts.answer_eligible_translation_output_unsafe_cards}`,
    `- Answer-eligible unsafe source rows flagged: ${result.counts.answer_eligible_translation_output_unsafe_source_rows}`,
    `- Gate warnings: ${result.counts.gate_warnings}`,
    `- Gate issues: ${result.counts.gate_issues}`,
    `- Drift items: ${result.counts.drift_items}`,
    '',
    '## Boundary Assertions',
    '',
    '- `answer_eligible` is a route-card answer slot flag only; it is not publication readiness.',
    '- Source/license rows must remain present on route cards, including answer-role cards.',
    '- Unsafe translation-output flags must remain visible for future accepted translation decisions.',
    '- Warning status blocks any claim that current route inputs are reconciled to the frozen public lookup.',
    '- Publication remains `blocked_no_render`.',
    '',
    '## Issues',
    '',
    ...(result.issues.length ? result.issues.map((issue) => `- ${mdCell(issue)}`) : ['- none']),
    '',
    '## Validator Warnings',
    '',
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${mdCell(warning)}`) : ['- none']),
    '',
  ];
  writeFile(relativePath, `${lines.join('\n').trimEnd()}\n`);
}

function writeFile(relativePath, text) {
  const fullPath = path.join(root, cleanPath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function numberAt(object, field) {
  return Number(object?.[field] || 0);
}

function cleanPath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function validatePathScopes(parsed) {
  assertExactPath('--gate-json', parsed.gateJson, 'reports/hud-route-release-gate.json');
  assertExactPath('--gate-report', parsed.gateReport, 'reports/hud-route-release-gate.md');
  assertExactPath('--output', parsed.output, 'reports/hud-route-release-gate-validation.json');
  assertExactPath('--report', parsed.report, 'reports/hud-route-release-gate-validation.md');
  assertFileExtension('--output', parsed.output, '.json');
  assertFileExtension('--report', parsed.report, '.md');
}

function assertExactPath(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label} must be ${expected}: ${actual || 'missing'}`);
}

function assertPathUnder(label, actual, expectedPrefix) {
  if (actual !== expectedPrefix && !actual.startsWith(`${expectedPrefix}/`)) {
    throw new Error(`${label} must stay under ${expectedPrefix}: ${actual}`);
  }
}

function assertFileExtension(label, actual, expectedExtension) {
  if (!actual.endsWith(expectedExtension)) throw new Error(`${label} must end with ${expectedExtension}: ${actual}`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '/');
}
