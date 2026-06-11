#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json';
const resultPath = 'reports/agent1-orot-nc-klein-source-family-pipeline-validation-result-2026-06-04.json';

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
  const rows = artifact.nc_rows || [];
  const occurrenceSum = rows.reduce((sum, row) => sum + Number(row.occurrences || 0), 0);

  assert(artifact.artifact_type === 'agent1_orot_nc_klein_educational_source_family_map', 'unexpected artifact_type');
  assert(artifact.family_map?.status === 'noncommercial_educational_candidate', 'family status must be noncommercial_educational_candidate');
  assert(artifact.family_map?.license_lane === 'noncommercial_educational_candidate', 'family license lane must be noncommercial_educational_candidate');
  assert(artifact.family_map?.rows === 17, 'family row count must be 17');
  assert(artifact.family_map?.occurrences === 259, 'family occurrence count must be 259');
  assert(artifact.family_map?.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'family owner use attestation mismatch');
  assert(artifact.family_map?.answer_eligible === false, 'family answer_eligible must be false');
  assert(artifact.family_map?.public_emit === false, 'family public_emit must be false');
  assert(rows.length === 17, 'nc_rows length must be 17');
  assert(occurrenceSum === 259, 'nc row occurrence sum must be 259');
  assert(artifact.current_non_public_orot_package_counts?.noncommercial_educational_rows === 17, 'package NC row count must be 17');
  assert(artifact.current_non_public_orot_package_counts?.noncommercial_educational_occurrences === 259, 'package NC occurrence count must be 259');

  for (const row of rows) {
    assert(row.status === 'noncommercial_educational_candidate', 'row status mismatch', row);
    assert(row.license_lane === 'noncommercial_educational_candidate', 'row license lane mismatch', row);
    assert(row.derived_from_nc === true, 'row derived_from_nc must be true', row);
    assert(row.commercial_export_allowed === false, 'row commercial_export_allowed must be false', row);
    assert(row.noncommercial_display_allowed === false, 'row noncommercial_display_allowed must be false', row);
    assert(row.attribution_required === true, 'row attribution_required must be true', row);
    assert(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'row owner use attestation mismatch', row);
    assert(row.corpus_contamination === false, 'row corpus_contamination must be false', row);
    assert(row.answer_eligible === false, 'row answer_eligible must be false', row);
    assert(row.public_emit === false, 'row public_emit must be false', row);
  }

  assert(artifact.export_partition_rule?.commercial_clean_exports_exclude_nc_by_default === true, 'commercial clean exports must exclude NC by default');
  assert(artifact.export_partition_rule?.nc_rows_require_separate_csv_export_or_partition === true, 'NC rows must require separate export or partition');
  assert(artifact.export_partition_rule?.do_not_mix_nc_into_commercial_clean_csv === true, 'NC rows must not mix into commercial clean CSV');
  assert(artifact.export_partition_rule?.eligible_nc_rows_are_not_generic_blocked === true, 'eligible NC rows must not be generic blocked solely for NC');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }

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
