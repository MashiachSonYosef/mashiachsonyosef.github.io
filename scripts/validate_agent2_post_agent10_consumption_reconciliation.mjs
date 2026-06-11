import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_post_agent10_consumption_reconciliation', 'artifact_type mismatch');
expect(artifact.status === 'agent10_consumption_reconciled_current_agent2_chain_supersedes_counts', 'status mismatch');
expect(artifact.latest_agent10_consumption?.is_new_executable_agent2_workset === false, 'Agent10 artifact must be consumption-only');
expect(artifact.workset_status?.new_executable_workset_found === false, 'new executable workset must be false');

for (const [key, relativePath] of Object.entries(artifact.files || {})) {
  if (key === 'output_md' || key === 'output_json' || key === 'builder' || key === 'validator' || key.endsWith('_consumption') || key.endsWith('_bundle') || key.endsWith('_manifest') || key.endsWith('_scan') || key.endsWith('_blocker')) {
    expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `file missing for ${key}: ${relativePath}`);
  }
}

const counts = artifact.current_agent2_chain_counts || {};
expect(counts.runnable_pipelines === 7, 'runnable_pipelines must be 7');
expect(counts.validator_only_checks === 24, 'validator_only_checks must be 24');
expect(counts.runnable_outputs_checked === 7, 'runnable_outputs_checked must be 7');
expect(counts.validator_only_states_checked === 23, 'validator_only_states_checked must be 23');
expect(counts.zero_boundary_artifacts_checked === 22, 'zero_boundary_artifacts_checked must be 22');
expect(counts.aggregate_validator_commands === 20, 'aggregate_validator_commands must be 20');
expect(counts.script_syntax_scripts_checked === 54, 'script_syntax_scripts_checked must be 54');
expect(counts.stale_reference_surfaces_checked === 21, 'stale_reference_surfaces_checked must be 21');
expect(counts.stale_reference_hits === 0, 'stale_reference_hits must be 0');

const delta = artifact.reconciliation?.count_delta || {};
expect(delta.validator_only_checks === 2, 'validator_only_checks delta must be 2');
expect(delta.validator_only_states_checked === 2, 'validator_only_states_checked delta must be 2');
expect(delta.zero_boundary_artifacts_checked === 2, 'zero_boundary_artifacts_checked delta must be 2');
expect(delta.aggregate_validator_commands === 2, 'aggregate_validator_commands delta must be 2');
expect(delta.script_syntax_scripts_checked === 4, 'script_syntax_scripts_checked delta must be 4');

const orot = artifact.orot_zero_safe_blocker_counts || {};
expect(orot.target_rows === 100, 'Orot target rows must be 100');
expect(orot.target_occurrences === 1960, 'Orot target occurrences must be 1960');
expect(orot.source_clean_rows === 87, 'Orot source clean rows must be 87');
expect(orot.source_blocked_rows === 13, 'Orot source blocked rows must be 13');
expect(orot.transform_candidate_rows === 0, 'Orot transform candidate rows must be 0');

for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(artifact.handoff_owner === 'Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner', 'handoff owner mismatch');
expect((artifact.what_must_not_be_accepted || []).includes('Definition authority'), 'must forbid Definition authority');
expect((artifact.what_must_not_be_accepted || []).includes('answer eligibility'), 'must forbid answer eligibility');
expect((artifact.what_must_not_be_accepted || []).includes('candidate-text export'), 'must forbid candidate-text export');

if (issues.length) {
  console.error(`Agent 2 post-Agent10 consumption reconciliation validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 post-Agent10 consumption reconciliation validation passed. Current validator-only checks: 24; new executable workset: false.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}
