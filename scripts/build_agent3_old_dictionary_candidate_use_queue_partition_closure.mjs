#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  queueBatchCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.json',
  crossBatchQueueGuard:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
  singleBatchQueueWorkset:
    'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-queue-partition-closure-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const queueBatchCrossmatch = readJson(options.queueBatchCrossmatch);
const crossBatchQueueGuard = readJson(options.crossBatchQueueGuard);
const singleBatchQueueWorkset = readJson(options.singleBatchQueueWorkset);

assertArtifact(
  queueBatchCrossmatch,
  'agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch',
  options.queueBatchCrossmatch,
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

const inputQueueIds = setFrom((queueBatchCrossmatch.queue_rows || []).map((row) => row.queue_id));
const crossQueueIds = setFrom((crossBatchQueueGuard.guard_rows || []).map((row) => row.queue_id));
const singleQueueIds = setFrom((singleBatchQueueWorkset.workset_rows || []).map((row) => row.queue_id));
const inputPairs = setFrom((queueBatchCrossmatch.queue_source_rid_links || []).map(queueSourcePair));
const crossPairs = setFrom((crossBatchQueueGuard.guarded_queue_source_links || []).map(queueSourcePair));
const singlePairs = setFrom((singleBatchQueueWorkset.single_batch_queue_source_links || []).map(queueSourcePair));
const pairUnion = union(crossPairs, singlePairs);
const queueUnion = union(crossQueueIds, singleQueueIds);

const crossSourceRids = setFrom((crossBatchQueueGuard.guarded_queue_source_links || []).map((link) => link.source_rid));
const singleSourceRids = setFrom((singleBatchQueueWorkset.single_batch_queue_source_links || []).map((link) => link.source_rid));
const crossBatchIds = setFrom((crossBatchQueueGuard.batch_guard_rows || []).map((row) => row.batch_id));
const singleBatchIds = setFrom((singleBatchQueueWorkset.batch_rows || []).map((row) => row.batch_id));

const queueOverlap = intersection(crossQueueIds, singleQueueIds);
const queueMissing = difference(inputQueueIds, queueUnion);
const queueExtra = difference(queueUnion, inputQueueIds);
const pairOverlap = intersection(crossPairs, singlePairs);
const pairMissing = difference(inputPairs, pairUnion);
const pairExtra = difference(pairUnion, inputPairs);
const sourceRidOverlap = intersection(crossSourceRids, singleSourceRids);
const batchIdOverlap = intersection(crossBatchIds, singleBatchIds);

const partitionRows = [
  {
    partition_id: 'cross_batch_queue_guard',
    artifact_path: options.crossBatchQueueGuard,
    report_path: 'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.md',
    queue_count: Number(crossBatchQueueGuard.counts?.guard_rows || 0),
    queue_source_pairs: Number(crossBatchQueueGuard.counts?.queue_source_links || 0),
    reference_total: Number(crossBatchQueueGuard.counts?.reference_total || 0),
    occurrence_total: Number(crossBatchQueueGuard.counts?.occurrence_total || 0),
    unique_source_rids: Number(crossBatchQueueGuard.counts?.unique_source_rids || 0),
    unique_batch_ids: Number(crossBatchQueueGuard.counts?.unique_batch_ids || 0),
    exact_blocker: 'queue_token_spans_multiple_source_family_selection_batches',
    evidence_role: 'queue_partition_closure_navigation_only_no_acceptance_claim',
    next_safe_action:
      'Keep cross-batch queue tokens guarded from independent package claims until an exact future boundary packet exists.',
  },
  {
    partition_id: 'single_batch_queue_workset',
    artifact_path: options.singleBatchQueueWorkset,
    report_path: 'reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.md',
    queue_count: Number(singleBatchQueueWorkset.counts?.workset_rows || 0),
    queue_source_pairs: Number(singleBatchQueueWorkset.counts?.queue_source_links || 0),
    reference_total: Number(singleBatchQueueWorkset.counts?.reference_total || 0),
    occurrence_total: Number(singleBatchQueueWorkset.counts?.occurrence_total || 0),
    unique_source_rids: Number(singleBatchQueueWorkset.counts?.unique_source_rids || 0),
    unique_batch_ids: Number(singleBatchQueueWorkset.counts?.unique_batch_ids || 0),
    exact_blocker: 'single_batch_queue_still_missing_source_citation_transform_and_boundary_packet',
    evidence_role: 'queue_partition_closure_navigation_only_no_acceptance_claim',
    next_safe_action:
      'Keep single-batch queue tokens as non-cross-batch navigation units only until source citation, transform, and boundary prerequisites exist.',
  },
];

const counts = {
  input_queue_rows: inputQueueIds.size,
  cross_batch_queue_rows: crossQueueIds.size,
  single_batch_queue_rows: singleQueueIds.size,
  queue_partition_rows: partitionRows.length,
  queue_union_rows: queueUnion.size,
  queue_overlap_rows: queueOverlap.length,
  queue_missing_rows: queueMissing.length,
  queue_extra_rows: queueExtra.length,
  input_queue_source_pairs: inputPairs.size,
  cross_batch_queue_source_pairs: crossPairs.size,
  single_batch_queue_source_pairs: singlePairs.size,
  queue_source_pair_union_rows: pairUnion.size,
  queue_source_pair_overlap_rows: pairOverlap.length,
  queue_source_pair_missing_rows: pairMissing.length,
  queue_source_pair_extra_rows: pairExtra.length,
  cross_source_rids: crossSourceRids.size,
  single_source_rids: singleSourceRids.size,
  source_rid_overlap: sourceRidOverlap.length,
  source_rid_union: union(crossSourceRids, singleSourceRids).size,
  cross_batch_ids: crossBatchIds.size,
  single_batch_ids: singleBatchIds.size,
  batch_id_overlap: batchIdOverlap.length,
  batch_id_union: union(crossBatchIds, singleBatchIds).size,
  cross_reference_total: Number(crossBatchQueueGuard.counts?.reference_total || 0),
  single_reference_total: Number(singleBatchQueueWorkset.counts?.reference_total || 0),
  reference_total:
    Number(crossBatchQueueGuard.counts?.reference_total || 0) +
    Number(singleBatchQueueWorkset.counts?.reference_total || 0),
  cross_occurrence_total: Number(crossBatchQueueGuard.counts?.occurrence_total || 0),
  single_occurrence_total: Number(singleBatchQueueWorkset.counts?.occurrence_total || 0),
  occurrence_total:
    Number(crossBatchQueueGuard.counts?.occurrence_total || 0) +
    Number(singleBatchQueueWorkset.counts?.occurrence_total || 0),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_queue_partition_closure',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_queue_partition_closure.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_queue_source_pair_partition_closure_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    queue_source_pair_partition_only: true,
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
    source_family_selection_queue_batch_crossmatch: options.queueBatchCrossmatch,
    cross_batch_queue_guard: options.crossBatchQueueGuard,
    single_batch_queue_workset: options.singleBatchQueueWorkset,
  },
  counts,
  partition_rows: partitionRows,
  closure_diagnostics: {
    queue_partition_basis: 'queue_id and queue_id/source_rid pairs only',
    queue_overlap: queueOverlap,
    queue_missing: queueMissing,
    queue_extra: queueExtra,
    queue_source_pair_overlap: pairOverlap,
    queue_source_pair_missing: pairMissing,
    queue_source_pair_extra: pairExtra,
    source_rid_overlap_diagnostic_not_partition_failure: sourceRidOverlap,
    batch_id_overlap_diagnostic_not_partition_failure: batchIdOverlap,
    source_rid_overlap_note:
      'Source RIDs may recur across cross-batch and single-batch partitions because the partition is queue/source-pair scoped, not source-RID scoped.',
    batch_id_overlap_note:
      'Batch IDs may recur across cross-batch and single-batch partitions because the partition is queue/source-pair scoped, not batch scoped.',
  },
  dedupe_key: sha256([...inputPairs].sort().join('\n')),
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can treat this as closure evidence that the cross-batch guard and single-batch workset partition all current queue/source pairs; Agent 6 remains acceptance owner only after exact boundary packets exist.',
    stop_condition:
      'Queue/source-pair partition closure emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 queue partition closure passed: queues=${counts.input_queue_rows} pairs=${counts.input_queue_source_pairs} queue_overlap=${counts.queue_overlap_rows} pair_overlap=${counts.queue_source_pair_overlap_rows}`,
);

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Queue Partition Closure',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this closes queue/source-pair partitioning between the cross-batch guard and single-batch workset.',
    '- This does not select a source family, supply source citation, accept provenance/license/legal state, generate candidate text, write routes, or prepare publication.',
    '- Source RID and batch-ID overlaps are diagnostics only because the partition basis is queue/source pairs.',
    '',
    '## Counts',
    '',
    `- Queues input / cross / single / union / overlap / missing / extra: ${c.input_queue_rows}/${c.cross_batch_queue_rows}/${c.single_batch_queue_rows}/${c.queue_union_rows}/${c.queue_overlap_rows}/${c.queue_missing_rows}/${c.queue_extra_rows}`,
    `- Queue-source pairs input / cross / single / union / overlap / missing / extra: ${c.input_queue_source_pairs}/${c.cross_batch_queue_source_pairs}/${c.single_batch_queue_source_pairs}/${c.queue_source_pair_union_rows}/${c.queue_source_pair_overlap_rows}/${c.queue_source_pair_missing_rows}/${c.queue_source_pair_extra_rows}`,
    `- Source RID diagnostics cross / single / overlap / union: ${c.cross_source_rids}/${c.single_source_rids}/${c.source_rid_overlap}/${c.source_rid_union}`,
    `- Batch ID diagnostics cross / single / overlap / union: ${c.cross_batch_ids}/${c.single_batch_ids}/${c.batch_id_overlap}/${c.batch_id_union}`,
    `- References cross / single / total: ${c.cross_reference_total}/${c.single_reference_total}/${c.reference_total}`,
    `- Occurrences cross / single / total: ${c.cross_occurrence_total}/${c.single_occurrence_total}/${c.occurrence_total}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Partition Rows',
    '',
    '| partition | queues | queue-source pairs | refs | occurrences | unique source RIDs | unique batch IDs | blocker |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    ...artifact.partition_rows.map(
      (row) =>
        `${row.partition_id} | ${row.queue_count} | ${row.queue_source_pairs} | ${row.reference_total} | ${row.occurrence_total} | ${row.unique_source_rids} | ${row.unique_batch_ids} | ${row.exact_blocker}`,
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function queueSourcePair(row) {
  return `${row.queue_id}|${row.source_rid}`;
}

function setFrom(values) {
  return new Set(values.filter(Boolean));
}

function union(left, right) {
  return new Set([...left, ...right]);
}

function intersection(left, right) {
  return [...left].filter((value) => right.has(value)).sort(compareStrings);
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort(compareStrings);
}

function compareStrings(a, b) {
  return String(a).localeCompare(String(b), 'en');
}

function assertArtifact(artifact, expectedType, inputPath) {
  if (!artifact || artifact.artifact_type !== expectedType) {
    throw new Error(`${inputPath} is not ${expectedType}`);
  }
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_queue_partition_closure.mjs [--queue-batch-crossmatch=PATH] [--cross-batch-queue-guard=PATH] [--single-batch-queue-workset=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--queue-batch-crossmatch=')) parsed.queueBatchCrossmatch = cleanRelativePath(valueAfterEquals(arg));
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
