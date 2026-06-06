#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  output:
    'reports/agent3-old-dictionary-candidate-use-queue-source-subchain-handoff-index-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-queue-source-subchain-handoff-index-2026-06-06.md',
};

const artifactSpecs = [
  {
    entry_id: 'unpacketized_source_family_selection_workset',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.md',
    validator_script:
      'scripts/validate_agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset',
    sequence_order: 1,
    intake_role: 'base_source_rid_workset',
  },
  {
    entry_id: 'source_family_selection_queue_batch_crossmatch',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.md',
    validator_script:
      'scripts/validate_agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch',
    sequence_order: 2,
    intake_role: 'queue_batch_crossmatch',
  },
  {
    entry_id: 'cross_batch_queue_guard',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.md',
    validator_script: 'scripts/validate_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_cross_batch_queue_guard',
    sequence_order: 3,
    intake_role: 'cross_batch_duplicate_claim_guard',
  },
  {
    entry_id: 'single_batch_queue_workset',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.md',
    validator_script: 'scripts/validate_agent3_old_dictionary_candidate_use_single_batch_queue_workset.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_single_batch_queue_workset',
    sequence_order: 4,
    intake_role: 'single_batch_queue_workset',
  },
  {
    entry_id: 'queue_partition_closure',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.md',
    validator_script: 'scripts/validate_agent3_old_dictionary_candidate_use_queue_partition_closure.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_queue_partition_closure',
    sequence_order: 5,
    intake_role: 'queue_source_pair_partition_closure',
  },
  {
    entry_id: 'partition_overlap_diagnostic_index',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.md',
    validator_script: 'scripts/validate_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index',
    sequence_order: 6,
    intake_role: 'diagnostic_source_batch_overlap_index',
  },
  {
    entry_id: 'queue_source_dedupe_key_index',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.md',
    validator_script: 'scripts/validate_agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index',
    sequence_order: 7,
    intake_role: 'row_level_queue_source_dedupe_key_index',
  },
  {
    entry_id: 'source_rid_dedupe_coverage_crossmatch',
    artifact_path:
      'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json',
    report_path:
      'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.md',
    validator_script:
      'scripts/validate_agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch.mjs',
    expected_type: 'agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch',
    sequence_order: 8,
    intake_role: 'source_rid_to_queue_source_dedupe_coverage',
  },
];

const options = parseArgs(process.argv.slice(2));
const entries = artifactSpecs.map(buildEntry);
const byEntry = new Map(entries.map((entry) => [entry.entry_id, entry]));

const unpacketized = byEntry.get('unpacketized_source_family_selection_workset')?.counts_snapshot || {};
const queueBatch = byEntry.get('source_family_selection_queue_batch_crossmatch')?.counts_snapshot || {};
const crossGuard = byEntry.get('cross_batch_queue_guard')?.counts_snapshot || {};
const singleWorkset = byEntry.get('single_batch_queue_workset')?.counts_snapshot || {};
const closure = byEntry.get('queue_partition_closure')?.counts_snapshot || {};
const overlapDiagnostic = byEntry.get('partition_overlap_diagnostic_index')?.counts_snapshot || {};
const dedupeIndex = byEntry.get('queue_source_dedupe_key_index')?.counts_snapshot || {};
const coverage = byEntry.get('source_rid_dedupe_coverage_crossmatch')?.counts_snapshot || {};

const counts = {
  handoff_entries: entries.length,
  json_artifacts_exist: entries.filter((entry) => entry.json_artifact_exists).length,
  report_artifacts_exist: entries.filter((entry) => entry.report_artifact_exists).length,
  validator_scripts_exist: entries.filter((entry) => entry.validator_script_exists).length,
  artifact_type_mismatches: entries.filter((entry) => entry.artifact_type_mismatch).length,
  evidence_ready_entries: entries.filter((entry) => entry.status === 'evidence-ready').length,
  queue_source_subchain_source_rids: Number(unpacketized.workset_rows || 0),
  queue_source_subchain_source_rid_references: Number(unpacketized.source_rid_references || 0),
  queue_source_subchain_queue_rows: Number(queueBatch.queue_rows || 0),
  queue_source_subchain_queue_source_pairs: Number(queueBatch.queue_source_rid_links || 0),
  queue_source_subchain_cross_single_queues: `${Number(crossGuard.guard_rows || 0)}-${Number(singleWorkset.workset_rows || 0)}`,
  queue_source_subchain_closure_queue_overlap_missing_extra: `${Number(closure.queue_overlap_rows || 0)}-${Number(closure.queue_missing_rows || 0)}-${Number(closure.queue_extra_rows || 0)}`,
  queue_source_subchain_closure_pair_overlap_missing_extra: `${Number(closure.queue_source_pair_overlap_rows || 0)}-${Number(closure.queue_source_pair_missing_rows || 0)}-${Number(closure.queue_source_pair_extra_rows || 0)}`,
  queue_source_subchain_source_batch_diagnostics: `${Number(overlapDiagnostic.source_rid_overlap_rows || 0)}-${Number(overlapDiagnostic.batch_id_overlap_rows || 0)}`,
  queue_source_subchain_dedupe_rows_duplicate_keys: `${Number(dedupeIndex.dedupe_key_rows || 0)}-${Number(dedupeIndex.duplicate_queue_source_pair_keys || 0)}`,
  queue_source_subchain_coverage_missing_extra: `${Number(coverage.missing_source_rids || 0)}-${Number(coverage.extra_source_rids || 0)}-${Number(coverage.queue_source_pair_missing_rows || 0)}-${Number(coverage.queue_source_pair_extra_rows || 0)}`,
  queue_source_subchain_coverage_mismatches: `${Number(coverage.reference_count_mismatch_rows || 0)}-${Number(coverage.queue_set_mismatch_rows || 0)}`,
  source_level_occurrence_total: Number(coverage.source_level_occurrence_total || 0),
  queue_source_occurrence_membership_total: Number(coverage.queue_source_occurrence_membership_total || 0),
  entries_with_nonzero_authority_counters: entries.filter((entry) => hasNonzeroAuthorityCounter(entry)).length,
  source_family_selection_claims: 0,
  source_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
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
  export_rows: 0,
  release_actions: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_queue_source_subchain_handoff_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    subchain_handoff_index_only: true,
    queue_source_pair_key_is_dedupe_basis: true,
    observed_source_families_are_not_selection_or_acceptance: true,
    no_new_acceptance_or_release_claim: true,
    qa_acceptance: false,
    agent6_acceptance: false,
    source_family_selection: false,
    source_provenance_acceptance: false,
    source_license_acceptance: false,
    source_legal_acceptance: false,
    source_citation_supplied_by_agent3: false,
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
    publication_readiness: false,
    public_runtime_mutation: false,
    accepted_gloss_text: false,
    release_action: false,
  },
  counts,
  handoff_entries: entries,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this as the queue/source dedupe subchain index; Agent 6 remains acceptance owner only after exact boundary packets exist.',
    stop_condition:
      'Queue/source subchain handoff index emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 queue/source subchain handoff index passed: entries=${counts.handoff_entries} source_rids=${counts.queue_source_subchain_source_rids} pairs=${counts.queue_source_subchain_queue_source_pairs}`,
);

function buildEntry(spec) {
  const jsonArtifactExists = exists(spec.artifact_path);
  const reportArtifactExists = exists(spec.report_path);
  const validatorScriptExists = exists(spec.validator_script);
  const artifact = jsonArtifactExists ? readJson(spec.artifact_path) : {};
  const artifactTypeMismatch = jsonArtifactExists && artifact.artifact_type !== spec.expected_type;
  return {
    entry_id: spec.entry_id,
    sequence_order: spec.sequence_order,
    intake_role: spec.intake_role,
    artifact_path: spec.artifact_path,
    report_path: spec.report_path,
    validator_script: spec.validator_script,
    expected_type: spec.expected_type,
    observed_type: artifact.artifact_type || null,
    artifact_type_mismatch: artifactTypeMismatch,
    status: artifact.status || null,
    json_artifact_exists: jsonArtifactExists,
    report_artifact_exists: reportArtifactExists,
    validator_script_exists: validatorScriptExists,
    counts_snapshot: artifact.counts || {},
    authority_counters: authorityCounters(artifact.counts || {}),
    evidence_role: 'queue_source_subchain_handoff_index_entry_navigation_only_no_acceptance_claim',
  };
}

function authorityCounters(counts) {
  return {
    source_family_selection_claims: Number(counts.source_family_selection_claims || 0),
    source_acceptance_claims: Number(counts.source_acceptance_claims || 0),
    source_citation_supplied_by_agent3_rows: Number(counts.source_citation_supplied_by_agent3_rows || 0),
    candidate_text_rows: Number(counts.candidate_text_rows || 0),
    definition_content_rows: Number(counts.definition_content_rows || 0),
    lemma_content_rows: Number(counts.lemma_content_rows || 0),
    reader_hint_content_rows: Number(counts.reader_hint_content_rows || 0),
    answer_rows: Number(counts.answer_rows || 0),
    answer_eligible_rows: Number(counts.answer_eligible_rows || 0),
    route_jsonl_rows: Number(counts.route_jsonl_rows || 0),
    route_shard_writes: Number(counts.route_shard_writes || 0),
    source_text_rows: Number(counts.source_text_rows || 0),
    accepted_text_rows: Number(counts.accepted_text_rows || 0),
    public_runtime_mutation: Number(counts.public_runtime_mutation || 0),
    release_actions: Number(counts.release_actions || 0),
    route_payload_field_hits: Number(counts.route_payload_field_hits || 0),
    forbidden_payload_field_hits: Number(counts.forbidden_payload_field_hits || 0),
    acceptance_claims: Number(counts.acceptance_claims || 0),
  };
}

function hasNonzeroAuthorityCounter(entry) {
  return Object.values(entry.authority_counters || {}).some((value) => Number(value || 0) !== 0);
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Queue/Source Subchain Handoff Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this is a handoff index for existing queue/source dedupe subchain artifacts.',
    '- It does not select source families, supply citations, accept provenance/license/legal state, write routes, or prepare publication.',
    '- The row-level dedupe basis remains `queue_id/source_rid`.',
    '',
    '## Counts',
    '',
    `- Entries / JSON / reports / validators / type mismatches / evidence-ready: ${c.handoff_entries}/${c.json_artifacts_exist}/${c.report_artifacts_exist}/${c.validator_scripts_exist}/${c.artifact_type_mismatches}/${c.evidence_ready_entries}`,
    `- Source RIDs / source references / queues / queue-source pairs: ${c.queue_source_subchain_source_rids}/${c.queue_source_subchain_source_rid_references}/${c.queue_source_subchain_queue_rows}/${c.queue_source_subchain_queue_source_pairs}`,
    `- Cross-single queues / closure queue overlap-missing-extra / closure pair overlap-missing-extra: ${c.queue_source_subchain_cross_single_queues}/${c.queue_source_subchain_closure_queue_overlap_missing_extra}/${c.queue_source_subchain_closure_pair_overlap_missing_extra}`,
    `- Source-batch diagnostics / dedupe rows-duplicate keys / coverage missing-extra / coverage mismatches: ${c.queue_source_subchain_source_batch_diagnostics}/${c.queue_source_subchain_dedupe_rows_duplicate_keys}/${c.queue_source_subchain_coverage_missing_extra}/${c.queue_source_subchain_coverage_mismatches}`,
    `- Source-level occurrences / queue-source occurrence memberships: ${c.source_level_occurrence_total}/${c.queue_source_occurrence_membership_total}`,
    `- Entries with nonzero authority counters / source-family selection / candidate text / source text / public mutation / acceptance claims: ${c.entries_with_nonzero_authority_counters}/${c.source_family_selection_claims}/${c.candidate_text_rows}/${c.source_text_rows}/${c.public_runtime_mutation}/${c.acceptance_claims}`,
    '',
    '## Handoff Entries',
    '',
    '| order | entry | role | status | json | report | validator | type mismatch |',
    '| ---: | --- | --- | --- | --- | --- | --- | --- |',
    ...artifact.handoff_entries.map(
      (entry) =>
        `${entry.sequence_order} | ${entry.entry_id} | ${entry.intake_role} | ${entry.status} | ${entry.json_artifact_exists} | ${entry.report_artifact_exists} | ${entry.validator_script_exists} | ${entry.artifact_type_mismatch}`,
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index.mjs [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function exists(relativePath) {
  return fs.existsSync(path.resolve(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}
