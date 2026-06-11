#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-broad-source-mechanics-queue-package-2026-06-04.json';
const resultPath = 'reports/agent1-broad-source-mechanics-queue-package-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const artifact = readJson(artifactPath);
  assert(artifact.artifact_type === 'agent1_broad_source_mechanics_queue_package', 'unexpected artifact_type');
  assert(artifact.queue_item === 'spark1-broad-source-mechanics', 'unexpected queue item');
  assert(artifact.source_row_evidence?.status === 'pipeline_source_rows_clear', 'source row evidence must be clear');
  assert(artifact.source_row_evidence?.target_rows === 4, 'source row target count must be 4');
  assert(artifact.source_row_evidence?.token_occurrences === 19, 'source row occurrences must be 19');
  assert(artifact.source_row_evidence?.incomplete_curated_rows_attached === 0, 'incomplete curated rows must be 0');
  assert((artifact.source_row_evidence?.license_lanes || []).every((row) => row.license_lane === 'commercial_clean_candidate'), 'source row lanes must be commercial clean candidates');
  assert((artifact.source_row_evidence?.license_lanes || []).every((row) => row.agent6_boundary_required === true), 'source row lanes require Agent 6 boundary');
  assert(artifact.missing_linkage_evidence?.missing_lexicon_linkage_rows === 13, 'missing linkage rows must be 13');
  assert(artifact.missing_linkage_evidence?.missing_lexicon_linkage_occurrences === 129, 'missing linkage occurrences must be 129');
  assert(artifact.missing_linkage_evidence?.license_lane === 'metadata_or_link_only', 'missing linkage lane must be metadata_or_link_only');
  assert(artifact.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial clean export must exclude NC');
  assert(artifact.export_rule?.nc_educational_export_separate === true, 'NC educational export must be separate');
  assert(artifact.export_rule?.metadata_or_link_only_emits_citation_link_only === true, 'metadata/link-only must emit citation/link only');
  assert(artifact.export_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked/review must emit no candidate text');
  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    queue_item: artifact.queue_item,
    source_row_targets: artifact.source_row_evidence.target_rows,
    missing_linkage_rows: artifact.missing_linkage_evidence.missing_lexicon_linkage_rows
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
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
