#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const statusPath = process.argv[2] || 'reports/agent1-weekly-source-license-custody-pipeline-authoring-status-2026-06-04.md';
const resultPath = 'reports/agent1-weekly-source-license-custody-pipeline-authoring-status-validation-result-2026-06-04.json';

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

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
  const text = readText(statusPath);
  const aggregate = readJson('reports/agent1-source-license-custody-pipeline-set-validation-result-2026-06-04.json');
  const laneReturn = readJson('reports/agent1-current-source-license-custody-lane-return-validation-result-2026-06-04.json');
  const registry = readJson('reports/agent1-source-license-custody-pipeline-registry-validation-result-2026-06-04.json');

  assert(text.includes('# Agent 1 Weekly Source/License/Custody Pipeline Authoring Status - 2026-06-04'), 'title missing');
  for (const section of [
    '## Pipeline 1',
    '## Pipeline 2',
    '## Pipeline 3',
    '## Per-Book Pipeline Target: Deuteronomy',
    '## Reusable Per-Book Contract Template',
    '## Old Dictionary Excluded Row Reaudit',
    '## Broad Source Mechanics Queue Package',
    '## Current Source/License/Custody Lane Return',
    '## Aggregate Pipeline-Set Gate',
    '## Boundary'
  ]) {
    assert(text.includes(section), `required section missing: ${section}`);
  }

  assert(text.includes('current outputs returned: `48`'), 'current lane-return count must be 48');
  assert(text.includes('Workbench CC-BY attribution boundary map: `5` declared partitions / `625` rows; sampled `1` / `239`; attribution_required=true; `cc_by_export_authorized_now=false`'), 'CC-BY attribution boundary summary missing');
  assert(text.includes('Workbench CC0 public-domain-zero boundary map: `2` declared partitions / `496` rows; sampled `1` / `267`; `cc0_export_authorized_now=false`'), 'CC0 public-domain-zero boundary summary missing');
  assert(text.includes('Workbench Public Domain boundary map: `307` declared partitions / `99045` rows; sampled `93` / `88100`; `public_domain_export_authorized_now=false`'), 'Public Domain boundary summary missing');
  assert(text.includes('Workbench full source-name custody partitions: `351` full partitions / `105747` rows; license partitions `307` Public Domain, `37` CC-BY-SA, `5` CC-BY, `2` CC0'), 'full source-name partition summary missing');
  assert(text.includes('Workbench license-bucket boundary matrix: `4` buckets / `351` partitions / `105747` rows; export_authorized_now=false for all buckets'), 'license-bucket boundary matrix summary missing');
  assert(text.includes('Workbench source-family boundary matrix: `1` family / `351` partitions / `105747` rows; export_authorized_now=false'), 'source-family boundary matrix summary missing');
  assert(text.includes('Workbench source-family/license-lane partitions: `4` partitions / `351` source-name partitions / `105747` rows; export_authorized_now=false'), 'source-family/license-lane partition summary missing');
  assert(text.includes('Workbench source-family/license-lane Agent 6 boundary packet: `4` boundary questions / `351` source-name partitions / `105747` rows; release-owner routing required'), 'source-family/license-lane Agent 6 boundary packet summary missing');
  assert(text.includes('Workbench source-family/license-lane release-intake packet: `4` intake rows / `4` boundary questions / `105747` rows; Agent 10 handoff only'), 'source-family/license-lane release-intake packet summary missing');
  assert(text.includes('Old dictionary Agent 2 transform-lane handoff: `5` source families / `500` audited rows / `0` transform-authorized rows now'), 'old dictionary Agent 2 handoff summary missing');
  assert(text.includes('Old dictionary planning boundary state: `5` source families / `500` audited rows / `0` candidate-text rows now'), 'old dictionary planning boundary state summary missing');
  assert(text.includes('Broad workbench token inventory 5000 source-lane blocker: `5000` token rows / `5000` source-lane blocker rows / `0` candidate-text rows'), '5000-token source-lane blocker summary missing');
  assert(text.includes('Aggregate pipeline-set gate: `22` runnable contracts, `24` supporting packets, `1` exact blocker, `48` lane-return outputs'), 'aggregate gate summary missing or stale');
  assert(text.includes('Contract 3 exact blocker: `169` rows / `2148` occurrences checked'), 'Contract 3 blocker count missing');
  assert(text.includes('Source/license/custody registry: `22` runnable contracts, `24` supporting packets, `1` exact blocker'), 'registry summary missing');

  for (const command of [
    'node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs',
    'node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs',
    'node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs',
    'node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs',
    'node scripts/validate_agent1_spark1_old_dictionary_agent2_transform_lane_handoff_contract.mjs',
    'node scripts/validate_agent1_spark1_old_dictionary_planning_boundary_state_contract.mjs',
    'node scripts/validate_agent1_spark1_broad_workbench_token_inventory_5000_source_lane_blocker_contract.mjs',
    'node scripts/validate_agent1_spark1_broad_source_mechanics_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_source_license_custody_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_full_source_name_custody_partitions_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_license_bucket_boundary_matrix_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_source_family_boundary_matrix_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_partitions_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_agent6_boundary_packet_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_release_intake_packet_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_cc_by_attribution_boundary_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_cc0_public_domain_zero_boundary_contract.mjs',
    'node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs',
    'node scripts/validate_agent1_current_source_license_custody_lane_return.mjs',
    'node scripts/validate_agent1_source_license_custody_pipeline_set.mjs'
  ]) {
    assert(text.includes(command), `validator command missing: ${command}`);
  }

  assert(aggregate.ok === true, 'aggregate validation result must be ok');
  assert(aggregate.runnable_contract_count === 22, 'aggregate runnable contract count must be 22');
  assert(aggregate.supporting_packet_count === 24, 'aggregate supporting packet count must be 24');
  assert(aggregate.exact_blocker_count === 1, 'aggregate exact blocker count must be 1');
  assert(aggregate.lane_return_output_count === 48, 'aggregate lane-return output count must be 48');
  assert(laneReturn.ok === true && laneReturn.output_count === 48, 'lane-return validation result must be ok with output_count 48');
  assert(registry.ok === true && registry.runnable_contract_count === 22, 'registry validation result must be ok with 22 runnable contracts');

  assert(text.includes('No source/license acceptance'), 'boundary must preserve no source/license acceptance');
  assert(text.includes('no NC flattening'), 'boundary must preserve no NC flattening');
  assert(text.includes('no QA acceptance'), 'boundary must preserve no QA acceptance');
  assert(text.includes('accepted gloss/text'), 'boundary must mention no accepted gloss/text');
  assert(text.includes('public/runtime mutation'), 'boundary must mention no public/runtime mutation');

  const stalePatterns = [
    ['missing', 'script', 'blocker'].join('_'),
    ['missing', 'validator', 'blocker'].join('_'),
    ['pipeline', 'contract', 'authored', 'missing', 'script', 'and', 'validator'].join('_'),
    [
      'scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs',
      'and',
      'scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs',
      'are',
      'missing'
    ].join(' '),
    ['current outputs returned:', '`9`'].join(' '),
    ['current outputs returned:', '`10`'].join(' ')
  ];
  for (const pattern of stalePatterns) {
    assert(!text.includes(pattern), `stale text present: ${pattern}`);
  }

  const result = {
    ok: true,
    validated_artifact: statusPath,
    completed_at: new Date().toISOString(),
    status: 'agent1_weekly_source_license_custody_pipeline_authoring_status_validated',
    runnable_contract_count: aggregate.runnable_contract_count,
    supporting_packet_count: aggregate.supporting_packet_count,
    exact_blocker_count: aggregate.exact_blocker_count,
    lane_return_output_count: aggregate.lane_return_output_count
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: statusPath,
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
