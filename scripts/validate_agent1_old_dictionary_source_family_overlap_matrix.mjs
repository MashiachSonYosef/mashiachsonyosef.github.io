#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json';
const resultPath = 'reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json';

const expectedPairs = {
  'jastrow-dictionary__bdb-dictionary': { rows: 134, occurrences: 3145 },
  'jastrow-dictionary__bdb-aramaic-dictionary': { rows: 49, occurrences: 1632 },
  'jastrow-dictionary__klein-dictionary': { rows: 176, occurrences: 3718 },
  'jastrow-dictionary__bdb-augmented-strong': { rows: 135, occurrences: 3162 },
  'bdb-dictionary__bdb-aramaic-dictionary': { rows: 69, occurrences: 2048 },
  'bdb-dictionary__klein-dictionary': { rows: 139, occurrences: 3350 },
  'bdb-dictionary__bdb-augmented-strong': { rows: 221, occurrences: 4418 },
  'bdb-aramaic-dictionary__klein-dictionary': { rows: 47, occurrences: 1632 },
  'bdb-aramaic-dictionary__bdb-augmented-strong': { rows: 69, occurrences: 2048 },
  'klein-dictionary__bdb-augmented-strong': { rows: 140, occurrences: 3367 }
};

const expectedCombinations = {
  'jastrow-dictionary__bdb-dictionary__bdb-aramaic-dictionary__klein-dictionary__bdb-augmented-strong': { rows: 40, occurrences: 1464 },
  'jastrow-dictionary__bdb-dictionary__bdb-aramaic-dictionary__bdb-augmented-strong': { rows: 9, occurrences: 168 },
  'bdb-dictionary__bdb-aramaic-dictionary__klein-dictionary__bdb-augmented-strong': { rows: 7, occurrences: 168 },
  'jastrow-dictionary__bdb-dictionary__klein-dictionary__bdb-augmented-strong': { rows: 78, occurrences: 1419 },
  'bdb-dictionary__bdb-aramaic-dictionary__bdb-augmented-strong': { rows: 13, occurrences: 248 },
  'bdb-dictionary__klein-dictionary__bdb-augmented-strong': { rows: 14, occurrences: 299 },
  'jastrow-dictionary__bdb-dictionary__bdb-augmented-strong': { rows: 7, occurrences: 94 },
  'jastrow-dictionary__klein-dictionary__bdb-augmented-strong': { rows: 1, occurrences: 17 },
  'bdb-dictionary__bdb-augmented-strong': { rows: 53, occurrences: 558 },
  'jastrow-dictionary__klein-dictionary': { rows: 57, occurrences: 818 },
  'jastrow-dictionary': { rows: 18, occurrences: 494 },
  'klein-dictionary': { rows: 17, occurrences: 259 },
  'no-source-family-hit': { rows: 186, occurrences: 2421 }
};

const noAcceptanceKeys = [
  'no_qa_acceptance',
  'no_source_license_acceptance',
  'no_legal_acceptance',
  'no_definition_authority',
  'no_runtime_public_acceptance',
  'no_publication_readiness',
  'no_product_data_acceptance',
  'no_answer_acceptance',
  'no_accepted_gloss_text',
  'no_nc_commercial_authorization',
  'no_candidate_text_export_authorization',
  'no_release_action',
  'no_public_runtime_mutation',
  'no_queue_mutation',
  'no_staging',
  'no_destructive_repo_action'
];

function fullPath(relativePath) {
  return path.join(root, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(fullPath(relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
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
  const preview = readJson(artifact.inputs.preview);
  const membership = readJson(artifact.inputs.sourceFamilyMembership);
  const membershipResult = readJson(artifact.inputs.sourceFamilyMembershipValidationResult);
  const exactSubset = readJson(artifact.inputs.exactRowSubsetManifest);

  assert(artifact.artifact_type === 'agent1_old_dictionary_source_family_overlap_matrix', 'unexpected artifact_type');
  assert(artifact.status === 'source_family_overlap_matrix_recorded_zero_output_no_acceptance', 'unexpected status');
  assert(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');
  assert(artifact.old_agent1_policy === 'archived_do_not_use', 'old Agent 1 policy mismatch');
  assert(artifact.required_lane_output_shape === 'target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition', 'lane output shape mismatch');

  for (const key of ['preview', 'sourceFamilyMembership', 'sourceFamilyMembershipValidationResult', 'exactRowSubsetManifest', 'outputJson', 'outputMd', 'validator']) {
    assert(exists(artifact.inputs[key]), `missing input path: ${key}`);
  }
  assert(preview.summary.audited_rows === 500, 'preview audited rows mismatch');
  assert((preview.rows || []).length === 500, 'preview row array mismatch');
  assert(membershipResult.ok === true, 'membership validator result not ok');
  assert(membership.source_family_manifests.length === 5, 'membership family count mismatch');
  assert(exactSubset.manifest_counts.unique_manifest_token_id_count === 500, 'exact subset coverage mismatch');

  assert(artifact.matrix_counts.source_family_count === 5, 'source family count mismatch');
  assert(artifact.matrix_counts.pairwise_intersection_count === 10, 'pairwise intersection count mismatch');
  assert(artifact.matrix_counts.exact_family_combination_count === 13, 'exact combination count mismatch');
  assert(artifact.matrix_counts.total_exact_combination_rows === 500, 'exact combination row coverage mismatch');
  assert(artifact.matrix_counts.total_exact_combination_occurrences === 8427, 'exact combination occurrence coverage mismatch');
  assert(artifact.matrix_counts.commercial_internal_pair_rows === 252, 'commercial internal pair rows mismatch');
  assert(artifact.matrix_counts.commercial_with_nc_pair_rows === 362, 'commercial+NC pair rows mismatch');
  assert(artifact.matrix_counts.commercial_with_blocked_pair_rows === 425, 'commercial+blocked pair rows mismatch');
  assert(artifact.matrix_counts.nc_with_blocked_pair_rows === 140, 'NC+blocked pair rows mismatch');
  assert(artifact.matrix_counts.delivered_to_agent6_now === 0, 'Agent 6 delivery must be zero');
  assert(artifact.matrix_counts.allowed_transform_rows_now === 0, 'allowed transform rows must be zero');
  assert(artifact.matrix_counts.candidate_text_rows_now === 0, 'candidate text rows must be zero');

  const pairs = new Map((artifact.pairwise_intersections || []).map((row) => [row.pair_id, row]));
  for (const [pairId, expected] of Object.entries(expectedPairs)) {
    const row = pairs.get(pairId);
    assert(row, `missing pair: ${pairId}`);
    assert(row.row_count === expected.rows, `${pairId} row count mismatch`, row);
    assert(row.occurrence_count === expected.occurrences, `${pairId} occurrence count mismatch`, row);
    assert(row.token_ids.length === expected.rows, `${pairId} token count mismatch`, row);
    assert(row.token_ids_sha256 === sha256(row.token_ids.join('\n')), `${pairId} token hash mismatch`);
    assert(row.candidate_text_rows_now === 0, `${pairId} candidate text rows must be zero`);
    assert(row.agent6_delivery_now === 0, `${pairId} Agent 6 delivery must be zero`);
    assert(typeof row.exact_blocker === 'string' && row.exact_blocker.length > 0, `${pairId} blocker missing`);
  }

  const combos = new Map((artifact.exact_family_combinations || []).map((row) => [row.combination_id, row]));
  for (const [comboId, expected] of Object.entries(expectedCombinations)) {
    const row = combos.get(comboId);
    assert(row, `missing combination: ${comboId}`);
    assert(row.row_count === expected.rows, `${comboId} row count mismatch`, row);
    assert(row.occurrence_count === expected.occurrences, `${comboId} occurrence count mismatch`, row);
    assert(row.token_ids.length === expected.rows, `${comboId} token count mismatch`, row);
    assert(row.token_ids_sha256 === sha256(row.token_ids.join('\n')), `${comboId} token hash mismatch`);
    assert(row.candidate_text_rows_now === 0, `${comboId} candidate text rows must be zero`);
    assert(row.agent6_delivery_now === 0, `${comboId} Agent 6 delivery must be zero`);
  }

  assert([...combos.values()].reduce((sum, row) => sum + row.row_count, 0) === 500, 'combination rows must cover 500 rows');
  assert([...combos.values()].reduce((sum, row) => sum + row.occurrence_count, 0) === 8427, 'combination occurrences must cover 8427');
  assert(combos.get('klein-dictionary').classification_lanes[0] === 'noncommercial_educational_candidate', 'Klein-only combo must stay NC');
  assert(combos.get('no-source-family-hit').classification_lanes[0] === 'blocked_or_needs_review', 'no-source combo must be blocked/review');
  assert(pairs.get('klein-dictionary__bdb-augmented-strong').classification_lanes.includes('noncommercial_educational_candidate'), 'Klein+BDB Augmented pair must include NC lane');
  assert(pairs.get('klein-dictionary__bdb-augmented-strong').classification_lanes.includes('blocked_or_needs_review'), 'Klein+BDB Augmented pair must include blocked lane');

  assert((artifact.exact_blockers || []).length === 23, 'exact blocker count mismatch');
  assert(artifact.exact_blockers.every((row) => typeof row.token_ids_sha256 === 'string' && row.token_ids_sha256.length === 64), 'blocker hashes malformed');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const key of noAcceptanceKeys) {
    assert(artifact.non_acceptance_boundary?.[key] === true, `${key} must be true`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    matrix_counts: artifact.matrix_counts,
    exact_blocker_count: artifact.exact_blockers.length,
    no_acceptance_claims: true,
    zero_output_counts: artifact.zero_output_counts
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
