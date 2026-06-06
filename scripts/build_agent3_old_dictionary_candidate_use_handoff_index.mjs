#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  output: 'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json',
  report: 'reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.md',
};

const artifactSpecs = [
  {
    role: 'row_overlap_source_manifest_navigation',
    path: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_row_overlap_linkage_matrix.mjs',
    expectedType: 'agent3_old_dictionary_row_overlap_linkage_matrix',
  },
  {
    role: 'candidate_use_continuity_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_candidate_use_continuity_crossmatch.mjs',
    expectedType: 'agent3_old_dictionary_candidate_use_continuity_crossmatch',
  },
  {
    role: 'source_family_blocker_matrix',
    path: 'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_candidate_use_source_family_blocker_matrix.mjs',
    expectedType: 'agent3_old_dictionary_candidate_use_source_family_blocker_matrix',
  },
  {
    role: 'source_rid_continuity_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch.mjs',
    expectedType: 'agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch',
  },
  {
    role: 'exact_subset_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_candidate_use_exact_subset_crossmatch.mjs',
    expectedType: 'agent3_old_dictionary_candidate_use_exact_subset_crossmatch',
  },
  {
    role: 'boundary_triage_navigation',
    path: 'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_candidate_use_boundary_triage_navigation.mjs',
    expectedType: 'agent3_old_dictionary_candidate_use_boundary_triage_navigation',
  },
  {
    role: 'pure_commercial_boundary_workset',
    path: 'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json',
    report: 'reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.md',
    validator: 'scripts/validate_agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset.mjs',
    expectedType: 'agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset',
  },
  {
    role: 'overlap_boundary_workset',
    path: 'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json',
    report: 'reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.md',
    validator: 'scripts/validate_agent3_old_dictionary_overlap_candidate_use_boundary_workset.mjs',
    expectedType: 'agent3_old_dictionary_overlap_candidate_use_boundary_workset',
  },
  {
    role: 'split_closure_crossmatch',
    path: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json',
    report: 'reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.md',
    validator: 'scripts/validate_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs',
    expectedType: 'agent3_old_dictionary_candidate_use_split_closure_crossmatch',
  },
];

const options = parseArgs(process.argv.slice(2));
const entries = artifactSpecs.map((spec) => buildEntry(spec));
const byRole = new Map(entries.map((entry) => [entry.role, entry]));
const triage = byRole.get('boundary_triage_navigation')?.counts || {};
const closure = byRole.get('split_closure_crossmatch')?.counts || {};
const pure = byRole.get('pure_commercial_boundary_workset')?.counts || {};
const overlap = byRole.get('overlap_boundary_workset')?.counts || {};
const sourceRid = byRole.get('source_rid_continuity_crossmatch')?.counts || {};

const allZeroAuthorityCounters = entries.every((entry) => entry.zero_authority_counter_sum === 0);
const blockerRowsTotal = sum(entries, (entry) => entry.blocker_rows || 0);
const counts = {
  handoff_entries: entries.length,
  json_artifacts_exist: entries.filter((entry) => entry.json_artifact_exists).length,
  report_artifacts_exist: entries.filter((entry) => entry.report_artifact_exists).length,
  validator_scripts_exist: entries.filter((entry) => entry.validator_script_exists).length,
  artifact_type_mismatches: entries.filter((entry) => entry.artifact_type_status !== 'matched').length,
  evidence_ready_entries: entries.filter((entry) => entry.status === 'evidence-ready').length,
  candidate_use_rows: Number(triage.candidate_use_rows || closure.triage_candidate_rows || 0),
  candidate_use_occurrences: Number(triage.candidate_use_occurrences || closure.triage_candidate_occurrences || 0),
  pure_workset_rows: Number(pure.workset_rows || closure.pure_workset_rows || 0),
  pure_workset_occurrences: Number(pure.workset_occurrences || closure.pure_workset_occurrences || 0),
  overlap_workset_rows: Number(overlap.workset_rows || closure.overlap_workset_rows || 0),
  overlap_workset_occurrences: Number(overlap.workset_occurrences || closure.overlap_workset_occurrences || 0),
  split_closure_rows: Number(closure.closure_rows || 0),
  split_closure_occurrences: Number(closure.closure_occurrences || 0),
  split_closure_missing_rows: Number(closure.missing_from_closure_rows || 0),
  split_closure_extra_rows: Number(closure.extra_in_closure_rows || 0),
  split_closure_duplicate_queue_ids: Number(closure.closure_duplicate_queue_ids || 0),
  split_closure_cross_partition_duplicate_queue_ids: Number(closure.cross_partition_duplicate_queue_ids || 0),
  source_rid_references: Number(sourceRid.source_rid_references || closure.source_rid_references || 0),
  unique_source_rids: Number(sourceRid.unique_source_rids || closure.unique_source_rids || 0),
  cross_partition_shared_source_rids: Number(closure.cross_partition_shared_source_rids || 0),
  blocker_rows_total: blockerRowsTotal,
  entries_with_nonzero_authority_counters: entries.filter((entry) => entry.zero_authority_counter_sum !== 0).length,
  all_zero_authority_counters: allZeroAuthorityCounters ? 1 : 0,
  transform_ready_rows: 0,
  candidate_text_rows: 0,
  definition_content_rows: 0,
  lemma_content_rows: 0,
  reader_hint_content_rows: 0,
  answer_rows: 0,
  answer_eligible_rows: 0,
  route_jsonl_rows: 0,
  route_shard_writes: 0,
  source_text_rows: 0,
  accepted_text_rows: 0,
  public_runtime_mutation: 0,
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_handoff_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_handoff_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target:
    'Agent 3 handoff index for old-dictionary candidate-use linkage/navigation packets supporting Agent 10 and Agent 6 review',
  authority_boundary: {
    linkage_navigation_only: true,
    handoff_index_only: true,
    candidate_use_planning_evidence_only: true,
    artifact_discovery_only: true,
    transform_authority: false,
    source_text_read: false,
    candidate_text_export: false,
    definition_content_storage: false,
    lemma_content_storage: false,
    reader_hint_content_storage: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    answer_eligibility: false,
    route_ranking: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  counts,
  handoff_entries: entries,
  closure_summary: {
    row_partition: 'pure_commercial_workset + overlap_workset',
    row_equation: `${counts.pure_workset_rows} + ${counts.overlap_workset_rows} = ${counts.split_closure_rows}`,
    occurrence_equation: `${counts.pure_workset_occurrences} + ${counts.overlap_workset_occurrences} = ${counts.split_closure_occurrences}`,
    missing_rows: counts.split_closure_missing_rows,
    extra_rows: counts.split_closure_extra_rows,
    duplicate_queue_ids: counts.split_closure_duplicate_queue_ids,
    cross_partition_duplicate_queue_ids: counts.split_closure_cross_partition_duplicate_queue_ids,
    shared_source_rids_across_partitions: counts.cross_partition_shared_source_rids,
  },
  downstream_handoff: {
    package_owner: 'Agent 10',
    source_lane_owner: 'Agent 1',
    transform_owner_after_exact_boundary: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    exact_blocker_summary:
      'candidate-use split remains non-authoritative; pure rows need Agent 6 candidate-use boundary and morphology relation; overlap rows need Agent 6 source-family selection boundary',
    stop_condition:
      'Use this index only to locate and verify Agent 3 linkage/navigation packets. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.',
  },
};

artifact.counts.forbidden_payload_field_hits = countForbiddenPayloadKeys(artifact);

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 handoff index entries=${counts.handoff_entries} rows=${counts.candidate_use_rows} authority_issues=${counts.entries_with_nonzero_authority_counters}`,
);

function buildEntry(spec) {
  const jsonPath = path.resolve(root, spec.path);
  const artifactExists = fs.existsSync(jsonPath);
  const value = artifactExists ? readJson(spec.path) : {};
  const reportExists = fs.existsSync(path.resolve(root, spec.report));
  const validatorExists = fs.existsSync(path.resolve(root, spec.validator));
  const artifactType = value.artifact_type || null;
  const counts = value.counts || {};
  const zeroAuthorityCounterSum = sumAuthorityCounters(counts);
  return {
    row_id: `agent3-old-dictionary-candidate-use-handoff-${spec.role}`,
    role: spec.role,
    artifact_path: spec.path,
    report_path: spec.report,
    validator_script: spec.validator,
    json_artifact_exists: artifactExists,
    report_artifact_exists: reportExists,
    validator_script_exists: validatorExists,
    artifact_type: artifactType,
    expected_artifact_type: spec.expectedType,
    artifact_type_status: artifactType === spec.expectedType ? 'matched' : 'mismatched',
    status: value.status || null,
    counts,
    rows_represented: representativeRows(counts),
    occurrences_represented: representativeOccurrences(counts),
    blocker_rows: Number(
      counts.blocker_rows ||
        counts.exact_blocker_rows ||
        counts.transform_blocker_rows ||
        counts.source_family_rows_with_blocker_links ||
        0,
    ),
    zero_authority_counter_sum: zeroAuthorityCounterSum,
    evidence_role: 'artifact_discovery_and_navigation_only',
    downstream_status: 'non_authoritative_handoff_index_entry_no_transform_or_answer_authority',
    dedupe_key: sha256([spec.role, spec.path, spec.expectedType].join('|')),
  };
}

function representativeRows(counts) {
  return Number(
    counts.candidate_use_rows ||
      counts.workset_rows ||
      counts.closure_rows ||
      counts.represented_rows ||
      counts.bucket_rows ||
      0,
  );
}

function representativeOccurrences(counts) {
  return Number(
    counts.candidate_use_occurrences ||
      counts.workset_occurrences ||
      counts.closure_occurrences ||
      counts.represented_occurrences ||
      0,
  );
}

function sumAuthorityCounters(counts) {
  return [
    'transform_ready_rows',
    'allowed_transform_rows_now',
    'candidate_text_rows',
    'candidate_text_rows_now',
    'definition_content_rows',
    'definition_content_rows_now',
    'lemma_content_rows',
    'reader_hint_content_rows',
    'answer_rows',
    'answer_rows_now',
    'answer_eligible_rows',
    'route_jsonl_rows',
    'route_jsonl_rows_now',
    'route_shard_writes',
    'source_text_rows',
    'source_text_read',
    'accepted_text_rows',
    'public_runtime_mutation',
    'public_runtime_mutations',
    'release_actions',
    'route_payload_field_hits',
    'forbidden_payload_field_hits',
    'forbidden_authority_field_hits',
    'acceptance_claims',
  ].reduce((total, key) => total + Number(counts[key] || 0), 0);
}

function writeMarkdown(filePath, artifact) {
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Handoff Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Status',
    '',
    `- Artifact: \`${artifact.artifact_type}\``,
    `- Status: \`${artifact.status}\``,
    `- Target: ${artifact.target}`,
    '- Boundary: artifact discovery/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.',
    '',
    '## Counts',
    '',
    `- Handoff entries / JSON / reports / validators: ${artifact.counts.handoff_entries}/${artifact.counts.json_artifacts_exist}/${artifact.counts.report_artifacts_exist}/${artifact.counts.validator_scripts_exist}`,
    `- Candidate-use rows / occurrences: ${artifact.counts.candidate_use_rows}/${artifact.counts.candidate_use_occurrences}`,
    `- Pure + overlap closure: ${artifact.closure_summary.row_equation}; occurrences ${artifact.closure_summary.occurrence_equation}`,
    `- Closure missing / extra / duplicate queue IDs / cross-partition duplicate queue IDs: ${artifact.counts.split_closure_missing_rows}/${artifact.counts.split_closure_extra_rows}/${artifact.counts.split_closure_duplicate_queue_ids}/${artifact.counts.split_closure_cross_partition_duplicate_queue_ids}`,
    `- Source-RID refs / unique / shared across partitions: ${artifact.counts.source_rid_references}/${artifact.counts.unique_source_rids}/${artifact.counts.cross_partition_shared_source_rids}`,
    `- Entries with nonzero authority counters / forbidden payload / acceptance claims: ${artifact.counts.entries_with_nonzero_authority_counters}/${artifact.counts.forbidden_payload_field_hits}/${artifact.counts.acceptance_claims}`,
    '',
    '## Entries',
    '',
    '| role | artifact | rows | occurrences | blockers | validator | status |',
    '|---|---|---:|---:|---:|---|---|',
    ...artifact.handoff_entries.map(
      (entry) =>
        `| ${entry.role} | \`${entry.artifact_path}\` | ${entry.rows_represented} | ${entry.occurrences_represented} | ${entry.blocker_rows} | \`${entry.validator_script}\` | ${entry.artifact_type_status}/${entry.status} |`,
    ),
    '',
    '## Stop Condition',
    '',
    artifact.downstream_handoff.stop_condition,
  ];
  fs.writeFileSync(path.resolve(root, filePath), `${lines.join('\n')}\n`);
}

function countForbiddenPayloadKeys(value) {
  const forbidden = new Set([
    'surface',
    'normalized',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'candidate_text',
    'definition_text',
    'source_text',
    'accepted_text',
    'display_text',
    'route_payload',
    'public_domain_headwords',
  ]);
  let hits = 0;
  walk(value, (key) => {
    if (forbidden.has(key)) hits += 1;
  });
  return hits;
}

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function sum(rows, selector) {
  return rows.reduce((total, row) => total + Number(selector(row) || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function writeJson(filePath, value) {
  fs.writeFileSync(path.resolve(root, filePath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--output') parsed.output = cleanRelativePath(value);
    else if (key === '--report') parsed.report = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}
