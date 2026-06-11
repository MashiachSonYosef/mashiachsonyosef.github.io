#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-per-book-source-license-custody-contract-template-2026-06-04.json';
const resultPath = 'reports/agent1-per-book-source-license-custody-contract-template-validation-result-2026-06-04.json';

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
  assert(artifact.artifact_type === 'agent1_per_book_source_license_custody_contract_template', 'unexpected artifact_type');
  assert(['template_ready_with_current_target_blocker', 'template_ready_with_current_target_runnable'].includes(artifact.status), 'unexpected template status');
  assert(artifact.current_target?.target === 'tanakh/deuteronomy', 'current target must be tanakh/deuteronomy');
  assert(artifact.current_target?.lane === 'Agent 1 / Spark-1', 'current target lane must be Agent 1 / Spark-1');
  if (artifact.status === 'template_ready_with_current_target_runnable') {
    assert(artifact.current_target?.routable_now === true, 'current target must be routable');
    assert(artifact.current_target?.blocker === null, 'current target blocker must be null');
    assert(artifact.current_target?.current_map_counts?.row_count_covered === 1334, 'current target map rows must be 1334');
    assert(artifact.current_target?.current_map_counts?.occurrence_count_covered === 2964, 'current target map occurrences must be 2964');
    assert(artifact.current_target?.current_contract === 'reports/agent1-spark1-pipeline-contract-deuteronomy-source-license-custody-2026-06-04.json', 'current target contract must be named');
    assert(artifact.current_target?.current_contract_validator === 'node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs', 'current target contract validator must be named');
    assert(artifact.current_target?.current_lane_return === 'reports/agent1-current-source-license-custody-lane-return-2026-06-04.json', 'current lane return must be named');
  } else {
    assert(artifact.current_target?.routable_now === false, 'current target must not be routable');
    assert(artifact.current_target?.blocker === 'missing_pipeline_blocker', 'current target blocker must be missing_pipeline_blocker');
  }
  assert((artifact.required_fields || []).includes('exact input files/manifests'), 'required fields must include exact inputs');
  assert((artifact.required_fields || []).includes('validator/gate command'), 'required fields must include validator/gate command');
  assert((artifact.required_fields || []).includes('Spark-1 contract validator command'), 'required fields must include contract validator command');
  assert((artifact.required_fields || []).includes('lane-return/discovery artifact update requirement'), 'required fields must include lane-return update requirement');
  assert((artifact.required_fields || []).includes('exact blocker exposure rule for non-routable worksets'), 'required fields must include exact blocker exposure rule');
  assert(artifact.reusable_contract_schema?.contract_validator === 'node scripts/validate_agent1_spark1_<target_slug>_source_license_custody_contract.mjs', 'reusable schema must include contract validator');
  assert(artifact.reusable_contract_schema?.lane_return === 'reports/agent1-current-source-license-custody-lane-return-<date>.json', 'reusable schema must include lane return');
  assert((artifact.reusable_contract_schema?.allowed_statuses || []).includes('noncommercial_educational_candidate'), 'allowed statuses must preserve NC candidate');
  assert((artifact.reusable_contract_schema?.allowed_statuses || []).includes('metadata_or_link_only'), 'allowed statuses must include metadata_or_link_only');
  assert((artifact.reusable_contract_schema?.allowed_statuses || []).includes('blocked_or_needs_review'), 'allowed statuses must include blocked_or_needs_review');
  for (const field of ['source_family', 'source_name', 'license_label', 'license_lane', 'source_url_or_citation', 'agent6_boundary_required']) {
    assert((artifact.reusable_contract_schema?.row_fields_required || []).includes(field), `required row field missing: ${field}`);
  }
  assert(artifact.reusable_contract_schema?.nc_flags?.license_lane === 'noncommercial_educational_candidate', 'NC flags must include license lane');
  assert(artifact.reusable_contract_schema?.nc_flags?.commercial_export_allowed === false, 'NC flags must prohibit commercial export');
  assert(artifact.reusable_contract_schema?.nc_flags?.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'NC flags must include owner use attestation');
  assert(artifact.reusable_contract_schema?.nc_flags?.answer_eligible === false, 'NC flags must default answer_eligible false');
  assert(artifact.reusable_contract_schema?.nc_flags?.public_emit === false, 'NC flags must default public_emit false');
  assert(artifact.reusable_contract_schema?.export_partition_rule?.commercial_clean_exports_exclude_nc_by_default === true, 'commercial clean exports must exclude NC by default');
  assert(artifact.reusable_contract_schema?.export_partition_rule?.nc_rows_require_separate_csv_export_or_partition === true, 'NC rows must require separate export or partition');
  assert(artifact.reusable_contract_schema?.export_partition_rule?.do_not_mix_nc_into_commercial_clean_csv === true, 'NC rows must not mix into commercial clean CSV');
  assert(artifact.reusable_contract_schema?.export_partition_rule?.eligible_nc_rows_are_not_generic_blocked === true, 'eligible NC rows must not be generic blocked solely for NC');
  assert(artifact.reusable_contract_schema?.export_partition_rule?.future_contract_must_write_check_nc_educational_partition_when_schema_supplied === true, 'future contracts must write/check NC partition when schema is supplied');
  assert(artifact.lane_return_requirement?.current_output_count === 48, 'lane return output count must be 48');
  assert(artifact.lane_return_requirement?.future_per_book_contracts_must_be_exposed === true, 'future per-book contracts must be exposed');
  assert(artifact.lane_return_requirement?.non_routable_exact_blockers_must_be_exposed === true, 'non-routable exact blockers must be exposed');
  assert(artifact.boundary?.no_source_provenance_acceptance === true, 'must preserve no source/provenance acceptance');
  assert(artifact.boundary?.no_license_acceptance === true, 'must preserve no license acceptance');
  assert(artifact.boundary?.no_nc_flattening === true, 'must preserve no NC flattening');
  assert(artifact.boundary?.no_public_runtime_mutation === true, 'must preserve no public/runtime mutation');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    current_target: artifact.current_target.target,
    routable_now: artifact.current_target.routable_now,
    blocker: artifact.current_target.blocker,
    required_field_count: artifact.required_fields.length
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
