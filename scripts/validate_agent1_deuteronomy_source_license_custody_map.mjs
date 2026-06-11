#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json';
const resultPath = 'reports/agent1-deuteronomy-source-license-custody-map-validation-result-2026-06-04.json';

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

  assert(artifact.artifact_type === 'agent1_deuteronomy_source_license_custody_map', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_deuteronomy_source_license_custody_map_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.target === 'tanakh/deuteronomy', 'target must be tanakh/deuteronomy');
  assert(artifact.lane === 'Agent 1 / Spark-1', 'lane must be Agent 1 / Spark-1');
  assert(artifact.source_license_counts?.row_count_covered === 1334, 'row count covered must be 1334');
  assert(artifact.source_license_counts?.occurrence_count_covered === 2964, 'occurrence count covered must be 2964');
  assert(rows.length === 1334, 'rows length must be 1334');
  assert(occurrenceSum === 2964, 'row occurrence sum must be 2964');
  assert(artifact.source_license_counts?.commercial_clean_rows === 1334, 'commercial clean rows must be 1334');
  assert(artifact.source_license_counts?.noncommercial_educational_rows === 0, 'NC rows must be 0');
  assert(artifact.source_license_counts?.metadata_or_link_only_rows === 0, 'metadata/link-only rows must be 0');
  assert(artifact.source_license_counts?.blocked_or_needs_review_rows === 0, 'blocked/review rows must be 0 for covered workset');

  for (const row of rows) {
    assert(row.license_lane === 'commercial_clean_candidate', 'row license lane must be commercial_clean_candidate', row);
    assert(typeof row.source_family === 'string' && row.source_family.length > 0, 'row source_family required', row);
    assert(typeof row.source_name === 'string' && row.source_name.length > 0, 'row source_name required', row);
    assert(typeof row.license_label === 'string' && row.license_label.length > 0, 'row license_label required', row);
    assert(row.derived_from_nc === false, 'row derived_from_nc must be false', row);
    assert(row.commercial_export_allowed === false, 'row commercial_export_allowed must be false until boundary', row);
    assert(row.corpus_contamination === false, 'row corpus_contamination must be false', row);
    assert(typeof row.source_url_or_citation === 'string' && row.source_url_or_citation.length > 0, 'row source_url_or_citation required', row);
    assert(row.agent6_boundary_required === true, 'row agent6_boundary_required must be true', row);
    assert(row.answer_eligible === false, 'row answer_eligible must be false', row);
    assert(row.public_emit === false, 'row public_emit must be false', row);
    assert(row.definition_text_stored_now === false, 'row definition_text_stored_now must be false', row);
    assert(row.accepted_text_now === false, 'row accepted_text_now must be false', row);
  }

  assert(artifact.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial clean export must exclude NC');
  assert(artifact.export_rule?.nc_educational_export_separate === true, 'NC educational export must be separate');
  assert(artifact.export_rule?.commercial_export_allowed_now === false, 'commercial export not allowed now');
  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  assert(artifact.boundary?.no_source_provenance_acceptance === true, 'no source/provenance acceptance boundary missing');
  assert(artifact.boundary?.no_license_acceptance === true, 'no license acceptance boundary missing');
  assert(artifact.boundary?.no_nc_flattening === true, 'no NC flattening boundary missing');
  assert(artifact.boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    target: artifact.target,
    rows: rows.length,
    occurrences: occurrenceSum,
    commercial_clean_rows: artifact.source_license_counts.commercial_clean_rows,
    nc_rows: artifact.source_license_counts.noncommercial_educational_rows,
    spark1_routable: true
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
