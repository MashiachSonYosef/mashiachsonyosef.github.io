#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-planning-boundary-state-2026-06-04.json';
const resultPath = 'reports/agent1-old-dictionary-planning-boundary-state-validation-result-2026-06-04.json';

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
  const rows = artifact.source_family_boundary_rows || [];
  assert(artifact.artifact_type === 'agent1_old_dictionary_planning_boundary_state', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_old_dictionary_planning_boundary_state_prepared_for_agent10_agent2_nonpublic_planning_only', 'unexpected status');
  assert(artifact.agent6_verdict?.disposition === 'WARN-ACCEPTED', 'Agent 6 disposition must be WARN-ACCEPTED');
  assert(artifact.counts?.source_family_count === 5, 'source family count must be 5');
  assert(artifact.counts?.audited_rows === 500, 'audited rows must be 500');
  assert(artifact.counts?.audited_occurrences === 8427, 'audited occurrences must be 8427');
  assert(artifact.counts?.planning_evidence_allowed_source_families === 5, 'planning evidence count must be 5');
  assert(artifact.counts?.candidate_text_consumption_allowed_rows === 0, 'candidate text consumption rows must be 0');
  assert(artifact.counts?.candidate_text_export_allowed_rows === 0, 'candidate text export rows must be 0');
  assert(artifact.counts?.answer_eligible_rows === 0, 'answer eligible rows must be 0');
  assert(artifact.counts?.public_emit_rows === 0, 'public emit rows must be 0');
  assert(rows.length === 5, 'source family boundary row count must be 5');
  for (const row of rows) {
    assert(row.planning_evidence_allowed === true, 'planning evidence must be allowed for each row');
    assert(row.candidate_text_consumption_allowed === false, 'candidate text consumption must be false');
    assert(row.candidate_text_export_allowed === false, 'candidate text export must be false');
    assert(row.answer_eligible === false, 'answer eligible must be false');
    assert(row.public_emit === false, 'public emit must be false');
    assert(row.route_shard_write_allowed === false, 'route shard write must be false');
    assert(row.evidence_paths?.length >= 5, 'evidence paths missing');
  }
  const byFamily = Object.fromEntries(rows.map((row) => [row.source_family, row]));
  assert(byFamily['Klein Dictionary']?.license_lane === 'noncommercial_educational_candidate', 'Klein must remain NC educational');
  assert(byFamily['Klein Dictionary']?.derived_from_nc === true, 'Klein derived_from_nc must be true');
  assert(byFamily['Klein Dictionary']?.commercial_export_allowed === false, 'Klein commercial export must be false');
  assert(byFamily['Klein Dictionary']?.corpus_contamination === false, 'Klein corpus contamination must be false');
  assert(byFamily['BDB Augmented Strong']?.license_lane === 'blocked_or_needs_review', 'BDB Augmented Strong must remain blocked/review');
  assert(byFamily['BDB Augmented Strong']?.missing_evidence?.length >= 3, 'BDB Augmented Strong missing evidence must be preserved');
  assert(artifact.exact_blockers?.includes('candidate_text_consumption_requires_new_exact_agent6_boundary'), 'candidate text blocker missing');
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'source/license non-acceptance boundary missing');
  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_family_count: artifact.counts.source_family_count,
    audited_rows: artifact.counts.audited_rows,
    audited_occurrences: artifact.counts.audited_occurrences,
    candidate_text_consumption_allowed_rows: 0
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = { ok: false, validated_artifact: artifactPath, completed_at: new Date().toISOString(), error: error.message };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
