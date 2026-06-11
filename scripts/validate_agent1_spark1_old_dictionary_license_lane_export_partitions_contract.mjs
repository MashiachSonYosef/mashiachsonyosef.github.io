#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-old-dictionary-license-lane-export-partitions-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-license-lane-export-partitions-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
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
  const contract = readJson(contractPath);
  const artifact = readJson(contract.outputs.json);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'unexpected contract status');
  assert(contract.target?.workset === 'old-dictionary-license-lane-export-partitions', 'unexpected workset');
  assert(contract.command_or_script?.build === 'node scripts/build_agent1_old_dictionary_license_lane_export_partitions.mjs', 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_old_dictionary_license_lane_export_partitions.mjs', 'unexpected output validator');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_old_dictionary_license_lane_export_partitions_contract.mjs', 'unexpected contract validator');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');

  assert(artifact.artifact_type === 'agent1_old_dictionary_license_lane_export_partitions', 'unexpected partition artifact_type');
  assert(artifact.source_artifact === contract.target.source_artifact, 'source artifact mismatch');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected partition workset');

  for (const [lane, expected] of Object.entries(contract.expected_partitions || {})) {
    const count = artifact.partition_counts?.[lane];
    assert(count?.source_family_count === expected.source_family_count, `${lane} source family count mismatch`);
    assert(count?.row_count === expected.row_count, `${lane} row count mismatch`);
    assert(count?.occurrence_count === expected.occurrence_count, `${lane} occurrence count mismatch`);
    const observedFamilies = (artifact.partitions?.[lane] || []).map((row) => row.source_family).sort();
    const expectedFamilies = (expected.source_families || []).slice().sort();
    assert(JSON.stringify(observedFamilies) === JSON.stringify(expectedFamilies), `${lane} source family list mismatch`, { observedFamilies, expectedFamilies });
  }

  const nc = artifact.partitions?.noncommercial_educational_candidate?.[0];
  assert(nc?.source_family === 'Klein Dictionary', 'NC partition must be Klein Dictionary');
  assert(nc.derived_from_nc === true, 'NC partition must be derived_from_nc');
  assert(nc.commercial_export_allowed === false, 'NC partition must not allow commercial export');
  assert(nc.attribution_required === true, 'NC partition must require attribution');
  assert(nc.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'NC owner use attestation required');
  assert(nc.corpus_contamination === false, 'NC corpus contamination must be false');
  assert(nc.answer_eligible === false, 'NC answer eligibility must be false');
  assert(nc.public_emit === false, 'NC public emit must be false');

  const blocked = artifact.partitions?.blocked_or_needs_review?.[0];
  assert(blocked?.source_family === 'BDB Augmented Strong', 'blocked partition must be BDB Augmented Strong');
  assert(blocked.commercial_export_allowed === false, 'blocked partition must not allow commercial export');
  assert((blocked.missing_evidence || []).length >= 3, 'blocked partition must name missing evidence');

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(contract.export_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked/review emits no candidate text');
  assert(contract.export_rule?.commercial_export_allowed_now === false, 'contract must not authorize commercial export now');
  assert(contract.export_rule?.public_emit_now === false, 'contract must not authorize public emit now');
  assert(contract.export_rule?.answer_eligible_now === false, 'contract must not authorize answers now');
  assert(contract.agent6_boundary_need.includes('NC/Klein remains separate'), 'Agent 6 boundary must preserve NC/Klein separation');
  assert(contract.agent6_boundary_need.includes('BDB Augmented Strong remains blocked/review'), 'Agent 6 boundary must preserve blocked/review family');
  assert((contract.what_must_not_be_accepted || []).includes('candidate text export authorization'), 'candidate text export authorization must not be accepted');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    workset: contract.target.workset,
    commercial_clean_source_families: contract.target.commercial_clean_source_families,
    noncommercial_educational_source_families: contract.target.noncommercial_educational_source_families,
    blocked_or_needs_review_source_families: contract.target.blocked_or_needs_review_source_families,
    spark1_routable: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_contract: contractPath,
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
