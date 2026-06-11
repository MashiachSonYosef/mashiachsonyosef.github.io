#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-orot-next-missed-source-family-map-2026-06-04.json';
const resultPath = 'reports/agent1-orot-next-missed-source-family-pipeline-validation-result-2026-06-04.json';

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
  const rows = artifact.rows || [];
  const occurrenceSum = rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);

  assert(artifact.artifact_type === 'agent1_orot_next_missed_source_family_map', 'unexpected artifact_type');
  assert(artifact.target_counts?.candidate_rows === 50, 'candidate_rows must be 50');
  assert(artifact.target_counts?.candidate_occurrences === 1193, 'candidate_occurrences must be 1193');
  assert(artifact.target_counts?.commercial_clean_candidate_rows === 50, 'commercial_clean_candidate_rows must be 50');
  assert(artifact.target_counts?.noncommercial_educational_candidate_rows === 0, 'NC candidate rows must be 0');
  assert(rows.length === 50, 'rows length must be 50');
  assert(occurrenceSum === 1193, 'row occurrence sum must be 1193');

  for (const row of rows) {
    assert(row.status === 'commercial_clean_candidate', 'row status must be commercial_clean_candidate', row);
    assert(row.license_lane === 'commercial_clean_candidate', 'row license_lane must be commercial_clean_candidate', row);
    assert(typeof row.source_family === 'string' && row.source_family.length > 0, 'row source_family is required', row);
    assert(typeof row.source_name === 'string' && row.source_name.length > 0, 'row source_name is required', row);
    assert(typeof row.license_label === 'string' && row.license_label.length > 0, 'row license_label is required', row);
    assert(row.source_license_group === 'PUBLIC_DOMAIN_OBSERVED', 'row source_license_group must be PUBLIC_DOMAIN_OBSERVED', row);
    assert(row.derived_from_nc === false, 'row derived_from_nc must be false', row);
    assert(row.commercial_export_allowed === false, 'row commercial_export_allowed must be false until boundary', row);
    assert(row.owner_use_attestation === null, 'commercial-clean row owner_use_attestation must be null', row);
    assert(row.corpus_contamination === false, 'row corpus_contamination must be false', row);
    assert(typeof row.source_url_or_citation === 'string' && row.source_url_or_citation.length > 0, 'row source_url_or_citation is required', row);
    assert(row.agent6_boundary_required === true, 'row agent6_boundary_required must be true', row);
    assert(row.definition_text_stored_now === false, 'definition_text_stored_now must be false', row);
    assert(row.answer_eligible === false, 'answer_eligible must be false', row);
    assert(row.public_emit === false, 'public_emit must be false', row);
    assert(row.public_emit_ready === false, 'public_emit_ready must be false', row);
  }

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }

  assert((artifact.source_family_blockers || []).some((blocker) => blocker.family === 'BDB Augmented Strong'), 'BDB Augmented Strong blocker must be preserved');
  assert((artifact.source_family_blockers || []).some((blocker) => blocker.family === 'BDB Augmented Strong' && blocker.license_lane === 'blocked_or_needs_review'), 'BDB Augmented Strong must be blocked_or_needs_review');
  assert(artifact.export_partition_rule?.commercial_clean_exports_exclude_nc_by_default === true, 'commercial clean exports must exclude NC by default');
  assert(artifact.export_partition_rule?.nc_rows_require_separate_csv_export_or_partition === true, 'NC rows must require separate export or partition');
  assert(artifact.export_partition_rule?.do_not_mix_nc_into_commercial_clean_csv === true, 'NC rows must not mix into commercial clean CSV');
  assert(artifact.export_partition_rule?.metadata_or_link_only_rows_do_not_emit_definition_text === true, 'metadata/link-only rows must not emit definition text');
  assert(artifact.export_partition_rule?.blocked_or_needs_review_rows_stay_out_of_candidate_text_exports === true, 'blocked/review rows must stay out of candidate text exports');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    rows: rows.length,
    occurrences: occurrenceSum,
    status: artifact.status,
    boundary: artifact.non_acceptance_boundary
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
