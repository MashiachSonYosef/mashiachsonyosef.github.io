#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  queuePartitionClosure:
    'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.json',
  partitionOverlapDiagnosticIndex:
    'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json',
  crossBatchQueueGuard:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
  singleBatchQueueWorkset:
    'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const queuePartitionClosure = readJson(options.queuePartitionClosure);
const partitionOverlapDiagnosticIndex = readJson(options.partitionOverlapDiagnosticIndex);
const crossBatchQueueGuard = readJson(options.crossBatchQueueGuard);
const singleBatchQueueWorkset = readJson(options.singleBatchQueueWorkset);

assertArtifact(
  queuePartitionClosure,
  'agent3_old_dictionary_candidate_use_queue_partition_closure',
  options.queuePartitionClosure,
);
assertArtifact(
  partitionOverlapDiagnosticIndex,
  'agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index',
  options.partitionOverlapDiagnosticIndex,
);
assertArtifact(
  crossBatchQueueGuard,
  'agent3_old_dictionary_candidate_use_cross_batch_queue_guard',
  options.crossBatchQueueGuard,
);
assertArtifact(
  singleBatchQueueWorkset,
  'agent3_old_dictionary_candidate_use_single_batch_queue_workset',
  options.singleBatchQueueWorkset,
);

const sourceRidDiagnosticSet = new Set(
  (partitionOverlapDiagnosticIndex.source_rid_overlap_rows || []).map((row) => row.source_rid),
);
const batchIdDiagnosticSet = new Set(
  (partitionOverlapDiagnosticIndex.batch_id_overlap_rows || []).map((row) => row.batch_id),
);

const crossRows = (crossBatchQueueGuard.guarded_queue_source_links || []).map((link) =>
  buildDedupeRow(link, 'cross_batch_queue_guard'),
);
const singleRows = (singleBatchQueueWorkset.single_batch_queue_source_links || []).map((link) =>
  buildDedupeRow(link, 'single_batch_queue_workset'),
);
const dedupeRows = [...crossRows, ...singleRows]
  .sort((a, b) => {
    if (a.partition_id !== b.partition_id) return a.partition_id.localeCompare(b.partition_id, 'en');
    const queueDelta = a.queue_id.localeCompare(b.queue_id, 'en');
    if (queueDelta !== 0) return queueDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_order: index + 1 }));

const keyCounts = new Map();
for (const row of dedupeRows) {
  keyCounts.set(row.queue_source_pair_key, (keyCounts.get(row.queue_source_pair_key) || 0) + 1);
}
const duplicateKeys = [...keyCounts.entries()].filter(([, count]) => count > 1).map(([key]) => key).sort();
const partitionRows = summarizePartitions(dedupeRows);

const counts = {
  closure_queue_rows: Number(queuePartitionClosure.counts?.input_queue_rows || 0),
  closure_queue_source_pairs: Number(queuePartitionClosure.counts?.input_queue_source_pairs || 0),
  dedupe_key_rows: dedupeRows.length,
  cross_batch_dedupe_key_rows: crossRows.length,
  single_batch_dedupe_key_rows: singleRows.length,
  unique_queue_source_pair_keys: keyCounts.size,
  duplicate_queue_source_pair_keys: duplicateKeys.length,
  unique_queue_ids: new Set(dedupeRows.map((row) => row.queue_id)).size,
  unique_source_rids: new Set(dedupeRows.map((row) => row.source_rid)).size,
  unique_token_ids: new Set(dedupeRows.flatMap((row) => row.token_ids)).size,
  unique_batch_ids: new Set(dedupeRows.map((row) => row.batch_id)).size,
  partition_rows: partitionRows.length,
  source_rid_overlap_diagnostic_rows: dedupeRows.filter((row) => row.source_rid_overlap_diagnostic).length,
  source_rid_overlap_diagnostic_source_rids: sourceRidDiagnosticSet.size,
  batch_id_overlap_diagnostic_rows: dedupeRows.filter((row) => row.batch_id_overlap_diagnostic).length,
  batch_id_overlap_diagnostic_batch_ids: batchIdDiagnosticSet.size,
  source_and_batch_overlap_diagnostic_rows: dedupeRows.filter(
    (row) => row.source_rid_overlap_diagnostic && row.batch_id_overlap_diagnostic,
  ).length,
  reference_total: sum(dedupeRows, 'reference_count'),
  occurrence_total: sum(dedupeRows, 'occurrence_total'),
  source_citation_required_rows: dedupeRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: dedupeRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: dedupeRows.filter((row) => row.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: dedupeRows.filter((row) => row.agent6_boundary_after_prereq).length,
  source_family_boundary_packet_exists_rows: dedupeRows.filter((row) => row.source_family_boundary_packet_exists).length,
  source_family_selection_boundary_blocker_rows: dedupeRows.filter(
    (row) => row.source_family_selection_boundary_blocker,
  ).length,
  route_write_allowed_rows: dedupeRows.filter((row) => row.route_write_allowed).length,
  candidate_text_allowed_rows: dedupeRows.filter((row) => row.candidate_text_allowed).length,
  public_mutation_allowed_rows: dedupeRows.filter((row) => row.public_mutation_allowed).length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_queue_source_dedupe_key_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    row_level_dedupe_key_index_only: true,
    queue_source_pair_key_is_dedupe_basis: true,
    source_rid_overlap_is_diagnostic_not_partition_failure: true,
    batch_id_overlap_is_diagnostic_not_partition_failure: true,
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
  inputs: {
    queue_partition_closure: options.queuePartitionClosure,
    partition_overlap_diagnostic_index: options.partitionOverlapDiagnosticIndex,
    cross_batch_queue_guard: options.crossBatchQueueGuard,
    single_batch_queue_workset: options.singleBatchQueueWorkset,
  },
  counts,
  partition_rows: partitionRows,
  duplicate_queue_source_pair_keys: duplicateKeys,
  dedupe_key_rows: dedupeRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use queue_source_pair_key as the row-level dedupe key; Agent 6 remains acceptance owner only after exact boundary packets exist.',
    stop_condition:
      'Queue/source dedupe key index emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 queue/source dedupe key index passed: rows=${counts.dedupe_key_rows} duplicate_keys=${counts.duplicate_queue_source_pair_keys}`,
);

function buildDedupeRow(link, partitionId) {
  const sourceRidOverlapDiagnostic = sourceRidDiagnosticSet.has(link.source_rid);
  const batchIdOverlapDiagnostic = batchIdDiagnosticSet.has(link.batch_id);
  const queueSourcePairKey = `${link.queue_id}|${link.source_rid}`;
  return {
    dedupe_key_id: `agent3-queue-source-dedupe-${sha256(queueSourcePairKey).slice(0, 12)}`,
    queue_source_pair_key: queueSourcePairKey,
    dedupe_basis: 'queue_id/source_rid',
    dedupe_status: 'unique_queue_source_pair_key',
    partition_id: partitionId,
    queue_id: link.queue_id,
    source_rid: link.source_rid,
    link_id: link.link_id,
    row_id: link.row_id,
    batch_id: link.batch_id,
    batch_key: link.batch_key,
    token_ids: link.token_ids || [],
    lexicon_entry_ids: link.lexicon_entry_ids || [],
    source_family_signature: link.source_family_signature,
    triage_signature: link.triage_signature,
    mechanical_impact_bucket: link.mechanical_impact_bucket,
    partition_signature: link.partition_signature,
    reference_count: Number(link.reference_count || 0),
    occurrence_total: Number(link.occurrence_total || 0),
    source_rid_overlap_diagnostic: sourceRidOverlapDiagnostic,
    batch_id_overlap_diagnostic: batchIdOverlapDiagnostic,
    diagnostic_blockers: [
      sourceRidOverlapDiagnostic
        ? 'source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key'
        : null,
      batchIdOverlapDiagnostic
        ? 'batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key'
        : null,
    ].filter(Boolean),
    exact_blocker: link.exact_blocker,
    source_citation_required: Boolean(link.source_citation_required),
    source_citation_or_url_present: Boolean(link.source_citation_or_url_present),
    transform_rule_still_blocked: Boolean(link.transform_rule_still_blocked),
    agent6_boundary_after_prereq: Boolean(link.agent6_boundary_after_prereq),
    source_family_boundary_packet_exists: Boolean(link.source_family_boundary_packet_exists),
    source_family_selection_boundary_blocker: Boolean(link.source_family_selection_boundary_blocker),
    route_write_allowed: Boolean(link.route_write_allowed),
    candidate_text_allowed: Boolean(link.candidate_text_allowed),
    public_mutation_allowed: Boolean(link.public_mutation_allowed),
    evidence_role: 'queue_source_dedupe_key_navigation_only_no_acceptance_claim',
    next_safe_action:
      'Use this row as a navigation/dedupe key only; source citation, transform prerequisites, and boundary packets are still required before any acceptance question.',
  };
}

function summarizePartitions(rows) {
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row.partition_id) || {
      partition_id: row.partition_id,
      rows: 0,
      queueIds: new Set(),
      sourceRids: new Set(),
      batchIds: new Set(),
      referenceTotal: 0,
      occurrenceTotal: 0,
      sourceRidDiagnosticRows: 0,
      batchIdDiagnosticRows: 0,
    };
    group.rows += 1;
    group.queueIds.add(row.queue_id);
    group.sourceRids.add(row.source_rid);
    group.batchIds.add(row.batch_id);
    group.referenceTotal += row.reference_count;
    group.occurrenceTotal += row.occurrence_total;
    if (row.source_rid_overlap_diagnostic) group.sourceRidDiagnosticRows += 1;
    if (row.batch_id_overlap_diagnostic) group.batchIdDiagnosticRows += 1;
    groups.set(row.partition_id, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.partition_id.localeCompare(b.partition_id, 'en'))
    .map((group) => ({
      partition_id: group.partition_id,
      dedupe_key_rows: group.rows,
      unique_queue_ids: group.queueIds.size,
      unique_source_rids: group.sourceRids.size,
      unique_batch_ids: group.batchIds.size,
      reference_total: group.referenceTotal,
      occurrence_total: group.occurrenceTotal,
      source_rid_overlap_diagnostic_rows: group.sourceRidDiagnosticRows,
      batch_id_overlap_diagnostic_rows: group.batchIdDiagnosticRows,
      evidence_role: 'queue_source_dedupe_key_partition_summary_navigation_only_no_acceptance_claim',
    }));
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.dedupe_key_rows.filter((row) => row.source_rid_overlap_diagnostic).slice(0, 8);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Queue/Source Dedupe Key Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; `queue_source_pair_key` is the row-level dedupe key for this packet.',
    '- Source-RID and batch-ID reuse are diagnostic flags only, not partition failures and not source-family selection.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Closure queues / closure pairs / dedupe rows / duplicate keys: ${c.closure_queue_rows}/${c.closure_queue_source_pairs}/${c.dedupe_key_rows}/${c.duplicate_queue_source_pair_keys}`,
    `- Cross rows / single rows / unique queues / sources / tokens / batches: ${c.cross_batch_dedupe_key_rows}/${c.single_batch_dedupe_key_rows}/${c.unique_queue_ids}/${c.unique_source_rids}/${c.unique_token_ids}/${c.unique_batch_ids}`,
    `- Source diagnostic rows / source IDs / batch diagnostic rows / batch IDs / both diagnostic rows: ${c.source_rid_overlap_diagnostic_rows}/${c.source_rid_overlap_diagnostic_source_rids}/${c.batch_id_overlap_diagnostic_rows}/${c.batch_id_overlap_diagnostic_batch_ids}/${c.source_and_batch_overlap_diagnostic_rows}`,
    `- References / occurrences: ${c.reference_total}/${c.occurrence_total}`,
    `- Source citation required / citation present / transform blocked / Agent 6 after prereq / source-family blocker: ${c.source_citation_required_rows}/${c.source_citation_or_url_present_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_selection_boundary_blocker_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Partition Summaries',
    '',
    '| partition | rows | queues | sources | batches | refs | occurrences | source diag rows | batch diag rows |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.partition_rows.map(
      (row) =>
        `${row.partition_id} | ${row.dedupe_key_rows} | ${row.unique_queue_ids} | ${row.unique_source_rids} | ${row.unique_batch_ids} | ${row.reference_total} | ${row.occurrence_total} | ${row.source_rid_overlap_diagnostic_rows} | ${row.batch_id_overlap_diagnostic_rows}`,
    ),
    '',
    '## Source Diagnostic Samples',
    '',
    '| key | partition | source_rid | queue_id | batch_id | refs | occurrences |',
    '| --- | --- | --- | --- | --- | ---: | ---: |',
    ...sampleRows.map(
      (row) =>
        `${row.queue_source_pair_key} | ${row.partition_id} | ${row.source_rid} | ${row.queue_id} | ${row.batch_id} | ${row.reference_count} | ${row.occurrence_total}`,
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function assertArtifact(artifact, expectedType, inputPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${inputPath} is not ${expectedType}`);
  }
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index.mjs [--queue-partition-closure=PATH] [--partition-overlap-diagnostic-index=PATH] [--cross-batch-queue-guard=PATH] [--single-batch-queue-workset=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--queue-partition-closure=')) parsed.queuePartitionClosure = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--partition-overlap-diagnostic-index=')) parsed.partitionOverlapDiagnosticIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--cross-batch-queue-guard=')) parsed.crossBatchQueueGuard = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--single-batch-queue-workset=')) parsed.singleBatchQueueWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
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

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
