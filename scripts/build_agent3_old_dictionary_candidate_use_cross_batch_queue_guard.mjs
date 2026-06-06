#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  queueBatchCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-queue-batch-crossmatch-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const queueBatchCrossmatch = readJson(options.queueBatchCrossmatch);
assertArtifact(
  queueBatchCrossmatch,
  'agent3_old_dictionary_candidate_use_source_family_selection_queue_batch_crossmatch',
  options.queueBatchCrossmatch,
);

const crossBatchQueueIds = new Set(
  (queueBatchCrossmatch.queue_rows || []).filter((row) => row.cross_batch_queue).map((row) => row.queue_id),
);
const crossBatchLinks = (queueBatchCrossmatch.queue_source_rid_links || []).filter((link) =>
  crossBatchQueueIds.has(link.queue_id),
);
const crossBatchBatchQueueRows = (queueBatchCrossmatch.batch_queue_rows || []).filter((row) =>
  crossBatchQueueIds.has(row.queue_id),
);

const guardRows = (queueBatchCrossmatch.queue_rows || [])
  .filter((row) => row.cross_batch_queue)
  .map((row) => {
    const links = crossBatchLinks.filter((link) => link.queue_id === row.queue_id);
    const batchQueueRows = crossBatchBatchQueueRows.filter((link) => link.queue_id === row.queue_id);
    return {
      guard_id: `agent3-cross-batch-queue-guard-${sha256(row.queue_id).slice(0, 12)}`,
      queue_id: row.queue_id,
      batch_ids: row.batch_ids,
      batch_count: row.batch_count,
      batch_queue_link_count: batchQueueRows.length,
      source_rids: row.source_rids,
      source_rid_count: row.source_rid_count,
      queue_source_link_count: links.length,
      token_ids: row.token_ids,
      token_id_count: row.token_id_count,
      prefixes: row.prefixes,
      prefix_count: row.prefix_count,
      source_family_signatures: row.source_family_signatures,
      source_family_signature_count: row.source_family_signature_count,
      triage_signatures: row.triage_signatures,
      triage_signature_count: row.triage_signature_count,
      impact_buckets: row.impact_buckets,
      impact_bucket_count: row.impact_bucket_count,
      partition_signatures: row.partition_signatures,
      partition_signature_count: row.partition_signature_count,
      exact_blockers: row.exact_blockers,
      reference_total: row.reference_total,
      occurrence_total: row.occurrence_total,
      source_citation_required_links: links.filter((link) => link.source_citation_required).length,
      source_citation_or_url_present_links: links.filter((link) => link.source_citation_or_url_present).length,
      transform_rule_still_blocked_links: links.filter((link) => link.transform_rule_still_blocked).length,
      agent6_boundary_after_prereq_links: links.filter((link) => link.agent6_boundary_after_prereq).length,
      source_family_boundary_packet_exists_links: links.filter((link) => link.source_family_boundary_packet_exists).length,
      source_family_selection_boundary_blocker_links: links.filter((link) => link.source_family_selection_boundary_blocker).length,
      route_write_allowed_links: links.filter((link) => link.route_write_allowed).length,
      candidate_text_allowed_links: links.filter((link) => link.candidate_text_allowed).length,
      public_mutation_allowed_links: links.filter((link) => link.public_mutation_allowed).length,
      guard_status: 'cross_batch_queue_duplicate_claim_guard_required',
      exact_blocker: 'queue_token_spans_multiple_source_family_selection_batches',
      evidence_role: 'cross_batch_queue_guard_navigation_only_no_selection_or_acceptance_claim',
      next_safe_action:
        'Package this queue token under one coordinated future boundary packet or preserve it as blocked; do not let separate batches claim the same queue token independently.',
      dedupe_key: sha256(
        [
          row.queue_id,
          row.batch_ids.join('|'),
          row.source_rids.join('|'),
          row.exact_blockers.join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const batchDelta = b.batch_count - a.batch_count;
    if (batchDelta !== 0) return batchDelta;
    const sourceDelta = b.source_rid_count - a.source_rid_count;
    if (sourceDelta !== 0) return sourceDelta;
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return a.queue_id.localeCompare(b.queue_id, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_guard_order: index + 1 }));

const batchGuardRows = summarize(crossBatchBatchQueueRows, 'batch_id', 'batch_id');
const sourceFamilySignatureRows = summarizeMembership(guardRows, 'source_family_signatures', 'source_family_signature');
const triageSignatureRows = summarizeMembership(guardRows, 'triage_signatures', 'triage_signature');
const impactBucketRows = summarizeMembership(guardRows, 'impact_buckets', 'impact_bucket');

const counts = {
  input_queue_rows: Number(queueBatchCrossmatch.counts?.queue_rows || 0),
  input_queue_source_links: Number(queueBatchCrossmatch.counts?.queue_source_rid_links || 0),
  guard_rows: guardRows.length,
  queue_source_links: crossBatchLinks.length,
  batch_queue_links: crossBatchBatchQueueRows.length,
  unique_source_rids: new Set(crossBatchLinks.map((link) => link.source_rid)).size,
  unique_queue_ids: new Set(guardRows.map((row) => row.queue_id)).size,
  unique_token_ids: new Set(crossBatchLinks.flatMap((link) => link.token_ids)).size,
  unique_batch_ids: new Set(crossBatchBatchQueueRows.map((row) => row.batch_id)).size,
  three_batch_queue_rows: guardRows.filter((row) => row.batch_count === 3).length,
  two_batch_queue_rows: guardRows.filter((row) => row.batch_count === 2).length,
  max_queue_batch_count: Math.max(...guardRows.map((row) => row.batch_count)),
  max_queue_source_rid_count: Math.max(...guardRows.map((row) => row.source_rid_count)),
  max_queue_occurrence_total: Math.max(...guardRows.map((row) => row.occurrence_total)),
  reference_total: sum(guardRows, 'reference_total'),
  occurrence_total: sum(guardRows, 'occurrence_total'),
  batch_guard_rows: batchGuardRows.length,
  source_family_signature_rows: sourceFamilySignatureRows.length,
  triage_signature_rows: triageSignatureRows.length,
  impact_bucket_rows: impactBucketRows.length,
  source_citation_required_links: sum(guardRows, 'source_citation_required_links'),
  source_citation_or_url_present_links: sum(guardRows, 'source_citation_or_url_present_links'),
  transform_rule_still_blocked_links: sum(guardRows, 'transform_rule_still_blocked_links'),
  agent6_boundary_after_prereq_links: sum(guardRows, 'agent6_boundary_after_prereq_links'),
  source_family_boundary_packet_exists_links: sum(guardRows, 'source_family_boundary_packet_exists_links'),
  source_family_selection_boundary_blocker_links: sum(guardRows, 'source_family_selection_boundary_blocker_links'),
  route_write_allowed_links: sum(guardRows, 'route_write_allowed_links'),
  candidate_text_allowed_links: sum(guardRows, 'candidate_text_allowed_links'),
  public_mutation_allowed_links: sum(guardRows, 'public_mutation_allowed_links'),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_cross_batch_queue_guard',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_cross_batch_queue_duplicate_claim_guard_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    cross_batch_queue_guard_only: true,
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
  },
  counts,
  batch_guard_rows: batchGuardRows,
  source_family_signature_rows: sourceFamilySignatureRows,
  triage_signature_rows: triageSignatureRows,
  impact_bucket_rows: impactBucketRows,
  guard_rows: guardRows,
  guarded_queue_source_links: crossBatchLinks,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this guard to keep cross-batch queue tokens out of independently claimed future Agent 6 packets',
    stop_condition:
      'Cross-batch queue guard emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 cross-batch queue guard passed: guards=${counts.guard_rows} links=${counts.queue_source_links} batches=${counts.batch_queue_links}`,
);

function summarize(rows, field, outField) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field] || 'missing';
    const group = groups.get(key) || {
      [outField]: key,
      queueIds: new Set(),
      sourceRids: new Set(),
      tokenIds: new Set(),
      referenceTotal: 0,
      occurrenceTotal: 0,
    };
    group.queueIds.add(row.queue_id);
    for (const sourceRid of row.source_rids || []) group.sourceRids.add(sourceRid);
    for (const tokenId of row.token_ids || []) group.tokenIds.add(tokenId);
    group.referenceTotal += Number(row.reference_total || 0);
    group.occurrenceTotal += Number(row.occurrence_total || 0);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({
      [outField]: group[outField],
      queue_count: group.queueIds.size,
      source_rid_count: group.sourceRids.size,
      token_id_count: group.tokenIds.size,
      reference_total: group.referenceTotal,
      occurrence_total: group.occurrenceTotal,
      evidence_role: 'cross_batch_queue_guard_group_summary_navigation_only_no_selection_or_acceptance_claim',
    }))
    .sort((a, b) => b.queue_count - a.queue_count || String(a[outField]).localeCompare(String(b[outField]), 'en'));
}

function summarizeMembership(rows, field, outField) {
  const expanded = [];
  for (const row of rows) {
    for (const value of row[field] || []) {
      expanded.push({
        [outField]: value,
        queue_id: row.queue_id,
        source_rids: row.source_rids,
        token_ids: row.token_ids,
        reference_total: row.reference_total,
        occurrence_total: row.occurrence_total,
      });
    }
  }
  return summarize(expanded, outField, outField);
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.guard_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Cross-Batch Queue Guard',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; cross-batch queue flags are duplicate-claim guards, not source-family selection, source acceptance, source-license acceptance, or Agent 6 acceptance.',
    '- Guarded queue tokens remain blocked until source citation, transform prerequisites, and exact boundary packets exist.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Input queue rows / queue-source links / guard rows / guarded links: ${c.input_queue_rows}/${c.input_queue_source_links}/${c.guard_rows}/${c.queue_source_links}`,
    `- Batch-queue links / unique source RIDs / queue IDs / token IDs / batch IDs: ${c.batch_queue_links}/${c.unique_source_rids}/${c.unique_queue_ids}/${c.unique_token_ids}/${c.unique_batch_ids}`,
    `- Three-batch / two-batch guards / max batch-source-occurrence: ${c.three_batch_queue_rows}/${c.two_batch_queue_rows}/${c.max_queue_batch_count}-${c.max_queue_source_rid_count}-${c.max_queue_occurrence_total}`,
    `- References / occurrences / batch-source-family-triage-impact summaries: ${c.reference_total}/${c.occurrence_total}/${c.batch_guard_rows}-${c.source_family_signature_rows}-${c.triage_signature_rows}-${c.impact_bucket_rows}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / boundary packet exists / source-family-selection blockers: ${c.source_citation_required_links}/${c.transform_rule_still_blocked_links}/${c.agent6_boundary_after_prereq_links}/${c.source_family_boundary_packet_exists_links}/${c.source_family_selection_boundary_blocker_links}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Guard Samples',
    '',
    '| order | queue_id | batches | source_rids | tokens | occurrences | exact_blocker |',
    '| ---: | --- | ---: | ---: | ---: | ---: | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.mechanical_guard_order} | ${row.queue_id} | ${row.batch_count} | ${row.source_rid_count} | ${row.token_id_count} | ${row.occurrence_total} | ${row.exact_blocker}`,
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs [--queue-batch-crossmatch=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--queue-batch-crossmatch=')) parsed.queueBatchCrossmatch = cleanRelativePath(valueAfterEquals(arg));
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

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
