#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json';
const resultPath = 'reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json';

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
  const families = artifact.source_families || [];
  const byFamily = Object.fromEntries(families.map((family) => [family.source_family, family]));
  const allowed = new Set([
    'commercial_clean_candidate',
    'noncommercial_educational_candidate',
    'metadata_or_link_only',
    'blocked_or_needs_review'
  ]);

  assert(artifact.artifact_type === 'agent1_old_dictionary_excluded_row_license_lane_reaudit', 'unexpected artifact_type');
  assert(artifact.workset === 'old-dictionary-excluded-row-license-lane-reaudit', 'unexpected workset');
  assert(artifact.evidence_counts?.audited_rows === 500, 'audited row count must be 500');
  assert(artifact.evidence_counts?.public_domain_observed_rows === 297, 'public domain observed rows must be 297');
  assert(artifact.evidence_counts?.blocked_only_non_public_domain_or_unresolved_rows === 17, 'blocked/non-public row count must be 17');
  assert(families.length === 5, 'expected five dictionary source families');

  for (const family of families) {
    assert(allowed.has(family.license_lane), 'unexpected license lane', family);
    assert(typeof family.source_name === 'string' && family.source_name.length > 0, 'source_name required', family);
    assert(typeof family.row_subset_id === 'string' && family.row_subset_id.startsWith('old-dictionary-excluded-row-license-lane-reaudit::'), 'row_subset_id required', family);
    assert(typeof family.evidence_path === 'string' && family.evidence_path.length > 0, 'evidence_path required', family);
    assert(typeof family.license_label === 'string' && family.license_label.length > 0, 'license_label required', family);
    assert(typeof family.derived_from_nc === 'boolean', 'derived_from_nc flag required', family);
    assert(typeof family.commercial_export_allowed === 'boolean', 'commercial_export_allowed flag required', family);
    assert(typeof family.attribution_required === 'boolean', 'attribution_required flag required', family);
    assert(family.corpus_contamination === false, 'corpus_contamination must be false', family);
    assert(typeof family.source_url_or_citation === 'string' && family.source_url_or_citation.length > 0, 'source_url_or_citation required', family);
    assert(family.agent6_boundary_required === true, 'agent6_boundary_required must be true', family);
  }

  for (const familyName of ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary']) {
    assert(byFamily[familyName]?.license_lane === 'commercial_clean_candidate', `${familyName} must be commercial_clean_candidate`);
    assert(byFamily[familyName]?.evidence?.rows > 0, `${familyName} must have evidence rows`);
  }

  assert(byFamily['Klein Dictionary']?.license_lane === 'noncommercial_educational_candidate', 'Klein must be NC educational candidate');
  assert(byFamily['Klein Dictionary']?.derived_from_nc === true, 'Klein top-level derived_from_nc must be true');
  assert(byFamily['Klein Dictionary']?.commercial_export_allowed === false, 'Klein top-level commercial export must be false');
  assert(byFamily['Klein Dictionary']?.attribution_required === true, 'Klein top-level attribution required must be true');
  assert(byFamily['Klein Dictionary']?.nc_flags?.derived_from_nc === true, 'Klein derived_from_nc must be true');
  assert(byFamily['Klein Dictionary']?.nc_flags?.commercial_export_allowed === false, 'Klein commercial export must be false');
  assert(byFamily['Klein Dictionary']?.nc_flags?.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'Klein owner use attestation required');
  assert(byFamily['Klein Dictionary']?.nc_flags?.corpus_contamination === false, 'Klein corpus contamination must be false');

  assert(byFamily['BDB Augmented Strong']?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must remain blocked/review');
  assert((byFamily['BDB Augmented Strong']?.missing_evidence || []).length >= 3, 'BDB Augmented Strong missing evidence must be named');
  assert((artifact.exact_missing_field_blockers || []).some((blocker) => blocker.source_family === 'BDB Augmented Strong'), 'BDB Augmented Strong exact missing-field blocker required');
  assert(artifact.lane_source_family_counts?.metadata_or_link_only === 0, 'metadata/link-only lane count must be explicit zero');

  assert(artifact.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial export must exclude NC');
  assert(artifact.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(artifact.export_rule?.metadata_or_link_only_emits_citation_link_only === true, 'metadata/link-only must emit citation/link only');
  assert(artifact.export_rule?.blocked_or_needs_review_emits_no_candidate_text === true, 'blocked/review must emit no candidate text');

  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    workset: artifact.workset,
    source_family_count: families.length,
    lane_source_family_counts: artifact.lane_source_family_counts
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
