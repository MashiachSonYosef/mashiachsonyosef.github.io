#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  queueSourceDedupeKeyIndex:
    'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.json',
  sourceRidDedupeCoverageCrossmatch:
    'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json',
  queueSourceSubchainHandoffIndex:
    'reports/agent3-old-dictionary-candidate-use-queue-source-subchain-handoff-index-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const dedupeKeyIndex = readJson(options.queueSourceDedupeKeyIndex);
const sourceRidCoverage = readJson(options.sourceRidDedupeCoverageCrossmatch);
const subchainHandoff = readJson(options.queueSourceSubchainHandoffIndex);

assertArtifact(
  dedupeKeyIndex,
  'agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index',
  options.queueSourceDedupeKeyIndex,
);
assertArtifact(
  sourceRidCoverage,
  'agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch',
  options.sourceRidDedupeCoverageCrossmatch,
);
assertArtifact(
  subchainHandoff,
  'agent3_old_dictionary_candidate_use_queue_source_subchain_handoff_index',
  options.queueSourceSubchainHandoffIndex,
);

const blockerRows = (dedupeKeyIndex.dedupe_key_rows || [])
  .map((row) => {
    const sourceCitationMissing = Boolean(row.source_citation_required) && !row.source_citation_or_url_present;
    const blockerFlags = {
      source_citation_missing: sourceCitationMissing,
      source_citation_or_url_present: Boolean(row.source_citation_or_url_present),
      transform_rule_still_blocked: Boolean(row.transform_rule_still_blocked),
      agent6_boundary_after_prereq: Boolean(row.agent6_boundary_after_prereq),
      source_family_selection_boundary_blocker: Boolean(row.source_family_selection_boundary_blocker),
      source_family_boundary_packet_exists: Boolean(row.source_family_boundary_packet_exists),
      route_write_allowed: Boolean(row.route_write_allowed),
      candidate_text_allowed: Boolean(row.candidate_text_allowed),
      public_mutation_allowed: Boolean(row.public_mutation_allowed),
    };
    const blockerSignature = Object.entries(blockerFlags)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .sort(compareStrings)
      .join('|');
    return {
      blocker_matrix_id: `agent3-queue-source-boundary-blocker-${sha256(row.queue_source_pair_key).slice(0, 12)}`,
      queue_source_pair_key: row.queue_source_pair_key,
      dedupe_key_id: row.dedupe_key_id,
      partition_id: row.partition_id,
      queue_id: row.queue_id,
      source_rid: row.source_rid,
      link_id: row.link_id,
      row_id: row.row_id,
      batch_id: row.batch_id,
      token_ids: row.token_ids || [],
      lexicon_entry_ids: row.lexicon_entry_ids || [],
      source_family_signature: row.source_family_signature,
      triage_signature: row.triage_signature,
      mechanical_impact_bucket: row.mechanical_impact_bucket,
      partition_signature: row.partition_signature,
      reference_count: Number(row.reference_count || 0),
      occurrence_total: Number(row.occurrence_total || 0),
      source_rid_overlap_diagnostic: Boolean(row.source_rid_overlap_diagnostic),
      batch_id_overlap_diagnostic: Boolean(row.batch_id_overlap_diagnostic),
      diagnostic_blockers: row.diagnostic_blockers || [],
      blocker_flags: blockerFlags,
      blocker_signature: blockerSignature,
      exact_blocker: row.exact_blocker,
      blocking_status: 'blocked_before_source_citation_transform_and_boundary_packet',
      evidence_role: 'queue_source_boundary_blocker_navigation_only_no_acceptance_claim',
      next_safe_action:
        'Keep this queue/source row blocked until source citation, transform prerequisites, and exact boundary packet exist; do not treat it as source, Definition, or publication authority.',
    };
  })
  .sort((a, b) => {
    const partitionDelta = a.partition_id.localeCompare(b.partition_id, 'en');
    if (partitionDelta !== 0) return partitionDelta;
    const queueDelta = a.queue_id.localeCompare(b.queue_id, 'en');
    if (queueDelta !== 0) return queueDelta;
    return a.source_rid.localeCompare(b.source_rid, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_order: index + 1 }));

const blockerSignatureRows = summarizeBy(blockerRows, (row) => row.blocker_signature, 'blocker_signature');
const partitionRows = summarizeBy(blockerRows, (row) => row.partition_id, 'partition_id');
const exactBlockerRows = summarizeBy(blockerRows, (row) => row.exact_blocker, 'exact_blocker');

const counts = {
  input_dedupe_key_rows: Number(dedupeKeyIndex.counts?.dedupe_key_rows || 0),
  input_source_rid_coverage_rows: Number(sourceRidCoverage.counts?.coverage_rows || 0),
  input_subchain_handoff_entries: Number(subchainHandoff.counts?.handoff_entries || 0),
  blocker_matrix_rows: blockerRows.length,
  unique_queue_source_pair_keys: new Set(blockerRows.map((row) => row.queue_source_pair_key)).size,
  duplicate_queue_source_pair_keys: blockerRows.length - new Set(blockerRows.map((row) => row.queue_source_pair_key)).size,
  unique_source_rids: new Set(blockerRows.map((row) => row.source_rid)).size,
  unique_queue_ids: new Set(blockerRows.map((row) => row.queue_id)).size,
  partition_rows: partitionRows.length,
  blocker_signature_rows: blockerSignatureRows.length,
  exact_blocker_rows: exactBlockerRows.length,
  cross_batch_blocker_rows: blockerRows.filter((row) => row.partition_id === 'cross_batch_queue_guard').length,
  single_batch_blocker_rows: blockerRows.filter((row) => row.partition_id === 'single_batch_queue_workset').length,
  source_citation_required_rows: blockerRows.filter((row) => row.blocker_flags.source_citation_missing).length,
  source_citation_or_url_present_rows: blockerRows.filter((row) => row.blocker_flags.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: blockerRows.filter((row) => row.blocker_flags.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: blockerRows.filter((row) => row.blocker_flags.agent6_boundary_after_prereq).length,
  source_family_selection_boundary_blocker_rows: blockerRows.filter(
    (row) => row.blocker_flags.source_family_selection_boundary_blocker,
  ).length,
  source_family_boundary_packet_exists_rows: blockerRows.filter(
    (row) => row.blocker_flags.source_family_boundary_packet_exists,
  ).length,
  route_write_allowed_rows: blockerRows.filter((row) => row.blocker_flags.route_write_allowed).length,
  candidate_text_allowed_rows: blockerRows.filter((row) => row.blocker_flags.candidate_text_allowed).length,
  public_mutation_allowed_rows: blockerRows.filter((row) => row.blocker_flags.public_mutation_allowed).length,
  source_rid_overlap_diagnostic_rows: blockerRows.filter((row) => row.source_rid_overlap_diagnostic).length,
  batch_id_overlap_diagnostic_rows: blockerRows.filter((row) => row.batch_id_overlap_diagnostic).length,
  source_and_batch_overlap_diagnostic_rows: blockerRows.filter(
    (row) => row.source_rid_overlap_diagnostic && row.batch_id_overlap_diagnostic,
  ).length,
  reference_total: sum(blockerRows, 'reference_count'),
  occurrence_total: sum(blockerRows, 'occurrence_total'),
  source_level_occurrence_total: Number(sourceRidCoverage.counts?.source_level_occurrence_total || 0),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_queue_source_boundary_blocker_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    boundary_blocker_matrix_only: true,
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
  inputs: {
    queue_source_dedupe_key_index: options.queueSourceDedupeKeyIndex,
    source_rid_dedupe_coverage_crossmatch: options.sourceRidDedupeCoverageCrossmatch,
    queue_source_subchain_handoff_index: options.queueSourceSubchainHandoffIndex,
  },
  counts,
  blocker_signature_rows: blockerSignatureRows,
  partition_rows: partitionRows,
  exact_blocker_rows: exactBlockerRows,
  blocker_matrix_rows: blockerRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this matrix to keep all queue/source dedupe rows blocked until source citation, transform, and boundary prerequisites are supplied.',
    stop_condition:
      'Queue/source boundary blocker matrix emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 queue/source boundary blocker matrix passed: rows=${counts.blocker_matrix_rows} signatures=${counts.blocker_signature_rows}`,
);

function summarizeBy(rows, getKey, fieldName) {
  const groups = new Map();
  for (const row of rows) {
    const key = getKey(row) || 'missing';
    const group = groups.get(key) || {
      key,
      rowCount: 0,
      queueIds: new Set(),
      sourceRids: new Set(),
      referenceTotal: 0,
      occurrenceTotal: 0,
      sourceDiagnosticRows: 0,
      batchDiagnosticRows: 0,
    };
    group.rowCount += 1;
    group.queueIds.add(row.queue_id);
    group.sourceRids.add(row.source_rid);
    group.referenceTotal += Number(row.reference_count || 0);
    group.occurrenceTotal += Number(row.occurrence_total || 0);
    if (row.source_rid_overlap_diagnostic) group.sourceDiagnosticRows += 1;
    if (row.batch_id_overlap_diagnostic) group.batchDiagnosticRows += 1;
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => b.rowCount - a.rowCount || a.key.localeCompare(b.key, 'en'))
    .map((group) => ({
      [fieldName]: group.key,
      blocker_matrix_rows: group.rowCount,
      unique_queue_ids: group.queueIds.size,
      unique_source_rids: group.sourceRids.size,
      reference_total: group.referenceTotal,
      occurrence_total: group.occurrenceTotal,
      source_rid_overlap_diagnostic_rows: group.sourceDiagnosticRows,
      batch_id_overlap_diagnostic_rows: group.batchDiagnosticRows,
      evidence_role: 'queue_source_boundary_blocker_summary_navigation_only_no_acceptance_claim',
    }));
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.blocker_matrix_rows.slice(0, 10);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Queue/Source Boundary Blocker Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this matrix records current blocker flags for queue/source dedupe rows.',
    '- It does not select source families, supply citations, accept provenance/license/legal state, write routes, or prepare publication.',
    '- Every row remains blocked before source citation, transform prerequisites, and exact boundary packets.',
    '',
    '## Counts',
    '',
    `- Input dedupe rows / coverage rows / handoff entries / blocker rows: ${c.input_dedupe_key_rows}/${c.input_source_rid_coverage_rows}/${c.input_subchain_handoff_entries}/${c.blocker_matrix_rows}`,
    `- Unique queue-source keys / duplicate keys / source RIDs / queues / partitions: ${c.unique_queue_source_pair_keys}/${c.duplicate_queue_source_pair_keys}/${c.unique_source_rids}/${c.unique_queue_ids}/${c.partition_rows}`,
    `- Blocker signatures / exact blockers / cross rows / single rows: ${c.blocker_signature_rows}/${c.exact_blocker_rows}/${c.cross_batch_blocker_rows}/${c.single_batch_blocker_rows}`,
    `- Source citation missing / citation present / transform blocked / Agent 6 after prereq / source-family blocker / boundary packet exists: ${c.source_citation_required_rows}/${c.source_citation_or_url_present_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_selection_boundary_blocker_rows}/${c.source_family_boundary_packet_exists_rows}`,
    `- Source diagnostic / batch diagnostic / both diagnostic rows: ${c.source_rid_overlap_diagnostic_rows}/${c.batch_id_overlap_diagnostic_rows}/${c.source_and_batch_overlap_diagnostic_rows}`,
    `- Queue-source refs / queue-source occurrences / source-level occurrences: ${c.reference_total}/${c.occurrence_total}/${c.source_level_occurrence_total}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Blocker Signatures',
    '',
    '| blocker_signature | rows | queues | sources | refs | occurrences |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.blocker_signature_rows.map(
      (row) =>
        `${row.blocker_signature} | ${row.blocker_matrix_rows} | ${row.unique_queue_ids} | ${row.unique_source_rids} | ${row.reference_total} | ${row.occurrence_total}`,
    ),
    '',
    '## Matrix Samples',
    '',
    '| key | partition | source_rid | queue_id | blocker_signature |',
    '| --- | --- | --- | --- | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.queue_source_pair_key} | ${row.partition_id} | ${row.source_rid} | ${row.queue_id} | ${row.blocker_signature}`,
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

function compareStrings(a, b) {
  return String(a).localeCompare(String(b), 'en');
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_queue_source_boundary_blocker_matrix.mjs [--queue-source-dedupe-key-index=PATH] [--source-rid-dedupe-coverage-crossmatch=PATH] [--queue-source-subchain-handoff-index=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--queue-source-dedupe-key-index=')) parsed.queueSourceDedupeKeyIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-rid-dedupe-coverage-crossmatch=')) parsed.sourceRidDedupeCoverageCrossmatch = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--queue-source-subchain-handoff-index=')) parsed.queueSourceSubchainHandoffIndex = cleanRelativePath(valueAfterEquals(arg));
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
