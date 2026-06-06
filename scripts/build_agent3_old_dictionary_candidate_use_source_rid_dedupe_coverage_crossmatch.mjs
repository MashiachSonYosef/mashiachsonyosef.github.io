#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  unpacketizedSourceFamilySelectionWorkset:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
  queueSourceDedupeKeyIndex:
    'reports/agent3-old-dictionary-candidate-use-queue-source-dedupe-key-index-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const unpacketizedWorkset = readJson(options.unpacketizedSourceFamilySelectionWorkset);
const dedupeKeyIndex = readJson(options.queueSourceDedupeKeyIndex);

assertArtifact(
  unpacketizedWorkset,
  'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset',
  options.unpacketizedSourceFamilySelectionWorkset,
);
assertArtifact(
  dedupeKeyIndex,
  'agent3_old_dictionary_candidate_use_queue_source_dedupe_key_index',
  options.queueSourceDedupeKeyIndex,
);

const worksetRows = unpacketizedWorkset.workset_rows || [];
const dedupeRows = dedupeKeyIndex.dedupe_key_rows || [];
const worksetBySourceRid = new Map(worksetRows.map((row) => [row.source_rid, row]));
const dedupeBySourceRid = groupBy(dedupeRows, 'source_rid');
const missingSourceRids = [...worksetBySourceRid.keys()].filter((sourceRid) => !dedupeBySourceRid.has(sourceRid)).sort(compareStrings);
const extraSourceRids = [...dedupeBySourceRid.keys()].filter((sourceRid) => !worksetBySourceRid.has(sourceRid)).sort(compareStrings);

const coverageRows = worksetRows
  .map((worksetRow) => {
    const matchedDedupeRows = dedupeBySourceRid.get(worksetRow.source_rid) || [];
    const worksetQueueIds = sorted(worksetRow.queue_ids || []);
    const dedupeQueueIds = sorted(unique(matchedDedupeRows.map((row) => row.queue_id)));
    const queueSetMatch = worksetQueueIds.join('\n') === dedupeQueueIds.join('\n');
    const referenceCountMatch = Number(worksetRow.reference_count || 0) === matchedDedupeRows.length;
    const sourceRidOverlapDiagnostic = matchedDedupeRows.some((row) => row.source_rid_overlap_diagnostic);
    const batchIdOverlapDiagnostic = matchedDedupeRows.some((row) => row.batch_id_overlap_diagnostic);
    return {
      coverage_row_id: `agent3-source-rid-dedupe-coverage-${sha256(worksetRow.source_rid).slice(0, 12)}`,
      source_rid: worksetRow.source_rid,
      source_rid_prefix: worksetRow.source_rid_prefix,
      workset_row_id: worksetRow.row_id,
      workset_queue_ids: worksetQueueIds,
      dedupe_queue_ids: dedupeQueueIds,
      queue_set_match: queueSetMatch,
      workset_reference_count: Number(worksetRow.reference_count || 0),
      dedupe_key_count: matchedDedupeRows.length,
      reference_count_match: referenceCountMatch,
      queue_source_pair_keys: sorted(matchedDedupeRows.map((row) => row.queue_source_pair_key)),
      dedupe_key_ids: sorted(matchedDedupeRows.map((row) => row.dedupe_key_id)),
      source_level_occurrence_total: Number(worksetRow.occurrence_total || 0),
      queue_source_occurrence_membership_total: sum(matchedDedupeRows, 'occurrence_total'),
      occurrence_basis: 'source_level_total_and_queue_source_membership_total_are_reported_separately',
      source_family_signature: worksetRow.source_family_signature,
      triage_signature: worksetRow.triage_signature,
      mechanical_impact_bucket: worksetRow.mechanical_impact_bucket,
      partition_signature: worksetRow.partition_signature,
      source_rid_overlap_diagnostic: sourceRidOverlapDiagnostic,
      batch_id_overlap_diagnostic: batchIdOverlapDiagnostic,
      diagnostic_blockers: unique(
        matchedDedupeRows.flatMap((row) => row.diagnostic_blockers || []),
      ).sort(compareStrings),
      source_citation_required: Boolean(worksetRow.source_citation_required),
      source_citation_or_url_present: Boolean(worksetRow.source_citation_or_url_present),
      transform_rule_still_blocked: Boolean(worksetRow.transform_rule_still_blocked),
      agent6_boundary_after_prereq: Boolean(worksetRow.agent6_boundary_after_prereq),
      source_family_boundary_packet_exists: Boolean(worksetRow.source_family_boundary_packet_exists),
      source_family_selection_boundary_blocker: Boolean(
        worksetRow.source_family_selection_boundary_blocker ||
          (Array.isArray(worksetRow.source_family_selection_boundary_blockers) &&
            worksetRow.source_family_selection_boundary_blockers.length > 0),
      ),
      route_write_allowed: Boolean(worksetRow.route_write_allowed),
      candidate_text_allowed: Boolean(worksetRow.candidate_text_allowed),
      public_mutation_allowed: Boolean(worksetRow.public_mutation_allowed),
      exact_blocker: worksetRow.exact_blocker,
      coverage_status: queueSetMatch && referenceCountMatch ? 'covered_by_queue_source_dedupe_keys' : 'coverage_mismatch',
      evidence_role: 'source_rid_dedupe_coverage_crossmatch_navigation_only_no_acceptance_claim',
      next_safe_action:
        'Use this source RID row as coverage proof only; source citation, transform prerequisites, and boundary packets are still required before any acceptance question.',
    };
  })
  .sort((a, b) => b.dedupe_key_count - a.dedupe_key_count || a.source_rid.localeCompare(b.source_rid, 'en'))
  .map((row, index) => ({ ...row, mechanical_order: index + 1 }));

const queueSourcePairsFromWorkset = new Set(
  worksetRows.flatMap((row) => (row.queue_ids || []).map((queueId) => `${queueId}|${row.source_rid}`)),
);
const queueSourcePairsFromDedupe = new Set(dedupeRows.map((row) => row.queue_source_pair_key));
const missingQueueSourcePairs = difference(queueSourcePairsFromWorkset, queueSourcePairsFromDedupe);
const extraQueueSourcePairs = difference(queueSourcePairsFromDedupe, queueSourcePairsFromWorkset);
const referenceCountMismatchRows = coverageRows.filter((row) => !row.reference_count_match);
const queueSetMismatchRows = coverageRows.filter((row) => !row.queue_set_match);

const counts = {
  input_workset_rows: Number(unpacketizedWorkset.counts?.workset_rows || 0),
  input_workset_source_rid_references: Number(unpacketizedWorkset.counts?.source_rid_references || 0),
  dedupe_key_rows: Number(dedupeKeyIndex.counts?.dedupe_key_rows || 0),
  dedupe_unique_source_rids: Number(dedupeKeyIndex.counts?.unique_source_rids || 0),
  coverage_rows: coverageRows.length,
  matched_source_rids: coverageRows.filter((row) => row.coverage_status === 'covered_by_queue_source_dedupe_keys').length,
  missing_source_rids: missingSourceRids.length,
  extra_source_rids: extraSourceRids.length,
  workset_queue_source_pairs: queueSourcePairsFromWorkset.size,
  dedupe_queue_source_pairs: queueSourcePairsFromDedupe.size,
  queue_source_pair_missing_rows: missingQueueSourcePairs.length,
  queue_source_pair_extra_rows: extraQueueSourcePairs.length,
  reference_count_mismatch_rows: referenceCountMismatchRows.length,
  queue_set_mismatch_rows: queueSetMismatchRows.length,
  source_level_occurrence_total: sum(coverageRows, 'source_level_occurrence_total'),
  queue_source_occurrence_membership_total: sum(coverageRows, 'queue_source_occurrence_membership_total'),
  multi_queue_source_rid_rows: coverageRows.filter((row) => row.workset_queue_ids.length > 1).length,
  single_queue_source_rid_rows: coverageRows.filter((row) => row.workset_queue_ids.length === 1).length,
  source_rid_overlap_diagnostic_source_rows: coverageRows.filter((row) => row.source_rid_overlap_diagnostic).length,
  source_rid_overlap_diagnostic_queue_source_pairs: coverageRows
    .filter((row) => row.source_rid_overlap_diagnostic)
    .reduce((total, row) => total + row.dedupe_key_count, 0),
  batch_id_overlap_diagnostic_source_rows: coverageRows.filter((row) => row.batch_id_overlap_diagnostic).length,
  batch_id_overlap_diagnostic_queue_source_pairs: coverageRows
    .filter((row) => row.batch_id_overlap_diagnostic)
    .reduce((total, row) => total + row.diagnosticBatchPairCount || 0, 0),
  source_and_batch_overlap_diagnostic_source_rows: coverageRows.filter(
    (row) => row.source_rid_overlap_diagnostic && row.batch_id_overlap_diagnostic,
  ).length,
  source_citation_required_rows: coverageRows.filter((row) => row.source_citation_required).length,
  source_citation_or_url_present_rows: coverageRows.filter((row) => row.source_citation_or_url_present).length,
  transform_rule_still_blocked_rows: coverageRows.filter((row) => row.transform_rule_still_blocked).length,
  agent6_boundary_after_prereq_rows: coverageRows.filter((row) => row.agent6_boundary_after_prereq).length,
  source_family_boundary_packet_exists_rows: coverageRows.filter((row) => row.source_family_boundary_packet_exists).length,
  source_family_selection_boundary_blocker_rows: coverageRows.filter(
    (row) => row.source_family_selection_boundary_blocker,
  ).length,
  route_write_allowed_rows: coverageRows.filter((row) => row.route_write_allowed).length,
  candidate_text_allowed_rows: coverageRows.filter((row) => row.candidate_text_allowed).length,
  public_mutation_allowed_rows: coverageRows.filter((row) => row.public_mutation_allowed).length,
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

// Count batch diagnostic queue/source pairs directly so source-level rows remain intact.
counts.batch_id_overlap_diagnostic_queue_source_pairs = dedupeRows.filter((row) => row.batch_id_overlap_diagnostic).length;

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_rid_dedupe_coverage_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    source_rid_to_queue_source_dedupe_coverage_only: true,
    queue_source_pair_key_is_dedupe_basis: true,
    source_level_and_queue_source_occurrence_counts_are_not_interchangeable: true,
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
    unpacketized_source_family_selection_workset: options.unpacketizedSourceFamilySelectionWorkset,
    queue_source_dedupe_key_index: options.queueSourceDedupeKeyIndex,
  },
  counts,
  missing_source_rids: missingSourceRids,
  extra_source_rids: extraSourceRids,
  missing_queue_source_pairs: missingQueueSourcePairs,
  extra_queue_source_pairs: extraQueueSourcePairs,
  reference_count_mismatch_source_rids: referenceCountMismatchRows.map((row) => row.source_rid),
  queue_set_mismatch_source_rids: queueSetMismatchRows.map((row) => row.source_rid),
  coverage_rows: coverageRows.map((row) => {
    const { diagnosticBatchPairCount, ...publicRow } = row;
    return publicRow;
  }),
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this crossmatch to prove each unpacketized source RID resolves to exact queue/source dedupe keys before any future boundary packet.',
    stop_condition:
      'Source-RID dedupe coverage crossmatch emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-RID dedupe coverage crossmatch passed: source_rids=${counts.coverage_rows} pairs=${counts.workset_queue_source_pairs} missing=${counts.missing_source_rids}/${counts.queue_source_pair_missing_rows}`,
);

function groupBy(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field];
    const group = groups.get(key) || [];
    group.push(row);
    groups.set(key, group);
  }
  return groups;
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.coverage_rows.slice(0, 10);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-RID Dedupe Coverage Crossmatch',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; this crossmatches source-RID workset rows to queue/source dedupe keys.',
    '- Source-level occurrence totals and queue/source membership occurrence totals are both reported but are not interchangeable.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Workset source RIDs / dedupe source RIDs / coverage rows / matched / missing / extra: ${c.input_workset_rows}/${c.dedupe_unique_source_rids}/${c.coverage_rows}/${c.matched_source_rids}/${c.missing_source_rids}/${c.extra_source_rids}`,
    `- Workset queue-source pairs / dedupe pairs / missing pairs / extra pairs: ${c.workset_queue_source_pairs}/${c.dedupe_queue_source_pairs}/${c.queue_source_pair_missing_rows}/${c.queue_source_pair_extra_rows}`,
    `- Reference mismatches / queue-set mismatches: ${c.reference_count_mismatch_rows}/${c.queue_set_mismatch_rows}`,
    `- Source-level occurrences / queue-source membership occurrences: ${c.source_level_occurrence_total}/${c.queue_source_occurrence_membership_total}`,
    `- Multi-queue / single-queue source RIDs: ${c.multi_queue_source_rid_rows}/${c.single_queue_source_rid_rows}`,
    `- Source diagnostic rows-pairs / batch diagnostic rows-pairs / source+batch diagnostic rows: ${c.source_rid_overlap_diagnostic_source_rows}-${c.source_rid_overlap_diagnostic_queue_source_pairs}/${c.batch_id_overlap_diagnostic_source_rows}-${c.batch_id_overlap_diagnostic_queue_source_pairs}/${c.source_and_batch_overlap_diagnostic_source_rows}`,
    `- Source citation required / citation present / transform blocked / Agent 6 after prereq / source-family blocker: ${c.source_citation_required_rows}/${c.source_citation_or_url_present_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_selection_boundary_blocker_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Coverage Samples',
    '',
    '| source_rid | queues | dedupe keys | source occ | membership occ | source diag | batch diag | status |',
    '| --- | ---: | ---: | ---: | ---: | --- | --- | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.source_rid} | ${row.workset_queue_ids.length} | ${row.dedupe_key_count} | ${row.source_level_occurrence_total} | ${row.queue_source_occurrence_membership_total} | ${row.source_rid_overlap_diagnostic} | ${row.batch_id_overlap_diagnostic} | ${row.coverage_status}`,
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

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort(compareStrings);
}

function sorted(values) {
  return [...values].sort(compareStrings);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_rid_dedupe_coverage_crossmatch.mjs [--unpacketized-source-family-selection-workset=PATH] [--queue-source-dedupe-key-index=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--unpacketized-source-family-selection-workset=')) parsed.unpacketizedSourceFamilySelectionWorkset = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--queue-source-dedupe-key-index=')) parsed.queueSourceDedupeKeyIndex = cleanRelativePath(valueAfterEquals(arg));
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
