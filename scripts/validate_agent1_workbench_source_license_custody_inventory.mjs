#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-workbench-source-license-custody-inventory-2026-06-04.json';
const resultPath = 'reports/agent1-workbench-source-license-custody-inventory-validation-result-2026-06-04.json';

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
  assert(artifact.artifact_type === 'agent1_workbench_source_license_custody_inventory', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_workbench_source_license_custody_inventory_prepared_for_agent6_boundary_only', 'unexpected status');
  assert(artifact.counts?.input_file_count === 10, 'input file count must be 10');
  assert(artifact.counts?.jsonl_rows === 105747, 'jsonl row count must be 105747');
  assert(artifact.counts?.parsed_rows === 105747, 'parsed row count must be 105747');
  assert(artifact.counts?.rows_with_source_rows === 105747, 'rows with source rows must be 105747');
  assert(artifact.counts?.source_row_count === 105747, 'source row count must be 105747');
  assert(artifact.counts?.row_parse_errors === 0, 'parse errors must be zero');
  assert(artifact.counts?.unique_work_count === 1112, 'unique work count must be 1112');
  assert(artifact.source_family_counts?.hebrew_source_text === 105747, 'hebrew_source_text source family count must be 105747');

  const licenses = Object.fromEntries((artifact.license_rows || []).map((row) => [row.license_label, row]));
  assert(licenses['Public Domain']?.source_row_count === 99045, 'Public Domain count must be 99045');
  assert(licenses['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA count must be 5581');
  assert(licenses['CC-BY']?.source_row_count === 625, 'CC-BY count must be 625');
  assert(licenses.CC0?.source_row_count === 496, 'CC0 count must be 496');

  for (const row of artifact.license_rows || []) {
    assert(row.license_lane === 'commercial_clean_candidate', 'observed workbench licenses must be commercial-clean candidates pending boundary', row);
    assert(row.derived_from_nc === false, 'workbench source row must not be derived_from_nc', row);
    assert(row.corpus_contamination === false, 'corpus contamination must be false', row);
    assert(row.agent6_boundary_required === true, 'Agent 6 boundary required', row);
  }

  assert(licenses['CC-BY-SA'].share_alike_required === true, 'CC-BY-SA share_alike_required must be true');
  assert(licenses['CC-BY-SA'].commercial_export_allowed === false, 'CC-BY-SA commercial export must remain false until boundary');
  assert(licenses['CC-BY'].attribution_required === true, 'CC-BY attribution required');
  assert(licenses['Public Domain'].commercial_export_allowed === true, 'Public Domain commercial export flag should be true candidate evidence');
  assert(licenses.CC0.commercial_export_allowed === true, 'CC0 commercial export flag should be true candidate evidence');

  for (const [key, value] of Object.entries(artifact.required_field_missing_counts || {})) {
    assert(value === 0, `${key} missing count must be zero`);
  }
  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }

  assert(artifact.export_rule?.cc_by_sa_requires_share_alike_boundary === true, 'CC-BY-SA boundary flag required');
  assert(artifact.export_rule?.public_emit_now === false, 'public emit must remain false');
  assert(artifact.export_rule?.answer_eligible_now === false, 'answer eligibility must remain false');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    input_file_count: artifact.counts.input_file_count,
    source_row_count: artifact.counts.source_row_count,
    license_count: artifact.license_rows.length,
    unique_work_count: artifact.counts.unique_work_count
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
