#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bundlePath = cleanRelativePath(process.argv[2] || 'reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json');
const bundle = readJson(bundlePath);
const issues = [];

expect(bundle.artifact_type === 'agent2_weekly_lexicon_current_handoff_bundle', 'bundle artifact_type mismatch');

const artifacts = [
  ['current_handoff_bundle', bundlePath],
  ['spark1_runnable_manifest', bundle.entrypoints?.spark1_runnable_manifest],
  ['weekly_inventory', bundle.entrypoints?.weekly_inventory],
  ['manifest_output_state_receipt', bundle.entrypoints?.manifest_output_state_receipt],
  ['manifest_validation_receipt', bundle.entrypoints?.manifest_validation_receipt],
  ['current_route_scan_receipt', bundle.entrypoints?.current_route_scan_receipt],
  ['next_workset_blocker', bundle.entrypoints?.next_workset_blocker],
  ['deuteronomy_readiness_matrix', 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json'],
  ['deuteronomy_partition_export_plan', 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json'],
  ['orot_missed_dictionary_candidates', 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json'],
  ['definition_workbench_1000_sample', 'data/definitions/definition-workbench-sample-1000.json'],
  ['definition_workbench_usage_joined_sample_planning', 'data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json'],
  ['orot_counterpart_preview', 'reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json'],
  ['old_dictionary_lane_planning_intake', bundle.entrypoints?.old_dictionary_lane_planning_intake],
  ['current_stale_reference_scan_receipt', bundle.entrypoints?.current_stale_reference_scan_receipt],
  ['lane_preservation_handoff_receipt', bundle.entrypoints?.lane_preservation_handoff_receipt],
  ['broad_workbench_token_inventory_5000_return', bundle.entrypoints?.broad_workbench_token_inventory_5000_return],
  ['orot_zero_safe_pilot_upstream_claim_blocker', bundle.entrypoints?.orot_zero_safe_pilot_upstream_claim_blocker],
  ['weekly_lexicon_script_syntax_receipt', 'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json'],
  ['weekly_lexicon_pipeline_inventory_validation', 'reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json'],
];

const forbiddenTrueKeys = new Set([
  'qa_acceptance',
  'source_provenance_acceptance',
  'license_acceptance',
  'legal_acceptance',
  'definition_authority',
  'usage_as_definition_authority',
  'answer_acceptance',
  'answer_eligible',
  'answer_eligibility',
  'public_runtime_acceptance',
  'publication_readiness',
  'route_publication_support',
  'product_data_acceptance',
  'accepted_gloss_text',
  'public_reader_output',
  'public_reader_output_emitted',
  'route_shard_edit',
  'route_shard_write',
  'public_runtime_mutation',
  'definition_content_storage',
  'definition_text_emitted',
  'definition_text_export_now',
  'accepted_text',
  'accepted_text_emitted',
  'candidate_text_export_now',
  'public_emit',
  'public_emit_now',
  'nc_commercial_authorization',
  'commercial_export_allowed',
]);

const forbiddenPositiveCountKeys = new Set([
  'answer_rows',
  'answer_rows_emitted',
  'answer_eligible_rows',
  'public_emit_rows',
  'public_rows_emitted',
  'public_hud_rows',
  'public_hud_rows_emitted',
  'public_reader_output_rows',
  'route_jsonl_rows',
  'route_jsonl_rows_emitted',
  'route_shard_writes',
  'route_shard_write_rows',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'definition_text_rows',
  'definition_text_emitted_rows',
  'candidate_text_export_rows',
  'accepted_text_rows',
  'accepted_text_emitted_rows',
]);

for (const [label, relativePath] of artifacts) {
  requirePath(relativePath, label);
  const artifact = readJson(relativePath);
  auditObject(artifact, label, []);
  validateSpecificArtifact(label, artifact);
}

if (issues.length) {
  console.error(`Agent 2 weekly zero-boundary audit failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 weekly zero-boundary audit passed. Artifacts checked: ${artifacts.length}.`);

function auditObject(value, label, trail) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => auditObject(item, label, trail.concat(index)));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const pathLabel = `${label}.${trail.concat(key).join('.')}`;
    if (forbiddenTrueKeys.has(key)) {
      expect(child === false || child === null, `${pathLabel} must be false/null, got ${JSON.stringify(child)}`);
    }
    if (forbiddenPositiveCountKeys.has(key)) {
      expect(Number(child || 0) === 0, `${pathLabel} must be 0, got ${JSON.stringify(child)}`);
    }
    auditObject(child, label, trail.concat(key));
  }
}

function validateSpecificArtifact(label, artifact) {
  if (label === 'deuteronomy_readiness_matrix') {
    expect(artifact.counts?.rows === 1334, 'Deuteronomy readiness rows must be 1334');
    expect(artifact.counts?.occurrences === 2964, 'Deuteronomy readiness occurrences must be 2964');
  }
  if (label === 'deuteronomy_partition_export_plan') {
    expect(artifact.counts?.rows === 1334, 'Deuteronomy partition rows must be 1334');
    expect(artifact.counts?.candidate_text_export_rows === 0, 'Deuteronomy partition candidate text export rows must be 0');
  }
  if (label === 'orot_missed_dictionary_candidates') {
    expect(artifact.summary?.candidate_rows === 0, 'Orot missed dictionary candidate rows must be 0 on current inputs');
    expect(artifact.source_license_counts?.unmatched === 168, 'Orot missed dictionary unmatched must be 168');
  }
  if (label === 'definition_workbench_1000_sample') {
    expect(artifact.counts?.rows === 1000, 'Definition Workbench sample rows must be 1000');
    expect(artifact.counts?.review_status_counts?.unreviewed_machine_sample === 1000, 'Definition Workbench sample must remain unreviewed_machine_sample');
    expect(artifact.publication_boundary?.boundary_status === 'blocked_no_render', 'Definition Workbench sample publication boundary must be blocked_no_render');
  }
  if (label === 'orot_counterpart_preview') {
    expect(artifact.summary?.candidate_preview_rows === 31, 'Orot counterpart preview rows must be 31');
    expect(artifact.summary?.approved_patch_rows === 0, 'Orot counterpart preview approved rows must be 0');
  }
}

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}
