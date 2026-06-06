#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  workset:
    'reports/agent3-old-dictionary-candidate-use-unpacketized-source-family-selection-workset-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-batch-plan-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-family-selection-batch-plan-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const workset = readJson(options.workset);
assertArtifact(
  workset,
  'agent3_old_dictionary_candidate_use_unpacketized_source_family_selection_workset',
  options.workset,
);

const worksetRows = workset.workset_rows || [];
const batchRows = [...groupByBatchKey(worksetRows).values()]
  .map((group) => {
    const rows = [...group.rows].sort((a, b) => {
      const occurrenceDelta = b.occurrence_total - a.occurrence_total;
      if (occurrenceDelta !== 0) return occurrenceDelta;
      return a.source_rid.localeCompare(b.source_rid, 'en');
    });
    return {
      batch_id: `agent3-source-family-selection-batch-${sha256(group.batch_key).slice(0, 12)}`,
      batch_key: group.batch_key,
      source_family_signature: group.source_family_signature,
      triage_signature: group.triage_signature,
      mechanical_impact_bucket: group.mechanical_impact_bucket,
      partition_signature: group.partition_signature,
      row_count: rows.length,
      source_rid_references: sum(rows, 'reference_count'),
      occurrence_total: sum(rows, 'occurrence_total'),
      unique_source_rids: new Set(rows.map((row) => row.source_rid)).size,
      prefixes: sorted(rows.map((row) => row.source_rid_prefix)),
      prefix_count: new Set(rows.map((row) => row.source_rid_prefix)).size,
      queue_ids: sorted(rows.flatMap((row) => row.queue_ids)),
      queue_id_count: new Set(rows.flatMap((row) => row.queue_ids)).size,
      token_ids: sorted(rows.flatMap((row) => row.token_ids)),
      token_id_count: new Set(rows.flatMap((row) => row.token_ids)).size,
      lexicon_entry_ids: sorted(rows.flatMap((row) => row.lexicon_entry_ids)),
      lexicon_entry_id_count: new Set(rows.flatMap((row) => row.lexicon_entry_ids)).size,
      source_rids: rows.map((row) => row.source_rid),
      row_ids: rows.map((row) => row.row_id),
      sample_source_rids: rows.slice(0, 12).map((row) => row.source_rid),
      exact_blocker: 'source_family_selection_boundary_not_yet_packetized_for_agent6_prereq',
      source_citation_required_rows: rows.filter((row) => row.source_citation_required).length,
      source_citation_or_url_present_rows: rows.filter((row) => row.source_citation_or_url_present).length,
      transform_rule_still_blocked_rows: rows.filter((row) => row.transform_rule_still_blocked).length,
      agent6_boundary_after_prereq_rows: rows.filter((row) => row.agent6_boundary_after_prereq).length,
      source_family_boundary_packet_exists_rows: rows.filter((row) => row.source_family_boundary_packet_exists).length,
      source_family_selection_boundary_blocker_rows: rows.filter(
        (row) => (row.source_family_selection_boundary_blockers || []).length > 0,
      ).length,
      route_write_allowed_rows: rows.filter((row) => row.route_write_allowed).length,
      candidate_text_allowed_rows: rows.filter((row) => row.candidate_text_allowed).length,
      public_mutation_allowed_rows: rows.filter((row) => row.public_mutation_allowed).length,
      evidence_role: 'source_family_selection_batch_plan_navigation_only_no_selection_or_acceptance_claim',
      next_safe_action:
        'Use this batch only as a deterministic blocker group for future Agent 10 scoping; Agent 6 review still requires source citation, transform prerequisites, and an exact boundary packet.',
      dedupe_key: sha256(
        [
          group.batch_key,
          rows.map((row) => row.source_rid).join('|'),
          rows.map((row) => row.dedupe_key).join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const rowDelta = b.row_count - a.row_count;
    if (rowDelta !== 0) return rowDelta;
    const occurrenceDelta = b.occurrence_total - a.occurrence_total;
    if (occurrenceDelta !== 0) return occurrenceDelta;
    return a.batch_key.localeCompare(b.batch_key, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_batch_order: index + 1 }));

const sourceFamilySignatureRows = summarize(batchRows, 'source_family_signature', 'source_family_signature');
const triageSignatureRows = summarize(batchRows, 'triage_signature', 'triage_signature');
const impactBucketRows = summarize(batchRows, 'mechanical_impact_bucket', 'mechanical_impact_bucket');
const partitionSignatureRows = summarize(batchRows, 'partition_signature', 'partition_signature');

const counts = {
  input_workset_rows: Number(workset.counts?.workset_rows || 0),
  batch_rows: batchRows.length,
  multi_row_batches: batchRows.filter((row) => row.row_count > 1).length,
  single_row_batches: batchRows.filter((row) => row.row_count === 1).length,
  max_batch_rows: Math.max(...batchRows.map((row) => row.row_count)),
  max_batch_occurrences: Math.max(...batchRows.map((row) => row.occurrence_total)),
  source_rid_references: sum(batchRows, 'source_rid_references'),
  occurrence_total: sum(batchRows, 'occurrence_total'),
  unique_source_rids: new Set(batchRows.flatMap((row) => row.source_rids)).size,
  unique_source_rid_prefixes: new Set(batchRows.flatMap((row) => row.prefixes)).size,
  unique_queue_ids: new Set(batchRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(batchRows.flatMap((row) => row.token_ids)).size,
  unique_lexicon_entry_ids: new Set(batchRows.flatMap((row) => row.lexicon_entry_ids)).size,
  source_family_signature_rows: sourceFamilySignatureRows.length,
  triage_signature_rows: triageSignatureRows.length,
  impact_bucket_rows: impactBucketRows.length,
  partition_signature_rows: partitionSignatureRows.length,
  source_citation_required_rows: sum(batchRows, 'source_citation_required_rows'),
  source_citation_or_url_present_rows: sum(batchRows, 'source_citation_or_url_present_rows'),
  transform_rule_still_blocked_rows: sum(batchRows, 'transform_rule_still_blocked_rows'),
  agent6_boundary_after_prereq_rows: sum(batchRows, 'agent6_boundary_after_prereq_rows'),
  source_family_boundary_packet_exists_rows: sum(batchRows, 'source_family_boundary_packet_exists_rows'),
  source_family_selection_boundary_blocker_rows: sum(batchRows, 'source_family_selection_boundary_blocker_rows'),
  route_write_allowed_rows: sum(batchRows, 'route_write_allowed_rows'),
  candidate_text_allowed_rows: sum(batchRows, 'candidate_text_allowed_rows'),
  public_mutation_allowed_rows: sum(batchRows, 'public_mutation_allowed_rows'),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_source_family_selection_batch_plan',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_family_selection_batch_plan.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_family_selection_batch_plan_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    deterministic_batch_plan_only: true,
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
    unpacketized_source_family_selection_workset: options.workset,
  },
  counts,
  source_family_signature_rows: sourceFamilySignatureRows,
  triage_signature_rows: triageSignatureRows,
  impact_bucket_rows: impactBucketRows,
  partition_signature_rows: partitionSignatureRows,
  batch_rows: batchRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 10 package intake can use this batch plan to scope future exact Agent 6 boundary packets after prerequisites exist',
    stop_condition:
      'Source-family-selection batch plan emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-family-selection batch plan passed: batches=${counts.batch_rows} rows=${counts.input_workset_rows} occurrences=${counts.occurrence_total}`,
);

function groupByBatchKey(rows) {
  const groups = new Map();
  for (const row of rows) {
    const batchKey = [
      row.source_family_signature,
      row.triage_signature,
      row.mechanical_impact_bucket,
      row.partition_signature,
    ].join(' || ');
    const group =
      groups.get(batchKey) ||
      {
        batch_key: batchKey,
        source_family_signature: row.source_family_signature,
        triage_signature: row.triage_signature,
        mechanical_impact_bucket: row.mechanical_impact_bucket,
        partition_signature: row.partition_signature,
        rows: [],
      };
    group.rows.push(row);
    groups.set(batchKey, group);
  }
  return groups;
}

function summarize(rows, field, outField) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field] || 'missing';
    const group = groups.get(key) || { [outField]: key, rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({
      [outField]: group[outField],
      batch_count: group.rows.length,
      row_count: sum(group.rows, 'row_count'),
      source_rid_references: sum(group.rows, 'source_rid_references'),
      occurrence_total: sum(group.rows, 'occurrence_total'),
      unique_source_rids: new Set(group.rows.flatMap((row) => row.source_rids)).size,
      prefix_count: new Set(group.rows.flatMap((row) => row.prefixes)).size,
      queue_id_count: new Set(group.rows.flatMap((row) => row.queue_ids)).size,
      token_id_count: new Set(group.rows.flatMap((row) => row.token_ids)).size,
      exact_blockers: sorted(group.rows.map((row) => row.exact_blocker)),
      evidence_role: 'source_family_selection_batch_plan_group_summary_navigation_only_no_selection_or_acceptance_claim',
    }))
    .sort((a, b) => b.row_count - a.row_count || String(a[outField]).localeCompare(String(b[outField]), 'en'));
}

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.batch_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Family Selection Batch Plan',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; batch keys are grouping keys, not source-family selection, source acceptance, source-license acceptance, or Agent 6 acceptance.',
    '- Batches remain blocked until source citation, transform prerequisites, and exact boundary packets exist.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Input workset rows / batch rows / multi-row / single-row: ${c.input_workset_rows}/${c.batch_rows}/${c.multi_row_batches}/${c.single_row_batches}`,
    `- Source-RID refs / occurrences / unique source RIDs: ${c.source_rid_references}/${c.occurrence_total}/${c.unique_source_rids}`,
    `- Prefixes / queue IDs / token IDs / lexicon entries: ${c.unique_source_rid_prefixes}/${c.unique_queue_ids}/${c.unique_token_ids}/${c.unique_lexicon_entry_ids}`,
    `- Source-family / triage / impact / partition signature rows: ${c.source_family_signature_rows}/${c.triage_signature_rows}/${c.impact_bucket_rows}/${c.partition_signature_rows}`,
    `- Max batch rows / max batch occurrences: ${c.max_batch_rows}/${c.max_batch_occurrences}`,
    `- Source citation required / transform blocked / Agent 6 after prereq / boundary packet exists / source-family-selection blockers: ${c.source_citation_required_rows}/${c.transform_rule_still_blocked_rows}/${c.agent6_boundary_after_prereq_rows}/${c.source_family_boundary_packet_exists_rows}/${c.source_family_selection_boundary_blocker_rows}`,
    `- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.source_family_selection_claims}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Batch Samples',
    '',
    '| order | rows | occurrences | source_family_signature | triage_signature | impact | partition | exact_blocker |',
    '| ---: | ---: | ---: | --- | --- | --- | --- | --- |',
    ...sampleRows.map(
      (row) =>
        `${row.mechanical_batch_order} | ${row.row_count} | ${row.occurrence_total} | ${row.source_family_signature} | ${row.triage_signature} | ${row.mechanical_impact_bucket} | ${row.partition_signature} | ${row.exact_blocker}`,
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_family_selection_batch_plan.mjs [--workset=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--workset=')) parsed.workset = cleanRelativePath(valueAfterEquals(arg));
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
