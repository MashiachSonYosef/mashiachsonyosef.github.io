#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  worklist:
    'reports/agent3-old-dictionary-candidate-use-source-citation-enrichment-worklist-2026-06-06.json',
  output:
    'reports/agent3-old-dictionary-candidate-use-source-citation-prefix-matrix-2026-06-06.json',
  report:
    'reports/agent3-old-dictionary-candidate-use-source-citation-prefix-matrix-2026-06-06.md',
};

const options = parseArgs(process.argv.slice(2));
const worklist = readJson(options.worklist);
assertArtifact(
  worklist,
  'agent3_old_dictionary_candidate_use_source_citation_enrichment_worklist',
  options.worklist,
);

const groups = new Map();
const prefixGroups = new Map();

for (const item of worklist.work_items || []) {
  const prefixGroup =
    prefixGroups.get(item.source_rid_prefix) ||
    {
      source_rid_prefix: item.source_rid_prefix,
      source_rids: new Set(),
      source_families: new Set(),
      queue_ids: new Set(),
      token_ids: new Set(),
      reference_total: 0,
      occurrence_total: 0,
    };
  prefixGroup.source_rids.add(item.source_rid);
  for (const sourceFamily of item.source_families || []) prefixGroup.source_families.add(sourceFamily);
  for (const queueId of item.queue_ids || []) prefixGroup.queue_ids.add(queueId);
  for (const tokenId of item.token_ids || []) prefixGroup.token_ids.add(tokenId);
  prefixGroup.reference_total += Number(item.reference_count || 0);
  prefixGroup.occurrence_total += Number(item.occurrence_total || 0);
  prefixGroups.set(item.source_rid_prefix, prefixGroup);

  for (const sourceFamily of item.source_families || []) {
    const key = [item.source_rid_prefix, sourceFamily].join('\u001f');
    const group =
      groups.get(key) ||
      {
        source_rid_prefix: item.source_rid_prefix,
        source_family: sourceFamily,
        source_rids: new Set(),
        queue_ids: new Set(),
        token_ids: new Set(),
        lexicon_entry_ids: new Set(),
        surfaces: new Set(),
        normalized_forms: new Set(),
        partitions: new Set(),
        triage_groups: new Set(),
        mechanical_impact_buckets: new Set(),
        blocker_ids: new Set(),
        reference_total: 0,
        occurrence_total: 0,
        source_citation_required_rows: 0,
        transform_rule_still_blocked_rows: 0,
        agent6_boundary_after_prereq_rows: 0,
        source_rids_with_multi_family: 0,
        top_work_items: [],
      };

    group.source_rids.add(item.source_rid);
    for (const queueId of item.queue_ids || []) group.queue_ids.add(queueId);
    for (const tokenId of item.token_ids || []) group.token_ids.add(tokenId);
    for (const lexiconEntryId of item.lexicon_entry_ids || []) group.lexicon_entry_ids.add(lexiconEntryId);
    for (const surface of item.surfaces || []) group.surfaces.add(surface);
    for (const normalized of item.normalized_forms || []) group.normalized_forms.add(normalized);
    for (const partition of item.partitions || []) group.partitions.add(partition);
    for (const triageGroup of item.triage_groups || []) group.triage_groups.add(triageGroup);
    group.mechanical_impact_buckets.add(item.mechanical_impact_bucket);
    for (const blockerId of item.current_blocker_ids || []) group.blocker_ids.add(blockerId);
    group.reference_total += Number(item.reference_count || 0);
    group.occurrence_total += Number(item.occurrence_total || 0);
    if (item.source_citation_required) group.source_citation_required_rows += 1;
    if (item.transform_rule_still_blocked) group.transform_rule_still_blocked_rows += 1;
    if (item.agent6_boundary_after_prereq) group.agent6_boundary_after_prereq_rows += 1;
    if (Number(item.source_family_count || 0) > 1) group.source_rids_with_multi_family += 1;
    group.top_work_items.push({
      source_rid: item.source_rid,
      mechanical_resolution_order: item.mechanical_resolution_order,
      mechanical_impact_bucket: item.mechanical_impact_bucket,
      queue_id_count: item.queue_id_count,
      reference_count: item.reference_count,
      occurrence_total: item.occurrence_total,
    });
    groups.set(key, group);
  }
}

const prefixSummaryRows = [...prefixGroups.values()]
  .map((group) => ({
    source_rid_prefix: group.source_rid_prefix,
    source_rid_count: group.source_rids.size,
    source_family_count: group.source_families.size,
    source_families: sorted(group.source_families),
    queue_id_count: group.queue_ids.size,
    token_id_count: group.token_ids.size,
    reference_total: group.reference_total,
    occurrence_total: group.occurrence_total,
    evidence_role: 'source_citation_prefix_summary_navigation_only_no_source_or_acceptance_claim',
  }))
  .sort((a, b) => {
    const ridDelta = b.source_rid_count - a.source_rid_count;
    if (ridDelta !== 0) return ridDelta;
    return a.source_rid_prefix.localeCompare(b.source_rid_prefix, 'en');
  });

const prefixFamilyRows = [...groups.values()]
  .map((group) => {
    const sourceRids = sorted(group.source_rids);
    const blockerIds = sorted(group.blocker_ids);
    const topWorkItems = group.top_work_items
      .sort((a, b) => {
        const orderDelta = a.mechanical_resolution_order - b.mechanical_resolution_order;
        if (orderDelta !== 0) return orderDelta;
        return a.source_rid.localeCompare(b.source_rid, 'en');
      })
      .slice(0, 12);
    return {
      row_id: `agent3-source-citation-prefix-${group.source_rid_prefix}-${sha256(group.source_family).slice(0, 12)}`,
      source_rid_prefix: group.source_rid_prefix,
      source_family: group.source_family,
      source_rids: sourceRids,
      source_rid_count: sourceRids.length,
      queue_ids: sorted(group.queue_ids),
      queue_id_count: group.queue_ids.size,
      token_ids: sorted(group.token_ids),
      token_id_count: group.token_ids.size,
      lexicon_entry_ids: sorted(group.lexicon_entry_ids),
      lexicon_entry_id_count: group.lexicon_entry_ids.size,
      surfaces: sorted(group.surfaces),
      surface_count: group.surfaces.size,
      normalized_forms: sorted(group.normalized_forms),
      normalized_form_count: group.normalized_forms.size,
      partitions: sorted(group.partitions),
      partition_count: group.partitions.size,
      triage_groups: sorted(group.triage_groups),
      triage_group_count: group.triage_groups.size,
      mechanical_impact_buckets: sorted(group.mechanical_impact_buckets),
      mechanical_impact_bucket_count: group.mechanical_impact_buckets.size,
      reference_total: group.reference_total,
      occurrence_total: group.occurrence_total,
      current_blocker_ids: blockerIds,
      current_blocker_count: blockerIds.length,
      source_citation_required_rows: group.source_citation_required_rows,
      transform_rule_still_blocked_rows: group.transform_rule_still_blocked_rows,
      agent6_boundary_after_prereq_rows: group.agent6_boundary_after_prereq_rows,
      source_rids_with_multi_family: group.source_rids_with_multi_family,
      source_citation_or_url_present: false,
      candidate_text_allowed: false,
      route_write_allowed: false,
      public_mutation_allowed: false,
      top_work_items: topWorkItems,
      evidence_role: 'source_citation_prefix_family_navigation_only_no_source_or_acceptance_claim',
      next_safe_action:
        'Use this prefix/source-family row to locate row-level source_citation_or_url enrichment needs, or preserve the exact missing-source blocker.',
      dedupe_key: sha256(
        [group.source_rid_prefix, group.source_family, sourceRids.join('|'), blockerIds.join('|')].join('|'),
      ),
    };
  })
  .sort((a, b) => {
    const ridDelta = b.source_rid_count - a.source_rid_count;
    if (ridDelta !== 0) return ridDelta;
    const refDelta = b.reference_total - a.reference_total;
    if (refDelta !== 0) return refDelta;
    return `${a.source_rid_prefix}|${a.source_family}`.localeCompare(`${b.source_rid_prefix}|${b.source_family}`, 'en');
  })
  .map((row, index) => ({ ...row, mechanical_prefix_order: index + 1 }));

const counts = {
  prefix_family_rows: prefixFamilyRows.length,
  prefix_summary_rows: prefixSummaryRows.length,
  worklist_rows: Number(worklist.counts?.worklist_rows || 0),
  source_rid_family_memberships: prefixFamilyRows.reduce((total, row) => total + row.source_rid_count, 0),
  source_rid_reference_memberships: prefixFamilyRows.reduce((total, row) => total + row.reference_total, 0),
  occurrence_memberships: prefixFamilyRows.reduce((total, row) => total + row.occurrence_total, 0),
  unique_source_rids: new Set(prefixFamilyRows.flatMap((row) => row.source_rids)).size,
  unique_queue_ids: new Set(prefixFamilyRows.flatMap((row) => row.queue_ids)).size,
  unique_token_ids: new Set(prefixFamilyRows.flatMap((row) => row.token_ids)).size,
  unique_prefixes: new Set(prefixFamilyRows.map((row) => row.source_rid_prefix)).size,
  unique_source_families: new Set(prefixFamilyRows.map((row) => row.source_family)).size,
  multi_family_prefixes: prefixSummaryRows.filter((row) => row.source_family_count > 1).length,
  source_rids_with_multi_family_memberships: prefixFamilyRows.reduce(
    (total, row) => total + row.source_rids_with_multi_family,
    0,
  ),
  source_citation_required_memberships: prefixFamilyRows.reduce(
    (total, row) => total + row.source_citation_required_rows,
    0,
  ),
  transform_rule_still_blocked_memberships: prefixFamilyRows.reduce(
    (total, row) => total + row.transform_rule_still_blocked_rows,
    0,
  ),
  agent6_boundary_after_prereq_memberships: prefixFamilyRows.reduce(
    (total, row) => total + row.agent6_boundary_after_prereq_rows,
    0,
  ),
  max_source_rids_per_prefix_family: Math.max(0, ...prefixFamilyRows.map((row) => row.source_rid_count)),
  max_queue_ids_per_prefix_family: Math.max(0, ...prefixFamilyRows.map((row) => row.queue_id_count)),
  max_references_per_prefix_family: Math.max(0, ...prefixFamilyRows.map((row) => row.reference_total)),
  max_occurrences_per_prefix_family: Math.max(0, ...prefixFamilyRows.map((row) => row.occurrence_total)),
  source_family_prefix_counts: countField(prefixFamilyRows, 'source_family'),
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
  artifact_type: 'agent3_old_dictionary_candidate_use_source_citation_prefix_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_old_dictionary_candidate_use_source_citation_prefix_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  target: 'old_dictionary_candidate_use_source_citation_prefix_navigation',
  authority_boundary: {
    linkage_navigation_only: true,
    source_citation_prefix_matrix_only: true,
    source_rids_are_identifiers_not_source_text: true,
    prefix_order_is_not_route_ranking: true,
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
    dimensions: ['source_rid_prefix', 'source_family'],
    source: options.worklist,
    note: 'Prefix rows are namespace-navigation evidence only. Source family membership is observed from existing worklist rows and is not source/provenance/license acceptance.',
  },
  inputs: {
    source_citation_enrichment_worklist: options.worklist,
  },
  counts,
  prefix_summary_rows: prefixSummaryRows,
  prefix_family_rows: prefixFamilyRows,
  downstream_handoff: {
    handoff_owner:
      'Agent 1/Agent 2 source-citation enrichment; Agent 10 release/package intake; Agent 6 only after exact boundary packet',
    stop_condition:
      'Source-citation prefix matrix emitted; no source text read, source citation supplied, transform text generated, route write, public mutation, or acceptance action taken.',
  },
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(
  `Agent 3 source-citation prefix matrix rows=${counts.prefix_family_rows} prefixes=${counts.unique_prefixes} memberships=${counts.source_rid_family_memberships}`,
);

function writeReport(relativePath, artifact) {
  const c = artifact.counts;
  const sampleRows = artifact.prefix_family_rows.slice(0, 12);
  const lines = [
    '# Agent 3 Old-Dictionary Candidate-Use Source-Citation Prefix Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Evidence/navigation only; prefixes and source-family labels are observed identifiers, not source text or citation acceptance.',
    '- Prefix order is for enrichment planning only; it is not route ranking, answer selection, or Definition authority.',
    '- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.',
    '',
    '## Counts',
    '',
    `- Prefix-family rows / prefix summary rows: ${c.prefix_family_rows}/${c.prefix_summary_rows}`,
    `- Source-RID family memberships / unique source RIDs / prefixes: ${c.source_rid_family_memberships}/${c.unique_source_rids}/${c.unique_prefixes}`,
    `- Source-RID reference memberships / occurrence memberships: ${c.source_rid_reference_memberships}/${c.occurrence_memberships}`,
    `- Unique queue IDs / token IDs / source families: ${c.unique_queue_ids}/${c.unique_token_ids}/${c.unique_source_families}`,
    `- Multi-family prefixes / multi-family source-RID memberships: ${c.multi_family_prefixes}/${c.source_rids_with_multi_family_memberships}`,
    `- Source citation required / transform blocked / Agent 6 after prereq memberships: ${c.source_citation_required_memberships}/${c.transform_rule_still_blocked_memberships}/${c.agent6_boundary_after_prereq_memberships}`,
    `- Candidate text / answer eligible / route writes / source text / public mutation / release actions: ${c.candidate_text_rows}/${c.answer_eligible_rows}/${c.route_shard_writes}/${c.source_text_rows}/${c.public_runtime_mutation}/${c.release_actions}`,
    '',
    '## Source Family Prefix Counts',
    '',
    ...Object.entries(c.source_family_prefix_counts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Sample Prefix-Family Rows',
    '',
    '| order | prefix | source_family | source_rids | refs | occurrences | queues | blockers |',
    '| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |',
    ...sampleRows.map((row) =>
      [
        row.mechanical_prefix_order,
        row.source_rid_prefix,
        row.source_family,
        row.source_rid_count,
        row.reference_total,
        row.occurrence_total,
        row.queue_id_count,
        row.current_blocker_count,
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
        'Usage: node scripts/build_agent3_old_dictionary_candidate_use_source_citation_prefix_matrix.mjs [--worklist=PATH] [--output=PATH] [--report=PATH]',
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
