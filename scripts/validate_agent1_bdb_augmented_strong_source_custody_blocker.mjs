#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.json';
const resultPath = 'reports/agent1-bdb-augmented-strong-source-custody-blocker-validation-result-2026-06-05.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
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
  const source = artifact.source_family || {};
  const blocker = artifact.exact_blocker || {};
  const boundary = artifact.non_acceptance_boundary || {};

  assert(artifact.artifact_type === 'agent1_bdb_augmented_strong_source_custody_blocker', 'unexpected artifact_type');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');
  assert(artifact.status === 'exact_blocker_preserved_no_independent_source_license_custody_basis', 'unexpected status');
  assert(source.source_family === 'BDB Augmented Strong', 'unexpected source family');
  assert(source.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must remain blocked_or_needs_review');
  assert(source.rows === 222, 'BDB Augmented Strong row count must be 222');
  assert(source.occurrences === 4435, 'BDB Augmented Strong occurrence count must be 4435');
  assert(source.derived_from_nc === false, 'BDB Augmented Strong must not be derived_from_nc');
  assert(source.commercial_export_allowed === false, 'BDB Augmented Strong commercial export must be false');
  assert(source.corpus_contamination === false, 'BDB Augmented Strong corpus_contamination must be false');
  assert(source.nc_flags === null, 'BDB Augmented Strong must not carry NC flags');
  assert(blocker.license_lane === 'blocked_or_needs_review', 'blocker lane mismatch');
  assert(blocker.observed_endpoint === 'https://www.sefaria.org/api/texts/versions/BDB%20Augmented%20Strong', 'unexpected observed endpoint');
  assert(blocker.observed_endpoint_http_status === 200, 'unexpected observed endpoint status');
  assert(blocker.observed_response_sha256 === '8932c7a2f127ae398070610dad327349b74d45850947e4d60af1fc91274fd1d8', 'unexpected response hash');
  assert(blocker.observed_license === null, 'observed license must remain null');
  assert(blocker.observed_version_source === null, 'observed version source must remain null');
  assert(blocker.repository_candidate_source_file_count === 0, 'candidate data/sources file appeared; rerun source custody classification', artifact.source_repository_probe);
  for (const required of [
    'independent source/license/custody basis',
    'source URL or version source',
    'license label and allowed fields',
    'Agent 6 boundary if evidence appears'
  ]) {
    assert((blocker.missing_evidence || []).includes(required), `missing blocker evidence: ${required}`);
  }
  assert(artifact.agent6_verdict?.agent6_final_status_for_non_public_planning === 'blocked', 'Agent 6 verdict must remain blocked');
  assert(artifact.agent6_verdict?.planning_use_allowed === false, 'planning use must remain false');
  assert(artifact.agent6_verdict?.public_or_runtime_use_authorized === false, 'public/runtime use must remain false');
  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  for (const key of [
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
    'no_public_runtime_mutation',
    'no_queue_mutation',
    'no_staging'
  ]) {
    assert(boundary[key] === true, `${key} boundary must be true`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_family: source.source_family,
    license_lane: source.license_lane,
    rows: source.rows,
    occurrences: source.occurrences,
    repository_candidate_source_file_count: blocker.repository_candidate_source_file_count,
    exact_blocker_id: blocker.id
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
      no_source_license_acceptance: true,
      no_qa_acceptance: true,
      no_public_runtime_mutation: true
    }
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
