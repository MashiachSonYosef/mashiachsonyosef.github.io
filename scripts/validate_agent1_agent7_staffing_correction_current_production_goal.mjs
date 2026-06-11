#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-agent7-staffing-correction-current-production-goal-2026-06-05.json';
const resultPath = 'reports/agent1-agent7-staffing-correction-current-production-goal-validation-result-2026-06-05.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

try {
  const artifact = readJson(artifactPath);
  const registry = readJson('data/control/agent_registry.json');
  const directBrief = readJson('reports/agent1-agent13-direct-brief-response-old-dictionary-reaudit-2026-06-05.json');
  const bdbValidator = readJson('reports/agent1-bdb-augmented-strong-source-custody-blocker-validation-result-2026-06-05.json');
  const stateValidator = readJson('reports/agent1-state-currentness-validator-result-2026-06-03.json');
  const registryText = JSON.stringify(registry);
  const lane = artifact.lane_output_row || {};
  const laneCounts = lane.lane_counts_rows || {};
  const rows = lane.classification_lanes || [];
  const byFamily = Object.fromEntries(rows.map((row) => [row.source_family, row]));

  assert(artifact.artifact_type === 'agent1_agent7_staffing_correction_current_production_goal', 'unexpected artifact_type');
  assert(artifact.agent === 'Agent 1', 'agent must be Agent 1');
  assert(artifact.thread_title === 'Agent 1 - importer', 'thread title must be Agent 1 - importer');
  assert(artifact.current_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current thread id mismatch');
  assert(artifact.old_agent1_thread_id === '019dc487-5973-7693-aebf-fb0a75936f50', 'old Agent 1 id mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(registryText.includes(artifact.current_thread_id), 'registry does not include current Agent 1 thread id');
  assert(registryText.includes('archived_do_not_use'), 'registry does not preserve old Agent 1 archived/do-not-use policy');
  assert(artifact.correction_owner === 'Agent 7', 'correction owner must be Agent 7');
  assert(artifact.production_lane === 'Hebrew import/source/license/custody/source-lane evidence', 'production lane mismatch');
  assert(artifact.direct_active_goal.includes('source/license/custody/source-lane evidence'), 'direct active goal mismatch');
  assert(artifact.target === 'old-dictionary-excluded-row-license-lane-reaudit', 'target mismatch');
  assert(artifact.required_output_shape?.staffing_correction === 'production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner', 'staffing correction output shape mismatch');
  assert(artifact.required_output_shape?.lane_output === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const inputPath of artifact.files_used || []) {
    assert(exists(inputPath), `missing file_used path: ${inputPath}`);
  }

  assert(lane.target === artifact.target, 'lane target mismatch');
  assert(laneCounts.scoped_preview_rows === 500, 'scoped preview rows mismatch');
  assert(laneCounts.scoped_preview_occurrences === 8427, 'scoped preview occurrences mismatch');
  assert(laneCounts.commercial_clean_candidate_source_families === 3, 'commercial clean family count mismatch');
  assert(laneCounts.noncommercial_educational_candidate_source_families === 1, 'NC family count mismatch');
  assert(laneCounts.metadata_or_link_only_source_families === 0, 'metadata/link-only count mismatch');
  assert(laneCounts.blocked_or_needs_review_source_families === 1, 'blocked/review count mismatch');
  assert(laneCounts.per_family_rows_can_overlap === true, 'overlap note must be true');

  for (const familyName of ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary']) {
    assert(byFamily[familyName]?.license_lane === 'commercial_clean_candidate', `${familyName} must be commercial_clean_candidate`);
  }
  assert(byFamily['Klein Dictionary']?.license_lane === 'noncommercial_educational_candidate', 'Klein must be noncommercial_educational_candidate');
  assert(byFamily['Klein Dictionary']?.derived_from_nc === true, 'Klein derived_from_nc must be true');
  assert(byFamily['Klein Dictionary']?.commercial_export_allowed === false, 'Klein commercial_export_allowed must be false');
  assert(byFamily['Klein Dictionary']?.corpus_contamination === false, 'Klein corpus_contamination must be false');
  assert(byFamily['BDB Augmented Strong']?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must be blocked_or_needs_review');
  assert(byFamily['BDB Augmented Strong']?.derived_from_nc === false, 'BDB Augmented Strong must not be NC-derived');
  assert(byFamily['BDB Augmented Strong']?.commercial_export_allowed === false, 'BDB Augmented Strong commercial export must be false');
  assert(byFamily['BDB Augmented Strong']?.corpus_contamination === false, 'BDB Augmented Strong corpus_contamination must be false');

  assert((lane.exact_blockers || []).length === 2, 'expected exactly two lane blockers');
  assert((lane.exact_blockers || []).some((blocker) => blocker.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary' && blocker.license_lane === 'noncommercial_educational_candidate'), 'Klein exact blocker missing');
  const bdbBlocker = (lane.exact_blockers || []).find((blocker) => blocker.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong');
  assert(bdbBlocker?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong exact blocker missing');
  for (const required of [
    'independent source/license/custody basis',
    'source URL or version source',
    'license label and allowed fields',
    'Agent 6 boundary if evidence appears'
  ]) {
    assert((bdbBlocker.missing_evidence || []).includes(required), `BDB blocker missing evidence: ${required}`);
  }

  assert(artifact.validation?.state_currentness_ok === true, 'state currentness flag must be true');
  assert(artifact.validation?.state_currentness_completed_at === stateValidator.completed_at, 'state currentness timestamp drift');
  assert(artifact.validation?.bdb_augmented_strong_blocker_ok === true, 'BDB validator flag must be true');
  assert(artifact.validation?.bdb_augmented_strong_blocker_completed_at === bdbValidator.completed_at, 'BDB validator timestamp drift');
  assert(artifact.validation?.reaudit_packet_completed_at === directBrief.validation.reaudit_packet_completed_at, 'reaudit packet timestamp drift');
  assert(artifact.validation?.spark1_contract_completed_at === directBrief.validation.spark1_contract_completed_at, 'Spark1 contract timestamp drift');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const [key, value] of Object.entries(artifact.non_acceptance_boundary || {})) {
    assert(value === true, `${key} boundary must be true`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    current_thread_id: artifact.current_thread_id,
    old_agent1_policy: artifact.old_agent1_policy,
    target: artifact.target,
    correction_owner: artifact.correction_owner,
    production_lane: artifact.production_lane,
    lane_counts: laneCounts,
    exact_blocker_count: lane.exact_blockers.length,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
    boundary: {
      no_qa_acceptance: true,
      no_source_license_acceptance: true,
      no_public_runtime_mutation: true,
      no_destructive_repo_action: true
    }
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
