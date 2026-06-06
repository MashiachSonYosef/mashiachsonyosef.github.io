#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  worklist:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-source-citation-batch-matrix-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-citation-batch-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const worklist = readJson(options.worklist);
assertArtifact(
  worklist,
  'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist',
  options.worklist,
);

const groups = new Map();
for (const item of worklist.work_items || []) {
  for (const sourceFamily of item.source_families || []) {
    for (const partition of item.partitions || []) {
      for (const triageGroup of item.triage_groups || []) {
        const key = [sourceFamily, partition, triageGroup, item.mechanical_impact_bucket].join('\u001f');
        const group =
          groups.get(key) ||
          {
            source_family: sourceFamily,
            partition,
            triage_group: triageGroup,
            mechanical_impact_bucket: item.mechanical_impact_bucket,
            source_rids: new Set(),
            source_rid_prefixes: new Set(),
            queue_ids: new Set(),
            token_ids: new Set(),
            lexicon_entry_ids: new Set(),
            surfaces: new Set(),
            normalized_forms: new Set(),
            blocker_ids: new Set(),
            reference_total: 0,
            occurrence_total: 0,
            source_citation_required_rows: 0,
            transform_rule_still_blocked_rows: 0,
            agent6_boundary_after_prereq_rows: 0,
            mechanical_score_total: 0,
            top_work_items: [],
          };

        group.source_rids.add(item.source_rid);
        group.source_rid_prefixes.add(item.source_rid_prefix);
        for (const queueId of item.queue_ids || []) group.queue_ids.add(queueId);
        for (const tokenId of item.token_ids || []) group.token_ids.add(tokenId);
        for (const lexiconEntryId of item.lexicon_entry_ids || []) group.lexicon_entry_ids.add(lexiconEntryId);
        for (const surface of item.surfaces || []) group.surfaces.add(surface);
        for (const normalized of item.normalized_forms || []) group.normalized_forms.add(normalized);
        for (const blockerId of item.current_blocker_ids || []) group.blocker_ids.add(blockerId);
        group.reference_total += Number(item.reference_count || 0);
        group.occurrence_total += Number(item.occurrence_total || 0);
        if (item.source_citation_required) group.source_citation_required_rows += 1;
        if (item.transform_rule_still_blocked) group.transform_rule_still_blocked_rows += 1;
        if (item.agent6_boundary_after_prereq) group.agent6_boundary_after_prereq_rows += 1;
        group.mechanical_score_total += Number(item.mechanical_resolution_order_score || 0);
        group.top_work_items.push({
          source_rid: item.source_rid,
          mechanical_resolution_order: item.mechanical_resolution_order,
          score: item.mechanical_resolution_order_score,
          queue_id_count: item.queue_id_count,
          reference_count: item.reference_count,
          occurrence_total: item.occurrence_total,
        });
        groups.set(key, group);
      }
    }
  }
}

const batchRows = [...groups.values()]
  .map((group) => {
    const sourceRids = sorted(group.source_rids);
    const queueIds = sorted(group.queue_ids);
    const blockerIds = sorted(group.blocker_ids);
    const topWorkItems = group.top_work_items
      .sort((a, b) => {
        const scoreDelta = b.score - a.score;
        if (scoreDelta !== 0) return scoreDelta;
        return a.source_rid.localeCompare(b.source_rid, 'en');
      })
      .slice(0, 12);
    return {
      batch_id: `agent3-source-citation-batch-${sha256(
        [group.source_family, group.partition, group.triage_group, group.mechanical_impact_bucket].join('|'),
      ).slice(0, 16)}`,
      batch_key: [
        group.source_family,
        group.partition,
        group.triage_group,
        group.mechanical_impact_bucket,
      ].join('|'),
      source_family: group.source_family,
      partition: group.partition,
      triage_group: group.triage_group,
      mechanical_impact_bucket: group.mechanical_impact_bucket,
      source_rids: sourceRids,
      source_rid_count: sourceRids.length,
      source_rid_prefixes: sorted(group.source_rid_prefixes),
      source_rid_prefix_count: group.source_rid_prefixes.size,
      queue_ids: queueIds,
      queue_id_count: queueIds.length,
      token_ids: sorted(group.token_ids),
      token_id_count: group.token_ids.size,
      lexicon_entry_ids: sorted(group.lexicon_entry_ids),
      lexicon_entry_id_count: group.lexicon_entry_ids.size,
      surfaces: sorted(group.surfaces),
      surface_count: group.surfaces.size,
      normalized_forms: sorted(group.normalized_forms),
      normalized_form_count: group.normalized_forms.size,
      reference_total: group.reference_total,
      occurrence_total: group.occurrence_total,
      current_blocker_ids: blockerIds,
      current_blocker_count: blockerIds.length,
      source_citation_required_rows: group.source_citation_required_rows,
      transform_rule_still_blocked_rows: group.transform_rule_still_blocked_rows,
      agent6_boundary_after_prereq_rows: group.agent6_boundary_after_prereq_rows,
      mechanical_score_total: group.mechanical_score_total,
      top_work_items: topWorkItems,
      source_citation_or_url_present: false,
      candidate_text_allowed: false,
      route_write_allowed: false,
      public_mutation_allowed: false,
      evidence_role: 'source_citation_batch_navigation_only_no_source_or_acceptance_claim',
      next_safe_action:
        'Use this batch to prioritize row-level source_citation_or_url enrichment, or preserve the exact missing-source blocker.',
      dedupe_key: sha256(
        [
          group.source_family,
          group.partition,
          group.triage_group,
          group.mechanical_impact_bucket,
          sourceRids.join('|'),
          blockerIds.join('|'),
        ].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const scoreDelta = b.mechanical_score_total - a.mechanical_score_total;
    if (scoreDelta !== 0) return scoreDelta;
    const ridDelta = b.source_rid_count - a.source_rid_count;
    if (ridDelta !== 0) return ridDelta;
    return a.batch_key.localeCompare(b.batch_key, 'en');
  })
  .map((row, index) => ({
    ...row,
    mechanical_batch_order: index + 1,
  }));

const counts = {
  batch_rows: batchRows.length,
  worklist_rows: Number(worklist.counts?.worklist_rows || 0),
  source_rid_batch_memberships: batchRows.reduce((total, row) => total + row.source_rid_count, 0),
  source_rid_references: batchRows.reduce((total, row) => total + row.reference_total, 0),
  occurrence_memberships: batchRows.reduce((total, row) => total + row.occurrence_total, 0),
  unique_source_rids: new Set(batchRows.flatMap((row) => row.source_rids)).size,
  unique_queue_ids: new Set(batchRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(batchRows.flatMap((row) => row.token_ids)).size,
  source_family_count: new Set(batchRows.map((row) => row.source_family)).size,
  partition_count: new Set(batchRows.map((row) => row.partition)).size,
  triage_group_count: new Set(batchRows.map((row) => row.triage_group)).size,
  mechanical_impact_bucket_count: new Set(batchRows.map((row) => row.mechanical_impact_bucket)).size,
  source_citation_required_memberships: batchRows.reduce(
    (total, row) => total + row.source_citation_required_rows,
    0,
  ),
  transform_rule_still_blocked_memberships: batchRows.reduce(
    (total, row) => total + row.transform_rule_still_blocked_rows,
    0,
  ),
  agent6_boundary_after_prereq_memberships: batchRows.reduce(
    (total, row) => total + row.agent6_boundary_after_prereq_rows,
    0,
  ),
  max_source_rids_per_batch: Math.max(0, ...batchRows.map((row) => row.source_rid_count)),
  max_queue_ids_per_batch: Math.max(0, ...batchRows.map((row) => row.queue_id_count)),
  max_references_per_batch: Math.max(0, ...batchRows.map((row) => row.reference_total)),
  max_occurrences_per_batch: Math.max(0, ...batchRows.map((row) => row.occurrence_total)),
  source_family_batch_counts: countField(batchRows, 'source_family'),
  partition_batch_counts: countField(batchRows, 'partition'),
  triage_group_batch_counts: countField(batchRows, 'triage_group'),
  mechanical_impact_bucket_batch_counts: countField(batchRows, 'mechanical_impact_bucket'),
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
  source_acceptance_claims: 0,
  source_citation_supplied_by_agent3_rows: 0,
  route_payload_field_hits: 0,
  forbidden_payload_field_hits: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_old_dictionary_candidate_use_source_citation_batch_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_citation_batch_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_citation_batch_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    source_citation_batch_matrix_only: true,
    source_rids_are_identifiers_not_source_text: true,
    mechanical_batch_order_is_not_route_ranking: true,
    no_new_acceptance_or_release_claim: true,
    qa_acceptance: false,
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
  grouping_rule: {
    dimensions: ['source_family', 'partition', 'triage_group', 'mechanical_impact_bucket'],
    source: options.worklist,
    note: 'Rows are batch memberships over existing source-RID identifiers only; memberships can intentionally duplicate source RIDs across source-family or triage buckets.',
  },
  inputs: {
    source_citation_enrichment_worklist: options.worklist,
  },
  counts,
  batch_rows: batchRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 1/Agent 2 source-citation enrichment; Agent 10 release/package intake; Agent 6 only after exact boundary packet',
    stop_condition:
      'Source-citation batch matrix emitted; no source text read, source citation supplied, transform text generated, route write, public mutation, or acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-citation batch matrix rows=${counts.batch_rows} memberships=${counts.source_rid_batch_memberships} unique=${counts.unique_source_rids}`,
);

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.batch_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Citation Batch Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; batches group source-RID identifiers and blockers, not source text or citation acceptance.',
    '- Mechanical batch order is for enrichment planning only; it is not route ranking, answer selection, or Definition authority.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Batch rows / source-RID memberships / unique source RIDs: ${c.batch_rows}/${c.source_rid_batch_memberships}/${c.unique_source_rids}`,
    `- Source-RID references / occurrence memberships: ${c.source_rid_references}/${c.occurrence_memberships}`,
    `- Source families / partitions / triage groups / impact buckets: ${c.source_family_count}/${c.partition_count}/${c.triage_group_count}/${c.mechanical_impact_bucket_count}`,
    `- Source citation required / transform blocked / Agent 6 after prereq memberships: ${c.source_citation_required_memberships}/${c.transform_rule_still_blocked_memberships}/${c.agent6_boundary_after_prereq_memberships}`,
    `- Max source RIDs / queue IDs / references / occurrences per batch: ${c.max_source_rids_per_batch}/${c.max_queue_ids_per_batch}/${c.max_references_per_batch}/${c.max_occurrences_per_batch}`,
    `- Candidate text / answer eligible / route writes / source text / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Source Family Batch Counts',
    '',
    ...Object.entries(c.source_family_batch_counts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Sample Batches',
    '',
    '| order | source_family | partition | triage_group | bucket | source_rids | refs | occurrences |',
    '| ---: | --- | --- | --- | --- | ---: | ---: | ---: |',
    ...sampleRows.map((row) =>
      [
        row.mechanical_batch_order,
        row.source_family,
        row.partition,
        row.triage_group,
        row.mechanical_impact_bucket,
        row.source_rid_count,
        row.reference_total,
        row.occurrence_total,
      ].join(' | '),
    ),
    '',
    '## Handoff',
    '',
    `- Handoff owner: ${artifact.downstream_handoff.handoff_owner}`,
    `- Stop condition: ${artifact.downstream_handoff.stop_condition}`,
  ];
  fs.writeFileSync(path.resolve(root, relativePath), `${lines.join('\n')}\n`);
}

function countField(rows, field) {
  const counts = {};
  for (const row of rows) counts[row[field]] = (counts[row[field]] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function sorted(values) {
  return [...new Set(values || [])].sort((a, b) => String(a).localeCompare(String(b), 'en'));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(path.resolve(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function assertArtifact(artifact, expectedType, artifactPath) {
  if (artifact.artifact_type !== expectedType) {
    throw new Error(`${artifactPath} expected ${expectedType}, got ${artifact.artifact_type || 'missing'}`);
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (const arg of argv) {
    if (arg === '--help') {
      console.log(
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_citation_batch_matrix.mjs [--worklist=PATH] [--output=PATH] [--report=PATH]',
      );
      process.exit(0);
    }
    if (arg.startsWith('--worklist=')) parsed.worklist = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
}

function cleanRelativePath(input) {
  const normalized = input.replaceAll('\\', '/');
  if (path.isAbsolute(normalized) || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Expected workspace-relative path, got ${input}`);
  }
  return normalized;
}
