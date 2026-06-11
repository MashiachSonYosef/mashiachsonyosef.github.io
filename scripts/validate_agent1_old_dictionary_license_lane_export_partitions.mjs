#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json';
const resultPath = 'reports/agent1-old-dictionary-license-lane-export-partitions-validation-result-2026-06-04.json';

const lanes = [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review'
];

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
  assert(artifact.artifact_type === 'agent1_old_dictionary_license_lane_export_partitions', 'unexpected artifact_type');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');

  for (const lane of lanes) {
    assert(Array.isArray(artifact.partitions?.[lane]), `partition missing for ${lane}`);
    assert(artifact.partition_counts?.[lane]?.source_family_count === artifact.partitions[lane].length, `source family count mismatch for ${lane}`);
  }

  assert(artifact.count_semantics?.partition_counts_are_source_family_hit_totals === true, 'count semantics must declare source-family hit totals');
  assert(artifact.count_semantics?.row_count_is_not_exclusive_export_row_count === true, 'count semantics must prevent exclusive row-count reading');
  assert(artifact.count_semantics?.exclusive_export_row_counts_authorized_now === false, 'exclusive export row counts must not be authorized now');

  assert(artifact.partitions.commercial_clean_candidate.length === 3, 'commercial-clean partition must contain three source families');
  assert(artifact.partitions.noncommercial_educational_candidate.length === 1, 'NC educational partition must contain one source family');
  assert(artifact.partitions.metadata_or_link_only.length === 0, 'metadata/link-only partition must be empty for current evidence');
  assert(artifact.partitions.blocked_or_needs_review.length === 1, 'blocked/review partition must contain one source family');

  const commercialNames = artifact.partitions.commercial_clean_candidate.map((family) => family.source_family).sort();
  assert(JSON.stringify(commercialNames) === JSON.stringify(['BDB Aramaic Dictionary', 'BDB Dictionary', 'Jastrow Dictionary']), 'unexpected commercial-clean source families', commercialNames);

  const nc = artifact.partitions.noncommercial_educational_candidate[0];
  assert(nc.source_family === 'Klein Dictionary', 'NC partition must be Klein Dictionary');
  assert(nc.derived_from_nc === true, 'NC partition derived_from_nc must be true');
  assert(nc.commercial_export_allowed === false, 'NC partition commercial export must be false');
  assert(nc.attribution_required === true, 'NC partition attribution_required must be true');
  assert(nc.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'NC owner_use_attestation required');
  assert(nc.corpus_contamination === false, 'NC corpus_contamination must be false');
  assert(nc.answer_eligible === false, 'NC answer_eligible must be false');
  assert(nc.public_emit === false, 'NC public_emit must be false');

  const blocked = artifact.partitions.blocked_or_needs_review[0];
  assert(blocked.source_family === 'BDB Augmented Strong', 'blocked partition must be BDB Augmented Strong');
  assert(blocked.commercial_export_allowed === false, 'blocked partition commercial export must be false');
  assert((blocked.missing_evidence || []).length >= 3, 'blocked partition must name missing evidence');

  for (const family of artifact.partitions.commercial_clean_candidate) {
    assert(family.commercial_export_allowed === true, 'commercial-clean partition rows must carry commercial_export_allowed=true', family);
    assert(family.derived_from_nc === false, 'commercial-clean partition must not be derived_from_nc', family);
    assert(family.answer_eligible === false, 'commercial-clean answer_eligible remains false until boundary', family);
    assert(family.public_emit === false, 'commercial-clean public_emit remains false until boundary', family);
  }

  assert(artifact.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(artifact.export_rule?.nc_educational_export_separate === true, 'NC educational export must be separate');
  assert(artifact.export_rule?.commercial_export_allowed_now === false, 'packet must not authorize commercial export now');
  assert(artifact.export_rule?.public_emit_now === false, 'packet must not authorize public emit now');
  assert(artifact.export_rule?.answer_eligible_now === false, 'packet must not authorize answers now');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    partition_counts: artifact.partition_counts
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
