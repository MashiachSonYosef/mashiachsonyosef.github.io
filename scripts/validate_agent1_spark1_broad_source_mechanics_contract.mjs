#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-broad-source-mechanics-queue-package-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-broad-source-mechanics-queue-package-validation-result-2026-06-04.json';

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
  const pkg = readJson(contract.outputs.package_json);
  const allowed = new Set([
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ]);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected contract artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated_with_exact_linkage_blocker', 'unexpected contract status');
  assert(contract.target?.queue_item === 'spark1-broad-source-mechanics', 'unexpected queue item');
  assert(contract.target?.source_row_targets === 4, 'source row targets must be 4');
  assert(contract.target?.source_row_occurrences === 19, 'source row occurrences must be 19');
  assert(contract.target?.missing_linkage_rows === 13, 'missing linkage rows must be 13');
  assert(contract.target?.missing_linkage_occurrences === 129, 'missing linkage occurrences must be 129');

  for (const input of contract.inputs || []) {
    assert(exists(input), `missing input: ${input}`);
  }

  for (const command of contract.command_or_script?.build_commands || []) {
    assert(command.startsWith('node scripts/'), 'build command must be named node script command', command);
  }

  for (const outputPath of Object.values(contract.outputs || {})) {
    assert(exists(outputPath), `missing output: ${outputPath}`);
  }

  for (const lane of contract.required_classifications || []) {
    assert(allowed.has(lane), `unexpected required classification: ${lane}`);
  }

  assert(pkg.artifact_type === 'agent1_broad_source_mechanics_queue_package', 'unexpected package artifact type');
  assert(pkg.queue_item === contract.target.queue_item, 'package queue item mismatch');
  assert(pkg.source_row_evidence?.target_rows === contract.target.source_row_targets, 'package source target mismatch');
  assert(pkg.source_row_evidence?.token_occurrences === contract.target.source_row_occurrences, 'package source occurrences mismatch');
  assert(pkg.missing_linkage_evidence?.missing_lexicon_linkage_rows === contract.target.missing_linkage_rows, 'package missing linkage rows mismatch');
  assert(pkg.missing_linkage_evidence?.missing_lexicon_linkage_occurrences === contract.target.missing_linkage_occurrences, 'package missing linkage occurrences mismatch');
  assert(pkg.missing_linkage_evidence?.license_lane === 'metadata_or_link_only', 'missing linkage lane must be metadata_or_link_only');

  for (const lane of pkg.source_row_evidence?.license_lanes || []) {
    assert(lane.license_lane === 'commercial_clean_candidate', 'source row lane must be commercial clean', lane);
    assert(lane.commercial_export_allowed === false, 'commercial export must be false until boundary', lane);
    assert(lane.agent6_boundary_required === true, 'Agent 6 boundary required for source rows', lane);
  }

  assert(contract.exact_blocker?.status === 'missing_linkage_assignment_rule_blocker', 'exact linkage blocker status required');
  assert(contract.exact_blocker?.rows === 13, 'exact blocker rows must be 13');
  assert(contract.exact_blocker?.disallowed_action === 'Do not assign lexicon_entry_id values from this contract.', 'lexicon assignment must be disallowed');
  assert(contract.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(contract.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(contract.export_rule?.metadata_or_link_only_emits_citation_link_only === true, 'metadata/link-only emits citation/link only');
  assert(contract.agent6_boundary_need.includes('Agent 6'), 'Agent 6 boundary must be named');

  const result = {
    ok: true,
    validated_contract: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    queue_item: contract.target.queue_item,
    source_row_targets: contract.target.source_row_targets,
    missing_linkage_rows: contract.target.missing_linkage_rows,
    exact_blocker: contract.exact_blocker.status,
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
