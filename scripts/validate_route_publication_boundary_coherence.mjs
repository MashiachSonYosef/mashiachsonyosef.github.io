#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  stampJson: 'data/definitions/hud-route-release-stamp.json',
  gateJson: 'reports/hud-route-release-gate.json',
  gateValidationJson: 'reports/hud-route-release-gate-validation.json',
  summaryJson: 'reports/route-boundary-report-summary-validation.json',
  auditJson: 'reports/route-publication-boundary-audit.json',
  outputJson: 'reports/route-publication-boundary-coherence.json',
  outputReport: 'reports/route-publication-boundary-coherence.md',
};
const options = parseArgs(process.argv.slice(2));

const stamp = readJson(options.stampJson);
const gate = readJson(options.gateJson);
const gateValidation = readJson(options.gateValidationJson);
const summary = readJson(options.summaryJson);
const audit = readJson(options.auditJson);

const issues = [];
const warnings = [];

validateArtifactTypes();
validatePublicationBoundaries();
validateCounts();
validateDrift();
validateWarningStatus();
preserveUnderlyingWarnings();

const verdict = issues.length ? 'fail' : warnings.length ? 'pass_with_warnings' : 'pass';
const result = {
  schema_version: 1,
  artifact_type: 'route_publication_boundary_coherence_validation',
  generated_at: new Date().toISOString(),
  generator: 'scripts/validate_route_publication_boundary_coherence.mjs',
  verdict,
  inputs: {
    hud_route_release_stamp: options.stampJson,
    hud_route_release_gate: options.gateJson,
    hud_route_release_gate_validation: options.gateValidationJson,
    route_boundary_report_summary: options.summaryJson,
    route_publication_boundary_audit: options.auditJson,
  },
  publication_boundary: {
    publication_status: 'blocked_no_render',
    validates: [
      'hud_route_release_stamp',
      'hud_route_release_gate',
      'hud_route_release_gate_validation',
      'route_boundary_report_summary',
      'route_publication_boundary_audit',
    ],
    does_not_clear: [
      'translation_output',
      'source_publication',
      'public_lexical_export_reuse',
      'accepted_definition_authority',
    ],
    answer_eligible_scope: 'hud_answer_slot_only_not_translation_or_publication_readiness',
    warning_status_blocks_publication_claim: true,
    current_route_inputs_reconciled: driftStatus() === 'pass',
    release_stamp_current_route_inputs_reconciled: 'stamp_uses_frozen_inputs_validate_drift_separately',
  },
  counts: {
    stamp_public_cards_written: numberAt(stamp.reconciliation, 'public_cards_written'),
    stamp_public_distinct_normalized_tokens: numberAt(stamp.reconciliation, 'public_distinct_normalized_tokens'),
    stamp_public_shard_count: numberAt(stamp.reconciliation, 'public_shard_count'),
    cards: numberAt(audit.counts, 'cards'),
    tokens: numberAt(audit.counts, 'tokens'),
    shards: numberAt(audit.counts, 'shards'),
    answer_eligible_cards: numberAt(audit.counts, 'answer_eligible_cards'),
    answer_role_answer_cards: numberAt(audit.counts, 'answer_role_answer_cards'),
    route_cards_missing_source_rows: numberAt(audit.counts, 'route_cards_missing_source_rows'),
    answer_eligible_cards_missing_answer_score: numberAt(audit.counts, 'answer_eligible_cards_missing_answer_score'),
    route_cards_with_publication_fields: numberAt(audit.counts, 'route_cards_with_publication_fields'),
    issue_count: numberAt(audit.counts, 'issue_count'),
    warning_count: numberAt(audit.counts, 'warning_count'),
    translation_output_unsafe_cards: numberAt(audit.counts, 'translation_output_unsafe_cards'),
    answer_eligible_translation_output_unsafe_cards: numberAt(audit.counts, 'answer_eligible_translation_output_unsafe_cards'),
    answer_eligible_translation_output_unsafe_source_rows: numberAt(audit.counts, 'answer_eligible_translation_output_unsafe_source_rows'),
    drift_items: driftCount(),
  },
  coherent_assertions: {
    counts_match_across_gate_summary_and_audit: issues.every((issue) => !issue.startsWith('count mismatch')),
    publication_boundaries_match_blocked_no_render: issues.every((issue) => !issue.startsWith('publication boundary')),
    warning_status_blocks_publication_claim: true,
    drift_blocks_current_route_input_reconciliation: driftStatus() !== 'pass',
  },
  issues,
  warnings,
};

writeJson(options.outputJson, result);
writeMarkdown(options.outputReport, result);

if (issues.length) {
  console.error(`Route publication boundary coherence failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Route publication boundary coherence ${verdict}: ${options.outputReport}`);

function validateArtifactTypes() {
  expectEqual('stamp.artifact_type', stamp.artifact_type, 'hud_route_release_stamp');
  expectEqual('stamp.status', stamp.status, 'release_candidate');
  expectEqual('stamp.reconciliation.counts_match', stamp.reconciliation?.counts_match, true);
  expectEqual('gate.artifact_type', gate.artifact_type, 'hud_route_release_gate_report');
  expectEqual('gateValidation.artifact_type', gateValidation.artifact_type, 'hud_route_release_gate_validation');
  expectEqual('summary.artifact_type', summary.artifact_type, 'route_boundary_report_summary_validation');
  expectEqual('audit.artifact_type', audit.artifact_type, 'route_publication_boundary_audit');
}

function validatePublicationBoundaries() {
  const boundaries = {
    stamp: stamp.publication_boundary,
    publicLookupManifest: stamp.public_lookup?.publication_boundary,
    gate: gate.publication_boundary,
    gateValidation: gateValidation.publication_boundary,
    summary: summary.publication_boundary,
    audit: audit.publication_boundary,
  };

  for (const [name, boundary] of Object.entries(boundaries)) {
    if (!boundary || typeof boundary !== 'object') {
      issues.push(`publication boundary ${name} missing`);
      continue;
    }
    expectEqual(`publication boundary ${name}.publication_status`, boundary.publication_status, 'blocked_no_render');
    for (const item of resultDoesNotClear()) {
      if (!Array.isArray(boundary.does_not_clear) || !boundary.does_not_clear.includes(item)) {
        issues.push(`publication boundary ${name}.does_not_clear missing ${item}`);
      }
    }
    if (!String(boundary.answer_eligible_scope || '').includes('not_translation_or_publication_readiness')) {
      issues.push(`publication boundary ${name}.answer_eligible_scope must block translation/publication readiness overclaim`);
    }
    if (boundary.warning_status_blocks_publication_claim !== true) {
      issues.push(`publication boundary ${name}.warning_status_blocks_publication_claim must be true`);
    }
  }

  expectBoundaryValidates('stamp', stamp.publication_boundary, [
    'hud_route_release_stamp',
    'public_hud_route_lookup_reconciliation',
  ]);
  expectBoundaryValidates('publicLookupManifest', stamp.public_lookup?.publication_boundary, [
    'public_hud_route_lookup_manifest',
    'public_hud_route_lookup_shards',
  ]);
  expectBoundaryValidates('gate', gate.publication_boundary, [
    'hud_route_release_stamp',
    'hud_route_lookup_integrity',
    'route_card_publication_boundary',
  ]);
  expectBoundaryValidates('gateValidation', gateValidation.publication_boundary, [
    'hud_route_release_stamp',
    'hud_route_lookup_integrity',
    'route_card_publication_boundary',
  ]);
  expectBoundaryValidates('summary', summary.publication_boundary, [
    'route_publication_boundary_audit_summary',
    'route_card_publication_boundary',
  ]);
  expectBoundaryValidates('audit', audit.publication_boundary, [
    'route_publication_boundary_audit',
    'route_card_publication_boundary',
    'public_hud_route_lookup_publication_boundary',
  ]);

  expectEqual(
    'publication boundary stamp.current_route_inputs_reconciled',
    stamp.publication_boundary?.current_route_inputs_reconciled,
    'stamp_uses_frozen_inputs_validate_drift_separately',
  );
  expectEqual(
    'publication boundary publicLookupManifest.current_route_inputs_reconciled',
    stamp.public_lookup?.publication_boundary?.current_route_inputs_reconciled,
    'not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift',
  );
  expectEqual(
    'publication boundary gate.current_route_sources_reconciled',
    gate.publication_boundary?.current_route_sources_reconciled,
    driftStatus() === 'pass',
  );
  expectEqual(
    'publication boundary gateValidation.current_route_sources_reconciled',
    gateValidation.publication_boundary?.current_route_sources_reconciled,
    driftStatus() === 'pass',
  );
  expectEqual(
    'publication boundary summary.current_route_inputs_reconciled',
    summary.publication_boundary?.current_route_inputs_reconciled,
    driftStatus() === 'pass',
  );
  expectEqual(
    'publication boundary audit.current_route_inputs_reconciled',
    audit.publication_boundary?.current_route_inputs_reconciled,
    'not_checked_by_route_publication_boundary_audit',
  );
}

function validateCounts() {
  compareCount('cards', [
    ['stamp.reconciliation.public_cards_written', stamp.reconciliation?.public_cards_written],
    ['gate.public_cards_written', gate.public_cards_written],
    ['gateValidation.counts.public_cards_written', gateValidation.counts?.public_cards_written],
    ['summary.counts.cards', summary.counts?.cards],
    ['audit.counts.cards', audit.counts?.cards],
  ]);
  compareCount('tokens', [
    ['stamp.reconciliation.public_distinct_normalized_tokens', stamp.reconciliation?.public_distinct_normalized_tokens],
    ['gate.public_distinct_normalized_tokens', gate.public_distinct_normalized_tokens],
    ['gateValidation.counts.public_distinct_normalized_tokens', gateValidation.counts?.public_distinct_normalized_tokens],
    ['summary.counts.tokens', summary.counts?.tokens],
    ['audit.counts.tokens', audit.counts?.tokens],
  ]);
  compareCount('shards', [
    ['stamp.reconciliation.public_shard_count', stamp.reconciliation?.public_shard_count],
    ['gate.public_shard_count', gate.public_shard_count],
    ['gateValidation.counts.public_shard_count', gateValidation.counts?.public_shard_count],
    ['summary.counts.shards', summary.counts?.shards],
    ['audit.counts.shards', audit.counts?.shards],
  ]);
  compareCount('issue_count', [
    ['gate.route_publication_boundary.issues', gate.route_publication_boundary?.issues],
    ['gateValidation.counts.boundary_issues', gateValidation.counts?.boundary_issues],
    ['summary.counts.issue_count', summary.counts?.issue_count],
    ['audit.counts.issue_count', audit.counts?.issue_count],
  ]);
  compareCount('warning_count', [
    ['gate.route_publication_boundary.warnings', gate.route_publication_boundary?.warnings],
    ['gateValidation.counts.boundary_warnings', gateValidation.counts?.boundary_warnings],
    ['summary.counts.warning_count', summary.counts?.warning_count],
    ['audit.counts.warning_count', audit.counts?.warning_count],
  ]);
  compareCount('route_cards_missing_source_rows', [
    ['gate.route_publication_boundary.route_cards_missing_source_rows', gate.route_publication_boundary?.route_cards_missing_source_rows],
    ['gateValidation.counts.route_cards_missing_source_rows', gateValidation.counts?.route_cards_missing_source_rows],
    ['summary.counts.route_cards_missing_source_rows', summary.counts?.route_cards_missing_source_rows],
    ['audit.counts.route_cards_missing_source_rows', audit.counts?.route_cards_missing_source_rows],
  ]);
  compareCount('answer cards', [
    ['gate.route_publication_boundary.answer_role_answer_cards', gate.route_publication_boundary?.answer_role_answer_cards],
    ['gateValidation.counts.answer_role_answer_cards', gateValidation.counts?.answer_role_answer_cards],
    ['summary.counts.answer_eligible_cards', summary.counts?.answer_eligible_cards],
    ['audit.counts.answer_eligible_cards', audit.counts?.answer_eligible_cards],
    ['audit.counts.answer_role_answer_cards', audit.counts?.answer_role_answer_cards],
  ]);
  compareCount('answer_eligible_cards_missing_answer_score', [
    ['summary.counts.answer_eligible_cards_missing_answer_score', summary.counts?.answer_eligible_cards_missing_answer_score],
    ['audit.counts.answer_eligible_cards_missing_answer_score', audit.counts?.answer_eligible_cards_missing_answer_score],
  ]);
  compareCount('route_cards_with_publication_fields', [
    ['summary.counts.route_cards_with_publication_fields', summary.counts?.route_cards_with_publication_fields],
    ['audit.counts.route_cards_with_publication_fields', audit.counts?.route_cards_with_publication_fields],
  ]);
  compareCount('translation_output_unsafe_cards', [
    ['gate.route_publication_boundary.translation_output_unsafe_cards', gate.route_publication_boundary?.translation_output_unsafe_cards],
    ['gateValidation.counts.translation_output_unsafe_cards', gateValidation.counts?.translation_output_unsafe_cards],
    ['summary.counts.translation_output_unsafe_cards', summary.counts?.translation_output_unsafe_cards],
    ['audit.counts.translation_output_unsafe_cards', audit.counts?.translation_output_unsafe_cards],
  ]);
  compareCount('answer_eligible_translation_output_unsafe_cards', [
    ['gate.route_publication_boundary.answer_eligible_translation_output_unsafe_cards', gate.route_publication_boundary?.answer_eligible_translation_output_unsafe_cards],
    ['gateValidation.counts.answer_eligible_translation_output_unsafe_cards', gateValidation.counts?.answer_eligible_translation_output_unsafe_cards],
    ['summary.counts.answer_eligible_translation_output_unsafe_cards', summary.counts?.answer_eligible_translation_output_unsafe_cards],
    ['audit.counts.answer_eligible_translation_output_unsafe_cards', audit.counts?.answer_eligible_translation_output_unsafe_cards],
  ]);
  compareCount('answer_eligible_translation_output_unsafe_source_rows', [
    ['gate.route_publication_boundary.answer_eligible_translation_output_unsafe_source_rows', gate.route_publication_boundary?.answer_eligible_translation_output_unsafe_source_rows],
    ['gateValidation.counts.answer_eligible_translation_output_unsafe_source_rows', gateValidation.counts?.answer_eligible_translation_output_unsafe_source_rows],
    ['audit.counts.answer_eligible_translation_output_unsafe_source_rows', audit.counts?.answer_eligible_translation_output_unsafe_source_rows],
  ]);

  for (const [label, value] of [
    ['route_cards_missing_source_rows', audit.counts?.route_cards_missing_source_rows],
    ['answer_eligible_cards_missing_answer_score', audit.counts?.answer_eligible_cards_missing_answer_score],
    ['route_cards_with_publication_fields', audit.counts?.route_cards_with_publication_fields],
    ['issue_count', audit.counts?.issue_count],
  ]) {
    if (numberValue(value) !== 0) issues.push(`count mismatch ${label}: expected 0, got ${value}`);
  }
  if (numberAt(audit.counts, 'warning_count') <= 0) {
    warnings.push('warning_count is zero; unsafe translation-output warning visibility may have changed');
  }
}

function validateDrift() {
  expectEqual('gate.route_input_freeze_drift.status', gate.route_input_freeze_drift?.status, summary.input_freeze_drift?.status);
  expectEqual('gate.route_input_freeze_drift.drift_count', gate.route_input_freeze_drift?.drift_count, summary.input_freeze_drift?.drift_count);
  compareCount('drift_items', [
    ['gateValidation.counts.drift_items', gateValidation.counts?.drift_items],
    ['summary.input_freeze_drift.drift_count', summary.input_freeze_drift?.drift_count],
  ]);
  if (JSON.stringify(gate.route_input_freeze_drift?.drift || []) !== JSON.stringify(summary.input_freeze_drift?.drift || [])) {
    issues.push('drift item list differs between HUD release gate and route-boundary summary');
  }
}

function validateWarningStatus() {
  const warningCount = numberAt(audit.counts, 'warning_count');
  const hasDrift = driftStatus() !== 'pass';
  if (warningCount > 0 || hasDrift) {
    expectEqual('gate.status', gate.status, 'pass_with_warnings');
    expectEqual('gateValidation.verdict', gateValidation.verdict, 'pass_with_warnings');
    expectEqual('summary.verdict', summary.verdict, 'pass_with_warnings');
  }
  if (hasDrift) {
    if (!String(gate.release_scope || '').includes('unproven')) {
      issues.push('gate.release_scope must remain unproven while route input drift remains');
    }
    if (!String(summary.release_scope || '').includes('unreconciled')) {
      issues.push('summary.release_scope must remain unreconciled while route input drift remains');
    }
  }
}

function preserveUnderlyingWarnings() {
  const warningCount = numberAt(audit.counts, 'warning_count');
  if (warningCount > 0) {
    warnings.push(`route publication-boundary warnings remain visible: ${warningCount}`);
  }
  if (driftStatus() !== 'pass') {
    warnings.push(`current route inputs remain unreconciled: ${driftStatus()}`);
  }
}

function compareCount(label, entries) {
  const normalized = entries.map(([name, value]) => [name, numberValue(value)]);
  const expected = normalized[0][1];
  if (expected === null) {
    issues.push(`count mismatch ${label}: ${normalized[0][0]} missing or nonnumeric`);
    return;
  }
  for (const [name, value] of normalized.slice(1)) {
    if (value === null) {
      issues.push(`count mismatch ${label}: ${name} missing or nonnumeric`);
    } else if (value !== expected) {
      issues.push(`count mismatch ${label}: ${name} ${value} differs from ${normalized[0][0]} ${expected}`);
    }
  }
}

function expectBoundaryValidates(name, boundary, requiredItems) {
  for (const item of requiredItems) {
    if (!Array.isArray(boundary?.validates) || !boundary.validates.includes(item)) {
      issues.push(`publication boundary ${name}.validates missing ${item}`);
    }
  }
}

function resultDoesNotClear() {
  return ['translation_output', 'source_publication', 'public_lexical_export_reuse', 'accepted_definition_authority'];
}

function driftStatus() {
  return gate.route_input_freeze_drift?.status || summary.input_freeze_drift?.status || 'missing';
}

function driftCount() {
  return numberValue(gate.route_input_freeze_drift?.drift_count) ?? numberValue(summary.input_freeze_drift?.drift_count) ?? 0;
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) issues.push(`${label} expected ${expected}, got ${actual ?? 'missing'}`);
}

function numberAt(object, key) {
  return numberValue(object?.[key]) ?? 0;
}

function numberValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--gate-json') parsed.gateJson = cleanRelativePath(args[++index]);
    else if (arg === '--stamp-json') parsed.stampJson = cleanRelativePath(args[++index]);
    else if (arg === '--gate-validation-json') parsed.gateValidationJson = cleanRelativePath(args[++index]);
    else if (arg === '--summary-json') parsed.summaryJson = cleanRelativePath(args[++index]);
    else if (arg === '--audit-json') parsed.auditJson = cleanRelativePath(args[++index]);
    else if (arg === '--output') parsed.outputJson = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.outputReport = cleanRelativePath(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_route_publication_boundary_coherence.mjs',
      '',
      'Options:',
      '  --stamp-json data/definitions/hud-route-release-stamp.json',
      '  --gate-json reports/hud-route-release-gate.json',
      '  --gate-validation-json reports/hud-route-release-gate-validation.json',
      '  --summary-json reports/route-boundary-report-summary-validation.json',
      '  --audit-json reports/route-publication-boundary-audit.json',
      '  --output reports/route-publication-boundary-coherence.json',
      '  --report reports/route-publication-boundary-coherence.md',
    ].join('\n'));
    process.exit(0);
  }
  parsed.stampJson = cleanRelativePath(parsed.stampJson);
  parsed.gateJson = cleanRelativePath(parsed.gateJson);
  parsed.gateValidationJson = cleanRelativePath(parsed.gateValidationJson);
  parsed.summaryJson = cleanRelativePath(parsed.summaryJson);
  parsed.auditJson = cleanRelativePath(parsed.auditJson);
  parsed.outputJson = cleanRelativePath(parsed.outputJson);
  parsed.outputReport = cleanRelativePath(parsed.outputReport);
  validatePathScopes(parsed);
  return parsed;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(relativePath, data) {
  const lines = [
    '# Route Publication Boundary Coherence',
    '',
    `- Generated: ${data.generated_at}`,
    `- Verdict: ${data.verdict}`,
    `- Publication status: ${data.publication_boundary.publication_status}`,
    `- Current route inputs reconciled: ${data.publication_boundary.current_route_inputs_reconciled}`,
    `- Release stamp route input mode: ${data.publication_boundary.release_stamp_current_route_inputs_reconciled}`,
    '',
    '## Counts',
    '',
    `- Cards: ${data.counts.cards}`,
    `- Release stamp public cards: ${data.counts.stamp_public_cards_written}`,
    `- Tokens: ${data.counts.tokens}`,
    `- Release stamp public tokens: ${data.counts.stamp_public_distinct_normalized_tokens}`,
    `- Shards: ${data.counts.shards}`,
    `- Release stamp public shards: ${data.counts.stamp_public_shard_count}`,
    `- Answer-eligible cards: ${data.counts.answer_eligible_cards}`,
    `- Missing source rows: ${data.counts.route_cards_missing_source_rows}`,
    `- Missing answer scores: ${data.counts.answer_eligible_cards_missing_answer_score}`,
    `- Publication fields on route cards: ${data.counts.route_cards_with_publication_fields}`,
    `- Issues: ${data.counts.issue_count}`,
    `- Warnings: ${data.counts.warning_count}`,
    `- Translation-output unsafe cards: ${data.counts.translation_output_unsafe_cards}`,
    `- Answer-eligible translation-output unsafe cards: ${data.counts.answer_eligible_translation_output_unsafe_cards}`,
    `- Drift items: ${data.counts.drift_items}`,
    '',
    '## Boundary',
    '',
    `- Validates: ${data.publication_boundary.validates.join(', ')}`,
    `- Does not clear: ${data.publication_boundary.does_not_clear.join(', ')}`,
    `- Answer eligibility scope: ${data.publication_boundary.answer_eligible_scope}`,
    `- Warning status blocks publication claim: ${data.publication_boundary.warning_status_blocks_publication_claim}`,
    '- This is a cross-report coherence validator only; it does not render pages and does not rescan route shards.',
    '',
    '## Issues',
    '',
    ...(data.issues.length ? data.issues.map((issue) => `- ${mdCell(issue)}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(data.warnings.length ? data.warnings.map((warning) => `- ${mdCell(warning)}`) : ['- none']),
    '',
  ];
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}`);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '/');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function validatePathScopes(parsed) {
  assertExactPath('--stamp-json', parsed.stampJson, 'data/definitions/hud-route-release-stamp.json');
  assertExactPath('--gate-json', parsed.gateJson, 'reports/hud-route-release-gate.json');
  assertExactPath('--gate-validation-json', parsed.gateValidationJson, 'reports/hud-route-release-gate-validation.json');
  assertExactPath('--summary-json', parsed.summaryJson, 'reports/route-boundary-report-summary-validation.json');
  assertExactPath('--audit-json', parsed.auditJson, 'reports/route-publication-boundary-audit.json');
  assertExactPath('--output', parsed.outputJson, 'reports/route-publication-boundary-coherence.json');
  assertExactPath('--report', parsed.outputReport, 'reports/route-publication-boundary-coherence.md');
  assertFileExtension('--output', parsed.outputJson, '.json');
  assertFileExtension('--report', parsed.outputReport, '.md');
}

function assertExactPath(label, actual, expected) {
  if (actual !== expected) throw new Error(`${label} must be ${expected}: ${actual}`);
}

function assertPathUnder(label, actual, expectedPrefix) {
  if (actual !== expectedPrefix && !actual.startsWith(`${expectedPrefix}/`)) {
    throw new Error(`${label} must stay under ${expectedPrefix}: ${actual}`);
  }
}

function assertFileExtension(label, actual, expectedExtension) {
  if (!actual.endsWith(expectedExtension)) throw new Error(`${label} must end with ${expectedExtension}: ${actual}`);
}
