#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  queuePartitionClosure:
    'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.json',
  crossBatchQueueGuard:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
  singleBatchQueueWorkset:
    'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-partition-overlap-diagnostic-index-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const queuePartitionClosure = readJson(options.queuePartitionClosure);
const crossBatchQueueGuard = readJson(options.crossBatchQueueGuard);
const singleBatchQueueWorkset = readJson(options.singleBatchQueueWorkset);

assertArtifact(
  queuePartitionClosure,
  'agent3_old_dictionary_candidate_use_queue_partition_closure',
  options.queuePartitionClosure,
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

const crossSourceGroups = groupLinksBy(crossBatchQueueGuard.guarded_queue_source_links || [], 'source_rid');
const singleSourceGroups = groupLinksBy(singleBatchQueueWorkset.single_batch_queue_source_links || [], 'source_rid');
const sourceRidOverlapRows = [...crossSourceGroups.keys()]
  .filter((sourceRid) => singleSourceGroups.has(sourceRid))
  .sort(compareStrings)
  .map((sourceRid, index) => {
    const cross = crossSourceGroups.get(sourceRid);
    const single = singleSourceGroups.get(sourceRid);
    return {
      overlap_id: `agent3-source-rid-partition-overlap-${sha256(sourceRid).slice(0, 12)}`,
      source_rid: sourceRid,
      overlap_type: 'source_rid_reused_across_queue_partitions',
      cross_queue_ids: sorted([...cross.queueIds]),
      single_queue_ids: sorted([...single.queueIds]),
      cross_link_ids: sorted(cross.links.map((link) => link.link_id)),
      single_link_ids: sorted(single.links.map((link) => link.link_id)),
      cross_queue_source_pair_count: cross.links.length,
      single_queue_source_pair_count: single.links.length,
      cross_reference_total: cross.referenceTotal,
      single_reference_total: single.referenceTotal,
      cross_occurrence_total: cross.occurrenceTotal,
      single_occurrence_total: single.occurrenceTotal,
      diagnostic_status: 'diagnostic_only_not_partition_failure',
      exact_blocker: 'source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key',
      evidence_role: 'partition_overlap_diagnostic_navigation_only_no_acceptance_claim',
      next_safe_action:
        'Use queue_id/source_rid pairs for package dedupe; do not collapse this source RID across cross-batch and single-batch queue partitions.',
      mechanical_order: index + 1,
    };
  });

const crossBatchGroups = groupGuardRowsByBatch(
  crossBatchQueueGuard.guard_rows || [],
  crossBatchQueueGuard.batch_guard_rows || [],
);
const singleBatchGroups = groupWorksetRowsByBatch(
  singleBatchQueueWorkset.workset_rows || [],
  singleBatchQueueWorkset.batch_rows || [],
);
const batchIdOverlapRows = [...crossBatchGroups.keys()]
  .filter((batchId) => singleBatchGroups.has(batchId))
  .sort(compareStrings)
  .map((batchId, index) => {
    const cross = crossBatchGroups.get(batchId);
    const single = singleBatchGroups.get(batchId);
    return {
      overlap_id: `agent3-batch-id-partition-overlap-${sha256(batchId).slice(0, 12)}`,
      batch_id: batchId,
      overlap_type: 'batch_id_reused_across_queue_partitions',
      cross_queue_ids: sorted([...cross.queueIds]),
      single_queue_ids: sorted([...single.queueIds]),
      cross_queue_count: cross.queueIds.size,
      single_queue_count: single.queueIds.size,
      cross_reference_total: cross.referenceTotal,
      single_reference_total: single.referenceTotal,
      cross_occurrence_total: cross.occurrenceTotal,
      single_occurrence_total: single.occurrenceTotal,
      diagnostic_status: 'diagnostic_only_not_partition_failure',
      exact_blocker: 'batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key',
      evidence_role: 'partition_overlap_diagnostic_navigation_only_no_acceptance_claim',
      next_safe_action:
        'Use queue_id/source_rid pairs for package dedupe; do not treat this shared batch ID as evidence that the queue partitions overlap.',
      mechanical_order: index + 1,
    };
  });

const counts = {
  queue_partition_rows: Number(queuePartitionClosure.counts?.queue_partition_rows || 0),
  input_queue_rows: Number(queuePartitionClosure.counts?.input_queue_rows || 0),
  input_queue_source_pairs: Number(queuePartitionClosure.counts?.input_queue_source_pairs || 0),
  queue_overlap_rows: Number(queuePartitionClosure.counts?.queue_overlap_rows || 0),
  queue_source_pair_overlap_rows: Number(queuePartitionClosure.counts?.queue_source_pair_overlap_rows || 0),
  source_rid_overlap_rows: sourceRidOverlapRows.length,
  source_rid_overlap_cross_queue_count: uniqueFlat(sourceRidOverlapRows, 'cross_queue_ids').size,
  source_rid_overlap_single_queue_count: uniqueFlat(sourceRidOverlapRows, 'single_queue_ids').size,
  source_rid_overlap_cross_pair_count: sum(sourceRidOverlapRows, 'cross_queue_source_pair_count'),
  source_rid_overlap_single_pair_count: sum(sourceRidOverlapRows, 'single_queue_source_pair_count'),
  source_rid_overlap_cross_reference_total: sum(sourceRidOverlapRows, 'cross_reference_total'),
  source_rid_overlap_single_reference_total: sum(sourceRidOverlapRows, 'single_reference_total'),
  source_rid_overlap_cross_occurrence_total: sum(sourceRidOverlapRows, 'cross_occurrence_total'),
  source_rid_overlap_single_occurrence_total: sum(sourceRidOverlapRows, 'single_occurrence_total'),
  batch_id_overlap_rows: batchIdOverlapRows.length,
  batch_id_overlap_cross_queue_memberships: sum(batchIdOverlapRows, 'cross_queue_count'),
  batch_id_overlap_single_queue_memberships: sum(batchIdOverlapRows, 'single_queue_count'),
  batch_id_overlap_cross_reference_total: sum(batchIdOverlapRows, 'cross_reference_total'),
  batch_id_overlap_single_reference_total: sum(batchIdOverlapRows, 'single_reference_total'),
  batch_id_overlap_cross_occurrence_total: sum(batchIdOverlapRows, 'cross_occurrence_total'),
  batch_id_overlap_single_occurrence_total: sum(batchIdOverlapRows, 'single_occurrence_total'),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_partition_overlap_diagnostic_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    diagnostic_overlap_index_only: true,
    queue_source_pair_partition_remains_authoritative_for_this_packet: true,
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
    cross_batch_queue_guard: options.crossBatchQueueGuard,
    single_batch_queue_workset: options.singleBatchQueueWorkset,
  },
  counts,
  source_rid_overlap_rows: sourceRidOverlapRows,
  batch_id_overlap_rows: batchIdOverlapRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this diagnostic index to avoid source-RID or batch-ID level duplicate claims while preserving the queue/source-pair partition as the dedupe basis.',
    stop_condition:
      'Partition overlap diagnostic index emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 partition overlap diagnostic index passed: source_overlaps=${counts.source_rid_overlap_rows} batch_overlaps=${counts.batch_id_overlap_rows}`,
);

function groupLinksBy(links, field) {
  const groups = new Map();
  for (const link of links) {
    const key = link[field];
    const group = groups.get(key) || {
      links: [],
      queueIds: new Set(),
      referenceTotal: 0,
      occurrenceTotal: 0,
    };
    group.links.push(link);
    group.queueIds.add(link.queue_id);
    group.referenceTotal += Number(link.reference_count || 0);
    group.occurrenceTotal += Number(link.occurrence_total || 0);
    groups.set(key, group);
  }
  return groups;
}

function groupGuardRowsByBatch(rows, summaries) {
  const groups = new Map();
  for (const row of rows) {
    for (const batchId of row.batch_ids || []) {
      const group = groups.get(batchId) || {
        queueIds: new Set(),
        referenceTotal: 0,
        occurrenceTotal: 0,
      };
      group.queueIds.add(row.queue_id);
      group.referenceTotal += Number(row.reference_total || 0);
      group.occurrenceTotal += Number(row.occurrence_total || 0);
      groups.set(batchId, group);
    }
  }
  applyBatchSummaries(groups, summaries);
  return groups;
}

function groupWorksetRowsByBatch(rows, summaries) {
  const groups = new Map();
  for (const row of rows) {
    const batchId = row.batch_id;
    const group = groups.get(batchId) || {
      queueIds: new Set(),
      referenceTotal: 0,
      occurrenceTotal: 0,
    };
    group.queueIds.add(row.queue_id);
    group.referenceTotal += Number(row.reference_total || 0);
    group.occurrenceTotal += Number(row.occurrence_total || 0);
    groups.set(batchId, group);
  }
  applyBatchSummaries(groups, summaries);
  return groups;
}

function applyBatchSummaries(groups, summaries) {
  for (const summary of summaries || []) {
    const group = groups.get(summary.batch_id);
    if (!group) continue;
    group.referenceTotal = Number(summary.reference_total || 0);
    group.occurrenceTotal = Number(summary.occurrence_total || 0);
  }
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Partition Overlap Diagnostic Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this is a diagnostic index for source-RID and batch-ID reuse across already-disjoint queue/source-pair partitions.',
    '- The queue/source-pair partition remains the dedupe basis; source-RID and batch-ID reuse is not a partition failure.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Closure queues / pairs / queue overlap / pair overlap: ${c.input_queue_rows}/${c.input_queue_source_pairs}/${c.queue_overlap_rows}/${c.queue_source_pair_overlap_rows}`,
    `- Source-RID overlaps / cross queues / single queues / cross pairs / single pairs: ${c.source_rid_overlap_rows}/${c.source_rid_overlap_cross_queue_count}/${c.source_rid_overlap_single_queue_count}/${c.source_rid_overlap_cross_pair_count}/${c.source_rid_overlap_single_pair_count}`,
    `- Source-RID overlap refs cross-single / occurrences cross-single: ${c.source_rid_overlap_cross_reference_total}-${c.source_rid_overlap_single_reference_total}/${c.source_rid_overlap_cross_occurrence_total}-${c.source_rid_overlap_single_occurrence_total}`,
    `- Batch-ID overlaps / cross queue memberships / single queue memberships: ${c.batch_id_overlap_rows}/${c.batch_id_overlap_cross_queue_memberships}/${c.batch_id_overlap_single_queue_memberships}`,
    `- Batch-ID overlap refs cross-single / occurrences cross-single: ${c.batch_id_overlap_cross_reference_total}-${c.batch_id_overlap_single_reference_total}/${c.batch_id_overlap_cross_occurrence_total}-${c.batch_id_overlap_single_occurrence_total}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Source-RID Diagnostics',
    '',
    '| source_rid | cross queues | single queues | cross pairs | single pairs | cross occ | single occ | blocker |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    ...artifact.source_rid_overlap_rows.map(
      (row) =>
        `${row.source_rid} | ${row.cross_queue_ids.length} | ${row.single_queue_ids.length} | ${row.cross_queue_source_pair_count} | ${row.single_queue_source_pair_count} | ${row.cross_occurrence_total} | ${row.single_occurrence_total} | ${row.exact_blocker}`,
    ),
    '',
    '## Batch-ID Diagnostics',
    '',
    '| batch_id | cross queues | single queues | cross occ | single occ | blocker |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
    ...artifact.batch_id_overlap_rows.map(
      (row) =>
        `${row.batch_id} | ${row.cross_queue_count} | ${row.single_queue_count} | ${row.cross_occurrence_total} | ${row.single_occurrence_total} | ${row.exact_blocker}`,
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

function uniqueFlat(rows, field) {
  return new Set(rows.flatMap((row) => row[field] || []));
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function sorted(values) {
  return [...values].sort(compareStrings);
}

function compareStrings(a, b) {
  return String(a).localeCompare(String(b), 'en');
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_partition_overlap_diagnostic_index.mjs [--queue-partition-closure=PATH] [--cross-batch-queue-guard=PATH] [--single-batch-queue-workset=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--queue-partition-closure=')) parsed.queuePartitionClosure = cleanRelativePath(valueAfterEquals(arg));
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
