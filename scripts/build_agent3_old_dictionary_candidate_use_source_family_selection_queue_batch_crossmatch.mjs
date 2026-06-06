#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  batchPlan:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-batch-plan-2026-06-06.json',
  workset:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const batchPlan = readJson(options.batchPlan);
const workset = readJson(options.workset);
assertArtifact(
  batchPlan,
  'agent3_old_dictionary_candidate_use_source_family_selection_batch_plan',
  options.batchPlan,
);
assertArtifact(
  workset,
  'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset',
  options.workset,
);

const batchBySourceRid = new Map();
for (const batch of batchPlan.batch_rows || []) {
  for (const sourceRid of batch.source_rids || []) {
    if (batchBySourceRid.has(sourceRid)) throw new Error(`Duplicate batch assignment for ${sourceRid}`);
    batchBySourceRid.set(sourceRid, batch);
  }
}

const queueGroups = new Map();
const batchQueueGroups = new Map();
const sourceQueueGroups = new Map();
const queueSourceRidLinks = [];

for (const row of workset.workset_rows || []) {
  const batch = batchBySourceRid.get(row.source_rid);
  if (!batch) throw new Error(`Missing batch assignment for ${row.source_rid}`);
  for (const queueId of row.queue_ids || []) {
    const link = {
      link_id: `agent3-source-family-selection-queue-link-${sha256(`${queueId}|${row.source_rid}|${batch.batch_id}`).slice(0, 16)}`,
      queue_id: queueId,
      batch_id: batch.batch_id,
      batch_key: batch.batch_key,
      source_rid: row.source_rid,
      row_id: row.row_id,
      source_rid_prefix: row.source_rid_prefix,
      token_ids: sorted(row.token_ids),
      lexicon_entry_ids: sorted(row.lexicon_entry_ids),
      source_family_signature: row.source_family_signature,
      triage_signature: row.triage_signature,
      mechanical_impact_bucket: row.mechanical_impact_bucket,
      partition_signature: row.partition_signature,
      reference_count: Number(row.reference_count || 0),
      occurrence_total: Number(row.occurrence_total || 0),
      exact_blocker: row.exact_blocker,
      source_citation_required: row.source_citation_required === true,
      source_citation_or_url_present: false,
      transform_rule_still_blocked: row.transform_rule_still_blocked === true,
      agent6_boundary_after_prereq: row.agent6_boundary_after_prereq === true,
      source_family_boundary_packet_exists: row.source_family_boundary_packet_exists === true,
      source_family_selection_boundary_blocker: (row.source_family_selection_boundary_blockers || []).length > 0,
      route_write_allowed: false,
      candidate_text_allowed: false,
      public_mutation_allowed: false,
      evidence_role: 'source_family_selection_queue_batch_link_navigation_only_no_selection_or_acceptance_claim',
    };
    queueSourceRidLinks.push(link);

    const queueGroup = queueGroups.get(queueId) || createQueueGroup(queueId);
    addLink(queueGroup, link);
    queueGroups.set(queueId, queueGroup);

    const batchQueueKey = `${batch.batch_id}|${queueId}`;
    const batchQueueGroup = batchQueueGroups.get(batchQueueKey) || createBatchQueueGroup(batch, queueId);
    addLink(batchQueueGroup, link);
    batchQueueGroups.set(batchQueueKey, batchQueueGroup);

    const sourceQueueGroup = sourceQueueGroups.get(row.source_rid) || {
      source_rid: row.source_rid,
      batch_ids: new Set(),
      queue_ids: new Set(),
    };
    sourceQueueGroup.batch_ids.add(batch.batch_id);
    sourceQueueGroup.queue_ids.add(queueId);
    sourceQueueGroups.set(row.source_rid, sourceQueueGroup);
  }
}

queueSourceRidLinks.sort((a, b) => {
  const queueDelta = a.queue_id.localeCompare(b.queue_id, 'en');
  if (queueDelta !== 0) return queueDelta;
  return a.source_rid.localeCompare(b.source_rid, 'en');
});

const queueRows = [...queueGroups.values()]
  .map(finalizeQueueGroup)
  .sort((a, b) => {
    const batchDelta = b.batch_count - a.batch_count;
    if (batchDelta !== 0) return batchDelta;
    const sourceDelta = b.source_rid_count - a.source_rid_count;
    if (sourceDelta !== 0) return sourceDelta;
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return a.queue_id.localeCompare(b.queue_id, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_queue_order: index + 1 }));

const batchQueueRows = [...batchQueueGroups.values()]
  .map(finalizeBatchQueueGroup)
  .sort((a, b) => {
    const batchDelta = a.batch_id.localeCompare(b.batch_id, 'en');
    if (batchDelta !== 0) return batchDelta;
    return a.queue_id.localeCompare(b.queue_id, 'en');
  });

const counts = {
  input_batch_rows: Number(batchPlan.counts?.batch_rows || 0),
  input_workset_rows: Number(workset.counts?.workset_rows || 0),
  queue_rows: queueRows.length,
  queue_source_rid_links: queueSourceRidLinks.length,
  batch_queue_links: batchQueueRows.length,
  source_batch_pairs: batchBySourceRid.size,
  unique_source_rids: new Set(queueSourceRidLinks.map((link) => link.source_rid)).size,
  unique_queue_ids: new Set(queueSourceRidLinks.map((link) => link.queue_id)).size,
  unique_token_ids: new Set(queueSourceRidLinks.flatMap((link) => link.token_ids)).size,
  cross_batch_queue_rows: queueRows.filter((row) => row.batch_count > 1).length,
  single_batch_queue_rows: queueRows.filter((row) => row.batch_count === 1).length,
  multi_source_queue_rows: queueRows.filter((row) => row.source_rid_count > 1).length,
  single_source_queue_rows: queueRows.filter((row) => row.source_rid_count === 1).length,
  multi_queue_source_rids: [...sourceQueueGroups.values()].filter((group) => group.queue_ids.size > 1).length,
  max_queue_batch_count: Math.max(...queueRows.map((row) => row.batch_count)),
  max_queue_source_rid_count: Math.max(...queueRows.map((row) => row.source_rid_count)),
  max_queue_occurrence_total: Math.max(...queueRows.map((row) => row.occurrence_total)),
  queue_reference_memberships: sum(queueRows, 'reference_total'),
  queue_occurrence_memberships: sum(queueRows, 'occurrence_total'),
  source_citation_required_links: queueSourceRidLinks.filter((link) => link.source_citation_required).length,
  source_citation_or_url_present_links: queueSourceRidLinks.filter((link) => link.source_citation_or_url_present).length,
  transform_rule_still_blocked_links: queueSourceRidLinks.filter((link) => link.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_links: queueSourceRidLinks.filter((link) => link.agent6_boundary_after_prereq).length,
  source_family_boundary_packet_exists_links: queueSourceRidLinks.filter(
    (link) => link.source_family_boundary_packet_exists,
  ).length,
  source_family_selection_boundary_blocker_links: queueSourceRidLinks.filter(
    (link) => link.source_family_selection_boundary_blocker,
  ).length,
  route_write_allowed_links: queueSourceRidLinks.filter((link) => link.route_write_allowed).length,
  candidate_text_allowed_links: queueSourceRidLinks.filter((link) => link.candidate_text_allowed).length,
  public_mutation_allowed_links: queueSourceRidLinks.filter((link) => link.public_mutation_allowed).length,
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
  artifact_type: 'agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    queue_batch_crossmatch_only: true,
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
    source_family_selection_batch_plan: options.batchPlan,
    unpacketized_source_family_selection_workset: options.workset,
  },
  counts,
  queue_rows: queueRows,
  batch_queue_rows: batchQueueRows,
  queue_source_rid_links: queueSourceRidLinks,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this crossmatch to avoid duplicate queue-token claims across future exact Agent 6 boundary packets',
    stop_condition:
      'Queue/batch crossmatch emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-family-selection queue/batch crossmatch passed: queues=${counts.queue_rows} links=${counts.queue_source_rid_links} crossBatch=${counts.cross_batch_queue_rows}`,
);

function createQueueGroup(queueId) {
  return {
    queue_id: queueId,
    batch_ids: new Set(),
    source_rids: new Set(),
    token_ids: new Set(),
    prefixes: new Set(),
    source_family_signatures: new Set(),
    triage_signatures: new Set(),
    impact_buckets: new Set(),
    partition_signatures: new Set(),
    exact_blockers: new Set(),
    reference_total: 0,
    occurrence_total: 0,
  };
}

function createBatchQueueGroup(batch, queueId) {
  return {
    batch_id: batch.batch_id,
    batch_key: batch.batch_key,
    queue_id: queueId,
    source_rids: new Set(),
    token_ids: new Set(),
    reference_total: 0,
    occurrence_total: 0,
  };
}

function addLink(group, link) {
  if (group.batch_ids) group.batch_ids.add(link.batch_id);
  group.source_rids.add(link.source_rid);
  for (const tokenId of link.token_ids) group.token_ids.add(tokenId);
  if (group.prefixes) group.prefixes.add(link.source_rid_prefix);
  if (group.source_family_signatures) group.source_family_signatures.add(link.source_family_signature);
  if (group.triage_signatures) group.triage_signatures.add(link.triage_signature);
  if (group.impact_buckets) group.impact_buckets.add(link.mechanical_impact_bucket);
  if (group.partition_signatures) group.partition_signatures.add(link.partition_signature);
  if (group.exact_blockers) group.exact_blockers.add(link.exact_blocker);
  group.reference_total += link.reference_count;
  group.occurrence_total += link.occurrence_total;
}

function finalizeQueueGroup(group) {
  return {
    queue_id: group.queue_id,
    batch_ids: sorted(group.batch_ids),
    batch_count: group.batch_ids.size,
    source_rids: sorted(group.source_rids),
    source_rid_count: group.source_rids.size,
    token_ids: sorted(group.token_ids),
    token_id_count: group.token_ids.size,
    prefixes: sorted(group.prefixes),
    prefix_count: group.prefixes.size,
    source_family_signatures: sorted(group.source_family_signatures),
    source_family_signature_count: group.source_family_signatures.size,
    triage_signatures: sorted(group.triage_signatures),
    triage_signature_count: group.triage_signatures.size,
    impact_buckets: sorted(group.impact_buckets),
    impact_bucket_count: group.impact_buckets.size,
    partition_signatures: sorted(group.partition_signatures),
    partition_signature_count: group.partition_signatures.size,
    exact_blockers: sorted(group.exact_blockers),
    reference_total: group.reference_total,
    occurrence_total: group.occurrence_total,
    cross_batch_queue: group.batch_ids.size > 1,
    evidence_role: 'source_family_selection_queue_crossmatch_navigation_only_no_selection_or_acceptance_claim',
  };
}

function finalizeBatchQueueGroup(group) {
  return {
    batch_id: group.batch_id,
    batch_key: group.batch_key,
    queue_id: group.queue_id,
    source_rids: sorted(group.source_rids),
    source_rid_count: group.source_rids.size,
    token_ids: sorted(group.token_ids),
    token_id_count: group.token_ids.size,
    reference_total: group.reference_total,
    occurrence_total: group.occurrence_total,
    evidence_role: 'source_family_selection_batch_queue_crossmatch_navigation_only_no_selection_or_acceptance_claim',
  };
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.queue_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Family Selection Queue/Batch Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; queue and batch links are grouping keys, not source-family selection, source acceptance, source-license acceptance, or Agent 6 acceptance.',
    '- Queue links remain blocked until source citation, transform prerequisites, and exact boundary packets exist.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Input batches / workset rows / queue rows / queue-source links: ${c.input_batch_rows}/${c.input_workset_rows}/${c.queue_rows}/${c.queue_source_rid_links}`,
    `- Batch-queue links / source-batch pairs / unique source RIDs / queue IDs / token IDs: ${c.batch_queue_links}/${c.source_batch_pairs}/${c.unique_source_rids}/${c.unique_queue_ids}/${c.unique_token_ids}`,
    `- Cross-batch queues / single-batch queues / multi-source queues / single-source queues / multi-queue source RIDs: ${c.cross_batch_queue_rows}/${c.single_batch_queue_rows}/${c.multi_source_queue_rows}/${c.single_source_queue_rows}/${c.multi_queue_source_rids}`,
    `- Max queue batches / max queue source RIDs / max queue occurrences: ${c.max_queue_batch_count}/${c.max_queue_source_rid_count}/${c.max_queue_occurrence_total}`,
    `- Queue reference memberships / queue occurrence memberships: ${c.queue_reference_memberships}/${c.queue_occurrence_memberships}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / boundary packet exists / source-family-selection blockers: ${c.source_citation_required_links}/${c.transform_rule_still_blocked_links}/${c.agent6_boundary_after_prereq_links}/${c.source_family_boundary_packet_exists_links}/${c.source_family_selection_boundary_blocker_links}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Queue Samples',
    '',
    '| order | queue_id | batches | source_rids | tokens | occurrences | cross_batch | exact_blockers |',
    '| ---: | --- | ---: | ---: | ---: | ---: | --- | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.mechanical_queue_order} | ${row.queue_id} | ${row.batch_count} | ${row.source_rid_count} | ${row.token_id_count} | ${row.occurrence_total} | ${row.cross_batch_queue} | ${row.exact_blockers.join('; ')}`,
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

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch.mjs [--batch-plan=PATH] [--workset=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--batch-plan=')) parsed.batchPlan = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--workset=')) parsed.workset = cleanRelativePath(valueAfterEquals(arg));
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

function sorted(values) {
  return [...new Set(values || [])].sort((a, b) => String(a).localeCompare(String(b), 'en'));
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
