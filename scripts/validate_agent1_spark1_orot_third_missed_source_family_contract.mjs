#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-validation-result-2026-06-05.json';

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
  const output = readJson(contract.outputs.json);
  const expectedRows = 169;
  const expectedOccurrences = 2148;
  const allowedLanes = new Set([
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ]);

  assert(contract.schema_version === 1, 'schema_version must be 1');
  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected contract artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'contract status must be runnable validated');
  assert(contract.target?.work === 'Orot', 'target work must be Orot');
  assert(contract.target?.candidate_rows === expectedRows, 'candidate_rows must be 169');
  assert(contract.target?.candidate_occurrences === expectedOccurrences, 'candidate_occurrences must be 2148');
  assert(contract.target?.commercial_clean_candidate_rows + contract.target?.noncommercial_educational_candidate_rows + contract.target?.metadata_or_link_only_rows + contract.target?.blocked_or_needs_review_rows === expectedRows,
    'contract target lane row totals must sum to candidate rows');
  assert(contract.target?.candidate_rows === (
    contract.target?.commercial_clean_candidate_rows +
    contract.target?.noncommercial_educational_candidate_rows +
    contract.target?.metadata_or_link_only_rows +
    contract.target?.blocked_or_needs_review_rows
  ), 'contract target lane row sum mismatch');
  assert(contract.target?.candidate_occurrences === (
    contract.target?.commercial_clean_candidate_occurrences +
    contract.target?.noncommercial_educational_candidate_occurrences +
    contract.target?.metadata_or_link_only_occurrences +
    contract.target?.blocked_or_needs_review_occurrences
  ), 'contract target lane occurrence sum mismatch');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }

  assert(contract.command_or_script?.build === 'node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs', 'unexpected build command');
  assert(contract.validator?.command === 'node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs', 'unexpected output validator');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs', 'unexpected contract validator');
  assert(exists('scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs'), 'missing build script');
  assert(exists('scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs'), 'missing output validator script');
  assert(exists(contract.outputs.json), 'missing output json');
  assert(exists(contract.outputs.markdown), 'missing output markdown');

  for (const lane of contract.required_classifications || []) {
    assert(allowedLanes.has(lane), `unexpected required lane: ${lane}`);
  }

  assert(output.artifact_type === 'agent1_orot_third_missed_source_family_map', 'unexpected output artifact_type');
  assert(output.target_counts?.candidate_rows === expectedRows, 'output candidate rows must be 169');
  assert(output.target_counts?.candidate_occurrences === expectedOccurrences, 'output candidate occurrences must be 2148');
  assert(output.target_counts?.commercial_clean_candidate_rows === contract.target.commercial_clean_candidate_rows, 'commercial-clean candidate row mismatch to contract');
  assert(output.target_counts?.noncommercial_educational_candidate_rows === contract.target.noncommercial_educational_candidate_rows, 'NC candidate row mismatch to contract');
  assert(output.target_counts?.metadata_or_link_only_rows === contract.target.metadata_or_link_only_rows, 'metadata/link-only row mismatch to contract');
  assert(output.target_counts?.blocked_or_needs_review_rows === contract.target.blocked_or_needs_review_rows, 'blocked/review row mismatch to contract');

  assert(output.target_counts?.candidate_rows === (
    output.target_counts?.commercial_clean_candidate_rows +
    output.target_counts?.noncommercial_educational_candidate_rows +
    output.target_counts?.metadata_or_link_only_rows +
    output.target_counts?.blocked_or_needs_review_rows
  ), 'output lane row split must sum to candidate rows');
  const outputLaneOccurrenceMap = (output.rows || []).reduce((acc, row) => {
    const lane = row?.license_lane || 'unknown';
    acc[lane] = (acc[lane] || 0) + Number(row?.occurrences || 0);
    return acc;
  }, {});
  const nonNegativeInt = (value, label) => {
    const normalized = Number(value || 0);
    assert(!Number.isNaN(normalized) && normalized >= 0 && Number.isInteger(normalized), `${label} must be non-negative integer`);
  };
  const outputCommercialOcc = Number(output.target_counts?.commercial_clean_candidate_occurrences || outputLaneOccurrenceMap.commercial_clean_candidate || 0);
  const outputNcOcc = Number(output.target_counts?.noncommercial_educational_candidate_occurrences || outputLaneOccurrenceMap.noncommercial_educational_candidate || 0);
  const outputMetaLinkOcc = Number(output.target_counts?.metadata_or_link_only_occurrences || outputLaneOccurrenceMap.metadata_or_link_only || 0);
  const outputBlockedOcc = Number(output.target_counts?.blocked_or_needs_review_occurrences || outputLaneOccurrenceMap.blocked_or_needs_review || 0);
  const outputCandidateOcc = output.target_counts?.candidate_occurrences || outputLaneOccurrenceMap.commercial_clean_candidate + outputLaneOccurrenceMap.noncommercial_educational_candidate + outputLaneOccurrenceMap.metadata_or_link_only + outputLaneOccurrenceMap.blocked_or_needs_review;
  nonNegativeInt(outputCommercialOcc, 'commercial-clean occurrence');
  nonNegativeInt(outputNcOcc, 'NC occurrence');
  nonNegativeInt(outputMetaLinkOcc, 'metadata/link-only occurrence');
  nonNegativeInt(outputBlockedOcc, 'blocked occurrence');
  nonNegativeInt(outputCandidateOcc, 'output candidate occurrence');
  assert(outputCandidateOcc === expectedOccurrences, 'output candidate occurrence must be 2148');
  assert(outputCommercialOcc + outputNcOcc + outputMetaLinkOcc + outputBlockedOcc === outputCandidateOcc, 'output occurrence split must sum to candidate occurrences');

  assert(output.export_partition_rule?.commercial_clean_exports_exclude_nc_by_default === true, 'commercial-clean export separation must be true');
  assert(output.export_partition_rule?.nc_educational_export_separate === true, 'NC separate export flag must be true');
  assert(output.export_partition_rule?.do_not_mix_nc_into_commercial_clean_csv === true, 'NC mix prevention flag must be true');
  assert(output.export_partition_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked lane emission rule must be false');

  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'contract export rule must exclude NC from commercial-clean');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'contract export rule must require separate NC export');
  assert(contract.export_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'contract blocked emission rule must be no candidate text');

  for (const row of output.rows || []) {
    assert(allowedLanes.has(row.license_lane), `unexpected license_lane: ${row.license_lane}`);
    assert(typeof row.attribution_required === 'boolean', 'row attribution_required must be boolean');
    assert(typeof row.derived_from_nc === 'boolean', 'row derived_from_nc must be boolean');
    assert(typeof row.commercial_export_allowed === 'boolean', 'row commercial_export_allowed must be boolean');
    assert(typeof row.answer_eligible === 'boolean', 'row answer_eligible must be boolean');
    assert(typeof row.public_emit === 'boolean', 'row public_emit must be boolean');
    assert(typeof row.agent6_boundary_required === 'boolean', 'row agent6_boundary_required must be boolean');
  }

  const contractNeed = (contract.agent6_boundary_need || '').includes('Agent 6');
  assert(contractNeed, 'agent6 boundary question must mention Agent 6');
  assert(contract.package_owner === 'Agent 1', 'package_owner must be Agent 1');
  assert(contract.spark1_stop_condition && contract.spark1_stop_condition.length > 0, 'spark1_stop_condition required');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    contract_target_rows: contract.target.candidate_rows,
    contract_target_occurrences: contract.target.candidate_occurrences,
    output_rows: output.target_counts?.candidate_rows,
    output_occurrences: output.target_counts?.candidate_occurrences,
    lanes: {
      commercial_clean_candidate: contract.target.commercial_clean_candidate_rows,
      noncommercial_educational_candidate: contract.target.noncommercial_educational_candidate_rows,
      metadata_or_link_only: contract.target.metadata_or_link_only_rows,
      blocked_or_needs_review: contract.target.blocked_or_needs_review_rows
    },
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
