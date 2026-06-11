#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json';
const resultPath = 'reports/agent1-old-dictionary-agent2-transform-lane-handoff-validation-result-2026-06-04.json';

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
  const rows = artifact.transform_rows || [];
  assert(artifact.artifact_type === 'agent1_old_dictionary_agent2_transform_lane_handoff', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_old_dictionary_agent2_transform_lane_handoff_ready_for_agent10_agent2_planning_only', 'unexpected status');
  assert(artifact.counts?.source_family_count === 5, 'source family count must be 5');
  assert(artifact.counts?.audited_rows === 500, 'audited rows must be 500');
  assert(artifact.counts?.audited_occurrences === 8427, 'audited occurrences must be 8427');
  assert(artifact.counts?.commercial_clean_source_families === 3, 'commercial-clean family count must be 3');
  assert(artifact.counts?.noncommercial_educational_source_families === 1, 'NC family count must be 1');
  assert(artifact.counts?.metadata_or_link_only_source_families === 0, 'metadata/link-only family count must be 0');
  assert(artifact.counts?.blocked_or_needs_review_source_families === 1, 'blocked/review family count must be 1');
  assert(artifact.counts?.agent2_transform_allowed_now_rows === 0, 'Agent 2 transform-authorized rows must be 0');
  assert(rows.length === 5, 'transform row count must be 5');
  for (const row of rows) {
    assert(row.row_subset_id?.startsWith('old-dictionary-excluded-row-license-lane-reaudit::'), 'row_subset_id missing');
    assert(row.evidence_path, 'evidence_path missing');
    assert(row.agent2_transform_allowed_now === false, 'Agent 2 transform must be false now');
    assert(row.answer_eligible === false, 'answer eligible must be false');
    assert(row.public_emit === false, 'public emit must be false');
    assert(row.corpus_contamination === false, 'corpus contamination must be false');
  }
  const byFamily = Object.fromEntries(rows.map((row) => [row.source_family, row]));
  assert(byFamily['Klein Dictionary']?.transform_lane === 'agent2_nc_educational_hold_separate', 'Klein must remain NC hold separate');
  assert(byFamily['Klein Dictionary']?.commercial_export_allowed === false, 'Klein commercial export must be false');
  assert(byFamily['BDB Augmented Strong']?.transform_lane === 'agent2_blocked_or_review_hold', 'BDB Augmented Strong must remain blocked/review hold');
  assert((artifact.exact_missing_field_blockers || []).length >= 2, 'missing-field blockers must be preserved');
  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    source_family_count: artifact.counts.source_family_count,
    audited_rows: artifact.counts.audited_rows,
    audited_occurrences: artifact.counts.audited_occurrences,
    agent2_transform_allowed_now_rows: 0
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = { ok: false, validated_artifact: artifactPath, completed_at: new Date().toISOString(), error: error.message };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
